"""Shared geometry of the domino chain: tile size, the curved path on the table, where every tile stands,
which pips it carries, and the exact contact law between two neighbouring tiles.

Used by build.py (physics, camera, sound), blender_fichas.py (the Cycles model) and, through the JSON it writes,
the three.js wireframe — so all of them agree to the micrometre.

Axes (Blender): table top is z = 0, the camera looks roughly along +Y, the chain comes from far away (+Y)
toward the camera and its last tile falls toward the camera (−Y) and a little to the right (+X).
Each tile i has: c (bottom centre, standing), f (unit fall direction, horizontal), w = f × z (width axis).
A tile rolls on its front-bottom rounded edge: the bevel's centre line is the axle, and it moves forward r·φ.
"""
import math
import numpy as np

MM = 0.001
H, W, T = 48 * MM, 24 * MM, 10 * MM      # height, width, thickness of a tile (double-six "jumbo" with spinner)
R_EDGE = 1.3 * MM                          # rounding of every edge (the curve bevel)
R_CORNER = 3.2 * MM                        # rounding of the four corners of the face outline
D = 30 * MM                                # spacing between tiles along the path (centre to centre)
N = 40                                     # tiles in the chain; tile N-1 is the last one, in the foreground
FALL_DEG = 38.0                            # last tile's fall direction: from −Y toward +X (seen from above)
RNG = np.random.default_rng(20261103)


# ── the path: built backward from the last tile with a curvature profile (heading measured from +Y toward +X) ──
def _path(n=4000, length=None):
    """Arc-length sampled path, from the last tile (σ = 0) backward into the depth of the table."""
    L = length or (N + 2) * D
    sig = np.linspace(0, L, n)
    # heading of the BACKWARD direction (from a tile toward the one before it)
    h0 = math.radians(180 - FALL_DEG)     # backward dir of the last tile: +Y and −X
    h0 = -math.radians(FALL_DEG)          # (sin h, cos h) → (−0.62, 0.79): away from camera, to the left
    def kappa(s):
        # straight for the last two tiles, then a firm right-hand turn, then a long soft S into the distance
        k = 0.0
        k += 7.2 * _bump(s, 0.07, 0.26)    # turn back toward +Y and beyond (rad/m)
        k -= 1.5 * _bump(s, 0.32, 0.64)    # S: a soft swing back left
        k += 1.2 * _bump(s, 0.70, 1.10)    # and a gentle right in the far distance
        return k
    hd = np.empty(n)
    hd[0] = h0
    ds = sig[1] - sig[0]
    for k in range(1, n):
        hd[k] = hd[k - 1] + kappa(sig[k - 1]) * ds
    x = np.concatenate([[0], np.cumsum(np.sin(hd[:-1]) * ds)])
    y = np.concatenate([[0], np.cumsum(np.cos(hd[:-1]) * ds)])
    return sig, x, y, hd


def _bump(s, a, b):
    """Smooth window: 0 outside [a, b], sin² inside."""
    if s <= a or s >= b:
        return 0.0
    return math.sin(math.pi * (s - a) / (b - a)) ** 2


SIG, PX, PY, PH = _path()
# the last tile's bottom centre sits at the origin; tile i (0 = farthest) sits at σ = (N-1-i)·D behind it
TILES = []
for i in range(N):
    s = (N - 1 - i) * D
    x, y, h = (float(np.interp(s, SIG, a)) for a in (PX, PY, PH))
    back = np.array([math.sin(h), math.cos(h), 0.0])
    f = -back                                  # fall direction (toward the end of the chain)
    w = np.cross(f, [0, 0, 1.0])               # width axis
    TILES.append({"i": i, "c": np.array([x, y, 0.0]), "f": f, "w": w / np.linalg.norm(w)})

# pips: a shuffled double-six set (28 tiles) plus a few repeats; the last two are chosen for the close-up
_set = [(a, b) for a in range(7) for b in range(a, 7)]
RNG.shuffle(_set)
PIPS = [_set[k % len(_set)] for k in range(N)]
PIPS[N - 1] = (6, 4)        # the hero, frozen in the air
PIPS[N - 2] = (5, 3)
PIPS[N - 3] = (2, 6)
# a few tiles are flipped (the two halves swapped) and a couple carry a chipped corner
FLIP = [bool(RNG.uniform() < 0.5) for _ in range(N)]
CHIPS = {N - 1: "top_left_front", N - 4: "top_right_front", 21: "top_left_front"}


# ── pose of a tile: rolling on its front-bottom edge ─────────────────────────────────────────────────────────
def axle0(t):
    """Centre line of the front-bottom bevel, standing pose (a point on it)."""
    return t["c"] + t["f"] * (T / 2 - R_EDGE) + np.array([0, 0, R_EDGE])


def rot(t, phi):
    """Rotation matrix: about the width axis, taking +z toward +f by phi."""
    f, w, z = t["f"], t["w"], np.array([0, 0, 1.0])
    # basis (f, z, w): in that frame the rotation acts on (f, z)
    B = np.stack([f, z, w], 1)
    c, s = math.cos(phi), math.sin(phi)
    Rl = np.array([[c, s, 0], [-s, c, 0], [0, 0, 1]])
    return B @ Rl @ B.T


def pose(t, phi):
    """(R, offset) so that a body point p (standing pose, world) goes to R @ (p - a0) + a0 + f·r·phi."""
    a0 = axle0(t)
    R = rot(t, phi)
    return R, a0, a0 + t["f"] * (R_EDGE * phi)


def place(t, phi, p):
    R, a0, a1 = pose(t, phi)
    return R @ (np.asarray(p) - a0) + a1


def top_front_edge(t):
    """Centre line of the top-front bevel (two ends, standing pose)."""
    base = t["c"] + t["f"] * (T / 2 - R_EDGE) + np.array([0, 0, H - R_EDGE])
    hw = W / 2 - R_CORNER * 0.55
    return [base + t["w"] * hw, base - t["w"] * hw]


def back_plane(t, phi):
    """Back face of a tile at tilt phi: (point, outward normal)."""
    p = t["c"] - t["f"] * (T / 2) + np.array([0, 0, H / 2])
    n = -t["f"]
    R, _, _ = pose(t, phi)
    return place(t, phi, p), R @ n


def gap(i, phi_i, phi_next):
    """Clearance between the top-front edge of tile i and the back face of tile i+1 (negative = overlap)."""
    a, b = TILES[i], TILES[i + 1]
    q, n = back_plane(b, phi_next)
    return min(float(np.dot(place(a, phi_i, e) - q, n)) for e in top_front_edge(a)) - R_EDGE


def _place_v(t, phis, p):
    """place() for an array of tilts (vectorised)."""
    f, w, z = t["f"], t["w"], np.array([0, 0, 1.0])
    a0 = axle0(t)
    d = np.asarray(p) - a0
    df, dz, dw = d @ f, d @ z, d @ w
    c, s = np.cos(phis), np.sin(phis)
    nf, nz = df * c + dz * s, -df * s + dz * c
    return a0 + np.outer(nf + R_EDGE * phis, f) + np.outer(nz, z) + dw * w


def _rotn_v(t, phis, n):
    f, z, w = t["f"], np.array([0, 0, 1.0]), t["w"]
    nf, nz, nw = n @ f, n @ z, n @ w
    c, s = np.cos(phis), np.sin(phis)
    return np.outer(nf * c + nz * s, f) + np.outer(-nf * s + nz * c, z) + nw * w


def contact_table(i, grid):
    """phi_i resting on tile i+1, for every phi_next in grid (vectorised bisection on the clearance)."""
    a, b = TILES[i], TILES[i + 1]
    grid = np.asarray(grid, float)
    q = _place_v(b, grid, b["c"] - b["f"] * (T / 2) + np.array([0, 0, H / 2]))
    n = _rotn_v(b, grid, -b["f"])

    def g(ph):
        return np.min([np.sum((_place_v(a, ph, e) - q) * n, 1) for e in top_front_edge(a)], 0) - R_EDGE
    lo, hi = np.zeros_like(grid), np.full_like(grid, math.radians(89.5))
    for _ in range(50):
        mid = 0.5 * (lo + hi)
        pos = g(mid) > 0
        lo, hi = np.where(pos, mid, lo), np.where(pos, hi, mid)
    out = 0.5 * (lo + hi)
    out[g(np.zeros_like(grid)) <= 0] = 0.0
    return out


def com_height(phi):
    """Height of the centre of mass of a rolling tile."""
    return R_EDGE + (T / 2 - R_EDGE) * math.sin(phi) + (H / 2 - R_EDGE) * math.cos(phi)


def tile_json(t):
    """Per-tile frame for three.js (Blender → three axes: x, z, −y)."""
    b2t = lambda v: [round(float(v[0]), 7), round(float(v[2]), 7), round(float(-v[1]), 7)]
    return {"c": b2t(t["c"]), "f": b2t(t["f"]), "w": b2t(t["w"]), "axle": b2t(axle0(t))}
