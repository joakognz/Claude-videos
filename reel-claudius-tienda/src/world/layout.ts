import { V3 } from "../camera";
import { rand } from "../theme";

// World coordinates, axis-aligned (classic isometric): the camera looks from +x +z, so the shop's
// +z face is the lower-left face on screen and its +x face the lower-right one. The back walls (-x, -z)
// carry the shelves.
export const SHOP_HALF = 1.6;
export const SHOP_H = 2.3;
export const COUNTER: { c: V3; s: V3 } = { c: [0.45, 0.45, 0.55], s: [1.7, 0.9, 0.5] };
export const REGISTER: V3 = [1.0, 0.9, 0.55];
export const CLAUDIUS: V3 = [0.15, 0.62, -0.4];
export const CUBE = 0.2;

// shelves: boards along the back walls
export const LEVELS = [0.55, 1.05, 1.55];
export type Product = { p: V3; s: number; id: number };
export const PRODUCTS: Product[] = (() => {
  const out: Product[] = [];
  let id = 0;
  LEVELS.forEach((y, li) => {
    for (let k = 0; k < 6; k++) {
      const s = CUBE * (0.85 + rand(id + 3) * 0.3);
      out.push({ p: [-1.15 + k * 0.46, y + s / 2, -1.36], s, id: id++ });
    }
    for (let k = 0; k < 4; k++) {
      const s = CUBE * (0.85 + rand(id + 3) * 0.3);
      out.push({ p: [-1.36, y + s / 2, -0.9 + k * 0.48 + (li % 2) * 0.05], s, id: id++ });
    }
  });
  return out;
})();
// the ones that fly away in E3 (front-most, well spread) and where they land on the plaza
export const FLYERS = [12, 14, 16, 22, 24, 26, 3, 9];
export const flyLand = (i: number): V3 => {
  const a = -0.7 + (i / (FLYERS.length - 1)) * 1.4;
  const r = 2.7 + rand(i + 50) * 0.5;
  return [Math.cos(Math.PI / 4 + a) * r, 0.1, Math.sin(Math.PI / 4 + a) * r];
};
// price tags on the front edge of each board, under some products
export const TAGS = PRODUCTS.filter((_, i) => i % 2 === 0).map((p, i) => {
  const onBack = Math.abs(p.p[2] + 1.36) < 0.01;
  const pos: V3 = onBack ? [p.p[0], p.p[1] - p.s / 2 - 0.06, -1.16] : [-1.16, p.p[1] - p.s / 2 - 0.06, p.p[2]];
  return { p: pos, onBack, id: i };
});

// phase 2 modules
export const TOWER: V3 = [0.8, 0, -2.45];
export const TOWER_H = 2.5;
export const BALCONY = { x0: -1.6, x1: 0.1, z0: -1.6, z1: 0.1, y: SHOP_H };
export const BOSS: V3 = [-0.75, SHOP_H + 0.62, -0.75];

/** Offset from `p` along the locked camera's screen axes (right, up, towards the camera). */
const SR: V3 = [Math.SQRT1_2, 0, -Math.SQRT1_2];
const SU: V3 = [-0.408, 0.816, -0.408];
const SD: V3 = [0.577, 0.577, 0.577];
export const scr = (p: V3, r: number, u: number, d = 0): V3 => [0, 1, 2].map((i) => p[i] + SR[i] * r + SU[i] * u + SD[i] * d) as V3;

// E8: the deal sheet hovers to Claudius' right (on screen), so its arm of light reads across the frame
const CLAUDIUS_MID: V3 = [CLAUDIUS[0], CLAUDIUS[1] + 0.55, CLAUDIUS[2]];
export const DEAL: V3 = scr(CLAUDIUS_MID, 1.65, 0.45, 1.3);
export const SHOULDER: V3 = scr(CLAUDIUS_MID, 0.3, 0.05, 0.2);
// E9 lens
export const LENS: V3 = [0, 4.6, 0];
export const RAIL_R = 2.0;
