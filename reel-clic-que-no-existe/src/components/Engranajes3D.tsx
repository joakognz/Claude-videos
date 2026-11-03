import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { C, ENGR } from "../theme";
import { Cam, V3 } from "./camara";

/** Wireframe state for one frame. Offsets are in metres, three.js axes. */
export type WireState = {
  cam: Cam;
  wire: number; // visible edges (0..1)
  xray: number; // hidden edges seen through the solids (0..1, kept faint)
  pitch: number; // pitch circles of both gears, tangent at the mesh point
  offsets: Record<string, V3>; // per part (exploded view)
  flash: Record<string, number>; // per group: a part that just landed glows for a moment
};

type Part = { name: string; group: string; mesh: THREE.BufferGeometry; edges: LineSegmentsGeometry };

let cache: Promise<Part[]> | null = null;
const loadParts = () => {
  cache ??= new Promise<Part[]>((resolve, reject) => {
    new GLTFLoader().load(staticFile("models/engranajes.glb"), (gltf) => {
      const out: Part[] = [];
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const g = m.geometry.clone();
        g.applyMatrix4(m.matrixWorld);
        // EdgesGeometry merges vertices on a 1e-4 grid: in metres that would swallow the 26 µm steps of the tooth
        // profile (every other segment would vanish), so the edges are found in micrometres and scaled back
        const e = new THREE.EdgesGeometry(g.clone().scale(1e6, 1e6, 1e6), 24);
        const pos = (e.attributes.position.array as Float32Array).map((v) => v * 1e-6);
        const lg = new LineSegmentsGeometry();
        lg.setPositions(pos);
        out.push({ name: m.name, group: m.name.split("_")[0], mesh: g, edges: lg });
      });
      resolve(out);
    }, undefined, reject);
  });
  return cache;
};

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(...cam.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(...cam.target);
  camera.fov = cam.fov;
  camera.near = 0.002;
  camera.far = 2;
  camera.updateProjectionMatrix();
  return null;
};

const ORANGE = new THREE.Color(C.orange);
const SOFT = new THREE.Color(C.orangeSoft);
const RA = (ENGR.module * ENGR.zA) / 2;
const RB = (ENGR.module * ENGR.zB) / 2;

const lineMat = (opts: Partial<{ width: number; depthTest: boolean }>) => {
  const m = new LineMaterial({
    // normal blending: the profile is made of thousands of tiny segments whose joins overlap, additive would burn them yellow
    color: C.orange, linewidth: opts.width ?? 2.2, worldUnits: false, transparent: true, depthWrite: false,
    depthTest: opts.depthTest ?? true, blending: THREE.NormalBlending, toneMapped: false,
  });
  m.resolution.set(1080, 1920);
  return m;
};

const circleGeo = (r: number) => {
  const pts: number[] = [];
  for (let i = 0; i <= 256; i++) pts.push(Math.cos((i / 256) * Math.PI * 2) * r, Math.sin((i / 256) * Math.PI * 2) * r, 0);
  const g = new LineGeometry();
  g.setPositions(pts);
  return g;
};

const Scene: React.FC<{ s: WireState; parts: Part[] }> = ({ s, parts }) => {
  const mats = useMemo(() => parts.map(() => ({ vis: lineMat({}), hid: lineMat({ width: 1.3, depthTest: false }) })), [parts]);
  // the black fills only hide the far side; pushed well back so the edges lying on them never z-fight into dashes
  const fill = useMemo(() => new THREE.MeshBasicMaterial({ color: "#050505", polygonOffset: true, polygonOffsetFactor: 8, polygonOffsetUnits: 24 }), []);
  const pitchMat = useMemo(() => {
    const m = new LineMaterial({ color: C.white, linewidth: 2, worldUnits: false, dashed: true, dashSize: 0.0009, gapSize: 0.0006,
      transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
    m.resolution.set(1080, 1920);
    return m;
  }, []);
  const circles = useMemo(() => [circleGeo(RA), circleGeo(RB)].map((g) => {
    const l = new Line2(g, pitchMat);
    l.computeLineDistances();
    return l;
  }), [pitchMat]);
  const lines = useMemo(() => parts.map((p, i) => ({ vis: new LineSegments2(p.edges, mats[i].vis), hid: new LineSegments2(p.edges, mats[i].hid) })), [parts, mats]);
  pitchMat.opacity = 0.8 * s.pitch;
  if (s.wire <= 0.001) return <Rig cam={s.cam} />; // nothing (not even the black fills) while the plate shows
  return (
    <>
      <Rig cam={s.cam} />
      {parts.map((p, i) => {
        const off = s.offsets[p.name] ?? [0, 0, 0];
        const fl = s.flash[p.group] ?? 0;
        mats[i].vis.color.copy(ORANGE).lerp(SOFT, Math.min(1, fl));
        mats[i].vis.opacity = Math.min(1, s.wire);
        mats[i].vis.linewidth = 2.2 + 1.6 * fl;
        mats[i].hid.opacity = s.xray * 0.16;
        return (
          <group key={p.name} position={off}>
            <mesh geometry={p.mesh} material={fill} renderOrder={0} />
            <primitive object={lines[i].vis} renderOrder={2} />
            {s.xray > 0.001 && <primitive object={lines[i].hid} renderOrder={1} />}
          </group>
        );
      })}
      {s.pitch > 0.001 && (
        <>
          <group position={[0, RA, 0.0026 + (s.offsets.engranajeA?.[2] ?? 0)]}><primitive object={circles[0]} renderOrder={3} /></group>
          <group position={[0, -RB, 0.0031 + (s.offsets.engranajeB?.[2] ?? 0)]}><primitive object={circles[1]} renderOrder={3} /></group>
        </>
      )}
    </>
  );
};

/** three.js layer of the reveal: the gears as an orange CAD wireframe, on the plates' camera, exploding and reassembling. */
export const Engranajes3D: React.FC<{ s: WireState }> = ({ s }) => {
  const [parts, setParts] = useState<Part[] | null>(null);
  const [handle] = useState(() => delayRender("engranajes.glb"));
  useEffect(() => {
    loadParts().then((p) => { setParts(p); continueRender(handle); }).catch((e) => cancelRender(e));
  }, [handle]);
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 15, position: [0, 0, 0.1], near: 0.002, far: 2 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
      {parts && <Scene s={s} parts={parts} />}
    </ThreeCanvas>
  );
};
