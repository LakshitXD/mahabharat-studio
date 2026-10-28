# Variant A "engraved": style spec

Sampled from `ref/owner-pick.png` (272x159), `ref/dragonbee-f1.jpg` (480x360, 16:9 letterboxed inside 4:3, so 1 ref px = 4 px at 1920x1080) and `ref/dragonbee-f2.jpg`.

## Palette (sampled)

- Warm scene glow centre (behind the king's head): `#e2a883` to `#d09070`. Mid ground `#a06050`, `#905040`. Darkest cloud bellies `#301010`, cloud body `#5a2020` to `#602020`, cloud lit edge `#8d3332`.
- Silhouette: `#0a0000` (black with a red cast, never pure `#000`).
- Engraved line: `#e9bb8f` at full strength, peaks `#f3c298`; most lines read as `#d9a67f` because they are thin. Opacity 0.9. Never white.
- The single accent: arrow red `#ef000c`, flat, no gradient, no outline.
- King's lit eye slit: the line colour at 100% plus a near-black pupil.
- Night palette (f2/f3): background indigo `#281f54` to `#1a1538`, branch/ornament `#503f8d`, blossom `#f0e8ff`, face `#eee9ed`, blush `#f0d6dd`, iris `#ac88ac`, lip `#aaa4c4`, hair `#2a2238` with strands `#5c4c67`, face contour `#4a3d5a`.
- Ganga's river blue sits between the two: garments `#262457`, water lines `#bcd4ee`, veil `#dfe9f8` at 0.25.

## Line

- One line weight for the whole figure: 1 px at 480 wide = 3.2 px at 1920 (about 1/150 of the visible king height). Round caps, round joins. No tapering, no sketchy doubling.
- Line work is sparse. The king has about 40 strokes total chest-up. Every stroke describes a plane edge, a fold or an ornament; none shades.
- Lines sit INSIDE the black silhouette, inset about 1 line width from the outer edge. The silhouette edge itself is cut, not outlined (the hard black edge against the glow is the outline).
- Dark figure: lines pale cream. Pale figure (princess): lines dark violet-grey, same weight, and the fill does the work.

## Shape language

- The king is a tall symmetrical totem: crown 112 tall, face 228 wide and 300 tall, beard reaching 360 below the chin, shoulders 1160 wide at 1920, all centred. Symmetry is near-perfect; only the arm with the spear breaks it.
- Crown: wide low tiara with a central peak, two side horns, a brim line that extends past the face, a mid band with a small lozenge jewel.
- Face planes: temple-cheek-jaw as two long strokes each side; the nose is a single vertical bridge line ending in a small nostril curve; brows angular; eyes narrow lit almonds directly under the brows; handlebar mustache that ends in two spiral curls; long pointed beard with a central line.
- Robe: V collar in two nested pairs, a crossed sash forming an X on the chest, central vertical seam from beard tip to hem, cuffs as two parallel curves. Shoulder line a broad shallow arc.
- Princess (Ganga): long pale oval face, forehead to chin about 1.6x the width; eyes large almonds with round iris and one highlight each; brows thin single arcs; nose an L (vertical line, short foot); mouth a small flat lozenge; hair a dark hood that frames the face in two long tapers; blush as two soft discs.

## Light

- The king is unlit: pure silhouette. Light exists only as the glow behind him (radial, centred at his head, 1.2x frame width, fading to the mid ground) and as 5-7 faint radial light wedges.
- Eye slits are the only "lit" area on him: the fill is the line colour.
- The princess is lit flat: fill `#eee9ed` everywhere, no shading except the two blush discs and a 1-line contour.

## Swirl clouds

- A cloud is a chain of 4-8 overlapping discs (radius 90-260 at 1920) along an arc. Fill dark burgundy, edges outlined by the lit edge colour at 0.6 opacity, outline visible only on the outer silhouette (scalloped, never inside the mass).
- Each large disc carries one spiral curl: Archimedean, 1.5-2.2 turns, line weight equal to the figure line, colour lit edge at 0.55, drawn inside the disc and opening toward the disc's outer edge so the lobe reads as a rolling wave.
- Clouds live in the frame corners and top edge, leaving the glow open behind the figure. A few single curls (no body) float in the glow.
- Cloud bodies have a soft 8-12 px edge (one Gaussian blur on the whole cloud layer, never per disc). Curls and outlines stay crisp.

## Grain and texture

- Whole-frame fine grain (fractal noise, base frequency 0.8, 2 octaves) blended overlay at 0.28.
- Whole-frame low-frequency mottle (base frequency 0.0035, 3 octaves) blended soft-light at 0.45, which gives the watercolour unevenness in the glow.
- Slight vignette: darker corners from the clouds themselves plus a 0.35 radial darkening.

## Composition

- Close-up: crown top at 11% of frame height, eyes at 27%, shoulders at 50%, figure cut at the bottom edge, head dead centre.
- One accent per frame, diagonal when it is a weapon, placed to cross the figure, never the face.
- Wide: figures at 55-70% of frame height, horizon low (72%), sky takes two thirds of the frame.
- Night: same construction, palette swapped, blossoms replace the single accent.
