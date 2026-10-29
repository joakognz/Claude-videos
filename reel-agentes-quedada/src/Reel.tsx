import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { camAt } from "./camera";
import { C, FPS, S, windowed } from "./theme";
import { World3D } from "./world/World3D";
import { Captions, TopShade } from "./components/Captions";
import { Hud } from "./components/Hud";
import { CommentCTA, EndCard } from "./components/Finale";

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  // the plaza darkens and defocuses behind the comment bar
  const cta = windowed(t, S.E11, 99, 0.6, 0.1);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ filter: cta > 0.02 ? `blur(${cta * 2}px) brightness(${1 - 0.35 * cta})` : undefined }}>
        <World3D />
      </AbsoluteFill>
      <TopShade />
      <AbsoluteFill style={{ opacity: 1 - 0.6 * cta }}>
        <Hud t={t} cam={cam} />
      </AbsoluteFill>
      <Captions t={t} />
      <CommentCTA t={t} />
      <EndCard t={t} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
