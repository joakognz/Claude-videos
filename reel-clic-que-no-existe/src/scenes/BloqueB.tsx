import React from "react";
import { AbsoluteFill } from "remotion";
import { ENGR, EV, S, ramp } from "../theme";
import { Engranajes3D } from "../components/Engranajes3D";
import { Placa } from "../components/Placa";
import { Backdrop, Grain, HudFrame, Vignette } from "../components/Hud";
import { AnilloClic, contactPx } from "../components/EngranajesCuentaAtras";
import { GLITCH_FRAMES, wireState } from "../components/despiece";
import { Cotas, OndaClic } from "../components/Anotaciones";
import { GlitchBlocks, GridSweep, glitchShift, sweepY } from "../components/Glitch";
import { Mecanismo } from "../components/Mecanismo";
import { CampoComentario } from "../components/CampoComentario";
import { Captions } from "../components/Captions";

const SWEEP_DUR = 0.5;

/** Block B (frame 210 on): the voice-driven scenes 1-7. */
export const BloqueB: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const fNo = Math.round(EV.noExiste * 30);
  const fCta = Math.round(S.S7 * 30);
  const sweepEnd = EV.sweep + SWEEP_DUR;
  const show3D = t < sweepEnd;
  // grain is frozen with the image until «existen»; the timecode stays on the frozen frame
  const grainFrame = frame < fNo ? ENGR.freeze : frame;
  const sy = sweepY(t, EV.sweep, SWEEP_DUR);
  const st = wireState(t, frame);
  const [cx, cy] = contactPx(ENGR);
  return (
    <AbsoluteFill>
      {show3D && (
        <AbsoluteFill style={{ clipPath: t >= EV.sweep ? `inset(${Math.max(0, sy)}px 0 0 0)` : undefined }}>
          <Backdrop />
          <AbsoluteFill style={{ translate: `${glitchShift(frame, fNo, GLITCH_FRAMES)}px 0px` }}>
            {/* the held, path-traced frame 195 until «existen» (and on the glitch's "solid" frames) */}
            {st.solid > 0.5 && <Placa data={ENGR} frame={ENGR.freeze} />}
            {t >= EV.noExiste - 0.3 && <Engranajes3D s={st} />}
          </AbsoluteFill>
          <Vignette />
          <Grain frame={grainFrame} />
          <HudFrame frame={frame} tcFrames={ENGR.freeze} tag={frame >= fNo ? "RENDER 3D" : "CAM 01"} opacity={1 - ramp(t, EV.sweep - 0.6, EV.sweep)} />
          {/* «¿Has oído ese clic? [·]»: the click again, from where the teeth touch */}
          <AnilloClic x={cx} y={cy} t={t - EV.clicEcho} strong={0.7} />
          {/* «mentira»: a scan line checks the image */}
          <GridSweep t={t} at={EV.scan - 0.08} dur={0.7} />
          <Cotas t={t} s={st} cam={st.cam} />
          <OndaClic t={t} />
        </AbsoluteFill>
      )}
      {t >= EV.sweep && (
        <AbsoluteFill style={{ clipPath: t < sweepEnd ? `inset(0 0 ${1920 - Math.max(0, sy)}px 0)` : undefined }}>
          <Mecanismo t={t} />
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
