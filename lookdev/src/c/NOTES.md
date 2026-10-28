# Variant C notes ("faces")

## Layout

- `face.ts` holds the acting model. A `FaceRig` is 15 numbers (brow lift, tilt and asymmetry, lid opening, lower-lid squint, pupil size, gaze, mouth curve, width, opening, roundness and skew, teeth, blush). `EXPRESSION_RIGS` is a table of the 9 expressions. `VISEMES` holds 5 mouth shapes (MBP, AI, E, O, FV). `mixRig` blends two rigs, and `resolveRig` applies speech and blink on top. Both heads read the same rig, so one expression track drives either character.
- `GangaHead.tsx` and `ShantanuHead.tsx` render the pale face and the dark face from a rig plus `turn` (from -1 to 1, with 0 front-on and about ±0.6 a three-quarter view). The far eye compresses, the features shift and the hair parallaxes.
- `Characters.tsx` holds the `Shantanu` and `Ganga` bodies. Heads sit on neck pivots (`headTilt`). Arms are two-joint (`{shoulder, elbow}` in degrees). Both bodies offer chest-up or `full` builds. `kingHandPoint` gives the forward kinematics, so props such as the arrow can be placed in the hand.
- `backdrops.tsx` holds the sepia sky and the night sky, the `CloudBank` swirl-cloud generator, the brush streaks, the lotus thicket, the halo and the arrow.
- `scenes.tsx` holds the five compositions. `render.sh` renders every still and writes `out/cmp-*.png` sheets with each shot beside its reference.

## Measured render cost (CPU, 16 threads, 1920x1080)

- `motion` at `--concurrency=1`: Remotion's verbose log shows 60 to 66 ms per frame after the first frame (117 ms). The whole 90 frames render in about 5.7 s, and wall time including bundling is 7.7 s.
- `motion` at the default concurrency (8x) takes 7.4 s wall. That is no faster, so the screenshot and encode pipeline, not React/SVG, is the bottleneck at this scene complexity.
- A single still takes 1.5 s wall. That is mostly bundling (5 s on the first run after a code change). Per-frame render time is about 60 ms.

## Deliberate deviations from the refs

- The wide shot puts a cool Ganga (indigo sari, pale face) into the warm sepia world. The refs never mix the two families in one frame. The brief asked for river-blue garments, and the clash also marks her as not of this world.
- The king carries Indian ornament the ref king lacks: a Vaishnava U tilak, a dotted haar necklace, a paisley clasp, temple-border sawtooth bands on the crown and hem, and an upturned Rajput-style mustache (the ref's curls droop). The upturned tips also give his face a calm neutral expression that the drooping version could not.
- In the ref, the king's mouth is hidden under the mustache. Here a cream-outlined mouth sits under it so he can lip-sync and grin. Teeth are a cream band, and the mouth interior stays ink.
- f2's thorn branches became lotus stems and pads, and its roses became lotus blossoms with a soft bloom gradient. The halo uses the thumb's dotted mandala rings.
- The clouds are generated (overlapping lobes, an outer-edge-only outline, curl-and-tail spirals, a soft radial shadow). The ref clouds are hand-painted, with looser brushwork and smudged shadows.
- The full-body proportions of both characters are invented, because the refs only show chest-up framing. The king's head is scaled 1.3x in full shots to keep a heroic read.

## Known weaknesses

- Full-body figures are the weakest part. The king reads as a block with a stiff offered arm, and Ganga's arms and sleeves are thin and puppet-like. Neither has feet or a walk design.
- Head turn is a 2.5D cheat (shift plus squash), good to about ±0.6. A true profile needs separate profile heads.
- Grain is a single feTurbulence overlay, and the brush texture is translucent strokes. The refs have a coarser painted grain and soft airbrushed shading on clouds and skin that flat SVG does not match.
- The lotus pads read slightly as flat discs.
- The expression sheet's king row is dense at phone size. His surprised, grin, sad and angry faces read instantly. Neutral, thinking and determined need the larger close-up framing.

## What full scenes would need

- A dialogue track format, (frame, viseme) pairs from a forced aligner such as Rhubarb or Montreal, mapped onto `VISEMES`. Plus keyed expression tracks, like `EXPR_KEYS` in `scenes.tsx` but loaded per shot.
- Profile and back views for both heads, hands with 3 or 4 poses (open, offer, fist, point), and a walk cycle.
- More cast built on the same rig: a pale-face variant for other women and divine figures, and silhouette variants for warriors and sages.
- A camera layer (parallax pans over `CloudBank` layers already accept `dx`) and transitions between the warm and cool palettes.
