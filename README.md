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

Render Partisi 2:

```bash
npx remotion render Partisi2-WorkSetup out/partisi2.mp4
```

Render video Work Setup lengkap (±1:38, memakai rekaman layar G5 dari PPT):

```bash
npx remotion render WorkSetup-Lengkap out/worksetup.mp4
```

### Voice-over

Teks VO tiap partisi ada di `src/<partisi>/vo-lines.json` (`text` = subtitle, `speak` opsional = teks yang diucapkan jika berbeda). Audio dan durasinya dibaca dari `public/voiceover/<partisi>/manifest.json`; durasi tiap scene dan total video otomatis mengikuti file ini.

**ElevenLabs (utama).** Butuh API key dan akses jaringan ke `api.elevenlabs.io`. Set environment variable `ELEVENLABS_API_KEY` dan `ELEVENLABS_VOICE_ID`, lalu jalankan (contoh untuk Partisi 2):

```bash
node scripts/generate-voiceover-elevenlabs.ts partisi2
```

Tambahkan ID baris di belakangnya untuk membuat ulang baris tertentu saja, misalnya `partisi2 04-type`. Opsional: `ELEVENLABS_MODEL_ID` (default `eleven_multilingual_v2`).

**Piper (cadangan offline untuk Partisi 1, suara kurang natural).**

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

## Standar visual

Tata letak, tipografi, warna, dan aturan penulisan untuk semua video ada di [`docs/STANDAR-VISUAL.md`](docs/STANDAR-VISUAL.md). Nilainya dipakai di kode lewat `src/shared/design.ts`. Teks layar video Work Setup dikumpulkan di `src/worksetup/copy.ts`.

## Struktur

- `src/index.ts` — entry point, mendaftarkan root.
- `src/Root.tsx` — daftar semua composition.
- `src/Composition.tsx` — composition `MyComp` (1280×720, 30 fps, 3 detik): judul dan subjudul dengan animasi fade-in.
- `src/partisi1/` — composition `Partisi1-CheckDeviceUnit` (1920×1080, 30 fps, ±23,7 detik mengikuti durasi VO): scene isometrik traktor, cek StarFire 7500 & CommandCenter G5, popup Status Center (Accuracy 100%), lalu Boundary & AB-Line. Waktu tiap scene dihitung di `src/partisi1/timeline.ts` dari durasi VO.
- `src/partisi2/` — composition `Partisi2-WorkSetup` (1920×1080, 30 fps, ±24 detik): zoom dari kabin ke layar G5, Applications → Equipment Manager (sinkron implement) → Work Setup, lalu pengisian Details, Type, dan Depth dengan sorotan merah. Data contoh (nama operator, kode Type, kedalaman) ada di `src/partisi2/timeline.ts` (`SAMPLE`).
- `src/worksetup/` — composition `WorkSetup-Lengkap` (1920×1080, 30 fps, ±98 detik, tampilan terang dan minimal): rekaman layar asli G5 (sebelum & sesudah) dengan zoom, kotak sorotan merah, catatan singkat per langkah dan progres 4 bagian, perbandingan label di layar Guidance, dan checklist penutup. Posisi sorotan dan waktu ketukan ada di `src/worksetup/timeline.ts`.
- `public/footage/` — rekaman layar G5 dari PPT (`worksetup-before.mp4`, `worksetup-after.mp4`) dan frame diam yang diambil darinya.
- `src/shared/` — komponen bersama: token desain (`design.ts`), timeline VO, subtitle.
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
