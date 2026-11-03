import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { C, rand } from "../theme";
import { Deform, TOP_Y, countBelow, deformInto, makeGrid, makeSkin } from "./geometry";

export type GloboState = {
  deform: Deform;
  needleGap: number; // tip height above the (dimpled) contact point, world units
  needleShake: number; // lateral jitter, world units
  needleOn: number; // 0..1
  cam: { dist: number; elev: number; az: number; ty: number; fov: number };
  solid: number; // skin visible
  wire: number; // wireframe visible (0..1)
  dense: number; // 0 = sparse grid (wide shots), 1 = dense grid (macro)
  redraw: number; // crown angle up to which the mesh is drawn (Infinity = all)
  grey: number; // wire colour → HUD grey
  floor: number; // studio floor + reflection
  shapes: number; // other wireframe figures (0..1 reveal)
  t: number; // clock for slow spins (frozen with the image)
};

const ORANGE = new THREE.Color(C.orange);
const GREY = new THREE.Color(C.grey);
const NEEDLE_LEN = 7;
const NEEDLE_R = 0.005;

const Rig: React.FC<{ cam: GloboState["cam"] }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const { dist, elev, az, ty, fov } = cam;
  camera.position.set(Math.sin(az) * Math.cos(elev) * dist, ty + Math.sin(elev) * dist, Math.cos(az) * Math.cos(elev) * dist);
  camera.up.set(0, 1, 0);
  camera.lookAt(0, ty, 0);
  camera.fov = fov;
  camera.near = Math.max(0.05, dist * 0.05);
  camera.far = dist + 60;
  camera.updateProjectionMatrix();
  return null;
};

/**
 * Photo-studio reflections (deterministic, no HDR file): a black room with a big overhead softbox just
 * behind the balloon (the bright band on the crown), a tall strip on the left, a small kicker front
 * right (the wide shot's hot spot) and a faint warm bounce from below.
 */
const studioScene = () => {
  const sc = new THREE.Scene();
  sc.background = new THREE.Color("#000000");
  const box = (w: number, h: number, pos: [number, number, number], look: [number, number, number], col: string, k: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(...look);
    sc.add(m);
  };
  box(18, 2.6, [0, 1.7, -9], [0, 1.2, 0], "#fff1e6", 2.4); // backlight: the glowing horizon in the close-up
  box(1.0, 9, [1.6, 2, 9], [0, 1, 0], "#fff6ee", 1.8); // tall strip behind the camera: the steel's highlight line
  box(8, 3, [0, 7.5, -1.5], [0, 0, 0], "#fff4ea", 2.4); // overhead
  box(1.6, 8, [-7.5, 1.5, 1.5], [0, 0, 0], "#ffe6d2", 1.4); // strip, left
  box(1.8, 1.4, [4.5, 4.2, 6.5], [0, 0, 0], "#ffffff", 1.6); // kicker, front right
  box(40, 40, [0, -9, 0], [0, 0, 0], "#ff5a14", 0.03);
  return sc;
};
// one texture per WebGL context: the canvas remounts at frame 210, and a texture from the old context renders black
const envTex = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();
const useStudioEnv = () => {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    if (!envTex.has(gl)) {
      const pm = new THREE.PMREMGenerator(gl);
      envTex.set(gl, pm.fromScene(studioScene(), 0.045).texture);
      pm.dispose();
    }
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.0;
    return envTex.get(gl)!;
  }, [gl]);
};

const FLOOR_Y = -1.55;

const Balloon: React.FC<{ s: GloboState }> = ({ s }) => {
  const skin = useMemo(() => makeSkin(), []);
  const dense = useMemo(() => makeGrid(150, true, true), []);
  const sparse = useMemo(() => makeGrid(18, true), []);
  const env = useStudioEnv();
  // glossy latex: deep orange body that glows in the shadows (thin rubber lets light through),
  // a clear varnish-like coat that mirrors the softboxes, and a warm sheen at grazing angles
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#ff5f0c", roughness: 0.34, metalness: 0, envMap: env, envMapIntensity: 1.0,
    clearcoat: 1, clearcoatRoughness: 0.14, specularIntensity: 0.3,
    sheen: 0.7, sheenColor: new THREE.Color("#ffa060"), sheenRoughness: 0.35,
    emissive: new THREE.Color("#521000"), emissiveIntensity: 0.45,
    transparent: true,
  }), [env]);
  const mirrorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ff6a0e", roughness: 0.5, transparent: true, depthWrite: false }), []);
  const depthMat = useMemo(() => new THREE.MeshBasicMaterial({ colorWrite: false }), []);
  const mk = (bright: boolean) => new THREE.LineBasicMaterial({
    color: bright ? C.orangeSoft : C.orange, vertexColors: !bright, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  });
  const lineMat = useMemo(() => [mk(false), mk(false)], []);
  const headMat = useMemo(() => mk(true), []);
  const dotMat = useMemo(() => new THREE.PointsMaterial({ color: C.orangeSoft, size: 3, sizeAttenuation: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), []);
  const headDotMat = useMemo(() => new THREE.PointsMaterial({ color: C.white, size: 7, sizeAttenuation: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), []);

  const grids = useMemo(() => [sparse, dense].map((g) => {
    const geo = new THREE.BufferGeometry();
    const pos = new THREE.BufferAttribute(new Float32Array(g.segBase.length), 3);
    geo.setAttribute("position", pos);
    geo.setAttribute("color", new THREE.BufferAttribute(g.segCol, 3));
    const head = new THREE.BufferGeometry();
    head.setAttribute("position", pos);
    const dots = new THREE.BufferGeometry();
    const dpos = new THREE.BufferAttribute(new Float32Array(g.vBase.length), 3);
    dots.setAttribute("position", dpos);
    const hdots = new THREE.BufferGeometry();
    hdots.setAttribute("position", dpos);
    return { g, geo, head, dots, hdots, pos, dpos };
  }), [sparse, dense]);

  const skinRef = useRef<THREE.Mesh>(null);
  const d = s.deform;
  const showSkin = s.solid > 0.001 || s.wire > 0.001;
  const wireOn = s.wire > 0.001;

  useLayoutEffect(() => {
    if (showSkin) {
      const pos = skin.geo.getAttribute("position") as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      const b = skin.base;
      for (let i = 0; i < b.length; i += 3) deformInto(b[i], b[i + 1], b[i + 2], d, arr, i);
      pos.needsUpdate = true;
      skin.geo.computeVertexNormals();
      skin.geo.computeBoundingSphere();
    }
    if (wireOn) {
      grids.forEach(({ g, geo, head, dots, hdots, pos, dpos }, gi) => {
        const visible = gi === 1 ? s.dense : 1 - s.dense;
        if (visible < 0.01) return;
        const arr = pos.array as Float32Array;
        const n = countBelow(g.segKey, s.redraw);
        for (let i = 0; i < n * 6; i += 3) deformInto(g.segBase[i], g.segBase[i + 1], g.segBase[i + 2], d, arr, i);
        pos.needsUpdate = true;
        geo.setDrawRange(0, n * 2);
        const h0 = Number.isFinite(s.redraw) ? countBelow(g.segKey, s.redraw - 0.05) : n;
        head.setDrawRange(h0 * 2, (n - h0) * 2);
        const da = dpos.array as Float32Array;
        const nv = countBelow(g.vKey, s.redraw);
        for (let i = 0; i < nv * 3; i += 3) deformInto(g.vBase[i], g.vBase[i + 1], g.vBase[i + 2], d, da, i);
        dpos.needsUpdate = true;
        dots.setDrawRange(0, nv);
        const hv0 = Number.isFinite(s.redraw) ? countBelow(g.vKey, s.redraw - 0.03) : nv;
        hdots.setDrawRange(hv0, nv - hv0);
        [geo, head, dots, hdots].forEach((x) => { x.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3); });
      });
    }
  });

  skinMat.opacity = s.solid;
  skinMat.visible = s.solid > 0.001;
  const col = ORANGE.clone().lerp(GREY, s.grey);
  lineMat.forEach((m, gi) => {
    m.opacity = s.wire * (gi === 1 ? s.dense : 1 - s.dense) * (gi === 1 ? 0.9 : 1);
    m.color.copy(col);
  });
  headMat.opacity = s.wire;
  dotMat.opacity = s.wire * 0.75;
  dotMat.color.copy(col.clone().lerp(new THREE.Color(C.orangeSoft), 1 - s.grey));
  headDotMat.opacity = s.wire;
  mirrorMat.opacity = 0.16 * s.floor * s.solid;
  const bottomY = -TOP_Y * (1 + d.inflate) + d.bob;

  return (
    <group>
      {/* depth-only copy (slightly smaller) so the wire only shows its front side */}
      {wireOn && <mesh geometry={skin.geo} material={depthMat} scale={0.994} renderOrder={0} />}
      <mesh ref={skinRef} geometry={skin.geo} material={skinMat} renderOrder={1} />
      {/* knot */}
      {s.solid > 0.001 && (
        <group position={[0, bottomY, 0]}>
          <mesh position={[0, -0.05, 0]} material={skinMat}>
            <cylinderGeometry args={[0.02, 0.07, 0.12, 24]} />
          </mesh>
          <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={skinMat}>
            <torusGeometry args={[0.035, 0.022, 12, 24]} />
          </mesh>
        </group>
      )}
      {/* studio floor reflection (wide shot only) */}
      {s.floor > 0.001 && s.solid > 0.001 && (
        <>
          <mesh geometry={skin.geo} material={mirrorMat} position={[0, 2 * FLOOR_Y, 0]} scale={[1, -1, 1]} />
        </>
      )}
      {wireOn && grids.map(({ geo, head, dots, hdots }, gi) => {
        const vis = gi === 1 ? s.dense : 1 - s.dense;
        if (vis < 0.01) return null;
        return (
          <group key={gi}>
            <lineSegments geometry={geo} material={lineMat[gi]} renderOrder={3} frustumCulled={false} />
            <points geometry={dots} material={dotMat} renderOrder={3} frustumCulled={false} />
            {Number.isFinite(s.redraw) && (
              <>
                <lineSegments geometry={head} material={headMat} renderOrder={4} frustumCulled={false} />
                <points geometry={hdots} material={headDotMat} renderOrder={4} frustumCulled={false} />
              </>
            )}
          </group>
        );
      })}
    </group>
  );
};

/** Gradient (tip → up): the balloon's orange glow on the lower steel. */
const tipGlow = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 256, 0, 0); // canvas bottom = uv.y 0 = the tip
    gr.addColorStop(0, "rgb(255,120,40)");
    gr.addColorStop(0.18, "rgb(230,80,15)");
    gr.addColorStop(0.55, "rgb(70,18,4)");
    gr.addColorStop(1, "rgb(0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 256);
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
})();

const GLOW_H = 0.12; // height of the orange glow above the tip

const Needle: React.FC<{ s: GloboState }> = ({ s }) => {
  const geo = useMemo(() => {
    // long tapered point, then the shaft
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
    for (let k = 1; k <= 30; k++) pts.push(new THREE.Vector2(NEEDLE_R * (k / 30) ** 0.75, 0.13 * (k / 30)));
    for (let k = 1; k <= 30; k++) pts.push(new THREE.Vector2(NEEDLE_R, 0.13 + (0.6 * k) / 30));
    for (let k = 1; k <= 30; k++) pts.push(new THREE.Vector2(NEEDLE_R, 0.73 + ((NEEDLE_LEN - 0.73) * k) / 30));
    const g = new THREE.LatheGeometry(pts, 48);
    // uv.y = height above the tip, scaled to the glow
    const pos = g.getAttribute("position");
    const uv = g.getAttribute("uv");
    for (let i = 0; i < pos.count; i++) uv.setY(i, Math.min(1, pos.getY(i) / GLOW_H));
    uv.needsUpdate = true;
    return g;
  }, []);
  const env = useStudioEnv();
  const metal = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#e8e4df", metalness: 1, roughness: 0.2, envMap: env, envMapIntensity: 1.6, clearcoat: 0.6, clearcoatRoughness: 0.08,
    emissive: new THREE.Color("#ffffff"), emissiveMap: tipGlow(), emissiveIntensity: 1, transparent: true,
  }), [env]);
  const wireGeo = useMemo(() => {
    const v: number[] = [];
    const N = 10;
    for (let k = 0; k < N; k++) {
      const a = (k / N) * Math.PI * 2;
      const x = Math.cos(a) * NEEDLE_R;
      const z = Math.sin(a) * NEEDLE_R;
      v.push(0, 0, 0, x, 0.13, z, x, 0.13, z, x, NEEDLE_LEN, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);
  const wireM = useMemo(() => new THREE.LineBasicMaterial({ color: C.orange, transparent: true, toneMapped: false }), []);
  if (s.needleOn < 0.001) return null;
  const d = s.deform;
  const contact = TOP_Y * (1 + d.inflate) - d.dimple + d.bob;
  // the glow grows as the tip nears the skin
  metal.emissiveIntensity = 0.12 + 0.45 * Math.max(0, 1 - s.needleGap / 0.15);
  // ≈30 px wide in the macro; a little thicker in the wide shot so it still reads (≈3 px)
  const thick = 1 + 0.6 * Math.min(1, Math.max(0, (s.cam.dist - 2.4) / 9));
  metal.opacity = s.needleOn * Math.min(1, s.solid * 1.5);
  wireM.opacity = s.needleOn * s.wire;
  const col = ORANGE.clone().lerp(GREY, s.grey);
  wireM.color.copy(col);
  return (
    <group position={[s.needleShake, contact + s.needleGap, 0]} scale={[thick, 1, thick]}>
      {s.solid > 0.001 && <mesh geometry={geo} material={metal} renderOrder={5} />}
      {s.wire > 0.001 && <lineSegments geometry={wireGeo} material={wireM} renderOrder={5} />}
    </group>
  );
};

/** Other generic wireframe figures: the balloon becomes "one more". */
const SHAPES: { x: number; y: number; kind: number }[] = [
  { x: -3.3, y: 3.6, kind: 0 }, { x: 0, y: 3.6, kind: 1 }, { x: 3.3, y: 3.6, kind: 2 },
  { x: -3.3, y: 0, kind: 3 }, { x: 3.3, y: 0, kind: 4 },
  { x: -3.3, y: -3.6, kind: 5 }, { x: 0, y: -3.6, kind: 6 }, { x: 3.3, y: -3.6, kind: 7 },
];
const Shapes: React.FC<{ s: GloboState }> = ({ s }) => {
  const geos = useMemo(() => [
    new THREE.BoxGeometry(1.7, 1.7, 1.7, 3, 3, 3),
    new THREE.TorusGeometry(0.85, 0.32, 10, 24),
    new THREE.ConeGeometry(1.1, 1.8, 4, 3),
    new THREE.OctahedronGeometry(1.15, 1),
    new THREE.CylinderGeometry(0.8, 0.8, 1.8, 16, 3),
    new THREE.IcosahedronGeometry(1.05, 1),
    new THREE.ConeGeometry(0.95, 1.9, 18, 3),
    new THREE.DodecahedronGeometry(1.05, 0),
  ], []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: C.grey, wireframe: true, transparent: true, toneMapped: false }), []);
  if (s.shapes < 0.001) return null;
  mat.opacity = Math.min(1, s.shapes * 1.2) * 0.85;
  return (
    <group>
      {SHAPES.map((sh, i) => {
        const p = Math.min(1, Math.max(0, s.shapes * 1.6 - rand(i + 9) * 0.6));
        const sc = p <= 0 ? 0.0001 : 1 - (1 - p) ** 3;
        return (
          <mesh key={i} geometry={geos[sh.kind]} material={mat} position={[sh.x, sh.y, 0]} scale={sc}
            rotation={[0.4 + s.t * 0.35 * (rand(i) - 0.3), s.t * 0.5 * (0.5 + rand(i + 3)), 0.2 * rand(i + 5)]} />
        );
      })}
    </group>
  );
};

const Scene: React.FC<{ s: GloboState }> = ({ s }) => (
  <>
    <Rig cam={s.cam} />
    {/* key: warm, top left · rim from behind (crown glow) · faint warm fill from the front */}
    <directionalLight position={[-3, 6, 2.5]} intensity={2.1} color="#ffd9b8" />
    <directionalLight position={[0.5, 3.5, -6]} intensity={1.4} color="#fff0e2" />
    <directionalLight position={[2, 0.5, 8]} intensity={0.25} color="#ffc9a0" />
    <hemisphereLight args={["#ffcfa8", "#1a0804", 0.35]} />
    <Balloon s={s} />
    <Needle s={s} />
    <Shapes s={s} />
  </>
);

export const Globo3D: React.FC<{ s: GloboState }> = ({ s }) => (
  <ThreeCanvas width={1080} height={1920} camera={{ fov: 20, position: [0, 0, 10], near: 0.1, far: 100 }}
    gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
    <Scene s={s} />
  </ThreeCanvas>
);
