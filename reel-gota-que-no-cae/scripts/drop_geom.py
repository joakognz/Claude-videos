"""Analytic water: every shape the drop takes, from the frame-by-frame numbers in build.py.

No fluid simulation. The shapes come from physics written as formulas:
  · hanging drop (growth): Young–Laplace pendant profiles, pinned on a contact circle of radius R_CONTACT
    under the aerator screen (dφ/ds = 2b − z − sinφ/x in capillary-length units), one per volume
  · necking: the last static profile, its bulb pulled down and its neck thinned to zero (r_min ∝ (1 − p)^0.6,
    the inviscid pinch-off law), the pinch slightly on the bulb side so a thread stays on the faucet
  · free drop: the shape it had at pinch-off, decomposed into Legendre modes and left to oscillate at the
    Rayleigh frequencies ω_l² = l(l−1)(l+2)·γ/(ρR³) — it leaves prolate with a pointed top and, by
    construction of the timeline, it is caught mid-oscillation, oblate, on the freeze
  · satellite: the thread snaps back into a small drop that trails the big one
  · remnant: what stays on the faucet, a small pendant drop bouncing on its own surface tension
  · the pool: capillary ring trains from the previous drop, h(r, τ), with their exact radial slope dh/dr

All lengths in metres. Depth d is measured downward from the screen (contact plane); z is height above the water.
"""
import math
import numpy as np

GAMMA, RHO, G = 0.072, 998.0, 9.81           # N/m, kg/m³, m/s²
LC = math.sqrt(GAMMA / (RHO * G))           # capillary length (2.71 mm)
R_CONTACT = 2.4e-3                          # wetted circle under the aerator screen
M_PROF = 181                                # points along every hanging profile (contact → tip)


# ── Young–Laplace ────────────────────────────────────────────────────────────────────────────────
H_STEP = 0.0015


def _yl_paths(bs, smax=9.0):
    """Fixed-step RK4 of the pendant-drop equations for many apex curvatures at once (capillary-length units).
    Returns s (n,), x, z, phi (n, len(bs))."""
    bs = np.atleast_1d(np.asarray(bs, dtype=float))
    n = int(smax / H_STEP)
    s0 = 1e-4
    y = np.stack([np.full_like(bs, s0), bs * s0 * s0 / 2, bs * s0])
    out = np.empty((n + 1, 3, len(bs)))
    out[0] = y

    def f(y):
        x, z, phi = y
        return np.stack([np.cos(phi), np.sin(phi), 2 * bs - z - np.sin(phi) / np.maximum(x, 1e-9)])
    h = H_STEP
    for i in range(n):
        k1 = f(y)
        k2 = f(y + 0.5 * h * k1)
        k3 = f(y + 0.5 * h * k2)
        k4 = f(y + h * k3)
        y = y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        out[i + 1] = y
    s = s0 + h * np.arange(n + 1)
    return s, out[:, 0], out[:, 1], out[:, 2]


_TABLE = None


def yl_table():
    """The quasi-static family, ordered by contact height H: rows (H, V, b, s_contact) in SI units.
    Stops at the maximum volume (beyond it no static drop exists: that is where it starts to neck)."""
    global _TABLE
    if _TABLE is not None:
        return _TABLE
    rc = R_CONTACT / LC
    bs = np.concatenate([np.linspace(0.6, 1.285, 50), np.linspace(1.285, 1.335, 260), np.linspace(1.335, 1.40, 60)])
    s, X, Z, PHI = _yl_paths(bs)
    pts = []
    for j, b in enumerate(bs):
        x, z, phi = X[:, j], Z[:, j], PHI[:, j]
        end = int(np.argmax(phi >= math.pi)) if (phi >= math.pi).any() else len(phi) - 1
        d = x[:end] - rc
        for i in np.where(np.sign(d[:-1]) != np.sign(d[1:]))[0][:3]:
            w = d[i] / (d[i] - d[i + 1])
            sc = s[i] + w * (s[i + 1] - s[i])
            H = z[i] + w * (z[i + 1] - z[i])
            V = np.trapezoid(np.pi * x[:i + 1] ** 2, z[:i + 1])
            pts.append((H * LC, V * LC ** 3, b, sc))
    pts = np.array(sorted(pts))
    k = int(np.argmax(pts[:, 1]))
    pts = pts[: k + 1]
    keep = [0]
    for i in range(1, len(pts)):
        if pts[i, 1] > pts[keep[-1], 1] + 1e-12 and pts[i, 0] > pts[keep[-1], 0]:
            keep.append(i)
    _TABLE = pts[keep]
    return _TABLE


def V_MAX():
    return float(yl_table()[-1, 1])


def _resample(r, d, n=M_PROF, tip_bias=1.6):
    """Resample a profile (contact → tip) to n points by arc length, denser toward the tip."""
    seg = np.hypot(np.diff(r), np.diff(d))
    s = np.concatenate([[0], np.cumsum(seg)])
    u = np.linspace(0, 1, n)
    u = 1 - (1 - u) ** tip_bias if tip_bias != 1 else u
    # keep both ends dense: blend a symmetric sine spacing with the tip bias
    u = 0.5 * u + 0.5 * (0.5 - 0.5 * np.cos(np.pi * np.linspace(0, 1, n)))
    st = u * s[-1]
    return np.interp(st, s, r), np.interp(st, s, d)


def static_profile(V):
    """Hanging drop of volume V (m³): (r, d) from the contact circle (d = 0) to the tip, M_PROF points."""
    T = yl_table()
    V = min(V, T[-1, 1])
    i = int(np.clip(np.searchsorted(T[:, 1], V), 1, len(T) - 1))
    w = (V - T[i - 1, 1]) / (T[i, 1] - T[i - 1, 1])
    b = T[i - 1, 2] + w * (T[i, 2] - T[i - 1, 2])
    sc = T[i - 1, 3] + w * (T[i, 3] - T[i - 1, 3])
    sp, X, Z, _ = _yl_paths([b], smax=sc + 0.01)
    m = sp <= sc
    x = np.append(X[m, 0], np.interp(sc, sp, X[:, 0]))
    z = np.append(Z[m, 0], np.interp(sc, sp, Z[:, 0]))
    x[0] = 0.0
    H = z[-1]
    r = (x * LC)[::-1]
    d = ((H - z) * LC)[::-1]
    r[0] = R_CONTACT
    return _resample(r, d)


def wobble(r, d, delta):
    """Volume-preserving vertical stretch (1 + delta) of a hanging drop, the contact circle kept in place."""
    H = d[-1]
    k = np.clip(d / max(H, 1e-9), 0, 1)
    return r * (1 + delta) ** (-0.5 * k), d * (1 + delta)


# ── necking and pinch-off ────────────────────────────────────────────────────────────────────────
def smax(a, b, k):
    """Polynomial smooth maximum: max(a, b) with a fillet of size k where they meet (never inflates more than k/4)."""
    m = np.maximum(a, b)
    k = np.minimum(k, np.maximum(m, 1e-12))          # no fillet where both are empty (outside the water)
    return m + np.maximum(k - np.abs(a - b), 0) ** 2 / (4 * k)


def smoothstep(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def _ellipsoid(d, c, a, e):
    q = 1 - ((d - c) / e) ** 2
    return a * np.sqrt(np.maximum(q, 0))


class Necking:
    """From the last static drop to the pinch (p = 0 … 1): the hanging drop splits into a cap that stays on the faucet
    (a smaller Young–Laplace drop), a bulb that sinks and rounds out (an ellipsoid that grows a conical top), and a
    thread between them whose bulb end thins to zero, r ∝ (1 − p)^0.6. Joined with a smooth maximum."""

    def __init__(self, V0, f_primary=0.60, f_rem=0.36):
        self.V0 = V0
        self.r0, self.d0 = static_profile(V0)
        r, d = self.r0, self.d0
        self.H0 = d[-1]
        ib = int(np.argmax(np.where(d > 0.35 * self.H0, r, 0)))
        self.d_bulge, self.r_bulge = d[ib], r[ib]
        self.Vp, self.Vr = f_primary * V0, f_rem * V0
        self.H_rem = float(np.interp(self.Vr, yl_table()[:, 1], yl_table()[:, 0]))
        # bulb ellipsoid: fits the static drop below its bulge at p = 0; at p = 1 holds the primary volume, prolate 1.2
        self.a0, self.e0, self.c0 = self.r_bulge * 0.985, self.H0 - self.d_bulge, self.d_bulge
        self.a1 = (3 * self.Vp / (4 * np.pi * 1.2)) ** (1 / 3)
        self.e1 = 1.2 * self.a1
        self.thread_len = 2.6e-3
        self.cone = 0.65e-3
        self.c1 = self.H_rem + self.thread_len + self.cone + self.e1

    def params(self, p):
        q = p ** 1.4
        a = self.a0 + (self.a1 - self.a0) * smoothstep(p * 1.3)
        e = self.e0 + (self.e1 - self.e0) * smoothstep(p * 1.3)
        c = self.c0 + (self.c1 - self.c0) * q
        Vc = self.V0 - (self.V0 - self.Vr) * smoothstep(p * 1.15)
        return a, e, c, Vc

    def shape(self, p, n=1600):
        """(r, d) dense samples at necking progress p; r → 0 at the bulb end of the thread at p = 1."""
        a, e, c, Vc = self.params(p)
        bottom = c + e
        dd = np.linspace(0, bottom, n)
        rc_, dc_ = static_profile(Vc)
        cap = np.interp(dd, dc_, rc_, right=0.0)
        bulb = _ellipsoid(dd, c, a, e)
        # conical top on the bulb as it pulls away (half-angle 38°)
        tip = c - e - self.cone * p ** 2
        cone = np.where(dd > tip, (dd - tip) * math.tan(math.radians(38)), 0.0)
        cone = np.where(dd < c - 0.5 * e, cone, 0.0)
        body = smax(bulb, cone, 0.25e-3 * (1 - 0.6 * p))
        # thread: from the cap's tip down to the cone's tip, thinnest at its bottom end
        d_top, d_bot = dc_[-1] - 0.9e-3, tip + 0.35e-3 * (1 - p)     # overlaps the cone until the very pinch
        r_neck = 1.6e-3 * (1 - p) ** 0.6
        r_mid = 1.6e-3 * (1 - 0.86 * p)                   # the thread itself (≈0.22 mm at the pinch)
        r_top = 1.9e-3 * (1 - 0.45 * p)                   # where it flares into the cap (a funnel, not a step)
        u = np.clip((dd - d_top) / max(d_bot - d_top, 1e-6), 0, 1)
        thr = r_neck + (r_mid - r_neck) * (1 - u) ** 0.7 + (r_top - r_mid) * np.maximum(0, 1 - u / 0.3) ** 2.4
        thread = np.where((dd >= d_top) & (dd <= d_bot + 1e-9), thr, 0.0)
        # the cap tapers into the thread through a short funnel (an inverted cone under its apex)
        L_f = 0.55e-3 * smoothstep((p - 0.3) / 0.4)
        funnel = np.where((dd > dc_[-1] - 0.25e-3) & (dd < dc_[-1] + L_f),
                          np.minimum(np.maximum(0, dc_[-1] + L_f - dd) * math.tan(math.radians(50)), L_f * 1.05), 0.0)
        thread = smax(thread, funnel, 0.2e-3)
        r = smax(smax(cap, thread, 0.5e-3 * (1 - 0.3 * p)), body, 0.45e-3 * (1 - p) + 1e-7)
        # at p = 0 it is exactly the static drop; the union takes over within the first 20 %
        st = np.interp(dd, self.d0, self.r0, right=0.0)
        w = smoothstep(p / 0.2)
        r = (1 - w) * st + w * r
        if p >= 1:
            k = int(np.argmin(np.abs(dd - d_bot)))
            r[k] = 0.0
        return r, dd

    def at_pinch(self):
        r, d = self.shape(1.0)
        k = int(np.argmin(np.abs(r[len(r) // 3:]))) + len(r) // 3
        return r, d, k


def legendre(lmax, x):
    P = [np.ones_like(x), x]
    for l in range(1, lmax):
        P.append(((2 * l + 1) * x * P[l] - l * P[l - 1]) / (l + 1))
    return np.array(P[: lmax + 1])


class FreeDrop:
    """The primary drop after pinch-off: Rayleigh modes released from the pinch shape."""
    LMAX = 10

    def __init__(self, rr, dd, k_pinch, extra_damp=3.0):
        # volume and centroid of the part below the pinch
        r, d = rr[k_pinch:], dd[k_pinch:]
        dV = np.pi * 0.5 * (r[1:] ** 2 + r[:-1] ** 2) * np.diff(d)
        self.V = float(dV.sum())
        dm = 0.5 * (d[1:] + d[:-1])
        self.dc = float((dV * dm).sum() / self.V)                 # centroid depth below the screen at pinch
        self.R = (3 * self.V / (4 * np.pi)) ** (1 / 3)
        # polar radius around the centroid, θ = 0 at the top
        th = np.linspace(0, np.pi, 721)
        ang = np.arctan2(r, -(d - self.dc))                        # angle from +up axis
        order = np.argsort(ang)
        rad = np.hypot(r, d - self.dc)
        R_th = np.interp(th, ang[order], rad[order])
        x = np.cos(th)
        P = legendre(self.LMAX, x)
        wts = np.sin(th)
        self.a = np.array([(2 * l + 1) / 2 * np.trapezoid(R_th / self.R * P[l] * wts, th) for l in range(self.LMAX + 1)])
        self.a[0] = 0.0      # volume handled by renormalisation
        self.a[1] = 0.0      # translation is the centroid's job
        l = np.arange(self.LMAX + 1)
        self.w = np.sqrt(np.maximum(0, l * (l - 1) * (l + 2)) * GAMMA / (RHO * self.R ** 3))
        nu = 1.0e-6
        tau = self.R ** 2 / (nu * np.maximum(1, (l - 1) * (2 * l + 1)))
        tau = tau / np.where(l >= 4, extra_damp * (l - 2), 1.0)   # the sharp pinch tip relaxes fast
        self.tau = tau

    def modes(self, T):
        return self.a * np.cos(self.w * T) * np.exp(-T / self.tau)

    def radius(self, theta, T):
        P = legendre(self.LMAX, np.cos(theta))
        m = self.modes(T)
        rr = 1 + (m[:, None] * P).sum(0)
        # renormalise the volume to V
        vol = 2 * np.pi / 3 * np.trapezoid(rr ** 3 * np.sin(theta), theta)
        return self.R * rr * (4 * np.pi / 3 / vol) ** (1 / 3)


# ── the pool: capillary ring trains from the previous drop ────────────────────────────────────────
# (speed of the packet, wavelength, amplitude at r = 10 mm, envelope width, phase) — scene time τ since its impact
PACKETS = [
    (0.230, 2.6e-3, 0.050e-3, 4.0e-3, 0.0),
    (0.175, 3.8e-3, 0.075e-3, 5.5e-3, 1.3),
    (0.125, 5.6e-3, 0.065e-3, 7.0e-3, 2.1),
    (0.085, 8.5e-3, 0.045e-3, 9.0e-3, 0.7),
]


def ripple(r, tau, packets=PACKETS, gain=1.0):
    """Surface height h (m) and slope dh/dr at radius r (m), τ seconds after the impact."""
    r = np.asarray(r, dtype=float)
    h = np.zeros_like(r)
    dh = np.zeros_like(r)
    if tau <= 0:
        return h, dh
    for c, lam, A0, w0, ph in packets:
        R = c * tau
        w = w0 + 0.12 * c * tau
        k = 2 * np.pi / lam
        cp = c / 1.5                                   # capillary waves: phase speed = 2/3 group speed
        A = gain * A0 * np.sqrt(10e-3 / (10e-3 + R)) * math.exp(-tau / 0.9)
        u = (r - R) / w
        env = np.exp(-u * u)
        arg = k * (r - cp * tau) + ph
        h += A * env * np.cos(arg)
        dh += A * (env * (-2 * u / w) * np.cos(arg) - env * k * np.sin(arg))
    return h, dh
