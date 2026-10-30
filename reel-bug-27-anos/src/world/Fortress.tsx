import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EASE, EASE_OUT, EV, S, TITLE, clamp01, lerp, rand, springAt } from "../theme";
import {
  BALANCE, CRACKS, GATE, GATE_H, GATE_W, HALF, KEEP, KEEP_H, KEEP_W, PATH_FROM, TOWER, TOWER_H, WALL_H, WALL_T, XFACE, ZFACE,
  crackPoint, lightsAt, orbAAt, orbBAt, packetAt, sinkY,
} from "./layout";
import { GroundRing, Seg, useGlowMat } from "./prims";
import { plateTex } from "./textures";

const useStone = (shade: number) => useMemo(() => new THREE.MeshStandardMaterial({
  color: new THREE.Color(C.cream).multiplyScalar(shade), roughness: 0.92, flatShading: true,
}), [shade]);

/** Crenellations along a wall top from a to b. */
const Crenels: React.FC<{ a: V3; b: V3; mat: THREE.Material; size?: number }> = ({ a, b, mat, size = 0.22 }) => {
  const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const n = Math.floor(len / (size * 2));
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const p = (i + 0.5) / n;
        return (
          <mesh key={i} material={mat} position={[lerp(a[0], b[0], p), a[1] + size / 2, lerp(a[2], b[2], p)]} scale={[size, size, size]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
        );
      })}
    </>
  );
};

/** Lit windows (the fortress's lights), on the faces the camera sees. */
const WINDOWS: { p: V3; ry: number }[] = (() => {
  const out: { p: V3; ry: number }[] = [];
  const towers: [number, number][] = [[HALF, HALF], [HALF, -HALF], [-HALF, HALF]];
  for (const [x, z] of towers) {
    for (const y of [1.0, 1.75]) {
      out.push({ p: [x + TOWER / 2 + 0.012, y, z], ry: Math.PI / 2 });
      out.push({ p: [x, y, z + TOWER / 2 + 0.012], ry: 0 });
    }
  }
  for (const y of [1.6, 2.3]) {
    for (const u of [-0.45, 0.45]) {
      out.push({ p: [KEEP[0] + KEEP_W / 2 + 0.012, y, KEEP[2] + u], ry: Math.PI / 2 });
      out.push({ p: [KEEP[0] + u, y, KEEP[2] + KEEP_W / 2 + 0.012], ry: 0 });
    }
  }
  return out;
})();

const Body: React.FC<{ t: number; lights: number }> = ({ t, lights }) => {
  const stone = useStone(0.62);
  const stoneDark = useStone(0.48);
  const door = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2d24", roughness: 0.8, flatShading: true }), []);
  const win = useMemo(() => new THREE.MeshBasicMaterial({ color: C.orangeSoft, toneMapped: false }), []);
  const layer = useGlowMat(C.cream, 1.4);
  const plate = useMemo(() => plateTex(TITLE), []);
  const plateMat = useMemo(() => new THREE.MeshBasicMaterial({ map: plate, toneMapped: false }), [plate]);
  win.color.set(C.orangeSoft).multiplyScalar(0.06 + 1.25 * lights);
  plateMat.color.setScalar(0.35 + 0.85 * lights);
  // E2: thin layers of light wrap the walls, bottom to top
  const layers = [0.35, 0.75, 1.15].map((y, i) => EASE(clamp01((t - EV.layers - i * 0.3) / 0.6)));
  layer.opacity = 0.8 * lights;
  const H = HALF;
  const walls: { p: V3; s: V3 }[] = [
    { p: [0, WALL_H / 2, H], s: [2 * H, WALL_H, WALL_T] },
    { p: [0, WALL_H / 2, -H], s: [2 * H, WALL_H, WALL_T] },
    { p: [H, WALL_H / 2, 0], s: [WALL_T, WALL_H, 2 * H] },
    { p: [-H, WALL_H / 2, 0], s: [WALL_T, WALL_H, 2 * H] },
  ];
  const corners: [number, number][] = [[H, H], [H, -H], [-H, H], [-H, -H]];
  const plateIn = springAt(t, EV.sign, 12, 180);
  return (
    <>
      {walls.map((w, i) => (
        <mesh key={i} material={stone} position={w.p} scale={w.s}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
      <Crenels a={[-H, WALL_H, H + 0.1]} b={[H, WALL_H, H + 0.1]} mat={stone} />
      <Crenels a={[H + 0.1, WALL_H, H]} b={[H + 0.1, WALL_H, -H]} mat={stone} />
      <Crenels a={[-H, WALL_H, -H]} b={[H, WALL_H, -H]} mat={stone} />
      <Crenels a={[-H, WALL_H, -H]} b={[-H, WALL_H, H]} mat={stone} />
      {corners.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh material={stoneDark} position={[0, TOWER_H / 2, 0]} scale={[TOWER, TOWER_H, TOWER]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
          <Crenels a={[-TOWER / 2, TOWER_H, TOWER / 2 - 0.1]} b={[TOWER / 2, TOWER_H, TOWER / 2 - 0.1]} mat={stoneDark} size={0.2} />
          <Crenels a={[TOWER / 2 - 0.1, TOWER_H, TOWER / 2]} b={[TOWER / 2 - 0.1, TOWER_H, -TOWER / 2]} mat={stoneDark} size={0.2} />
          <Crenels a={[-TOWER / 2 + 0.1, TOWER_H, -TOWER / 2]} b={[-TOWER / 2 + 0.1, TOWER_H, TOWER / 2]} mat={stoneDark} size={0.2} />
          <Crenels a={[-TOWER / 2, TOWER_H, -TOWER / 2 + 0.1]} b={[TOWER / 2, TOWER_H, -TOWER / 2 + 0.1]} mat={stoneDark} size={0.2} />
        </group>
      ))}
      {/* keep */}
      <mesh material={stone} position={[KEEP[0], KEEP_H / 2, KEEP[2]]} scale={[KEEP_W, KEEP_H, KEEP_W]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh material={stoneDark} position={[KEEP[0] - 0.3, KEEP_H + 0.4, KEEP[2] - 0.3]} scale={[0.8, 0.8, 0.8]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <Crenels a={[KEEP[0] - KEEP_W / 2, KEEP_H, KEEP[2] + KEEP_W / 2 - 0.1]} b={[KEEP[0] + KEEP_W / 2, KEEP_H, KEEP[2] + KEEP_W / 2 - 0.1]} mat={stone} />
      <Crenels a={[KEEP[0] + KEEP_W / 2 - 0.1, KEEP_H, KEEP[2] + KEEP_W / 2]} b={[KEEP[0] + KEEP_W / 2 - 0.1, KEEP_H, KEEP[2] - KEEP_W / 2]} mat={stone} />
      {/* gate: closed door + plate */}
      <mesh material={door} position={[GATE[0], GATE_H / 2, GATE[2]]} scale={[GATE_W, GATE_H, 0.08]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh material={stoneDark} position={[GATE[0], GATE_H + 0.06, GATE[2] + 0.02]} scale={[GATE_W + 0.24, 0.12, 0.14]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      {plateIn > 0 && (
        <mesh material={plateMat} position={[0, WALL_H - 0.22, GATE[2] + 0.03]} scale={[plateIn, plateIn, 1]}>
          <planeGeometry args={[1.5, 0.35]} />
        </mesh>
      )}
      {WINDOWS.map((w, i) => (
        <mesh key={i} material={win} position={w.p} rotation={[0, w.ry, 0]}>
          <planeGeometry args={[0.16, 0.3]} />
        </mesh>
      ))}
      {/* security layers on the two walls the camera sees */}
      {layers.map((p, i) => {
        const y = [0.35, 0.75, 1.15][i];
        return (
          <React.Fragment key={i}>
            <Seg a={[XFACE, y, H]} b={[XFACE, y, -H]} w={0.025} p={p} mat={layer} />
            <Seg a={[-H, y, ZFACE]} b={[-GATE_W / 2 - 0.1, y, ZFACE]} w={0.025} p={p} mat={layer} />
            <Seg a={[H, y, ZFACE]} b={[GATE_W / 2 + 0.1, y, ZFACE]} w={0.025} p={p} mat={layer} />
          </React.Fragment>
        );
      })}
      <pointLight position={[1.5, 2.6, 1.5]} color={C.orangeSoft} intensity={3.5 * lights} distance={9} decay={1.5} />
    </>
  );
};

/** E4: the malformed packet (twisted knot) running up the path, with ghosts and a trail; flash at the gate. */
const Packet: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.6, roughness: 0.4, flatShading: true, transparent: true }), []);
  const trail = useGlowMat(C.cream, 1.3);
  const flash = useGlowMat(C.orangeSoft, 2.2);
  const out: React.ReactNode[] = [];
  if (t >= EV.packet - 0.3 && t < EV.hit) {
    const appear = EASE_OUT(clamp01((t - EV.packet + 0.3) / 0.3));
    const knot = (tt: number, o: number, key: string) => (
      <mesh key={key} position={packetAt(tt)} rotation={[tt * 5, tt * 7, tt * 3]} scale={0.9 * appear}
        material={o < 1 ? (() => { const m = mat.clone(); m.opacity = o; m.depthWrite = false; return m; })() : mat}>
        <torusKnotGeometry args={[0.2, 0.065, 48, 6, 2, 3]} />
      </mesh>
    );
    out.push(knot(t, 1, "k"));
    const speed = Math.hypot(...(packetAt(t).map((v, i) => v - packetAt(t - 1 / 30)[i]) as [number, number, number])) * 30;
    if (speed > 2) [1, 2, 3, 4].forEach((k) => out.push(knot(t - k * 0.02, 0.35 * (1 - k / 5), `g${k}`)));
    trail.opacity = 0.7;
    for (let k = 0; k < 14; k++) {
      const ta = Math.max(EV.packet, t - (k + 1) * 0.035);
      const tb = Math.max(EV.packet, t - k * 0.035);
      if (tb > ta) out.push(<Seg key={`t${k}`} a={packetAt(ta)} b={packetAt(tb)} w={0.05 * (1 - k / 14)} mat={trail} />);
    }
  }
  const f = clamp01((t - EV.hit) / 0.7);
  if (f > 0 && f < 1) {
    flash.opacity = 1 - f;
    out.push(<mesh key="fl" position={[GATE[0], GATE_H / 2, GATE[2] + 0.06]} scale={[0.2 + f * 1.1, 0.2 + f * 1.1, 1]} material={flash}><ringGeometry args={[0.9, 1, 48]} /></mesh>);
  }
  return <>{out}</>;
};

/** E6: 27 notches cut in the +x wall, fading towards the back. */
const Notches: React.FC<{ t: number }> = ({ t }) => {
  const mats = useMemo(() => Array.from({ length: 27 }, () => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.cream).multiplyScalar(1.3), transparent: true, toneMapped: false })), []);
  const fade = 1 - clamp01((t - S.E7 + 0.2) / 0.5);
  if (t < EV.notches || fade <= 0) return null;
  return (
    <>
      {mats.map((m, i) => {
        const s = springAt(t, EV.notches + i * EV.notchStep, 12, 220);
        const depth = i / 26; // 0 front → 1 back
        m.opacity = clamp01(s) * (1 - 0.82 * depth) * fade;
        const z = lerp(HALF - 0.35, -HALF + 0.35, depth);
        return (
          <mesh key={i} material={m} position={[XFACE + 0.005, 0.95, z]} rotation={[0, Math.PI / 2, 0]} scale={[1, Math.max(0.01, s), 1]}>
            <planeGeometry args={[0.055, 0.36]} />
          </mesh>
        );
      })}
    </>
  );
};

/** Cracks of light: faint until found, then orange. */
const Cracks: React.FC<{ t: number }> = ({ t }) => {
  const dim = useMemo(() => new THREE.MeshBasicMaterial({ color: "#2a211b" }), []);
  const lit = useGlowMat(C.orange, 2.6);
  lit.opacity = 1;
  const visible = t > S.E7 - 0.2;
  if (!visible) return null;
  // when each crack lights up: 0 by orb A, then all of them by the Lupa in E8 (1 never by orb B)
  const order = [0, 3, 1, 2]; // position of each crack in the Lupa's sweep (0 is already lit by orb A)
  const on = (i: number) => EASE_OUT(clamp01((t - (i === 0 ? EV.found : EV.cracks + order[i] * EV.crackStep)) / 0.3));
  return (
    <>
      {CRACKS.map((c, i) => {
        const p = on(i);
        const pts = c.pts.map((uv) => crackPoint(c, uv));
        return pts.slice(0, -1).map((a, k) => {
          const b = pts[k + 1];
          const grow = clamp01(p * (pts.length - 1) - k);
          return (
            <React.Fragment key={`${i}-${k}`}>
              <Seg a={a} b={b} w={0.035} mat={dim} />
              {grow > 0 && <Seg a={a} b={b} w={0.05} p={grow} mat={lit} />}
            </React.Fragment>
          );
        });
      })}
    </>
  );
};

/** E7: two small orbs of light scanning the walls. */
const Orbs: React.FC<{ t: number }> = ({ t }) => {
  const a = useGlowMat(C.orange, 2.4);
  const b = useGlowMat(C.orange, 1.5);
  const beamA = useGlowMat(C.orangeSoft, 1.2);
  const beamB = useGlowMat(C.orangeSoft, 0.8);
  const out = clamp01((t - S.E8 + 0.3) / 0.5);
  if (t < EV.orbA - 0.3 || out >= 1) return null;
  const sa = EASE_OUT(clamp01((t - EV.orbA + 0.3) / 0.4)) * (1 - out);
  const sb = EASE_OUT(clamp01((t - EV.orbB + 0.3) / 0.4)) * (1 - out);
  const pa = orbAAt(t);
  const pb = orbBAt(t);
  beamA.opacity = 0.45 * sa;
  beamB.opacity = 0.3 * sb;
  return (
    <>
      {sa > 0 && (
        <>
          <mesh position={pa} scale={0.17 * sa} material={a}><icosahedronGeometry args={[1, 0]} /></mesh>
          <Seg a={pa} b={[XFACE, pa[1] - 0.45, pa[2]]} w={0.05} mat={beamA} />
          <Seg a={pa} b={[XFACE, pa[1] + 0.45, pa[2]]} w={0.05} mat={beamA} />
          <pointLight position={pa} color={C.orange} intensity={2.5 * sa} distance={2.5} decay={1.6} />
        </>
      )}
      {sb > 0 && (
        <>
          <mesh position={pb} scale={0.15 * sb} material={b}><icosahedronGeometry args={[1, 0]} /></mesh>
          <Seg a={pb} b={[pb[0], pb[1] - 0.45, ZFACE]} w={0.05} mat={beamB} />
          <Seg a={pb} b={[pb[0], pb[1] + 0.45, ZFACE]} w={0.05} mat={beamB} />
        </>
      )}
    </>
  );
};

/** E8: a balance of light that never settles. */
const Balance: React.FC<{ t: number }> = ({ t }) => {
  const mat = useGlowMat(C.orange, 1.9);
  const soft = useGlowMat(C.orangeSoft, 1.4);
  const s = springAt(t, EV.balance, 11, 160);
  const out = clamp01((t - EV.morph) / 0.4);
  if (s <= 0.001 || out >= 1) return null;
  mat.opacity = 1 - out;
  soft.opacity = 0.9 * (1 - out);
  const tilt = 0.32 * Math.sin((t - EV.balance) * 3.1) + 0.12 * Math.sin((t - EV.balance) * 7.3 + 1);
  const [x, , z] = BALANCE;
  const H = 1.35 * s;
  const L = 0.85;
  // beam along the screen's horizontal (world (1,0,-1)/√2) so the tilt reads
  const r2 = Math.SQRT1_2;
  const end = (side: number): V3 => [x + side * L * Math.cos(tilt) * r2, H + side * L * Math.sin(tilt), z - side * L * Math.cos(tilt) * r2];
  const L1 = end(-1);
  const R1 = end(1);
  const pan = (top: V3, k: string) => (
    <React.Fragment key={k}>
      <Seg a={top} b={[top[0] - 0.15, top[1] - 0.55, top[2]]} w={0.02} mat={soft} />
      <Seg a={top} b={[top[0] + 0.15, top[1] - 0.55, top[2]]} w={0.02} mat={soft} />
      <GroundRing c={[top[0], top[1] - 0.55, top[2]]} r={0.2} w={0.06} mat={mat} />
    </React.Fragment>
  );
  return (
    <>
      <Seg a={[x, 0, z]} b={[x, H + 0.1, z]} w={0.05} mat={mat} />
      <GroundRing c={[x, 0.01, z]} r={0.3} w={0.05} mat={soft} />
      <Seg a={L1} b={R1} w={0.045} mat={mat} />
      {pan(L1, "l")}
      {pan(R1, "r")}
    </>
  );
};

/** The path the packet comes up. */
const Path: React.FC = () => (
  <mesh position={[0, 0.012, (PATH_FROM[2] + HALF) / 2 + 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[1.0, PATH_FROM[2] - HALF + 0.4]} />
    <meshStandardMaterial color="#2c241e" roughness={0.95} />
  </mesh>
);

const PEBBLES = Array.from({ length: 10 }, (_, i) => ({ x: (rand(i + 3) - 0.5) * 0.8, z: HALF + 0.8 + rand(i + 9) * 6 }));

export const Fortress: React.FC<{ t: number }> = ({ t }) => {
  const lights = lightsAt(t);
  const pebble = useStone(0.3);
  return (
    <group position={[0, sinkY(t), 0]}>
      <Path />
      {PEBBLES.map((p, i) => (
        <mesh key={i} material={pebble} position={[p.x, 0.03, p.z]} scale={0.05}><dodecahedronGeometry args={[1, 0]} /></mesh>
      ))}
      <Body t={t} lights={lights} />
      <Packet t={t} />
      <Notches t={t} />
      <Cracks t={t} />
      <Orbs t={t} />
      <Balance t={t} />
    </group>
  );
};
