import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { camAt } from "./camera";
import { C, FPS, TL, windowed } from "./theme";
import { World3D } from "./world/World3D";
import { Captions, TopShade } from "./components/Captions";
import { Hud } from "./components/Hud";
import { CommentCTA, EndCard } from "./components/Finale";

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  // a touch of defocus behind the comment bar
  const cta = windowed(t, TL.cta.comenta - 0.2, 99, 0.5, 0.1);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ filter: cta > 0.02 ? `blur(${cta * 1.5}px)` : undefined }}>
        <World3D />
      </AbsoluteFill>
      <TopShade />
      <Hud t={t} cam={cam} />
      <Captions t={t} />
      <CommentCTA t={t} />
      <EndCard t={t} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
