import { VO } from "./vo";

// One scene per voice-over line; each scene starts with its line.
export const SCENES = [
  "intro",
  "why",
  "openMenu",
  "openSetup",
  "overview",
  "location",
  "equipment",
  "details",
  "type",
  "depth",
  "ok",
  "result",
  "recap",
] as const;
export type Scene = (typeof SCENES)[number];

export const sceneStart = (s: Scene) => (SCENES.indexOf(s) === 0 ? 0 : VO[SCENES.indexOf(s)].from - 0.15);
export const sceneEnd = (s: Scene) => {
  const i = SCENES.indexOf(s);
  return i + 1 < SCENES.length ? sceneStart(SCENES[i + 1]) : END;
};
export const line = (s: Scene) => VO[SCENES.indexOf(s)];
export const END = VO[VO.length - 1].to + 1.5;

export const sceneAt = (t: number): Scene => {
  let cur: Scene = SCENES[0];
  for (const s of SCENES) if (t >= sceneStart(s)) cur = s;
  return cur;
};

// Screen recordings from the PPT (G5 CommandCenter simulator), 30 fps.
export const FOOTAGE = {
  w: 1030,
  h: 626,
  before: "footage/worksetup-before.mp4",
  after: "footage/worksetup-after.mp4",
  stills: {
    beforeGuidance: "footage/before-guidance.jpg",
    beforeWorkSetup: "footage/before-worksetup.jpg",
    afterTop: "footage/after-worksetup-top.jpg",
    afterDetails: "footage/after-worksetup-details.jpg",
    afterGuidance: "footage/after-guidance.jpg",
  },
} as const;

// Segments of the recordings that are played, in source seconds.
export const CLIPS = {
  openMenu: { src: FOOTAGE.before, from: 0.3, to: 9.4 },
  openSetup: { src: FOOTAGE.after, from: 0.6, to: 2.9 },
  ok: { src: FOOTAGE.after, from: 17.3, to: 19.0 },
} as const;

// Taps visible in the recordings: source time and position (footage px).
export const TAPS = {
  openMenu: [
    { t: 2.2, x: 962, y: 572, label: "Menu" },
    { t: 3.9, x: 86, y: 197, label: "Applications" },
    { t: 6.0, x: 977, y: 475, label: "Scroll" },
    { t: 7.6, x: 718, y: 500, label: "Work Setup" },
  ],
  openSetup: [{ t: 2.35, x: 62, y: 572, label: "Setup" }],
  ok: [{ t: 18.2, x: 797, y: 571, label: "OK" }],
} as const;

// Regions of the Work Setup window (footage px).
export const REGIONS = {
  location: { x: 148, y: 100, w: 274, h: 102 },
  equipment: { x: 148, y: 204, w: 274, h: 188 },
  detailsHeader: { x: 148, y: 488, w: 274, h: 56 },
  details: { x: 148, y: 408, w: 274, h: 134 },
  workSummary: { x: 468, y: 100, w: 416, h: 444 },
  type: { x: 610, y: 178, w: 266, h: 42 },
  depth: { x: 610, y: 228, w: 266, h: 42 },
  label: { x: 30, y: 124, w: 194, h: 48 },
  ok: { x: 720, y: 550, w: 154, h: 42 },
} as const;
