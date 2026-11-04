"""Pre-computed surface maps (tileable, 2048²), so the shaders read a texture instead of evaluating noise stacks:

  public/plates_src/latón.png   R: dried water spots (mineral rings, the way drops dry on a tap)
                                G: tarnish mottling (slow, blotchy)       B: fine polishing scratches / wear
  public/plates_src/cal.png     limescale crust height (porous, cauliflower-like)

Run: python scripts/make_textures.py
"""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "plates_src")
os.makedirs(OUT, exist_ok=True)
N = 2048
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:N, 0:N].astype(np.float32) / N


def fbm(octaves, base, seed, persistence=0.55):
    """Tileable fractal noise from random Fourier modes."""
    r = np.random.default_rng(seed)
    out = np.zeros((N, N), np.float32)
    amp = 1.0
    for o in range(octaves):
        f = base * 2 ** o
        for _ in range(6):
            kx, ky = r.integers(-f, f + 1, 2)
            if kx == 0 and ky == 0:
                continue
            out += amp * np.cos(2 * np.pi * (kx * xx + ky * yy) + r.uniform(0, 2 * np.pi)).astype(np.float32)
        amp *= persistence
    out -= out.min()
    return out / out.max()


def torus_d(cx, cy):
    dx = np.abs(xx - cx)
    dy = np.abs(yy - cy)
    dx = np.minimum(dx, 1 - dx)
    dy = np.minimum(dy, 1 - dy)
    return np.sqrt(dx * dx + dy * dy)


# water spots: rings of minerals with a faint fill, a few overlapping; edges slightly irregular
spots = np.zeros((N, N), np.float32)
wob = fbm(4, 6, 11)
fbm_w = fbm(5, 20, 12)
for k in range(70):
    cx, cy = rng.uniform(0, 1, 2)
    rad = rng.uniform(0.003, 0.018)
    d = torus_d(cx, cy) * (1 + 0.9 * (wob - 0.5)) * (1 + 0.5 * (fbm_w - 0.5))
    ring = np.exp(-((d - rad) / (rad * 0.2 + 0.0008)) ** 2) * (0.35 + 0.65 * fbm_w)
    fill = np.exp(-(d / rad) ** 4) * 0.35 * fbm_w
    spots = np.maximum(spots, (ring * rng.uniform(0.5, 1.0) + fill) * (d < rad * 1.4))
tarnish = fbm(5, 3, 21) * 0.75 + fbm(3, 14, 22) * 0.25
# scratches: thin random straight lines (polishing / cleaning marks)
scr = np.zeros((N, N), np.float32)
for k in range(260):
    x0, y0 = rng.uniform(0, 1, 2)
    ang = rng.normal(0.3, 0.5)
    L = rng.uniform(0.02, 0.12)
    t = np.linspace(0, L, int(L * N * 1.5))
    px = ((x0 + t * np.cos(ang)) % 1 * N).astype(int)
    py = ((y0 + t * np.sin(ang)) % 1 * N).astype(int)
    scr[py, px] = np.maximum(scr[py, px], rng.uniform(0.3, 1.0))
img = np.stack([spots, tarnish, scr], -1)
Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8), "RGB").save(os.path.join(OUT, "laton.png"))

# limescale: bumpy, porous deposit
cal = fbm(6, 8, 31, 0.6) ** 1.6 * 0.7 + fbm(4, 40, 32) * 0.3
pores = (fbm(3, 70, 33) > 0.78) * 0.25
cal = np.clip(cal - pores, 0, 1)
Image.fromarray((cal * 255).astype(np.uint8), "L").save(os.path.join(OUT, "cal.png"))
print("textures in", OUT)
