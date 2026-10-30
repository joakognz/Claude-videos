import React, { useEffect, useState } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { V3, camAt } from "../camera";
import { C, EV, FPS, MONO, S, TITLE, clamp01, springAt } from "../theme";
import { Lantern, LightArm, jitter } from "./Claudius";
import { CLAUDIUS, SHOULDER } from "./layout";
import { Plaza, plazaDim } from "./Plaza";
import { Contract, Deal, HAND_TARGET, HumanPictogram, Lens, Modules, Rails, SkipRing, handReach } from "./Props";
import { Shop } from "./Shop";

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

/** Claudius' state over the reel: idle hover, a glitchy tremble while it fails, steady and brighter in phase 2. */
const ClaudiusRig: React.FC<{ t: number }> = ({ t }) => {
  const appear = springAt(t, 1.4, 11, 150);
  // trembles while the account glitches (E4) and while it claims to be human (E5)
  const shakeAmp = (t > EV.glitch && t < EV.dissolve + 0.2 ? 0.05 : 0) + (t > EV.humanFull - 0.2 && t < S.E6 ? 0.06 : 0);
  const j = shakeAmp > 0 ? jitter(t, 3, shakeAmp) : ([0, 0, 0] as V3);
  // dims when the business dies (E2) and when Anthropic would not hire it (E6)
  const dimE2 = t > EV.chartOff && t < S.E3 + 0.3 ? 0.45 * (1 - clamp01((t - S.E3) / 0.3)) : 0;
  const dimE6 = t > EV.docAway && t < S.E7 + 0.3 ? 0.4 * clamp01((t - EV.docAway) / 0.6) * (1 - clamp01((t - S.E7) / 0.3)) : 0;
  const flick = t > EV.glitch && t < EV.dissolve + 0.2 && Math.floor(t * 20) % 5 === 0 ? 0.5 : 1;
  const glow = (1 - dimE2 - dimE6) * flick * (t > S.E7 ? 1.15 : 1) * (1 - 0.35 * plazaDim(t));
  const bob = 0.05 * Math.sin(t * 2.2);
  const shoulder: V3 = [SHOULDER[0], SHOULDER[1] + bob, SHOULDER[2]];
  const hand = handReach(t);
  return (
    <>
      <group position={[CLAUDIUS[0] + j[0], CLAUDIUS[1] + bob + j[1], CLAUDIUS[2] + j[2]]} scale={Math.max(0.01, appear)}>
        <Lantern t={t} glow={glow} scale={1.35} />
      </group>
      {t > EV.reach && hand.o > 0 && <LightArm a={shoulder} b={HAND_TARGET} p={hand.p} t={t} opacity={hand.o} />}
    </>
  );
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  const dim = plazaDim(t);
  const tools = Math.max(0, 1 - Math.abs(t - EV.tools - 0.4) / 0.6);
  return (
    <>
      <Rig t={t} />
      <color attach="background" args={[C.bg]} />
      <hemisphereLight args={["#b59c86", "#0e0b09", 1.1 * (1 - 0.5 * dim)]} />
      <directionalLight position={[-5, 14, 8]} intensity={0.75 * (1 - 0.5 * dim)} color="#e8d6c4" />
      <directionalLight position={[9, 5, -4]} intensity={0.16} color="#c9a88c" />
      <Plaza t={t} dim={dim} />
      <Shop t={t} dim={dim} />
      <ClaudiusRig t={t} />
      <HumanPictogram t={t} />
      <Contract t={t} cam={cam} />
      <SkipRing t={t} />
      <Modules t={t} tools={tools} />
      <Deal t={t} cam={cam} />
      <Rails t={t} />
      <Lens t={t} />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.0} luminanceThreshold={0.8} luminanceSmoothing={0.2} radius={0.7} />
        <Vignette offset={0.3} darkness={0.6} />
      </EffectComposer>
    </>
  );
};

/** Waits for the fonts before mounting the canvas, so the contract textures are drawn with them. */
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
