import type { Evento, Linea, Palabra } from "./nucleo";

export type LogoId = "claude" | "claude_code" | "claude_code_texto" | "vscode" | "word" | "drive" | "github" | "microsoft" | "aws" | "youtube" | "whatsapp" | "nodejs" | "hostinger" | "liveserver";

export type EpisodioMaster = {
  composicion: "Master";
  serie: string;
  episodio: number;
  total: number;
  /** episodios en varias partes: parte N de M */
  parte?: number;
  partes?: number;
  titulo?: string;
  handle: string;
  voz: { audio: string; timestamps?: string; palabras?: Palabra[] };
  musica?: { audio: string; db?: number; duckingDb?: number };
  cta: {
    tipo: "auditoria" | "drive" | "auditoria_drive";
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
  /** lo que se anuncia al final: la parte siguiente o el próximo episodio */
  avance?: { tipo: "parte" | "episodio"; frase: string; titulo: string; cierre: string; episodio?: number };
  siguiente_episodio: number;
  proximo?: { titulo: string; en: string; detalle?: { texto: string; en: string }[]; logos?: { id: LogoId; en: string }[] }[];
  logos: Record<LogoId, string>;
  /** pasos de un tutorial: sello «PASO N» al empezar la escena y tick al decir `fin.en` */
  pasos?: { n: number; escena: string; fin: { escena: string; en: string } }[];
  clips?: Record<string, { src: string; ancho: number; alto: number; recorteArriba?: number }>;
  escenas: { id: string; voz: string }[];
  /** bloques temáticos; `n` y `titulo` para los sellos «BLOQUE N» */
  bloques: { tipo: string; desde: string; n?: number; titulo?: string }[];
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
