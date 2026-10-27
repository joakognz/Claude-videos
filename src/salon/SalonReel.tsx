import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../reel/anim";
import { cameraTravel } from "../reel/camera";
import { fontFamily } from "../reel/fonts";
import { Headlines } from "../reel/Headline";
import { MotionBlur } from "../reel/MotionBlur";
import { AgentPanel, BrandTools, ClientMessage, FinalAnswer, SalonComment, salonDim } from "./Overlays";
import { SalonWorld, SOLVE } from "./Salon";
import { A, camera, CLOSE, CUES, CUTS, LABELS } from "./timeline";

const SHUTTER = 1.0;

/** Ventanas con movimiento rápido de interfaz: más submuestras de desenfoque. */
const UI_FAST: [number, number][] = [
  ...CUES.flatMap((c) => [[c.start - 0.03, 0.3], [c.end - 0.17, 0.2]] as [number, number][]),
  [A.clienta, 0.45], [A.tardas + 0.2, 1.4], [A.agente - 0.1, 0.8], [A.agenda, 0.5], [A.confirma, 0.4],
  [A.otrahora, 0.4], [A.cambia, 0.5], [A.aigencyx - 0.2, 0.5], [A.herramientas, 0.8], [A.comenta, 0.6],
  [A.auditoriaEnd, 0.6], [A.sigue, 0.7], [A.estavez, 0.4], [CLOSE - 0.1, 0.5],
];
const uiSamples = (t: number) => (UI_FAST.some(([a, d]) => t >= a - 0.05 && t <= a + d) ? 20 : 8);

const WorldLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#06070A" }}>
      <SalonWorld t={frame / fps} />
    </AbsoluteFill>
  );
};

const UILayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ fontFamily, fontFeatureSettings: '"cv08" 1' }}>
      <ClientMessage t={t} />
      <AgentPanel t={t} />
      <BrandTools t={t} />
      <SalonComment t={t} />
      <FinalAnswer t={t} />
      <Headlines t={t} cues={CUES} labels={LABELS} eyebrow={[A.lee, A.peinando]} accent={SOLVE} />
    </AbsoluteFill>
  );
};

const TiltShift: React.FC = () => (
  <>
    {[
      { top: 0, height: 820, dir: "180deg", hard: "35%" },
      { bottom: 0, height: 760, dir: "0deg", hard: "30%" },
    ].map(({ dir, hard, ...pos }) => (
      <div
        key={dir}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          ...pos,
          backdropFilter: "blur(9px)",
          WebkitMaskImage: `linear-gradient(${dir}, black 0%, black ${hard}, transparent 100%)`,
          maskImage: `linear-gradient(${dir}, black 0%, black ${hard}, transparent 100%)`,
        }}
      />
    ))}
  </>
);

export const SalonReel: React.FC<{ motionBlur?: boolean }> = ({ motionBlur = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const travel = cameraTravel(camera, t, fps, SHUTTER);
  const worldN = motionBlur ? (travel < 0.3 ? 1 : clamp(Math.ceil(travel / 2.5), 4, 20)) : 1;
  const uiN = motionBlur ? uiSamples(t) : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: "#06070A", overflow: "hidden" }}>
      <AbsoluteFill style={{ isolation: "isolate" }}>
        <MotionBlur samples={worldN} shutter={SHUTTER}>
          <WorldLayer />
        </MotionBlur>
        <TiltShift />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#06070A", opacity: salonDim(t) }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 65% at 50% 55%, transparent 55%, rgba(3,4,6,0.75) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,6,8,0.88) 0%, rgba(5,6,8,0.55) 22%, rgba(5,6,8,0) 38%)" }} />
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: Math.max(0, ...CUTS.map((c) => 0.22 * (1 - clamp(Math.abs(t - c) / 0.13)))) }} />
      <MotionBlur samples={uiN} shutter={SHUTTER}>
        <UILayer />
      </MotionBlur>
      <Audio src={staticFile("voz_peluqueria_corta.mp3")} />
    </AbsoluteFill>
  );
};
