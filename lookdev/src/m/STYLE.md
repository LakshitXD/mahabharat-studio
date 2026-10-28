# Merged look ("m"): style spec

The final look for the Mahabharat series, merged from the three bakeoff variants against `ref/owner-pick.png` (the owner's chosen frame), `ref/dragonbee-f1.jpg` and `ref/dragonbee-f2.jpg`. Pixel sizes are at 1920x1080.

## Atmosphere (from variant B)

1. **Day ground (sepia-red).** A radial glow, never a flat fill, hottest just behind the subject's head: `#efc298` core, through `#e2ab84`, `#cc8f71`, `#b1725b` to `#a06350`, corners `#7a3c33`. The lower frame stays mid-red.
2. **Evening ground.** The same construction one step toward magenta: `#e8a97c` core to `#67383e`, corners `#3e2030`. Clouds `#6b3340` / `#241018`, swirls `#9a4a52`.
3. **Night ground (indigo-violet).** Core `#8070c8` to `#3a2e6e`, corners `#2a2258`. Clouds `#3c2f78` / `#1f1848`.
4. **Light shafts.** Two or three wide faint streaks fanning out of the glow core at 12-30% opacity. They read as rubbed pastel, not rays.
5. **Cloud banks.** Chains of 3-6 round lobes in the top corners, each lobe masked by its own radial alpha so the edge is airbrushed (about 8% of the radius), with a darker shadow band offset below. One swirl per 160-220 px of edge: an Archimedean curl of 1.3-1.6 turns with a tapered tail, tone-on-tone (`#a8524a` on day cloud, `#c98066` on open ground). Swirls never cross.
6. **Vignette.** A radial darkening to `#2a1012` (day) or `#0c0a24` (night), 30-50% at the corners.
7. **Grain.** One full-frame fine `feTurbulence` speckle (base frequency 0.95) blended overlay at 24-26%, plus a low-frequency mottle at soft-light 20%. The seed is fixed for the whole clip: per-frame grain costs 20x in file size at delivery bitrates.
8. **River and shore.** The river is a darker band of the ground colour carrying the swirl vocabulary laid sideways as wave crests, with a few pale horizontal glints. The far shore is tone-on-tone shikhara silhouettes at 75% opacity. The near bank is the darkest ground tone.

## Line

9. **One hairline.** Cream `#e9bb8f` on the dark figure, violet-grey `#4a3d5a` on the pale one. The stroke width is pinned on screen (`vector-effect: non-scaling-stroke`): 3.6 px at any player scale, 5 px in chest-up framing (`variant: "close"`). Round caps and joins. No tapering.
10. **Lines sit inside the silhouette.** The silhouette edge is cut, never outlined. Every line is a plane edge, a fold or an ornament. None shades.

## King Shantanu (head from A, body new)

11. **Head rows** (figure units, crown peak at 0): brim 112, brows 168, eyes 190, nose foot 266, mustache curls 322, beard tip 404, neck junction 384. Crown: a low three-peaked tiara with a brim past the face, a lozenge jewel and ear pendants. Face: temple-cheek planes as one long stroke each side, a single nose line with a nostril curve, wedge brows filled cream, lit almond eye slits (`#ecc8a0`) with a small dark pupil, a mustache ending in two spiral curls, a pointed beard with a centre line.
12. **Mouth.** Closed, one hairline under the mustache. Open (speech or expression), a lit cream shape around a dark cavity with a cream teeth band, the mustache ends lifting and the beard line parting under it. This is the one addition to the reference head, so that lip-sync reads at phone size.
13. **Full figure.** 2750 units tall (1000 px at scale 1), head-to-height 1:6.2. Shoulder span 844 units (4.2 head widths), sloping from the neck at row 378 to dome tips at 580. Waist 600 wide at 1300, robe flaring to 700 at the hem (2672). Feet are two dark lozenges under the hem. Arms hang from (±292, 560): upper sleeve 480, forearm sleeve 420 widening to a 220 cuff with two cuff lines, a drape lobe hanging from the forearm when it is raised. Hands are ink shapes with two or three cream finger lines: rest, open, palm-up, fist, point, chin.
14. **Line work on the body.** Shoulder contour inset, two nested V collars meeting at the chest and continuing as an X, vest edges from the shoulder tips to the belt, a centre seam from beard tip to hem, two belt curves, two robe panel lines, a double hem line, one inner sleeve line per arm. About 24 strokes chest-up.

## Ganga (head and hair from A, dress from B, face from A with C's rig)

15. **Head rows** (hood top at 0): face oval 88-460, half-width 102; brows 214, eyes 258, nose foot 330, mouth 378. Face `#eee9ed` with a 2.6 px contour. Eyes: large almonds with a heavy upper lid, iris `#8f86c0`, dark pupil, one highlight. Brows thin single arcs. Nose an L. Mouth a small lozenge, `#aaa4c4` closed, dark `#4a3046` with a pale teeth band open. Blush: two soft discs plus a faint band.
16. **Hair.** A dark hood `#2a2238` frames the face and flows down past the shoulders into the body as four tapering falls (two per side) drawn over the dress to 1690 units, with strand lines `#5c4c67`. The hair is never a cap that stops at the shoulders.
17. **Dress and veil.** B's indigo `#26245f` dress with a deep neckline, nine pale dots, two swirl clasps, a lotus medallion, two water-fold lines that sway, pale feet under the hem. A translucent `#6f86e0` veil streams behind from the crown to the hem. A small moon-silver mukuta sits on the hood edge. A faint face bloom (radius about 1.6 face heights) is the focal light at night.
18. **Full figure.** 2900 units tall (940 px), head-to-height 1:6.3, shoulders 470 wide, waist 436, hem 784. Sleeves are narrow dress sleeves in robe colour with a flared cuff; hands are pale and slender.

## Acting

19. **Faces.** One `FaceRig` of 15 numbers drives both heads: brow lift, tilt and asymmetry, lid opening and lower-lid squint, pupil size, gaze, mouth curve, width, opening, roundness, skew, teeth and blush. Nine expressions (neutral, smile, grin, sad, surprised, angry, thinking, fear, determined), five visemes (MBP, AI, E, O, FV) blended over the expression by the speech envelope, blink closing the lids. Features never gain extra lines to emote.
20. **Bodies.** Seven poses per character in a table (`stand`, `walk`, `talk`, `point`, `offer`, `bow`, `think`), each a torso lean, a turn, a head tilt and nod, and two arms (forward swing, elbow bend, wrist, hand kind). `offer` and `point` are 3/4 stances toward +x with the lead arm out. `bow` is a lean with a hand on the heart. `think` brings the trail hand to the beard or chin.
21. **Walk.** One cycle is two steps. Each foot is planted for half the cycle and slides back under the body, then swings forward lifted, so the planted foot does not skate when the player moves the actor by `travelPerCycle` (4 half-steps: 680 king units, 480 Ganga units, per cycle). The body bobs twice per cycle, the hem swings with the lead foot, the centre seam bends toward it, the arms counter-swing.
22. **Idle.** A slow breath on the lean and nod and a slower head drift come from the beat frame. In `talk` the raised hand pulses with the mouth envelope.

## Composition

23. Close-up: eyes at 27% of the height, crown top near 8-11%, the figure cut at the chest by the frame edge, the glow between the cloud banks behind the head. One accent per frame: the red arrow `#d9041e` crossing on a diagonal from upper left through the fist. At night the accent role goes to the lotus blossoms.
24. Wide: horizon at 60%, figures 56-60% of the frame height, feet at 88%, the king on the dark near bank, Ganga in the water.
