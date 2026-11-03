"""Pre-computes the pencils' surface textures for the Cycles plates (no procedural shading at render time).

For every texel the generator knows the real 3D point of the pencil surface it lands on (the same
geometry as scripts/blender_lapices.py), and evaluates the wood there:
  · growth rings around a pith off to the side (straight stripes on the planed faces, arcs on the cut cone),
    wobbling, swirling round a knot on the top pencil
  · fibres (long along the axis, fine across), pores, colour drift
  · drying cracks running with the grain, some starting from the cut
  · on the cut cone: lighter torn end grain, fibrous speckle, the dark glue line round the lead
  · graphite: dark, polished, fine axial scratches and pits
Outputs per pencil k: public/plates_src/col_k.jpg (sRGB), nrm_k.png (tangent-space normal, OpenGL),
orm_k.png (R roughness, G metallic, B sheen).

UV: u = φ / 2π around the pencil, v = (y / YT) ** 0.6 along it (YT = 2.2 units from the tip) — denser
near the point, where the macro ends.
Run: python scripts/make_pencil_textures.py [--size 6144]
"""
import argparse, math, os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument("--size", type=int, default=6144)
args = ap.parse_args()
W = H = args.size
OUT = os.path.join(ROOT, "public", "plates_src")
os.makedirs(OUT, exist_ok=True)

import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pencil_geom import Pencil, R_CORE, R_IN, YT, VEXP  # the same surface as the plates and the wireframe


def lattice(seed, n=96, sigma=1.6):
    r = np.random.default_rng(seed).standard_normal((n, n, n)).astype(np.float32)
    r = gaussian_filter(r, sigma, mode="wrap")
    return (r - r.mean()) / (r.std() + 1e-9)


def noise(lat, X, Y, Z, k):
    """Smooth 3D noise (≈ N(0,1)) at points scaled by k = (kx, ky, kz) lattice cells per unit."""
    n = lat.shape[0]
    c = np.stack([(X * k[0]) % n, (Y * k[1]) % n, (Z * k[2]) % n])
    return map_coordinates(lat, c, order=1, mode="grid-wrap")


def smooth(a, lo, hi):
    t = np.clip((a - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def hexcol(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255


PENCILS = [
    # pith position (scene units), knot (angle on the camera-facing face, height) or None
    dict(seed=3, pith=(0.95, -1.35), knot=(1.05, 1.25)),   # knot on the face toward the camera
    dict(seed=8, pith=(-1.2, 0.75), knot=None),
]

u = (np.arange(W, dtype=np.float32) + 0.5) / W
v = (np.arange(H, dtype=np.float32) + 0.5) / H
PHI = 2 * np.pi * u
Yrow = YT * v ** (1 / VEXP)

for k, P in enumerate(PENCILS):
    geo = Pencil(k)
    rng = np.random.default_rng(P["seed"])
    lats = [lattice(P["seed"] * 10 + i) for i in range(8)]
    col = np.zeros((H, W, 3), np.uint8)
    orm = np.zeros((H, W, 3), np.uint8)
    hgt = np.zeros((H, W), np.float32)
    # cracks along the grain: angle, start/end height, width, depth, wiggle phase
    cracks = []
    for _ in range(9):
        ya = rng.uniform(0.45, 1.4) if rng.random() < 0.5 else rng.uniform(0.7, 1.8)
        cracks.append((rng.uniform(0, 2 * np.pi), ya, ya + rng.uniform(0.25, 0.9), rng.uniform(0.0016, 0.0032),
                       rng.uniform(0.6, 1.0), rng.uniform(0, 6.28)))
    B = 128
    for r0 in range(0, H, B):
        y = np.repeat(Yrow[r0:r0 + B, None], W, axis=1).astype(np.float64)
        ph = np.repeat(PHI[None, :], y.shape[0], axis=0).astype(np.float64)
        r, region = geo.surface(ph, y)
        X, _, Z = geo.point(ph, y, r)
        lead = region == 0
        cut = region == 1
        face = region == 2
        yw = geo.y_wood(ph)
        edge_near = np.clip(1 - (y - yw) / 0.05, 0, 1) * (~lead)       # torn, fresh wood at the chipped edge
        # ── growth rings ──
        d = np.hypot(X - P["pith"][0], Z - P["pith"][1])
        d += 0.011 * noise(lats[0], X, Z, y, (5, 5, 0.7)) + 0.0035 * noise(lats[1], X, Z, y, (24, 24, 2.5))
        if P["knot"] is not None:
            ka, ky = P["knot"]
            kx, kz = R_IN * math.cos(ka), R_IN * math.sin(ka)
            kd = np.sqrt((X - kx) ** 2 + (Z - kz) ** 2 + ((y - ky) * 0.55) ** 2)
            d += 0.07 * np.exp(-kd / 0.035)
        d = d + 0.006 * np.sin(d * 37.0) + 0.003 * np.sin(d * 113.0)  # uneven ring widths
        ring = np.floor(d / 0.022)
        t = d / 0.022 - ring
        strength = 0.35 + 0.65 * np.mod(np.sin(ring * 12.9898 + k * 7.1) * 43758.5453, 1.0)  # each ring its own darkness
        late = smooth(t, 0.6, 0.76) * (1 - smooth(t, 0.84, 0.98)) * strength
        fib = noise(lats[2], X, Z, y, (180, 180, 5))
        fib2 = noise(lats[3], X, Z, y, (520, 520, 14))
        drift = noise(lats[4], X, Z, y, (3, 3, 0.9))
        pore = smooth(noise(lats[5], X, Z, y, (420, 420, 30)), 2.3, 3.0)
        # ── cracks ──
        crack = np.zeros_like(y)
        for (pc, ya, yb, w, depth, wph) in cracks:
            wig = 0.003 * np.sin(y * 9 + wph) + 0.0015 * np.sin(y * 31 + 2 * wph)
            dphi = np.mod(ph - pc + np.pi, 2 * np.pi) - np.pi
            arc = dphi * np.maximum(r, 0.02) - wig
            taper = smooth(y, ya, ya + 0.06) * (1 - smooth(y, yb - 0.12, yb))
            wloc = w * (0.55 + 0.45 * smooth(noise(lats[6], X, Z, y, (8, 8, 3)), -1, 1))
            crack = np.maximum(crack, depth * taper * np.exp(-(arc / wloc) ** 2))
        crack *= (~lead)
        # ── colour ──
        e_face, l_face = hexcol("#b8814d"), hexcol("#6a3f1f")
        e_cut, l_cut = hexcol("#d6b089"), hexcol("#9c6d46")
        c_face = e_face * (1 - 0.85 * late[..., None]) + l_face * (0.85 * late[..., None])
        c_cut = e_cut * (1 - 0.5 * late[..., None]) + l_cut * (0.5 * late[..., None])
        bright = (1 + 0.10 * fib + 0.05 * fib2 + 0.09 * drift)[..., None]
        c_face = c_face * bright
        speck = noise(lats[7], X, Z, y, (700, 700, 45))
        c_cut = c_cut * (1 + 0.07 * speck + 0.09 * fib2 + 0.05 * fib + 0.06 * drift)[..., None]
        glue = smooth(-(r - R_CORE * 1.18), -0.004, 0.0) * cut     # dark glue line where the wood meets the lead
        c_cut = c_cut * (1 - 0.45 * glue[..., None]) * (1 + 0.12 * edge_near[..., None])
        grafito = hexcol("#4b4b51") * (1 + 0.08 * noise(lats[3], X, Z, y, (700, 700, 5)) + 0.05 * drift)[..., None]
        c = np.where(lead[..., None], grafito, np.where(cut[..., None], c_cut, c_face))
        c = c * (1 - 0.5 * pore[..., None] * (~lead)[..., None])
        c = c * (1 - 0.82 * crack[..., None]) + hexcol("#1e120a") * (0.82 * crack[..., None]) * (crack[..., None] > 0)
        if P["knot"] is not None:
            km = smooth(-kd, -0.03, -0.012) * (~lead)
            c = c * (1 - 0.8 * km[..., None]) + hexcol("#3b2210") * 0.8 * km[..., None]
        col[r0:r0 + B] = (np.clip(c, 0, 1) ** (1 / 1.0) * 255 + 0.5).astype(np.uint8)
        # ── relief (world units) ──
        h = np.where(lead, 0.00005 * noise(lats[3], X, Z, y, (1800, 1800, 5)),
                     np.where(cut, 0.0005 * speck + 0.0003 * fib2 + 0.0002 * fib,
                              0.00035 * fib + 0.00018 * fib2 + 0.0003 * late))
        h -= 0.0018 * crack + 0.0004 * pore
        hgt[r0:r0 + B] = h
        # ── roughness / metallic / sheen ──
        rough = np.where(lead, 0.34 + 0.07 * np.abs(fib2), np.where(cut, 0.78 + 0.07 * speck, 0.5 + 0.06 * fib - 0.05 * late))
        rough = np.clip(rough + 0.3 * crack, 0, 1)
        metal = np.where(lead, 0.55, 0.0)
        sheen = np.where(cut, 0.9, np.where(lead, 0.0, 0.12))
        orm[r0:r0 + B] = (np.stack([rough, metal, sheen], -1) * 255 + 0.5).astype(np.uint8)
        print(f"pencil {k}: rows {r0}-{r0 + B}", end="\r", flush=True)
    # tangent-space normals from the height field, with the real texel sizes (they vary along the pencil)
    rr = np.empty((H, W), np.float32)
    for r0 in range(0, H, 512):
        yb = np.repeat(Yrow[r0:r0 + 512, None], W, axis=1).astype(np.float64)
        rr[r0:r0 + 512] = geo.surface(np.repeat(PHI[None, :], yb.shape[0], 0).astype(np.float64), yb, relief=False)[0]
    du = 2 * np.pi * np.maximum(rr, 0.006) / W               # world length of one texel around
    dv = (YT / VEXP) * (v[:, None] ** (1 / VEXP - 1)) / H   # world length of one texel along
    gx = (np.roll(hgt, -1, 1) - np.roll(hgt, 1, 1)) / (2 * du)
    gy = np.zeros_like(hgt)
    gy[1:-1] = (hgt[2:] - hgt[:-2]) / (2 * dv[1:-1])
    nz = 1 / np.sqrt(1 + gx * gx + gy * gy)
    nrm = np.stack([-gx * nz, -gy * nz, nz], -1)
    # Blender's image origin is the bottom-left corner: store with v = 0 (the tip) on the last row
    Image.fromarray(np.flipud(col)).save(os.path.join(OUT, f"col_{k}.jpg"), quality=96)
    Image.fromarray(np.flipud(((nrm * 0.5 + 0.5) * 255 + 0.5).astype(np.uint8))).save(os.path.join(OUT, f"nrm_{k}.png"), compress_level=1)
    Image.fromarray(np.flipud(orm)).save(os.path.join(OUT, f"orm_{k}.png"), compress_level=1)
    print(f"\npencil {k} textures written", flush=True)
