# Merged look ("m"): notes

Entry `src/m/index.ts`. Stills: `npx remotion still src/m/index.ts <id> out/m-<id>.png` for `wide`, `shantanu-close`, `ganga-close`, `expressions`, `poses`. Clips: `npx remotion render src/m/index.ts walk out/m-walk.mp4` (60 frames) and `motion` (90 frames). Sheets and colour deltas: `python3 -I src/m/sheet.py` writes `out/compare/m-*.png`. `npx tsc --noEmit` passes.

## What came from where

| File | Source |
| --- | --- |
| `atmosphere.tsx` | Variant B's `Atmosphere.tsx`, `scenes/sky.tsx` and `scenes/night.tsx`, plus B's `RedArrow`. Copied, with the mood type widened. |
| `geom.ts` | B's swirl generator and smoothing, plus A's `spiralPath` for the mustache curls. |
| `palette.ts` | B's `DAY` and `NIGHT` tables, a new `EVENING` between them, A's king ink and line, A's Ganga face colours, B's dress and veil colours. Each mood also carries river, shore, bank and reed tones so the set can switch. |
| `face.ts` | Variant C's `FaceRig`, `EXPRESSION_RIGS` (9), viseme shapes (5), `mouthGeom`. `rigFor` maps the contract's `ActorProps` onto it: viseme plus `mouth` as the amount, or `mouth` alone as an "AI" shape, then blink on the lids. |
| `shantanu.tsx` | Head: A's `Shantanu.tsx` head geometry, with the brow, eye slit, mustache and mouth rewritten to read the rig. The open mouth is new. Body, arms, hands, pose table: new. |
| `ganga.tsx` | Head: A's face oval, hood edge, eye, brow, nose and blush, rewritten to read the rig; the mouth uses C's `mouthGeom`. Hood and four hair falls: new, from A's two-taper hood. Dress, neckline dots, swirl clasps, veil, mukuta, bloom: B. Body, arms, hands, pose table: new. |
| `rig.ts` | New: pose table types, the walk cycle, idle motion. |
| `figure.tsx` | New: the figure root that scales figure units to px and pins the stroke width on screen. |
| `set.tsx` | B's `scenes/Wide.tsx` scenery split into `Back` and `Front` and keyed by mood. |
| `registry.ts` | The contract export: characters `shantanu` (1000 px) and `ganga` (940 px), set `ganga-tat` (groundY 0.88, actorScale 0.62). |
| `scenes.tsx`, `index.ts` | The seven compositions. `Place` in `scenes.tsx` imitates the player's placement (translate to the feet, scale, mirror). |
| `sheet.py` | Contact sheets and B's 3x4 region colour delta. |

Nothing imports from `src/a`, `src/b` or `src/c`. The contract in `src/shared/contract.ts` is unchanged. `facing` is ignored (the player mirrors).

## Contract notes for the player

- The stroke width does not scale with the player's transform. `variant: "close"` gives 5 px lines and, in `stand`, puts the king's trail hand in a fist across the body (the owner-pick grip), with `kingHand(props, "trail")` returning the palm position for the arrow.
- `walkPhase` 0 is the lead foot's heel strike. To keep the planted foot from skating, move the actor by `travelPerCycle(half)` figure units per cycle: king 680 units (247 px at scale 1), Ganga 480 units (156 px at scale 1), times the player's scale.
- Pose changes are hard cuts; the player can crossfade or hold a beat on them. `blendPose` exists for a tween if the player wants to drive it.
- Every gradient and clip id is per instance (`useId`), so several copies of a character in one SVG do not collide.

## Iterations against the refs

Mean 3x4 region colour delta from `sheet.py` (lower is closer; B's own measure).

| Render | A | B | C | M |
| --- | --- | --- | --- | --- |
| `shantanu-close` vs owner-pick | 26.5 | 10.3 | 12.1 | 8.9 |
| `ganga-close` vs f2 | 19.6 | 17.6 | 21.2 | 18.1 |

1. First build: hair connected, poses read, but the king's sleeves were 190 units wide and doubled the torso, the arrow pointed up-right with the shaft behind the body, the namaste bow was a jumble of crossed sleeves, brow travel was too small, Ganga's veil was a straight-edged tent.
2. Sleeves narrowed to 148 at the upper arm and 220 at the cuff, pivots moved in, arrow re-aimed from upper left and drawn over the body with the fist redrawn on top, bow changed to a lean with a hand on the heart, brow travel raised 25-45%, veil narrowed and curved, Ganga's neck shortened 20 units.
3. Shoulders lowered 50-80 units so the slope matches the owner-pick (ref shoulders at 49% of the height, mine were at 44%), arrow anchored on the palm centre instead of the wrist. Delta 8.9.
4. After the player's first full render: the king's open mouth became a lit cream shape with a dark cavity and teeth, the mustache lifts and the beard parts with the opening. Ganga's close-up scaled up 14% and its vignette raised toward f2's darker edges, delta 18.7 to 18.1.

## Measured cost

Machine: this workstation, 16 threads, CPU rendering, load average 3-4 from other agents during the runs, so these are a ballpark. One still costs 1.68 s wall, almost all startup (bundle cached, browser launch, encode). Subtracting that:

| Clip | Run 1 | Run 2 | Per frame |
| --- | --- | --- | --- |
| `walk`, 60 frames, `--concurrency=1` | 7.37 s | 7.21 s | 95 ms, 92 ms |
| `motion`, 90 frames, `--concurrency=1` | 9.91 s | 10.04 s | 91 ms, 93 ms |
| `walk`, default concurrency | 5.09 s wall | | |

About 93 ms per 1920x1080 frame at one worker, encode included. The limiter is the same as B measured: the two full-frame `feTurbulence` passes (B found 16 ms of this) and the cloud-bank masks, with the screenshot and encode pipeline behind them. The figures themselves are a few hundred paths and are not the limiter. `m-walk.mp4` is 2.2 MB for 60 frames and `m-motion.mp4` 1.55 MB for 90 frames with the static grain; B's reseeding grain was 21.9 MB for 60 frames.

## Weaknesses

- The king's 3/4 stance is still a 2.5D cheat: the features slide and squash with `turn`, the collar lines shift, but there is no second head geometry. A true profile needs separate heads.
- Hands are mittens with finger lines. The palm-up offer reads at wide scale; close up it is crude.
- In `shantanu-close` the gripping fist sits at the frame's bottom edge and is cut (the ref's fist is at 88% of the height, mine at about 92%). Raising the grip pulls the forearm across the chest lines.
- The walk is a dignified glide, not a stride: half-step 170 units is a short step for a 2750-unit figure. A faster character would need a larger half-step and more knee in the hem.
- Pose changes are hard cuts. The player will see arms jump between beats unless it tweens.
- Ganga's `think` hand reaches her neck, not her chin, because the arm pivot sits below the long neck. It reads as "hand to throat".
- The expression sheet's king row at 0.62x is readable for grin, surprised, angry and sad; neutral, thinking and determined still need the close-up.
- The `ganga-close` gap to f2 (18.1) is framing. f2 is an extreme face close-up on a darker ground with thorn roses; mine stays chest-up as the brief asked.
- Ganga's veil edges are two curved lines; the reference veil has internal folds.
- The feather on the cloud masks is per lobe, so two overlapping lobes show a faint seam at their shared edge in the far banks.
