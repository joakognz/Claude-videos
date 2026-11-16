/** EP.11 · utilidades compartidas por los bloques. */
import type { Linea } from "../../nucleo";
import type { PalabraTecleada } from "../../componentes/ep08/Pantallas";

/** Palabras de la voz desde `desde` (incluida) hasta el final de la escena, listas para teclearlas al ritmo de la voz. */
export const tramo = (L: Linea, E: string, desde: string, n = 0): PalabraTecleada[] => {
  const a = L.en(E, desde, n);
  return L.palabras
    .filter((p) => p.escena === E && p.inicio >= a - 1e-6)
    .map((p) => ({ w: p.texto.replace(/[«»"“”]/g, ""), at: p.inicio }));
};

/** Posiciones de una fila de tres tarjetas centrada en x = 540. */
export const FILA3 = (y: number, paso = 345) => [0, 1, 2].map((i) => ({ x: 540 + (i - 1) * paso, y }));
