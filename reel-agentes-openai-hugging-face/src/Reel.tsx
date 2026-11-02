import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { camAt } from "./camera";
import { C, EV, FPS, S, TL, rand, windowed } from "./theme";
import { World3D } from "./world/World3D";
import { Captions, TopShade } from "./components/Captions";
import { Hud } from "./components/Hud";
import { CommentCTA, EndCard } from "./components/Finale";

/** "Ojo": the picture slips out of register for a moment (no red, no alarms: a glitch and a dip). */
const glitchAt = (t: number) => {
  const d = t - (EV.ojo - 0.05);
  if (d < 0 || d > 0.34) return 0;
  return rand(Math.floor(t * 30) + 7) > 0.35 ? 1 : 0.3;
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  // a touch of defocus behind the comment bar
  const cta = windowed(t, TL.cta.comenta - 0.2, 99, 0.5, 0.1);
  // the caveat (E9) dims the world so the claims read
  const dim = windowed(t, S.E9, S.E10, 0.35, 0.5) * 0.45;
  const g = glitchAt(t);
  const shift = g ? (rand(Math.floor(t * 30)) - 0.5) * 40 * g : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.sea }}>
      <AbsoluteFill style={{ filter: cta > 0.02 ? `blur(${cta * 1.5}px)` : g ? `brightness(${1 + 0.4 * g})` : undefined, translate: `${shift}px 0px` }}>
        <World3D />
      </AbsoluteFill>
      {g > 0 && (
        <AbsoluteFill style={{ opacity: 0.55 * g, translate: `${-shift * 1.6}px 0px`, mixBlendMode: "screen" }}>
          {/* torn bands: a few horizontal slices of light out of step */}
          {[0, 1, 2, 3].map((k) => (
            <div key={k} style={{
              position: "absolute", left: 0, right: 0, top: 600 + rand(Math.floor(t * 30) + k * 13) * 900, height: 6 + rand(k + Math.floor(t * 30)) * 30,
              background: `rgba(255,176,102,${0.25 + 0.3 * rand(k * 3 + Math.floor(t * 30))})`,
            }} />
          ))}
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: C.sea, opacity: dim }} />
      <TopShade />
      <Hud t={t} cam={cam} />
      <Captions t={t} />
      <CommentCTA t={t} />
      <EndCard t={t} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
