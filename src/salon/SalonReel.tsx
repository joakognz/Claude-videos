import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../reel/anim";
import { cameraTravel } from "../reel/camera";
import { fontFamily } from "../reel/fonts";
import { Headlines } from "../reel/Headline";
import { MotionBlur } from "../reel/MotionBlur";
import { AgentPanel, BrandTools, ClientMessage, FinalAnswer, SalonComment, salonDim, WebCard } from "./Overlays";
import { SalonWorld, SOLVE } from "./Salon";
import { A, camera, CUES, CUTS, LABELS } from "./timeline";

const SHUTTER = 1.0;

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
      <WebCard t={t} />
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
  const uiN = motionBlur ? 8 : 1;
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
    </AbsoluteFill>
  );
};
