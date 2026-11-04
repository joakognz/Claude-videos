"""Pre-computed surface maps for the Cycles plates (numpy only, deterministic).

public/plates_src/nogal_col.png     walnut tabletop colour (sRGB), 8192 px over 0.82 m  (~10 texels per mm)
public/plates_src/nogal_poro.png    pores + grain relief (height, linear): open pores read as tiny dashes under the varnish
public/plates_src/nogal_rug.png     varnish wear: satin roughness variation, wipe marks, a few fine scratches (linear)
public/plates_src/ficha_marcas.png  tile surface: R fingerprints/smudges · G micro-scratches · B dust specks (linear, 4096 px)

Run: python scripts/make_textures.py
"""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "plates_src")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def smooth_noise(shape, cell, octaves=4, seed=0):
    """Fractal value noise (bilinear upsampled lattices)."""
    r = np.random.default_rng(seed)
    h, w = shape
    out = np.zeros(shape, np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        c = max(2, int(cell / (2 ** o)))
        gh, gw = h // c + 2, w // c + 2
        g = r.standard_normal((gh, gw)).astype(np.float32)
        yy = np.arange(h, dtype=np.float32) / c
        xx = np.arange(w, dtype=np.float32) / c
        y0, x0 = yy.astype(int), xx.astype(int)
        fy, fx = (yy - y0)[:, None], (xx - x0)[None, :]
        fy, fx = fy * fy * (3 - 2 * fy), fx * fx * (3 - 2 * fx)
        a = g[y0][:, x0]
        b = g[y0][:, x0 + 1]
        cc = g[y0 + 1][:, x0]
        d = g[y0 + 1][:, x0 + 1]
        out += amp * ((a * (1 - fx) + b * fx) * (1 - fy) + (cc * (1 - fx) + d * fx) * fy)
        tot += amp
        amp *= 0.5
    return out / tot


def save(a, name, mode="L"):
    if mode == "L":
        Image.fromarray(np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8), "L").save(os.path.join(OUT, name), optimize=False, compress_level=3)
    else:
        Image.fromarray(np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8), "RGB").save(os.path.join(OUT, name), optimize=False, compress_level=3)


# ── walnut: grain runs along the image's vertical axis (v → the table's +Y, away from the camera) ──────────────
S = 8192
print("walnut…", flush=True)
v = np.linspace(0, 1, S, dtype=np.float32)[:, None]          # along the grain
u = np.linspace(0, 1, S, dtype=np.float32)[None, :]          # across the grain
# three flat-sawn planks glued along the grain. In each one the growth rings are coaxial cylinders around a pith
# that wanders slowly, cut by the board's face at a depth that also wanders: rings far from the pith read as straight
# stripes, where the cut grazes a ring they open into the long arches ("cathedrals") of flat-sawn walnut.
SPAN = 0.82                                                   # metres covered by the texture
bounds = [0.0, 0.305, 0.66, 1.0]
joint = np.zeros((S, 1), np.float32) + np.array([[bounds[1], bounds[2]]], np.float32)
def stretched(seed, cu, cv, oct_=3):
    """Smooth noise with ~cu features across the grain and ~cv along it (anisotropic), in [-1, 1]-ish."""
    r = np.random.default_rng(seed)
    out, amp, tot = np.zeros((S, S), np.float32), 1.0, 0.0
    for o in range(oct_):
        g = r.standard_normal((int(cv * 2 ** o) + 3, int(cu * 2 ** o) + 3)).astype(np.float32)
        out += amp * np.array(Image.fromarray(g).resize((S, S), Image.BICUBIC))
        tot += amp
        amp *= 0.5
    return out / tot


w1 = stretched(11, 26, 2.5)          # across-grain wiggle, slow along the grain
w2 = stretched(12, 90, 6)
ring = np.zeros((S, S), np.float32)
tone_p = np.zeros((S, S), np.float32)
plank = np.zeros((S, S), np.float32)
vv = v[:, 0]
for k in range(3):
    a_, b_ = bounds[k], bounds[k + 1]
    r_ = np.random.default_rng(100 + k)
    ph = r_.uniform(0, 6.3, 4)
    u0 = (a_ + b_) / 2 + 0.06 * np.sin(2 * np.pi * vv * r_.uniform(0.35, 0.7) + ph[0]) + 0.02 * np.sin(2 * np.pi * vv * 1.7 + ph[1])
    dep = 0.012 + 0.010 * (0.5 + 0.5 * np.sin(2 * np.pi * vv * r_.uniform(0.3, 0.6) + ph[2]))
    du = (u - u0[:, None]) * SPAN
    rr = np.sqrt(du ** 2 + dep[:, None] ** 2) + 0.0011 * w1 + 0.0004 * w2
    rw = r_.uniform(0.0034, 0.0046)
    m = (u >= a_) & (u < b_)
    ring = np.where(m, (rr / rw) - np.floor(rr / rw), ring)
    tone_p = np.where(m, r_.uniform(-0.06, 0.06), tone_p)
    plank = np.where(m, k, plank)
late = np.clip((ring - 0.58) / 0.42, 0, 1) ** 1.4
early = np.exp(-ring / 0.07) * 0.3
fine = smooth_noise((S // 4, S // 4), 6, 2, seed=3)
fine = np.array(Image.fromarray(fine).resize((S, S), Image.BICUBIC))
streak = stretched(4, 160, 3, 3)                               # colour streaks along the grain
broad = stretched(5, 6, 1.5, 2)                                # broad tone drift
tone = 0.56 - 0.34 * late + 0.08 * early + 0.05 * fine + 0.12 * streak + 0.08 * broad + tone_p
tone = np.clip(tone, 0, 1)
# walnut palette (sRGB): deep chocolate → warm mid brown, a hint of purple-grey in the dark latewood
dark = np.array([0.095, 0.058, 0.044], np.float32)
mid = np.array([0.29, 0.175, 0.105], np.float32)
light = np.array([0.47, 0.31, 0.18], np.float32)
t3 = tone[..., None]
col = np.where(t3 < 0.5, dark + (mid - dark) * (t3 / 0.5), mid + (light - mid) * ((t3 - 0.5) / 0.5))
col *= 0.9                                                    # dark walnut stain
# pores: short dark dashes along the grain, denser and longer in the earlywood
print("pores…", flush=True)
pores = np.zeros((S, S), np.float32)
n_p = 900000
pu = rng.integers(0, S, n_p)
pv = rng.integers(0, S, n_p)
keep = rng.uniform(0, 1, n_p) < (0.35 + 0.65 * (1 - late[pv, pu]))
pu, pv = pu[keep], pv[keep]
lens = rng.integers(3, 14, len(pu))
for k in range(14):
    m = lens > k
    vv = np.clip(pv[m] + k, 0, S - 1)
    pores[vv, pu[m]] = np.maximum(pores[vv, pu[m]], rng.uniform(0.5, 1.0, m.sum()).astype(np.float32))
pores = np.maximum(pores, np.roll(pores, 1, axis=1) * 0.6)
col *= (1 - 0.55 * pores)[..., None]
# the glue line of the joint: a hair-thin darker line
jl = np.maximum(np.exp(-((u - bounds[1]) * S / 1.2) ** 2), np.exp(-((u - bounds[2]) * S / 1.2) ** 2))
col *= (1 - 0.5 * jl)[..., None]
save(col, "nogal_col.png", "RGB")
height = np.clip(0.5 - 0.45 * pores - 0.06 * late + 0.03 * fine - 0.35 * jl, 0, 1)
save(height, "nogal_poro.png")
# varnish: satin with slightly glossier wiped areas, faint circular buffing marks, a few hairline scratches
print("varnish…", flush=True)
rough = 0.5 + 0.18 * np.array(Image.fromarray(smooth_noise((S // 16, S // 16), 20, 3, seed=5)).resize((S, S), Image.BICUBIC))
yy, xx = np.mgrid[0:S:8, 0:S:8].astype(np.float32)
swirl = np.zeros_like(yy)
for k in range(40):
    cx, cy, rr = rng.uniform(0, S), rng.uniform(0, S), rng.uniform(150, 600)
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    swirl += 0.5 * np.exp(-((d - rr) / 6.0) ** 2) * (np.sin(np.arctan2(yy - cy, xx - cx) * rng.integers(2, 6)) > 0.3)
swirl = np.array(Image.fromarray(swirl.astype(np.float32)).resize((S, S), Image.BICUBIC))
rough += 0.12 * np.clip(swirl, 0, 1)
sc = np.zeros((S, S), np.float32)
for k in range(260):
    x0, y0 = rng.uniform(0, S, 2)
    a = rng.uniform(0, np.pi)
    L = rng.uniform(80, 900)
    t = np.linspace(0, 1, int(L))
    xs = (x0 + np.cos(a) * L * t + 6 * np.sin(t * 7 + k)).astype(int) % S
    ys = (y0 + np.sin(a) * L * t).astype(int) % S
    sc[ys, xs] = np.maximum(sc[ys, xs], rng.uniform(0.3, 1.0))
rough += 0.35 * sc
save(np.clip(rough, 0, 1), "nogal_rug.png")

# ── tile marks (box-projected on every tile, offset per tile) ─────────────────────────────────────────────────
print("tile marks…", flush=True)
M = 4096
yy, xx = np.mgrid[0:M, 0:M].astype(np.float32)
fp = np.zeros((M, M), np.float32)
for k in range(26):  # fingerprints: concentric ridges in an oval, faded at the edges
    cx, cy = rng.uniform(0, M, 2)
    rx, ry = rng.uniform(70, 130), rng.uniform(100, 170)
    a = rng.uniform(0, np.pi)
    dx, dy = xx - cx, yy - cy
    x1 = dx * np.cos(a) + dy * np.sin(a)
    y1 = -dx * np.sin(a) + dy * np.cos(a)
    rr = np.sqrt((x1 / rx) ** 2 + (y1 / ry) ** 2)
    m = rr < 1.3
    if not m.any():
        continue
    ridges = 0.5 + 0.5 * np.sin(rr * 2 * np.pi * rng.uniform(10, 15) + 2.0 * np.sin(x1 / 23.0))
    fp = np.maximum(fp, np.where(m, ridges * np.clip(1.25 - rr, 0, 1) * rng.uniform(0.4, 1.0), 0))
smudge = np.clip(0.5 + 0.9 * smooth_noise((M, M), 220, 4, seed=9), 0, 1) ** 3
fpm = np.clip(fp * 0.9 + 0.35 * smudge, 0, 1)
scr = np.zeros((M, M), np.float32)
for k in range(1600):  # micro-scratches: short, mostly straight, a few curved, in families of directions
    x0, y0 = rng.uniform(0, M, 2)
    a = rng.choice([0.3, 1.1, 2.4]) + rng.normal(0, 0.25)
    L = rng.uniform(20, 260)
    t = np.linspace(0, 1, int(L * 1.5))
    bend = rng.normal(0, 0.15)
    xs = (x0 + np.cos(a + bend * t) * L * t).astype(int) % M
    ys = (y0 + np.sin(a + bend * t) * L * t).astype(int) % M
    scr[ys, xs] = np.maximum(scr[ys, xs], rng.uniform(0.25, 1.0))
scr = np.maximum(scr, 0.5 * np.roll(scr, 1, axis=0))
dust = np.zeros((M, M), np.float32)
nd = 5000
dx_, dy_ = rng.integers(0, M, nd), rng.integers(0, M, nd)
dust[dy_, dx_] = rng.uniform(0.4, 1.0, nd)
dust = np.maximum.reduce([dust, np.roll(dust, 1, 0), np.roll(dust, 1, 1), np.roll(np.roll(dust, 1, 0), 1, 1) * 0.7])
save(np.stack([fpm, scr, dust], -1), "ficha_marcas.png", "RGB")
print("textures written to", OUT)
