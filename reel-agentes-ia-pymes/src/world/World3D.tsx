import React from "react";
import { useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { PLATE_YAW, camAt } from "../camera";
import { C, FPS } from "../theme";
import { Agent } from "./Agent";
import { Business } from "./Business";
import { Floor } from "./Floor";

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

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[C.sea]} />
      <hemisphereLight args={["#b59c86", "#0e0b09", 1.2]} />
      <directionalLight position={[-5, 14, 8]} intensity={0.95} color="#e8d6c4" />
      <directionalLight position={[9, 5, -4]} intensity={0.2} color="#c9a88c" />
      <Floor t={t} zoom={cam.zoom} />
      <group rotation={[0, PLATE_YAW, 0]}>
        <Business t={t} />
        <Agent t={t} />
      </group>
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.8} luminanceSmoothing={0.2} radius={0.7} />
        <Vignette offset={0.3} darkness={0.6} />
      </EffectComposer>
    </>
  );
};

export const World3D: React.FC = () => (
  <ThreeCanvas width={1080} height={1920} orthographic camera={{ position: [DIST, DIST, DIST], zoom: 50, near: 1, far: 600 }} gl={{ antialias: true }}>
    <Scene />
  </ThreeCanvas>
);
