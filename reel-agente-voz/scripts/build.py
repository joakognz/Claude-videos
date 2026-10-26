"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/clean/*.mp3 (trimmed voices), data/asr.json (word timestamps)
Outputs: public/audio/mix.wav (music + sfx + voices, -14 LUFS), src/timeline.json

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
rng = np.random.default_rng(7)


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
W = {k.replace(".mp3", ""): asr_words(v) for k, v in asr.items()}

# ── voices ──────────────────────────────────────────────────────────────
A = norm_voice(load("narrador-A.mp3"))
B = norm_voice(load("narrador-B.mp3"))
CALL = [("lucia", "llamada-01-lucia"), ("cliente", "llamada-02-cliente"), ("lucia", "llamada-03-lucia"),
        ("lucia", "llamada-04-lucia"), ("cliente", "llamada-05-cliente"), ("lucia", "llamada-06-lucia")]
call_audio = [norm_voice(load(f + ".mp3"), -19.0) for _, f in CALL]

# split narrator A in the silence before "Pero" to make room for the ANTES→DESPUÉS wipe
wa = W["narrador-A"]
pero = next(i for i, w in enumerate(wa) if w["w"] == "Pero")
lo, hi = int((wa[pero]["s"] - 0.35) * SR), int((wa[pero]["s"] + 0.1) * SR)
win = SR // 100
energies = [np.sum(A[i:i + win] ** 2) for i in range(lo, hi - win, win // 2)]
cut = lo + int(np.argmin(energies)) * (win // 2) + win // 2
A1, A2 = A[:cut], A[cut:]
cut_t = cut / SR

# ── timeline (seconds) ──────────────────────────────────────────────────
t = 0.15
A1_start = t
t += len(A1) / SR + 0.35
A2_start = t
t += len(A2) / SR + 0.45
call_start = t
call_lines = []
for i, ((who, name), x) in enumerate(zip(CALL, call_audio)):
    call_lines.append({"speaker": who, "start": t, "end": t + len(x) / SR, "name": name})
    t += len(x) / SR
    if i + 1 < len(CALL):
        t += 0.25 if CALL[i + 1][0] == who else 0.3
call_end = t
t += 0.5
B_start = t
t += len(B) / SR
END = t + 1.6
duration_frames = math.ceil(END * FPS)
total = duration_frames / FPS
N = int(total * SR) + SR

wb = W["narrador-B"]


def ta(i):  # timeline time of narrator-A word i
    s = wa[i]["s"]
    return (A1_start + s) if s < cut_t else (A2_start + s - cut_t)


def tb(i):
    return B_start + wb[i]["s"]


# ── captions ────────────────────────────────────────────────────────────
def sentence(src, i0, i1, text=None, kinds=None, merge=None):
    """text: display words (after merges), kinds: {display_idx: 'emo'|'key'}"""
    words = W[src]
    off = (lambda i: ta(i)) if src == "narrador-A" else (lambda i: tb(i))
    groups = []
    i = i0
    merge = merge or {}
    while i <= i1:
        j = merge.get(i, i)
        groups.append((i, j))
        i = j + 1
    end_of = lambda j: off(j) + (words[j]["e"] - words[j]["s"])
    out = []
    for k, (a, b) in enumerate(groups):
        out.append({"text": text[k] if text else words[a]["w"], "start": round(off(a), 3),
                    "end": round(end_of(b), 3), "kind": (kinds or {}).get(k)})
    assert not text or len(text) == len(groups), (src, i0, len(text), len(groups))
    return {"words": out, "start": out[0]["start"], "end": out[-1]["end"]}


caps = {
    "S1": sentence("narrador-A", 0, 9, "Llamé a este negocio a las once de la noche.".split(), {9: "emo"}),
    "S2": sentence("narrador-A", 10, 13, "Y respondió una IA.".split(), {3: "key"}),
    "S3": sentence("narrador-A", 14, 22, "Lo normal: buzón de voz y un cliente perdido.".split(), {8: "emo"}),
    "S4": sentence("narrador-A", 23, 31, "Pero esta clínica tiene una IA que atiende.".split(), {5: "key"},
                   merge={28: 29}),
    "S5": sentence("narrador-B", 0, 5, "Mira lo que pasó por dentro.".split(), {5: "emo"}),
    "S6": sentence("narrador-B", 6, 10, "Entiende que es una urgencia.".split()),
    "S7": sentence("narrador-B", 11, 14, "Mira la agenda real.".split()),
    "S8": sentence("narrador-B", 15, 17, "Reserva la cita.".split()),
    "S9": sentence("narrador-B", 18, 22, "Crea la ficha del paciente.".split()),
    "S10": sentence("narrador-B", 23, 28, "Manda el WhatsApp con el formulario.".split()),
    "S11": sentence("narrador-B", 29, 34, "Y avisa al doctor de guardia.".split()),
    "S12": sentence("narrador-B", 35, 39, "Seis pasos. Cero personas despiertas.".split(), {0: "key"}),
    "S13": sentence("narrador-B", 40, 45, "¿Cuántas llamadas pierdes tú de noche?".split(), {5: "emo"}),
    "S14": sentence("narrador-B", 46, 51, "Comenta AUDITORIA y te lo cuento.".split(), {1: "key"}),
}

CALL_TEXT = [
    "Clínica Sonrisa Norte, soy Lucía. ¿En qué te ayudo?",
    "Tengo un dolor punzante y repetitivo en una muela.",
    "Vaya, lo siento. Te busco hueco mañana a primera hora.",
    "Tengo a las nueve y diez con el doctor Ruiz. ¿Te la reservo?",
    "Sí, por favor.",
    "Hecha. Te acabo de mandar la confirmación por WhatsApp.",
]
for line, text in zip(call_lines, CALL_TEXT):
    ws = W[line["name"]]
    disp = text.split()
    assert len(disp) == len(ws), (line["name"], len(disp), len(ws))
    line["words"] = [{"text": d, "start": round(line["start"] + w["s"], 3), "end": round(line["start"] + w["e"], 3)}
                     for d, w in zip(disp, ws)]
    line["start"], line["end"] = round(line["start"], 3), round(line["end"], 3)
    del line["name"]

wipe_start = A2_start - 0.42
scenes = {
    "E1": 0, "E2": ta(10) - 0.05, "E3": ta(14) - 0.05, "WIPE": wipe_start, "E4": A2_start,
    "E5": call_start, "E6": B_start, "E7": tb(6) - 0.05, "E8": tb(11) - 0.05, "E9": tb(15) - 0.05,
    "E10": tb(18) - 0.05, "E11": tb(23) - 0.05, "E12": tb(29) - 0.05, "E13": tb(35) - 0.2,
    "E14": tb(40) - 0.1, "E15": tb(46) - 0.05, "END": total,
}
scenes = {k: round(v, 3) for k, v in scenes.items()}

# ── mix buffers ─────────────────────────────────────────────────────────
L = np.zeros(N)
R = np.zeros(N)
stems = {"narrador": np.zeros(N), "lucia": np.zeros(N), "cliente": np.zeros(N)}


def place(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    buf[i:i + len(x)] += x[: max(0, min(len(x), len(buf) - i))] * gain


place(stems["narrador"], A1, A1_start)
place(stems["narrador"], A2, A2_start)
place(stems["narrador"], B, B_start)
for line, x in zip(call_lines, call_audio):
    # light "phone line" colour for the call: band-pass 250-5000 Hz
    sos = butter(2, [250, 5000], btype="band", fs=SR, output="sos")
    place(stems[line["speaker"]], 0.6 * x + 0.55 * sosfilt(sos, x), line["start"])

# ── music (original, synthesised) ───────────────────────────────────────
BPM = 105
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


mL = np.zeros(N)
mR = np.zeros(N)

# ANTES: dark drone + minor-second shimmer + heartbeat pulse
drone = np.zeros(N)
for h in range(1, 9):
    drone += np.sin(2 * np.pi * 55 * h * tt + h) / h * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * h * tt))
drone = lp(drone, 420)
shimmer = (np.sin(2 * np.pi * 880 * tt) + np.sin(2 * np.pi * 932.3 * tt)) * 0.04 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * tt))
pulse = np.zeros(N)
k = 0
while k * beat < wipe_t + 1:
    i = int(k * beat * SR)
    n = int(0.35 * SR)
    seg = np.sin(2 * np.pi * 52 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR / 0.09)
    pulse[i:i + n] += seg[: len(pulse[i:i + n])] * (1.0 if k % 2 == 0 else 0.55)
    k += 1
tick = np.zeros(N)
k = 0
while k * beat / 2 < wipe_t + 1:
    i = int(k * beat / 2 * SR)
    n = int(0.03 * SR)
    tick[i:i + n] += hp(rng.standard_normal(n), 6000) * np.exp(-np.arange(n) / SR / 0.008) * 0.25
    k += 1
before = 0.35 * drone + shimmer + 0.8 * pulse + tick
before_env = np.clip((wipe_t + 0.6 - tt) / 0.6, 0, 1)
mL += before * before_env
mR += before * before_env

# DESPUÉS: open pads + plucked arpeggio + soft kick/hats
prog = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [48, 52, 55, 59, 64], [55, 59, 62, 64, 67]]  # Am9 Fmaj9 Cmaj7 G6
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
    n = int(2 * bar * SR) + int(0.6 * SR)
    n = min(n, N - i0)
    if n <= 0:
        break
    tl = np.arange(n) / SR
    e = env_adsr(n, 0.5, 0.6)
    for m in chord:
        f = note_hz(m)
        padL[i0:i0 + n] += (np.sin(2 * np.pi * f * 0.997 * tl) + 0.3 * np.sin(2 * np.pi * 2 * f * tl)) * e * 0.12
        padR[i0:i0 + n] += (np.sin(2 * np.pi * f * 1.003 * tl) + 0.3 * np.sin(2 * np.pi * 2 * f * tl)) * e * 0.12
    # 16th-note arpeggio for two bars
    pattern = [0, 2, 1, 3, 2, 4, 3, 1]
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

# level: -30 dBFS RMS bed (≈12 dB under the voice), -10 dB during the call, fade at the end
ref = np.sqrt(np.mean(((mL + mR) / 2)[int(1 * SR):int((call_start - 0.5) * SR)] ** 2))
gain_db = np.full(N, -30.0) - 20 * np.log10(ref)
duck = np.clip(np.minimum((tt - (call_start - 0.4)) / 0.4, ((B_start - 0.2) - tt) / 0.4), 0, 1)
gain_db -= 10 * duck
gain = 10 ** (gain_db / 20) * np.clip((total - tt) / 1.4, 0, 1)
L += mL * gain
R += mR * gain

# ── sound effects (synthesised) ─────────────────────────────────────────
sfx_events = []


def add_sfx(x, t0, db, pan=0.0, label=None):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (db / 20)
    place(L, x, t0, 1 - max(pan, 0))
    place(R, x, t0, 1 + min(pan, 0))
    if label:
        sfx_events.append({"t": round(t0, 3), "type": label})


def ringback(dur=1.5):
    n = int(dur * SR)
    tl = np.arange(n) / SR
    x = np.sin(2 * np.pi * 425 * tl) + 0.15 * np.sin(2 * np.pi * 850 * tl)
    return x * env_adsr(n, 0.02, 0.05)


def click():
    n = int(0.05 * SR)
    tl = np.arange(n) / SR
    return (hp(rng.standard_normal(n), 1500) * np.exp(-tl / 0.004) + np.sin(2 * np.pi * 1800 * tl) * np.exp(-tl / 0.006))


def whoosh(dur=0.7, f0=300, f1=4000):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    steps = 24
    for s in range(steps):
        a, b = s * n // steps, (s + 1) * n // steps
        fc = f0 * (f1 / f0) ** (s / steps)
        out[a:b] = sosfilt(butter(2, [fc * 0.7, min(fc * 1.4, SR / 2 - 100)], btype="band", fs=SR, output="sos"), noise)[a:b]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return out * e


def pop():
    n = int(0.12 * SR)
    tl = np.arange(n) / SR
    freq = 900 * np.exp(-tl / 0.03) + 300
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tl / 0.03)


def ping(m):
    n = int(0.9 * SR)
    tl = np.arange(n) / SR
    f = note_hz(m)
    return (np.sin(2 * np.pi * f * tl) + 0.35 * np.sin(2 * np.pi * 2.76 * f * tl) * np.exp(-tl / 0.08)) * np.exp(-tl / 0.35) * env_adsr(n, 0.004, 0.02)


def notif():
    return np.concatenate([ping(84)[: int(0.12 * SR)], ping(88)])


def pickup():
    return np.concatenate([ping(76)[: int(0.09 * SR)] * 0.7, ping(81)[: int(0.4 * SR)]])


add_sfx(ringback(1.4), 0.0, -30, label="ring")
add_sfx(ringback(1.4), 2.9, -32, label="ring")
add_sfx(click(), scenes["E3"], -14, label="click")
add_sfx(notif(), ta(16) - 0.05, -27, label="notif")
add_sfx(whoosh(0.75, 250, 5000), wipe_start - 0.1, -20, label="whoosh")
add_sfx(pickup(), call_start - 0.35, -26, label="pickup")
for k, i in ((caps["S2"]["words"][3]["start"], 0), (caps["S4"]["words"][5]["start"], 0)):
    add_sfx(pop(), k, -21, label="pop")
for n_, (sid, m) in enumerate(zip(["S6", "S7", "S8", "S9", "S10", "S11"], [69, 72, 74, 76, 79, 81])):
    add_sfx(ping(m), caps[sid]["start"], -24, pan=(-0.3 if n_ % 2 == 0 else 0.3), label=f"ping{n_ + 1}")
add_sfx(whoosh(0.4, 600, 7000), caps["S12"]["start"] - 0.3, -21, label="whoosh6")
add_sfx(pop(), caps["S12"]["start"], -19, label="pop")
add_sfx(ringback(1.2), scenes["E14"] + 0.1, -32, label="ring")
add_sfx(pop(), caps["S14"]["words"][1]["start"], -19, label="pop")

# ── final mix, loudness, limiter ────────────────────────────────────────
voice = stems["narrador"] + stems["lucia"] + stems["cliente"]
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


# normalise to -14 LUFS; the limiter shaves a little loudness, so iterate
target = -14.0
for _ in range(3):
    mix = limit(mix * 10 ** ((target - meter.integrated_loudness(mix)) / 20))
final_lufs = meter.integrated_loudness(mix)

out_wav = os.path.join(ROOT, "public", "audio", "mix.wav")
os.makedirs(os.path.dirname(out_wav), exist_ok=True)
pcm16 = (np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", out_wav],
               input=pcm16, check=True)


# ── per-frame voice envelopes (for reactive waveforms) ──────────────────
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
    "call": call_lines,
    "sfx": sfx_events,
    "envelopes": {k: envelope(v) for k, v in stems.items()},
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False)
print(f"duration {total:.2f}s ({duration_frames} frames) · call {call_start:.2f}-{call_end:.2f}s · "
      f"B {B_start:.2f}s · LUFS {final_lufs:.2f} · peak {20 * np.log10(np.max(np.abs(mix))):.2f} dBFS")
print(json.dumps(scenes))
