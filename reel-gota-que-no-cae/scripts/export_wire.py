"""The freeze pose of the countdown as wire for the three.js layer (called by blender_gota.py --export-wire).

Same numbers as the plates: the tap from the same dimensions, the water shapes from the same frame of
data/gota_frames.npz, the same camera. Edges are written as explicit line segments (quads, never triangle
diagonals), so no EdgesGeometry rounding is involved; occluders (black fills for hidden lines) as small
triangle meshes. Axes: Blender (x, y, z) → three.js (x, z, −y). Metres.

Writes src/wire.json: {parts: {name: {lines: [x0,y0,z0, x1,y1,z1, …], tris: {p: […], i: […]}}}, anchors: {…}}
"""
import json, math, os
import numpy as np


def t3(p):
    return [p[0], p[2], -p[1]]


class Part:
    def __init__(self):
        self.lines, self.tp, self.ti = [], [], []

    def seg(self, a, b):
        self.lines += t3(a) + t3(b)

    def strip(self, pts, closed=False):
        for k in range(len(pts) - 1 + (1 if closed else 0)):
            self.seg(pts[k], pts[(k + 1) % len(pts)])

    def tri_grid(self, grid, closed_u=True):
        """Occluder from a (rows, cols, 3) grid of points."""
        rows, cols = grid.shape[:2]
        base = len(self.tp) // 3
        for p in grid.reshape(-1, 3):
            self.tp += t3(p)
        cu = cols if closed_u else cols - 1
        for r in range(rows - 1):
            for c in range(cu):
                a = base + r * cols + c
                b = base + r * cols + (c + 1) % cols
                d = base + (r + 1) * cols + c
                e = base + (r + 1) * cols + (c + 1) % cols
                self.ti += [a, b, e, a, e, d]

    def out(self):
        return {"lines": [round(v, 6) for v in self.lines], "tris": {"p": [round(v, 6) for v in self.tp], "i": self.ti}}


def lathe_grid(prof, n, cx=0.0, cy=0.0):
    th = np.linspace(0, 2 * np.pi, n, endpoint=False)
    return np.array([[(cx + r * math.cos(t), cy + r * math.sin(t), z) for t in th] for r, z in prof])


def lathe_wire(part, prof, n_mer, ring_idx, n_ring=96):
    """Rings at the chosen profile rows, meridians along the whole profile."""
    prof = np.asarray(prof)
    for k in ring_idx:
        r, z = prof[k]
        if r > 1e-7:
            part.strip([(r * math.cos(t), r * math.sin(t), z) for t in np.linspace(0, 2 * np.pi, n_ring, endpoint=False)], closed=True)
    for t in np.linspace(0, 2 * np.pi, n_mer, endpoint=False):
        part.strip([(r * math.cos(t), r * math.sin(t), z) for r, z in prof])


def run(bpy, sc, FREEZE, ROOT, C):
    from mathutils import Vector
    from mathutils.geometry import interpolate_bezier
    MM = 0.001
    GF = np.load(os.path.join(ROOT, "data", "gota_frames.npz"))
    TL = json.load(open(os.path.join(ROOT, "src", "timeline-gota.json")))
    HM = TL["hMouth"]
    parts = {k: Part() for k in ("grifo", "gota", "sat", "resto", "agua_borde")}
    g = parts["grifo"]
    # housing
    hprof = [(C["R_OPEN"], C["HM"] + 0.4 * MM), (C["R_OPEN"], C["Z_LIP"]), (C["R_OUT"] - 0.55 * MM, C["Z_LIP"]),
             (C["R_OUT"], C["Z_LIP"] + 0.55 * MM), (C["R_OUT"], C["zk0"]), (C["R_OUT"], C["zk1"]), (C["R_OUT"], C["Z_TOP"] - 0.4 * MM),
             (C["R_OUT"] - 0.4 * MM, C["Z_TOP"]), (C["R_MAJ"], C["Z_TOP"])]
    lathe_wire(g, hprof, 24, range(len(hprof)), 120)
    for t in np.linspace(0, 2 * np.pi, 96, endpoint=False):                       # knurl
        g.seg((C["R_OUT"] * math.cos(t), C["R_OUT"] * math.sin(t), C["zk0"]), (C["R_OUT"] * math.cos(t), C["R_OUT"] * math.sin(t), C["zk1"]))
    g.tri_grid(lathe_grid([(C["R_OUT"] * 0.995, C["Z_LIP"]), (C["R_OUT"] * 0.995, C["Z_TOP"])], 48))
    g.tri_grid(lathe_grid([(0.0, C["HM"]), (C["R_OUT"] * 0.995, C["Z_LIP"] + 0.01 * MM)], 48))
    # screen: rim and two rings of holes as small circles
    g.strip([((C["R_OPEN"]) * math.cos(t), (C["R_OPEN"]) * math.sin(t), C["HM"]) for t in np.linspace(0, 2 * np.pi, 96, endpoint=False)], True)
    for rr, n in ((4.2 * MM, 14), (6.3 * MM, 20), (8.2 * MM, 26)):
        for t in np.linspace(0, 2 * np.pi, n, endpoint=False):
            cx, cy = rr * math.cos(t), rr * math.sin(t)
            g.strip([(cx + 0.34 * MM * math.cos(a), cy + 0.34 * MM * math.sin(a), C["HM"]) for a in np.linspace(0, 2 * np.pi, 10, endpoint=False)], True)
    # gasket
    gp = [(C["R_MAJ"] + 0.75 * MM, C["Z_TOP"]), (C["R_MAJ"] + 0.95 * MM, C["Z_TOP"] + C["GASKET_T"] * 0.5), (C["R_MAJ"] + 0.75 * MM, C["Z_TOP"] + C["GASKET_T"])]
    lathe_wire(g, gp, 0, range(3), 120)
    # thread: the helix (crest) and the root
    for rr, off in ((C["R_MAJ"], 0.0), (C["R_MAJ"] - C["T_DEPTH"], 0.5)):
        pts = []
        z0, z1 = C["z_t0"] + 0.2 * MM, C["z_t1"]
        n = int((z1 - z0) / C["PITCH"] * 120)
        for k in range(n + 1):
            z = z0 + (z1 - z0) * k / n
            a = 2 * math.pi * ((z / C["PITCH"]) - off)
            pts.append((rr * math.cos(a), rr * math.sin(a), z))
        g.strip(pts)
    g.tri_grid(lathe_grid([(C["R_MAJ"] - C["T_DEPTH"], C["Z_TOP"]), (C["R_MAJ"] - C["T_DEPTH"], C["z_t1"] + 1.0 * MM)], 48))
    # spout: rings perpendicular to the swept path + 16 longitudinal lines
    bez = C["SPOUT_BEZ"]
    path = []
    for (p0, h0), (h1, p1) in zip([(b[0], b[2]) for b in bez[:-1]], [(b[1], b[0]) for b in bez[1:]]):
        seg = interpolate_bezier(Vector(p0), Vector(h0), Vector(h1), Vector(p1), 18)
        path += [tuple(v) for v in (seg if not path else seg[1:])]
    path = np.array(path)
    R = C["R_TUBE"]
    rings = []
    up = np.array([1.0, 0, 0])
    for k in range(len(path)):
        tng = path[min(k + 1, len(path) - 1)] - path[max(k - 1, 0)]
        tng /= np.linalg.norm(tng)
        u = up - tng * np.dot(up, tng)
        u /= np.linalg.norm(u)
        v = np.cross(tng, u)
        rings.append([path[k] + R * (math.cos(a) * u + math.sin(a) * v) for a in np.linspace(0, 2 * np.pi, 32, endpoint=False)])
    rings = np.array(rings)
    for k in range(0, len(rings), 2):
        g.strip(list(rings[k]), closed=True)
    for j in range(0, 32, 2):
        g.strip(list(rings[:, j]))
    g.tri_grid(rings * 0.999 + path[:, None, :] * 0.001)
    # what stays on the tap (remnant), freeze shape
    pr = GF["prof"][FREEZE]
    rp = [(r, HM - d) for r, d in pr]
    sel = list(np.linspace(0, len(rp) - 1, 11).astype(int))
    lathe_wire(parts["resto"], [rp[k] for k in sel], 24, range(len(sel)), 72)
    parts["resto"].tri_grid(lathe_grid([rp[k] for k in sel], 24))
    # the drop and the satellite at the freeze
    th, R_ = GF["theta"], GF["dropR"][FREEZE]
    zc = float(GF["dropZ"][FREEZE])
    dprof = [(R_[k] * math.sin(th[k]), zc + R_[k] * math.cos(th[k])) for k in range(len(th))]
    sel = list(np.linspace(0, len(dprof) - 1, 15).astype(int))
    dsel = [dprof[k] for k in sel]
    lathe_wire(parts["gota"], dsel, 24, range(1, len(dsel) - 1), 72)
    parts["gota"].tri_grid(lathe_grid(dsel, 24))
    s = GF["sat"][FREEZE]
    sprof = [(s[2] * math.sin(a), s[1] + s[3] * math.cos(a)) for a in np.linspace(0, math.pi, 7)]
    lathe_wire(parts["sat"], sprof, 10, range(1, 6), 24)
    parts["sat"].tri_grid(lathe_grid(sprof, 10))
    # far rim of the basin: its wet edge and its waterline
    b = parts["agua_borde"]
    for z in (0.0, C["RIM_H"]):
        b.strip([(x, C["FAR_Y"], z) for x in np.linspace(-0.12, 0.12, 60)])
    out = {"parts": {k: v.out() for k, v in parts.items()},
           "anchors": {"remnantTip": t3((0, 0, HM - pr[-1, 1])), "remnantSide": t3((float(pr[len(pr) // 2, 0]), 0, HM - float(pr[len(pr) // 2, 1]))),
                       "dropCenter": t3((0, 0, zc)), "dropBottom": t3((0, 0, zc - float(R_[-1]))), "dropSide": t3((float(np.max(R_ * np.sin(th))), 0, zc)),
                       "water": t3((0, 0, float(GF["under"][FREEZE]))), "sat": t3((0, 0, float(s[1]))), "mouth": t3((0, 0, HM))}}
    json.dump(out, open(os.path.join(ROOT, "src", "wire.json"), "w"))
    n_seg = {k: len(v.lines) // 6 for k, v in parts.items()}
    print("wire.json written:", n_seg, flush=True)
