/** Reel de la serie «Máster de Claude Code»: bloques temáticos con transición, subtítulos, insignia, marca de agua y sonido. */
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { BLOQUES } from "./bloques";
import { Insignia, MarcaAgua } from "./componentes/Insignia";
import { Sonido } from "./componentes/Sonido";
import { Subtitulos, VeloSuperior, trocear } from "./componentes/Subtitulos";
import { C, FPS, crearLinea } from "./nucleo";
import { avance } from "./transicion";
import type { EpisodioMaster } from "./tipos";

export const TRANS = 20; // fotogramas de cada transición entre bloques (0,67 s)

export const Master: React.FC<EpisodioMaster> = (ep) => {
  const frame = useCurrentFrame();
  const calc = ep.calc!;
  const L = useMemo(() => crearLinea(calc.palabras, calc.duracion), [calc]);
  const subs = useMemo(() => trocear(calc.palabras), [calc]);
  const t = frame / FPS;
  const cortesF = calc.cortes.map((c) => Math.round(c * FPS));
  const n = ep.bloques.length;
  const escenasDe = (i: number) => {
    const a = ep.escenas.findIndex((e) => e.id === ep.bloques[i].desde);
    const b = i + 1 < n ? ep.escenas.findIndex((e) => e.id === ep.bloques[i + 1].desde) : ep.escenas.length;
    return ep.escenas.slice(a, b).map((e) => e.id);
  };
  const finIntro = (cortesF[1] ?? Math.round(3.7 * FPS)) / FPS;
  const ultimo = calc.frames;
  return (
    <AbsoluteFill style={{ background: C.fondo }}>
      <TransitionSeries>
        {ep.bloques.flatMap((b, i) => {
          const B = BLOQUES[b.tipo];
          if (!B) throw new Error(`Tipo de bloque desconocido: ${b.tipo}`);
          // el bloque i se ve de su corte - T/2 al siguiente corte + T/2 (la transición queda centrada en el corte)
          const ini = i === 0 ? 0 : cortesF[i] - TRANS / 2;
          const fin = i === n - 1 ? ultimo : cortesF[i + 1] + TRANS / 2;
          const t0 = ini / FPS;
          const items = [
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={fin - ini}>
              <Contenido B={B.Componente} t0={t0} ep={ep} L={L} desde={cortesF[i] / FPS} hasta={i === n - 1 ? calc.duracion : cortesF[i + 1] / FPS} escenas={escenasDe(i)} />
            </TransitionSeries.Sequence>,
          ];
          if (i < n - 1)
            items.push(
              <TransitionSeries.Transition key={`t${i}`} presentation={avance()} timing={linearTiming({ durationInFrames: TRANS, easing: Easing.bezier(0.45, 0, 0.55, 1) })} />,
            );
          return items;
        })}
      </TransitionSeries>
      <VeloSuperior />
      <Subtitulos bloques={subs} t={t} />
      <Insignia t={t} at={finIntro - 0.5} episodio={ep.episodio} total={ep.total} />
      <MarcaAgua handle={ep.handle} />
      <AbsoluteFill style={{ background: C.fondo, opacity: Math.max(0, (t - (calc.duracion - 0.5)) / 0.5) }} />
      <Sonido ep={ep} calc={calc} />
    </AbsoluteFill>
  );
};

/** Pasa a cada bloque el tiempo global del reel (t0 + fotograma local). */
const Contenido: React.FC<{
  B: React.FC<import("./tipos").BloqueProps>;
  t0: number;
  ep: EpisodioMaster;
  L: ReturnType<typeof crearLinea>;
  desde: number;
  hasta: number;
  escenas: string[];
}> = ({ B, t0, ep, L, desde, hasta, escenas }) => {
  const f = useCurrentFrame();
  return <B t={t0 + f / FPS} t0={t0} ep={ep} L={L} desde={desde} hasta={hasta} escenas={escenas} />;
};
