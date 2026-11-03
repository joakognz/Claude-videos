"""Path-traced plates for the countdown: two real gears engaging, shot like a slow-motion product macro.

Everything is modelled, not painted:
  · involute spur gears (scripts/gear_geom.py) built as 2D curves with holes, extruded, every edge rounded
    (0.12 mm) so each one catches a line of light
  · brass gear A (24 teeth): 6 lightening holes, front hub with a hex-socket set screw, keyway + key
  · steel gear B (32 teeth): 4 spoke windows, hub, set screw, keyway + key
  · polished shafts with a chamfer and a centre-drill mark, washers, E-clips
  · imperfections in the mesh: a chipped tooth, dents on the rim, a burr on a lightening hole
Surface: turning rings + circular anisotropic sheen on the faces, hobbing lines on the flanks, a polished
wear band at the pitch line, worn bright edges and grime in the roots (pointiness), fingerprints,
oxidation and dust (pre-computed map, box-projected). Lit by large emissive softboxes the metal mirrors.

Run:  <python-with-bpy> scripts/blender_engranajes.py [--frames 0-195] [--samples 32] [--out public/plates]
Also writes public/models/engranajes.glb (clean, unbevelled parts in their final pose, for the wireframe)
and src/partes.json (part names, centres and explode directions, three.js axes).
"""
import argparse, json, math, os, sys, time
import numpy as np
import bpy
from mathutils import Vector, Matrix
from shapely.geometry import Polygon
from shapely.geometry.polygon import orient

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gear_geom import profile  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--frames", default="0-195")
ap.add_argument("--samples", type=int, default=16)
ap.add_argument("--out", default=os.path.join(ROOT, "public", "plates"))
ap.add_argument("--res", type=float, default=1.0)
ap.add_argument("--noblur", action="store_true")
ap.add_argument("--noexport", action="store_true")
ap.add_argument("--border", default="")          # test crops: x0,y0,x1,y1 in 0..1 (y up)
args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
F0, F1 = (int(v) for v in args.frames.split("-"))
TL = json.load(open(os.path.join(ROOT, "src", "timeline-engranajes.json")))
TEX = os.path.join(ROOT, "public", "plates_src")
MM = 0.001
MOD = TL["module"]
ZA, ZB = TL["zA"], TL["zB"]
RA, RB = MOD * ZA / 2, MOD * ZB / 2
FREEZE = TL["freeze"]
PLATE_Y = 15 * MM          # front face of the mounting plate, behind the gears (world +Y)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
dg = None


def link(ob):
    sc.collection.objects.link(ob)
    return ob


def mesh_from(ob, name=None, keep=False):
    """Evaluate an object (curve or mesh with modifiers) into a plain mesh object."""
    global dg
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=2e-7)   # weld the curve's cap/bevel seams → closed solid
    bm.to_mesh(me)
    bm.free()
    out = link(bpy.data.objects.new(name or ob.name, me))
    out.matrix_world = ob.matrix_world.copy()
    if not keep:
        bpy.data.objects.remove(ob)
    return out


def circle(r, n=96, start=0.0, cx=0.0, cy=0.0):
    a = start + np.linspace(0, 2 * np.pi, n, endpoint=False)
    return np.stack([cx + r * np.cos(a), cy + r * np.sin(a)], 1)


def bore_with_keyway(r, kw, kd, n=120):
    """Bore outline with a rectangular keyway notch at +Y."""
    half = math.asin(kw / 2 / r)
    a = np.linspace(math.pi / 2 + half, math.pi / 2 - half + 2 * math.pi, n)
    pts = [(r * math.cos(t), r * math.sin(t)) for t in a]
    pts += [(kw / 2, r * math.cos(half)), (kw / 2, r + kd), (-kw / 2, r + kd), (-kw / 2, r * math.cos(half))]
    return np.array(pts)


def rounded_sector(r0, r1, a0, a1, rc, n=18):
    """Spoke window: an annular sector with rounded corners."""
    pts = []
    da0 = rc / r1
    da1 = rc / r0
    for t in np.linspace(a0 + da0, a1 - da0, n * 2):
        pts.append((r1 * math.cos(t), r1 * math.sin(t)))
    for t in np.linspace(0, math.pi / 2, n // 2):  # corner (outer, end)
        cx, cy = (r1 - rc) * math.cos(a1 - da0), (r1 - rc) * math.sin(a1 - da0)
        pts.append((cx + rc * math.cos(a1 - da0 + t), cy + rc * math.sin(a1 - da0 + t)))
    for t in np.linspace(a1 - da1, a0 + da1, n * 2):
        pts.append((r0 * math.cos(t), r0 * math.sin(t)))
    for t in np.linspace(0, math.pi / 2, n // 2):  # corner (inner, start)
        cx, cy = (r0 + rc) * math.cos(a0 + da1), (r0 + rc) * math.sin(a0 + da1)
        pts.append((cx + rc * math.cos(a0 + da1 + math.pi + t), cy + rc * math.sin(a0 + da1 + math.pi + t)))
    return np.array(pts)


def shrink(outer, holes, bevel, corner=0.1 * MM):
    """Morphological shrink of the outline so that the curve bevel grows it back to the exact profile.
    Convex corners come back rounded (radius `corner` in plan view), concave ones (root fillets) untouched."""
    P = Polygon(outer, [h for h in holes])
    if not P.is_valid:
        P = P.buffer(0)
    if bevel > 0:
        P = P.buffer(-(bevel + corner), quad_segs=6, join_style="round").buffer(corner, quad_segs=6, join_style="round")
        P = P.simplify(0.002 * MM, preserve_topology=True)
    polys = list(P.geoms) if P.geom_type == "MultiPolygon" else [P]
    rings = []
    for q in polys:
        q = orient(q, 1.0)
        rings.append(np.array(q.exterior.coords)[:-1])
        rings += [np.array(i.coords)[:-1] for i in q.interiors]
    return rings


def curve_solid(name, outer, holes, z0, z1, bevel):
    """Extrude a 2D outline (with holes) between z0 and z1 (local), rounding every edge by `bevel`."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    for poly in shrink(outer, holes, bevel):
        sp = cu.splines.new("POLY")
        sp.points.add(len(poly) - 1)
        for i, (x, y) in enumerate(poly):
            sp.points[i].co = (x, y, 0, 1)
        sp.use_cyclic_u = True
    cu.extrude = max((z1 - z0) / 2 - bevel, 1e-6)
    cu.bevel_depth = bevel
    cu.bevel_resolution = 5 if bevel > 0 else 0
    cu.offset = 0.0                         # the outline was already pulled in by the bevel (shrink)
    ob = link(bpy.data.objects.new(name, cu))
    ob.location = (0, 0, (z0 + z1) / 2)
    out = mesh_from(ob, name)
    out.data.transform(out.matrix_world)    # bake: mesh coordinates = assembly coordinates
    out.matrix_world = Matrix()
    return out


def set_material(ob, m):
    """Booleans can leave empty material slots behind; faces pointing at one would render with the default grey."""
    ob.data.materials.clear()
    ob.data.materials.append(m)
    ob.data.polygons.foreach_set("material_index", [0] * len(ob.data.polygons))


def finish_normals(me, angle=35):
    """Smooth shading that keeps flat faces flat: the long fill triangles of a cap (and the tall quads of a side wall)
    must not inherit the tilt of the rounded edge next to them, or the reflections smear into wavy bands.
    So every edge between a cap/wall face and a bevel face is split; the bevel stays smooth on its own."""
    import bmesh
    me.shade_smooth()
    me.set_sharp_from_angle(angle=math.radians(angle))
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.normal_update()

    def kind(f):
        z = abs(f.normal.z)
        return 2 if z > 0.9995 else (1 if z < 0.0005 else 0)       # 2 cap, 1 wall, 0 rounded/other
    for e in bm.edges:
        if len(e.link_faces) == 2:
            k0, k1 = kind(e.link_faces[0]), kind(e.link_faces[1])
            if k0 != k1:
                e.smooth = False
    bm.to_mesh(me)
    bm.free()


def boolean(ob, cutters, op="DIFFERENCE"):
    for c in cutters:
        m = ob.modifiers.new("b", "BOOLEAN")
        m.operation = op
        m.object = c
        m.solver = "EXACT"
    res = mesh_from(ob, ob.name, keep=True)
    res.matrix_world = ob.matrix_world.copy()
    bpy.data.objects.remove(ob)
    for c in cutters:
        bpy.data.objects.remove(c)
    return res


def cyl_cutter(r, z0, z1, loc=(0, 0, 0), rot=(0, 0, 0), n=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=n, radius=r, depth=z1 - z0, location=(0, 0, (z0 + z1) / 2))
    c = bpy.context.object
    c.matrix_world = Matrix.Translation(loc) @ Matrix.Rotation(rot[2], 4, "Z") @ Matrix.Rotation(rot[1], 4, "Y") @ Matrix.Rotation(rot[0], 4, "X") @ c.matrix_world
    return c


def lumpy(r, loc, seed, sx=1.0, sy=1.0, sz=1.0):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=r, location=loc)
    c = bpy.context.object
    rg = np.random.default_rng(seed)
    for v in c.data.vertices:
        v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz)) * rg.uniform(0.75, 1.2)
    return c


# ── one gear assembly (local frame: gear plane XY, +Z toward the camera) ─────────────────────────
def gear_assembly(tag, z, thick, bore_r, holes, hub_r, hub_len, screw_ang, chip_ang=None, seed=0, wire=False):
    bev = 0 if wire else 0.12 * MM
    rg = np.random.default_rng(seed)
    parts = {}
    outer = profile(MOD, z)
    kw, kd = 1.6 * MM, 0.8 * MM
    bore = bore_with_keyway(bore_r, kw, kd)
    gear = curve_solid(f"engranaje{tag}", outer, holes + [bore], -thick / 2, thick / 2, bev)
    hub = curve_solid(f"cubo{tag}", circle(hub_r, 160), [bore], thick / 2 - 0.2 * MM, thick / 2 + hub_len, bev)
    # radial threaded hole for the set screw, through the hub wall
    zc = thick / 2 + hub_len * 0.55
    sh = cyl_cutter(0.75 * MM, 0, hub_r * 1.5, loc=(0, 0, zc), rot=(-math.pi / 2, 0, screw_ang - math.pi / 2))
    hub = boolean(hub, [sh])
    if not wire:
        cutters = []
        if chip_ang is not None:  # a chipped tooth: a bite out of the front tip corner
            rt = MOD * (z / 2 + 1)
            cutters.append(lumpy(0.55 * MM, (rt * math.cos(chip_ang), rt * math.sin(chip_ang), thick / 2), seed + 1, 1.3, 0.9, 1.0))
        for k in range(5):  # small dings on the rim of the front face
            a = rg.uniform(0, 2 * np.pi)
            rr = MOD * (z / 2 - 1.6) - rg.uniform(0.2, 0.8) * MM
            cutters.append(lumpy(rg.uniform(0.18, 0.3) * MM, (rr * math.cos(a), rr * math.sin(a), thick / 2 + 0.16 * MM), seed + 10 + k))
        gear = boolean(gear, cutters)
    gear = join([gear, hub], f"engranaje{tag}")
    parts[f"engranaje{tag}"] = gear
    # key in the keyway
    key = curve_solid(f"chaveta{tag}", np.array([(-kw / 2 + 0.02 * MM, bore_r - 0.7 * MM), (kw / 2 - 0.02 * MM, bore_r - 0.7 * MM),
                                                 (kw / 2 - 0.02 * MM, bore_r + kd - 0.03 * MM), (-kw / 2 + 0.02 * MM, bore_r + kd - 0.03 * MM)]),
                      [], -thick / 2 - 0.5 * MM, thick / 2 + hub_len - 0.3 * MM, 0 if wire else 0.05 * MM)
    parts[f"engranaje{tag}_chaveta"] = key
    # shaft: polished, chamfered front, centre-drill mark
    front = thick / 2 + hub_len + 1.9 * MM
    shaft = curve_solid(f"eje{tag}", circle(bore_r - 0.01 * MM, 128), [], -PLATE_Y - 2 * MM, front, 0 if wire else 0.35 * MM)
    if not wire:
        bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.55 * MM, radius2=0.0, depth=0.5 * MM, location=(0, 0, front - 0.2 * MM))
        drill = bpy.context.object
        drill.rotation_euler = (math.pi, 0, 0)
        shaft = boolean(shaft, [drill])
        # the E-clip groove
        gr = curve_solid("ranura", circle(bore_r + 1 * MM, 96), [circle(bore_r - 0.22 * MM, 96)], front - 1.25 * MM, front - 0.75 * MM, 0)
        shaft = boolean(shaft, [gr])
    parts[f"eje{tag}"] = shaft
    # washer + E-clip in front of the hub
    w0 = thick / 2 + hub_len
    washer = curve_solid(f"arandela{tag}", circle(hub_r - 0.4 * MM, 160), [circle(bore_r + 0.08 * MM, 128)], w0, w0 + 0.6 * MM, 0 if wire else 0.08 * MM)
    parts[f"arandela{tag}"] = washer
    a_open = math.radians(70)
    ring = np.vstack([circle(bore_r + 1.25 * MM, 120, start=a_open / 2)[:int(120 * (1 - a_open / 2 / math.pi))],
                      circle(bore_r - 0.2 * MM, 120, start=a_open / 2)[:int(120 * (1 - a_open / 2 / math.pi))][::-1]])
    clip = curve_solid(f"arandela{tag}_clip", ring, [], front - 1.2 * MM, front - 0.8 * MM, 0 if wire else 0.06 * MM)
    clip.rotation_euler = (0, 0, screw_ang + 2.2)
    parts[f"arandela{tag}_clip"] = clip
    # hex-socket set screw sitting in its hole, flush with the hub
    sc_len = 2.2 * MM
    screw = curve_solid(f"tornillo{tag}", circle(0.72 * MM, 64), [], 0, sc_len, 0 if wire else 0.05 * MM)
    if not wire:
        hexc = curve_solid("hex", circle(0.36 * MM, 6, start=math.pi / 6), [], sc_len - 0.6 * MM, sc_len + 0.2 * MM, 0)
        screw = boolean(screw, [hexc])
    screw.matrix_world = (Matrix.Translation((0, 0, zc)) @ Matrix.Rotation(screw_ang - math.pi / 2, 4, "Z") @
                          Matrix.Translation((0, hub_r - sc_len + 0.04 * MM, 0)) @ Matrix.Rotation(-math.pi / 2, 4, "X"))
    parts[f"tornillo{tag}"] = screw
    return parts, zc


def join(objs, name):
    me = bpy.data.meshes.new(name)
    import bmesh
    bm = bmesh.new()
    for o in objs:
        tmp = o.data.copy()
        tmp.transform(o.matrix_world)
        bm.from_mesh(tmp)
        bpy.data.meshes.remove(tmp)
    bm.to_mesh(me)
    bm.free()
    for o in objs:
        bpy.data.objects.remove(o)
    return link(bpy.data.objects.new(name, me))


# ── materials ───────────────────────────────────────────────────────────────────────────────────
def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


grime_img = bpy.data.images.load(os.path.join(TEX, "huellas.png"))
grime_img.colorspace_settings.name = "Non-Color"


def metal(name, base, ox_col, rough, aniso=0.6, pitch_r=None, rings=True, ox_amt=0.35, smudge_amt=0.3, face_rough=0.0, face_tint=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    N = nt.nodes.new
    L = nt.links.new
    out = N("ShaderNodeOutputMaterial")
    bs = N("ShaderNodeBsdfPrincipled")
    tc = N("ShaderNodeTexCoord")
    geo = N("ShaderNodeNewGeometry")
    sep = N("ShaderNodeSeparateXYZ")
    L(tc.outputs["Object"], sep.inputs[0])

    def math_(op, a, b=None):
        n = N("ShaderNodeMath")
        n.operation = op
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                n.inputs[i].default_value = v
            else:
                L(v, n.inputs[i])
        return n.outputs[0]

    def clamp01(v):
        n = N("ShaderNodeClamp")
        L(v, n.inputs[0])
        return n.outputs[0]

    r = math_("SQRT", math_("ADD", math_("MULTIPLY", sep.outputs["X"], sep.outputs["X"]), math_("MULTIPLY", sep.outputs["Y"], sep.outputs["Y"])))
    # face vs flank, from the normal in object space
    vt = N("ShaderNodeVectorTransform")
    vt.vector_type = "NORMAL"
    vt.convert_from = "WORLD"
    vt.convert_to = "OBJECT"
    L(geo.outputs["Normal"], vt.inputs[0])
    nsep = N("ShaderNodeSeparateXYZ")
    L(vt.outputs[0], nsep.inputs[0])
    face = math_("POWER", math_("ABSOLUTE", nsep.outputs["Z"]), 4.0)
    flank = math_("SUBTRACT", 1.0, face)
    # pointiness: bright worn edges, grime in the hollows
    edge = clamp01(math_("MULTIPLY", math_("SUBTRACT", geo.outputs["Pointiness"], 0.53), 14.0))
    hollow = clamp01(math_("MULTIPLY", math_("SUBTRACT", 0.47, geo.outputs["Pointiness"]), 12.0))
    # grime map, box-projected
    mp = N("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (11, 11, 11)
    L(tc.outputs["Object"], mp.inputs["Vector"])
    gi = N("ShaderNodeTexImage")
    gi.image = grime_img
    gi.projection = "BOX"
    gi.projection_blend = 0.3
    L(mp.outputs[0], gi.inputs["Vector"])
    gs = N("ShaderNodeSeparateColor")
    L(gi.outputs["Color"], gs.inputs[0])
    smudge, ox, dust = gs.outputs["Red"], gs.outputs["Green"], gs.outputs["Blue"]
    # base colour: oxidised in patches and in the hollows, bright on worn edges
    mix_ox = N("ShaderNodeMix")
    mix_ox.data_type = "RGBA"
    L(clamp01(math_("MULTIPLY", math_("ADD", math_("MULTIPLY", ox, ox_amt), math_("MULTIPLY", hollow, 0.5)), math_("SUBTRACT", 1.0, edge))), mix_ox.inputs[0])
    mix_ox.inputs[6].default_value = (*base, 1)
    mix_ox.inputs[7].default_value = (*ox_col, 1)
    col = mix_ox.outputs[2]
    if face_tint != 1.0:          # end faces darker than the sides (ground and heat-tinted shaft ends)
        tint = N("ShaderNodeMix")
        tint.data_type = "RGBA"
        tint.blend_type = "MULTIPLY"
        L(face, tint.inputs[0])
        L(col, tint.inputs[6])
        tint.inputs[7].default_value = (face_tint, face_tint * 0.97, face_tint * 0.93, 1)
        col = tint.outputs[2]
    # roughness: base + smudges + dust − worn edges − the polished band at the pitch line
    rgh = math_("ADD", rough, math_("MULTIPLY", smudge, smudge_amt))
    rgh = math_("ADD", rgh, math_("MULTIPLY", dust, 0.1))
    rgh = math_("ADD", rgh, math_("MULTIPLY", hollow, 0.18))
    if face_rough:
        rgh = math_("ADD", rgh, math_("MULTIPLY", face, face_rough))
    rgh = math_("SUBTRACT", rgh, math_("MULTIPLY", edge, 0.08))
    if pitch_r is not None:
        d = math_("DIVIDE", math_("ABSOLUTE", math_("SUBTRACT", r, pitch_r)), 0.45 * MM)
        band = math_("MULTIPLY", math_("EXPONENT", math_("MULTIPLY", math_("MULTIPLY", d, d), -1.0)), flank)
        rgh = math_("SUBTRACT", rgh, math_("MULTIPLY", band, 0.09))
    L(clamp01(rgh), bs.inputs["Roughness"])
    L(col, bs.inputs["Base Color"])
    bs.inputs["Metallic"].default_value = 1.0
    # relief: turning rings on the faces, hobbing lines across the flanks, scratches
    h = None
    if rings:
        # turning marks: the feed wanders a little and the tool pressure varies, so the rings are neither perfectly
        # regular nor equally deep (a perfect sine reads as a vinyl record)
        nz = N("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = 450.0
        nz.inputs["Detail"].default_value = 1.0
        L(tc.outputs["Object"], nz.inputs["Vector"])
        rw = math_("ADD", r, math_("MULTIPLY", nz.outputs["Fac"], 0.05 * MM))
        ring = math_("SINE", math_("MULTIPLY", rw, 2 * math.pi / (0.045 * MM)))
        depth = math_("ADD", 0.25, math_("MULTIPLY", math_("POWER", nz.outputs["Fac"], 2.0), 1.1))
        h = math_("MULTIPLY", math_("MULTIPLY", math_("MULTIPLY", ring, depth), face), 0.13)
        hob = math_("SINE", math_("MULTIPLY", math_("ADD", sep.outputs["Z"], math_("MULTIPLY", nz.outputs["Fac"], 0.04 * MM)),
                                  2 * math.pi / (0.11 * MM)))
        h = math_("ADD", h, math_("MULTIPLY", math_("MULTIPLY", hob, flank), 0.14))
    if h is not None:
        bump = N("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.12
        bump.inputs["Distance"].default_value = 0.000004
        L(h, bump.inputs["Height"])
        L(bump.outputs["Normal"], bs.inputs["Normal"])
    # circular brushed sheen around the axis (turned metal)
    tg = N("ShaderNodeTangent")
    tg.direction_type = "RADIAL"
    tg.axis = "Z"
    L(tg.outputs["Tangent"], bs.inputs["Tangent"])
    L(math_("MULTIPLY", face, aniso), bs.inputs["Anisotropic"])
    L(bs.outputs[0], out.inputs["Surface"])
    return m


def emission_panel(name, size, loc, aim, strength, color=(1, 0.97, 0.93), soft=0.35):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    p = bpy.context.object
    p.name = name
    p.scale = (size[0], size[1], 1)
    p.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat("Z", "Y").to_euler()
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    # a softbox: brighter in the middle, falling off to the edges (reads as a real diffuser in reflections)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["UV"], sep.inputs[0])
    def edgefall(c):
        n1 = nt.nodes.new("ShaderNodeMath"); n1.operation = "SUBTRACT"; n1.inputs[1].default_value = 0.5
        nt.links.new(c, n1.inputs[0])
        n2 = nt.nodes.new("ShaderNodeMath"); n2.operation = "ABSOLUTE"; nt.links.new(n1.outputs[0], n2.inputs[0])
        n3 = nt.nodes.new("ShaderNodeMapRange"); n3.inputs["From Min"].default_value = 0.5 - soft * 0.5
        n3.inputs["From Max"].default_value = 0.5; n3.inputs["To Min"].default_value = 1; n3.inputs["To Max"].default_value = 0.15
        nt.links.new(n2.outputs[0], n3.inputs["Value"])
        return n3.outputs[0]
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
    nt.links.new(edgefall(sep.outputs["X"]), mul.inputs[0]); nt.links.new(edgefall(sep.outputs["Y"]), mul.inputs[1])
    s2 = nt.nodes.new("ShaderNodeMath"); s2.operation = "MULTIPLY"; s2.inputs[1].default_value = strength
    nt.links.new(mul.outputs[0], s2.inputs[0])
    nt.links.new(s2.outputs[0], em.inputs["Strength"])
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    p.data.materials.append(m)
    p.visible_camera = False
    p.visible_shadow = False
    return p


# ── build ───────────────────────────────────────────────────────────────────────────────────────
t0 = time.time()
thA = TL["thetaA"][FREEZE]
thB = TL["thetaB"][FREEZE]
# where things end up on screen in the final pose (angles in the gear plane, screen-CCW)
screwA = math.radians(38) - thA            # set screw of A pointing up-right at the freeze
screwB = math.radians(200) - thB
chipA = math.radians(-75) - thA           # the chipped tooth: next to the meshing one, in the frozen close-up
chipA = round((chipA) / (2 * math.pi / ZA)) * (2 * math.pi / ZA)
holesA = [circle(1.9 * MM, 72, cx=7.1 * MM * math.cos(a), cy=7.1 * MM * math.sin(a)) for a in np.arange(6) * math.pi / 3 + 0.3]
holesB = [rounded_sector(7.2 * MM, 12.4 * MM, a, a + math.radians(62), 1.2 * MM) for a in np.arange(4) * math.pi / 2 + 0.4]

mats = {
    "laton": metal("laton", lin("#e8c27a"), lin("#6a3f1c"), 0.075, pitch_r=RA, ox_amt=0.3),
    "acero": metal("acero", lin("#c6c8cc"), lin("#4b4844"), 0.1, aniso=0.35, pitch_r=RB, ox_amt=0.18),
    "eje": metal("eje", lin("#8a8d91"), lin("#4a4640"), 0.07, aniso=0.8, ox_amt=0.2, smudge_amt=0.15, face_tint=0.45),
    "pavonado": metal("pavonado", lin("#141518"), lin("#050505"), 0.34, aniso=0.0, rings=False, ox_amt=0.05),
    "zinc": metal("zinc", lin("#b9bec4"), lin("#6b6e70"), 0.28, ox_amt=0.12),
}
mat_of = {"engranajeA": "laton", "engranajeB": "acero", "ejeA": "eje", "ejeB": "eje", "tornilloA": "pavonado",
          "tornilloB": "pavonado", "arandelaA": "zinc", "arandelaB": "zinc", "arandelaA_clip": "pavonado",
          "arandelaB_clip": "pavonado", "engranajeA_chaveta": "eje", "engranajeB_chaveta": "eje"}

pivots, spinners, render_parts = {}, {}, {}
specs = {"A": dict(z=ZA, thick=5.0 * MM, bore_r=2.5 * MM, holes=holesA, hub_r=4.6 * MM, hub_len=3.4 * MM, screw_ang=screwA, chip_ang=chipA, seed=3),
         "B": dict(z=ZB, thick=6.0 * MM, bore_r=3.0 * MM, holes=holesB, hub_r=5.6 * MM, hub_len=3.0 * MM, screw_ang=screwB, chip_ang=None, seed=8)}
for tag, sp in specs.items():
    piv = link(bpy.data.objects.new(f"pivot{tag}", None))
    piv.rotation_euler = (math.pi / 2, 0, 0)            # gear plane XY → world XZ, +Z local → toward the camera (−Y)
    spn = link(bpy.data.objects.new(f"giro{tag}", None))
    spn.parent = piv
    pivots[tag], spinners[tag] = piv, spn
    parts, _ = gear_assembly(tag, **sp)
    for name, ob in parts.items():
        ob.parent = spn
        set_material(ob, mats[mat_of[name]])
        finish_normals(ob.data)
        ob.name = "r_" + name
        render_parts[name] = ob
    print(f"gear {tag}: {sum(len(o.data.vertices) for o in parts.values())} verts at {time.time() - t0:.1f}s", flush=True)
pivots["B"].location = (0, 0, -RB)

# dust specks resting on the front faces (tiny irregular flakes)
rgd = np.random.default_rng(77)
dmat = bpy.data.materials.new("polvo")
dmat.use_nodes = True
dmat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.32, 0.31, 0.29, 1)
dmat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9
for tag, thick, rmax in (("A", 5.0 * MM, RA - 1.4 * MM), ("B", 6.0 * MM, RB - 1.4 * MM)):
    for k in range(7):
        a, rr = rgd.uniform(0, 2 * np.pi), rgd.uniform(5 * MM, rmax)
        d = lumpy(rgd.uniform(0.02, 0.05) * MM, (rr * math.cos(a), rr * math.sin(a), thick / 2 + 0.01 * MM), 300 + k, 1.0, rgd.uniform(0.4, 1.0), 0.3)
        set_material(d, dmat)
        d.parent = spinners[tag]

# ── the mounting plate behind: black anodised aluminium, face-milled, with pressed-in brass bushings ─────
def plate_material():
    """Out of focus at every distance, so only its tone and a broad roughness variation matter (cheap to shade)."""
    m = bpy.data.materials.new("placa")
    m.use_nodes = True
    nt = m.node_tree
    bs = nt.nodes["Principled BSDF"]
    bs.inputs["Base Color"].default_value = (0.02, 0.021, 0.023, 1)
    bs.inputs["Metallic"].default_value = 0.0
    tc = nt.nodes.new("ShaderNodeTexCoord")
    gi = nt.nodes.new("ShaderNodeTexImage")
    gi.image = grime_img
    mp2 = nt.nodes.new("ShaderNodeMapping")
    mp2.inputs["Scale"].default_value = (6, 6, 6)
    mp2.inputs["Rotation"].default_value = (math.pi / 2, 0, 0)
    nt.links.new(tc.outputs["Object"], mp2.inputs["Vector"])
    nt.links.new(mp2.outputs[0], gi.inputs["Vector"])
    sp = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(gi.outputs["Color"], sp.inputs[0])
    rg = nt.nodes.new("ShaderNodeMath"); rg.operation = "MULTIPLY_ADD"
    nt.links.new(sp.outputs["Red"], rg.inputs[0]); rg.inputs[1].default_value = 0.25; rg.inputs[2].default_value = 0.3
    nt.links.new(rg.outputs[0], bs.inputs["Roughness"])
    return m


plate = curve_solid("placa", np.array([(-50 * MM, -70 * MM), (50 * MM, -70 * MM), (50 * MM, 70 * MM), (-50 * MM, 70 * MM)]),
                    [circle(2.5 * MM + 0.15 * MM, 96, cx=0, cy=RA + TL["gap"][FREEZE]), circle(3.0 * MM + 0.15 * MM, 96, cx=0, cy=-RB)],
                    0, 4 * MM, 0.5 * MM)
plate.matrix_world = Matrix.Translation((0, PLATE_Y + 4 * MM, 0)) @ Matrix.Rotation(math.pi / 2, 4, "X")
set_material(plate, plate_material())
finish_normals(plate.data)
# A moves on its slide (the gap closes), so its bushing is a slotted guide; B's is a plain flanged bushing
for tag, br, zc in (("A", 2.5 * MM, None), ("B", 3.0 * MM, -RB)):
    if tag == "A":
        z_lo, z_hi = RA + TL["gap"][FREEZE], RA + TL["gap"][0]
        slot = np.vstack([circle(br + 0.12 * MM, 64, cx=0, cy=z_hi)[0:33], circle(br + 0.12 * MM, 64, cx=0, cy=z_lo)[32:64],
                          circle(br + 0.12 * MM, 64, cx=0, cy=z_lo)[0:1]])
        a0 = np.arctan2(slot[:, 1] - (z_lo + z_hi) / 2, slot[:, 0])
        outer = np.array([[(br + 2.4 * MM) * math.cos(t), (z_lo + z_hi) / 2 + ((z_hi - z_lo) / 2 + br + 2.4 * MM) * math.sin(t)] for t in np.linspace(0, 2 * math.pi, 128, endpoint=False)])
        gd = curve_solid("guiaA", outer, [], 0, 1.2 * MM, 0.25 * MM)
        cut = curve_solid("ranuraA", np.array([(-(br + 0.12 * MM), z_lo), (br + 0.12 * MM, z_lo), (br + 0.12 * MM, z_hi), (-(br + 0.12 * MM), z_hi)]),
                          [], -1 * MM, 3 * MM, 0)
        c1 = curve_solid("c1", circle(br + 0.12 * MM, 64, cx=0, cy=z_lo), [], -1 * MM, 3 * MM, 0)
        c2 = curve_solid("c2", circle(br + 0.12 * MM, 64, cx=0, cy=z_hi), [], -1 * MM, 3 * MM, 0)
        gd = boolean(gd, [cut, c1, c2])
    else:
        gd = curve_solid("casquilloB", circle(br + 2.2 * MM, 128, cx=0, cy=zc), [circle(br + 0.06 * MM, 96, cx=0, cy=zc)], 0, 1.0 * MM, 0.25 * MM)
    gd.matrix_world = Matrix.Translation((0, PLATE_Y, 0)) @ Matrix.Rotation(math.pi / 2, 4, "X")
    set_material(gd, mats["laton"])
    finish_normals(gd.data)
# four button-head screws holding the plate (only their blurred highlights will ever be seen)
for k, (x, zz) in enumerate(((-38, 52), (38, 52), (-38, -52), (38, -52))):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=3.2 * MM, location=(x * MM, PLATE_Y, zz * MM))
    hd = bpy.context.object
    hd.scale = (1, 0.45, 1)
    set_material(hd, mats["pavonado"])
    hd.data.shade_smooth()

# ── wireframe export: clean unbevelled parts, in their final pose, world space ───────────────────
if not args.noexport:
    pivots["A"].location = (0, 0, RA + TL["gap"][FREEZE])
    spinners["A"].rotation_euler = (0, 0, thA)
    spinners["B"].rotation_euler = (0, 0, thB)
    bpy.context.view_layer.update()
    for o in list(bpy.context.selected_objects):
        o.select_set(False)
    meta = []
    wire_objs = []
    for tag, sp in specs.items():
        wparts, _ = gear_assembly(tag, **dict(sp, wire=True))
        for name, ob in wparts.items():
            ob.parent = spinners[tag]
        bpy.context.view_layer.update()
        for name, ob in wparts.items():
            mw = ob.matrix_world.copy()
            me = ob.data.copy()
            me.transform(mw)
            bpy.data.objects.remove(ob)
            w = link(bpy.data.objects.new(name, me))
            w.name = name
            w.hide_render = True
            wire_objs.append(w)
            # explode direction (three.js axes: x, z, −y): along the axis toward the camera, screws radially
            axis = (pivots[tag].matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()
            c = sum((Vector(v.co) for v in me.vertices), Vector()) / max(1, len(me.vertices))
            if name.startswith("tornillo"):
                ctr = pivots[tag].matrix_world.translation
                dirv = (c - ctr)
                dirv = (dirv - axis * dirv.dot(axis)).normalized()
                dist = 7 * MM
            elif name.startswith("arandela"):
                dirv, dist = axis, (11 if name.endswith("clip") else 9) * MM
            elif name.startswith("engranaje"):
                dirv, dist = axis, 4.5 * MM
            else:
                dirv, dist = axis, 0.0
            t3 = lambda v: [round(v.x, 6), round(v.z, 6), round(-v.y, 6)]
            meta.append({"name": name, "center": t3(c), "dir": t3(dirv), "dist": round(dist, 5)})
    for w in wire_objs:
        w.select_set(True)
    os.makedirs(os.path.join(ROOT, "public", "models"), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, "public", "models", "engranajes.glb"), export_format="GLB",
                              use_selection=True, export_apply=True, export_materials="NONE", export_normals=False)
    for w in wire_objs:
        bpy.data.objects.remove(w)
    up = (pivots["A"].matrix_world.to_3x3() @ Vector((0, 1, 0)))
    json.dump({"parts": meta, "liftA": [0.0, 1.0, 0.0], "liftDist": 5 * MM}, open(os.path.join(ROOT, "src", "partes.json"), "w"), indent=1)
    print(f"wire GLB exported ({len(meta)} parts) at {time.time() - t0:.1f}s", flush=True)

# ── light: big diffusers the metal mirrors, strips for the edges, a soft card behind the camera ──
emission_panel("key", (0.75, 0.55), (-0.42, -0.55, 0.38), (0, 0, 0), 9.0, (1.0, 0.95, 0.88))
emission_panel("card", (1.1, 0.8), (0.32, -0.8, 0.08), (0, 0, 0), 1.6, (0.95, 0.96, 1.0))
emission_panel("rim_l", (0.07, 0.9), (-0.33, 0.33, 0.12), (0, 0, 0), 14.0)
emission_panel("rim_r", (0.07, 0.9), (0.36, 0.3, -0.04), (0, 0, 0), 11.0, (0.96, 0.97, 1.0))
emission_panel("top", (0.7, 0.09), (0.0, -0.12, 0.52), (0, 0, 0), 7.0)
emission_panel("floor", (0.9, 0.6), (0.0, -0.32, -0.55), (0, 0, 0), 0.5, (1.0, 0.93, 0.86))
# the softboxes the polished faces mirror. A flat face only reflects a small cone of directions, so each one is placed
# on the reflection of the camera ray off that face (at the freeze) and offset so a soft edge runs across it:
# a gradient that slides as the slider moves, which is what tells the eye "polished metal" rather than "paint".
def refl_dir(P):
    cx, cy, cz = TL["cam"][FREEZE][:3]
    v = (Vector((cx, cy, cz)) - Vector(P)).normalized()
    return Vector((-v.x, v.y, -v.z))                 # mirrored in a face whose normal is −Y


def panel_dir(name, d, d_az, d_el, dist, w_deg, h_deg, strength, color=(1, 0.97, 0.93), soft=0.5):
    az = math.atan2(d.x, -d.y) + math.radians(d_az)
    el = math.asin(max(-1, min(1, d.z))) + math.radians(d_el)
    pos = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el))) * dist
    size = (2 * dist * math.tan(math.radians(w_deg / 2)), 2 * dist * math.tan(math.radians(h_deg / 2)))
    return emission_panel(name, size, tuple(pos), (0, 0, 0), strength, color, soft)


rA = refl_dir((0, -2.5 * MM, 5 * MM))
rB = refl_dir((0, -3.0 * MM, -7 * MM))
panel_dir("cara_A", rA, -4, 9, 0.5, 34, 14, 1.25, (1.0, 0.96, 0.9), soft=0.7)       # lower edge crosses the brass face
panel_dir("cara_B", rB, 3, -1.5, 0.5, 36, 4.5, 1.6, (0.95, 0.97, 1.0), soft=0.8)    # a horizontal band across the steel
panel_dir("tira", rA, -9, 0, 0.45, 2.2, 60, 2.6, (1.0, 0.98, 0.95), soft=0.9)        # a thin vertical streak on both faces
world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0018, 0.0018, 0.002, 1)
sc.world = world

# ── render settings ─────────────────────────────────────────────────────────────────────────────
sc.render.engine = "CYCLES"
cy = sc.cycles
cy.device = "CPU"
cy.samples = args.samples
cy.use_adaptive_sampling = True
cy.adaptive_threshold = 0.03
cy.adaptive_min_samples = 12
cy.use_denoising = True
cy.denoiser = "OPENIMAGEDENOISE"
cy.denoising_input_passes = "RGB_ALBEDO_NORMAL"
cy.denoising_prefilter = "ACCURATE" if args.samples >= 64 else "FAST"     # the long-held still gets the full treatment
try:
    cy.denoising_quality = "HIGH" if args.samples >= 64 else "BALANCED"
except (AttributeError, TypeError):
    pass
cy.max_bounces = 5
cy.diffuse_bounces = 2
cy.glossy_bounces = 3
cy.transmission_bounces = 1
cy.caustics_reflective = False
cy.caustics_refractive = False
cy.blur_glossy = 0.3
sc.render.use_persistent_data = True
sc.render.resolution_x = int(1080 * args.res)
sc.render.resolution_y = int(1920 * args.res)
sc.render.use_motion_blur = not args.noblur
sc.render.motion_blur_shutter = 0.5
sc.render.fps = 30
sc.render.film_transparent = True
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
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
cam_d.clip_start = 0.002
cam_d.dof.use_dof = True
cam_d.dof.aperture_blades = 9
cam = link(bpy.data.objects.new("cam", cam_d))
sc.camera = cam
focus = link(bpy.data.objects.new("focus", None))
cam_d.dof.focus_object = focus

for f in range(0, FREEZE + 1):
    px, py, pz, tx, ty, tz, fov = TL["cam"][f]
    loc, tgt = Vector((px, py, pz)), Vector((tx, ty, tz))
    cam.location = loc
    cam.rotation_euler = (tgt - loc).to_track_quat("-Z", "Y").to_euler()
    cam_d.lens = 12.0 / math.tan(math.radians(fov / 2))
    cam_d.dof.aperture_fstop = 11 + 9 * f / FREEZE
    focus.location = (0, -2.5 * MM, 0)                 # the front of the teeth at the mesh
    pivots["A"].location = (0, 0, RA + TL["gap"][f])
    spinners["A"].rotation_euler = (0, 0, TL["thetaA"][f])
    spinners["B"].rotation_euler = (0, 0, TL["thetaB"][f])
    for ob, prop in ((cam, "location"), (cam, "rotation_euler"), (pivots["A"], "location"), (spinners["A"], "rotation_euler"),
                     (spinners["B"], "rotation_euler")):
        ob.keyframe_insert(prop, frame=f)
    cam_d.keyframe_insert("lens", frame=f)
    cam_d.dof.keyframe_insert("aperture_fstop", frame=f)
print(f"scene ready at {time.time() - t0:.1f}s", flush=True)

if args.border:
    bx0, by0, bx1, by1 = (float(v) for v in args.border.split(","))
    sc.render.use_border, sc.render.use_crop_to_border = True, True
    sc.render.border_min_x, sc.render.border_min_y, sc.render.border_max_x, sc.render.border_max_y = bx0, by0, bx1, by1
os.makedirs(args.out, exist_ok=True)
sc.frame_start, sc.frame_end = F0, F1
sc.render.filepath = os.path.join(args.out, "a_####")
t1 = time.time()
bpy.ops.render.render(animation=True)
print(f"rendered frames {F0}-{F1} in {time.time() - t1:.1f}s ({(time.time() - t1) / (F1 - F0 + 1):.1f}s/frame)", flush=True)
