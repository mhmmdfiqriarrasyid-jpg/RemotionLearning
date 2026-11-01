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

Render satu frame sebagai gambar:

```bash
npx remotion still MyComp out/frame.png --frame=60
```

## Struktur

- `src/index.ts` — entry point, mendaftarkan root.
- `src/Root.tsx` — daftar semua composition.
- `src/Composition.tsx` — composition `MyComp` (1280×720, 30 fps, 3 detik): judul dan subjudul dengan animasi fade-in.
- `src/partisi1/` — composition `Partisi1-CheckDeviceUnit` (1920×1080, 30 fps, 20 detik): scene isometrik traktor, cek StarFire 7500 & CommandCenter G5, popup Status Center (Accuracy 100%), lalu Boundary & AB-Line. Waktu tiap scene diatur di `src/partisi1/timeline.ts`; teks VO (subtitle) di `src/partisi1/Partisi1.tsx`.
- `public/` — aset (gambar, audio, video). Akses dengan `staticFile()`.
- `remotion.config.ts` — konfigurasi CLI.
- `.claude/skills/` — Remotion Agent Skills resmi untuk Claude Code.

## Perintah lain

- `npm run lint` — ESLint + type check TypeScript.
- `npm run upgrade` — upgrade Remotion (juga memperbarui skills).

## Lisensi Remotion

Remotion gratis untuk individu dan tim hingga 3 orang. Perusahaan yang lebih besar butuh lisensi: https://www.remotion.pro/license
