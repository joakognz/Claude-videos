"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/clean/dm-narrador-{A,B}.mp3 (trimmed voice), data/asr.json (word timestamps)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

Run: python scripts/build.py
"""
import json, math, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICES = os.path.join(ROOT, "..", "audio", "clean")
SR = 48000
FPS = 30
rng = np.random.default_rng(11)


def load(name):
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", os.path.join(VOICES, name), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def speech_rms(x):
    hop = SR // 100
    n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return np.sqrt(np.mean(r[r > 10 ** (-40 / 20)] ** 2))


def norm_voice(x, db=-18.0):
    return x * (10 ** (db / 20) / speech_rms(x))


def asr_words(r):
    out = []
    for t, s, d in zip(r["tokens"], r["ts"], r["dur"]):
        if t.startswith(" ") or not out:
            out.append({"w": t.strip(), "s": s, "e": s + d})
        else:
            out[-1]["w"] += t
            out[-1]["e"] = s + d
    return [w for w in out if w["w"]]


asr = json.load(open(os.path.join(ROOT, "data", "asr.json")))
W = {k.replace(".mp3", "").replace("dm-", ""): asr_words(v) for k, v in asr.items()}
wa, wb = W["narrador-A"], W["narrador-B"]


def quiet_cut(x, words, i):
    """Sample index of the quietest point in the pause just before word i."""
    lo, hi = int((words[i]["s"] - 0.3) * SR), int((words[i]["s"] + 0.04) * SR)
    win = SR // 100
    energies = [np.sum(x[k:k + win] ** 2) for k in range(lo, hi - win, win // 2)]
    return lo + int(np.argmin(energies)) * (win // 2) + win // 2


def split(x, words, starts):
    """Split a take before each word index in `starts`. Returns [(audio, src_offset_s)]."""
    cuts = [0] + [quiet_cut(x, words, i) for i in starts] + [len(x)]
    return [(x[a:b], a / SR) for a, b in zip(cuts[:-1], cuts[1:])]


# ── voice ───────────────────────────────────────────────────────────────
A = norm_voice(load("dm-narrador-A.mp3"))
B = norm_voice(load("dm-narrador-B.mp3"))
A_SPLIT = [25]                                   # "Pero" (wipe ANTES → DESPUÉS)
B_SPLIT = [6, 9, 15, 18, 21, 26, 35]             # each node sentence, then "Seis"
B_GAP = [0.45, 0.5, 0.45, 0.5, 0.5, 0.5, 0.35]    # breathing room for the phone opening and each node
a_chunks = split(A, wa, A_SPLIT)
b_chunks = split(B, wb, B_SPLIT)

t = 0.15
placed = []  # (audio, timeline_start, src_offset, block)
for k, (x, off) in enumerate(a_chunks):
    placed.append((x, t, off, "A"))
    t += len(x) / SR + (0.35 if k == 0 else 0)
A_end = t
call_start = A_end + 0.45
CALL_LEN = 14.4
call_end = call_start + CALL_LEN
t = call_end + 0.3
B_start = t
for k, (x, off) in enumerate(b_chunks):
    placed.append((x, t, off, "B"))
    t += len(x) / SR + (B_GAP[k] if k < len(B_GAP) else 0)
B_end = t
END = B_end + 3.2
duration_frames = math.ceil(END * FPS)
total = duration_frames / FPS
N = int(total * SR) + SR


def word_time(block, i):
    words, splits = (wa, A_SPLIT) if block == "A" else (wb, B_SPLIT)
    chunks = [p for p in placed if p[3] == block]
    _, t0, off, _ = chunks[sum(1 for k in splits if k <= i)]
    return t0 + words[i]["s"] - off


ta = lambda i: word_time("A", i)
tb = lambda i: word_time("B", i)


# ── captions ────────────────────────────────────────────────────────────
def sentence(block, i0, i1, text, kinds=None, merge=None):
    """text: display words (after merges), kinds: {display_idx: 'emo'|'key'}"""
    words = wa if block == "A" else wb
    groups, i, merge = [], i0, merge or {}
    while i <= i1:
        j = merge.get(i, i)
        groups.append((i, j))
        i = j + 1
    disp = text.split()
    assert len(disp) == len(groups), (block, i0, len(disp), len(groups))
    out = []
    for k, (a, b) in enumerate(groups):
        # ASR word ends run into the following pause: cap them at the next word's start
        end = min(words[b]["e"], words[b + 1]["s"] if b + 1 < len(words) else words[b]["e"])
        out.append({"text": disp[k], "start": round(word_time(block, a), 3),
                    "end": round(word_time(block, b) + end - words[b]["s"], 3), "kind": (kinds or {}).get(k)})
    return {"words": out, "start": out[0]["start"], "end": out[-1]["end"]}


caps = {
    "E1": sentence("A", 0, 6, "Te escriben por DM y nadie contesta.", {3: "key", 5: "emo"}),
    "E2": sentence("A", 7, 15, "Y esa venta se la lleva otra tienda.", {6: "emo"}, merge={12: 13}),
    "E3": sentence("A", 16, 24, "Lo normal: visto, sin respuesta y un cliente perdido.", {8: "emo"}),
    "E4": sentence("A", 25, 32, "Pero esta tienda tiene una IA que contesta.", {5: "key"}),
    "E6": sentence("B", 0, 5, "Mira lo que pasó por dentro.", {5: "emo"}),
    "E7": sentence("B", 6, 8, "Entiende qué busca."),
    "E8": sentence("B", 9, 14, "Mira el catálogo y el stock."),
    "E9": sentence("B", 15, 17, "Recomienda el producto."),
    "E10": sentence("B", 18, 20, "Crea el pedido."),
    "E11": sentence("B", 21, 25, "Manda el enlace de pago."),
    "E12": sentence("B", 26, 34, "Y avisa a la tienda para preparar el envío."),
    "E13": sentence("B", 35, 39, "Seis pasos. Cero personas despiertas.", {0: "key"}),
    "E14": sentence("B", 40, 46, "¿Cuántos DMs sin contestar tienes ahora mismo?", {1: "key"}),
    "E15": sentence("B", 47, 52, "Comenta AUDITORIA y te lo cuento.", {1: "key"}),
}

# ── chat (E5): on-screen only, no voice ─────────────────────────────────
c = call_start
chat = [
    {"t": c + 0.0, "kind": "msg", "who": "cliente", "text": "Hola, busco un regalo para mi madre, hasta 30 €"},
    {"t": c + 1.5, "kind": "typing", "dur": 1.0},
    {"t": c + 2.5, "kind": "msg", "who": "ia", "text": "¡Hola! Te recomiendo la taza de cerámica artesanal: 24 €. Quedan 3."},
    {"t": c + 3.05, "kind": "product"},
    {"t": c + 4.5, "kind": "msg", "who": "cliente", "text": "¿Llega antes del viernes?"},
    {"t": c + 6.5, "kind": "typing", "dur": 1.0},
    {"t": c + 7.5, "kind": "msg", "who": "ia", "text": "Sí, salimos en 24 h. ¿Te la reservo?"},
    {"t": c + 9.5, "kind": "msg", "who": "cliente", "text": "Sí, por favor"},
    {"t": c + 10.9, "kind": "typing", "dur": 0.7},
    {"t": c + 11.6, "kind": "msg", "who": "ia", "text": "Hecho. Aquí tienes el enlace de pago."},
    {"t": c + 12.2, "kind": "pay"},
    {"t": c + 12.9, "kind": "confirm"},
]
for e in chat:
    e["t"] = round(e["t"], 3)

# ANTES: unanswered messages landing in the shop's inbox
inbox = [
    {"t": 0.2, "text": "Hola, ¿tenéis stock?"},
    {"t": round(ta(5) - 0.08, 3), "text": "¿Hola?"},                       # "nadie"
    {"t": round(caps["E2"]["words"][6]["start"] - 0.08, 3), "text": "Bueno, miro en otra tienda"},  # "otra"
]

wipe_start = placed[1][1] - 0.42
scenes = {
    "E1": 0, "E2": ta(7) - 0.05, "E3": ta(16) - 0.05, "WIPE": wipe_start, "E4": placed[1][1],
    "E5": call_start, "E6": B_start, "E7": tb(6) - 0.05, "E8": tb(9) - 0.05, "E9": tb(15) - 0.05,
    "E10": tb(18) - 0.05, "E11": tb(21) - 0.05, "E12": tb(26) - 0.05, "E13": tb(35) - 0.2,
    "E14": tb(40) - 0.12, "E15": tb(47) - 0.08, "END": total,
}
scenes = {k: round(v, 3) for k, v in scenes.items()}

# ── buffers ─────────────────────────────────────────────────────────────
L = np.zeros(N)
R = np.zeros(N)
voice = np.zeros(N)


def place(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    n = max(0, min(len(x), len(buf) - i))
    buf[i:i + n] += x[:n] * gain


for x, t0, _, _ in placed:
    place(voice, x, t0)

# ASR word ends run into the following pause: end each word where the voice actually falls silent
_hop = SR // 100
_rms = 20 * np.log10(np.sqrt(np.mean(voice[: len(voice) // _hop * _hop].reshape(-1, _hop) ** 2, axis=1)) + 1e-9)
_thr = np.percentile(_rms[_rms > -80], 90) - 30
for cap in caps.values():
    for w in cap["words"]:
        i = int((w["start"] + 0.1) * 100)
        while i < int(w["end"] * 100) and not (_rms[i:i + 6] < _thr).all():
            i += 1
        w["end"] = round(max(w["start"] + 0.1, min(w["end"], i / 100 + 0.03)), 3)
    cap["end"] = cap["words"][-1]["end"]

# ── music (original, synthesised) ───────────────────────────────────────
BPM = 100
beat = 60 / BPM
tt = np.arange(N) / SR
wipe_t = scenes["E4"] - 0.15


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) if na else 1
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

# ANTES: low drone with a slow filter sweep, minor-second shimmer, clock tick and a muted heartbeat
drone = np.zeros(N)
for h in range(1, 10):
    drone += np.sin(2 * np.pi * 49 * h * tt + h) / h * (0.7 + 0.3 * np.sin(2 * np.pi * 0.13 * h * tt))
drone = lp(drone, 380)
shimmer = (np.sin(2 * np.pi * 783.99 * tt) + np.sin(2 * np.pi * 830.61 * tt)) * 0.035 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * tt))
pulse = np.zeros(N)
tick = np.zeros(N)
k = 0
while k * beat < wipe_t + 1:
    i = int(k * beat * SR)
    n = int(0.35 * SR)
    seg = np.sin(2 * np.pi * 50 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR / 0.09)
    pulse[i:i + n] += seg[: len(pulse[i:i + n])] * (1.0 if k % 2 == 0 else 0.5)
    nt = int(0.025 * SR)
    tick[i:i + nt] += hp(rng.standard_normal(nt), 5000) * np.exp(-np.arange(nt) / SR / 0.006) * (0.3 if k % 2 else 0.18)
    k += 1
before = 0.35 * drone + shimmer + 0.8 * pulse + tick
# rising tension into the wipe
riser_env = np.clip((tt - (wipe_t - 2.2)) / 2.2, 0, 1) ** 2 * (tt < wipe_t + 0.1)
riser = bp(rng.standard_normal(N), 900, 6000) * riser_env * 0.12
before_env = np.clip((wipe_t + 0.5 - tt) / 0.5, 0, 1)
mL += before * before_env + riser
mR += before * before_env + np.roll(riser, 300)

# DESPUÉS: warm major pads + plucked arpeggio + soft kick/hats ("opens up")
prog = [[50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [43, 50, 55, 59, 62], [45, 52, 57, 61, 64]]  # D, Bm, G, A
bar = 4 * beat
t0 = wipe_t
padL = np.zeros(N)
padR = np.zeros(N)
arp = np.zeros(N)
drums = np.zeros(N)
ci = 0
while t0 < total:
    chord = prog[ci % 4]
    i0 = int(t0 * SR)
    n = min(int(2 * bar * SR) + int(0.6 * SR), N - i0)
    if n <= 0:
        break
    tl = np.arange(n) / SR
    e = env_adsr(n, 0.5, 0.6)
    for m in chord:
        f = note_hz(m)
        padL[i0:i0 + n] += (np.sin(2 * np.pi * f * 0.997 * tl) + 0.3 * np.sin(2 * np.pi * 2 * f * tl)) * e * 0.12
        padR[i0:i0 + n] += (np.sin(2 * np.pi * f * 1.003 * tl) + 0.3 * np.sin(2 * np.pi * 2 * f * tl)) * e * 0.12
    pattern = [1, 3, 2, 4, 3, 2, 4, 1]
    for s in range(32):
        ts = t0 + s * beat / 4
        if ts >= total:
            break
        m = chord[pattern[s % 8]] + 12
        j = int(ts * SR)
        nn = min(int(0.25 * SR), N - j)
        tl2 = np.arange(nn) / SR
        f = note_hz(m)
        arp[j:j + nn] += (np.sin(2 * np.pi * f * tl2) + 0.25 * np.sin(4 * np.pi * f * tl2)) * np.exp(-tl2 / 0.09) * (0.9 if s % 4 == 0 else 0.6)
    for b in range(8):
        tb_ = t0 + b * beat
        j = int(tb_ * SR)
        if b % 2 == 0:
            nn = min(int(0.3 * SR), N - j)
            tl2 = np.arange(nn) / SR
            freq = 45 + 75 * np.exp(-tl2 / 0.03)
            drums[j:j + nn] += np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tl2 / 0.12) * 0.9
        for h in (0, 0.5):
            jh = int((tb_ + h * beat) * SR)
            nn = min(int(0.04 * SR), N - jh)
            if nn > 0:
                drums[jh:jh + nn] += hp(rng.standard_normal(nn), 7000) * np.exp(-np.arange(nn) / SR / 0.012) * 0.18
    t0 += 2 * bar
    ci += 1
after_env = np.clip((tt - wipe_t) / 0.8, 0, 1)
arp = lp(arp, 3500)
mL += (padL + 0.22 * arp + 0.5 * drums) * after_env
mR += (padR + 0.22 * np.roll(arp, int(0.012 * SR)) + 0.5 * drums) * after_env

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
    return (np.sin(2 * np.pi * f * tl) + 0.35 * np.sin(2 * np.pi * 2.76 * f * tl) * np.exp(-tl / 0.08)) * np.exp(-tl / decay) * env_adsr(n, 0.004, 0.02)


def incoming():  # message received: two soft rising blips
    return np.concatenate([ping(86, 0.06, 0.09), ping(93, 0.18, 0.5)])


def tick_dry():  # "visto": a short, dry click
    n = int(0.04 * SR)
    tl = np.arange(n) / SR
    return hp(rng.standard_normal(n), 2500) * np.exp(-tl / 0.003) + 0.6 * np.sin(2 * np.pi * 2400 * tl) * np.exp(-tl / 0.004)


def thud():
    n = int(0.4 * SR)
    tl = np.arange(n) / SR
    freq = 60 + 90 * np.exp(-tl / 0.04)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tl / 0.12)


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


def pop(f0=900):
    n = int(0.12 * SR)
    tl = np.arange(n) / SR
    freq = f0 * np.exp(-tl / 0.03) + 300
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tl / 0.03)


def bubble():  # chat bubble lands: rounder, shorter pop
    n = int(0.09 * SR)
    tl = np.arange(n) / SR
    freq = 420 + 900 * (1 - np.exp(-tl / 0.012))
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tl / 0.022)


def keyclick():
    n = int(0.018 * SR)
    tl = np.arange(n) / SR
    return bp(rng.standard_normal(n), 1800, 6000) * np.exp(-tl / 0.004)


def kaching():
    a = ping(96, 0.12, 0.2)
    b = ping(100, 0.5, 1.1) + 0.5 * ping(103, 0.4, 1.1)
    out = np.zeros(int(1.3 * SR))
    out[: len(a)] += a
    out[int(0.09 * SR):int(0.09 * SR) + len(b)] += b
    shake = bp(rng.standard_normal(int(0.25 * SR)), 5000, 12000) * np.exp(-np.arange(int(0.25 * SR)) / SR / 0.05) * 0.4
    out[: len(shake)] += shake
    return out


# ANTES
for m in inbox:
    add_sfx(incoming(), m["t"], -24, label="incoming")
add_sfx(pop(), caps["E1"]["words"][3]["start"], -22, label="pop")                   # DM
add_sfx(tick_dry(), caps["E3"]["words"][2]["start"] - 0.02, -16, label="visto")     # "visto"
add_sfx(thud(), caps["E3"]["words"][8]["start"], -20, label="thud")                 # counter 0 → 1
add_sfx(whoosh(0.75, 250, 5000), wipe_start - 0.1, -19, label="whoosh")
add_sfx(pop(), caps["E4"]["words"][5]["start"], -21, label="pop")                   # IA
# E4: the assistant is typing
for k in range(7):
    add_sfx(keyclick(), scenes["E4"] + 1.0 + k * 0.13 + rng.uniform(-0.03, 0.03), -33)
# E5 chat
for e in chat:
    if e["kind"] == "msg":
        add_sfx(bubble(), e["t"], -20, pan=(-0.25 if e["who"] == "cliente" else 0.25), label="bubble")
    elif e["kind"] == "typing":
        k_t = e["t"] + 0.05
        while k_t < e["t"] + e["dur"] - 0.05:
            add_sfx(keyclick(), k_t, -30 + rng.uniform(-3, 2))
            k_t += rng.uniform(0.08, 0.15)
    elif e["kind"] in ("product", "confirm"):
        add_sfx(pop(1200), e["t"], -25, label=e["kind"])
    elif e["kind"] == "pay":
        add_sfx(kaching(), e["t"], -21, label="kaching")
# POR DENTRO
add_sfx(whoosh(0.6, 400, 6000), scenes["E6"] + 0.1, -24, label="whoosh")
for n_, (sid, m) in enumerate(zip(["E7", "E8", "E9", "E10", "E11", "E12"], [74, 76, 78, 81, 83, 86])):
    add_sfx(ping(m), caps[sid]["start"], -23, pan=(-0.3 if n_ % 2 == 0 else 0.3), label=f"ping{n_ + 1}")
add_sfx(whoosh(0.4, 600, 7000), caps["E13"]["start"] - 0.3, -20, label="whoosh6")
add_sfx(pop(), caps["E13"]["start"], -19, label="pop")
# E14: the unanswered DM again, notifications keep coming
for k in range(3):
    add_sfx(incoming(), scenes["E14"] + 0.25 + k * 0.75, -27 - k, label="incoming")
add_sfx(pop(), caps["E14"]["words"][1]["start"], -23, label="pop")
add_sfx(pop(), caps["E15"]["words"][1]["start"], -19, label="pop")

# ── levels: voice ≈ -14 LUFS, music bed -22 LUFS, -30 LUFS under the live DM ─
meter = pyln.Meter(SR)
seg = lambda x, a, b: x[int(a * SR):int(b * SR)]
v_lufs = meter.integrated_loudness(seg(voice, 0.15, A_end))
voice *= 10 ** ((-14 - v_lufs) / 20)
m_mono = (mL + mR) / 2
m_lufs = meter.integrated_loudness(np.stack([seg(mL, 0.5, A_end), seg(mR, 0.5, A_end)], 1))
duck = np.clip(np.minimum((tt - (call_start - 0.4)) / 0.4, ((B_start - 0.1) - tt) / 0.4), 0, 1)
music_db = -22 - m_lufs - 8 * duck
mgain = 10 ** (music_db / 20) * np.clip((total - tt) / 1.4, 0, 1)
L += mL * mgain + sL + voice
R += mR * mgain + sR + voice
mix = np.stack([L, R], axis=1)[: int(total * SR)]


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


def envelope(x):
    hop = SR // FPS
    n = duration_frames
    x = np.pad(x, (0, max(0, n * hop - len(x))))[: n * hop]
    r = np.sqrt(np.mean(x.reshape(n, hop) ** 2, axis=1))
    r = r / (np.max(r) + 1e-9)
    return [round(float(v), 3) for v in np.sqrt(r)]


timeline = {
    "fps": FPS,
    "durationInFrames": duration_frames,
    "scenes": scenes,
    "captions": caps,
    "inbox": inbox,
    "chat": chat,
    "sfx": sfx_events,
    "envelopes": {"narrador": envelope(voice)},
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False)
print(f"duration {total:.2f}s ({duration_frames} frames) · A end {A_end:.2f}s · chat {call_start:.2f}-{call_end:.2f}s · "
      f"B {B_start:.2f}-{B_end:.2f}s · LUFS {final_lufs:.2f} · peak {20 * np.log10(np.max(np.abs(mix))):.2f} dBFS")
print(json.dumps(scenes))
for k, v in caps.items():
    print(k, v["start"], v["end"], " ".join(w["text"] for w in v["words"]))
