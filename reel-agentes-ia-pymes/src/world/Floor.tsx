import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C, rand } from "../theme";
import { radialTex } from "./textures";

const FLOOR_Y = -0.84;
const N_DOTS = 1100;
const N_MOTES = 46;

// a wide night floor of faint lights (other businesses, far away) so the dolly-in has depth
const DOTS = Array.from({ length: N_DOTS }, (_, i) => {
  const r = 7 * Math.exp(rand(i + 1) * Math.log(150 / 7));
  const a = rand(i + 2) * Math.PI * 2;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, px: 2 + rand(i + 3) * 4, ph: rand(i + 4) * 20, sp: 0.5 + rand(i + 5) * 2, warm: rand(i + 6) > 0.8 };
});

// dust motes drifting up round the plate (keeps the locked frame alive)
const MOTES = Array.from({ length: N_MOTES }, (_, i) => ({
  a: rand(i + 50) * Math.PI * 2, r: 1.5 + rand(i + 51) * 4.2, y0: rand(i + 52) * 4, sp: 0.12 + rand(i + 53) * 0.2, ph: rand(i + 54) * 6, warm: i % 3 === 0,
}));

const tmp = new THREE.Object3D();

const Dots: React.FC<{ t: number; zoom: number; warm: boolean }> = ({ t, zoom, warm }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const list = useMemo(() => DOTS.filter((d) => d.warm === warm), [warm]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(warm ? C.orangeSoft : C.cream).multiplyScalar(warm ? 1.2 : 1.0), map: radialTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), [warm]);
  useLayoutEffect(() => {
    const m = ref.current!;
    list.forEach((d, i) => {
      tmp.position.set(d.x, FLOOR_Y + 0.01, d.z);
      const tw = 0.35 + 0.65 * Math.max(0, Math.sin(t * d.sp + d.ph)) ** 2;
      const s = (d.px * tw) / zoom;
      tmp.rotation.set(-Math.PI / 2, 0, 0);
      tmp.scale.set(s, s, 1);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, list.length]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
};

const Motes: React.FC<{ t: number; warm: boolean }> = ({ t, warm }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const list = useMemo(() => MOTES.filter((m) => m.warm === warm), [warm]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(warm ? C.orange : C.cream).multiplyScalar(warm ? 1.4 : 0.7), map: radialTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.8,
  }), [warm]);
  useLayoutEffect(() => {
    const m = ref.current!;
    list.forEach((d, i) => {
      const y = (d.y0 + t * d.sp) % 4;
      const a = d.a + t * 0.05;
      tmp.position.set(Math.cos(a) * d.r + 0.2 * Math.sin(t + d.ph), y, Math.sin(a) * d.r);
      const s = (warm ? 0.07 : 0.045) * Math.sin(Math.PI * (y / 4));
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(s, s, s);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, list.length]} material={mat} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 4]} />
    </instancedMesh>
  );
};

export const Floor: React.FC<{ t: number; zoom: number }> = ({ t, zoom }) => {
  const haze = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#3a2618", map: radialTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  return (
    <>
      <mesh position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial color={C.sea} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, FLOOR_Y + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={haze}>
        <planeGeometry args={[30, 30]} />
      </mesh>
      <Dots t={t} zoom={zoom} warm={false} />
      <Dots t={t} zoom={zoom} warm />
      <Motes t={t} warm={false} />
      <Motes t={t} warm />
    </>
  );
};
