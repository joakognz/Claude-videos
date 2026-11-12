import type { Evento, Linea, Palabra } from "./nucleo";

export type LogoId = "claude" | "claude_code" | "claude_code_texto" | "vscode" | "word" | "drive" | "github" | "microsoft" | "wordpress" | "nodejs" | "hostinger";

/** Un bloque del JSON: tipo, escena en la que empieza y parámetros propios (p. ej. "etapa"). */
export type DefBloqueJson = { tipo: string; desde: string; etapa?: number };

export type EpisodioMaster = {
  composicion: "Master";
  serie: string;
  episodio: number;
  total: number;
  titulo?: string;
  /** episodios en varias partes: insignia «EP.N · n/de» y «PARTE n DE de» en la intro */
  parte?: { n: number; de: number };
  /** nombre del mp4 (sin extensión); por defecto claude-code-ep-NN */
  salida?: string;
  /** barra de progreso fina arriba */
  barra_progreso?: boolean;
  /** iconos que entran en la intro (escena 2) cuando la voz los nombra */
  intro?: { iconos: { icono: string; texto: string; en: string; pequeno?: boolean }[] };
  /** avance de la parte o el episodio siguiente (bloque «avance») */
  avance?: {
    tipo: "parte" | "episodio"; parte?: number; episodio?: number; frase: string; titulo: string; icono?: string;
    puntos?: { texto: string; en: string }[];
    /** palabra (o frase) de la voz con la que cae el sello; por defecto, el número */
    en?: string;
    /** palabra con la que aparece el título; por defecto, un poco antes del primer punto */
    titulo_en?: string;
  };
  /** portada del reel (composición «Portada»): título en líneas (la última en acento), subtítulo y chips */
  portada?: { titulo: string[]; subtitulo?: string; chips?: string[] };
  /** etiqueta fija mientras la voz habla de precios (bloque «pagas») */
  precios?: { texto: string };
  /** frase de cierre junto al botón de seguir (bloque «seguir») */
  cierre?: string;
  handle: string;
  voz: { audio: string; timestamps?: string; palabras?: Palabra[] };
  musica?: { audio: string; db?: number; duckingDb?: number };
  cta: {
    tipo: "auditoria" | "drive" | "auditoria_drive";
    /** carpeta de Drive (bloque «ctaDrive»): rótulo y palabra con la que aparece */
    carpeta?: { texto: string; en: string };
    /** tarjeta con check de la auditoría (bloque «ctaDrive») */
    check?: { titulo: string; texto: string; en: string };
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
  proximo?: { titulo: string; en: string; detalle?: { texto: string; en: string }[]; logos?: { id: LogoId; en: string }[] }[];
  /** rutas en public/ (los episodios solo traen los logos que usan) */
  logos: Record<LogoId, string>;
  clips?: Record<string, { src: string; ancho: number; alto: number; recorteArriba?: number }>;
  escenas: { id: string; voz: string }[];
  bloques: DefBloqueJson[];
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
  /** el bloque tal como está en el JSON (tipo, desde y parámetros) */
  bloque: DefBloqueJson;
};
