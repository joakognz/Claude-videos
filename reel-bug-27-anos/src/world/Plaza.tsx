import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C, EV, clamp01, rand } from "../theme";
import { pavingTex, radialTex } from "./textures";

const N_LIGHTS = 900;

// far-off city lights on the ground all round the plaza (log-radial, so the aerial opening has them too)
const LIGHTS = Array.from({ length: N_LIGHTS }, (_, i) => {
  const r = 6.6 * Math.exp(rand(i + 1) * Math.log(170 / 6.6));
  const a = rand(i + 2) * Math.PI * 2;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, px: 2 + rand(i + 3) * 4, ph: rand(i + 4) * 20, sp: 0.3 + rand(i + 5) * 1.2, warm: rand(i + 6) };
});

const tmp = new THREE.Object3D();

const FarLights: React.FC<{ t: number; zoom: number }> = ({ t, zoom }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.orangeSoft).multiplyScalar(1.3), map: radialTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  useLayoutEffect(() => {
    const m = ref.current!;
    LIGHTS.forEach((g, i) => {
      tmp.position.set(g.x, 0.02, g.z);
      const tw = 0.4 + 0.6 * Math.max(0, Math.sin(t * g.sp * 2.2 + g.ph)) ** 2;
      const s = (g.px * (0.6 + 0.6 * g.warm) * tw) / zoom;
      tmp.rotation.set(-Math.PI / 2, 0, 0);
      tmp.scale.set(s * 1.6, s * 1.6, 1);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N_LIGHTS]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
};

const LAMPS: [number, number][] = [[-5.2, 5.2], [5.2, 5.2], [5.2, -5.2], [-5.2, -5.2], [-1.6, 6.4], [1.6, 6.4], [6.4, 1.2], [6.4, -2.4]];

/** Plaza lamps: thin posts with a cream glow; they dim when the scene darkens for the CTA. */
const Lamps: React.FC<{ t: number }> = ({ t }) => {
  const post = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2f27", roughness: 0.8 }), []);
  const head = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.cream).multiplyScalar(1.4), toneMapped: false }), []);
  const pool = useMemo(() => new THREE.MeshBasicMaterial({ color: "#4a3626", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const dark = 1 - 0.7 * clamp01((t - EV.dark) / 0.6);
  head.color.set(C.cream).multiplyScalar(1.4 * dark);
  pool.opacity = dark;
  return (
    <>
      {LAMPS.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh material={post} position={[0, 0.6, 0]}><cylinderGeometry args={[0.035, 0.05, 1.2, 6]} /></mesh>
          <mesh material={head} position={[0, 1.24, 0]}><sphereGeometry args={[0.09, 8, 6]} /></mesh>
          <mesh material={pool} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.2, 3.2]} /></mesh>
        </group>
      ))}
    </>
  );
};

const N_MOTES = 220;
const MOTES = Array.from({ length: N_MOTES }, (_, i) => ({
  x: (rand(i + 100) - 0.5) * 16, y: rand(i + 200) * 6, z: (rand(i + 300) - 0.5) * 16, sp: 0.12 + rand(i + 400) * 0.25,
  ph: rand(i + 500) * 30, s: 0.025 + rand(i + 600) * 0.035,
}));

/** Warm dust motes drifting up through the night air (keeps the locked frame alive). */
const Motes: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.orangeSoft).multiplyScalar(1.2), map: radialTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  useLayoutEffect(() => {
    const m = ref.current!;
    MOTES.forEach((d, i) => {
      const y = (d.y + t * d.sp) % 6;
      tmp.position.set(d.x + Math.sin(t * 0.7 + d.ph) * 0.4, y, d.z + Math.cos(t * 0.5 + d.ph) * 0.4);
      const fade = Math.sin((Math.PI * y) / 6) * (0.6 + 0.4 * Math.sin(t * 3 + d.ph));
      tmp.rotation.set(-0.6, Math.PI / 4, 0, "YXZ");
      tmp.scale.setScalar(d.s * 4 * Math.max(0.05, fade));
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N_MOTES]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
};

export const Plaza: React.FC<{ t: number; zoom: number }> = ({ t, zoom }) => {
  const tex = useMemo(() => {
    const x = pavingTex();
    x.repeat.set(120, 120);
    return x;
  }, []);
  return (
    <>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[480, 480]} />
        <meshStandardMaterial map={tex} roughness={0.95} />
      </mesh>
      <FarLights t={t} zoom={zoom} />
      <Lamps t={t} />
      <Motes t={t} />
    </>
  );
};
