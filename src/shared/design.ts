// Design tokens for the training videos (1920x1080). See docs/STANDAR-VISUAL.md.

export const FRAME = { w: 1920, h: 1080 } as const;

// Layout grid: 80 px safe margin, 60 px gutter.
export const GRID = {
  margin: 80,
  gutter: 60,
} as const;

// Spacing scale (px). Use only these values for gaps and padding.
export const SPACE = { xs: 8, s: 16, m: 24, l: 32, xl: 48, xxl: 80 } as const;

export const COLOR = {
  bg: "#f4f5f1",
  ink: "#1f2a22", // headings
  body: "#3b463e", // body text, subtitles
  muted: "#6b766e", // secondary text, inactive steps
  line: "#dfe3dc", // dividers
  accent: "#367c2b", // kicker, active step, checks
  warn: "#d92d20", // warnings and highlight boxes
  tap: "#ffd400", // tap rings on recordings
} as const;

export const FONT = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// Type scale. Every text on screen uses one of these styles.
export const TEXT = {
  display: { fontSize: 140, fontWeight: 800, lineHeight: 1.0, color: COLOR.ink },
  h1: { fontSize: 72, fontWeight: 800, lineHeight: 1.1, color: COLOR.ink },
  h2: { fontSize: 56, fontWeight: 800, lineHeight: 1.1, color: COLOR.ink },
  lead: { fontSize: 40, fontWeight: 400, lineHeight: 1.35, color: COLOR.body },
  body: { fontSize: 30, fontWeight: 400, lineHeight: 1.4, color: COLOR.body },
  item: { fontSize: 30, fontWeight: 600, lineHeight: 1.3, color: COLOR.ink },
  subtitle: { fontSize: 34, fontWeight: 500, lineHeight: 1.4, color: COLOR.body },
  kicker: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: COLOR.accent,
  },
} as const satisfies Record<string, React.CSSProperties>;

// Subtitles: at most 2 lines and this many characters per caption.
export const SUBTITLE_MAX_CHARS = 90;
