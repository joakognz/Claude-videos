"""Path-traced plates for the countdown: a curved chain of jumbo dominoes falling on a dark walnut table, shot like a
high-speed product macro. Everything is modelled, not painted:

  · tile: rounded slab (every edge rounded 1.3 mm, corners 3.2 mm in plan) built from a shapely-shrunk 2D outline +
    curve bevel; pips DRILLED with a countersink (exact booleans with a lathe cutter: 90°-ish countersink, straight
    hole, drill-point bottom) and filled with black paint to an irregular level (shader, per tile seed); a centre
    groove; a domed brass spinner rivet; chipped corners on three tiles (boolean bites)
  · surface: urea resin (ivory, a touch of subsurface) under a clear lacquer coat — glossy reflections, fingerprints,
    micro-scratches, dust specks, slightly worn edges (pointiness), grime in the pip rims
  · walnut tabletop: three flat-sawn planks with glued joints (8K maps from make_textures.py), open pores under a
    satin varnish that mirrors the tiles, wipe marks and hairline scratches; dust motes resting on it
Lit by big softboxes placed on the reflection of the camera rays in the tiles' faces, strips for the edges.
Physics, camera and timing come from src/timeline-fichas.json (scripts/cuenta.py).

Run:  <python-with-bpy> scripts/blender_fichas.py [--frames 0-195] [--samples 16] [--res 0.9] [--noblur]
      [--border x0,y0,x1,y1] [--out public/plates] [--export]   (--export: wire GLB of the rest pose)
      [--mask]   (frozen-frame masks for the reveal: R last tile, G other tiles, B table; then the chain parameter)
"""
import argparse, json, math, os, sys, time
import numpy as np
import bpy
import bmesh
from mathutils import Vector, Matrix
from shapely.geometry import Polygon
from shapely.geometry.polygon import orient

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cadena as CH  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--frames", default="0-195")
ap.add_argument("--samples", type=int, default=16)
ap.add_argument("--out", default=os.path.join(ROOT, "public", "plates"))
ap.add_argument("--res", type=float, default=0.9)
ap.add_argument("--noblur", action="store_true")
ap.add_argument("--export", action="store_true")
ap.add_argument("--mask", action="store_true")
ap.add_argument("--quick", action="store_true")     # plain slabs, no booleans (layout tests)
ap.add_argument("--border", default="")
ap.add_argument("--prefix", default="a_")
args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
F0, F1 = (int(v) for v in args.frames.split("-"))
TL = json.load(open(os.path.join(ROOT, "src", "timeline-fichas.json")))
TEX = os.path.join(ROOT, "public", "plates_src")
MM = 0.001
H, W, T, RE, RC = CH.H, CH.W, CH.T, CH.R_EDGE, CH.R_CORNER
FREEZE = TL["freeze"]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR"
sc = bpy.context.scene
t0 = time.time()


def link(ob):
    sc.collection.objects.link(ob)
    return ob


def log(msg):
    print(f"[{time.time() - t0:6.1f}s] {msg}", flush=True)


# ── geometry helpers (from the gears reel) ──────────────────────────────────────────────────────────────────
def mesh_from(ob, name=None):
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=2e-7)
    bm.to_mesh(me)
    bm.free()
    out = link(bpy.data.objects.new(name or ob.name, me))
    out.matrix_world = ob.matrix_world.copy()
    bpy.data.objects.remove(ob)
    return out


def shrink(outer, bevel, corner=0.05 * MM):
    P = Polygon(outer)
    if bevel > 0:
        P = P.buffer(-(bevel + corner), quad_segs=8, join_style="round").buffer(corner, quad_segs=8, join_style="round")
        P = P.simplify(0.002 * MM, preserve_topology=True)
    q = orient(P, 1.0)
    return [np.array(q.exterior.coords)[:-1]]


def curve_solid(name, outer, z0, z1, bevel, bres=5):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    for poly in shrink(outer, bevel):
        sp = cu.splines.new("POLY")
        sp.points.add(len(poly) - 1)
        for i, (x, y) in enumerate(poly):
            sp.points[i].co = (x, y, 0, 1)
        sp.use_cyclic_u = True
    cu.extrude = max((z1 - z0) / 2 - bevel, 1e-6)
    cu.bevel_depth = bevel
    cu.bevel_resolution = bres if bevel > 0 else 0
    cu.offset = 0.0
    ob = link(bpy.data.objects.new(name, cu))
    ob.location = (0, 0, (z0 + z1) / 2)
    out = mesh_from(ob, name)
    out.data.transform(out.matrix_world)
    out.matrix_world = Matrix()
    return out


def rounded_rect(w, h, r, n=14):
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for k in range(n + 1):
            a = math.radians(a0 + 90 * k / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return np.array(pts)


def lathe(name, prof, seg=40, axis="Z"):
    """Closed solid of revolution: prof = [(r, z), …] from the top centre (r=0) to the bottom tip (r=0)."""
    bm = bmesh.new()
    rings = []
    top = bm.verts.new((0, 0, prof[0][1]))
    for r, z in prof[1:-1]:
        rings.append([bm.verts.new((r * math.cos(2 * math.pi * k / seg), r * math.sin(2 * math.pi * k / seg), z)) for k in range(seg)])
    bot = bm.verts.new((0, 0, prof[-1][1]))
    for k in range(seg):
        bm.faces.new((top, rings[0][k], rings[0][(k + 1) % seg]))
    for a, b in zip(rings[:-1], rings[1:]):
        for k in range(seg):
            bm.faces.new((a[k], b[k], b[(k + 1) % seg], a[(k + 1) % seg]))
    for k in range(seg):
        bm.faces.new((bot, rings[-1][(k + 1) % seg], rings[-1][k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if axis == "X":
        me.transform(Matrix.Rotation(math.pi / 2, 4, "Y"))
    return link(bpy.data.objects.new(name, me))


def finish_normals(me, angle=32):
    """Smooth shading that keeps flat faces flat (cap/wall vs bevel edges split) so reflections don't ripple."""
    me.shade_smooth()
    me.set_sharp_from_angle(angle=math.radians(angle))
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.normal_update()

    def kind(f):
        n = f.normal
        return 2 if abs(n.z) > 0.9995 else (3 if abs(n.y) > 0.9995 else (1 if abs(n.x) > 0.9995 else 0))
    for e in bm.edges:
        if len(e.link_faces) == 2 and kind(e.link_faces[0]) != kind(e.link_faces[1]):
            e.smooth = False
    bm.to_mesh(me)
    bm.free()


def set_materials(ob, mats, index_fn=None):
    ob.data.materials.clear()
    for m in mats:
        ob.data.materials.append(m)
    idx = [0] * len(ob.data.polygons) if index_fn is None else [index_fn(p) for p in ob.data.polygons]
    ob.data.polygons.foreach_set("material_index", idx)


def lumpy(r, loc, seed, sx=1.0, sy=1.0, sz=1.0):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=r, location=loc)
    c = bpy.context.object
    rg = np.random.default_rng(seed)
    for v in c.data.vertices:
        v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz)) * rg.uniform(0.8, 1.15)
    return c


# ── the tile (local frame: x width, y forward = the painted face at +T/2, z up from the table) ────────────────
PIP_R, CSK_R = 1.75 * MM, 2.3 * MM
PIP_OFF = 6.6 * MM
LAYOUT = {0: [], 1: [(0, 0)], 2: [(-1, 1), (1, -1)], 3: [(-1, 1), (0, 0), (1, -1)], 4: [(-1, -1), (-1, 1), (1, -1), (1, 1)],
          5: [(-1, -1), (-1, 1), (0, 0), (1, -1), (1, 1)], 6: [(-1, -1), (-1, 0), (-1, 1), (1, -1), (1, 0), (1, 1)]}
CHIP_AT = {"top_left_front": (-1, 1, 1), "top_right_front": (1, 1, 1)}


def pip_cutter(x, z, seg=36):
    # countersink cone through the surface, straight hole, drill-point bottom (local z of the lathe = depth axis)
    prof = [(0, 0.6 * MM), (2.75 * MM, 0.6 * MM), (2.75 * MM, 0.32 * MM), (PIP_R, -0.4 * MM), (PIP_R, -1.0 * MM), (0, -1.38 * MM)]
    c = lathe("pip", prof, seg=seg)
    c.matrix_world = Matrix.Translation((x, T / 2, z)) @ Matrix.Rotation(-math.pi / 2, 4, "X")
    return c


def groove_cutter(seg=20):
    L, R = W - 7.0 * MM, 0.42 * MM
    prof = [(0, L / 2 + R)] + [(R * math.sin(a), L / 2 + R * math.cos(a)) for a in np.linspace(0.35, math.pi / 2, 5)] + \
           [(R * math.sin(a), -L / 2 + R * math.cos(a)) for a in np.linspace(math.pi / 2, math.pi - 0.35, 5)] + [(0, -L / 2 - R)]
    c = lathe("ranura", prof, seg=seg)
    # lathe axis (z) → width axis (x); sits half sunk in the face at mid-height
    c.matrix_world = Matrix.Translation((0, T / 2 + 0.06 * MM, H / 2)) @ Matrix.Rotation(math.pi / 2, 4, "Y")
    return c


def spinner():
    prof = [(0, 0.92 * MM)] + [(2.45 * MM * math.sin(a), 0.86 * MM * math.cos(a) ** 1.25 + 0.06 * MM) for a in np.linspace(0.12, math.pi / 2, 12)] + \
           [(2.5 * MM, 0.02 * MM), (2.5 * MM, -0.7 * MM), (0, -0.7 * MM)]
    c = lathe("spinner", prof, seg=48)
    c.matrix_world = Matrix.Translation((0, T / 2, H / 2)) @ Matrix.Rotation(-math.pi / 2, 4, "X")
    return c


def boolean_all(ob, cutters):
    col = bpy.data.collections.new("cut")
    for c in cutters:
        for u in list(c.users_collection):
            u.objects.unlink(c)
        col.objects.link(c)
    m = ob.modifiers.new("b", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.operand_type = "COLLECTION"
    m.collection = col
    m.solver = "EXACT"
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    old = ob.data
    ob.modifiers.clear()
    ob.data = me
    bpy.data.meshes.remove(old)
    for c in cutters:
        bpy.data.objects.remove(c)
    bpy.data.collections.remove(col)
    return ob


_cache = {}


def tile_mesh(pips, flip, chip, wire=False):
    key = (pips, flip, chip, wire)
    if key in _cache:
        return _cache[key]
    a, b = pips if not flip else pips[::-1]
    # outline in (width, height), extruded along thickness; then remapped so that thickness → +y (front face)
    body = curve_solid("ficha", rounded_rect(W, H, RC), -T / 2, T / 2, RE, bres=(1 if wire else 6))
    body.data.transform(Matrix(((-1, 0, 0, 0), (0, 0, 1, 0), (0, 1, 0, H / 2), (0, 0, 0, 1))))  # (u,v,e) → (−u, e, v+H/2)
    if not args.quick:
        seg = 16 if wire else 36
        cut = [groove_cutter(10 if wire else 20)]
        for n, zc in ((a, H * 0.75), (b, H * 0.25)):
            for (i, j) in LAYOUT[n]:
                cut.append(pip_cutter(i * PIP_OFF, zc + j * PIP_OFF, seg))
        if chip and not wire:
            sx, sz, sy = CHIP_AT[chip]
            loc = (sx * W / 2, sy * T / 2, H if sz else 0.0)
            cut.append(lumpy(1.5 * MM, loc, 50 + len(chip), 1.25, 0.8, 1.0))
            cut.append(lumpy(0.6 * MM, (loc[0] - sx * 1.4 * MM, loc[1], loc[2] - (1 if sz else -1) * 1.1 * MM), 60 + len(chip)))
        body = boolean_all(body, cut)
    finish_normals(body.data)
    me = body.data
    me.name = f"ficha_{a}{b}{'f' if flip else ''}{chip or ''}{'_w' if wire else ''}"
    bpy.data.objects.remove(body)
    _cache[key] = me
    return me


# ── materials ─────────────────────────────────────────────────────────────────────────────────────────────────
def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def load_img(name, color=False):
    im = bpy.data.images.load(os.path.join(TEX, name))
    im.colorspace_settings.name = "sRGB" if color else "Non-Color"
    return im


class NT:
    """Tiny node-tree builder."""
    def __init__(self, m):
        m.use_nodes = True
        self.nt = m.node_tree
        self.nt.nodes.clear()

    def n(self, kind, **kw):
        node = self.nt.nodes.new(kind)
        for k, v in kw.items():
            setattr(node, k, v)
        return node

    def L(self, a, b):
        self.nt.links.new(a, b)

    def math(self, op, a, b=None, c=None):
        node = self.nt.nodes.new("ShaderNodeMath")
        node.operation = op
        for i, v in enumerate((a, b, c)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                node.inputs[i].default_value = v
            else:
                self.L(v, node.inputs[i])
        return node.outputs[0]

    def clamp(self, v):
        node = self.nt.nodes.new("ShaderNodeClamp")
        self.L(v, node.inputs[0])
        return node.outputs[0]

    def mix(self, fac, a, b, blend="MIX"):
        node = self.nt.nodes.new("ShaderNodeMix")
        node.data_type = "RGBA"
        node.blend_type = blend
        for inp, v in ((node.inputs[0], fac), (node.inputs[6], a), (node.inputs[7], b)):
            if isinstance(v, (int, float)):
                inp.default_value = v
            elif isinstance(v, tuple):
                inp.default_value = (*v, 1) if len(v) == 3 else v
            else:
                self.L(v, inp)
        return node.outputs[2]


marks_img = load_img("ficha_marcas.png")


def urea_material():
    m = bpy.data.materials.new("urea")
    g = NT(m)
    out = g.n("ShaderNodeOutputMaterial")
    bs = g.n("ShaderNodeBsdfPrincipled")
    tc = g.n("ShaderNodeTexCoord")
    geo = g.n("ShaderNodeNewGeometry")
    oi = g.n("ShaderNodeObjectInfo")
    sep = g.n("ShaderNodeSeparateXYZ")
    g.L(tc.outputs["Object"], sep.inputs[0])
    X, Y, Z = sep.outputs["X"], sep.outputs["Y"], sep.outputs["Z"]
    rnd = oi.outputs["Random"]
    # per-tile noise for the paint level inside the pips (low frequency: each pip fills a little differently)
    off = g.n("ShaderNodeCombineXYZ")
    g.L(g.math("MULTIPLY", rnd, 37.0), off.inputs[0])
    g.L(g.math("MULTIPLY", rnd, 11.0), off.inputs[1])
    vadd = g.n("ShaderNodeVectorMath", operation="ADD")
    g.L(tc.outputs["Object"], vadd.inputs[0])
    g.L(off.outputs[0], vadd.inputs[1])
    nz = g.n("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 520.0
    nz.inputs["Detail"].default_value = 3.0
    g.L(vadd.outputs[0], nz.inputs["Vector"])
    nz2 = g.n("ShaderNodeTexNoise")
    nz2.inputs["Scale"].default_value = 4200.0
    nz2.inputs["Detail"].default_value = 2.0
    g.L(vadd.outputs[0], nz2.inputs["Vector"])
    # paint: below the face (y < T/2 − level) and inside the face's interior (pips and groove only)
    level = g.math("ADD", 0.06 * MM, g.math("MULTIPLY", g.math("ADD", nz.outputs["Fac"], g.math("MULTIPLY", nz2.outputs["Fac"], 0.25)), 0.42 * MM))
    depth = g.math("SUBTRACT", T / 2, Y)
    paint = g.clamp(g.math("MULTIPLY", g.math("SUBTRACT", depth, level), 1.0 / (0.025 * MM)))
    inside = g.math("MULTIPLY", g.math("LESS_THAN", g.math("ABSOLUTE", X), W / 2 - 1.6 * MM),
                    g.math("MULTIPLY", g.math("GREATER_THAN", Z, 1.6 * MM), g.math("LESS_THAN", Z, H - 1.6 * MM)))
    inside = g.math("MULTIPLY", inside, g.math("LESS_THAN", depth, 1.6 * MM))
    paint = g.math("MULTIPLY", paint, inside)
    # marks map, box-projected (offset per tile): R fingerprints, G scratches, B dust
    mp = g.n("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (14, 14, 14)
    g.L(vadd.outputs[0], mp.inputs["Vector"])
    im = g.n("ShaderNodeTexImage")
    im.image = marks_img
    im.projection = "BOX"
    im.projection_blend = 0.25
    g.L(mp.outputs[0], im.inputs["Vector"])
    ms = g.n("ShaderNodeSeparateColor")
    g.L(im.outputs["Color"], ms.inputs[0])
    fpr, scr, dust = ms.outputs["Red"], ms.outputs["Green"], ms.outputs["Blue"]
    # only some tiles were handled with greasy fingers
    fp_on = g.clamp(g.math("MULTIPLY", g.math("SUBTRACT", rnd, 0.45), 3.0))
    fpr = g.math("MULTIPLY", fpr, fp_on)
    # dust settles on surfaces facing up (the top end in the standing pose: local +z)
    vt = g.n("ShaderNodeVectorTransform", vector_type="NORMAL", convert_from="WORLD", convert_to="OBJECT")
    g.L(geo.outputs["Normal"], vt.inputs[0])
    nsep = g.n("ShaderNodeSeparateXYZ")
    g.L(vt.outputs[0], nsep.inputs[0])
    up = g.clamp(nsep.outputs["Z"])
    dust = g.math("MULTIPLY", dust, g.math("ADD", 0.25, g.math("MULTIPLY", up, 1.2)))
    # wear: convex edges a touch lighter and duller, hollows (pip rims, groove) a touch of grime
    edge = g.clamp(g.math("MULTIPLY", g.math("SUBTRACT", geo.outputs["Pointiness"], 0.54), 10.0))
    hollow = g.clamp(g.math("MULTIPLY", g.math("SUBTRACT", 0.47, geo.outputs["Pointiness"]), 8.0))
    ivory = lin("#EFE6D1")
    tone = g.n("ShaderNodeTexNoise")
    tone.inputs["Scale"].default_value = 60.0
    g.L(vadd.outputs[0], tone.inputs["Vector"])
    col = g.mix(g.math("MULTIPLY", tone.outputs["Fac"], 0.22), ivory, lin("#E2D3B4"))
    col = g.mix(g.math("MULTIPLY", hollow, 0.35), col, lin("#8C7C62"))
    col = g.mix(g.math("MULTIPLY", dust, 0.55), col, lin("#B7B0A6"))
    col = g.mix(paint, col, lin("#0B0B0C"))
    g.L(col, bs.inputs["Base Color"])
    g.L(g.math("ADD", 0.42, g.math("MULTIPLY", paint, -0.1)), bs.inputs["Roughness"])
    bs.inputs["Subsurface Weight"].default_value = 0.12
    bs.inputs["Subsurface Radius"].default_value = (1.0, 0.72, 0.45)
    bs.inputs["Subsurface Scale"].default_value = 0.0007
    # lacquer
    bs.inputs["Coat Weight"].default_value = 1.0
    bs.inputs["Coat IOR"].default_value = 1.6
    crough = g.math("ADD", 0.012, g.math("MULTIPLY", fpr, 0.28))
    crough = g.math("ADD", crough, g.math("MULTIPLY", scr, 0.06))
    crough = g.math("ADD", crough, g.math("MULTIPLY", dust, 0.4))
    crough = g.math("ADD", crough, g.math("MULTIPLY", edge, 0.03))
    crough = g.math("ADD", crough, g.math("MULTIPLY", paint, 0.14))   # the lacquer over the paint sinks into the pip: softer sheen, pips stay black
    g.L(g.clamp(crough), bs.inputs["Coat Roughness"])
    bump = g.n("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.25
    bump.inputs["Distance"].default_value = 0.000004
    peel = g.n("ShaderNodeTexNoise")       # orange peel of the lacquer: a faint wobble in the mirror images
    peel.inputs["Scale"].default_value = 1600.0
    peel.inputs["Detail"].default_value = 1.0
    g.L(vadd.outputs[0], peel.inputs["Vector"])
    g.L(g.math("ADD", g.math("ADD", g.math("MULTIPLY", scr, -1.0), g.math("MULTIPLY", fpr, 0.3)), g.math("MULTIPLY", peel.outputs["Fac"], 0.35)), bump.inputs["Height"])
    g.L(bump.outputs["Normal"], bs.inputs["Coat Normal"])
    g.L(bs.outputs[0], out.inputs["Surface"])
    return m


def brass_material():
    m = bpy.data.materials.new("laton")
    g = NT(m)
    out = g.n("ShaderNodeOutputMaterial")
    bs = g.n("ShaderNodeBsdfPrincipled")
    geo = g.n("ShaderNodeNewGeometry")
    hollow = g.clamp(g.math("MULTIPLY", g.math("SUBTRACT", 0.5, geo.outputs["Pointiness"]), 6.0))
    nz = g.n("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 2500.0
    col = g.mix(g.math("ADD", g.math("MULTIPLY", hollow, 0.25), g.math("MULTIPLY", nz.outputs["Fac"], 0.18)), lin("#F2CF8A"), lin("#8A6230"))
    g.L(col, bs.inputs["Base Color"])
    bs.inputs["Metallic"].default_value = 1.0
    g.L(g.math("ADD", 0.03, g.math("MULTIPLY", nz.outputs["Fac"], 0.06)), bs.inputs["Roughness"])
    g.L(bs.outputs[0], out.inputs["Surface"])
    return m


def walnut_material():
    m = bpy.data.materials.new("nogal")
    g = NT(m)
    out = g.n("ShaderNodeOutputMaterial")
    bs = g.n("ShaderNodeBsdfPrincipled")
    tc = g.n("ShaderNodeTexCoord")
    mp = g.n("ShaderNodeMapping")
    SPAN = 0.82
    mp.inputs["Scale"].default_value = (1 / SPAN, 1 / SPAN, 1)
    mp.inputs["Location"].default_value = (0.5 + 0.05 / SPAN, 0.5 - 0.25 / SPAN, 0)   # texture centred at (−0.05, 0.25)
    g.L(tc.outputs["Object"], mp.inputs["Vector"])
    imgs = {}
    for k, (name, colr) in {"col": ("nogal_col.png", True), "poro": ("nogal_poro.png", False), "rug": ("nogal_rug.png", False)}.items():
        node = g.n("ShaderNodeTexImage")
        node.image = load_img(name, colr)
        node.extension = "MIRROR"
        node.interpolation = "Cubic" if k != "col" else "Linear"
        g.L(mp.outputs[0], node.inputs["Vector"])
        imgs[k] = node.outputs["Color"]
    g.L(g.mix(1.0, imgs["col"], (1.45, 1.4, 1.35), blend="MULTIPLY"), bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.55
    bump = g.n("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.35
    bump.inputs["Distance"].default_value = 0.00006
    g.L(imgs["poro"], bump.inputs["Height"])
    g.L(bump.outputs["Normal"], bs.inputs["Normal"])
    bs.inputs["Coat Weight"].default_value = 1.0
    bs.inputs["Coat IOR"].default_value = 1.5
    g.L(g.math("ADD", 0.008, g.math("MULTIPLY", imgs["rug"], 0.05)), bs.inputs["Coat Roughness"])
    wave = g.n("ShaderNodeTexNoise")       # a polished varnish is never optically flat: slow waves bend the mirror images
    wave.inputs["Scale"].default_value = 160.0
    wave.inputs["Detail"].default_value = 2.0
    g.L(tc.outputs["Object"], wave.inputs["Vector"])
    cb = g.n("ShaderNodeBump")
    cb.inputs["Strength"].default_value = 0.06
    cb.inputs["Distance"].default_value = 0.00003
    g.L(g.math("ADD", g.math("MULTIPLY", imgs["poro"], 0.35), g.math("MULTIPLY", wave.outputs["Fac"], 1.0)), cb.inputs["Height"])
    g.L(cb.outputs["Normal"], bs.inputs["Coat Normal"])
    g.L(bs.outputs[0], out.inputs["Surface"])
    return m


def emission_panel(name, size, loc, aim, strength, color=(1, 0.97, 0.93), soft=0.35, strips=0, bar=False):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    p = bpy.context.object
    p.name = name
    p.scale = (size[0], size[1], 1)
    p.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat("Z", "Y").to_euler()
    m = bpy.data.materials.new(name)
    g = NT(m)
    out = g.n("ShaderNodeOutputMaterial")
    em = g.n("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    tc = g.n("ShaderNodeTexCoord")
    sep = g.n("ShaderNodeSeparateXYZ")
    g.L(tc.outputs["UV"], sep.inputs[0])

    def edgefall(c):
        d = g.math("ABSOLUTE", g.math("SUBTRACT", c, 0.5))
        mr = g.n("ShaderNodeMapRange")
        mr.inputs["From Min"].default_value = 0.5 - soft * 0.5
        mr.inputs["From Max"].default_value = 0.5
        mr.inputs["To Min"].default_value = 1
        mr.inputs["To Max"].default_value = 0.1
        g.L(d, mr.inputs["Value"])
        return mr.outputs[0]
    shape = g.math("MULTIPLY", edgefall(sep.outputs["X"]), edgefall(sep.outputs["Y"]))
    if strips:  # n bright strips with dark gaps, soft-edged (a bank of strip boxes)
        ph = g.math("FRACT", g.math("MULTIPLY", sep.outputs["X"], float(strips)))
        band = g.math("SUBTRACT", 1.0, g.clamp(g.math("MULTIPLY", g.math("ABSOLUTE", g.math("SUBTRACT", ph, 0.5)), 1 / 0.22)))
        shape = g.math("MULTIPLY", shape, g.math("POWER", band, 0.6))
    if bar:     # a dark cross-bar through the middle (window mullion)
        mb = g.clamp(g.math("MULTIPLY", g.math("ABSOLUTE", g.math("SUBTRACT", sep.outputs["Y"], 0.5)), 1 / 0.035))
        shape = g.math("MULTIPLY", shape, mb)
    g.L(g.math("MULTIPLY", shape, strength), em.inputs["Strength"])
    g.L(em.outputs[0], out.inputs["Surface"])
    p.data.materials.append(m)
    p.visible_camera = False
    p.visible_shadow = False
    return p


# ── build the scene ─────────────────────────────────────────────────────────────────────────────────────────────
MAT = {"urea": urea_material(), "laton": brass_material(), "nogal": walnut_material()}
spinner_me = None
if not args.quick:
    sp = spinner()
    sp.data.transform(sp.matrix_world)
    sp.matrix_world = Matrix()
    finish_normals(sp.data, 40)
    sp.data.shade_smooth()
    spinner_me = sp.data
    bpy.data.objects.remove(sp)

rig = []   # per tile: (rotator empty, tile json)
for i, t in enumerate(CH.TILES):
    f, w = Vector(t["f"]), Vector(t["w"])
    z = Vector((0, 0, 1))
    basis = Matrix((w, f, z)).transposed()          # columns: local x = width, y = forward, z = up
    a0 = Vector(CH.axle0(t))
    base = link(bpy.data.objects.new(f"base_{i:02d}", None))
    base.matrix_world = Matrix.Translation(a0) @ basis.to_4x4()
    rot = link(bpy.data.objects.new(f"giro_{i:02d}", None))
    rot.parent = base
    me = tile_mesh(tuple(CH.PIPS[i]), CH.FLIP[i], CH.CHIPS.get(i))
    ob = link(bpy.data.objects.new(f"ficha_{i:02d}", me))
    ob.parent = rot
    ob.location = (0, -(T / 2 - RE), -RE)           # tile frame (bottom centre) relative to the axle
    set_materials(ob, [MAT["urea"]])
    if spinner_me is not None:
        s_ob = link(bpy.data.objects.new(f"spinner_{i:02d}", spinner_me))
        s_ob.parent = rot
        s_ob.location = ob.location
        set_materials(s_ob, [MAT["laton"]])
    rig.append((rot, t))
log(f"{len(rig)} tiles built ({len(_cache)} unique meshes)")

# tabletop (big, the far edge falls into darkness well beyond the depth of field)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
table = bpy.context.object
table.name = "mesa"
table.data.transform(Matrix.Translation((0, 0.9, 0)) @ Matrix.Diagonal((1.8, 3.2, 1, 1)))
set_materials(table, [MAT["nogal"]])
# dust motes and a fibre resting on the table around the last tiles
dmat = bpy.data.materials.new("polvo")
dmat.use_nodes = True
pb = dmat.node_tree.nodes["Principled BSDF"]
pb.inputs["Base Color"].default_value = (0.42, 0.40, 0.37, 1)
pb.inputs["Roughness"].default_value = 0.85
rgd = np.random.default_rng(77)
hero = CH.TILES[-1]["c"]
for k in range(70):
    rr = rgd.uniform(0.004, 0.09)
    a = rgd.uniform(0, 2 * math.pi)
    p = (hero[0] + rr * math.cos(a), hero[1] + 0.03 + rr * math.sin(a), 0.0)
    d = lumpy(rgd.uniform(0.03, 0.09) * MM, p, 400 + k, 1.0, rgd.uniform(0.5, 1.0), 0.45)
    set_materials(d, [dmat])

# ── light ──────────────────────────────────────────────────────────────────────────────────────────────────
cam_f = TL["cam"][FREEZE]
CAMP = Vector(cam_f[:3])


def refl_dir(P, n):
    v = (Vector(P) - CAMP).normalized()
    n = Vector(n).normalized()
    return v - 2 * v.dot(n) * n


def panel_on(name, P, n, d_az, d_el, dist, w_deg, h_deg, strength, color=(1, 0.97, 0.93), soft=0.5, **kw):
    d = refl_dir(P, n)
    az = math.atan2(d.x, d.y) + math.radians(d_az)
    el = math.asin(max(-1, min(1, d.z))) + math.radians(d_el)
    dirv = Vector((math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), math.sin(el)))
    pos = Vector(P) + dirv * dist
    size = (2 * dist * math.tan(math.radians(w_deg / 2)), 2 * dist * math.tan(math.radians(h_deg / 2)))
    return emission_panel(name, size, tuple(pos), tuple(P), strength, color, soft, **kw)


LT = CH.TILES[-1]
phiF = TL["tilt"][FREEZE][-1]
R, _, _ = CH.pose(LT, phiF)
top_c = CH.place(LT, phiF, LT["c"] + np.array([0, 0, H]))
side_n = LT["w"] if np.dot(LT["w"], np.array(CAMP) - LT["c"]) > 0 else -LT["w"]
side_c = CH.place(LT, phiF, LT["c"] + side_n * W / 2 + np.array([0, 0, H / 2]))
back_c = CH.place(CH.TILES[-2], TL["tilt"][FREEZE][-2], CH.TILES[-2]["c"] - CH.TILES[-2]["f"] * T / 2 + np.array([0, 0, H / 2]))
back_n = R @ np.zeros(3)
R2, _, _ = CH.pose(CH.TILES[-2], TL["tilt"][FREEZE][-2])
back_n = R2 @ (-CH.TILES[-2]["f"])
front_n = R @ LT["f"]
# ── the light rig: dark studio, every source shaped so that its MIRROR IMAGE reads in the lacquer and the varnish ──
emission_panel("key", (0.45, 0.35), (-0.45, -0.35, 0.72), (0.0, 0.1, 0.02), 7.5, (1.0, 0.95, 0.88), soft=0.5)
emission_panel("fill", (1.0, 0.4), (0.45, -0.95, 0.12), (0, 0.1, 0.02), 1.1, (0.96, 0.97, 1.0), soft=0.8)
panel_on("cara_lado", side_c, side_n, 6, 4, 0.55, 22, 26, 5.0, (1.0, 0.97, 0.92), soft=0.6, strips=3)
panel_on("canto_sup", top_c, R @ np.array([0, 0, 1.0]), -5, 0, 0.6, 30, 14, 6.0, (1.0, 0.98, 0.95), soft=0.6, strips=4)
# the standing tiles face the camera: a bank of strip boxes sits on the reflection of the camera ray in their faces
# (seen from frame 150), so every face shows one to three crisp bars, different on each tile of the curve, sliding
# across as the slider pushes in
CAM150 = Vector(TL["cam"][150][:3])
P150 = Vector(LT["c"] + LT["f"] * (T / 2) + np.array([0, 0, H * 0.55]))
v150 = (P150 - CAM150).normalized()
n150 = Vector(LT["f"])
r150 = v150 - 2 * v150.dot(n150) * n150
az150 = math.atan2(r150.x, r150.y) + math.radians(-4)
el150 = -math.asin(r150.z) + math.radians(2)
d150 = Vector((math.sin(az150) * math.cos(el150), math.cos(az150) * math.cos(el150), math.sin(el150)))
emission_panel("ventana", (0.85, 0.5), tuple(P150 + d150 * 0.9), tuple(P150), 34.0, (1.0, 0.97, 0.93), soft=0.3, strips=9, bar=True)
# the frozen last tile looks down at the table; through the varnish's mirror it sees up and away — a strip box there
# draws bright bars across its face (reflection of a reflection), and lights the tile tops from above
fc = CH.place(LT, phiF, LT["c"] + LT["f"] * (T / 2) + np.array([0, 0, H * 0.5]))
vv = (Vector(fc) - CAMP).normalized()
nn = Vector(front_n).normalized()
rr = vv - 2 * vv.dot(nn) * nn
rr2 = Vector((rr.x, rr.y, -rr.z))
emission_panel("techo", (0.34, 0.24), tuple(Vector(fc) + rr2 * 0.55), tuple(fc), 9.0, (1.0, 0.98, 0.95), soft=0.4, strips=5)
panel_on("arista", side_c, (Vector(side_n) * 0.5 + Vector(front_n) * 0.5).normalized(), 0, 2, 0.5, 2.5, 40, 12.0, (1.0, 0.98, 0.95), soft=0.9)
tb_c = CH.place(LT, phiF, LT["c"] + LT["f"] * (T / 2 - RE * 0.3) + np.array([0, 0, H - RE * 0.3]))
tb_n = (Vector(front_n) + Vector(R @ np.array([0, 0, 1.0]))).normalized()
panel_on("bisel_sup", tb_c, tb_n, 0, 0, 0.5, 34, 2.4, 22.0, (1.0, 0.98, 0.95), soft=0.6)
other_n = -Vector(side_n)
sb_c = CH.place(LT, phiF, LT["c"] - Vector(side_n) * (W / 2 - RE * 0.3) + LT["f"] * (T / 2 - RE * 0.3) + np.array([0, 0, H * 0.5]))
panel_on("bisel_lat", sb_c, (other_n + Vector(front_n)).normalized(), 0, 0, 0.5, 2.4, 34, 18.0, (1.0, 0.98, 0.95), soft=0.6)
emission_panel("rim_l", (0.06, 0.9), (-0.42, 1.5, 0.16), (0, 0.25, 0.02), 16.0, (1.0, 0.96, 0.9), soft=0.9)
emission_panel("rim_r", (0.06, 0.9), (0.40, 1.3, 0.12), (0, 0.25, 0.02), 22.0, (0.97, 0.98, 1.0), soft=0.9)
# far behind the chain: tall strip lights the camera never sees directly, but the near-mirror varnish does — they run
# down the table toward the camera as long bright streaks, with the tiles' silhouettes and reflections cut into them
for k, xk in enumerate((-0.55, -0.12, 0.33)):
    st_ = emission_panel(f"fondo_{k}", (0.045, 0.7), (xk, 2.7, 0.4), (xk * 0.3, 0.2, 0.3), 3.2, (1.0, 0.95, 0.88) if k % 2 else (0.98, 0.98, 1.0), soft=0.85)
world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0005, 0.00045, 0.0004, 1)
sc.world = world

# ── render settings ───────────────────────────────────────────────────────────────────────────────────────────
sc.render.engine = "CYCLES"
cy = sc.cycles
cy.device = "CPU"
cy.samples = args.samples
cy.use_adaptive_sampling = True
cy.adaptive_threshold = 0.03
cy.adaptive_min_samples = min(12, args.samples)
cy.use_denoising = True
cy.denoiser = "OPENIMAGEDENOISE"
cy.denoising_input_passes = "RGB_ALBEDO_NORMAL"
cy.denoising_prefilter = "ACCURATE" if args.samples >= 64 else "FAST"
try:
    cy.denoising_quality = "HIGH" if args.samples >= 64 else "BALANCED"
except (AttributeError, TypeError):
    pass
cy.max_bounces = 6
cy.diffuse_bounces = 2
cy.glossy_bounces = 4
cy.transmission_bounces = 2
cy.caustics_reflective = False
cy.caustics_refractive = False
cy.blur_glossy = 0.1
sc.render.use_persistent_data = True
sc.render.resolution_x = int(round(1080 * args.res))
sc.render.resolution_y = int(round(1920 * args.res))
sc.render.use_motion_blur = not args.noblur
sc.render.motion_blur_shutter = 0.5
sc.render.fps = 30
sc.render.film_transparent = False
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGB"
sc.render.image_settings.compression = 40
sc.view_settings.view_transform = "AgX"
for look in ("AgX - Medium High Contrast", "Medium High Contrast"):
    try:
        sc.view_settings.look = look
        break
    except TypeError:
        pass

cam_d = bpy.data.cameras.new("cam")
cam_d.sensor_fit = "VERTICAL"
cam_d.sensor_height = 24.0
cam_d.clip_start = 0.005
cam_d.clip_end = 20
cam_d.dof.use_dof = True
cam_d.dof.aperture_blades = 9
cam = link(bpy.data.objects.new("cam", cam_d))
sc.camera = cam

f_lo, f_hi = max(0, F0 - 1), min(FREEZE, F1 + 1)
for f in range(f_lo, f_hi + 1):
    px, py, pz, tx, ty, tz, fov, fd, fs = TL["cam"][f]
    loc, tgt = Vector((px, py, pz)), Vector((tx, ty, tz))
    cam.location = loc
    cam.rotation_euler = (tgt - loc).to_track_quat("-Z", "Y").to_euler()
    cam_d.lens = 12.0 / math.tan(math.radians(fov / 2))
    cam_d.dof.focus_distance = fd
    cam_d.dof.aperture_fstop = fs
    for ob, prop in ((cam, "location"), (cam, "rotation_euler")):
        ob.keyframe_insert(prop, frame=f)
    cam_d.keyframe_insert("lens", frame=f)
    cam_d.dof.keyframe_insert("focus_distance", frame=f)
    cam_d.dof.keyframe_insert("aperture_fstop", frame=f)
    for j, (rot, t) in enumerate(rig):
        phi = TL["tilt"][f][j]
        rot.location = (0, RE * phi, 0)
        rot.rotation_euler = (-phi, 0, 0)
        rot.keyframe_insert("location", frame=f)
        rot.keyframe_insert("rotation_euler", frame=f)
log("scene ready")

# ── masks for the reveal (frozen frame): object colours as emission, same lens and focus ────────────────────────
if args.mask:
    ov = bpy.data.materials.new("mascara")
    g = NT(ov)
    out = g.n("ShaderNodeOutputMaterial")
    em = g.n("ShaderNodeEmission")
    oi = g.n("ShaderNodeObjectInfo")
    # objects flagged with colour alpha 0 (the table in the "param" pass) write their distance along the table
    # (world y, −0.25 m → 1.75 m) in green instead: the sweep that reveals the table runs from near to far
    geo = g.n("ShaderNodeNewGeometry")
    sp_ = g.n("ShaderNodeSeparateXYZ")
    g.L(geo.outputs["Position"], sp_.inputs[0])
    depth = g.clamp(g.math("DIVIDE", g.math("ADD", sp_.outputs["Y"], 0.25), 2.0))
    cxyz = g.n("ShaderNodeCombineXYZ")
    g.L(depth, cxyz.inputs[1])
    g.L(g.mix(g.math("SUBTRACT", 1.0, oi.outputs["Alpha"]), oi.outputs["Color"], cxyz.outputs[0]), em.inputs["Color"])
    g.L(em.outputs[0], out.inputs["Surface"])
    sc.view_layers[0].material_override = ov
    for ob in sc.objects:
        if ob.name.startswith(("key", "fill", "cara", "canto", "dorsos", "rim", "fondo", "arista", "ventana", "techo", "bisel")):
            ob.hide_render = True
    cy.use_denoising = False
    cy.samples = args.samples
    cy.use_adaptive_sampling = False
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.render.use_motion_blur = False
    os.makedirs(args.out, exist_ok=True)
    sc.frame_set(FREEZE)
    for pas in ("ids", "param"):
        for ob in sc.objects:
            if ob.name.startswith(("ficha_", "spinner_")):
                j = int(ob.name.split("_")[1])
                if pas == "ids":
                    ob.color = (1, 0, 0, 1) if j == CH.N - 1 else (0, 1, 0, 1)
                else:
                    ob.color = (j / (CH.N - 1), 0, 0, 1)
            elif ob.type == "MESH":           # the table and the dust resting on it
                ob.color = (0, 0, 1, 1) if pas == "ids" else (0, 0, 0, 0)
        sc.render.filepath = os.path.join(args.out, f"mask_{pas}.png")
        bpy.ops.render.render(write_still=True)
        log(f"mask {pas} written")
    sys.exit(0)

# ── wire GLB: low-res tiles in their standing pose, each under a node at its axle frame (three.js rotates it) ──
if args.export:
    for o in list(sc.objects):
        o.select_set(False)
    wires = []
    for i, t in enumerate(CH.TILES):
        me = tile_mesh(tuple(CH.PIPS[i]), CH.FLIP[i], None, wire=True).copy()
        me.transform(Matrix.Translation((0, -(T / 2 - RE), -RE)))
        w = link(bpy.data.objects.new(f"wire_{i:02d}", me))
        f, wv = Vector(t["f"]), Vector(t["w"])
        w.matrix_world = Matrix.Translation(Vector(CH.axle0(t))) @ Matrix((wv, f, Vector((0, 0, 1)))).transposed().to_4x4()
        w.select_set(True)
        wires.append(w)
    os.makedirs(os.path.join(ROOT, "public", "models"), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, "public", "models", "fichas.glb"), export_format="GLB",
                              use_selection=True, export_apply=True, export_materials="NONE", export_normals=False)
    log("wire GLB exported")
    sys.exit(0)

if args.border:
    bx0, by0, bx1, by1 = (float(v) for v in args.border.split(","))
    sc.render.use_border, sc.render.use_crop_to_border = True, True
    sc.render.border_min_x, sc.render.border_min_y, sc.render.border_max_x, sc.render.border_max_y = bx0, by0, bx1, by1
os.makedirs(args.out, exist_ok=True)
sc.frame_start, sc.frame_end = F0, F1
sc.render.filepath = os.path.join(args.out, args.prefix + "####")
t1 = time.time()
bpy.ops.render.render(animation=True)
log(f"rendered frames {F0}-{F1} in {time.time() - t1:.1f}s ({(time.time() - t1) / (F1 - F0 + 1):.1f}s/frame)")
