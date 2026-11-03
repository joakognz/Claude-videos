"""Shared geometry of the two hand-whittled pencils (numpy only — imported by the texture generator,
the Blender plates script and the wireframe exporter, so all three use exactly the same surface).

Pencil k, tip at the origin, axis +y (scene units, 1 unit = 2 cm). Surface radius along the ray at
angle φ, height y:
  · body: a hexagon with rounded edges
  · wood: whittled with a knife — the intersection of ~11 tilted planes (flat facets, sharp ridges), each
    with its own angle, slope and depth
  · the wood stops at a jagged, chipped edge Y_wood(φ) (a step down onto the lead)
  · graphite: its own 7 facets down to an off-centre, slightly blunt point; the lead cylinder above
  · relief displaced into the geometry: torn fibres along the wood, crumbly graphite
Regions: 0 graphite · 1 cut wood · 2 planed face.
"""
import math
import numpy as np

R_IN, RC = 0.17, 0.014            # hexagon inradius, edge rounding
A_IN = R_IN - RC
R_MAX = A_IN / math.cos(math.pi / 6) + RC
R_CORE = 0.055                    # lead radius (Ø 2.2 mm)
L_WOOD = 1.0                      # height where the knife cuts reach the hexagon corners
YT, VEXP = 2.2, 0.6               # texture v = (y / YT) ** VEXP

PARAMS = [dict(seed=3, jag=0.38), dict(seed=8, jag=0.34)]


def hex_round(phi):
    a = np.mod(phi + np.pi / 6, np.pi / 3) - np.pi / 6
    lo = np.zeros_like(phi, dtype=np.float64)
    hi = np.full_like(phi, R_MAX * 1.2, dtype=np.float64)
    th = A_IN * math.tan(math.pi / 6)
    for _ in range(40):
        t = (lo + hi) / 2
        x, y = t * np.cos(a), t * np.abs(np.sin(a))
        d = np.where(y <= th, x - A_IN, np.hypot(x - A_IN, y - th))
        lo = np.where(d < RC, t, lo)
        hi = np.where(d < RC, hi, t)
    return (lo + hi) / 2


# ── smooth lattice noise without scipy (Blender's Python has only numpy) ─────────────────────────
def _lattice(seed, n=64):
    r = np.random.default_rng(seed).standard_normal((n, n, n))
    for ax in range(3):  # separable binomial blur, wrapped
        r = (np.roll(r, 2, ax) + 4 * np.roll(r, 1, ax) + 6 * r + 4 * np.roll(r, -1, ax) + np.roll(r, -2, ax)) / 16
        r = (np.roll(r, 1, ax) + 2 * r + np.roll(r, -1, ax)) / 4
    return ((r - r.mean()) / (r.std() + 1e-9)).astype(np.float32)


_LAT = {}


def noise(seed, x, y, z):
    """Trilinear lattice noise ≈ N(0,1); x, y, z already in lattice cells."""
    if seed not in _LAT:
        _LAT[seed] = _lattice(seed)
    L = _LAT[seed]
    n = L.shape[0]
    xi, yi, zi = np.floor(x), np.floor(y), np.floor(z)
    fx, fy, fz = x - xi, y - yi, z - zi
    fx, fy, fz = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy), fz * fz * (3 - 2 * fz)
    xi, yi, zi = xi.astype(np.int64) % n, yi.astype(np.int64) % n, zi.astype(np.int64) % n
    x1, y1, z1 = (xi + 1) % n, (yi + 1) % n, (zi + 1) % n
    c000, c100, c010, c110 = L[xi, yi, zi], L[x1, yi, zi], L[xi, y1, zi], L[x1, y1, zi]
    c001, c101, c011, c111 = L[xi, yi, z1], L[x1, yi, z1], L[xi, y1, z1], L[x1, y1, z1]
    c00 = c000 + (c100 - c000) * fx
    c10 = c010 + (c110 - c010) * fx
    c01 = c001 + (c101 - c001) * fx
    c11 = c011 + (c111 - c011) * fx
    c0 = c00 + (c10 - c00) * fy
    c1 = c01 + (c11 - c01) * fy
    return c0 + (c1 - c0) * fz


class Pencil:
    def __init__(self, k):
        p = PARAMS[k]
        self.k = k
        self.seed = p["seed"]
        rng = np.random.default_rng(p["seed"])
        # knife facets in the wood: azimuth, slope, and the radius they leave at the chipped edge
        nw = 11
        self.w_phi = (np.arange(nw) + rng.uniform(-0.3, 0.3, nw)) * 2 * np.pi / nw + rng.uniform(0, 6.28)
        r_edge = 0.085 + rng.uniform(-0.01, 0.012, nw)            # sleeve of wood left round the lead
        y_edge = p["jag"]
        r_top = R_MAX * np.cos(np.pi / nw) * (1 + rng.uniform(-0.03, 0.03, nw))
        self.w_s = (r_top - r_edge) / (L_WOOD - y_edge) * (1 + rng.uniform(-0.1, 0.1, nw))
        self.w_c = r_edge - self.w_s * y_edge
        # graphite facets: a longer, finer point, a little off-centre
        ng = 7
        self.g_phi = (np.arange(ng) + rng.uniform(-0.25, 0.25, ng)) * 2 * np.pi / ng + rng.uniform(0, 6.28)
        self.g_s = 0.155 * (1 + rng.uniform(-0.12, 0.12, ng))
        off = rng.uniform(-0.004, 0.004, 2)
        self.g_c = 0.0035 + rng.uniform(0, 0.002, ng) + off[0] * np.cos(self.g_phi) + off[1] * np.sin(self.g_phi)
        # chipped edge where the wood stops: a few big bites plus small teeth
        self.jag = y_edge
        self.jag_a = rng.uniform(0, 6.28, 3)
        self.jag_k = np.array([2, 3, 5])
        self.jag_m = np.array([0.045, 0.03, 0.018]) * rng.uniform(0.7, 1.3, 3)

    def y_wood(self, phi):
        y = self.jag + sum(m * np.sin(k * phi + a) for m, k, a in zip(self.jag_m, self.jag_k, self.jag_a))
        teeth = 0.012 * noise(self.seed * 7 + 1, np.cos(phi) * 9 + 32, np.sin(phi) * 9 + 32, 5.0)
        return y + teeth

    def _planes(self, phi, y, ph, s, c):
        r = np.full(np.broadcast(phi, y).shape, np.inf)
        for a, si, ci in zip(ph, s, c):
            cs = np.cos(phi - a)
            r = np.where(cs > 1e-3, np.minimum(r, (ci + si * y) / np.maximum(cs, 1e-3)), r)
        return r

    def surface(self, phi, y, relief=True):
        """→ (radius, region). phi, y broadcastable arrays."""
        phi = np.asarray(phi, np.float64)
        y = np.asarray(y, np.float64)
        hexr = hex_round(np.broadcast_to(phi, np.broadcast(phi, y).shape).copy())
        rw = np.minimum(hexr, self._planes(phi, y, self.w_phi, self.w_s, self.w_c))
        rg = np.minimum(R_CORE, np.maximum(self._planes(phi, y, self.g_phi, self.g_s, self.g_c), 0))
        yw = self.y_wood(phi)
        below = y < yw                                     # wood chipped away: only the lead
        r = np.where(below, rg, np.maximum(rw, np.minimum(rg, rw)))
        cut_lead = (~below) & (rw <= R_CORE + 1e-6)        # the knife went into the lead
        region = np.where(below | cut_lead, 0, np.where(hexr <= rw + 1e-7, 2, 1))
        if relief:
            x, z = np.cos(phi) * r, -np.sin(phi) * r
            fib = noise(self.seed * 11 + 2, x * 260 + 16, z * 260 + 16, y * 9 + 16)          # torn fibres
            fib2 = noise(self.seed * 11 + 3, x * 700 + 16, z * 700 + 16, y * 30 + 16)
            crumb = noise(self.seed * 11 + 4, x * 500 + 16, z * 500 + 16, y * 140 + 16)     # crumbly lead
            d = np.where(region == 1, 0.0007 * fib + 0.00035 * fib2,
                         np.where(region == 0, 0.00014 * crumb * np.clip(y / 0.03, 0, 1), 0.0001 * fib))
            # the wood right at the chipped edge is torn and lifted
            near = np.clip(1 - (y - yw) / 0.03, 0, 1) * (~below)
            d = d + near * 0.0022 * np.abs(fib2)
            r = np.maximum(r + d, 0.0)
        return r, region

    def point(self, phi, y, r):
        """3D point (scene units, three.js axes: x, y up, z) of the surface sample."""
        return np.cos(phi) * r, y, np.sin(phi) * r
