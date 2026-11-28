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
import { Avance12, eventosAvance12 } from "./ep12/Avance12";
import { Clave, eventosClave } from "./ep12/Clave";
import { Ejemplo, eventosEjemplo } from "./ep12/Ejemplo";
import { Final, eventosFinal } from "./ep12/Final";
import { Intro12, eventosIntro12 } from "./ep12/Intro12";
import { Plan, eventosPlan } from "./ep12/Plan";
import { Preparar, eventosPreparar } from "./ep12/Preparar";
import { Que, eventosQue } from "./ep12/Que";
import { Trabaja, eventosTrabaja } from "./ep12/Trabaja";
import { Avance13, eventosAvance13 } from "./ep13/Avance13";
import { Caminos13, eventosCaminos13 } from "./ep13/Caminos13";
import { Gancho13, eventosGancho13 } from "./ep13/Gancho13";
import { Auto13, Medida13, Web13, eventosAuto13, eventosMedida13, eventosWeb13 } from "./ep13/Opciones13";
import { Repaso13, eventosRepaso13 } from "./ep13/Repaso13";
import { Voto13, eventosVoto13 } from "./ep13/Voto13";

import { Cifras13b, Gracias13b, Titulo13b, eventosCifras13b, eventosGracias13b, eventosTitulo13b } from "./ep13b/Apertura13b";
import { Final13b, Plazo13b, Votar13b, eventosFinal13b, eventosPlazo13b, eventosVotar13b } from "./ep13b/Final13b";
import { Detras13b, Repaso13b, eventosDetras13b, eventosRepaso13b } from "./ep13b/Modulo13b";
import { Agradecer13b, Cinco13b, Opcion13b, eventosAgradecer13b, eventosCinco13b, eventosOpcion13b } from "./ep13b/Opciones13b";

export type DefBloque = { Componente: React.FC<BloqueProps>; eventos: (L: Linea, ep: EpisodioMaster, desde: string) => Evento[] };

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
  ep12_que: { Componente: Que, eventos: eventosQue },
  ep12_ejemplo: { Componente: Ejemplo, eventos: eventosEjemplo },
  ep12_preparar: { Componente: Preparar, eventos: eventosPreparar },
  ep12_plan: { Componente: Plan, eventos: eventosPlan },
  ep12_trabaja: { Componente: Trabaja, eventos: eventosTrabaja },
  ep12_clave: { Componente: Clave, eventos: eventosClave },
  ep12_final: { Componente: Final, eventos: eventosFinal },
  ep12_avance: { Componente: Avance12, eventos: eventosAvance12 },
  // EP.13 · cierre del módulo 1 y votación
  ep13_gancho: { Componente: Gancho13, eventos: eventosGancho13 },
  ep13_repaso: { Componente: Repaso13, eventos: eventosRepaso13 },
  ep13_caminos: { Componente: Caminos13, eventos: eventosCaminos13 },
  ep13_web: { Componente: Web13, eventos: eventosWeb13 },
  ep13_auto: { Componente: Auto13, eventos: eventosAuto13 },
  ep13_medida: { Componente: Medida13, eventos: eventosMedida13 },
  ep13_voto: { Componente: Voto13, eventos: eventosVoto13 },
  ep13_avance: { Componente: Avance13, eventos: eventosAvance13 },
  // EP.13 v2 · gracias, cifras reales, cierre del módulo 1 y votación entre cinco opciones (sonidos de la librería)
  ep13b_gracias: { Componente: Gracias13b, eventos: eventosGracias13b },
  ep13b_cifras: { Componente: Cifras13b, eventos: eventosCifras13b },
  ep13b_titulo: { Componente: Titulo13b, eventos: eventosTitulo13b },
  ep13b_detras: { Componente: Detras13b, eventos: eventosDetras13b },
  ep13b_repaso: { Componente: Repaso13b, eventos: eventosRepaso13b },
  ep13b_agradecer: { Componente: Agradecer13b, eventos: eventosAgradecer13b },
  ep13b_cinco: { Componente: Cinco13b, eventos: eventosCinco13b },
  ep13b_opcion: { Componente: Opcion13b, eventos: (L, _ep, desde) => eventosOpcion13b(L, desde) },
  ep13b_votar: { Componente: Votar13b, eventos: eventosVotar13b },
  ep13b_plazo: { Componente: Plazo13b, eventos: eventosPlazo13b },
  ep13b_final: { Componente: Final13b, eventos: eventosFinal13b },
};
