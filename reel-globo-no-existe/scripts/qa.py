"""QA of the rendered reel «Globo que no existe».

Generic checks: format (1080x1920 @ 30 fps), loudness (-14 LUFS, true peak <= -1 dBTP), stillness
(0.5 s windows without motion), bright pixels in the unsafe strips, contact sheets (one frame every 0.5 s).

Mandatory checks from the brief:
 (a) frames 195-209: nothing changes in the image except the REC dot
 (b) the voice starts exactly at 7.000 s (frame 210) — cross-correlation of the mix against the raw take
 (c) the countdown music really rises before frame 195 (RMS per second of the music stem and of the mix)
 (d) no informative caption in the safe zones (top 250 px, bottom 340 px)
 (e) the wireframe appears on «existe», not before

Run: python scripts/qa.py out/reel-globo-no-existe.mp4 out/qa
Exit code 1 if any mandatory check fails.
"""
import json, os, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfiltfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
video, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
TL = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
G = json.load(open(os.path.join(ROOT, "src", "timeline-globo.json")))
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
ok("format", v["width"] == 1080 and v["height"] == 1920 and v["r_frame_rate"] == "30/1",
   f"{v['width']}x{v['height']} {v['r_frame_rate']} {dur:.2f}s {v['codec_name']} · audio {a['codec_name']} {a['sample_rate']} Hz {a['channels']} ch")
ok("duration", 30 <= dur <= 45, f"{dur:.2f} s (expected {TL['durationInFrames'] / FPS:.2f} s)")

r = subprocess.run(["ffmpeg", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
summ = r[r.rfind("Summary:"):]
I = float([l for l in summ.splitlines() if l.strip().startswith("I:")][0].split()[1])
peak = float([l for l in summ.splitlines() if l.strip().startswith("Peak:")][0].split()[1])
ok("loudness", abs(I + 14) <= 0.5 and peak <= -1.0, f"integrated {I} LUFS · true peak {peak} dBFS")

# ── frames (quarter size, grey) for motion / strips ──
W, H = 270, 480
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H}", "-pix_fmt", "gray", "-f", "rawvideo", "-"],
                     capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
n = len(fr)
diff = np.array([np.mean(np.abs(fr[i] - fr[i - 1])) for i in range(1, n)])
still = [i for i in range(len(diff) - 15) if diff[i:i + 15].max() < 0.15]
f_no0 = int(np.floor(TL["ev"]["noExiste"] * FPS + 0.5))
intended = set(range(G["freeze"] - 15, f_no0))  # the freeze (and sentence 1 over the frozen image) is meant to be still
print(f"       motion: frames {n} · mean {diff.mean():.2f} · still 0.5 s windows {len(still)} "
      f"(outside the intended freeze: {len([s for s in still if s not in intended])})")


def frame_rgb(i):
    b = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"select=eq(n\\,{i})", "-vsync", "vfr", "-frames:v", "1",
                        "-pix_fmt", "rgb24", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(b, np.uint8).reshape(1920, 1080, 3).astype(np.int16)


# (a) freeze: 195..209 identical except the REC dot (left of the HUD row, y≈260-290)
ref = frame_rgb(G["freeze"])
worst = 0.0
for i in range(G["freeze"] + 1, G["voice"]):
    d = np.abs(frame_rgb(i) - ref).max(axis=2)
    d[240:310, 80:130] = 0  # REC dot
    worst = max(worst, float((d > 12).mean()))
ok("a_freeze", worst < 0.0005, f"max share of changed pixels (outside REC dot) over frames {G['freeze']}-{G['voice'] - 1}: {worst:.5f}")
# and the frozen image itself must not change once the voice is in (until «existe»): everything above the captions
f_no_a = int(np.floor(TL["ev"]["noExiste"] * FPS + 0.5))
worst2 = 0.0
for i in list(range(G["voice"], f_no_a, 6)) + [f_no_a - 1]:
    d = np.abs(frame_rgb(i) - ref).max(axis=2)[:1130]  # the caption block (with its soft scrim) starts at 1140
    d[240:310, 80:130] = 0
    worst2 = max(worst2, float((d > 12).mean()))
ok("a_freeze_holds", worst2 < 0.0005, f"frames {G['voice']}-{f_no_a - 1} vs frame {G['freeze']} above the captions: {worst2:.5f} changed")

# (f) countdown fluid: exactly one number per frame down to 001 on the freeze, then held
cnt = G["counter"]
steps = [cnt[i] - cnt[i - 1] for i in range(1, G["freeze"] + 1)]
ok("f_counter_fluid", all(x == -1 for x in steps) and cnt[G["freeze"]] == 1 and all(c == 1 for c in cnt[G["freeze"]:G["voice"]]),
   f"{cnt[0]} → {cnt[G['freeze']]:03d} in {G['freeze']} frames, step always -1 · needle touches at frame {G['touch']} "
   f"({(G['freeze'] - G['touch']) / FPS:.1f} s of contact before the freeze)")

# (b) voice placement: correlate the mix (300-3000 Hz) with the raw take
SR = 16000


def pcm(path, ss=None, t=None):
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", str(ss)] if ss is not None else []) + ["-i", path] + (["-t", str(t)] if t else []) + \
          ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)


bp = butter(4, [300, 3000], btype="band", fs=SR, output="sos")
take_path = os.path.join(ROOT, "..", "audio", "raw", "globo-no-existe")
take_path = os.path.join(take_path, next(f for f in sorted(os.listdir(take_path)) if f.endswith(".mp3")))
take = sosfiltfilt(bp, pcm(take_path, 0, 2.5))
mix = sosfiltfilt(bp, pcm(video, 6.0, 4.0))
cc = np.correlate(mix, take, mode="valid")
lag = 6.0 + int(np.argmax(cc)) / SR
onset = TL["onset"]
voice_start = lag + onset
ok("b_voice_at_210", abs(voice_start - 7.0) <= 1 / FPS / 2,
   f"MP3 found at {lag:.3f} s in the mix · first phoneme (MP3 +{onset:.3f} s) at {voice_start:.3f} s = frame {voice_start * FPS:.2f}")

# (c) countdown music rises before 195
stem = np.load(os.path.join(ROOT, "data", "countdown_music.npy")).astype(np.float64)
ssr = 48000
rms_stem = [20 * np.log10(np.sqrt(np.mean(stem[k * ssr:(k + 1) * ssr] ** 2)) + 1e-12) for k in range(6)]
full = pcm(video, 0, 7.0)
rms_mix = [20 * np.log10(np.sqrt(np.mean(full[k * SR:(k + 1) * SR] ** 2)) + 1e-12) for k in range(7)]
# last half second before the freeze (6.0-6.5 s), where the climax sits
rms_stem.append(20 * np.log10(np.sqrt(np.mean(stem[int(6.0 * ssr):int(6.5 * ssr)] ** 2)) + 1e-12))
rising = all(rms_stem[k + 1] >= rms_stem[k] - 0.5 for k in range(6)) and rms_stem[6] - rms_stem[0] >= 12 and rms_mix[5] - rms_mix[1] >= 6
ok("c_music_rises", rising, "music stem RMS 0-1…5-6 s + 6.0-6.5 s: " + " ".join(f"{x:.1f}" for x in rms_stem) + " dB · mix RMS/s " +
   " ".join(f"{x:.1f}" for x in rms_mix) + " dB (6-7 s = the freeze)")
cut = full[int(6.52 * SR):int(6.98 * SR)]
print(f"       after the cut (6.52-6.98 s): {20 * np.log10(np.sqrt(np.mean(cut ** 2)) + 1e-12):.1f} dBFS RMS")

# (d) safe zones: every caption box is laid out between 250 and 1580 px (layout constants), and no white
# text pixels show up in the strips once the 3D scenes are gone (the needle and the meshes are not text)
layout = {"HUD row": (260, 300), "counter": (1270, 1270 + 40 + 200), "tags": (1100, 1176), "captions": (1250, 1250 + 60 + 100),
          "CTA field": (800, 928), "CTA sub-line": (1430, 1470), "logo": (640, 1000), "handle": (1080, 1160)}
bad = {k: vv for k, vv in layout.items() if vv[0] < 250 or vv[1] > 1580}
top, bot = int(250 / 4), int((1920 - 340) / 4)
f_sweep_end = int((TL["ev"]["sweep"] + 0.5) * FPS) + 1
f_cta = int(np.floor(TL["scenes"]["S7"] * FPS + 0.5))
glitch = set(range(f_cta, f_cta + 5))  # the CTA's block-glitch cut is a transition, not a caption
txt = [i for i in range(f_sweep_end, n) if i not in glitch and ((fr[i][:top] > 200).mean() > 0.001 or (fr[i][bot:] > 200).mean() > 0.001)]
ok("d_safe_zones", not bad and not txt, f"layout boxes outside 250-1580 px: {bad or 'none'} · bright pixels in strips after the 3D: "
   f"{len(txt)} frames {txt[:8]}")

# (e) wireframe on «existe»: share of solid-orange skin pixels, before vs after
f_no = int(np.floor(TL["ev"]["noExiste"] * FPS + 0.5))


def skin_share(i):
    im = frame_rgb(i)[1000:1900:4, ::4]
    return float(((im[..., 0] > 170) & (im[..., 1] > 50) & (im[..., 1] < 170) & (im[..., 2] < 90)).mean())


before = [skin_share(i) for i in range(G["voice"], f_no, 8)] + [skin_share(f_no - 1)]
after = [skin_share(i) for i in (f_no + 6, f_no + 15, f_no + 30)]
ok("e_wire_on_existe", min(before) > 0.3 and max(after) < 0.1,
   f"«existe» at {TL['ev']['noExiste']:.3f} s = frame {f_no} · solid skin share before {min(before):.2f}-{max(before):.2f} · after {max(after):.3f}")

# contact sheets: every 15 frames, 8 per row
times = np.arange(0, n / FPS, 0.5)
for k in range(0, len(times), 24):
    chunk = times[k:k + 24]
    sel = "+".join(f"eq(n\\,{int(t * FPS)})" for t in chunk)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf",
                    f"select='{sel}',scale=270:480,drawtext=text='%{{pts\\:hms}}':x=6:y=6:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=8x3",
                    "-vsync", "vfr", "-frames:v", "1", os.path.join(out, f"sheet_{k // 24:02d}.jpg")], check=True)
print("sheets in", out)
json.dump(results, open(os.path.join(out, "qa.json"), "w"), indent=1)
sys.exit(0 if all(results.values()) else 1)
