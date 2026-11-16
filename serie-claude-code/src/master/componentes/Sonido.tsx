/**
 * Voz, música con ducking (regla 9) y efectos en su fotograma.
 * Efectos: si el episodio trae cues (EP.11 en adelante), suenan los archivos reales de la librería del usuario
 * (public/sfx/, copiados por scripts/sonidos.mjs); si no, los sintéticos de los primeros episodios.
 */
import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, interpolate, staticFile } from "remotion";
import { FPS } from "../nucleo";
import type { Cue, Sfx } from "../nucleo";
import type { Calculo, EpisodioMaster } from "../tipos";

/** Tipos nuevos sin versión sintética: suenan con el sintético más parecido (solo episodios sin librería). */
const SINTETICO: Record<Sfx, string> = {
  golpe: "golpe", tick: "tick", whoosh: "whoosh", pop: "pop", tecleo: "tecleo", envio: "envio",
  zoom: "whoosh", ventana: "tick", check: "envio", glitch: "tick", foto: "golpe", error: "tick", revelacion: "golpe",
};

const Efecto: React.FC<{ c: Cue; duracion: number }> = ({ c, duracion }) => {
  const from = Math.round(c.inicio * FPS);
  const frames = Math.max(1, Math.min(Math.ceil(c.dur * FPS), Math.ceil(duracion * FPS) - from));
  const fade = Math.max(1, Math.round(c.fundido * FPS));
  // fundido de entrada corto en los tramos de tecleo (empiezan a mitad de archivo) y de salida si se corta
  const vol = (f: number) =>
    c.fundido > 0
      ? c.vol * Math.min(interpolate(f, [0, c.tipo === "tecleo" ? 3 : 0.01], [c.tipo === "tecleo" ? 0 : 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), interpolate(f, [frames - fade, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
      : c.vol;
  return (
    <Sequence from={from} durationInFrames={frames} layout="none">
      <Audio src={staticFile(`sfx/${c.archivo}`)} trimBefore={c.desde > 0 ? Math.round(c.desde * FPS) : undefined} volume={vol} />
    </Sequence>
  );
};

export const Sonido: React.FC<{ ep: EpisodioMaster; calc: Calculo }> = ({ ep, calc }) => {
  const vol = calc.musica;
  return (
    <>
      <Audio src={staticFile(ep.voz.audio)} />
      {ep.musica && vol.length > 0 && (
        <Audio src={staticFile(ep.musica.audio)} loop loopVolumeCurveBehavior="extend" volume={(f) => vol[Math.min(vol.length - 1, Math.max(0, f))]} />
      )}
      {calc.cues
        ? calc.cues.map((c, i) => <Efecto key={i} c={c} duracion={calc.duracion} />)
        : calc.eventos.map((ev, i) => {
            const dur = ev.dur ?? 1.2;
            const sfx = SINTETICO[ev.sfx];
            return (
              <Sequence key={i} from={Math.round(ev.t * FPS)} durationInFrames={Math.max(1, Math.round(Math.min(dur, calc.duracion - ev.t) * FPS))} layout="none">
                <Audio src={staticFile(`audio/sfx/${sfx}.wav`)} volume={ev.vol} loop={sfx === "tecleo"} />
              </Sequence>
            );
          })}
    </>
  );
};

/**
 * Envolvente de la música: nivel `db` (respecto a la voz) y `duck` dB más bajo mientras hay voz.
 * `fuertes`: instantes de efectos fuertes (golpes, woosh, revelaciones): la música baja 4 dB más un momento.
 */
export const envolventeMusica = (pal: { inicio: number; fin: number }[], dur: number, db: number, duck: number, fuertes: number[] = []): number[] => {
  const n = Math.ceil(dur * FPS);
  const voz = new Array<number>(n).fill(0);
  pal.forEach((p, k) => {
    const sig = pal[k + 1];
    const fin = sig && sig.inicio - p.fin < 0.35 ? sig.inicio : p.fin + 0.12;
    for (let f = Math.floor((p.inicio - 0.08) * FPS); f < Math.ceil(fin * FPS); f++) if (f >= 0 && f < n) voz[f] = 1;
  });
  const golpe = new Array<number>(n).fill(0);
  fuertes.forEach((t) => {
    for (let f = Math.floor((t - 0.1) * FPS); f < Math.ceil((t + 0.45) * FPS); f++) if (f >= 0 && f < n) golpe[f] = 1;
  });
  const out: number[] = [];
  let g = db;
  const att = 1 - Math.exp(-1 / (0.15 * FPS));
  const rel = 1 - Math.exp(-1 / (0.5 * FPS));
  for (let f = 0; f < n; f++) {
    const obj = db + (voz[f] ? duck : 0) + (golpe[f] ? -4 : 0);
    g += (obj - g) * (obj < g ? att : rel);
    const t = f / FPS;
    const fade = Math.min(1, t / 0.6, (dur - t) / 1.2);
    out.push(Math.round(10 ** (g / 20) * Math.max(0, fade) * 10000) / 10000);
  }
  return out;
};
