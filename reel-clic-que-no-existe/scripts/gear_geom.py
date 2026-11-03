"""Involute spur gears (numpy only) — shared by the Blender model, the wireframe and the 2D mechanism.

profile(m, z) → closed outline (x, y) in the gear's plane, centred on its axis, tooth 0 pointing at +x:
  · involute flanks (20° pressure angle) from the base circle to the tip, with a little backlash
  · radial flank below the base circle where the root is deeper than the base circle
  · root fillets (radius 0.38·m) tangent to the flank and to the root circle
  · tip corners slightly rounded
Units are whatever m is in (metres for Blender, px for SVG).
"""
import math
import numpy as np

ALPHA = math.radians(20.0)


def inv(a):
    return np.tan(a) - a


def profile(m, z, backlash=0.04, n_inv=34, n_fil=12, n_root=8, n_tip=10, tip_round=0.06):
    rp = m * z / 2
    rb = rp * math.cos(ALPHA)
    ra = rp + m
    rf = rp - 1.25 * m
    rho = 0.38 * m
    s = math.pi * m / 2 - backlash * m                      # tooth thickness at the pitch circle
    psi_b = s / (2 * rp) + inv(ALPHA)                       # half-angle of the tooth at the base circle

    def half_angle(r):
        r = np.maximum(r, rb)
        return psi_b - inv(np.arccos(np.clip(rb / r, -1, 1)))

    # flank from the base (or the fillet) to just under the tip, on the "left" side of tooth 0 (angle < 0)
    r_start = max(rb, rf + rho)
    rr = r_start + (ra - tip_round * m - r_start) * (np.linspace(0, 1, n_inv) ** 0.85)
    flank = [(r, -half_angle(r)) for r in rr]
    beta = -half_angle(r_start) if r_start >= rb else -psi_b    # angle of the radial part / fillet tangent
    # fillet: circle of radius rho tangent to the root circle and to the radial line at angle beta
    rc = rf + rho
    gamma = beta - math.asin(rho / rc)                       # centre of the fillet circle (angle)
    cx, cy = rc * math.cos(gamma), rc * math.sin(gamma)
    # tangent point on the radial line: foot of the perpendicular from the centre
    ux, uy = math.cos(beta), math.sin(beta)
    proj = cx * ux + cy * uy
    tx, ty = proj * ux, proj * uy
    a0 = math.atan2(-cy, -cx)                                # towards the root circle (radially inwards)
    a1 = math.atan2(ty - cy, tx - cx)
    da = (a1 - a0 + math.pi) % (2 * math.pi) - math.pi       # the short way round
    fil = [(cx + rho * math.cos(a0 + da * t), cy + rho * math.sin(a0 + da * t)) for t in np.linspace(0, 1, n_fil)]
    # radial segment from the fillet's tangent point up to where the involute starts
    rad = [(proj + (r_start - proj) * t, beta) for t in np.linspace(0, 1, 4)[1:-1]] if r_start - proj > 1e-9 else []
    # tip: rounded corners + an arc across the top
    psi_a = half_angle(ra - tip_round * m)
    tip = [(ra - tip_round * m * (1 - math.sin(t * math.pi / 2)), -psi_a + (psi_a * 0.12) * t) for t in np.linspace(0, 1, 4)[1:]]
    top_a = -psi_a * 0.88
    tip += [(ra, a) for a in np.linspace(top_a, -top_a, n_tip)]
    # left half of the tooth, as (x, y)
    pts = []
    root_from = -math.pi / z
    root_to = gamma
    for a in np.linspace(root_from, root_to, n_root)[:-1]:
        pts.append((rf * math.cos(a), rf * math.sin(a)))
    pts += fil
    pts += [(r * math.cos(a), r * math.sin(a)) for r, a in rad]
    pts += [(r * math.cos(a), r * math.sin(a)) for r, a in flank]
    pts += [(r * math.cos(a), r * math.sin(a)) for r, a in tip]
    left = np.array(pts)
    # mirror (y → -y) for the right half, reversed, without duplicating the tip centre
    right = left[::-1] * np.array([1, -1])
    tooth = np.vstack([left, right[1:]])
    out = []
    for k in range(z):
        th = 2 * math.pi * k / z
        c, s_ = math.cos(th), math.sin(th)
        out.append(tooth @ np.array([[c, s_], [-s_, c]]))
    poly = np.vstack(out)
    # drop near-duplicate consecutive points
    keep = np.ones(len(poly), bool)
    d = np.linalg.norm(np.diff(np.vstack([poly, poly[:1]]), axis=0), axis=1)
    keep[1:] = d[:-1] > 1e-6 * m
    return poly[keep]


def radii(m, z):
    rp = m * z / 2
    return dict(pitch=rp, base=rp * math.cos(ALPHA), tip=rp + m, root=rp - 1.25 * m)


def svg_path(m, z, cx=0.0, cy=0.0):
    p = profile(m, z, n_inv=12, n_fil=5, n_root=4, n_tip=4)
    return "M" + " L".join(f"{cx + x:.2f},{cy + y:.2f}" for x, y in p) + " Z"


if __name__ == "__main__":
    p = profile(1.0, 24)
    r = np.hypot(p[:, 0], p[:, 1])
    print(len(p), "points · r", r.min().round(3), "→", r.max().round(3), radii(1.0, 24))
