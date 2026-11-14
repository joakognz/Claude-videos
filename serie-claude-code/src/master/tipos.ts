import type { Evento, Linea, Palabra } from "./nucleo";

/** Clave de un logo en "logos" del JSON (claude, claude_code, vscode, git, npm, astro…). */
export type LogoId = string;

export type EpisodioMaster = {
  composicion: "Master";
  serie: string;
  episodio: number;
  total: number;
  titulo?: string;
  handle: string;
  voz: { audio: string; timestamps?: string; palabras?: Palabra[] };
  musica?: { audio: string; db?: number; duckingDb?: number };
  cta: {
    tipo: "auditoria" | "drive";
    pregunta: string;
    palabra_clave: string;
    texto: string;
    recurso?: string;
    /** sello que cae cuando la voz dice `en` */
    sello?: { texto: string; en: string };
    /** frase final bajo el sello (palabra a palabra desde `en`) */
    remate?: { texto: string; en: string };
    /** palabra de la voz con la que se pulsa «Seguir» */
    seguir?: string;
  };
  siguiente_episodio: number;
  /** avance del episodio siguiente (EP.5 en adelante) */
  avance?: { titulo: string; subtitulo: string };
  /** barra de progreso del vídeo bajo la insignia */
  progreso?: boolean;
  proximo?: { titulo: string; en: string; detalle?: { texto: string; en: string }[]; logos?: { id: LogoId; en: string }[] }[];
  logos: Record<LogoId, string>;
  clips?: Record<string, { src: string; ancho: number; alto: number; recorteArriba?: number }>;
  escenas: { id: string; voz: string }[];
  bloques: { tipo: string; desde: string }[];
  estilo?: Record<string, string>;
  /** lo calcula calculateMetadata */
  calc?: Calculo;
};

export type Calculo = {
  duracion: number;
  frames: number;
  palabras: Palabra[];
  /** cortes entre bloques (segundos): bloque i va de cortes[i] a cortes[i + 1] */
  cortes: number[];
  musica: number[];
  eventos: Evento[];
};

/** Lo que recibe cada bloque. t es el tiempo global del reel (segundos). */
export type BloqueProps = {
  /** tiempo global del reel (s) */
  t: number;
  /** tiempo global del primer fotograma de la secuencia del bloque (para colocar vídeos con <Sequence>) */
  t0: number;
  ep: EpisodioMaster;
  L: Linea;
  /** corte de entrada y de salida del bloque (s) */
  desde: number;
  hasta: number;
  /** ids de las escenas del bloque */
  escenas: string[];
};
