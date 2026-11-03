"""Pre-computed grime for the metal (box-projected in Blender): fingerprints, wipe streaks, oxidation blotches.

public/plates_src/huellas.png  R = smudge/fingerprint (raises roughness, dulls the shine)
                                G = oxidation / tarnish blotches (darkens and warms the brass)
                                B = fine dust & micro-scratches
Run: python scripts/make_metal_textures.py
"""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "plates_src")
os.makedirs(OUT, exist_ok=True)
S = 2048
rng = np.random.default_rng(21)
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)


def blobs(n, smin, smax, sigma):
    a = np.zeros((S, S), np.float32)
    for _ in range(n):
        cx, cy = rng.uniform(0, S, 2)
        sx, sy = rng.uniform(smin, smax, 2)
        th = rng.uniform(0, np.pi)
        dx, dy = xx - cx, yy - cy
        u = (dx * np.cos(th) + dy * np.sin(th)) / sx
        v = (-dx * np.sin(th) + dy * np.cos(th)) / sy
        a += np.exp(-(u * u + v * v)) * rng.uniform(0.4, 1.0)
    return gaussian_filter(a, sigma)


def noise(sig, seed):
    r = np.random.default_rng(seed).standard_normal((S, S)).astype(np.float32)
    r = gaussian_filter(r, sig, mode="wrap")
    return (r - r.mean()) / (r.std() + 1e-9)


# fingerprints: whorls of ridges inside soft oval masks, plus wipe streaks
smudge = np.zeros((S, S), np.float32)
for _ in range(7):
    cx, cy = rng.uniform(150, S - 150, 2)
    sx, sy = rng.uniform(90, 160), rng.uniform(120, 210)
    th = rng.uniform(0, np.pi)
    dx, dy = xx - cx, yy - cy
    u = (dx * np.cos(th) + dy * np.sin(th)) / sx
    v = (-dx * np.sin(th) + dy * np.cos(th)) / sy
    rr = np.sqrt(u * u + v * v)
    mask = np.clip(1 - rr, 0, 1) ** 0.7
    ridges = 0.5 + 0.5 * np.sin(rr * rng.uniform(55, 75) + 0.6 * noise(6, rng.integers(1e6)))
    smudge += mask * (0.35 + 0.65 * ridges) * rng.uniform(0.5, 1.0)
streaks = gaussian_filter(rng.standard_normal((S, S)).astype(np.float32), (2, 60))
streaks = np.clip((streaks - 0.02) * 30, 0, 1) * np.clip(blobs(5, 200, 500, 30) * 2, 0, 1)
smudge = np.clip(smudge * 0.8 + streaks * 0.5 + 0.12 * np.clip(noise(40, 3), 0, None), 0, 1)
# oxidation: patchy, with a fine mottle
ox = np.clip(blobs(18, 60, 260, 25) * 0.9 + 0.25 * noise(12, 4) + 0.15 * noise(3, 5) - 0.25, 0, 1)
# dust & micro scratches
dust = (rng.random((S, S)) > 0.9985).astype(np.float32)
dust = gaussian_filter(dust, 0.9) * 6
scr = np.zeros((S, S), np.float32)
for _ in range(70):
    x0, y0 = rng.uniform(0, S, 2)
    ang = rng.uniform(0, np.pi)
    L = rng.uniform(12, 110)
    t = np.linspace(0, 1, int(L))
    px = (x0 + np.cos(ang) * L * t).astype(int) % S
    py = (y0 + np.sin(ang) * L * t).astype(int) % S
    scr[py, px] = rng.uniform(0.3, 1.0)
scr = gaussian_filter(scr, 0.6) * 1.4
img = np.stack([smudge, ox, np.clip(dust + scr, 0, 1)], -1)
Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8), "RGB").save(os.path.join(OUT, "huellas.png"))
print("written", os.path.join(OUT, "huellas.png"))
