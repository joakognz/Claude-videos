export const U = 100;
const C30 = Math.cos(Math.PI / 6);

export type P2 = [number, number];

/** Proyección isométrica: x hacia abajo-derecha, y hacia abajo-izquierda, z hacia arriba. */
export const iso = (x: number, y: number, z = 0): P2 => [
  (x - y) * C30 * U,
  (x + y) * 0.5 * U - z * U,
];

export const pts = (list: P2[]) => list.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

/** Matriz SVG para dibujar en coordenadas locales (u, v) de la cara +x (u sobre +y, v hacia arriba). */
export const faceX = (x: number, y0: number) => {
  const [e, f] = iso(x, y0, 0);
  return `matrix(${-C30 * U} ${0.5 * U} 0 ${-U} ${e} ${f})`;
};
/** Matriz SVG para la cara +y (u sobre +x, v hacia arriba). */
export const faceY = (x0: number, y: number) => {
  const [e, f] = iso(x0, y, 0);
  return `matrix(${C30 * U} ${0.5 * U} 0 ${-U} ${e} ${f})`;
};
/** Matriz para el plano del suelo (u sobre +x, v sobre +y) a altura z. */
export const ground = (z = 0) => {
  const [e, f] = iso(0, 0, z);
  return `matrix(${C30 * U} ${0.5 * U} ${-C30 * U} ${0.5 * U} ${e} ${f})`;
};
