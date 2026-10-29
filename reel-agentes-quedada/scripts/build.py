"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/agentes-quedada/<take>.mp3 (one ElevenLabs take), the music track the client sent
         (../audio/raw/agentes-quedada/<music>.mp4, audio only), data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

The take is used as is (no cuts): it starts at VOICE_AT and its own pauses mark the scenes.
The music plays from its own second 0 to the end of the reel. Its drop (where it reaches full activity)
is detected here and exported as ev.drop: the picture switches from calm to busy on that frame, and the
kick onsets after it (ev.kicks) drive the beat-synced light pulses.

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, find_peaks, sosfilt, sosfiltfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "agentes-quedada")
TAKE = "22aa7fe3"
MUSIC = "a6c7afc0"
SR = 48000
FPS = 30
TOTAL = 49.5
N = int(TOTAL * SR)
VOICE_AT = 0.1
rng = np.random.default_rng(23)


def load(prefix, ch=1):
    src = next(f for f in os.listdir(RAW) if f.startswith(prefix))
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", os.path.join(RAW, src), "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.float32).astype(np.float64)
    return x.reshape(-1, ch) if ch > 1 else x


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
VOICE_END = W["segments"][-1][1] + VOICE_AT

# words grouped by segment, on the timeline
SEGS = W["segments"]
seg_words = [[{"w": w["w"], "s": round(w["s"] + VOICE_AT, 3), "e": round(w["e"] + VOICE_AT, 3)}
              for w in W["words"] if a - 0.01 <= w["s"] < b] for a, b in SEGS]


def wt(seg, idx):
    """Timeline start of word `idx` of segment `seg`."""
    return seg_words[seg][idx]["s"]


def seg_start(seg):
    return SEGS[seg][0] + VOICE_AT


def seg_end(seg):
    return SEGS[seg][1] + VOICE_AT


# ── music analysis ──────────────────────────────────────────────────────
music = load(MUSIC, 2)[:N]
music = np.pad(music, ((0, N - len(music)), (0, 0)))
mono = music.mean(axis=1)
HOP = SR // 100  # 10 ms


def band_env(lo, hi):
    y = sosfiltfilt(butter(4, [lo, hi], btype="band", fs=SR, output="sos"), mono)
    n = len(y) // HOP
    return np.sqrt(np.mean(y[: n * HOP].reshape(n, HOP) ** 2, axis=1) + 1e-12)


full = 20 * np.log10(band_env(25, 16000))
quiet = np.median(full[500:950])
DROP = next(i for i in range(950, 2000) if full[i] - quiet > 12) / 100  # first 10 ms frame 12 dB over the intro
# second lift: the top end (hats, cymbals) steps up a few bars later
hi = 20 * np.log10(np.convolve(band_env(2500, 8000), np.ones(50) / 50, mode="same"))
cand = range(3800, 4600)
LIFT = max(cand, key=lambda i: hi[i:i + 200].mean() - hi[i - 200:i].mean()) / 100
# kick onsets after the drop (low band rise), with a 0..1 strength
sub = band_env(30, 110)
on = np.maximum(0, np.diff(sub, prepend=sub[0]))
pk, prop = find_peaks(on, height=on[int(DROP * 100):].max() * 0.22, distance=22)
kicks = [(p / 100, h) for p, h in zip(pk, prop["peak_heights"]) if DROP - 0.02 <= p / 100 < TOTAL]
kmax = max(h for _, h in kicks)
KICKS = [[round(t, 3), round(float(min(1, h / kmax * 1.4)), 2)] for t, h in kicks]
print(f"music: drop {DROP:.2f}s · lift {LIFT:.2f}s · {len(KICKS)} kicks after the drop")

# ── scenes (the prompt's eleven, moved onto the take's pauses) ──────────
scenes = {
    "E1": 0.0, "E2": seg_start(1) - 0.15, "E3": seg_start(2) - 0.15, "E4": seg_start(3) - 0.15,
    "E5": seg_start(4) - 0.15, "E6": seg_start(5) - 0.15, "E7": seg_start(6) - 0.15, "E8": seg_start(7) - 0.15,
    "E9": seg_start(9) - 0.15, "E10": seg_start(10) - 0.15,
    # the CTA enters on the music's second lift when it falls just before "Comenta"
    "E11": LIFT if seg_start(13) - 1.0 < LIFT < seg_start(13) else seg_start(13) - 0.3,
    "E12": VOICE_END + 0.35, "END": TOTAL,
}
S = scenes


def cap(chunks, end, **kw):
    """chunks: (text, time, highlight) with highlight in {None, 'o'}"""
    out = {"chunks": [{"text": c[0], "t": round(c[1], 3), "hl": c[2]} for c in chunks],
           "start": round(chunks[0][1] - 0.12, 3), "end": round(end, 3)}
    out.update(kw)
    return out


captions = {
    "E1": cap([("Una startup", wt(0, 6), None), ("de", wt(0, 10), None), ("agentes de IA", wt(0, 11), "o")], S["E2"] - 0.1,
              micro=[["HURUMOAI", wt(0, 3)], ["· SHELL GAME", wt(0, 6)]]),
    "E2": cap([("Casi de pasada,", wt(1, 3), None), ("\nuna", wt(1, 6), None), ("quedada", wt(1, 7), "o")], S["E3"] - 0.1,
              micro=[["CANAL DE SLACK", wt(1, 1)]]),
    "E3": cap([("La tomaron", wt(2, 2), None), ("como", wt(2, 4), None), ("una orden", wt(2, 5), "o")], S["E4"] - 0.1,
              micro=[["NADIE DIJO", wt(2, 6)], ["QUE PARARAN", wt(2, 6) + 0.25]]),
    "E4": cap([("Planearon", wt(3, 2), None), ("lugares y fechas", wt(3, 3), "o")], S["E5"] - 0.1,
              micro=[["SESIONES DE ESTRATEGIA", wt(3, 6)]]),
    "E5": cap([("Más de", wt(4, 5), None), ("150 mensajes", wt(4, 7), "o")], S["E6"] - 0.1,
              micro=[["EN DOS HORAS", wt(4, 1)]]),
    "E6": cap([("30 $", wt(5, 4), "o"), ("en créditos", wt(5, 7), None)], S["E7"] - 0.1,
              micro=[["SE ACABÓ", seg_end(5) - 0.25], ["EL PRESUPUESTO", seg_end(5) - 0.05]]),
    "E7": cap([("Una quedada", wt(6, 1), None), ("que", wt(6, 3), None), ("no existía", wt(6, 5), "o")], S["E8"] - 0.1,
              micro=[["NO HABÍA NADA", wt(6, 4)], ["QUE ORGANIZAR", wt(6, 6)]]),
    "E8": cap([("Se hablaron", wt(8, 0), None), ("hasta morir", wt(8, 2), "o")], S["E9"] - 0.1,
              micro=[["EVAN RATLIFF", wt(7, 0)]],
              quote=["“TALKED THEMSELVES TO DEATH”", wt(7, 2)]),
    "E9": cap([("Limitó turnos:", wt(9, 2), None), ("se halagaron", wt(9, 7), "o")], S["E10"] - 0.1,
              micro=[["LOS TURNOS", wt(9, 6)], ["TAMBIÉN SE GASTAN", wt(9, 7)]]),
    "E10a": cap([("Un agente", wt(11, 0), None), ("sin límites", wt(11, 2), None), ("tiene factura", wt(11, 5), "o")],
                seg_start(12) - 0.2, micro=[["LA LECCIÓN", wt(10, 0)], ["PARA TU NEGOCIO", wt(10, 2)]],
                microEnd=round(seg_start(11) + 0.2, 3)),
    "E10b": cap([("Todo agente", wt(12, 0), None), ("necesita", wt(12, 0) + 0.3, None), ("tope", wt(12, 1), "o")],
                S["E11"] - 0.05, micro=[["PRESUPUESTO", wt(12, 0)], ["· TURNOS", wt(12, 3)], ["· REVISIÓN", wt(12, 5)]]),
}
cta = {
    "comenta": wt(13, 0), "keyword": wt(13, 1), "swap": seg_start(14) - 0.05,
    "revisa": seg_start(14), "gasto": seg_start(14) + 0.45,
}

# ── on-screen events ────────────────────────────────────────────────────
ev = {
    "dolly": 4.0,                                     # camera locks on the office
    "drop": DROP, "lift": LIFT,                       # the music
    "stand": wt(1, 2) - 0.2,                          # the human stands up ("mencionó")
    "tent": wt(1, 7),                                 # the tent shows in the bubble ("quedada")
    "walk": seg_end(1) - 0.9,                         # …and walks off to the edge without looking
    "turn": seg_start(2) + 0.1,                       # the orbs turn to the bubble
    "grow": DROP,                                     # the bubble grows with the drop
    "msg0": wt(3, 2) - 0.1,                           # messages start flying ("planear")
    "pin": wt(3, 3), "cal": wt(3, 4), "board": wt(3, 6),
    "tower": S["E5"] + 0.1,                           # messages pile into a tower
    "count1": wt(4, 9) + 0.2,                         # counter reaches 150 ("mensajes")
    "drain0": wt(5, 1), "drain1": seg_end(5) - 0.15,  # credits drain ("pararon" → "créditos")
    "hollow": wt(6, 2), "dissolve": wt(6, 6),         # the offsite bubble empties and dissolves
    "back": seg_start(7),                             # the human walks back to the centre
    "die": wt(8, 2),                                  # the orbs go out ("hasta morir")
    "deal": wt(9, 2), "spend": wt(9, 6),              # tokens dealt ("limitó") and spent ("gastaron")
    "meter": seg_start(11),                           # budget meter fills
    "cap": wt(12, 1),                                 # it hits the cap ("tope")
    "lens": wt(12, 5),                                # the supervision lens ("alguien")
    "typeStart": cta["keyword"] - 0.3, "typeStep": 0.075,
}
ev = {k: round(v, 3) for k, v in ev.items()}

# message flights: one per kick (and one on the off-beat once it speeds up), from orb to orb
msgs = []


def flights(t0, t1, kind, dense_from=None, step=None, dense_kind=None):
    ks = [t for t, _ in KICKS if t0 <= t < t1]
    if step:
        ks = list(np.arange(t0, t1, step))
    times = []
    for i, t in enumerate(ks):
        times.append(t)
        if dense_from is not None and t >= dense_from and i + 1 < len(ks):
            times.append((t + ks[i + 1]) / 2)
    sent = [0] * 5
    for j, t in enumerate(times):
        a = int(rng.integers(5))
        if kind == "heart":  # three turns each: an orb out of tokens stays quiet
            free = [k for k in range(5) if sent[k] < 3]
            if not free:
                break
            a = free[int(rng.integers(len(free)))]
        sent[a] += 1
        b = (a + 1 + int(rng.integers(4))) % 5
        k = dense_kind if dense_kind and t not in ks else kind
        msgs.append({"t": round(float(t), 3), "a": a, "b": b, "k": k})


flights(ev["msg0"], ev["cal"], "pin")
flights(ev["cal"], ev["board"], "cal")
flights(ev["board"], S["E5"], "board", dense_from=ev["board"])
flights(S["E5"], ev["count1"], "tower", dense_from=S["E5"], dense_kind="cal")
flights(ev["count1"], ev["drain1"] - 0.3, "dots", dense_from=ev["count1"])
flights(ev["spend"], seg_end(9) + 0.2, "heart", dense_from=ev["spend"])
flights(ev["meter"] + 0.3, ev["cap"], "dots")
msgs.sort(key=lambda m: m["t"])

# ── helpers ─────────────────────────────────────────────────────────────


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
    elif kind == "pop":  # bubble out
        nn = int(0.12 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * (400 + 900 * tl / 0.12) * tl) * np.exp(-tl / 0.035) * 0.35
    elif kind == "notif":  # chat notification (two-tone blip)
        nn = int(0.22 * SR)
        tl = np.arange(nn) / SR
        f1, f2 = note_hz(84 + pitch), note_hz(91 + pitch)
        x = (np.sin(2 * np.pi * f1 * tl) * (tl < 0.07) + np.sin(2 * np.pi * f2 * tl) * (tl >= 0.07)) * np.exp(-tl / 0.09) * 0.22
    elif kind == "tick":
        nn = int(0.02 * SR)
        x = hp(rng.standard_normal(nn), 4000) * np.exp(-np.arange(nn) / SR / 0.004) * 0.5
    elif kind == "appear":  # soft shimmer + low bloom
        x = (sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (74, 78, 81, 86)) * 0.08 * np.exp(-tl / 0.5)
             + np.sin(2 * np.pi * 73 * tl) * 0.5 * np.exp(-tl / 0.4)) * env_ar(nn, 0.04, 0.1)
    elif kind == "ignite":  # the orbs switch on (on the drop)
        nn = int(1.5 * SR)
        tl = np.arange(nn) / SR
        x = (sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (62, 69, 74, 78)) * 0.07 * np.exp(-tl / 0.7)
             + bp(rng.standard_normal(nn), 2000, 9000) * 0.12 * np.exp(-tl / 0.12))
    elif kind == "drain":  # tone falling while the credit bar empties
        d = ev["drain1"] - ev["drain0"]
        nn = int(d * SR)
        tl = np.arange(nn) / SR
        f = 880 * 2 ** (-2.2 * tl / d)
        x = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6 + np.sin(4 * np.pi * np.cumsum(f) / SR) * 0.2) * 0.14 * env_ar(nn, 0.1, 0.2)
    elif kind == "spark":
        nn = int(0.05 * SR)
        x = bp(rng.standard_normal(nn), 3000, 9000) * np.exp(-np.arange(nn) / SR / 0.01) * 0.35
    elif kind == "off":  # a light goes out
        nn = int(0.4 * SR)
        tl = np.arange(nn) / SR
        f = 300 * np.exp(-tl / 0.15) + 60
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tl / 0.12) * 0.4
    elif kind == "dust":  # particles dissolving
        nn = int(1.4 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 3000, 10000) * np.sin(np.pi * tl / 1.4) ** 2 * 0.12
    elif kind == "chip":  # token dealt
        nn = int(0.08 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 1500, 5000) * 0.5 + np.sin(2 * np.pi * 1900 * tl) * 0.3) * np.exp(-tl / 0.015)
    elif kind == "thud":  # the cap: dry hit
        nn = int(0.5 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 52 * tl) * np.exp(-tl / 0.14) + lp(rng.standard_normal(nn), 700) * 0.6 * np.exp(-tl / 0.03)) * 0.9
    elif kind == "scan":  # the lens sweeps
        nn = int(0.9 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 1200, 4000) * np.sin(np.pi * tl / 0.9) ** 2 * 0.12
    elif kind == "key":
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    else:
        raise ValueError(kind)
    place(sfx, x, t, gain)


add("whoosh", 0.0, 0.8)
add("pop", ev["stand"] + 0.25, 0.8)
add("appear", ev["tent"], 0.5)
add("ignite", DROP, 0.9)
for i, m in enumerate(msgs):  # the notification murmur speeds up with the bubbles
    add("notif", m["t"], 0.35 + 0.25 * min(1, i / 40), pitch=[0, 2, 4, 7, 9][m["a"]])
for k in range(int((ev["count1"] - ev["tower"]) / 0.08)):  # counter ticks
    add("tick", ev["tower"] + k * 0.08, 0.5 if k % 4 == 0 else 0.3)
add("drain", ev["drain0"], 1.0)
for k in range(10):
    add("spark", ev["drain0"] + 0.2 + k * (ev["drain1"] - ev["drain0"]) / 10, 0.6)
for i in range(5):
    add("off", ev["drain1"] + 0.05 + i * 0.09, 0.5)
add("dust", ev["dissolve"] - 0.2, 1.0)
for i in range(5):
    add("off", ev["die"] + i * 0.12, 0.35)
for i in range(15):
    add("chip", ev["deal"] + 0.1 + i * 0.06, 0.6)
add("thud", ev["cap"], 1.0)
add("scan", ev["lens"], 0.9)
for i in range(9):
    add("key", ev["typeStart"] + i * ev["typeStep"], 0.7)
add("appear", S["E12"] + 0.3, 0.6)

# ── mix: the client's track from 0 s to the end, ducked under the voice ──
venv = np.abs(voice)
k = int(0.12 * SR)
venv = np.convolve(venv, np.ones(k) / k, mode="same")
duck = 1 - 0.45 * np.clip(venv / (np.percentile(venv[venv > 1e-4], 60) + 1e-9), 0, 1)
duck = lp(duck, 6)
# loud section of the track sits about 9 dB under the voice before ducking
m_rms = np.sqrt(np.mean(mono[int((DROP + 1) * SR):int((DROP + 20) * SR)] ** 2))
mgain = 10 ** (-18 / 20) / m_rms * 10 ** (-9 / 20)
tt = np.arange(N) / SR
fade = np.clip((TOTAL - tt) / 1.6, 0, 1) ** 1.5  # gentle fade over the last 1.6 s
mL = music[:, 0] * mgain * duck * fade
mR = music[:, 1] * mgain * duck * fade
L = mL + sfx * 0.5 + voice
R = mR + np.roll(sfx, 60) * 0.5 + voice
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
            "captions": captions, "cta": {k: round(v, 3) for k, v in cta.items()}, "ev": ev, "kicks": KICKS, "msgs": msgs,
            "sfx": sfx_list}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("scenes", {k: round(v, 2) for k, v in scenes.items()})
print("messages", len(msgs))
print("loudness", round(meter.integrated_loudness(st), 2), "LUFS · peak", round(20 * np.log10(np.abs(st).max()), 2), "dBFS")
