"""Film grain tiles, pre-computed as PNG (no procedural filters at render time).

  public/assets/grain_<k>.png      film grain tiles (540x960, scaled 2x on screen)
Run: python scripts/make_assets.py
"""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(ROOT, "public", "assets")
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(3)
for k in range(8):
    g = rng.normal(128, 46, (960, 540)).clip(0, 255).astype(np.uint8)
    Image.fromarray(g, "L").save(os.path.join(out, f"grain_{k}.png"), optimize=True)
print("grain tiles written to", out)
