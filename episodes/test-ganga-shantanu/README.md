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

## Shadow-puppet version (2026-10-28)

The owner chose the Tholu Bommalata leather shadow-puppet look for this series, and the clip was re-made in it.

- **Files.** The clip is `shadow-clip.mp4` and the contact sheet is `frames-shadow.png`.
- **How the look is chosen.** The series file sets `"look": "shadow"`. The puppets and set are in `src/shadow/` in Katha Studio, and the miniature drawings are kept under the same ids.
- **Render.** `render-fast` at 1080p rendered 2,016 frames in 96 s, which is 21.0 fps. That is 43% slower than the miniature look, because each frame draws the scene twice (a leather pass and a glow pass). The narration was reused from cache.
