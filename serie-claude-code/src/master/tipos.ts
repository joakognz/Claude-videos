import type { Evento, Linea, Palabra } from "./nucleo";

/** Logos de public/logos/ (ver public/logos/_LEEME_LOGOS.md). Cada episodio declara en su JSON los que usa. */
export type LogoId =
  | "claude" | "claude_code" | "claude_code_texto" | "vscode" | "word" | "drive" | "github" | "microsoft" | "anthropic"
  | "github_circulo" | "github_texto" | "github_copilot" | "github_copilot_texto" | "git" | "npm" | "whatsapp"
  | "gemini" | "gemini_icono" | "openai_codex" | "openai_codex_app" | "nextjs" | "nextjs_texto" | "vite" | "tailwind"
  | "vercel" | "netlify" | "cloudflare_pages" | "n8n" | "php" | "astro" | "aws" | "nodejs" | "live_server" | "youtube"
  | "wordpress" | "chrome" | "google_cloud" | "gmail" | "aigencyx" | "aigencyx_naranja" | "aigencyx_claro"
  | "aigencyx_naranja_grande" | "hostinger" | "make" | "make_icono" | "google_sheets" | "google_sheets_icono" | "mcp" | "airtable";

export type EpisodioMaster = {
  composicion: "Master";
  serie: string;
  episodio: number;
  total: number;
  titulo?: string;
  handle: string;
  voz: { audio: string; timestamps?: string; palabras?: Palabra[] };
  musica?: { audio: string; db?: number; duckingDb?: number; subida?: { desde: string; hasta: string; db: number } };
  /** "libreria": efectos de la librería del usuario (public/sfx) en vez de los de la plantilla */
  sonidos?: "plantilla" | "libreria";
  /** barra de progreso arriba */
  progreso?: boolean;
  /** carpeta de public/episodios y nombre de salida cuando hay otra versión del episodio */
  carpeta?: string;
  cta: {
    tipo: "auditoria" | "drive" | "votacion";
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
  logos: Record<LogoId, string>;
  /** imágenes adjuntas que no son logos (ilustraciones, fotos de ejemplo) */
  imagenes?: Record<string, string>;
  /** tarjeta del próximo episodio cuando el avance va al final (EP.8 en adelante) */
  avance?: { titulo: string; subtitulo?: string };
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
