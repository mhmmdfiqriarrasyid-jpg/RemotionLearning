// Isometric (2.5D) projection helpers.
// World units: x = east, y = south, z = up. Visible faces: top (+z), +x, +y.

export const UNIT = 24; // pixels per world unit at camera scale 1
const COS30 = Math.cos(Math.PI / 6);

export type Pt = readonly [number, number];

export const iso = (x: number, y: number, z = 0): Pt => [
  (x - y) * COS30 * UNIT,
  (x + y) * 0.5 * UNIT - z * UNIT,
];

export const pts = (points: readonly Pt[]) =>
  points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");

export type BoxColors = {
  readonly top: string;
  readonly front: string; // +x face
  readonly side: string; // +y face
};

// Returns the three visible face polygons of an axis-aligned box.
export const boxFaces = (
  x: number,
  y: number,
  z: number,
  dx: number,
  dy: number,
  dz: number,
) => {
  const x1 = x + dx;
  const y1 = y + dy;
  const z1 = z + dz;
  return {
    top: [iso(x, y, z1), iso(x1, y, z1), iso(x1, y1, z1), iso(x, y1, z1)],
    front: [iso(x1, y, z), iso(x1, y1, z), iso(x1, y1, z1), iso(x1, y, z1)],
    side: [iso(x, y1, z), iso(x1, y1, z), iso(x1, y1, z1), iso(x, y1, z1)],
  };
};

// Circle lying in the x-z plane (e.g. a wheel seen from the +y side).
export const circleXZ = (
  cx: number,
  y: number,
  cz: number,
  r: number,
  segments = 28,
): Pt[] =>
  Array.from({ length: segments }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return iso(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r);
  });

// Circle lying in the x-y plane (flat on the ground or a roof).
export const circleXY = (
  cx: number,
  cy: number,
  z: number,
  r: number,
  segments = 28,
): Pt[] =>
  Array.from({ length: segments }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return iso(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z);
  });
