import * as THREE from "three";
import { CAIDA, FICHAS, FichasData } from "../theme";

export type V3 = [number, number, number];
/** Camera in three.js axes (y up). */
export type Cam = { pos: V3; target: V3; fov: number };

/** Blender (x, y depth, z up) → three.js (x, y up, z toward camera) — the glTF exporter's convention. */
export const b2t = (v: number[]): V3 => [v[0], v[2], -v[1]];

/** The camera the Cycles plate of frame f was rendered with. */
export const plateCam = (data: FichasData, f: number): Cam => {
  const c = data.cam[Math.min(Math.max(0, Math.round(f)), data.freeze)];
  return { pos: b2t(c.slice(0, 3)), target: b2t(c.slice(3, 6)), fov: c[6] };
};

/** Orbit parameters of a camera around its target (az from +z toward +x, el up). */
export type Orbit = { target: V3; dist: number; az: number; el: number; fov: number };
export const toOrbit = (c: Cam): Orbit => {
  const d: V3 = [c.pos[0] - c.target[0], c.pos[1] - c.target[1], c.pos[2] - c.target[2]];
  const dist = Math.hypot(...d);
  return { target: c.target, dist, az: Math.atan2(d[0], d[2]), el: Math.asin(d[1] / dist), fov: c.fov };
};
export const fromOrbit = (o: Orbit): Cam => ({
  pos: [
    o.target[0] + Math.sin(o.az) * Math.cos(o.el) * o.dist,
    o.target[1] + Math.sin(o.el) * o.dist,
    o.target[2] + Math.cos(o.az) * Math.cos(o.el) * o.dist,
  ],
  target: o.target,
  fov: o.fov,
});
const L = (a: number, b: number, p: number) => a + (b - a) * p;
export const mixOrbit = (a: Orbit, b: Orbit, p: number): Orbit => ({
  target: [L(a.target[0], b.target[0], p), L(a.target[1], b.target[1], p), L(a.target[2], b.target[2], p)],
  dist: Math.exp(L(Math.log(a.dist), Math.log(b.dist), p)),
  az: L(a.az, b.az, p),
  el: L(a.el, b.el, p),
  fov: L(a.fov, b.fov, p),
});

const scratch = new THREE.PerspectiveCamera(20, 1080 / 1920, 0.001, 20);
/** World point (three axes) → pixel on the 1080×1920 frame. */
export const project = (cam: Cam, p: V3): [number, number] => {
  scratch.fov = cam.fov;
  scratch.position.set(...cam.pos);
  scratch.up.set(0, 1, 0);
  scratch.lookAt(...cam.target);
  scratch.updateProjectionMatrix();
  scratch.updateMatrixWorld(true);
  const v = new THREE.Vector3(...p).project(scratch);
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920];
};

/** Tilt of every tile at real simulation time tau (linear between the 1 ms samples). */
export const tiltsAt = (tau: number): number[] => {
  const x = Math.max(0, tau / CAIDA.dt);
  const i = Math.min(CAIDA.phi.length - 2, Math.floor(x));
  const u = Math.min(1, x - i);
  const a = CAIDA.phi[i];
  const b = CAIDA.phi[i + 1];
  return a.map((v, k) => v + (b[k] - v) * u);
};

/** A point given in a tile's standing pose (three axes), moved with the tile rolling to tilt phi. */
export const placeOnTile = (i: number, phi: number, p: V3): V3 => {
  const t = FICHAS.tiles[i];
  const f = t.f;
  const a0 = t.axle;
  const d = [p[0] - a0[0], p[1] - a0[1], p[2] - a0[2]];
  const df = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
  const dy = d[1];
  const w = [d[0] - df * f[0] - dy * 0, d[1] - dy, d[2] - df * f[2]]; // remainder along the width axis (f is horizontal)
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  const nf = df * c + dy * s + FICHAS.rEdge * phi;
  const ny = -df * s + dy * c;
  return [a0[0] + nf * f[0] + w[0], a0[1] + ny + w[1], a0[2] + nf * f[2] + w[2]];
};
