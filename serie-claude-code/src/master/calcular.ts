/** calculateMetadata: duración = audio; cortes entre bloques, música con ducking y efectos, todo desde los timestamps. */
import type { CalculateMetadataFunction } from "remotion";
import { staticFile } from "remotion";
import { duracionAudio, leerTimestamps } from "../datos";
import { BLOQUES } from "./bloques";
import { eventosPasos } from "./componentes/PasosHud";
import { envolventeMusica } from "./componentes/Sonido";
import { FPS, crearLinea } from "./nucleo";
import type { Evento, Palabra } from "./nucleo";
import type { EpisodioMaster } from "./tipos";

export const calcularMaster: CalculateMetadataFunction<EpisodioMaster> = async ({ props }) => {
  const duracion = await duracionAudio(staticFile(props.voz.audio));
  let palabras = props.voz.palabras as Palabra[] | undefined;
  if (!palabras) {
    if (!props.voz.timestamps) throw new Error("Faltan los timestamps por palabra (voz.timestamps o voz.palabras)");
    const r = await fetch(staticFile(props.voz.timestamps));
    palabras = leerTimestamps(await r.json()) as Palabra[];
  }
  palabras = [...palabras].sort((a, b) => a.inicio - b.inicio);
  const L = crearLinea(palabras, duracion);
  // corte entre bloques: a mitad de la pausa entre la última palabra de un bloque y la primera del siguiente
  const cortes = props.bloques.map((b, i) => {
    if (i === 0) return 0;
    const k = props.escenas.findIndex((e) => e.id === b.desde);
    const fin = L.fin(props.escenas[k - 1].id);
    return (fin + L.ini(b.desde)) / 2;
  });
  const eventos: Evento[] = [];
  props.bloques.forEach((b, i) => {
    const B = BLOQUES[b.tipo];
    if (!B) throw new Error(`Tipo de bloque desconocido: ${b.tipo}`);
    eventos.push(...B.eventos(L, props));
    if (i > 0) eventos.push({ t: cortes[i] - 0.3, sfx: "whoosh", vol: 0.28 });
  });
  eventos.push(...eventosPasos(L, props));
  const mus = props.musica;
  const frames = Math.ceil(duracion * FPS);
  return {
    durationInFrames: frames,
    props: {
      ...props,
      calc: {
        duracion,
        frames,
        palabras,
        cortes,
        musica: mus ? envolventeMusica(palabras, duracion, mus.db ?? -20, mus.duckingDb ?? -8) : [],
        eventos: eventos.filter((e) => e.t >= 0 && e.t < duracion).sort((a, b) => a.t - b.t),
      },
    },
    defaultOutName: `claude-code-ep-${String(props.episodio).padStart(2, "0")}${props.parte ? `-p${props.parte}` : ""}`,
  };
};
