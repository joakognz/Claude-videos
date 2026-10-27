import React, { useMemo } from "react";
import * as THREE from "three";
import { CHAIRS, SHOP_D, SHOP_H, SHOP_W, SIGN_Y, V3 } from "../camera";
import { COND, EV, EASE, S, clamp01, springAt } from "../theme";
import { fadeTex, floorTex, poleTex, radialTex, signTex } from "./textures";

const W = SHOP_W, D = SHOP_D, H = SHOP_H;
const ORANGE = new THREE.Color("#FF7A00");
const glow = (k: number): [number, number, number] => [ORANGE.r * k, ORANGE.g * k, ORANGE.b * k];

type Look = {
  lit: boolean; wall: string; wallOut: string; base: string; chair: string; chrome: string; figure: string;
  cape: string; mirror: string; mirrorRough: number; wood: string;
};
const LOOK: Record<"orange" | "grey", Look> = {
  orange: { lit: true, wall: "#2a1c12", wallOut: "#151210", base: "#1d1510", chair: "#1b1714", chrome: "#9a8f86", figure: "#efe6dc", cape: "#2b2622", mirror: "#3b322b", mirrorRough: 0.12, wood: "#24170e" },
  grey: { lit: false, wall: "#454545", wallOut: "#3a3a3a", base: "#333333", chair: "#4a4a4a", chrome: "#5a5a5a", figure: "#6a6a6a", cape: "#4a4a4a", mirror: "#4d4d4d", mirrorRough: 0.9, wood: "#4f4f4f" },
};

const Box: React.FC<{ p: V3; s: V3; c: string; r?: number; m?: number; rot?: V3 }> = ({ p, s, c, r = 0.85, m = 0.05, rot }) => (
  <mesh position={p} rotation={rot}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={r} metalness={m} />
  </mesh>
);

/** Neon strip (orange shop only): unlit emissive so the bloom picks it up. */
const Neon: React.FC<{ p: V3; s: V3; k?: number }> = ({ p, s, k = 2.6 }) => (
  <mesh position={p}>
    <boxGeometry args={s} />
    <meshBasicMaterial color={glow(k)} toneMapped={false} />
  </mesh>
);

/** Faceless standing figure: capsule body + sphere head. */
export const Standing: React.FC<{ p: V3; c: string; s?: number; ry?: number; scissors?: boolean; bob?: number }> = ({ p, c, s = 1, ry = 0, scissors, bob = 0 }) => (
  <group position={[p[0], p[1] + bob, p[2]]} scale={s} rotation={[0, ry, 0]}>
    <mesh position={[0, 0.62, 0]}>
      <capsuleGeometry args={[0.17, 0.62, 6, 12]} />
      <meshStandardMaterial color={c} roughness={0.55} />
    </mesh>
    <mesh position={[0, 1.27, 0]}>
      <sphereGeometry args={[0.15, 18, 14]} />
      <meshStandardMaterial color={c} roughness={0.5} />
    </mesh>
    {/* arm reaching forward */}
    <mesh position={[0.17, 0.82, -0.12]} rotation={[0.9, 0, 0]}>
      <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
      <meshStandardMaterial color={c} roughness={0.55} />
    </mesh>
    {scissors && (
      <group position={[0.2, 0.86, -0.32]} rotation={[0, 0, 0.3]}>
        <mesh rotation={[0, 0, 0.35]}><boxGeometry args={[0.02, 0.2, 0.012]} /><meshStandardMaterial color="#9a9a9a" metalness={0.8} roughness={0.3} /></mesh>
        <mesh rotation={[0, 0, -0.35]}><boxGeometry args={[0.02, 0.2, 0.012]} /><meshStandardMaterial color="#9a9a9a" metalness={0.8} roughness={0.3} /></mesh>
        <mesh position={[-0.04, -0.11, 0]}><torusGeometry args={[0.03, 0.008, 6, 12]} /><meshStandardMaterial color="#777" /></mesh>
        <mesh position={[0.04, -0.11, 0]}><torusGeometry args={[0.03, 0.008, 6, 12]} /><meshStandardMaterial color="#777" /></mesh>
      </group>
    )}
  </group>
);

/** Seated client wrapped in a barber cape. */
export const Seated: React.FC<{ p: V3; look: Look; s?: number; ry?: number }> = ({ p, look, s = 1, ry = 0 }) => (
  <group position={p} scale={s} rotation={[0, ry, 0]}>
    <mesh position={[0, 0.42, 0]}>
      <coneGeometry args={[0.33, 0.78, 16, 1, true]} />
      <meshStandardMaterial color={look.cape} roughness={0.7} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.9, 0]}>
      <sphereGeometry args={[0.145, 18, 14]} />
      <meshStandardMaterial color={look.figure} roughness={0.5} />
    </mesh>
  </group>
);

/** Barber chair facing -z (towards the mirror). */
const Chair: React.FC<{ p: V3; look: Look }> = ({ p, look }) => (
  <group position={p}>
    <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.22, 0.24, 0.06, 20]} /><meshStandardMaterial color={look.chrome} metalness={0.8} roughness={0.3} /></mesh>
    <mesh position={[0, 0.33, 0]}><cylinderGeometry args={[0.055, 0.055, 0.3, 12]} /><meshStandardMaterial color={look.chrome} metalness={0.8} roughness={0.3} /></mesh>
    <Box p={[0, 0.54, 0]} s={[0.56, 0.14, 0.54]} c={look.chair} r={0.45} />
    <Box p={[0, 0.92, 0.24]} s={[0.56, 0.66, 0.12]} c={look.chair} r={0.45} />
    <Box p={[0, 1.33, 0.25]} s={[0.3, 0.14, 0.1]} c={look.chair} r={0.45} />
    <Box p={[-0.31, 0.72, -0.02]} s={[0.07, 0.07, 0.46]} c={look.chrome} r={0.3} m={0.7} />
    <Box p={[0.31, 0.72, -0.02]} s={[0.07, 0.07, 0.46]} c={look.chrome} r={0.3} m={0.7} />
    <Box p={[0, 0.3, -0.4]} s={[0.4, 0.04, 0.18]} c={look.chrome} r={0.3} m={0.7} />
  </group>
);

const Mirror: React.FC<{ x: number; look: Look }> = ({ x, look }) => (
  <group position={[x, 1.5, -D / 2 + 0.16]}>
    <Box p={[0, 0, 0]} s={[0.92, 1.12, 0.04]} c={look.lit ? "#0d0b0a" : "#3c3c3c"} />
    <mesh position={[0, 0, 0.025]}>
      <planeGeometry args={[0.8, 1.0]} />
      <meshStandardMaterial color={look.mirror} roughness={look.mirrorRough} metalness={look.lit ? 0.9 : 0.1} />
    </mesh>
    {look.lit && (
      <>
        <Neon p={[0, 0.535, 0.03]} s={[0.86, 0.025, 0.02]} k={2.2} />
        <Neon p={[0, -0.535, 0.03]} s={[0.86, 0.025, 0.02]} k={2.2} />
        <Neon p={[-0.43, 0, 0.03]} s={[0.025, 1.07, 0.02]} k={2.2} />
        <Neon p={[0.43, 0, 0.03]} s={[0.025, 1.07, 0.02]} k={2.2} />
      </>
    )}
  </group>
);

const WashBasin: React.FC<{ look: Look }> = ({ look }) => (
  <group position={[-W / 2 + 0.47, 0, 0.55]}>
    <Box p={[0, 0.45, 0]} s={[0.62, 0.8, 0.72]} c={look.lit ? "#1d1714" : "#474747"} />
    <mesh position={[0.02, 0.86, 0]} scale={[1, 0.45, 1]}>
      <sphereGeometry args={[0.27, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={look.lit ? "#ece5de" : "#6b6b6b"} roughness={0.25} side={THREE.DoubleSide} />
    </mesh>
    {/* reclining chair facing the basin */}
    <Box p={[0.82, 0.48, 0]} s={[0.56, 0.13, 0.52]} c={look.chair} r={0.45} />
    <Box p={[0.47, 0.72, 0]} s={[0.12, 0.5, 0.5]} c={look.chair} r={0.45} rot={[0, 0, -0.55]} />
    <Box p={[0.82, 0.25, 0]} s={[0.12, 0.34, 0.12]} c={look.chrome} r={0.3} m={0.7} />
  </group>
);

const Bench: React.FC<{ look: Look }> = ({ look }) => (
  <group position={[1.55, 0, 1.25]}>
    <Box p={[0, 0.42, 0]} s={[1.3, 0.08, 0.42]} c={look.lit ? "#3a2412" : "#4d4d4d"} r={0.6} />
    <Box p={[-0.55, 0.2, 0]} s={[0.06, 0.38, 0.36]} c={look.chrome} r={0.3} m={0.6} />
    <Box p={[0.55, 0.2, 0]} s={[0.06, 0.38, 0.36]} c={look.chrome} r={0.3} m={0.6} />
  </group>
);

/** Barber pole by the door. */
const Pole: React.FC<{ lit: boolean; t: number }> = ({ lit, t }) => {
  const tex = useMemo(() => poleTex(lit), [lit]);
  tex.offset.y = lit ? (t * 0.6) % 1 : 0;
  return (
    <group position={[W / 2 + 0.12, 1.25, D / 2 - 0.05]}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.07, 0.62, 16]} />
        {lit ? <meshBasicMaterial map={tex} color={[1.6, 1.6, 1.6]} toneMapped={false} /> : <meshStandardMaterial map={tex} roughness={0.9} />}
      </mesh>
      <mesh position={[0, 0.34, 0]}><sphereGeometry args={[0.08, 12, 8]} /><meshStandardMaterial color={lit ? "#ddd" : "#555"} metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0, -0.34, 0]}><sphereGeometry args={[0.08, 12, 8]} /><meshStandardMaterial color={lit ? "#ddd" : "#555"} metalness={0.6} roughness={0.3} /></mesh>
    </group>
  );
};

/** Shell: cutaway room (back + left walls full height, front and right in glass), sign on top. */
const Shell: React.FC<{ look: Look; fontsReady: boolean }> = ({ look, fontsReady }) => {
  const sign = useMemo(() => (fontsReady ? signTex(look.lit, COND) : null), [fontsReady, look.lit]);
  const floor = useMemo(() => {
    const f = floorTex(look.lit);
    f.repeat.set(W / 1.1, D / 1.1);
    return f;
  }, [look.lit]);
  const doorA = 0.55, doorB = 1.5;
  return (
    <group>
      <Box p={[0, 0.06, 0]} s={[W + 0.12, 0.12, D + 0.12]} c={look.base} />
      <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W - 0.1, D - 0.1]} />
        <meshStandardMaterial map={floor} roughness={look.lit ? 0.35 : 0.95} metalness={look.lit ? 0.3 : 0} />
      </mesh>
      {/* back + left walls (interior colour) with the outside skin on top edges */}
      <Box p={[0, H / 2 + 0.12, -D / 2 + 0.07]} s={[W, H, 0.14]} c={look.wall} r={0.9} />
      <Box p={[-W / 2 + 0.07, H / 2 + 0.12, 0]} s={[0.14, H, D]} c={look.wall} r={0.9} />
      <Box p={[0, H + 0.16, -D / 2 + 0.07]} s={[W + 0.02, 0.08, 0.18]} c={look.wallOut} />
      <Box p={[-W / 2 + 0.07, H + 0.16, 0]} s={[0.18, 0.08, D + 0.02]} c={look.wallOut} />
      {/* posts */}
      <Box p={[W / 2 - 0.07, H / 2 + 0.12, D / 2 - 0.07]} s={[0.14, H, 0.14]} c={look.wallOut} />
      <Box p={[W / 2 - 0.07, H / 2 + 0.12, -D / 2 + 0.07]} s={[0.14, H, 0.14]} c={look.wallOut} />
      <Box p={[-W / 2 + 0.07, H / 2 + 0.12, D / 2 - 0.07]} s={[0.16, H, 0.16]} c={look.wallOut} />
      {/* low front and right bases (door gap at the front) */}
      <Box p={[(-W / 2 + doorA) / 2, 0.24, D / 2 - 0.07]} s={[doorA + W / 2, 0.24, 0.12]} c={look.wallOut} />
      <Box p={[(doorB + W / 2) / 2, 0.24, D / 2 - 0.07]} s={[W / 2 - doorB, 0.24, 0.12]} c={look.wallOut} />
      <Box p={[W / 2 - 0.07, 0.24, 0]} s={[0.12, 0.24, D]} c={look.wallOut} />
      {/* thin top rails */}
      <Box p={[0, H + 0.08, D / 2 - 0.07]} s={[W, 0.07, 0.1]} c={look.wallOut} />
      <Box p={[W / 2 - 0.07, H + 0.08, 0]} s={[0.1, 0.07, D]} c={look.wallOut} />
      {/* glass */}
      <mesh position={[0, H / 2 + 0.2, D / 2 - 0.07]}>
        <planeGeometry args={[W - 0.2, H - 0.25]} />
        <meshBasicMaterial color={look.lit ? "#ffb070" : "#9a9a9a"} transparent opacity={look.lit ? 0.06 : 0.05} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[W / 2 - 0.07, H / 2 + 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D - 0.2, H - 0.25]} />
        <meshBasicMaterial color={look.lit ? "#ffb070" : "#9a9a9a"} transparent opacity={look.lit ? 0.05 : 0.04} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* sign on top of the back wall */}
      <group position={[0, SIGN_Y, -D / 2 + 0.1]}>
        <Box p={[0, 0, -0.02]} s={[W * 0.84, 0.62, 0.12]} c={look.lit ? "#140c05" : "#2a2a2a"} />
        {sign && (
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[W * 0.82, W * 0.82 * (200 / 1024)]} />
            {look.lit ? <meshBasicMaterial map={sign} color={[2.4, 2.4, 2.4]} toneMapped={false} /> : <meshStandardMaterial map={sign} roughness={0.95} />}
          </mesh>
        )}
        <Box p={[-W * 0.3, -0.42, -0.04]} s={[0.05, 0.3, 0.05]} c={look.wallOut} />
        <Box p={[W * 0.3, -0.42, -0.04]} s={[0.05, 0.3, 0.05]} c={look.wallOut} />
      </group>
      {look.lit && (
        <>
          {/* neon outline: cove lights on the wall tops, posts, base, floor edge */}
          <Neon p={[0, H + 0.21, -D / 2 + 0.15]} s={[W, 0.03, 0.03]} />
          <Neon p={[-W / 2 + 0.15, H + 0.21, 0]} s={[0.03, 0.03, D]} />
          <Neon p={[W / 2 - 0.07, H / 2 + 0.12, D / 2 + 0.005]} s={[0.035, H, 0.02]} k={3} />
          <Neon p={[W / 2 + 0.005, H / 2 + 0.12, -D / 2 + 0.07]} s={[0.02, H, 0.035]} k={2} />
          <Neon p={[0, H + 0.12, D / 2 - 0.01]} s={[W, 0.03, 0.03]} k={3} />
          <Neon p={[W / 2 - 0.01, H + 0.12, 0]} s={[0.03, 0.03, D]} k={3} />
          <Neon p={[0, 0.13, D / 2 + 0.07]} s={[W + 0.12, 0.025, 0.02]} k={2.2} />
          <Neon p={[W / 2 + 0.07, 0.13, 0]} s={[0.02, 0.025, D + 0.12]} k={2.2} />
        </>
      )}
    </group>
  );
};

/** Reception: orange shop has a glowing booking tablet; grey shop has a notebook, a phone and a cold lamp. */
const Reception: React.FC<{ look: Look; t: number }> = ({ look, t }) => {
  if (look.lit) {
    return (
      <group position={[-1.35, 0, 1.2]}>
        <Box p={[0, 0.5, 0]} s={[1.1, 0.78, 0.46]} c="#1b130c" r={0.5} />
        <Neon p={[0, 0.5, 0.235]} s={[1.0, 0.03, 0.01]} k={2.4} />
        <Box p={[0, 0.91, 0]} s={[1.18, 0.05, 0.52]} c="#2c1d11" r={0.4} />
        <mesh position={[0.1, 1.04, -0.02]} rotation={[-0.9, 0.3, 0]}>
          <planeGeometry args={[0.34, 0.24]} />
          <meshBasicMaterial color={[1.6, 1.25, 0.95]} toneMapped={false} />
        </mesh>
        <mesh position={[0.1, 1.035, -0.025]} rotation={[-0.9, 0.3, 0]}>
          <planeGeometry args={[0.37, 0.27]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    );
  }
  // phone vibration: shake + screen on while buzzing
  const buzz = Math.max(0, ...EV.vibrate.map((v) => (t >= v && t < v + 0.55 ? 1 : 0)));
  const shake = buzz ? Math.sin(t * 90) * 0.012 : 0;
  const lamp = 0.55 + 0.45 * clamp01((t - S.E12) / 1.5);
  return (
    <group position={[-1.45, 0, 1.15]}>
      <Box p={[0, 0.5, 0]} s={[1.2, 0.78, 0.5]} c="#4b4b4b" />
      <Box p={[0, 0.91, 0]} s={[1.28, 0.05, 0.56]} c="#555555" />
      {/* open notebook */}
      <group position={[-0.18, 0.945, 0.0]} rotation={[0, 0.25, 0]}>
        <Box p={[-0.13, 0.008, 0]} s={[0.25, 0.016, 0.34]} c="#8d8d8d" rot={[0, 0, 0.08]} />
        <Box p={[0.13, 0.008, 0]} s={[0.25, 0.016, 0.34]} c="#939393" rot={[0, 0, -0.08]} />
        {[-0.1, -0.04, 0.02, 0.08].map((z) => (
          <Box key={z} p={[0.13, 0.02, z]} s={[0.17, 0.003, 0.012]} c="#5a5a5a" />
        ))}
      </group>
      {/* phone */}
      <group position={[0.32 + shake, 0.945, 0.02]} rotation={[0, -0.3 + shake * 4, 0]}>
        <Box p={[0, 0.008, 0]} s={[0.13, 0.016, 0.25]} c="#2a2a2a" r={0.3} />
        <mesh position={[0, 0.0175, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.11, 0.22]} />
          <meshBasicMaterial color={buzz ? [1.3, 1.4, 1.6] : [0.05, 0.05, 0.05]} toneMapped={false} />
        </mesh>
      </group>
      {/* cold wall lamp over the counter */}
      <group position={[-0.62, 0, -0.1]}>
        <Box p={[0.25, 2.2, 0]} s={[0.5, 0.03, 0.03]} c="#3a3a3a" />
        <mesh position={[0.5, 2.06, 0]}>
          <coneGeometry args={[0.16, 0.2, 16, 1, true]} />
          <meshStandardMaterial color="#3d3d3d" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.5, 1.98, 0]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshBasicMaterial color={[1.1 * lamp, 1.25 * lamp, 1.5 * lamp]} toneMapped={false} />
        </mesh>
        <mesh position={[0.6, 0.94, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 1.0]} />
          <meshBasicMaterial map={radialTex()} color="#b9cbe8" opacity={0.28 * lamp} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <spotLight position={[0.5, 1.98, 0]} target-position={[0.6, 0.9, 0.1]} angle={0.75} penumbra={0.8} intensity={3.2 * lamp} distance={3.2} decay={1.6} color="#cfdcff" />
      </group>
    </group>
  );
};

/** Wall clock on the left wall (grey shop), hands moving. */
const Clock: React.FC<{ t: number }> = ({ t }) => (
  <group position={[-W / 2 + 0.16, 1.95, 0.05]} rotation={[0, Math.PI / 2, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.04, 28]} /><meshStandardMaterial color="#8c8c8c" roughness={0.8} /></mesh>
    <mesh position={[0, 0, 0.022]}><circleGeometry args={[0.19, 28]} /><meshStandardMaterial color="#a3a3a3" roughness={0.9} /></mesh>
    <mesh position={[0, 0, 0.026]} rotation={[0, 0, -t * 1.2]}><planeGeometry args={[0.012, 0.3]} /><meshBasicMaterial color="#222" /></mesh>
    <mesh position={[0, 0, 0.027]} rotation={[0, 0, -t * 0.1 - 1]}><planeGeometry args={[0.02, 0.2]} /><meshBasicMaterial color="#222" /></mesh>
  </group>
);

const lerp3 = (a: V3, b: V3, p: number): V3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];

export const Shop: React.FC<{ variant: "orange" | "grey"; c: V3; t: number; fontsReady: boolean }> = ({ variant, c, t, fontsReady }) => {
  const look = LOOK[variant];
  const lit = look.lit;
  // E3: the orange shop fills up, one client after another
  const pop = (k: number) => (lit ? Math.max(0, springAt(t, EV.fill + k * 0.32, 11, 190)) : 0);
  // E8: Fede (chair 3) cancels → chair empties; E9: someone from the waiting list walks in and sits
  const leave = lit ? EASE(clamp01((t - EV.cancel - 0.25) / 0.45)) : 0;
  const walkP = clamp01((t - EV.walk) / 1.7);
  const walking = lit && t >= EV.walk && walkP < 1;
  const seatedNew = lit && walkP >= 1;
  const path: V3[] = [[1.05, 0.12, 2.3], [1.05, 0.12, 0.6], [1.3, 0.12, -0.2]];
  const wp = walkP < 0.65 ? lerp3(path[0], path[1], EASE(walkP / 0.65)) : lerp3(path[1], path[2], EASE((walkP - 0.65) / 0.35));
  const chairY = 0.12;
  return (
    <group position={c}>
      <Shell look={look} fontsReady={fontsReady} />
      {CHAIRS.map(([x, z]) => <Chair key={x} p={[x, chairY, z]} look={look} />)}
      {CHAIRS.map(([x]) => <Mirror key={x} x={x} look={look} />)}
      <Box p={[0, 0.98 + chairY, -D / 2 + 0.3]} s={[W - 0.7, 0.06, 0.3]} c={look.wood} r={0.5} />
      {lit && [-1.55, -1.45, -0.2, -0.1, 1.05, 1.18].map((x, i) => (
        <mesh key={x} position={[x, 1.16 + chairY, -D / 2 + 0.28]}>
          <cylinderGeometry args={[0.035, 0.035, 0.16 + (i % 2) * 0.06, 8]} />
          <meshStandardMaterial color={i % 3 === 0 ? "#ffb066" : "#e8e0d8"} roughness={0.3} />
        </mesh>
      ))}
      <WashBasin look={look} />
      <Bench look={look} />
      <Reception look={look} t={t} />
      <Pole lit={lit} t={t} />
      {lit ? (
        <>
          {/* barbers behind each chair */}
          {CHAIRS.map(([x, z], i) => (
            <Standing key={x} p={[x + 0.36, chairY, z + 0.62]} c={look.figure} ry={0.35} bob={Math.sin(t * 2.2 + i) * 0.01} scissors />
          ))}
          {/* clients in the chairs (chair 1 already busy at the start) */}
          {CHAIRS.map(([x, z], i) => {
            const s = i === 0 ? 1 : pop(i - 1) * (i === 2 ? 1 - leave : 1);
            return s > 0.01 ? <Seated key={x} p={[x, chairY + 0.48, z - 0.02]} look={look} s={s} /> : null;
          })}
          {seatedNew && <Seated p={[CHAIRS[2][0], chairY + 0.48, CHAIRS[2][1] - 0.02]} look={look} />}
          {walking && <Standing p={wp} c={look.figure} ry={Math.PI} bob={Math.abs(Math.sin(walkP * 18)) * 0.04} />}
          {/* client at the wash basin + two waiting on the bench */}
          {pop(2) > 0.01 && (
            <group position={[-W / 2 + 1.25, 0.5, 0.55]} scale={pop(2)} rotation={[0, 0, 0.55]}>
              <mesh><capsuleGeometry args={[0.14, 0.4, 4, 10]} /><meshStandardMaterial color={look.figure} roughness={0.55} /></mesh>
              <mesh position={[0, 0.38, 0]}><sphereGeometry args={[0.13, 14, 10]} /><meshStandardMaterial color={look.figure} roughness={0.5} /></mesh>
            </group>
          )}
          {pop(3) > 0.01 && <Standing p={[1.15, 0.2, 1.25]} c={look.figure} s={0.82 * pop(3)} ry={-Math.PI / 2} />}
          {pop(4) > 0.01 && <Standing p={[1.85, 0.2, 1.25]} c={look.figure} s={0.82 * pop(4)} ry={-Math.PI / 2} />}
          {/* warm interior light + spill on the street */}
          <pointLight position={[0, 2.0, 0.2]} intensity={14} distance={7} decay={1.4} color="#ff8a1f" />
          <pointLight position={[0.6, 0.9, 2.9]} intensity={6} distance={5.5} decay={1.5} color="#ff7a00" />
          <LightSpill t={t} />
        </>
      ) : (
        <>
          <pointLight position={[0.2, 2.7, 1.2]} intensity={4.2} distance={7} decay={1.1} color="#dfe6f0" />
          <Standing p={[-0.55, chairY, 0.95]} c={look.figure} ry={-0.9} scissors bob={Math.sin(t * 1.4) * 0.005} />
          <Clock t={t} />
        </>
      )}
    </group>
  );
};

/** Orange shop: warm glow on the sidewalk and street, hazy light volume out of the glass, beacon in the wide shots. */
const LightSpill: React.FC<{ t: number }> = ({ t }) => {
  const rad = radialTex();
  const fade = fadeTex();
  const beacon = clamp01((t - S.E15 - 0.6) / 1.6) + clamp01(1 - t / 2.4) * 0.8;
  const pulse = 0.92 + 0.08 * Math.sin(t * 2.4);
  return (
    <group>
      <mesh position={[0.3, 0.09, 3.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 6]} />
        <meshBasicMaterial map={rad} color="#ff7a00" opacity={0.75 * pulse} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[W / 2 + 1.6, 0.09, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.6, 4.5]} />
        <meshBasicMaterial map={rad} color="#ff7a00" opacity={0.45} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 1.4, 0]} >
        <boxGeometry args={[W - 0.3, 2.5, D - 0.3]} />
        <meshBasicMaterial color="#ff7a00" opacity={0.035} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {beacon > 0.001 && (
        <>
          <mesh position={[0, 14, 0]}>
            <cylinderGeometry args={[3.2, 1.1, 28, 32, 1, true]} />
            <meshBasicMaterial map={fade} color="#ff7a00" opacity={0.16 * beacon} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
          <sprite position={[0, 1.5, 0]} scale={[14, 14, 1]}>
            <spriteMaterial map={rad} color="#ff7a00" opacity={0.5 * beacon} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </>
      )}
    </group>
  );
};
