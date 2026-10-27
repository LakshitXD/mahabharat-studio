# Mahabharat series: feasibility

Date: 2026-10-28. Target: episodes longer than 10 minutes, generated (narration + render + master) in 20 minutes or less.

Labels: **[M]** measured on this machine, **[C]** cited (URL in the detail reports), **[E]** estimate.

Detail reports in this folder:

- `research-story.md`: parvas, episode plan, characters, sets, hard shots, sensitivity, competition, 65-word diction list.
- `research-render.md`: frame cost breakdown, renderer options, recommended compositor.
- `research-tts.md`: VoxCPM2 speed-up paths, pronunciation control, API fallbacks.

## Verdict

The story is feasible. The 20-minute target is not feasible on today's pipeline. It is about 5x too slow. It becomes reachable after two engine changes, each of which needs a measured prototype before you commit.

| Stage | Today, 12-min episode | Needed | How |
|---|---|---|---|
| Narration | ~70-80 min [M, scaled from 455 s audio in 44 min and the crows episode in 52 min] | ≤ 6 min | Fix the QA loop, then nano-vllm batching |
| Render 4K | ~40 min at 9.1 fps [M, crows: 12,087 frames in 1,330 s] | ≤ 12 min (≥ 30 fps) | Cache layers once per shot, composite on the GPU |
| Master | ~1.5 min [M] | ~1 min | Unchanged |
| **Total** | **~110-120 min** | **≤ 20 min** | |

## 1. Story scope

- **Size.** The BORI Critical Edition has 18 parvas and 73,791 verses [C]. A faithful but watchable retelling is about 100 core episodes of about 12 min, or about 20 hours [E]. Adi parva alone is about 22 episodes, and the four war parvas are about 25. A tight cut is 50-60 episodes.
- **Side episodes.** Nala-Damayanti, Savitri, Shakuntala and Yayati work as standalone specials, about 20-30 more [E].
- **Characters.** 22 core, about 40 recurring, about 50 one-arc [E]. Ages and costumes multiply them to about 200-225 puppet variants. Shared bodies with swappable heads and costumes bring that to 60-80 base designs [E]. **This art budget is the largest real cost of the series.** It is weeks of puppet work, not engine work.
- **Sets.** About 40-50 backgrounds, or 70-90 plates with day, night and fire versions [E].
- **Hard shots.** Massed armies, arrow volleys, the Khandava and Lakshagriha fires, astras, Vishvarupa, Bhishma on the arrow bed, and the chakravyuha. Miniature painting already solves most of these cheaply. Armies are repeated rows of helmets, and the chakravyuha is a top-down circle with Drona at the centre (Garhwal, about 1820) [C]. That convention suits a sprite renderer well.
- **Accuracy hook.** Many famous scenes are TV or later inventions, for example the "andhe ka putra" taunt, Karna rejected as a suta, Shakuni's bone dice, and Barbarika [C, list in `research-story.md` section 5]. "The real Mahabharat, not the serial" is a strong angle and needs scripts that check against the text.
- **Sensitivity.** YouTube treats animation as dramatised. Non-graphic war violence can keep full ads, but gore in the thumbnail or the first 7 seconds hurts [C]. The vastraharan, Dushasana's blood and the night massacre need stylised staging. Karna and Ekalavya need balanced framing on caste. Don't mark the series "made for kids".
- **Competition.** Mostly kids' 2D cartoons, the live-action serials, and the mocked AI series "Ek Dharmayudh" (JioHotstar, 2025) [C]. View counts were not collected and need a manual check. An adult, text-faithful version in miniature style looks like an open gap [E].

## 2. Narration (the bigger bottleneck)

- **The model is not the slow part.** VoxCPM2 is published at RTF 0.30 on an RTX 4090 with torch.compile, and about 0.13 with Nano-vLLM [C]. On our card it generates at RTF 0.82 [M, 5 lines], while the full pipeline runs at about 5.8 wall [M]. So about 85% of the time goes around the model.
- **Likely causes,** read from `narrate.py`, not yet profiled:
  - Whisper large-v3-turbo runs on the **CPU** for every take.
  - `librosa.pyin` pitch tracking runs for every take.
  - `torch.cuda.empty_cache()` runs after every take.
  - `generate` retries silently by default (`retry_badcase`).
  - Beats run strictly one at a time.
- **Path:**
  1. Move ASR to the GPU, use a cheaper pitch tracker, and turn off silent retries [E: RTF 0.6-0.8].
  2. Use nanovllm-voxcpm to generate all beats as a batch, run QA in a batch, and regenerate only failures [E: 15 min of audio in about 2-4 min on the 4070 SUPER]. The catch is that continuing from the previous beat serialises the beats. A fixed style clip per voice would remove that, and needs an ear test.
- **Pronunciation.** VoxCPM2 has no Hindi phoneme input, so Devanagari respelling is the only lever [C]. Use a locked `pronounce.json` lexicon that changes only the TTS text, never the captions. Auto-flag words with ृ, ष, ञ, ङ, ः, क्ष, ज्ञ or 3+ consonant clusters. You audition each flagged word once. Check per word with GPU ASR (IndicConformer), not difflib on whole beats. The 65 hardest terms are listed in `research-story.md` section 7. Gita shlokas need full Sanskrit reading with every vowel kept.
- **Fallback** if local speed fails: Sarvam Bulbul v3 at about ₹36 per episode, or ElevenLabs at about $1.20 per episode [C/E]. Both lose the designed voices unless cloned again.

## 3. Render

- **Why it's slow.** A frame holds 4,200-11,300 SVG elements, 63-428 Gaussian blurs and full-frame blend layers [M]. About 66% of the paint is the static set, repainted every frame [M, CPU SwiftShader, 1 run]. Each puppet is about 1,000-1,600 elements with about 55 blurs. An army drawn this way would be unworkable.
- **Ruled out:** more workers (the GPU saturates at 3) [M], other engines (every puppet would need re-authoring) [E], and generative video (Wan 2.2 needs about 27 GPU-hours per episode, with no character consistency) [C].
- **Recommended path:** keep the React SVG art as the source and draw each layer once.
  - Once per shot, rasterize the background, front, lights and paper layers in Blink.
  - Cache actor sprites keyed by pose, expression, mouth (5 levels), idle loop (48 steps) and walk phase.
  - Composite each frame in WebGL2 inside the existing Electron fastrender, with the camera move, blend modes and lamp mask.
  - Draw armies as instanced sprites, and arrows, fire and astras as shaders.
  - Send the frames straight to NVENC.
  - Estimate: 45-60 fps at 4K, so a 12-min episode in about 8-10 min. About 1-2 weeks to build [E].
- **What the change requires.** Idle motions now loop on 96/110/120/170-frame periods and the mouth moves continuously. Both must be quantised, or the sprite cache never hits.
- **Cheap stopgaps.** Pre-rasterize the set in Blink for about 2-3x [E]. Render at 1440p and upscale to 4K, which measured SSIM 0.980 and is hard to tell apart side by side (`crop-compare.png`) [M]. Still upload 4K, since YouTube gives 4K uploads the better VP9/AV1 encodes [C].
- **Possible ceiling.** NVENC H.264 at 4K may top out around 60-70 fps per session [E from C]. Measure this first.

## 4. What to prove before committing

Each gate is a measurement, not a debate.

1. **Narration gate.** Instrument `narrate.py`, move QA to the GPU, and narrate one real 12-min script. Pass if it takes 8 min or less with the QA pass rate unchanged. Then try nano-vllm for 4 min or less.
2. **Render gate.** Build a compositor prototype for one darbar shot plus one 200-soldier army shot. Pass at 30 fps or more at 4K, with `tools/compare-renders.py` matching the current look.
3. **Pilot episode.** Ganga and Shantanu (opening of Adi parva). It has few characters, a river set and one divine effect. Use it to time the full pipeline end to end.
4. **Art budget.** Design the 22 tier-1 characters on a shared-body kit before episode 2. This is the pacing item for a daily schedule.

## Local measurements

**VoxCPM2 speed [M].** Measured on 2026-10-28 on the RTX 4070 SUPER, with the baritone reference, bf16 and torch.compile, after one warm-up line:

- **10 steps:** RTF 0.82 (5 lines, 30 s of audio, spread 0.81-0.83).
- **6 steps:** RTF 0.78 (31 s of audio). Fewer steps barely help.
- **Model load:** 31 s, paid once per episode.

**Conclusion.** Generation alone is about 0.8x real time, while the pipeline runs at about 5.8x. So about 85% of narration wall time goes to things other than generating audio: CPU Whisper, pyin, retakes and silent retries. Pipeline fixes alone give 12 min of audio in about 10 min at 0.8. Getting under about 6 min needs batching (nano-vllm) on top.

**Narration prototype [M, 2026-10-28].** Script `prototypes/narrate_fast.py` uses the same `plan()`, takes, seeds and `narration_rules.py`, with a timer on each stage. It was run on the real 89-beat script `tenali-death-by-old-age`:

| | Original settings (first 15 beats) | Fast settings (all 89 beats) |
|---|---|---|
| Whisper | CPU, 12.1 s per take (61% of time) | GPU fp16, 0.30 s per take (5%) |
| Generation | 117 s for 141 s of audio (RTF 0.83) | 486 s for 600 s of audio (RTF 0.81, 86% of time) |
| pyin | 0.16 s per take | 0.10 s per take (not a cost) |
| Takes and retakes | 20 takes for 15 beats | 102 takes, 13 retakes, 0 flagged (the original run had 103, 13, 0) |
| Wall time | 396 s | **562 s (9.4 min)**, against about 44 min for the original run |

- **What changed.** Whisper on the GPU, `retry_badcase=False`, and no `empty_cache` after each take. Peak VRAM was 7.8 GB.
- **Effect.** About 4.7x faster with the same QA outcome, as judged by the metrics; nobody has listened to the takes yet.
- **New limit.** VoxCPM2 generation at batch size 1, about 0.81x real time, plus about 15% extra audio from retakes.
- **For a 12-min episode.** About 13-15 min of narration. That is still above the about 6 min the 20-min budget needs, so batched generation (nano-vllm) is the next lever. A rerun timed out because another session restarted the crows render at 00:43 and took the GPU lock. Timings: `prototypes/*.timings.json`.
