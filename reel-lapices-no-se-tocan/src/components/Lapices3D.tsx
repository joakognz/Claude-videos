import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { C } from "../theme";
import { countBelow, makePencilWire } from "./lapiz";

export type LapizState = {
  gap: number; // tip-to-tip distance, world units
  cam: { dist: number; elev: number; az: number; ty: number; fov: number };
  solid: number; // the path-traced plate is showing (the wire is hidden)
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
    <Wire s={s} />
    <Gauge s={s} />
  </>
);

/** three.js layer for the reveal: the wireframe and the gap gauge, on the plates' camera. */
export const Lapices3D: React.FC<{ s: LapizState }> = ({ s }) => (
  <ThreeCanvas width={1080} height={1920} camera={{ fov: 20, position: [0, 0, 10], near: 0.1, far: 100 }}
    gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
    <Scene s={s} />
  </ThreeCanvas>
);
