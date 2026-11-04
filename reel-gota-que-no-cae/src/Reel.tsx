import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, FPS, GOTA } from "./theme";
import timeline from "./timeline.json";
import { GotaCuentaAtras } from "./components/GotaCuentaAtras";
import { BloqueB } from "./scenes/BloqueB";
import { Cierre, crtStyle } from "./components/Cierre";

const BEATS = (timeline as unknown as { beats: number[] }).beats;

export const Reel: React.FC<{ mix?: string }> = ({ mix = "audio/mix.wav" }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: C.end }}>
      <AbsoluteFill style={{ ...crtStyle(t), backgroundColor: C.black }}>
        {/* Block A — 7 s countdown, no voice */}
        <Sequence durationInFrames={GOTA.voice} layout="none">
          <GotaCuentaAtras data={GOTA} beats={BEATS} />
        </Sequence>
        {/* Block B — the voice, from frame 210 */}
        {frame >= GOTA.voice && <BloqueB frame={frame} t={t} />}
      </AbsoluteFill>
      {/* Block C — CRT off, logo */}
      <Cierre t={t} />
      <Audio src={staticFile(mix)} />
    </AbsoluteFill>
  );
};
