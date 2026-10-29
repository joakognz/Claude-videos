"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/ia-precisa-alucina/<take>.mp3 (one ElevenLabs take), <music>.mp4 (the track supplied for the reel),
         data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

The take is used as is (no cuts): it starts at VOICE_AT and its own pauses mark the scenes.

The music is the supplied track, arranged in two pieces so its own build follows the video:
  A  from its quiet opening; its first bass hit (19.0 s) lands on "Siete" (the invented tiles), the second on the other models
  B  its climax, entered on a beat at the oracle's split, so the track's own hard stop (101.42 s) lands on the logo
On top, an activity curve (one key per scene/event) rides its level and opens/closes a low-pass: busy scenes get the
full, bright track; the frozen "no lo sé" beat gets it muffled and low. It is ducked under the voice.

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt, stft

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "ia-precisa-alucina")
TAKE = "9dcabc89"
MUSIC = "d78dc96d"
SR = 48000
FPS = 30
VOICE_AT = 0.3
rng = np.random.default_rng(7)


def load(prefix, ch=1):
    src = next(f for f in os.listdir(RAW) if f.startswith(prefix))
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", os.path.join(RAW, src), "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.float32).astype(np.float64)
    return x if ch == 1 else x.reshape(-1, ch)


def speech_rms(x):
    hop = SR // 100
    n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return np.sqrt(np.mean(r[r > 10 ** (-40 / 20)] ** 2))


W = json.load(open(os.path.join(ROOT, "data", "words.json")))["A"]
SEGS = W["segments"]
seg_words = [[{"w": w["w"], "s": round(w["s"] + VOICE_AT, 3), "e": round(w["e"] + VOICE_AT, 3)}
              for w in W["words"] if a - 0.01 <= w["s"] < b] for a, b in SEGS]


def wt(seg, idx):
    """Timeline start of word `idx` of segment `seg`."""
    return seg_words[seg][idx]["s"]


def seg_start(seg):
    return SEGS[seg][0] + VOICE_AT


VOICE_END = SEGS[-1][1] + VOICE_AT

# ── scenes (the prompt's seven + the end card, on the take's pauses) ─────
scenes = {
    "E1": 0.0, "E2": seg_start(2) - 0.15, "E3": seg_start(4) - 0.15, "E4": seg_start(5) - 0.15, "E5": seg_start(6) - 0.15,
    "E6": seg_start(8) - 0.15, "E7": seg_start(9) - 0.15, "E8": VOICE_END + 0.3,
}
TOTAL = round(scenes["E8"] + 2.45, 1)
scenes["END"] = TOTAL
S = scenes
N = int(TOTAL * SR)

# ── music arrangement ───────────────────────────────────────────────────
M = load(MUSIC, 2)
HIT1, HIT2, STOP = 19.0, 25.0, 101.42  # bass hits and the hard stop, in track seconds (measured)


def onsets(x):
    """Spectral-flux onsets of a mono signal, in seconds."""
    _, _, Z = stft(x, SR, nperseg=2048, noverlap=2048 - 512)
    mag = np.log1p(1000 * np.abs(Z))
    flux = np.maximum(0, np.diff(mag, axis=1)).sum(0)
    fr = SR / 512
    pk = [i for i in range(1, len(flux) - 1) if flux[i] > flux[i - 1] and flux[i] >= flux[i + 1] and flux[i] > np.percentile(flux, 90)]
    return np.array(pk) / fr + 1 / fr


shiftA = wt(5, 0) - HIT1  # track time = t - shiftA
offB = STOP - (S["E8"] + 0.3)  # track time = t + offB
ons = onsets(M[int((wt(8, 0) + offB - 1) * SR):int((wt(8, 0) + offB + 1) * SR)].mean(1)) + wt(8, 0) + offB - 1
split = float(ons[np.argmin(np.abs(ons - offB - wt(8, 0)))] - offB)  # beat of the climax closest to "Precisión"

tt = np.arange(N) / SR


def step(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1)


def take_track(track_t):
    idx = np.round(track_t * SR).astype(int)
    ok = (idx >= 0) & (idx < len(M))
    out = np.zeros((N, 2))
    out[ok] = M[idx[ok]]
    return out


partA = take_track(tt - shiftA) * (1 - step(tt, split - 0.25, split + 0.04))[:, None]
partB = take_track(tt + offB) * step(tt, split - 0.03, split + 0.01)[:, None]
music = partA + partB
music *= step(tt, shiftA, shiftA + 0.4)[:, None] * (1 - step(tt, TOTAL - 0.4, TOTAL))[:, None]
# halve the track's own 16 dB build (slow levelling), so its quiet opening is still heard under the voice
k = int(1.5 * SR)
slow = np.sqrt(np.convolve(np.pad(music.mean(1) ** 2, k, mode="edge"), np.ones(k) / k, mode="same")[k:-k] + 1e-9)
ref = np.median(slow[(tt > shiftA + 1) & (tt < S["E8"])])
music *= np.clip((slow / ref) ** -0.5, 0.3, 3.0)[:, None]

# ── on-screen events ────────────────────────────────────────────────────
WAVES = 6
wave0, waveN = wt(2, 7), wt(3, 9) + 0.15  # "seis mil" … "sesenta y siete"
ev = {
    "dolly": 4.0,
    "wave0": wave0, "waveStep": (waveN - wave0) / (WAVES - 1),
    "label": wt(3, 0),                                # model tag on "Claude Fable"
    "freeze": wt(4, 1),                               # the oracle stops ("cuando no sabe")
    "nose": wt(4, 3), "noseStep": 0.12,               # "NO LO SÉ" types… and dies before the É
    "fake0": wt(5, 0), "fakeStep": 0.068,             # 24 tiles fill with invented answers ("Siete")
    "pips": wt(5, 0) + 0.15,
    "orbs": wt(6, 0), "orbStep": 0.2,
    "orbFake": wt(6, 2), "hit2": HIT2 + shiftA,       # the other grids fill; all flare on the track's second bass hit
    "split": split,
    "labels": split + 0.45,
    "scan": wt(9, 8) - 0.1, "scanDur": 1.1,           # "alguien tiene que revisarla": a review line sweeps the grid
    "dark": wt(10, 0) - 0.25,
    "typeStart": wt(10, 1) - 0.3, "typeStep": 0.075,
}
ev = {k: round(v, 3) for k, v in ev.items()}
FAKES = 24


def cap(chunks, end, **kw):
    """chunks: (text, time, highlight) with highlight in {None, 'o'}"""
    out = {"chunks": [{"text": c[0], "t": round(c[1], 3), "hl": c[2]} for c in chunks],
           "start": round(chunks[0][1] - 0.12, 3), "end": round(end, 3)}
    out.update(kw)
    return out


captions = {
    "E1": cap([("La IA", wt(0, 0), None), ("más", wt(0, 2), None), ("precisa", wt(0, 3), "o")], S["E2"] - 0.1,
              micro=[["RANKING · OCTUBRE 2026", wt(0, 3) + 0.3]], microEnd=round(seg_start(1) - 0.05, 3),
              sub=[["Pero fíjate", wt(1, 0)], ["en lo que hace", wt(1, 3)], ["cuando no sabe.", wt(1, 6)]]),
    "E2": cap([("Acierta el", wt(3, 5), None), ("67 %", wt(3, 7), "o")], S["E3"] - 0.1,
              micro=[["ARTIFICIAL ANALYSIS", wt(2, 0)], ["\u00a0· 6.000 PREGUNTAS", wt(2, 7)]]),
    "E3": cap([("Y a menudo", wt(4, 6), None), ("no avisa", wt(4, 8), "o")], S["E4"] - 0.1,
              micro=[["NO LO SÉ → ∅", wt(4, 6)]]),
    "E4": cap([("7 de cada 10", wt(5, 0), "o"), ("se inventa", wt(5, 8), None)], S["E5"] - 0.1,
              micro=[["72,6 % DE LOS", wt(5, 5)], ["NO ACIERTOS", wt(5, 7)]]),
    "E5": cap([("Otros", wt(6, 0), None), ("fallan", wt(6, 2), None), ("más", wt(6, 4), "o")], S["E6"] - 0.1,
              micro=[["FUENTE: ARTIFICIAL ANALYSIS", wt(7, 0)]]),
    "E6": cap([("Precisión", wt(8, 0), None), ("≠", wt(8, 1), None), ("fiabilidad", wt(8, 6), "o")], S["E7"] - 0.1,
              micro=[["SABER ≠ SABER QUE NO SABES", wt(8, 6) + 0.35]]),
    "E7A": cap([("Si tu negocio", wt(9, 0), None), ("usa IA", wt(9, 3), None), ("con", wt(9, 5), None), ("clientes", wt(9, 6), "o")],
               wt(9, 7) - 0.12),
    "E7": cap([("Que alguien", wt(9, 7), None), ("revise", wt(9, 10), "o"), ("tu IA", wt(9, 10) + 0.38, None)], S["E8"] - 0.1,
              micro=[["COMENTA LA PALABRA", wt(10, 0)]]),
}
cta = {"comenta": wt(10, 0), "keyword": wt(10, 1)}

# ── activity of the picture: drives the music's level and brightness ────
ACT = [
    (0.0, 0.45), (3.6, 0.45), (4.4, 0.25), (S["E2"], 0.3), (ev["wave0"] - 0.3, 0.45), (wt(3, 9), 0.8), (S["E3"] - 0.2, 0.7),
    (ev["freeze"], 0.2), (ev["freeze"] + 0.6, 0.05), (ev["fake0"] - 0.15, 0.05), (ev["fake0"], 0.95), (S["E5"] - 0.2, 0.8),
    (ev["orbs"] + 0.3, 0.75), (ev["hit2"], 1.0), (S["E6"] - 0.3, 0.8), (split, 1.0), (S["E7"] - 0.2, 0.85),
    (S["E7"] + 0.6, 0.55), (ev["scan"], 0.6), (ev["scan"] + 0.4, 0.8), (ev["dark"], 0.6), (ev["typeStart"] + 0.3, 0.85),
    (VOICE_END, 0.7), (S["E8"] + 0.2, 0.8), (TOTAL, 0.8),
]
act = np.interp(tt, [a for a, _ in ACT], [b for _, b in ACT])
k = int(0.25 * SR)
act = np.convolve(np.pad(act, k, mode="edge"), np.ones(k) / k, mode="same")[k:-k]
dark_lp = np.stack([sosfiltfilt(butter(2, 650, fs=SR, output="sos"), music[:, c]) for c in (0, 1)], axis=1)
muffle = (1 - act) ** 1.6
music = music * (1 - muffle)[:, None] + dark_lp * muffle[:, None]
music *= (10 ** (-8 * (1 - act) / 20))[:, None]

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


def add(kind, t, gain=1.0, m=88):
    sfx_list.append({"t": round(t, 3), "type": kind})
    nn = int(1.2 * SR)
    tl = np.arange(nn) / SR
    if kind == "whoosh":  # long air sweep (the dolly-in)
        nn = int(4.2 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 250, 3500) * np.sin(np.pi * np.clip(tl / 4.2, 0, 1)) ** 2 * 0.25
    elif kind == "ding":  # crystalline: sine + bright inharmonic partials
        f = note_hz(m)
        x = (np.sin(2 * np.pi * f * tl) * 0.5 + np.sin(2 * np.pi * f * 2.0 * tl) * 0.18 * np.exp(-tl / 0.15)
             + np.sin(2 * np.pi * f * 3.01 * tl) * 0.1 * np.exp(-tl / 0.06)) * np.exp(-tl / 0.5) * 0.5
    elif kind == "key":
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    elif kind == "fizzle":  # "no lo sé" dies: falling tone into noise
        nn = int(0.7 * SR)
        tl = np.arange(nn) / SR
        f = 900 * np.exp(-tl / 0.25) + 120
        x = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + bp(rng.standard_normal(nn), 800, 4000) * 0.12) * np.exp(-tl / 0.22)
    elif kind == "glitch":  # crackle: short bit-crushed bursts
        nn = int(0.16 * SR)
        x = np.zeros(nn)
        for j in range(4):
            a = int(rng.uniform(0, 0.11) * SR)
            b = a + int(rng.uniform(0.006, 0.03) * SR)
            hold = int(rng.integers(20, 90))
            burst = np.repeat(rng.uniform(-1, 1, (b - a) // hold + 1), hold)[: b - a]
            x[a:b] += np.round(burst * 4) / 4 * 0.5
        x = hp(x, 600)
    elif kind == "appear":  # soft shimmer + low bloom
        x = (sum(np.sin(2 * np.pi * note_hz(mm) * tl) for mm in (74, 78, 81, 86)) * 0.08 * np.exp(-tl / 0.5)
             + np.sin(2 * np.pi * 73 * tl) * 0.5 * np.exp(-tl / 0.4)) * env_ar(nn, 0.04, 0.1)
    elif kind == "boom":  # deep hit + crack (the oracle splits)
        nn = int(2.2 * SR)
        tl = np.arange(nn) / SR
        fr = 38 + 60 * np.exp(-tl / 0.08)
        x = (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tl / 0.6) * 0.9
             + lp(rng.standard_normal(nn), 500) * 0.35 * np.exp(-tl / 0.12)
             + hp(rng.standard_normal(nn), 2500) * 0.25 * np.exp(-tl / 0.03))
    elif kind == "scan":  # soft rising sweep
        nn = int(1.2 * SR)
        tl = np.arange(nn) / SR
        f = 400 + 1400 * tl / 1.2
        x = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.06 + bp(rng.standard_normal(nn), 2000, 7000) * 0.06) * np.sin(np.pi * tl / 1.2)
    elif kind == "tick":
        nn = int(0.02 * SR)
        x = hp(rng.standard_normal(nn), 4000) * np.exp(-np.arange(nn) / SR / 0.004) * 0.5
    elif kind == "blip":
        nn = int(0.15 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * 1320 * tl) * np.exp(-tl / 0.04) * 0.3
    else:
        raise ValueError(kind)
    place(sfx, x, t, gain)


add("whoosh", 0.0, 0.8)
for i, m in enumerate((84, 86, 88, 91, 93, 96)):  # one ding per wave, rising
    add("ding", ev["wave0"] + i * ev["waveStep"], 0.75 + 0.05 * i, m)
add("blip", ev["label"], 0.6)
for i in range(7):  # "NO LO S" typed, then it dies
    add("key", ev["nose"] + i * ev["noseStep"], 0.45)
add("fizzle", ev["nose"] + 7 * ev["noseStep"] + 0.05, 0.7)
for i in range(FAKES):
    add("glitch", ev["fake0"] + i * ev["fakeStep"], 0.55 if i else 0.9)
for i in range(4):
    add("appear", ev["orbs"] + i * ev["orbStep"], 0.45)
for i in range(10):
    add("glitch", ev["orbFake"] + i * 0.12, 0.3)
add("boom", ev["split"], 1.0)
add("blip", ev["labels"], 0.5)
add("blip", ev["labels"] + 0.25, 0.5)
add("scan", ev["scan"], 1.0)
for i in range(9):
    add("key", ev["typeStart"] + i * ev["typeStep"], 0.7)
add("appear", S["E8"] + 0.3, 0.6)

# ── mix: music low and ducked under the voice ──────────────────────────────
x = load(TAKE)
x *= 10 ** (-18 / 20) / speech_rms(x)
voice = np.zeros(N)
voice[int(VOICE_AT * SR):int(VOICE_AT * SR) + len(x)] = x[: N - int(VOICE_AT * SR)]
venv = np.abs(voice)
k = int(0.12 * SR)
venv = np.convolve(venv, np.ones(k) / k, mode="same")
duck = 1 - 0.5 * np.clip(venv / (np.percentile(venv[venv > 1e-4], 60) + 1e-9), 0, 1)
duck = lp(duck, 5)
# music sits ~11 dB under the voice before ducking (so about 17 dB under it while it speaks)
mus_rms = np.sqrt(np.mean(music[(tt > 1) & (tt < VOICE_END)] ** 2))
music *= 10 ** ((-18 - 11) / 20) / mus_rms
L = music[:, 0] * duck + sfx * 0.45 + voice
R = music[:, 1] * duck + np.roll(sfx, 60) * 0.45 + voice
st = np.stack([L, R], axis=1)
meter = pyln.Meter(SR)
st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
peak = np.abs(st).max()
if peak > 0.85:  # soft-limit the odd peak to stay under -1 dBTP
    st = np.tanh(st / 0.85 * 1.2) * 0.85 / np.tanh(1.2)
    st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                os.path.join(ROOT, "public", "audio", "mix.wav")], input=pcm, check=True)

if os.environ.get("STEMS"):  # music-only and voice-only stems, for checking the balance
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    g = 10 ** ((-14 - meter.integrated_loudness(np.stack([L, R], axis=1))) / 20)
    for name, a in (("music", np.stack([music[:, 0] * duck, music[:, 1] * duck], axis=1)), ("voice", np.stack([voice, voice], axis=1))):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", os.path.join(ROOT, "out", f"stem_{name}.wav")],
                       input=(np.clip(a * g, -1, 1) * 32767).astype("<i2").tobytes(), check=True)

# music energy per frame (0–1), so the picture can breathe with the track
hop = SR // FPS
nf = int(TOTAL * FPS)
me = np.sqrt(np.mean((music.mean(1) * duck)[: nf * hop].reshape(nf, hop) ** 2, axis=1))
me = me / (np.percentile(me, 98) + 1e-9)
menv = [round(float(v), 3) for v in np.clip(me, 0, 1.2)]

timeline = {"fps": FPS, "durationInFrames": nf, "scenes": {k: round(v, 3) for k, v in scenes.items()},
            "captions": captions, "cta": {k: round(v, 3) for k, v in cta.items()}, "ev": ev, "sfx": sfx_list, "menv": menv}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("scenes", {k: round(v, 2) for k, v in scenes.items()})
print("music: A shift", round(shiftA, 3), "· B offset", round(offB, 3), "· split", round(split, 3), "(Precisión at", wt(8, 0), ")")
print("loudness", round(meter.integrated_loudness(st), 2), "LUFS · peak", round(20 * np.log10(np.abs(st).max()), 2), "dBFS")
