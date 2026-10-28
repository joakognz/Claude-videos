// Fixed isometric camera: world units on the ground plane (x to the lower right, y to the lower left), z up.
export const U = 58; // px per world unit
export const OX = 540;
export const OY = 1000;
const CX = 0.8660254 * U;
const CY = 0.5 * U;

export type P = [number, number];
export const iso = (x: number, y: number, z = 0): P => [OX + (x - y) * CX, OY + (x + y) * CY - z * U];

export const pts = (list: P[]) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

export type Box = { x0: number; x1: number; y0: number; y1: number; z0?: number; z1: number };

/** The three visible faces of an axis-aligned box, as polygon point strings. */
export const boxFaces = ({ x0, x1, y0, y1, z0 = 0, z1 }: Box) => ({
  top: pts([iso(x0, y0, z1), iso(x1, y0, z1), iso(x1, y1, z1), iso(x0, y1, z1)]),
  // face at y = y1 (lower-left on screen)
  left: pts([iso(x0, y1, z0), iso(x1, y1, z0), iso(x1, y1, z1), iso(x0, y1, z1)]),
  // face at x = x1 (lower-right on screen)
  right: pts([iso(x1, y0, z0), iso(x1, y1, z0), iso(x1, y1, z1), iso(x1, y0, z1)]),
});

/** A quad on the plane x = const (normal +x, lower-right orientation). */
export const quadX = (x: number, y0: number, y1: number, z0: number, z1: number) =>
  pts([iso(x, y0, z0), iso(x, y1, z0), iso(x, y1, z1), iso(x, y0, z1)]);
/** A quad on the plane y = const (normal +y, lower-left orientation). */
export const quadY = (y: number, x0: number, x1: number, z0: number, z1: number) =>
  pts([iso(x0, y, z0), iso(x1, y, z0), iso(x1, y, z1), iso(x0, y, z1)]);
/** A quad on the plane z = const. */
export const quadZ = (z: number, x0: number, x1: number, y0: number, y1: number) =>
  pts([iso(x0, y0, z), iso(x1, y0, z), iso(x1, y1, z), iso(x0, y1, z)]);

/** SVG transform that maps a flat 2D drawing onto the face y = const (x → along x, -y → up z). */
export const matY = (y: number, x: number, z: number) => {
  const [ox, oy] = iso(x, y, z);
  // unit x → (CX, CY), unit up → (0, -U); drawing coords are in world units
  return `matrix(${CX} ${CY} 0 ${U} ${ox} ${oy})`;
};
/** SVG transform that maps a flat 2D drawing onto the face x = const (drawing x runs along -y, so text reads left to right). */
export const matX = (x: number, y: number, z: number) => {
  const [ox, oy] = iso(x, y, z);
  return `matrix(${CX} ${-CY} 0 ${U} ${ox} ${oy})`;
};
/** SVG transform that maps a flat 2D drawing onto the ground plane z = const (drawing x → world x, drawing y → world y). */
export const matZ = (x: number, y: number, z: number) => {
  const [ox, oy] = iso(x, y, z);
  return `matrix(${CX} ${CY} ${-CX} ${CY} ${ox} ${oy})`;
};
/** Ground ellipse radii (screen px) for a world-space circle of radius r. */
export const groundEllipse = (r: number) => ({ rx: r * U * 1.2247449, ry: r * U * 0.7071068 });
