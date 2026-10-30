import React, { useEffect, useState } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { FRONT_YAW, camAt } from "../camera";
import { C, EASE, EV, FPS, MONO, S, TITLE, clamp01 } from "../theme";
import { Plaza, plazaDim } from "./Plaza";
import { Stage } from "./Stage";

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

/** E8 dims everything ("una afirmación"), E9 brings the light back; E11 darkens for the call to action. */
export const sceneDim = (t: number) =>
  Math.max(0.55 * EASE(clamp01((t - EV.dim) / 0.5)) * (1 - EASE(clamp01((t - S.E9) / 0.5))), plazaDim(t));

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const dim = sceneDim(t);
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[C.bg]} />
      <hemisphereLight args={["#b59c86", "#0e0b09", 1.1 * (1 - 0.5 * dim)]} />
      <directionalLight position={[-5, 14, 8]} intensity={0.75 * (1 - 0.5 * dim)} color="#e8d6c4" />
      <directionalLight position={[9, 5, -4]} intensity={0.16} color="#c9a88c" />
      <Plaza t={t} dim={dim} />
      <group rotation={[0, FRONT_YAW, 0]}>
        <Stage t={t} dim={dim} />
      </group>
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.0} luminanceThreshold={0.8} luminanceSmoothing={0.2} radius={0.7} />
        <Vignette offset={0.3} darkness={0.6} />
      </EffectComposer>
    </>
  );
};

/** Waits for the fonts before mounting the canvas, so the canvas textures are drawn with them. */
export const World3D: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all([document.fonts.load(`800 100px "${TITLE}"`), document.fonts.load(`700 40px "${MONO}"`)]).then(() => setReady(true));
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
