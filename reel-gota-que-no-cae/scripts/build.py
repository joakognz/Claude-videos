"""Builds the reel's timelines and audio mix. Every sound is placed from the same numbers that drive the image
(the drop's growth, neck and fall from physics.py; word times from align.py; the pipe's drips; the clamps), so each
one lands on its exact frame.

Inputs:  ../audio/raw/gota-que-no-cae/<take>.mp3 (one ElevenLabs take, used whole), data/words.json (align.py),
         music/<track>.mp3 + music/from.txt (optional: the user's track and its start time, mm:ss)
Outputs: src/timeline-gota.json   countdown physics + camera (physics.py)
         data/gota_frames.npz     per-frame shapes (physics.py)
         src/timeline.json        scenes, captions, events, pipe schedule (seconds on the reel's clock)
         public/audio/mix.wav     voice + sfx (+ music if given), −14 LUFS, true peak ≤ −1 dBTP
         public/audio/mix_sinmusica.wav

Run: python scripts/build.py
"""
import json, math, os, subprocess, sys
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import physics  # noqa: E402

RAW = os.path.join(ROOT, "..", "audio", "raw", "gota-que-no-cae")
MUSIC_DIR = os.path.join(ROOT, "music")
SR = 48000
FPS = 30
F_BRAKE, F_FREEZE, F_VOICE, F_PINCH, F_NECK = physics.F_BRAKE, physics.F_FREEZE, physics.F_VOICE, physics.F_PINCH, physics.F_NECK
rng = np.random.default_rng(11)

# ══ 0 · physics (shared with Blender and the wireframe) ══════════════════════════════════════════
G, phys = physics.run()
json.dump(G, open(os.path.join(ROOT, "src", "timeline-gota.json"), "w"))
RATE = G["rate"]


def load(path, ss=None, t=None, ch=1):
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", str(ss)] if ss is not None else []) + ["-i", path] + (["-t", str(t)] if t else []) + \
          ["-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    return x.reshape(-1, ch) if ch > 1 else x


take = os.path.join(RAW, next(f for f in sorted(os.listdir(RAW)) if f.endswith(".mp3")))
x = load(take)
h = SR // 200
lvl = 20 * np.log10(np.sqrt(np.mean(x[: len(x) // h * h].reshape(-1, h) ** 2, axis=1)) + 1e-12)
onset = int(np.argmax(lvl > -50)) * h / SR
VOICE_AT = F_VOICE / FPS - onset
TOTAL_FRAMES = int(round((VOICE_AT + len(x) / SR + 2.0) * FPS))
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

# ══ 1 · voice-anchored timeline (seconds on the reel's clock) ═══════════════════════════════════════
W = json.load(open(os.path.join(ROOT, "data", "words.json")))["A"]
SEGS = [[a + VOICE_AT, b + VOICE_AT] for a, b in W["segments"]]
words = [{"w": w["w"], "s": round(w["s"] + VOICE_AT, 3), "e": round(w["e"] + VOICE_AT, 3)} for w in W["words"]]
seg_words = [[w for w in words if a - 0.01 <= w["s"] < b + 0.01] for a, b in SEGS]
assert [len(s) for s in seg_words] == [5, 4, 4, 9, 7, 8, 5, 12, 7, 16, 10], [len(s) for s in seg_words]


def wt(seg, idx, key="s"):
    return seg_words[seg][idx][key]


speech_end = SEGS[-1][1]
scenes = {
    "S1": F_VOICE / FPS,                  # «¿Estabas esperando a que cayera? No va a caer.» (held frame, the cota)
    "S2": SEGS[2][0] - 0.12,              # «Esa gota no existe: ni el agua, ni el grifo, ni su reflejo.» (glitch → wire)
    "S3": SEGS[4][0] - 0.12,              # «Todo eso lo ha calculado un ordenador.» (pull back, orbit, call-outs)
    "S4": SEGS[5][0] - 0.12,              # «Y aun así, no podías dejar de mirarla.» (the wire drop falls)
    "S5": SEGS[6][0] - 0.25,              # «Ahora piensa en tu negocio: … se te escapan clientes.» (2D pipe)
    "S6": SEGS[9][0] - 0.1,               # «En AIgencyx Labs cerramos esas fugas…»
    "S7": SEGS[10][0] - 0.2,              # CTA
    "C": speech_end + 0.22, "END": TOTAL,
}


def cap(lines, end, start=None):
    out = {"lines": [[{"text": c[0], "t": round(c[1], 3), "hl": bool(c[2])} for c in ln] for ln in lines], "end": round(end, 3)}
    out["start"] = round(start if start is not None else lines[0][0][1] - 0.05, 3)
    return out


captions = [
    cap([[("¿Estabas", wt(0, 0), 0), ("esperando", wt(0, 1), 0)], [("a", wt(0, 2), 0), ("que", wt(0, 3), 0), ("cayera?", wt(0, 4), 1)]], SEGS[1][0] - 0.08),
    cap([[("No", wt(1, 0), 0), ("va", wt(1, 1), 0), ("a", wt(1, 2), 0)], [("caer", wt(1, 3), 1)]], SEGS[2][0] - 0.08),
    cap([[("Esa", wt(2, 0), 0), ("gota", wt(2, 1), 0)], [("no", wt(2, 2), 1), ("existe", wt(2, 3), 1)]], SEGS[3][0] - 0.06),
    cap([[("ni", wt(3, 0), 0), ("el", wt(3, 1), 0), ("agua,", wt(3, 2), 0)], [("ni", wt(3, 3), 0), ("el", wt(3, 4), 0), ("grifo,", wt(3, 5), 0)],
         [("ni", wt(3, 6), 0), ("su", wt(3, 7), 0), ("reflejo", wt(3, 8), 1)]], scenes["S3"] - 0.04),
    cap([[("Todo", wt(4, 0), 0), ("eso", wt(4, 1), 0), ("lo", wt(4, 2), 0), ("ha", wt(4, 3), 0)], [("calculado", wt(4, 4), 0)],
         [("un", wt(4, 5), 0), ("ordenador", wt(4, 6), 1)]], scenes["S4"] - 0.04),
    cap([[("Y", wt(5, 0), 0), ("aun", wt(5, 1), 0), ("así,", wt(5, 2), 0)], [("no", wt(5, 3), 0), ("podías", wt(5, 4), 0), ("dejar", wt(5, 5), 0)],
         [("de", wt(5, 6), 0), ("mirarla", wt(5, 7), 1)]], scenes["S5"] - 0.02),
    cap([[("Ahora", wt(6, 0), 0), ("piensa", wt(6, 1), 0)], [("en", wt(6, 2), 0), ("tu", wt(6, 3), 0), ("negocio", wt(6, 4), 1)]], SEGS[7][0] - 0.06),
    cap([[("gota", wt(8, 0), 0), ("a", wt(8, 1), 0), ("gota,", wt(8, 2), 0)], [("se", wt(8, 3), 0), ("te", wt(8, 4), 0), ("escapan", wt(8, 5), 0)],
         [("clientes", wt(8, 6), 1)]], scenes["S6"] - 0.05),
    # the brand stays in the voice (and the closing card): the caption starts on «cerramos»
    cap([[("cerramos", wt(9, 3), 0)], [("esas", wt(9, 4), 0), ("fugas", wt(9, 5), 1)]], wt(9, 6) - 0.05),
    cap([[("para", wt(9, 6), 0), ("que", wt(9, 7), 0), ("cada", wt(9, 8), 0), ("cliente", wt(9, 9), 0)], [("llegue", wt(9, 10), 0), ("a", wt(9, 11), 0), ("donde", wt(9, 12), 0)],
         [("tiene", wt(9, 13), 0), ("que", wt(9, 14), 0), ("llegar", wt(9, 15), 1)]], scenes["S7"] - 0.05),
]
# three-line captions keep the two-tier rule: line 1 small; lines 2-3 are the punch line, split so none exceeds 4 words

# ── events ──
aud_s, aud_e = wt(10, 1), wt(10, 1, "e")
type_step = min(0.075, (aud_e - aud_s - 0.06) / 9)
ev = {
    "freeze": F_FREEZE / FPS, "voice": F_VOICE / FPS, "brake": F_BRAKE / FPS, "pinch": F_PINCH / FPS,
    "cota": wt(1, 0), "cotaLabel": wt(1, 3),                          # «No va a caer»: the cota draws, its label on «caer»
    "noExiste": wt(2, 3),                                             # «existe»: glitch → wire
    "offAgua": wt(3, 2), "offGrifo": wt(3, 5), "offReflejo": wt(3, 8),
    "relight": scenes["S3"] + 0.02,
    "ann1": wt(4, 0), "ann2": wt(4, 4), "ann3": wt(4, 4) + 0.345, "ann4": wt(4, 6),   # Todo · calculado · cal-cu-LA-do · ordenador
    "resume": wt(5, 7), "impact": wt(5, 7) + 0.125,                   # «mirarla»: the clock runs again; impact on «-RAR-»
    "sweep": scenes["S5"],
    "lMensaje": wt(7, 1), "lLlamada": wt(7, 5), "lPresupuesto": wt(7, 8),
    "gota1": wt(8, 0), "gota2": wt(8, 2), "escapan": wt(8, 5), "clientes": wt(8, 6),
    "clamp1": wt(9, 3) + 0.22, "clamp2": wt(9, 4), "clamp3": wt(9, 5) + 0.04,  # ce-RRA-mos · E-sas · FU-gas
    "fluye": wt(9, 10), "llegar": wt(9, 15),
    "cta": scenes["S7"], "comenta": wt(10, 0), "typeStart": aud_s + 0.02, "typeStep": type_step,
    "send": aud_s + 0.02 + 9 * type_step + 0.08, "porDonde": wt(10, 5), "crt": scenes["C"], "logo": scenes["C"] + 0.45,
}
ev["satImpact"] = ev["impact"] + 0.42
ev = {k: round(v, 3) for k, v in ev.items()}

# ── the 2D pipe (S5–S6): three leaks; each drips at its own pace from the moment its label appears until its clamp.
#    A drop leaves the leak, falls FALL_T s (gravity), splashes and is gone (−1). The tank barely rises.
FALL_T = 0.42
leaks = []
for k, (lab, period, phase) in enumerate((("lMensaje", 0.62, 0.10), ("lLlamada", 0.55, 0.26), ("lPresupuesto", 0.68, 0.18))):
    start, stop = ev[lab] + phase, ev[f"clamp{k + 1}"]
    t_ = start
    drops = []
    while t_ + 0.05 < stop:
        drops.append(round(t_, 3))
        t_ += period * (1 + 0.12 * math.sin(7.1 * len(drops) + k))
    leaks.append({"label": ["SIN RESPUESTA", "LLAMADA PERDIDA", "SIN SEGUIMIENTO"][k], "at": ev[lab], "drops": drops, "clamp": ev[f"clamp{k + 1}"]})
pipe = {"fallT": FALL_T, "leaks": leaks, "fill": [ev["fluye"], ev["llegar"] + 0.25]}

# ══ 2 · audio ═══════════════════════════════════════════════════════════════════════════════════════
tt = np.arange(N) / SR


def lp(v, fc, order=2):
    return sosfilt(butter(order, fc, fs=SR, output="sos"), v)


def hp(v, fc, order=2):
    return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), v)


def bp(v, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), v)


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


def step(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1)


def db(v):
    return 10 ** (v / 20)


t_freeze, t_brake, t_pinch = F_FREEZE / FPS, F_BRAKE / FPS, F_PINCH / FPS
fr = np.arange(len(G["tension"]))
tension = np.array(G["tension"]) ** 1.4

# ── heartbeat: 52 → 150 bpm with the tension; its last beat lands exactly on the brake ──
T_FIRST = 0.22
tt_ = np.arange(T_FIRST, t_brake + 1e-9, 1 / 600)
bpm = 52 + 98 * np.interp(tt_ * FPS, fr, np.array(G["tension"])) ** 1.3
ph = np.concatenate([[0], np.cumsum(bpm / 60 / 600)[:-1]])
ph *= round(ph[-1]) / ph[-1]
beats = [float(tt_[np.argmax(ph >= k - 1e-9)]) for k in range(0, int(round(ph[-1])) + 1)]
beats[-1] = t_brake

sfx_list = []


def synth(kind, **kw):
    """One sound, as an array (placed by the caller)."""
    if kind == "heart":
        v = np.zeros(int(0.8 * SR))
        gap_ = kw.get("gap", 0.17)
        for k, (amp, f0) in enumerate(((1.0, 58), (0.62, 66))):
            nn = int(0.32 * SR)
            tl = np.arange(nn) / SR
            fq = f0 * (1 + 0.9 * np.exp(-tl / 0.025))
            thump = np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-tl / 0.075) * (1 - np.exp(-tl / 0.004))
            thump += lp(rng.standard_normal(nn), 400) * 0.18 * np.exp(-tl / 0.02)
            j = int(k * gap_ * SR)
            v[j:j + nn] += amp * thump
        return lp(v, 900)
    if kind == "plip":  # the drop letting go: a wet pluck, its pitch springing up (a bubble-like resonance)
        nn = int(0.22 * SR)
        tl = np.arange(nn) / SR
        f = 780 * (1 + 2.2 * (1 - np.exp(-tl / 0.025)))
        v = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tl / 0.045) * (1 - np.exp(-tl / 0.0015))
        v += bp(rng.standard_normal(nn), 2500, 9000) * np.exp(-tl / 0.003) * 0.5
        return v
    if kind == "tick_sat":
        nn = int(0.08 * SR)
        tl = np.arange(nn) / SR
        return np.sin(2 * np.pi * 2600 * (1 + 2 * tl / 0.08) * tl) * np.exp(-tl / 0.012) * 0.5
    if kind == "tiiick":
        nn = int(1.1 * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 3136 * tl) * 0.5 + np.sin(2 * np.pi * 6272 * tl) * 0.12 * np.exp(-tl / 0.08)
             + np.sin(2 * np.pi * 4699 * tl) * 0.18 * np.exp(-tl / 0.15)) * np.exp(-tl / 0.42) * (1 - np.exp(-tl / 0.0015))
        return v + hp(rng.standard_normal(nn), 6000) * 0.25 * np.exp(-tl / 0.003)
    if kind == "hum":
        nn = int(0.6 * SR)
        tl = np.arange(nn) / SR
        return (np.sin(2 * np.pi * 41 * tl) + 0.3 * np.sin(2 * np.pi * 82 * tl)) * 0.008 * env_ar(nn, 0.02, 0.15)
    if kind == "cota":  # a caliper: two dry ticks and a thin rising line as the cota draws
        nn = int(0.45 * SR)
        tl = np.arange(nn) / SR
        v = np.sin(2 * np.pi * np.cumsum(1400 + 1800 * np.clip(tl / 0.35, 0, 1)) / SR) * 0.08 * np.sin(np.pi * np.clip(tl / 0.4, 0, 1))
        for t_k in (0.0, 0.05):
            j = int(t_k * SR)
            m = int(0.02 * SR)
            v[j:j + m] += bp(rng.standard_normal(m), 2500, 8000) * np.exp(-np.arange(m) / SR / 0.002) * 0.6
        return v
    if kind == "label":
        nn = int(0.12 * SR)
        tl = np.arange(nn) / SR
        return (np.sin(2 * np.pi * 2100 * tl) * 0.35 + np.sin(2 * np.pi * 3150 * tl) * 0.15) * np.exp(-tl / 0.025)
    if kind == "glitch":
        nn = int(6 / FPS * SR)
        tl = np.arange(nn) / SR
        hold = np.repeat(rng.standard_normal(nn // 60 + 1), 60)[:nn]
        sq = np.sign(np.sin(2 * np.pi * np.repeat(rng.uniform(180, 1600, 6), nn // 6 + 1)[:nn] * tl))
        gate = (np.floor(tl * FPS * 2) % 2 == 0) * 0.8 + 0.2
        return (hold * 0.35 + sq * 0.25) * gate * env_ar(nn, 0.002, 0.01) * 0.7
    if kind == "off":  # an element switching off: a descending blip and a little static
        nn = int(0.26 * SR)
        tl = np.arange(nn) / SR
        f = 980 * np.exp(-tl / 0.09) + 140
        v = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.12 * np.exp(-tl / 0.08)
        return lp(v, 4000) + bp(rng.standard_normal(nn), 1500, 6000) * 0.08 * np.exp(-tl / 0.03)
    if kind == "relight":
        nn = int(0.5 * SR)
        tl = np.arange(nn) / SR
        f = 300 + 900 * tl / 0.5
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.07 * np.sin(np.pi * tl / 0.5) + bp(rng.standard_normal(nn), 3000, 9000) * 0.03 * np.sin(np.pi * tl / 0.5)
    if kind == "tic":
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        return (bp(rng.standard_normal(nn), 2500, 7000) * 0.5 + np.sin(2 * np.pi * 1900 * tl) * 0.25) * np.exp(-tl / 0.006)
    if kind == "resume":  # the clock starting again: a short reverse tape-stop
        nn = int(0.14 * SR)
        tl = np.arange(nn) / SR
        f = 60 + 500 * (tl / 0.14) ** 2
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 * np.sin(np.pi * tl / 0.14) + bp(rng.standard_normal(nn), 400, 3000) * 0.1 * (tl / 0.14)
    if kind == "plink":  # a drop into still water: a fast upward chirp (the bubble), then its echo off the studio walls
        nn = int(1.6 * SR)
        tl = np.arange(nn) / SR
        f = kw.get("f", 1150) * (1 + 1.4 * (1 - np.exp(-tl / 0.018)))
        dry = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tl / 0.05) * (1 - np.exp(-tl / 0.001))
        dry += bp(rng.standard_normal(nn), 1500, 7000) * np.exp(-tl / 0.004) * 0.35
        v = dry.copy()
        for k_, (d, g) in enumerate(((0.13, 0.42), (0.27, 0.26), (0.41, 0.15), (0.56, 0.08))):
            j = int(d * SR)
            v[j:] += lp(dry, 4500 - 900 * k_)[: nn - j] * g
        return v
    if kind == "drip":  # a lost drop hitting the floor of the 2D scene
        nn = int(0.16 * SR)
        tl = np.arange(nn) / SR
        f = kw.get("f", 1600) * (1 + 0.9 * (1 - np.exp(-tl / 0.012)))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tl / 0.03) * (1 - np.exp(-tl / 0.0008)) * 0.6
    if kind == "sweep":
        nn = int(0.6 * SR)
        tl = np.arange(nn) / SR
        return bp(rng.standard_normal(nn), 1500, 8000) * np.sin(np.pi * tl / 0.6) ** 2 * 0.2
    if kind == "pop":
        nn = int(0.3 * SR)
        tl = np.arange(nn) / SR
        f0 = kw.get("f", 420)
        return np.sin(2 * np.pi * f0 * tl) * np.exp(-tl / 0.05) * 0.45 + np.sin(2 * np.pi * f0 * 2.7 * tl) * np.exp(-tl / 0.02) * 0.15
    if kind == "clamp":  # a metal band clamp snapping shut and being cinched: clank + ratchet
        nn = int(0.5 * SR)
        tl = np.arange(nn) / SR
        v = sum(np.sin(2 * np.pi * f * tl) * a * np.exp(-tl / d) for f, a, d in ((1450, 0.4, 0.06), (2710, 0.25, 0.04), (4380, 0.16, 0.025), (380, 0.45, 0.08)))
        v += bp(rng.standard_normal(nn), 1500, 9000) * 0.45 * np.exp(-tl / 0.004)
        for k_ in range(3):
            j = int((0.08 + 0.045 * k_) * SR)
            m = int(0.012 * SR)
            v[j:j + m] += bp(rng.standard_normal(m), 3000, 9000) * 0.3 * np.exp(-np.arange(m) / SR / 0.002)
        return v
    if kind == "ok":
        nn = int(0.35 * SR)
        tl = np.arange(nn) / SR
        return (np.sin(2 * np.pi * 1760 * tl) * 0.3 + np.sin(2 * np.pi * 2637 * tl) * 0.15) * np.exp(-tl / 0.09)
    if kind == "key":
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        return (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    if kind == "send":
        nn = int(0.3 * SR)
        tl = np.arange(nn) / SR
        return bp(rng.standard_normal(nn), 1500, 5000) * 0.5 * np.exp(-tl / 0.01) + np.sin(2 * np.pi * (900 + 900 * tl / 0.3) * tl) * 0.25 * np.exp(-tl / 0.07)
    if kind == "crt":
        nn = int(0.6 * SR)
        tl = np.arange(nn) / SR
        return np.sin(2 * np.pi * np.cumsum(9000 * np.exp(-tl / 0.12) + 60) / SR) * 0.05 * np.exp(-tl / 0.25) + np.sin(2 * np.pi * 70 * tl) * 0.35 * np.exp(-tl / 0.09)
    raise ValueError(kind)


sfx = np.zeros(N)


def add(kind, t, gain=1.0, buf=None, **kw):
    sfx_list.append({"t": round(t, 3), "type": kind})
    v = synth(kind, **kw)
    place(sfx if buf is None else buf, v, t, gain)
    return v


# ── countdown bed (rendered on the SCENE's own timeline, then time-warped by the clock: from the brake the
#    playback rate follows the scene clock, (1 − u)², so everything slows down and pitches down to a stop) ──
n_pre = int((t_freeze + 0.2) * SR)
tp = np.arange(n_pre) / SR
ten = np.interp(tp * FPS, fr, tension)
pre = tp < t_freeze + 0.05
bed = (np.sin(2 * np.pi * 46 * tp) + 0.5 * np.sin(2 * np.pi * 69.2 * tp + 0.7)) * 0.03 * (0.5 + 0.8 * ten)
r_ = np.clip((ten - 0.45) / 0.55, 0, 1)
bed += lp(bp(rng.standard_normal(n_pre), 900, 5200) * r_ ** 2 * 0.035, 7000)
# surface tension stretching while it fills and necks: a narrow, creaking resonance whose pitch follows the drop's length,
# with the capillary wobble as a slow tremolo, rising and tightening as the neck thins
f_frame = tp * FPS
grow = np.clip(f_frame / F_NECK, 0, 1)
neck = np.clip((f_frame - F_NECK) / (F_PINCH - F_NECK), 0, 1)
alive = f_frame < F_PINCH
fc = 260 + 420 * grow + 2100 * neck ** 2
noise = rng.standard_normal(n_pre)
# a resonator swept by fc: state-variable filter, sample by sample (cheap enough for 7 s)
lowp = bandp = 0.0
res = np.zeros(n_pre)
q = 0.22
for i in range(n_pre):
    if not alive[i]:
        lowp *= 0.999
        bandp *= 0.999
        res[i] = bandp
        continue
    fcoef = 2 * math.sin(math.pi * fc[i] / SR)
    hi_ = noise[i] - lowp - q * bandp
    bandp += fcoef * hi_
    lowp += fcoef * bandp
    res[i] = bandp
trem = 1 + 0.35 * np.sin(2 * np.pi * 1.5 * tp)
stretch = res / (np.abs(res).max() + 1e-9) * (0.010 + 0.035 * grow + 0.07 * neck ** 1.5) * trem * alive
bed += stretch
# … and a fine, sparse crackle (the film giving, micro-slips at the contact line): density rises with the stretch
dens = (2 + 18 * grow + 60 * neck ** 2) * alive                    # clicks per second
clk = (rng.random(n_pre) < dens / SR).astype(float)
crackle = bp(clk * rng.uniform(0.3, 1.0, n_pre), 1800, 7000) * (0.25 + 0.5 * neck)
bed += crackle * 0.35
# little elastic squeaks as the neck gives
for fq_, fr_k in ((1500, 132), (2100, 139), (2900, 144)):
    v = synth("tick_sat") * 0.6
    place(bed, lp(v, fq_ * 2), fr_k / FPS, 0.25)
# whoosh of the fall: air noise rising with the speed (scene m/s), brighter as it accelerates
spd = np.interp(f_frame, fr, np.array(G["speed"]))
sp_n = np.clip(spd / max(G["speed"]), 0, 1) * (f_frame >= F_PINCH)
air = bp(rng.standard_normal(n_pre), 500, 2500) * 0.6 + bp(rng.standard_normal(n_pre), 2500, 7000) * 0.4
bed += air * sp_n ** 2 * 0.07
# heartbeat inside the bed too, so its last beat stretches with the clock
for b in beats:
    tb = np.interp(b * FPS, fr, tension)
    place(bed, synth("heart", gap=0.2 - 0.07 * tb), b, 0.55 + 0.6 * tb)
    sfx_list.append({"t": round(b, 3), "type": "heart"})
place(bed, synth("plip"), t_pinch, 0.55)
sfx_list.append({"t": round(t_pinch, 3), "type": "plip"})
t_sat = t_pinch + physics.SAT_T / RATE / FPS
place(bed, synth("tick_sat"), t_sat, 0.18)
sfx_list.append({"t": round(t_sat, 3), "type": "tick_sat"})
bed *= pre
# time warp: output sample at film time t reads the bed at φ(t); φ' = 1 until the brake, (1 − u)² to the freeze, then 0
u = np.clip((tp - t_brake) / (t_freeze - t_brake), 0, 1)
rate_film = np.where(tp < t_brake, 1.0, (1 - u) ** 2)
phi = np.concatenate([[0], np.cumsum(rate_film[:-1]) / SR])
warped = np.interp(phi, tp, bed)
warped *= np.where(tp < t_freeze, 1.0, np.exp(-(tp - t_freeze) / 0.004))       # dry silence on the freeze
countdown = np.zeros(N)
countdown[:n_pre] = warped

# freeze: silence + the tiiick + hum (no impact: it never comes)
tick_wave = add("tiiick", t_freeze, 0.6)
add("hum", t_freeze + 0.02, 1.0)
# with the voice
add("cota", ev["cota"], 0.7)
add("label", ev["cotaLabel"], 0.45)
add("glitch", ev["noExiste"], 0.8)
for k in ("offAgua", "offGrifo", "offReflejo"):
    add("off", ev[k], 0.75)
add("relight", ev["relight"], 0.7)
for k in ("ann1", "ann2", "ann3", "ann4"):
    add("tic", ev[k], 0.6)
add("resume", ev["resume"], 0.6)
add("plink", ev["impact"], 0.55)
add("plink", ev["satImpact"], 0.18, f=1900)
add("sweep", ev["sweep"], 0.7)
for k, lab in enumerate(("lMensaje", "lLlamada", "lPresupuesto")):
    add("pop", ev[lab], 0.7, f=[380, 450, 520][k])
drip_ticks = []
for k, lk in enumerate(pipe["leaks"]):
    for d in lk["drops"]:
        drip_ticks.append(round(d + FALL_T, 3))
        add("drip", d + FALL_T, 0.32, f=1500 + 180 * k)
for k in (1, 2, 3):
    add("clamp", ev[f"clamp{k}"], 0.6)
# the pipe running whole: a steady flow (filtered noise with a slow gurgle) from the first clamp to the end of S6, and the
# tank filling: a resonance rising as the level rises
flow = np.zeros(N)
f_on = step(tt, ev["clamp1"], ev["clamp1"] + 0.6) * (1 - step(tt, scenes["S7"] - 0.3, scenes["S7"]))
gurgle = 1 + 0.4 * np.sin(2 * np.pi * 3.1 * tt) * np.sin(2 * np.pi * 0.7 * tt)
flow += bp(rng.standard_normal(N), 250, 1800) * 0.05 * f_on * gurgle
fill = step(tt, pipe["fill"][0], pipe["fill"][1])
fill_tone = np.sin(2 * np.pi * np.cumsum(180 + 520 * fill) / SR) * 0.015 * f_on * (fill > 0) * (fill < 1)
flow += fill_tone + bp(rng.standard_normal(N), 600, 3000) * 0.03 * step(tt, ev["fluye"], ev["fluye"] + 0.3) * (1 - step(tt, pipe["fill"][1], pipe["fill"][1] + 0.3))
for k in range(3):
    add("ok", ev["llegar"] + 0.12 * k, 0.5)
add("glitch", ev["cta"], 0.45)
for k in range(9):
    add("key", ev["typeStart"] + k * ev["typeStep"], 0.7)
add("send", ev["send"], 0.85)
add("crt", ev["crt"], 0.85)

# ── the user's music (optional): from music/from.txt (mm:ss), fading in from the voice, levelled, a dip in the
#    voice's presence band, ducked −9 dB under every word, up a touch on the closing card, out with the last second ──
mus = None
mfiles = [f for f in sorted(os.listdir(MUSIC_DIR)) if f.endswith((".mp3", ".wav", ".m4a"))] if os.path.isdir(MUSIC_DIR) else []
if mfiles:
    frm = open(os.path.join(MUSIC_DIR, "from.txt")).read().strip() if os.path.exists(os.path.join(MUSIC_DIR, "from.txt")) else "0:00"
    m_s = int(frm.split(":")[0]) * 60 + float(frm.split(":")[1])
    t_in = F_VOICE / FPS
    m = load(os.path.join(MUSIC_DIR, mfiles[0]), m_s, TOTAL - t_in + 0.5, ch=2)
    mus = np.zeros((N, 2))
    j0 = int(t_in * SR)
    mus[j0:j0 + len(m)] = m[: N - j0]
    win = int(1.5 * SR)
    rms = np.sqrt(uniform_filter1d(mus.mean(1) ** 2, win) + 1e-10)
    lev = sosfiltfilt(butter(1, 0.6, fs=SR, output="sos"), np.clip(10 ** (-24 / 20) / rms, 0.05, 4.0))
    mus *= lev[:, None]
    for c in range(2):
        mus[:, c] -= 0.45 * bp(mus[:, c], 1500, 4500)
    venv = np.sqrt(uniform_filter1d(voice ** 2, int(0.05 * SR)))
    on = maximum_filter1d(np.clip(venv / (np.percentile(venv[venv > 1e-4], 35) + 1e-9), 0, 1), int(0.25 * SR))
    duck = sosfiltfilt(butter(1, 3, fs=SR, output="sos"), on)
    fade = step(tt, t_in, t_in + 1.5) ** 1.5 * (1 - step(tt, TOTAL - 1.1, TOTAL - 0.05))
    close_up = 1 + 0.6 * step(tt, scenes["C"], scenes["C"] + 0.4)
    mus *= (fade * db(-9 * duck) * close_up)[:, None]

# ── mix + master ──
L = voice + countdown + sfx * 0.6 + flow
R = voice + countdown + np.roll(sfx, 40) * 0.6 + np.roll(flow, 25)
st_nomus = np.stack([L, R], axis=1)
st = st_nomus + (mus * 0.55 if mus is not None else 0)
CEIL = db(-3.0)


def limit(xx):
    env = maximum_filter1d(np.abs(xx).max(axis=1), size=int(0.006 * SR))
    g = np.minimum(1.0, CEIL / (env + 1e-9))
    g = minimum_filter1d(g, size=int(0.012 * SR))
    g = uniform_filter1d(g, size=int(0.006 * SR))
    return xx * g[:, None]


_meter = pyln.Meter(SR)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)


def master(xx, name):
    """−14 LUFS integrated, look-ahead limiter at −3 dBFS (true peak stays under −1 dBTP after AAC)."""
    for _ in range(4):
        xx = limit(xx * db(-14 - _meter.integrated_loudness(xx)))
    pcm = (np.clip(xx, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    os.path.join(ROOT, "public", "audio", name)], input=pcm, check=True)
    return xx


g_master = db(-14 - _meter.integrated_loudness(st))
st = master(st, "mix.wav")
master(st_nomus, "mix_sinmusica.wav")
# stem for the QA: the countdown bed, at master gain
np.save(os.path.join(ROOT, "data", "countdown_stem.npy"), (countdown * g_master)[: int(F_VOICE / FPS * SR)].astype(np.float32))

timeline = {
    "fps": FPS, "durationInFrames": TOTAL_FRAMES, "voiceAt": round(VOICE_AT, 4), "onset": round(onset, 4),
    "music": bool(mfiles), "scenes": {k: round(v, 3) for k, v in scenes.items()}, "captions": captions, "ev": ev, "words": words,
    "segments": [[round(a, 3), round(b, 3)] for a, b in SEGS], "sfx": sfx_list, "beats": [round(b, 4) for b in beats],
    "pipe": pipe, "dripTicks": drip_ticks,
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
m_ = pyln.Meter(SR)
print(f"voice onset {onset:.3f}s → MP3 at {VOICE_AT:.3f}s · total {TOTAL_FRAMES} frames ({TOTAL:.2f}s)")
print("beats", [round(b, 2) for b in beats])
print("scenes", {k: round(v, 2) for k, v in scenes.items()})
print("ev", ev)
print("drops per leak", [len(l["drops"]) for l in pipe["leaks"]])
print("loudness", round(m_.integrated_loudness(st), 2), "LUFS · sample peak", round(20 * np.log10(np.abs(st).max()), 2), "dBFS")
