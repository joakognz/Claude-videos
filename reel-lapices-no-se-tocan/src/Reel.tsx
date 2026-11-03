import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, FPS, LAPIZ } from "./theme";
import { LapicesCuentaAtras } from "./components/LapicesCuentaAtras";
import { BloqueB } from "./scenes/BloqueB";
import { BloqueC, crtStyle } from "./scenes/BloqueC";

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: C.end }}>
      <AbsoluteFill style={{ ...crtStyle(t), backgroundColor: C.black }}>
        {/* Block A — 7 s countdown, no voice */}
        <Sequence durationInFrames={LAPIZ.voice} layout="none">
          <LapicesCuentaAtras data={LAPIZ} hudTag="CAM 01" label="CUENTA ATRÁS" />
        </Sequence>
        {/* Block B — the voice, from frame 210 */}
        {frame >= LAPIZ.voice && <BloqueB frame={frame} t={t} />}
      </AbsoluteFill>
      {/* Block C — CRT off, logo */}
      <BloqueC t={t} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
