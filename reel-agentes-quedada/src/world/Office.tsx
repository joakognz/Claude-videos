import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EV, S, act, beat, clamp01 } from "../theme";
import { BOARD, CTR, HUMAN_DESK, PLAT_HALF, PLAT_Y, deskSpot, deskYaw } from "./layout";
import { Seg, useGlowMat } from "./prims";

/** Monitor k: off before the drop, on with it, dead when the credits run out, back with the tokens. */
const monitorOn = (k: number, t: number) => {
  const on = clamp01((t - EV.drop - 0.05 - k * 0.06) / 0.08);
  const dead = clamp01((t - EV.drain1 - k * 0.09) / 0.15);
  const back = clamp01((t - EV.deal - 0.35 - k * 0.18) / 0.2);
  return Math.max(on * (1 - dead), back);
};

const useStd = (color: string, emissive = "#000000", ei = 0) =>
  useMemo(() => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: ei, roughness: 0.75, flatShading: true }), [color, emissive, ei]);

/** The floating platform: a square in world axes, so it reads as a diamond. */
export const Platform: React.FC<{ t: number }> = ({ t }) => {
  const top = useStd("#3b2f27");
  const side = useStd("#241c17");
  const trim = useGlowMat(C.cream, 0.55);
  const under = useGlowMat(C.orange, 1.0);
  trim.opacity = 0.55 + 0.25 * act(t);
  under.opacity = 0.18 + 0.35 * act(t) + 0.25 * beat(t) * (1 - clamp01((t - S.E11) / 0.5));
  const H = PLAT_HALF;
  const y = PLAT_Y;
  const c: V3[] = [[H, y + 0.005, H], [H, y + 0.005, -H], [-H, y + 0.005, -H], [-H, y + 0.005, H]];
  const u: V3[] = c.map((p) => [p[0] * 0.97, y - 0.47, p[2] * 0.97]);
  return (
    <>
      <mesh material={side} position={[0, y - 0.24, 0]}>
        <boxGeometry args={[2 * H, 0.48, 2 * H]} />
      </mesh>
      <mesh material={top} position={[0, y + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2 * H - 0.06, 2 * H - 0.06]} />
      </mesh>
      {c.map((p, i) => <Seg key={i} a={p} b={c[(i + 1) % 4]} w={0.035} mat={trim} />)}
      {/* light strip under the floating slab */}
      {u.map((p, i) => <Seg key={`u${i}`} a={p} b={u[(i + 1) % 4]} w={0.05} mat={under} />)}
    </>
  );
};

const Desk: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const cream = useStd("#d9cbbf");
  const dark = useStd("#5b4d42");
  const screen = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const on = monitorOn(k, t);
  const flick = 0.85 + 0.15 * Math.sin(t * 23 + k * 5);
  screen.color.set("#2a201a").lerp(new THREE.Color(C.orange).multiplyScalar(1.3 + 0.5 * beat(t)), on * flick);
  const p = deskSpot(k);
  return (
    <group position={p} rotation={[0, deskYaw(k), 0]}>
      <mesh material={cream} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.06, 1.1]} />
      </mesh>
      <mesh material={dark} position={[0, 0.25, -0.5]}>
        <boxGeometry args={[0.55, 0.5, 0.05]} />
      </mesh>
      <mesh material={dark} position={[0, 0.25, 0.5]}>
        <boxGeometry args={[0.55, 0.5, 0.05]} />
      </mesh>
      {/* monitor on the inner edge, screen facing out to the orb */}
      <mesh material={dark} position={[-0.17, 0.62, 0]}>
        <boxGeometry args={[0.05, 0.2, 0.06]} />
      </mesh>
      <mesh material={dark} position={[-0.17, 0.8, 0]}>
        <boxGeometry args={[0.04, 0.34, 0.56]} />
      </mesh>
      <mesh material={screen} position={[-0.145, 0.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 0.29]} />
      </mesh>
    </group>
  );
};

/** The human's own desk at the front, its screen cream (not AI). */
const HumanDesk: React.FC = () => {
  const cream = useStd("#d9cbbf");
  const dark = useStd("#5b4d42");
  const screen = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.cream).multiplyScalar(0.75), toneMapped: false }), []);
  return (
    <group position={HUMAN_DESK}>
      <mesh material={cream} position={[0, 0.5, 0]}>
        <boxGeometry args={[1.1, 0.06, 0.55]} />
      </mesh>
      <mesh material={dark} position={[-0.5, 0.25, 0]}>
        <boxGeometry args={[0.05, 0.5, 0.5]} />
      </mesh>
      <mesh material={dark} position={[0.5, 0.25, 0]}>
        <boxGeometry args={[0.05, 0.5, 0.5]} />
      </mesh>
      <mesh material={dark} position={[0, 0.8, -0.14]}>
        <boxGeometry args={[0.56, 0.34, 0.04]} />
      </mesh>
      <mesh material={screen} position={[0, 0.8, -0.115]}>
        <planeGeometry args={[0.5, 0.29]} />
      </mesh>
    </group>
  );
};

/** Whiteboard at the back: strategy scribbles draw on in orange at "estrategia". */
const Board: React.FC<{ t: number }> = ({ t }) => {
  const cream = useStd("#e8dccf", C.cream, 0.08);
  const dark = useStd("#5b4d42");
  const ink = useGlowMat(C.orange, 1.5);
  const p = clamp01((t - EV.board) / 0.9);
  const dim = 1 - 0.7 * clamp01((t - EV.drain1) / 0.4) * (1 - clamp01((t - EV.deal - 0.5) / 0.4));
  ink.opacity = dim;
  const strokes: [V3, V3][] = [
    [[-0.5, 1.45, 0.03], [-0.1, 1.45, 0.03]], [[-0.5, 1.3, 0.03], [0.05, 1.3, 0.03]], [[0.15, 1.5, 0.03], [0.5, 1.2, 0.03]],
    [[-0.5, 1.12, 0.03], [-0.2, 1.12, 0.03]], [[0.15, 1.2, 0.03], [0.5, 1.5, 0.03]], [[-0.1, 1.0, 0.03], [0.45, 1.0, 0.03]],
  ];
  return (
    <group position={BOARD} rotation={[0, Math.PI / 4, 0]}>
      <mesh material={dark} position={[-0.6, 0.6, -0.02]}>
        <boxGeometry args={[0.05, 1.2, 0.05]} />
      </mesh>
      <mesh material={dark} position={[0.6, 0.6, -0.02]}>
        <boxGeometry args={[0.05, 1.2, 0.05]} />
      </mesh>
      <mesh material={cream} position={[0, 1.25, 0]}>
        <boxGeometry args={[1.3, 0.75, 0.04]} />
      </mesh>
      {strokes.map(([a, b], i) => (
        <Seg key={i} a={a} b={b} w={0.035} p={clamp01(p * strokes.length - i)} mat={ink} />
      ))}
    </group>
  );
};

const Plant: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => {
  const pot = useStd("#d9cbbf");
  const leaf = useStd("#8a7a6c");
  return (
    <group position={p} scale={s}>
      <mesh material={pot} position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.17, 0.13, 0.36, 7]} />
      </mesh>
      {[0, 2.1, 4.2].map((a, i) => (
        <mesh key={i} material={leaf} position={[Math.cos(a) * 0.08, 0.55 + i * 0.05, Math.sin(a) * 0.08]} rotation={[Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35]}>
          <coneGeometry args={[0.12, 0.6, 5]} />
        </mesh>
      ))}
    </group>
  );
};

/** Everything on the platform (local group). */
export const Furniture: React.FC<{ t: number }> = ({ t }) => {
  const cream = useStd("#d9cbbf");
  const rug = useMemo(() => new THREE.MeshBasicMaterial({ color: "#4a3a2f" }), []);
  return (
    <>
      <mesh material={rug} position={[CTR[0], PLAT_Y + 0.01, CTR[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.45, 40]} />
      </mesh>
      {/* meeting table */}
      <mesh material={cream} position={[CTR[0], PLAT_Y + 0.47, CTR[2]]}>
        <cylinderGeometry args={[0.72, 0.72, 0.06, 24]} />
      </mesh>
      <mesh material={cream} position={[CTR[0], PLAT_Y + 0.23, CTR[2]]}>
        <cylinderGeometry args={[0.08, 0.16, 0.45, 8]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((k) => <Desk key={k} k={k} t={t} />)}
      <HumanDesk />
      <Board t={t} />
      <Plant p={[-4.3, PLAT_Y, 0.3]} s={1.1} />
      <Plant p={[1.3, PLAT_Y, -3.6]} />
      <Plant p={[4.0, PLAT_Y, -0.8]} s={0.9} />
    </>
  );
};
