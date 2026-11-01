# RemotionLearning

Project belajar [Remotion](https://www.remotion.dev): membuat video dengan React.

## Mulai

Butuh Node.js `^20.19.0 || ^22.13.0 || >=24`.

```bash
npm install
```

Buka Remotion Studio (preview di browser):

```bash
npm run dev
```

Render video ke `out/video.mp4`:

```bash
npx remotion render MyComp out/video.mp4
```

Render Partisi 1:

```bash
npx remotion render Partisi1-CheckDeviceUnit out/partisi1.mp4
```

### Voice-over Partisi 1

Audio VO dan durasinya dibaca dari `public/voiceover/partisi1/manifest.json`. Durasi tiap scene dan total video otomatis mengikuti file ini. Teks subtitle ada di `src/partisi1/vo.ts`.

**ElevenLabs (utama).** Butuh API key dan akses jaringan ke `api.elevenlabs.io`. Set environment variable `ELEVENLABS_API_KEY` dan `ELEVENLABS_VOICE_ID` (ID suara dari Voice Library ElevenLabs), lalu jalankan:

```bash
node scripts/generate-voiceover-elevenlabs.ts
```

Opsional: `ELEVENLABS_MODEL_ID` (default `eleven_multilingual_v2`). Teks yang diucapkan ada di script tersebut.

**Piper (cadangan offline, suara kurang natural).**

```bash
pip install piper-tts
```

```bash
curl -L -o voice.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-id_ID-news_tts-medium.tar.bz2 && tar xjf voice.tar.bz2
```

```bash
python3 scripts/generate-voiceover.py ./vits-piper-id_ID-news_tts-medium 0.88
```

Setelah membuat ulang VO, render ulang videonya.

Render satu frame sebagai gambar:

```bash
npx remotion still MyComp out/frame.png --frame=60
```

## Struktur

- `src/index.ts` — entry point, mendaftarkan root.
- `src/Root.tsx` — daftar semua composition.
- `src/Composition.tsx` — composition `MyComp` (1280×720, 30 fps, 3 detik): judul dan subjudul dengan animasi fade-in.
- `src/partisi1/` — composition `Partisi1-CheckDeviceUnit` (1920×1080, 30 fps, ±23,7 detik mengikuti durasi VO): scene isometrik traktor, cek StarFire 7500 & CommandCenter G5, popup Status Center (Accuracy 100%), lalu Boundary & AB-Line. Waktu tiap scene dihitung di `src/partisi1/timeline.ts` dari durasi VO.
- `public/` — aset (gambar, audio, video). Akses dengan `staticFile()`.
- `scripts/generate-voiceover-elevenlabs.ts` — generator VO ElevenLabs.
- `scripts/generate-voiceover.py` — generator VO offline (Piper).
- `remotion.config.ts` — konfigurasi CLI.
- `.claude/skills/` — Remotion Agent Skills resmi untuk Claude Code.

## Perintah lain

- `npm run lint` — ESLint + type check TypeScript.
- `npm run upgrade` — upgrade Remotion (juga memperbarui skills).

## Lisensi Remotion

Remotion gratis untuk individu dan tim hingga 3 orang. Perusahaan yang lebih besar butuh lisensi: https://www.remotion.pro/license
