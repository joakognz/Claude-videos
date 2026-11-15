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
import { Gancho9, eventosGancho9 } from "./ep09/Gancho9";
import { Memoria, eventosMemoria } from "./ep09/Memoria";
import { Imagen, eventosImagen } from "./ep09/Imagen";
import { Plan, eventosPlan } from "./ep09/Plan";
import { Guardado, eventosGuardado } from "./ep09/Guardado";
import { Resumen1, Resumen2, eventosResumen1, eventosResumen2 } from "./ep09/Resumen9";
import { Avance9, eventosAvance9 } from "./ep09/Avance9";
import { Gancho2, eventosGancho2 } from "./ep09/Gancho2";
import { Subagentes, eventosSubagentes } from "./ep09/Subagentes";
import { Mcp, eventosMcp } from "./ep09/Mcp";
import { Remote, eventosRemote } from "./ep09/Remote";
import { Trucos, eventosTrucos } from "./ep09/Trucos";

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
  // EP.9 · nivel experto (parte 1: las de cada día · parte 2: las potentes)
  ep9_gancho: { Componente: Gancho9, eventos: eventosGancho9 },
  ep9_memoria: { Componente: Memoria, eventos: eventosMemoria },
  ep9_imagen: { Componente: Imagen, eventos: eventosImagen },
  ep9_plan: { Componente: Plan, eventos: eventosPlan },
  ep9_guardado: { Componente: Guardado, eventos: eventosGuardado },
  ep9_resumen1: { Componente: Resumen1, eventos: eventosResumen1 },
  ep9_resumen2: { Componente: Resumen2, eventos: eventosResumen2 },
  ep9_avance: { Componente: Avance9, eventos: eventosAvance9 },
  ep9_gancho2: { Componente: Gancho2, eventos: eventosGancho2 },
  ep9_subagentes: { Componente: Subagentes, eventos: eventosSubagentes },
  ep9_mcp: { Componente: Mcp, eventos: eventosMcp },
  ep9_remote: { Componente: Remote, eventos: eventosRemote },
  ep9_trucos: { Componente: Trucos, eventos: eventosTrucos },
};
