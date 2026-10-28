"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/isla-mit/<take>.mp3 (one ElevenLabs take), data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

The take is used as is (no cuts): it starts at VOICE_AT and its own pauses mark the scenes.

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "isla-mit")
TAKE = "b564c079"
SR = 48000
FPS = 30
TOTAL = 45.0
N = int(TOTAL * SR)
VOICE_AT = 0.3
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


# ── scenes (the prompt's nine, moved onto the take's pauses) ─────────────
scenes = {
    "E1": 0.0, "E2": seg_start(2) - 0.15, "E3": seg_start(3) - 0.15, "E4": seg_start(4) - 0.15,
    "E5": seg_start(5) - 0.15, "E5B": seg_start(6) - 0.15, "E6": seg_start(7) - 0.15, "E7": seg_start(9) - 0.15,
    "E8": seg_start(11) - 0.15, "E9": SEGS[-1][1] + VOICE_AT + 0.3, "END": TOTAL,
}
S = scenes


def cap(chunks, end, **kw):
    """chunks: (text, time, highlight) with highlight in {None, 'o'}"""
    out = {"chunks": [{"text": c[0], "t": round(c[1], 3), "hl": c[2]} for c in chunks],
           "start": round(chunks[0][1] - 0.12, 3), "end": round(end, 3)}
    out.update(kw)
    return out


captions = {
    "E1": cap([("Una", wt(0, 2), None), ("IA,", wt(0, 3), None), ("sola", wt(0, 5), "o"), ("en una isla", wt(0, 7), None)],
              S["E2"] - 0.1, micro=[["SIN TAREAS", wt(1, 0)], ["· SIN OBJETIVOS", wt(1, 2)]]),
    "E2": cap([("30 horas", wt(2, 0), "o"), ("después…", wt(2, 2), None)], S["E3"] - 0.1),
    "E3": cap([("Inventó", wt(3, 1), "o"), ("juegos,", wt(3, 2), None), ("templos", wt(3, 5), None),
               ("y mandalas", wt(3, 10), None)], S["E4"] - 0.1),
    "E4": cap([("Hasta", wt(4, 0), None), ("escribió", wt(4, 1), None), ("su nombre", wt(4, 2), "o")], S["E5"] - 0.1),
    "E5": cap([("Nadie", wt(5, 9), "o"), ("se lo", wt(5, 10), None), ("programó", wt(5, 12), None)], S["E6"] - 0.1,
              micro=[["6 DE 13 AGENTES", wt(5, 1)], ["LO DESCUBRIERON", wt(5, 6)]], microEnd=round(S["E5B"] + 0.2, 3)),
    "E6": cap([("Jugar", wt(8, 7), None), ("los hizo", wt(8, 8), None), ("mejores", wt(8, 9), "o")], S["E7"] - 0.1,
              micro=[["LOS QUE JUGARON", wt(8, 4)], ["RINDIERON MEJOR", wt(8, 8)]]),
    "E7": cap([("La IA", wt(9, 0), None), ("ya no solo", wt(9, 2), None), ("obedece", wt(9, 5), "o")], S["E8"] - 0.1,
              sub=[["Explora,", wt(10, 0)], ["aprende", wt(10, 1)], ["y se las ingenia.", wt(10, 2)]]),
    "E8": cap([("Imagina eso", wt(11, 0), None), ("en tu negocio", wt(11, 4), "o")], wt(12, 0) - 0.1),
}
cta = {"comenta": wt(12, 0), "keyword": wt(12, 1), "small": wt(12, 2)}

# ── on-screen events ────────────────────────────────────────────────────
ev = {
    "dolly": 4.0,                                   # camera locks on the island
    "eko": 2.15,                                    # Eko materialises on the beach
    "counter0": S["E2"] + 0.1, "counter1": S["E3"] - 0.35,
    "bowl": wt(3, 2) - 0.15,                        # block slides into the pins ("juegos")
    "temple0": wt(3, 5) - 0.45, "templeStep": 0.11,  # 14 blocks arc onto the temple ("templo")
    "mandala0": wt(3, 10) - 0.4, "mandalaStep": 0.17,  # 8 lines light up ("mandalas")
    "letters": wt(4, 1) - 0.05, "letterStep": 0.3, "lettersGlow": wt(4, 4),
    "row": S["E5"] + 0.1, "six": wt(5, 1), "sixStep": 0.12,
    "throw1": wt(6, 2) - 0.05,                      # ordinary throw ("bloque")
    "jump": wt(6, 8) - 0.3,                         # jump ("sueltas")…
    "release": wt(6, 8) + 0.12,                     # …release at the top
    "spawn": S["E6"] + 0.1,                         # the 12 copies appear
    "work": wt(8, 0) + 0.05, "leftStep": 0.34, "rightStep": 1.1,
    "net": S["E7"] + 0.3,
    "morph": S["E8"] + 0.05, "sign": wt(11, 5) - 0.05, "icons": wt(11, 5) + 0.35,
    "typeStart": cta["keyword"] - 0.35, "typeStep": 0.075,
}
ev["land1"] = ev["throw1"] + 0.55
ev["land2"] = ev["release"] + 1.0
ev["bowlHit"] = ev["bowl"] + 0.5
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


# ── music (original, synthesised): curious, airy, D major at 100 BPM ──────
BPM = 100
beat = 60 / BPM
bar = 4 * beat
prog = [[38, 57, 61, 64, 66], [35, 54, 57, 62, 66], [31, 54, 59, 62, 66], [33, 52, 57, 61, 64]]  # Dmaj9 Bm7 Gmaj7 A
padL, padR, bass, bell, kick, hat = (np.zeros(N) for _ in range(6))
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
    # bell arpeggio in 8ths (glassy: sine + inharmonic partial)
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
        jh = int((t0 + (bt + 0.5) * beat) * SR)
        nn = min(int(0.06 * SR), N - jh)
        if nn > 0:
            hat[jh:jh + nn] += hp(rng.standard_normal(nn), 7500) * np.exp(-np.arange(nn) / SR / 0.016)
    t0 += 2 * bar
    ci += 1

padL, padR = lp(padL, 2600), lp(padR, 2600)
bell = lp(bell, 5000)
# arrangement: pad from the start; bells from E2; pulse (kick, hat, bass) from E3; full lift in E7; out at E9
intro = step(tt, 0, 1.5)
bells_on = step(tt, S["E2"] - 0.5, S["E2"] + 0.5) * 0.7 + step(tt, S["E7"] - 0.3, S["E7"]) * 0.3
pulse = step(tt, S["E3"] - 0.2, S["E3"]) * (1 - 0.6 * step(tt, S["E6"] - 0.3, S["E6"]) * (1 - step(tt, ev["work"] - 0.2, ev["work"])))
lift = step(tt, S["E7"] - 0.2, S["E7"] + 0.2)
out = 1 - step(tt, S["E9"] - 0.1, S["E9"] + 0.3)
phase = (tt % beat) / beat
pump = 0.6 + 0.4 * np.clip(phase / 0.4, 0, 1) ** 0.7
pump = 1 - (1 - pump) * pulse
mL = (padL * (0.75 + 0.35 * lift) * pump * intro + 0.16 * bell * bells_on + 0.38 * bass * pulse
      + 0.42 * kick * pulse + 0.07 * hat * pulse * (0.5 + 0.5 * lift)) * out
mR = (padR * (0.75 + 0.35 * lift) * pump * intro + 0.16 * np.roll(bell, int(0.013 * SR)) * bells_on + 0.38 * bass * pulse
      + 0.42 * kick * pulse + 0.07 * np.roll(hat, 240) * pulse * (0.5 + 0.5 * lift)) * out
# ending chord over the logo (D add9)
i_end = int(S["E9"] * SR)
tl = np.arange(N - i_end) / SR
end_chord = sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (50, 57, 62, 64, 69)) * np.exp(-tl / 1.1) * 0.06 * env_ar(N - i_end, 0.02, 0.3)
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
    elif kind == "swish":  # short throw swish
        nn = int(0.45 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 600, 5000) * np.sin(np.pi * tl / 0.45) ** 2 * 0.35
    elif kind == "appear":  # soft shimmer + low bloom
        x = (sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (74, 78, 81, 86)) * 0.08 * np.exp(-tl / 0.5)
             + np.sin(2 * np.pi * 73 * tl) * 0.5 * np.exp(-tl / 0.4)) * env_ar(nn, 0.04, 0.1)
    elif kind == "clack":  # block on block
        nn = int(0.12 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 1400, 4200) * 0.6 + np.sin(2 * np.pi * 820 * tl) * 0.5) * np.exp(-tl / 0.022)
    elif kind == "thud":  # block on sand
        nn = int(0.3 * SR)
        tl = np.arange(nn) / SR
        x = (lp(rng.standard_normal(nn), 900) * 0.8 + np.sin(2 * np.pi * 95 * tl)) * np.exp(-tl / 0.07)
    elif kind == "pins":  # pins knocked
        x = np.zeros(nn)
        for k in range(4):
            j = int(k * 0.05 * SR)
            m = int(0.12 * SR)
            tl2 = np.arange(m) / SR
            x[j:j + m] += (bp(rng.standard_normal(m), 1200, 5000) * 0.6 + np.sin(2 * np.pi * (700 + 130 * k) * tl2) * 0.4) * np.exp(-tl2 / 0.03)
    elif kind == "tick":
        nn = int(0.02 * SR)
        x = hp(rng.standard_normal(nn), 4000) * np.exp(-np.arange(nn) / SR / 0.004) * 0.5
    elif kind == "blip":  # HUD icon on
        nn = int(0.15 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * 1320 * tl) * np.exp(-tl / 0.04) * 0.3
    elif kind == "pop":
        nn = int(0.12 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * (400 + 900 * tl / 0.12) * tl) * np.exp(-tl / 0.035) * 0.35
    elif kind == "ding":
        x = sum(np.sin(2 * np.pi * note_hz(m) * tl) * a for m, a in ((88, 0.5), (93, 0.3), (100, 0.12))) * np.exp(-tl / 0.35) * 0.5
    elif kind == "rise":  # swell into the network
        nn = int(1.6 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 900, 7000) * (tl / 1.6) ** 2 * 0.18 * env_ar(nn, 0, 0.05)
        t -= 1.6
    elif kind == "boom":  # network / sign lights up
        nn = int(2.0 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 55 * tl) * 0.7 * np.exp(-tl / 0.5) + lp(rng.standard_normal(nn), 400) * 0.3 * np.exp(-tl / 0.15)
             + sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (74, 81, 86)) * 0.05 * np.exp(-tl / 0.9))
    elif kind == "sink":  # island goes down
        nn = int(1.3 * SR)
        tl = np.arange(nn) / SR
        x = lp(rng.standard_normal(nn), 500) * np.sin(np.pi * tl / 1.3) * 0.5
    elif kind == "key":
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    else:
        raise ValueError(kind)
    place(sfx, x, t, gain)


def chime(t, m, gain=1.0):
    sfx_list.append({"t": round(t, 3), "type": "chime"})
    nn = int(1.4 * SR)
    tl = np.arange(nn) / SR
    f = note_hz(m)
    x = (np.sin(2 * np.pi * f * tl) + 0.3 * np.sin(2 * np.pi * f * 2.0 * tl) * np.exp(-tl / 0.2)) * np.exp(-tl / 0.5) * 0.22
    place(sfx, x, t, gain)


add("whoosh", 0.0, 0.8)
add("appear", ev["eko"])
for k in range(int((ev["counter1"] - ev["counter0"]) / 0.1)):  # fast clock while the hours run
    add("tick", ev["counter0"] + k * 0.1, 0.8 if k % 4 == 0 else 0.45)
add("swish", ev["bowl"] - 0.1, 0.7)
add("pins", ev["bowlHit"], 0.9)
for i in range(14):
    add("clack", ev["temple0"] + 0.3 + i * ev["templeStep"], 0.55)
for i, m in enumerate((74, 78, 81, 83, 86, 85, 81, 90)):
    chime(ev["mandala0"] + i * ev["mandalaStep"], m, 0.9)
for i in range(3):
    add("clack", ev["letters"] + i * ev["letterStep"] + 0.2, 0.6)
add("appear", ev["lettersGlow"], 0.6)
for i in range(6):
    add("blip", ev["six"] + i * ev["sixStep"], 0.9)
add("swish", ev["throw1"], 0.7)
add("thud", ev["land1"], 0.8)
add("swish", ev["jump"], 0.5)
add("swish", ev["release"], 1.0)
add("thud", ev["land2"], 1.0)
add("ding", ev["land2"] + 0.1, 0.9)
for i in range(12):
    add("pop", ev["spawn"] + i * 0.07, 0.6)
for i in range(9):
    add("clack", ev["work"] + 0.3 + i * ev["leftStep"], 0.5)
for i in range(3):
    add("clack", ev["work"] + 0.3 + i * ev["rightStep"], 0.35)
add("rise", ev["net"], 1.0)
add("boom", ev["net"], 0.9)
add("sink", ev["morph"], 0.9)
add("boom", ev["sign"], 0.7)
for i in range(3):
    add("blip", ev["icons"] + i * 0.25, 0.8)
for i in range(9):
    add("key", ev["typeStart"] + i * ev["typeStep"], 0.7)
add("appear", S["E9"] + 0.3, 0.8)

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
