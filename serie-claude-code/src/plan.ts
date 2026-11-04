/**
 * Del JSON del episodio + audio + timestamps al plan de montaje. Todo es puro y determinista, y se calcula una vez
 * en calculateMetadata: las escenas duran lo que dura su voz (regla 1), cada lienzo se trocea en planos de 2–3 s
 * (regla 3), la cámara entra de lienzo en lienzo por un «portal» (regla 4) y la música baja bajo la voz (regla 9).
 */
import { MEDIDORES } from "./imagenes";
import { geometriaEtiqueta, unir } from "./imagenes/piezas";
import { BANDA, FOCO_Y, H, W } from "./tema";
import type {
  Ancla, Chunk, Episodio, EscenaPlan, Evento, Imagen, Lienzo, Medida, Palabra, Plan, Plano, Rect,
} from "./tipos";

export const FPS = 30;
const INTRO_MIN = 3; // regla 10: los 3 primeros segundos anuncian serie y episodio
const CTA_MIN = 6; // regla 10: los 6 últimos, el llamado a la acción
const PLANO_MAX = 3.0; // regla 3
const PLANO_OBJ = 2.4;
const PLANO_MIN = 1.3;
const MOV = 0.32; // duración de un movimiento de cámara entre planos

export const norm = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

const tokens = (s: string) => s.split(/\s+/).map(norm).filter(Boolean);

// ── escenas ↔ palabras ───────────────────────────────────────────────────────────────────────────────────────────
/** Índice de la escena de cada palabra. Si los timestamps ya traen la escena, se usa; si no, se alinea el texto. */
const escenaDePalabras = (ep: Episodio, pal: Palabra[]): number[] => {
  const ids = ep.escenas.map((e) => e.id);
  if (pal.every((p) => p.escena && ids.includes(p.escena))) return pal.map((p) => ids.indexOf(p.escena!));
  const g: { tok: string; esc: number }[] = [];
  ep.escenas.forEach((e, k) => tokens(e.voz).forEach((tok) => g.push({ tok, esc: k })));
  const r = pal.map((p) => norm(p.texto));
  // LCS guion ↔ palabras: cada palabra hereda la escena de su pareja; las sueltas, la de la anterior
  const n = g.length, m = r.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      L[i][j] = g[i].tok === r[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = new Array<number>(m).fill(-1);
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (g[i].tok === r[j]) { out[j] = g[i].esc; i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) i++;
    else j++;
  }
  for (let k = 0; k < m; k++) if (out[k] < 0) out[k] = k > 0 ? out[k - 1] : 0;
  return out;
};

// ── anclas ───────────────────────────────────────────────────────────────────────────────────────────────────────
export type Ctx = {
  ep: Episodio;
  inicio: number;
  fin: number;
  /** resuelve un ancla (palabra/frase de la voz o segundos desde el inicio del lienzo) */
  at: (a: Ancla | undefined, def: number) => number;
};

const resolver = (pal: Palabra[], desde: number, inicio: number, avisos: string[]) => (a: Ancla | undefined, def: number) => {
  if (a === undefined || a === "") return def;
  if (typeof a === "number") return inicio + a;
  const tk = tokens(a);
  const busca = (from: number) => {
    for (let i = from; i <= pal.length - tk.length; i++) {
      let ok = true;
      for (let k = 0; k < tk.length && ok; k++) ok = norm(pal[i + k].texto) === tk[k];
      if (ok) return i;
    }
    return -1;
  };
  let i = busca(desde);
  if (i < 0) i = busca(0);
  if (i < 0) {
    avisos.push(`Ancla no encontrada en la voz: «${a}»`);
    return def;
  }
  return pal[i].inicio;
};

// ── subtítulos ───────────────────────────────────────────────────────────────────────────────────────────────────
const limpia = (w: string) => w.replace(/[.,:;]+$/g, "");
const MAX_LINEA = 17;
const subtitulos = (pal: Palabra[], escenaIdx: number[]): Chunk[] => {
  const chunks: Chunk[] = [];
  let cur: Palabra[] = [];
  const cierra = () => {
    if (!cur.length) return;
    const lineas: Chunk["lineas"] = [[]];
    let len = 0;
    for (const p of cur) {
      const tx = limpia(p.texto);
      if (len > 0 && len + 1 + tx.length > MAX_LINEA && lineas.length < 2) {
        lineas.push([]);
        len = 0;
      }
      lineas[lineas.length - 1].push({ texto: tx, inicio: p.inicio, fin: p.fin });
      len += (len ? 1 : 0) + tx.length;
    }
    chunks.push({ inicio: cur[0].inicio - 0.06, fin: cur[cur.length - 1].fin + 0.35, lineas });
    cur = [];
  };
  pal.forEach((p, k) => {
    if (cur.length) {
      const prev = cur[cur.length - 1];
      const chars = cur.reduce((s, q) => s + limpia(q.texto).length + 1, 0);
      const finFrase = /[.?!:]$/.test(prev.texto);
      const coma = /,$/.test(prev.texto) && chars > 10;
      if (finFrase || coma || chars + limpia(p.texto).length > MAX_LINEA * 2 || p.inicio - prev.fin > 0.5 || escenaIdx[k] !== escenaIdx[k - 1])
        cierra();
    }
    cur.push(p);
  });
  cierra();
  // cada bloque dura hasta que empieza el siguiente (sin huecos de parpadeo si están cerca)
  for (let k = 0; k + 1 < chunks.length; k++) {
    const gap = chunks[k + 1].inicio - chunks[k].fin;
    if (gap < 0.6) chunks[k].fin = chunks[k + 1].inicio;
  }
  return chunks;
};

// ── cámara: encuadre de un foco ──────────────────────────────────────────────────────────────────────────────────
const ZOOM_VAR = [1, 1.12, 0.97, 1.09, 1.16, 1.03];
const ROT_VAR = [0, -1.4, 1.1, -0.7, 1.5, -1.1];
const GIRO_VAR = [0, 5, -6, 3.5, -4.5, 6];

export const encuadre = (r: Rect, k: number) => {
  const fit = Math.min(900 / r.w, 760 / r.h);
  const s = Math.min(2.8, Math.max(1, fit)) * ZOOM_VAR[k % ZOOM_VAR.length];
  const hw = W / 2 / s, hh = H / 2 / s;
  const cx = Math.min(W - hw + 60, Math.max(hw - 60, r.x + r.w / 2));
  const cy = Math.min(H - hh + 60, Math.max(hh - 60, r.y + r.h / 2 - (FOCO_Y - H / 2) / s));
  return { cx, cy, s, rot: ROT_VAR[k % ROT_VAR.length], giro: GIRO_VAR[k % GIRO_VAR.length] };
};

const BANDA_RECT: Rect = { x: 40, y: BANDA.y0, w: W - 80, h: BANDA.y1 - BANDA.y0 };

const planos = (m: Medida, inicio: number, finUtil: number, pal: Palabra[], primero: boolean): Plano[] => {
  const focos = [{ t: inicio, rect: BANDA_RECT }, ...m.focos.filter((f) => f.t > inicio + 0.05 && f.t < finUtil)].sort((a, b) => a.t - b.t);
  // 1) cortes en los focos (cuando aparece algo nuevo), con un mínimo de duración por plano
  const cortes = [inicio];
  for (const f of focos.slice(1)) {
    const t = f.t - 0.12; // la cámara llega justo antes de la palabra
    if (t - cortes[cortes.length - 1] >= PLANO_MIN && finUtil - t >= 1.0) cortes.push(t);
  }
  cortes.push(finUtil);
  // 2) ningún plano pasa de 3 s: se parte en trozos iguales, ajustados al inicio de palabra más cercano
  const final: number[] = [cortes[0]];
  for (let k = 0; k + 1 < cortes.length; k++) {
    const a = cortes[k], b = cortes[k + 1];
    const n = Math.max(Math.ceil((b - a) / PLANO_MAX), Math.ceil((b - a) / PLANO_OBJ - 0.15));
    for (let i = 1; i < n; i++) {
      let t = a + ((b - a) * i) / n;
      const cand = pal.filter((p) => Math.abs(p.inicio - t) < 0.35 && p.inicio - final[final.length - 1] > PLANO_MIN * 0.8 && b - p.inicio > PLANO_MIN * 0.8);
      if (cand.length) t = cand.reduce((x, y) => (Math.abs(y.inicio - t) < Math.abs(x.inicio - t) ? y : x)).inicio - 0.05;
      final.push(t);
    }
    final.push(b);
  }
  const out: (Plano & { focoT: number })[] = [];
  for (let k = 0; k + 1 < final.length; k++) {
    const a = final[k], b = final[k + 1];
    if (b - a < 0.05) continue;
    // foco: lo último que ha aparecido (o aparece en el primer medio segundo del plano)
    const f = [...focos].reverse().find((x) => x.t <= a + 0.5) ?? focos[0];
    const mismo = out.length > 0 && out[out.length - 1].focoT === f.t;
    const e = encuadre(f.rect, out.length + (primero ? 0 : 1));
    out.push({ inicio: a, fin: b, ...e, corte: mismo, focoT: f.t });
  }
  return out.map(({ inicio, fin, cx, cy, s, rot, giro, corte }) => ({ inicio, fin, cx, cy, s, rot, giro, corte }));
};

// ── música: -20 dB, y -8 dB más mientras habla la voz (ataque 0,15 s, relajación 0,5 s) ─────────────────────────────
const envolventeMusica = (pal: Palabra[], dur: number, db: number, duck: number): number[] => {
  const n = Math.ceil(dur * FPS);
  const voz = new Array<number>(n).fill(0);
  pal.forEach((p, k) => {
    const sig = pal[k + 1];
    const fin = sig && sig.inicio - p.fin < 0.35 ? sig.inicio : p.fin + 0.12;
    for (let f = Math.floor((p.inicio - 0.08) * FPS); f < Math.ceil(fin * FPS); f++) if (f >= 0 && f < n) voz[f] = 1;
  });
  const out: number[] = [];
  let g = db;
  const att = 1 - Math.exp(-1 / (0.15 * FPS)), rel = 1 - Math.exp(-1 / (0.5 * FPS));
  for (let f = 0; f < n; f++) {
    const obj = db + (voz[f] ? duck : 0);
    g += (obj - g) * (obj < g ? att : rel);
    const t = f / FPS;
    const fade = Math.min(1, t / 0.6, (dur - t) / 1.2);
    out.push(Math.round(10 ** (g / 20) * Math.max(0, fade) * 10000) / 10000);
  }
  return out;
};

// ── el plan ──────────────────────────────────────────────────────────────────────────────────────────────────────
export const crearPlan = (ep: Episodio, palabras: Palabra[], duracion: number): Plan => {
  const avisos: string[] = [];
  const pal = [...palabras].sort((a, b) => a.inicio - b.inicio);
  const escIdx = escenaDePalabras(ep, pal);

  // 1) tiempos de escena: de la primera a la última palabra de cada una (regla 1)
  const rangos = ep.escenas.map((_, k) => {
    const idx = escIdx.map((e, i) => (e === k ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) avisos.push(`La escena ${ep.escenas[k].id} no tiene palabras en el audio`);
    return { i0: idx[0] ?? -1, i1: idx[idx.length - 1] ?? -1 };
  });
  const inicios = ep.escenas.map((_, k) => {
    if (k === 0) return 0;
    const { i0 } = rangos[k];
    const prevFin = rangos[k - 1].i1 >= 0 ? pal[rangos[k - 1].i1].fin : 0;
    if (i0 < 0) return prevFin;
    return Math.min(pal[i0].inicio, Math.max(prevFin + 0.02, pal[i0].inicio - 0.05));
  });
  if (inicios.length > 1 && inicios[1] < INTRO_MIN) {
    avisos.push(`La intro dura ${inicios[1].toFixed(2)} s: se alarga a ${INTRO_MIN} s`);
    inicios[1] = INTRO_MIN;
  }
  const kCta = ep.escenas.length - 1;
  if (duracion - inicios[kCta] < CTA_MIN) inicios[kCta] = duracion - CTA_MIN;
  for (let k = 1; k < inicios.length; k++) inicios[k] = Math.max(inicios[k], inicios[k - 1] + 0.5);
  const fines = inicios.map((_, k) => (k + 1 < inicios.length ? inicios[k + 1] : duracion));

  // 2) lienzos: una escena abre un lienzo nuevo salvo que su imagen sea «continuar»
  const lienzoDe: number[] = [];
  const grupos: number[][] = [];
  ep.escenas.forEach((e, k) => {
    const img = typeof e.imagen === "string" ? null : e.imagen;
    if (k > 0 && img?.tipo === "continuar") grupos[grupos.length - 1].push(k);
    else grupos.push([k]);
    lienzoDe.push(grupos.length - 1);
  });

  const lienzos: Lienzo[] = grupos.map((g, idx) => {
    const e0 = ep.escenas[g[0]];
    const imagen: Imagen = typeof e0.imagen === "string" ? { tipo: "titular", titulo: Array.isArray(e0.texto) ? e0.texto[0] : e0.texto ?? e0.imagen } : e0.imagen;
    const inicio = inicios[g[0]], fin = fines[g[g.length - 1]];
    const desde = Math.max(0, rangos[g[0]].i0);
    const ctx: Ctx = { ep, inicio, fin, at: resolver(pal, desde, inicio, avisos) };
    const medir = MEDIDORES[imagen.tipo];
    if (!medir) throw new Error(`Tipo de imagen desconocido: ${imagen.tipo}`);
    const medida = medir(imagen as never, ctx);
    return { idx, inicio, fin, entrada: fin, escenas: g.map((k) => ep.escenas[k].id), imagen, medida, planos: [] as Plano[] };
  });

  // 2b) las etiquetas también son focos: la cámara encuadra la etiqueta y lo que señala
  const etiquetasDe = ep.escenas.map((e, k) => {
    const L = lienzos[lienzoDe[k]];
    const ctx = resolver(pal, Math.max(0, rangos[k].i0), inicios[k], avisos);
    return (e.etiquetas ?? []).map((et) => {
      const obj = L.medida.elementos[et.apunta];
      const t = ctx(et.en, inicios[k] + 0.3);
      if (!obj) avisos.push(`La etiqueta «${et.texto}» apunta a «${et.apunta}», que no existe en la imagen`);
      else L.medida.focos.push({ t, rect: unir(obj, geometriaEtiqueta(obj, et.texto, et.lado).caja) });
      return { ...et, t };
    });
  });
  lienzos.forEach((L, idx) => {
    // zoom de entrada al lienzo siguiente: 0,45–0,75 s, y nunca antes de que se vea lo último que aparece
    if (idx < lienzos.length - 1 && L.medida.portal) {
      const ultimoFoco = Math.max(L.inicio, ...L.medida.focos.map((f) => f.t).filter((t) => t < L.fin));
      const tz = Math.min(0.75, Math.max(0.45, 0.3 * (L.fin - L.inicio)), Math.max(0.45, L.fin - ultimoFoco - 0.35));
      L.entrada = L.fin - tz;
    }
    L.planos = planos(L.medida, L.inicio, L.entrada, pal, idx === 0);
  });

  // 3) escenas: textos en pantalla (cambian con los planos), pasos y etiquetas
  const escenas: EscenaPlan[] = ep.escenas.map((e, k) => {
    const L = lienzos[lienzoDe[k]];
    const ctx = resolver(pal, Math.max(0, rangos[k].i0), inicios[k], avisos);
    const lista = e.texto === undefined ? [] : Array.isArray(e.texto) ? e.texto : [e.texto];
    const cortes = L.planos.map((p) => p.inicio).filter((t) => t > inicios[k] + 0.4 && t < fines[k] - 0.6);
    const textos = lista.map((texto, i) => ({
      texto,
      t: i === 0 ? inicios[k] : cortes[i - 1] ?? inicios[k] + ((fines[k] - inicios[k]) * i) / lista.length,
    }));
    const ultimaPal = rangos[k].i1 >= 0 ? pal[rangos[k].i1].fin : fines[k];
    const paso = e.paso ? { n: e.paso, t: rangos[k].i0 >= 0 ? pal[rangos[k].i0].inicio : inicios[k], completo: ctx(e.pasoCompleto, ultimaPal + 0.05) } : undefined;
    const etiquetas = etiquetasDe[k];
    // regla 7: una cifra en la voz necesita su fuente
    const cifras = e.voz.replace(/(paso|episodio)\s+\d+/gi, "").match(/\d[\d.,]*\s*%?/g);
    const conFuente = typeof e.imagen !== "string" && e.imagen.tipo === "dato" && !!e.imagen.dato.fuente;
    if (cifras && !conFuente) avisos.push(`La escena ${e.id} dice una cifra (${cifras.join(", ")}) sin dato ni fuente`);
    return { id: e.id, inicio: inicios[k], fin: fines[k], lienzo: lienzoDe[k], textos, paso, etiquetas };
  });

  // 4) sonido: golpe y tick de los pasos, entrada por cada portal, pop de etiquetas y los de cada imagen
  const eventos: Evento[] = [];
  lienzos.forEach((L) => {
    if (L.entrada < L.fin) eventos.push({ t: L.entrada - 0.05, sfx: "whoosh", vol: 0.3 });
    (L.medida as Medida & { eventos?: Evento[] }).eventos?.forEach((ev) => eventos.push(ev));
  });
  escenas.forEach((e) => {
    if (e.paso) {
      eventos.push({ t: e.paso.t + 0.16, sfx: "golpe", vol: 0.5 });
      eventos.push({ t: e.paso.completo, sfx: "tick", vol: 0.5 });
    }
    e.etiquetas.forEach((et) => eventos.push({ t: et.t, sfx: "pop", vol: 0.25 }));
  });

  const mus = ep.musica;
  return {
    fps: FPS,
    duracion,
    frames: Math.round(duracion * FPS),
    palabras: pal,
    escenas,
    lienzos,
    subtitulos: subtitulos(pal, escIdx),
    eventos: eventos.filter((ev) => ev.t >= 0 && ev.t < duracion).sort((a, b) => a.t - b.t),
    musica: mus ? envolventeMusica(pal, duracion, mus.db ?? -20, mus.duckingDb ?? -8) : [],
    avisos,
  };
};

// ── cámara en un instante (la usa la vista) ──────────────────────────────────────────────────────────────────────
export type Cam = { cx: number; cy: number; s: number; rot: number; giro: number };
export const IDENTIDAD: Cam = { cx: W / 2, cy: H / 2, s: 1, rot: 0, giro: 0 };
const easeIO = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);

/** Interpola dos encuadres: la escala en logarítmico y el centro como un zoom hacia un punto fijo. */
export const camino = (a: Cam, b: Cam, u: number): Cam => {
  const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * u);
  const wa = 1 / a.s, wb = 1 / b.s, w = 1 / s;
  const k = Math.abs(wa - wb) < 1e-6 ? u : (wa - w) / (wa - wb);
  return { s, cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, rot: a.rot + (b.rot - a.rot) * u, giro: a.giro + (b.giro - a.giro) * u };
};

const camPlano = (p: Plano, t: number): Cam => {
  const d = Math.min(1, Math.max(0, (t - p.inicio) / Math.max(0.01, p.fin - p.inicio)));
  return { cx: p.cx, cy: p.cy, s: p.s * (1 + 0.035 * d), rot: p.rot, giro: p.giro * (1 - 0.3 * d) };
};

export const escalaPortal = (L: Lienzo) => {
  const p = L.medida.portal!;
  return Math.max(p.w / W, p.h / H);
};

export const camara = (L: Lienzo, t: number): Cam => {
  const P = L.planos;
  if (!P.length) return IDENTIDAD;
  const enPlano = (tt: number): Cam => {
    let j = P.findIndex((p) => tt < p.fin);
    if (j < 0) j = P.length - 1;
    const p = P[j];
    const actual = camPlano(p, tt);
    const prev = j > 0 ? camPlano(P[j - 1], p.inicio) : L.idx > 0 ? IDENTIDAD : null;
    if (!prev || (p.corte && j > 0)) return actual;
    const u = Math.min(1, Math.max(0, (tt - p.inicio) / (j === 0 ? 0.45 : MOV)));
    return camino(prev, actual, easeIO(u));
  };
  if (t < L.entrada || !L.medida.portal) return enPlano(t);
  const p = L.medida.portal;
  const k = escalaPortal(L);
  const destino: Cam = { cx: p.x + p.w / 2, cy: p.y + p.h / 2, s: 1 / k, rot: 0, giro: 0 };
  const u = Math.min(1, Math.max(0, (t - L.entrada) / (L.fin - L.entrada)));
  return camino(enPlano(L.entrada), destino, easeIO(u));
};
