"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/agentes-ia-pymes/<take>.mp3 (one ElevenLabs take), data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

The take is used as is (no cuts): it starts at VOICE_AT and its own pauses mark the scenes.

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "agentes-ia-pymes")
TAKE = "cacd7835"
SR = 48000
FPS = 30
VOICE_AT = 0.3
_W = json.load(open(os.path.join(ROOT, "data", "words.json")))["A"]
# the take (50.2 s) + ~2 s of logo without voice
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
    "E1": 0.0, "E2": seg_start(1) - 0.15, "E3": seg_start(3) - 0.15, "E4": seg_start(4) - 0.15, "E5": seg_start(5) - 0.15,
    "E6": seg_start(8) - 0.15, "E7": seg_start(10) - 0.15, "E8": seg_start(11) - 0.15, "E9": seg_start(12) - 0.15,
    "E9B": seg_start(13) - 0.15, "E10": seg_start(15) - 0.15, "E11": seg_start(17) - 0.15, "E12": END_V + 0.3, "END": TOTAL,
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
    "E1": cap([("Agentes", wt(0, 1), None), ("de IA", wt(0, 2), None), ("en", wt(0, 7), None), ("tu negocio", wt(0, 11), "o")],
              S["E2"] - 0.1, micro=[["YA ESTÁN LLEGANDO", wt(0, 4)]]),
    "E2": cap([("No solo", wt(1, 0), None), ("responden.", wt(1, 2), None), ("Ejecutan.", wt(2, 1), "o")], S["E3"] - 0.1),
    "E3": cap([("Un asistente", wt(3, 6), None), ("busca", wt(3, 9), None), ("sustituto", wt(3, 10), "o")], S["E4"] - 0.1,
              micro=[["HOMEBASE", wt(3, 4)], ["· 20 OCT 2026", wt(3, 1)], ["· SEGÚN LA EMPRESA", wt(3, 6)]]),
    "E4": cap([("Avisa de", wt(4, 1), None), ("errores", wt(4, 3), "o"), ("en fichajes", wt(4, 4), None)], S["E5"] - 0.1,
              micro=[["ANTES DE LA NÓMINA", wt(4, 7)]]),
    "E5": cap([("Una semana", wt(5, 0), None), ("después", wt(5, 2), "o")], wt(6, 6) - 0.25),
    "E5B": cap([("Facturas vencidas:", wt(6, 7), None), ("prepara", wt(7, 1), None), ("recordatorios", wt(7, 2), "o")], S["E6"] - 0.1,
               micro=[["INTUIT", wt(6, 0)], ["· 27 OCT 2026", wt(6, 1)], ["· SEGÚN LA EMPRESA", wt(6, 3)]]),
    "E6": cap([("Ojo:", wt(8, 0), None), ("lo cuentan", wt(9, 2), None), ("las propias empresas", wt(9, 4), "o")], S["E7"] - 0.1),
    "E7": cap([("Varias", wt(10, 0), None), ("siguen", wt(10, 2), None), ("en pruebas", wt(10, 3), "o")], S["E8"] - 0.1),
    "E8": cap([("La última", wt(11, 4), None), ("palabra:", wt(11, 6), None), ("una persona", wt(11, 8), "o")], S["E9"] - 0.1),
    "E9": cap([("La", wt(12, 0), None), ("lección", wt(12, 1), "o"), ("es clara", wt(12, 5), None)], S["E9B"] - 0.1),
    "E9B": cap([("Automatiza", wt(13, 0), None), ("lo", wt(13, 1), None), ("repetitivo", wt(13, 2), "o")], S["E10"] - 0.1,
               sub=[["con reglas claras:", wt(13, 4)], ["turnos,", wt(14, 1)], ["fichajes", wt(14, 2)], ["o recordatorios.", wt(14, 3)]]),
    "E10": cap([("Dinero", wt(15, 4), None), ("o clientes:", wt(15, 5), None), ("revisión humana", wt(16, 2), "o")], S["E11"] - 0.1),
}
cta = {"comenta": wt(17, 0), "keyword": wt(17, 1), "small": wt(17, 2)}

# ── on-screen events ────────────────────────────────────────────────────
ev = {
    "dolly": 4.0,                                         # camera locks on the business
    "agent": wt(0, 1) - 0.05,                             # the agent lights up ("agentes")
    "tools": wt(0, 9) - 0.25, "toolsStep": 0.16,          # the three tools pop up ("herramientas")
    "bubble": wt(1, 2) - 0.1,                             # a chat bubble: it answers ("responden")
    "exec": wt(2, 1) - 0.05,                              # it runs a lap of the tools ("ejecutan")
    "gap": S["E3"] + 0.35,                                # a shift slot goes dark (someone is off)
    "toStaff": wt(3, 9) - 0.55, "scan": wt(3, 9), "pick": wt(3, 10) + 0.2,
    "walk0": wt(3, 11), "walk1": wt(3, 13) + 0.25,       # the stand-in glides to the board
    "cards": S["E4"] + 0.1, "sweep0": wt(4, 3) - 0.3, "sweep1": wt(4, 6) + 0.35, "flag": wt(4, 6) + 0.05,
    "toInv": S["E5"] + 0.2, "detect": wt(6, 6), "overdue": wt(6, 8), "fold": wt(7, 1), "draft": wt(7, 2) + 0.2,
    "ojo": wt(8, 0), "pills": wt(9, 4), "test": wt(10, 4), "limited": wt(10, 9),
    "human": S["E8"] + 0.2, "deliver0": wt(11, 1), "deliver1": wt(11, 5),
    "approve": wt(11, 9), "send": wt(11, 9) + 0.4,
    "lesson": wt(12, 1), "rails": wt(12, 6) - 0.2, "items": wt(13, 2), "rules": wt(13, 5),
    "f1": wt(14, 1), "f2": wt(14, 2), "f3": wt(14, 4),
    "coins": wt(15, 4), "client": wt(15, 6), "halo": wt(16, 3),
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


# ── music (original, synthesised): warm and busy, F major at 96 BPM ─────────
BPM = 96
beat = 60 / BPM
bar = 4 * beat
prog = [[41, 57, 60, 64, 69], [45, 55, 60, 64, 67], [38, 57, 60, 65, 69], [46, 57, 62, 65, 69]]  # Fmaj7 Am7 Dm7 Bbmaj7
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
# (E6-E8); full again for the lesson (E9) and the CTA; out at E12
intro = step(tt, 0, 1.5)
pl_on = step(tt, S["E2"] - 0.4, S["E2"] + 0.4) * (1 - 0.5 * step(tt, S["E6"] - 0.2, S["E6"]) * (1 - step(tt, S["E9"] - 0.3, S["E9"])))
pulse = step(tt, S["E3"] - 0.2, S["E3"]) * (1 - 0.7 * step(tt, S["E6"] - 0.2, S["E6"]) * (1 - step(tt, S["E9"] - 0.3, S["E9"])))
lift = step(tt, S["E9B"] - 0.2, S["E9B"] + 0.2)
out = 1 - step(tt, S["E12"] - 0.1, S["E12"] + 0.3)
phase = (tt % beat) / beat
pump = 0.6 + 0.4 * np.clip(phase / 0.4, 0, 1) ** 0.7
pump = 1 - (1 - pump) * pulse
mL = (padL * (0.75 + 0.35 * lift) * pump * intro + 0.14 * pluck * pl_on + 0.36 * bass * pulse
      + 0.4 * kick * pulse + 0.07 * hat * pulse * (0.5 + 0.5 * lift)) * out
mR = (padR * (0.75 + 0.35 * lift) * pump * intro + 0.14 * np.roll(pluck, int(0.011 * SR)) * pl_on + 0.36 * bass * pulse
      + 0.4 * kick * pulse + 0.07 * np.roll(hat, 240) * pulse * (0.5 + 0.5 * lift)) * out
# ending chord over the logo (F add9)
i_end = int(S["E12"] * SR)
tl = np.arange(N - i_end) / SR
end_chord = sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (53, 60, 65, 67, 72)) * np.exp(-tl / 1.1) * 0.06 * env_ar(N - i_end, 0.02, 0.3)
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
add("appear", ev["agent"])
for i in range(3):
    add("pop", ev["tools"] + i * ev["toolsStep"], 0.8)
add("pop", ev["bubble"], 0.7)
for i in range(4):
    add("swish", ev["exec"] + i * 0.35, 0.6)
for i in range(3):
    add("blip", ev["exec"] + 0.32 + i * 0.35, 0.8)
add("glitch", ev["gap"], 0.8)
add("swish", ev["toStaff"], 0.6)
add("scan", ev["scan"], 1.0)
add("ding", ev["pick"], 0.7)
add("swish", ev["walk0"], 0.5)
add("clack", ev["walk1"], 1.0)
add("appear", ev["walk1"] + 0.05, 0.5)
for i in range(6):
    add("clack", ev["cards"] + i * 0.08, 0.4)
add("scan", ev["sweep0"], 1.0)
add("glitch", ev["flag"] - 0.1, 0.7)
add("pop", ev["flag"] + 0.15, 0.8)
add("swish", ev["toInv"], 0.6)
add("scan", ev["detect"], 1.0)
add("glitch", ev["overdue"], 0.8)
add("swish", ev["fold"], 0.6)
add("pop", ev["fold"] + 0.35, 0.7)
add("glitch", ev["ojo"] - 0.05, 1.0)
add("pop", ev["pills"], 0.7)
add("pop", ev["pills"] + 0.25, 0.7)
add("glitch", ev["test"], 0.5)
add("pop", ev["limited"], 0.6)
add("appear", ev["human"], 0.8)
add("swish", ev["deliver0"] + 0.1, 0.6)
add("stamp", ev["approve"], 1.0)
add("ding", ev["approve"] + 0.05, 0.6)
add("swish", ev["send"], 0.9)
add("rise", ev["rails"], 0.9)
add("boom", ev["rails"], 0.6)
for k in range(int((S["E10"] - ev["items"]) / (beat))):
    add("clack", ev["items"] + k * beat, 0.25)
for f in ("f1", "f2", "f3"):
    add("blip", ev[f], 0.9)
for i in range(4):
    add("coin", ev["coins"] + i * 0.09, 0.8)
add("appear", ev["client"], 0.6)
add("appear", ev["halo"], 0.8)
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
