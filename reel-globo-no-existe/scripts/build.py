"""Builds the reel's timelines and audio mix.

Inputs:  ../audio/raw/globo-no-existe/<take>.mp3 (one ElevenLabs take, used whole), data/words.json (scripts/align.py)
Outputs: src/timeline-globo.json  per-frame countdown curves (counter, needle, dimple, camera, tension)
         src/timeline.json        voice-anchored scenes, captions and events (seconds on the reel's clock)
         public/audio/mix.wav     music + sfx + voice, -14 LUFS, true peak <= -1 dBTP

The countdown runs frames 0-210 with no voice; everything freezes at frame 195 and the first
phoneme of the take lands exactly on frame 210 (7.000 s).

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfilt_zi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "globo-no-existe")
SR = 48000
FPS = 30
F_TOUCH, F_FREEZE, F_VOICE = 90, 195, 210
rng = np.random.default_rng(7)


def load_take():
    src = next(f for f in sorted(os.listdir(RAW)) if f.endswith(".mp3"))
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(RAW, src), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


x = load_take()
# first sample above -50 dBFS (5 ms window) = first phoneme; it goes on frame 210 exactly
h = SR // 200
lvl = 20 * np.log10(np.sqrt(np.mean(x[: len(x) // h * h].reshape(-1, h) ** 2, axis=1)) + 1e-12)
onset = int(np.argmax(lvl > -50)) * h / SR
VOICE_AT = F_VOICE / FPS - onset            # where the MP3's sample 0 goes
TAKE_DUR = len(x) / SR
TOTAL_FRAMES = int(round((VOICE_AT + TAKE_DUR + 2.0) * FPS))
TOTAL = TOTAL_FRAMES / FPS
N = int(TOTAL * SR)


def speech_rms(v):
    hop = SR // 100
    n = len(v) // hop
    r = np.sqrt(np.mean(v[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return np.sqrt(np.mean(r[r > 10 ** (-40 / 20)] ** 2))


x *= 10 ** (-18 / 20) / speech_rms(x)
voice = np.zeros(N)
i0 = int(round(VOICE_AT * SR))
voice[i0:i0 + len(x)] = x[: N - i0]

# ══ 1 · countdown curves (frame domain) ══════════════════════════════════
# The counter is a plain frame countdown: exactly one number per frame, 196 at frame 0 → 001 on the
# freeze (frame 195). No holds, no jumps: every frame shows the previous number minus one.
fr = np.arange(TOTAL_FRAMES)
counter = np.maximum(1, (F_FREEZE + 1) - np.minimum(fr, F_FREEZE))
assert np.all(np.diff(counter[: F_FREEZE + 1]) == -1) and counter[F_FREEZE] == 1

# needle: still for 10 frames, a smooth approach that lands softly on the crown at frame 90 (3.0 s),
# then 3.5 s pressing a dimple that deepens faster and faster until the freeze cuts it mid-motion
GAP0, DIMPLE = 0.5, 0.24  # world units: tip height above the crown at rest, dimple depth at the freeze
u = np.clip((fr - 10) / (F_TOUCH - 10), 0, 1)
needle = u * u * (3 - 2 * u)
v = np.clip((np.minimum(fr, F_FREEZE) - F_TOUCH) / (F_FREEZE - F_TOUCH), 0, 1)
dimple = v ** 1.6
# tension = 1 - remaining travel / initial travel, counting the approach (until the touch) and the press
# (until the freeze) as two equal halves of the journey, eased in so it builds mostly at the end
tension_lin = 0.5 * needle + 0.5 * dimple
tension = tension_lin ** 1.6
tension[fr > F_FREEZE] = 0.0
# hundreds crossed (100 → 099): a tick in the sound
hundreds = [int(f) for f in range(1, F_FREEZE + 1) if counter[f] // 100 != counter[f - 1] // 100]

# camera: wide shot with a slow 6 % push, a 1-second dolly (frames 48-78, smootherstep, motion-blurred
# in render.sh) to a close shot of the crown — 2.7x closer, not a macro — then another slow 6 % push
ZOOM_A, ZOOM_B = 48, 78


def cam_of(f):
    f = min(f, F_FREEZE)
    if f < ZOOM_A:
        return 0.0, 0.06 * f / ZOOM_A
    if f < ZOOM_B:
        p = (f - ZOOM_A) / (ZOOM_B - ZOOM_A)
        return p ** 3 * (p * (6 * p - 15) + 10), 0.06 * (1 - p)
    return 1.0, 0.06 * (f - ZOOM_B) / (F_FREEZE - ZOOM_B)


cam_mix = np.array([cam_of(f)[0] for f in fr])
cam_push = np.array([cam_of(f)[1] for f in fr])

globo = {
    "fps": FPS, "frames": int(F_VOICE + 1), "touch": F_TOUCH, "freeze": F_FREEZE, "voice": F_VOICE,
    "zoom": [ZOOM_A, ZOOM_B], "blur": {"from": ZOOM_A - 1, "to": ZOOM_B + 2, "samples": 10, "shutter": 0.8},
    "gap0": GAP0, "dimpleDepth": DIMPLE, "hundreds": hundreds,
    "counter": counter[: F_VOICE + 1].tolist(),
    "needle": [round(float(x), 5) for x in needle[: F_VOICE + 1]],
    "dimple": [round(float(x), 5) for x in dimple[: F_VOICE + 1]],
    "camMix": [round(float(x), 5) for x in cam_mix[: F_VOICE + 1]],
    "camPush": [round(float(x), 5) for x in cam_push[: F_VOICE + 1]],
    "tension": [round(float(x), 4) for x in tension],
}

# ══ 2 · voice-anchored timeline (seconds) ════════════════════════════════
W = json.load(open(os.path.join(ROOT, "data", "words.json")))["A"]
SEGS = [[a + VOICE_AT, b + VOICE_AT] for a, b in W["segments"]]
words = [{"w": w["w"], "s": round(w["s"] + VOICE_AT, 3), "e": round(w["e"] + VOICE_AT, 3)} for w in W["words"]]
seg_words = [[w for w in words if a - 0.01 <= w["s"] < b + 0.01] for a, b in SEGS]
assert [len(s) for s in seg_words] == [8, 5, 7, 5, 2, 5, 12, 5, 6, 5, 9], [len(s) for s in seg_words]


def wt(seg, idx, key="s"):
    return seg_words[seg][idx][key]


speech_end = SEGS[-1][1]
scenes = {
    "S1": F_VOICE / FPS, "S2": SEGS[1][0] - 0.12, "S3": SEGS[2][0] - 0.15, "S4": SEGS[4][0] - 0.12,
    "S5": SEGS[6][0] - 0.12, "S6": SEGS[7][0] - 0.12, "S7": SEGS[10][0] - 0.2, "C": speech_end + 0.2, "END": TOTAL,
}


def cap(lines, end, start=None):
    """lines: [[(text, time, orange?), ...], ...] — at most 4 words per line, 2 lines."""
    out = {"lines": [[{"text": c[0], "t": round(c[1], 3), "hl": bool(c[2])} for c in ln] for ln in lines], "end": round(end, 3)}
    out["start"] = round(start if start is not None else lines[0][0][1] - 0.05, 3)
    return out


captions = [
    cap([[("Acabas", wt(0, 0), 0), ("de", wt(0, 1), 0), ("mirar", wt(0, 2), 0), ("un", wt(0, 3), 0), ("globo", wt(0, 4), 1)],
         [("durante", wt(0, 5), 0), ("7", wt(0, 6), 1), ("segundos", wt(0, 7), 0)]], scenes["S2"] - 0.02),
    cap([[("Un", wt(1, 0), 0), ("globo", wt(1, 1), 0), ("que", wt(1, 2), 0)], [("no", wt(1, 3), 1), ("existe", wt(1, 4), 1)]],
        scenes["S3"] - 0.05),
    cap([[("Lo", wt(3, 0), 0), ("ha", wt(3, 1), 0), ("dibujado", wt(3, 2), 0)], [("un", wt(3, 3), 0), ("ordenador", wt(3, 4), 1)]],
        scenes["S4"] - 0.05),
    cap([[("Y", wt(4, 0), 0), ("tú", wt(4, 1), 0), ("has", wt(5, 0), 0), ("esperado", wt(5, 1), 1)]], scenes["S5"] - 0.05),
    cap([[("Esto", wt(6, 0), 0), ("es", wt(6, 1), 0)], [("lo", wt(6, 2), 1), ("de", wt(6, 3), 1), ("menos", wt(6, 4), 1)]],
        scenes["S6"] - 0.05),
    cap([[("Tu", wt(8, 2), 0), ("negocio", wt(8, 3), 0)], [("trabaja", wt(8, 4), 1), ("solo", wt(8, 5), 1)]], scenes["S7"] - 0.05),
]

# CTA: AUDITORIA typed letter by letter across the spoken word; "Enviar" on its last syllable
aud_s, aud_e = wt(10, 1), wt(10, 1, "e")
type_step = (aud_e - aud_s - 0.1) / 9
ev = {
    "freeze": F_FREEZE / FPS, "voice": F_VOICE / FPS,
    "noExiste": wt(1, 4),                                      # "existe": glitch + wireframe
    "redraw": scenes["S3"] + 0.05,                             # mesh redrawn vertex by vertex
    "goma": wt(2, 2), "aire": wt(2, 4), "foto": wt(2, 6),      # strike-throughs
    "tagsIn": wt(2, 0),
    "calm": scenes["S4"], "tcResume": wt(4, 0),                # timecode runs again on "Y"
    "zoomOut": scenes["S5"], "shapes": wt(6, 2),
    "sweep": scenes["S6"], "pulse0": wt(7, 2), "negocio": wt(8, 3), "mientras": wt(9, 0), "tu": wt(9, 1),
    "cta": scenes["S7"], "comenta": wt(10, 0), "typeStart": aud_s + 0.02, "typeStep": type_step,
    "send": aud_e - 0.12, "ayudamos": wt(10, 4), "crt": scenes["C"], "logo": scenes["C"] + 0.45,
}
ev = {k: round(v, 3) for k, v in ev.items()}

# ══ 3 · audio ═══════════════════════════════════════════════════════════
tt = np.arange(N) / SR
t_freeze = F_FREEZE / FPS
ten = np.interp(tt * FPS, fr, tension)            # eased curve per sample
ten_l = np.interp(tt * FPS, fr, tension_lin)      # linear (distance) per sample
pre = tt < t_freeze


def lp(v, fc, order=2):
    return sosfilt(butter(order, fc, fs=SR, output="sos"), v)


def hp(v, fc, order=2):
    return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), v)


def bp(v, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), v)


def note_hz(mi):
    return 440 * 2 ** ((mi - 69) / 12)


def place(buf, v, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i < 0:
        v, i = v[-i:], 0
    n = max(0, min(len(v), len(buf) - i))
    buf[i:i + n] += v[:n] * gain


def env_ar(n, a, r):
    e = np.ones(n)
    na, nr = min(int(a * SR), n), min(int(r * SR), n)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def saw(phase):
    return 2 * (phase % 1.0) - 1


def step(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1)


def db(v):
    return 10 ** (v / 20)


# ── phase 1: countdown music, everything driven by "tension" ───────────
# base drone 45-55 Hz
drone = (np.sin(2 * np.pi * 49 * tt) + 0.6 * np.sin(2 * np.pi * 55 * tt + 1.3) + 0.12 * np.sin(2 * np.pi * 98 * tt)) * 0.5
# pulse: soft dry kick from tension 0.15, tempo rising continuously 60 → 140 bpm
kick = np.zeros(N)
bpm = 60 + 80 * np.clip((ten - 0.15) / 0.85, 0, 1)
beat_phase = np.cumsum(bpm / 60 / SR)
beats = np.where((np.floor(beat_phase[1:]) > np.floor(beat_phase[:-1])) & pre[1:] & (ten[1:] >= 0.15))[0]
kick_times = []
for j in beats:
    nn = int(0.22 * SR)
    tl = np.arange(nn) / SR
    fq = 48 + 70 * np.exp(-tl / 0.025)
    k = np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-tl / 0.09) + lp(rng.standard_normal(nn), 2000) * 0.08 * np.exp(-tl / 0.008)
    place(kick, k, j / SR, 0.5 + 0.5 * ten[j])
    kick_times.append(round(j / SR, 3))
# low-passed synth pad: cutoff 300 Hz → 8 kHz with tension (block-wise filter with carried state)
pad_notes = [38, 45, 50, 53, 57]  # D2 A2 D3 F3 A3
pad = sum(saw(note_hz(mi) * (1 + 0.002 * (k % 2 * 2 - 1)) * tt) for k, mi in enumerate(pad_notes)) * 0.18
pad_f = np.zeros(N)
blk = 480
zi = None
for b0 in range(0, int(t_freeze * SR) + blk, blk):
    tv = ten[min(b0, N - 1)]
    fc = 300 * (8000 / 300) ** tv
    sos = butter(2, fc, fs=SR, output="sos")
    if zi is None:
        zi = sosfilt_zi(sos) * 0
    seg_, zi = sosfilt(sos, pad[b0:b0 + blk], zi=zi)
    pad_f[b0:b0 + blk] = seg_
# riser: saw bending continuously two octaves up, entering at tension 0.4
r = np.clip((ten_l - 0.4) / 0.6, 0, 1) * pre
riser = lp(saw(np.cumsum(110 * 2 ** (2 * r)) / SR) * r ** 1.3, 3500) * 0.5
# high-passed white noise, only over the last 25 % of the curve
nz = np.clip((ten_l - 0.75) / 0.25, 0, 1) ** 1.5 * pre
noise = hp(rng.standard_normal(N), 5000, 4) * nz * 0.22
phase1 = (drone * 0.55 + kick * 0.9 + pad_f * 0.8 + riser + noise)
# overall music level -28 dB → -10 dB with tension (calibrated below so the climax sits at -10 LUFS)
lvl_db = -28 + 18 * ten
# measure the layers' own loudness (0.4 s windows, 0.1 s hop) and correct it towards the target curve
_m = pyln.Meter(SR, block_size=0.4)
for _pass in range(3):  # measure → correct, three times, so the curve lands on target
    cent, corr = [], []
    for a in np.arange(0, t_freeze - 0.4 + 1e-6, 0.1):
        w = phase1[int(a * SR):int((a + 0.4) * SR)]
        l_ = _m.integrated_loudness(np.stack([w, w], axis=1))
        cent.append(a + 0.2)
        corr.append(lvl_db[int((a + 0.2) * SR)] - l_)
    corr_s = np.interp(tt, cent, np.convolve(np.pad(corr, 2, mode="edge"), np.ones(5) / 5, mode="valid"))
    phase1 *= db(corr_s) * pre
# hard stop on frame 195: every layer cut on the same sample (2 ms anti-click)
cut_i = int(t_freeze * SR)
phase1[cut_i - 96:cut_i] *= np.linspace(1, 0, 96)
phase1[cut_i:] = 0

# ── countdown sfx ─────────────────────────────────────────────────────
sfx = np.zeros(N)
sfx_list = []


def add(kind, t, gain=1.0, **kw):
    sfx_list.append({"t": round(t, 3), "type": kind})
    if kind == "tick":  # dry tick, higher with tension
        nn = int(0.03 * SR); tl = np.arange(nn) / SR
        f0 = 1400 + 2600 * kw.get("tension", 0)
        v = (np.sin(2 * np.pi * f0 * tl) * 0.6 + hp(rng.standard_normal(nn), 3000) * 0.4) * np.exp(-tl / 0.005)
    elif kind == "metal":  # needle stops: soft metallic click
        nn = int(0.25 * SR); tl = np.arange(nn) / SR
        v = sum(np.sin(2 * np.pi * fq * tl) * a for fq, a in ((2310, 0.5), (3470, 0.35), (5220, 0.2), (7880, 0.1))) * np.exp(-tl / 0.035) * 0.5
    elif kind == "motif":  # opening motif: two glassy notes over a soft click (loops with the ending)
        nn = int(1.0 * SR); tl = np.arange(nn) / SR
        v = np.zeros(nn)
        for k, (mi, dt) in enumerate(((81, 0.0), (88, 0.18))):
            j = int(dt * SR); m_ = nn - j; tl2 = np.arange(m_) / SR
            f = note_hz(mi)
            v[j:] += (np.sin(2 * np.pi * f * tl2) + 0.22 * np.sin(2 * np.pi * f * 2.76 * tl2) * np.exp(-tl2 / 0.06)) * np.exp(-tl2 / 0.45) * (0.32 - 0.08 * k)
        v[: int(0.02 * SR)] += hp(rng.standard_normal(int(0.02 * SR)), 3000) * np.exp(-np.arange(int(0.02 * SR)) / SR / 0.004) * 0.25
    elif kind == "hum":  # near-silence after the freeze
        nn = int(0.62 * SR); tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 41 * tl) + 0.3 * np.sin(2 * np.pi * 82 * tl)) * 0.008 * env_ar(nn, 0.01, 0.12)
    elif kind == "thud":  # soft dull hit on the voice's first phoneme
        nn = int(0.45 * SR); tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * (52 + 30 * np.exp(-tl / 0.03)) * tl) * np.exp(-tl / 0.14) + lp(rng.standard_normal(nn), 300) * 0.25 * np.exp(-tl / 0.03)) * 0.55
    elif kind == "glitch":  # 6 frames of digital stutter
        nn = int(6 / FPS * SR); tl = np.arange(nn) / SR
        hold = np.repeat(rng.standard_normal(nn // 60 + 1), 60)[:nn]
        sq = np.sign(np.sin(2 * np.pi * np.repeat(rng.uniform(180, 1600, 6), nn // 6 + 1)[:nn] * tl))
        gate = (np.floor(tl * FPS * 2) % 2 == 0) * 0.8 + 0.2
        v = (hold * 0.35 + sq * 0.25) * gate * env_ar(nn, 0.002, 0.01) * 0.7
    elif kind == "sweep":  # grid sweep
        nn = int(0.6 * SR); tl = np.arange(nn) / SR
        v = bp(rng.standard_normal(nn), 1500, 8000) * np.sin(np.pi * tl / 0.6) ** 2 * 0.22
    elif kind == "draw":  # tiny blip while the mesh is redrawn
        nn = int(0.04 * SR); tl = np.arange(nn) / SR
        v = np.sin(2 * np.pi * kw.get("f", 2200) * tl) * np.exp(-tl / 0.01) * 0.18
    elif kind == "strike":  # pen-like strike
        nn = int(0.18 * SR); tl = np.arange(nn) / SR
        v = bp(rng.standard_normal(nn), 1800, 6000) * np.sin(np.pi * tl / 0.18) * 0.35
    elif kind == "whoosh":  # zoom out
        nn = int(1.4 * SR); tl = np.arange(nn) / SR
        v = bp(rng.standard_normal(nn), 300, 3000) * np.sin(np.pi * tl / 1.4) ** 2 * 0.22
    elif kind == "pulse":  # node lights up
        nn = int(0.3 * SR); tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * kw.get("f", 880) * tl) + 0.3 * np.sin(2 * np.pi * kw.get("f", 880) * 2 * tl)) * np.exp(-tl / 0.08) * 0.16
    elif kind == "key":
        nn = int(0.05 * SR); tl = np.arange(nn) / SR
        v = (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    elif kind == "send":
        nn = int(0.3 * SR); tl = np.arange(nn) / SR
        v = (bp(rng.standard_normal(nn), 1500, 5000) * 0.5 * np.exp(-tl / 0.01) + np.sin(2 * np.pi * (900 + 900 * tl / 0.3) * tl) * 0.25 * np.exp(-tl / 0.07))
    elif kind == "crt":  # CRT power-off: descending whine + soft thump
        nn = int(0.6 * SR); tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * np.cumsum(9000 * np.exp(-tl / 0.12) + 60) / SR) * 0.06 * np.exp(-tl / 0.25)
             + np.sin(2 * np.pi * 70 * tl) * 0.4 * np.exp(-tl / 0.09))
    else:
        raise ValueError(kind)
    place(sfx, v, t, gain)


add("motif", 0.0, 0.9)
for f in hundreds:
    add("tick", f / FPS, 0.9, tension=float(tension[f]))
add("metal", F_TOUCH / FPS, 0.6)  # steel meets latex
add("hum", t_freeze + 0.005, 1.0)
add("thud", F_VOICE / FPS, 0.8)
add("glitch", ev["noExiste"], 0.9)
add("sweep", ev["redraw"] - 0.1, 0.8)
for k in range(14):
    add("draw", ev["redraw"] + 0.12 + k * 0.19, 0.8, f=1800 + 140 * (k % 5))
for kk in ("goma", "aire", "foto"):
    add("strike", ev[kk] + 0.05, 0.9)
add("whoosh", ev["zoomOut"] - 0.1, 0.9)
add("sweep", ev["sweep"], 0.8)
for k in range(9):
    add("pulse", ev["pulse0"] + k * 0.55, 0.8, f=[660, 880, 990, 1320][k % 4])
add("glitch", ev["cta"], 0.5)
for k in range(9):
    add("key", ev["typeStart"] + k * ev["typeStep"], 0.75)
add("send", ev["send"], 0.9)
add("crt", ev["crt"], 0.9)
add("motif", TOTAL - 1.0, 0.9)

# ── phase 2: under the voice ─────────────────────────────────────────
# base drone back, very low; from sentence 5 a cleaner, brighter pulse of open chords ("the solution")
t_v = F_VOICE / FPS
drone2 = drone * step(tt, t_v, t_v + 1.0) * (1 - step(tt, scenes["C"], scenes["C"] + 0.3)) * 0.35
sol0 = scenes["S5"] - 0.3
BPM = 96
beat = 60 / BPM
open_chords = [[50, 57, 64, 69, 76], [46, 53, 62, 65, 72], [43, 50, 57, 62, 69], [45, 52, 57, 64, 71]]  # D5add9 Bb G A sus
sol = np.zeros(N)
k = 0
t0 = sol0
while t0 < scenes["C"]:
    ch = open_chords[(k // 4) % 4]
    for j, mi in enumerate(ch):
        nn = int(1.1 * SR); tl = np.arange(nn) / SR
        f = note_hz(mi)
        pl = (np.sin(2 * np.pi * f * tl) + 0.3 * np.sin(2 * np.pi * 2 * f * tl) * np.exp(-tl / 0.15)) * np.exp(-tl / 0.38)
        place(sol, pl * env_ar(nn, 0.004, 0.05), t0 + j * 0.012, 0.11 if j else 0.18)
    t0 += beat / 2
    k += 1
sol = lp(sol, 6000) * step(tt, sol0, sol0 + 1.2) * (1 - step(tt, scenes["C"] - 0.05, scenes["C"] + 0.25))
# last second: drone back up to its frame-0 level so the loop is seamless
drone_end = drone * db(-28 + 10) * step(tt, TOTAL - 1.0, TOTAL - 0.4)
music2 = (drone2 * 0.55 * db(-28 + 10 + 4) + sol * 0.9)

# duck the music 12 dB under the voice
venv = np.abs(voice)
kk = int(0.1 * SR)
venv = np.convolve(venv, np.ones(kk) / kk, mode="same")
on = np.clip(venv / (np.percentile(venv[venv > 1e-4], 40) + 1e-9), 0, 1)
duck_db = -12 * lp(on, 5)
music2 *= db(duck_db)

# ── calibrate the countdown so its climax (last second before the freeze) sits at -10 LUFS ──
meter = pyln.Meter(SR, block_size=0.4)
def lufs(v, a, b):
    st = np.stack([v[int(a * SR):int(b * SR)]] * 2, axis=1)
    return meter.integrated_loudness(st)


rest = music2 + drone_end + voice + sfx * 0.6
rest_R = music2 + drone_end + voice + np.roll(sfx, 50) * 0.6   # sfx slightly widened
clim = lufs(phase1, t_freeze - 0.4, t_freeze)  # the curve peaks at -10 right at the freeze
phase1_cal = phase1 * db(-10 - clim)
g = 1.0
for _ in range(5):  # rest gain so the whole reel integrates at -14 with the countdown fixed
    full = phase1_cal + rest * g
    g *= db(-14 - meter.integrated_loudness(np.stack([full, full], axis=1)))
L = phase1_cal + rest * g
R = phase1_cal + rest_R * g
st = np.stack([L, R], axis=1)
# look-ahead peak limiter (no clipping, so the AAC encode doesn't overshoot), then exact -14 LUFS
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d
CEIL = db(-3.0)


def limit(x):
    env = maximum_filter1d(np.abs(x).max(axis=1), size=int(0.006 * SR))
    g = np.minimum(1.0, CEIL / (env + 1e-9))
    g = minimum_filter1d(g, size=int(0.012 * SR))
    g = uniform_filter1d(g, size=int(0.006 * SR))
    return x * g[:, None]


_meter = pyln.Meter(SR)
for _ in range(4):
    st *= db(-14 - _meter.integrated_loudness(st))
    st = limit(st)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                os.path.join(ROOT, "public", "audio", "mix.wav")], input=pcm, check=True)
# music-only stem of the countdown (for the QA's RMS-per-second check)
np.save(os.path.join(ROOT, "data", "countdown_music.npy"), phase1_cal[: int(F_VOICE / FPS * SR)].astype(np.float32))

timeline = {
    "fps": FPS, "durationInFrames": TOTAL_FRAMES, "voiceAt": round(VOICE_AT, 4), "onset": round(onset, 4),
    "scenes": {k: round(v, 3) for k, v in scenes.items()}, "captions": captions, "ev": ev, "words": words,
    "segments": [[round(a, 3), round(b, 3)] for a, b in SEGS], "sfx": sfx_list,
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
json.dump(globo, open(os.path.join(ROOT, "src", "timeline-globo.json"), "w"))
m_ = pyln.Meter(SR)
print(f"voice onset {onset:.3f}s in the MP3 → MP3 placed at {VOICE_AT:.3f}s · total {TOTAL_FRAMES} frames ({TOTAL:.2f}s)")
print("scenes", {k: round(v, 2) for k, v in scenes.items()})
print("touch", F_TOUCH, "hundreds", hundreds, "counter", counter[0], "→", counter[F_FREEZE])
print("ev", ev)
print("loudness", round(m_.integrated_loudness(st), 2), "LUFS · sample peak", round(20 * np.log10(np.abs(st).max()), 2), "dBFS")
for a in range(0, 7):
    print(f"  countdown music {a}-{a+1}s: {lufs(phase1_cal + sfx * 0, a, a + 1):6.1f} LUFS")
