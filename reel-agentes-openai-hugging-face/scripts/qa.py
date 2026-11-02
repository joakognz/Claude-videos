"""Frame-by-frame QA of a rendered reel.

Checks: format, loudness, stillness (no 0.5 s window without motion),
bright content inside the unsafe strips (top 250 px, bottom 340 px),
and writes contact sheets (one frame every 0.5 s) for a visual pass.

Run: python scripts/qa.py <video.mp4> <out_dir>
"""
import json, os, subprocess, sys
import numpy as np

video, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", video],
                                 capture_output=True, text=True, check=True).stdout)
v = next(s for s in info["streams"] if s["codec_type"] == "video")
a = next(s for s in info["streams"] if s["codec_type"] == "audio")
print(f"video {v['width']}x{v['height']} {v['r_frame_rate']} {float(v['duration']):.2f}s {v['codec_name']} · "
      f"audio {a['codec_name']} {a['sample_rate']} Hz {a['channels']} ch")

# loudness (EBU R128)
r = subprocess.run(["ffmpeg", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
summ = r[r.rfind("Summary:"):]
I = [l for l in summ.splitlines() if l.strip().startswith("I:")][0].split()[1]
peak = [l for l in summ.splitlines() if l.strip().startswith("Peak:")][0].split()[1]
print(f"integrated {I} LUFS · true peak {peak} dBFS")

# decode at quarter size, grey
W, H = 270, 480
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H}", "-pix_fmt", "gray", "-f", "rawvideo", "-"],
                     capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
n = len(fr)
diff = np.array([np.mean(np.abs(fr[i] - fr[i - 1])) for i in range(1, n)])
win = 15
still = [i for i in range(len(diff) - win) if diff[i:i + win].max() < 0.15]
print(f"frames {n} · mean motion {diff.mean():.2f} · min motion {diff.min():.3f} · still 0.5s windows: {len(still)}")
if still:
    print("  still around frames", still[:10])
top, bot = int(250 / 4), int((1920 - 340) / 4)
bright_top = [(i, float((fr[i][:top] > 170).mean())) for i in range(n)]
bright_bot = [(i, float((fr[i][bot:] > 170).mean())) for i in range(n)]
bt = [x for x in bright_top if x[1] > 0.002]
bb = [x for x in bright_bot if x[1] > 0.002]
print(f"unsafe-strip bright pixels: top {len(bt)} frames (max {max([0] + [x[1] for x in bt]):.4f}) · "
      f"bottom {len(bb)} frames (max {max([0] + [x[1] for x in bb]):.4f})")
if bt:
    print("  top strip frames", [x[0] for x in bt][:20])
if bb:
    print("  bottom strip frames", [x[0] for x in bb][:20])

# contact sheets: every 15 frames, 8 per row
fps = 30
dur = n / fps
times = np.arange(0, dur, 0.5)
for k in range(0, len(times), 24):
    chunk = times[k:k + 24]
    sel = "+".join(f"eq(n\\,{int(t * fps)})" for t in chunk)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf",
                    f"select='{sel}',scale=270:480,drawtext=text='%{{pts\\:hms}}':x=6:y=6:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=8x3",
                    "-vsync", "vfr", "-frames:v", "1", os.path.join(out, f"sheet_{k // 24:02d}.jpg")], check=True)
print("sheets in", out)
