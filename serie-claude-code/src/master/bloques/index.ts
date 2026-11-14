import type React from "react";
import type { Evento, Linea } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";
import { Analogia, eventosAnalogia } from "./Analogia";
import { Conseguir, eventosConseguir } from "./Conseguir";
import { Cta, eventosCta } from "./Cta";
import { Ide, eventosIde } from "./Ide";
import { Intro, eventosIntro } from "./Intro";
import { Proximo, eventosProximo } from "./Proximo";
import { PushPull, eventosPushPull } from "./PushPull";
import { Contenido, eventosContenido } from "./ep05/Contenido";
import { Init, eventosInit } from "./ep05/Init";
import { Memoria, eventosMemoria } from "./ep05/Memoria";
import { Pasos, eventosPasos } from "./ep05/Pasos";
import { Abiertas, eventosAbiertas } from "./ep05/Abiertas";
import { Avance, eventosAvance } from "./ep05/Avance";
import { CtaDrive, eventosCtaDrive } from "./ep05/CtaDrive";
import { Entrevista, eventosEntrevista } from "./ep05/Entrevista";
import { Resultado, eventosResultado } from "./ep05/Resultado";
import { Resumen, eventosResumen } from "./ep05/Resumen";
import { Rondas, eventosRondas } from "./ep05/Rondas";
import { Vacia, eventosVacia } from "./ep05/Vacia";

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
  // EP.5
  memoria: { Componente: Memoria, eventos: eventosMemoria },
  contenido: { Componente: Contenido, eventos: eventosContenido },
  init: { Componente: Init, eventos: eventosInit },
  pasos: { Componente: Pasos, eventos: eventosPasos },
  vacia: { Componente: Vacia, eventos: eventosVacia },
  entrevista: { Componente: Entrevista, eventos: eventosEntrevista },
  rondas: { Componente: Rondas, eventos: eventosRondas },
  abiertas: { Componente: Abiertas, eventos: eventosAbiertas },
  resultado: { Componente: Resultado, eventos: eventosResultado },
  resumen: { Componente: Resumen, eventos: eventosResumen },
  ctaDrive: { Componente: CtaDrive, eventos: eventosCtaDrive },
  avance: { Componente: Avance, eventos: eventosAvance },
};
