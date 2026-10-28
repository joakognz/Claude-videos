import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { camAt } from "./camera";
import { EV, FPS, S, clamp01, windowed } from "./theme";
import { World3D } from "./world/World3D";
import { Captions } from "./components/Captions";
import { Progress, TopShade } from "./components/Chrome";
import { Hud } from "./components/Hud";
import { Phone } from "./components/Phone";
import { CommentCTA, EndCard, PointsCard } from "./components/Finale";

/** Defocus + dim of the 3D world behind the phone, the points card, the travel to the grey shop and the CTA. */
const worldGrade = (t: number) => {
  const phone = windowed(t, S.E5 - 0.05, EV.phoneOut + 0.35, 0.45, 0.4);
  const card = windowed(t, EV.card - 0.1, S.E12 + 0.35, 0.4, 0.5);
  const travel = Math.sin(Math.PI * clamp01((t - S.E12 - 0.1) / (S.E13 - S.E12 + 0.1)));
  const cta = windowed(t, S.E16 - 0.2, S.END + 1, 0.6, 0.1);
  return {
    blur: Math.max(phone * 9, card * 10, travel * 7, cta * 4),
    dim: Math.max(phone * 0.42, card * 0.45, travel * 0.15, cta * 0.4),
  };
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  const g = worldGrade(t);
  return (
    <AbsoluteFill style={{ backgroundColor: "#050506" }}>
      <AbsoluteFill style={{ filter: g.blur > 0.05 ? `blur(${g.blur}px)` : undefined }}>
        <World3D />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: g.dim }} />
      <TopShade />
      <Hud t={t} cam={cam} />
      <Phone t={t} />
      <PointsCard t={t} />
      <Captions t={t} />
      <Progress t={t} />
      <CommentCTA t={t} />
      <EndCard t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - clamp01(t / 0.35) }} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
