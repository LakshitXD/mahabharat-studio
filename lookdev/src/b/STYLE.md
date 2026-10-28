# Variant B style spec ("atmosphere")

Target: the look of Dragonbee's "The Wedding Veil of the Proud Princess" (2024), anchored on `ref/owner-pick.png`. Hex values below were sampled from the refs with 3x3 or 5x5 averages (`src/b/compare.py --sample` reprints them).

## Colour fields

1. **Day / drama ground (sepia-red).** A radial glow, not a flat fill. The core sits just above frame centre, behind the figure's head and shoulders: `#e9b991` hot core, `#d8a07b` inner ring, `#c48970` mid, `#ad6e5a` / `#9c624b` outer ring, `#82413a` toward the edges, `#502b22` at the frame edge, `#2e1415` in the top corners. The lower frame stays mid-red (`#a46752` / `#944f40`), never black.
2. **Light shafts.** Two or three faint, wide diagonal streaks fan out of the glow core (lighter peach `#e3bd91` at 10-18% opacity). They read as rubbed pastel, not as hard rays.
3. **Night ground (indigo-violet).** Same radial construction in cool hue: core `#6753aa` / `#5c479a`, mid `#4e3d8c` / `#403172`, outer `#2e2657`, edge `#231c49`, corners `#151230`. The skull frame (f3) shows the darkest end, `#05090c` to `#14192d`.
4. **Vignette.** Heavy and warm in day (edges fall to `#2e1415`, about 55% darkening at the corners), cool in night (`#0c0a24`). The vignette lives in the radial gradient and one extra full-frame radial overlay. No hard edge.

## Swirl-cloud ornament

5. **Cloud banks.** Big masses enter from the top corners and the frame sides and wrap the figure like a collar. Each is a chain of 4-7 overlapping round lobes, darker than the ground: day `#291413` to `#3a1b18` core, `#632d28` / `#7e413a` toward the lit edge. Edges are airbrushed, about 30-60 px of soft falloff at 1080p, plus a darker shadow band just outside the lower edge (`#2e1415`, about 35% opacity).
6. **Spirals.** Tone-on-tone line ornament drawn on top of the clouds and, more sparsely, on the open ground. One stem sweeps along the cloud edge and ends in a curl of 1.25-1.75 turns. Small "C" hooks and double-curl motifs (two curls back to back) fill the gaps. The stroke is a rose tone lighter than the cloud (`#a8524a` on dark cloud, `#c47a62` on open ground), about 7-9 px at 1080p with a round cap. It tapers to a point at the outer tail and stays full at the curl. Density: about one curl per 160-220 px of cloud edge. The spirals never cross each other.

## Grain and surface

7. **Grain.** A fine monochrome speckle over the whole frame, like spray-paint or toothy pastel paper: strongest in the bright glow, about 6-9% contrast. One full-frame `feTurbulence` layer blended over everything, plus a coarser low-frequency mottle (2-4% contrast) that breaks the gradients into soft blotches.
8. **No outlines on background shapes.** Clouds and ground use only tone and soft edges. Hairlines belong to the spirals and the characters.

## Characters

9. **Dark figure (king).** The silhouette fill is near-black with the faintest warmth (`#0b0605`). It is a flat cut-out with no interior shading. All interior form comes from pale cream hairlines `#e5b28c` (the f1 hairlines read `#af9792` after compression), 4-5 px at chest-up 1080p and 2.5-3 px in the wide. Lines are sparse and mostly symmetrical about the figure's centre line: robe lapels as crossing diagonals, one vertical centre seam, long parallel lines for sleeve panels, short arcs for crown bands.
10. **King's face.** The face is part of the silhouette. Only these marks are drawn: the brows as two thick-thin angled strokes meeting in a V over the nose, narrow almond eye slits filled with pale `#e8c39c` and a dark pupil dot, one nose line ending in a small notch, a broad mustache whose ends roll into closed curls, a centre line running down through the beard, and a forehead mark (here a Vaishnava tilak: an arc plus a vertical stroke). The head is a tall column, longer than wide, that flows into hair and shoulders without a visible neck.
11. **Pale-faced woman (f2 idiom).** The face is a long, narrow shield with a pointed chin, filled `#fbf7f8` and shaded to lavender `#e2d2dc` near the jaw and hair. Features are minimal: thin arched brows set high, large round eyes with a fine upper-lid line, a mauve-grey iris ring `#9b7f93`, a dark pupil `#27292d` and one white catch-light. The nose is a single long line from the brow that hooks at the tip. The mouth is a tiny mauve lip pair `#71697c`. A soft pink-lavender blush band crosses the cheeks and nose bridge.
12. **Hair.** Dark violet `#40304b` with lighter strand hairlines `#665376`. It frames the face in two curtains and covers the forehead edges.
13. **Face glow.** A pale face against a dark ground gets a broad, soft radial bloom (same hue as the face, 20-35% opacity, radius about 1.6x the face height). This is the main focal light in night scenes.

## Shape language and composition

14. **Shapes.** Tall, vertical, symmetrical figures. Wide square shoulders, a narrow tall head. Curves on clouds and spirals, straight lines on robes. Hands are simple mitten shapes with a few hairlines.
15. **Accent.** Exactly one saturated accent per frame: the arrow red `#d9041e`, thin shaft with a diamond head and a diamond fletching, crossing on a 35-40 degree diagonal from the upper left. In night scenes the accent role goes to the white blossoms.
16. **Framing.** Owner-pick framing: the figure is centred and cut at the chest. The crown sits at about 18% from the top. Cloud banks fill the top corners down to about 45% of the height. The bright glow sits between the cloud banks, behind the head.
17. **Indian ornament in the idiom.** Lotus petals as crown bands and blossoms, keri (paisley) curls folded into the swirl vocabulary, temple-border steps as robe hems. All of it is drawn in the same cream hairline, never filled or gilded.
18. **Water.** The river is not painted water. It is a darker band of the ground colour carrying the same spiral vocabulary laid sideways as waves (curl crests), with a few pale horizontal glints.
