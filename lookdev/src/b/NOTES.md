# Variant B notes ("atmosphere")

## Layout

- `STYLE.md` is the spec. Every hex value in `palette.ts` comes from it.
- `geom.ts` holds the swirl generator. A swirl is an Archimedean curl whose stem leaves it tangentially and straightens out, with an optional reverse hook that makes the S motif. `swirlPath` turns it into a tapered filled ribbon, so it needs no stroke caps. `edgeSwirls` lays stems along a cloud edge.
- `Atmosphere.tsx` holds the colour field (`Ground`), the light streaks (`Shafts`), the cloud banks (`CloudBank`), `Vignette` and `Grain`. A cloud bank is a set of round lobes. Each lobe is masked by its own radial alpha gradient, which gives the airbrushed edge without a blur filter, and a soft offset shadow band sits under it.
- `Shantanu.tsx` and `Ganga.tsx` are parameterised characters. `expressions.ts` holds one face-parameter table per character, and both tables are keyed by the same six expression names. The parts sit on pivots: head tilt at the neck, and arms nested shoulder, then elbow, then wrist.
- `scenes/` holds one file per composition. `sky.tsx` has the three sky layouts (close, night close, wide).
- `compare.py` makes a side-by-side image and a 4x3 region colour delta against a ref. `probe.py` prints colours at matched normalised points. Rerun them with `python3 -I src/b/compare.py out/b-shantanu-close.png ref/owner-pick.png <out.png>`.

## Iteration log (shantanu-close against owner-pick, mean region colour delta)

1. Sky only: 47.9. The ground was too dark and brown, the clouds were feathery smoke, the swirls were small commas, and the light read as a sunburst.
2. Spirals rebuilt as true curls with long stems, and clouds masked per lobe: 46.9 (sky only). The figure was still missing.
3. Figure added: 19.0. The eyes were too open and cartoonish, the bottom too dark, and the clouds spread too far down.
4. Brighter, redder ground, clouds held to the top corners, narrow eye slits, crown redrawn: 15.5.
5. Hat-like crown with an upturned brim and a lotus finial, fletching over the fist, right-hand cloud raised: 10.4.
6. Left light streak, corner lobe, bigger fist: 10.3.

`ganga-close` against f2 ends at 17.6. Most of that gap is framing (f2 is an extreme face close-up), not palette: probed background points match within about 10 per channel.

## Measured cost (one machine, 16 cores, load average about 2)

- Motion at 1920x1080, one worker (`--concurrency=1`), 60 frames, two runs per side, with the 1.8 s fixed startup subtracted. With grain: about 90 ms per frame (7.14 s and 6.98 s). Without grain: about 74 ms per frame (6.23 s and 6.07 s). The grain layer costs about 16 ms per frame, roughly 20%. The figures include H.264 encoding. They are a ballpark, not a profile.
- The full 90-frame `motion` render at the default 8x concurrency took 5.5 s wall including bundling.
- The stills take about 1.6 s each once the bundle is cached.
- Grain dominates the file size. `b-motion.mp4` is 21.9 MB with grain that reseeds every 2 frames and 0.95 MB without grain. At YouTube bitrates, grain that changes every frame will smear into blocks. For delivery, use a static or slowly changing grain seed, or lower `grainOpacity`.

## Deviations from the refs

- Shantanu's crown is my own design, a hat-like dome with an upturned brim, a lotus finial and petal bands. It is not the ref king's three-peaked hat, so that he reads as Indian. It can still read as Central Asian. A taller kirita would be more clearly Indian but drifts further from owner-pick.
- I added a beard, a Vaishnava tilak, kundala earrings and a necklace to the king. All of them are cream hairline, so the idiom holds.
- Ganga wears a moon-silver mukuta, a sheer veil streaming behind the hair, and water-ripple rings. An earlier opaque blue hood with a halo read as Madonna iconography and was removed.
- f2's thorn branches became lotus stems with sword leaves, and its white roses became glowing lotus blossoms.
- The wide's far shore uses tone-on-tone shikhara silhouettes. The river carries the swirl motif laid sideways, as STYLE.md item 18 specifies.

## Known weaknesses

- The full-body Shantanu in `wide` is blocky. The arms are stiff segments, and his feet are only a hem line. The close-up idiom does not scale cleanly to a full figure.
- Ganga's full-length dress in `wide` is a plain bell with few hairlines, and her veil hangs straight.
- The `feTurbulence` grain shows a faint regular "waffle" at 1:1 crops.
- `turn` only slides the facial features sideways. There is no true three-quarter or profile head for either character.
- Ganga's expression differences are subtle at the expressions-sheet scale, as the f2 face idiom intends, but smile and neutral are close.
- On the indigo ground, the night cloud banks are low-contrast.

## What full scenes would need

- A profile or three-quarter head for each character. Dialogue between them needs it.
- Walk or gesture cycles for the arm pivots, and a hand library (open, point, grip, offering).
- A sky-layout generator, so cloud banks and swirls are placed by rule (corners, collar around the subject, density per 200 px of edge) instead of by hand for each shot.
- A per-scene palette blend between DAY and NIGHT for dusk transitions. Today `Mood` is two fixed tables.
- A delivery decision on grain (static grain, or a baked texture PNG) to keep the bitrate sane.
