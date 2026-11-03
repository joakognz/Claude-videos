import * as THREE from "three";

/**
 * A sharpened hexagonal pencil, tip at the origin, body along +Y (1 world unit ≈ 2 cm).
 * Surface radius at angle φ and height y = min(hexagon, sharpened cone), which gives the scalloped
 * paint edge where the blade cut through the lacquer. Regions: graphite (cone thinner than the lead),
 * lacquer (still on the hexagon), wood (the cone in between).
 */
export const R_IN = 0.17; // hexagon inradius (flat to flat 6.8 mm)
export const R_CORNER = R_IN / Math.cos(Math.PI / 6);
export const R_CORE = 0.05; // lead Ø 2 mm
export const L_CONE = 1.0; // sharpened length (20 mm)
export const L_BODY = 7.0;
const SLOPE = R_CORNER / L_CONE;
const BLUNT = 0.003; // a pencil point is never a needle: a blunt, rounded end (hyperbolic profile)

/** Cone radius at height y above the tip: r ≈ slope·√(2·b·y) at the point (rounded), slope·(y+b) further up. */
export const coneR = (y: number) => SLOPE * Math.sqrt(Math.max(0, y * (y + 2 * BLUNT)));
/** Hexagon radius at angle φ (corners at 30°, 90°, …; slightly eased so the edges catch light). */
export const hexR = (phi: number) => {
  const a = ((((phi + Math.PI / 6) % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3)) - Math.PI / 6;
  return Math.min(R_IN / Math.cos(a), R_CORNER - 0.004);
};
export const Y_LEAD = (() => {
  let lo = 0;
  let hi = L_CONE;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (coneR(m) < R_CORE) lo = m;
    else hi = m;
  }
  return lo;
})();

export const surfR = (phi: number, y: number) => Math.min(hexR(phi), coneR(y));

const NPHI = 288;
const ROWS_TIP = 360;
const Y_TIP_END = L_CONE * 1.12;

const rowsY = () => {
  const ys: number[] = [];
  for (let i = 0; i <= ROWS_TIP; i++) ys.push(Y_TIP_END * (i / ROWS_TIP) ** 1.7);
  for (let i = 1; i <= 8; i++) ys.push(Y_TIP_END + ((L_BODY - Y_TIP_END) * i) / 8);
  return ys;
};

export type PencilGeo = { graphite: THREE.BufferGeometry; wood: THREE.BufferGeometry; paint: THREE.BufferGeometry };

/** Three geometries sharing one vertex buffer (one per material), split per quad by region. */
export const makePencil = (): PencilGeo => {
  const ys = rowsY();
  const nr = ys.length;
  const pos = new Float32Array(nr * (NPHI + 1) * 3);
  const uv = new Float32Array(nr * (NPHI + 1) * 2);
  for (let r = 0; r < nr; r++) {
    for (let k = 0; k <= NPHI; k++) {
      const phi = (k / NPHI) * Math.PI * 2;
      const rad = surfR(phi, ys[r]);
      const i = r * (NPHI + 1) + k;
      pos[i * 3] = Math.cos(phi) * rad;
      pos[i * 3 + 1] = ys[r];
      pos[i * 3 + 2] = Math.sin(phi) * rad;
      uv[i * 2] = k / NPHI;
      uv[i * 2 + 1] = ys[r] / 1.2;
    }
  }
  const idx: Record<"graphite" | "wood" | "paint", number[]> = { graphite: [], wood: [], paint: [] };
  for (let r = 0; r < nr - 1; r++) {
    const ym = (ys[r] + ys[r + 1]) / 2;
    for (let k = 0; k < NPHI; k++) {
      const pm = ((k + 0.5) / NPHI) * Math.PI * 2;
      const region = ym < Y_LEAD ? "graphite" : hexR(pm) <= coneR(ym) ? "paint" : "wood";
      const a = r * (NPHI + 1) + k;
      const b = a + 1;
      const c = a + NPHI + 1;
      const d = c + 1;
      // wound so the faces point outwards
      idx[region].push(a, c, b, b, c, d);
    }
  }
  const base = new THREE.BufferGeometry();
  base.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  base.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  const all: number[] = [...idx.graphite, ...idx.wood, ...idx.paint];
  base.setIndex(all);
  base.computeVertexNormals();
  const normal = base.getAttribute("normal");
  const make = (ix: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", base.getAttribute("position"));
    g.setAttribute("normal", normal);
    g.setAttribute("uv", base.getAttribute("uv"));
    g.setIndex(ix);
    g.computeBoundingSphere();
    return g;
  };
  return { graphite: make(idx.graphite), wood: make(idx.wood), paint: make(idx.paint) };
};

/**
 * Wireframe of the same surface: lines along the pencil every 7.5° (hexagon edges included) and
 * rings, dense near the tip. Segments are sorted by height so the mesh can be redrawn from the tip.
 */
export const makePencilWire = (yMax = 5.5) => {
  const along: number[] = [];
  for (let i = 0; i <= 150; i++) along.push(yMax * (i / 150) ** 1.9);
  const rings: number[] = [];
  for (let i = 1; i <= 70; i++) rings.push(yMax * (i / 70) ** 2.1);
  const N = 48;
  const RN = 96;
  const segs: { p: number[]; q: number[]; key: number }[] = [];
  for (let k = 0; k < N; k++) {
    const phi = (k / N) * Math.PI * 2;
    for (let j = 0; j < along.length - 1; j++) {
      const r0 = surfR(phi, along[j]);
      const r1 = surfR(phi, along[j + 1]);
      segs.push({ p: [phi, along[j], r0], q: [phi, along[j + 1], r1], key: along[j] });
    }
  }
  for (const y of rings) {
    for (let k = 0; k < RN; k++) {
      const p0 = (k / RN) * Math.PI * 2;
      const p1 = ((k + 1) / RN) * Math.PI * 2;
      segs.push({ p: [p0, y, surfR(p0, y)], q: [p1, y, surfR(p1, y)], key: y });
    }
  }
  segs.sort((a, b) => a.key - b.key);
  const cyl = new Float32Array(segs.length * 6); // (phi, y, r) per end
  const key = new Float32Array(segs.length);
  segs.forEach((sg, i) => {
    cyl.set(sg.p, i * 6);
    cyl.set(sg.q, i * 6 + 3);
    key[i] = sg.key;
  });
  return { cyl, key };
};

/** Index of the first element whose key exceeds `k` (keys sorted ascending). */
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
