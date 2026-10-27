"""Builds the reel's voice edit, audio mix and timeline.

Inputs:  ../audio/raw/dos-noches/*.mp3 (ElevenLabs takes), data/words.json (from align.py)
Outputs: ../audio/clean/dos-noches/narrador-{A,B}.mp3 (trimmed + tempo, WSOLA),
         public/audio/mix.wav (voice + music + sfx, -14 LUFS), src/timeline.json

Run: python scripts/build.py
"""
import glob, json, math, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "dos-noches")
CLEAN = os.path.join(ROOT, "..", "audio", "clean", "dos-noches")
TAKES = {"A": "4fe6ad6f-*.mp3", "B": "b5fad558-*.mp3"}
SR = 48000
FPS = 30
WPM = 180
rng = np.random.default_rng(11)

ALIGN = json.load(open(os.path.join(ROOT, "data", "words.json")))


def load(path, tempo=1.0):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.float32).astype(np.float64)
    if tempo == 1:
        return x
    # time-domain WSOLA keeps the pitch and the harmonics intact; the phase vocoder
    # (rubberband) smeared them and the voice sounded doubled
    from audiotsm import wsola
    from audiotsm.io.array import ArrayReader, ArrayWriter
    w = ArrayWriter(1)
    wsola(1, speed=tempo, frame_length=1024, synthesis_hop=256).run(ArrayReader(x[None, :]), w)
    return w.data[0]


def speech_rms(x):
    hop = SR // 100
    n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return np.sqrt(np.mean(r[r > 10 ** (-40 / 20)] ** 2))


# ── voice edit: tempo to ~180 wpm, then pauses trimmed inside real silence ──
# gap targets after each segment (s); 0.3 s after the hook, in the turn and before the CTA
GAPS = {"A": [0.2, 0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], "B": [0.2, 0.2, 0.2, 0.3, 0.3]}


def edit(take):
    segs = ALIGN[take]["segments"]
    words = ALIGN[take]["words"]
    gaps = [min(g, segs[i + 1][0] - segs[i][1]) for i, g in enumerate(GAPS[take])]
    speech = sum(b - a for a, b in segs)
    target = len(words) * 60 / WPM
    tempo = speech / (target - sum(gaps))
    x = load(glob.glob(os.path.join(RAW, TAKES[take]))[0], tempo)
    segs = [[a / tempo, b / tempo] for a, b in segs]
    words = [dict(w, s=w["s"] / tempo, e=w["e"] / tempo) for w in words]
    xf = int(0.008 * SR)
    pieces, t, seg_new = [], 0.0, []
    lead, tail = 0.05, 0.18
    for i, (a, b) in enumerate(segs):
        pre = lead if i == 0 else gaps[i - 1] / 2
        post = tail if i == len(segs) - 1 else gaps[i] / 2
        i0, i1 = int((a - pre) * SR), int((b + post) * SR)
        p = x[max(0, i0):i1].copy()
        p[:xf] *= np.linspace(0, 1, xf)
        p[-xf:] *= np.linspace(1, 0, xf)
        seg_new.append(t + pre)
        pieces.append(p)
        t += len(p) / SR
    y = np.concatenate(pieces)
    out = []
    for w in words:
        k = next(i for i, (a, b) in enumerate(segs) if a - 0.01 <= w["s"] <= b + 0.01)
        off = seg_new[k] - segs[k][0]
        out.append({"w": w["w"], "s": w["s"] + off, "e": w["e"] + off})
    real = len(out) / ((out[-1]["e"] - out[0]["s"]) / 60)
    print(f"{take}: tempo x{tempo:.3f} · {len(y) / SR:.2f}s · {real:.0f} wpm")
    return y, out


A, WA = edit("A")
B, WB = edit("B")
os.makedirs(CLEAN, exist_ok=True)
for name, x in (("narrador-A", A), ("narrador-B", B)):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-b:a", "192k", os.path.join(CLEAN, name + ".mp3")], input=pcm, check=True)
A *= 10 ** (-18 / 20) / speech_rms(A)
B *= 10 ** (-18 / 20) / speech_rms(B)

# ── timeline (seconds) ──────────────────────────────────────────────────
HOLD = 10 / FPS  # every sentence stays ≥ 10 frames after its last word
A_start = 0.12
A_end = A_start + WA[-1]["e"]
E5 = A_end + HOLD + 0.05
NIGHT = 9.5
E6 = E5 + NIGHT
B_start = E6 + 0.75  # alarm + light sweep first, then the voice
ta = lambda i: A_start + WA[i]["s"]
tb = lambda i: B_start + WB[i]["s"]


def sentence(W, off, i0, i1, text, kinds=None, merge=None):
    """Display words for spoken words i0..i1; merge maps a display index to the spoken range it covers."""
    merge = merge or {}
    out, i = [], i0
    for k, disp in enumerate(text.split()):
        j = i + merge.get(k, 1) - 1
        out.append({"text": disp, "start": round(off + W[i]["s"], 3), "end": round(off + W[j]["e"], 3),
                    "kind": (kinds or {}).get(k)})
        i = j + 1
    assert i == i1 + 1, (text, i, i1)
    return {"words": out, "start": out[0]["start"], "end": out[-1]["end"]}


# spoken A: Misma noche, dos negocios. Uno se apaga a las nueve. | Este cierra a las nueve. Apaga el móvil.
# Duerme. | Este también duerme. Pero su inteligencia artificial no. | Esa noche, cinco clientes escriben a los dos.
caps = {
    "S1a": sentence(WA, A_start, 0, 3, "Misma noche, dos negocios."),
    "S1b": sentence(WA, A_start, 4, 9, "Uno se apaga a las nueve.", {2: "emo"}),
    "S2a": sentence(WA, A_start, 10, 14, "Este cierra a las nueve."),
    "S2b": sentence(WA, A_start, 15, 18, "Apaga el móvil. Duerme."),
    "S3a": sentence(WA, A_start, 19, 21, "Este también duerme."),
    "S3b": sentence(WA, A_start, 22, 26, "Pero su IA no.", {2: "key", 3: "emo"}, merge={2: 2}),
    "S4": sentence(WA, A_start, 27, 34, "Esa noche, cinco clientes escriben a los dos.", {2: "key"}),
    "S6a": sentence(WB, B_start, 0, 4, "Las ocho de la mañana."),
    "S6b": sentence(WB, B_start, 5, 8, "Se despiertan los dos."),
    "S7": sentence(WB, B_start, 9, 17, "Uno abre el móvil y ve cinco clientes perdidos.", {8: "emo"}),
    "S8": sentence(WB, B_start, 18, 24, "El otro se despierta con cinco reservas.", {5: "key", 6: "key"}),
    "S9a": sentence(WB, B_start, 25, 30, "¿Cuál de los dos eres tú?"),
    "S9b": sentence(WB, B_start, 31, 32, "Comenta AUDITORIA.", {1: "key"}),
}
END = caps["S9b"]["end"] + 2.1
duration_frames = math.ceil(END * FPS)
total = duration_frames / FPS
N = int(total * SR) + SR

scenes = {
    "E1": 0, "E2": caps["S2a"]["start"] - 0.06, "E3": caps["S3a"]["start"] - 0.06, "E4": caps["S4"]["start"] - 0.06,
    "E5": E5, "E6": E6, "E7": caps["S7"]["start"] - 0.1, "E8": caps["S8"]["start"] - 0.1,
    "E9": caps["S9a"]["start"] - 0.12, "END": total,
}
scenes = {k: round(v, 3) for k, v in scenes.items()}

# night events: [offset in E5, clock, channel]
NIGHT_EVENTS = [(0.0, "23:07", "call"), (1.5, "00:42", "chat"), (3.0, "02:15", "chat"), (5.0, "06:30", "form"),
                (7.0, "07:50", "call")]
night = [{"t": round(E5 + o, 3), "clock": c, "kind": k, "arrive": round(E5 + o + 0.35, 3),
          "lost": round(E5 + o + 0.75, 3), "booked": round(E5 + o + 0.95, 3)} for o, c, k in NIGHT_EVENTS]

# ── mix buffers ─────────────────────────────────────────────────────────
voice = np.zeros(N)


def place(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    n = max(0, min(len(x), len(buf) - i))
    buf[i:i + n] += x[:n] * gain


place(voice, A, A_start)
place(voice, B, B_start)

# ── music (original, synthesised) ───────────────────────────────────────
BPM = 90
beat = 60 / BPM
tt = np.arange(N) / SR


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def note_hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


mL = np.zeros(N)
mR = np.zeros(N)
dawn = E6 + 0.25

# NIGHT: D-minor drone, minor-second shimmer, heartbeat sub pulse; tension rises through E5
drone = np.zeros(N)
for h in range(1, 10):
    drone += np.sin(2 * np.pi * 36.71 * h * tt + h) / h * (0.7 + 0.3 * np.sin(2 * np.pi * 0.13 * h * tt))
drone += 0.5 * np.sin(2 * np.pi * 55.0 * tt) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * tt))
night_rise = np.clip((tt - E5) / NIGHT, 0, 1)
drone = lp(drone, 380) * (1 + 0.6 * night_rise)
shimmer = (np.sin(2 * np.pi * 1174.7 * tt) + np.sin(2 * np.pi * 1244.5 * tt)) * 0.035 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.6 * tt))
pulse = np.zeros(N)
k = 0
while k * beat < dawn + 1:
    i = int(k * beat * SR)
    n = int(0.35 * SR)
    seg = np.sin(2 * np.pi * 48 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR / 0.09)
    pulse[i:i + n] += seg[: len(pulse[i:i + n])] * (1.0 if k % 2 == 0 else 0.5)
    k += 1
# rising filtered noise + 16th gate on a fifth through the night, peaking at 07:50
riser_n = bp(rng.standard_normal(N), 800, 5000) * 0.05
gate = (np.sin(2 * np.pi * tt / (beat / 4)) > 0).astype(float)
gate = lp(gate, 60)
fifth = (np.sin(2 * np.pi * note_hz(62) * tt) + np.sin(2 * np.pi * note_hz(69) * tt)) * 0.06 * gate
tension = np.clip((tt - E5 + 0.3) / 0.6, 0, 1) * np.clip((dawn - tt) / 0.25, 0, 1)
night_bus = 0.35 * drone + shimmer + 0.85 * pulse + (riser_n * night_rise ** 2 + fifth * (0.4 + 0.6 * night_rise)) * tension
night_env = np.clip((dawn + 0.35 - tt) / 0.35, 0, 1)
mL += night_bus * night_env
mR += night_bus * night_env

# DAWN: warm pads in D major + plucked arpeggio + soft kick/hats
prog = [[62, 66, 69, 73, 76], [59, 62, 66, 69, 73], [55, 59, 62, 66, 69], [57, 61, 64, 66, 69]]  # Dmaj9 Bm9 Gmaj9 A6
bar = 4 * beat
t0 = dawn
padL = np.zeros(N)
padR = np.zeros(N)
arp = np.zeros(N)
drums = np.zeros(N)
ci = 0
while t0 < total:
    chord = prog[ci % 4]
    i0 = int(t0 * SR)
    n = min(int(bar * SR) + int(0.8 * SR), N - i0)
    if n <= 0:
        break
    tl = np.arange(n) / SR
    e = env_adsr(n, 0.35 if ci else 0.9, 0.8)
    for m in chord:
        f = note_hz(m)
        padL[i0:i0 + n] += (np.sin(2 * np.pi * f * 0.997 * tl) + 0.3 * np.sin(2 * np.pi * 2 * f * tl)) * e * 0.12
        padR[i0:i0 + n] += (np.sin(2 * np.pi * f * 1.003 * tl) + 0.3 * np.sin(2 * np.pi * 2 * f * tl)) * e * 0.12
    pattern = [0, 2, 1, 3, 2, 4, 3, 1]
    for s in range(16):
        ts = t0 + s * beat / 4
        if ts >= total or ci == 0 and s < 4:
            continue
        m = chord[pattern[s % 8]] + 12
        j = int(ts * SR)
        nn = min(int(0.25 * SR), N - j)
        tl2 = np.arange(nn) / SR
        f = note_hz(m)
        arp[j:j + nn] += (np.sin(2 * np.pi * f * tl2) + 0.25 * np.sin(4 * np.pi * f * tl2)) * np.exp(-tl2 / 0.09) * (0.9 if s % 4 == 0 else 0.6)
    for b_ in range(4):
        tb_ = t0 + b_ * beat
        if ci == 0:
            continue
        j = int(tb_ * SR)
        if b_ % 2 == 0:
            nn = min(int(0.3 * SR), N - j)
            tl2 = np.arange(nn) / SR
            freq = 45 + 75 * np.exp(-tl2 / 0.03)
            drums[j:j + nn] += np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tl2 / 0.12) * 0.8
        jh = int((tb_ + 0.5 * beat) * SR)
        nn = min(int(0.04 * SR), N - jh)
        if nn > 0:
            drums[jh:jh + nn] += hp(rng.standard_normal(nn), 7000) * np.exp(-np.arange(nn) / SR / 0.012) * 0.16
    t0 += bar
    ci += 1
dawn_env = np.clip((tt - dawn) / 0.9, 0, 1)
arp = lp(arp, 3500)
mL += (padL + 0.22 * arp + 0.5 * drums) * dawn_env
mR += (padR + 0.22 * np.roll(arp, int(0.012 * SR)) + 0.5 * drums) * dawn_env

# levels: bed ≈ 12 dB under the voice ("-22 dB" in the brief), +4 dB during the voiceless night,
# a short dip under the rewind in E9, fade at the end
ref = np.sqrt(np.mean(((mL + mR) / 2)[int(1 * SR):int((E5 - 0.5) * SR)] ** 2))
gain_db = np.full(N, -30.0) - 20 * np.log10(ref)
lift = np.clip(np.minimum((tt - (E5 - 0.3)) / 0.6, (E6 + 0.6 - tt) / 0.6), 0, 1)
gain_db += 4 * lift
ref2 = np.sqrt(np.mean(((mL + mR) / 2)[int((E6 + 2) * SR):int((scenes["E9"]) * SR)] ** 2))
ref1 = np.sqrt(np.mean(((mL + mR) / 2)[int(1 * SR):int((E5 - 0.5) * SR)] ** 2))
gain_db += np.where(tt > dawn, 20 * np.log10(ref1 / ref2), 0) * dawn_env  # keep the dawn bed at the same level
rw = scenes["E9"]
gain_db -= 8 * np.clip(np.minimum((tt - rw) / 0.15, (rw + 1.1 - tt) / 0.3), 0, 1)
gain = 10 ** (gain_db / 20) * np.clip((total - tt) / 1.4, 0, 1)
L = mL * gain
R = mR * gain

# ── sound effects (synthesised) ─────────────────────────────────────────
sfx_events = []


def add_sfx(x, t0, db, pan=0.0, label=None):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (db / 20)
    place(L, x, t0, 1 - max(pan, 0))
    place(R, x, t0, 1 + min(pan, 0))
    if label:
        sfx_events.append({"t": round(t0, 3), "type": label})


def switch():
    n = int(0.09 * SR)
    tl = np.arange(n) / SR
    a = hp(rng.standard_normal(n), 2500) * np.exp(-tl / 0.003)
    b = np.sin(2 * np.pi * 2600 * tl) * np.exp(-tl / 0.004)
    c = np.zeros(n)
    d = int(0.028 * SR)
    c[d:] = (hp(rng.standard_normal(n - d), 1800) * np.exp(-np.arange(n - d) / SR / 0.004)) * 0.7
    return a + 0.6 * b + c


def tick(f=3200, decay=0.004):
    n = int(0.04 * SR)
    tl = np.arange(n) / SR
    return bp(rng.standard_normal(n), f * 0.7, min(f * 1.6, 20000)) * np.exp(-tl / decay) + 0.4 * np.sin(2 * np.pi * f * tl) * np.exp(-tl / 0.006)


def dull_click():
    # dry, muffled: low-passed thump + short click, no ring
    n = int(0.12 * SR)
    tl = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (180 * np.exp(-tl / 0.02) + 90) * tl) * np.exp(-tl / 0.03)
    return lp(thump + 0.4 * rng.standard_normal(n) * np.exp(-tl / 0.004), 1200)


def ping(m):
    n = int(0.9 * SR)
    tl = np.arange(n) / SR
    f = note_hz(m)
    return (np.sin(2 * np.pi * f * tl) + 0.35 * np.sin(2 * np.pi * 2.76 * f * tl) * np.exp(-tl / 0.08)) * np.exp(-tl / 0.35) * env_adsr(n, 0.004, 0.02)


def buzz(dur=0.36):
    # phone vibrating on wood: 2 short low pulses
    n = int(dur * SR)
    tl = np.arange(n) / SR
    g = ((tl % 0.18) < 0.12).astype(float)
    g = lp(g, 80)
    return lp(np.sin(2 * np.pi * 170 * tl) * (1 + 0.5 * np.sign(np.sin(2 * np.pi * 85 * tl))) * g, 900)


def whoosh(dur=0.7, f0=300, f1=4000):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    steps = 24
    for s in range(steps):
        a, b = s * n // steps, (s + 1) * n // steps
        fc = f0 * (f1 / f0) ** (s / steps)
        out[a:b] = bp(noise, fc * 0.7, min(fc * 1.4, SR / 2 - 100))[a:b]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2


def pop():
    n = int(0.12 * SR)
    tl = np.arange(n) / SR
    freq = 900 * np.exp(-tl / 0.03) + 300
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tl / 0.03)


def alarm():
    # gentle synthetic wake-up: two rising marimba-like phrases
    out = np.zeros(int(1.5 * SR))
    for r in range(2):
        for k, m in enumerate([74, 78, 81, 86]):
            j = int((r * 0.72 + k * 0.13) * SR)
            n = int(0.5 * SR)
            tl = np.arange(n) / SR
            f = note_hz(m)
            x = (np.sin(2 * np.pi * f * tl) + 0.2 * np.sin(2 * np.pi * 4 * f * tl) * np.exp(-tl / 0.02)) * np.exp(-tl / 0.16)
            out[j:j + n] += x[: len(out) - j] * (0.75 + 0.25 * r)
    return out


def rewind(dur=1.0):
    # tape/clock rewind: accelerating ticks + descending whir
    n = int(dur * SR)
    tl = np.arange(n) / SR
    whir = np.sin(2 * np.pi * np.cumsum(1400 - 900 * tl / dur) / SR) * 0.25
    out = whir * np.sin(np.pi * tl / dur)
    t_ = 0.0
    k = 0
    while t_ < dur - 0.04:
        j = int(t_ * SR)
        x = tick(2800 + 400 * (k % 2), 0.003)
        out[j:j + len(x)] += x[: n - j] * 0.8
        t_ += max(0.028, 0.11 * (1 - t_ / dur) ** 1.5)
        k += 1
    return bp(out, 300, 9000)


low_hit = lambda: lp(np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-np.arange(int(0.7 * SR)) / SR / 0.05)) / SR)
                     * np.exp(-np.arange(int(0.7 * SR)) / SR / 0.25), 400)

w = lambda sid, k: caps[sid]["words"][k]["start"]
# E1-E2: switch ticks (the top sign goes off, then "CERRADO"), soft DND blip
add_sfx(switch(), w("S1b", 2), -17, label="switch_off")
add_sfx(switch(), w("S2a", 1), -19, label="switch_closed")
add_sfx(lp(ping(69), 1500)[: int(0.35 * SR)], w("S2b", 0) + 0.1, -28, label="dnd")
# E1-E4: a slow clock tick (one per second) under the narration
for k in range(int(E5)):
    add_sfx(tick(), 0.5 + k, -36)
# E3: the AI pill lights up + pop on "IA"
add_sfx(ping(81), w("S3b", 2) - 0.05, -26, label="ai_on")
add_sfx(pop(), w("S3b", 2), -21, label="pop")
# E4: five lights leave the clock + pop on "cinco"
add_sfx(whoosh(0.8, 500, 6000), scenes["E4"] + 0.15, -24, label="lights")
add_sfx(pop(), w("S4", 2), -21, label="pop")
# E5: accelerated clock ticks; per event: vibration, dull click top, rising ping bottom
t_ = E5
while t_ < E6 - 0.05:
    p = (t_ - E5) / NIGHT
    add_sfx(tick(3000 + 300 * (int(t_ * 20) % 2)), t_, -27 + 3 * p)
    t_ += 0.25 - 0.13 * p
for k, ev in enumerate(night):
    add_sfx(buzz(), ev["arrive"], -24, label="arrive")
    add_sfx(dull_click(), ev["lost"], -17, pan=0.0, label="lost")
    add_sfx(ping(72 + [0, 2, 4, 7, 9][k]), ev["booked"], -21, label="booked")
# E6: soft alarm + whoosh on the light sweep
add_sfx(alarm(), E6 - 0.05, -21, label="alarm")
add_sfx(whoosh(0.7, 250, 5000), E6 + 0.25, -21, label="sweep")
# E7: low hit on "perdidos"
add_sfx(low_hit(), w("S7", 8), -20, label="lost_hit")
# E8: whoosh forming the "5" + pop on "cinco"
add_sfx(whoosh(0.45, 600, 7000), w("S8", 5) - 0.35, -21, label="whoosh5")
add_sfx(pop(), w("S8", 5), -19, label="pop")
# E9: clock rewinds 08:00 → 21:00, pop on AUDITORIA
add_sfx(rewind(1.05), scenes["E9"] + 0.05, -20, label="rewind")
add_sfx(pop(), w("S9b", 1), -18, label="pop")

# ── final mix, loudness, limiter ────────────────────────────────────────
L += voice
R += voice
mix = np.stack([L, R], axis=1)[: int(total * SR)]
meter = pyln.Meter(SR)


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

timeline = {
    "fps": FPS,
    "durationInFrames": duration_frames,
    "scenes": scenes,
    "captions": caps,
    "night": night,
    "sfx": sfx_events,
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False)
print(f"duration {total:.2f}s ({duration_frames} frames) · A {A_start:.2f}-{A_end:.2f}s · B {B_start:.2f}s · "
      f"LUFS {final_lufs:.2f} · peak {20 * np.log10(np.max(np.abs(mix))):.2f} dBFS")
print(json.dumps(scenes))
