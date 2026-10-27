"""Timed prototype of narrate.py synthesize(): same takes and QA rules, configurable stages.

    narrate_fast.py <story-id> <out-dir> [--asr cpu|cuda] [--retry on|off] [--empty-cache on|off] [--beats N]
Reads the studio read-only; writes takes, qa.json and timings.json to <out-dir>.
"""
import argparse, fcntl, json, os, shutil, sys, time
from collections import defaultdict
import soundfile as sf

STUDIO = os.path.expanduser("~/projects/hindi folklore/studio")
sys.path.insert(0, os.path.join(STUDIO, "tools"))
import narrate as N  # noqa: E402
import narration_rules as rules  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("story"); ap.add_argument("out")
ap.add_argument("--asr", default="cuda"); ap.add_argument("--retry", default="off")
ap.add_argument("--empty-cache", default="off"); ap.add_argument("--beats", type=int, default=0)
args = ap.parse_args()

story = json.load(open(os.path.join(STUDIO, "src", "stories", args.story, "story.json"), encoding="utf-8"))
items = N.plan(story, os.path.join(args.out, "nowork"))  # no approved takes: voice every beat
if args.beats:
    items = items[:args.beats]
raw = os.path.join(args.out, "raw"); os.makedirs(raw, exist_ok=True)
T = defaultdict(float)
wall0 = time.time()

import torch
from transformers import pipeline
from voxcpm import VoxCPM

with open(N.GPU_LOCK, "w") as lock:
    t = time.time(); fcntl.flock(lock, fcntl.LOCK_EX); T["wait_lock"] = time.time() - t
    t0 = time.time()
    t = time.time(); model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False); T["load_tts"] = time.time() - t
    t = time.time()
    asr = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3-turbo", device=args.asr,
                   dtype=torch.float16 if args.asr == "cuda" else torch.float32)
    T["load_asr"] = time.time() - t
    sr = model.tts_model.sample_rate
    qa, takes, audio_s = {}, 0, 0.0
    for it in items:
        b, best = it["beat"], None
        base = N.baseline(it["voice"])
        for k in range(N.TAKES):
            torch.manual_seed(N.SEED + k)
            ctx = it["context"]
            prompt = {"prompt_wav_path": os.path.join(raw, ctx["key"] + ".wav"), "prompt_text": ctx["beat"]["text"]} if ctx else {}
            torch.cuda.synchronize(); t = time.time()
            wav = model.generate(text=f"({it['direction']}){b['text']}", reference_wav_path=it["voice"]["ref_path"],
                                 cfg_value=2.0, inference_timesteps=10, retry_badcase=args.retry == "on", **prompt)
            torch.cuda.synchronize(); T["generate"] += time.time() - t
            takes += 1; audio_s += len(wav) / sr
            take = os.path.join(raw, f"{it['key']}.take{k}.wav")
            sf.write(take, wav, sr); del wav
            if args.empty_cache == "on":
                t = time.time(); torch.cuda.empty_cache(); T["empty_cache"] += time.time() - t
            t = time.time(); m = rules.measure(take, b["text"]); T["measure_pyin"] += time.time() - t
            t = time.time(); heard = asr(N.librosa_16k(take), generate_kwargs={"language": "hi"})["text"]; T["asr"] += time.time() - t
            m["mismatch"] = rules.mismatch(b["text"], heard)
            problems, bad = rules.judge(m, base, it["dialogue"])
            print(f"  {b['id']} take {k + 1}: {'ok' if not problems else ', '.join(problems)}", flush=True)
            if best is None or bad < best[1]:
                best = (take, bad, k, m, problems)
            if not problems:
                break
        take, _, k, m, problems = best
        shutil.copy(take, os.path.join(raw, it["key"] + ".wav"))
        qa[b["id"]] = {"status": "ok" if not problems else "flagged", "take": k + 1, "problems": problems,
                       "metrics": {x: round(v, 3) for x, v in m.items()}}
    T["gpu_section"] = time.time() - t0
    peak = torch.cuda.max_memory_allocated() / 1e9

final_s = sum(sf.info(os.path.join(raw, it["key"] + ".wav")).duration for it in items)
T["wall_total_minus_lock"] = time.time() - wall0 - T["wait_lock"]
res = {"config": vars(args), "beats": len(items), "takes": takes, "flagged": sum(v["status"] == "flagged" for v in qa.values()),
       "audio_generated_s": round(audio_s, 1), "final_audio_s": round(final_s, 1), "peak_vram_gb": round(peak, 2),
       "seconds": {k: round(v, 1) for k, v in T.items()},
       "rtf_wall_vs_final_audio": round(T["gpu_section"] / final_s, 3)}
json.dump(qa, open(os.path.join(args.out, "qa.json"), "w"), ensure_ascii=False, indent=1)
json.dump(res, open(os.path.join(args.out, "timings.json"), "w"), indent=1)
print(json.dumps(res, indent=1))
