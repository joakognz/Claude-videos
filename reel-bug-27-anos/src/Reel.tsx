import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { camAt } from "./camera";
import { C, EV, FPS, TL, windowed } from "./theme";
import { World3D } from "./world/World3D";
import { Captions, TopShade } from "./components/Captions";
import { Hud } from "./components/Hud";
import { CommentCTA, EndCard } from "./components/Finale";

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  // the plaza darkens for the CTA, with a touch of defocus behind the comment bar
  const cta = windowed(t, TL.cta.comenta - 0.2, 99, 0.5, 0.1);
  const dark = windowed(t, EV.dark, 99, 0.6, 0.1);
  return (
    <AbsoluteFill style={{ backgroundColor: C.sea }}>
      <AbsoluteFill style={{ filter: cta > 0.02 ? `blur(${cta * 1.5}px)` : undefined }}>
        <World3D />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.ink, opacity: 0.35 * dark }} />
      <TopShade />
      <Hud t={t} cam={cam} />
      <Captions t={t} />
      <CommentCTA t={t} />
      <EndCard t={t} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
