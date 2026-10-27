import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { rand } from "../theme";
import { radialTex } from "./textures";

// Streets: [from, to] bands. EW streets run along x (band in z), NS streets run along z (band in x).
export const EW: [number, number][] = [[-46, -43.5], [-30, -27.5], [-14.5, -12], [1, 4], [17, 19.5], [33, 35.5]];
export const NS: [number, number][] = [[-38, -35.5], [-23, -20.5], [-8.5, -6], [6, 8.5], [20.5, 23], [35.5, 38]];
const EXT = 52;
const WALK = 0.8; // sidewalk width inside each block

type Bld = { x: number; z: number; w: number; d: number; h: number; c: number };

// hero points (the two shops): buildings in front of them along the view are kept low
const HEROES: [number, number][] = [[-2.6, -2.0], [2.6, -2.0], [0, -2.0]];
const capFor = (x: number, z: number, w: number, d: number) => {
  let cap = 99;
  for (const [hx, hz] of HEROES) {
    const front = ((x - hx) + (z - hz)) / Math.SQRT2 - (w + d) / 2.6;
    const lat = Math.abs((x - hx) - (z - hz)) / Math.SQRT2 - (w + d) / 3;
    if (front > -0.5 && lat < 11) cap = Math.min(cap, Math.max(0.4, 0.42 * front - 0.8));
  }
  return cap;
};

const bands = (list: [number, number][]) => {
  const edges = [-EXT, ...list.flat(), EXT];
  const out: [number, number][] = [];
  for (let i = 0; i < edges.length; i += 2) out.push([edges[i], edges[i + 1]]);
  return out;
};

export const BLOCKS = (() => {
  const out: { x0: number; x1: number; z0: number; z1: number }[] = [];
  for (const [x0, x1] of bands(NS)) for (const [z0, z1] of bands(EW)) out.push({ x0, x1, z0, z1 });
  return out;
})();

const isHeroBlock = (b: { x0: number; z0: number }) => b.x0 === -6 && b.z0 === -12;

const buildings = (): Bld[] => {
  const out: Bld[] = [];
  let seed = 1;
  for (const b of BLOCKS) {
    const x0 = b.x0 + WALK, x1 = b.x1 - WALK, z0 = b.z0 + WALK, z1 = b.z1 - WALK;
    if (isHeroBlock(b)) {
      // behind the shops: a taller backdrop row; corners; a narrow pillar between the shops
      let x = x0;
      while (x < x1 - 0.5) {
        const w = Math.min(x1 - x, 2.4 + rand(seed++) * 2.2);
        out.push({ x: x + w / 2, z: (z0 + -4.1) / 2, w: w - 0.12, d: -4.1 - z0, h: 5 + rand(seed++) * 6.5, c: rand(seed++) });
        x += w;
      }
      out.push({ x: 0, z: -2.0, w: 0.7, d: 3.6, h: 0.32, c: 0.3 });
      out.push({ x: -5.0, z: -2.0, w: 0.36, d: 3.6, h: 0.32, c: 0.5 });
      out.push({ x: 5.0, z: -2.0, w: 0.36, d: 3.6, h: 0.32, c: 0.5 });
      continue;
    }
    // split the block into a grid of lots
    const nx = Math.max(1, Math.round((x1 - x0) / (3 + rand(seed++) * 1.5)));
    const nz = Math.max(1, Math.round((z1 - z0) / (3.5 + rand(seed++) * 2)));
    const lw = (x1 - x0) / nx, ld = (z1 - z0) / nz;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < nz; j++) {
        if (rand(seed++) < 0.08) continue; // the odd empty lot
        const cx = x0 + (i + 0.5) * lw, cz = z0 + (j + 0.5) * ld;
        const w = lw - 0.18 - rand(seed++) * 0.3, d = ld - 0.18 - rand(seed++) * 0.3;
        const dist = Math.hypot(cx, cz + 2);
        let h = 1.2 + Math.pow(rand(seed++), 1.6) * (dist < 25 ? 9 : 14);
        h = Math.min(h, capFor(cx, cz, w, d));
        out.push({ x: cx, z: cz, w, d, h, c: rand(seed++) });
      }
    }
  }
  return out;
};

const tmp = new THREE.Object3D();
const col = new THREE.Color();

const Buildings: React.FC<{ list: Bld[] }> = ({ list }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current!;
    list.forEach((b, i) => {
      tmp.position.set(b.x, b.h / 2 + 0.06, b.z);
      tmp.scale.set(b.w, b.h, b.d);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      const v = 0.04 + b.c * 0.035; // #0A0A0A – #141414 range once lit by the night light
      m.setColorAt(i, col.setRGB(v, v, v * 1.03, THREE.SRGBColorSpace));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [list]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, list.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.92} metalness={0.05} />
    </instancedMesh>
  );
};

type Win = { p: [number, number, number]; ry: number; c: [number, number, number] };

const windows = (list: Bld[]): { lit: Win[]; dark: Win[] } => {
  const lit: Win[] = [], dark: Win[] = [];
  let seed = 9000;
  const warm: [number, number, number] = [1.0, 0.78, 0.5];
  const cool: [number, number, number] = [0.72, 0.84, 1.0];
  const white: [number, number, number] = [1, 0.96, 0.9];
  for (const b of list) {
    if (b.h < 1.6 || b.w < 0.9) continue;
    const floors = Math.floor((b.h - 0.5) / 0.85);
    const faces: [number, number, number][] = [[b.w, 1, 0], [b.d, 0, 1]]; // [length, +x face?, +z face?]
    for (const [len, fx] of faces) {
      const cols = Math.max(1, Math.floor((len - 0.3) / 0.72));
      for (let f = 0; f < floors; f++) {
        for (let k = 0; k < cols; k++) {
          const u = (k - (cols - 1) / 2) * 0.72;
          const y = 0.7 + f * 0.85;
          const p: [number, number, number] = fx ? [b.x + b.w / 2 + 0.01, y, b.z - u] : [b.x + u, y, b.z + b.d / 2 + 0.01];
          const r = rand(seed++);
          const ry = fx ? Math.PI / 2 : 0;
          if (r < 0.2) {
            const tone = rand(seed++);
            const base = tone < 0.6 ? warm : tone < 0.85 ? cool : white;
            const k2 = 0.55 + rand(seed++) * 0.9;
            lit.push({ p, ry, c: [base[0] * k2, base[1] * k2, base[2] * k2] });
          } else if (r < 0.5) {
            dark.push({ p, ry, c: [0.018, 0.019, 0.022] });
          }
        }
      }
    }
  }
  return { lit, dark };
};

const Windows: React.FC<{ list: Win[] }> = ({ list }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current!;
    list.forEach((w, i) => {
      tmp.position.set(...w.p);
      tmp.rotation.set(0, w.ry, 0);
      tmp.scale.set(0.36, 0.46, 1);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      m.setColorAt(i, col.setRGB(...w.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [list]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, list.length]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};

/** Ground, streets, sidewalks, lane marks and the small lights along the curbs. */
const Ground: React.FC = () => {
  const dashes = useMemo(() => {
    const out: [number, number, number, number][] = []; // x, z, len, rot
    for (const [a, b] of EW) for (let x = -EXT; x < EXT; x += 1.6) out.push([x, (a + b) / 2, 0.7, 0]);
    for (const [a, b] of NS) for (let z = -EXT; z < EXT; z += 1.6) out.push([(a + b) / 2, z, 0.7, Math.PI / 2]);
    return out.filter(([x, z]) => !EW.some(([a, b]) => z > a && z < b && NS.some(([c, d]) => x > c - 0.4 && x < d + 0.4)) &&
      !NS.some(([c, d]) => x > c && x < d && EW.some(([a, b]) => z > a - 0.4 && z < b + 0.4)) || false);
  }, []);
  const dashRef = useRef<THREE.InstancedMesh>(null);
  const slabRef = useRef<THREE.InstancedMesh>(null);
  const dotRef = useRef<THREE.InstancedMesh>(null);
  const dots = useMemo(() => {
    const out: [number, number][] = [];
    for (const b of BLOCKS) {
      for (let x = b.x0 + 0.6; x < b.x1 - 0.3; x += 1.25) out.push([x, b.z1 - 0.12]);
      for (let z = b.z0 + 0.6; z < b.z1 - 0.3; z += 1.25) out.push([b.x1 - 0.12, z]);
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = dashRef.current!;
    dashes.forEach(([x, z, len, rot], i) => {
      tmp.position.set(x, 0.012, z);
      tmp.rotation.set(-Math.PI / 2, 0, rot);
      tmp.scale.set(len, 0.07, 1);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    const s = slabRef.current!;
    BLOCKS.forEach((b, i) => {
      tmp.position.set((b.x0 + b.x1) / 2, 0.03, (b.z0 + b.z1) / 2);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(b.x1 - b.x0, 0.06, b.z1 - b.z0);
      tmp.updateMatrix();
      s.setMatrixAt(i, tmp.matrix);
    });
    s.instanceMatrix.needsUpdate = true;
    const d = dotRef.current!;
    dots.forEach(([x, z], i) => {
      tmp.position.set(x, 0.085, z);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(1, 1, 1);
      tmp.updateMatrix();
      d.setMatrixAt(i, tmp.matrix);
      d.setColorAt(i, col.setRGB(0.9 * (0.6 + 0.4 * rand(i + 77)), 0.75, 0.55));
    });
    d.instanceMatrix.needsUpdate = true;
    if (d.instanceColor) d.instanceColor.needsUpdate = true;
  }, [dashes, dots]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[EXT * 2.6, EXT * 2.6]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.55} metalness={0.2} />
      </mesh>
      <instancedMesh ref={slabRef} args={[undefined, undefined, BLOCKS.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#151515" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={dashRef} args={[undefined, undefined, dashes.length]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#2e2e2e" />
      </instancedMesh>
      <instancedMesh ref={dotRef} args={[undefined, undefined, dots.length]}>
        <sphereGeometry args={[0.035, 6, 4]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
};

/** Street lamp: pole, arm, bulb with a white halo, light pool on the ground. */
export const Lamp: React.FC<{ x: number; z: number; dir: [number, number]; on?: number }> = ({ x, z, dir, on = 1 }) => {
  const tex = radialTex();
  const hx = x + dir[0] * 0.45, hz = z + dir[1] * 0.45;
  return (
    <group>
      <mesh position={[x, 1.1, z]}>
        <cylinderGeometry args={[0.035, 0.05, 2.2, 6]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[(x + hx) / 2, 2.2, (z + hz) / 2]} rotation={[0, Math.atan2(dir[0], dir[1]), 0]}>
        <boxGeometry args={[0.04, 0.04, 0.48]} />
        <meshStandardMaterial color="#1c1c1c" />
      </mesh>
      <mesh position={[hx, 2.15, hz]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshBasicMaterial color={[3 * on, 3 * on, 2.9 * on]} toneMapped={false} />
      </mesh>
      <sprite position={[hx, 2.12, hz]} scale={[1.3, 1.3, 1]}>
        <spriteMaterial map={tex} color="#ffffff" opacity={0.42 * on} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh position={[hx, 0.075, hz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 2.6]} />
        <meshBasicMaterial map={tex} color="#e8ecff" opacity={0.22 * on} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

const LAMPS: { x: number; z: number; dir: [number, number] }[] = (() => {
  const out: { x: number; z: number; dir: [number, number] }[] = [];
  for (const [a, b] of EW) {
    for (let x = -EXT + 3; x < EXT; x += 6.5) {
      if (NS.some(([c, d]) => x > c - 0.6 && x < d + 0.6)) continue;
      out.push({ x, z: a - 0.35, dir: [0, 1] });
      out.push({ x: x + 3.25, z: b + 0.35, dir: [0, -1] });
    }
  }
  // hero street: lamps between and beside the shops instead of the generic ones
  return out.filter((l) => !(Math.abs(l.z - 0.65) < 0.01 && l.x > -9 && l.x < 9)).concat([
    { x: -7.2, z: 0.65, dir: [0, 1] }, { x: 7.2, z: 0.65, dir: [0, 1] },
  ]);
})();

/** Cars: tiny dark boxes with head and tail lights, driving the streets in loops. */
const Car: React.FC<{ t: number; lane: number; axis: "x" | "z"; dir: 1 | -1; speed: number; phase: number; tint: number }> = ({ t, lane, axis, dir, speed, phase, tint }) => {
  const span = EXT * 2;
  const s = ((((t * speed + phase) % span) + span) % span) - EXT;
  const pos = dir * s;
  const p: [number, number, number] = axis === "x" ? [pos, 0.2, lane] : [lane, 0.2, pos];
  const ry = axis === "x" ? (dir > 0 ? 0 : Math.PI) : dir > 0 ? -Math.PI / 2 : Math.PI / 2;
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <mesh>
        <boxGeometry args={[0.95, 0.26, 0.46]} />
        <meshStandardMaterial color={tint > 0.5 ? "#1a1a1d" : "#121212"} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[-0.05, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.18, 0.42]} />
        <meshStandardMaterial color="#0d0d10" roughness={0.2} metalness={0.7} />
      </mesh>
      {[-0.14, 0.14].map((zz) => (
        <React.Fragment key={zz}>
          <mesh position={[0.48, 0, zz]}><boxGeometry args={[0.02, 0.06, 0.08]} /><meshBasicMaterial color={[3, 3, 2.8]} toneMapped={false} /></mesh>
          <mesh position={[-0.48, 0.02, zz]}><boxGeometry args={[0.02, 0.05, 0.09]} /><meshBasicMaterial color={[2.4, 0.15, 0.1]} toneMapped={false} /></mesh>
        </React.Fragment>
      ))}
    </group>
  );
};

const CARS = [
  { lane: 2.0, axis: "x" as const, dir: 1 as const, speed: 3.2, phase: 10, tint: 0.2 },
  { lane: 3.0, axis: "x" as const, dir: -1 as const, speed: 2.8, phase: 60, tint: 0.7 },
  { lane: 3.0, axis: "x" as const, dir: -1 as const, speed: 2.8, phase: 15, tint: 0.4 },
  { lane: 7.75, axis: "z" as const, dir: 1 as const, speed: 3.0, phase: 30, tint: 0.6 },
  { lane: -6.75, axis: "z" as const, dir: -1 as const, speed: 2.6, phase: 75, tint: 0.3 },
  { lane: -13.0, axis: "x" as const, dir: 1 as const, speed: 3.4, phase: 40, tint: 0.8 },
  { lane: 18.75, axis: "x" as const, dir: -1 as const, speed: 3.0, phase: 5, tint: 0.5 },
  { lane: 21.25, axis: "z" as const, dir: 1 as const, speed: 3.3, phase: 50, tint: 0.1 },
  { lane: -21.75, axis: "z" as const, dir: 1 as const, speed: 2.9, phase: 20, tint: 0.9 },
];

/** Red aviation lights on the tallest roofs, blinking. */
const Beacons: React.FC<{ list: Bld[]; t: number }> = ({ list, t }) => {
  const tall = useMemo(() => [...list].sort((a, b) => b.h - a.h).slice(0, 7), [list]);
  return (
    <>
      {tall.map((b, i) => {
        const on = Math.sin(t * 3 + i * 1.9) > 0.55 ? 1 : 0.08;
        return (
          <mesh key={i} position={[b.x, b.h + 0.12, b.z]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshBasicMaterial color={[3 * on, 0.15 * on, 0.1 * on]} toneMapped={false} />
          </mesh>
        );
      })}
    </>
  );
};

export const City: React.FC<{ t: number; zoom: number }> = ({ t, zoom }) => {
  const lampK = Math.min(1, Math.max(0.22, (zoom - 22) / 45));
  const list = useMemo(buildings, []);
  const win = useMemo(() => windows(list), [list]);
  return (
    <group>
      <Ground />
      <Buildings list={list} />
      <Windows list={win.lit} />
      <Windows list={win.dark} />
      <Beacons list={list} t={t} />
      {LAMPS.map((l, i) => <Lamp key={i} {...l} on={Math.hypot(l.x, l.z + 2) < 12 ? Math.max(lampK, 0.6) : lampK} />)}
      {CARS.map((c, i) => <Car key={i} t={t} {...c} />)}
    </group>
  );
};
