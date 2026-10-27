import { clamp, easeInCubic, easeInOutCubic, easeOutCubic, lerp } from "./anim";
import { iso } from "./iso";

/** Plano de cámara: centro (px del mundo), zoom y giro (grados). */
export type Shot = { cx: number; cy: number; zoom: number; roll: number };
export type Key = [number, Shot, ((p: number) => number)?];
export type CameraFn = (t: number) => Shot;

export const shot = (x: number, y: number, z: number, zoom: number, roll = 0): Shot => {
  const [cx, cy] = iso(x, y, z);
  return { cx, cy, zoom, roll };
};

export const drift = (a: Shot, dx: number, dy: number, dz: number, droll = 0): Shot => ({
  cx: a.cx + dx, cy: a.cy + dy, zoom: a.zoom * dz, roll: a.roll + droll,
});

export const zoomed = (a: Shot, k: number, droll = 0): Shot => ({ ...a, zoom: a.zoom * k, roll: a.roll + droll });

/** Transición "zoom a través": acelera hacia dentro, corta y el plano nuevo se asienta desde cerca. */
export const through = (t: number, from: Shot, to: Shot): Key[] => [
  [t - 0.24, from],
  [t, zoomed(from, 1.55, 4), easeInCubic],
  [t + 0.001, zoomed(to, 1.4, -4)],
  [t + 0.42, to, easeOutCubic],
];

/**
 * Cámara a partir de claves [tiempo, plano, easing?] y de los instantes con "golpe"
 * (zoom y giro que suben rápido y se asientan).
 */
export const createCamera = (keys: Key[], kicks: number[]): CameraFn => {
  const base = (t: number): Shot => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, a] = keys[i];
      const [t1, b, ease] = keys[i + 1];
      if (t <= t1) {
        const p = (ease ?? easeInOutCubic)(clamp((t - t0) / (t1 - t0)));
        return {
          cx: lerp(a.cx, b.cx, p),
          cy: lerp(a.cy, b.cy, p),
          zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), p)),
          roll: lerp(a.roll, b.roll, p),
        };
      }
    }
    return keys[keys.length - 1][1];
  };
  const kick = (t: number) => {
    let k = 0;
    let dir = 1;
    kicks.forEach((c, i) => {
      const d = t - c;
      if (d < 0 || d > 0.6) return;
      const v = d < 0.07 ? d / 0.07 : 1 - easeInOutCubic(clamp((d - 0.07) / 0.5));
      if (v > k) {
        k = v;
        dir = i % 2 === 0 ? 1 : -1;
      }
    });
    return { zoom: 1 + 0.065 * k, roll: 1.4 * k * dir };
  };
  return (t: number) => {
    const c = base(t);
    const k = kick(t);
    return { ...c, zoom: c.zoom * k.zoom, roll: c.roll + k.roll };
  };
};

/** Transformación SVG del mundo para un plano. */
export const worldTransform = (c: Shot) =>
  `translate(540 960) rotate(${c.roll}) scale(${c.zoom}) translate(${-c.cx} ${-c.cy})`;

/** Posición en pantalla (px) de un punto del mundo isométrico para un plano dado. */
export const project = (c: Shot, x: number, y: number, z = 0): [number, number] => {
  const [wx, wy] = iso(x, y, z);
  const dx = (wx - c.cx) * c.zoom;
  const dy = (wy - c.cy) * c.zoom;
  const r = (c.roll * Math.PI) / 180;
  return [540 + dx * Math.cos(r) - dy * Math.sin(r), 960 + dx * Math.sin(r) + dy * Math.cos(r)];
};

/** Desplazamiento máximo en pantalla (px) que produce la cámara durante el obturador. */
export const cameraTravel = (camera: CameraFn, t: number, fps: number, shutter: number) => {
  const dt = shutter / fps / 2;
  const a = camera(t - dt);
  const b = camera(t + dt);
  let max = 0;
  for (const [sx, sy] of [[0, 0], [1080, 0], [0, 1920], [1080, 1920], [540, 960]]) {
    const ra = (-a.roll * Math.PI) / 180;
    const ux = sx - 540;
    const uy = sy - 960;
    const wx = (ux * Math.cos(ra) - uy * Math.sin(ra)) / a.zoom + a.cx;
    const wy = (ux * Math.sin(ra) + uy * Math.cos(ra)) / a.zoom + a.cy;
    const rb = (b.roll * Math.PI) / 180;
    const vx = (wx - b.cx) * b.zoom;
    const vy = (wy - b.cy) * b.zoom;
    const nx = 540 + vx * Math.cos(rb) - vy * Math.sin(rb);
    const ny = 960 + vx * Math.sin(rb) + vy * Math.cos(rb);
    max = Math.max(max, Math.hypot(nx - sx, ny - sy));
  }
  return max;
};
