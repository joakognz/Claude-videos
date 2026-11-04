"""QA of the rendered reel «La gota que no cae».

Generic checks: format (1080x1920 @ 30 fps), duration, loudness (-14 LUFS, true peak <= -1 dBTP), contact sheets
(one frame every 0.5 s).

Mandatory checks from the brief:
 (a) frames 195-209 identical except the REC dot; the frozen image does not change until its next planned effect
     (the cota on «No va a caer»), and once the cota is drawn it holds until «existe»
 (f) the countdown is fluid: -1 per frame down to 001 on frame 195
 (b) the voice's first phoneme is on frame 210 (7.000 s): cross-correlation of the mix with the raw take
 (c) the countdown rises in intensity before frame 195 (RMS per second of the stem and of the mix)
 (g) the "completed" tiiick lands on the freeze (3 kHz band jumps at 6.50 s)
 (h) no impact sound before «mirarla»: no impact in the event list, and the low band is quiet between the freeze and the voice
 (d) nothing informative outside 250-1580 px (layout boxes + bright pixels in the strips once the 3D is gone)
 (e) the wireframe appears on «existe» and not before

Run: python scripts/qa.py out/reel-gota-que-no-cae.mp4 out/qa
Exit code 1 if any mandatory check fails.
"""
import json, os, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfiltfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
video, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
TL = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
G = json.load(open(os.path.join(ROOT, "src", "timeline-gota.json")))
EV = TL["ev"]
FPS = 30
results = {}


def ok(name, cond, msg):
    results[name] = bool(cond)
    print(f"[{'PASS' if cond else 'FAIL'}] {name}: {msg}")


info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", video],
                                 capture_output=True, text=True, check=True).stdout)
v = next(s for s in info["streams"] if s["codec_type"] == "video")
a = next(s for s in info["streams"] if s["codec_type"] == "audio")
dur = float(v["duration"])
ok("format", v["width"] == 1080 and v["height"] == 1920 and v["r_frame_rate"] == "30/1" and v["codec_name"] == "h264" and a["codec_name"] == "aac",
   f"{v['width']}x{v['height']} {v['r_frame_rate']} {v['codec_name']} {v.get('pix_fmt')} · audio {a['codec_name']} {a['sample_rate']} Hz {a['channels']} ch")
ok("duration", abs(dur - TL["durationInFrames"] / FPS) < 0.1 and 40 <= dur <= 90, f"{dur:.2f} s (timeline {TL['durationInFrames'] / FPS:.2f} s)")

r = subprocess.run(["ffmpeg", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
summ = r[r.rfind("Summary:"):]
I = float([l for l in summ.splitlines() if l.strip().startswith("I:")][0].split()[1])
peak = float([l for l in summ.splitlines() if l.strip().startswith("Peak:")][0].split()[1])
ok("loudness", abs(I + 14) <= 0.5 and peak <= -1.0, f"integrated {I} LUFS · true peak {peak} dBTP (after AAC)")

W, H = 270, 480
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H}", "-pix_fmt", "gray", "-f", "rawvideo", "-"],
                     capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
n = len(fr)


def frame_rgb(i):
    b = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"select=eq(n\\,{i})", "-vsync", "vfr", "-frames:v", "1",
                        "-pix_fmt", "rgb24", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(b, np.uint8).reshape(1920, 1080, 3).astype(np.int16)


def changed(i, ref, rows=1130, cols=1080):
    d = np.abs(frame_rgb(i) - ref).max(axis=2)[:rows, :cols]
    d[240:310, 80:130] = 0  # REC dot
    return float((d > 12).mean())


# (a) the freeze: 195..209 identical except the REC dot (whole frame)
ref = frame_rgb(G["freeze"])
worst = 0.0
for i in range(G["freeze"] + 1, G["voice"]):
    worst = max(worst, changed(i, ref, 1920))
ok("a_freeze", worst < 0.0005, f"max share of changed pixels (outside REC) over frames {G['freeze']}-{G['voice'] - 1}: {worst:.5f}")
# with the voice: the frozen image holds above the captions until the cota (its next planned effect); once the cota and its
# label are drawn, that image holds until «existe»
f_cota = int(np.floor(EV["cota"] * FPS))
f_lab = int(np.ceil((EV["cotaLabel"] + 0.3) * FPS))
f_no = int(np.floor(EV["noExiste"] * FPS + 0.5))
w1 = max(changed(i, ref) for i in list(range(G["voice"], f_cota, 5)) + [f_cota - 1])
ref2 = frame_rgb(f_lab)
w2 = max(changed(i, ref2) for i in list(range(f_lab + 1, f_no - 4, 6)) + [f_no - 4])
ok("a_freeze_holds", w1 < 0.0005 and w2 < 0.0005,
   f"frames {G['voice']}-{f_cota - 1} vs 195 above the captions: {w1:.5f} changed · cota held {f_lab}-{f_no - 4}: {w2:.5f} changed")

# (f) fluid countdown
cnt = G["counter"]
steps = [cnt[i] - cnt[i - 1] for i in range(1, G["freeze"] + 1)]
ok("f_counter_fluid", all(x == -1 for x in steps) and cnt[G["freeze"]] == 1 and all(c == 1 for c in cnt[G["freeze"]:G["voice"]]),
   f"{cnt[0]} → {cnt[G['freeze']]:03d} in {G['freeze']} frames, step always -1 · brake from frame {G['brake']}, "
   f"drop bottom {G['dropBottom'] * 1000:.3f} mm above the water ({G['underFreeze'] * 1e6:+.1f} µm ring height under it)")

# (b) voice placement
SR = 16000


def pcm(path, ss=None, t=None):
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", str(ss)] if ss is not None else []) + ["-i", path] + (["-t", str(t)] if t else []) + \
          ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)


bpf = butter(4, [300, 3000], btype="band", fs=SR, output="sos")
tp_ = os.path.join(ROOT, "..", "audio", "raw", "gota-que-no-cae")
tp_ = os.path.join(tp_, next(f for f in sorted(os.listdir(tp_)) if f.endswith(".mp3")))
take = sosfiltfilt(bpf, pcm(tp_, 0, 2.5))
mix = sosfiltfilt(bpf, pcm(video, 6.0, 4.0))
cc = np.correlate(mix, take, mode="valid")
lag = 6.0 + int(np.argmax(cc)) / SR
voice_start = lag + TL["onset"]
ok("b_voice_at_210", abs(voice_start - 7.0) <= 1 / FPS / 2,
   f"MP3 found at {lag:.3f} s in the mix · first phoneme (MP3 +{TL['onset']:.3f} s) at {voice_start:.3f} s = frame {voice_start * FPS:.2f}")

# (c) the countdown rises before 195
stem = np.load(os.path.join(ROOT, "data", "countdown_stem.npy")).astype(np.float64)
ssr = 48000
rms_stem = [20 * np.log10(np.sqrt(np.mean(stem[k * ssr:(k + 1) * ssr] ** 2)) + 1e-12) for k in range(6)]
rms_stem.append(20 * np.log10(np.sqrt(np.mean(stem[int(6.0 * ssr):int(6.45 * ssr)] ** 2)) + 1e-12))
full = pcm(video, 0, 7.0)
rms_mix = [20 * np.log10(np.sqrt(np.mean(full[k * SR:(k + 1) * SR] ** 2)) + 1e-12) for k in range(7)]
rising = all(rms_stem[k + 1] >= rms_stem[k] - 1.5 for k in range(6)) and max(rms_stem[4:]) - rms_stem[0] >= 6 and max(rms_mix[4:6]) - rms_mix[1] >= 3
ok("c_countdown_rises", rising, "countdown stem RMS 0-1…5-6 s + 6.0-6.45 s: " + " ".join(f"{x:.1f}" for x in rms_stem) + " dB · mix RMS/s " +
   " ".join(f"{x:.1f}" for x in rms_mix) + " dB (6-7 s = the freeze)")

# (g) the tiiick on the freeze
hb = butter(4, [2800, 3500], btype="band", fs=SR, output="sos")
band = sosfiltfilt(hb, full)
e_pre = np.sqrt(np.mean(band[int(6.30 * SR):int(6.48 * SR)] ** 2)) + 1e-12
e_on = np.sqrt(np.mean(band[int(6.50 * SR):int(6.62 * SR)] ** 2)) + 1e-12
k_on = int(6.40 * SR) + int(np.argmax(np.abs(band[int(6.40 * SR):int(6.70 * SR)])))
ok("g_tiiick_on_freeze", 20 * np.log10(e_on / e_pre) >= 10 and abs(k_on / SR - 6.5) < 0.04,
   f"3 kHz band +{20 * np.log10(e_on / e_pre):.1f} dB at 6.50 s (peak at {k_on / SR:.3f} s, freeze at {G['freeze'] / FPS:.3f} s)")

# (h) no impact before «mirarla»
impacts = [s for s in TL["sfx"] if s["type"] in ("plink", "drip", "clamp") and s["t"] < EV["resume"]]
lb = butter(4, [100, 700], btype="band", fs=SR, output="sos")
low = sosfiltfilt(lb, pcm(video, 6.0, 1.0))
lo_db = 20 * np.log10(np.sqrt(np.mean(low[int(0.53 * SR):int(0.97 * SR)] ** 2)) + 1e-12)
pre_db = 20 * np.log10(np.sqrt(np.mean(low[int(0.0 * SR):int(0.45 * SR)] ** 2)) + 1e-12)
ok("h_no_impact", not impacts and lo_db < pre_db - 15,
   f"impact-type events before «mirarla» ({EV['resume']:.2f} s): {len(impacts)} · 100-700 Hz band {pre_db:.1f} dB before the freeze → {lo_db:.1f} dB after it")

# (d) safe zones
layout = {"HUD row": (260, 300), "counter": (1290, 1290 + 36 + 180), "captions": (1250, 1250 + 60 + 2 * 96), "cota label": (640, 770),
          "struck tags": (300, 1200), "call-outs": (360, 1000), "pipe labels": (366, 480), "tank": (880, 1180), "lost counter": (1205, 1245),
          "CTA field": (800, 928), "CTA sub-line": (1430, 1470), "logo": (640, 1000), "handle": (1080, 1160)}
bad = {k: vv for k, vv in layout.items() if vv[0] < 250 or vv[1] > 1580}
top, bot = int(250 / 4), int(1580 / 4)
f_sweep_end = int((EV["sweep"] + 0.5) * FPS) + 1
f_cta = int(np.floor(TL["scenes"]["S7"] * FPS + 0.5))
glitch = set(range(f_cta, f_cta + 5))
txt = [i for i in range(f_sweep_end, n) if i not in glitch and ((fr[i][:top] > 200).mean() > 0.001 or (fr[i][bot:] > 200).mean() > 0.001)]
ok("d_safe_zones", not bad and not txt, f"layout boxes outside 250-1580 px: {bad or 'none'} · bright pixels in the strips after the 3D: "
   f"{len(txt)} frames {txt[:8]}")

# (e) wireframe on «existe», not before: the left half (no captions, no cota) is the frozen frame until the word
before = [changed(i, ref, 1130, 520) for i in (f_no - 30, f_no - 10, f_no - 1)]
after = [changed(i, ref, 1130, 520) for i in (f_no + 8, f_no + 20)]
ok("e_wire_on_existe", max(before) < 0.0005 and min(after) > 0.02,
   f"«existe» at {EV['noExiste']:.3f} s = frame {f_no} · changed vs the freeze: before {max(before):.5f} · after {min(after):.3f}")

# contact sheets: one frame every 0.5 s, 8 per row
times = np.arange(0, n / FPS, 0.5)
for k in range(0, len(times), 24):
    chunk = times[k:k + 24]
    sel = "+".join(f"eq(n\\,{int(t * FPS)})" for t in chunk)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf",
                    f"select='{sel}',scale=270:480,drawtext=text='%{{pts\\:hms}}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,tile=8x3",
                    "-vsync", "vfr", "-frames:v", "1", os.path.join(out, f"sheet_{k // 24:02d}.jpg")], check=True)
print("sheets in", out)
json.dump(results, open(os.path.join(out, "qa.json"), "w"), indent=1)
sys.exit(0 if all(results.values()) else 1)
