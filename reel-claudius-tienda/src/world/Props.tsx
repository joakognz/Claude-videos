import React, { useMemo } from "react";
import * as THREE from "three";
import { Cam, V3 } from "../camera";
import { C, EASE, EASE_IN, EASE_OUT, EV, MONO, S, TITLE, clamp01, lerp, springAt, windowed } from "../theme";
import { Lantern, jitter } from "./Claudius";
import { BALCONY, BOSS, CLAUDIUS, DEAL, LENS, RAIL_R, SHOULDER, TOWER, TOWER_H, scr } from "./layout";
import { GroundRing, useGlowMat } from "./prims";
import { contractTex, fadeTex, radialTex } from "./textures";

/** Rotation that turns a plane (normal +z) to face the camera. */
export const billboard = (cam: Cam) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...cam.right), new THREE.Vector3(...cam.up), new THREE.Vector3(...cam.d)));

// ── E5: a faceless human pictogram trembling over Claudius ─────────────────
export const HumanPictogram: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.cream, emissive: C.cream, emissiveIntensity: 0.7, roughness: 0.6, flatShading: true, transparent: true, depthWrite: false,
  }), []);
  const o = windowed(t, EV.human, S.E6 + 0.35, 0.35, 0.4);
  if (o <= 0) return null;
  const full = EASE_OUT(clamp01((t - EV.humanFull) / 0.3));
  const s = springAt(t, EV.human, 11, 160);
  const body = (key: string, off: V3, alpha: number) => {
    return (
      <group key={key} position={[CLAUDIUS[0] + off[0], CLAUDIUS[1] - 0.6 + off[1], CLAUDIUS[2] + off[2]]} scale={Math.max(0.01, s) * 1.25} rotation={[0, Math.PI / 4, 0]}>
        <mesh material={alpha < 1 ? undefined : mat} position={[0, 1.62, 0]}>
          <icosahedronGeometry args={[0.2, 0]} />
          {alpha < 1 && <meshBasicMaterial color={C.cream} transparent opacity={alpha * o} depthWrite={false} />}
        </mesh>
        <mesh material={alpha < 1 ? undefined : mat} position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.24, 0.17, 0.75, 6]} />
          {alpha < 1 && <meshBasicMaterial color={C.cream} transparent opacity={alpha * o} depthWrite={false} />}
        </mesh>
        {[-1, 1].map((k) => (
          <mesh key={k} material={alpha < 1 ? undefined : mat} position={[0.33 * k, 1.05, 0]} rotation={[0, 0, 0.18 * k]}>
            <cylinderGeometry args={[0.06, 0.05, 0.62, 5]} />
            {alpha < 1 && <meshBasicMaterial color={C.cream} transparent opacity={alpha * o} depthWrite={false} />}
          </mesh>
        ))}
        {[-1, 1].map((k) => (
          <mesh key={`l${k}`} material={alpha < 1 ? undefined : mat} position={[0.11 * k, 0.38, 0]}>
            <cylinderGeometry args={[0.075, 0.06, 0.6, 5]} />
            {alpha < 1 && <meshBasicMaterial color={C.cream} transparent opacity={alpha * o} depthWrite={false} />}
          </mesh>
        ))}
      </group>
    );
  };
  // tremble harder once the voice says "persona"; translucent so Claudius' light shows through
  const amp = 0.04 + 0.1 * full;
  mat.opacity = (0.5 + 0.25 * full) * o * (0.85 + 0.15 * Math.sin(t * 31));
  const j = jitter(t, 1, amp);
  const g1 = jitter(t, 7, amp * 3.5);
  const g2 = jitter(t, 13, amp * 3.5);
  return (
    <>
      {body("main", j, 1)}
      {full > 0 && Math.floor(t * 12) % 3 !== 0 && body("g1", [g1[0] + 0.12, g1[1], g1[2] - 0.12], 0.14 * full)}
      {full > 0 && Math.floor(t * 9) % 2 === 0 && body("g2", [g2[0] - 0.12, g2[1], g2[2] + 0.12], 0.1 * full)}
    </>
  );
};

// ── E6 / E8: contract sheets ──────────────────────────────────────────────
const Sheet: React.FC<{ p: V3; q: THREE.Quaternion; tex: THREE.Texture; opacity: number; scale?: number; tilt?: number }> = ({ p, q, tex, opacity, scale = 1, tilt = 0 }) => (
  <group position={p} quaternion={q}>
    <mesh rotation={[0, 0, tilt]} scale={scale}>
      <planeGeometry args={[0.66, 0.88]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

export const Contract: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const tex = useMemo(() => contractTex(false, TITLE, MONO), []);
  const appear = springAt(t, EV.doc, 12, 170);
  if (t < EV.doc || t > S.E7 + 0.3) return null;
  const q = billboard(cam);
  // drifts up and away to the left, turning translucent ("no lo contrataría")
  const away = EASE_IN(clamp01((t - EV.docAway) / 1.9));
  const base: V3 = [CLAUDIUS[0] + 0.95, CLAUDIUS[1] + 1.2, CLAUDIUS[2] + 0.35];
  const at = (u: number): V3 => [base[0] - 1.2 * u, base[1] + 1.4 * u + 0.04 * Math.sin(t * 2), base[2] - 2.0 * u];
  const op = clamp01(appear * 1.4) * (1 - 0.88 * EASE(away)) * (t > S.E7 ? 1 - clamp01((t - S.E7) / 0.3) : 1);
  return (
    <>
      <Sheet p={at(away)} q={q} tex={tex} opacity={op} scale={Math.max(0.01, appear) * 1.55 * (1 - 0.25 * away)} tilt={0.06 * Math.sin(t * 1.7) + away * 0.5} />
      {away > 0.02 && away < 0.98 && [1, 2, 3].map((k) => (
        <Sheet key={k} p={at(Math.max(0, away - k * 0.035))} q={q} tex={tex} opacity={op * 0.22 * (1 - k / 4)} scale={1.55 * (1 - 0.25 * away)} tilt={away * 0.5} />
      ))}
    </>
  );
};

// the pen lands on the sheet's signature line (lower left of the sheet)
export const HAND_TARGET: V3 = scr(DEAL, -0.36, -0.52, 0.05);
const REACH_MAX = 0.8;
const BAR_AT: V3 = scr([0, 1, 2].map((i) => SHOULDER[i] + (HAND_TARGET[i] - SHOULDER[i]) * 0.86) as V3, 0, 0, 0.4);

/** How far the hand of light gets: it creeps towards the pen line, the barrier cuts it off, it recoils. */
export const handReach = (t: number) => {
  const go = EASE(clamp01((t - EV.reach) / (EV.barrier + 0.2 - EV.reach))) * REACH_MAX;
  const back = t > EV.barrier + 0.2 ? EASE_OUT(clamp01((t - EV.barrier - 0.2) / 0.35)) * 0.3 : 0;
  const o = 1 - clamp01((t - S.E9 - 0.2) / 0.4);
  return { p: Math.max(0, go - back), o };
};

/** E8: the fixed-price onion deal and the barrier of light that drops across the hand's path. */
export const Deal: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const tex = useMemo(() => contractTex(true, TITLE, MONO), []);
  const bar = useGlowMat(C.orange, 2.4);
  const o = windowed(t, EV.deal, S.E9 + 0.5, 0.3, 0.5);
  if (o <= 0) return null;
  const q = billboard(cam);
  const s = springAt(t, EV.deal, 12, 170);
  const drop = EASE_IN(clamp01((t - EV.barrier) / 0.18));
  const hit = t - EV.barrier - 0.18;
  const settle = hit > 0 ? Math.exp(-hit * 7) * Math.sin(hit * 40) * 0.05 : 0;
  const shake = hit > 0 ? Math.exp(-hit * 9) * 0.04 * Math.sin(hit * 60) : 0;
  bar.opacity = o;
  const barY = (u: number) => lerp(2.6, 0, u) + settle;
  return (
    <>
      <Sheet p={scr(DEAL, shake, 0.03 * Math.sin(t * 2.2))} q={q} tex={tex} opacity={o} scale={Math.max(0.01, s) * 1.55} tilt={-0.05} />
      {t > EV.barrier - 0.02 && (
        <>
          <group position={scr(BAR_AT, 0, barY(drop))} quaternion={q}>
            <mesh material={bar}>
              <boxGeometry args={[0.12, 1.3, 0.12]} />
            </mesh>
          </group>
          {drop < 1 && [1, 2, 3].map((k) => (
            <group key={k} position={scr(BAR_AT, 0, barY(drop) + 0.22 * k)} quaternion={q}>
              <mesh>
                <boxGeometry args={[0.12, 1.3, 0.12]} />
                <meshBasicMaterial color={C.orange} transparent opacity={0.3 * (1 - k / 4) * o} depthWrite={false} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </>
      )}
    </>
  );
};

// ── E7: phase 2 modules ───────────────────────────────────────────────────
export const Modules: React.FC<{ t: number; tools: number }> = ({ t, tools }) => {
  const slab = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.1, roughness: 0.7, flatShading: true }), []);
  const led = useGlowMat(C.orange, 2.2);
  const deck = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2e25", roughness: 0.85, flatShading: true }), []);
  const rail = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.3, roughness: 0.5 }), []);
  const tw = springAt(t, EV.tower, 13, 170);
  const bc = springAt(t, EV.boss, 13, 170);
  if (tw <= 0.001 && bc <= 0.001) return null;
  // "herramientas" in E9 make the tower pulse
  led.opacity = 0.8 + 0.2 * Math.sin(t * 6) + 0.4 * tools;
  const floors = 6;
  const fh = TOWER_H / floors;
  const b = BALCONY;
  const bw = b.x1 - b.x0;
  const bd = b.z1 - b.z0;
  return (
    <>
      {/* register tower: a stack of cream slabs with orange data lines (CRM, stock with costs, payment links) */}
      {tw > 0.001 && (
        <group position={TOWER}>
          {Array.from({ length: floors }, (_, k) => {
            const s = springAt(t, EV.tower + k * 0.06, 12, 200);
            if (s <= 0.001) return null;
            return (
              <group key={k} position={[0, (k + 0.5) * fh * Math.min(1, s), 0]} scale={[1, Math.max(0.01, s), 1]}>
                <mesh material={slab}>
                  <boxGeometry args={[0.8, fh * 0.82, 0.8]} />
                </mesh>
                <mesh material={led} position={[0, 0, 0.405]}>
                  <planeGeometry args={[0.6 * (0.5 + 0.5 * ((k * 37) % 10) / 10), 0.045]} />
                </mesh>
                <mesh material={led} position={[0.405, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <planeGeometry args={[0.6 * (0.4 + 0.6 * ((k * 53) % 10) / 10), 0.045]} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}
      {/* balcony on the roof, with the "boss" agent */}
      {bc > 0.001 && (
        <group position={[(b.x0 + b.x1) / 2, b.y, (b.z0 + b.z1) / 2]} scale={[1, Math.max(0.01, Math.min(1.05, bc)), 1]}>
          <mesh material={deck} position={[0, 0.06, 0]}>
            <boxGeometry args={[bw, 0.12, bd]} />
          </mesh>
          {[[0, bd / 2], [bw / 2, 0]].map(([x, z], k) => (
            <mesh key={k} material={rail} position={[x, 0.4, z]}>
              <boxGeometry args={k === 0 ? [bw, 0.04, 0.04] : [0.04, 0.04, bd]} />
            </mesh>
          ))}
          {Array.from({ length: 5 }, (_, k) => (
            <React.Fragment key={k}>
              <mesh material={rail} position={[-bw / 2 + (k + 0.5) * (bw / 5), 0.25, bd / 2]}>
                <boxGeometry args={[0.03, 0.3, 0.03]} />
              </mesh>
              <mesh material={rail} position={[bw / 2, 0.25, -bd / 2 + (k + 0.5) * (bd / 5)]}>
                <boxGeometry args={[0.03, 0.3, 0.03]} />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      )}
      {bc > 0.3 && (
        <group position={[BOSS[0], BOSS[1] - 0.5 + 0.04 * Math.sin(t * 2.1), BOSS[2]]}>
          <Lantern t={t} scale={1.45 * Math.min(1, springAt(t, EV.boss + 0.2, 11, 170))} glow={1.15} apron={false} seed={4} />
        </group>
      )}
    </>
  );
};

/** E7: a ring of light sweeps the plaza (six months pass). */
export const SkipRing: React.FC<{ t: number }> = ({ t }) => {
  const mat = useGlowMat(C.orangeSoft, 2);
  const p = clamp01((t - EV.skip) / 0.9);
  if (p <= 0 || p >= 1) return null;
  mat.opacity = (1 - p) * 0.9;
  return <GroundRing c={[0, 0.03, 0]} r={0.6 + p * 6} w={0.12} mat={mat} />;
};

// ── E9: rails of light (limits) and the supervision lens ─────────────────
export const Rails: React.FC<{ t: number }> = ({ t }) => {
  const mat = useGlowMat(C.orange, 2.0);
  const o = 1 - clamp01((t - EV.dark) / 0.6) * 0.5;
  if (t < EV.rails) return null;
  mat.opacity = o;
  const R = RAIL_R;
  const sides: [V3, V3][] = [[[-R, 0, R], [R, 0, R]], [[R, 0, R], [R, 0, -R]], [[R, 0, -R], [-R, 0, -R]], [[-R, 0, -R], [-R, 0, R]]];
  const out: React.ReactNode[] = [];
  sides.forEach(([a, b], si) => {
    const n = 7;
    for (let k = 0; k <= n; k++) {
      if (k === n && si < 3) continue;
      const u = k / n;
      const x = lerp(a[0], b[0], u);
      const z = lerp(a[2], b[2], u);
      // posts rise in a wave from the front corner
      const s = springAt(t, EV.rails + (si * n + k) * 0.012, 12, 220);
      if (s <= 0.001) continue;
      out.push(
        <mesh key={`p${si}${k}`} material={mat} position={[x, 0.3 * Math.min(1, s), z]} scale={[1, Math.max(0.01, s), 1]}>
          <boxGeometry args={[0.05, 0.6, 0.05]} />
        </mesh>,
      );
    }
    const s = EASE_OUT(clamp01((t - EV.rails - 0.15 - si * 0.08) / 0.35));
    if (s > 0) {
      const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
      const ang = Math.atan2(-(b[2] - a[2]), b[0] - a[0]);
      for (const y of [0.3, 0.58]) {
        out.push(
          <mesh key={`r${si}${y}`} material={mat} position={[lerp(a[0], b[0], s / 2), y, lerp(a[2], b[2], s / 2)]} rotation={[0, ang, 0]}>
            <boxGeometry args={[len * s, 0.035, 0.035]} />
          </mesh>,
        );
      }
    }
  });
  return <>{out}</>;
};

export const Lens: React.FC<{ t: number }> = ({ t }) => {
  const ring = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.6, roughness: 0.4, flatShading: true, transparent: true }), []);
  const glass = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.cream).multiplyScalar(1.1), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }), []);
  const beam = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color("#ffe6cf").multiplyScalar(0.9), map: fadeTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
  }), []);
  const pool = useMemo(() => new THREE.MeshBasicMaterial({ color: "#a88a70", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const a = springAt(t, EV.lens0, 12, 120);
  if (a <= 0.001) return null;
  const on = EASE_OUT(clamp01((t - EV.lens) / 0.5));
  const fade = 1 - clamp01((t - EV.dark) / 0.6) * 0.55;
  ring.opacity = clamp01(a * 1.3) * fade;
  ring.emissiveIntensity = 0.35 + 0.9 * on;
  glass.opacity = (0.06 + 0.22 * on) * fade;
  beam.opacity = 0.22 * on * fade * (0.92 + 0.08 * Math.sin(t * 3));
  pool.opacity = 0.7 * on * fade;
  const y = LENS[1] + 0.06 * Math.sin(t * 1.6);
  return (
    <>
      <group position={[LENS[0], y, LENS[2]]} scale={Math.max(0.01, a)}>
        <mesh material={ring} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.07, 6, 36]} />
        </mesh>
        <mesh material={glass} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.92, 36]} />
        </mesh>
        <mesh material={ring} position={[0.95 * Math.SQRT1_2, 0, 0.95 * Math.SQRT1_2]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.5]} />
        </mesh>
      </group>
      {on > 0 && (
        <>
          <mesh position={[0, (y - 0.05) / 2, 0]} material={beam}>
            <cylinderGeometry args={[0.9, 1.9, y - 0.05, 32, 1, true]} />
          </mesh>
          <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} material={pool}>
            <planeGeometry args={[6.5, 6.5]} />
          </mesh>
        </>
      )}
    </>
  );
};

