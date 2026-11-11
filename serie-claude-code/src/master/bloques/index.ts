import type React from "react";
import type { Evento, Linea } from "../nucleo";
import type { BloqueProps, DefBloqueJson, EpisodioMaster } from "../tipos";
import { Analogia, eventosAnalogia } from "./Analogia";
import { Avance, eventosAvance } from "./Avance";
import { CtaDrive, eventosCtaDrive } from "./CtaDrive";
import { EscaleraBloque, eventosEscalera } from "./EscaleraBloque";
import { Etapa, eventosEtapa } from "./Etapa";
import { Meta, eventosMeta } from "./Meta";
import { Resumen, eventosResumen } from "./Resumen";
import { Seguir, eventosSeguir } from "./Seguir";
import { Sistema, eventosSistema } from "./Sistema";
import { Conseguir, eventosConseguir } from "./Conseguir";
import { Cta, eventosCta } from "./Cta";
import { Ide, eventosIde } from "./Ide";
import { Intro, eventosIntro } from "./Intro";
import { Proximo, eventosProximo } from "./Proximo";
import { PushPull, eventosPushPull } from "./PushPull";

export type DefBloque = { Componente: React.FC<BloqueProps>; eventos: (L: Linea, ep: EpisodioMaster, bloque: DefBloqueJson, escenas: string[]) => Evento[] };

/** Tipos de bloque disponibles para "bloques[].tipo" en el JSON del episodio. */
export const BLOQUES: Record<string, DefBloque> = {
  intro: { Componente: Intro, eventos: eventosIntro },
  conseguir: { Componente: Conseguir, eventos: eventosConseguir },
  ide: { Componente: Ide, eventos: eventosIde },
  analogia: { Componente: Analogia, eventos: eventosAnalogia },
  pushpull: { Componente: PushPull, eventos: eventosPushPull },
  proximo: { Componente: Proximo, eventos: eventosProximo },
  cta: { Componente: Cta, eventos: eventosCta },
  // EP.4 en adelante (episodios en partes)
  meta: { Componente: Meta, eventos: eventosMeta },
  sistema: { Componente: Sistema, eventos: eventosSistema },
  escalera: { Componente: EscaleraBloque, eventos: eventosEscalera },
  etapa: { Componente: Etapa, eventos: eventosEtapa },
  resumen: { Componente: Resumen, eventos: eventosResumen },
  ctaDrive: { Componente: CtaDrive, eventos: eventosCtaDrive },
  avance: { Componente: Avance, eventos: eventosAvance },
  seguir: { Componente: Seguir, eventos: eventosSeguir },
};
