/** Voz, música con ducking (regla 9) y efectos en su fotograma. */
import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile } from "remotion";
import { FPS } from "../nucleo";
import type { Calculo, EpisodioMaster } from "../tipos";

export const Sonido: React.FC<{ ep: EpisodioMaster; calc: Calculo }> = ({ ep, calc }) => {
  const vol = calc.musica;
  return (
    <>
      <Audio src={staticFile(ep.voz.audio)} />
      {ep.musica && vol.length > 0 && (
        <Audio src={staticFile(ep.musica.audio)} loop loopVolumeCurveBehavior="extend" volume={(f) => vol[Math.min(vol.length - 1, Math.max(0, f))]} />
      )}
      {calc.eventos.map((ev, i) => {
        const dur = ev.dur ?? 1.2;
        return (
          <Sequence key={i} from={Math.round(ev.t * FPS)} durationInFrames={Math.max(1, Math.round(Math.min(dur, calc.duracion - ev.t) * FPS))} layout="none">
            <Audio src={staticFile(`audio/sfx/${ev.sfx}.wav`)} volume={ev.vol} loop={ev.sfx === "tecleo"} />
          </Sequence>
        );
      })}
    </>
  );
};

/** Envolvente de la música: nivel `db` (respecto a la voz) y `duck` dB más bajo mientras hay voz. */
export const envolventeMusica = (pal: { inicio: number; fin: number }[], dur: number, db: number, duck: number): number[] => {
  const n = Math.ceil(dur * FPS);
  const voz = new Array<number>(n).fill(0);
  pal.forEach((p, k) => {
    const sig = pal[k + 1];
    const fin = sig && sig.inicio - p.fin < 0.35 ? sig.inicio : p.fin + 0.12;
    for (let f = Math.floor((p.inicio - 0.08) * FPS); f < Math.ceil(fin * FPS); f++) if (f >= 0 && f < n) voz[f] = 1;
  });
  const out: number[] = [];
  let g = db;
  const att = 1 - Math.exp(-1 / (0.15 * FPS));
  const rel = 1 - Math.exp(-1 / (0.5 * FPS));
  for (let f = 0; f < n; f++) {
    const obj = db + (voz[f] ? duck : 0);
    g += (obj - g) * (obj < g ? att : rel);
    const t = f / FPS;
    const fade = Math.min(1, t / 0.6, (dur - t) / 1.2);
    out.push(Math.round(10 ** (g / 20) * Math.max(0, fade) * 10000) / 10000);
  }
  return out;
};
