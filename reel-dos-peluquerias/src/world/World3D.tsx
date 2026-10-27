import React, { useEffect, useState } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Bloom, DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import { camAt, GREY_C, ORANGE_C } from "../camera";
import { COND, FPS } from "../theme";
import { City } from "./City";
import { Shop } from "./Shop";

const DIST = 120;

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

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", DIST + 14, DIST + 70]} />
      <hemisphereLight args={["#6a7a9c", "#0c0c0e", 1.7]} />
      <directionalLight position={[6, 14, 9]} intensity={0.85} color="#a9bbdd" />
      <directionalLight position={[-8, 6, 3]} intensity={0.12} color="#6f7fa0" />
      <City t={t} zoom={cam.zoom} />
      <Shop variant="grey" c={GREY_C} t={t} fontsReady />
      <Shop variant="orange" c={ORANGE_C} t={t} fontsReady />
      <EffectComposer multisampling={4}>
        <DepthOfField worldFocusDistance={DIST} worldFocusRange={3.5} bokehScale={4} resolutionScale={0.5} />
        <Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.82} luminanceSmoothing={0.2} radius={0.72} />
        <Vignette offset={0.32} darkness={0.55} />
      </EffectComposer>
    </>
  );
};

/** Waits for the sign font before mounting the canvas, so the sign textures are drawn with it. */
export const World3D: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("sign font"));
  useEffect(() => {
    document.fonts.load(`800 100px "${COND}"`).then(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  if (!ready) return null;
  return (
  <ThreeCanvas width={1080} height={1920} orthographic camera={{ position: [DIST, DIST, DIST], zoom: 50, near: 1, far: 400 }} gl={{ antialias: true }}>
    <Scene />
  </ThreeCanvas>
  );
};
