export const FPS = 30;
export const VOICE_DURATION = 27.22;
// Duración final = locución + 1 s de cierre
export const TOTAL_SECONDS = VOICE_DURATION + 1;
export const W = 1080;
export const H = 1920;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
export const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
export const easeInCubic = (p: number) => p * p * p;
export const easeOutExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
export const easeOutBack = (p: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};

/** Progreso 0..1 de una animación que empieza en `start` y dura `dur` segundos. */
export const prog = (t: number, start: number, dur: number, ease = easeOutCubic) =>
  ease(clamp((t - start) / dur));

/** Visibilidad 0..1: entra en `a`, sale en `b`. */
export const vis = (t: number, a: number, b: number, fin = 0.3, fout = 0.25) =>
  Math.min(prog(t, a, fin), 1 - prog(t, b - fout, fout, easeInCubic));

/** Interpolación por claves [tiempo, valor] con easing entre claves. */
export const keys = (t: number, k: [number, number][], ease = easeInOutCubic) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [t0, v0] = k[i];
    const [t1, v1] = k[i + 1];
    if (t <= t1) return lerp(v0, v1, ease(clamp((t - t0) / (t1 - t0))));
  }
  return k[k.length - 1][1];
};

export const rand = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

export const COLORS = {
  lime: "#C6FF3D",
  limeSoft: "#9BE52A",
  amber: "#D9973A",
  amberDim: "#A8722E",
  ink: "#0B0D08",
  bg: "#06070A",
  white: "#F4F6F8",
  muted: "#8A9099",
};

/** Pulso 0→1→0: sube en 0.08 s y se asienta en ~0.45 s. */
export const pulse = (t: number, at: number) => {
  const d = t - at;
  if (d < 0 || d > 0.55) return 0;
  return d < 0.08 ? d / 0.08 : 1 - easeInOutCubic(clamp((d - 0.08) / 0.45));
};

/** Flotación continua (px y grados) para que ningún elemento quede quieto. */
export const float = (t: number, seed = 0, amp = 1) => ({
  y: Math.sin(t * 2.1 + seed) * 10 * amp,
  x: Math.sin(t * 1.3 + seed * 2) * 6 * amp,
  rot: Math.sin(t * 1.7 + seed * 3) * 1.6 * amp,
});
