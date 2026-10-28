# Variant A "engraved": notes

Entry `src/a/index.ts`. Render a still with `npx remotion still src/a/index.ts <id> out/a-<id>.png --frame=0`; render the clip with `npx remotion render src/a/index.ts motion out/a-motion.mp4`. `npx tsc --noEmit` passes.

## Files

- `palette.ts` sampled colours (warm and night sky palettes, king ink and line, Ganga fills) and the one line weight.
- `geom.ts` seeded RNG, Archimedean spiral path, quadratic smoothing.
- `expressions.ts` the `Expression` record (brow angle, brow raise, eye aperture, mouth curve, mouth open, asymmetry, gaze) and the six named presets. Both characters read the same record, so one table drives both faces.
- `Sky.tsx` glow gradient, gradient-faded light wedges, disc-chain clouds with scalloped outline and edge curls, loose curls, the whole-frame grain and mottle pass.
- `Shantanu.tsx` king as one ink silhouette with the line work on top. Head group pivots at the neck (`rotate(tilt 0 380)`), the feature group accepts a turn (translate plus horizontal squash), brows and eye slits are built from the expression, arms are poses (`spear`, `offer`, `rest`).
- `Ganga.tsx` hood, face, blush, almond eyes with clipped iris, L nose, lozenge mouth, halo, robe with water-fold lines whose control points take a `phase` for sway. Same pivots and props as the king.
- `scenes/` one file per composition; `Frame.tsx` is the SVG wrapper that appends the texture pass.

## Deviations from STYLE.md that I know of

- Cloud bodies are built from discs with one blur on the whole layer. The reference's lobes are hand-drawn and irregular, with the curl's outer arm continuing the lobe's outline. Mine put a smaller curl inside the lobe near its edge, so the "rolling wave" read is weaker than the reference.
- The soft edge sits outside the crisp scalloped outline (blur halo around a crisp inset fill), where the reference has the outline at the very edge with the softness falling away outside it.
- The light wedges have readable straight edges. The reference's rays are soft streaks. A blur on the ray group would fix it at the cost of a second filter pass.
- The king's fist is a simplified knuckle outline, not the reference's drawn fingers gripping the shaft.
- The king's `turn` only squashes and offsets the face features. There is no three-quarter head geometry, so in `wide` he still reads frontal with his arm out.
- Ganga's face in `ganga-close` is at 1.8x, framed chest-up as the brief asked. The f2 reference frames the face alone at roughly 2.6x. The hood is a plain dark mass with two strand lines; the reference hair has more internal strand shapes.
- The expression amplitude on the king is deliberately small (slits, brow wedges, a mouth line behind the mustache). It reads on the sheet at 0.62x but will need larger brow travel in motion.
- Grain and mottle are a single `feTurbulence` pair at fixed seeds, so the texture does not boil between frames. If the owner wants film-like boil, vary `seed` per frame (costs nothing).

## Render time (measured)

Machine: this workstation, CPU rendering (no `--gl`). `npx remotion render ... motion --concurrency=1` took 11.05 s wall for 90 frames including bundle, browser launch and encode; a single still took 1.66 s wall including the same startup. That puts the per-frame cost at about (11.05 - 1.66) / 90 = 104 ms per 1920x1080 frame at concurrency 1, encode included. With the default concurrency the same clip rendered in 12.7 s on a cold bundle. Stills render in 1.6 s each, almost all of it startup.

What limits it: two full-frame `feTurbulence` passes and three blurred cloud layers. Removing the mottle pass or pre-baking the grain into a PNG pattern would cut the per-frame cost further; I did not measure that split.

## What full-scene animation needs

- A rig layer above the components: per-character state (`pose`, `expression`, `mouth`, `blink`, `turn`, `tilt`, `phase`) interpolated from keyframes with Remotion's `interpolate`/`spring`. The props already exist; only the timeline is missing.
- Lip sync: `mouth` 0..1 from a phoneme or amplitude track (the motion clip uses a hand-written syllable score in `scenes/Motion.tsx`).
- Blink scheduler: random blinks every 2 to 5 s with the 7-frame shape in `Motion.tsx`.
- A real three-quarter head for both characters (second geometry set, cross-faded or swapped at cut points), since the current `turn` is a cheat.
- Arm rig: the spear and offer poses are fixed paths. For gestures, split the arm into upper, forearm and hand groups with pivots at shoulder, elbow and wrist, and draw the sleeve drape as a path driven by the elbow angle.
- Camera: wrap scenes in a `<g transform>` for push-ins and pans. The silhouettes are vector so scale is free; the texture pass stays in screen space.
- Backgrounds: the cloud chains take a `drift`; parallax by giving each chain its own multiplier. Lotus, blossoms and ripples want a slow phase too.
- A shared `SceneProps` type with the cast list and per-character state, and a `Scene` component that lays out from it, so episode scripts become data.
