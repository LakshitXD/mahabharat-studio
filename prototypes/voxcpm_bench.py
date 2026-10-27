import fcntl, time, sys, os, soundfile as sf, torch
H = os.path.expanduser("~/projects/hindi folklore")
OUT = os.path.dirname(os.path.abspath(__file__))
REF = f"{H}/studio/voices/baritone/ref.wav"
LINES = [
 "हस्तिनापुर के राजमहल में उस दिन असाधारण सन्नाटा था।",
 "युधिष्ठिर ने धीरे से कहा, धर्म का मार्ग कठिन है, किंतु वही सत्य है।",
 "कुरुक्षेत्र के मैदान में अठारह अक्षौहिणी सेनाएँ आमने-सामने खड़ी थीं, और अर्जुन ने अपना गाण्डीव उठाया।",
 "धृष्टद्युम्न, द्रौपदी का भाई, पांचाल नरेश द्रुपद के यज्ञ की अग्नि से प्रकट हुआ था।",
 "तब श्रीकृष्ण मुस्कुराए, और उन्होंने कहा, हे पार्थ, उठो।",
]
with open(f"{H}/tts-lab/gpu.lock", "w") as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    from voxcpm import VoxCPM
    t = time.time(); m = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False); print(f"load {time.time()-t:.1f}s", flush=True)
    sr = m.tts_model.sample_rate
    for steps in (10, 6):
        tot_a = tot_t = 0
        for i, txt in enumerate([LINES[0]] + LINES):  # first = warmup
            torch.cuda.synchronize(); t = time.time()
            w = m.generate(text=txt, reference_wav_path=REF, cfg_value=2.0, inference_timesteps=steps)
            torch.cuda.synchronize(); dt = time.time() - t; a = len(w) / sr
            if i: tot_a += a; tot_t += dt; sf.write(f"{OUT}/s{steps}_{i}.wav", w, sr)
            print(f"steps={steps} line{i} audio={a:.1f}s gen={dt:.1f}s rtf={dt/a:.2f}", flush=True)
        print(f"== steps={steps} RTF {tot_t/tot_a:.2f} ({tot_a:.0f}s audio)", flush=True)
    print("peak vram GB", torch.cuda.max_memory_allocated()/1e9)
    del m; torch.cuda.empty_cache()
    from transformers import pipeline
    import librosa
    for dev in ("cpu", "cuda"):
        asr = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3-turbo", device=dev, torch_dtype=torch.float16 if dev=="cuda" else torch.float32)
        tt = 0
        for i in range(1, 6):
            x = librosa.load(f"{OUT}/s10_{i}.wav", sr=16000)[0]; t = time.time()
            txt = asr(x, generate_kwargs={"language": "hi"})["text"]; tt += time.time() - t
            if dev == "cuda": print("heard:", txt)
        print(f"whisper {dev}: {tt:.1f}s for 5 lines", flush=True)
        del asr; torch.cuda.empty_cache()
