import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EASE, EASE_IN, EASE_OUT, EV, S, TITLE, clamp01, lerp, rand, springAt } from "../theme";
import { Cube } from "./Flow";
import { useGlowMat } from "./prims";
import { ORB4, ORB9, Swarm } from "./Swarm";
import { makeSheet, plateTex, radialTex } from "./textures";

// Everything here lives in the stage's front frame: +x to screen right, +z towards the camera, +y up.
// Each scene's prop rises out of the plaza floor (which hides what is below it) and sinks when it is done.

/** 0 → 1 rise (springy) from `a`, back to 0 after `b`. */
const rise = (t: number, a: number, b = 999) =>
  Math.max(0, Math.min(1.04, springAt(t, a, 13, 170))) * (1 - EASE(clamp01((t - b) / 0.5)));

/** Ghost copies just behind a fast object: a cheap, deterministic motion blur. */
const ghosts = (t: number, n = 4, dt = 0.016) => Array.from({ length: n }, (_, k) => ({ t: t - (k + 1) * dt, o: 0.4 * (1 - k / n) }));

const jit = (t: number, seed: number, amp: number): V3 => {
  const k = Math.floor(t * 24);
  return [(rand(k * 3 + seed) - 0.5) * amp, (rand(k * 5 + seed) - 0.5) * amp, 0];
};

// ── shared pieces ────────────────────────────────────────────────────────
// paper is drawn unlit; this keeps it under the bloom threshold
const SHEET_TINT = new THREE.Color(0.78, 0.78, 0.78);
const useCream = (emissive = 0.12, opacity = 1) =>
  useMemo(() => new THREE.MeshStandardMaterial({
    color: C.cream, emissive: C.cream, emissiveIntensity: emissive, roughness: 0.7, flatShading: true, transparent: opacity < 1, opacity,
  }), [emissive, opacity]);

/** The model: a low-poly crystal orb of orange light with a bright core. */
export const Orb: React.FC<{ t: number; r: number; glow?: number }> = ({ t, r, glow = 1 }) => {
  const shell = useMemo(() => new THREE.MeshStandardMaterial({
    color: C.orange, emissive: C.orange, roughness: 0.3, flatShading: true, transparent: true, depthWrite: false,
  }), []);
  const core = useGlowMat(C.orangeSoft, 3);
  const halo = useMemo(() => new THREE.MeshBasicMaterial({
    color: C.orange, map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  shell.opacity = 0.55;
  shell.emissiveIntensity = 0.8 * glow * (1 + 0.06 * Math.sin(t * 5));
  halo.opacity = 0.6 * glow;
  return (
    <group rotation={[0.3, t * 0.4, 0.1]}>
      <mesh material={shell}>
        <icosahedronGeometry args={[r, 1]} />
      </mesh>
      <mesh material={core} rotation={[t, t * 0.7, 0]}>
        <icosahedronGeometry args={[r * 0.35, 0]} />
      </mesh>
      <mesh material={halo} rotation={[-0.616, 0, 0]}>
        <planeGeometry args={[r * 4.5, r * 4.5]} />
      </mesh>
      <pointLight color={C.orange} intensity={3 * glow} distance={5} decay={1.5} />
    </group>
  );
};

/** Expanding glow ring on the floor where something rises. */
const FloorRing: React.FC<{ t: number; at: number; c: V3; r: number }> = ({ t, at, c, r }) => {
  const mat = useGlowMat(C.orangeSoft, 1.6);
  const p = clamp01((t - at) / 0.7);
  if (p <= 0 || p >= 1) return null;
  mat.opacity = (1 - p) * 0.7;
  return (
    <mesh position={[c[0], 0.02, c[2]]} rotation={[-Math.PI / 2, 0, 0]} material={mat}>
      <ringGeometry args={[r * (0.6 + 0.6 * p) - 0.04, r * (0.6 + 0.6 * p) + 0.04, 48]} />
    </mesh>
  );
};

// ── E4: the orb, the scroll and the LEAN arch with its check boxes ─────────
const ARCH_X = 1.15;
const BOXES = 8;
const boxPos = (i: number): V3 => [-0.3 + i * 0.36, 0.17, 1.15];

const ScrollRolls: React.FC<{ w: number; h: number; mat: THREE.Material }> = ({ w, h, mat }) => (
  <>
    {[h / 2, -h / 2].map((y) => (
      <mesh key={y} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} material={mat}>
        <cylinderGeometry args={[0.05, 0.05, w + 0.1, 8]} />
      </mesh>
    ))}
  </>
);

const LeanScene: React.FC<{ t: number }> = ({ t }) => {
  const cream = useCream(0.18);
  const tile = useCream(0.25);
  const check = useGlowMat(C.orange, 2.2);
  const plate = useMemo(() => plateTex("LEAN", TITLE, { size: 170 }), []);
  const sheet = useMemo(() => makeSheet("PRUEBA", "prose", TITLE), []);
  const out = S.E5 - 0.1;
  const rOrb = rise(t, EV.cubeOut + 0.25, out);
  const rArch = rise(t, EV.cubeOut + 0.45, out);
  if (rOrb <= 0.001 && rArch <= 0.001) return null;
  // scroll: leaves the orb ("encontró"), crosses the arch ("Astra … Lean") and turns orange as it is formalised
  const from: V3 = [ORB4[0] + 0.75, ORB4[1], ORB4[2] + 0.35];
  const mid: V3 = [ARCH_X, 1.05, 0];
  const end: V3 = [ARCH_X + 1.05, 1.15, 0.25];
  const scrollAt = (tt: number): V3 => {
    if (tt < EV.arch) return from;
    const p = EASE(clamp01((tt - EV.arch) / (EV.archEnd - EV.arch)));
    return p < 0.5 ? [lerp(from[0], mid[0], p * 2), lerp(from[1], mid[1], p * 2), lerp(from[2], mid[2], p * 2)] : [lerp(mid[0], end[0], p * 2 - 1), lerp(mid[1], end[1], p * 2 - 1), lerp(mid[2], end[2], p * 2 - 1)];
  };
  const sIn = springAt(t, EV.scroll, 12, 170);
  const lit = EASE(clamp01((t - (EV.arch + (EV.archEnd - EV.arch) * 0.5)) / 0.4));
  sheet.draw(0, lit, 1);
  const moving = t > EV.arch && t < EV.archEnd;
  const sp = scrollAt(t);
  const so = 1 - EASE(clamp01((t - out) / 0.4));
  return (
    <>
      <FloorRing t={t} at={EV.cubeOut + 0.25} c={[ORB4[0], 0, ORB4[2]]} r={0.9} />
      <FloorRing t={t} at={EV.cubeOut + 0.45} c={[ARCH_X, 0, 0]} r={1.1} />
      <group position={[ORB4[0], ORB4[1] - (1 - rOrb) * 2.4 + 0.06 * Math.sin(t * 2), ORB4[2]]}>
        <Orb t={t} r={0.62} />
      </group>
      {/* arch with the LEAN plate */}
      <group position={[ARCH_X, -(1 - rArch) * 2.6, 0]}>
        {[-0.72, 0.72].map((x) => (
          <mesh key={x} material={cream} position={[x, 1.0, 0]}>
            <boxGeometry args={[0.2, 2.0, 0.3]} />
          </mesh>
        ))}
        <mesh material={cream} position={[0, 2.1, 0]}>
          <boxGeometry args={[1.84, 0.3, 0.34]} />
        </mesh>
        <mesh position={[0, 2.1, 0.175]}>
          <planeGeometry args={[1.6, 0.4]} />
          <meshBasicMaterial map={plate} toneMapped={false} />
        </mesh>
      </group>
      {/* check boxes: tick one by one ("comprueba cada paso") */}
      {Array.from({ length: BOXES }, (_, i) => {
        const p = boxPos(i);
        const ti = EV.ticks + i * EV.tickStep;
        const on = EASE_OUT(clamp01((t - ti) / 0.12));
        const pop = t > ti ? 1 + 0.25 * Math.sin(Math.PI * clamp01((t - ti) / 0.2)) : 1;
        return (
          <group key={i} position={[p[0], p[1] - (1 - rArch) * 0.6, p[2]]} scale={pop}>
            <mesh material={tile}>
              <boxGeometry args={[0.26, 0.26, 0.05]} />
            </mesh>
            {on > 0 && (
              <group position={[0, 0, 0.03]} scale={on}>
                <mesh material={check} position={[-0.045, -0.02, 0]} rotation={[0, 0, 0.8]}>
                  <boxGeometry args={[0.035, 0.11, 0.01]} />
                </mesh>
                <mesh material={check} position={[0.035, 0.02, 0]} rotation={[0, 0, -0.6]}>
                  <boxGeometry args={[0.035, 0.2, 0.01]} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
      {t > EV.scroll && so > 0 && (
        <>
          <group position={sp} scale={Math.max(0.01, sIn) * 0.95}>
            <mesh>
              <planeGeometry args={[0.72, 0.98]} />
              <meshBasicMaterial map={sheet.tex} color={SHEET_TINT} toneMapped={false} transparent opacity={so} side={THREE.DoubleSide} />
            </mesh>
            <ScrollRolls w={0.72} h={0.98} mat={cream} />
          </group>
          {moving && ghosts(t, 4, 0.03).map((g, k) => (
            <mesh key={k} position={scrollAt(g.t)} scale={0.95}>
              <planeGeometry args={[0.72, 0.98]} />
              <meshBasicMaterial color={C.cream} transparent opacity={g.o * 0.6} depthWrite={false} />
            </mesh>
          ))}
        </>
      )}
    </>
  );
};

// ── E5: the vault and the slow pendulum ─────────────────────────────────
const VaultScene: React.FC<{ t: number }> = ({ t }) => {
  const body = useCream(0.1);
  const door = useCream(0.2);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2e25", roughness: 0.8, flatShading: true }), []);
  const r = rise(t, EV.vault, S.E6 - 0.1);
  const rp = rise(t, EV.vault + 0.2, S.E6 - 0.1);
  if (r <= 0.001) return null;
  const amp = 0.42 * EASE(clamp01((t - EV.swing) / 0.8));
  const theta = (tt: number) => amp * Math.sin((2 * Math.PI * (tt - EV.swing)) / 2.5);
  const PIV: V3 = [0, 2.75, 0.95];
  const L = 1.95;
  const bob = (tt: number): V3 => [PIV[0] + Math.sin(theta(tt)) * L, PIV[1] - Math.cos(theta(tt)) * L, PIV[2]];
  return (
    <>
      <FloorRing t={t} at={EV.vault} c={[0, 0, -0.5]} r={1.4} />
      <group position={[0, -(1 - r) * 2.6, -0.55]}>
        <mesh material={body} position={[0, 1.05, 0]}>
          <boxGeometry args={[2.3, 2.1, 1.3]} />
        </mesh>
        {/* round door, bolts and wheel */}
        <mesh material={door} position={[0, 1.05, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.12, 24]} />
        </mesh>
        {Array.from({ length: 10 }, (_, k) => {
          const a = (k / 10) * Math.PI * 2;
          return (
            <mesh key={k} material={dark} position={[Math.cos(a) * 0.6, 1.05 + Math.sin(a) * 0.6, 0.77]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.04, 8]} />
            </mesh>
          );
        })}
        <group position={[0, 1.05, 0.82]} rotation={[0, 0, 0.15 * Math.sin(t * 0.6)]}>
          {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a) => (
            <mesh key={a} material={dark} rotation={[0, 0, a]}>
              <boxGeometry args={[0.7, 0.06, 0.06]} />
            </mesh>
          ))}
          <mesh material={dark} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.1, 12]} />
          </mesh>
        </group>
      </group>
      {/* pendulum frame in front of the vault */}
      <group position={[0, -(1 - rp) * 3.2, 0]}>
        {[-1.35, 1.35].map((x) => (
          <mesh key={x} material={dark} position={[x, PIV[1] / 2, PIV[2]]}>
            <boxGeometry args={[0.08, PIV[1], 0.08]} />
          </mesh>
        ))}
        <mesh material={dark} position={[0, PIV[1], PIV[2]]}>
          <boxGeometry args={[2.78, 0.08, 0.08]} />
        </mesh>
        {[0, ...(amp > 0.05 ? [1, 2] : [])].map((k) => {
          const tt = t - k * 0.05;
          const b = bob(tt);
          const o = k === 0 ? 1 : 0.25 / k;
          return (
            <group key={k}>
              <mesh position={[(PIV[0] + b[0]) / 2, (PIV[1] + b[1]) / 2, PIV[2]]} rotation={[0, 0, theta(tt)]}>
                <boxGeometry args={[0.03, L, 0.03]} />
                <meshStandardMaterial color={C.cream} emissive={C.cream} emissiveIntensity={0.2} transparent opacity={o} />
              </mesh>
              <mesh position={b}>
                <icosahedronGeometry args={[0.2, 1]} />
                <meshStandardMaterial color={C.cream} emissive={C.cream} emissiveIntensity={0.3} flatShading transparent opacity={o} />
              </mesh>
            </group>
          );
        })}
      </group>
    </>
  );
};

// ── E6–E7: the written proof and the Lean code, side by side ───────────────
export const STAGE_SCALE = 1.15;
export const SHEET_W = 1.7;
export const SHEET_H = 2.33;
export const SHEET_Y = 1.55;
export const SHEET_X = 1.12;
/** Front-local point at the inner edge of a sheet's row `i` (side −1 left, +1 right), with the rows slid by `shift`. */
export const rowPoint = (side: -1 | 1, i: number, shift: number, lift: number): V3 => {
  const v = (140 + (i + shift) * 46 + 8) / 700;
  const p: V3 = [side * (SHEET_X - SHEET_W / 2), SHEET_Y + SHEET_H / 2 - v * SHEET_H - lift, 0.02];
  return [p[0] * STAGE_SCALE, p[1] * STAGE_SCALE, p[2] * STAGE_SCALE];
};
export const shiftAt = (t: number) => {
  const s = EASE(clamp01((t - EV.shift) / 0.35)) * 0.55;
  // after slipping, the code rows keep jittering a little
  return s + (t > EV.shift + 0.35 ? 0.04 * Math.sin(t * 9) : 0);
};
export const sheetsRise = (t: number) => rise(t, EV.scrolls, S.E8 + 0.05);

const SheetsScene: React.FC<{ t: number }> = ({ t }) => {
  const written = useMemo(() => makeSheet("PRUEBA ESCRITA", "prose", TITLE), []);
  const code = useMemo(() => makeSheet("CÓDIGO LEAN", "code", TITLE), []);
  const frame = useGlowMat(C.orange, 2.2);
  const lens = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.9, transparent: true, flatShading: true }), []);
  const lensGlass = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.cream).multiplyScalar(1.1), transparent: true, depthWrite: false, toneMapped: false }), []);
  const r = sheetsRise(t);
  if (r <= 0.001) return null;
  const lift = (1 - r) * 3.2;
  const shift = shiftAt(t);
  const flick = t > EV.shift && Math.floor(t * 14) % 3 === 0 ? 0.35 : 1;
  const leanOn = EASE(clamp01((t - EV.leanOn) / 0.4));
  written.draw(0, 0, 1);
  code.draw(shift, leanOn, flick);
  // E7: the written one goes translucent and flickers; the lens between them trembles
  const fade = 1 - 0.6 * leanOn * (Math.floor(t * 10) % 4 === 0 ? 0.7 : 1);
  frame.opacity = leanOn * (0.85 + 0.15 * Math.sin(t * 6));
  const lensIn = springAt(t, EV.lensE7, 11, 170);
  const j = jit(t, 4, 0.08);
  lens.opacity = clamp01(lensIn * 1.3);
  lensGlass.opacity = 0.18 * clamp01(lensIn);
  return (
    <>
      <FloorRing t={t} at={EV.scrolls} c={[-SHEET_X, 0, 0]} r={1.0} />
      <FloorRing t={t} at={EV.scrolls} c={[SHEET_X, 0, 0]} r={1.0} />
      {([[-1, written, fade], [1, code, 1]] as const).map(([side, sh, o]) => (
        <group key={side} position={[side * SHEET_X, SHEET_Y - lift, 0]}>
          <mesh>
            <planeGeometry args={[SHEET_W, SHEET_H]} />
            <meshBasicMaterial map={sh.tex} color={SHEET_TINT} toneMapped={false} transparent opacity={o} depthWrite={o > 0.9} />
          </mesh>
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[SHEET_W + 0.08, SHEET_H + 0.08, 0.04]} />
            <meshStandardMaterial color="#3a2e25" transparent opacity={o} />
          </mesh>
          {side === 1 && leanOn > 0 && (
            // orange glowing frame: "verified"
            [[0, SHEET_H / 2 + 0.06, SHEET_W + 0.18, 0.05], [0, -SHEET_H / 2 - 0.06, SHEET_W + 0.18, 0.05], [SHEET_W / 2 + 0.06, 0, 0.05, SHEET_H + 0.18], [-SHEET_W / 2 - 0.06, 0, 0.05, SHEET_H + 0.18]].map(([x, y, w, h], k) => (
              <mesh key={k} position={[x, y, 0.01]} material={frame}>
                <boxGeometry args={[w, h, 0.03]} />
              </mesh>
            ))
          )}
        </group>
      ))}
      {lensIn > 0.001 && (
        <group position={[j[0], SHEET_Y + 0.15 + j[1] - lift, 0.45]} scale={Math.max(0.01, lensIn)}>
          <mesh material={lens}>
            <torusGeometry args={[0.32, 0.045, 8, 32]} />
          </mesh>
          <mesh material={lensGlass}>
            <circleGeometry args={[0.3, 32]} />
          </mesh>
        </group>
      )}
    </>
  );
};

// ── E8: claim vs fact ────────────────────────────────────────────────────
const SealsScene: React.FC<{ t: number }> = ({ t }) => {
  const ped = useCream(0.08);
  const sealText = useMemo(() => plateTex("AFIRMACIÓN", TITLE, { w: 1024, h: 1024, size: 120, dark: false }), []);
  const hollowText = useMemo(() => plateTex("HECHO", TITLE, { w: 1024, h: 1024, size: 190, hollow: true }), []);
  const ring = useMemo(() => new THREE.MeshBasicMaterial({ color: C.cream, transparent: true, depthWrite: false, toneMapped: false }), []);
  const r = rise(t, EV.dim + 0.1, S.E9 - 0.05);
  if (r <= 0.001) return null;
  const lift = (1 - r) * 2.2;
  const PED: V3 = [-0.55, 0, 0];
  // the AFIRMACIÓN seal drops onto the pedestal
  const drop = EASE_IN(clamp01((t - EV.seal + 0.25) / 0.25));
  const sy = (tt: number) => lerp(3.6, 1.82, EASE_IN(clamp01((tt - EV.seal + 0.25) / 0.25)));
  const settle = t > EV.seal ? Math.exp(-(t - EV.seal) * 8) * Math.sin((t - EV.seal) * 40) * 0.04 : 0;
  const hol = springAt(t, EV.hollow, 11, 160);
  ring.opacity = 0.55 * clamp01(hol * 1.3) * (Math.floor(t * 8) % 5 === 0 ? 0.4 : 1);
  return (
    <>
      <FloorRing t={t} at={EV.dim + 0.1} c={PED} r={0.8} />
      <mesh material={ped} position={[PED[0], 0.55 - lift, PED[2]]}>
        <cylinderGeometry args={[0.5, 0.6, 1.1, 8]} />
      </mesh>
      {t > EV.seal - 0.3 && (
        <>
          <group position={[PED[0], sy(t) + settle - lift, PED[2]]}>
            <mesh>
              <circleGeometry args={[0.66, 40]} />
              <meshBasicMaterial map={sealText} transparent opacity={0.72} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, -0.02]}>
              <cylinderGeometry args={[0.7, 0.7, 0.03, 40]} />
              <meshBasicMaterial color={C.cream} transparent opacity={0.3} depthWrite={false} />
            </mesh>
          </group>
          {drop < 1 && [1, 2, 3].map((k) => (
            <mesh key={k} position={[PED[0], sy(t - k * 0.03) - lift, PED[2]]}>
              <circleGeometry args={[0.66, 40]} />
              <meshBasicMaterial color={C.cream} transparent opacity={0.2 * (1 - k / 4)} depthWrite={false} />
            </mesh>
          ))}
        </>
      )}
      {hol > 0.001 && (
        // the HECHO seal stays hollow: a dashed outline with nothing inside
        <group position={[1.25, 1.75 + 0.05 * Math.sin(t * 1.8) - lift, 0]} scale={Math.max(0.01, hol)}>
          {Array.from({ length: 24 }, (_, k) => {
            const a = (k / 24) * Math.PI * 2;
            return (
              <mesh key={k} material={ring} position={[Math.cos(a) * 0.68, Math.sin(a) * 0.68, 0]} rotation={[0, 0, a]}>
                <boxGeometry args={[0.03, 0.1, 0.01]} />
              </mesh>
            );
          })}
          <mesh>
            <planeGeometry args={[1.3, 1.3]} />
            <meshBasicMaterial map={hollowText} transparent opacity={0.85 * ring.opacity / 0.55} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
      )}
    </>
  );
};

// ── E9–E10: the AI with its "done" badge, the empty slot, the lens that checks ──
const SLOT: V3 = [0.85, 1.45, -0.7];
const PIECE_A: V3 = [0.15, 0.32, 0.95];
const PIECE_B: V3 = [1.15, 0.32, 0.95];

const Piece: React.FC<{ p: V3; tab: boolean; mat: THREE.Material }> = ({ p, tab, mat }) => (
  <group position={p}>
    <mesh material={mat}>
      <boxGeometry args={[0.5, 0.5, 0.3]} />
    </mesh>
    {tab ? (
      <mesh material={mat} position={[0.31, 0, 0]}>
        <boxGeometry args={[0.14, 0.18, 0.3]} />
      </mesh>
    ) : (
      <mesh position={[-0.21, 0, 0.16]}>
        <boxGeometry args={[0.1, 0.18, 0.02]} />
        <meshBasicMaterial color="#2a211b" />
      </mesh>
    )}
  </group>
);

const LessonScene: React.FC<{ t: number }> = ({ t }) => {
  const badge = useCream(0.5);
  const tick = useMemo(() => new THREE.MeshBasicMaterial({ color: C.ink }), []);
  const slotLine = useMemo(() => new THREE.MeshBasicMaterial({ color: C.cream, transparent: true, depthWrite: false, toneMapped: false }), []);
  const slotIn = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1c1714", roughness: 0.9 }), []);
  const piece = useCream(0.2);
  const lensMat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cream, emissive: C.cream, emissiveIntensity: 0.9, flatShading: true }), []);
  const lensGlass = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.cream).multiplyScalar(1.1), transparent: true, opacity: 0.2, depthWrite: false, toneMapped: false }), []);
  const out = EV.dark + 99;
  const rOrb = rise(t, EV.orb9, out);
  if (rOrb <= 0.001) return null;
  const b = springAt(t, EV.badge, 11, 180);
  const slotA = springAt(t, EV.orb9 + 0.2, 12, 170);
  const empty = t > EV.slot && t < EV.fill;
  slotLine.opacity = clamp01(slotA) * (empty ? (Math.floor(t * 9) % 2 ? 0.25 : 0.9) : 0.55);
  // E10: pieces rise, the lens scans A → B, they fit, then the joined piece fills the slot
  const rp = rise(t, EV.scan - 0.05, out);
  const fit = EASE(clamp01((t - EV.fit) / 0.35));
  const fill = EASE(clamp01((t - EV.fill) / 0.6));
  const lensP = EASE(clamp01((t - EV.scan - 0.2) / (EV.fit - EV.scan - 0.2)));
  const lensIn = rise(t, EV.scan, EV.fill + 0.3);
  const a: V3 = [lerp(PIECE_A[0], PIECE_B[0] - 0.64, fit), PIECE_A[1] - (1 - rp) * 1.2, PIECE_A[2]];
  const bp: V3 = [PIECE_B[0], PIECE_B[1] - (1 - rp) * 1.2, PIECE_B[2]];
  // both pieces fly into the slot together
  const into = (p: V3, dx: number): V3 => [lerp(p[0], SLOT[0] + dx * 0.55, fill), lerp(p[1], SLOT[1], fill) + Math.sin(Math.PI * fill) * 0.5, lerp(p[2], SLOT[2] + 0.12, fill)];
  const slotFull = t > EV.fill + 0.6;
  return (
    <>
      <FloorRing t={t} at={EV.orb9} c={[ORB9[0], 0, ORB9[2]]} r={0.9} />
      <group position={[ORB9[0], ORB9[1] - (1 - rOrb) * 2.4 + 0.06 * Math.sin(t * 2), ORB9[2]]}>
        <Orb t={t} r={0.55} />
        {b > 0.001 && (
          // cream "done" badge
          <group position={[0.55, 0.5, 0.45]} scale={Math.max(0.01, b)}>
            <mesh material={badge} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.05, 24]} />
            </mesh>
            <mesh material={tick} position={[-0.05, -0.02, 0.03]} rotation={[0, 0, 0.8]}>
              <boxGeometry args={[0.04, 0.12, 0.01]} />
            </mesh>
            <mesh material={tick} position={[0.04, 0.02, 0.03]} rotation={[0, 0, -0.6]}>
              <boxGeometry args={[0.04, 0.22, 0.01]} />
            </mesh>
          </group>
        )}
      </group>
      {/* the empty slot behind */}
      {slotA > 0.001 && (
        <group position={SLOT} scale={Math.max(0.01, Math.min(1, slotA))}>
          <mesh material={slotIn}>
            <boxGeometry args={[1.25, 0.7, 0.1]} />
          </mesh>
          {[[0, 0.37, 1.32, 0.04], [0, -0.37, 1.32, 0.04], [0.64, 0, 0.04, 0.78], [-0.64, 0, 0.04, 0.78]].map(([x, y, w, h], k) => (
            <mesh key={k} position={[x, y, 0.06]} material={slotLine}>
              <boxGeometry args={[w, h, 0.02]} />
            </mesh>
          ))}
          {slotFull && (
            <mesh position={[0, 0, 0.08]}>
              <planeGeometry args={[1.2, 0.66]} />
              <meshBasicMaterial color={SHEET_TINT} />
            </mesh>
          )}
        </group>
      )}
      {rp > 0.001 && !slotFull && (
        <>
          <Piece p={fill > 0 ? into(a, -0.3) : a} tab mat={piece} />
          <Piece p={fill > 0 ? into(bp, 0.3) : bp} tab={false} mat={piece} />
        </>
      )}
      {lensIn > 0.001 && (
        <group position={[lerp(PIECE_A[0], PIECE_B[0], lensP), 1.05 + 0.04 * Math.sin(t * 5), PIECE_A[2] + 0.1]} scale={Math.max(0.01, lensIn)}>
          <mesh material={lensMat}>
            <torusGeometry args={[0.36, 0.05, 8, 32]} />
          </mesh>
          <mesh material={lensGlass}>
            <circleGeometry args={[0.34, 32]} />
          </mesh>
          <mesh material={lensMat} position={[0.3, -0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.07, 0.36, 0.07]} />
          </mesh>
        </group>
      )}
    </>
  );
};

export const Stage: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const cubeRise = 1 - EASE(clamp01((t - EV.cubeOut) / 0.6));
  return (
    <>
      <Cube t={t} rise={cubeRise} />
      <Swarm t={t} dim={dim} />
      {/* the later props read a little bigger than the cube scenes */}
      <group scale={STAGE_SCALE}>
        <LeanScene t={t} />
        <VaultScene t={t} />
        <SheetsScene t={t} />
        <SealsScene t={t} />
        <LessonScene t={t} />
      </group>
    </>
  );
};

