import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, ENGR, FPS } from "./theme";
import { EngranajesCuentaAtras } from "./components/EngranajesCuentaAtras";
import { BloqueB } from "./scenes/BloqueB";
import { BloqueC, crtStyle } from "./scenes/BloqueC";

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: C.end }}>
      <AbsoluteFill style={{ ...crtStyle(t), backgroundColor: C.black }}>
        {/* Block A — 7 s countdown, no voice */}
        <Sequence durationInFrames={ENGR.voice} layout="none">
          <EngranajesCuentaAtras data={ENGR} hudTag="CAM 01" label="ENCAJE EN" doneLabel="ENCAJADO" />
        </Sequence>
        {/* Block B — the voice, from frame 210 */}
        {frame >= ENGR.voice && <BloqueB frame={frame} t={t} />}
      </AbsoluteFill>
      {/* Block C — CRT off, logo */}
      <BloqueC t={t} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
