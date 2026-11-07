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
import { Avance, eventosAvance } from "./Avance";
import { Carpeta, eventosCarpeta } from "./Carpeta";
import { CtaDrive, eventosCtaDrive } from "./CtaDrive";
import { Hecho, eventosHecho } from "./Hecho";
import { Hoy, eventosHoy } from "./Hoy";
import { Resumen, eventosResumen } from "./Resumen";
import { Seguir, eventosSeguir } from "./Seguir";
import { Tabla, eventosTabla } from "./Tabla";
import { Vive, eventosVive } from "./Vive";

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
  hoy: { Componente: Hoy, eventos: eventosHoy },
  carpeta: { Componente: Carpeta, eventos: eventosCarpeta },
  hecho: { Componente: Hecho, eventos: eventosHecho },
  vive: { Componente: Vive, eventos: eventosVive },
  tabla: { Componente: Tabla, eventos: eventosTabla },
  resumen: { Componente: Resumen, eventos: eventosResumen },
  ctadrive: { Componente: CtaDrive, eventos: eventosCtaDrive },
  avance: { Componente: Avance, eventos: eventosAvance },
  seguir: { Componente: Seguir, eventos: eventosSeguir },
};
