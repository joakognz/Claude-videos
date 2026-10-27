import { easeOutCubic } from "../reel/anim";
import { createCamera, drift, Key, project, shot, through } from "../reel/camera";
import type { Cue } from "../reel/timeline";

/**
 * Inicio (s) de las palabras clave en la locución recortada (public/voz_peluqueria_corta.mp3),
 * según su transcripción por palabra. Si cambia el mp3, solo hay que actualizar este bloque.
 */
export const A = {
  manos: 0.12, // "Manos llenas de tinte"
  movil: 1.7, // "y el móvil vibrando."
  clienta: 2.94, // "Es una clienta que quiere cambiar la hora."
  hora: 4.38,
  nopuedes: 4.5, // (sin voz) arranca el contador "sin responder"
  tardas: 4.88, // "Si tardas, reserva en otro sitio."
  otrositio: 6.14,
  agente: 6.9, // "Un agente de IA, sí,"
  ia: 7.56,
  si: 8.1,
  lee: 8.6, // "lee la reserva al momento,"
  agenda: 10.02, // "la mete en tu agenda"
  confirma: 11.14, // "y confirma a la clienta por WhatsApp."
  otrahora: 12.96, // "Si quiere otra hora, la cambia él."
  cambia: 13.78,
  peinando: 14.58, // "Y tú, peinando."
  montamos: 15.74, // "Lo montamos en AIgencyx Labs con las herramientas que ya usas."
  aigencyx: 16.5,
  herramientas: 18.16,
  comenta: 19.72, // "Comenta auditoria y te respondemos con los pasos…"
  auditoria: 20.2,
  auditoriaEnd: 20.8,
  sigue: 24.26, // "El móvil sigue vibrando."
  estavez: 25.6, // "Esta vez ya está contestado."
  contestado: 26.46,
  voiceEnd: 27.12,
};

export const VOICE_DURATION = A.voiceEnd;
export const TOTAL = VOICE_DURATION + 1;
export const CLOSE = A.voiceEnd - 0.02;
export const END = TOTAL;

export const LABELS = ["RESERVA", "AGENDA", "CONFIRMACIÓN", "CAMBIOS"];

export const CUES: Cue[] = [
  { start: A.manos, end: A.movil, parts: [{ text: "Manos llenas de" }, { text: "tinte.", hl: "amber" }] },
  { start: A.movil, end: A.clienta, parts: [{ text: "Y el móvil" }, { text: "vibrando.", hl: "amber" }] },
  { start: A.clienta, end: A.tardas, parts: [{ text: "Quiere cambiar la" }, { text: "hora.", hl: "amber" }] },
  { start: A.tardas, end: A.agente, parts: [{ text: "Si tardas, reserva en" }, { text: "otro sitio.", hl: "amber", br: true }] },
  { start: A.agente, end: A.lee, parts: [{ text: "Un agente de" }, { text: "IA", hl: "white" }, { text: "sí." }] },
  { start: A.lee, end: A.agenda, label: "RESERVA", parts: [{ text: "La lee al" }, { text: "momento.", hl: "white" }] },
  { start: A.agenda, end: A.confirma, label: "AGENDA", parts: [{ text: "La mete en tu" }, { text: "agenda.", hl: "white" }] },
  { start: A.confirma, end: A.otrahora, label: "CONFIRMACIÓN", parts: [{ text: "Confirma a la" }, { text: "clienta.", hl: "white" }] },
  { start: A.otrahora, end: A.peinando, label: "CAMBIOS", parts: [{ text: "La cambia" }, { text: "él.", hl: "white" }] },
  { start: A.peinando, end: A.montamos, parts: [{ text: "Y tú," }, { text: "peinando.", hl: "white" }] },
  { start: A.montamos, end: A.herramientas, brand: true, parts: [{ text: "AIgencyx Labs" }] },
  { start: A.herramientas, end: A.comenta, size: 84, parts: [{ text: "Con las herramientas" }, { text: "que", br: true }, { text: "ya usas.", hl: "white" }] },
  { start: A.comenta, end: A.sigue, parts: [{ text: "Comenta" }, { text: "AUDITORIA", hl: "white", br: true }] },
  { start: A.sigue, end: A.estavez, parts: [{ text: "El móvil sigue" }, { text: "vibrando.", hl: "white" }] },
  { start: A.estavez, end: CLOSE, size: 88, parts: [{ text: "Esta vez, ya está" }, { text: "contestado.", hl: "white", br: true }] },
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
  [A.clienta, drift(S.phone, -12, 8, 1.08, -1.5)],
  [A.clienta + 0.35, S.phoneB, easeOutCubic],
  [A.tardas, drift(S.phoneB, 8, 6, 1.04, 1)],
  [A.tardas + 0.7, S.street],
  [A.agente - 0.24, drift(S.street, 20, -10, 1.06, 1.5)],
  ...through(A.agente, drift(S.street, 20, -10, 1.06, 1.5), S.roomB).slice(1),
  [A.agenda, drift(S.roomB, 15, -8, 1.05, -1)],
  [A.otrahora, drift(S.roomB, -20, 10, 1.1, 2)],
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

const KICKS = [A.manos, A.clienta, A.hora, A.otrositio, A.ia, A.si, A.lee, A.agenda, A.confirma, A.otrahora, A.cambia, A.aigencyx, A.herramientas, A.auditoria, A.estavez];

export const camera = createCamera(CAMERA_KEYS, KICKS);

export const toScreen = (t: number, x: number, y: number, z = 0) => project(camera(t), x, y, z);
