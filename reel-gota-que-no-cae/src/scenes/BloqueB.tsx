import React from "react";
import { AbsoluteFill } from "remotion";
import { EV, GOTA, S, ramp } from "../theme";
import { Gota3D } from "../components/Gota3D";
import { Placa } from "../components/Placa";
import { Grain, HudFrame, Vignette } from "../components/Hud";
import { GLITCH_FRAMES, wireState } from "../components/estado";
import { Cota, Llamadas, Tachados } from "../components/Anotaciones";
import { GlitchBlocks, GridSweep, glitchShift, sweepY } from "../components/Glitch";
import { Tuberia } from "../components/Tuberia";
import { CampoComentario } from "../components/CampoComentario";
import { Captions } from "../components/Captions";

const SWEEP_DUR = 0.5;

/** Block B (frame 210 on): the voice-driven scenes 1–7. */
export const BloqueB: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const fNo = Math.round(EV.noExiste * 30);
  const fCta = Math.round(S.S7 * 30);
  const sweepEnd = EV.sweep + SWEEP_DUR;
  const show3D = t < sweepEnd;
  // the grain stays frozen with the image until «existe»; the timecode stays on the frozen frame
  const grainFrame = frame < fNo ? GOTA.freeze : frame;
  const sy = sweepY(t, EV.sweep, SWEEP_DUR);
  const st = wireState(t, frame);
  return (
    <AbsoluteFill>
      {show3D && (
        <AbsoluteFill style={{ clipPath: t >= EV.sweep ? `inset(${Math.max(0, sy)}px 0 0 0)` : undefined }}>
          <AbsoluteFill style={{ backgroundColor: "#050505" }} />
          <AbsoluteFill style={{ translate: `${glitchShift(frame, fNo, GLITCH_FRAMES)}px 0px` }}>
            {/* the held, path-traced frame 195 until «existe» (and on the glitch's "solid" frames) */}
            {st.solid > 0.5 && <Placa data={GOTA} frame={GOTA.freeze} />}
            {t >= EV.noExiste - 0.3 && <Gota3D s={st} />}
          </AbsoluteFill>
          <Vignette strength={0.5} />
          <Grain frame={grainFrame} />
          <HudFrame frame={frame} tcFrames={GOTA.freeze} tag={frame >= fNo ? "RENDER 3D" : "CAM 01 · 888 FPS"} opacity={1 - ramp(t, EV.sweep - 0.6, EV.sweep)} />
          <Cota t={t} />
          <Tachados t={t} cam={st.cam} />
          <Llamadas t={t} s={st} />
        </AbsoluteFill>
      )}
      {t >= EV.sweep && (
        <AbsoluteFill style={{ clipPath: t < sweepEnd ? `inset(0 0 ${1920 - Math.max(0, sy)}px 0)` : undefined }}>
          <Tuberia t={t} />
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
