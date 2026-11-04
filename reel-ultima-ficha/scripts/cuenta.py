"""Block A in the frame domain: the high-speed-camera time ramp, every tile's tilt per frame, the counter, the
heartbeat, the clacks (one per real impact of the simulation) and the motion-control camera.

    real time τ(f): a 240→… fps "ramp": the slow motion relaxes as the tension grows (the wave visibly speeds up),
    then from frame 184 the clock brakes at constant deceleration to a dead stop on frame 195, when the last tile
    is exactly 35° from vertical — frozen in the air.

Writes src/timeline-fichas.json (per frame, read by Blender and Remotion) and src/caida.json (every tile's tilt over
real time, for the wireframe chain that falls again in scene 4). Imported by build.py for the sound.
"""
import json, math, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cadena as C
from fisica import simulate

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
F_BRAKE, F_FREEZE, F_VOICE = 184, 195, 210
FREEZE_DEG = 35.0
S0, S1 = 1 / 270, 1 / 120        # real seconds per video frame at the start (9× slow motion) and at the brake (4×)

SIM = simulate(t_end=2.15)
tau_s, PHI = SIM["t"], SIM["phi"]                       # (n,), (n, N)
last = PHI[:, -1]
k35 = int(np.argmax(last >= math.radians(FREEZE_DEG)))
# exact instant the last tile passes 35° (linear between samples)
a, b = last[k35 - 1], last[k35]
TAU_FREEZE = tau_s[k35 - 1] + (math.radians(FREEZE_DEG) - a) / (b - a) * (tau_s[k35] - tau_s[k35 - 1])

# time ramp (continuous in f): exponential from S0 to S1 over [0, 184], then linear to 0 at 195
def speed(f):
    if f <= F_BRAKE:
        return S0 * (S1 / S0) ** (f / F_BRAKE)
    if f <= F_FREEZE:
        return S1 * (1 - (f - F_BRAKE) / (F_FREEZE - F_BRAKE))
    return 0.0


fine = np.linspace(0, F_FREEZE, F_FREEZE * 200 + 1)
sp = np.array([speed(f) for f in fine])
cum = np.concatenate([[0], np.cumsum((sp[1:] + sp[:-1]) / 2 * np.diff(fine))])
TAU0 = TAU_FREEZE - cum[-1]


def tau_of(f):
    """Real time (s) shown on video frame f (fractional frames allowed); held after the freeze."""
    return TAU0 + float(np.interp(min(max(f, 0.0), F_FREEZE), fine, cum))


def frame_of(tau):
    return float(np.interp(tau - TAU0, cum, fine))


def tilts_at(tau):
    return np.array([np.interp(tau, tau_s, PHI[:, j]) for j in range(C.N)])


FRAMES = F_VOICE + 1
TAU = [tau_of(f) for f in range(FRAMES)]
TILT = np.array([tilts_at(t) for t in TAU])            # (frames, N), radians
assert abs(math.degrees(TILT[F_FREEZE, -1]) - FREEZE_DEG) < 0.05
counter = [max(1, (F_FREEZE + 1) - min(f, F_FREEZE)) for f in range(FRAMES)]
assert all(counter[f] - counter[f - 1] == -1 for f in range(1, F_FREEZE + 1)) and counter[F_FREEZE] == 1

# clacks: every impact that happens on screen (real instant → video time), the last tile's included
IMPACTS = [(j, float(t)) for j, t in enumerate(SIM["impacts"])]   # impact j: tile j strikes tile j+1
CLACKS = [(j, frame_of(t) / FPS) for j, t in IMPACTS if TAU0 <= t <= TAU_FREEZE]
WAVE_SPEED = float(C.D / np.median(np.diff(SIM["impacts"][10:])))

# heartbeat: lub-dub from 52 to 150 bpm with the tension, its last beat exactly on the brake
tension_lin = np.clip(np.array([(TAU[f] - TAU0) / (TAU_FREEZE - TAU0) for f in range(FRAMES)]), 0, 1)
tension_lin[F_FREEZE:] = 1.0
t_brake = F_BRAKE / FPS
T_FIRST = 0.2
tt_ = np.arange(T_FIRST, t_brake + 1e-9, 1 / 600)
bpm = 52 + 98 * np.interp(tt_ * FPS, np.arange(FRAMES), tension_lin) ** 1.25
ph = np.concatenate([[0], np.cumsum(bpm / 60 / 600)[:-1]])
ph *= round(ph[-1]) / ph[-1]
BEATS = [float(tt_[np.argmax(ph >= k - 1e-9)]) for k in range(0, int(round(ph[-1])) + 1)]
BEATS[-1] = t_brake
TENSION = tension_lin ** 1.4
TENSION[F_FREEZE:] = 0.0

# ── camera (Blender axes, metres): a motion-control slider pushing in on the last tile, low over the table ──
LT = C.TILES[-1]
hero_c = C.place(LT, TILT[F_FREEZE, -1], LT["c"] + np.array([0, 0, C.H * 0.45]))      # the frozen tile's middle
hero_front = C.place(LT, TILT[F_FREEZE, -1], LT["c"] + LT["f"] * (C.T / 2) + np.array([0, 0, C.H * 0.5]))
FOV = 20.0


def _cam_at(dist, az_deg, el_deg, target):
    az, el = math.radians(az_deg), math.radians(el_deg)
    d = np.array([math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)])
    return target + d * dist


def wave_point(f):
    """Where the wave is on frame f: the tile being struck (fractional, between impact instants), mid-height."""
    imp = SIM["impacts"]
    k = float(np.interp(TAU[f], imp, np.arange(1, len(imp) + 1)))      # tile k is falling (struck at impact k-1)
    k = min(k, C.N - 1)
    i0 = int(k)
    i1 = min(i0 + 1, C.N - 1)
    p = C.TILES[i0]["c"] * (1 - (k - i0)) + C.TILES[i1]["c"] * (k - i0)
    return p + np.array([0, 0, C.H * 0.5])


WAVE = [wave_point(f) for f in range(FRAMES)]
CAM0 = _cam_at(1.08, 3.0, 4.4, 0.5 * (WAVE[0] + hero_c))
CAM1 = _cam_at(0.40, 9.5, 6.6, hero_c)
cam = []
for f in range(FRAMES):
    u = min(f, F_FREEZE) / F_FREEZE
    # slider: a steady push with a soft start; it is still gliding (a hair) when the clock stops
    p = 0.55 * u + 0.45 * (1 - (1 - u) ** 2)
    pos = CAM0 + (CAM1 - CAM0) * p
    # the operator keeps the wave and the last tile in frame, then settles on the last tile
    q = 0.5 - 0.5 * math.cos(math.pi * min(1.0, max(0.0, (u - 0.62) / 0.33)))
    mid = 0.5 * (WAVE[min(f, F_FREEZE)] + hero_c) + np.array([0.006, 0, 0]) * (1 - u)
    tgt = mid * (1 - q) + hero_c * q
    fdist = float(np.linalg.norm(hero_front - pos))
    fstop = 11 + 9 * u
    cam.append([round(float(v), 6) for v in (*pos, *tgt)] + [FOV, round(fdist, 5), round(fstop, 3)])

DATA = {
    "fps": FPS, "frames": FRAMES, "brake": F_BRAKE, "freeze": F_FREEZE, "voice": F_VOICE, "freezeDeg": FREEZE_DEG,
    "N": C.N, "H": C.H, "W": C.W, "T": C.T, "D": C.D, "rEdge": C.R_EDGE,
    "tau": [round(t, 6) for t in TAU], "tau0": round(TAU0, 6), "tauFreeze": round(TAU_FREEZE, 6),
    "tilt": [[round(float(v), 5) for v in row] for row in TILT],
    "counter": counter, "beats": [round(b * FPS, 3) for b in BEATS], "tension": [round(float(v), 4) for v in TENSION],
    "clacks": [[j, round(t, 4)] for j, t in CLACKS], "waveSpeed": round(WAVE_SPEED, 3),
    "cam": cam,  # per frame: position xyz, target xyz (Blender axes, m), vertical fov (deg), focus distance (m), f-stop
    "tiles": [C.tile_json(t) for t in C.TILES],
    "pips": [list(p) for p in C.PIPS], "flip": C.FLIP,
}


def write():
    json.dump(DATA, open(os.path.join(ROOT, "src", "timeline-fichas.json"), "w"))
    step = 4  # every 1 ms of real time
    caida = {"dt": round(float(tau_s[step] - tau_s[0]), 6), "landing": SIM["landing"],
             "impacts": [round(float(t), 5) for t in SIM["impacts"]],
             "phi": [[round(float(v), 4) for v in PHI[k]] for k in range(0, len(tau_s), step)]}
    json.dump(caida, open(os.path.join(ROOT, "src", "caida.json"), "w"))


if __name__ == "__main__":
    write()
    print(f"τ0 {TAU0:.4f}s → freeze {TAU_FREEZE:.4f}s ({(TAU_FREEZE - TAU0) * 1000:.0f} ms of real time in 6.5 s)")
    print(f"wave {WAVE_SPEED:.2f} m/s · clacks on screen {len(CLACKS)}: first {CLACKS[0]} last {CLACKS[-1]}")
    print("last-tile tilt (deg) at frames 176..195:", [round(math.degrees(v), 1) for v in TILT[176:196, -1]])
    print("freeze tilts (last 6):", [round(math.degrees(v), 1) for v in TILT[F_FREEZE, -6:]])
    print("beats", [round(b, 2) for b in BEATS])
    print("fallen at frame 0:", int(np.sum(TILT[0] > math.radians(5))), "tiles")
