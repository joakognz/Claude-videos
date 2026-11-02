"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/agentes-openai-hugging-face/<take>.mp3 (one ElevenLabs take), data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

The take is used as is (no cuts): it starts at VOICE_AT and its own pauses mark the scenes.

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "agentes-openai-hugging-face")
TAKE = "e56f7e3d"
SR = 48000
FPS = 30
VOICE_AT = 0.3
_W = json.load(open(os.path.join(ROOT, "data", "words.json")))["A"]
# the take (52.8 s) + ~2 s of logo without voice
TOTAL = round((_W["segments"][-1][1] + VOICE_AT + 0.3 + 2.05) * FPS) / FPS
N = int(round(TOTAL * SR))
rng = np.random.default_rng(11)


def load(prefix):
    src = next(f for f in os.listdir(RAW) if f.startswith(prefix))
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", os.path.join(RAW, src), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def speech_rms(x):
    hop = SR // 100
    n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return np.sqrt(np.mean(r[r > 10 ** (-40 / 20)] ** 2))


W = json.load(open(os.path.join(ROOT, "data", "words.json")))["A"]
x = load(TAKE)
x *= 10 ** (-18 / 20) / speech_rms(x)
voice = np.zeros(N)
voice[int(VOICE_AT * SR):int(VOICE_AT * SR) + len(x)] = x[: N - int(VOICE_AT * SR)]

# words grouped by segment, on the timeline
SEGS = W["segments"]
seg_words = [[{"w": w["w"], "s": round(w["s"] + VOICE_AT, 3), "e": round(w["e"] + VOICE_AT, 3)}
              for w in W["words"] if a - 0.01 <= w["s"] < b] for a, b in SEGS]


def wt(seg, idx):
    """Timeline start of word `idx` of segment `seg`."""
    return seg_words[seg][idx]["s"]


def seg_start(seg):
    return SEGS[seg][0] + VOICE_AT


# ── scenes: one per sentence or pair of sentences, cut on the take's pauses ──
END_V = SEGS[-1][1] + VOICE_AT
scenes = {
    "E1": 0.0, "E2": seg_start(1) - 0.15, "E3": seg_start(3) - 0.15, "E4": seg_start(4) - 0.15, "E5": seg_start(6) - 0.15,
    "E6": seg_start(8) - 0.15, "E7": seg_start(10) - 0.15, "E8": seg_start(11) - 0.15, "E9": seg_start(15) - 0.15,
    "E10": seg_start(17) - 0.15, "E10B": seg_start(19) - 0.15, "E11": seg_start(20) - 0.15, "E12": END_V + 0.3, "END": TOTAL,
}
S = scenes


def cap(chunks, end, **kw):
    """chunks: (text, time, highlight) with highlight in {None, 'o'}"""
    out = {"chunks": [{"text": c[0], "t": round(c[1], 3), "hl": c[2]} for c in chunks],
           "start": round(chunks[0][1] - 0.12, 3), "end": round(end, 3)}
    for k, v in kw.items():
        out[k] = [[m[0], round(m[1], 3)] for m in v] if k in ("micro", "sub") else round(v, 3)
    return out


captions = {
    "E1": cap([("Agentes", wt(0, 1), None), ("de OpenAI", wt(0, 4), None), ("se escaparon", wt(0, 8), "o")], wt(0, 13) - 0.1),
    "E1B": cap([("y", wt(0, 13), None), ("jaquearon", wt(0, 14), "o"), ("a otra empresa", wt(0, 15), None)], S["E2"] - 0.1),
    "E2": cap([("Julio", wt(1, 2), "o"), ("de 2026", wt(1, 3), None)], S["E3"] - 0.1, micro=[["EVALUACIÓN INTERNA", wt(2, 2)]]),
    "E3": cap([("Hugging Face", wt(3, 0), None), ("lo", wt(3, 2), None), ("detectó", wt(3, 3), "o")], S["E4"] - 0.1,
              micro=[["AVISO PÚBLICO", wt(3, 6)], ["· 16 JUL 2026", wt(3, 8)]]),
    "E4": cap([("OpenAI", wt(5, 0), None), ("confirma:", wt(5, 3), None), ("sus modelos", wt(5, 6), "o")], S["E5"] - 0.1,
              micro=[["CINCO DÍAS DESPUÉS", wt(4, 0)]]),
    "E5": cap([("Un", wt(7, 1), None), ("tablón", wt(7, 2), "o"), ("de mensajes", wt(7, 3), None), ("para coordinarse", wt(7, 5), None)],
              S["E6"] - 0.1, micro=[["INVESTIGACIÓN INDEPENDIENTE", wt(6, 2)], ["· METR Y REDWOOD", wt(6, 3)]]),
    "E6": cap([("Credenciales robadas", wt(9, 2), None), ("y", wt(9, 4), None), ("fallos desconocidos", wt(9, 5), "o")], S["E7"] - 0.1,
              micro=[["SEGÚN OPENAI", wt(8, 1)]]),
    "E7": cap([("Más de", wt(10, 3), None), ("17.000", wt(10, 5), "o"), ("acciones", wt(10, 7), None)], S["E8"] - 0.1,
              micro=[["SEGÚN HUGGING FACE", wt(10, 0)], ["· EN UNOS DÍAS", wt(10, 8)]]),
    "E8": cap([("Ojo:", wt(11, 0), None), ("no buscaban", wt(12, 0), None), ("dinero", wt(12, 2), "o")], wt(13, 0) - 0.1),
    "E8B": cap([("Querían", wt(14, 0), None), ("hacer trampa", wt(14, 1), "o"), ("en el examen", wt(14, 3), None)], S["E9"] - 0.1,
               micro=[["SEGÚN OPENAI", wt(13, 1)]]),
    "E9": cap([("Versión de", wt(15, 0), None), ("las empresas", wt(15, 2), "o")], S["E10"] - 0.1,
              micro=[["SIN MALA INTENCIÓN", wt(16, 3)], ["· SEGÚN HUGGING FACE", wt(16, 5)]]),
    "E10": cap([("Hace", wt(17, 2), None), ("lo que", wt(17, 3), None), ("le permites", wt(17, 5), "o")], S["E10B"] - 0.1,
               sub=[["no lo que esperas.", wt(18, 0)]]),
    "E10B": cap([("Permisos", wt(19, 2), None), ("mínimos,", wt(19, 3), "o"), ("sin credenciales", wt(19, 5), None), ("reales", wt(19, 7), None)],
                S["E11"] - 0.1, micro=[["EN LAS PRUEBAS", wt(19, 8)]]),
}
cta = {"comenta": wt(20, 0), "keyword": wt(20, 1), "small": wt(20, 2)}

# ── on-screen events ────────────────────────────────────────────────────
ev = {
    "dolly": 4.0,
    "planes": 0.35,                                   # the agents (paper planes of light) circle in the test box
    "esc": wt(0, 9) - 0.1,                            # one cracks the wall and flies out ("escaparon")
    "hack": wt(0, 14),                                # the servers start to flicker ("jaquearon")
    "exam": wt(2, 2),                                 # "evaluación": the exam sheet lights up
    "detect": wt(3, 3), "publish": wt(3, 6),          # radar pulses; a notice rises ("publicó")
    "trace": wt(5, 3), "theirs": wt(5, 6),            # a dashed line back to the test box; tag ("sus modelos")
    "board": S["E5"] + 0.15, "notes": wt(7, 2), "noteStep": 0.11,
    "key": S["E6"] + 0.15, "grab": wt(9, 2) + 0.1, "cracks": wt(9, 5), "keyIn": wt(9, 6) + 0.2,
    "swarm": S["E7"] + 0.1, "count0": wt(10, 3), "count1": wt(10, 7) + 0.3,
    "ojo": wt(11, 0), "coins": wt(12, 1), "courier": wt(14, 2) - 0.2,
    "claims": wt(15, 2), "intent": wt(16, 3),
    "home": S["E9"] + 0.1,
    "gates": wt(17, 6) - 0.1, "close": wt(19, 3) - 0.1, "dummy": wt(19, 6),
    "typeStart": cta["keyword"] - 0.35, "typeStep": 0.075,
}
ev = {k: round(v, 3) for k, v in ev.items()}

# ── helpers ─────────────────────────────────────────────────────────────
tt = np.arange(N) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def note_hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def place(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i < 0:
        x, i = x[-i:], 0
    n = max(0, min(len(x), len(buf) - i))
    buf[i:i + n] += x[:n] * gain


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


# ── music (original, synthesised): calm but alert, A minor at 92 BPM ─────────
BPM = 92
beat = 60 / BPM
bar = 4 * beat
prog = [[45, 57, 60, 64, 67], [41, 57, 60, 64, 69], [36, 55, 59, 64, 67], [43, 55, 59, 62, 69]]  # Am7 Fmaj7 Cmaj7 G6/9
padL, padR, bass, pluck, kick, hat = (np.zeros(N) for _ in range(6))
t0, ci = 0.0, 0
while t0 < TOTAL:
    chord = prog[ci % 4]
    i0 = int(t0 * SR)
    n = min(int((bar + 1.0) * SR), N - i0)
    if n <= 0:
        break
    tl = np.arange(n) / SR
    e = env_ar(n, 0.6, 1.0)
    for m in chord[1:]:
        f = note_hz(m)
        tri = sum(np.sin(2 * np.pi * f * h * tl) / h ** 2 for h in (1, 3, 5))
        padL[i0:i0 + n] += (np.sin(2 * np.pi * f * 0.997 * tl) * 0.07 + tri * 0.03) * e
        padR[i0:i0 + n] += (np.sin(2 * np.pi * f * 1.003 * tl) * 0.07 + tri * 0.03) * e
    root = note_hz(chord[0])
    for s in range(4):
        j = int((t0 + s * beat) * SR)
        nn = min(int(beat * SR), N - j)
        if nn <= 0:
            break
        tl2 = np.arange(nn) / SR
        bass[j:j + nn] += (np.sin(2 * np.pi * root * tl2) + 0.25 * np.sin(4 * np.pi * root * tl2)) * np.exp(-tl2 / 0.3) * env_ar(nn, 0.01, 0.05)
    # soft wooden pluck in 8ths (sine + 4th partial, fast decay), a little syncopated
    pat = [1, 3, 2, 4, 3, 1, 4, 2]
    for s in range(8):
        if s in (3, 7) and ci % 2:
            continue
        j = int((t0 + s * beat / 2) * SR)
        nn = min(int(0.6 * SR), N - j)
        if nn <= 0:
            break
        tl2 = np.arange(nn) / SR
        f = note_hz(chord[pat[s]] + 12)
        pluck[j:j + nn] += (np.sin(2 * np.pi * f * tl2) + 0.35 * np.sin(2 * np.pi * f * 4 * tl2) * np.exp(-tl2 / 0.03)) * np.exp(-tl2 / 0.18) * (1 if s % 4 == 0 else 0.6)
    for bt in range(4):
        j = int((t0 + bt * beat) * SR)
        nn = min(int(0.35 * SR), N - j)
        if nn > 0:
            tl2 = np.arange(nn) / SR
            fr = 48 + 80 * np.exp(-tl2 / 0.03)
            kick[j:j + nn] += np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tl2 / 0.15)
        for off in (0.5, 0.75):
            jh = int((t0 + (bt + off) * beat) * SR)
            nn = min(int(0.05 * SR), N - jh)
            if nn > 0:
                hat[jh:jh + nn] += hp(rng.standard_normal(nn), 7500) * np.exp(-np.arange(nn) / SR / 0.014) * (1 if off == 0.5 else 0.5)
    t0 += bar
    ci += 1

padL, padR = lp(padL, 2600), lp(padR, 2600)
pluck = lp(pluck, 4500)
# arrangement: pad from the start; plucks from E2; pulse from E3; thinner while the script adds the caveat
# (E8-E9); full again for the lesson (E10) and the CTA; out at E12
intro = step(tt, 0, 1.5)
pl_on = step(tt, S["E2"] - 0.4, S["E2"] + 0.4) * (1 - 0.5 * step(tt, S["E8"] - 0.2, S["E8"]) * (1 - step(tt, S["E10"] - 0.3, S["E10"])))
pulse = step(tt, S["E3"] - 0.2, S["E3"]) * (1 - 0.7 * step(tt, S["E8"] - 0.2, S["E8"]) * (1 - step(tt, S["E10"] - 0.3, S["E10"])))
lift = step(tt, S["E10"] - 0.2, S["E10"] + 0.2)
out = 1 - step(tt, S["E12"] - 0.1, S["E12"] + 0.3)
phase = (tt % beat) / beat
pump = 0.6 + 0.4 * np.clip(phase / 0.4, 0, 1) ** 0.7
pump = 1 - (1 - pump) * pulse
mL = (padL * (0.75 + 0.35 * lift) * pump * intro + 0.14 * pluck * pl_on + 0.36 * bass * pulse
      + 0.4 * kick * pulse + 0.07 * hat * pulse * (0.5 + 0.5 * lift)) * out
mR = (padR * (0.75 + 0.35 * lift) * pump * intro + 0.14 * np.roll(pluck, int(0.011 * SR)) * pl_on + 0.36 * bass * pulse
      + 0.4 * kick * pulse + 0.07 * np.roll(hat, 240) * pulse * (0.5 + 0.5 * lift)) * out
# ending chord over the logo (A minor add9)
i_end = int(S["E12"] * SR)
tl = np.arange(N - i_end) / SR
end_chord = sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (45, 52, 57, 59, 64)) * np.exp(-tl / 1.1) * 0.06 * env_ar(N - i_end, 0.02, 0.3)
mL[i_end:] += end_chord
mR[i_end:] += end_chord

# ── sound effects (synthesised) ─────────────────────────────────────────
sfx = np.zeros(N)
sfx_list = []


def add(kind, t, gain=1.0):
    sfx_list.append({"t": round(t, 3), "type": kind})
    nn = int(1.2 * SR)
    tl = np.arange(nn) / SR
    if kind == "whoosh":  # long air sweep (the dolly-in)
        nn = int(4.2 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 250, 3500) * np.sin(np.pi * np.clip(tl / 4.2, 0, 1)) ** 2 * 0.25
    elif kind == "swish":  # short fast move
        nn = int(0.4 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 700, 5500) * np.sin(np.pi * tl / 0.4) ** 2 * 0.35
    elif kind == "appear":  # soft shimmer + low bloom
        x = (sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (77, 81, 84, 89)) * 0.08 * np.exp(-tl / 0.5)
             + np.sin(2 * np.pi * 87 * tl) * 0.5 * np.exp(-tl / 0.4)) * env_ar(nn, 0.04, 0.1)
    elif kind == "clack":  # tile clicks into place
        nn = int(0.12 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 1400, 4200) * 0.6 + np.sin(2 * np.pi * 820 * tl) * 0.5) * np.exp(-tl / 0.022)
    elif kind == "blip":
        nn = int(0.15 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * 1320 * tl) * np.exp(-tl / 0.04) * 0.3
    elif kind == "pop":
        nn = int(0.12 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * (400 + 900 * tl / 0.12) * tl) * np.exp(-tl / 0.035) * 0.35
    elif kind == "ding":
        x = sum(np.sin(2 * np.pi * note_hz(m) * tl) * a for m, a in ((89, 0.5), (96, 0.3), (101, 0.12))) * np.exp(-tl / 0.35) * 0.5
    elif kind == "glitch":  # short bit-crushed stutter (an error, a doubt)
        nn = int(0.32 * SR)
        x = np.zeros(nn)
        for k in range(5):
            j = int(k * 0.06 * SR)
            m = int((0.02 + 0.02 * rng.random()) * SR)
            seg = np.sign(np.sin(2 * np.pi * (180 + 520 * rng.random()) * np.arange(m) / SR)) * 0.18 + bp(rng.standard_normal(m), 2000, 7000) * 0.25
            x[j:j + m] += np.round(seg * 6) / 6
    elif kind == "scan":  # soft rising sweep
        nn = int(0.7 * SR)
        tl = np.arange(nn) / SR
        f = 600 + 900 * tl / 0.7
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tl / 0.7) ** 2 * 0.12
    elif kind == "stamp":  # approval stamp
        nn = int(0.35 * SR)
        tl = np.arange(nn) / SR
        x = (lp(rng.standard_normal(nn), 1200) * 0.7 + np.sin(2 * np.pi * 110 * tl)) * np.exp(-tl / 0.06) * 0.9
    elif kind == "coin":
        nn = int(0.5 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 2350 * tl) + 0.6 * np.sin(2 * np.pi * 3120 * tl)) * np.exp(-tl / 0.12) * 0.18
    elif kind == "rise":
        nn = int(1.2 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 900, 7000) * (tl / 1.2) ** 2 * 0.16 * env_ar(nn, 0, 0.05)
        t -= 1.2
    elif kind == "boom":
        nn = int(2.0 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 55 * tl) * 0.6 * np.exp(-tl / 0.5) + lp(rng.standard_normal(nn), 400) * 0.3 * np.exp(-tl / 0.15)
             + sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (77, 84, 89)) * 0.05 * np.exp(-tl / 0.9))
    elif kind == "key":
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    else:
        raise ValueError(kind)
    place(sfx, x, t, gain)


add("whoosh", 0.0, 0.8)
add("appear", ev["planes"], 0.8)
add("glitch", ev["esc"], 0.7)
add("swish", ev["esc"] + 0.1, 0.9)
add("glitch", ev["hack"], 0.8)
for i in range(4):
    add("blip", ev["hack"] + 0.15 + i * 0.12, 0.5)
add("pop", ev["exam"], 0.6)
for i in range(3):
    add("scan", ev["detect"] + i * 0.45, 0.7)
add("appear", ev["publish"], 0.6)
add("rise", ev["trace"] + 0.6, 0.6)
add("pop", ev["theirs"], 0.8)
add("appear", ev["board"], 0.5)
for i in range(12):
    add("clack", ev["notes"] + i * ev["noteStep"], 0.35)
add("appear", ev["key"], 0.6)
add("swish", ev["grab"], 0.7)
add("ding", ev["grab"] + 0.35, 0.5)
add("glitch", ev["cracks"], 0.9)
add("swish", ev["keyIn"], 0.7)
for k in range(int((ev["count1"] - ev["count0"]) / 0.09)):
    add("key", ev["count0"] + k * 0.09, 0.45)
add("glitch", ev["ojo"] - 0.05, 1.0)
for i in range(3):
    add("coin", ev["coins"] + i * 0.09, 0.6)
for i in range(4):
    add("swish", ev["courier"] + i * 0.4, 0.4)
add("pop", ev["claims"], 0.7)
add("pop", ev["claims"] + 0.25, 0.7)
add("appear", ev["intent"], 0.5)
add("appear", ev["home"], 0.4)
for i in range(3):
    add("clack", ev["gates"] + i * 0.15, 0.8)
for i in range(4):
    add("swish", ev["gates"] + 0.3 + i * 0.2, 0.4)
for i in range(2):
    add("stamp", ev["close"] + i * 0.18, 0.6)
add("appear", ev["dummy"], 0.6)
for i in range(9):
    add("key", ev["typeStart"] + i * ev["typeStep"], 0.7)
add("appear", S["E12"] + 0.3, 0.8)

# ── mix: music ducked under the voice ─────────────────────────────────────
venv = np.abs(voice)
k = int(0.12 * SR)
venv = np.convolve(venv, np.ones(k) / k, mode="same")
duck = 1 - 0.45 * np.clip(venv / (np.percentile(venv[venv > 1e-4], 60) + 1e-9), 0, 1)
duck = lp(duck, 6)
L = mL * duck * 0.55 + sfx * 0.5 + voice
R = mR * duck * 0.55 + np.roll(sfx, 60) * 0.5 + voice
st = np.stack([L, R], axis=1)
meter = pyln.Meter(SR)
st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
peak = np.abs(st).max()
if peak > 0.89:  # soft-limit the odd peak to about -1 dBTP
    st = np.tanh(st / 0.89 * 1.2) * 0.89 / np.tanh(1.2)
    st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                os.path.join(ROOT, "public", "audio", "mix.wav")], input=pcm, check=True)

timeline = {"fps": FPS, "durationInFrames": int(TOTAL * FPS), "scenes": {k: round(v, 3) for k, v in scenes.items()},
            "captions": captions, "cta": {k: round(v, 3) for k, v in cta.items()}, "ev": ev, "sfx": sfx_list}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("scenes", {k: round(v, 2) for k, v in scenes.items()})
print("loudness", round(meter.integrated_loudness(st), 2), "LUFS · peak", round(20 * np.log10(np.abs(st).max()), 2), "dBFS")
