"""Builds the reel's timelines and audio mix — every sound effect is placed from the same numbers that drive
the image (gear angles, tooth passes, part moves, word times), so they land on the exact frame.

Inputs:  ../audio/raw/clic-que-no-existe/<take>.mp3 (one ElevenLabs take, used whole), data/words.json (align.py),
         music/<track>.mp3 (the user's track, used from 4:36)
Outputs: src/timeline-engranajes.json  per-frame countdown: counter, approach, gear angles, heartbeats, camera
         src/timeline.json              scenes, captions, events (seconds on the reel's clock)
         public/audio/mix.wav           voice + music + sfx, -14 LUFS, true peak <= -1 dBTP
         data/tick.npy                  the "completed" tick (drawn as a waveform on screen)

Run: python scripts/build.py
"""
import json, math, os, subprocess, sys
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "clic-que-no-existe")
MUSIC_DIR = os.path.join(ROOT, "music")
MUSIC_FROM = 4 * 60 + 36.0
SR = 48000
FPS = 30
F_BRAKE, F_FREEZE, F_VOICE = 184, 195, 210
rng = np.random.default_rng(11)


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

# ══ 1 · the countdown mechanism (frame domain) ═══════════════════════════════════════════════
# Gear A (brass, 24 teeth, module 1 mm) comes down onto gear B (steel, 32 teeth) while both turn,
# synchronised like a gearbox engaging in motion: their teeth always mesh, so they can slide into each
# other while spinning. From frame 184 the pair brakes with constant deceleration, and on frame 195
# A seats fully into B and everything stops dead — the click.
MOD = 0.001                                  # module (m)
ZA, ZB = 24, 32
RA, RB = MOD * ZA / 2, MOD * ZB / 2          # pitch radii
DEPTH = 2.25 * MOD                           # whole tooth depth: closer than this the teeth are in mesh
fr = np.arange(TOTAL_FRAMES)
counter = np.maximum(1, (F_FREEZE + 1) - np.minimum(fr, F_FREEZE))
assert np.all(np.diff(counter[: F_FREEZE + 1]) == -1) and counter[F_FREEZE] == 1

# approach (extra centre distance, m): still for 8 frames, smooth, accelerating, then a hard brake to 0
G0, G1, F1 = 0.0072, 0.0034, 78
n2, nb, EXP2 = F_BRAKE - F1, F_FREEZE - F_BRAKE, 1.5
k_ = EXP2 / n2 * nb / 2
gb = (k_ * G1) / (1 + k_)                    # gap at the brake so that braking stops exactly at 0
v_end = (G1 - gb) * EXP2 / n2
gap = np.empty(TOTAL_FRAMES)
for f in range(TOTAL_FRAMES):
    ff = min(f, F_FREEZE)
    if ff <= 8:
        gap[f] = G0
    elif ff <= F1:
        u = (ff - 8) / (F1 - 8)
        gap[f] = G0 - (G0 - G1) * u * u * (3 - 2 * u)
    elif ff <= F_BRAKE:
        gap[f] = G1 - (G1 - gb) * ((ff - F1) / n2) ** EXP2
    else:
        tau = ff - F_BRAKE
        gap[f] = gb - v_end * tau + 0.5 * (v_end / nb) * tau * tau
gap[np.abs(gap) < 1e-12] = 0.0
assert abs(gap[F_FREEZE]) < 1e-9

# rotation of A (screen-counter-clockwise, rad): slow-motion speed rising with the tension, then the brake
tension_lin = np.clip(1 - gap / G0, 0, 1)
w0, w1 = math.radians(22) / FPS, math.radians(105) / FPS        # rad per frame
omega = np.where(fr <= F_BRAKE, w0 + (w1 - w0) * np.clip((fr - 4) / (F_BRAKE - 4), 0, 1) ** 1.6, 0.0)
wb = omega[F_BRAKE]
for f in range(F_BRAKE + 1, TOTAL_FRAMES):
    omega[f] = max(0.0, wb * (1 - (f - F_BRAKE) / nb)) if f <= F_FREEZE else 0.0
thetaA = np.concatenate([[0.0], np.cumsum(omega[1:])])
thetaA[F_FREEZE:] = thetaA[F_FREEZE]
# final pose: a tooth of A pointing straight down (-90°), centred in a gap of B
pitchA = 2 * math.pi / ZA
shift = (-math.pi / 2 - thetaA[F_FREEZE]) % pitchA
thetaA = thetaA + shift
thetaB = -(ZA / ZB) * (thetaA + math.pi / 2) + math.pi / 2 + math.pi / ZB

# heartbeat: lub-dub, 52 → 150 bpm with the tension; its last beat lands exactly on the brake
tension = tension_lin ** 1.4
tension[fr > F_FREEZE] = 0.0
t_brake = F_BRAKE / FPS
T_FIRST = 0.22                                         # the first beat right at the start (it's the hook)
tt_ = np.arange(T_FIRST, t_brake + 1e-9, 1 / 600)
bpm = 52 + 98 * np.interp(tt_ * FPS, fr, tension_lin) ** 1.3
ph = np.concatenate([[0], np.cumsum(bpm / 60 / 600)[:-1]])
ph *= round(ph[-1]) / ph[-1]                           # whole number of beats from the first to the brake
beats = [float(tt_[np.argmax(ph >= k - 1e-9)]) for k in range(0, int(round(ph[-1])) + 1)]
beats[-1] = t_brake

# tooth passes while in mesh (one click each time a tooth of A crosses the contact line)
engaged = gap < DEPTH * 0.9
tooth_ticks = []
for f in range(1, F_FREEZE + 1):
    if engaged[f]:
        c0 = math.floor((thetaA[f - 1] + math.pi / 2) / pitchA)
        c1 = math.floor((thetaA[f] + math.pi / 2) / pitchA)
        for c in range(c0 + 1, c1 + 1):
            a_c = c * pitchA - math.pi / 2
            frac = (a_c - thetaA[f - 1]) / max(thetaA[f] - thetaA[f - 1], 1e-12)
            t_k = (f - 1 + frac) / FPS
            if t_k < F_FREEZE / FPS - 0.08:            # the seat knock covers the very last one
                tooth_ticks.append(round(t_k, 4))

# camera (Blender axes, metres): a motion-control push from both gears to the mesh point, slight orbit
FOV = 15.0
D0, D1 = 0.185, 0.078
AZ0, AZ1 = 0.48, 0.34
EL0, EL1 = 0.20, 0.14
cam = []
for f in range(F_VOICE + 1):
    u = min(f, F_FREEZE) / F_FREEZE
    p = 0.35 * u + 0.65 * (0.5 - 0.5 * math.cos(math.pi * u))
    dist = math.exp(math.log(D0) + (math.log(D1) - math.log(D0)) * p)
    az, el = AZ0 + (AZ1 - AZ0) * p, EL0 + (EL1 - EL0) * p
    vis = 2 * dist * math.tan(math.radians(FOV / 2))
    tz = -(960 - 900) / 1920 * vis                   # the mesh point sits at y ≈ 900 px
    pos = (math.sin(az) * math.cos(el) * dist, -math.cos(az) * math.cos(el) * dist, tz + math.sin(el) * dist)
    ty = -0.0035                                     # aim at the front of the teeth, not the mid-plane (orbit parallax)
    pos = (pos[0], pos[1] + ty, pos[2])
    cam.append([round(v, 7) for v in (*pos, 0.0, ty, tz)] + [FOV])

engr = {
    "fps": FPS, "frames": int(F_VOICE + 1), "brake": F_BRAKE, "freeze": F_FREEZE, "voice": F_VOICE,
    "module": MOD, "zA": ZA, "zB": ZB, "hundreds": [], "beats": [round(b * FPS, 3) for b in beats],
    "counter": counter[: F_VOICE + 1].tolist(),
    "gap": [round(float(v), 8) for v in gap[: F_VOICE + 1]],
    "thetaA": [round(float(v), 7) for v in thetaA[: F_VOICE + 1]],
    "thetaB": [round(float(v), 7) for v in thetaB[: F_VOICE + 1]],
    "cam": cam,  # per frame: camera position xyz, target xyz (Blender axes, m), vertical fov (deg)
    "tension": [round(float(v), 4) for v in tension],
}

# ══ 2 · voice-anchored timeline (seconds) ════════════════════════════════════════════════════
W = json.load(open(os.path.join(ROOT, "data", "words.json")))["A"]
SEGS = [[a + VOICE_AT, b + VOICE_AT] for a, b in W["segments"]]
words = [{"w": w["w"], "s": round(w["s"] + VOICE_AT, 3), "e": round(w["e"] + VOICE_AT, 3)} for w in W["words"]]
seg_words = [[w for w in words if a - 0.01 <= w["s"] < b + 0.01] for a, b in SEGS]
assert [len(s) for s in seg_words] == [4, 7, 3, 4, 5, 4, 9, 6, 5, 6, 4, 3, 13, 12], [len(s) for s in seg_words]


def wt(seg, idx, key="s"):
    return seg_words[seg][idx][key]


speech_end = SEGS[-1][1]
scenes = {
    "S1": F_VOICE / FPS,                 # «¿Has oído ese clic? Es el sonido de que algo encaja.» (held frame)
    "S2": SEGS[2][0] - 0.12,             # «Pues es mentira: esos engranajes no existen.» (scan, glitch → wire)
    "S3": SEGS[4][0] - 0.15,             # «Los ha calculado un ordenador. Y el sonido, también.» (exploded view)
    "S4": SEGS[6][0] - 0.12,             # «Y aun así, tu cerebro se lo ha creído: le encanta que las cosas encajen.»
    "S5": SEGS[8][0] - 0.25,             # «Ahora piensa en tu negocio: … haciendo de pegamento.» (2D mechanism)
    "S6": SEGS[12][0] - 0.1,             # «En AIgencyx Labs fabricamos las piezas que faltan…»
    "S7": SEGS[13][0] - 0.2,             # CTA
    "C": speech_end + 0.22, "END": TOTAL,
}


def cap(lines, end, start=None):
    out = {"lines": [[{"text": c[0], "t": round(c[1], 3), "hl": bool(c[2])} for c in ln] for ln in lines], "end": round(end, 3)}
    out["start"] = round(start if start is not None else lines[0][0][1] - 0.05, 3)
    return out


captions = [
    cap([[("¿Has", wt(0, 0), 0), ("oído", wt(0, 1), 0)], [("ese", wt(0, 2), 0), ("clic?", wt(0, 3), 1)]], SEGS[1][0] - 0.1),
    cap([[("Es", wt(1, 0), 0), ("el", wt(1, 1), 0), ("sonido", wt(1, 2), 0)], [("de", wt(1, 3), 0), ("que", wt(1, 4), 0), ("algo", wt(1, 5), 0), ("encaja", wt(1, 6), 1)]],
        scenes["S2"] - 0.02),
    cap([[("Pues", wt(2, 0), 0), ("es", wt(2, 1), 0)], [("mentira", wt(2, 2), 1)]], SEGS[3][0] - 0.1),
    cap([[("esos", wt(3, 0), 0), ("engranajes", wt(3, 1), 0)], [("no", wt(3, 2), 1), ("existen", wt(3, 3), 1)]], scenes["S3"] - 0.05),
    cap([[("Los", wt(4, 0), 0), ("ha", wt(4, 1), 0), ("calculado", wt(4, 2), 0)], [("un", wt(4, 3), 0), ("ordenador", wt(4, 4), 1)]], SEGS[5][0] - 0.1),
    cap([[("Y", wt(5, 0), 0), ("el", wt(5, 1), 0), ("sonido,", wt(5, 2), 0)], [("también", wt(5, 3), 1)]], scenes["S4"] - 0.05),
    cap([[("Y", wt(6, 0), 0), ("aun", wt(6, 1), 0), ("así,", wt(6, 2), 0)], [("se", wt(6, 5), 0), ("lo", wt(6, 6), 0), ("ha", wt(6, 7), 0), ("creído", wt(6, 8), 1)]], SEGS[7][0] - 0.1),
    cap([[("le", wt(7, 0), 0), ("encanta", wt(7, 1), 0), ("que", wt(7, 2), 0)], [("las", wt(7, 3), 0), ("cosas", wt(7, 4), 0), ("encajen", wt(7, 5), 1)]], scenes["S5"] - 0.05),
    cap([[("Ahora", wt(8, 0), 0), ("piensa", wt(8, 1), 0), ("en", wt(8, 2), 0)], [("tu", wt(8, 3), 0), ("negocio", wt(8, 4), 1)]], SEGS[9][0] - 0.1),
    cap([[("Y", wt(10, 0), 0), ("tú", wt(10, 1), 0), ("en", wt(10, 2), 0), ("medio,", wt(10, 3), 0)], [("haciendo", wt(11, 0), 0), ("de", wt(11, 1), 0), ("pegamento", wt(11, 2), 1)]],
        scenes["S6"] - 0.05),
    cap([[("Fabricamos", wt(12, 3), 0), ("las", wt(12, 4), 0)], [("piezas", wt(12, 5), 0), ("que", wt(12, 6), 0), ("faltan", wt(12, 7), 1)]], wt(12, 8) - 0.05),
    cap([[("para", wt(12, 8), 0), ("que", wt(12, 9), 0), ("todo", wt(12, 10), 0)], [("encaje", wt(12, 11), 0), ("solo", wt(12, 12), 1)]], scenes["S7"] - 0.05),
]

# ── events ──
aud_s, aud_e = wt(13, 1), wt(13, 1, "e")
type_step = min(0.075, (aud_e - aud_s - 0.06) / 9)
ev = {
    "freeze": F_FREEZE / FPS, "voice": F_VOICE / FPS, "brake": t_brake,
    "clicEcho": SEGS[0][1] + 0.06,                       # a ghost of the click in the breath after «¿Has oído ese clic?»
    "scan": wt(2, 2),                                    # «mentira»: a scan line checks the image
    "noExiste": wt(3, 3),                                # «existen»: glitch → wireframe
    "waveTick": SEGS[5][0] + (wt(5, 3) - SEGS[5][0]) - 0.24,  # the tick, replayed in the breath «Y el sonido, [·] también»
    "wavePause": wt(5, 3),
    "sweep": scenes["S5"], "agenda": wt(9, 1), "mensajes": wt(9, 3), "facturas": wt(9, 5),
    "tu": wt(10, 1), "pegamento": wt(11, 0),
    "fabrica": wt(12, 3), "faltan": wt(12, 7), "encaje": wt(12, 11), "solo": wt(12, 12),
    "cta": scenes["S7"], "comenta": wt(13, 0), "typeStart": aud_s + 0.02, "typeStep": type_step,
    "send": aud_s + 0.02 + 9 * type_step + 0.08, "cual": wt(13, 5), "crt": scenes["C"], "logo": scenes["C"] + 0.45,
}
# the breath after «sonido,» (pause before «también»): put the replayed tick right in it
pause_s, pause_e = wt(5, 2, "e"), wt(5, 3)
ev["waveTick"] = round(pause_s + 0.02, 3)

# exploded view (S3) and reassembly (S4): each part leaves/returns on a syllable; the last return — gear A
# dropping back into mesh with B — lands on «encajen»
explode = [  # part, start (s), duration
    ("arandelaA", wt(4, 0), 0.5), ("arandelaB", wt(4, 2), 0.5), ("tornilloA", wt(4, 2) + 0.18, 0.45),
    ("tornilloB", wt(4, 3), 0.45), ("engranajeA", wt(4, 4), 0.6), ("engranajeB", wt(4, 4) + 0.2, 0.6),
]
reassemble = [  # part, landing time (s) — they travel for 0.32 s and click when they land
    ("tornilloB", wt(7, 1) + 0.08), ("arandelaB", wt(7, 2)), ("engranajeB", wt(7, 3)),
    ("tornilloA", wt(7, 4)), ("arandelaA", wt(7, 4) + 0.2), ("engranajeA", wt(7, 5)),
]
ev = {k: round(v, 3) for k, v in ev.items()}

# 2D mechanism (S5–S6): three gears that don't fit, «tú» in the middle pushing; the missing gear is built
# tooth by tooth, slides in, and on «encaje» the train turns by itself
mech = {
    "pops": [ev["agenda"], ev["mensajes"], ev["facturas"]],
    "grind": [round(ev["pegamento"] + k * 0.45, 3) for k in range(3)],          # jerky shoves while «haciendo de pegamento»
    "toothStart": ev["fabrica"], "toothStep": round((ev["faltan"] - 0.25 - ev["fabrica"]) / 20, 4), "teeth": 20,
    "slide": round(ev["faltan"] - 0.05, 3), "seat": round(ev["faltan"] + 0.38, 3),
    "engage": ev["encaje"], "spinRate": 0.55,                                  # rev/s of the new gear once it runs
}
# mesh clicks of the running train: the new gear (20 teeth) passing teeth at spinRate
mech_ticks = [round(ev["encaje"] + k / (mech["spinRate"] * mech["teeth"]), 4)
              for k in range(1, int((scenes["S7"] - ev["encaje"]) * mech["spinRate"] * mech["teeth"]))]

# ══ 3 · audio ═══════════════════════════════════════════════════════════════════════════════
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
ten = np.interp(tt * FPS, fr, tension)
pre = tt < t_freeze

# ── countdown bed: a low drone that tightens with the tension, a soft riser in the last seconds ──
drone = (np.sin(2 * np.pi * 46 * tt) + 0.5 * np.sin(2 * np.pi * 69.2 * tt + 0.7)) * 0.03 * (0.5 + 0.8 * ten) * pre
r_ = np.clip((ten - 0.45) / 0.55, 0, 1) * pre
riser = lp(bp(rng.standard_normal(N), 900, 5200) * r_ ** 2 * 0.05, 7000)

# ── gear whir: bearing hum + air, pitch and level follow A's angular speed ──
om = np.interp(tt * FPS, fr, omega) * FPS                                 # rad/s
spin = om / (math.radians(105))
whir_ph = np.cumsum((90 + 140 * spin) / SR)
whir = (np.sin(2 * np.pi * whir_ph) * 0.4 + np.sin(4 * np.pi * whir_ph) * 0.15) * spin ** 1.2 * 0.022
whir += bp(rng.standard_normal(N), 2200, 7000) * spin ** 1.5 * 0.006
whir *= pre

sfx = np.zeros(N)
sfx_list = []


def add(kind, t, gain=1.0, **kw):
    sfx_list.append({"t": round(t, 3), "type": kind})
    if kind == "heart":  # lub-dub: a deep chest thump, then a softer one 0.13–0.2 s later
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
    elif kind == "tooth":  # metal tooth passing in mesh: tiny bright tick + a body
        nn = int(0.06 * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 3300 * tl) * 0.35 + np.sin(2 * np.pi * 5400 * tl) * 0.2 + bp(rng.standard_normal(nn), 2500, 9000) * 0.5) * np.exp(-tl / 0.006)
        v += np.sin(2 * np.pi * 820 * tl) * np.exp(-tl / 0.012) * 0.25
    elif kind == "seat":  # the gear dropping fully home: a dense metallic knock
        nn = int(0.4 * SR)
        tl = np.arange(nn) / SR
        v = sum(np.sin(2 * np.pi * f * tl) * a * np.exp(-tl / d) for f, a, d in ((1180, 0.45, 0.05), (2650, 0.3, 0.035), (4300, 0.2, 0.02), (310, 0.5, 0.06)))
        v += bp(rng.standard_normal(nn), 1500, 9000) * 0.4 * np.exp(-tl / 0.004)
    elif kind == "tiiick":  # "completed": a bright, clean ring that hangs a moment (tiiiick)
        nn = int(1.1 * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 3136 * tl) * 0.5 + np.sin(2 * np.pi * 6272 * tl) * 0.12 * np.exp(-tl / 0.08)
             + np.sin(2 * np.pi * 4699 * tl) * 0.18 * np.exp(-tl / 0.15)) * np.exp(-tl / 0.42) * (1 - np.exp(-tl / 0.0015))
        v += hp(rng.standard_normal(nn), 6000) * 0.25 * np.exp(-tl / 0.003)
    elif kind == "hum":
        nn = int(0.6 * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 41 * tl) + 0.3 * np.sin(2 * np.pi * 82 * tl)) * 0.008 * env_ar(nn, 0.02, 0.15)
    elif kind == "scan":  # a thin sweep, like a scanner head passing
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
    elif kind == "release":  # a part coming off: a short metallic tink + air
        nn = int(0.35 * SR)
        tl = np.arange(nn) / SR
        f0 = kw.get("f", 2400)
        v = np.sin(2 * np.pi * f0 * tl) * np.exp(-tl / 0.03) * 0.3 + bp(rng.standard_normal(nn), 700, 4000) * np.sin(np.pi * np.clip(tl / 0.35, 0, 1)) ** 2 * 0.12
    elif kind == "snap":  # a part landing home: crisp click
        nn = int(0.18 * SR)
        tl = np.arange(nn) / SR
        f0 = kw.get("f", 2000)
        v = (np.sin(2 * np.pi * f0 * tl) * 0.4 + np.sin(2 * np.pi * f0 * 1.51 * tl) * 0.2) * np.exp(-tl / 0.018) + bp(rng.standard_normal(nn), 2000, 9000) * 0.35 * np.exp(-tl / 0.003)
    elif kind == "sweep":
        nn = int(0.6 * SR)
        tl = np.arange(nn) / SR
        v = bp(rng.standard_normal(nn), 1500, 8000) * np.sin(np.pi * tl / 0.6) ** 2 * 0.2
    elif kind == "pop":  # a 2D gear appearing: soft wooden-metal clunk
        nn = int(0.3 * SR)
        tl = np.arange(nn) / SR
        f0 = kw.get("f", 420)
        v = np.sin(2 * np.pi * f0 * tl) * np.exp(-tl / 0.05) * 0.45 + np.sin(2 * np.pi * f0 * 2.7 * tl) * np.exp(-tl / 0.02) * 0.15
    elif kind == "grind":  # teeth that don't fit, forced: a rough scrape
        nn = int(0.32 * SR)
        tl = np.arange(nn) / SR
        am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * tl))
        v = bp(rng.standard_normal(nn), 300, 2500) * am * np.sin(np.pi * tl / 0.32) * 0.3 + np.sin(2 * np.pi * 95 * tl) * np.exp(-tl / 0.1) * 0.15
    elif kind == "build":  # a tooth of the new gear being made: tiny high tick
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        v = np.sin(2 * np.pi * kw.get("f", 2600) * tl) * np.exp(-tl / 0.008) * 0.22
    elif kind == "slide":
        nn = int(0.4 * SR)
        tl = np.arange(nn) / SR
        v = bp(rng.standard_normal(nn), 400, 3000) * np.sin(np.pi * tl / 0.4) ** 2 * 0.14
    elif kind == "run":  # the train starting to run: a soft swell
        nn = int(0.9 * SR)
        tl = np.arange(nn) / SR
        v = (np.sin(2 * np.pi * 110 * tl) * 0.2 + np.sin(2 * np.pi * 165 * tl) * 0.1) * np.sin(np.pi * np.clip(tl / 0.9, 0, 1)) * 0.5
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


# countdown: heartbeat (louder as it speeds up), teeth in mesh, the seat and the tiiick on the dead stop
for k, b in enumerate(beats):
    tb = np.interp(b * FPS, fr, tension)
    add("heart", b, 0.55 + 0.6 * tb, gap=0.2 - 0.07 * tb)
for tk in tooth_ticks:
    add("tooth", tk, 0.18 + 0.25 * float(np.interp(tk * FPS, fr, tension)))
add("seat", t_freeze, 0.55)
tick_wave = add("tiiick", t_freeze, 0.6)
add("hum", t_freeze + 0.02, 1.0)
# with the voice
add("tiiick", ev["clicEcho"], 0.1)                 # a ghost of the click in the breath after «clic?»
add("scan", ev["scan"] - 0.08, 0.8)
add("glitch", ev["noExiste"], 0.8)
for k, (part, t0, d) in enumerate(explode):
    add("release", t0, 0.55, f=[2900, 2600, 3400, 3100, 1900, 1700][k])
add("tiiick", ev["waveTick"], 0.3)                 # «Y el sonido, [tiiick] también»
for k, (part, tl_) in enumerate(reassemble):
    if part == "engranajeA":
        add("seat", tl_, 0.45)
        add("tiiick", tl_, 0.22)
    else:
        add("snap", tl_, 0.45, f=[2300, 2600, 1500, 2400, 2700][k])
add("sweep", ev["sweep"], 0.7)
for k, tp in enumerate(mech["pops"]):
    add("pop", tp, 0.8, f=[380, 450, 520][k])
for tg in mech["grind"]:
    add("grind", tg, 0.7)
for k in range(mech["teeth"]):
    add("build", mech["toothStart"] + k * mech["toothStep"], 0.6, f=2400 + 40 * (k % 6))
add("slide", mech["slide"], 0.8)
add("seat", mech["seat"], 0.35)
add("snap", ev["encaje"], 0.5, f=1800)
add("run", ev["encaje"], 0.6)
for tk in mech_ticks:
    add("tooth", tk, 0.09)
add("glitch", ev["cta"], 0.45)
for k in range(9):
    add("key", ev["typeStart"] + k * ev["typeStep"], 0.7)
add("send", ev["send"], 0.85)
add("crt", ev["crt"], 0.85)
np.save(os.path.join(ROOT, "data", "tick.npy"), tick_wave.astype(np.float32))

# ── the user's music: from 4:36 of the track, fading in from the freeze as the voice starts explaining;
#    levelled (its loudness changes a lot), a dip in the voice's presence band, ducked under every word,
#    up a touch on the closing card, out with the last second ──
t_in = F_VOICE / FPS
mpath = os.path.join(MUSIC_DIR, next(f for f in sorted(os.listdir(MUSIC_DIR)) if f.endswith(".mp3")))
m = load(mpath, MUSIC_FROM, TOTAL - t_in + 0.5, ch=2)
mus = np.zeros((N, 2))
j0 = int(t_in * SR)
mus[j0:j0 + len(m)] = m[: N - j0]
# auto-level on a 1.5 s loudness window
win = int(1.5 * SR)
mono = mus.mean(1)
rms = np.sqrt(uniform_filter1d(mono ** 2, win) + 1e-10)
target = 10 ** (-24 / 20)
lev = np.clip(target / rms, 0.05, 4.0)
lev = sosfiltfilt(butter(1, 0.6, fs=SR, output="sos"), lev)
mus *= lev[:, None]
# presence dip so the voice sits on top
for c in range(2):
    band = bp(mus[:, c], 1500, 4500)
    mus[:, c] -= 0.45 * band
# duck: −9 dB under the voice, smooth attack/release
venv = np.abs(voice)
venv = np.sqrt(uniform_filter1d(venv ** 2, int(0.05 * SR)))
on = np.clip(venv / (np.percentile(venv[venv > 1e-4], 35) + 1e-9), 0, 1)
on = maximum_filter1d(on, int(0.25 * SR))
duck = sosfiltfilt(butter(1, 3, fs=SR, output="sos"), on)
fade = step(tt, t_in, ev["scan"] + 0.2) ** 1.5 * (1 - step(tt, TOTAL - 1.1, TOTAL - 0.05))
close_up = 1 + 0.6 * step(tt, scenes["C"], scenes["C"] + 0.4)
mus *= (fade * db(-9 * duck) * close_up)[:, None]

# ── mix ──
bed = drone + riser + whir
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
# the same mix without the user's track (it is commercial music: an alternative if Instagram mutes or claims it)
master(np.stack([voice + bed + sfx * 0.6, voice + bed + np.roll(sfx, 40) * 0.6], axis=1), "mix_sinmusica.wav")
# stems for the QA (countdown bed + heartbeat, music level under the voice)
np.save(os.path.join(ROOT, "data", "countdown_music.npy"), ((bed + sfx * 0.6) * db(-14 - _meter.integrated_loudness(np.stack([L, R], 1))))[: int(F_VOICE / FPS * SR)].astype(np.float32))

wave = np.abs(tick_wave[: int(0.45 * SR)])
wave = [round(float(v), 4) for v in maximum_filter1d(wave, 96)[::96] / (wave.max() + 1e-9)]
timeline = {
    "fps": FPS, "durationInFrames": TOTAL_FRAMES, "voiceAt": round(VOICE_AT, 4), "onset": round(onset, 4),
    "scenes": {k: round(v, 3) for k, v in scenes.items()}, "captions": captions, "ev": ev, "words": words,
    "segments": [[round(a, 3), round(b, 3)] for a, b in SEGS], "sfx": sfx_list,
    "explode": [{"part": p, "t": round(t, 3), "d": d} for p, t, d in explode],
    "reassemble": [{"part": p, "t": round(t, 3)} for p, t in reassemble],
    "mech": mech, "toothTicks": tooth_ticks, "tickWave": wave,
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
json.dump(engr, open(os.path.join(ROOT, "src", "timeline-engranajes.json"), "w"))
m_ = pyln.Meter(SR)
print(f"voice onset {onset:.3f}s → MP3 at {VOICE_AT:.3f}s · total {TOTAL_FRAMES} frames ({TOTAL:.2f}s)")
print("beats", [round(b, 2) for b in beats])
print("tooth ticks", tooth_ticks)
print("scenes", {k: round(v, 2) for k, v in scenes.items()})
print("ev", ev)
print("explode", explode)
print("reassemble", reassemble)
print("loudness", round(m_.integrated_loudness(st), 2), "LUFS · sample peak", round(20 * np.log10(np.abs(st).max()), 2), "dBFS")
