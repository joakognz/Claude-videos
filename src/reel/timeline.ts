import { clamp, easeInOutCubic, lerp } from "./anim";
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

export type Shot = { cx: number; cy: number; zoom: number };
const shot = (x: number, y: number, z: number, zoom: number): Shot => {
  const [cx, cy] = iso(x, y, z);
  return { cx, cy, zoom };
};

export const SHOTS = {
  street: shot(1.9, -0.2, 1.3, 1.8),
  streetPush: shot(1.4, -0.8, 1.1, 2.0),
  green: shot(0.0, -1.9, 0.2, 2.7),
  greenDrift: shot(0.25, -1.75, 0.25, 2.95),
  greenDoor: shot(0.3, -1.0, 0.25, 3.2),
  backStreet: shot(-2.6, 0.6, 0.25, 2.8),
  amber: shot(3.0, 2.4, 0.4, 2.6),
  amberClose: shot(3.35, 2.35, 0.45, 3.3),
  wideStreet: shot(1.7, 0.1, 1.2, 1.7),
  city: shot(0.5, 0.5, 1.2, 0.62),
  cityDrift: shot(-0.5, 1.0, 1.2, 0.7),
  greenMid: shot(0.2, -1.7, 1.45, 2.2),
  greenHero: shot(0.1, -1.9, 0.5, 2.6),
};

const S = SHOTS;
const drift = (a: Shot, dx: number, dy: number, dz: number): Shot => ({ cx: a.cx + dx, cy: a.cy + dy, zoom: a.zoom * dz });
/** [tiempo, plano]: la cámara nunca se queda quieta (deriva lenta entre movimientos rápidos). */
const CAMERA_KEYS: [number, Shot][] = [
  [0, S.street],
  [T.s2 - 0.05, drift(S.street, -20, -15, 1.06)],
  [T.s3 - 0.15, S.streetPush],
  [T.s3 + 0.5, S.green],
  [T.s10 - 0.1, S.greenDrift],
  [T.s10 + 0.55, S.amber],
  [T.s12 - 0.1, drift(S.amber, 10, -10, 1.1)],
  [T.s12 + 0.4, S.amberClose],
  [T.s13 + 0.25, drift(S.amberClose, -15, 10, 1.06)],
  [T.s13 + 0.6, S.wideStreet],
  [T.s14a - 0.05, drift(S.wideStreet, 10, -10, 1.05)],
  [T.s14a + 0.9, S.city],
  [T.s14b - 0.35, S.cityDrift],
  [T.s14b + 0.2, S.greenMid],
  [T.s16 - 0.05, drift(S.greenMid, -10, -8, 1.06)],
  [T.s16 + 0.6, S.greenHero],
  [T.close - 0.05, drift(S.greenHero, 8, 6, 1.1)],
  [T.end - 0.08, S.street],
  [T.end + 1, S.street],
];

/** Golpe de zoom al entrar cada frase: sube rápido y se asienta. */
const KICKS = [0.04, T.s2, T.s3, T.s4, T.s6, T.s12, T.s13, T.s14brand, T.s14b, T.s16];
const kick = (t: number) => {
  let k = 0;
  for (const c of KICKS) {
    const d = t - c;
    if (d < 0 || d > 0.6) continue;
    k = Math.max(k, d < 0.07 ? d / 0.07 : 1 - easeInOutCubic(clamp((d - 0.07) / 0.5)));
  }
  return 1 + 0.045 * k;
};

export const camera = (t: number): Shot => {
  const c = baseCamera(t);
  return { ...c, zoom: c.zoom * kick(t) };
};

const baseCamera = (t: number): Shot => {
  const k = CAMERA_KEYS;
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [t0, a] = k[i];
    const [t1, b] = k[i + 1];
    if (t <= t1) {
      const p = easeInOutCubic(clamp((t - t0) / (t1 - t0)));
      return {
        cx: lerp(a.cx, b.cx, p),
        cy: lerp(a.cy, b.cy, p),
        zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), p)),
      };
    }
  }
  return k[k.length - 1][1];
};

/** Posición en pantalla (px) de un punto del mundo isométrico en el instante t. */
export const toScreen = (t: number, x: number, y: number, z = 0): [number, number] => {
  const c = camera(t);
  const [wx, wy] = iso(x, y, z);
  return [540 + (wx - c.cx) * c.zoom, 960 + (wy - c.cy) * c.zoom];
};
