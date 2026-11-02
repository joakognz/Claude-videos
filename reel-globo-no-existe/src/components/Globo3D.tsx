import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
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
const NEEDLE_R = 0.0036;

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

/** Studio reflections from a procedural room (deterministic, no HDR file) — used only by the steel needle. */
// one texture per WebGL context: the canvas remounts at frame 210, and a texture from the old context renders black
const envTex = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();
const useStudioEnv = () => {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    if (!envTex.has(gl)) {
      const pm = new THREE.PMREMGenerator(gl);
      envTex.set(gl, pm.fromScene(new RoomEnvironment(), 0.035).texture);
      pm.dispose();
    }
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.1;
    return envTex.get(gl)!;
  }, [gl]);
};

const FLOOR_Y = -1.55;

const Balloon: React.FC<{ s: GloboState }> = ({ s }) => {
  const skin = useMemo(() => makeSkin(96), []);
  const dense = useMemo(() => makeGrid(56, true), []);
  const sparse = useMemo(() => makeGrid(18, true), []);
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#ff6c12", roughness: 0.22, metalness: 0, clearcoat: 0, envMapIntensity: 0,
    specularIntensity: 0.45,
    transparent: true,
  }), []);
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

const Needle: React.FC<{ s: GloboState }> = ({ s }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
    for (let k = 1; k <= 12; k++) pts.push(new THREE.Vector2(NEEDLE_R * (k / 12) ** 0.8, 0.16 * (k / 12)));
    for (let k = 1; k <= 60; k++) pts.push(new THREE.Vector2(NEEDLE_R, 0.16 + (NEEDLE_LEN * k) / 60));
    return new THREE.LatheGeometry(pts, 28);
  }, []);
  const env = useStudioEnv();
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e9e4df", metalness: 1, roughness: 0.16, envMap: env, envMapIntensity: 1.3, transparent: true }), [env]);
  const wireM = useMemo(() => new THREE.MeshBasicMaterial({ color: C.orange, wireframe: true, transparent: true, toneMapped: false }), []);
  if (s.needleOn < 0.001) return null;
  const d = s.deform;
  const contact = TOP_Y * (1 + d.inflate) - d.dimple + d.bob;
  // thicker in the wide shot so it still reads (2-3 px), true scale in the macro
  const thick = 1 + 1.4 * Math.min(1, Math.max(0, (s.cam.dist - 3) / 12));
  metal.opacity = s.needleOn * Math.min(1, s.solid * 1.5);
  wireM.opacity = s.needleOn * s.wire;
  const col = ORANGE.clone().lerp(GREY, s.grey);
  wireM.color.copy(col);
  return (
    <group position={[s.needleShake, contact + s.needleGap, 0]} scale={[thick, 1, thick]}>
      {s.solid > 0.001 && <mesh geometry={geo} material={metal} renderOrder={5} />}
      {s.wire > 0.001 && <mesh geometry={geo} material={wireM} renderOrder={5} />}
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

const Scene: React.FC<{ s: GloboState }> = ({ s }) => {
  // the crown faces the overhead key in the macro: dim the lights there so the orange doesn't burn to white
  const k = 0.62 + 0.38 * Math.min(1, Math.max(0, (s.cam.dist - 3) / 12));
  return (
  <>
    <Rig cam={s.cam} />
    {/* key: warm, top left · fill: cool and very faint · rim from behind for the crown highlight */}
    <directionalLight position={[-2.5, 8, -0.4]} intensity={2.1 * k} color="#ffd9b8" />
    <directionalLight position={[5, 1, 3]} intensity={0.08} color="#e6ebff" />
    <directionalLight position={[0.5, 4, -6]} intensity={1.6 * k} color="#fff2e6" />
    <hemisphereLight args={["#ffd2ae", "#1a0a04", 1.1 * (0.6 + 0.4 * k)]} />
    <directionalLight position={[1.5, 1.2, 8]} intensity={0.55 * k} color="#ffc9a0" />
    <Balloon s={s} />
    <Needle s={s} />
    <Shapes s={s} />
  </>
  );
};

export const Globo3D: React.FC<{ s: GloboState }> = ({ s }) => (
  <ThreeCanvas width={1080} height={1920} camera={{ fov: 20, position: [0, 0, 10], near: 0.1, far: 100 }}
    gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
    <Scene s={s} />
  </ThreeCanvas>
);
