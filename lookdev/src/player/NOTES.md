# Story player

The player turns a narrated story (`story.json` + `timing.json` + audio) into the `story-en` composition. It draws nothing itself. Sets and characters come from a `Registry` that follows `src/shared/contract.ts`.

## Files

| File | Owns |
| --- | --- |
| `index.ts` | `registerRoot` for this entry. |
| `Root.tsx` | The `story-en` composition. Its `calculateMetadata` loads the story, checks it against the registry, and sets the duration to `timing.frames`. |
| `story.ts` | The domain types (`Story`, `Beat`, `ActorCue`, `Camera`, `Caption`) and `parseStory`, the only code that reads raw JSON. |
| `timeline.ts` | Pure functions from a frame to state: `shotAt`, `actorAt`, `cameraAt`, `captionAt`, `blinkAt`, `visemeAt`, `titleOpacity`, `musicVolume`. |
| `StoryVideo.tsx` | Renders a frame from that state: stage, captions, title card, audio. |
| `registry.ts` | The one import point for the look. |
| `stub-registry.tsx` | Placeholder look (labelled shapes) used until `src/m/registry.ts` exists. |
| `check-timeline.ts` | Behavior checks on the timeline model, run against a real story. |

## Timeline model

`parseStory` joins each story beat with its timing entry into one `Beat`: absolute `from` and `frames`, `set`, `mood`, `camera`, `actors`, the per-frame `envelope`, and `captions` with explicit `from`/`to` (a chunk ends where the next one starts; the last one ends 12 frames after the envelope goes quiet). Beats must be contiguous, and the parser throws if they are not.

Every frame is a function of `(story, frame)`:

- `shotAt` finds the beat and the beat-local frame. During the first 8 frames of a beat whose set or mood differs from the previous beat, it also returns the previous beat (still advancing past its end) and the cover opacity for the crossfade. Otherwise the change is a cut.
- `actorAt` gives feet position in stage px, scale and `ActorProps`. An actor with `toX` eases from `x` to `toX` over the first 70% of the beat. Its `walkPhase` is distance travelled divided by one gait cycle (0.8 x figure height x set scale), so the feet do not slide and the phase stops when the actor stops. After the walk the pose is `then`, or `stand` when the cue's pose was `walk`. `mouth` is `envelope[local]` for `speaks: true` actors and 0 for others. `viseme` comes from the envelope level and slope (`visemeAt`). `blink` follows a per-actor schedule seeded by the actor key, 3 to 5 s apart, on the absolute frame so blinks carry across cuts.
- `cameraAt` returns a view: the stage point at frame centre and a zoom. `hold` keeps `camera.zoom/x/y`. `push-in` eases zoom from 1 to 1.12, or from `camera.zoom` to `camera.zoom x 1.08`. `pan-right` zooms to at least 1.1 and drifts the centre by 0.12 frame widths. The centre is clamped so the view never shows past the stage edge. The view is one SVG transform on the whole stage.

Sets get the absolute frame (ambient motion stays continuous across cuts). Actors get the beat-local frame, as the contract says.

Captions sit in the bottom 12% band in Noto Serif Display (the first installed font in the stack) at `#e5b28c`, fading over 5 frames. The title card shows `story.title` for the first 1.5 s and fades out by 2.5 s. Narration plays at volume 1. Music plays at 0.12 (about -18 dB), fading in over 1.5 s and out over the last 2.5 s.

## Rendering contract assumption

The stage is one `<svg viewBox="0 0 1920 1080">`. `Back`, `Front` and character components must return SVG content (`<g>`, a fragment, or a nested `<svg>`). HTML elements do not render inside it. The contract does not state this yet.

## Add a story

1. Put `story.json`, `timing.json`, `narration.wav` and (optionally) `music.wav` in `public/stories/<story-id>/`. `timing.audio` and `timing.music` are paths under `public/`.
2. Check that every `shot.env` is a set and every `actors[].char` is a character in the registry. The render fails up front with the missing names if not.
3. Run the timeline checks: `npx esbuild src/player/check-timeline.ts --bundle --platform=node --outfile=out/check-timeline.cjs --log-level=warning && node out/check-timeline.cjs <story-id>`.
4. Render: `npx remotion render src/player/index.ts story-en out/<story-id>.mp4 --props='{"storyId":"<story-id>","story":null}'`. To make it the default, change `defaultProps.storyId` in `Root.tsx`, or add another `<Composition>` with a different id and `storyId`.

## Registry

`registry.ts` re-exports `../m/registry` (the real look). To fall back to the placeholder look, change it to `export { registry } from "./stub-registry";`. Nothing else imports the look.

## Measured speed

CPU only, 16-core machine, Remotion 4.0.536, measured 2026-10-28 with wall-clock timing around `npx remotion render`. Fixed startup (bundle cache warm, browser launch) is about 1.7 s.

| Look | Run | Wall | Per frame after startup |
| --- | --- | --- | --- |
| `src/m` | full video, 2004 frames, default concurrency | 160.5 s | about 79 ms |
| `src/m` | frames 800-859, `--concurrency=1` | 10.2 s | about 142 ms |
| stub | full video, default concurrency | 21.9 s | about 10 ms |
| stub | frames 800-1099, `--concurrency=1` | 15.1 s | about 45 ms |

The real look scales poorly with concurrency (1.8x from 1 worker to the default). The limiter is not measured. A guess is the look's grain texture: it makes frames expensive to rasterize and to encode (the full mp4 is 184 MB against 9.7 MB for the stub).
