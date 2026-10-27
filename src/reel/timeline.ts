import { clamp, easeInOutCubic, lerp } from "./anim";
import { iso } from "./iso";

/**
 * Tiempos (segundos) tomados de la transcripción con marcas por palabra de la locución.
 * Si cambia el mp3, solo hay que actualizar este archivo.
 */
export const T = {
  s1: 0.0, // "Misma calle, misma carta."
  s1b: 0.91,
  s2: 1.9, // "Pero uno siempre está lleno."
  s3: 3.12, // "Responde solo a cualquier hora"
  s3chat: 3.25,
  s3reply: 3.85,
  chips: [4.2, 4.35, 4.5],
  s4: 4.92, // "Reserva la mesa sin que nadie descuelgue el teléfono."
  s4confirm: 6.3,
  s5: 7.08, // "evita los plantones."
  s5notif: 7.12,
  s5press: 7.72,
  s6: 8.15, // "Si alguien cancela, avisa al siguiente al instante."
  s6cancel: 8.56,
  s6fill: 9.06,
  s8: 10.58, // "Pide reseñas después de cada visita"
  s10: 12.62, // "Mientras tanto, enfrente:"
  s11: 13.0, // interior del ámbar (libreta, teléfono sonando, mensajes sin leer)
  s11phone: 13.15,
  s11msgs: 13.45,
  s12: 14.24, // "A las once de la noche alguien escribe: ¿Hay mesa mañana?"
  s12q1: 15.74,
  s12q2: 16.2,
  s12none: 16.55,
  s13: 17.0, // "Y esa mesa se va a otro sitio."
  s14a: 18.6, // "Ese sistema es un agente de IA"
  s14brand: 20.66, // "y en AIgencyx Labs"
  s14b: 22.12, // "te lo adaptamos a tu medida."
  s14e: 23.42, // "reservas, pedidos, proveedores, turnos, facturas."
  icons: [23.47, 24.08, 24.54, 25.24, 25.72],
  s15: 26.45, // "Lo que hoy haces a mano lo hace solo."
  s16: 28.3, // "Comenta auditoria y te muestro cómo quedaría el tuyo"
  s16type: [28.7, 29.45] as [number, number],
  s16publish: 29.62,
  close: 31.12,
  end: 32.35,
};

export type Hl = "lime" | "amber";
export type Part = { text: string; hl?: Hl; at?: number; br?: boolean };
export type Cue = { start: number; end: number; parts: Part[]; label?: string; size?: number; brand?: boolean };

export const LABELS = ["RESPUESTA", "RESERVA", "RECORDATORIO", "ESPERA", "RESEÑAS"];

export const CUES: Cue[] = [
  { start: 0.04, end: T.s2, parts: [{ text: "Misma calle." }, { text: "Misma carta.", at: T.s1b, br: true }] },
  { start: T.s2, end: T.s3, parts: [{ text: "Pero uno siempre está" }, { text: "lleno.", hl: "lime" }] },
  { start: T.s3, end: T.s4, label: "RESPUESTA", parts: [{ text: "Responde" }, { text: "solo.", hl: "lime" }] },
  { start: T.s4, end: T.s5, label: "RESERVA", parts: [{ text: "Reservan" }, { text: "solos.", hl: "lime" }] },
  { start: T.s5, end: T.s6, label: "RECORDATORIO", parts: [{ text: "Menos" }, { text: "plantones.", hl: "lime" }] },
  { start: T.s6, end: T.s8, label: "ESPERA", parts: [{ text: "La mesa se" }, { text: "rellena.", hl: "lime" }] },
  { start: T.s8, end: T.s10, label: "RESEÑAS", size: 84, parts: [{ text: "Reseñas en" }, { text: "piloto automático.", hl: "lime", br: true }] },
  { start: T.s10, end: T.s12, parts: [{ text: "Mientras tanto," }, { text: "enfrente…", hl: "amber", br: true }] },
  { start: T.s12, end: T.s13, parts: [{ text: "A las" }, { text: "23:00.", hl: "amber" }] },
  { start: T.s13, end: T.s14a, parts: [{ text: "Esa mesa se va." }] },
  { start: T.s14a, end: T.s14brand, parts: [{ text: "Agente de" }, { text: "IA.", hl: "lime" }] },
  { start: T.s14brand, end: T.s14b, brand: true, parts: [{ text: "AIgencyx Labs" }] },
  { start: T.s14b, end: T.s14e, parts: [{ text: "A tu" }, { text: "medida.", hl: "lime" }] },
  { start: T.s14e, end: T.s15, size: 84, parts: [{ text: "IA en un montón de" }, { text: "procesos.", hl: "lime", br: true }] },
  { start: T.s15, end: T.s16, size: 84, parts: [{ text: "Lo que haces a mano," }, { text: "lo hace", br: true }, { text: "solo.", hl: "lime" }] },
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
  [T.s8 - 0.1, S.greenDrift],
  [T.s8 + 0.45, S.greenDoor],
  [T.s10 - 0.05, drift(S.greenDoor, 25, 10, 1.07)],
  [T.s10 + 0.55, S.amber],
  [T.s12 - 0.1, drift(S.amber, 10, -10, 1.1)],
  [T.s12 + 0.4, S.amberClose],
  [T.s13 - 0.05, drift(S.amberClose, -15, 10, 1.06)],
  [T.s13 + 0.45, S.wideStreet],
  [T.s14a - 0.05, drift(S.wideStreet, 10, -10, 1.05)],
  [T.s14a + 0.9, S.city],
  [T.s14e - 0.4, S.cityDrift],
  [T.s14e + 0.25, S.greenMid],
  [T.s15 - 0.05, drift(S.greenMid, -10, -8, 1.06)],
  [T.s15 + 0.6, S.greenHero],
  [T.close - 0.05, drift(S.greenHero, 8, 6, 1.1)],
  [T.end - 0.08, S.street],
  [T.end + 1, S.street],
];

/** Golpe de zoom al entrar cada frase: sube rápido y se asienta. */
const KICKS = [0.04, T.s2, T.s3, T.s4, T.s5, T.s6, T.s8, T.s12, T.s14brand, T.s14b, T.s14e, T.s15, T.s16];
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
