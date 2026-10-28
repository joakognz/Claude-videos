"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/dos-peluquerias/<take>.mp3 (ElevenLabs takes A, B, C), data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

Each sentence group of a take is placed at a fixed time on the 58 s timeline (one group per scene);
the take's own pauses inside a group are kept.

Run: python scripts/build.py
"""
import json, math, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "dos-peluquerias")
TAKES = {"A": "40b46c12", "B": "9db199bd", "C": "8adc5468"}
SR = 48000
FPS = 30
TOTAL = 58.0
N = int(TOTAL * SR)
rng = np.random.default_rng(7)


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


W = json.load(open(os.path.join(ROOT, "data", "words.json")))
audio = {k: load(p) for k, p in TAKES.items()}
audio = {k: x * (10 ** (-18 / 20) / speech_rms(x)) for k, x in audio.items()}

# ── voice placement: (take, first segment, last segment, timeline start of the first segment) ──
GROUPS = [
    ("A", 0, 1, 0.35), ("A", 2, 3, 3.15), ("A", 4, 4, 6.10), ("A", 5, 6, 8.85),
    ("B", 0, 1, 12.10), ("B", 2, 3, 16.05), ("B", 4, 6, 19.05), ("B", 7, 7, 23.35), ("B", 8, 8, 26.15),
    ("B", 9, 9, 30.15), ("B", 10, 12, 34.10),
    ("C", 0, 0, 38.85), ("C", 1, 1, 41.95), ("C", 2, 2, 43.75), ("C", 3, 3, 47.00), ("C", 4, 4, 50.10),
    ("C", 5, 5, 52.60),
]

voice = np.zeros(N)
seg_words = {}  # (take, seg) -> list of words with timeline times
for take, s0, s1, t0 in GROUPS:
    segs = W[take]["segments"]
    x = audio[take]
    a, b = segs[s0][0], segs[s1][1]
    prev_end = segs[s0 - 1][1] if s0 > 0 else 0.0
    next_start = segs[s1 + 1][0] if s1 + 1 < len(segs) else len(x) / SR
    pa, pb = min(0.12, (a - prev_end) / 2), min(0.2, (next_start - b) / 2)
    chunk = x[int((a - pa) * SR):int((b + pb) * SR)].copy()
    f = int(0.01 * SR)
    chunk[:f] *= np.linspace(0, 1, f)
    chunk[-f:] *= np.linspace(1, 0, f)
    i = int(round((t0 - pa) * SR))
    voice[i:i + len(chunk)] += chunk[: max(0, min(len(chunk), N - i))]
    off = t0 - a
    for k in range(s0, s1 + 1):
        sa, sb = segs[k]
        seg_words[(take, k)] = [
            {"w": w["w"], "s": round(w["s"] + off, 3), "e": round(w["e"] + off, 3)}
            for w in W[take]["words"] if sa - 0.01 <= w["s"] < sb]


def wt(take, seg, idx):
    """Timeline start of word `idx` of segment `seg` of `take`."""
    return seg_words[(take, seg)][idx]["s"]


def we(take, seg, idx):
    return seg_words[(take, seg)][idx]["e"]


# ── scenes ──────────────────────────────────────────────────────────────
scenes = {
    "E1": 0.0, "E2": 3.0, "E3": 5.95, "E4": 8.7, "E5": 11.95, "E6": 15.9, "E7": 18.9, "E8": 23.15,
    "E9": 25.95, "E10": 29.95, "E11": 33.9, "E12": 38.6, "E13": 41.75, "E14": 43.6, "E15": 48.5,
    "E16": 52.35, "E17": 56.15, "END": TOTAL,
}


# ── on-screen captions: chunks of text, each revealed when its word is spoken ──
def cap(chunks, end, **kw):
    """chunks: (text, time, highlight) with highlight in {None, 'o' (orange), 'g' (grey)}"""
    out = {"chunks": [{"text": c[0], "t": round(c[1], 3), "hl": c[2]} for c in chunks],
           "start": round(chunks[0][1] - 0.12, 3), "end": round(end, 3)}
    out.update(kw)
    return out


S = scenes
captions = {
    "E1": cap([("Misma", wt("A", 0, 0), None), ("calle.", wt("A", 0, 1), None),
               ("Dos", wt("A", 1, 0), "o"), ("peluquerías.", wt("A", 1, 1), None)], S["E2"] - 0.1),
    "E2": cap([("Mismos", wt("A", 2, 0), None), ("servicios.", wt("A", 2, 1), None),
               ("Mismo precio.", wt("A", 3, 0), "o")], S["E3"] - 0.1),
    "E3": cap([("Pero", wt("A", 4, 0), None), ("una", wt("A", 4, 1), None), ("siempre", wt("A", 4, 2), None),
               ("está", wt("A", 4, 3), None), ("llena.", wt("A", 4, 4), "o")], S["E4"] + 0.9),
    "E4": cap([("Tiene", wt("A", 6, 0), None), ("un", wt("A", 6, 1), None), ("sistema.", wt("A", 6, 2), "o")],
              S["E5"] - 0.1),
    "E5": cap([("Reservan", wt("B", 0, 2), None), ("solos.", wt("B", 0, 3), "o")], S["E6"] - 0.1),
    "E6": cap([("A", wt("B", 2, 0), None), ("cualquier", wt("B", 2, 1), None), ("hora.", wt("B", 2, 2), None),
               ("Sin llamar.", wt("B", 3, 0), "o")], S["E7"] - 0.1),
    "E7": cap([("Cero", wt("B", 4, 0), None), ("citas", wt("B", 4, 1), None), ("pisadas.", wt("B", 4, 2), "o")],
              S["E8"] - 0.1),
    "E8": cap([("Si", wt("B", 7, 0), None), ("alguien", wt("B", 7, 1), None), ("cancela…", wt("B", 7, 2), "g")],
              S["E9"] - 0.1),
    "E9": cap([("La", wt("B", 8, 0), None), ("lista", wt("B", 8, 1), None), ("de", wt("B", 8, 2), None),
               ("espera", wt("B", 8, 3), None), ("se entera.", wt("B", 8, 4), "o")], S["E10"] - 0.1),
    "E10": cap([("Cada", wt("B", 9, 1), None), ("cliente", wt("B", 9, 2), None), ("suma", wt("B", 9, 3), None),
                ("puntos.", wt("B", 9, 4), "o")], S["E11"] + 0.6),
    "E11": cap([("Y vuelve.", wt("B", 12, 0), "o")], S["E12"] - 0.05),
    "E12": cap([("Mientras", wt("C", 0, 0), None), ("tanto,", wt("C", 0, 1), None),
                ("la otra…", wt("C", 0, 2), "g")], S["E13"] - 0.05, fade=True),
    "E13": cap([("Libreta", wt("C", 1, 0), "g"), ("y", wt("C", 1, 1), None), ("WhatsApp.", wt("C", 1, 2), None)],
               wt("C", 3, 0) - 0.15),
    "E14": cap([("Tu", wt("C", 3, 0), None), ("negocio", wt("C", 3, 1), None), ("se", wt("C", 3, 2), None),
                ("llama…", wt("C", 3, 3), None)], we("C", 3, 3) + 0.05, cut=True),
    "E15": cap([("¿Y tú?", wt("C", 4, 0), None)], S["E16"] - 0.1, big=True),
}
cta = {"comenta": wt("C", 5, 0), "keyword": wt("C", 5, 1), "small": wt("C", 5, 2), "tuyo": wt("C", 5, 8)}

# ── on-screen events (tags, phone, bubbles…) ────────────────────────────
ev = {
    "price": S["E2"] + 0.35,                       # price tags pop (both shops)
    "fill": S["E3"] + 0.2,                         # clients walk into the orange shop
    "phoneIn": S["E5"] + 0.05,
    "slot": wt("B", 0, 3) + 0.1,                   # 12:00 selected ("solos")
    "typing": wt("B", 1, 0),                       # name + phone typed ("desde el móvil")
    "press": S["E6"] - 0.45,                       # Reservar pressed
    "confirm": S["E6"] + 0.05,                     # ¡Cita reservada!
    "phoneOut": S["E7"] - 0.35,
    "tag1": S["E7"] + 0.25, "tag2": S["E7"] + 0.6, "clash": wt("B", 4, 2), "clashX": wt("B", 6, 3),
    "fede": S["E8"] + 0.15, "cancel": wt("B", 7, 2) + 0.1,
    "notify": wt("B", 8, 4) - 0.05, "walk": S["E9"] + 1.2,
    "plus": wt("B", 9, 4),
    "card": S["E11"] + 0.1, "redeem": wt("B", 11, 4),
    "vibrate": [S["E13"] + 0.5, S["E13"] + 1.5, S["E14"] + 0.4, S["E14"] + 1.4, S["E14"] + 2.4, S["E14"] + 3.4],
    "bubbles": [S["E14"] + 0.15, S["E14"] + 0.85, S["E14"] + 1.45, S["E14"] + 2.0, S["E14"] + 2.5, S["E14"] + 2.95,
                S["E14"] + 3.35, S["E14"] + 3.7, S["E14"] + 4.0, S["E14"] + 4.3],
    "typeStart": cta["keyword"] - 0.35, "typeStep": 0.075,
}
ev = {k: (round(v, 3) if isinstance(v, float) else [round(x, 3) for x in v]) for k, v in ev.items()}

# ── buffers ─────────────────────────────────────────────────────────────
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
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def smooth_step(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1) if b != a else (t >= a).astype(float)


# ── music (original, synthesised): minimal electronic at 120 BPM ─────────
BPM = 120
beat = 60 / BPM
bar = 4 * beat
mL = np.zeros(N)
mR = np.zeros(N)
# sections: intro (0-3), groove (3-38.6), cold (38.6-48.5, the other shop), lift (48.5-56.15), outro
COLD_A, COLD_B = S["E12"], S["E15"]
groove = smooth_step(tt, 0.0, 0.6) * (1 - smooth_step(tt, COLD_A - 0.2, COLD_A + 0.8)) + smooth_step(tt, COLD_B - 0.5, COLD_B + 1.5) * (1 - smooth_step(tt, S["E17"], S["E17"] + 1.2))
cold = smooth_step(tt, COLD_A - 0.3, COLD_A + 1.2) * (1 - smooth_step(tt, COLD_B - 0.3, COLD_B + 1.2))

# chords: Am - F - C - G (two bars each)
prog = [[45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62]]
pad_L, pad_R, bass, arp, kick, hat, clap = (np.zeros(N) for _ in range(7))
t0, ci = 0.0, 0
while t0 < TOTAL:
    chord = prog[ci % 4]
    i0 = int(t0 * SR)
    n = min(int((2 * bar + 0.8) * SR), N - i0)
    if n <= 0:
        break
    tl = np.arange(n) / SR
    e = env_ar(n, 0.6, 0.8)
    for m in chord[1:]:
        f = note_hz(m)
        saw = sum(np.sin(2 * np.pi * f * h * tl) / h for h in range(1, 6))
        pad_L[i0:i0 + n] += np.sin(2 * np.pi * f * 0.996 * tl) * e * 0.08 + saw * e * 0.025
        pad_R[i0:i0 + n] += np.sin(2 * np.pi * f * 1.004 * tl) * e * 0.08 + saw * e * 0.025
    # bass: 8th-note pulse on the root, ducked on every beat (sidechain feel)
    root = note_hz(chord[0] - 12 if chord[0] > 44 else chord[0])
    for s in range(16):
        ts = t0 + s * beat / 2
        j = int(ts * SR)
        nn = min(int(beat / 2 * SR), N - j)
        if nn <= 0:
            break
        tl2 = np.arange(nn) / SR
        b = np.sin(2 * np.pi * root * tl2) + 0.3 * np.sin(4 * np.pi * root * tl2)
        bass[j:j + nn] += b * np.exp(-tl2 / 0.16) * env_ar(nn, 0.004, 0.02) * (0.55 if s % 2 == 0 else 0.9)
    # pluck arpeggio (16ths), soft
    pattern = [1, 2, 3, 2, 1, 3, 2, 3]
    for s in range(32):
        ts = t0 + s * beat / 2 * 0.5 * 2
        if s % 2:
            continue
        j = int(ts * SR)
        nn = min(int(0.3 * SR), N - j)
        if nn <= 0:
            break
        tl2 = np.arange(nn) / SR
        f = note_hz(chord[pattern[(s // 2) % 8]] + 12)
        arp[j:j + nn] += (np.sin(2 * np.pi * f * tl2) + 0.2 * np.sin(6 * np.pi * f * tl2)) * np.exp(-tl2 / 0.08) * (1.0 if s % 8 == 0 else 0.6)
    for bt in range(8):
        tb = t0 + bt * beat
        j = int(tb * SR)
        nn = min(int(0.32 * SR), N - j)
        if nn > 0:
            tl2 = np.arange(nn) / SR
            freq = 48 + 90 * np.exp(-tl2 / 0.025)
            kick[j:j + nn] += np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tl2 / 0.14)
        if bt % 2 == 1:
            nn = min(int(0.18 * SR), N - j)
            if nn > 0:
                clap[j:j + nn] += bp(rng.standard_normal(nn), 900, 4000) * np.exp(-np.arange(nn) / SR / 0.05)
        for h in (0.5,):
            jh = int((tb + h * beat) * SR)
            nn = min(int(0.05 * SR), N - jh)
            if nn > 0:
                hat[jh:jh + nn] += hp(rng.standard_normal(nn), 8000) * np.exp(-np.arange(nn) / SR / 0.014)
    t0 += 2 * bar
    ci += 1

# sidechain pump keyed to the kick grid
phase = (tt % beat) / beat
pump = 0.55 + 0.45 * np.clip(phase / 0.35, 0, 1) ** 0.7
arp = lp(arp, 3200)
pad_L, pad_R = lp(pad_L, 2400), lp(pad_R, 2400)
intro = smooth_step(tt, 0, 0.3)
DROP = wt("A", 1, 0) - 0.02  # the beat drops on "Dos"
drums_on = groove * smooth_step(tt, DROP - 0.01, DROP)
mL += (pad_L * pump * (0.6 + 0.4 * groove) * intro + 0.5 * bass * pump * groove + 0.16 * arp * groove
       + 0.55 * kick * drums_on + 0.1 * clap * drums_on + 0.12 * hat * drums_on)
mR += (pad_R * pump * (0.6 + 0.4 * groove) * intro + 0.5 * bass * pump * groove + 0.16 * np.roll(arp, int(0.011 * SR)) * groove
       + 0.55 * kick * drums_on + 0.1 * clap * drums_on + 0.12 * np.roll(hat, 200) * drums_on)
# cold section: low filtered drone + slow clock tick (the other shop)
drone = np.zeros(N)
for h in range(1, 8):
    drone += np.sin(2 * np.pi * 55 * h * tt + h) / h * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * h * tt))
drone = lp(drone, 300)
tick = np.zeros(N)
k = 0
while COLD_A + k * 1.0 < COLD_B + 0.5:
    nt = int(0.02 * SR)
    place(tick, hp(rng.standard_normal(nt), 4000) * np.exp(-np.arange(nt) / SR / 0.004), COLD_A + 0.5 + k * 1.0, 0.25 if k % 2 else 0.4)
    k += 1
mL += (0.3 * drone + tick) * cold
mR += (0.3 * drone + np.roll(tick, 120)) * cold
# riser into the pull-out (E15) and a soft final hit
riser_env = smooth_step(tt, COLD_B - 2.0, COLD_B) ** 2 * (tt < COLD_B + 0.05)
riser = bp(rng.standard_normal(N), 700, 6000) * riser_env * 0.08
mL += riser
mR += np.roll(riser, 300)
# ending chord (A minor add9) ringing over the end card
i_end = int(S["E17"] * SR)
n_end = N - i_end
tl = np.arange(n_end) / SR
end_chord = sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (57, 60, 64, 71)) * np.exp(-tl / 1.2) * 0.07
mL[i_end:] += end_chord
mR[i_end:] += end_chord

# ── sound effects (synthesised) ─────────────────────────────────────────
sL = np.zeros(N)
sR = np.zeros(N)
sfx_events = []


def add_sfx(x, t0, db, pan=0.0, label=None):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (db / 20)
    place(sL, x, t0, 1 - max(pan, 0))
    place(sR, x, t0, 1 + min(pan, 0))
    if label:
        sfx_events.append({"t": round(t0, 3), "type": label})


def ping(m, decay=0.35, length=0.9):
    n = int(length * SR)
    tl = np.arange(n) / SR
    f = note_hz(m)
    return (np.sin(2 * np.pi * f * tl) + 0.3 * np.sin(2 * np.pi * 2.76 * f * tl) * np.exp(-tl / 0.06)) * np.exp(-tl / decay) * env_ar(n, 0.003, 0.02)


def ding():  # booking confirmed
    out = np.zeros(int(1.6 * SR))
    a, b = ping(88, 0.5, 1.5), ping(95, 0.6, 1.5)
    out[: len(a)] += a
    j = int(0.08 * SR)
    out[j:j + len(b)] += b[: len(out) - j]
    return out


def click():  # UI click
    n = int(0.03 * SR)
    tl = np.arange(n) / SR
    return hp(rng.standard_normal(n), 3000) * np.exp(-tl / 0.0025) + 0.7 * np.sin(2 * np.pi * 1800 * tl) * np.exp(-tl / 0.005)


def tap():  # softer, lower click (keyboard / tap)
    n = int(0.025 * SR)
    tl = np.arange(n) / SR
    return bp(rng.standard_normal(n), 1500, 5000) * np.exp(-tl / 0.004)


def pop(f0=900, f1=300):
    n = int(0.12 * SR)
    tl = np.arange(n) / SR
    freq = f0 * np.exp(-tl / 0.03) + f1
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tl / 0.035)


def thunk():  # rejected / struck out
    n = int(0.3 * SR)
    tl = np.arange(n) / SR
    freq = 150 + 120 * np.exp(-tl / 0.03)
    sq = np.sign(np.sin(2 * np.pi * np.cumsum(freq) / SR))
    return lp(sq, 1200) * np.exp(-tl / 0.08)


def whoosh(dur=0.8, f0=300, f1=4000):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    steps = 24
    for s in range(steps):
        a, b = s * n // steps, (s + 1) * n // steps
        fc = f0 * (f1 / f0) ** (s / steps)
        out[a:b] = bp(noise, fc * 0.7, min(fc * 1.4, SR / 2 - 100))[a:b]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2


def buzz(dur=0.55):  # phone vibrating on the counter
    n = int(dur * SR)
    tl = np.arange(n) / SR
    gate = (np.sin(2 * np.pi * 7 * tl) > -0.2).astype(float)
    gate = lp(gate, 60)
    x = (np.sin(2 * np.pi * 150 * tl) + 0.5 * np.sign(np.sin(2 * np.pi * 150 * tl))) * gate
    return lp(x, 900) * env_ar(n, 0.01, 0.05)


def bubble_dull():  # grey chat bubble: low, muffled pop
    return lp(pop(500, 180), 1500)


def coin():  # +10 points
    a, b = ping(91, 0.08, 0.15), ping(96, 0.25, 0.6)
    out = np.zeros(int(0.7 * SR))
    out[: len(a)] += a
    j = int(0.06 * SR)
    out[j:j + len(b)] += b[: len(out) - j]
    return out


def power_hit():  # sub thump + bright transient
    n = int(0.9 * SR)
    tl = np.arange(n) / SR
    freq = 42 + 120 * np.exp(-tl / 0.05)
    sub = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tl / 0.35)
    snap = hp(rng.standard_normal(n), 2500) * np.exp(-tl / 0.02) * 0.5
    return sub + snap


def zap():  # neon flicker buzz
    n = int(0.09 * SR)
    tl = np.arange(n) / SR
    x = np.sign(np.sin(2 * np.pi * 100 * tl)) * 0.6 + bp(rng.standard_normal(n), 2000, 9000)
    return x * env_ar(n, 0.002, 0.03)


def glitch():
    n = int(0.22 * SR)
    x = rng.standard_normal(n) * (rng.random(n // 400 + 1).repeat(400)[:n] > 0.5)
    return bp(x, 600, 7000) * env_ar(n, 0.002, 0.05)


# camera moves
add_sfx(whoosh(1.1, 300, 4000), 0.25, -27, label="whoosh")
# opening hook: the orange shop powers on (two flickers, then the hit)
add_sfx(power_hit(), 0.0, -17, label="power")
add_sfx(zap(), 0.08, -27)
add_sfx(zap(), 0.24, -24)
add_sfx(whoosh(0.9, 300, 4500), S["E4"] - 0.1, -27, label="whoosh")
add_sfx(whoosh(1.2, 4000, 300), S["E12"] + 0.1, -25, label="whoosh")
add_sfx(whoosh(1.6, 250, 5000), S["E15"] - 0.1, -24, label="whoosh")
# caption highlight boxes
for k, c in captions.items():
    for ch in c["chunks"]:
        if ch["hl"]:
            add_sfx(click(), ch["t"], -27 if ch["hl"] == "o" else -30, label="hl")
add_sfx(click(), cta["keyword"], -26, label="hl")
# HUD labels and prices
add_sfx(pop(1100, 400), 0.9, -28, pan=-0.2, label="hud")
add_sfx(pop(1200, 420), 1.15, -28, pan=0.2, label="hud")
add_sfx(pop(1000, 380), ev["price"], -27, pan=-0.2, label="price")
add_sfx(pop(1000, 380), ev["price"] + 0.18, -27, pan=0.2, label="price")
for k in range(5):
    add_sfx(tap(), ev["fill"] + 0.3 + k * 0.38, -33, pan=0.3)
# progress bar stage changes
for key in ("E5", "E6", "E8", "E10"):
    add_sfx(click(), S[key] + 0.1, -29, pan=-0.4, label="stage")
# phone: whoosh in, slot select, typing, press, ding
add_sfx(whoosh(0.6, 500, 5000), ev["phoneIn"] - 0.1, -28)
add_sfx(click(), ev["slot"], -24, label="slot")
k_t = ev["typing"]
while k_t < ev["press"] - 0.25:
    add_sfx(tap(), k_t, -32 + rng.uniform(-2, 2))
    k_t += rng.uniform(0.07, 0.12)
add_sfx(click(), ev["press"], -23, label="press")
add_sfx(ding(), ev["confirm"], -19, label="ding")
add_sfx(whoosh(0.5, 3000, 400), ev["phoneOut"], -30)
# tags over the chairs, the clash, the cancellation
add_sfx(pop(1200, 400), ev["tag1"], -26, pan=-0.2, label="tag")
add_sfx(pop(1200, 400), ev["tag2"], -26, pan=0.2, label="tag")
add_sfx(pop(900, 300), ev["clash"] - 0.2, -27, label="tag")
add_sfx(thunk(), ev["clashX"] - 0.6, -24, label="thunk")
add_sfx(pop(1200, 400), ev["fede"], -26, label="tag")
add_sfx(thunk(), ev["cancel"], -24, label="thunk")
add_sfx(ding(), ev["notify"], -22, label="ding")
for k in range(4):
    add_sfx(tap(), ev["walk"] + k * 0.32, -34)
for k in range(4):
    add_sfx(coin(), ev["plus"] + k * 0.16, -25, pan=(-0.3 + 0.2 * k), label="coin")
add_sfx(pop(1300, 450), ev["card"], -25, label="card")
add_sfx(click(), ev["redeem"], -25, label="redeem")
add_sfx(coin(), ev["redeem"] + 0.05, -26)
# the other shop: vibrating phone and chats nobody answers
for t_ in ev["vibrate"]:
    add_sfx(buzz(), t_, -25, label="buzz")
for k, t_ in enumerate(ev["bubbles"]):
    add_sfx(bubble_dull(), t_, -26 - (k % 3), pan=(-0.25 if k % 2 else 0.25), label="bubble")
add_sfx(glitch(), captions["E14"]["end"] - 0.02, -24, label="glitch")
# CTA: typing AUDITORIA
for k in range(len("AUDITORIA")):
    add_sfx(tap(), ev["typeStart"] + k * ev["typeStep"], -27 + rng.uniform(-2, 1))
add_sfx(pop(1400, 500), S["E17"] + 0.15, -24, label="end")

# ── levels: voice ≈ -14 LUFS, music bed -24 LUFS under voice, sfx on top ─
meter = pyln.Meter(SR)
v_lufs = meter.integrated_loudness(voice[: int(S["E17"] * SR)])
voice *= 10 ** ((-14 - v_lufs) / 20)
m_lufs = meter.integrated_loudness(np.stack([mL[int(3 * SR):int(38 * SR)], mR[int(3 * SR):int(38 * SR)]], 1))
# duck music a little while the voice speaks
hop = SR // 100
v_env = np.sqrt(np.convolve(voice ** 2, np.ones(hop) / hop, mode="same"))
duck = np.clip(v_env / (np.percentile(v_env[v_env > 1e-4], 50) + 1e-9), 0, 1)
duck = np.convolve(duck, np.ones(int(0.15 * SR)) / int(0.15 * SR), mode="same")
music_db = -23 - m_lufs - 3 * duck
mgain = 10 ** (music_db / 20) * np.clip((TOTAL - tt) / 1.2, 0, 1)
L = mL * mgain + sL + voice
R = mR * mgain + sR + voice
mix = np.stack([L, R], axis=1)


def limit(x, ceiling_db=-1.2):
    """Simple look-ahead peak limiter."""
    from scipy.ndimage import minimum_filter1d
    thr = 10 ** (ceiling_db / 20)
    g = np.minimum(1.0, thr / np.maximum(np.max(np.abs(x), axis=1), 1e-9))
    g = minimum_filter1d(g, size=2 * int(0.005 * SR) + 1)
    rel = np.exp(-1 / (0.08 * SR))
    gs = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else g[i] + (cur - g[i]) * rel
        gs[i] = cur
    return x * gs[:, None]


target = -14.0
for _ in range(3):
    mix = limit(mix * 10 ** ((target - meter.integrated_loudness(mix)) / 20))
final_lufs = meter.integrated_loudness(mix)

out_wav = os.path.join(ROOT, "public", "audio", "mix.wav")
os.makedirs(os.path.dirname(out_wav), exist_ok=True)
pcm16 = (np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", out_wav],
               input=pcm16, check=True)

duration_frames = int(round(TOTAL * FPS))
timeline = {
    "fps": FPS,
    "durationInFrames": duration_frames,
    "scenes": scenes,
    "captions": captions,
    "cta": {k: round(v, 3) for k, v in cta.items()},
    "ev": ev,
    "sfx": sfx_events,
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False)
print(f"duration {TOTAL:.2f}s ({duration_frames} frames) · LUFS {final_lufs:.2f} · "
      f"peak {20 * np.log10(np.max(np.abs(mix))):.2f} dBFS")
for k, v in captions.items():
    print(k, v["start"], v["end"], " ".join(c["text"] for c in v["chunks"]))
print(json.dumps(ev))
