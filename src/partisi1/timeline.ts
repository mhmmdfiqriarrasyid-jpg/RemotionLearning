// Scene timing for Partisi 1 (in seconds). Adjust these once the real
// voice-over audio is recorded, so visuals stay in sync with the narration.
export const T = {
  intro: 0, // establishing shot: tractor in the sugarcane field
  starfire: 4, // zoom to StarFire 7500 on the cab roof
  g5: 6.5, // zoom into the cab to the CommandCenter G5
  status: 8.5, // Status Center popup, Accuracy bar fills to 100%
  field: 14, // zoom out, draw Boundary + AB-Line, tractor drives
  end: 20,
} as const;

// World layout (isometric world units).
export const FIELD = { x0: 0, x1: 40, y0: 0, y1: 32 } as const;
export const BOUNDARY = { x0: -1, x1: 41, y0: -1, y1: 41 } as const;
export const TRACTOR_Y = 35;
export const TRACTOR_PARK_X = 4;
export const TRACTOR_END_X = 26;
export const AB = { ax: 2, bx: 38, y: TRACTOR_Y + 1.3 } as const;
