import { VO } from "./vo";

const [eq, ws, det, typ, dep] = VO;
const dur = (l: { from: number; to: number }) => l.to - l.from;

// Scene timing (seconds), derived from the voice-over so visuals follow the
// narration. Regenerate the VO and everything shifts with it.
export const T = {
  zoomEnd: 1.2, // cab view -> full-screen G5
  menuTap: eq.from + 1.0, // tap Menu -> Applications
  appsOpen: eq.from + 1.25,
  emTap: eq.from + dur(eq) * 0.62, // "...Equipment Manager"
  emOpen: eq.from + dur(eq) * 0.62 + 0.25,
  syncDone: eq.to + 0.1,
  backTap: ws.from + 0.15, // back to Applications
  appsAgain: ws.from + 0.4,
  wsTap: ws.from + dur(ws) * 0.55, // "...Work Setup"
  wsOpen: ws.from + dur(ws) * 0.55 + 0.25,
  details: det.from - 0.1,
  detailsTypeFrom: det.from + 0.5,
  detailsTypeTo: det.to - 0.2,
  type: typ.from - 0.1,
  typeOpen: typ.from + 0.35,
  typePick: typ.from + dur(typ) * 0.7,
  depth: dep.from - 0.1,
  depthFrom: dep.from + 0.9,
  depthTo: dep.from + dur(dep) * 0.6,
  saveTap: dep.to - 0.1,
  saved: dep.to + 0.15,
  end: dep.to + 1.4,
} as const;

// Example values shown on screen. Replace with your site's real standards.
export const SAMPLE = {
  operator: "Ahmad Fauzi",
  operatorId: "OPR-0217",
  typeOptions: ["BJK-01 · Bajak I", "BJK-02 · Bajak II", "GRU-01 · Garu", "KAI-01 · Kair"],
  typeIndex: 0,
  depthCm: 30,
  implement: "Bajak Piringan (Disc Plow)",
} as const;
