import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { LOCAL_YAW, camAt } from "../camera";
import { C, FPS, S, act, beat, clamp01 } from "../theme";
import { Human, Orbs } from "./Agents";
import { MOTES, moteClock } from "./layout";
import { Furniture, Platform } from "./Office";
import { Plaza } from "./Plaza";

const DIST = 160;

/** Places the orthographic camera from the shared camera path (same maths as the HTML overlays). */
const Rig: React.FC<{ t: number }> = ({ t }) => {
  const camera = useThree((s) => s.camera);
  const cam = camAt(t);
  camera.position.set(cam.T[0] + cam.d[0] * DIST, cam.T[1] + cam.d[1] * DIST, cam.T[2] + cam.d[2] * DIST);
  camera.up.set(0, 1, 0);
  camera.lookAt(cam.T[0], cam.T[1], cam.T[2]);
  camera.zoom = cam.zoom;
  camera.updateProjectionMatrix();
  return null;
};

/** Specks of light rising around the office: lazy before the drop, three times faster after it. */
const Motes: React.FC<{ t: number }> = ({ t }) => {
  const ref = React.useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(C.orangeSoft).multiplyScalar(1.4), toneMapped: false, transparent: true }), []);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const tc = moteClock(t);
  mat.opacity = 0.35 + 0.45 * act(t);
  React.useLayoutEffect(() => {
    const m = ref.current!;
    MOTES.forEach((mo, i) => {
      const y = ((mo.ph + tc * mo.sp) % 1) * 6;
      tmp.position.set(mo.x + Math.sin(tc * 3 + i) * 0.2, 0.3 + y, mo.z);
      const s = mo.s * Math.sin(Math.PI * (y / 6)) * (1 + 0.6 * beat(t));
      tmp.scale.set(s, s, s);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MOTES.length]} material={mat} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
    </instancedMesh>
  );
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const a = act(t);
  const cta = clamp01((t - S.E11) / 0.6);
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[C.bg]} />
      <hemisphereLight args={["#b59c86", "#0e0b09", 0.9 + 0.35 * a]} />
      <directionalLight position={[-5, 14, 8]} intensity={0.75 + 0.2 * a} color="#e8d6c4" />
      <directionalLight position={[9, 5, -4]} intensity={0.18} color="#c9a88c" />
      <Plaza t={t} />
      <Platform t={t} />
      <group rotation={[0, LOCAL_YAW, 0]}>
        <Furniture t={t} />
        <Human t={t} />
        <Orbs t={t} />
        <Motes t={t} />
      </group>
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={(0.85 + 0.45 * a + 0.4 * beat(t)) * (1 - 0.35 * cta)} luminanceThreshold={0.75} luminanceSmoothing={0.2} radius={0.7} />
        <Vignette offset={0.3} darkness={0.6 + 0.15 * cta} />
      </EffectComposer>
    </>
  );
};

/** Waits for the fonts before mounting the canvas. */
export const World3D: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    document.fonts.ready.then(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  if (!ready) return null;
  return (
    <ThreeCanvas width={1080} height={1920} orthographic camera={{ position: [DIST, DIST, DIST], zoom: 50, near: 1, far: 600 }} gl={{ antialias: true }}>
      <Scene />
    </ThreeCanvas>
  );
};
