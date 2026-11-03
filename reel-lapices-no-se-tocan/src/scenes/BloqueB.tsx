import React from "react";
import { AbsoluteFill } from "remotion";
import { EV, LAPIZ, S, ramp } from "../theme";
import { Lapices3D } from "../components/Lapices3D";
import { Backdrop, Grain, HudFrame, Vignette } from "../components/Hud";
import { EtiquetasTachadas } from "../components/MallaTrazada";
import { GLITCH_FRAMES, wireframeState } from "../components/Wireframe";
import { GlitchBlocks, GridSweep, glitchShift, sweepY } from "../components/Glitch";
import { ApuntesAutomaticos } from "../components/ApuntesAutomaticos";
import { CampoComentario } from "../components/CampoComentario";
import { Captions } from "../components/Captions";

const SWEEP_DUR = 0.5;

/** Block B (frame 210 on): the voice-driven scenes 1-7. */
export const BloqueB: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const fNo = Math.round(EV.noExiste * 30);
  const fCta = Math.round(S.S7 * 30);
  const sweepEnd = EV.sweep + SWEEP_DUR;
  const show3D = t < sweepEnd;
  // the timecode stays frozen on 00:00:06:15 until "Y tú…", then runs on from there
  const fResume = Math.round(EV.tcResume * 30);
  const tc = frame < fResume ? LAPIZ.freeze : LAPIZ.freeze + (frame - fResume);
  // grain is frozen with the image until «existe»
  const grainFrame = frame < fNo ? LAPIZ.freeze : frame;
  const sy = sweepY(t, EV.sweep, SWEEP_DUR);
  return (
    <AbsoluteFill>
      {show3D && (
        <AbsoluteFill style={{ clipPath: t >= EV.sweep ? `inset(${Math.max(0, sy)}px 0 0 0)` : undefined }}>
          <Backdrop />
          <AbsoluteFill style={{ translate: `${glitchShift(frame, fNo, GLITCH_FRAMES)}px 0px` }}>
            <Lapices3D s={wireframeState(t, frame)} />
          </AbsoluteFill>
          <Vignette />
          <Grain frame={grainFrame} />
          <HudFrame frame={frame} tcFrames={tc} tag="CAM 01" opacity={1 - ramp(t, S.S5 + 1.5, EV.sweep)} />
          <EtiquetasTachadas t={t} />
        </AbsoluteFill>
      )}
      {t >= EV.sweep && (
        <AbsoluteFill style={{ clipPath: t < sweepEnd ? `inset(0 0 ${1920 - Math.max(0, sy)}px 0)` : undefined }}>
          <ApuntesAutomaticos t={t} />
        </AbsoluteFill>
      )}
      <CampoComentario t={t} />
      <Captions t={t} />
      <GridSweep t={t} at={S.S3} dur={0.45} />
      <GridSweep t={t} at={EV.sweep} dur={SWEEP_DUR} />
      <GlitchBlocks frame={frame} at={fNo} frames={GLITCH_FRAMES} />
      <GlitchBlocks frame={frame} at={fCta} frames={5} />
    </AbsoluteFill>
  );
};
