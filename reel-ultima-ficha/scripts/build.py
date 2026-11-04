"""Builds the reel's timelines and audio mix. Every sound is placed from the same numbers that drive the image
(the chain's real impacts, the time ramp, the word times), so it lands on its frame.

Inputs:  ../audio/raw/ultima-ficha/<take>.mp3 (one ElevenLabs take, used whole), data/words.json (align.py),
         optional music/<track>.mp3 + MUSIC_FROM (none given: the main mix is the voice + sound design)
Outputs: src/timeline-fichas.json, src/caida.json   (scripts/cuenta.py: countdown, camera, every tile's tilt)
         src/timeline.json                         scenes, captions, events, wire-chain clock, 2D chain
         public/audio/mix.wav, mix_sinmusica.wav    -14 LUFS, true peak <= -1 dBTP
         data/countdown_bed.npy                     stem for the QA (countdown bed + heartbeat + clacks)

Run: python scripts/build.py
"""
import json, math, os, subprocess, sys
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cuenta as K  # noqa: E402  (runs the physics; writes nothing until K.write())
import cadena as CH  # noqa: E402

RAW = os.path.join(ROOT, "..", "audio", "raw", "ultima-ficha")
MUSIC_DIR = os.path.join(ROOT, "music")
MUSIC_FROM = 0.0
SR = 48000
FPS = 30
F_BRAKE, F_FREEZE, F_VOICE = K.F_BRAKE, K.F_FREEZE, K.F_VOICE
rng = np.random.default_rng(11)
K.write()


def load(path, ss=None, t=None, ch=1):
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", str(ss)] if ss is not None else []) + ["-i", path] + (["-t", str(t)] if t else []) + \
          ["-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    return x.reshape(-1, ch) if ch > 1 else x


take = os.path.join(RAW, next(f for f in sorted(os.listdir(RAW)) if f.endswith(".mp3")))
x = load(take)
h = SR // 200
lvl = 20 * np.log10(np.sqrt(np.mean(x[: len(x) // h * h].reshape(-1, h) ** 2, axis=1)) + 1e-12)
onset = int(np.argmax(lvl > -50)) * h / SR
VOICE_AT = F_VOICE / FPS - onset
TOTAL_FRAMES = int(round((VOICE_AT + len(x) / SR + 2.0) * FPS))
TOTAL = TOTAL_FRAMES / FPS
N = int(TOTAL * SR)


def speech_rms(v):
    hop = SR // 100
    n = len(v) // hop
    r = np.sqrt(np.mean(v[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return np.sqrt(np.mean(r[r > 10 ** (-40 / 20)] ** 2))


x *= 10 ** (-18 / 20) / speech_rms(x)
voice = np.zeros(N)
i0 = int(round(VOICE_AT * SR))
voice[i0:i0 + len(x)] = x[: N - i0]

# ══ voice-anchored timeline (seconds on the reel's clock) ══════════════════════════════════════════════════════
W = json.load(open(os.path.join(ROOT, "data", "words.json")))["A"]
SEGS = [[a + VOICE_AT, b + VOICE_AT] for a, b in W["segments"]]
words = [{"w": w["w"], "s": round(w["s"] + VOICE_AT, 3), "e": round(w["e"] + VOICE_AT, 3)} for w in W["words"]]
seg_words = [[w for w in words if a - 0.01 <= w["s"] < b + 0.01] for a, b in SEGS]
assert [len(s) for s in seg_words] == [7, 5, 3, 9, 6, 3, 5, 10, 5, 8, 6, 6, 10, 10], [len(s) for s in seg_words]


def wt(seg, idx, key="s"):
    return seg_words[seg][idx][key]


speech_end = SEGS[-1][1]
scenes = {
    "S1": F_VOICE / FPS,                 # «Esa última ficha no va a caer.» (held frame)
    "S2": SEGS[1][0] - 0.1,              # «No porque algo la frene: porque no existe. Ni las fichas, ni la mesa, ni el sonido.»
    "S3": SEGS[4][0] - 0.12,             # «Todo lo ha calculado un ordenador.»
    "S4": SEGS[5][0] - 0.1,              # «Y aun así, estabas esperando a que cayera. A tu cerebro … solas.»
    "S5": SEGS[8][0] - 0.3,              # «Ahora piensa en tu negocio: … y cada ficha la empujas tú.» (2D)
    "S6": SEGS[11][0] - 0.12,            # «En AIgencyx Labs montamos la cadena: tú das el primer toque y el resto cae solo.»
    "S7": SEGS[13][0] - 0.25,            # CTA
    "C": speech_end + 0.22, "END": TOTAL,
}


def cap(lines, end, start=None):
    out = {"lines": [[{"text": c[0], "t": round(c[1], 3), "hl": bool(c[2])} for c in ln] for ln in lines], "end": round(end, 3)}
    out["start"] = round(start if start is not None else lines[0][0][1] - 0.05, 3)
    return out


captions = [
    cap([[("Esa", wt(0, 0), 0), ("última", wt(0, 1), 0), ("ficha", wt(0, 2), 0)], [("no", wt(0, 3), 0), ("va", wt(0, 4), 0), ("a", wt(0, 5), 0), ("caer", wt(0, 6), 1)]],
        scenes["S2"] - 0.02),
    cap([[("No", wt(1, 0), 0), ("porque", wt(1, 1), 0), ("algo", wt(1, 2), 0)], [("la", wt(1, 3), 0), ("frene", wt(1, 4), 1)]], SEGS[2][0] - 0.08),
    cap([[("porque", wt(2, 0), 0)], [("no", wt(2, 1), 0), ("existe", wt(2, 2), 1)]], SEGS[3][0] - 0.06),
    cap([[("Ni", wt(3, 0), 0), ("las", wt(3, 1), 0)], [("fichas", wt(3, 2), 1)]], wt(3, 3) - 0.04),
    cap([[("ni", wt(3, 3), 0), ("la", wt(3, 4), 0)], [("mesa", wt(3, 5), 1)]], wt(3, 6) - 0.04),
    cap([[("ni", wt(3, 6), 0), ("el", wt(3, 7), 0)], [("sonido", wt(3, 8), 1)]], scenes["S3"] - 0.05),
    cap([[("Todo", wt(4, 0), 0), ("lo", wt(4, 1), 0), ("ha", wt(4, 2), 0)], [("calculado", wt(4, 3), 0), ("un", wt(4, 4), 0), ("ordenador", wt(4, 5), 1)]],
        scenes["S4"] - 0.05),
    cap([[("Y", wt(5, 0), 0), ("aun", wt(5, 1), 0), ("así,", wt(5, 2), 0)], [("estabas", wt(6, 0), 0), ("esperando", wt(6, 1), 1)]], wt(6, 2) - 0.04),
    cap([[("a", wt(6, 2), 0), ("que", wt(6, 3), 0)], [("cayera", wt(6, 4), 1)]], SEGS[7][0] - 0.06),
    cap([[("A", wt(7, 0), 0), ("tu", wt(7, 1), 0), ("cerebro", wt(7, 2), 0)], [("le", wt(7, 3), 0), ("encantan", wt(7, 4), 1)]], wt(7, 5) - 0.04),
    cap([[("las", wt(7, 5), 0), ("cadenas", wt(7, 6), 0), ("que", wt(7, 7), 0)], [("funcionan", wt(7, 8), 0), ("solas", wt(7, 9), 1)]], scenes["S5"] - 0.05),
    cap([[("Ahora", wt(8, 0), 0), ("piensa", wt(8, 1), 0)], [("en", wt(8, 2), 0), ("tu", wt(8, 3), 0), ("negocio", wt(8, 4), 1)]], SEGS[9][0] - 0.06),
    cap([[("y", wt(10, 0), 0), ("cada", wt(10, 1), 0), ("ficha", wt(10, 2), 0)], [("la", wt(10, 3), 0), ("empujas", wt(10, 4), 0), ("tú", wt(10, 5), 1)]], scenes["S6"] - 0.05),
    cap([[("Montamos", wt(11, 3), 0), ("la", wt(11, 4), 0)], [("cadena", wt(11, 5), 1)]], SEGS[12][0] - 0.06),
    cap([[("tú", wt(12, 0), 0), ("das", wt(12, 1), 0), ("el", wt(12, 2), 0)], [("primer", wt(12, 3), 0), ("toque", wt(12, 4), 1)]], wt(12, 5) - 0.04),
    cap([[("y", wt(12, 5), 0), ("el", wt(12, 6), 0), ("resto", wt(12, 7), 0)], [("cae", wt(12, 8), 0), ("solo", wt(12, 9), 1)]], scenes["S7"] - 0.05),
]

# ── events ──
aud_s, aud_e = wt(13, 1), wt(13, 1, "e")
type_step = min(0.075, (aud_e - aud_s - 0.06) / 9)
sonido_end = wt(3, 8, "e")
ev = {
    "freeze": F_FREEZE / FPS, "voice": F_VOICE / FPS, "brake": F_BRAKE / FPS,
    "frene": wt(1, 4),                                   # «frene»: a scan line checks the frozen image (nothing holds it)
    "noExiste": wt(2, 2),                                # «existe»: glitch → the last tile turns to wire
    "fichas": wt(3, 2), "mesa": wt(3, 5), "sonido": wt(3, 8),   # each element revealed as a 3D structure on its word
    "clacEcho": round(sonido_end + 0.06, 3),             # the clac replayed in the breath after «sonido.», drawn as it plays
    "todo": wt(4, 0), "calculado": wt(4, 3), "ordenador": wt(4, 5),
    "rew0": wt(5, 0), "rew1": wt(5, 2, "e") + 0.15, "fall0": wt(6, 0), "fall1": wt(6, 4),
    "solas": wt(7, 9),
    "sweep": scenes["S5"], "mensaje": wt(9, 1), "cita": wt(9, 3), "presupuesto": wt(9, 5), "factura": wt(9, 7),
    "cada": wt(10, 1), "empujas": wt(10, 4), "tu": wt(10, 5),
    "montamos": wt(11, 3), "cadena": wt(11, 5), "toque": wt(12, 4), "resto": wt(12, 7), "cae": wt(12, 8), "solo": wt(12, 9),
    "cta": scenes["S7"], "comenta": wt(13, 0), "typeStart": aud_s + 0.02, "typeStep": type_step,
    "send": aud_s + 0.02 + 9 * type_step + 0.08, "que": wt(13, 5), "crt": scenes["C"], "logo": scenes["C"] + 0.45,
}
ev["rew1"] = min(ev["rew1"], ev["fall0"] - 0.03)
ev = {k: round(v, 3) for k, v in ev.items()}

# ── the wire chain's clock (S2–S4), in real seconds of the simulation, per video frame ──
#    held at the freeze → rewound to the start (all standing) on «Y aun así» → falls again, braking into the same 35°
#    exactly on «cayera» → held while «A tu cerebro le encantan las cadenas que funcionan…» → on «solas» the last tile
#    finally falls (6× slow motion) and lands
TAU_F, TAU_LAND = K.TAU_FREEZE, float(K.SIM["landing"])
LAND_DUR = (TAU_LAND - TAU_F) * 6.0
ev["land"] = round(ev["solas"] + LAND_DUR, 3)


def wire_tau(t):
    if t < ev["rew0"]:
        return TAU_F
    if t < ev["rew1"]:
        u = (t - ev["rew0"]) / (ev["rew1"] - ev["rew0"])
        return TAU_F * (1 - (0.5 - 0.5 * math.cos(math.pi * u)))
    if t < ev["fall0"]:
        return 0.0
    if t < ev["fall1"]:
        u = (t - ev["fall0"]) / (ev["fall1"] - ev["fall0"])
        return TAU_F * u * (1.18 - 0.18 * u * u)       # a hair faster than real time, braking into the freeze
    if t < ev["solas"]:
        return TAU_F
    return min(TAU_LAND + 0.06, TAU_F + (t - ev["solas"]) / 6.0)


f_w0, f_w1 = int(ev["noExiste"] * FPS) - 2, int(scenes["S5"] * FPS) + 20
wire_clock = [round(wire_tau(f / FPS), 5) for f in range(f_w0, f_w1)]
# impacts of the replay, on the reel's clock
refall_clacks = []
for j, ti in enumerate(K.SIM["impacts"]):
    lo, hi = ev["fall0"], ev["fall1"]
    for _ in range(40):
        mid = 0.5 * (lo + hi)
        lo, hi = (mid, hi) if wire_tau(mid) < ti else (lo, mid)
    if ti <= TAU_F:
        refall_clacks.append((j, round(0.5 * (lo + hi), 4)))

# ── S3 call-outs: each one on its syllable ──
anot = [{"k": "angulo", "t": ev["todo"]}, {"k": "onda", "t": ev["calculado"]}, {"k": "separacion", "t": ev["ordenador"]}]

# ── 2D chain (S5–S6): four business tiles with gaps, «tú» pushes each one; the gaps fill with orange tiles,
#    one touch, and the whole chain falls by itself (impacts at a real chain's accelerating rhythm) ──
cards = [{"label": "MENSAJE", "t": ev["mensaje"]}, {"label": "CITA", "t": ev["cita"]},
         {"label": "PRESUPUESTO", "t": ev["presupuesto"]}, {"label": "FACTURA", "t": ev["factura"]}]
pushes = [round(ev["cada"] + k * (ev["tu"] + 0.1 - ev["cada"]) / 3.6, 3) for k in range(4)]
fills = [round(ev["montamos"] + k * 0.23, 3) for k in range(6)]
fall_start = round(ev["toque"] + 0.06, 3)
n2d = 10
gaps_ = [0.19]
for k in range(n2d - 2):
    gaps_.append(gaps_[-1] * 0.9 + 0.012)
fall_t = [fall_start]                             # tile k starts falling at fall_t[k] (= the instant tile k-1 strikes it)
for g in gaps_:
    fall_t.append(round(fall_t[-1] + g, 3))
fall_t.append(round(fall_t[-1] + 0.16, 3))         # the last tile lands
assert len(fall_t) == n2d + 1
chain2d = {"cards": cards, "pushes": pushes, "fills": fills, "touch": ev["toque"], "fallT": fall_t}

# ══ audio ══════════════════════════════════════════════════════════════════════════════════════════════════════
tt = np.arange(N) / SR


def lp(v, fc, order=2):
    return sosfilt(butter(order, fc, fs=SR, output="sos"), v)


def hp(v, fc, order=2):
    return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), v)


def bp(v, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), v)


def place(buf, v, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i < 0:
        v, i = v[-i:], 0
    n = max(0, min(len(v), len(buf) - i))
    buf[i:i + n] += v[:n] * gain


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


def db(v):
    return 10 ** (v / 20)


t_freeze = F_FREEZE / FPS
fr = np.arange(len(K.TENSION))
ten = np.interp(tt * FPS, fr, K.TENSION)
pre = tt < t_freeze

# countdown bed: a low drone that tightens with the tension, a soft riser in the last seconds
drone = (np.sin(2 * np.pi * 44 * tt) + 0.5 * np.sin(2 * np.pi * 66.3 * tt + 0.7) + 0.25 * np.sin(2 * np.pi * 88.6 * tt)) * 0.028 * (0.45 + 0.9 * ten) * pre
r_ = np.clip((ten - 0.45) / 0.55, 0, 1) * pre
riser = lp(bp(rng.standard_normal(N), 900, 5200) * r_ ** 2 * 0.05, 7000)
# room tone of the studio during the countdown and the freeze (so the stop is a stop, not digital silence)
room = lp(rng.standard_normal(N), 900) * 0.0035 * (tt < ev["noExiste"])

sfx = np.zeros(N)
sfx_list = []


def add(kind, t, gain=1.0, **kw):
    sfx_list.append({"t": round(t, 3), "type": kind})
    f = kw.get("f", 1.0)
    if kind == "heart":  # lub-dub: a deep chest thump, then a softer one
        v = np.zeros(int(0.7 * SR))
        gap_ = kw.get("gap", 0.17)
        for k, (amp, f0) in enumerate(((1.0, 58), (0.62, 66))):
            nn = int(0.32 * SR)
            tl = np.arange(nn) / SR
            fq = f0 * (1 + 0.9 * np.exp(-tl / 0.025))
            thump = np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-tl / 0.075) * (1 - np.exp(-tl / 0.004))
            thump += lp(rng.standard_normal(nn), 400) * 0.18 * np.exp(-tl / 0.02)
            j = int(k * gap_ * SR)
            v[j:j + nn] += amp * thump
        v = lp(v, 900)
    elif kind == "clac":  # resin tile striking resin tile: a hard, bright, hollow click with a short body
        nn = int(0.09 * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 2900 * f * tl) * 0.45 + np.sin(2 * np.pi * 4700 * f * tl + 1.1) * 0.25 + np.sin(2 * np.pi * 1350 * f * tl) * 0.3) * np.exp(-tl / 0.007)
        v += bp(rng.standard_normal(nn), 1800, 9000) * 0.6 * np.exp(-tl / 0.0025)
        v += np.sin(2 * np.pi * 620 * f * tl) * np.exp(-tl / 0.018) * 0.18
    elif kind == "land":  # a tile landing flat on the varnished walnut: a woody knock with low body
        nn = int(0.35 * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 185 * tl) * 0.6 * np.exp(-tl / 0.045) + np.sin(2 * np.pi * 520 * tl) * 0.35 * np.exp(-tl / 0.02)
             + np.sin(2 * np.pi * 2300 * tl) * 0.25 * np.exp(-tl / 0.006))
        v += bp(rng.standard_normal(nn), 900, 7000) * 0.45 * np.exp(-tl / 0.003)
    elif kind == "golpe":  # the dead stop: a dry, heavy knock (no tail)
        nn = int(0.25 * SR)
        tl = np.arange(nn) / SR
        v = np.sin(2 * np.pi * 95 * tl * (1 + 0.6 * np.exp(-tl / 0.02))) * np.exp(-tl / 0.05) * 0.8
        v += bp(rng.standard_normal(nn), 300, 4000) * 0.5 * np.exp(-tl / 0.006)
    elif kind == "tiiick":  # "completed": a bright, clean ring that hangs a moment (~3 kHz)
        nn = int(1.1 * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 3136 * tl) * 0.5 + np.sin(2 * np.pi * 6272 * tl) * 0.12 * np.exp(-tl / 0.08)
             + np.sin(2 * np.pi * 4699 * tl) * 0.18 * np.exp(-tl / 0.15)) * np.exp(-tl / 0.42) * (1 - np.exp(-tl / 0.0015))
        v += hp(rng.standard_normal(nn), 6000) * 0.25 * np.exp(-tl / 0.003)
    elif kind == "hum":  # the frozen world: a thin electric hum that hangs under the held frame
        nn = int(kw.get("dur", 4.0) * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 50 * tl) + 0.35 * np.sin(2 * np.pi * 100 * tl) + 0.12 * np.sin(2 * np.pi * 150 * tl)) * 0.006 * env_ar(nn, 0.03, 0.6)
    elif kind == "scan":
        nn = int(0.55 * SR)
        tl = np.arange(nn) / SR
        f_ = 1800 + 2600 * tl / 0.55
        v = (bp(rng.standard_normal(nn), 2500, 8000) * 0.25 + np.sin(2 * np.pi * np.cumsum(f_) / SR) * 0.05) * np.sin(np.pi * tl / 0.55) ** 2
    elif kind == "glitch":
        nn = int(6 / FPS * SR)
        tl = np.arange(nn) / SR
        hold = np.repeat(rng.standard_normal(nn // 60 + 1), 60)[:nn]
        sq = np.sign(np.sin(2 * np.pi * np.repeat(rng.uniform(180, 1600, 6), nn // 6 + 1)[:nn] * tl))
        gate = (np.floor(tl * FPS * 2) % 2 == 0) * 0.8 + 0.2
        v = (hold * 0.35 + sq * 0.25) * gate * env_ar(nn, 0.002, 0.01) * 0.7
    elif kind == "reveal":  # an element turning into its mesh: a digital sweep with a data chatter
        dur = kw.get("dur", 0.6)
        nn = int(dur * SR)
        tl = np.arange(nn) / SR
        f_ = 700 + 2600 * (tl / dur) ** 1.4
        chat = np.sign(np.sin(2 * np.pi * np.cumsum(f_ * 0.5) / SR)) * (np.floor(tl * 90) % 3 == 0)
        v = (bp(rng.standard_normal(nn), 1500, 7500) * 0.3 + chat * 0.06 + np.sin(2 * np.pi * np.cumsum(f_) / SR) * 0.05) * np.sin(np.pi * tl / dur) ** 1.5
    elif kind == "strike":  # a tag struck through: a quick marker scratch
        nn = int(0.16 * SR)
        tl = np.arange(nn) / SR
        v = bp(rng.standard_normal(nn), 2500, 9000) * 0.35 * np.sin(np.pi * tl / 0.16) ** 0.7
    elif kind == "tick":  # a call-out snapping on
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 2400 * f * tl) * 0.4 + bp(rng.standard_normal(nn), 3000, 9000) * 0.3) * np.exp(-tl / 0.006)
    elif kind == "rewind":  # tape rewind: a rising whine with a mechanical chatter
        dur = kw.get("dur", 0.8)
        nn = int(dur * SR)
        tl = np.arange(nn) / SR
        f_ = 300 + 1900 * (tl / dur) ** 1.6
        v = (np.sin(2 * np.pi * np.cumsum(f_) / SR) * 0.12 + bp(rng.standard_normal(nn), 1200, 6000) * 0.12) * np.sin(np.pi * tl / dur) ** 0.6
        v *= 0.75 + 0.25 * np.sign(np.sin(2 * np.pi * np.cumsum(18 + 40 * tl / dur) / SR))
    elif kind == "sweep":
        nn = int(0.6 * SR)
        tl = np.arange(nn) / SR
        v = bp(rng.standard_normal(nn), 1500, 8000) * np.sin(np.pi * tl / 0.6) ** 2 * 0.2
    elif kind == "pop":  # a 2D tile appearing
        nn = int(0.3 * SR)
        tl = np.arange(nn) / SR
        f0 = kw.get("f0", 420)
        v = np.sin(2 * np.pi * f0 * tl) * np.exp(-tl / 0.05) * 0.45 + np.sin(2 * np.pi * f0 * 2.7 * tl) * np.exp(-tl / 0.02) * 0.15
    elif kind == "push":  # «tú» shoving a tile with effort: a strained grunt-like low swell and a creak, a rock back
        nn = int(0.42 * SR)
        tl = np.arange(nn) / SR
        swell = np.sin(np.pi * np.clip(tl / 0.3, 0, 1)) ** 1.5
        v = lp(rng.standard_normal(nn), 380) * 0.5 * swell + np.sin(2 * np.pi * (95 + 25 * tl) * tl) * 0.18 * swell
        v += bp(rng.standard_normal(nn), 600, 2500) * 0.15 * (np.sin(2 * np.pi * 31 * tl) > 0.4) * swell
        v[int(0.3 * SR):] += np.sin(2 * np.pi * 1700 * tl[: nn - int(0.3 * SR)]) * np.exp(-tl[: nn - int(0.3 * SR)] / 0.01) * 0.25
    elif kind == "encaje":  # an orange tile dropping into its gap: slide + a firm snap
        nn = int(0.22 * SR)
        tl = np.arange(nn) / SR
        v = bp(rng.standard_normal(nn), 800, 4000) * 0.12 * np.exp(-tl / 0.05)
        k0 = int(0.06 * SR)
        v[k0:] += (np.sin(2 * np.pi * 2100 * f * tl[: nn - k0]) * 0.4 + np.sin(2 * np.pi * 3170 * f * tl[: nn - k0]) * 0.2) * np.exp(-tl[: nn - k0] / 0.012)
        v[k0:] += bp(rng.standard_normal(nn - k0), 2000, 9000) * 0.3 * np.exp(-tl[: nn - k0] / 0.003)
    elif kind == "toque":  # one finger tap
        nn = int(0.12 * SR)
        tl = np.arange(nn) / SR
        v = np.sin(2 * np.pi * 900 * tl) * np.exp(-tl / 0.012) * 0.35 + bp(rng.standard_normal(nn), 1000, 5000) * 0.2 * np.exp(-tl / 0.004)
    elif kind == "check":
        nn = int(0.18 * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 1760 * tl) * 0.25 + np.sin(2 * np.pi * 2640 * tl) * 0.12) * np.exp(-tl / 0.05)
    elif kind == "key":
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        v = (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    elif kind == "send":
        nn = int(0.3 * SR)
        tl = np.arange(nn) / SR
        v = bp(rng.standard_normal(nn), 1500, 5000) * 0.5 * np.exp(-tl / 0.01) + np.sin(2 * np.pi * (900 + 900 * tl / 0.3) * tl) * 0.25 * np.exp(-tl / 0.07)
    elif kind == "crt":
        nn = int(0.6 * SR)
        tl = np.arange(nn) / SR
        v = np.sin(2 * np.pi * np.cumsum(9000 * np.exp(-tl / 0.12) + 60) / SR) * 0.05 * np.exp(-tl / 0.25) + np.sin(2 * np.pi * 70 * tl) * 0.35 * np.exp(-tl / 0.09)
    else:
        raise ValueError(kind)
    place(sfx, v, t, gain)
    return v


# ── countdown: heartbeat (louder as it speeds up), one clac per real impact (accelerating), the dead stop ──
for b in K.BEATS:
    tb = float(np.interp(b * FPS, fr, K.TENSION))
    add("heart", b, 0.55 + 0.6 * tb, gap=0.2 - 0.07 * tb)
for j, tc in K.CLACKS:
    rr = np.random.default_rng(j)
    add("clac", tc, 0.22 + 0.3 * float(np.interp(tc * FPS, fr, K.TENSION)), f=rr.uniform(0.92, 1.08))
add("golpe", t_freeze, 0.7)
clac_wave = add("clac", t_freeze + 0.004, 0.4, f=1.0)
add("tiiick", t_freeze, 0.6)
add("hum", t_freeze + 0.02, 1.0, dur=ev["noExiste"] - t_freeze)
# ── with the voice ──
add("scan", ev["frene"] - 0.05, 0.6)
add("glitch", ev["noExiste"], 0.8)
add("reveal", ev["fichas"], 0.8, dur=0.7)
add("strike", ev["fichas"] + 0.2, 0.5)
add("reveal", ev["mesa"], 0.7, dur=0.75)
add("strike", ev["mesa"] + 0.2, 0.5)
add("reveal", ev["sonido"], 0.5, dur=0.45)
add("strike", ev["sonido"] + 0.2, 0.5)
echo = add("clac", ev["clacEcho"], 0.55, f=1.0)
for k, (dt_, g_) in enumerate(((0.08, 0.42), (0.16, 0.26), (0.24, 0.15))):   # a short slap-back: it sounds as long as it draws
    add("clac", ev["clacEcho"] + dt_, 0.55 * g_, f=1.0)
for k, a in enumerate(anot):
    add("tick", a["t"], 0.7, f=[1.0, 1.12, 1.26][k])
add("rewind", ev["rew0"], 0.8, dur=ev["rew1"] - ev["rew0"])
for j, tc in refall_clacks:
    rr = np.random.default_rng(100 + j)
    add("clac", tc, 0.07 + 0.11 * j / len(refall_clacks), f=rr.uniform(0.92, 1.08))
add("land", ev["land"], 0.9)
add("clac", ev["land"] + 0.003, 0.25, f=0.8)
add("sweep", ev["sweep"], 0.7)
for k, c in enumerate(cards):
    add("pop", c["t"], 0.8, f0=[380, 430, 480, 540][k])
for tp in pushes:
    add("push", tp, 0.6)
for k, tf in enumerate(fills):
    add("encaje", tf, 0.7, f=1.0 + 0.03 * (k % 3))
add("toque", ev["toque"], 0.9)
for k, tf in enumerate(fall_t[1:-1]):
    rr = np.random.default_rng(300 + k)
    add("clac", tf, 0.3, f=rr.uniform(0.92, 1.08))
add("land", fall_t[-1], 0.5)
for k, i in enumerate((0, 3, 6, 9)):              # each label ticked as its tile goes
    add("check", fall_t[i] + 0.04, 0.5)
add("glitch", ev["cta"], 0.45)
for k in range(9):
    add("key", ev["typeStart"] + k * ev["typeStep"], 0.7)
add("send", ev["send"], 0.85)
add("crt", ev["crt"], 0.85)

# ── optional music (none supplied for this reel): from MUSIC_FROM, fading in as the voice starts explaining,
#    levelled, a dip in the voice's presence band, ducked −9 dB under every word, up a touch on the close ──
mus = np.zeros((N, 2))
mfiles = [f for f in sorted(os.listdir(MUSIC_DIR)) if f.endswith(".mp3")] if os.path.isdir(MUSIC_DIR) else []
if mfiles:
    t_in = F_VOICE / FPS
    m = load(os.path.join(MUSIC_DIR, mfiles[0]), MUSIC_FROM, TOTAL - t_in + 0.5, ch=2)
    j0 = int(t_in * SR)
    mus[j0:j0 + len(m)] = m[: N - j0]
    win = int(1.5 * SR)
    rms = np.sqrt(uniform_filter1d(mus.mean(1) ** 2, win) + 1e-10)
    lev = sosfiltfilt(butter(1, 0.6, fs=SR, output="sos"), np.clip(10 ** (-24 / 20) / rms, 0.05, 4.0))
    mus *= lev[:, None]
    for c in range(2):
        mus[:, c] -= 0.45 * bp(mus[:, c], 1500, 4500)
    venv = np.sqrt(uniform_filter1d(np.abs(voice) ** 2, int(0.05 * SR)))
    on = maximum_filter1d(np.clip(venv / (np.percentile(venv[venv > 1e-4], 35) + 1e-9), 0, 1), int(0.25 * SR))
    duck = sosfiltfilt(butter(1, 3, fs=SR, output="sos"), on)
    fade = step(tt, t_in, ev["frene"]) ** 1.5 * (1 - step(tt, TOTAL - 1.1, TOTAL - 0.05))
    mus *= (fade * db(-9 * duck) * (1 + 0.6 * step(tt, scenes["C"], scenes["C"] + 0.4)))[:, None]

# ── mix ──
bed = drone + riser + room
L = voice + bed + sfx * 0.6 + mus[:, 0] * 0.55
R = voice + bed + np.roll(sfx, 40) * 0.6 + mus[:, 1] * 0.55
st = np.stack([L, R], axis=1)
CEIL = db(-3.0)


def limit(xx):
    env = maximum_filter1d(np.abs(xx).max(axis=1), size=int(0.006 * SR))
    g = np.minimum(1.0, CEIL / (env + 1e-9))
    g = minimum_filter1d(g, size=int(0.012 * SR))
    g = uniform_filter1d(g, size=int(0.006 * SR))
    return xx * g[:, None]


_meter = pyln.Meter(SR)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)


def master(xx, name):
    """−14 LUFS integrated, look-ahead limiter at −3 dBFS (true peak stays under −1 dBTP after AAC)."""
    for _ in range(4):
        xx = limit(xx * db(-14 - _meter.integrated_loudness(xx)))
    pcm = (np.clip(xx, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    os.path.join(ROOT, "public", "audio", name)], input=pcm, check=True)
    return xx


st = master(st, "mix.wav")
master(np.stack([voice + bed + sfx * 0.6, voice + bed + np.roll(sfx, 40) * 0.6], axis=1), "mix_sinmusica.wav")
gain = db(-14 - _meter.integrated_loudness(np.stack([L, R], 1)))
np.save(os.path.join(ROOT, "data", "countdown_bed.npy"), ((bed + sfx * 0.6) * gain)[: int(F_VOICE / FPS * SR)].astype(np.float32))


def env_bars(v, dur, n=96):
    a = np.abs(v[: int(dur * SR)])
    hop = max(1, len(a) // n)
    e = maximum_filter1d(a, hop)[::hop][:n]
    return [round(float(q), 4) for q in e / (e.max() + 1e-9)]


# the replayed clac, as a 3D waveform: its spectrogram (time × 24 bands, normalised) drawn as it plays
seg = echo[: int(0.09 * SR)]
nb, nt = 24, 36
spec = []
for k in range(nt):
    s0 = int(k * len(seg) / nt)
    w_ = seg[s0:s0 + 256]
    if len(w_) < 256:
        w_ = np.pad(w_, (0, 256 - len(w_)))
    S = np.abs(np.fft.rfft(w_ * np.hanning(256)))
    edges = np.geomspace(300, 12000, nb + 1)
    fq = np.fft.rfftfreq(256, 1 / SR)
    spec.append([float(S[(fq >= edges[i]) & (fq < edges[i + 1])].mean() if np.any((fq >= edges[i]) & (fq < edges[i + 1])) else 0) for i in range(nb)])
spec = np.array(spec)
spec = np.sqrt(spec / spec.max())
timeline = {
    "fps": FPS, "durationInFrames": TOTAL_FRAMES, "voiceAt": round(VOICE_AT, 4), "onset": round(onset, 4),
    "scenes": {k: round(v, 3) for k, v in scenes.items()}, "captions": captions, "ev": ev, "words": words,
    "segments": [[round(a, 3), round(b, 3)] for a, b in SEGS], "sfx": sfx_list,
    "wireClock": {"f0": f_w0, "tau": wire_clock, "tauFreeze": round(TAU_F, 6), "tauLand": round(TAU_LAND, 6)},
    "refallClacks": [[j, t] for j, t in refall_clacks], "anot": anot, "chain2d": chain2d,
    "clacWave": env_bars(echo, 0.09), "clacSpec": [[round(float(v), 3) for v in row] for row in spec], "clacDur": 0.09,
    "waveSpeed": round(K.WAVE_SPEED, 3), "spacing": CH.D, "freezeDeg": K.FREEZE_DEG,
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
m_ = pyln.Meter(SR)
print(f"voice onset {onset:.3f}s → MP3 at {VOICE_AT:.3f}s · total {TOTAL_FRAMES} frames ({TOTAL:.2f}s)")
print("scenes", {k: round(v, 2) for k, v in scenes.items()})
print("ev", ev)
print("refall clacks", len(refall_clacks), refall_clacks[0], refall_clacks[-1])
print("2D", chain2d)
print("loudness", round(m_.integrated_loudness(st), 2), "LUFS · sample peak", round(20 * np.log10(np.abs(st).max()), 2), "dBFS")
