import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";
import type { Estilo } from "./tipos";

// Fuentes locales (el navegador del render no llega a Google Fonts)
export const UI = "Inter";
export const MONO = "JetBrains Mono";
export const TITULO = "Sora";
loadFont({ family: UI, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: UI, url: staticFile("fonts/inter-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: TITULO, url: staticFile("fonts/Sora-latin.woff2"), weight: "700 800" });

/** Estilo base de la marca (AIgencyx Labs). Cada episodio puede cambiar cualquier color con "estilo" en su JSON. */
export const ESTILO_BASE: Estilo = {
  fondo: "#060606",
  panel: "#0F0F0F",
  borde: "#2B2B2B",
  texto: "#FFFFFF",
  gris: "#8A8A8A",
  acento: "#FF6B1A",
  acentoSuave: "#FFB066",
  oscuro: "#14110F",
  crema: "#FFF4EC",
};

export const W = 1080;
export const H = 1920;
/** Zonas seguras de Instagram: nada informativo por encima de TOP ni por debajo de BOTTOM. */
export const TOP = 250;
export const BOTTOM = H - 340;
/** Banda de contenido de cada lienzo (debajo de los subtítulos) y punto de la pantalla donde se centra el foco. */
export const BANDA = { y0: 620, y1: 1500 };
export const FOCO_Y = 1080;

export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** 0 → 1 entre a y b (segundos), con curva. */
export const ramp = (t: number, a: number, b: number, easing: (n: number) => number = EASE) =>
  easing(clamp01((t - a) / Math.max(1e-6, b - a)));
/** Aparición con rebote suave (escala 0.9 → 1, opacidad 0 → 1) a partir de `at`. */
export const pop = (t: number, at: number, dur = 0.28) => {
  const p = clamp01((t - at) / dur);
  const s = p >= 1 ? 1 : 0.9 + 0.1 * EASE_OUT(p) + Math.sin(p * Math.PI) * 0.04;
  return { opacity: EASE_OUT(p), scale: s, p };
};
/** Muelle amortiguado 0 → 1 (con sobrepaso) que empieza en `at`. */
export const springAt = (t: number, at: number, damping = 13, stiffness = 190) => {
  const x = t - at;
  if (x <= 0) return 0;
  const w = Math.sqrt(stiffness);
  const z = Math.min(0.99, damping / (2 * w));
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x));
};
/** Pseudoaleatorio determinista en [0, 1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Ancho aproximado de un texto en monoespaciada (JetBrains Mono avanza 0,6 em). */
export const anchoMono = (texto: string, size: number, tracking = 0) => texto.length * (size * 0.6 + tracking);
