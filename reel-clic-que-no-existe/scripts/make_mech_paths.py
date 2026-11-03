"""SVG geometry for the 2D mechanism (scenes 5–6), from the same involute generator as the 3D gears.

src/mech-gears.json:
  m            module in px
  gears[]      {id, z, r (pitch), ra (tip), rf (root), x, y, phi (direction from the new gear, rad, SVG y-down)}
  paths{z}     full outline centred on 0,0, tooth 0 pointing at +x
  tooth20      one tooth of the new gear as a wedge (centre → flank → tip → flank → centre), for building it tooth by tooth
Layout: the new gear (z = 20) sits in the middle; the three business gears are placed exactly where they would
mesh with it, so before it exists nothing transmits (that's the joke) and once it seats, everything turns.
"""
import json, math, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gear_geom import profile, radii  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = 18.0
CX, CY = 540.0, 700.0
ZN = 20
spec = [("agenda", 16, math.radians(210)), ("mensajes", 12, math.radians(-28)), ("facturas", 14, math.radians(90))]


def path(pts):
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"


rN = radii(M, ZN)
gears = [{"id": "nueva", "z": ZN, "r": rN["pitch"], "ra": rN["tip"], "rf": rN["root"], "x": CX, "y": CY, "phi": 0.0}]
for gid, z, phi in spec:
    rr = radii(M, z)
    d = rN["pitch"] + rr["pitch"]
    gears.append({"id": gid, "z": z, "r": rr["pitch"], "ra": rr["tip"], "rf": rr["root"],
                  "x": round(CX + d * math.cos(phi), 2), "y": round(CY + d * math.sin(phi), 2), "phi": phi})
paths = {}
for z in sorted({g["z"] for g in gears}):
    paths[str(z)] = path(profile(M, z, n_inv=10, n_fil=5, n_root=4, n_tip=4))
# one tooth of the new gear (angles −π/z … π/z) as a wedge from the centre
p = profile(M, ZN, n_inv=10, n_fil=5, n_root=4, n_tip=4)
a = np.arctan2(p[:, 1], p[:, 0])
half = math.pi / ZN
sel = p[np.abs(a) <= half + 1e-9]
sel = sel[np.argsort(np.arctan2(sel[:, 1], sel[:, 0]))]
tooth = path(np.vstack([[0, 0], sel]))
for g in gears:
    ext = (g["x"] - g["ra"], g["x"] + g["ra"], g["y"] - g["ra"], g["y"] + g["ra"])
    print(f'{g["id"]:9s} z={g["z"]:2d} centre ({g["x"]:.0f},{g["y"]:.0f}) x {ext[0]:.0f}..{ext[1]:.0f} y {ext[2]:.0f}..{ext[3]:.0f}')
json.dump({"m": M, "gears": gears, "paths": paths, "tooth20": tooth}, open(os.path.join(ROOT, "src", "mech-gears.json"), "w"))
