"""Path-traced plates for the countdown (Blender/Cycles, run headless through the `bpy` module).

Two natural-wood hexagonal pencils on a dark studio backdrop, shot with a long macro lens on a
motion-control slider: planed faces with grain, pores, drying cracks and a knot; sharpened cones with
torn end grain and loose fibres (hair particles); graphite leads with fine scratches. Soft area lights,
real depth of field, motion blur from the moves. Surface detail comes from pre-computed textures
(scripts/make_pencil_textures.py); camera, gap and timing from src/timeline-lapiz.json — the same
numbers drive the three.js wireframe, so the reveal lines up.

Run:  <python-with-bpy> scripts/blender_lapices.py [--frames 0-195] [--samples 48] [--out public/plates]
Writes <out>/a_0000.jpg … (1080x1920, one per countdown frame)
"""
import argparse, json, math, os, sys, time
import numpy as np
import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument("--frames", default="0-195")
ap.add_argument("--samples", type=int, default=48)
ap.add_argument("--out", default=os.path.join(ROOT, "public", "plates"))
ap.add_argument("--res", type=float, default=1.0)
ap.add_argument("--nohair", action="store_true")
ap.add_argument("--noblur", action="store_true")
ap.add_argument("--backdrop", action="store_true", help="render the studio backdrop too (slow); default: transparent film, backdrop composited in Remotion")
args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
F0, F1 = (int(x) for x in args.frames.split("-"))

TL = json.load(open(os.path.join(ROOT, "src", "timeline-lapiz.json")))
TEX = os.path.join(ROOT, "public", "plates_src")
S = 0.02  # metres per scene unit (1 unit = 2 cm)

# ── pencil geometry (scene units) — keep in sync with make_pencil_textures.py and src/components/lapiz.ts ──
R_IN, RC, R_CORE, L_CONE, BLUNT = 0.17, 0.014, 0.06, 0.7, 0.003
A_IN = R_IN - RC
R_MAX = A_IN / math.cos(math.pi / 6) + RC
SLOPE = R_MAX / L_CONE
YT, VEXP = 2.2, 0.6           # texture v = (y / YT) ** VEXP
L_BODY = 7.0
NP, NR_TIP, NR_BODY = 600, 900, 24
Y_TIP_END = 1.0
ECC = [(0.0055, 0.0012), (0.0048, -0.0021)]  # same as the texture generator


def hex_round(phi):
    a = np.mod(phi + np.pi / 6, np.pi / 3) - np.pi / 6
    lo = np.zeros_like(phi)
    hi = np.full_like(phi, R_MAX * 1.2)
    th = A_IN * math.tan(math.pi / 6)
    for _ in range(40):
        t = (lo + hi) / 2
        x, y = t * np.cos(a), t * np.abs(np.sin(a))
        d = np.where(y <= th, x - A_IN, np.hypot(x - A_IN, y - th))
        lo = np.where(d < RC, t, lo)
        hi = np.where(d < RC, hi, t)
    return (lo + hi) / 2


def cone_r(y):
    return SLOPE * np.sqrt(np.maximum(0.0, y * (y + 2 * BLUNT)))


def build_pencil(name, k):
    phis = np.linspace(0, 2 * np.pi, NP, endpoint=False)
    ys = np.concatenate([Y_TIP_END * (np.arange(NR_TIP + 1) / NR_TIP) ** 1.6,
                         Y_TIP_END + (L_BODY - Y_TIP_END) * np.arange(1, NR_BODY + 1) / NR_BODY])
    P, Y = np.meshgrid(phis, ys)
    hexr = hex_round(P)
    ex, ez = ECC[k]
    away = np.clip((Y - 0.12) / 0.4, 0, 1)
    cone = cone_r(Y) + away * (ex * np.cos(P) + ez * np.sin(P))
    r = np.minimum(hexr, cone)
    verts = np.stack([np.cos(P) * r, -np.sin(P) * r, Y], axis=-1).reshape(-1, 3) * S
    nr, npc = Y.shape
    rows = np.arange(nr - 1)[:, None] * npc
    cols = np.arange(npc)[None, :]
    i = rows + cols
    j = rows + (cols + 1) % npc
    quads = np.stack([i, j, j + npc, i + npc], axis=-1).reshape(-1, 4)
    me = bpy.data.meshes.new(name)
    me.vertices.add(len(verts))
    me.vertices.foreach_set("co", verts.astype(np.float32).ravel())
    me.loops.add(len(quads) * 4)
    me.loops.foreach_set("vertex_index", quads.astype(np.int32).ravel())
    me.polygons.add(len(quads))
    me.polygons.foreach_set("loop_start", (np.arange(len(quads)) * 4).astype(np.int32))
    me.update(calc_edges=True)
    # UVs per loop (the last column closes the seam at u = 1)
    uq = np.stack([cols, cols + 1, cols + 1, cols], -1) / npc
    uq = np.broadcast_to(uq, (nr - 1, npc, 4))
    yq = np.stack([Y[:-1], Y[:-1], Y[1:], Y[1:]], -1)
    vq = np.clip(yq / YT, 0, 1) ** VEXP
    uv = me.uv_layers.new(name="UVMap")
    uv.data.foreach_set("uv", np.stack([uq, vq], -1).astype(np.float32).ravel())
    me.validate()
    me.shade_smooth()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    # fuzz density: the cut wood, strongest along the scalloped edge and round the lead
    w = np.zeros(len(verts))
    lead_v = (cone_r(Y) < R_CORE).reshape(-1)
    cut_v = (cone < hexr - 1e-5).reshape(-1) & ~lead_v
    edge = np.clip(1 - (hexr - cone) / 0.03, 0, 1).reshape(-1)
    near_lead = np.clip(1 - (cone_r(Y) - R_CORE) / 0.02, 0, 1).reshape(-1)
    w[cut_v] = np.clip(0.2 + 0.8 * np.maximum(edge, 0.7 * near_lead), 0, 1)[cut_v]
    vg = ob.vertex_groups.new(name="fuzz")
    for val in (0.25, 0.5, 0.75, 1.0):
        idx = np.where((w > val - 0.25) & (w <= val))[0].tolist()
        if idx:
            vg.add(idx, val, "REPLACE")
    return ob


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def img(path, data):
    im = bpy.data.images.load(path, check_existing=True)
    im.colorspace_settings.name = "Non-Color" if data else "sRGB"
    return im


def pencil_material(name, k):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bs = nt.nodes.new("ShaderNodeBsdfPrincipled")
    uvn = nt.nodes.new("ShaderNodeUVMap")
    uvn.uv_map = "UVMap"
    tex = {}
    for key, data in (("col", False), ("nrm", True), ("orm", True)):
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = img(os.path.join(TEX, f"{key}_{k}.{'jpg' if key == 'col' else 'png'}"), data)
        t.interpolation = "Cubic" if key == "col" else "Linear"
        t.extension = "EXTEND"
        nt.links.new(uvn.outputs["UV"], t.inputs["Vector"])
        tex[key] = t
    nt.links.new(tex["col"].outputs["Color"], bs.inputs["Base Color"])
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(tex["orm"].outputs["Color"], sep.inputs["Color"])
    nt.links.new(sep.outputs["Red"], bs.inputs["Roughness"])
    nt.links.new(sep.outputs["Green"], bs.inputs["Metallic"])
    nt.links.new(sep.outputs["Blue"], bs.inputs["Sheen Weight"])
    nmap = nt.nodes.new("ShaderNodeNormalMap")
    nmap.space = "TANGENT"
    nmap.uv_map = "UVMap"
    nmap.inputs["Strength"].default_value = 1.0
    nt.links.new(tex["nrm"].outputs["Color"], nmap.inputs["Color"])
    nt.links.new(nmap.outputs["Normal"], bs.inputs["Normal"])
    nt.links.new(tex["col"].outputs["Color"], bs.inputs["Sheen Tint"])
    bs.inputs["Sheen Roughness"].default_value = 0.45
    bs.inputs["Specular IOR Level"].default_value = 0.42
    an = nt.nodes.new("ShaderNodeMath")
    an.operation = "MULTIPLY"
    an.inputs[1].default_value = 0.6
    nt.links.new(sep.outputs["Green"], an.inputs[0])
    nt.links.new(an.outputs[0], bs.inputs["Anisotropic"])
    bs.inputs["Anisotropic Rotation"].default_value = 0.25
    nt.links.new(bs.outputs[0], out.inputs["Surface"])
    return m


def simple_material(name, hexcol, rough=0.8, emit=None, strength=0.0, sss=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    if emit:
        e = nt.nodes.new("ShaderNodeEmission")
        e.inputs["Color"].default_value = (*srgb(emit), 1)
        e.inputs["Strength"].default_value = strength
        nt.links.new(e.outputs[0], out.inputs["Surface"])
        return m
    bs = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bs.inputs["Base Color"].default_value = (*srgb(hexcol), 1)
    bs.inputs["Roughness"].default_value = rough
    if sss:
        bs.inputs["Subsurface Weight"].default_value = sss
        bs.inputs["Subsurface Radius"].default_value = (0.0002, 0.00012, 0.00006)
    nt.links.new(bs.outputs[0], out.inputs["Surface"])
    return m


def add_fuzz(ob, mat_index, seed, count):
    mod = ob.modifiers.new("fuzz", "PARTICLE_SYSTEM")
    psys = mod.particle_system
    psys.seed = seed
    psys.vertex_group_density = "fuzz"
    st = psys.settings
    st.type = "HAIR"
    st.count = count
    st.hair_length = 0.00042
    st.emit_from = "FACE"
    st.use_emit_random = True
    st.use_even_distribution = True
    # advanced hair: the length comes from the emission velocity (in metres here) — ~0.4 mm fibres,
    # leaning every which way off the surface
    st.use_advanced_hair = True
    st.normal_factor = 0.00032
    st.factor_random = 0.00028
    st.tangent_factor = 0.00008
    st.length_random = 0.8
    st.material = mat_index
    st.render_type = "PATH"
    st.display_step = 3
    st.render_step = 3
    st.root_radius = 1.0
    st.tip_radius = 0.2
    st.radius_scale = 0.0000035
    st.use_close_tip = True
    st.child_type = "NONE"


# ── scene ─────────────────────────────────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
cy = sc.cycles
cy.device = "CPU"
cy.samples = args.samples
cy.use_adaptive_sampling = True
cy.adaptive_threshold = 0.02
cy.adaptive_min_samples = 16
cy.use_denoising = True
cy.denoiser = "OPENIMAGEDENOISE"
cy.denoising_input_passes = "RGB_ALBEDO_NORMAL"
cy.max_bounces = 4
cy.diffuse_bounces = 2
cy.glossy_bounces = 2
cy.transmission_bounces = 2
cy.transparent_max_bounces = 4
cy.caustics_reflective = False
cy.caustics_refractive = False
cy.blur_glossy = 0.5
sc.render.use_persistent_data = True
sc.render.resolution_x = int(1080 * args.res)
sc.render.resolution_y = int(1920 * args.res)
sc.render.resolution_percentage = 100
sc.render.use_motion_blur = not args.noblur
sc.render.motion_blur_shutter = 0.5
sc.render.fps = 30
sc.render.film_transparent = not args.backdrop
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA" if not args.backdrop else "RGB"
sc.render.image_settings.color_depth = "8"
sc.render.image_settings.compression = 40
sc.view_settings.view_transform = "AgX"
for look in ("AgX - Medium High Contrast", "Medium High Contrast"):
    try:
        sc.view_settings.look = look
        break
    except TypeError:
        pass
world = bpy.data.worlds.new("studio")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0015, 0.0015, 0.0017, 1)
sc.world = world

t_scene = time.time()
pencils = []
for k, (name, rot, seed) in enumerate((("lapiz_arriba", (0, 0, 0), 3), ("lapiz_abajo", (0, math.pi, math.pi / 6), 8))):
    ob = build_pencil(name, k)
    ob.rotation_euler = rot
    ob.data.materials.append(pencil_material(f"lapiz_{k}", k))
    ob.data.materials.append(simple_material(f"fibra_{k}", "#e2c29c", 0.6, sss=0.3))
    if not args.nohair:
        add_fuzz(ob, 2, seed, 12000)
    pencils.append(ob)
    print(f"{name} built ({len(ob.data.vertices)} verts) at {time.time() - t_scene:.1f}s", flush=True)

if args.backdrop:  # a dark grey sweep far behind (by default it is composited in Remotion instead: far cheaper)
    bpy.ops.mesh.primitive_plane_add(size=4, location=(0, 0.7, 0), rotation=(math.pi / 2, 0, 0))
    bpy.context.object.data.materials.append(simple_material("fondo", "#1b1d20", 0.95))


def area(name, size, loc, power, color=(1, 0.96, 0.92), aim=(0, 0, 0)):
    ld = bpy.data.lights.new(name, "AREA")
    ld.shape = "RECTANGLE"
    ld.size, ld.size_y = size
    ld.energy = power
    ld.color = color
    lo = bpy.data.objects.new(name, ld)
    sc.collection.objects.link(lo)
    lo.location = loc
    lo.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return lo


# studio rig (tabletop macro levels): big soft key front-left, two strip rims behind, a faint fill,
# a small top kicker for the leads, and a soft pool on the backdrop
area("key", (0.6, 0.9), (-0.55, -0.6, 0.28), 7.0, (1.0, 0.95, 0.9))
area("rim_l", (0.05, 1.0), (-0.42, 0.38, 0.06), 4.5, (1.0, 0.97, 0.94))
area("rim_r", (0.05, 1.0), (0.44, 0.34, 0.0), 3.4, (0.95, 0.97, 1.0))
area("fill", (1.0, 1.0), (0.75, -0.6, -0.12), 0.6, (0.96, 0.97, 1.0))
area("top", (0.25, 0.25), (0.05, -0.08, 0.6), 1.2, (1.0, 0.98, 0.95))
area("ceiling", (1.6, 1.6), (0.0, -0.25, 0.9), 1.0, (0.97, 0.97, 1.0))  # something for the graphite to mirror
area("pool", (0.5, 0.5), (0.0, 0.25, -0.25), 0.5, (0.9, 0.93, 0.97), aim=(0, 0.7, 0.05))

cam_d = bpy.data.cameras.new("cam")
cam_d.sensor_fit = "VERTICAL"
cam_d.sensor_height = 24.0
cam_d.clip_start = 0.004
cam_d.clip_end = 10
cam_d.dof.use_dof = True
cam_d.dof.aperture_blades = 9
cam = bpy.data.objects.new("cam", cam_d)
sc.collection.objects.link(cam)
sc.camera = cam
focus = bpy.data.objects.new("focus", None)
sc.collection.objects.link(focus)
cam_d.dof.focus_object = focus


def three_to_blender(p):
    return Vector((p[0], -p[2], p[1]))


t_build = time.time()
for f in range(0, TL["freeze"] + 1):  # keys set directly (frame_set would re-evaluate meshes + hair each time)
    dist, elev, az, ty, fov = TL["cam"][f]
    pos3 = (math.sin(az) * math.cos(elev) * dist, ty + math.sin(elev) * dist, math.cos(az) * math.cos(elev) * dist)
    loc = three_to_blender(pos3) * S
    tgt = three_to_blender((0, ty, 0)) * S
    cam.location = loc
    cam.rotation_euler = (tgt - loc).to_track_quat("-Z", "Y").to_euler()
    cam_d.lens = 12.0 / math.tan(math.radians(fov / 2))
    cam_d.dof.aperture_fstop = 16 + 16 * min(1, f / TL["freeze"])
    # focus on the front of the cones (the surfaces we see), not on the pencils' axis
    focus.location = (loc / loc.length) * 0.1 * S
    focus.keyframe_insert("location", frame=f)
    g = TL["gap"][f] * S
    pencils[0].location = (0, 0, g / 2)
    pencils[1].location = (0, 0, -g / 2)
    cam.keyframe_insert("location", frame=f)
    cam.keyframe_insert("rotation_euler", frame=f)
    cam_d.keyframe_insert("lens", frame=f)
    cam_d.dof.keyframe_insert("aperture_fstop", frame=f)
    for ob in pencils:
        ob.keyframe_insert("location", frame=f)
print(f"keyframes in {time.time() - t_build:.1f}s", flush=True)

os.makedirs(args.out, exist_ok=True)
sc.frame_start, sc.frame_end = F0, F1
sc.render.filepath = os.path.join(args.out, "a_####")
t0 = time.time()
bpy.ops.render.render(animation=True)
print(f"rendered frames {F0}-{F1} in {time.time() - t0:.1f}s ({(time.time() - t0) / (F1 - F0 + 1):.1f}s/frame)", flush=True)
