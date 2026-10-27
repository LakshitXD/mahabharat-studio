# TTS research for the Mahabharat series: VoxCPM2 speed, Sanskrit pronunciation, fallbacks

Date: 2026-10-28. Read-only research; no GPU jobs were run.
Labels: **[cited: URL]** means the number comes from that source. **[est]** means it is my own estimate.
**[local]** means I read it from code on this machine.

Target: 15 min of audio in about 8 min wall, including QA. That is RTF ≤ 0.5 end to end.
Observed: 455 s of audio in about 44 min, which is RTF ≈ 5.8 on the final audio. 103 takes were made to get 90 beats.
Counting every take, about 515 s of audio was synthesized **[est, assumes the average take is about 5 s]**. That is roughly 25 s of wall time per take.

---

## 1. VoxCPM2 speed

### 1.1 Official figures

| Path | Hardware | RTF | Source |
|---|---|---|---|
| `VoxCPM.generate` (PyTorch, torch.compile on, 10 timesteps) | RTX 4090 | ~0.30 | [cited: https://voxcpm.readthedocs.io/en/latest/faq.html], [cited: https://github.com/OpenBMB/VoxCPM] |
| Nano-vLLM-VoxCPM | RTX 4090 | ~0.13 | same sources; tech report [cited: https://arxiv.org/html/2606.06928] |
| Nano-vLLM, short prompt, concurrency 1 / 8 / 16 / 32 / 64 | RTX 4090 | 0.086 / 0.115 / 0.158 / 0.252 / 0.538 per request | [cited: https://github.com/a710128/nanovllm-voxcpm] |
| Nano-vLLM, long prompt, concurrency 1 / 8 / 16 | RTX 4090 | 0.102 / 0.137 / 0.180 per request | same |
| llama.cpp-omni Q8_0 | Apple M4 Pro | ~1.76 | [cited: https://github.com/OpenBMB/VoxCPM] |

- VRAM is about 8 GB **[cited: FAQ]**.
- The nano-vllm RTF figures exclude time to first audio. TTFB is about 0.036 s at concurrency 1 **[cited: nanovllm-voxcpm README]**.
- Every official RTF uses `inference_timesteps=10` with torch.compile on **[cited: FAQ]**.

**Expected on an RTX 4070 SUPER [est].** A 4070 SUPER has about half a 4090's memory bandwidth (504 vs 1008 GB/s) and about half its tensor throughput. Autoregressive decoding is bandwidth-bound, so expect these figures:

- Stock `generate`: RTF ≈ 0.5–0.7.
- Nano-vLLM at concurrency 1: RTF ≈ 0.2–0.3.
- Nano-vLLM at concurrency 8: aggregate throughput ≈ 15–30× real time, for 15 min of audio in about 1 min.

Synthesis alone should never reach RTF 5. The overhead is in the pipeline around it.

### 1.2 Why the current pipeline runs at RTF ≈ 5 (local code review)

These come from `~/projects/hindi folklore/studio/tools/narrate.py`, `narration_rules.py` and the installed `voxcpm 2.0.3` **[local]**.

1. **Whisper large-v3-turbo runs on the CPU, on every take.**
   - The line is `pipeline(..., device="cpu")`.
   - An 800M-parameter encoder-decoder on CPU probably takes several seconds per 5 s clip **[est: 3–10 s per take]**.
   - This is likely the largest single cost.
2. **`librosa.pyin` runs on every take** (`narration_rules.measure`).
   - pYIN is a slow, pure-Python/numba HMM tracker, often close to real time on CPU **[est: 1–5 s per 5 s take]**.
   - `baseline(voice)` may also run pyin on the reference clip. Check whether it is cached.
3. **`torch.cuda.empty_cache()` runs after every take.**
   - torch.compile `mode="reduce-overhead"` uses CUDA graphs [cited: FAQ, and `voxcpm/model/voxcpm2.py:284-292` **[local]**].
   - Emptying the allocator cache between calls forces fresh allocations, and can force CUDA-graph re-recording or private-pool churn **[est]**.
   - The variable-length prompt/reference audio fed to the compiled `feat_encoder` can also trigger recompiles or dynamic-shape fallbacks **[est]**. Run once with `TORCH_LOGS=recompiles` to confirm.
4. **Hidden internal retries.**
   - `VoxCPM.generate` defaults to `retry_badcase=True, retry_badcase_max_times=3` **[local: core.py:192-194]**.
   - One "take" can therefore be up to 3 silent generations.
5. **Two audio conditions are encoded per call.**
   - Each call passes `reference_wav_path` (the voice) plus `prompt_wav_path`/`prompt_text` (the previous beat as continuation context).
   - Both go through the AudioVAE encoder and prefill on every call. A long previous beat makes the prefill longer.
   - Nano-vLLM measures a long prompt as about 18% slower than a short one (0.102 vs 0.086) **[cited]**.
6. **Strictly serial work, one beat at a time.**
   - With batch size 1 the GPU sits idle while the CPU does ASR and pitch, and vice versa.
7. **Model load plus compile warm-up on every run** **[est: 1–3 min per invocation]**.

**Action before anything else:** add `time.perf_counter()` around `generate`, `rules.measure`, `asr(...)` and model load, then run 10 beats. I expect most of the 25 s per take to be CPU QA, not VoxCPM **[est]**.

### 1.3 Acceleration paths, ranked

| # | Change | Expected gain | Notes |
|---|---|---|---|
| A | Move ASR to the GPU, or use a smaller or faster ASR: faster-whisper/CTranslate2 int8_float16, or IndicConformer-600M (CTC) | QA ASR goes from seconds to about 0.1–0.3 s per take **[est]** | VoxCPM2 needs ~8 GB **[cited]**. Whisper-turbo int8 needs ~1–1.5 GB **[est]**. IndicConformer is MIT-licensed and Indic-native [cited: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual]. |
| B | Replace `librosa.pyin` with `librosa.yin`, Praat/parselmouth, or torchcrepe on GPU | 10–50× faster pitch **[est]** | Recalibrate the `LIMITS` thresholds, because different trackers produce different medians. |
| C | Remove the per-take `empty_cache()`; load the model once per episode, not per story run | Removes recompile/re-record churn **[est]** | Keep the process warm across beats. |
| D | Pass `retry_badcase=False` and let your own QA loop handle length errors | Up to 3× on bad takes | Your rules already check duration. |
| E | **Nano-vLLM-VoxCPM with all beats submitted concurrently** (pip `nano-vllm-voxcpm`) | Per-stream RTF 0.086→0.115 at 8× concurrency on a 4090 **[cited]**. Episode synthesis ≈ 1–2 min on a 4070S **[est]**. | Needs flash-attn, Linux, CUDA, Triton, safetensors weights. Conditioning uses `ref_audio_latents` (reference voice) and `prompt_latents` + `prompt_text` (continuation), with reusable `prompt_id` via `add_prompt` [cited: nanovllm-voxcpm README]. This matches your current reference-plus-previous-beat scheme. **Verify** that cfg_value and timesteps are exposed in `models/voxcpm2/server.py`. Set `gpu_memory_utilization` to about 0.6–0.7 on a 12 GB desktop card. The prefill diffusion CUDA graph takes ~2.5 GB outside the KV budget **[cited]**. |
| F | Restructure to batch first, QA second: generate every beat concurrently, QA all of them (GPU ASR batched), then batch-regenerate only the failures | Turns 103 serial takes into 2–3 batched rounds | Continuation context breaks this: beat N conditions on beat N−1's approved take. Options: (a) condition only on the voice reference plus a fixed "style anchor" clip per voice, not the previous beat; (b) pipeline per scene. Test (a) by ear, because it may lose the prosodic continuity. |
| G | `inference_timesteps` 10 → 6 | Diffusion share drops ~40%; total maybe 15–25% faster **[est]** | Docs recommend a range of 4–30 [cited: https://voxcpm.readthedocs.io/en/latest/usage_guide.html]. A/B by ear on the baritone. |
| H | `generate_streaming` | No throughput gain, only latency | Useful only for overlapping QA with generation. Streaming disables `retry_badcase` [local]. |
| I | fp16 instead of bf16 | ~0 on Ada (both run at full tensor-core rate) **[est]** | Not worth the risk. |
| J | TensorRT / ONNX | No official path; community VoxCPM-ONNX targets CPU [cited: GitHub README] | Not recommended. |
| K | vLLM-Omni (official, OpenAI-compatible `/v1/audio/speech`, continuous batching) | Similar to Nano-vLLM; no published RTF [cited: GitHub README] | Heavier install; a fallback if nano-vllm has trouble. |

**Budget with A+B+C+D+E+F [est]:** synthesis of 15 min at an aggregate RTF of about 0.08 takes about 1.2 min. QA ASR on GPU over 15 min of audio takes about 0.5 min. Retakes on about 15% of beats take about 0.3 min. Total is about 2–3 min, well under the 8 min budget.

Even A+B+C+D alone, still serial with stock `generate` at RTF ~0.6, gives about 9–11 min for 15 min of audio **[est]**. That is borderline, so plan for E.

---

## 2. Pronunciation of tatsam/Sanskrit words

### 2.1 What VoxCPM2 accepts

- **Phoneme input exists only for Chinese pinyin (`{ni3}`) and English CMUdict (`{HH AH0 L OW1}`)**, and only with `normalize=False` [cited: https://voxcpm.readthedocs.io/en/latest/usage_guide.html].
- There is no IPA and no Hindi phoneme syntax.
- The tech report describes no pronunciation-control mechanism beyond natural-language style prompts [cited: https://arxiv.org/html/2606.06928].
- **The only lever for Hindi is respelling in Devanagari**, plus punctuation and hyphenation.
- Hindi is weaker than the best models on public tests: MiniMax-MLS WER 19.7% vs ElevenLabs 5.8%, using Whisper-large-v3 as the ASR. The internal CER is 0.79% with Gemini as the ASR. The paper attributes part of the gap to Whisper's own Hindi weakness and part to limited Hindi data [cited: arXiv 2606.06928].
- I found no public GitHub issue about VoxCPM2 Hindi mispronunciation.

### 2.2 Expected failure modes on tatsam text [est, from how Hindi TTS generally fails]

- **ऋ (ृ):** said as "ri" or "ru", or dropped. Example: धृष्टद्युम्न, कृष्ण, धृतराष्ट्र.
- **Three-consonant conjuncts:** ष्ट्र, द्युम्न, क्ष्ण get simplified or gain an inserted vowel.
- **Schwa deletion errors:** a wrong inherent "a" kept or dropped. Examples: युधिष्ठिर, अर्जुन, भीष्म.
- **ष, ञ, ङ:** rare in modern data.
- **Visarga ः:** may be skipped or read oddly. Example: पुनः.
- **क्ष / ज्ञ:** ज्ञ should be "gya" in Hindi convention.
- **Rare words read like Urdu or English loans, or skipped outright:** for example अक्षौहिणी, गाण्डीव.
- **Long compounds:** the word gets truncated or its stress drifts.

### 2.3 Best practice: a pronunciation lexicon applied before TTS

1. **Lexicon file** `pronounce.json` maps each written word to a spoken respelling, for example `{ "धृष्टद्युम्न": "धृष्ट-द्युम्न" }`.
   - Apply it only to the TTS input. Captions and on-screen text keep the original spelling.
   - Run QA comparisons against the **spoken** string, or against both strings.
2. **Respelling tricks to try, A/B tested per word by ear:**
   - Split hard compounds with a hyphen or a short space: `धृष्ट-द्युम्न`, `अक्षौ-हिणी`, `धृत-राष्ट्र`.
   - Write ऋ out as `रि` when the model mangles it, for example `ध्रिष्ट`. Most Hindi speakers say ऋ as "ri", so this matches the target accent.
   - Write ष as `श` where the model stumbles. Hindi speech merges them.
   - Write ज्ञ as `ग्य` if needed.
   - Write anusvara as an explicit nasal before stops, `गाण्डीव` → `गान्डीव`. The ण्ड vs ं choice matters.
   - Write visarga as `ह`, for example `पुनः` → `पुनह`.
   - Add an explicit halant (्) to force a half-form where the model inserts a schwa.
   - Insert ZWNJ (U+200C) to break an unwanted ligature.
   - **Do not add nukta** (क़ ख़ ग़ ज़ फ़) to Sanskrit words. Nukta pushes the reading toward Urdu.
   - For a word still mispronounced, put it in a short carrier phrase. Many TTS models read a word better mid-sentence than at a beat boundary **[est]**.
3. **Auto-flag candidate words** with a regex for: ृ, ष, ञ, ङ, ः, ज्ञ, क्ष, or any cluster of three or more consonants joined by halant. Collect each unique flagged word across the episode script.
4. **Word audition batch.** For each flagged word, generate 2–3 respelling variants in a fixed carrier sentence using the baritone voice. Run an ASR round-trip on each. The owner approves one variant by ear once, and the result is locked into the lexicon. The Mahabharat vocabulary repeats heavily, so this cost is paid once per name across the whole series.

### 2.4 Auto-detecting mispronunciation

- **Current check:** `difflib` ratio between the text and the Whisper transcript, with spaces removed **[local]**.
- **Weaknesses:**
  - Whisper large-v3 is weak on Hindi proper nouns. It often outputs Urdu-style or spelling-variant words, which produces false alarms. The VoxCPM2 paper itself notes Whisper's Hindi limitation [cited].
  - A whole-beat ratio hides a single wrong name in a long beat.
- **Better checks, in order:**
  1. **Normalize both strings before comparing:**
     - strip nukta;
     - map chandrabindu to anusvara;
     - map a nasal consonant plus halant to anusvara;
     - map ष→श and ण→न;
     - treat respellings as equal to their source word.
     This leaves a CER of real errors.
  2. **Run ASR on the GPU with IndicConformer-600M-multilingual** (MIT [cited: HF card]). It is Indic-native, CTC-based and fast, and it outputs native Devanagari. You can run Whisper as a second opinion only when the two disagree.
  3. **Score per word, not per beat.**
     - Align the intended words to the ASR words. Flag a beat if any *lexicon or flagged* word has a word-level CER above about 0.34 **[est threshold, calibrate on 50 owner-judged takes]**.
     - Alternatively, use **CTC forced alignment** of the intended text (IndicConformer's CTC head, or torchaudio MMS_FA with romanization) and flag words with low alignment posterior. This works better for rare names that free ASR cannot spell.
  4. Keep the existing pitch and loudness rules, but compute them on the GPU or with a fast tracker (see 1.3 B).

---

## 3. Fallbacks, if VoxCPM2 cannot hit the target

The owner wants to keep the VoxCPM2 voices, so treat these as backup only.
A 15-min Hindi episode is about 2,000 words, roughly 11–13k characters **[est]**. Costs below use 12k characters.

### 3.1 Local models

| Model | Licence | Hindi | Cloning | Speed | Verdict |
|---|---|---|---|---|---|
| IndicF5 (AI4Bharat) | HF card: MIT [cited: https://huggingface.co/ai4bharat/IndicF5]. A derivative says training data licences make it non-commercial [cited: https://huggingface.co/dheeyantra/dhee-indic-f5]. **Unclear.** | Native; 1,417 h of Indic data [cited]. Users report skipped words on long paragraphs [cited: HF discussion]. | Yes, zero-shot | F5 flow matching; no published RTF; probably RTF ~0.1–0.2 on a 4070S **[est]** | The best Indic cloning option, but check the licence with AI4Bharat first |
| Indic Parler-TTS | Apache-2.0 [cited: https://huggingface.co/ai4bharat/indic-parler-tts] | Native; Hindi NSS 84.8% [cited] | **No.** Preset speakers only (Rohit, Divya, …) | No figures; supports compile and batching [cited] | Loses the designed voices. The card now recommends "Indic-Speak", whose details I could not find. |
| Veena (Maya Research) | Apache-2.0 [cited: https://huggingface.co/maya-research/Veena] | Hindi and English | No (4 preset voices) | ~200 ms latency on a 4090 [cited] | Loses the voices |
| Kokoro-82M | Apache-2.0 [cited: aggregators] | A few Hindi presets; third-party quality grade "C" [cited: tts.ai] | No | Very fast | Too weak for tatsam narration |
| Fun-CosyVoice3 0.5B | Apache-2.0 | **No Hindi.** 9 languages: zh, en, ja, ko, de, es, fr, it, ru [cited: HF mirrors of the card] | Yes | n/a | Ruled out |
| Fish-Speech / OpenAudio S1-mini / Fish Audio S2 | S2: Fish Audio Research License, commercial use needs a paid licence [cited: https://fish.audio/s2/]. Older weights: CC-BY-NC-SA [cited] | Hindi in the lower tier | Yes | n/a | Ruled out without a paid licence |
| IndexTTS2 | Bilibili Model License, commercial use under thresholds [cited: tts.ai, aggregator] | **No Hindi evidence** (zh/en) | Yes | n/a | Ruled out |
| F5-TTS base, Hindi fine-tunes | Base weights CC-BY-NC (Emilia data) **[est, from memory; verify]** | Varies | Yes | Fast | Licence risk |
| Orpheus Hindi | Not verified | Not verified | Not verified | Not verified | Not researched in depth |
| Sarvam open TTS | No open-weights TTS found. Sarvam's open releases are LLMs [cited: https://en.wikipedia.org/wiki/Sarvam_AI] | n/a | n/a | n/a | n/a |

### 3.2 APIs (all fast; cost per 15-min episode at 12k characters)

| API | Price | Cost per episode | Cloning | Notes |
|---|---|---|---|---|
| Sarvam Bulbul v3 | ₹30 per 10k characters; v2 ₹15; cloning ₹30 per 10k [cited: https://docs.sarvam.ai/api-reference-docs/pricing.md] | **≈ ₹36 (~$0.43)** [est from cited rate] | Listed as a v3 feature [cited: https://www.sarvam.ai/tts-v2]; a third party says it is not self-serve [cited: invideo blog] | Indic-native and the best bet for tatsam. Commercial use is allowed if you hold the voice rights [cited: https://docs.sarvam.ai/api/getting-started/commercial-licensing.md]. |
| ElevenLabs Multilingual v2 / v3 | $0.10 per 1k characters (API); Creator $22/mo for 220k characters [cited: https://developer.puter.com/tutorials/elevenlabs-api-pricing/] | **≈ $1.20** | Instant cloning from Starter; Pro cloning requires voice verification [cited: invideo] | Best Hindi WER in the VoxCPM2 paper's comparison: 5.8% vs 19.7% [cited: arXiv 2606.06928]. Paid plans carry the commercial licence (free tier is non-commercial) [cited: invideo]. |
| Google Chirp 3 HD | $30 per 1M characters; Instant Custom Voice $60 per 1M [cited: https://cloud.google.com/text-to-speech/pricing] | **≈ $0.36 / $0.72** | Instant custom voice (gated) | hi-IN availability is not confirmed on the pricing page. |
| Azure neural hi-IN (Madhur, Swara, …) | ~$15–16 per 1M characters [cited: third-party, https://speechactors.com/article/microsoft-azure-pricing-and-plans] | **≈ $0.19** | Personal voice is gated, at extra cost | Supports SSML `<phoneme>` and a custom lexicon. That is the strongest pronunciation control in this list **[est, from Azure docs knowledge]**. |
| Cartesia Sonic-3 / 3.5 | 1 credit per character; Pro clones 1.5×; Scale ≈ $37 per 1M [cited: https://docs.cartesia.ai/pricing.md, https://soniox.com/pricing/tts/soniox-vs-cartesia] | **≈ $0.45–1.00** | Instant cloning from Pro ($5/mo) [cited: invideo] | Hindi is listed among its improved languages [cited: invideo Cartesia post] |
| MiniMax speech-2.8-hd | $100 per 1M characters [cited: invideo pricing post] | ≈ $1.20 | $1.50 per clone | Hindi WER 6.96% in the VoxCPM2 paper's table [cited] |

Cloning one of the 10 designed VoxCPM2 voices into an API is possible. Feed a VoxCPM2-generated reference clip to ElevenLabs, Cartesia or Sarvam. The result would only approximate the timbre, and it adds a vendor dependency.

---

## 4. Recommendation

1. **Profile first.** Add per-stage timers. The 5× slowdown is almost certainly pipeline overhead, not VoxCPM2: CPU Whisper, pyin, cache flushing, hidden retries, and serial execution.
2. **Do the cheap fixes:**
   - Whisper → GPU int8 faster-whisper, or IndicConformer.
   - pyin → yin, Praat, or GPU crepe.
   - Drop the per-take `empty_cache`.
   - Set `retry_badcase=False`.
   - Keep one warm process per episode.
   - Expected result: RTF ≈ 0.6–0.8 end to end **[est]**.
3. **Move to nano-vllm-voxcpm with concurrent beats and batched QA rounds** to get the end-to-end RTF to about 0.15–0.25 **[est]**. This needs flash-attn and a decision on how to replace previous-beat continuation (style anchor per voice). Try `inference_timesteps=6` as a separate A/B.
4. **Pronunciation:** add a Devanagari respelling lexicon with auto-flagging of tatsam clusters. Lock each word after a one-time audition. Use IndicConformer plus normalized per-word CER, or CTC forced alignment, as the detector.
5. **Fallbacks:**
   - Sarvam Bulbul v3, about ₹36 per episode, Indic-native.
   - ElevenLabs v3, about $1.20 per episode, best measured Hindi WER.
   - Azure, if hard phoneme control (SSML) becomes the bottleneck.
   - Among local models, only IndicF5 offers cloning with native Hindi, and its commercial licence is ambiguous.
