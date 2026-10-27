# Test clip: गंगा का वचन

A 67-second clip to get quick feedback on the look, the voices and the pronunciation before the full pilot. It follows the Critical Edition, Adi Parva 92.

- **Source of truth.** The Katha Studio copies are the ones that build the video. `story.json`, the staging script and `mahabharat.json` here are snapshots of them.
  - Staging script: `~/projects/hindi folklore/studio/scripts/mahabharat-ganga-shantanu-test.py`
  - Series: `src/series/mahabharat.json`
- **New assets in Katha Studio:**
  - `src/characters/shantanu.tsx`, in two variants: `hunt` with a bow, and `plain`.
  - `src/characters/ganga.tsx`.
  - The female kit, `src/characters/mini/female.tsx`.
  - The river set, `src/env/ganga-tat.tsx`.
- **Voices.** The narrator is `baritone`, Shantanu is `kathavachak` and Ganga is `deep-female`.

## Timings, measured 2026-10-28 on the RTX 4070 SUPER

- **Narration.** 115 s of wall time for 67 s of audio, about 33 s of it loading the models. 11 takes for 10 beats, all passed.
- **Render.** `tools/render-fast.sh` at 1920x1080 rendered 2,016 frames in 55 s, which is 36.7 fps. The total including mastering was 62 s.
