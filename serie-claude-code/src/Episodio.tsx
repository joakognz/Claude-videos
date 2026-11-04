import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Escena } from "./componentes/Escena";
import { EstiloProvider } from "./componentes/estilo";
import { Insignia, MarcaAgua, Rotulo } from "./componentes/Insignia";
import { Sellos, sacudida } from "./componentes/Sello";
import { Sonido } from "./componentes/Sonido";
import { SUB_Y, Subtitulos, VeloSuperior } from "./componentes/Subtitulos";
import type { Episodio as Ep } from "./tipos";

/** Un episodio completo a partir de su JSON (el plan lo añade calculateMetadata). */
export const Episodio: React.FC<Ep> = (ep) => {
  const frame = useCurrentFrame();
  const plan = ep.plan;
  if (!plan) return null;
  const t = frame / plan.fps;
  const pasos = plan.escenas.filter((e) => e.paso).map((e) => e.paso!);
  const sh = sacudida(pasos, t);
  const cta = plan.escenas[plan.escenas.length - 1];
  return (
    <EstiloProvider estilo={ep.estilo}>
      <AbsoluteFill style={{ background: "#000" }}>
        <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
          <Escena plan={plan} ep={ep} t={t} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 62% at 50% 52%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
        <VeloSuperior />
        <Insignia episodio={ep.episodio} serie={ep.serie} total={ep.total_episodios} />
        <Subtitulos chunks={plan.subtitulos} t={t} />
        <Rotulo escenas={plan.escenas} t={t} y={SUB_Y + 196} />
        <AbsoluteFill style={{ translate: `${sh.x * 0.5}px ${sh.y * 0.5}px` }}>
          <Sellos escenas={plan.escenas} t={t} hasta={cta.inicio} />
        </AbsoluteFill>
        <MarcaAgua usuario={ep.usuario} />
        <Sonido ep={ep} plan={plan} />
      </AbsoluteFill>
    </EstiloProvider>
  );
};
