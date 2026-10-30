"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/bug-27-anos/<take>.mp3 (one ElevenLabs take), data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

The take is used as is (no cuts): it starts at VOICE_AT and its own pauses mark the scenes.

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "bug-27-anos")
TAKE = "bf2f7f80"
SR = 48000
FPS = 30
TOTAL = 47.0
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


# ── scenes (the prompt's ten, moved onto the take's pauses) ─────────────
scenes = {
    "E1": 0.0, "E2": seg_start(1) - 0.15, "E3": seg_start(2) - 0.15, "E4": seg_start(4) - 0.15, "E5": seg_start(5) - 0.15,
    "E6": seg_start(7) - 0.15, "E7": seg_start(8) - 0.15, "E8": seg_start(10) - 0.15, "E9": seg_start(12) - 0.15,
    "E10": seg_start(14) - 0.15, "E11": SEGS[-1][1] + VOICE_AT + 0.45, "END": TOTAL,
}
S = scenes


def cap(chunks, end, **kw):
    """chunks: (text, time, highlight) with highlight in {None, 'o'}"""
    out = {"chunks": [{"text": c[0], "t": round(c[1], 3), "hl": c[2]} for c in chunks],
           "start": round(chunks[0][1] - 0.12, 3), "end": round(end, 3)}
    out.update(kw)
    return out


captions = {
    "E1": cap([("Un fallo de", wt(0, 7), None), ("27 años", wt(0, 9), "o")], S["E2"] - 0.1,
              micro=[["ANTHROPIC · 7 ABR 2026", wt(0, 0)]]),
    "E2": cap([("Famoso por su", wt(1, 2), None), ("seguridad", wt(1, 5), "o")], S["E3"] - 0.1,
              micro=[["SISTEMA OPERATIVO", wt(1, 1)]]),
    "E3": cap([("El propio proyecto", wt(2, 0), None), ("lo confirma", wt(2, 1), "o")], S["E4"] - 0.1,
              micro=[["CÓDIGO PÚBLICO · 20 MAR 2026", wt(3, 1)]]),
    "E4": cap([("Un paquete", wt(4, 1), None), ("mal formado", wt(4, 4), None), ("lo tumbaba", wt(4, 7), "o")], S["E5"] - 0.1,
              micro=[["RED · TCP", wt(4, 3)]]),
    "E5": cap([("Una", wt(6, 1), None), ("caída", wt(6, 2), "o"), (", no una entrada", wt(6, 4), None)], S["E6"] - 0.1,
              micro=[["CORRECCIÓN DE FIABILIDAD", wt(6, 2)], ["· SIN CVE", wt(6, 5)]]),
    "E6": cap([("Los años,", wt(7, 0), None), ("según Anthropic", wt(7, 5), "o")], S["E7"] - 0.1,
              micro=[["PENDIENTE DE VERIFICAR", wt(7, 6)]]),
    "E7": cap([("Uno sí.", wt(8, 11), None), ("El otro", wt(9, 1), None), ("no", wt(9, 2), "o")], S["E8"] - 0.1,
              micro=[["LABORATORIO · ABR 2026", wt(8, 1)], ["· CASO YA CONOCIDO", wt(8, 3)]]),
    "E8": cap([("Encuentra", wt(10, 2), None), ("fallos", wt(10, 3), None), ("que nadie", wt(10, 4), None), ("veía", wt(10, 6), "o")],
              seg_start(11) - 0.1),
    "E8B": cap([("La", wt(11, 0), None), ("gravedad", wt(11, 2), "o"), ("la valora", wt(11, 3), None), ("una persona", wt(11, 5), None)],
               S["E9"] - 0.1, micro=[["DETECTAR ≠ VALORAR", wt(11, 1)]]),
    "E9": cap([("Segunda revisión,", wt(13, 2), None), ("decisión humana", wt(13, 7), "o")], S["E10"] - 0.1,
              micro=[["LA LECCIÓN", wt(12, 0)]]),
    "E10": cap([("Revisa", wt(14, 3), None), ("tu software", wt(14, 8), "o")], S["E11"] + 0.1,
               micro=[["COMENTA LA PALABRA", wt(14, 0)]]),
}
cta = {"comenta": wt(14, 0), "keyword": wt(14, 1)}

# ── on-screen events ────────────────────────────────────────────────────
ev = {
    "dolly": 4.0,                                   # camera locks on the fortress
    "lupa": 1.6,                                    # the Lupa lights up above it
    "layers": S["E2"] + 0.15, "sign": wt(1, 0),     # walls reinforced, OPENBSD sign
    "logIn": S["E3"] + 0.05, "underline1": wt(2, 3), "stamp": wt(3, 1), "underline2": wt(3, 8), "logOut": S["E4"] - 0.05,
    "packet": S["E4"] + 0.1, "hit": wt(4, 7) + 0.05,  # packet hits the gate ("tumbar"), lights go out
    "tagFall": wt(6, 2), "tagEntry": wt(6, 5),
    "restore": S["E6"] + 0.1, "notches": wt(7, 1) - 0.1, "notchStep": 0.025, "doubt": wt(7, 6) - 0.05,
    "orbA": S["E7"] + 0.15, "found": wt(8, 11), "orbB": wt(9, 0) - 0.55, "missed": wt(9, 2),
    "cracks": wt(10, 3) - 0.05, "crackStep": 0.17, "balance": wt(11, 0) - 0.05,
    "morph": S["E9"] + 0.05, "scan": wt(13, 0) - 0.1, "findings": wt(13, 2), "findStep": 0.3,
    "review": wt(13, 6) - 0.1, "reviewStep": 0.3,
    "dark": S["E10"] + 0.05, "typeStart": cta["keyword"] - 0.25, "typeStep": 0.08,
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


# ── music (original, synthesised): tense but clean, D minor at 100 BPM ─────
BPM = 100
beat = 60 / BPM
bar = 4 * beat
prog = [[38, 57, 60, 62, 65], [34, 53, 57, 62, 65], [41, 57, 60, 64, 67], [36, 55, 60, 64, 67]]  # Dm(add9) Bbmaj7 F C
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
# arrangement: pad from the start; bells from E2; pulse from E3, cut dead at the crash and back with the restore;
# lift for the lesson; out at the end card
intro = step(tt, 0, 1.5)
bells_on = step(tt, S["E2"] - 0.5, S["E2"] + 0.5) * 0.7 + step(tt, S["E8"] - 0.3, S["E8"]) * 0.3
pulse = step(tt, S["E3"] - 0.2, S["E3"]) * (1 - step(tt, ev["hit"] - 0.02, ev["hit"])) + step(tt, ev["restore"], ev["restore"] + 0.6)
pulse = np.clip(pulse, 0, 1)
lift = step(tt, S["E9"] - 0.2, S["E9"] + 0.2)
out = 1 - step(tt, S["E11"] - 0.1, S["E11"] + 0.3)
phase = (tt % beat) / beat
pump = 0.6 + 0.4 * np.clip(phase / 0.4, 0, 1) ** 0.7
pump = 1 - (1 - pump) * pulse
mL = (padL * (0.75 + 0.35 * lift) * pump * intro + 0.16 * bell * bells_on + 0.38 * bass * pulse
      + 0.42 * kick * pulse + 0.07 * hat * pulse * (0.5 + 0.5 * lift)) * out
mR = (padR * (0.75 + 0.35 * lift) * pump * intro + 0.16 * np.roll(bell, int(0.013 * SR)) * bells_on + 0.38 * bass * pulse
      + 0.42 * kick * pulse + 0.07 * np.roll(hat, 240) * pulse * (0.5 + 0.5 * lift)) * out
# ending chord over the logo (D add9)
i_end = int(S["E11"] * SR)
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
    elif kind == "sink":  # the fortress goes down
        nn = int(1.3 * SR)
        tl = np.arange(nn) / SR
        x = lp(rng.standard_normal(nn), 500) * np.sin(np.pi * tl / 1.3) * 0.5
    elif kind == "scan":  # scanner pulse: soft sine sweep
        nn = int(0.5 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * (600 + 900 * tl / 0.5) * tl) * np.sin(np.pi * tl / 0.5) ** 2 * 0.18
    elif kind == "stamp":  # dry stamp
        nn = int(0.35 * SR)
        tl = np.arange(nn) / SR
        x = (lp(rng.standard_normal(nn), 1200) * 0.9 + np.sin(2 * np.pi * 70 * tl)) * np.exp(-tl / 0.05)
    elif kind == "buzz":  # malformed packet speeding up
        nn = int((ev["hit"] - ev["packet"]) * SR)
        tl = np.arange(nn) / SR
        p = tl / tl[-1]
        f = 90 + 260 * p ** 2
        saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
        x = lp(saw, 1800) * (0.15 + 0.45 * p ** 1.5) * env_ar(nn, 0.1, 0.01)
    elif kind == "power":  # impact + lights going out
        nn = int(1.6 * SR)
        tl = np.arange(nn) / SR
        f = 220 * np.exp(-tl / 0.5) + 40
        x = (lp(rng.standard_normal(nn), 600) * np.exp(-tl / 0.06) * 0.9 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 * np.exp(-tl / 0.7))
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
add("appear", ev["lupa"], 0.8)
for i, m in enumerate((74, 78, 81)):
    chime(ev["layers"] + i * 0.35, m, 0.7)
add("blip", ev["sign"] + 0.2, 0.7)
add("swish", ev["logIn"], 0.6)
add("blip", ev["underline1"], 0.8)
add("stamp", ev["stamp"] + 0.18, 1.0)
add("blip", ev["underline2"], 0.8)
add("swish", ev["logOut"] - 0.2, 0.5)
add("buzz", ev["packet"], 0.9)
add("power", ev["hit"], 1.0)
add("blip", ev["tagFall"], 0.8)
add("pop", ev["tagEntry"], 0.7)
add("appear", ev["restore"], 0.4)
for i in range(27):
    add("tick", ev["notches"] + i * ev["notchStep"], 0.5)
add("pop", ev["doubt"], 0.8)
add("scan", ev["orbA"] + 0.2, 0.9)
add("scan", ev["found"] - 0.5, 0.9)
chime(ev["found"], 81, 1.0)
add("scan", ev["orbB"], 0.7)
add("scan", ev["missed"] - 0.3, 0.6)
for i in range(4):
    chime(ev["cracks"] + i * ev["crackStep"], (74, 78, 81, 86)[i], 0.8)
add("scan", ev["balance"], 0.5)
add("sink", ev["morph"], 0.8)
add("scan", ev["scan"], 0.8)
for i in range(3):
    add("blip", ev["findings"] + i * ev["findStep"], 0.8)
for i in range(3):
    add("pop", ev["review"] + i * ev["reviewStep"], 0.8)
for i in range(9):
    add("key", ev["typeStart"] + i * ev["typeStep"], 0.7)
add("appear", S["E11"] + 0.3, 0.8)

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
