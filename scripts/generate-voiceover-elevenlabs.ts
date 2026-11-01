// Generate the Partisi 1 voice-over with ElevenLabs.
//
// Requires:
//   ELEVENLABS_API_KEY  – your API key (set it as an environment variable,
//                         never commit it)
//   ELEVENLABS_VOICE_ID – the voice to use (pick one in the ElevenLabs Voice
//                         Library that sounds good in Indonesian)
//
// Run from the repo root:
//   node scripts/generate-voiceover-elevenlabs.ts
//
// Writes public/voiceover/partisi1/<id>.mp3 and manifest.json. The video
// reads manifest.json for file names and durations, so re-render afterwards.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const LINES = [
  {
    id: "01-intro",
    text: "Sebelum unit turun ke lapangan, pastikan dua perangkat utama siap beroperasi:",
  },
  {
    id: "02-devices",
    text: "GPS StarFire 7500, dan Display CommandCenter G5.",
  },
  {
    id: "03-status",
    text: "Buka Status Center, pastikan nilai Accuracy telah mencapai angka seratus persen penuh.",
  },
  {
    id: "04-field",
    text: "Begitu masuk ke area kerja, langsung tentukan Boundary lokasi, serta jalur kerja AB-Line yang benar.",
  },
];

const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
const OUT_DIR = path.join("public", "voiceover", "partisi1");

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID;
if (!apiKey || !voiceId) {
  console.error("Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID first.");
  process.exit(1);
}

type TimestampResponse = {
  audio_base64: string;
  alignment: { character_end_times_seconds: number[] } | null;
};

mkdirSync(OUT_DIR, { recursive: true });
const manifest: Record<string, { file: string; duration: number }> = {};

for (const line of LINES) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: line.text,
        model_id: MODEL_ID,
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
  writeFileSync(path.join(OUT_DIR, file), Buffer.from(data.audio_base64, "base64"));
  const ends = data.alignment?.character_end_times_seconds ?? [];
  // End of the last spoken character, plus a short tail.
  const duration = Number(((ends[ends.length - 1] ?? 0) + 0.15).toFixed(3));
  manifest[line.id] = { file: `voiceover/partisi1/${file}`, duration };
  console.log(`${file}: ${duration}s`);
}

writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
