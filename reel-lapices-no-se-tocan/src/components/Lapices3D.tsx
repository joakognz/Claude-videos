import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { continueRender, delayRender, staticFile } from "remotion";
import { C } from "../theme";
import { countBelow, makePencil, makePencilWire } from "./lapiz";

export type LapizState = {
  gap: number; // tip-to-tip distance, world units
  cam: { dist: number; elev: number; az: number; ty: number; fov: number };
  solid: number; // lacquer / wood / graphite visible
  wire: number; // wireframe visible (0..1)
  redraw: number; // height from the tips up to which the mesh is drawn (Infinity = all)
  grey: number; // wire colour → HUD grey
  wireAlpha: number; // overall wire opacity (fades to "you don't know it's there")
  ripple: number;
  ripplePhase: number;
  gauge: number; // 0..1 dimension marker on the gap
  t: number;
};

const ORANGE = new THREE.Color(C.orange);
const GREY = new THREE.Color(C.grey);

const Rig: React.FC<{ cam: LapizState["cam"] }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const { dist, elev, az, ty, fov } = cam;
  camera.position.set(Math.sin(az) * Math.cos(elev) * dist, ty + Math.sin(elev) * dist, Math.cos(az) * Math.cos(elev) * dist);
  camera.up.set(0, 1, 0);
  camera.lookAt(0, ty, 0);
  camera.fov = fov;
  camera.near = Math.max(0.02, dist * 0.04);
  camera.far = dist + 60;
  camera.updateProjectionMatrix();
  return null;
};

/** Photo-studio reflections: black room, big backlight, overhead box, side strip, small kicker, warm floor bounce. */
const studioScene = () => {
  const sc = new THREE.Scene();
  sc.background = new THREE.Color("#000000");
  const box = (w: number, h: number, pos: [number, number, number], col: string, k: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    sc.add(m);
  };
  box(16, 3, [0, 1.5, -9], "#fff1e6", 2.4); // backlight: rims on the edges
  box(8, 3, [0, 7.5, -1.5], "#fff4ea", 2.4); // overhead
  box(1.6, 9, [-7.5, 1, 2], "#ffe6d2", 2.0); // strip, left: the long highlight down the facets
  box(1.0, 9, [2.5, 1, 9], "#fff6ee", 1.6); // strip behind the camera
  box(1.8, 1.4, [4.5, 4.2, 6.5], "#ffffff", 1.4); // kicker, front right
  box(40, 40, [0, -9, 0], "#ff5a14", 0.04);
  return sc;
};
const envTex = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();
const useStudioEnv = () => {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    if (!envTex.has(gl)) {
      const pm = new THREE.PMREMGenerator(gl);
      envTex.set(gl, pm.fromScene(studioScene(), 0.035).texture);
      pm.dispose();
    }
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.0;
    return envTex.get(gl)!;
  }, [gl]);
};

/** Pre-computed PNG textures (scripts/make_assets.py), decoded before the canvas mounts. */
const texCache = new Map<string, THREE.Texture>();
const usePreloadTextures = (names: string[]) => {
  const [handle] = useState(() => (names.every((n) => texCache.has(n)) ? null : delayRender("pencil textures")));
  const [ready, setReady] = useState(handle === null);
  useLayoutEffect(() => {
    if (handle === null) return;
    const loader = new THREE.TextureLoader();
    Promise.all(names.map((n) => (texCache.has(n) ? Promise.resolve(texCache.get(n)!) : loader.loadAsync(staticFile(`assets/${n}.png`)).then((tx) => {
      tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
      tx.anisotropy = 8;
      if (n.endsWith("color")) tx.colorSpace = THREE.SRGBColorSpace;
      texCache.set(n, tx);
      return tx;
    })))).then(() => setReady(true));
  }, [handle, names]);
  useEffect(() => {
    if (ready && handle !== null) continueRender(handle);
  }, [ready, handle]);
  return ready;
};

const TEX = ["wood_color", "wood_bump", "graphite_bump", "graphite_rough"];

const Pencils: React.FC<{ s: LapizState }> = ({ s }) => {
  const geo = useMemo(() => makePencil(), []);
  const env = useStudioEnv();
  const mats = useMemo(() => {
    const [woodC, woodB, grB, grR] = TEX.map((n) => texCache.get(n)!);
    const wood = new THREE.MeshStandardMaterial({ map: woodC, bumpMap: woodB, bumpScale: 1.2, roughness: 0.78, envMap: env, envMapIntensity: 0.35, transparent: true });
    const graphite = new THREE.MeshPhysicalMaterial({
      color: "#77777c", metalness: 0.4, roughness: 1, roughnessMap: grR, bumpMap: grB, bumpScale: 0.8, envMap: env, envMapIntensity: 1.6,
      clearcoat: 0.25, clearcoatRoughness: 0.2, transparent: true,
    });
    const lacquer = (col: string, envK: number) => new THREE.MeshPhysicalMaterial({
      color: col, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06, envMap: env, envMapIntensity: envK, transparent: true,
    });
    return { wood, graphite, orange: lacquer("#ff6a14", 0.8), black: lacquer("#161616", 1.1) };
  }, [env]);
  if (s.solid < 0.001) return null;
  [mats.wood, mats.graphite, mats.orange, mats.black].forEach((m) => { m.opacity = s.solid; });
  return (
    <>
      {/* top pencil (orange lacquer), point down */}
      <group position={[0, s.gap / 2, 0]}>
        <mesh geometry={geo.graphite} material={mats.graphite} />
        <mesh geometry={geo.wood} material={mats.wood} />
        <mesh geometry={geo.paint} material={mats.orange} />
      </group>
      {/* bottom pencil (black lacquer), point up, turned 30° on its axis */}
      <group position={[0, -s.gap / 2, 0]} rotation={[0, Math.PI / 6, Math.PI]}>
        <mesh geometry={geo.graphite} material={mats.graphite} />
        <mesh geometry={geo.wood} material={mats.wood} />
        <mesh geometry={geo.paint} material={mats.black} />
      </group>
    </>
  );
};

const Wire: React.FC<{ s: LapizState }> = ({ s }) => {
  const w = useMemo(() => makePencilWire(), []);
  const geos = useMemo(() => [0, 1].map(() => {
    const g = new THREE.BufferGeometry();
    const pos = new THREE.BufferAttribute(new Float32Array(w.cyl.length), 3);
    g.setAttribute("position", pos);
    const head = new THREE.BufferGeometry();
    head.setAttribute("position", pos);
    return { g, head, pos };
  }), [w]);
  const lineMat = useMemo(() => new THREE.LineBasicMaterial({ color: C.orange, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), []);
  const headMat = useMemo(() => new THREE.LineBasicMaterial({ color: C.orangeSoft, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), []);
  const on = s.wire > 0.001 && s.wireAlpha > 0.001;
  useLayoutEffect(() => {
    if (!on) return;
    const n = countBelow(w.key, s.redraw);
    const h0 = Number.isFinite(s.redraw) ? countBelow(w.key, s.redraw - 0.06) : n;
    geos.forEach(({ g, head, pos }) => {
      const arr = pos.array as Float32Array;
      for (let i = 0; i < n * 2; i++) {
        const phi = w.cyl[i * 3];
        const y = w.cyl[i * 3 + 1];
        let r = w.cyl[i * 3 + 2];
        if (s.ripple > 0) r *= 1 + s.ripple * Math.sin(y * 26 - s.ripplePhase) * Math.exp(-y / 1.5);
        arr[i * 3] = Math.cos(phi) * r;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = Math.sin(phi) * r;
      }
      pos.needsUpdate = true;
      g.setDrawRange(0, n * 2);
      head.setDrawRange(h0 * 2, (n - h0) * 2);
      g.boundingSphere = head.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
    });
  });
  if (!on) return null;
  const col = ORANGE.clone().lerp(GREY, s.grey);
  lineMat.color.copy(col);
  lineMat.opacity = s.wire * s.wireAlpha;
  headMat.opacity = s.wire * s.wireAlpha;
  return (
    <>
      {geos.map(({ g, head }, i) => (
        <group key={i} position={[0, i === 0 ? s.gap / 2 : -s.gap / 2, 0]} rotation={i === 0 ? [0, 0, 0] : [0, Math.PI / 6, Math.PI]}>
          <lineSegments geometry={g} material={lineMat} frustumCulled={false} />
          {Number.isFinite(s.redraw) && <lineSegments geometry={head} material={headMat} frustumCulled={false} />}
        </group>
      ))}
    </>
  );
};

/** Dimension marker on the gap: two ticks and two arrows pointing at it, drawn facing the camera. */
const Gauge: React.FC<{ s: LapizState }> = ({ s }) => {
  const camera = useThree((st) => st.camera);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: C.orange, transparent: true, toneMapped: false, depthTest: false }), []);
  if (s.gauge < 0.001) return null;
  mat.opacity = Math.min(1, s.gauge * 1.5);
  const px = (2 * s.cam.dist * Math.tan(((s.cam.fov / 2) * Math.PI) / 180)) / 1920; // world units per pixel
  const lw = 3 * px;
  const x0 = 0.03 + 40 * px;
  const tick = 70 * px;
  const arrow = 120 * px * s.gauge;
  const half = s.gap / 2;
  const rects: [number, number, number, number][] = [
    [x0 + tick / 2, half, tick, lw], [x0 + tick / 2, -half, tick, lw],
    [x0 + tick * 0.7, half + 14 * px + arrow / 2, lw, arrow], [x0 + tick * 0.7, -half - 14 * px - arrow / 2, lw, arrow],
  ];
  return (
    <group quaternion={camera.quaternion}>
      {rects.map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]} material={mat} renderOrder={10}>
          <planeGeometry args={[w, h]} />
        </mesh>
      ))}
      {[1, -1].map((sg) => (
        <mesh key={sg} position={[x0 + tick * 0.7, sg * (half + 6 * px), 0]} rotation={[0, 0, sg > 0 ? Math.PI : 0]} material={mat} renderOrder={10}>
          <circleGeometry args={[14 * px, 3, Math.PI / 2]} />
        </mesh>
      ))}
    </group>
  );
};

const Scene: React.FC<{ s: LapizState }> = ({ s }) => (
  <>
    <Rig cam={s.cam} />
    {/* soft front key (left), top light, backlight for the rims, warm ambient */}
    <directionalLight position={[-4, 1.5, 6]} intensity={2.3} color="#ffe2c8" />
    <directionalLight position={[-3, 6, 2.5]} intensity={0.9} color="#ffd9b8" />
    <directionalLight position={[0.5, 3.5, -6]} intensity={1.4} color="#fff0e2" />
    <directionalLight position={[5, -1, 3]} intensity={0.35} color="#ffc9a0" />
    <hemisphereLight args={["#ffcfa8", "#1a0804", 0.55]} />
    <Pencils s={s} />
    <Wire s={s} />
    <Gauge s={s} />
  </>
);

export const Lapices3D: React.FC<{ s: LapizState }> = ({ s }) => {
  const ready = usePreloadTextures(TEX);
  if (!ready) return null;
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 20, position: [0, 0, 10], near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
      <Scene s={s} />
    </ThreeCanvas>
  );
};
