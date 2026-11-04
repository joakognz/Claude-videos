import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { C, FICHAS, TL } from "../theme";
import { Cam, b2t, plateCam } from "./camara";
import { Escena, HERO } from "./escena";

type Tile = { base: THREE.Matrix4; mesh: THREE.BufferGeometry; edges: LineSegmentsGeometry };
type Assets = { tiles: Tile[]; plate: THREE.Texture; ids: THREE.Texture; param: THREE.Texture };

let cache: Promise<Assets> | null = null;
const loadTex = (url: string) => new Promise<THREE.Texture>((res, rej) => new THREE.TextureLoader().load(url, (tx) => {
  tx.colorSpace = THREE.NoColorSpace;   // raw values in, raw values out (the overlay shader writes them untouched)
  tx.minFilter = THREE.LinearFilter;
  tx.generateMipmaps = false;
  res(tx);
}, undefined, rej));

const loadAssets = () => {
  cache ??= Promise.all([
    new Promise<Tile[]>((resolve, reject) => {
      new GLTFLoader().load(staticFile("models/fichas.glb"), (gltf) => {
        const out: Tile[] = [];
        gltf.scene.updateMatrixWorld(true);
        const found: { i: number; m: THREE.Mesh }[] = [];
        gltf.scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh && /wire_(\d+)/.test(m.name)) found.push({ i: Number(m.name.match(/wire_(\d+)/)![1]), m });
        });
        found.sort((a, b) => a.i - b.i);
        for (const { m } of found) {
          const g = m.geometry.clone();
          // EdgesGeometry merges vertices on a 1e-4 grid: in metres it would swallow the sub-millimetre bevel and pip
          // rings, so the edges are found in micrometres and scaled back
          const e = new THREE.EdgesGeometry(g.clone().scale(1e6, 1e6, 1e6), 24);
          const pos = (e.attributes.position.array as Float32Array).map((v) => v * 1e-6);
          const lg = new LineSegmentsGeometry();
          lg.setPositions(pos);
          out.push({ base: m.matrixWorld.clone(), mesh: g, edges: lg });
        }
        resolve(out);
      }, undefined, reject);
    }),
    loadTex(staticFile(`plates/a_${String(FICHAS.freeze).padStart(4, "0")}.png`)),
    loadTex(staticFile("plates/mask_ids.png")),
    loadTex(staticFile("plates/mask_param.png")),
  ]).then(([tiles, plate, ids, param]) => ({ tiles, plate, ids, param }));
  return cache;
};

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(...cam.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(...cam.target);
  camera.fov = cam.fov;
  camera.near = 0.005;
  camera.far = 20;
  camera.updateProjectionMatrix();
  return null;
};

const lineMat = (o: Partial<{ width: number; color: string; vertexColors: boolean; depthTest: boolean }>) => {
  const m = new LineMaterial({
    // normal blending: tiny segments overlap at their joins, additive would burn them yellow
    color: o.color ?? C.orange, linewidth: o.width ?? 2.0, worldUnits: false, transparent: true, depthWrite: false,
    depthTest: o.depthTest ?? true, blending: THREE.NormalBlending, toneMapped: false, vertexColors: o.vertexColors ?? false,
  });
  m.resolution.set(1080, 1920);
  return m;
};

// ── the table as a structure: a 2 cm grid on its plane, fading with distance from the end of the chain ──
const HERO_B = FICHAS.tiles[HERO].c; // three axes
const gridGeometry = () => {
  const pos: number[] = [];
  const col: number[] = [];
  const o = new THREE.Color(C.orange);
  const push = (a: number[], b: number[]) => {
    pos.push(...a, ...b);
    for (const p of [a, b]) {
      const d = Math.hypot(p[0] - HERO_B[0], p[2] - HERO_B[2]);
      const k = Math.exp(-d / 0.55) * 0.85 + 0.08;
      col.push(o.r * k, o.g * k, o.b * k);
    }
  };
  const X0 = -0.6, X1 = 0.6, Y0 = -0.25, Y1 = 2.0, STEP = 0.02, SEG = 0.05;
  for (let x = X0; x <= X1 + 1e-9; x += STEP) {
    for (let y = Y0; y < Y1 - 1e-9; y += SEG) push(b2t([x, y, 0]), b2t([x, Math.min(Y1, y + SEG), 0]));
  }
  for (let y = Y0; y <= Y1 + 1e-9; y += STEP) {
    for (let x = X0; x < X1 - 1e-9; x += SEG) push(b2t([x, y, 0]), b2t([Math.min(X1, x + SEG), y, 0]));
  }
  const g = new LineSegmentsGeometry();
  g.setPositions(pos);
  g.setColors(col);
  return g;
};

// ── the clac as a 3D structure: its spectrogram (time × 24 bands) standing on the table right of the last tile ──
const SPEC = TL.clacSpec;
// it floats in the studio's black above the far chain, top right of the frozen view (found by un-projecting that corner
// of the frame at 0.7 m): time runs left → right across the frame, the 24 bands go away from the camera
const PC = plateCam(FICHAS, FICHAS.freeze);
const v3 = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const fw = v3(PC.target).sub(v3(PC.pos)).normalize();
const rt = new THREE.Vector3().crossVectors(fw, new THREE.Vector3(0, 1, 0)).normalize();
const upc = new THREE.Vector3().crossVectors(rt, fw);
const fwh = new THREE.Vector3(fw.x, 0, fw.z).normalize();
const unproj = (sx: number, sy: number, depth: number) => {
  const th = Math.tan((PC.fov * Math.PI) / 360);
  return v3(PC.pos).addScaledVector(fw, depth).addScaledVector(rt, ((sx - 540) / 960) * th * depth).addScaledVector(upc, ((960 - sy) / 960) * th * depth);
};
const SP0 = unproj(660, 560, 0.7);
const SPW = 0.042, SPD = 0.028, SPH = 0.024;
const at = (u: number, v: number, h: number) => SP0.clone().addScaledVector(rt, SPW * u).addScaledVector(fwh, SPD * v).add(new THREE.Vector3(0, SPH * h, 0));
const soundPositions = (draw: number) => {
  const nt = SPEC.length;
  const nb = SPEC[0].length;
  const head = draw * (nt - 1);
  const lv = (i: number, k: number) => (i <= head ? SPEC[i][k] * Math.min(1, (head - i + 1) / 2.5) : 0);
  const P = (i: number, k: number, l: number) => at(i / (nt - 1), k / (nb - 1), l).toArray();
  const pos: number[] = [];
  for (let k = 0; k < nb; k += 1) for (let i = 0; i < nt - 1; i++) pos.push(...P(i, k, lv(i, k)), ...P(i + 1, k, lv(i + 1, k)));
  for (let i = 0; i < nt; i += 1) for (let k = 0; k < nb - 1; k++) pos.push(...P(i, k, lv(i, k)), ...P(i, k + 1, lv(i, k + 1)));
  // the playhead: a frame standing at the current time
  if (draw > 0 && draw < 1) {
    const u = draw;
    const q = [at(u, 0, 0), at(u, 0, 1.15), at(u, 1, 1.15), at(u, 1, 0)].map((v) => v.toArray());
    pos.push(...q[0], ...q[1], ...q[1], ...q[2], ...q[2], ...q[3]);
  }
  return pos;
};

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = `
uniform sampler2D plate; uniform sampler2D ids; uniform sampler2D param;
uniform float pHero; uniform float pTiles; uniform float pTable; uniform float pAll;
varying vec2 vUv;
void main(){
  vec3 c = texture2D(plate, vUv).rgb;
  vec3 id = texture2D(ids, vUv).rgb;
  vec3 pr = texture2D(param, vUv).rgb;
  float chain = pow(pr.r, 2.2);            // 0 far end … 1 next to the last tile (stored through the sRGB curve)
  float depth = pow(pr.g, 2.2);            // along the table, near → far
  float front = 1.0 - pTiles * 1.1;        // the tiles turn to mesh from the last one back to the far end
  float rT = pTiles > 0.0 ? smoothstep(front - 0.012, front + 0.012, chain) : 0.0;
  float fT = pTable * 1.1 - 0.04;          // the table turns to its grid from near to far
  float rM = pTable > 0.0 ? 1.0 - smoothstep(fT - 0.012, fT + 0.012, depth) : 0.0;
  float bg = clamp(1.0 - id.r - id.g - id.b, 0.0, 1.0);
  float reveal = max(max(id.r * pHero, id.g * rT), id.b * rM);
  reveal = max(reveal, bg * smoothstep(0.85, 1.0, pTable));
  reveal = max(reveal, pAll);
  float gT = id.g * (1.0 - smoothstep(0.0, 0.022, abs(chain - front))) * step(0.001, pTiles) * (1.0 - step(0.999, pTiles));
  float gM = id.b * (1.0 - smoothstep(0.0, 0.006, abs(depth - fT))) * step(0.001, pTable) * (1.0 - step(0.999, pTable));
  float glow = clamp(gT * 0.55 + gM * 0.8, 0.0, 1.0) * (1.0 - pAll);
  c = mix(c, vec3(1.0, 0.69, 0.40), glow);
  gl_FragColor = vec4(c, max(1.0 - reveal, glow));
}`;

const Scene: React.FC<{ s: Escena; a: Assets }> = ({ s, a }) => {
  const tileMat = useMemo(() => lineMat({ width: 1.9 }), []);
  const heroMat = useMemo(() => lineMat({ width: 2.4 }), []);
  const fill = useMemo(() => new THREE.MeshBasicMaterial({ color: "#050505", polygonOffset: true, polygonOffsetFactor: 6, polygonOffsetUnits: 18 }), []);
  const tiles = useMemo(() => a.tiles.map((t, i) => {
    const grp = new THREE.Group();
    grp.matrixAutoUpdate = false;
    const mesh = new THREE.Mesh(t.mesh, fill);
    mesh.renderOrder = 0;
    mesh.frustumCulled = false;
    const lines = new LineSegments2(t.edges, i === HERO ? heroMat : tileMat);
    lines.renderOrder = 2;
    lines.frustumCulled = false;
    grp.add(mesh, lines);
    return grp;
  }), [a, fill, tileMat, heroMat]);
  const grid = useMemo(() => {
    const l = new LineSegments2(gridGeometry(), lineMat({ width: 1.2, vertexColors: true, color: "#ffffff" }));
    l.renderOrder = 1;
    l.frustumCulled = false;
    return l;
  }, []);
  const sound = useMemo(() => {
    const g = new LineSegmentsGeometry();
    const l = new LineSegments2(g, lineMat({ width: 1.6, color: C.orangeSoft, depthTest: false }));
    l.renderOrder = 3;
    l.frustumCulled = false;
    return l;
  }, []);
  const overlay = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
      uniforms: { plate: { value: a.plate }, ids: { value: a.ids }, param: { value: a.param }, pHero: { value: 0 }, pTiles: { value: 0 }, pTable: { value: 0 }, pAll: { value: 0 } },
    });
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m);
    q.frustumCulled = false;
    q.renderOrder = 10;
    return q;
  }, [a]);
  // pose every tile: rolling on its front-bottom edge by its tilt (local −z is the fall direction, see camara.ts)
  const R = FICHAS.rEdge;
  tiles.forEach((grp, i) => {
    const phi = s.tilts[i];
    const m = a.tiles[i].base.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, -R * phi)).multiply(new THREE.Matrix4().makeRotationX(-phi));
    grp.matrix.copy(m);
    grp.matrixWorldNeedsUpdate = true;
  });
  tileMat.opacity = s.wire;
  heroMat.opacity = s.wire;
  heroMat.color.set(C.orange).lerp(new THREE.Color(C.orangeSoft), s.land);
  heroMat.linewidth = 2.4 + 2.2 * s.land;
  (grid.material as LineMaterial).opacity = s.grid;
  if (s.sound.show > 0.001) {
    (sound.geometry as LineSegmentsGeometry).setPositions(soundPositions(s.sound.draw));
    (sound.material as LineMaterial).opacity = s.sound.show;
  }
  const u = overlay.material.uniforms;
  if (s.overlay) {
    u.pHero.value = s.overlay.hero;
    u.pTiles.value = s.overlay.tiles;
    u.pTable.value = s.overlay.table;
    u.pAll.value = s.overlay.all;
  }
  return (
    <>
      <Rig cam={s.cam} />
      {tiles.map((g, i) => <primitive key={i} object={g} />)}
      {s.grid > 0.001 && <primitive object={grid} />}
      {s.sound.show > 0.001 && <primitive object={sound} />}
      {s.overlay && s.overlay.all < 0.999 && <primitive object={overlay} />}
    </>
  );
};

/** three.js layer of the reveal: the photo peeled off element by element, the mesh underneath, the chain replayed. */
export const Fichas3D: React.FC<{ s: Escena }> = ({ s }) => {
  const [assets, setAssets] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender("fichas.glb + plate + masks"));
  useEffect(() => {
    loadAssets().then((x) => { setAssets(x); continueRender(handle); }).catch((e) => cancelRender(e));
  }, [handle]);
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 20, position: [0, 0.05, 0.4], near: 0.005, far: 20 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
      {assets && <Scene s={s} a={assets} />}
    </ThreeCanvas>
  );
};
