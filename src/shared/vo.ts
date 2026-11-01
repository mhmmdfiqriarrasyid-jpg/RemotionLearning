// Builds a voice-over timeline from line definitions (src/<part>/vo-lines.json)
// and the audio manifest written by scripts/generate-voiceover-elevenlabs.ts.

export const VO_LEAD = 0.3; // silence before the first line (s)
export const VO_GAP = 0.3; // silence between lines (s)

export type VoLineDef = {
  readonly id: string;
  readonly text: string; // on-screen subtitle
  readonly speak?: string; // text sent to TTS, if different
};

export type VoManifest = Record<string, { file: string; duration: number }>;

export type VoLine = {
  readonly id: string;
  readonly text: string;
  readonly file: string;
  readonly from: number; // seconds
  readonly to: number; // seconds
};

export const buildVo = (lines: readonly VoLineDef[], manifest: VoManifest): VoLine[] => {
  let t = VO_LEAD;
  return lines.map((l) => {
    const entry = manifest[l.id];
    if (!entry) {
      throw new Error(`Missing voice-over audio for "${l.id}". Run the VO generator.`);
    }
    const line = { id: l.id, text: l.text, file: entry.file, from: t, to: t + entry.duration };
    t += entry.duration + VO_GAP;
    return line;
  });
};
