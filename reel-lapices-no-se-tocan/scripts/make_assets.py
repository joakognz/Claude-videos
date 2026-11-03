"""Pre-computes every texture as PNG (no procedural filters at render time).

  public/assets/grain_<k>.png      film grain tiles (540x960, scaled 2x on screen)
  public/assets/wood_color.png     cedar of the sharpened cone: long fibres + growth-ring streaks
  public/assets/wood_bump.png      fibres + the fine concentric ridges a sharpener blade leaves
  public/assets/graphite_bump.png  graphite: fine scratches along the axis + a little sparkle
  public/assets/graphite_rough.png roughness variation for the graphite

Texture space: u = around the pencil (0..1), v = along it from the tip (1 = 1.2 world units).
Run: python scripts/make_assets.py
"""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, gaussian_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(ROOT, "public", "assets")
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(3)
for k in range(8):
    g = rng.normal(128, 46, (960, 540)).clip(0, 255).astype(np.uint8)
    Image.fromarray(g, "L").save(os.path.join(out, f"grain_{k}.png"), optimize=True)

W, H = 2048, 1024  # u (around) x v (along)
u = np.linspace(0, 1, W, endpoint=False)[None, :]
v = np.linspace(0, 1, H, endpoint=False)[:, None]


def wrap_noise(w, h, sx, sy, seed):
    """Smooth noise that tiles around u."""
    r = np.random.default_rng(seed).standard_normal((h, w))
    r = gaussian_filter(r, (sy, sx), mode="wrap")
    return (r - r.mean()) / (r.std() + 1e-9)


# cedar fibres: noise stretched along the axis, warped a little
fib = wrap_noise(W, H, 1.6, 60, 11)
warp = wrap_noise(W, H, 40, 120, 12) * 2.5
cols = (np.arange(W)[None, :] + warp).astype(int) % W
fibres = np.take_along_axis(fib, cols, axis=1)
# growth rings cut by the cone: broad soft bands that sweep across u
rings = np.sin(2 * np.pi * (u * 9 + v * 2.2 + wrap_noise(W, H, 60, 60, 13) * 0.25))
rings = gaussian_filter(np.clip(rings, -1, 1), (2, 2), mode="wrap")
flecks = gaussian_filter((np.random.default_rng(14).random((H, W)) > 0.99975).astype(float), 1.2, mode="wrap") * 6
shade = 0.86 + 0.06 * fibres + 0.07 * rings - 0.25 * np.clip(flecks, 0, 1)
base = np.array([226, 168, 112]) / 255.0  # cedar
dark = np.array([170, 108, 62]) / 255.0
t = np.clip((1 - shade) * 3.0, 0, 1)[..., None]
col = (base * (1 - t) + dark * t) * np.clip(shade, 0.6, 1.1)[..., None]
Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8), "RGB").save(os.path.join(out, "wood_color.png"), optimize=True)

# bump: fibres + sharpener ridges (concentric around the axis = constant v), ~150 per texture height
ridges = np.sin(2 * np.pi * v * 150 + wrap_noise(W, H, 200, 4, 15) * 0.6) * 0.35
bump = 0.5 + 0.18 * fibres + 0.12 * ridges + 0.05 * rings
Image.fromarray((np.clip(bump, 0, 1) * 255).astype(np.uint8), "L").save(os.path.join(out, "wood_bump.png"), optimize=True)

# graphite: fine axial scratches + sparkle
scr = wrap_noise(W, H, 0.8, 90, 21)
spark = (np.random.default_rng(22).random((H, W)) > 0.996).astype(float)
gb = 0.5 + 0.22 * scr + 0.25 * gaussian_filter(spark, 0.6, mode="wrap")
Image.fromarray((np.clip(gb, 0, 1) * 255).astype(np.uint8), "L").save(os.path.join(out, "graphite_bump.png"), optimize=True)
gr = 0.42 + 0.12 * wrap_noise(W, H, 3, 50, 23) - 0.2 * gaussian_filter(spark, 0.8, mode="wrap")
Image.fromarray((np.clip(gr, 0, 1) * 255).astype(np.uint8), "L").save(os.path.join(out, "graphite_rough.png"), optimize=True)
print("assets in", out)
