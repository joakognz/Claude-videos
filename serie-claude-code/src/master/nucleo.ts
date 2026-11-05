/**
 * Núcleo de la plantilla «Máster de Claude Code» (EP.2 en adelante): estilo, línea de tiempo sacada del audio,
 * entradas con spring() y cámara continua. Todo es función del tiempo t (segundos globales del reel), que sale de
 * useCurrentFrame(): no hay transiciones CSS ni temporizadores.
 */
import { Easing, interpolate, spring } from "remotion";
import { MONO, TITULO, UI } from "../tema";

export { MONO, TITULO, UI };
export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** Estilo de la serie (se puede cambiar por episodio con "estilo" en el JSON). */
export const C = {
  fondo: "#0B0D12",
  panel: "#141821",
  panel2: "#1B202B",
  borde: "#2A3140",
  texto: "#FFFFFF",
  gris: "#8C93A3",
  tenue: "#4A5263",
  acento: "#D97757",
  acentoSuave: "#F0A989",
  oscuro: "#0B0D12",
};

/** Zonas: subtítulos arriba, contenido en la banda central, nada informativo bajo BOTTOM (interfaz de Instagram). */
export const TOP = 250;
export const BOTTOM = H - 340;
/** Punto de la pantalla en el que la cámara centra lo que encuadra (debajo de los subtítulos). */
export const FOCO = { x: W / 2, y: 1100 };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);

/** 0 → 1 entre a y b (segundos) con curva. */
export const ramp = (t: number, a: number, b: number, easing: (n: number) => number = EASE) =>
  interpolate(t, [a, Math.max(a + 1e-4, b)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** spring() de Remotion a partir del segundo `at`. */
export const sp = (t: number, at: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  t <= at ? 0 : spring({ frame: (t - at) * FPS, fps: FPS, config: { damping: 14, stiffness: 160, mass: 1, ...cfg } });

/**
 * Visibilidad de un elemento: entra con spring en `a` y sale (0,35 s, con curva) para terminar en `b`.
 * Devuelve opacidad, escala y desplazamiento vertical listos para el estilo.
 */
export const vis = (t: number, a: number, b = Infinity, desde = 0.6) => {
  const s = sp(t, a, { damping: 13, stiffness: 170 });
  const out = b === Infinity ? 0 : ramp(t, b - 0.35, b, EASE_IN);
  const opacity = clamp01(Math.min(1, s * 1.6)) * (1 - out);
  const scale = (desde + (1 - desde) * s) * (1 - 0.12 * out);
  return { opacity, scale, y: (1 - s) * 40 + out * -20, s, out, on: opacity > 0.001 };
};

/** Pseudoaleatorio determinista en [0, 1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ── línea de tiempo (regla 2: la duración de cada escena sale del audio) ──────────────────────────────────────────
export type Palabra = { texto: string; inicio: number; fin: number; escena?: string };

export const norm = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

export type Linea = {
  palabras: Palabra[];
  duracion: number;
  /** inicio de la primera palabra de una escena */
  ini: (escena: string) => number;
  /** final de la última palabra de una escena */
  fin: (escena: string) => number;
  /** inicio de la palabra `texto` (n-ésima aparición) dentro de una escena; si es una frase, la de su primera palabra */
  en: (escena: string, texto: string, n?: number) => number;
  /** final de esa palabra (o de la última palabra de la frase) */
  finDe: (escena: string, texto: string, n?: number) => number;
};

export const crearLinea = (palabras: Palabra[], duracion: number): Linea => {
  const de = (e: string) => palabras.filter((p) => p.escena === e);
  const buscar = (e: string, texto: string, n = 0) => {
    const ws = de(e);
    const q = texto.split(/\s+/).map(norm).filter(Boolean);
    let k = 0;
    for (let i = 0; i + q.length <= ws.length; i++) {
      if (q.every((w, j) => norm(ws[i + j].texto) === w)) {
        if (k === n) return { a: ws[i], b: ws[i + q.length - 1] };
        k++;
      }
    }
    throw new Error(`No encuentro «${texto}» en la escena ${e}`);
  };
  return {
    palabras,
    duracion,
    ini: (e) => {
      const ws = de(e);
      if (!ws.length) throw new Error(`La escena ${e} no tiene palabras`);
      return ws[0].inicio;
    },
    fin: (e) => {
      const ws = de(e);
      if (!ws.length) throw new Error(`La escena ${e} no tiene palabras`);
      return ws[ws.length - 1].fin;
    },
    en: (e, texto, n) => buscar(e, texto, n).a.inicio,
    finDe: (e, texto, n) => buscar(e, texto, n).b.fin,
  };
};

// ── cámara continua ───────────────────────────────────────────────────────────────────────────────────────────────
export type Pose = { x: number; y: number; z: number };
/** Encuadre: en `t` la cámara empieza a ir (durante `d` s, curva suave) a mirar (x, y) del lienzo con zoom z. */
export type Toma = Pose & { t: number; d?: number };

/** Interpola dos encuadres: escala en logarítmico y centro como un zoom hacia un punto fijo (sin «barrido» raro). */
const camino = (a: Pose, b: Pose, u: number): Pose => {
  const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * u);
  const wa = 1 / a.z;
  const wb = 1 / b.z;
  const k = Math.abs(wa - wb) < 1e-6 ? u : (wa - 1 / z) / (wa - wb);
  return { z, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
};
const easeIO = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
/** Deriva mientras la cámara está quieta: un acercamiento lento y continuo (≈ 1,2 % por segundo, con techo). */
const DERIVA = 0.012;

export const poseCamara = (tomas: Toma[], t: number): Pose => {
  const ks = [...tomas].sort((a, b) => a.t - b.t);
  const en = (i: number, tt: number): Pose => {
    const k = ks[i];
    const d = k.d ?? 0.9;
    if (i === 0) {
      const dz = 1 + DERIVA * Math.min(4, Math.max(0, tt - k.t));
      return { x: k.x, y: k.y, z: k.z * dz };
    }
    const desde = en(i - 1, k.t);
    const u = clamp01((tt - k.t) / d);
    if (u < 1) return camino(desde, k, easeIO(u));
    const dz = 1 + DERIVA * Math.min(4, tt - (k.t + d));
    return { x: k.x, y: k.y, z: k.z * dz };
  };
  let i = 0;
  while (i + 1 < ks.length && ks[i + 1].t <= t) i++;
  return en(i, t);
};

/** Transformación CSS del lienzo para una pose (el punto (x, y) del lienzo cae en FOCO). */
export const transformCamara = (p: Pose) =>
  `translate(${FOCO.x - p.x * p.z}px, ${FOCO.y - p.y * p.z}px) scale(${p.z})`;

// ── geometría: curvas para flechas y paquetes ────────────────────────────────────────────────────────────────────
export type Pt = { x: number; y: number };
export type Curva = { a: Pt; c: Pt; b: Pt };
export const enCurva = ({ a, c, b }: Curva, u: number): Pt => ({
  x: (1 - u) ** 2 * a.x + 2 * (1 - u) * u * c.x + u * u * b.x,
  y: (1 - u) ** 2 * a.y + 2 * (1 - u) * u * c.y + u * u * b.y,
});
export const tangente = ({ a, c, b }: Curva, u: number) =>
  Math.atan2(2 * (1 - u) * (c.y - a.y) + 2 * u * (b.y - c.y), 2 * (1 - u) * (c.x - a.x) + 2 * u * (b.x - c.x));
export const largoCurva = (cv: Curva) => {
  let L = 0;
  let p = cv.a;
  for (let i = 1; i <= 64; i++) {
    const q = enCurva(cv, i / 64);
    L += Math.hypot(q.x - p.x, q.y - p.y);
    p = q;
  }
  return L;
};

// ── sonido ───────────────────────────────────────────────────────────────────────────────────────────────────────
export type Sfx = "golpe" | "tick" | "whoosh" | "pop" | "tecleo" | "envio";
export type Evento = { t: number; sfx: Sfx; vol: number; dur?: number };
