/**
 * Sonidos de la librería del usuario (repo joakognz/sonidos-videos, copiados a public/sfx por scripts/sfx_libreria.py).
 * Cada bloque pide un grupo («woosh», «click», «glitch»…) y un nivel; aquí se elige el archivo:
 *  - el pico del archivo cae en el momento del evento (inicio = t − pico);
 *  - nunca el mismo archivo que uno de los dos anteriores; se rota por el grupo;
 *  - nunca dos woosh seguidos (woosh y zoom cuentan igual): el segundo se quita.
 */
import type { Evento } from "./nucleo";

export type Libreria = {
  grupos: Record<string, string[]>;
  archivos: Record<string, { origen: string; duracion: number; pico: number; vol: Record<"bajo" | "medio" | "fuerte", number> }>;
};

const ES_WOOSH = (g?: string) => g === "woosh" || g === "zoom";

export const asignarLibreria = (eventos: Evento[], lib: Libreria): Evento[] => {
  const orden = [...eventos].sort((a, b) => a.t - b.t);
  const rot: Record<string, number> = {};
  const usados: string[] = [];
  const out: Evento[] = [];
  for (const ev of orden) {
    if (!ev.grupo) continue;
    const prev = out[out.length - 1];
    if (ES_WOOSH(ev.grupo) && prev && ES_WOOSH(prev.grupo)) continue;
    const lista = lib.grupos[ev.grupo];
    if (!lista?.length) throw new Error(`Grupo de sonidos desconocido: ${ev.grupo}`);
    const k0 = rot[ev.grupo] ?? 0;
    let elegido: string | null = null;
    for (let i = 0; i < lista.length; i++) {
      const n = lista[(k0 + i) % lista.length];
      const a = lib.archivos[n];
      if (usados.slice(-2).includes(n)) continue;
      if (ev.desde == null && ev.t - a.pico < 0) continue;
      elegido = n;
      rot[ev.grupo] = (k0 + i + 1) % lista.length;
      break;
    }
    if (!elegido) continue; // nada encaja: silencio (sale en la lista de cues como hueco)
    const a = lib.archivos[elegido];
    usados.push(elegido);
    out.push({
      ...ev,
      src: elegido,
      pico: a.pico,
      vol: Math.min(1, a.vol[ev.nivel ?? "medio"] * (ev.vol ?? 1)),
      dur: Math.min(ev.dur ?? a.duracion, a.duracion - (ev.desde ?? 0)),
    });
  }
  return out;
};
