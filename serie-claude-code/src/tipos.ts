/** Lo que entra: un JSON por episodio (episodios/ep-NN.json). */

/** Un ancla temporal: una palabra o frase de la voz («misma herramienta») o segundos desde el inicio de la escena. */
export type Ancla = string | number;

export type Palabra = { texto: string; inicio: number; fin: number; escena?: string };

export type EtiquetaSpec = {
  texto: string;
  /** id de un elemento de la imagen (nodo del mapa, tarjeta, línea…) */
  apunta: string;
  en?: Ancla;
  lado?: "arriba" | "abajo" | "izquierda" | "derecha";
};

/** Una cifra o un dato: siempre con su fuente (regla 7). */
export type DatoSpec = { valor: string; texto?: string; fuente: string; en?: Ancla };

// ── imágenes (tipos de plano) ─────────────────────────────────────────────────────────────────────────────────────
export type NodoMapa = {
  id: string;
  titulo: string;
  etiqueta?: string;
  en?: Ancla;
  destacado?: boolean;
  hijos?: NodoMapa[];
  etiquetaHijos?: { texto: string; en?: Ancla };
  base?: { id: string; titulo: string; en?: Ancla; items: { texto: string; en?: Ancla }[] };
};

export type Imagen =
  | { tipo: "serie"; portal?: string }
  | { tipo: "continuar" }
  | {
      tipo: "titular";
      antetitulo?: string;
      antetituloEn?: Ancla;
      titulo: string;
      subtitulo?: string;
      en?: Ancla;
      panel?: { en?: Ancla };
      portal?: "lupa" | "panel";
    }
  | { tipo: "mapa"; raiz: NodoMapa; portal?: string }
  | {
      tipo: "antesAhora";
      portal?: string;
      antes: { titulo: string; frase: string; en?: Ancla; fraseEn?: Ancla; items: { texto: string; en?: Ancla }[] };
      ahora: { titulo: string; frase: string; en?: Ancla; fraseEn?: Ancla; carpeta: string; carpetaEn?: Ancla };
    }
  | {
      tipo: "opciones";
      portal?: string;
      items: { id: string; texto: string; icono?: "terminal" | "editor" | "app"; en?: Ancla }[];
      nucleo?: { texto: string; en?: Ancla };
    }
  | { tipo: "terminal"; titulo?: string; portal?: string; prompt: { texto: string; en?: Ancla; hasta?: Ancla } }
  | { tipo: "revision"; titulo?: string; portal?: string; lineas?: number; revisa?: Ancla; linea?: number; corrige?: Ancla }
  | { tipo: "ciclo"; portal?: string; centro: { texto: string; en?: Ancla }; items: { texto: string; en?: Ancla }[] }
  | { tipo: "lista"; portal?: string; titulo: string; en?: Ancla; items: { texto: string; en?: Ancla }[] }
  | { tipo: "dato"; portal?: string; dato: DatoSpec }
  | {
      tipo: "clip";
      /** ruta en public/ (episodios/ep-NN/clips/…) */
      src: string;
      /** segundo del vídeo original en el que empieza el trozo */
      desde?: number;
      /** tamaño del vídeo original en píxeles (por defecto 1920x1080) */
      ancho?: number;
      alto?: number;
      /** recorte en píxeles del original, sin la cámara del ponente */
      recorte: { x: number; y: number; w: number; h: number };
      /** posiciones del cursor (segundos desde el inicio del trozo, píxeles del original); scripts/cursor.py las saca solo */
      cursor?: { t: number; x: number; y: number }[];
      zoom?: number;
      portal?: string;
    }
  | { tipo: "cta" };

export type EscenaSpec = {
  id: string;
  /** duración estimada del guion: solo orientativa, la real sale del audio (regla 1) */
  segundos?: number;
  voz: string;
  /** texto en pantalla: una cadena, o varias que van cambiando con los planos */
  texto?: string | string[];
  imagen: Imagen | string;
  paso?: number;
  /** cuándo se completa el paso (por defecto, al terminar la escena) */
  pasoCompleto?: Ancla;
  etiquetas?: EtiquetaSpec[];
};

export type Episodio = {
  serie: string;
  episodio: number;
  total_episodios: number;
  titulo?: string;
  usuario: string;
  voz: { audio: string; timestamps?: string; palabras?: Palabra[] };
  musica?: { audio: string; db?: number; duckingDb?: number };
  cta?: { seguir?: string; pregunta?: string; comenta?: string };
  proximos?: string[];
  estilo?: Partial<Estilo>;
  escenas: EscenaSpec[];
  /** lo rellena calculateMetadata a partir del audio y los timestamps */
  plan?: Plan;
};

export type Estilo = {
  fondo: string;
  panel: string;
  borde: string;
  texto: string;
  gris: string;
  acento: string;
  acentoSuave: string;
  oscuro: string;
  crema: string;
};

// ── lo que sale: el plan (todo en segundos del vídeo) ──────────────────────────────────────────────────────────────
export type Rect = { x: number; y: number; w: number; h: number };
/** Por dónde entra la cámara al lienzo siguiente. vista=false: el portal no enseña el lienzo hijo hasta que empieza el zoom. */
export type Portal = Rect & { radio: number; vista?: boolean };

/** Lo que cada tipo de imagen mide de sí mismo: dónde está cada elemento, cuándo aparece y dónde se entra. */
export type Medida = {
  elementos: Record<string, Rect>;
  focos: { t: number; rect: Rect }[];
  portal?: Portal;
  /** tiempos ya resueltos que usa la vista (apariciones, tecleo…) */
  t: Record<string, number>;
  eventos?: Evento[];
};

export type Plano = {
  inicio: number;
  fin: number;
  cx: number;
  cy: number;
  s: number;
  rot: number;
  giro: number;
  /** true: corte seco (salto de zoom); false: movimiento de cámara rápido */
  corte: boolean;
};

export type Lienzo = {
  idx: number;
  inicio: number;
  fin: number;
  /** cuándo empieza el zoom que entra por el portal al lienzo siguiente */
  entrada: number;
  escenas: string[];
  imagen: Imagen;
  medida: Medida;
  planos: Plano[];
};

export type EscenaPlan = {
  id: string;
  inicio: number;
  fin: number;
  lienzo: number;
  textos: { t: number; texto: string }[];
  paso?: { n: number; t: number; completo: number };
  etiquetas: (EtiquetaSpec & { t: number })[];
};

export type Chunk = { inicio: number; fin: number; lineas: { texto: string; inicio: number; fin: number }[][] };

export type Sfx = "golpe" | "tick" | "whoosh" | "pop" | "tecleo" | "envio";
export type Evento = { t: number; sfx: Sfx; vol: number; dur?: number };

export type Plan = {
  fps: number;
  duracion: number;
  frames: number;
  palabras: Palabra[];
  escenas: EscenaPlan[];
  lienzos: Lienzo[];
  subtitulos: Chunk[];
  eventos: Evento[];
  musica: number[];
  avisos: string[];
};
