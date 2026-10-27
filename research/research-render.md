# Katha render speed for Mahabharat (target ≥45-60 fps at 4K)

Date 2026-10-28. Labels: **[M n]** measured with n runs; **[C]** cited (URL); **[E]** estimate.

## 0. GPU probes skipped
The GPU was busy, so I did not run any GPU measurements. `tools/render-fast.sh short-tenali-how-many-crows-cut` (pids 88774/88802, Electron 89316, ffmpeg 90061) held `tts-lab/gpu.lock`. It had been at **1522/1765 frames for more than an hour** at about 5% GPU utilisation, so it looks hung. Its log is `studio/work-crows-short.log`. All measurements below ran on the CPU only. Probe files are in `prototypes/render-probes/`.

## 1. What a frame is
- A frame is one `<svg>` (Stage.tsx) at 1920x1080 CSS size, painted at device scale 2 for 4K. It holds the environment back layer, props, actors, the environment front layer, and an optional "lights" layer. The lights layer sits under a **mask that redraws every actor and prop a second time as a silhouette through a filter**, over a 3W x 3H mask region. On top of everything is a **full-frame `feTurbulence` paper grain with `mix-blend-mode: multiply`** plus a vignette.
- Element counts from React SSR, one unique (env, mood, actor count) per row, 31 shots across 3 episodes **[M 1]**:
  - 4.2k-11.3k elements per frame and 1.0-1.8 MB of SVG markup.
  - 63-428 Gaussian-blur filter references and 167-583 clip-paths.
  - 1-6 masks and 7-14 `mix-blend-mode` (soft-light wash) layers. Most of the washes are full-frame.
- The environment alone is 1.9k (diwan) to 6.3k (charbagh) elements, with 2 filters. **Each puppet adds about 900-1,600 elements, about 47-59 blur filters and 58-90 clips** **[M 1]**. Every `Painted` part carries a clipped `feGaussianBlur` shading group.
- An army of 50 soldiers on the current path would mean about 2,500 blur passes per frame. That does not scale.
- Re-raster: the whole scene is one SVG paint layer, so any change repaints all of it. Pushing in and holding the camera cost almost the same: 1065 ms vs 965 ms per changed frame on SwiftShader **[M 1 run, median of 4 frames]**. The background, washes and paper grain are re-rasterized every frame even though they are static within a shot.
- Where the time goes. CPU SwiftShader probe at 3840x2160, darbar shot with 8 actors, timing a changed frame **[M 1 run, median of 4]** (`probe-swiftshader.txt`):

  | Variant | ms per changed frame |
  |---|---|
  | full frame | 1065 |
  | environment only (no actors) | 705 (about 66% of full) |
  | no blend modes | 656 (-38%) |
  | no paper grain | 927 (-13%) |
  | no puppet blur | 952 (-11%) |

  GPU proportions will differ, but the conclusion holds: **static environment, blend and overlay work is about two thirds of every frame.**
- Animation is not periodic. Idle oscillators use periods of 96, 110, 120 and 170 frames, plus blink. The mouth is continuous and the walk stride is 28 frames. A cache of exact frames would rarely hit unless the idle periods are moved onto a common loop.
- Encoder side. Converting BGRA to yuv420p at 4K with CPU swscale runs at 130 fps on 1 thread, 452 fps on 4 and 624 fps with auto threads **[M 1 each, 300 frames]**. It is not the bottleneck.
- NVENC H.264 on Ada: 278 fps at 1080p with the P5 preset **[C https://docs.nvidia.com/video-technologies/video-codec-sdk/12.1/nvenc-application-note/index.html]**. That suggests **about 60-70 fps per engine at 4K P5, and lower at P6** (the current setting) **[E]**. At 60 fps the encoder becomes a real limit. Use P3-P4 at a high bitrate, since YouTube re-encodes anyway, and keep 2-3 parallel sessions.

## 2. Options

### a. Layer caching / puppet atlas
Throughput **[E]**:
- Composite about 40 layers of 4K BGRA in WebGL: roughly 330 Mpx of fill, about 2-3 ms per frame.
- OSR readback and IPC: 5-10 ms.
- NVENC: about 15 ms.
- Total: about 60 fps aggregate across 2 processes, as long as actor re-raster is amortized.

Variants:
- **Full Spine/Live2D-style re-rig:** limbs are skinned along continuous IK chains (`body.tsx` stations, `fitKnots`), not rigid parts. A true bone atlas would need mesh deformation and a re-authoring of every puppet. Cost: weeks.
- **"Blink-raster, GPU-composite" hybrid:** keep the React SVG as the raster source and cache its outputs.
  - Per shot, rasterize these once: the environment back, front and lights layers (at max zoom x scale 2) and the paper/vignette.
  - Per actor, rasterize a sprite keyed by (char, variant, pose, expr, facing, mouth level 0-4, idle phase of 48 on a common 96-frame loop, walk phase of 28). Optionally split the head sprite out so the mouth and blink don't multiply the body states.
  - Composite in a WebGL2 canvas inside the same Electron page, with camera affine, multiply and soft-light shaders, and an actor-alpha mask for the lights.
  - Draw armies as instanced shared sprites. Draw arrows, astras, particles and fire as native shaders.
  - Cost: about 1-2 weeks **[E]**. The art code stays the same, apart from moving idle periods onto a common loop.

### b. Render lower and upscale
Measured on a 20 s, 600-frame 4K episode clip, downscaled with area filtering and then upscaled with lanczos **[M 1 each]**:

| Source | SSIM Y vs 4K | PSNR Y | CPU lanczos upscale incl. decode |
|---|---|---|---|
| 1440p | 0.980 | 33.6 dB | 498 fps |
| 1080p | 0.971 | 32.6 dB | 677 fps |

- Visually, the 1440p upscale is hard to tell from 4K (`crop-compare.png`). The 1080p upscale has slightly softer lines, and much of the "4K detail" is paper grain.
- Pixel cost at 1440p is 0.44x of 4K. Upscaling is cheap, but the 4K re-encode is not (it is NVENC-bound).
- Is 4K needed? A 4K upload gets YouTube's VP9/AV1 rungs, and the 1080p VP9 rung beats the 1080p H.264 you get from a 1080p upload (SSIM 86.9 vs 84.2) **[C https://forum.blackmagicdesign.com/viewtopic.php?p=471785, https://www.provideocoalition.com/uploading-to-youtube-is-4k-worth-it/]**. So **upload 4K, but it does not have to be rasterized natively at 4K.**
- RTX Video Super Resolution is a playback feature, not an ffmpeg filter. Real-ESRGAN-anime costs tens to hundreds of ms per 4K frame **[E]**, so it is not needed for vector art.

### c. Other engines (all [E], no GPU runs)
- Motion Canvas / Revideo: Canvas2D, no SVG filters or clip richness, and a full puppet rewrite.
- Rive: GPU vector renderer with feathering. It is fast, but puppets are authored in its editor, which breaks the code-generated pipeline.
- Godot Movie Maker: fast 2D compositing, but the built-in writers are PNG/MJPEG, so it would need a custom raw-pipe writer, and the art would need porting.
- Blender Grease Pencil / EEVEE: roughly 0.2-1 s per 4K frame, too slow.
- Spine: raster meshes, re-authoring and a licence.

None keeps the art for free. The hybrid in option (a) gets their main benefit, a GPU compositor, without porting.

### d. Remotion / Blink levers (stepping stones, [E])
- Move the pre-rasterized environment PNG into its own `<img>`/layer with `will-change: transform`.
- Put actors in a separate `<svg>` layer.
- Turn the paper grain into a static PNG with compositor `mix-blend-mode`.

These alone remove about two thirds of the per-frame raster, for about 2-3x, i.e. about 20-27 fps at 4K. More `--concurrency` does not help, because the GPU saturates at 3-4 processes (prior finding). Also consider putting actors "on twos" (12-15 fps poses) while the camera stays at 30.

### e. Generative video
- Wan 2.2 TI2V-5B: about 9 min per 5 s 720p clip on a **4090** **[C https://the-decoder.com/alibaba-launches-wan2-2-its-improved-open-source-video-generation-model/]**. 15 min of video would take about 27 GPU-hours on a 4090, and more on a 12 GB 4070S.
- LTX-Video 2B: about 4 s per 5 s at 768x512 on a 4090 **[C, unverified rental-guide claim, https://docs.clore.ai/guides/video-generation/ltx-video]**. That is low resolution, has no character or style consistency across 180+ clips, and needs upscaling.

**Infeasible for this target.**

## 3. Recommendation
Build the **Blink-raster, GPU-composite** renderer in fastrender (Electron + Vulkan, 2-3 processes). Feed **4K BGRA to h264_nvenc at P3/P4** (or HEVC), and rasterize actor sprites at scale 1.5-2.

Frame budget per output frame at 60 fps aggregate, with 2 processes at about 33 ms each **[E]**:

| Step | Cost |
|---|---|
| WebGL composite | 3 ms |
| Sprite cache misses, amortized (10-20% of actor-frames x about 30 ms each) | 5-10 ms |
| OSR readback + IPC + pipe | 8 ms |
| swscale | 4 ms (multi-thread, or let NVENC take BGRA) |
| NVENC | about 15 ms, shared over 2 sessions |

Add a one-time per-shot pre-raster of about 0.3-0.5 s x about 150 shots, i.e. 1-2 min per episode.

Result: **27,000 frames in about 8-10 min.**

Validation gates:
1. Measure NVENC 4K fps at P3-P6 first. It may be the real ceiling.
2. Measure the sprite cache hit rate on a real episode.
3. Run `tools/compare-renders.py` against the current renderer on darbar, diwan and bazaar shots.
