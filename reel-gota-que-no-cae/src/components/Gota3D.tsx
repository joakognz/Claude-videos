import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import wireJson from "../wire.json";
import { C, GOTA } from "../theme";
import { Cam } from "./camara";
import { WireState } from "./estado";

type PartJson = { lines: number[]; tris: { p: number[]; i: number[] } };
const WIRE = wireJson as unknown as { parts: Record<string, PartJson> };

// ── the rings: the same packets as scripts/drop_geom.py (scene time), drawn exaggerated so the grid shows them ──
const PACKETS: [number, number, number, number, number][] = [
  [0.23, 2.6e-3, 0.05e-3, 4.0e-3, 0.0],
  [0.175, 3.8e-3, 0.075e-3, 5.5e-3, 1.3],
  [0.125, 5.6e-3, 0.065e-3, 7.0e-3, 2.1],
  [0.085, 8.5e-3, 0.045e-3, 9.0e-3, 0.7],
];
export const ripple = (r: number, tau: number, gain = 1) => {
  if (tau <= 0) return 0;
  let h = 0;
  for (const [c, lam, A0, w0, ph] of PACKETS) {
    const R = c * tau;
    const w = w0 + 0.12 * c * tau;
    const k = (2 * Math.PI) / lam;
    const A = gain * A0 * Math.sqrt(10e-3 / (10e-3 + R)) * Math.exp(-tau / 0.9);
    const u = (r - R) / w;
    h += A * Math.exp(-u * u) * Math.cos(k * (r - (c / 1.5) * tau) + ph);
  }
  return h;
};
const TAU_F = GOTA.T[GOTA.freeze] + GOTA.tau0;
const EXAG = 9; // the frozen rings, ×9 so they read in the wire
/** New rings from the impact (wire world: fast and tall enough to read). */
const impactRings = (r: number, t: number, amp: number, speed: number) => {
  if (t < 0) return 0;
  let h = 0;
  for (const [sp, lam, a, w0] of [[1, 4.2e-3, 1, 3e-3], [0.72, 6e-3, 0.7, 4e-3], [0.5, 8e-3, 0.45, 5e-3]]) {
    const R = speed * sp * t;
    const w = w0 + 0.08 * R;
    const u = (r - R) / w;
    h += a * Math.exp(-u * u) * Math.cos(((2 * Math.PI) / lam) * (r - 0.66 * R));
  }
  return amp * h * Math.exp(-t / 1.4) * Math.sqrt(8e-3 / (8e-3 + speed * t));
};

const N_RING = 40;
const R_MAX = 0.058;
const N_SPOKE = 72;
const N_ARC = 120;
const ringR = (i: number) => (R_MAX * (i + 1)) / N_RING;

const waterHeight = (r: number, s: WireState) =>
  EXAG * (ripple(r, TAU_F) + 0.4 * ripple(r, TAU_F - 0.016)) + impactRings(r, s.impactT, 0.0011, 0.055) + impactRings(r, s.satImpactT, 0.0004, 0.045);

/** Brightness of the grid at radius r: full near the drop, fading out to the rim of the disc. */
const fadeR = (r: number) => Math.pow(1 - Math.min(1, r / R_MAX), 1.3);

/** The water as a polar grid (rings + spokes) with its height from the analytic rings; colours fade with radius. */
const waterPositions = (s: WireState) => {
  const pos: number[] = [];
  const col: number[] = [];
  for (let i = 0; i < N_RING; i++) {
    const r = ringR(i);
    const y = waterHeight(r, s);
    const n = Math.max(24, Math.round((N_ARC * (i + 1)) / N_RING));
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2;
      const a1 = ((k + 1) / n) * Math.PI * 2;
      pos.push(r * Math.cos(a0), y, r * Math.sin(a0), r * Math.cos(a1), y, r * Math.sin(a1));
      const b = fadeR(r);
      col.push(b, b, b, b, b, b);
    }
  }
  for (let j = 0; j < N_SPOKE; j++) {
    const a = (j / N_SPOKE) * Math.PI * 2;
    const i0 = j % 3 === 0 ? 0 : 6;
    for (let i = i0; i < N_RING - 1; i++) {
      const r0 = ringR(i);
      const r1 = ringR(i + 1);
      pos.push(r0 * Math.cos(a), waterHeight(r0, s), r0 * Math.sin(a), r1 * Math.cos(a), waterHeight(r1, s), r1 * Math.sin(a));
      const b0 = fadeR(r0);
      const b1 = fadeR(r1);
      col.push(b0, b0, b0, b1, b1, b1);
    }
  }
  return { pos, col };
};

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  camera.position.set(...cam.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(...cam.target);
  camera.fov = cam.fov;
  camera.near = 0.003;
  camera.far = 5;
  camera.updateProjectionMatrix();
  return null;
};

const ORANGE = new THREE.Color(C.orange);
const SOFT = new THREE.Color(C.orangeSoft);
const lineMat = (width: number, depthTest = true) => {
  const m = new LineMaterial({
    color: C.orange, linewidth: width, worldUnits: false, transparent: true, depthWrite: false, depthTest,
    blending: THREE.NormalBlending, toneMapped: false,
  });
  m.resolution.set(1080, 1920);
  return m;
};

type Built = { lines: LineSegments2; fill: THREE.Mesh | null; mat: LineMaterial };
const build = (p: PartJson, width: number, fillMat: THREE.Material): Built => {
  const g = new LineSegmentsGeometry();
  g.setPositions(p.lines);
  const mat = lineMat(width);
  let fill: THREE.Mesh | null = null;
  if (p.tris.i.length) {
    const bg = new THREE.BufferGeometry();
    bg.setAttribute("position", new THREE.Float32BufferAttribute(p.tris.p, 3));
    bg.setIndex(p.tris.i);
    fill = new THREE.Mesh(bg, fillMat);
    fill.renderOrder = 0;
  }
  const lines = new LineSegments2(g, mat);
  lines.renderOrder = 2;
  return { lines, fill, mat };
};

const setLook = (m: LineMaterial, level: number, flash: number, base = 1) => {
  m.color.copy(ORANGE).lerp(SOFT, Math.min(1, flash));
  m.opacity = Math.min(1, base * level + 0.6 * flash);
};

const Scene: React.FC<{ s: WireState }> = ({ s }) => {
  const fill = useMemo(() => new THREE.MeshBasicMaterial({ color: "#050505", polygonOffset: true, polygonOffsetFactor: 6, polygonOffsetUnits: 18 }), []);
  const P = useMemo(() => ({
    grifo: build(WIRE.parts.grifo, 1.7, fill),
    resto: build(WIRE.parts.resto, 2.0, fill),
    gota: build(WIRE.parts.gota, 2.2, fill),
    sat: build(WIRE.parts.sat, 1.8, fill),
    borde: build(WIRE.parts.agua_borde, 1.6, fill),
    gotaR: build(WIRE.parts.gota, 1.6, fill),
    satR: build(WIRE.parts.sat, 1.4, fill),
  }), [fill]);
  // the mirrored copies: a negative scale flips three's front-face convention, but the line quads are built in screen
  // space and keep their winding — draw both sides or they are culled
  P.gotaR.mat.side = THREE.DoubleSide;
  P.satR.mat.side = THREE.DoubleSide;
  const water = useMemo(() => {
    const g = new LineSegmentsGeometry();
    const mat = lineMat(1.25);
    mat.vertexColors = true;
    return { g, mat, lines: new LineSegments2(g, mat) };
  }, []);
  const wp = waterPositions(s);
  water.g.setPositions(wp.pos);
  water.g.setColors(wp.col);
  water.lines.renderOrder = 1;
  setLook(water.mat, s.agua, s.flash.agua ?? 0, 0.8);
  setLook(P.borde.mat, s.agua, s.flash.agua ?? 0, 0.5);
  setLook(P.grifo.mat, s.grifo, s.flash.grifo ?? 0);
  setLook(P.resto.mat, s.grifo, s.flash.grifo ?? 0);
  setLook(P.gota.mat, s.gota, s.flash.gota ?? 0);
  setLook(P.sat.mat, s.gota, s.flash.gota ?? 0);
  setLook(P.gotaR.mat, s.reflejo, s.flash.reflejo ?? 0, 0.5);
  setLook(P.satR.mat, s.reflejo, s.flash.reflejo ?? 0, 0.5);
  if (s.wire <= 0.001) return <Rig cam={s.cam} />;
  const dropY = GOTA.dropBottom; // squash about the drop's bottom as it merges
  const satY = GOTA.satZ;
  const w = GOTA.underFreeze;
  return (
    <>
      <Rig cam={s.cam} />
      <primitive object={water.lines} />
      <group>
        {P.grifo.fill && <primitive object={P.grifo.fill} />}
        <primitive object={P.grifo.lines} />
        {P.resto.fill && <primitive object={P.resto.fill} />}
        <primitive object={P.resto.lines} />
      </group>
      {s.dropSquash > 0.001 && (
        <group position={[0, s.dropDy + dropY * (1 - s.dropSquash), 0]} scale={[1 + 0.25 * (1 - s.dropSquash), s.dropSquash, 1 + 0.25 * (1 - s.dropSquash)]}>
          {P.gota.fill && <primitive object={P.gota.fill} />}
          <primitive object={P.gota.lines} />
        </group>
      )}
      {s.satSquash > 0.001 && (
        <group position={[0, s.satDy + satY * (1 - s.satSquash), 0]} scale={[1, s.satSquash, 1]}>
          {P.sat.fill && <primitive object={P.sat.fill} />}
          <primitive object={P.sat.lines} />
        </group>
      )}
      {/* the reflection: the same drop mirrored in the water plane, fainter */}
      {s.dropSquash > 0.001 && (
        <group position={[0, 2 * w, 0]} scale={[1, -1, 1]}>
          <group position={[0, s.dropDy + dropY * (1 - s.dropSquash), 0]} scale={[1 + 0.25 * (1 - s.dropSquash), s.dropSquash, 1 + 0.25 * (1 - s.dropSquash)]}>
            <primitive object={P.gotaR.lines} />
          </group>
          {s.satSquash > 0.001 && (
            <group position={[0, s.satDy + satY * (1 - s.satSquash), 0]} scale={[1, s.satSquash, 1]}>
              <primitive object={P.satR.lines} />
            </group>
          )}
        </group>
      )}
    </>
  );
};

/** three.js layer of the reveal: the tap, the drop, its reflection and the water as an orange CAD wire, on the plates' camera. */
export const Gota3D: React.FC<{ s: WireState }> = ({ s }) => (
  <ThreeCanvas width={1080} height={1920} camera={{ fov: 19, position: [0, 0, 0.1], near: 0.003, far: 5 }}
    gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
    <Scene s={s} />
  </ThreeCanvas>
);
