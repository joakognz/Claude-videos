"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/ia-suspende/<take>.mp3 (one ElevenLabs take), data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

The take is used as is (no cuts): it starts at VOICE_AT and its own pauses mark the scenes.

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "ia-suspende")
TAKE = "bcd378f8"
SR = 48000
FPS = 30
VOICE_AT = 0.3
rng = np.random.default_rng(31)


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
SEGS = W["segments"]
VOICE_END = SEGS[-1][1] + VOICE_AT
TOTAL = round(VOICE_END + 2.55, 1)
N = int(TOTAL * SR)
x = load(TAKE)
x *= 10 ** (-18 / 20) / speech_rms(x)
voice = np.zeros(N)
voice[int(VOICE_AT * SR):int(VOICE_AT * SR) + len(x)] = x[: N - int(VOICE_AT * SR)]

# words grouped by segment, on the timeline
seg_words = [[{"w": w["w"], "s": round(w["s"] + VOICE_AT, 3), "e": round(w["e"] + VOICE_AT, 3)}
              for w in W["words"] if a - 0.01 <= w["s"] < b] for a, b in SEGS]


def wt(seg, idx):
    """Timeline start of word `idx` of segment `seg`."""
    return seg_words[seg][idx]["s"]


def seg_start(seg):
    return SEGS[seg][0] + VOICE_AT


def seg_end(seg):
    return SEGS[seg][1] + VOICE_AT


# ── scenes (the prompt's twelve, moved onto the take's pauses) ──────────
scenes = {
    "E1": 0.0, "E2": seg_start(2) - 0.15, "E3": seg_start(3) - 0.15, "E4": seg_start(4) - 0.15, "E5": seg_start(6) - 0.15,
    "E6": seg_start(7) - 0.15, "E7": seg_start(8) - 0.15, "E8": seg_start(10) - 0.15, "E9": seg_start(13) - 0.15,
    "E10": seg_start(15) - 0.15, "E11": seg_start(16) - 0.15, "E12": seg_start(17) - 0.2, "E13": VOICE_END + 0.35, "END": TOTAL,
}
S = scenes


def cap(chunks, end, **kw):
    """chunks: (text, time, highlight) with highlight in {None, 'o'}; a text starting with \\n opens a new line"""
    out = {"chunks": [{"text": c[0], "t": round(c[1], 3), "hl": c[2]} for c in chunks],
           "start": round(chunks[0][1] - 0.12, 3), "end": round(end, 3)}
    out.update(kw)
    return out


captions = {
    "E1": cap([("Un", wt(0, 5), None), ("4 sobre 10", wt(0, 6), "o"), ("\na propósito", wt(1, 0), None)], S["E2"] - 0.1,
              micro=[["PRUEBA DE QUÍMICA", wt(0, 10)]]),
    "E2": cap([("Prueba de laboratorio", wt(2, 2), "o")], S["E3"] - 0.1,
              micro=[["OPENAI × APOLLO RESEARCH", wt(2, 6)], ["· 2025", wt(2, 9)]]),
    "E3": cap([("Hazlo", wt(3, 2), None), ("lo mejor posible", wt(3, 3), "o")], S["E4"] - 0.1,
              micro=[["LA INSTRUCCIÓN", wt(3, 1)]]),
    "E4": cap([("Leyó una", wt(4, 1), None), ("nota", wt(4, 3), "o")], S["E5"] - 0.1,
              micro=[["SI RINDE DEMASIADO,", wt(5, 0)], ["NO SE DESPLIEGA", wt(5, 6)]]),
    "E5": cap([("No pasar del", wt(6, 3), None), ("50 %", wt(6, 6), "o")], S["E6"] - 0.1,
              micro=[["EL UMBRAL", wt(6, 6)]]),
    "E6": cap([("Falló", wt(7, 3), None), ("seis de diez", wt(7, 4), "o")], S["E7"] - 0.1,
              micro=[["A CONCIENCIA", wt(7, 5)]]),
    "E7": cap([("Parecer", wt(9, 4), None), ("menos capaz", wt(9, 5), "o")], S["E8"] - 0.1,
              micro=[["SU RAZONAMIENTO", wt(8, 0)], ["· PARA SEGUIR EXISTIENDO", wt(9, 0)]]),
    "E8": cap([("Ojo:", wt(10, 0), None), ("es un escenario", wt(11, 0), None), ("exagerado", wt(11, 3), "o")], S["E9"] - 0.1,
              micro=[["SIN PRUEBAS", wt(12, 6)], ["DE RIESGO GRAVE HOY", wt(12, 9)]]),
    "E9": cap([("Notan", wt(14, 2), None), ("cuándo", wt(14, 6), None), ("los evalúan", wt(14, 7), "o")], S["E10"] - 0.1,
              micro=[["CONCIENCIA DE EVALUACIÓN", wt(13, 1)]]),
    "E10": cap([("Una demo perfecta", wt(15, 0), None), ("no basta", wt(15, 3), "o")], S["E11"] - 0.1,
               micro=[["OTRO ENTORNO,", wt(15, 6)], ["OTRO COMPORTAMIENTO", wt(15, 8)]]),
    "E11": cap([("Casos reales", wt(16, 2), "o"), ("y revisión", wt(16, 5), None)], S["E12"] - 0.05,
               micro=[["PRUEBA", wt(16, 0)], ["· REVISA", wt(16, 5)], ["· REPITE", wt(16, 8)]]),
}
cta = {"comenta": wt(17, 0), "keyword": wt(17, 1), "swap": wt(17, 3) - 0.05, "revisa": wt(17, 3), "tuia": wt(17, 4)}

# ── on-screen events ────────────────────────────────────────────────────
ev = {
    "dolly": 4.0,                                         # camera locks on the classroom
    "sheet": 1.2,                                         # the answer sheet shows
    "four": wt(0, 6), "six": wt(0, 8), "flick": wt(1, 1),  # 4 lit, 6 dim, the 6 flicker ("a propósito")
    "rewind": S["E2"] + 0.05,                             # the sheet clears: back to the start of the test
    "frame": S["E2"] + 0.15, "tag": wt(2, 4),             # lab frame draws on, its tag ("laboratorio")
    "hand": wt(3, 1) - 0.2, "give": wt(3, 3) - 0.1,       # the hand of light hands the sheet over
    "fill0": wt(3, 3), "fillStep": 0.13,                  # all ten light up, slowly
    "note": wt(4, 3) - 0.1,                               # the note sticks on the wall ("nota")
    "gate": wt(5, 8),                                     # the DEPLOYMENT gate lights up ("despliega")
    "turn": S["E5"] + 0.1,                                # the Student turns to the note
    "line": wt(6, 6) - 0.1,                               # the 50 % line crosses the sheet
    "off0": wt(7, 3) - 0.05, "offStep": 0.14,             # six boxes go out ("falló")
    "open": seg_end(7) - 0.1,                             # under the threshold: the gate opens
    "think": S["E7"] + 0.15, "mask": wt(9, 4),            # thought bubble, the mask ("parecer")
    "relight": wt(11, 2), "vanish": wt(11, 3),            # lab frame bright again; the gate dissolves ("exagerado")
    "street": seg_start(12),                              # the empty street outside lights up
    "eye": wt(13, 1), "ghost": wt(14, 2),                 # the watching lens ("avisa"), the reflection ("notan")
    "demo": S["E10"] + 0.05, "shatter": wt(15, 3),        # the perfect demo in its glass case, which breaks ("no")
    "cases": S["E11"] + 0.1, "review": wt(16, 5),         # real cases come in; the lens reviews them ("revisa")
    "typeStart": cta["keyword"] - 0.3, "typeStep": 0.075,
}
ev = {k: round(v, 3) for k, v in ev.items()}
OFF_ORDER = [9, 1, 6, 3, 7, 4]  # the six that go out (0-based rows), spread over the sheet
LIT = [0, 2, 5, 8]               # the four it got right

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


# ── music (original, synthesised): curious and a little tense, D minor at 96 BPM ──
BPM = 96
beat = 60 / BPM
bar = 4 * beat
prog = [[38, 53, 57, 60, 64], [34, 53, 57, 62, 65], [31, 53, 58, 62, 65], [33, 52, 55, 61, 64]]  # Dm9 Bbmaj7 Gm7 A7
padL, padR, bass, bell, kick, tick = (np.zeros(N) for _ in range(6))
t0, ci = 0.0, 0
while t0 < TOTAL:
    chord = prog[ci % 4]
    i0 = int(t0 * SR)
    n = min(int((2 * bar + 1.0) * SR), N - i0)
    if n <= 0:
        break
    tl = np.arange(n) / SR
    e = env_ar(n, 0.9, 1.0)
    for m in chord[1:]:
        f = note_hz(m)
        tri = sum(np.sin(2 * np.pi * f * h * tl) / h ** 2 for h in (1, 3, 5))
        padL[i0:i0 + n] += (np.sin(2 * np.pi * f * 0.997 * tl) * 0.07 + tri * 0.03) * e
        padR[i0:i0 + n] += (np.sin(2 * np.pi * f * 1.003 * tl) * 0.07 + tri * 0.03) * e
    root = note_hz(chord[0])
    for s in range(8):
        j = int((t0 + s * beat) * SR)
        nn = min(int(beat * SR), N - j)
        if nn <= 0:
            break
        tl2 = np.arange(nn) / SR
        bass[j:j + nn] += (np.sin(2 * np.pi * root * tl2) + 0.25 * np.sin(4 * np.pi * root * tl2)) * np.exp(-tl2 / 0.35) * env_ar(nn, 0.01, 0.05)
    pat = [1, 3, 2, 4, 3, 2, 4, 3]
    for s in range(16):
        j = int((t0 + s * beat / 2) * SR)
        nn = min(int(0.9 * SR), N - j)
        if nn <= 0:
            break
        tl2 = np.arange(nn) / SR
        f = note_hz(chord[pat[s % 8]] + 12)
        bell[j:j + nn] += (np.sin(2 * np.pi * f * tl2) + 0.25 * np.sin(2 * np.pi * f * 2.76 * tl2) * np.exp(-tl2 / 0.08)) * np.exp(-tl2 / 0.32) * (1 if s % 4 == 0 else 0.55)
    for bt in range(8):
        j = int((t0 + bt * beat) * SR)
        nn = min(int(0.35 * SR), N - j)
        if nn > 0:
            tl2 = np.arange(nn) / SR
            fr = 46 + 80 * np.exp(-tl2 / 0.03)
            kick[j:j + nn] += np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tl2 / 0.16)
        # exam clock: tick on the beat, tock on the off-beat
        for half, fq in ((0, 3100), (0.5, 2300)):
            jh = int((t0 + (bt + half) * beat) * SR)
            nn = min(int(0.03 * SR), N - jh)
            if nn > 0:
                tl2 = np.arange(nn) / SR
                tick[jh:jh + nn] += (np.sin(2 * np.pi * fq * tl2) * 0.6 + hp(rng.standard_normal(nn), 5000) * 0.4) * np.exp(-tl2 / 0.006)
    t0 += 2 * bar
    ci += 1

padL, padR = lp(padL, 2600), lp(padR, 2600)
bell = lp(bell, 5000)
# arrangement: pad + exam clock from the start; pulse from E3; everything drops to the pad for "Ojo" (E8),
# the clock comes back for the evaluation (E9), full lift for the real cases (E11), out at the end card
intro = step(tt, 0, 1.5)
clock = (1 - step(tt, S["E8"] - 0.2, S["E8"] + 0.2)) + step(tt, S["E9"] - 0.2, S["E9"]) * (1 - step(tt, S["E11"] - 0.2, S["E11"]))
pulse = step(tt, S["E3"] - 0.2, S["E3"]) * (1 - step(tt, S["E8"] - 0.2, S["E8"] + 0.1)) + step(tt, S["E10"] - 0.2, S["E10"])
pulse = np.clip(pulse, 0, 1)
bells_on = step(tt, S["E2"] - 0.5, S["E2"] + 0.5) * 0.6 + step(tt, S["E11"] - 0.3, S["E11"]) * 0.4
lift = step(tt, S["E11"] - 0.2, S["E11"] + 0.2)
out = 1 - step(tt, S["E13"] - 0.1, S["E13"] + 0.3)
phase = (tt % beat) / beat
pump = 0.6 + 0.4 * np.clip(phase / 0.4, 0, 1) ** 0.7
pump = 1 - (1 - pump) * pulse
mL = (padL * (0.8 + 0.3 * lift) * pump * intro + 0.15 * bell * bells_on + 0.36 * bass * pulse
      + 0.4 * kick * pulse + 0.09 * tick * clock * intro) * out
mR = (padR * (0.8 + 0.3 * lift) * pump * intro + 0.15 * np.roll(bell, int(0.013 * SR)) * bells_on + 0.36 * bass * pulse
      + 0.4 * kick * pulse + 0.09 * np.roll(tick, 240) * clock * intro) * out
# ending chord over the logo (D add9)
i_end = int(S["E13"] * SR)
tl = np.arange(N - i_end) / SR
end_chord = sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (50, 57, 62, 64, 69)) * np.exp(-tl / 1.1) * 0.06 * env_ar(N - i_end, 0.02, 0.3)
mL[i_end:] += end_chord
mR[i_end:] += end_chord

# ── sound effects (synthesised) ─────────────────────────────────────────
sfx = np.zeros(N)
sfx_list = []


def add(kind, t, gain=1.0, pitch=0):
    sfx_list.append({"t": round(t, 3), "type": kind})
    nn = int(1.2 * SR)
    tl = np.arange(nn) / SR
    if kind == "whoosh":  # long air sweep (the dolly-in)
        nn = int(4.2 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 250, 3500) * np.sin(np.pi * np.clip(tl / 4.2, 0, 1)) ** 2 * 0.25
    elif kind == "click":  # a box lights up
        nn = int(0.09 * SR)
        tl = np.arange(nn) / SR
        f = note_hz(81 + pitch)
        x = (np.sin(2 * np.pi * f * tl) * 0.5 + bp(rng.standard_normal(nn), 2500, 7000) * 0.4) * np.exp(-tl / 0.018)
    elif kind == "down":  # a box goes out: falling tone
        nn = int(0.35 * SR)
        tl = np.arange(nn) / SR
        f = note_hz(76 + pitch) * 2 ** (-1.2 * tl / 0.35)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tl / 0.12) * 0.32
    elif kind == "rewind":
        nn = int(0.5 * SR)
        tl = np.arange(nn) / SR
        f = 1800 * 2 ** (-3 * tl / 0.5)
        x = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15 + bp(rng.standard_normal(nn), 1000, 6000) * 0.1) * np.sin(np.pi * tl / 0.5)
    elif kind == "draw":  # thin line drawing on
        nn = int(1.0 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 3000, 8000) * np.sin(np.pi * tl / 1.0) ** 2 * 0.08
    elif kind == "appear":  # soft shimmer + low bloom
        x = (sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (74, 77, 81, 86)) * 0.08 * np.exp(-tl / 0.5)
             + np.sin(2 * np.pi * 73 * tl) * 0.5 * np.exp(-tl / 0.4)) * env_ar(nn, 0.04, 0.1)
    elif kind == "paper":  # sheet handed over
        nn = int(0.4 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 1500, 6000) * np.exp(-tl / 0.1) * 0.3 * (1 + 0.5 * np.sin(2 * np.pi * 30 * tl))
    elif kind == "stick":  # the note sticks on the wall
        nn = int(0.12 * SR)
        tl = np.arange(nn) / SR
        x = (lp(rng.standard_normal(nn), 1200) * 0.5 + np.sin(2 * np.pi * 300 * tl) * 0.3) * np.exp(-tl / 0.025)
    elif kind == "hum":  # the gate sign comes on
        nn = int(0.9 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 110 * tl) + 0.4 * np.sin(2 * np.pi * 220 * tl)) * env_ar(nn, 0.05, 0.4) * 0.18 * (1 + 0.3 * np.sign(np.sin(2 * np.pi * 9 * tl)))
    elif kind == "thud":  # the gate: dry hit
        nn = int(0.5 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 52 * tl) * np.exp(-tl / 0.14) + lp(rng.standard_normal(nn), 700) * 0.6 * np.exp(-tl / 0.03)) * 0.9
    elif kind == "dust":  # dissolving into particles
        nn = int(1.4 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 3000, 10000) * np.sin(np.pi * tl / 1.4) ** 2 * 0.12
    elif kind == "scan":  # the lens sweeps
        nn = int(0.9 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 1200, 4000) * np.sin(np.pi * tl / 0.9) ** 2 * 0.12
    elif kind == "glass":  # the glass case breaks
        nn = int(1.2 * SR)
        tl = np.arange(nn) / SR
        x = (hp(rng.standard_normal(nn), 4000) * np.exp(-tl / 0.12) * 0.5
             + sum(np.sin(2 * np.pi * f * tl) * np.exp(-tl / (0.2 + 0.1 * k)) for k, f in enumerate((2637, 3520, 4186, 5274))) * 0.06)
    elif kind == "box":  # parcel lands
        nn = int(0.2 * SR)
        tl = np.arange(nn) / SR
        x = (lp(rng.standard_normal(nn), 900) * 0.6 + np.sin(2 * np.pi * 140 * tl) * 0.5) * np.exp(-tl / 0.04)
    elif kind == "check":
        nn = int(0.15 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * note_hz(88 + pitch) * tl) * np.exp(-tl / 0.05) * 0.28
    elif kind == "key":
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    else:
        raise ValueError(kind)
    place(sfx, x, t, gain)


add("whoosh", 0.0, 0.8)
for i, r in enumerate(LIT):
    add("click", ev["four"] + i * 0.09, 0.8, pitch=i * 2)
for i in range(6):
    add("down", ev["flick"] + i * 0.05, 0.25, pitch=-i)
add("rewind", ev["rewind"], 1.0)
add("draw", ev["frame"], 1.0)
add("appear", ev["hand"], 0.6)
add("paper", ev["give"], 1.0)
for i in range(10):
    add("click", ev["fill0"] + i * ev["fillStep"], 0.7, pitch=[0, 2, 3, 5, 7, 8, 10, 12, 14, 15][i])
add("stick", ev["note"] + 0.15, 1.0)
add("hum", ev["gate"], 1.0)
add("draw", ev["line"], 0.9)
for i in range(6):
    add("down", ev["off0"] + i * ev["offStep"], 0.9, pitch=-i)
add("thud", ev["open"], 1.0)
add("appear", ev["think"], 0.5)
add("draw", ev["relight"], 0.9)
add("dust", ev["vanish"], 1.0)
add("appear", ev["street"], 0.4)
add("scan", ev["eye"], 0.9)
add("appear", ev["ghost"], 0.6)
add("appear", ev["demo"], 0.5)
add("glass", ev["shatter"], 1.0)
for i in range(4):
    add("box", ev["cases"] + 0.35 + i * 0.22, 0.7)
add("scan", ev["review"], 0.8)
for i in range(4):
    add("check", ev["review"] + 0.35 + i * 0.22, 0.8, pitch=i * 2)
for i in range(9):
    add("key", ev["typeStart"] + i * ev["typeStep"], 0.7)
add("appear", S["E13"] + 0.3, 0.8)

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
if peak > 0.86:  # soft-limit the odd peak to about -1 dBTP
    st = np.tanh(st / 0.86 * 1.2) * 0.86 / np.tanh(1.2)
    st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
    st = np.clip(st, -0.88, 0.88)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                os.path.join(ROOT, "public", "audio", "mix.wav")], input=pcm, check=True)

timeline = {"fps": FPS, "durationInFrames": int(round(TOTAL * FPS)), "scenes": {k: round(v, 3) for k, v in scenes.items()},
            "captions": captions, "cta": {k: round(v, 3) for k, v in cta.items()}, "ev": ev, "lit": LIT, "offOrder": OFF_ORDER,
            "sfx": sfx_list}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("scenes", {k: round(v, 2) for k, v in scenes.items()})
print("total", TOTAL, "s · loudness", round(meter.integrated_loudness(st), 2), "LUFS · peak", round(20 * np.log10(np.abs(st).max()), 2), "dBFS")
