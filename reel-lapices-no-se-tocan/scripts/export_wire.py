"""Samples the shared pencil surface (scripts/pencil_geom.py) for the three.js wireframe of the reveal,
so the mesh shown on «existen» is exactly the shape that was path-traced: knife facets, the chipped
step onto the lead, the off-centre point.

Writes src/lapiz-wire.json: per pencil {phis, ys, r} (r row-major: ys × phis).
Run: python scripts/export_wire.py
"""
import json, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pencil_geom import Pencil  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = {"pencils": []}
for k in (0, 1):
    g = Pencil(k)
    phis = np.linspace(0, 2 * np.pi, 72, endpoint=False)
    ys = np.concatenate([0.9 * (np.arange(181) / 180) ** 1.5, np.linspace(0.95, 5.5, 40)])
    P, Y = np.meshgrid(phis, ys)
    r, _ = g.surface(P, Y)
    out["pencils"].append({"phis": [round(float(x), 5) for x in phis], "ys": [round(float(x), 5) for x in ys],
                           "r": [round(float(x), 5) for x in r.ravel()]})
json.dump(out, open(os.path.join(ROOT, "src", "lapiz-wire.json"), "w"))
print("wire samples:", len(out["pencils"][0]["r"]), "per pencil")
