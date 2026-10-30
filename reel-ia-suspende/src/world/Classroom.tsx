import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EV, TITLE, clamp01, rand } from "../theme";
import {
  BOARD, CASES, DESKS, FLOOR_Y, FRAME_PAD, FRAME_TOP, GATE, GATE_H, GATE_W, H, NOTE, STUDENT_DESK, WALL_H, caseAt, frameBright,
  frameDraw, gateGone, gateOpen, gateSign, noteIn,
} from "./layout";
import { Seg, useGlowMat } from "./prims";
import { radialTex, signTex } from "./textures";

const useStd = (color: string, emissive = "#000000", ei = 0) =>
  useMemo(() => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: ei, roughness: 0.8, flatShading: true }), [color, emissive, ei]);

// ── the empty street around the classroom ─────────────────────────────────
const LAMPS: V3[] = [[H + 2.0, 0, -H - 0.6], [H + 2.1, 0, H + 1.4], [-H - 0.6, 0, H + 2.0], [-H - 2.6, 0, -H - 2.6]];

const Street: React.FC<{ t: number }> = ({ t }) => {
  const asphalt = useStd("#151110");
  const curb = useStd("#3a2f28");
  const dash = useGlowMat(C.cream, 0.35);
  const heads = useMemo(() => LAMPS.map(() => new THREE.MeshBasicMaterial({ color: C.cream, toneMapped: false })), []);
  const pools = useMemo(() => LAMPS.map(() => new THREE.MeshBasicMaterial({
    color: "#5a4030", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })), []);
  const pole = useStd("#6e5f53");
  const on = (k: number) => 0.25 + 0.75 * clamp01((t - EV.street - k * 0.12) / 0.2);
  dash.opacity = 0.25 + 0.35 * clamp01((t - EV.street) / 0.6);
  const lanes: [V3, V3][] = [];
  for (let i = -8; i < 9; i++) {
    lanes.push([[i * 1.6, 0.012, H + 2.6], [i * 1.6 + 0.8, 0.012, H + 2.6]]);
    lanes.push([[H + 2.6, 0.012, i * 1.6], [H + 2.6, 0.012, i * 1.6 + 0.8]]);
  }
  return (
    <>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={asphalt}>
        <planeGeometry args={[400, 400]} />
      </mesh>
      {/* sidewalk the classroom stands on */}
      <mesh position={[0, 0.04, 0]} material={curb}>
        <boxGeometry args={[2 * H + 2.4, 0.08, 2 * H + 2.4]} />
      </mesh>
      {lanes.map(([a, b], i) => <Seg key={i} a={a} b={b} w={0.07} mat={dash} />)}
      {LAMPS.map((p, k) => {
        heads[k].color.set(C.cream).multiplyScalar(0.3 + 0.9 * on(k));
        pools[k].opacity = 0.2 + 0.7 * (on(k) - 0.25);
        return (
          <group key={k} position={p}>
            <mesh material={pole} position={[0, 1.0, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 2.0, 6]} />
            </mesh>
            <mesh material={heads[k]} position={[0, 2.08, 0]}>
              <icosahedronGeometry args={[0.16, 0]} />
            </mesh>
            <mesh material={pools[k]} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4.5, 4.5]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

// ── room shell ────────────────────────────────────────────────────────────
const Room: React.FC<{ t: number }> = ({ t }) => {
  const floor = useStd("#54443a");
  const wall = useStd("#40342c");
  const wallTop = useStd("#6a5a4e");
  const board = useStd("#1d1714");
  const frameMat = useStd("#d9cbbf");
  const chalk = useGlowMat(C.cream, 0.55);
  const glass = useStd("#1a1411", "#3a2618", 0.6);
  const hole = useMemo(() => new THREE.MeshBasicMaterial({ color: "#0b0908", transparent: true }), []);
  hole.opacity = gateGone(t);
  // abstract chalk formulas on the board (thin cream strokes)
  const strokes = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const row = Math.floor(i / 3);
    const z0 = BOARD[2] - 1.0 + (i % 3) * 0.75;
    const y0 = BOARD[1] + 0.3 - row * 0.28;
    return [[BOARD[0] + 0.02, y0, z0], [BOARD[0] + 0.02, y0 + (rand(i) - 0.5) * 0.08, z0 + 0.35 + rand(i + 9) * 0.25]] as [V3, V3];
  }), []);
  const doorW = GATE_W;
  return (
    <>
      <mesh material={floor} position={[0, FLOOR_Y / 2 + 0.04, 0]}>
        <boxGeometry args={[2 * H, FLOOR_Y, 2 * H]} />
      </mesh>
      {/* left back wall (x = -H) with the blackboard */}
      <mesh material={wall} position={[-H - 0.07, FLOOR_Y + WALL_H / 2, 0]}>
        <boxGeometry args={[0.14, WALL_H, 2 * H + 0.14]} />
      </mesh>
      <mesh material={wallTop} position={[-H - 0.07, FLOOR_Y + WALL_H + 0.01, 0]}>
        <boxGeometry args={[0.16, 0.02, 2 * H + 0.16]} />
      </mesh>
      <mesh material={frameMat} position={[BOARD[0] - 0.01, BOARD[1], BOARD[2]]}>
        <boxGeometry args={[0.04, 1.12, 2.72]} />
      </mesh>
      <mesh material={board} position={[BOARD[0] + 0.005, BOARD[1], BOARD[2]]}>
        <boxGeometry args={[0.04, 1.0, 2.6]} />
      </mesh>
      {strokes.map(([a, b], i) => <Seg key={i} a={a} b={b} w={0.025} mat={chalk} />)}
      {/* right back wall (z = -H) in three pieces around the gate opening */}
      {(() => {
        const l0 = -H - 0.14;
        const l1 = GATE[0] - doorW / 2;
        const r0 = GATE[0] + doorW / 2;
        const r1 = H;
        return (
          <>
            <mesh material={wall} position={[(l0 + l1) / 2, FLOOR_Y + WALL_H / 2, -H - 0.07]}>
              <boxGeometry args={[l1 - l0, WALL_H, 0.14]} />
            </mesh>
            <mesh material={wall} position={[(r0 + r1) / 2, FLOOR_Y + WALL_H / 2, -H - 0.07]}>
              <boxGeometry args={[r1 - r0, WALL_H, 0.14]} />
            </mesh>
            <mesh material={wall} position={[GATE[0], FLOOR_Y + GATE_H + (WALL_H - GATE_H) / 2, -H - 0.07]}>
              <boxGeometry args={[doorW, WALL_H - GATE_H, 0.14]} />
            </mesh>
            <mesh material={wallTop} position={[(l0 + r1) / 2, FLOOR_Y + WALL_H + 0.01, -H - 0.07]}>
              <boxGeometry args={[r1 - l0, 0.02, 0.16]} />
            </mesh>
            {/* the doorway behind the gate: dark, shows once the gate is gone */}
            <mesh material={hole} position={[GATE[0], FLOOR_Y + GATE_H / 2, -H - 0.12]}>
              <planeGeometry args={[doorW, GATE_H]} />
            </mesh>
          </>
        );
      })()}
      {/* a window on the right wall */}
      <mesh material={frameMat} position={[-2.1, FLOOR_Y + 1.45, -H + 0.005]}>
        <boxGeometry args={[1.2, 0.9, 0.03]} />
      </mesh>
      <mesh material={glass} position={[-2.1, FLOOR_Y + 1.45, -H + 0.025]}>
        <boxGeometry args={[1.08, 0.78, 0.02]} />
      </mesh>
    </>
  );
};

// ── the DESPLIEGUE gate, the note beside it ───────────────────────────────
const Gate: React.FC<{ t: number }> = ({ t }) => {
  const [lit, dead] = useMemo(() => [signTex("DESPLIEGUE", true, TITLE), signTex("DESPLIEGUE", false, TITLE)], []);
  const signMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true }), []);
  const door = useStd("#5a4a3e", C.orange, 0);
  const frame = useStd("#d9cbbf");
  const glow = useGlowMat(C.orange, 1.5);
  const s = gateSign(t);
  const gone = gateGone(t);
  signMat.map = s > 0.5 ? lit : dead;
  signMat.color.set("#ffffff").multiplyScalar(0.6 + 0.6 * s);
  signMat.opacity = 1 - gone;
  door.emissiveIntensity = 0.12 * s;
  door.transparent = gone > 0;
  door.opacity = 1 - gone;
  frame.transparent = gone > 0;
  frame.opacity = 1 - gone;
  glow.opacity = s * (1 - gone) * (0.5 + 0.5 * gateOpen(t));
  if (gone >= 1) return null;
  const open = gateOpen(t);
  const leaf = GATE_W / 2;
  const z = -H + 0.02;
  return (
    <group>
      <mesh material={signMat} position={[GATE[0], FLOOR_Y + GATE_H + 0.42, z + 0.01]}>
        <planeGeometry args={[2.1, 0.45]} />
      </mesh>
      {/* frame */}
      <mesh material={frame} position={[GATE[0] - leaf - 0.04, FLOOR_Y + GATE_H / 2, z]}>
        <boxGeometry args={[0.08, GATE_H, 0.1]} />
      </mesh>
      <mesh material={frame} position={[GATE[0] + leaf + 0.04, FLOOR_Y + GATE_H / 2, z]}>
        <boxGeometry args={[0.08, GATE_H, 0.1]} />
      </mesh>
      <mesh material={frame} position={[GATE[0], FLOOR_Y + GATE_H + 0.04, z]}>
        <boxGeometry args={[GATE_W + 0.16, 0.08, 0.1]} />
      </mesh>
      {/* light behind the open gate */}
      <mesh material={glow} position={[GATE[0], FLOOR_Y + GATE_H / 2, -H - 0.11]}>
        <planeGeometry args={[GATE_W, GATE_H]} />
      </mesh>
      {/* two leaves, hinged on the frame, swinging into the room */}
      <group position={[GATE[0] - leaf, FLOOR_Y, z]} rotation={[0, -open * 1.25, 0]}>
        <mesh material={door} position={[leaf / 2, GATE_H / 2, 0]}>
          <boxGeometry args={[leaf - 0.02, GATE_H - 0.04, 0.06]} />
        </mesh>
      </group>
      <group position={[GATE[0] + leaf, FLOOR_Y, z]} rotation={[0, open * 1.25, 0]}>
        <mesh material={door} position={[-leaf / 2, GATE_H / 2, 0]}>
          <boxGeometry args={[leaf - 0.02, GATE_H - 0.04, 0.06]} />
        </mesh>
      </group>
    </group>
  );
};

const Note: React.FC<{ t: number }> = ({ t }) => {
  const paper = useStd("#fff4ec", C.cream, 0.35);
  const ink = useStd("#5b4d42");
  const s = noteIn(t);
  if (s <= 0.001) return null;
  return (
    <group position={NOTE} rotation={[0, 0, 0.08]} scale={s * 1.4}>
      <mesh material={paper}>
        <boxGeometry args={[0.5, 0.5, 0.02]} />
      </mesh>
      {[0.12, 0.02, -0.08].map((y, i) => (
        <mesh key={i} material={ink} position={[-0.02 + (i === 2 ? -0.06 : 0), y, 0.012]}>
          <boxGeometry args={[i === 2 ? 0.24 : 0.36, 0.03, 0.005]} />
        </mesh>
      ))}
    </group>
  );
};

// ── desks ────────────────────────────────────────────────────────────────
const Desk: React.FC<{ p: V3; student?: boolean; t: number }> = ({ p, student, t }) => {
  const top = useStd("#d9cbbf");
  const leg = useStd("#5b4d42");
  const paper = useStd("#fff4ec", C.cream, 0.2);
  const paperOn = student ? clamp01((t - EV.give - 0.2) / 0.2) : 0;
  return (
    <group position={p}>
      <mesh material={top} position={[0, 0.62, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.9]} />
      </mesh>
      {[[-0.25, -0.38], [-0.25, 0.38], [0.25, -0.38], [0.25, 0.38]].map(([x, z], i) => (
        <mesh key={i} material={leg} position={[x, 0.3, z]}>
          <boxGeometry args={[0.04, 0.6, 0.04]} />
        </mesh>
      ))}
      {/* chair behind it (towards +x) */}
      <mesh material={leg} position={[0.62, 0.36, 0]}>
        <boxGeometry args={[0.36, 0.04, 0.4]} />
      </mesh>
      <mesh material={leg} position={[0.8, 0.6, 0]}>
        <boxGeometry args={[0.04, 0.48, 0.4]} />
      </mesh>
      {paperOn > 0 && (
        <mesh material={paper} position={[0.05, 0.655, 0]} rotation={[-Math.PI / 2, 0, 0.1]} scale={paperOn}>
          <planeGeometry args={[0.3, 0.42]} />
        </mesh>
      )}
    </group>
  );
};

// ── the lab frame (thin cream wireframe round the room) ───────────────────
const LabFrame: React.FC<{ t: number }> = ({ t }) => {
  const mat = useGlowMat(C.cream, 1.2);
  const d = frameDraw(t);
  if (d <= 0) return null;
  mat.opacity = frameBright(t);
  const a = H + FRAME_PAD;
  const y0 = 0.05;
  const y1 = FRAME_TOP;
  const c: V3[] = [[a, 0, a], [a, 0, -a], [-a, 0, -a], [-a, 0, a]];
  const edges: [V3, V3][] = [];
  for (let i = 0; i < 4; i++) {
    const p = c[i];
    const q = c[(i + 1) % 4];
    edges.push([[p[0], y0, p[2]], [q[0], y0, q[2]]]);
    edges.push([[p[0], y1, p[2]], [q[0], y1, q[2]]]);
    edges.push([[p[0], y0, p[2]], [p[0], y1, p[2]]]);
  }
  return <>{edges.map(([p, q], i) => <Seg key={i} a={p} b={q} w={0.03} p={clamp01(d * 1.6 - i * 0.05)} mat={mat} />)}</>;
};

// ── E11: real cases ──────────────────────────────────────────────────────
const Cases: React.FC<{ t: number }> = ({ t }) => {
  const box = useStd("#d9b99a");
  const tape = useStd("#8a7362");
  const ticket = useStd("#fff4ec", C.cream, 0.3);
  if (t < EV.cases) return null;
  return (
    <>
      {CASES.map((c, k) => {
        const s = caseAt(k, t);
        if (s.o <= 0) return null;
        return c.kind === "box" ? (
          <group key={k} position={[s.p[0], s.p[1] + 0.22, s.p[2]]} rotation={[0, k * 0.7, 0]} scale={s.o}>
            <mesh material={box} position={[0, 0.1, 0]}>
              <boxGeometry args={[0.7, 0.6, 0.7]} />
            </mesh>
            <mesh material={tape} position={[0, 0.405, 0]}>
              <boxGeometry args={[0.14, 0.01, 0.71]} />
            </mesh>
          </group>
        ) : (
          <mesh key={k} material={ticket} position={[s.p[0], s.p[1] + 0.03, s.p[2]]} rotation={[-Math.PI / 2, 0, k]} scale={s.o}>
            <boxGeometry args={[0.5, 0.78, 0.03]} />
          </mesh>
        );
      })}
    </>
  );
};

export const Classroom: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Street t={t} />
    <Room t={t} />
    <Gate t={t} />
    <Note t={t} />
    {DESKS.map((p, i) => <Desk key={i} p={p} t={t} student={p === STUDENT_DESK} />)}
    <LabFrame t={t} />
    <Cases t={t} />
  </>
);

