import json,base64,html,sys
P=json.load(open('picked.json'))
F=[
 ("Elegant stylised 2D (graphic shapes, limited palette)","Cartoon-Saloon-like: strong silhouettes, ornamental pattern fills, 2-3 colour palettes per scene, stylised faces. Feels like a myth told by a designer.","Very high. Graceful for gods and queens, dramatic for villains, and pattern work can carry Indian ornament.","Vector, so it fits our SVG engine directly. Fast to render if we keep flat fills.",[18,1]),
 ("Painted motion comic (semi-real, ink + cel light)","Inked semi-realistic characters with painted moody lighting, panel framing, little limb animation: camera moves, blinks, mouth, rain/fire overlays.","High. Adult, dramatic, and proven with Hindi audiences (Pratilipi's horror comic is the top video in this scan).","Raster paintings per shot (hand-painted, or AI-assisted with a locked character sheet), then parallax and overlays. Renders very fast.",[0,13]),
 ("Silhouette / paper-cut on textured paper","Black or single-colour cut-out figures on grainy paper or glowing grounds; one variant uses neon line art.","High for war, divine and night scenes. Cheap crowds: armies and astras read well as shapes.","Vector, very fast. Expression comes from pose and staging, not faces.",[19,21]),
 ("Painterly concept art with parallax","Digital matte paintings, game-cinematic gods, slow pans and zooms; little character animation.","High grandeur, but characters feel static and generic across channels.","Raster stills; character consistency across 100 episodes is the hard part.",[6,7]),
 ("AI semi-real graphic novel (Hindi)","AI-generated semi-realistic stills, cinematic lighting, Ken Burns moves; dominant in current Hindi 'documentary' channels.","Proven reach in Hindi, but looks like everyone else and viewers increasingly call it AI slop.","Image generation per shot plus pan/zoom. Fastest pipeline, weakest identity.",[11,25,32]),
 ("AI Ghibli-style watercolour","Soft painted village scenes, warm light, big-eyed characters.","Warm and nostalgic; reads as family/kids, less epic.","Image generation; consistency issues.",[15,33]),
 ("3D Pixar-like (AI or real)","Glossy 3D characters with soft lighting.","Popular in Hindi kahani channels; feels modern and soap-like rather than mythic.","Needs 3D or image generation; very different pipeline.",[16,26,17]),
 ("Anime cel 2D","Clean anime line, cel shading, glow effects.","Youth appeal; risks feeling like a foreign genre for the epic.","Vector-ish; doable, character design heavy.",[5]),
 ("Comedic explainer characters","Simple round or stick characters, flat backgrounds, meme timing.","Wrong tone for a respectful epic; good only for a humour spin-off.","Very cheap.",[3,10,12,14,20,22,23,24,29,30]),
 ("Kids' Hindi cartoon / storybook","Bright flat cut-out cartoons and puppet-style 2D.","Kids market; the owner's adult framing doesn't fit.","Cheap, vector.",[2,27,28]),
 ("Presenter, mixed media, whiteboard","Live host with overlays, film clips, or hand-drawn whiteboard.","Not an animation style for the series.","",[4,31,9,8]),
]
out=['<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Style scan</title><style>body{font:15px/1.5 system-ui;margin:0 auto;max-width:1100px;padding:16px;background:#faf8f4;color:#222}h2{margin-top:36px}img{width:100%;border-radius:6px;display:block}.v{margin:14px 0}.m{color:#666;font-size:13px}dl{display:grid;grid-template-columns:110px 1fr;gap:4px 12px}dt{font-weight:600}</style>',
 '<h1>Animated storytelling art forms: style scan</h1><p class=m>Scanned 2026-10-28: 18 YouTube searches (folk tales, mythology of other cultures, history, motion comics, Hindi kahani, paper cut-out, ink), 34 channels, each shown as thumbnail + frames at 25/50/75% of their most-viewed matching video. Views are that one video, not the channel. For inspiration only; images are not to be republished.</p>']
for t,look,fit,eng,ids in F:
    out.append(f'<h2>{html.escape(t)}</h2><dl><dt>Look</dt><dd>{html.escape(look)}</dd><dt>Epic fit</dt><dd>{html.escape(fit)}</dd><dt>Our pipeline</dt><dd>{html.escape(eng) or "—"}</dd></dl>')
    for i in ids:
        v=P[i]; b=base64.b64encode(open(f'rows/{i:02d}.jpg','rb').read()).decode()
        out.append(f'<div class=v><img src="data:image/jpeg;base64,{b}"><div class=m><a href="https://www.youtube.com/watch?v={v["id"]}">{html.escape(v["title"])}</a> · {html.escape(v["channel"].strip())} · {v["views"]/1e6:.1f}M views</div></div>')
open(sys.argv[1],'w').write(''.join(out))
