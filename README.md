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

### Voice-over Partisi 1 (text-to-speech offline)

VO dibuat dengan [Piper](https://github.com/OHF-Voice/piper1-gpl) memakai suara bahasa Indonesia `id_ID-news_tts-medium`. File hasilnya sudah ada di `public/voiceover/partisi1/`. Untuk membuat ulang (misalnya setelah mengubah teks):

```bash
pip install piper-tts
```

```bash
curl -L -o voice.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-id_ID-news_tts-medium.tar.bz2 && tar xjf voice.tar.bz2
```

```bash
python3 scripts/generate-voiceover.py ./vits-piper-id_ID-news_tts-medium 0.88
```

Angka terakhir adalah kecepatan bicara (`length_scale`: lebih kecil = lebih cepat). Teks yang diucapkan ada di `scripts/generate-voiceover.py` (istilah Inggris ditulis fonetis, misalnya "Star Fayer"), sedangkan teks subtitle ada di `src/partisi1/vo.ts`. Durasi tiap scene dan total video otomatis mengikuti `durations.json`.

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
- `scripts/generate-voiceover.py` — generator VO text-to-speech.
- `remotion.config.ts` — konfigurasi CLI.
- `.claude/skills/` — Remotion Agent Skills resmi untuk Claude Code.

## Perintah lain

- `npm run lint` — ESLint + type check TypeScript.
- `npm run upgrade` — upgrade Remotion (juga memperbarui skills).

## Lisensi Remotion

Remotion gratis untuk individu dan tim hingga 3 orang. Perusahaan yang lebih besar butuh lisensi: https://www.remotion.pro/license
