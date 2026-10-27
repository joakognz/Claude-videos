import { easeOutCubic } from "../reel/anim";
import { createCamera, drift, Key, project, shot, through } from "../reel/camera";
import type { Cue } from "../reel/timeline";

/**
 * Inicio (s) de las palabras clave de la locución. Salen de la transcripción por palabra:
 * si cambia el mp3, solo hay que actualizar este bloque.
 */
export const A = {
  manos: 0.15, // "Manos llenas de tinte."
  movil: 2.04, // "Y el móvil vibrando."
  clienta: 3.93, // "Es una clienta que quiere cambiar la hora."
  nopuedes: 7.26, // "No puedes contestar."
  tardas: 8.79, // "Si tardas, reserva en otro sitio."
  otrositio: 10.3,
  web: 11.65, // "Y tú tienes web de reservas."
  pero: 14.26, // "Pero no confirma, no apunta, no mueve citas."
  noapunta: 15.5,
  nomueve: 16.6,
  escaparate: 18.09, // "Es un escaparate."
  agente: 19.62, // "Un agente de IA sí."
  lee: 21.87, // "Lee la reserva al momento,"
  agenda: 23.9, // "la mete en tu agenda"
  confirma: 25.4, // "y confirma a la clienta por WhatsApp."
  otrahora: 28.69, // "Si quiere otra hora, la cambia él."
  cambia: 30.3,
  cancela: 31.91, // "Si alguien cancela, rellena el hueco."
  rellena: 33.2,
  peinando: 34.77, // "Y tú, peinando."
  montamos: 36.55, // "Lo montamos en AIgencyx Labs con las herramientas que ya usas."
  aigencyx: 37.5,
  herramientas: 38.8,
  comenta: 40.96, // "Comenta AUDITORIA y te respondemos con los pasos…"
  auditoria: 41.5,
  auditoriaEnd: 42.3,
  sigue: 46.81, // "El móvil sigue vibrando."
  estavez: 48.7, // "Esta vez ya está contestado."
  voiceEnd: 50.5,
};

export const VOICE_DURATION = A.voiceEnd;
export const TOTAL = VOICE_DURATION + 1;
export const CLOSE = A.voiceEnd - 0.1;
export const END = TOTAL;

export const LABELS = ["RESERVA", "AGENDA", "CONFIRMACIÓN", "CAMBIOS", "HUECOS"];

export const CUES: Cue[] = [
  { start: A.manos, end: A.movil, parts: [{ text: "Manos llenas de" }, { text: "tinte.", hl: "amber" }] },
  { start: A.movil, end: A.clienta, parts: [{ text: "Y el móvil" }, { text: "vibrando.", hl: "amber" }] },
  { start: A.clienta, end: A.nopuedes, parts: [{ text: "Quiere cambiar la" }, { text: "hora.", hl: "amber" }] },
  { start: A.nopuedes, end: A.tardas, parts: [{ text: "No puedes" }, { text: "contestar.", hl: "amber" }] },
  { start: A.tardas, end: A.web, parts: [{ text: "Si tardas, reserva en" }, { text: "otro sitio.", hl: "amber", br: true }] },
  { start: A.web, end: A.pero, parts: [{ text: "Tienes web de" }, { text: "reservas.", hl: "amber" }] },
  { start: A.pero, end: A.noapunta, parts: [{ text: "No" }, { text: "confirma.", hl: "amber" }] },
  { start: A.noapunta, end: A.nomueve, parts: [{ text: "No" }, { text: "apunta.", hl: "amber" }] },
  { start: A.nomueve, end: A.escaparate, parts: [{ text: "No mueve" }, { text: "citas.", hl: "amber" }] },
  { start: A.escaparate, end: A.agente, parts: [{ text: "Es un" }, { text: "escaparate.", hl: "amber" }] },
  { start: A.agente, end: A.lee, parts: [{ text: "Un agente de" }, { text: "IA", hl: "lime" }, { text: "sí." }] },
  { start: A.lee, end: A.agenda, label: "RESERVA", parts: [{ text: "La lee al" }, { text: "momento.", hl: "lime" }] },
  { start: A.agenda, end: A.confirma, label: "AGENDA", parts: [{ text: "La mete en tu" }, { text: "agenda.", hl: "lime" }] },
  { start: A.confirma, end: A.otrahora, label: "CONFIRMACIÓN", parts: [{ text: "Confirma a la" }, { text: "clienta.", hl: "lime" }] },
  { start: A.otrahora, end: A.cancela, label: "CAMBIOS", parts: [{ text: "La cambia" }, { text: "él.", hl: "lime" }] },
  { start: A.cancela, end: A.peinando, label: "HUECOS", parts: [{ text: "Rellena el" }, { text: "hueco.", hl: "lime" }] },
  { start: A.peinando, end: A.montamos, parts: [{ text: "Y tú," }, { text: "peinando.", hl: "lime" }] },
  { start: A.montamos, end: A.herramientas, brand: true, parts: [{ text: "AIgencyx Labs" }] },
  { start: A.herramientas, end: A.comenta, size: 84, parts: [{ text: "Con las herramientas" }, { text: "que" , br: true }, { text: "ya usas.", hl: "lime" }] },
  { start: A.comenta, end: A.sigue, parts: [{ text: "Comenta" }, { text: "AUDITORIA", hl: "lime", br: true }] },
  { start: A.sigue, end: A.estavez, parts: [{ text: "El móvil sigue" }, { text: "vibrando.", hl: "lime" }] },
  { start: A.estavez, end: CLOSE, size: 88, parts: [{ text: "Esta vez, ya está" }, { text: "contestado.", hl: "lime", br: true }] },
];

/* ---------------- Cámara ---------------- */

export const SHOTS = {
  hands: shot(1.6, 2.3, 1.3, 4.0, -2),
  phone: shot(4.55, 0.65, 1.0, 4.6, 2.5),
  phoneB: shot(4.4, 0.8, 1.0, 5.0, -2),
  room: shot(3.0, 3.0, 1.15, 1.45, -1.5),
  roomB: shot(2.6, 3.4, 1.2, 1.6, 2),
  street: shot(7.6, 2.6, 0.9, 0.82, -2),
  wide: shot(4.0, 3.0, 1.6, 0.6, 3),
  stylist: shot(1.65, 2.3, 1.0, 3.0, 2.5),
};

const S = SHOTS;

/** Momentos de corte (para el destello de transición). */
export const CUTS = [A.movil, A.agente, A.peinando, A.sigue];

const CAMERA_KEYS: Key[] = [
  [0, S.hands],
  [A.movil - 0.24, drift(S.hands, 10, -6, 1.06, 1.5)],
  ...through(A.movil, drift(S.hands, 10, -6, 1.06, 1.5), S.phone).slice(1),
  [A.nopuedes - 0.05, drift(S.phone, -12, 8, 1.08, -1.5)],
  [A.nopuedes + 0.35, S.phoneB, easeOutCubic],
  [A.tardas, drift(S.phoneB, 8, 6, 1.04, 1)],
  [A.tardas + 0.8, S.street],
  [A.web - 0.05, drift(S.street, 20, -10, 1.06, 1.5)],
  [A.web + 0.5, S.room, easeOutCubic],
  [A.escaparate, drift(S.room, -20, 10, 1.1, -2)],
  [A.agente - 0.24, drift(S.room, -25, 12, 1.12, -2.5)],
  ...through(A.agente, drift(S.room, -25, 12, 1.12, -2.5), S.roomB).slice(1),
  [A.lee, drift(S.roomB, 15, -8, 1.05, -1)],
  [A.cancela, drift(S.roomB, -20, 10, 1.12, 2)],
  [A.peinando - 0.24, drift(S.roomB, -25, 12, 1.14, 2.5)],
  ...through(A.peinando, drift(S.roomB, -25, 12, 1.14, 2.5), S.stylist).slice(1),
  [A.montamos - 0.05, drift(S.stylist, 10, 6, 1.06, -1.5)],
  [A.montamos + 0.9, S.wide],
  [A.comenta - 0.1, drift(S.wide, -30, 20, 1.1, -2)],
  [A.comenta + 0.6, S.room, easeOutCubic],
  [A.sigue - 0.24, drift(S.room, 15, -10, 1.08, 1.5)],
  ...through(A.sigue, drift(S.room, 15, -10, 1.08, 1.5), S.phone).slice(1),
  [CLOSE, drift(S.phone, -10, 6, 1.1, -2)],
  [END - 0.08, S.hands],
  [END + 1, S.hands],
];

const KICKS = [0.15, A.clienta, A.nopuedes, A.otrositio, A.pero, A.noapunta, A.nomueve, A.escaparate, A.lee, A.agenda, A.confirma, A.otrahora, A.cancela, A.aigencyx, A.herramientas, A.estavez];

export const camera = createCamera(CAMERA_KEYS, KICKS);

export const toScreen = (t: number, x: number, y: number, z = 0) => project(camera(t), x, y, z);
