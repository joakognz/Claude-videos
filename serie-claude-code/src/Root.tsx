import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  staticFile,
  useCurrentFrame,
} from "remotion";
import ep01 from "../episodios/ep-01.json";
import ep02 from "../episodios/ep-02.json";
import ep04p2 from "../episodios/ep-04-p2.json";
import { Portada } from "./portada/Portada";
import { Master } from "./master/Master";
import { calcularMaster } from "./master/calcular";
import type { EpisodioMaster } from "./master/tipos";
import { Episodio } from "./Episodio";
import { ClipPantalla } from "./componentes/ClipPantalla";
import type { ClipProps } from "./componentes/ClipPantalla";
import { EstiloProvider } from "./componentes/estilo";
import clipPrueba from "./pruebas/clip-prueba.json";
import { duracionAudio, leerTimestamps } from "./datos";
import { FPS, crearPlan } from "./plan";
import type { Episodio as Ep } from "./tipos";

/** Duración = duración del audio; las escenas, los planos y la mezcla salen del audio y sus timestamps. */
const calcular: CalculateMetadataFunction<Ep> = async ({ props }) => {
  const duracion = await duracionAudio(staticFile(props.voz.audio));
  let palabras = props.voz.palabras;
  if (!palabras) {
    if (!props.voz.timestamps)
      throw new Error(
        "Faltan los timestamps por palabra (voz.timestamps o voz.palabras)",
      );
    const r = await fetch(staticFile(props.voz.timestamps));
    palabras = leerTimestamps(await r.json());
  }
  const plan = crearPlan(props, palabras, duracion);
  plan.avisos.forEach((a) => console.warn(`[EP.${props.episodio}] ${a}`));
  return {
    durationInFrames: plan.frames,
    props: { ...props, plan },
    defaultOutName: `claude-code-ep-${String(props.episodio).padStart(2, "0")}`,
  };
};

/** Banco de pruebas de ClipPantalla con un clip sintético (cámara del ponente abajo a la derecha, fuera del recorte). */
const ClipDemo: React.FC<ClipProps> = (clip) => {
  const t = useCurrentFrame() / FPS;
  return (
    <EstiloProvider>
      <AbsoluteFill style={{ background: "#060606" }}>
        <ClipPantalla clip={clip} t={t} inicio={0} fin={6} fps={FPS} />
      </AbsoluteFill>
    </EstiloProvider>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Episodio"
      component={Episodio}
      durationInFrames={FPS * 60}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={ep01 as unknown as Ep}
      calculateMetadata={calcular}
    />
    {/* Plantilla de la serie desde el EP.2: intro con partículas, bloques con transición y CTA (episodios/ep-02.json) */}
    <Composition
      id="Master"
      component={Master}
      durationInFrames={FPS * 60}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={ep02 as unknown as EpisodioMaster}
      calculateMetadata={calcularMaster}
    />
    {/* Portada del reel (imagen fija 1080x1920) desde el campo "portada" del JSON: scripts/portada.mjs */}
    <Composition
      id="Portada"
      component={Portada}
      durationInFrames={1}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={ep04p2 as unknown as EpisodioMaster}
    />
    <Composition
      id="ClipPantalla"
      component={ClipDemo}
      durationInFrames={FPS * 6}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={clipPrueba as ClipProps}
    />
  </>
);
