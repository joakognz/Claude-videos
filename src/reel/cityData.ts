import { rand } from "./anim";

export type Box = { x0: number; y0: number; x1: number; y1: number; h: number; seed: number; roof?: boolean };
export type Tree = { x: number; y: number; s: number };
export type Lamp = { x: number; y: number };

export const GREEN: Box = { x0: -0.9, y0: -3.0, x1: 0.9, y1: -1.5, h: 0.8, seed: 1 };
export const AMBER: Box = { x0: 1.7, y0: 1.5, x1: 3.3, y1: 3.0, h: 0.8, seed: 2 };

const EXT = 19;
// Calles (bandas de asfalto)
export const STREETS_Y: [number, number][] = [[-0.8, 0.8], [-7.9, -6.5], [6.5, 7.9], [-15.2, -13.8], [13.8, 15.2]];
export const STREETS_X: [number, number][] = [[3.9, 5.1], [-5.1, -3.9], [11.3, 12.5], [-12.5, -11.3]];
export const EXTENT = EXT;

// Puntos que no deben quedar tapados por edificios delanteros: [x, y, z]
const PROTECT: [number, number, number][] = [
  [0, -1.5, 0.0], [0, -2.2, 1.1], [0.9, -2.2, 0.4],
  [3.3, 2.2, 0.0], [2.6, 3.0, 0.0], [3.3, 2.2, 1.0], [2.5, 2.4, 1.2],
  [-2.8, 1.05, 0.0], [-2.0, 1.05, 0.3],
];

const inStreet = (a: number, b: number, bands: [number, number][], m: number) =>
  bands.some(([s0, s1]) => b > s0 - m && a < s1 + m);

const overlaps = (b: Box, o: Box, m = 0.15) =>
  b.x0 < o.x1 + m && b.x1 > o.x0 - m && b.y0 < o.y1 + m && b.y1 > o.y0 - m;

const buildCity = () => {
  const r = rand(42);
  const boxes: Box[] = [];
  const trees: Tree[] = [];
  const LOT = 1.55;
  const GAP = 0.18;
  for (let gx = -EXT; gx < EXT; gx += LOT + GAP) {
    for (let gy = -EXT; gy < EXT; gy += LOT + GAP) {
      const b: Box = { x0: gx, y0: gy, x1: gx + LOT, y1: gy + LOT, h: 1, seed: Math.floor(r() * 1e9) };
      if (inStreet(b.x0, b.x1, STREETS_X, 0.6) || inStreet(b.y0, b.y1, STREETS_Y, 0.6)) continue;
      if (overlaps(b, GREEN) || overlaps(b, AMBER)) continue;
      const cx = (b.x0 + b.x1) / 2;
      const cy = (b.y0 + b.y1) / 2;
      const d = Math.hypot(cx, cy);
      // Plazas con árboles de vez en cuando
      if (r() < 0.09 && d > 3) {
        trees.push({ x: cx - 0.3, y: cy - 0.2, s: 0.8 + r() * 0.4 }, { x: cx + 0.35, y: cy + 0.3, s: 0.7 + r() * 0.4 });
        continue;
      }
      let h = 0.9 + Math.pow(r(), 1.6) * 4.2 + (d > 8 ? r() * 1.5 : 0);
      // Vecinos del restaurante verde: bajos para que se lea bien
      if (Math.abs(cx) < 3.5 && cy < -1 && cy > -5) h = Math.min(h, 1.2 + r() * 1.1);
      // No tapar puntos protegidos
      for (const [px, py, pz] of PROTECT) {
        const dxy = Math.abs(cx - cy - (px - py));
        if (dxy < 2.2 && cx + cy > px + py) {
          const maxH = (cx + cy - (px + py)) * 0.5 + pz - 1.0;
          h = Math.min(h, Math.max(0.35, maxH));
        }
      }
      b.h = Math.round(h * 20) / 20;
      b.roof = r() < 0.45 && b.h > 0.8;
      boxes.push(b);
    }
  }
  // Plaza frente al ámbar (zona de terraza) con algunos árboles
  trees.push({ x: 1.0, y: 3.8, s: 0.9 }, { x: 2.7, y: 4.2, s: 0.8 }, { x: -2.4, y: 2.2, s: 0.9 });
  return { boxes, trees };
};

export const CITY = buildCity();

export const LAMPS: Lamp[] = [
  { x: -2.4, y: -1.2 }, { x: 2.3, y: -1.2 }, { x: -0.8, y: 1.2 }, { x: 1.2, y: 1.2 },
  { x: 3.6, y: 4.4 }, { x: 5.4, y: -2.6 }, { x: -3.6, y: -3.0 }, { x: 6.8, y: 1.2 }, { x: -6.0, y: -1.2 },
];

/** Nodos de la red de automatizaciones: edificios altos cercanos. */
export const NET_NODES = (() => {
  const cand = CITY.boxes
    .filter((b) => b.h > 1.8)
    .map((b) => ({ b, cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2 }))
    .filter((n) => Math.hypot(n.cx, n.cy) < 11 && Math.hypot(n.cx, n.cy) > 2.5);
  const r = rand(7);
  const picked: typeof cand = [];
  const shuffled = cand.map((c) => ({ c, k: r() })).sort((a, b) => a.k - b.k).map((o) => o.c);
  for (const c of shuffled) {
    if (picked.every((p) => Math.hypot(p.cx - c.cx, p.cy - c.cy) > 3.2)) picked.push(c);
    if (picked.length >= 14) break;
  }
  return picked.map((p) => ({ x: p.cx, y: p.cy, z: p.b.h }));
})();
