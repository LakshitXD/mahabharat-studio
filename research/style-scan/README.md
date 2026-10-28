# Style scan: art forms of animated storytelling channels

Scanned 2026-10-28. This scan looks at how other channels draw narrated story videos, so we can pick a direction for the Mahabharat that differs from our miniature channels.

## Method

- **Searches.** 18 YouTube searches, none of them for the Mahabharat. They covered folk tales, the mythologies of other cultures, history animation, motion comics, Hindi kahani, paper cut-out and ink painting.
- **Selection.** 34 channels picked from the results. For each, the most-viewed matching video was sampled.
- **What was saved.** The thumbnail plus YouTube's auto frames at 25%, 50% and 75% of the video.
- **The board.** The visual board is `board.html`. It is local only and gitignored, because it holds other creators' images. Rebuild it with `research/style-scan/board.py` if needed.
- **Caveat.** View counts are for that one video, not the whole channel.

## Art forms found

| # | Art form | Examples (top video views) | Epic fit | Our pipeline |
|---|---|---|---|---|
| 1 | Elegant stylised 2D: graphic shapes, limited palette, ornament | Dragonbee Animation, "The Wedding Veil of the Proud Princess" (1.5M); TED-Ed, "How Thor got his hammer" (14.1M) | Very high | Vector, so it fits our SVG engine. Fast with flat fills. |
| 2 | Painted motion comic: semi-real ink plus painted light | Pratilipi Films, "Murdo Ki Train" (17.9M, Hindi); The Armchair Historian (2.3M) | High; adult and dramatic | Raster paintings per shot, then parallax and overlays. Very fast render. |
| 3 | Silhouette or paper-cut on textured paper, plus a neon line-art variant | Lukas Rooney, "Lost Sheep" (1.4M); "Ra: the Path of the Sun God" (1.1M) | High for war and divine scenes | Vector, fastest; cheap crowds |
| 4 | Painterly concept art with parallax | See U in History (6.8M); Dreamoria (6.4M) | High grandeur, static characters | Raster; consistency is hard |
| 5 | AI semi-real graphic novel (Hindi) | Kulpreet Singh (2.8M); AniDoc (1.6M); ANIFile (0.6M) | Proven reach, generic look | Image generation plus Ken Burns |
| 6 | AI Ghibli-style watercolour | 90s Nostalgia Ghibli (2.1M); Nightsky ghibli (0.7M) | Family and nostalgic | Image generation |
| 7 | 3D Pixar-like | Dreamy Stories (3.9M); Veer Mythos (1.2M); "Brush: A Fox Tale" (9.7M) | Modern, soap-like | 3D or image generation |
| 8 | Anime cel 2D | MSA Myth (7.2M) | Youth appeal | Vector-ish |
| 9 | Comedic explainer characters | Suibhne, History Matters, Extra History, Serious History and others | Wrong tone | Very cheap |
| 10 | Kids' Hindi cartoon | Shemaroo Kids, Gomu Toons, Chinu Meenu | Kids only | Cheap |
| 11 | Presenter, mixed media, whiteboard | Jake Doubleyoo, Xiran Jay Zhao, Draw The Life | Not animation | n/a |

## Shortlist for the Mahabharat

1. **Elegant stylised 2D (form 1).** It is the most distinctive and graceful option, and it fits the vector engine we already have.
2. **Painted motion comic (form 2).** It has the strongest dramatic, adult pull in Hindi. It needs a raster art pipeline with locked character sheets.
3. **Silhouette (form 3).** Use it as the sub-style for battles, astras and divine moments inside either of the above. It makes 18-akshauhini crowds cheap.
