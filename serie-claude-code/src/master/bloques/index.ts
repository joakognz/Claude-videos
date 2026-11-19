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
import { Avance, eventosAvance } from "./ep08/Avance";
import { Cta8, eventosCta8 } from "./ep08/Cta8";
import { Cuenta, eventosCuenta } from "./ep08/Cuenta";
import { Esperar, eventosEsperar } from "./ep08/Esperar";
import { Gancho, eventosGancho } from "./ep08/Gancho";
import { Lia, eventosLia } from "./ep08/Lia";
import { Resumen, eventosResumen } from "./ep08/Resumen";
import { Status, eventosStatus } from "./ep08/Status";
import { Tienda, eventosTienda } from "./ep08/Tienda";
import { Intro12, eventosIntro12 } from "./ep12/Intro12";

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
  // EP.8 · errores típicos y troubleshooting
  ep8_gancho: { Componente: Gancho, eventos: eventosGancho },
  ep8_tienda: { Componente: Tienda, eventos: eventosTienda },
  ep8_cuenta: { Componente: Cuenta, eventos: eventosCuenta },
  ep8_esperar: { Componente: Esperar, eventos: eventosEsperar },
  ep8_status: { Componente: Status, eventos: eventosStatus },
  ep8_lia: { Componente: Lia, eventos: eventosLia },
  ep8_resumen: { Componente: Resumen, eventos: eventosResumen },
  ep8_cta: { Componente: Cta8, eventos: eventosCta8 },
  ep8_avance: { Componente: Avance, eventos: eventosAvance },
  // EP.12 · Computer Use (intro nueva: el navegador trabaja solo)
  ep12_intro: { Componente: Intro12, eventos: eventosIntro12 },
};
