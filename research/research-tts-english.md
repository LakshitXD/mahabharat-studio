# TTS for English / Hinglish narration with Indian names

Date: 2026-10-28. Web research only, read-only. No GPU was used.
This builds on `research-tts.md` (Hindi, VoxCPM2 speed) and does not repeat it.

Labels:
- **[cited: URL]**: I read the number or fact on that page.
- **[est]**: my own estimate or inference.
- **[unverified]**: the claim appears only in vendor marketing or an aggregator, or the sources conflict.

Episode size used for costs: 15 min, about 2,200 words, **13,000 characters**. Add about 30% for retakes **[est]**, which gives 17,000 billed characters.

The problem: VoxCPM2 with cloned Indian voices reads Indian words with English spelling rules inside English sentences. Examples: devtas → "deftas", Kuru → "Guru", danavs → "dhanavs".

---

## 1. What creators in this niche actually use

### 1.1 Evidence found (it is thin)

Evidence from named creators is scarce. Reddit could not be fetched directly (blocked), and mirrors returned errors. I found no interview with an English-language Indian mythology channel that names its TTS tool. What does exist:

| Signal | What it says | Source |
|---|---|---|
| ElevenLabs voice library | Community voices are marketed specifically for this niche: "Shardul K – Hindu Mythology Storyteller", "Raghav – Spiritual Mythology Narrator", "Shivank S – Scriptures & Mythology Voice". Creators sharing such voices implies demand. | [cited: https://json2video.com/ai-voices/elevenlabs/voices/6EphsklDopDQ6eRkwNHT/]; others in the same search |
| Audio Pitara (Hindi AI-narrated history, horror and romance podcasts) | Uses ElevenLabs TTS. 2.5M+ downloads as of June 2025. Its romance show was #1 in Chartable's global Fiction Trending ranking in 2024. Listeners did not suspect AI. | [cited: https://elevenlabs.io/blog/audio-pitara] (vendor case study) |
| Indian faceless-channel guide (JustShoot, 2026) | Recommends an ElevenLabs Hindi voice (₹500/mo) or your own narration for mythology and devotional channels. Says accurate Sanskrit pronunciation matters. Its sample scripts are all **Hinglish**. Names mythology channels Vid Evolve (2.5M), Mythologia (1M) and Indian Mythology Stories (800K) but not their tools. | [cited: https://justshoot.ai/blog/faceless-youtube-channel-ideas-india-2026-ai] |
| Generic faceless mythology guides and a Reddit advice reply | "Use ElevenLabs for VoiceOver" is the default advice. | [cited, via search snippets of r/ContentCreators and fluxnote.io guides] |
| Sarvam | Markets itself directly to YouTube creators of mythology content. Suggests the voice "Meera (warm)" for storytelling and mythology. Claims full commercial and monetisation rights. | [cited: https://www.sarvam.ai/text-to-speech/youtube] |
| Freelance job posts | Clients ask for "accurate pronunciation of Sanskrit shlokas and mythological names using ElevenLabs or similar". This confirms the pain is common. | [search snippet, guru.com; page itself returned 403] |
| Mythology freelancer portfolio | AI visuals plus voice for an Indian mythology channel. Tools listed are Premiere, After Effects, **Audition**, Runway, Midjourney and Suno, which suggests a human voice. | [cited, via search snippet: contra.com] |
| Human voice artists (Fiverr) | Indian-English male narrators charge about $2 per 100 words up to about $5 per 100 words. Commercial or broadcast rights are often an extra. | [cited, via search snippets: fiverr.com gig listings] |

### 1.2 How common each tool seems [est, from the signals above]

1. **ElevenLabs** is clearly dominant. It is the default recommendation in every faceless-channel guide, and it has a voice library with mythology-specific Indian voices.
2. **Own voice or a human voice artist** is still common on bigger Indian mythology channels. Indian audiences notice wrong Sanskrit.
3. **Sarvam Bulbul** is rising for Hindi and Hinglish. It is cheap and Indic-native, but I found no named English channel using it.
4. **Murf, Google, Azure, CapCut and InVideo built-in voices** appear only in generic listicles. I found no niche-specific evidence. Note that CapCut and InVideo voices are typically resold engines, often ElevenLabs or Azure **[est]**.

### 1.3 Is Hinglish a real trend?

- Yes for Hindi-belt audiences. Hinglish is described as a dominant online register (2024 HSSC study, via press) [cited: https://www.dtnext.in/lifestyle/wellbeing/hinglish-helps-users-engage-more-effectively-with-a-broader-audience-study-790290].
- The JustShoot India guide writes its mythology scripts in Hinglish [cited above].
- Claims such as "Hinglish gets recommended to both Hindi and English viewers" or "regional CPMs are 2–3× English" are vendor assertions only **[unverified]**.
- Practical point: Hinglish TTS works best when the Hindi words are in **Devanagari**. Sarvam explicitly says romanised Indic text "noticeably lowers quality" [cited: https://docs.sarvam.ai/api-reference-docs/models/bulbul]. A Hinglish script therefore *solves* the names problem for Indic-native engines. The cost is less reach outside India **[est]**.

---

## 2. Pronunciation control per tool

| Tool | Mechanism | Works in English sentences? | Notes |
|---|---|---|---|
| **ElevenLabs v4 / v4 Turbo** (launched 2026-09-28) | Inline IPA between slashes, e.g. `/ˈkʊ.ɾʊ/`. Pronunciation dictionaries (PLS) with phoneme or alias entries. | Yes | Docs say phoneme tags work on eleven_v4, v4_turbo, flash_v2 and v3. **Non-English IPA needs v4 or v4_turbo** [cited: https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries]. The v4 blog says IPA handling is "much better" and IVC/PVC are supported [cited: https://elevenlabs.io/blog/eleven-v4]. The best-practices page also says "results vary by voice… generate more than once" [cited: https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices]. |
| ElevenLabs Multilingual v2 | **Alias only**, i.e. respelling such as "Day-vuh-tahs" | Yes, as respelling | Phoneme tags are ignored on v2 [cited: best-practices page]. Matching is case-sensitive and the first match wins. |
| **Sarvam Bulbul v3** | Pronunciation dictionary: JSON word → respelling, per language code including **en-IN**. Limits: 100 words per dictionary, 10 dictionaries per user, 1 dictionary per request. | Yes, with en-IN | Docs say to test without a dictionary first; the model "already handles" Hinglish [cited: https://docs.sarvam.ai/api/api-guides-tutorials/text-to-speech/pronunciation-dictionary]. No SSML [cited: models/bulbul page]. Its main advantage is native Indic reading. One benchmark gave Hindi name accuracy of **92% for Bulbul, 78% for ElevenLabs and 65% for Google**, with code-switch coherence of 4.4, 3.8 and 3.4 [cited: https://caller.digital/blog/indic-tts-benchmark-bulbul-elevenlabs-sarvam-google-ai4bharat-2026]. That benchmark is by a vendor that resells all four, and its data is not public. |
| Sarvam Bulbul v4-flash | Has an **`enhi` (English–Hindi) voice category** with 200+ persona voices | Yes | It is the newer model and is recommended for new integrations [cited: models/bulbul]. The dictionary page lists v3 as the only supported model, yet its examples use v4-flash. **Conflict, verify.** |
| **Azure en-IN** (Aarav, Neerja, Prabhat, Kunal…; HD: Arjun, Aarti, Meera, Neerja, Diya, Lavanya) | SSML `<phoneme alphabet="ipa">`, `<sub alias>`, and a custom PLS lexicon up to 100 KB | Yes, the strongest hard control | No en-IN voice carries footnote 3, which marks "phonemes, custom lexicon… aren't supported". The video-translation table lists en-IN "TTS custom lexicon phoneme target: Yes" [cited: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts]. Caveats: en-IN has **no documented phone set** on the phonetic-sets page, so test that IPA symbols are accepted. The Long Audio API does not support `lexicon`; use batch synthesis instead [cited: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation]. The HD en-IN voices are multilingual (footnote 2) and auto-switch language. |
| **Google Chirp 3 HD en-IN** | SSML `<phoneme>`, `<sub>` and `<say-as>` since 2025-10-17. Custom pronunciations work in all locales except bn/gu/ur-IN and a few others, so **en-IN is supported**. Instant Custom Voice gained custom pronunciations on 2025-08-27. | Yes | Sources: release notes [cited: https://docs.cloud.google.com/text-to-speech/docs/release-notes]. One forum report says custom pronunciations had no effect on an en-US Chirp 3 voice [cited: discuss.ai.google.dev thread title]. Google scored last on Indian names in the benchmark above, and it renders English as American [cited: caller.digital]. |
| **Cartesia Sonic-3 / 3.6** | Dictionary with IPA as `<<ˈ|b|aɪ|u>>` or sounds-like spelling. Case-insensitive matching needs 3.6+. | Yes | Sources: [cited: https://docs.cartesia.ai/build-with-cartesia/sonic-3/custom-pronunciations]. Its India page lists 10 Indic languages and Hinglish code-switching in one voice, and uses Visakhapatnam and Aadhaar as dictionary examples [cited: https://cartesia.ai/india]. A user reports that a non-Hindi voice ignored language=hi [cited, via search snippet: Vapi forum]. |
| **Murf** | Per-word Custom IPA or alternative spelling; a pronunciation library on some plans | Yes | Pasted IPA can trigger an "Invalid Character" error [cited, via search snippet: help.murf.ai/pronunciation]. Has Indian-English voices. Nothing name-specific found. |
| **VoxCPM2 (current, local)** | **Accepts English CMUdict phonemes in braces**, e.g. `{K UH1 R UW0}`, with `normalize=False`. No IPA, no Devanagari inside English. | Yes, ARPAbet only | Source: [cited in research-tts.md: https://voxcpm.readthedocs.io/en/latest/usage_guide.html]. ARPAbet cannot express retroflex or aspirated sounds, but it fully fixes the three reported errors: `devta → {D EY1 V T AA0}`, `Kuru → {K UH1 R UH0}`, `danav → {D AA1 N AH0 V}` **[est, needs listening test]**. |

**Best out-of-box Indian-name pronunciation in English sentences [est]:**
1. **Sarvam Bulbul** (v3 en-IN, or v4-flash enhi), which is Indic-native.
2. **ElevenLabs v4** with an Indian voice. It is good, but anglicises rarer names. Its fixing power is the best of any engine because inline IPA works for non-English sounds.
3. **Azure en-IN**, which is decent, with the most deterministic fixing (SSML and lexicon).
4. Cartesia, Murf and Google trail.

---

## 3. Local and open options for Indian English

| Model | Licence | Indian English / names | Cloning | Fits 4070S 12 GB? | Verdict |
|---|---|---|---|---|---|
| **VoxCPM2 + CMU-phoneme lexicon** | Already in use | The phoneme override fixes names deterministically | Yes, all 10 voices kept | Yes | **Try this first: zero cost, keeps the voices** |
| Indic Parler-TTS | Apache-2.0 [cited: https://huggingface.co/ai4bharat/indic-parler-tts] | 21 English speakers; recommended: **Thoma, Mary** [cited] | **No**, named presets plus a text description | Yes, about 0.9B **[est]** | Good names likely, but the designed voices are lost |
| Indic-Mio (SPRINGLab) | Apache-2.0 [cited: https://huggingface.co/SPRINGLab/Indic-Mio] | 22 Indic languages plus English. Trained on LibriTTS and Indian English (SPICOR); handles code-mixing. RTF < 0.1, 0.6B, 44 kHz [cited]. | "Zero-shot via speaker embeddings" [cited]; how it works is unclear | Yes, easily | **Most promising open newcomer**, but there are no quality metrics; test it |
| Svara-TTS v1 (kenpath) | Apache-2.0 [cited: https://huggingface.co/kenpath/svara-tts-v1]. The base is Llama-3.2-3B, so the Llama community licence and attribution apply **[est]**. | 19 languages including Indian English; "limited" code-mixing [cited] | Voice-clone beta exists. mlx-audio calls the reference-cloning path "unreliable" on Orpheus fine-tunes [cited, via search snippet] | 3B bf16 is about 7 GB **[est]** | Experimental |
| Veena (Maya Research) | Apache-2.0 [cited: https://huggingface.co/maya-research/Veena] | Hindi, English, code-mixed | **No**, 4 presets | ~200 ms latency on a 4090 [cited]. NF4 4-bit fits easily | Loses the voices |
| IndicF5 | MIT on the card [cited: https://huggingface.co/ai4bharat/IndicF5] | **No English** (11 Indic languages only) [cited] | Yes | Yes | Not suitable for English narration |
| Dhee-Indic-F5 | **CC-BY-NC-4.0, non-commercial** [cited: https://huggingface.co/dheeyantra/dhee-indic-f5] | Indian English is first-class | Yes (3–10 s ref + transcript) | Yes | Ruled out for a monetised channel unless licensed |
| XTTS-v2 Indian-English fine-tune | Coqui CPML is non-commercial, and Coqui has shut down, so no commercial licence can be bought **[est, from knowledge]** | Claims Indian names [cited, via search snippet: https://huggingface.co/jeevav62/xtts-v2-indian-en] | Yes | Yes | Ruled out on licence |

---

## 4. Keeping the 10 designed voices

| Option | How | Fidelity / caveat |
|---|---|---|
| VoxCPM2 | Unchanged | Identical |
| ElevenLabs | **Instant Voice Clone** from about 10 s (v4) on Starter+; PVC on Creator+ [cited: v4 blog; https://elevenlabs.io/pricing] | Approximates timbre **[est]**. Uploading a synthetic WAV you designed is fine rights-wise, since you own it. |
| Sarvam | The Instant Voice Cloning API supports **en-IN** among 12 languages, uses a `voice_id`, and the reference may be in any language [cited: https://docs.sarvam.ai/api/api-guides-tutorials/voice-cloning/supported-languages]. Billed at ₹20 per 10k characters [cited: pricing]. **But** the creative cloning flow is a "live in-browser recording, not a file upload" [cited: https://docs.sarvam.ai/creative-voice-cloning.md], and third parties say self-serve cloning is unavailable [cited, via search snippet: invideo blog]. | **Unclear whether a WAV can be uploaded. Ask Sarvam.** |
| Azure | Personal Voice is gated behind an application **[est]** | Slow route |
| Google | Chirp 3 Instant Custom Voice; key generation in us/eu [cited: release notes] | Gated / allowlist **[est]** |
| Cartesia | IVC from about 10 s on Pro ($5/mo) and up [cited: https://cartesia.ai/pricing, https://cartesia.ai/india] | Good similarity is claimed [unverified] |
| Indic-Mio / Svara | Zero-shot or LoRA | Unproven |

---

## 5. Cost per 15-min episode (13k characters; about 17k with retakes)

| Option | Rate | Per episode (13k chars) | With retakes (17k) |
|---|---|---|---|
| VoxCPM2 / open models | Electricity | ≈ $0 | ≈ $0 |
| Sarvam Bulbul v4-flash | ₹10 per 10k [cited: https://docs.sarvam.ai/api-reference-docs/pricing] | ₹13 (~$0.15) | ₹17 |
| Sarvam Bulbul v3 | ₹30 per 10k [cited: same] | ₹39 (~$0.45) | ₹51 |
| Sarvam cloned voice | ₹20 per 10k [cited: same] | ₹26 | ₹34 |
| Azure en-IN neural | ~$15–16 per 1M [cited in research-tts.md, third-party] | ~$0.20 | ~$0.27 |
| Google Chirp 3 HD / Instant Custom Voice | $30 / $60 per 1M [cited in research-tts.md: https://cloud.google.com/text-to-speech/pricing] | $0.39 / $0.78 | $0.51 / $1.02 |
| Cartesia | 1 credit per character. Pro $5 for 100k; Startup $49 for 1.25M [cited: https://cartesia.ai/pricing] | ~$0.51–0.65 **[est]** | Pro covers about 5 episodes/mo |
| ElevenLabs API (v4 / v3 / v2) | $0.08 per 1k characters; v4 Turbo $0.04 [cited: https://elevenlabs.io/pricing/api] | **$1.04** (Turbo $0.52) | $1.36 |
| ElevenLabs Creator plan | $22/mo. Credits: 121k [cited: /pricing] vs 275k [cited: /pricing/api], **conflict** | — | 7–16 episodes/mo |
| Murf | Subscription ~$19–26/mo [unverified, third-party]; API pricing not found | — | — |
| Human (Fiverr, Indian English) | ~$2–5 per 100 words [cited, via search snippets: Fiverr gigs] | **$44–110** plus rights | — |

---

## 6. Recommendation

| Rank | Option | Why | Risk |
|---|---|---|---|
| 1 | **VoxCPM2 + English pronunciation lexicon** (CMU phonemes in braces, or English respelling such as "DAY-v-taas") | Free, keeps the 10 voices, deterministic per word. Names repeat across the series, so the lexicon is built once. | ARPAbet has no retroflex or aspirates: Bhishma, Dhrishtadyumna and Yudhishthira will sound anglicised-Indian, not Sanskrit. Brace syntax inside cloned-voice continuation is untested. |
| 2 | **ElevenLabs v4 + IVC of one designed voice + IPA dictionary** | Market standard for the niche. Only engine with documented non-English IPA. Best English prosody. | ~$1.04–1.36 per episode. Clone fidelity. IPA results "vary by voice". |
| 3 | **Sarvam Bulbul v3 en-IN, or v4-flash `enhi`** | Most natural Indian reading out of the box. Cheapest API. Best fit for a Hinglish version. | Preset voices unless cloning from a file works. No SSML. 2,500 characters per request. |
| 4 | Azure en-IN with an IPA lexicon | Cheapest deterministic control | Voices are less expressive for storytelling **[est]**. en-IN phone set not documented. |
| Avoid | Dhee-Indic-F5, XTTS-v2 fine-tunes (non-commercial). IndicF5 for English (no English). Google for names. | | |

---

## 7. A/B test plan

**Three test sentences.** Run each in English. Run the Hinglish variant of sentence 3 for Sarvam only.

1. "In Hastinapur, King Shantanu of the Kuru dynasty met Ganga by the river, while the devtas watched and the danavs plotted below."
2. "Bhishma, son of Shantanu, swore before Ishwar that he would never take the throne. 'Rajan,' he said, 'let your sons rule.'"
3. "At Kurukshetra, Yudhishthira and Dhrishtadyumna arrayed seven akshauhinis against Duryodhana's eleven."
   - Hinglish variant: "कुरुक्षेत्र में Yudhishthira और धृष्टद्युम्न ने seven akshauhinis खड़ी कीं…" (Devanagari for the names).

**Arms.** One narrator voice, ideally the baritone, in each arm:
- **A. VoxCPM2 baseline vs VoxCPM2 + lexicon.** Lexicon examples: `{D EY1 V T AA0 Z}`, `{K UH1 R UH0}`, `{D AA1 N AH0 V Z}`, `{B IY1 SH M AA0}`. Also try an English-respelling variant of each.
- **B. ElevenLabs v4.** Run two passes:
  - B1: an IVC of the baritone reference WAV with no dictionary.
  - B2: the same voice plus an IPA dictionary, e.g. `Kuru /ˈkʊ.ɾʊ/`, `devta /ˈdeːʋ.t̪ɑː/`, `Dhrishtadyumna /d̪ʱɾɪʂ.ʈə.ˈd̪jʊm.nə/`.
  - Use the $6 Starter plan. The test uses well under its 30k-credit allowance.
- **C. Sarvam Bulbul.** Two configurations:
  - v3 en-IN with a preset male voice (e.g. Shubh), no dictionary.
  - v4-flash `enhi` voice on the English text, and on the Hinglish variant.
  - The ₹100 free credit covers this [cited: pricing].
- Optional **D. Azure** `en-IN-Prabhat` / `Arjun:DragonHD` with the same IPA. This is the deterministic control.

**Scoring:**
- Run each sentence ×3 takes per arm (variance matters on ElevenLabs).
- Blind-rate each take, owner plus one Hindi speaker, for:
  1. per-name correctness: 11 target words, right or wrong;
  2. naturalness, 1–5;
  3. voice match to the designed narrator, 1–5.
- Also run IndicConformer or Whisper on each take as a sanity check, not as the judge.

**Decision rule [est]:**
- If arm A with the lexicon gets ≥ 10 of 11 names right at naturalness ≥ 4, stay local.
- Otherwise, choose the API arm with the best name score whose cost is ≤ $1.50 per episode. Keep VoxCPM2 for character voices only if the voice match matters more.
