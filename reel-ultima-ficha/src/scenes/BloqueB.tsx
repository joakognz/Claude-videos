import React from "react";
import { AbsoluteFill } from "remotion";
import { EV, FICHAS, S, ramp } from "../theme";
import { Placa } from "../components/Placa";
import { Backdrop, Grain, HudFrame, Vignette } from "../components/Hud";
import { Fichas3D } from "../components/Fichas3D";
import { GLITCH_FRAMES, escena } from "../components/escena";
import { Cotas, Tachados } from "../components/Anotaciones";
import { GlitchBlocks, GridSweep, glitchShift, sweepY } from "../components/Glitch";
import { Cadena2D } from "../components/Cadena2D";
import { CampoComentario } from "../components/CampoComentario";
import { Captions } from "../components/Captions";

const SWEEP_DUR = 0.5;
const fmtTau = (tau: number) => tau.toFixed(3).replace(".", ",");

/** Block B (frame 210 on): the voice-driven scenes 1-7. */
export const BloqueB: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const fNo = Math.round(EV.noExiste * 30);
  const fCta = Math.round(S.S7 * 30);
  const sweepEnd = EV.sweep + SWEEP_DUR;
  const sy = sweepY(t, EV.sweep, SWEEP_DUR);
  const wire = frame >= fNo;
  const st = wire && t < sweepEnd ? escena(t, frame) : null;
  return (
    <AbsoluteFill>
      {t < sweepEnd && (
        <AbsoluteFill style={{ clipPath: t >= EV.sweep ? `inset(${Math.max(0, sy)}px 0 0 0)` : undefined }}>
          <Backdrop />
          {/* S1: the held, path-traced frame 195 — exactly the countdown's last frame, untouched until «existe» */}
          {!wire && <Placa data={FICHAS} frame={FICHAS.freeze} />}
          {st && (
            <AbsoluteFill style={{ translate: `${frame - fNo < GLITCH_FRAMES ? glitchShift(frame, fNo, GLITCH_FRAMES) : 0}px 0px` }}>
              <Fichas3D s={st} />
            </AbsoluteFill>
          )}
          <Vignette />
          {/* grain and timecode stay frozen with the image until «existe»; then the render's clock runs */}
          <Grain frame={wire ? frame : FICHAS.freeze} />
          <HudFrame frame={frame} tcFrames={wire ? frame : FICHAS.freeze} tag={st ? `RENDER 3D · t ${fmtTau(st.tau)} s` : "CAM 01"}
            opacity={1 - ramp(t, EV.sweep - 0.6, EV.sweep)} />
          {/* «frene»: a scan line checks the frozen image — nothing is holding it */}
          <GridSweep t={t} at={EV.frene - 0.05} dur={0.7} />
          <Tachados t={t} />
          {st && <Cotas t={t} cam={st.cam} tilts={st.tilts} />}
        </AbsoluteFill>
      )}
      {t >= EV.sweep && (
        <AbsoluteFill style={{ clipPath: t < sweepEnd ? `inset(0 0 ${1920 - Math.max(0, sy)}px 0)` : undefined }}>
          <Cadena2D t={t} />
        </AbsoluteFill>
      )}
      <CampoComentario t={t} />
      <Captions t={t} />
      <GridSweep t={t} at={EV.sweep} dur={SWEEP_DUR} />
      <GlitchBlocks frame={frame} at={fNo} frames={GLITCH_FRAMES} />
      <GlitchBlocks frame={frame} at={fCta} frames={5} />
    </AbsoluteFill>
  );
};
