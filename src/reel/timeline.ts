import { clamp, easeInOutCubic, lerp } from "./anim";
import { iso } from "./iso";

/**
 * Tiempos (segundos) tomados de la transcripción con marcas por palabra de la locución.
 * Si cambia el mp3, solo hay que actualizar este archivo.
 */
export const T = {
  s1: 0.0, // "Misma calle, misma carta, mismo precio."
  s1b: 1.44,
  s2: 4.12, // "Pero uno siempre está lleno."
  s3: 5.66, // "Responde solo a cualquier hora por WhatsApp, llamada o web."
  s3chat: 6.0,
  s3reply: 7.0,
  chips: [8.36, 8.94, 9.44],
  s4: 10.1, // "Reserva la mesa sin que nadie descuelgue el teléfono."
  s4confirm: 11.85,
  s5: 12.72, // "Recuerda la reserva el día antes y evita los plantones."
  s5notif: 13.2,
  s5press: 15.0,
  s6: 16.16, // "Si alguien cancela, avisa al siguiente al instante."
  s6cancel: 16.62,
  s6fill: 17.5,
  s7: 19.38, // "Contesta dudas de carta, alérgenos o grupos."
  s7reply: 20.2,
  s7pills: [20.64, 21.34],
  s8: 22.06, // "Pide reseñas después de cada visita"
  s9: 24.22, // "y a los que no vuelven les escribe."
  s10: 26.62, // "Mientras tanto, enfrente:"
  s11: 28.82, // "libreta, teléfono sonando en pleno servicio, mensajes sin leer."
  s11phone: 29.86,
  s11msgs: 31.9,
  s12: 33.66, // "A las once de la noche alguien escribe: ¿Hay mesa mañana?"
  s12q1: 35.6,
  s12q2: 36.5,
  s12none: 37.4, // "Y nadie contesta."
  s13: 38.76, // "Y esa mesa se va a otro sitio."
  s14a: 40.74, // "Ese sistema es un agente de IA"
  s14b: 43.3, // "y en AIgencyx Labs te lo adaptamos a tu medida."
  s14c: 46.8, // "Hacemos automatizaciones complejas de todo tipo."
  s14d: 49.46, // "Integramos IAs en un montón de procesos de tu restaurante:"
  s14e: 52.3, // "reservas, pedidos, proveedores, turnos, facturas."
  icons: [52.56, 53.24, 53.76, 54.54, 55.08],
  s15: 55.94, // "Lo que hoy haces a mano lo hace solo."
  s16: 58.62, // "Comenta auditoria y te muestro cómo quedaría el tuyo"
  s16type: [59.2, 60.0] as [number, number],
  s16publish: 60.2,
  close: 62.3,
  end: 63.28,
};

export type Hl = "lime" | "amber";
export type Part = { text: string; hl?: Hl; at?: number; br?: boolean };
export type Cue = { start: number; end: number; parts: Part[]; label?: string; size?: number; brand?: boolean };

export const LABELS = ["RESPUESTA", "RESERVA", "RECORDATORIO", "ESPERA", "CARTA", "RESEÑAS", "FIDELIZA"];

export const CUES: Cue[] = [
  { start: 0.12, end: T.s2, parts: [{ text: "Misma calle." }, { text: "Misma carta.", at: T.s1b, br: true }] },
  { start: T.s2, end: T.s3, parts: [{ text: "Pero uno siempre está" }, { text: "lleno.", hl: "lime" }] },
  { start: T.s3, end: T.s4, label: "RESPUESTA", parts: [{ text: "Responde" }, { text: "solo.", hl: "lime" }] },
  { start: T.s4, end: T.s5, label: "RESERVA", parts: [{ text: "Reservan" }, { text: "solos.", hl: "lime" }] },
  { start: T.s5, end: T.s6, label: "RECORDATORIO", parts: [{ text: "Menos" }, { text: "plantones.", hl: "lime" }] },
  { start: T.s6, end: T.s7, label: "ESPERA", parts: [{ text: "La mesa se" }, { text: "rellena.", hl: "lime" }] },
  { start: T.s7, end: T.s8, label: "CARTA", parts: [{ text: "Resuelve" }, { text: "dudas.", hl: "lime" }] },
  { start: T.s8, end: T.s9, label: "RESEÑAS", size: 84, parts: [{ text: "Reseñas en" }, { text: "piloto automático.", hl: "lime", br: true }] },
  { start: T.s9, end: T.s10, label: "FIDELIZA", parts: [{ text: "Para que" }, { text: "vuelvan.", hl: "lime" }] },
  { start: T.s10, end: T.s11, parts: [{ text: "Mientras tanto," }, { text: "enfrente…", hl: "amber", br: true }] },
  { start: T.s11, end: T.s12, parts: [{ text: "Libreta", hl: "amber" }, { text: "y teléfono." }] },
  { start: T.s12, end: T.s13, parts: [{ text: "A las" }, { text: "23:00.", hl: "amber" }] },
  { start: T.s13, end: T.s14a, parts: [{ text: "Esa mesa se va." }] },
  { start: T.s14a, end: T.s14b, parts: [{ text: "Agente de" }, { text: "IA.", hl: "lime" }] },
  { start: T.s14b, end: T.s14c, parts: [{ text: "A tu" }, { text: "medida.", hl: "lime" }] },
  { start: T.s14c, end: T.s14d, size: 84, parts: [{ text: "Automatizaciones" }, { text: "complejas.", hl: "lime", br: true }] },
  { start: T.s14d, end: T.s14e, size: 84, parts: [{ text: "IA en un montón de" }, { text: "procesos.", hl: "lime", br: true }] },
  { start: T.s14e, end: T.s15, brand: true, parts: [{ text: "AIgencyx Labs" }] },
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
/** [tiempo, plano]: entre claves consecutivas se interpola con easing. */
const CAMERA_KEYS: [number, Shot][] = [
  [0, S.street],
  [T.s2 - 0.1, S.street],
  [T.s3 - 0.1, S.streetPush],
  [T.s3 + 0.9, S.green],
  [T.s8 - 0.2, S.greenDrift],
  [T.s8 + 0.7, S.greenDoor],
  [T.s9 - 0.05, S.greenDoor],
  [T.s9 + 0.8, S.backStreet],
  [T.s10 - 0.05, S.backStreet],
  [T.s10 + 1.4, S.amber],
  [T.s11 - 0.1, S.amber],
  [T.s11 + 0.8, S.amberClose],
  [T.s13 - 0.15, S.amberClose],
  [T.s13 + 0.6, S.wideStreet],
  [T.s14a - 0.1, S.wideStreet],
  [T.s14a + 1.8, S.city],
  [T.s14e - 0.6, S.cityDrift],
  [T.s14e + 0.5, S.greenMid],
  [T.s15 - 0.1, S.greenMid],
  [T.s15 + 1.2, S.greenHero],
  [T.close - 0.1, S.greenHero],
  [T.end - 0.1, S.street],
  [T.end + 1, S.street],
];

export const camera = (t: number): Shot => {
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
