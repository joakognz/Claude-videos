import type React from "react";
import type { Evento, Linea } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";
import { Analogia, eventosAnalogia } from "./Analogia";
import { Conseguir, eventosConseguir } from "./Conseguir";
import { Cta, eventosCta } from "./Cta";
import { Ide, eventosIde } from "./Ide";
import { Intro, eventosIntro } from "./Intro";
import { Cierre, eventosCierre } from "./Cierre";
import { Miedo, eventosMiedo } from "./Miedo";
import { Paso5, eventosPaso5 } from "./Paso5";
import { Pasos12, eventosPasos12 } from "./Pasos12";
import { Pasos34, eventosPasos34 } from "./Pasos34";
import { Porque, eventosPorque } from "./Porque";
import { Proximo, eventosProximo } from "./Proximo";
import { PushPull, eventosPushPull } from "./PushPull";
import { Tarea, eventosTarea } from "./Tarea";

export type DefBloque = { Componente: React.FC<BloqueProps>; eventos: (L: Linea, ep: EpisodioMaster) => Evento[] };

/** Tipos de bloque disponibles para "bloques[].tipo" en el JSON del episodio. */
export const BLOQUES: Record<string, DefBloque> = {
  intro: { Componente: Intro, eventos: eventosIntro },
  conseguir: { Componente: Conseguir, eventos: eventosConseguir },
  ide: { Componente: Ide, eventos: eventosIde },
  analogia: { Componente: Analogia, eventos: eventosAnalogia },
  pushpull: { Componente: PushPull, eventos: eventosPushPull },
  proximo: { Componente: Proximo, eventos: eventosProximo },
  cta: { Componente: Cta, eventos: eventosCta },
  // EP.7
  miedo: { Componente: Miedo, eventos: eventosMiedo },
  pasos12: { Componente: Pasos12, eventos: eventosPasos12 },
  pasos34: { Componente: Pasos34, eventos: eventosPasos34 },
  paso5: { Componente: Paso5, eventos: eventosPaso5 },
  porque: { Componente: Porque, eventos: eventosPorque },
  tarea: { Componente: Tarea, eventos: eventosTarea },
  cierre: { Componente: Cierre, eventos: eventosCierre },
};
