"""Path-traced plates for the countdown: a drop forming on an old brass tap over a black slate basin, shot like a
high-speed macro. Every surface is geometry; every shape comes from scripts/physics.py (via data/gota_frames.npz).

Modelled, not painted:
  · tap: a real spout (tube swept along a bend), its turned-down end with an M24×1 thread (a true helix, three turns
    showing), a black rubber gasket, the aerator housing (lathe profile: bottom lip, worn chamfers, knurled grip band),
    the perforated screen it hangs from, a limescale crust grown on the lip and the screen's rim
  · water: the hanging drop and what stays on the faucet (surfaces of revolution with a shape key per frame), the
    free drop (polar radius per frame, Rayleigh modes), the satellite, dust specks riding the rings
  · pool: a slate basin (cleft texture in relief, wet edges, beads of water on the far rim) full to 3 mm from the rim;
    the surface carries the analytic ring trains as exact normals (dh/dr from drop_geom.ripple), clocked per frame
Light: a long horizon softbox behind (the water mirrors it, the drop refracts it upside down), a big softbox behind
and above, a key whose window is the drop's sharp highlight, two edge strips (one warm orange), a low fill card.

Run:  <python-with-bpy> scripts/blender_gota.py [--frames 0-194] [--samples 24] [--res 1.0] [--noblur] [--border x0,y0,x1,y1]
      <python-with-bpy> scripts/blender_gota.py --export-wire        (public/models/gota.glb + src/wire.json, no render)
"""
import argparse, json, math, os, sys, time
import numpy as np
import bpy
import bmesh
from mathutils import Vector, Matrix
from shapely.geometry import Polygon, Point
from shapely.geometry.polygon import orient

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import drop_geom as dg  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--frames", default="0-195")
ap.add_argument("--samples", type=int, default=24)
ap.add_argument("--out", default=os.path.join(ROOT, "public", "plates"))
ap.add_argument("--res", type=float, default=1.0)
ap.add_argument("--noblur", action="store_true")
ap.add_argument("--border", default="")
ap.add_argument("--export-wire", action="store_true")
ap.add_argument("--blend", default="")
args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
F0, F1 = (int(v) for v in args.frames.split("-"))
TL = json.load(open(os.path.join(ROOT, "src", "timeline-gota.json")))
GF = np.load(os.path.join(ROOT, "data", "gota_frames.npz"))
TEX = os.path.join(ROOT, "public", "plates_src")
MM = 0.001
FREEZE, PINCH = TL["freeze"], TL["pinch"]
HM = TL["hMouth"]                       # the screen (where the drop hangs) above the water
NSEG = 128                              # around every surface of revolution

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
prefs = bpy.context.preferences.edit
t0 = time.time()


def link(ob):
    sc.collection.objects.link(ob)
    return ob


def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def mesh_obj(name, verts, faces, smooth=True):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], [tuple(f) for f in faces])
    me.validate()
    if smooth:
        me.shade_smooth()
    return link(bpy.data.objects.new(name, me))


def set_material(ob, m):
    ob.data.materials.clear()
    ob.data.materials.append(m)
    ob.data.polygons.foreach_set("material_index", [0] * len(ob.data.polygons))


def lathe(name, prof, n=NSEG, cap_top=False, cap_bottom=False, mod=None):
    """Surface of revolution around +Z from a 2D path [(r, z), ...]. Optional radius modulation mod(theta, z) → dr.
    Rows with r == 0 collapse into a pole."""
    prof = np.asarray(prof, dtype=float)
    th = np.linspace(0, 2 * np.pi, n, endpoint=False)
    verts, rows = [], []
    for r, z in prof:
        if r <= 1e-9:
            rows.append([len(verts)])
            verts.append((0.0, 0.0, z))
            continue
        row = []
        for t in th:
            rr = r + (mod(t, z) if mod else 0.0)
            row.append(len(verts))
            verts.append((rr * math.cos(t), rr * math.sin(t), z))
        rows.append(row)
    faces = []
    for a, b in zip(rows[:-1], rows[1:]):
        if len(a) == 1 and len(b) == 1:
            continue
        if len(a) == 1:
            faces += [(a[0], b[(i + 1) % n], b[i]) if False else (a[0], b[i], b[(i + 1) % n]) for i in range(n)]
        elif len(b) == 1:
            faces += [(a[i], b[0], a[(i + 1) % n]) if False else (a[(i + 1) % n], a[i], b[0]) for i in range(n)]
        else:
            faces += [(a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]) for i in range(n)]
    ob = mesh_obj(name, verts, faces)
    fix_normals(ob)
    return ob


def fix_normals(ob, inside=False):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if inside:
        bmesh.ops.reverse_faces(bm, faces=bm.faces)
    bm.to_mesh(ob.data)
    bm.free()


def sharp_edges(ob, angle=40):
    ob.data.shade_smooth()
    ob.data.set_sharp_from_angle(angle=math.radians(angle))


def curve_solid(name, outer, holes, z0, z1, bevel):
    """Extrude a 2D outline with holes between z0 and z1, every edge rounded by `bevel` (shapely shrink first)."""
    P = Polygon(outer, [h for h in holes])
    if not P.is_valid:
        P = P.buffer(0)
    if bevel > 0:
        P = P.buffer(-bevel, quad_segs=6, join_style="round")
    polys = list(P.geoms) if P.geom_type == "MultiPolygon" else [P]
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    for q in polys:
        q = orient(q, 1.0)
        for ring in [np.array(q.exterior.coords)[:-1]] + [np.array(i.coords)[:-1] for i in q.interiors]:
            sp = cu.splines.new("POLY")
            sp.points.add(len(ring) - 1)
            for i, (x, y) in enumerate(ring):
                sp.points[i].co = (x, y, 0, 1)
            sp.use_cyclic_u = True
    cu.extrude = max((z1 - z0) / 2 - bevel, 1e-7)
    cu.bevel_depth = bevel
    cu.bevel_resolution = 3 if bevel > 0 else 0
    ob = link(bpy.data.objects.new(name, cu))
    ob.location = (0, 0, (z0 + z1) / 2)
    dg_ = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg_))
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    bm.to_mesh(me)
    bm.free()
    me.transform(ob.matrix_world)
    out = link(bpy.data.objects.new(name, me))
    bpy.data.objects.remove(ob)
    return out


def circle(r, n=96, cx=0.0, cy=0.0, start=0.0):
    a = start + np.linspace(0, 2 * np.pi, n, endpoint=False)
    return np.stack([cx + r * np.cos(a), cy + r * np.sin(a)], 1)


def fbm1(x, seed, octaves=4):
    """Smooth 1D-periodic noise for crusts (x in radians)."""
    r = np.random.default_rng(seed)
    out = np.zeros_like(np.asarray(x, dtype=float))
    for o in range(octaves):
        k = int(3 * 2 ** o)
        for _ in range(3):
            kk = r.integers(k // 2 + 1, k + 2)
            out += 0.6 ** o * np.cos(kk * x + r.uniform(0, 2 * np.pi))
    return out / 3.0


# ── node helpers ────────────────────────────────────────────────────────────────────────────────────
class NB:
    """Tiny expression builder for shader math."""

    def __init__(self, nt):
        self.nt = nt

    def node(self, kind, **kw):
        n = self.nt.nodes.new(kind)
        for k, v in kw.items():
            setattr(n, k, v)
        return n

    def math(self, op, a, b=None, c=None):
        n = self.node("ShaderNodeMath", operation=op)
        for i, v in enumerate((a, b, c)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                n.inputs[i].default_value = float(v)
            else:
                self.nt.links.new(v, n.inputs[i])
        return n.outputs[0]

    def add(self, a, b): return self.math("ADD", a, b)
    def sub(self, a, b): return self.math("SUBTRACT", a, b)
    def mul(self, a, b): return self.math("MULTIPLY", a, b)
    def div(self, a, b): return self.math("DIVIDE", a, b)
    def madd(self, a, b, c): return self.math("MULTIPLY_ADD", a, b, c)

    def clamp(self, v, lo=0.0, hi=1.0):
        n = self.node("ShaderNodeClamp")
        self.nt.links.new(v, n.inputs[0])
        n.inputs[1].default_value, n.inputs[2].default_value = lo, hi
        return n.outputs[0]

    def mix_rgb(self, fac, a, b, blend="MIX"):
        n = self.node("ShaderNodeMix", data_type="RGBA", blend_type=blend)
        self.link_or_set(fac, n.inputs[0])
        self.link_or_set(a, n.inputs[6])
        self.link_or_set(b, n.inputs[7])
        return n.outputs[2]

    def link_or_set(self, v, sock):
        if isinstance(v, (int, float)):
            sock.default_value = float(v)
        elif isinstance(v, tuple):
            sock.default_value = v if len(v) == 4 else (*v, 1.0)
        else:
            self.nt.links.new(v, sock)


def new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes.clear()
    return m, NB(m.node_tree)


# ── materials ───────────────────────────────────────────────────────────────────────────────────────
laton_img = bpy.data.images.load(os.path.join(TEX, "laton.png"))
laton_img.colorspace_settings.name = "Non-Color"
cal_img = bpy.data.images.load(os.path.join(TEX, "cal.png"))
cal_img.colorspace_settings.name = "Non-Color"


def brass_material(name, scale=55.0, tarnish_amt=0.6, base="#c9a560", dark="#3a2814", rough=0.17):
    """Aged brass: mirror-like where it is worn or wiped, tarnished in blotches, dark patina in every hollow,
    dried water spots (mineral rings: lighter and rougher), fine scratches. Box-projected maps, pointiness for edges."""
    m, b = new_mat(name)
    nt = m.node_tree
    out = b.node("ShaderNodeOutputMaterial")
    bs = b.node("ShaderNodeBsdfPrincipled")
    tc = b.node("ShaderNodeTexCoord")
    geo = b.node("ShaderNodeNewGeometry")
    mp = b.node("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    im = b.node("ShaderNodeTexImage", image=laton_img, projection="BOX", projection_blend=0.35)
    nt.links.new(mp.outputs[0], im.inputs["Vector"])
    sp = b.node("ShaderNodeSeparateColor")
    nt.links.new(im.outputs["Color"], sp.inputs[0])
    spots, tarn, scr = sp.outputs["Red"], sp.outputs["Green"], sp.outputs["Blue"]
    edge = b.clamp(b.mul(b.sub(geo.outputs["Pointiness"], 0.52), 12.0))
    hollow = b.clamp(b.mul(b.sub(0.485, geo.outputs["Pointiness"]), 10.0))
    # colour: brass → tarnished brown in blotches and in the hollows; worn edges back to bright brass
    t = b.clamp(b.add(b.mul(b.sub(tarn, 0.35), tarnish_amt * 1.6), b.mul(hollow, 0.85)))
    t = b.mul(t, b.sub(1.0, b.mul(edge, 0.9)))
    col = b.mix_rgb(t, lin(base), lin(dark))
    # dried mineral rings: a pale, almost white deposit
    col = b.mix_rgb(b.mul(spots, 0.2), col, lin("#bdb5a4"))
    nt.links.new(col, bs.inputs["Base Color"])
    metal = b.sub(1.0, b.mul(spots, 0.3))
    nt.links.new(metal, bs.inputs["Metallic"])
    rg = b.add(rough, b.mul(t, 0.16))
    rg = b.add(rg, b.mul(spots, 0.18))
    rg = b.sub(rg, b.mul(edge, 0.09))
    rg = b.add(rg, b.mul(scr, 0.05))
    nt.links.new(b.clamp(rg, 0.04, 0.9), bs.inputs["Roughness"])
    bump = b.node("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.25
    bump.inputs["Distance"].default_value = 0.00002
    nt.links.new(b.add(b.mul(spots, 0.6), b.mul(scr, -0.4)), bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bs.inputs["Normal"])
    nt.links.new(bs.outputs[0], out.inputs["Surface"])
    return m


def plain(name, color, rough, metal=0.0, spec=0.5):
    m, b = new_mat(name)
    out = b.node("ShaderNodeOutputMaterial")
    bs = b.node("ShaderNodeBsdfPrincipled")
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Roughness"].default_value = rough
    bs.inputs["Metallic"].default_value = metal
    bs.inputs["Specular IOR Level"].default_value = spec
    m.node_tree.links.new(bs.outputs[0], out.inputs["Surface"])
    return m


def water_material(name):
    m, b = new_mat(name)
    out = b.node("ShaderNodeOutputMaterial")
    bs = b.node("ShaderNodeBsdfPrincipled")
    bs.inputs["Base Color"].default_value = (1, 1, 1, 1)
    bs.inputs["Roughness"].default_value = 0.0
    bs.inputs["IOR"].default_value = 1.333
    bs.inputs["Transmission Weight"].default_value = 1.0
    m.node_tree.links.new(bs.outputs[0], out.inputs["Surface"])
    return m, bs


def limescale_material():
    m, b = new_mat("cal")
    nt = m.node_tree
    out = b.node("ShaderNodeOutputMaterial")
    bs = b.node("ShaderNodeBsdfPrincipled")
    tc = b.node("ShaderNodeTexCoord")
    mp = b.node("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (160, 160, 160)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    im = b.node("ShaderNodeTexImage", image=cal_img, projection="BOX", projection_blend=0.4)
    nt.links.new(mp.outputs[0], im.inputs["Vector"])
    col = b.mix_rgb(im.outputs["Color"], lin("#6f6a60"), lin("#bdb6a8"))
    nt.links.new(col, bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.82
    bs.inputs["Subsurface Weight"].default_value = 0.0
    bump = b.node("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 1.0
    bump.inputs["Distance"].default_value = 0.00006
    nt.links.new(im.outputs["Color"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bs.inputs["Normal"])
    nt.links.new(bs.outputs[0], out.inputs["Surface"])
    return m


def slate_material():
    """Black slate: split along its cleavage (stretched ridged noise in relief), matte where dry, glossy where wet."""
    m, b = new_mat("pizarra")
    nt = m.node_tree
    out = b.node("ShaderNodeOutputMaterial")
    bs = b.node("ShaderNodeBsdfPrincipled")
    tc = b.node("ShaderNodeTexCoord")
    sep = b.node("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    mp = b.node("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (18, 70, 18)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nz = b.node("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 6.0
    nz.inputs["Detail"].default_value = 8.0
    nz.inputs["Roughness"].default_value = 0.62
    nt.links.new(mp.outputs[0], nz.inputs["Vector"])
    nz2 = b.node("ShaderNodeTexNoise")
    nz2.inputs["Scale"].default_value = 900.0
    nz2.inputs["Detail"].default_value = 2.0
    nt.links.new(tc.outputs["Object"], nz2.inputs["Vector"])
    # wet: everything within ~2.5 mm of the water level, and the top of the rim near the inner edge (splashes)
    z = sep.outputs["Z"]
    wet = b.clamp(b.sub(1.0, b.div(b.sub(z, 0.0004), 0.0025)))
    col = b.mix_rgb(nz.outputs["Fac"], lin("#1c1d20"), lin("#0d0d0f"))
    col = b.mix_rgb(wet, col, lin("#060607"))
    nt.links.new(col, bs.inputs["Base Color"])
    rg = b.add(b.mul(nz.outputs["Fac"], 0.25), 0.48)
    rg = b.add(b.mul(rg, b.sub(1.0, wet)), b.mul(wet, 0.06))
    nt.links.new(b.clamp(rg, 0.03, 1.0), bs.inputs["Roughness"])
    bump = b.node("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.45
    bump.inputs["Distance"].default_value = 0.0004
    nt.links.new(b.add(nz.outputs["Fac"], b.mul(nz2.outputs["Fac"], 0.15)), bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bs.inputs["Normal"])
    nt.links.new(bs.outputs[0], out.inputs["Surface"])
    return m


def pool_water_material():
    """Still water (IOR 1.333, no tint) whose normal is the exact slope of the ring trains: n = (−h'·x/r, −h'·y/r, 1).
    The ring clock τ is a keyframed value (one per frame, from the physics timeline); a whisper of micro-ripple on top."""
    m, b = new_mat("agua")
    nt = m.node_tree
    out = b.node("ShaderNodeOutputMaterial")
    bs = b.node("ShaderNodeBsdfPrincipled")
    bs.inputs["Base Color"].default_value = (1, 1, 1, 1)
    bs.inputs["Roughness"].default_value = 0.0
    bs.inputs["IOR"].default_value = 1.333
    bs.inputs["Transmission Weight"].default_value = 1.0
    tc = b.node("ShaderNodeTexCoord")
    sep = b.node("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    x, y = sep.outputs["X"], sep.outputs["Y"]
    r = b.math("SQRT", b.add(b.add(b.mul(x, x), b.mul(y, y)), 1e-10))
    tau_node = b.node("ShaderNodeValue")
    tau_node.name = "tau"
    tau = tau_node.outputs[0]
    dh = None
    for train, gain, delay in ((0, 1.0, 0.0), (1, 0.4, TL["satDelay"])):
        tt = b.sub(tau, delay) if delay else tau
        on = b.math("GREATER_THAN", tt, 0.0)
        for c, lam, A0, w0, ph in dg.PACKETS:
            k = 2 * math.pi / lam
            R = b.mul(tt, c)
            w = b.add(w0, b.mul(tt, 0.12 * c))
            A = b.mul(b.mul(b.math("SQRT", b.div(0.01, b.add(R, 0.01))), b.math("EXPONENT", b.mul(tt, -1 / 0.9))), A0 * gain)
            A = b.mul(A, on)
            u = b.div(b.sub(r, R), w)
            env = b.math("EXPONENT", b.mul(b.mul(u, u), -1.0))
            arg = b.add(b.mul(b.sub(r, b.mul(tt, c / 1.5)), k), ph)
            term = b.sub(b.mul(b.div(b.mul(u, -2.0), w), b.math("COSINE", arg)), b.mul(b.math("SINE", arg), k))
            term = b.mul(b.mul(term, env), A)
            dh = term if dh is None else b.add(dh, term)
    nx = b.mul(b.div(b.mul(dh, -1.0), r), x)
    ny = b.mul(b.div(b.mul(dh, -1.0), r), y)
    cmb = b.node("ShaderNodeCombineXYZ")
    nt.links.new(nx, cmb.inputs[0])
    nt.links.new(ny, cmb.inputs[1])
    cmb.inputs[2].default_value = 1.0
    nrm = b.node("ShaderNodeVectorMath", operation="NORMALIZE")
    nt.links.new(cmb.outputs[0], nrm.inputs[0])
    # micro-ripple: a very faint, large-scale undulation (no water is a perfect mirror)
    mz = b.node("ShaderNodeTexNoise")
    mz.inputs["Scale"].default_value = 60.0
    mz.inputs["Detail"].default_value = 2.0
    nt.links.new(tc.outputs["Object"], mz.inputs["Vector"])
    bump = b.node("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.012
    bump.inputs["Distance"].default_value = 0.0002
    nt.links.new(mz.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(nrm.outputs[0], bump.inputs["Normal"])
    nt.links.new(bump.outputs["Normal"], bs.inputs["Normal"])
    nt.links.new(bs.outputs[0], out.inputs["Surface"])
    return m, tau_node


def emission_panel(name, size, loc, aim, strength, color=(1, 0.96, 0.92), soft=0.35, camera=False, grad=None):
    """A softbox: brighter in the middle, falling off to the edges. grad=(bottom, top) multiplies along the panel's
    height (for the horizon strip: bright at the bottom, gone at the top)."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    p = bpy.context.object
    p.name = name
    p.scale = (size[0], size[1], 1)
    p.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat("Z", "Y").to_euler()
    m, b = new_mat(name)
    nt = m.node_tree
    out = b.node("ShaderNodeOutputMaterial")
    em = b.node("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    tc = b.node("ShaderNodeTexCoord")
    sep = b.node("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["UV"], sep.inputs[0])

    def edgefall(c):
        a = b.math("ABSOLUTE", b.sub(c, 0.5))
        n = b.node("ShaderNodeMapRange")
        n.inputs["From Min"].default_value = 0.5 - soft * 0.5
        n.inputs["From Max"].default_value = 0.5
        n.inputs["To Min"].default_value = 1
        n.inputs["To Max"].default_value = 0.1
        nt.links.new(a, n.inputs["Value"])
        return n.outputs[0]
    s = b.mul(edgefall(sep.outputs["X"]), edgefall(sep.outputs["Y"]))
    if grad:
        g = b.add(grad[0], b.mul(sep.outputs["Y"], grad[1] - grad[0]))
        s = b.mul(s, b.math("POWER", b.clamp(g, 0.0, 10.0), 1.6))
    nt.links.new(b.mul(s, strength), em.inputs["Strength"])
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    p.data.materials.append(m)
    p.visible_camera = camera
    p.visible_shadow = False
    return p


# ════════════════════════════════════════════════════════════════════════════════════════════════════
# THE TAP (axis: world Z through x = y = 0; the screen, where the drop hangs, at z = HM)
# ════════════════════════════════════════════════════════════════════════════════════════════════════
mats = {
    "laton": brass_material("laton"),
    "laton_vivo": brass_material("laton_vivo", tarnish_amt=0.3, rough=0.11),          # the housing: handled, wiped
    "goma": plain("goma", lin("#0b0b0c"), 0.42, spec=0.4),
    "rejilla": plain("rejilla", lin("#8d8d8f"), 0.32, metal=1.0),
    "fondo_aireador": plain("fondo_aireador", lin("#141414"), 0.7),
    "cal": limescale_material(),
    "pizarra": slate_material(),
    "polvo": plain("polvo", lin("#6f6a62"), 0.9),
}
gota_mat, _ = water_material("gota")
agua_mat, tau_node = pool_water_material()

RECESS = 0.8 * MM                # the screen sits this far above the housing's bottom lip
Z_LIP = HM - RECESS
R_OUT = 13.2 * MM                # housing (female M24 aerator)
H_HOUS = 10.0 * MM
R_OPEN = 9.4 * MM                # the opening in the lip
Z_TOP = Z_LIP + H_HOUS
GASKET_T = 0.7 * MM
THREAD_L = 2.6 * MM              # thread showing between the gasket and the spout's shoulder
R_MAJ, PITCH, T_DEPTH = 12.0 * MM, 1.0 * MM, 0.54 * MM
R_TUBE = 12.7 * MM

# housing: lathe profile (r, z) from inside the opening, round the lip, up the outside, over the top
hp = []
for t in np.linspace(0, 1, 6):                                   # inner wall of the opening, rounded into the lip
    hp.append((R_OPEN - 0.15 * MM * (1 - math.cos(t * math.pi / 2)), HM + 0.4 * MM - (0.4 * MM + RECESS - 0.25 * MM) * t))
for t in np.linspace(0, math.pi / 2, 7)[1:]:                    # inner corner radius 0.25 mm
    hp.append((R_OPEN + 0.25 * MM - 0.25 * MM * math.cos(t) - 0.15 * MM, Z_LIP + 0.25 * MM - 0.25 * MM * math.sin(t)))
hp.append((R_OUT - 0.7 * MM, Z_LIP))                             # bottom face
for t in np.linspace(0, math.pi / 2, 9)[1:]:                    # worn outer bottom edge (r 0.55 mm)
    hp.append((R_OUT - 0.55 * MM + 0.55 * MM * math.sin(t) - 0.15 * MM * (1 - math.sin(t)) * 0, Z_LIP + 0.55 * MM - 0.55 * MM * math.cos(t)))
zk0, zk1 = Z_LIP + 4.6 * MM, Z_LIP + 9.0 * MM                    # knurled grip band
for z in np.linspace(Z_LIP + 0.6 * MM, zk0 - 0.35 * MM, 6):
    hp.append((R_OUT, z))
for z in np.linspace(zk0 - 0.2 * MM, zk1 + 0.2 * MM, 46):
    hp.append((R_OUT, z))
for t in np.linspace(0, math.pi / 2, 7):                         # top outer edge
    hp.append((R_OUT - 0.4 * MM + 0.4 * MM * math.cos(t), Z_TOP - 0.4 * MM + 0.4 * MM * math.sin(t)))
hp.append((R_MAJ + 0.3 * MM, Z_TOP))
hp.append((R_MAJ - 0.2 * MM, Z_TOP))
NK = 96                                                          # knurl ridges


def knurl(theta, z):
    if z < zk0 - 0.25 * MM or z > zk1 + 0.25 * MM:
        return 0.0
    w = min(1.0, (z - (zk0 - 0.25 * MM)) / (0.35 * MM), ((zk1 + 0.25 * MM) - z) / (0.35 * MM))
    ph = (theta * NK / (2 * math.pi)) % 1.0
    tri = abs(ph - 0.5) * 2                                       # 1 at the ridge centre lines … 0 in the valleys
    return -0.22 * MM * (1 - tri) ** 1.4 * max(0.0, w)


housing = lathe("aireador", hp, n=NK * 8, mod=knurl)
sharp_edges(housing, 50)
set_material(housing, mats["laton_vivo"])

# screen: a perforated stainless disc (holes on a hex grid), a dark interior behind it
holes = []
pitch_h = 1.05 * MM
for i in range(-12, 13):
    for j in range(-12, 13):
        x = (i + 0.5 * (j % 2)) * pitch_h
        y = j * pitch_h * math.sqrt(3) / 2
        rr = math.hypot(x, y)
        if 2.9 * MM < rr < R_OPEN - 0.9 * MM:
            holes.append(circle(0.34 * MM, 10, x, y))
screen = curve_solid("rejilla", circle(R_OPEN + 0.3 * MM, 160), holes, HM, HM + 0.35 * MM, 0.0)
set_material(screen, mats["rejilla"])
inner = lathe("interior", [(0, HM + 1.4 * MM), (R_OPEN + 0.3 * MM, HM + 1.4 * MM)], n=64)
set_material(inner, mats["fondo_aireador"])

# limescale: a crust on the lip's inner corner and the screen's rim, thicker in places, with a few loose nodules
th_c = np.linspace(0, 2 * np.pi, 720, endpoint=False)
crust_t = np.clip(0.55 + 0.9 * fbm1(th_c, 5), 0, None) ** 1.5
cverts, cfaces = [], []
NP = 14
for i, t in enumerate(th_c):
    thick = (0.06 + 0.32 * crust_t[i]) * MM
    for j in range(NP):
        a = j / (NP - 1) * math.pi                               # a half-tube over the corner (from the screen to the lip face)
        rr = R_OPEN - 0.1 * MM + thick * 0.9 * math.cos(a) * -1 + 0.05 * MM
        zz = Z_LIP + RECESS * 0.55 + thick * 1.2 * math.sin(a) * (1 if a < math.pi / 2 else 0.6) - RECESS * 0.55 * (j / (NP - 1))
        cverts.append((rr * math.cos(t), rr * math.sin(t), zz))
n_t = len(th_c)
for i in range(n_t):
    for j in range(NP - 1):
        a, b_ = i * NP + j, ((i + 1) % n_t) * NP + j
        cfaces.append((a, b_, b_ + 1, a + 1))
crust = mesh_obj("cal_borde", cverts, cfaces)
set_material(crust, mats["cal"])
# … and patches along the outer bottom corner, where drops run down the housing and dry
cov = fbm1(th_c * 1.0, 17, 5) + 0.35 * fbm1(th_c * 3.0, 18, 3)
patch = np.clip((cov - 0.25) * 2.0, 0, None) ** 1.5
rough_j = np.random.default_rng(19)
overts, ofaces = [], []
NPo = 12
for i, t in enumerate(th_c):
    for j in range(NPo):
        a = j / (NPo - 1) * math.pi / 2                       # from the bottom face round the corner onto the side
        thick = (0.14 * MM * patch[i] * (0.55 + 0.45 * math.sin(a * 2)) + 0.003 * MM) * rough_j.uniform(0.6, 1.25)
        rr = R_OUT - 0.55 * MM + (0.55 * MM + thick) * math.sin(a) - 0.5 * MM * (1 - j / (NPo - 1)) ** 2
        zz = Z_LIP + 0.55 * MM - (0.55 * MM + thick) * math.cos(a) + 0.25 * MM * (j / (NPo - 1)) ** 2 * patch[i]
        overts.append((rr * math.cos(t), rr * math.sin(t), zz))
for i in range(n_t):
    for j in range(NPo - 1):
        a, b_ = i * NPo + j, ((i + 1) % n_t) * NPo + j
        ofaces.append((a, a + 1, b_ + 1, b_))
crust2 = mesh_obj("cal_exterior", overts, ofaces)
set_material(crust2, mats["cal"])
rgc = np.random.default_rng(41)
for k in range(26):                                               # nodules on the bottom face and the screen rim
    a = rgc.uniform(0, 2 * np.pi)
    if k < 16:
        rr, zz, s = rgc.uniform(R_OPEN + 0.3 * MM, R_OUT - 0.9 * MM), Z_LIP - 0.03 * MM, rgc.uniform(0.12, 0.3) * MM
    else:
        rr, zz, s = rgc.uniform(R_OPEN - 1.2 * MM, R_OPEN - 0.3 * MM), HM - 0.03 * MM, rgc.uniform(0.1, 0.22) * MM
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=s, location=(rr * math.cos(a), rr * math.sin(a), zz))
    nd = bpy.context.object
    for v in nd.data.vertices:
        v.co = Vector((v.co.x * rgc.uniform(0.8, 1.5), v.co.y * rgc.uniform(0.8, 1.5), v.co.z * 0.45)) * rgc.uniform(0.85, 1.15)
    nd.data.shade_smooth()
    set_material(nd, mats["cal"])

# gasket
z_g = Z_TOP
gasket = lathe("junta", [(R_MAJ - 0.45 * MM, z_g + GASKET_T), (R_MAJ + 0.75 * MM, z_g + GASKET_T),
                         (R_MAJ + 0.95 * MM, z_g + GASKET_T * 0.5), (R_MAJ + 0.75 * MM, z_g), (R_MAJ - 0.45 * MM, z_g)], n=256)
set_material(gasket, mats["goma"])

# thread: a real helix on the turned-down spout end (rounded crests and roots, ISO 60° flanks)
z_t0, z_t1 = z_g + GASKET_T - 0.2 * MM, z_g + GASKET_T + THREAD_L
NT_A, NT_Z = 360, int((z_t1 - z_t0) / (0.025 * MM))
tverts, tfaces = [], []
for j in range(NT_Z + 1):
    z = z_t0 + (z_t1 - z_t0) * j / NT_Z
    for i in range(NT_A):
        a = 2 * math.pi * i / NT_A
        ph = ((z - PITCH * a / (2 * math.pi)) / PITCH) % 1.0
        tri = 1 - abs(ph - 0.5) * 2                               # 0 root … 1 crest
        prof = min(1.0, tri * 1.25) ** 1.0
        prof = 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, (prof - 0.08) / 0.84)))   # rounded crest and root
        rr = R_MAJ - T_DEPTH * (1 - prof)
        tverts.append((rr * math.cos(a), rr * math.sin(a), z))
for j in range(NT_Z):
    for i in range(NT_A):
        a, b_ = j * NT_A + i, j * NT_A + (i + 1) % NT_A
        tfaces.append((a, b_, b_ + NT_A, a + NT_A))
thread = mesh_obj("rosca", tverts, tfaces)
set_material(thread, mats["laton"])

# spout: shoulder, then the tube rising and bending away from the camera
shoulder = lathe("hombro", [(R_MAJ - 0.6 * MM, z_t1 - 0.05 * MM), (R_MAJ - 0.1 * MM, z_t1), (R_TUBE - 0.35 * MM, z_t1 + 0.15 * MM),
                            (R_TUBE, z_t1 + 0.5 * MM), (R_TUBE, z_t1 + 1.0 * MM)], n=256)
set_material(shoulder, mats["laton"])
cu = bpy.data.curves.new("cano", "CURVE")
cu.dimensions = "3D"
cu.bevel_depth = R_TUBE
cu.bevel_resolution = 24
cu.resolution_u = 24
sp = cu.splines.new("BEZIER")
pts = [(0, 0, z_t1 + 0.9 * MM), (0, 0, z_t1 + 22 * MM), (0, 30 * MM, z_t1 + 62 * MM), (0, 120 * MM, z_t1 + 92 * MM)]
sp.bezier_points.add(len(pts) - 1)
for bp_, p in zip(sp.bezier_points, pts):
    bp_.co = p
    bp_.handle_left_type = bp_.handle_right_type = "AUTO"
sp.bezier_points[0].handle_left_type = sp.bezier_points[0].handle_right_type = "ALIGNED"
sp.bezier_points[0].handle_right = (0, 0, z_t1 + 12 * MM)
sp.bezier_points[0].handle_left = (0, 0, z_t1 - 10 * MM)
cano_ob = link(bpy.data.objects.new("cano_curve", cu))
dgx = bpy.context.evaluated_depsgraph_get()
SPOUT_BEZ = [(tuple(b_.co), tuple(b_.handle_left), tuple(b_.handle_right)) for b_ in cu.splines[0].bezier_points]
me = bpy.data.meshes.new_from_object(cano_ob.evaluated_get(dgx))
bpy.data.objects.remove(cano_ob)
spout = link(bpy.data.objects.new("cano", me))
spout.data.shade_smooth()
set_material(spout, mats["laton"])
print(f"tap built at {time.time() - t0:.1f}s", flush=True)

# ════════════════════════════════════════════════════════════════════════════════════════════════════
# THE BASIN (water level z = 0)
# ════════════════════════════════════════════════════════════════════════════════════════════════════
RIM_H, FAR_Y, HALF_W, FLOOR = 2.0 * MM, 330 * MM, 230 * MM, -28 * MM
water = mesh_obj("agua", [(-HALF_W, -480 * MM, 0), (HALF_W, -480 * MM, 0), (HALF_W, FAR_Y, 0), (-HALF_W, FAR_Y, 0)], [(0, 1, 2, 3)], smooth=False)
set_material(water, agua_mat)
# far rim: inner wall, rounded edge, top (a lathe-free extrusion along x), wet glints, beads
rp = [(FAR_Y, FLOOR), (FAR_Y, RIM_H - 1.2 * MM)]
for t in np.linspace(0, math.pi / 2, 10)[1:]:
    rp.append((FAR_Y + 1.2 * MM - 1.2 * MM * math.cos(t), RIM_H - 1.2 * MM + 1.2 * MM * math.sin(t)))
rp += [(FAR_Y + 40 * MM, RIM_H), (FAR_Y + 40 * MM, FLOOR)]
nx_r = 260
rverts, rfaces = [], []
rg2 = np.random.default_rng(5)
chip = fbm1(np.linspace(0, 6 * np.pi, nx_r), 9)
for i in range(nx_r):
    x = -HALF_W + 2 * HALF_W * i / (nx_r - 1)
    for j, (y, z) in enumerate(rp):
        dy = 0.25 * MM * chip[i] if 1 <= j <= len(rp) - 3 else 0.0     # the split edge of slate is never straight
        rverts.append((x, y + dy, z))
npj = len(rp)
for i in range(nx_r - 1):
    for j in range(npj - 1):
        a, b_ = i * npj + j, (i + 1) * npj + j
        rfaces.append((a, a + 1, b_ + 1, b_))
rim = mesh_obj("borde", rverts, rfaces)
fix_normals(rim)
set_material(rim, mats["pizarra"])
floor = mesh_obj("fondo", [(-HALF_W, -480 * MM, FLOOR), (HALF_W, -480 * MM, FLOOR), (HALF_W, FAR_Y, FLOOR), (-HALF_W, FAR_Y, FLOOR)], [(0, 1, 2, 3)], smooth=False)
set_material(floor, mats["pizarra"])
for k in range(9):                                                 # water beads sitting on the far rim
    x = rg2.uniform(-45, 45) * MM
    s = rg2.uniform(0.25, 0.7) * MM
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=s, location=(x, FAR_Y + rg2.uniform(2, 12) * MM, RIM_H))
    bd = bpy.context.object
    bd.scale = (1, 1, 0.55)
    bd.data.shade_smooth()
    set_material(bd, gota_mat)
print(f"basin built at {time.time() - t0:.1f}s", flush=True)

# ════════════════════════════════════════════════════════════════════════════════════════════════════
# WATER SHAPES — one shape key per frame, keyframed (linear) so motion blur interpolates them
# ════════════════════════════════════════════════════════════════════════════════════════════════════
PROF = GF["prof"]                       # (frames, M_PROF, 2): r, depth below the screen
TH = GF["theta"]
DROPR, DROPZ = GF["dropR"], GF["dropZ"]
SAT = GF["sat"]
NFR = FREEZE + 1


def pendant_verts(r, d):
    """Contact ring → tip, revolved; plus a closing disc slightly inside the screen."""
    th = np.linspace(0, 2 * np.pi, NSEG, endpoint=False)
    rows = [np.zeros((1, 3)) + [0, 0, HM + 0.25 * MM]]
    rows.append(np.stack([R_CONTACT_ * np.cos(th), R_CONTACT_ * np.sin(th), np.full(NSEG, HM + 0.25 * MM)], 1))
    for k in range(len(r) - 1):
        rows.append(np.stack([r[k] * np.cos(th), r[k] * np.sin(th), np.full(NSEG, HM - d[k])], 1))
    rows.append(np.array([[0, 0, HM - d[-1]]]))
    return np.concatenate(rows)


R_CONTACT_ = TL["rContact"]
nrows = PROF.shape[1] - 1 + 1        # contact … tip−1 rings, plus the disc ring
faces = []
idx0 = 1
# top pole → disc ring
faces += [(0, idx0 + (i + 1) % NSEG, idx0 + i) for i in range(NSEG)]
for k in range(nrows - 1):
    a0, b0 = idx0 + k * NSEG, idx0 + (k + 1) * NSEG
    faces += [(a0 + i, a0 + (i + 1) % NSEG, b0 + (i + 1) % NSEG, b0 + i) for i in range(NSEG)]
tip = idx0 + nrows * NSEG
last = idx0 + (nrows - 1) * NSEG
faces += [(last + i, last + (i + 1) % NSEG, tip) for i in range(NSEG)]
v_basis = pendant_verts(PROF[0, :, 0], PROF[0, :, 1])
assert tip == len(v_basis) - 1, (tip, len(v_basis))
pend = mesh_obj("colgante", v_basis, faces)
fix_normals(pend)
set_material(pend, gota_mat)
pend.cycles.use_deform_motion = False


def drop_verts(R):
    th = np.linspace(0, 2 * np.pi, NSEG, endpoint=False)
    rows = [np.array([[0, 0, R[0]]])]
    for k in range(1, len(R) - 1):
        rows.append(np.stack([R[k] * np.sin(TH[k]) * np.cos(th), R[k] * np.sin(TH[k]) * np.sin(th), np.full(NSEG, R[k] * np.cos(TH[k]))], 1))
    rows.append(np.array([[0, 0, -R[-1]]]))
    return np.concatenate(rows)


nr = len(TH) - 2
dfaces = [(0, 1 + i, 1 + (i + 1) % NSEG) for i in range(NSEG)]
for k in range(nr - 1):
    a0, b0 = 1 + k * NSEG, 1 + (k + 1) * NSEG
    dfaces += [(a0 + i, b0 + i, b0 + (i + 1) % NSEG, a0 + (i + 1) % NSEG) for i in range(NSEG)]
bot = 1 + nr * NSEG
lastd = 1 + (nr - 1) * NSEG
dfaces += [(lastd + i, bot, lastd + (i + 1) % NSEG) for i in range(NSEG)]
dropob = mesh_obj("gota", drop_verts(DROPR[PINCH]), dfaces)
fix_normals(dropob)
set_material(dropob, gota_mat)
dropob.cycles.use_deform_motion = False

bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1.0, location=(0, 0, 0))
satob = bpy.context.object
satob.name = "satelite"
satob.data.shade_smooth()
set_material(satob, gota_mat)


def shape_keys(ob, frames, verts_of):
    ob.shape_key_add(name="basis", from_mix=False)
    keys = {}
    for f in frames:
        kb = ob.shape_key_add(name=f"f{f:03d}", from_mix=False)
        kb.data.foreach_set("co", verts_of(f).astype(np.float32).ravel())
        keys[f] = kb
    prefs.keyframe_new_interpolation_type = "LINEAR"
    fl = sorted(frames)
    for f in fl:
        kb = keys[f]
        for g in (f - 1, f, f + 1):
            kb.value = 1.0 if g == f else 0.0
            kb.keyframe_insert("value", frame=g)
    return keys


fr_all = list(range(0, NFR))
shape_keys(pend, fr_all, lambda f: pendant_verts(PROF[f, :, 0], PROF[f, :, 1]))
fr_drop = list(range(PINCH, NFR))
shape_keys(dropob, fr_drop, lambda f: drop_verts(DROPR[f]))
print(f"shape keys at {time.time() - t0:.1f}s", flush=True)

prefs.keyframe_new_interpolation_type = "CONSTANT"
for ob, first in ((dropob, PINCH), (satob, int(np.argmax(SAT[:, 0] > 0)))):
    for f in (first - 1, first):
        ob.hide_render = f < first
        ob.keyframe_insert("hide_render", frame=f)
prefs.keyframe_new_interpolation_type = "LINEAR"
for f in range(PINCH, NFR):
    dropob.location = (0, 0, float(DROPZ[f]))
    dropob.keyframe_insert("location", frame=f)
    if SAT[f, 0] > 0:
        satob.location = (0, 0, float(SAT[f, 1]))
        satob.scale = (float(SAT[f, 2]), float(SAT[f, 2]), float(SAT[f, 3]))
        satob.keyframe_insert("location", frame=f)
        satob.keyframe_insert("scale", frame=f)
dropob.location = (0, 0, float(DROPZ[PINCH]))
dropob.keyframe_insert("location", frame=PINCH - 1)

# ring clock on the water shader
for f in range(0, NFR):
    tau_node.outputs[0].default_value = float(GF["tau"][f])
    tau_node.outputs[0].keyframe_insert("default_value", frame=f)

# dust on the water (riding the rings) and a few motes in the air
DUST, DS = GF["dust"], GF["dust_size"]
rgd = np.random.default_rng(77)
for k in range(DUST.shape[1]):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=float(DS[k]), location=tuple(DUST[0, k]))
    ob = bpy.context.object
    for v in ob.data.vertices:
        v.co = Vector((v.co.x * rgd.uniform(0.6, 1.4), v.co.y * rgd.uniform(0.6, 1.4), v.co.z * 0.25)) * rgd.uniform(0.8, 1.2)
    set_material(ob, mats["polvo"])
    for f in range(0, NFR, 3):
        ob.location = tuple(DUST[f, k])
        ob.keyframe_insert("location", frame=f)
AIR, AS = GF["air"], GF["air_size"]
for k in range(AIR.shape[1]):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=float(AS[k]), location=tuple(AIR[0, k]))
    ob = bpy.context.object
    set_material(ob, mats["polvo"])
    for f in (0, FREEZE):
        ob.location = tuple(AIR[f, k])
        ob.keyframe_insert("location", frame=f)
print(f"animation keyed at {time.time() - t0:.1f}s", flush=True)

# ════════════════════════════════════════════════════════════════════════════════════════════════════
# LIGHT
# ════════════════════════════════════════════════════════════════════════════════════════════════════
# horizon strip far behind the basin: the background glow, mirrored by the water, refracted upside-down by the drop
emission_panel("horizonte", (1.5, 0.050), (0.0, 1.10, 0.022), (0.0, -1.0, 0.022), 2.6, (1.0, 0.965, 0.93), soft=0.6,
               camera=True, grad=(1.0, 0.0))
# big softbox behind and above: the top of the drop and of the tap; the water near the camera mirrors it
emission_panel("cenital", (0.6, 0.45), (0.0, 0.30, 0.42), (0.0, 0.0, 0.03), 4.0, (1.0, 0.97, 0.94), soft=0.6)
# key, front-left above the lens: the window in the drop (its sharp highlight)
emission_panel("clave", (0.20, 0.15), (-0.20, -0.30, 0.20), (0.0, 0.0, 0.02), 14.0, (1.0, 0.97, 0.93), soft=0.25)
# edge strips: contour of the drop, vertical highlights down the housing and the spout
emission_panel("perfil_izq", (0.03, 0.40), (-0.24, 0.05, 0.06), (0.0, 0.0, 0.03), 22.0, (1.0, 0.97, 0.94), soft=0.6)
emission_panel("perfil_der", (0.03, 0.40), (0.25, 0.10, 0.05), (0.0, 0.0, 0.03), 16.0, (1.0, 0.52, 0.22), soft=0.6)
# low fill card at the front right (a broad, dim highlight on the housing)
emission_panel("relleno", (0.5, 0.25), (0.22, -0.38, 0.05), (0.0, 0.0, 0.03), 1.2, (1.0, 0.97, 0.94), soft=0.7)
world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0012, 0.0012, 0.0013, 1)
sc.world = world

# ════════════════════════════════════════════════════════════════════════════════════════════════════
# CAMERA + RENDER
# ════════════════════════════════════════════════════════════════════════════════════════════════════
cam_d = bpy.data.cameras.new("cam")
cam_d.sensor_fit = "VERTICAL"
cam_d.sensor_height = 12.0
cam_d.clip_start = 0.003
cam_d.clip_end = 5.0
cam_d.dof.use_dof = True
cam_d.dof.aperture_blades = 9
cam_d.dof.aperture_rotation = math.radians(10)
cam = link(bpy.data.objects.new("cam", cam_d))
sc.camera = cam
focus = link(bpy.data.objects.new("foco", None))
cam_d.dof.focus_object = focus
prefs.keyframe_new_interpolation_type = "BEZIER"
for f in range(0, NFR):
    px, py, pz, tx, ty, tz, fov, fstop, fz = TL["cam"][f]
    loc, tgt = Vector((px, py, pz)), Vector((tx, ty, tz))
    cam.location = loc
    cam.rotation_euler = (tgt - loc).to_track_quat("-Z", "Y").to_euler()
    cam_d.lens = (cam_d.sensor_height / 2) / math.tan(math.radians(fov / 2))
    cam_d.dof.aperture_fstop = fstop
    focus.location = (0, 0, fz)
    for ob, prop in ((cam, "location"), (cam, "rotation_euler"), (focus, "location")):
        ob.keyframe_insert(prop, frame=f)
    cam_d.keyframe_insert("lens", frame=f)
    cam_d.dof.keyframe_insert("aperture_fstop", frame=f)

sc.render.engine = "CYCLES"
cy = sc.cycles
cy.device = "CPU"
cy.samples = args.samples
cy.use_adaptive_sampling = True
cy.adaptive_threshold = 0.02
cy.adaptive_min_samples = min(16, args.samples)
cy.use_denoising = True
cy.denoiser = "OPENIMAGEDENOISE"
cy.denoising_input_passes = "RGB_ALBEDO_NORMAL"
cy.denoising_prefilter = "ACCURATE" if args.samples >= 64 else "FAST"
try:
    cy.denoising_quality = "HIGH" if args.samples >= 64 else "BALANCED"
except (AttributeError, TypeError):
    pass
cy.max_bounces = 16
cy.diffuse_bounces = 2
cy.glossy_bounces = 6
cy.transmission_bounces = 12
cy.transparent_max_bounces = 8
cy.caustics_reflective = False
cy.caustics_refractive = False
cy.blur_glossy = 0.4
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
print(f"scene ready at {time.time() - t0:.1f}s", flush=True)
if args.blend:
    bpy.ops.wm.save_as_mainfile(filepath=args.blend)

if args.export_wire:
    import export_wire  # noqa: E402  (the freeze pose, for the three.js layer)
    export_wire.run(bpy, sc, FREEZE, ROOT, dict(
        HM=HM, Z_LIP=Z_LIP, R_OUT=R_OUT, R_OPEN=R_OPEN, Z_TOP=Z_TOP, zk0=zk0, zk1=zk1, R_MAJ=R_MAJ, T_DEPTH=T_DEPTH,
        PITCH=PITCH, GASKET_T=GASKET_T, z_t0=z_t0, z_t1=z_t1, R_TUBE=R_TUBE, SPOUT_BEZ=SPOUT_BEZ, RIM_H=RIM_H, FAR_Y=FAR_Y))
    sys.exit(0)

if args.border:
    bx0, by0, bx1, by1 = (float(v) for v in args.border.split(","))
    sc.render.use_border, sc.render.use_crop_to_border = True, True
    sc.render.border_min_x, sc.render.border_min_y, sc.render.border_max_x, sc.render.border_max_y = bx0, by0, bx1, by1
os.makedirs(args.out, exist_ok=True)
sc.frame_start, sc.frame_end = F0, F1
sc.render.filepath = os.path.join(args.out, "a_####")
sc.render.use_overwrite = False          # resumable: frames already on disk are skipped
sc.render.use_placeholder = True
t1 = time.time()
bpy.ops.render.render(animation=True)
print(f"rendered frames {F0}-{F1} in {time.time() - t1:.1f}s ({(time.time() - t1) / (F1 - F0 + 1):.1f}s/frame)", flush=True)
