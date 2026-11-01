import { VO } from "./vo";

const [, devices, status, field] = VO;

// Scene timing (seconds), derived from the voice-over durations so the
// visuals follow the narration. Regenerate the VO and these shift with it.
export const T = {
  intro: 0, // establishing shot: tractor in the sugarcane field
  starfire: devices.from - 0.2, // zoom to StarFire 7500 on the cab roof
  // switch to the G5 roughly when the narration reaches "Display ..."
  g5: devices.from + (devices.to - devices.from) * 0.5,
  status: status.from - 0.2, // Status Center popup, Accuracy fills to 100%
  field: field.from - 0.2, // zoom out, draw Boundary + AB-Line
  end: field.to + 0.8,
} as const;

// World layout (isometric world units).
export const FIELD = { x0: 0, x1: 40, y0: 0, y1: 32 } as const;
export const BOUNDARY = { x0: -1, x1: 41, y0: -1, y1: 41 } as const;
export const TRACTOR_Y = 35;
export const TRACTOR_PARK_X = 4;
export const TRACTOR_END_X = 26;
export const AB = { ax: 2, bx: 38, y: TRACTOR_Y + 1.3 } as const;
