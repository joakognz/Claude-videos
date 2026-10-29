import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EASE, EASE_IN, EASE_OUT, EV, clamp01, lerp, rand, springAt } from "../theme";
import { Block, useGlowMat } from "./prims";
import { COUNTER, CUBE, FLYERS, LEVELS, PRODUCTS, REGISTER, SHOP_H, SHOP_HALF, TAGS, flyLand } from "./layout";

const H = SHOP_HALF;

/** Ghost copies just behind a fast object: a cheap, deterministic motion blur. */
export const ghosts = (t: number, n = 5, dt = 0.014) => Array.from({ length: n }, (_, k) => ({ t: t - (k + 1) * dt, o: 0.42 * (1 - k / n) }));

const arc = (a: V3, b: V3, h: number, p: number): V3 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p) + 4 * h * p * (1 - p), lerp(a[2], b[2], p)];

// E1: one snack is sold (slides from the shelf onto the counter)
export const SALE_ID = 1;
const SALE_TO: V3 = [0.62, 0.9 + CUBE / 2, 0.55];

/** Product position/state at time t. */
const productAt = (i: number, t: number): { p: V3; spin: number; glow: number; scale: number; moving: boolean } => {
  const pr = PRODUCTS[i];
  // after the time skip, everything is restocked (pops back on the shelf)
  const restock = t > EV.skip + 0.25 ? springAt(t, EV.skip + 0.25 + (i % 7) * 0.04, 12, 220) : 0;
  const k = FLYERS.indexOf(i);
  if (restock > 0) return { p: pr.p, spin: 0, glow: 0.3 * (1 - clamp01((t - EV.skip - 0.6) / 0.6)), scale: Math.max(0.01, restock), moving: false };
  if (i === SALE_ID && t > EV.sale) {
    const p = clamp01((t - EV.sale) / 0.5);
    const from = pr.p;
    if (t < EV.fly0 + 0.1) return { p: arc(from, SALE_TO, 0.35, EASE(p)), spin: 0, glow: p < 1 ? 0.5 : 0.15, scale: 1, moving: p > 0 && p < 1 };
    // and then it goes too (free)
    const q = clamp01((t - EV.fly0 - 0.1) / 0.6);
    const to = flyLand(8);
    return { p: arc(SALE_TO, to, 0.7, EASE_OUT(q)), spin: q * 8, glow: q < 1 ? 0.6 : 0.2, scale: q >= 1 ? 1 - 0.6 * clamp01((t - EV.fly0 - 1.2) / 0.5) : 1, moving: q > 0 && q < 1 };
  }
  if (k >= 0) {
    const a = EV.fly0 + k * EV.flyStep;
    const q = clamp01((t - a) / 0.62);
    if (q <= 0) return { p: pr.p, spin: 0, glow: 0, scale: 1, moving: false };
    const to = flyLand(k);
    const p = arc(pr.p, to, 1.0, EASE_OUT(q));
    return { p, spin: q * (6 + k), glow: q < 1 ? 0.7 : 0.25 * (1 - clamp01((t - a - 0.8) / 0.8)), scale: q >= 1 ? 1 - 0.6 * clamp01((t - a - 1.2) / 0.5) : 1, moving: q < 1 };
  }
  return { p: pr.p, spin: 0, glow: 0, scale: 1, moving: false };
};

const Products: React.FC<{ t: number; boost: number }> = ({ t, boost }) => (
  <>
    {PRODUCTS.map((pr, i) => {
      const st = productAt(i, t);
      const flying = FLYERS.includes(i) || i === SALE_ID;
      // flown products vanish once the plaza is reset by the skip (they are restocked inside)
      if (flying && t > EV.skip && t < EV.skip + 0.25) return null;
      const s = pr.s * st.scale;
      return (
        <React.Fragment key={i}>
          <Block p={st.p} size={s} glow={Math.max(st.glow, boost * (0.25 + 0.2 * Math.sin(t * 4 + i)))} rot={[st.spin * 0.7, st.spin, 0]} />
          {st.moving && ghosts(t).map((g, k) => {
            const gs = productAt(i, g.t);
            return <Block key={k} p={gs.p} size={s} glow={0.6} opacity={g.o} rot={[gs.spin * 0.7, gs.spin, 0]} />;
          })}
        </React.Fragment>
      );
    })}
  </>
);

/** Price tags on the boards' front edges; in E3 they drop to the floor, after the skip they are back. */
const Tags: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.35, roughness: 0.6, transparent: true }), []);
  const back = t > EV.skip + 0.3 ? springAt(t, EV.skip + 0.3, 12, 200) : 0;
  return (
    <>
      {TAGS.map((tg, i) => {
        const a = EV.tags + (i % 9) * 0.035 + Math.floor(i / 9) * 0.02;
        const dt = t - a;
        let p: V3 = tg.p;
        let rot: V3 = [0, tg.onBack ? 0 : Math.PI / 2, 0];
        let sc = 1;
        if (back > 0) {
          sc = Math.max(0.01, back);
        } else if (dt > 0) {
          const fall = Math.min(1, dt / 0.42);
          const y = lerp(tg.p[1], 0.1, EASE_IN(fall));
          const out = 0.3 + rand(i + 9) * 0.5;
          p = tg.onBack ? [tg.p[0] + (rand(i) - 0.5) * 0.4, y, tg.p[2] + out * fall] : [tg.p[0] + out * fall, y, tg.p[2] + (rand(i) - 0.5) * 0.4];
          rot = [fall * (Math.PI / 2) * (fall >= 1 ? 1 : 0.8 + 0.4 * Math.sin(dt * 20)), rot[1] + fall * (rand(i + 4) - 0.5) * 3, fall * 0.8];
          if (t > EV.skip - 0.1) sc = 1 - clamp01((t - EV.skip + 0.1) / 0.3);
        }
        if (sc <= 0.01) return null;
        return (
          <mesh key={i} position={p} rotation={rot} scale={sc} material={mat}>
            <boxGeometry args={[0.11, 0.065, 0.012]} />
          </mesh>
        );
      })}
    </>
  );
};

/** The glass shop: floor, back walls with shelves, glass front faces, frame, counter and register. */
export const Shop: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: "#241d18", roughness: 0.9, flatShading: true }), []);
  const floor = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2e25", roughness: 0.85 }), []);
  const board = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6b584a", roughness: 0.8, flatShading: true }), []);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.cream, transparent: true, opacity: 0.07, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide,
  }), []);
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.35, roughness: 0.5 }), []);
  const counter = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d8c8b9", roughness: 0.7, flatShading: true }), []);
  const display = useGlowMat(C.orange, 1.6);
  const awning = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.18, roughness: 0.7, side: THREE.DoubleSide }), []);
  // register display blinks on each sale
  const ring = Math.max(0, 1 - Math.abs(t - EV.sale - 0.6) / 0.4) + Math.max(0, 1 - Math.abs(t - EV.up1) / 0.4);
  display.opacity = 0.75 + 0.25 * ring;
  frame.emissiveIntensity = 0.35 * (1 - dim * 0.6);
  // frame edges (12 box edges of the glass volume)
  const E: [V3, V3][] = [];
  const xs = [-H, H];
  for (const x of xs) for (const z of xs) E.push([[x, SHOP_H / 2, z], [0.05, SHOP_H, 0.05]]);
  for (const y of [0.04, SHOP_H]) {
    for (const z of xs) E.push([[0, y, z], [2 * H + 0.05, 0.05, 0.05]]);
    for (const x of xs) E.push([[x, y, 0], [0.05, 0.05, 2 * H + 0.05]]);
  }
  return (
    <group>
      {/* floor platform */}
      <mesh material={floor} position={[0, 0.02, 0]}>
        <boxGeometry args={[2 * H + 0.2, 0.08, 2 * H + 0.2]} />
      </mesh>
      {/* back walls */}
      <mesh material={wall} position={[0, SHOP_H / 2, -H]}>
        <boxGeometry args={[2 * H, SHOP_H, 0.06]} />
      </mesh>
      <mesh material={wall} position={[-H, SHOP_H / 2, 0]}>
        <boxGeometry args={[0.06, SHOP_H, 2 * H]} />
      </mesh>
      {/* shelves */}
      {LEVELS.map((y) => (
        <React.Fragment key={y}>
          <mesh material={board} position={[0.05, y - 0.02, -1.36]}>
            <boxGeometry args={[2.95, 0.04, 0.42]} />
          </mesh>
          <mesh material={board} position={[-1.36, y - 0.02, 0]}>
            <boxGeometry args={[0.42, 0.04, 2.6]} />
          </mesh>
        </React.Fragment>
      ))}
      {/* glass front faces + roof */}
      <mesh material={glass} position={[0, SHOP_H / 2, H]}>
        <planeGeometry args={[2 * H, SHOP_H]} />
      </mesh>
      <mesh material={glass} position={[H, SHOP_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2 * H, SHOP_H]} />
      </mesh>
      <mesh material={glass} position={[0, SHOP_H, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2 * H, 2 * H]} />
      </mesh>
      {E.map(([p, s], i) => (
        <mesh key={i} material={frame} position={p} scale={s}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
      {/* striped fascia along the top of the two shop fronts */}
      {Array.from({ length: 10 }, (_, k) => k % 2 === 0 && (
        <React.Fragment key={k}>
          <mesh material={awning} position={[-H + (k + 0.5) * (H / 5), SHOP_H - 0.13, H + 0.03]}>
            <boxGeometry args={[H / 5, 0.2, 0.02]} />
          </mesh>
          <mesh material={awning} position={[H + 0.03, SHOP_H - 0.13, -H + (k + 0.5) * (H / 5)]}>
            <boxGeometry args={[0.02, 0.2, H / 5]} />
          </mesh>
        </React.Fragment>
      ))}
      {/* counter + register */}
      <mesh material={counter} position={COUNTER.c} scale={COUNTER.s}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh material={counter} position={[REGISTER[0], REGISTER[1] + 0.09, REGISTER[2] - 0.02]}>
        <boxGeometry args={[0.36, 0.18, 0.3]} />
      </mesh>
      <mesh material={counter} position={[REGISTER[0], REGISTER[1] + 0.25, REGISTER[2] - 0.08]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.3, 0.14, 0.04]} />
      </mesh>
      <mesh material={display} position={[REGISTER[0] + 0.0, REGISTER[1] + 0.255, REGISTER[2] - 0.055]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[0.24, 0.09]} />
      </mesh>
      <Products t={t} boost={0} />
      <Tags t={t} />
      {/* warm ceiling light */}
      <pointLight position={[0.3, SHOP_H - 0.3, 0.3]} color="#ffd9b8" intensity={3.2 * (1 - dim * 0.7)} distance={6} decay={1.4} />
    </group>
  );
};

