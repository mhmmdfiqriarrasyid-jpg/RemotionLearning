// Generate a partisi's voice-over with ElevenLabs.
//
// Requires:
//   ELEVENLABS_API_KEY  – your API key (set it as an environment variable,
//                         never commit it)
//   ELEVENLABS_VOICE_ID – the voice to use
//
// Run from the repo root (partisi name = folder under src/):
//   node scripts/generate-voiceover-elevenlabs.ts partisi2
// In the cloud container, prefix with NODE_USE_ENV_PROXY=1.
//
// Reads src/<partisi>/vo-lines.json ({ id, text, speak? }[]) and writes
// public/voiceover/<partisi>/<id>.mp3 plus manifest.json. The video reads
// manifest.json for file names and durations, so re-render afterwards.
// Pass line ids after the partisi name to regenerate only those lines.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type LineDef = { id: string; text: string; speak?: string };

const [part, ...onlyIds] = process.argv.slice(2);
if (!part) {
  console.error("Usage: node scripts/generate-voiceover-elevenlabs.ts <partisi> [lineId...]");
  process.exit(1);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID;
if (!apiKey || !voiceId) {
  console.error("Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID first.");
  process.exit(1);
}

const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
const lines = JSON.parse(readFileSync(path.join("src", part, "vo-lines.json"), "utf8")) as LineDef[];
const outDir = path.join("public", "voiceover", part);
const manifestPath = path.join(outDir, "manifest.json");
mkdirSync(outDir, { recursive: true });

const manifest: Record<string, { file: string; duration: number }> = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : {};

type TimestampResponse = {
  audio_base64: string;
  alignment: { character_end_times_seconds: number[] } | null;
};

const spoken = lines.map((l) => l.speak ?? l.text);

for (const [i, line] of lines.entries()) {
  if (onlyIds.length > 0 && !onlyIds.includes(line.id)) continue;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: spoken[i],
        model_id: MODEL_ID,
        // Neighbouring lines keep the intonation continuous across files.
        previous_text: spoken.slice(0, i).join(" ") || undefined,
        next_text: spoken.slice(i + 1).join(" ") || undefined,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2 },
      }),
    },
  );
  if (!res.ok) {
    console.error(`${line.id}: HTTP ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const data = (await res.json()) as TimestampResponse;
  const file = `${line.id}.mp3`;
  writeFileSync(path.join(outDir, file), Buffer.from(data.audio_base64, "base64"));
  const ends = data.alignment?.character_end_times_seconds ?? [];
  // End of the last spoken character, plus a short tail.
  const duration = Number(((ends[ends.length - 1] ?? 0) + 0.15).toFixed(3));
  manifest[line.id] = { file: `voiceover/${part}/${file}`, duration };
  console.log(`${file}: ${duration}s`);
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
