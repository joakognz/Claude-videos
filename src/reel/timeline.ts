import { clamp, easeInCubic, easeInOutCubic, easeOutCubic, lerp } from "./anim";
import { iso } from "./iso";

/**
 * Tiempos (segundos) tomados de la transcripción con marcas por palabra de la locución.
 * Si cambia el mp3, solo hay que actualizar este archivo.
 */
export const T = {
  s1: 0.0, // "Misma calle, misma carta."
  s1b: 1.36,
  s2: 2.62, // "Pero uno siempre está lleno."
  s3: 4.18, // "Responde solo a cualquier hora"
  s3chat: 4.3,
  s3reply: 4.95,
  chips: [5.6, 5.75, 5.9],
  s4: 6.62, // "Reserva la mesa sin que nadie descuelgue el teléfono."
  s4confirm: 8.3,
  s6: 9.22, // "Si alguien cancela, avisa al siguiente al instante."
  s6cancel: 9.7,
  s6fill: 10.56,
  s10: 12.4, // "Mientras tanto, enfrente:"
  s11: 12.75, // interior del ámbar (libreta, teléfono sonando, mensajes sin leer)
  s11phone: 12.9,
  s11msgs: 13.2,
  s12: 14.4, // "¿Hay mesa mañana?"
  s12q1: 14.46,
  s12q2: 14.95,
  s12none: 16.06,
  s13: 15.98, // "Y nadie contesta." (la mesa se va al verde)
  s14a: 17.6, // "Ese sistema es un agente de IA"
  s14brand: 20.58, // "y en AIgencyx Labs"
  s14b: 22.05, // "te lo adaptamos a tu medida."
  s14e: 22.05,
  icons: [22.15, 22.4, 22.65, 22.9, 23.15],
  s16: 23.72, // "Comenta auditoria y te muestro cómo quedaría el tuyo"
  s15: 23.72,
  s16type: [24.19, 25.03] as [number, number],
  s16publish: 25.2,
  close: 27.0,
  end: 28.22,
};

export type Hl = "lime" | "amber";
export type Part = { text: string; hl?: Hl; at?: number; br?: boolean };
export type Cue = { start: number; end: number; parts: Part[]; label?: string; size?: number; brand?: boolean };

export const LABELS = ["RESPUESTA", "RESERVA", "ESPERA"];

export const CUES: Cue[] = [
  { start: 0.04, end: T.s2, parts: [{ text: "Misma calle." }, { text: "Misma carta.", at: T.s1b, br: true }] },
  { start: T.s2, end: T.s3, parts: [{ text: "Pero uno siempre está" }, { text: "lleno.", hl: "lime" }] },
  { start: T.s3, end: T.s4, label: "RESPUESTA", parts: [{ text: "Responde" }, { text: "solo.", hl: "lime" }] },
  { start: T.s4, end: T.s6, label: "RESERVA", parts: [{ text: "Reservan" }, { text: "solos.", hl: "lime" }] },
  { start: T.s6, end: T.s10, label: "ESPERA", parts: [{ text: "La mesa se" }, { text: "rellena.", hl: "lime" }] },
  { start: T.s10, end: T.s12, parts: [{ text: "Mientras tanto," }, { text: "enfrente…", hl: "amber", br: true }] },
  { start: T.s12, end: T.s13, parts: [{ text: "A las" }, { text: "23:00.", hl: "amber" }] },
  { start: T.s13, end: T.s14a, parts: [{ text: "Esa mesa se va." }] },
  { start: T.s14a, end: T.s14brand, parts: [{ text: "Agente de" }, { text: "IA.", hl: "lime" }] },
  { start: T.s14brand, end: T.s14b, brand: true, parts: [{ text: "AIgencyx Labs" }] },
  { start: T.s14b, end: T.s16, parts: [{ text: "A tu" }, { text: "medida.", hl: "lime" }] },
  { start: T.s16, end: T.close, parts: [{ text: "Comenta" }, { text: "AUDITORIA", hl: "lime", br: true }] },
];

/* ---------------- Cámara ---------------- */

/** Plano de cámara: centro (px del mundo), zoom y giro (grados). */
export type Shot = { cx: number; cy: number; zoom: number; roll: number };
const shot = (x: number, y: number, z: number, zoom: number, roll = 0): Shot => {
  const [cx, cy] = iso(x, y, z);
  return { cx, cy, zoom, roll };
};

export const SHOTS = {
  street: shot(1.9, -0.2, 1.3, 1.8, 0),
  streetPush: shot(1.4, -0.8, 1.1, 2.05, -2.5),
  green: shot(0.0, -1.9, 0.2, 2.7, 2.5),
  greenB: shot(0.35, -1.6, 0.3, 3.0, -2),
  greenC: shot(-0.2, -2.0, 0.2, 2.85, 3),
  amber: shot(3.0, 2.4, 0.4, 2.6, -3),
  amberClose: shot(3.35, 2.35, 0.45, 3.3, 2),
  wideStreet: shot(1.7, 0.1, 1.2, 1.7, -1.5),
  city: shot(0.5, 0.5, 1.2, 0.62, -4),
  cityDrift: shot(-0.5, 1.0, 1.2, 0.72, 3),
  greenMid: shot(0.2, -1.7, 1.45, 2.2, -2),
  greenHero: shot(0.1, -1.9, 0.5, 2.6, 2),
};

const S = SHOTS;
const drift = (a: Shot, dx: number, dy: number, dz: number, droll = 0): Shot => ({
  cx: a.cx + dx, cy: a.cy + dy, zoom: a.zoom * dz, roll: a.roll + droll,
});
const zoomed = (a: Shot, k: number, droll = 0): Shot => ({ ...a, zoom: a.zoom * k, roll: a.roll + droll });

type Key = [number, Shot, ((p: number) => number)?];

/** Transición "zoom a través": acelera hacia dentro, corta y el plano nuevo se asienta desde cerca. */
const through = (t: number, from: Shot, to: Shot): Key[] => [
  [t - 0.24, from],
  [t, zoomed(from, 1.55, 4), easeInCubic],
  [t + 0.001, zoomed(to, 1.4, -4)],
  [t + 0.42, to, easeOutCubic],
];

/** Momentos de corte (para el destello de transición). */
export const CUTS = [T.s3, T.s10, T.s16];

/** La cámara nunca se queda quieta: deriva, giros suaves y transiciones rápidas. */
const CAMERA_KEYS: Key[] = [
  [0, S.street],
  [T.s2 - 0.05, drift(S.street, -20, -15, 1.06, 1.5)],
  [T.s3 - 0.24, S.streetPush],
  ...through(T.s3, S.streetPush, S.green).slice(1),
  [T.s4, drift(S.green, 12, -6, 1.05, -1)],
  [T.s4 + 0.35, S.greenB, easeOutCubic],
  [T.s6, drift(S.greenB, -12, 8, 1.05, 1)],
  [T.s6 + 0.35, S.greenC, easeOutCubic],
  [T.s10 - 0.24, drift(S.greenC, 10, 6, 1.06, -1)],
  ...through(T.s10, drift(S.greenC, 10, 6, 1.06, -1), S.amber).slice(1),
  [T.s12 - 0.05, drift(S.amber, 10, -10, 1.1, 1.5)],
  [T.s12 + 0.35, S.amberClose, easeOutCubic],
  [T.s13 + 0.35, drift(S.amberClose, -15, 10, 1.06, -1.5)],
  [T.s13 + 0.75, S.wideStreet],
  [T.s14a - 0.05, drift(S.wideStreet, 10, -10, 1.05, 1)],
  [T.s14a + 0.85, S.city],
  [T.s14brand, drift(S.city, -30, 20, 1.08, 2)],
  [T.s14b - 0.3, S.cityDrift],
  [T.s14b + 0.2, S.greenMid, easeOutCubic],
  [T.s16 - 0.24, drift(S.greenMid, -10, -8, 1.06, 1)],
  ...through(T.s16, drift(S.greenMid, -10, -8, 1.06, 1), S.greenHero).slice(1),
  [T.close - 0.05, drift(S.greenHero, 8, 6, 1.1, -2)],
  [T.end - 0.08, S.street],
  [T.end + 1, S.street],
];

/** Golpe de zoom y giro al entrar cada frase: sube rápido y se asienta. */
const KICKS = [0.04, T.s1b, T.s2, T.s4, T.s6, T.s6fill, T.s12, T.s13, T.s14a, T.s14brand, T.s14b, T.s16publish];
const kick = (t: number) => {
  let k = 0;
  let dir = 1;
  KICKS.forEach((c, i) => {
    const d = t - c;
    if (d < 0 || d > 0.6) return;
    const v = d < 0.07 ? d / 0.07 : 1 - easeInOutCubic(clamp((d - 0.07) / 0.5));
    if (v > k) {
      k = v;
      dir = i % 2 === 0 ? 1 : -1;
    }
  });
  return { zoom: 1 + 0.065 * k, roll: 1.4 * k * dir };
};

export const camera = (t: number): Shot => {
  const c = baseCamera(t);
  const k = kick(t);
  return { ...c, zoom: c.zoom * k.zoom, roll: c.roll + k.roll };
};

const baseCamera = (t: number): Shot => {
  const k = CAMERA_KEYS;
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [t0, a] = k[i];
    const [t1, b, ease] = k[i + 1];
    if (t <= t1) {
      const p = (ease ?? easeInOutCubic)(clamp((t - t0) / (t1 - t0)));
      return {
        cx: lerp(a.cx, b.cx, p),
        cy: lerp(a.cy, b.cy, p),
        zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), p)),
        roll: lerp(a.roll, b.roll, p),
      };
    }
  }
  return k[k.length - 1][1];
};

/** Transformación SVG del mundo para un plano. */
export const worldTransform = (c: Shot) =>
  `translate(540 960) rotate(${c.roll}) scale(${c.zoom}) translate(${-c.cx} ${-c.cy})`;

/** Posición en pantalla (px) de un punto del mundo isométrico en el instante t. */
export const toScreen = (t: number, x: number, y: number, z = 0): [number, number] => {
  const c = camera(t);
  const [wx, wy] = iso(x, y, z);
  const dx = (wx - c.cx) * c.zoom;
  const dy = (wy - c.cy) * c.zoom;
  const r = (c.roll * Math.PI) / 180;
  return [540 + dx * Math.cos(r) - dy * Math.sin(r), 960 + dx * Math.sin(r) + dy * Math.cos(r)];
};
