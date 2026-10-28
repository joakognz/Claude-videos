"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/<take>.mp3 (the three ElevenLabs narrator takes, A/B/C)
Outputs: public/audio/mix.wav (ambience + music + sfx + voice, -14 LUFS), src/timeline.json

Word timings come from the take's speech segments (silence detection) and are spread
over each segment by syllable count; the script text is known, so no ASR is needed.
Take B has ~3.5 s of extra speech after "no duerme" that is not in the script: it is not used.

Run: python scripts/build.py
"""
import json, math, os, re, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw")
SR = 48000
FPS = 30
rng = np.random.default_rng(7)
TAKES = {"A": "8e6035ca", "B": "2f6384e0", "C": "1dd43732"}


def load(prefix):
    f = next(x for x in os.listdir(RAW) if x.startswith(prefix))
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(RAW, f), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


X = {k: load(p) for k, p in TAKES.items()}

# ── phrases: (take, [(raw start, raw end, text)], timeline start) ─────────
# Sub-segments are the take's speech runs between pauses (silencedetect -45 dB).
PHRASES = {
    "a1": ("A", [(0.02, 1.08, "Tienes un negocio.")], 0.45),
    "a2": ("A", [(1.33, 3.02, "Llamadas, mensajes,"), (3.08, 4.20, "pedidos y citas…"), (4.46, 5.74, "apuntados a mano…")], 2.55),
    "a3": ("A", [(6.09, 8.30, "Quizá no sabes qué es una automatización.")], 7.35),
    "a4": ("A", [(8.72, 9.42, "Te lo explico.")], 10.05),
    "b1": ("B", [(0.05, 3.21, "Automatizar es que tu negocio haga solo lo repetitivo.")], 12.4),
    "b2": ("B", [(3.56, 4.32, "Te escriben…")], 16.2),
    "b3": ("B", [(4.64, 5.74, "y se contesta solo.")], 17.55),
    "b4": ("B", [(6.06, 7.34, "Responder mensajes.")], 19.9),
    "b5": ("B", [(7.67, 9.28, "Confirmar citas y pedidos.")], 21.51),
    "b6": ("B", [(9.62, 11.03, "Enviar recordatorios.")], 23.46),
    "b7": ("B", [(11.36, 12.54, "Avisar de cambios.")], 25.2),
    "b8": ("B", [(13.00, 13.69, "¿Y una web?")], 26.95),
    "b9": ("B", [(14.03, 15.92, "Una web no te ahorra todo el tiempo…")], 28.9),
    "b10": ("B", [(16.24, 17.89, "…porque la gente sigue llamando"), (18.06, 18.45, "y tú"), (18.55, 19.74, "sigues confirmando.")], 31.2),
    "b11": ("B", [(20.07, 21.66, "La web es un escaparate.")], 35.6),
    "b12": ("B", [(21.99, 23.05, "La automatización,"), (23.27, 24.85, "un empleado que no duerme.")], 37.6),
    "c1": ("C", [(0.05, 1.82, "Este era tu negocio antes.")], 41.6),
    "c2": ("C", [(2.19, 4.57, "Y así es tu negocio con automatización.")], 45.4),
    "c3": ("C", [(4.92, 6.87, "Ahora sí marca la diferencia.")], 49.6),
    "c4": ("C", [(7.24, 8.38, "Comenta automatizar"), (8.53, 10.96, "y te enseño cómo quedaría tu negocio.")], 53.0),
}

V = "aeiouáéíóúü"
STRONG = "aeoáéóíú"


def syl(w):
    w = re.sub(r"[^\wáéíóúñü]", "", w.lower()).replace("qu", "q").replace("gue", "ge").replace("gui", "gi")
    n, prev = 0, None
    for ch in w:
        if ch in V:
            if prev is None or (prev in STRONG and ch in STRONG):
                n += 1
            prev = ch
        else:
            prev = None
    return max(n, 1)


# ── voice placement + word times ────────────────────────────────────────
PAD_IN, PAD_OUT = 0.06, 0.14
voice_parts = []  # (audio, timeline start)
words = {}        # phrase id -> [{text, start, end}]
phrase_span = {}
for pid, (take, subs, t0) in PHRASES.items():
    x = X[take]
    raw0 = subs[0][0]
    a = int(max(0, raw0 - PAD_IN) * SR)
    b = int(min(len(x) / SR, subs[-1][1] + PAD_OUT) * SR)
    seg = x[a:b].copy()
    f = int(0.01 * SR)
    seg[:f] *= np.linspace(0, 1, f)
    seg[-f * 3:] *= np.linspace(1, 0, f * 3)
    voice_parts.append((seg, t0 - (raw0 - a / SR)))
    ws = []
    for s0, s1, text in subs:
        toks = text.split()
        sy = np.array([syl(w) for w in toks], float)
        edges = s0 + np.concatenate([[0], np.cumsum(sy)]) / sy.sum() * (s1 - s0)
        for k, w in enumerate(toks):
            ws.append({"text": w, "start": round(t0 + edges[k] - raw0, 3), "end": round(t0 + edges[k + 1] - raw0, 3)})
    words[pid] = ws
    phrase_span[pid] = (t0, round(t0 + subs[-1][1] - raw0, 3))

W = lambda pid, i: words[pid][i]["start"]
WE = lambda pid, i: words[pid][i]["end"]

# ── scenes (brief E1-E13) ───────────────────────────────────────────────
S = {
    "E1": 0.0, "E2": 2.3, "E3": 7.15, "E4": 9.85, "E5": 12.2, "E6": 19.7, "E7": 26.75, "E8": 28.7,
    "E9": 35.4, "E10": 41.0, "E11": 43.9, "E12": 49.1, "E13": 52.7, "OUTRO": 57.05,
}
END = 58.6
duration_frames = math.ceil(END * FPS)
total = duration_frames / FPS
N = int(total * SR) + SR
S["END"] = total


# ── on-screen captions (top). kind: "neg" grey box · "pos" orange box ───
def cap(pid_words, text, marks=None, small=None):
    """pid_words: list of (phrase id, word index) for each display word, in order."""
    disp = text.split()
    assert len(disp) == len(pid_words), (text, len(disp), len(pid_words))
    out = []
    for k, (pid, i) in enumerate(pid_words):
        out.append({"text": disp[k], "start": W(pid, i), "end": WE(pid, i), "kind": (marks or {}).get(k)})
    return {"words": out, "start": out[0]["start"], "end": out[-1]["end"], "small": small}


def seq(pid, i0, i1):
    return [(pid, i) for i in range(i0, i1 + 1)]


caps = {
    "E1": cap(seq("a1", 0, 2), "Tienes un negocio.", {2: "neg"}),
    "E2": cap(seq("a2", 0, 7), "Llamadas, mensajes, pedidos y citas apuntados a mano…"),
    "E3": cap(seq("a3", 0, 6), "Quizá no sabes qué es una automatización.", {6: "pos"}),
    "E4": cap(seq("a4", 0, 2), "Te lo explico.", {2: "pos"}),
    "E5": cap(seq("b1", 0, 8), "Automatizar es que tu negocio haga solo lo repetitivo.", {6: "pos"}),
    "E7": cap(seq("b8", 0, 2), "¿Y una web?"),
    "E8a": cap(seq("b9", 0, 7), "Una web no te ahorra todo el tiempo…", {2: "neg"}),
    "E8b": cap(seq("b10", 0, 8), "…porque la gente sigue llamando y tú sigues confirmando.", {7: "neg", 8: "neg"}),
    "E9a": cap(seq("b11", 0, 4), "La web es un escaparate."),
    "E9b": cap(seq("b12", 0, 6), "La automatización, un empleado que no duerme.", {5: "pos", 6: "pos"}),
    "E10": cap(seq("c1", 0, 4), "Este era tu negocio antes.", {4: "neg"}),
    "E11": cap(seq("c2", 1, 6), "Así es tu negocio con automatización.", {4: "pos", 5: "pos"}),
    "E12": cap(seq("c3", 0, 4), "Ahora sí marca la diferencia.", {4: "pos"}),
    "E13": cap(seq("c4", 0, 1), "Comenta AUDITORIA", {1: "pos"}, small={"text": "y te enseño cómo quedaría tu negocio.", "start": W("c4", 2)}),
}
# ── visual events tied to the voice ─────────────────────────────────────
ev = {
    # E2 chaos: landline rings, owner's mobile buzzes, notebook fills
    "ring": [W("a2", 0) - 0.05, W("a2", 3) + 0.1, 41.25, 42.9, W("b10", 3) - 0.1, 34.0],
    "scribble": [W("a2", 2), W("a2", 4), W("a2", 6), W("a2", 7) + 0.25, 41.5, 42.4, 43.1],
    "mobileBuzz": [W("a2", 1) - 0.05, 6.0, 42.1],
    "signFlash": W("a4", 2) - 0.05,
    # E5 phone chat
    "phoneIn": [W("b1", 5), 29.35, 44.95],
    "phoneOut": [19.75, 35.25, 49.0],
    "msgIn": W("b2", 0) - 0.1,
    "typing": W("b2", 1) + 0.25,
    "autoReply": W("b3", 2) - 0.05,
    "line": W("b3", 3),
    # E6 list (one line per phrase)
    "list": [W("b4", 0), W("b5", 0), W("b6", 0), W("b7", 0)],
    "listOut": S["E7"] - 0.05,
    # E7/E8 web
    "web": W("b8", 2) - 0.2,
    "webOut": S["E9"] + 3.2,
    "bubbles": [29.6, 30.95, W("b10", 1) + 0.05],
    # E9 core in the counter
    "core": W("b12", 5),
    # E10 back to grey · E11 wave
    "grey": S["E10"] + 0.05,
    "wave": S["E11"],
    "confirm": W("c2", 4),
    "notifs": [W("c2", 6) + 0.1, 47.95, 48.55],
    # E12 counters
    "counters": [S["E12"] + 0.15, S["E12"] + 0.75, S["E12"] + 1.35],
    # E13 comment bar
    "bar": S["E13"] + 0.05,
    "typeStart": W("c4", 1) - 0.12,
    "typeEnd": WE("c4", 1) + 0.05,
}
ev = json.loads(json.dumps(ev), parse_float=lambda v: round(float(v), 3))

# ── buffers ─────────────────────────────────────────────────────────────
voice = np.zeros(N)


def place(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i < 0:
        x, i = x[-i:], 0
    n = max(0, min(len(x), len(buf) - i))
    buf[i:i + n] += x[:n] * gain


for x, t0 in voice_parts:
    place(voice, x, t0)

tt = np.arange(N) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def note_hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def ramp(t, keys):
    """Piecewise-linear automation over [time, value] keys."""
    ks = np.array(keys, float)
    return np.interp(t, ks[:, 0], ks[:, 1])


# ── ambience: night city (low rumble, air, a far car pass) ──────────────
amb = lp(rng.standard_normal(N), 220) * 0.5 + hp(lp(rng.standard_normal(N), 4000), 1500) * 0.05
for tc in (6.0, 23.0, 38.0):
    car = bp(rng.standard_normal(N), 120, 900) * np.exp(-((tt - tc) / 2.2) ** 2) * 0.35
    amb += car
ambL, ambR = amb, np.roll(amb, 2400)

# ── music (original, synthesised) ───────────────────────────────────────
BPM = 104
beat = 60 / BPM
bar = 4 * beat
# brightness: 0 grey (dull pulse) · 0.55 explanation (soft arp, filtered) · 1 after (open, full)
BRIGHT = [[0, 0], [S["E4"] + 0.4, 0], [S["E5"], 0.55], [S["E8"], 0.45], [S["E9"], 0.6], [S["E10"] - 0.1, 0.6],
          [S["E10"] + 0.25, 0], [S["E11"], 0], [S["E11"] + 1.2, 1], [END, 1]]
bright = ramp(tt, BRIGHT)

# grey bed: low drone + muted pulse on every beat
drone = np.zeros(N)
for h in range(1, 8):
    drone += np.sin(2 * np.pi * 55 * h * tt + h) / h * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * h * tt))
drone = lp(drone, 300) * 0.4
pulse = np.zeros(N)
k = 0
while k * beat < total:
    i = int(k * beat * SR)
    n = min(int(0.3 * SR), N - i)
    tl = np.arange(n) / SR
    pulse[i:i + n] += np.sin(2 * np.pi * 52 * tl) * np.exp(-tl / 0.08) * (1.0 if k % 2 == 0 else 0.55)
    k += 1
grey_bed = drone + 0.7 * pulse

# chords: Am F C G (minor, minimal) → in the "after" they voice up an octave and open the filter
prog = [[57, 64, 69, 72], [53, 60, 65, 69], [48, 55, 60, 64], [55, 62, 67, 71]]
pad = np.zeros(N)
arp = np.zeros(N)
hats = np.zeros(N)
kick = np.zeros(N)
t0 = 0.0
ci = 0
while t0 < total:
    chord = prog[ci % 4]
    i0 = int(t0 * SR)
    n = min(int((bar + 0.4) * SR), N - i0)
    tl = np.arange(n) / SR
    e = np.minimum(1, tl / 0.35) * np.minimum(1, np.maximum(0, (bar + 0.4 - tl) / 0.5))
    for m in chord:
        f = note_hz(m)
        pad[i0:i0 + n] += (np.sin(2 * np.pi * f * tl) + 0.4 * np.sin(2 * np.pi * 2.003 * f * tl)) * e * 0.1
    pat = [0, 2, 1, 3, 2, 1, 3, 2]
    for s in range(16):
        ts = t0 + s * beat / 4
        j = int(ts * SR)
        if j >= N:
            break
        nn = min(int(0.22 * SR), N - j)
        tl2 = np.arange(nn) / SR
        f = note_hz(chord[pat[s % 8]] + 12)
        arp[j:j + nn] += (np.sin(2 * np.pi * f * tl2) + 0.3 * np.sin(4 * np.pi * f * tl2)) * np.exp(-tl2 / 0.08) * (0.9 if s % 4 == 0 else 0.6)
    for b in range(4):
        tb = t0 + b * beat
        j = int(tb * SR)
        nn = min(int(0.3 * SR), N - j)
        if nn <= 0:
            continue
        tl2 = np.arange(nn) / SR
        fr = 48 + 80 * np.exp(-tl2 / 0.03)
        kick[j:j + nn] += np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tl2 / 0.13)
        for h in (0.5,):
            jh = int((tb + h * beat) * SR)
            nh = min(int(0.04 * SR), N - jh)
            if nh > 0:
                hats[jh:jh + nh] += hp(rng.standard_normal(nh), 7000) * np.exp(-np.arange(nh) / SR / 0.012)
    t0 += bar
    ci += 1

# filter opens with brightness (block-wise cutoff)
arp_f = np.zeros(N)
blk = SR // 10
for i in range(0, N, blk):
    fc = 600 + 5000 * bright[i] ** 1.5
    seg = arp[max(0, i - blk):i + blk]
    arp_f[i:i + blk] = lp(seg, fc)[-(min(i + blk, N) - i):] if i else lp(seg, fc)[:blk]
mid = np.clip(bright / 0.55, 0, 1)
after = np.clip((bright - 0.55) / 0.45, 0, 1)
musL = grey_bed * (1 - 0.5 * after) + pad * (0.6 * mid + 0.6 * after) + 0.35 * arp_f * mid + 0.55 * kick * mid * 0.6 + 0.25 * hats * after
musR = grey_bed * (1 - 0.5 * after) + pad * (0.6 * mid + 0.6 * after) + 0.35 * np.roll(arp_f, int(0.011 * SR)) * mid + 0.55 * kick * mid * 0.6 + 0.25 * np.roll(hats, 200) * after
# bright shimmer for the after
shim = np.zeros(N)
for m in (81, 84, 88):
    shim += np.sin(2 * np.pi * note_hz(m) * tt) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.25 * tt + m))
musL += shim * 0.03 * after
musR += np.roll(shim, 900) * 0.03 * after
fade_out = np.clip((total - tt) / 1.6, 0, 1)

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
    e = np.minimum(1, tl / 0.004) * np.exp(-tl / decay)
    return (np.sin(2 * np.pi * f * tl) + 0.35 * np.sin(2 * np.pi * 2.76 * f * tl) * np.exp(-tl / 0.08)) * e


def landline_ring():
    """Old phone bell: two ~0.4 s bursts of a 20 Hz-modulated dual tone."""
    n = int(1.1 * SR)
    tl = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 820 * tl) + 0.7 * np.sin(2 * np.pi * 1180 * tl) + 0.3 * np.sin(2 * np.pi * 2460 * tl)
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 22 * tl))
    gate = ((tl < 0.42) | ((tl > 0.58) & (tl < 1.0))).astype(float)
    gate = lp(gate, 60)
    return bp(tone * am * gate, 500, 4000) * 0.9


def buzz(dur=0.55):
    n = int(dur * SR)
    tl = np.arange(n) / SR
    gate = ((tl % 0.27) < 0.19).astype(float)
    return lp((np.sin(2 * np.pi * 165 * tl) + 0.4 * np.sign(np.sin(2 * np.pi * 165 * tl))) * lp(gate, 40), 900)


def scribble(dur=0.5):
    n = int(dur * SR)
    tl = np.arange(n) / SR
    strokes = 0.5 + 0.5 * np.sin(2 * np.pi * 7.5 * tl + rng.uniform(0, 6)) ** 2
    return bp(rng.standard_normal(n), 1800, 7000) * strokes * np.minimum(1, (dur - tl) / 0.05) * np.minimum(1, tl / 0.03)


def click():
    n = int(0.03 * SR)
    tl = np.arange(n) / SR
    return hp(rng.standard_normal(n), 3000) * np.exp(-tl / 0.003) + 0.7 * np.sin(2 * np.pi * 2100 * tl) * np.exp(-tl / 0.005)


def bubble():
    n = int(0.1 * SR)
    tl = np.arange(n) / SR
    fr = 420 + 900 * (1 - np.exp(-tl / 0.012))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tl / 0.025)


def incoming():
    return np.concatenate([ping(86, 0.06, 0.09), ping(93, 0.18, 0.5)])


def ding():
    a = ping(91, 0.6, 1.4)
    b = ping(98, 0.5, 1.3) * 0.6
    out = np.zeros(int(1.5 * SR))
    out[:len(a)] += a
    out[int(0.08 * SR):int(0.08 * SR) + len(b)] += b
    return out


def whoosh(dur=0.8, f0=250, f1=5000):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    steps = 24
    for s in range(steps):
        a, b = s * n // steps, (s + 1) * n // steps
        fc = f0 * (f1 / f0) ** (s / steps)
        out[a:b] = bp(noise, fc * 0.7, min(fc * 1.4, SR / 2 - 100))[a:b]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2


def swell(dur=1.6):
    """Wave of light: rising filtered noise + a bright chord bloom."""
    n = int(dur * SR)
    tl = np.arange(n) / SR
    up = whoosh(dur, 150, 7000)
    bloom = sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (69, 76, 81, 88)) * np.clip((tl - 0.5) / 0.4, 0, 1) * np.exp(-np.maximum(0, tl - 0.9) / 0.5)
    return up + 0.25 * bloom


def shimmer_flash():
    n = int(0.9 * SR)
    tl = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (88, 93, 96)) * np.exp(-tl / 0.25) * np.minimum(1, tl / 0.01)


def keyclick():
    n = int(0.02 * SR)
    tl = np.arange(n) / SR
    return bp(rng.standard_normal(n), 1800, 6000) * np.exp(-tl / 0.004)


def power_down():
    n = int(0.7 * SR)
    tl = np.arange(n) / SR
    fr = 300 * np.exp(-tl / 0.25) + 40
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tl / 0.3)


for k, t in enumerate(ev["ring"]):
    add_sfx(landline_ring(), t, -23 if k < 2 else -25, pan=-0.15, label="ring")
for t in ev["scribble"]:
    add_sfx(scribble(rng.uniform(0.35, 0.6)), t, -30, pan=-0.1)
for t in ev["mobileBuzz"]:
    add_sfx(buzz(), t, -26, pan=0.1, label="mobileBuzz")
add_sfx(shimmer_flash(), ev["signFlash"], -24, label="signFlash")
for t in ev["phoneIn"]:
    add_sfx(whoosh(0.45, 600, 5000), t - 0.1, -30)
add_sfx(buzz(0.4), ev["msgIn"] - 0.05, -27, pan=0.3)
add_sfx(incoming(), ev["msgIn"], -24, pan=0.3, label="msgIn")
for k in range(5):
    add_sfx(keyclick(), ev["typing"] + 0.08 + k * 0.12, -34, pan=0.3)
add_sfx(bubble(), ev["autoReply"], -21, pan=0.3, label="autoReply")
add_sfx(ding(), ev["line"] + 0.15, -27, pan=0.1, label="line")
for t in ev["list"]:
    add_sfx(click(), t, -24, label="list")
add_sfx(click(), ev["web"], -26, label="web")
for k, t in enumerate(ev["bubbles"]):
    add_sfx(buzz(0.35), t - 0.04, -29, pan=0.3)
    add_sfx(incoming(), t, -25, pan=0.3, label="bubble")
add_sfx(ding(), ev["core"], -25, label="core")
add_sfx(power_down(), ev["grey"], -24, label="grey")
add_sfx(swell(1.7), ev["wave"] - 0.2, -18, label="wave")
add_sfx(ding(), ev["confirm"], -20, pan=0.3, label="confirm")
for t in ev["notifs"]:
    add_sfx(incoming(), t, -26, pan=0.3, label="notif")
for t in ev["counters"]:
    add_sfx(click(), t, -23, label="counter")
add_sfx(whoosh(0.4, 500, 5000), ev["bar"] - 0.1, -29)
letters = "AUDITORIA"
for k in range(len(letters)):
    add_sfx(keyclick(), ev["typeStart"] + k * (ev["typeEnd"] - ev["typeStart"]) / len(letters), -28)
add_sfx(ding(), S["OUTRO"] + 0.2, -26, label="outro")

# ── levels: voice -14 LUFS, music bed ~ -24 LUFS under voice, ambience ~ -36 LUFS ─
meter = pyln.Meter(SR)
v_lufs = meter.integrated_loudness(voice[: int(total * SR)])
voice *= 10 ** ((-14 - v_lufs) / 20)
m_lufs = meter.integrated_loudness(np.stack([musL, musR], 1)[: int(total * SR)])
mus_gain = 10 ** ((-25 - m_lufs) / 20) * (1 + 0.35 * np.clip((bright - 0.55) / 0.45, 0, 1)) * fade_out
a_lufs = meter.integrated_loudness(np.stack([ambL, ambR], 1)[: int(total * SR)])
amb_gain = 10 ** ((-38 - a_lufs) / 20) * fade_out
L = musL * mus_gain + ambL * amb_gain + sL + voice
R = musR * mus_gain + ambR * amb_gain + sR + voice
mix = np.stack([L, R], axis=1)[: int(total * SR)]


def limit(x, ceiling_db=-1.2):
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


for _ in range(3):
    mix = limit(mix * 10 ** ((-14 - meter.integrated_loudness(mix)) / 20))
final_lufs = meter.integrated_loudness(mix)

out_wav = os.path.join(ROOT, "public", "audio", "mix.wav")
os.makedirs(os.path.dirname(out_wav), exist_ok=True)
pcm16 = (np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", out_wav], input=pcm16, check=True)

timeline = {
    "fps": FPS,
    "durationInFrames": duration_frames,
    "scenes": {k: round(v, 3) for k, v in S.items()},
    "captions": caps,
    "events": ev,
    "phrases": {k: v for k, v in phrase_span.items()},
    "sfx": sfx_events,
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False)
print(f"duration {total:.2f}s ({duration_frames} frames) · LUFS {final_lufs:.2f} · peak {20 * np.log10(np.max(np.abs(mix))):.2f} dBFS")
for k, (a, b) in phrase_span.items():
    print(f"{k:4s} {a:6.2f}-{b:6.2f}  {' '.join(w['text'] for w in words[k])}")
# guard: phrases never overlap
spans = sorted(phrase_span.values())
for (a0, b0), (a1, b1) in zip(spans, spans[1:]):
    assert b0 + 0.15 < a1, (b0, a1)
