/** Voz, música con ducking (regla 9) y efectos en su fotograma (golpe y tick de los pasos, entradas, pops, tecleo). */
import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile } from "remotion";
import type { Episodio, Plan } from "../tipos";

export const Sonido: React.FC<{ ep: Episodio; plan: Plan }> = ({ ep, plan }) => {
  const fps = plan.fps;
  const vol = plan.musica;
  return (
    <>
      <Audio src={staticFile(ep.voz.audio)} />
      {ep.musica && vol.length > 0 && (
        <Audio src={staticFile(ep.musica.audio)} loop loopVolumeCurveBehavior="extend" volume={(f) => vol[Math.min(vol.length - 1, Math.max(0, f))]} />
      )}
      {plan.eventos.map((ev, i) => {
        const dur = ev.dur ?? 2.5;
        return (
          <Sequence key={i} from={Math.round(ev.t * fps)} durationInFrames={Math.max(1, Math.round(Math.min(dur, plan.duracion - ev.t) * fps))} layout="none">
            <Audio src={staticFile(`audio/sfx/${ev.sfx}.wav`)} volume={ev.vol} loop={ev.sfx === "tecleo"} />
          </Sequence>
        );
      })}
    </>
  );
};
