import manifest from "../../public/voiceover/partisi1/manifest.json";

// Voice-over lines. Audio files and durations come from manifest.json,
// written by scripts/generate-voiceover-elevenlabs.ts (or the offline
// Piper fallback scripts/generate-voiceover.py). Scene timing derives from it.
export const VO_LEAD = 0.3; // silence before the first line (s)
export const VO_GAP = 0.3; // silence between lines (s)

const LINES = [
  {
    id: "01-intro",
    text: "Sebelum unit turun ke lapangan, pastikan dua perangkat utama siap beroperasi:",
  },
  { id: "02-devices", text: "GPS StarFire 7500 dan Display CommandCenter G5." },
  {
    id: "03-status",
    text: "Buka Status Center, pastikan nilai Accuracy telah mencapai angka seratus persen penuh.",
  },
  {
    id: "04-field",
    text: "Begitu masuk ke area kerja, langsung tentukan Boundary lokasi serta jalur kerja AB-Line yang benar.",
  },
] as const;

type Id = (typeof LINES)[number]["id"];

export type VoLine = {
  readonly id: Id;
  readonly text: string;
  readonly file: string;
  readonly from: number; // seconds
  readonly to: number; // seconds
};

export const VO: VoLine[] = (() => {
  let t = VO_LEAD;
  return LINES.map((l) => {
    const entry = (manifest as Record<Id, { file: string; duration: number }>)[l.id];
    const d = entry.duration;
    const line = {
      id: l.id,
      text: l.text,
      file: entry.file,
      from: t,
      to: t + d,
    };
    t += d + VO_GAP;
    return line;
  });
})();
