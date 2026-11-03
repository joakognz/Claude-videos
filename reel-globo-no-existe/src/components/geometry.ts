import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Balloon shape + needle dimple + ripples, shared by the solid skin and the wireframe so they match exactly. */
export type Deform = {
  inflate: number; // 0..0.06
  dimple: number; // depth in world units at the contact point
  ripple: number; // wire ripple amplitude
  ripplePhase: number;
  bob: number; // vertical float offset (world units)
};

export const TOP_Y = 1.1; // un-deformed crown height (radius 1, stretched 10 % vertically)

// crater around the needle: a wide soft bowl plus a tight cone at the tip (radians from the crown)
const SIG1 = 0.1;
const SIG2 = 0.032;

/** Writes the deformed position of unit direction (dx, dy, dz) into out[o..o+2]. */
export const deformInto = (dx: number, dy: number, dz: number, d: Deform, out: Float32Array, o: number) => {
  const s = 1 + d.inflate;
  // balloon silhouette: stretched vertically, narrower towards the knot
  const pinch = dy < 0 ? 1 - 0.28 * dy * dy : 1 + 0.03 * dy;
  let x = dx * s * pinch;
  let y = dy * s * TOP_Y;
  let z = dz * s * pinch;
  // dimple around the crown (angle from +Y)
  const th = Math.acos(Math.max(-1, Math.min(1, dy)));
  let push = 0;
  if (d.dimple > 0 && th < 1.2) {
    push = d.dimple * (0.7 * Math.exp(-((th / SIG1) ** 2)) + 0.3 * Math.exp(-((th / SIG2) ** 2)));
  }
  if (d.ripple > 0 && th < 1.6) {
    push += d.ripple * Math.sin(th * 60 - d.ripplePhase) * Math.exp(-th / 0.4) * Math.min(1, th / 0.03);
  }
  if (push !== 0) {
    const r = Math.hypot(x, y, z);
    const k = (r - push) / r;
    x *= k; y *= k; z *= k;
  }
  out[o] = x;
  out[o + 1] = y + d.bob;
  out[o + 2] = z;
};

/**
 * Skin as a surface of revolution around the needle axis: rings packed tightly near the crown
 * (≈0.002 rad apart where the needle presses, so the crater stays smooth in the macro) and
 * looser towards the knot. Seam and pole are welded so the normals are smooth.
 */
export const makeSkin = (rings = 620, around = 384) => {
  const pts: THREE.Vector2[] = [];
  // profile from the knot (bottom) up to the crown, so the faces wind outwards
  for (let i = rings; i >= 0; i--) {
    const th = Math.PI * (i / rings) ** 1.75;
    pts.push(new THREE.Vector2(Math.sin(th), Math.cos(th)));
  }
  let g: THREE.BufferGeometry = new THREE.LatheGeometry(pts, around);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g, 1e-7);
  const base = Float32Array.from(g.getAttribute("position").array as Float32Array);
  for (let i = 0; i < base.length; i += 3) {
    const l = Math.hypot(base[i], base[i + 1], base[i + 2]) || 1;
    base[i] /= l; base[i + 1] /= l; base[i + 2] /= l;
  }
  g.computeVertexNormals();
  return { geo: g, base };
};

/**
 * Cube-sphere grid ("a square mesh wrapped on the balloon"), crown face centred on the needle.
 * Returns line-segment endpoints as unit directions, sorted by distance from the crown (for the
 * vertex-by-vertex redraw), plus the grid's vertices (for the dots).
 */
export const makeGrid = (n: number, diagonals: boolean, crownOnly = false) => {
  const allFaces: [number[], number[], number[]][] = [
    [[0, 1, 0], [1, 0, 0], [0, 0, 1]],
    [[0, -1, 0], [1, 0, 0], [0, 0, -1]],
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    [[-1, 0, 0], [0, 1, 0], [0, 0, -1]],
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    [[0, 0, -1], [1, 0, 0], [0, -1, 0]],
  ];
  const faces = crownOnly ? allFaces.slice(0, 1) : allFaces;
  const dir = (f: [number[], number[], number[]], i: number, j: number) => {
    const u = Math.tan(((i / n) * 2 - 1) * (Math.PI / 4));
    const v = Math.tan(((j / n) * 2 - 1) * (Math.PI / 4));
    const [c, a, b] = f;
    const x = c[0] + u * a[0] + v * b[0];
    const y = c[1] + u * a[1] + v * b[1];
    const z = c[2] + u * a[2] + v * b[2];
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  };
  const segs: { p: number[]; q: number[]; key: number; w: number }[] = [];
  const verts: { p: number[]; key: number }[] = [];
  const key = (p: number[], q?: number[]) => Math.acos(Math.max(-1, Math.min(1, q ? (p[1] + q[1]) / 2 : p[1])));
  for (const f of faces) {
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const p = dir(f, i, j);
        verts.push({ p, key: key(p) });
        if (i < n) { const q = dir(f, i + 1, j); segs.push({ p, q, key: key(p, q), w: 1 }); }
        if (j < n) { const q = dir(f, i, j + 1); segs.push({ p, q, key: key(p, q), w: 1 }); }
        if (diagonals && i < n && j < n) { const q = dir(f, i + 1, j + 1); segs.push({ p, q, key: key(p, q) + 0.0001, w: 0.42 }); }
      }
    }
  }
  segs.sort((a, b) => a.key - b.key);
  verts.sort((a, b) => a.key - b.key);
  const segBase = new Float32Array(segs.length * 6);
  const segKey = new Float32Array(segs.length);
  const segCol = new Float32Array(segs.length * 6);
  segs.forEach((s, k) => {
    segBase.set(s.p, k * 6);
    segBase.set(s.q, k * 6 + 3);
    segKey[k] = s.key;
    segCol.fill(s.w, k * 6, k * 6 + 6);
  });
  const vBase = new Float32Array(verts.length * 3);
  const vKey = new Float32Array(verts.length);
  verts.forEach((v, k) => { vBase.set(v.p, k * 3); vKey[k] = v.key; });
  return { segBase, segKey, segCol, vBase, vKey };
};

/** Index of the first element whose key exceeds `k` (keys are sorted ascending). */
export const countBelow = (keys: Float32Array, k: number) => {
  let lo = 0;
  let hi = keys.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (keys[m] <= k) lo = m + 1;
    else hi = m;
  }
  return lo;
};
