# Standar Visual & Penulisan Video Pelatihan

Berlaku untuk semua video di repo ini (1920×1080, 30 fps). Nilai di bawah ini juga ada di `src/shared/design.ts`. Kalau mengubah standar, ubah keduanya.

## 1. Tata letak (grid)

| Elemen | Posisi |
|---|---|
| Margin aman | 80 px di semua sisi |
| Jarak antarkolom (gutter) | 60 px |
| Layar rekaman | x 80, y 80, lebar 1300 px (tinggi mengikuti rasio rekaman) |
| Kolom catatan | mulai x 1440, lebar 400 px, rata atas dengan layar |
| Daftar progres | di kolom catatan, rata bawah dengan layar |
| Subtitle | di bawah layar, rata kiri x 80, lebar sama dengan layar |

Aturan:
- Semua teks dan kotak rata kiri pada garis margin 80 px, kecuali kartu judul pembuka (rata tengah vertikal).
- Posisi elemen tidak berubah antar scene. Elemen yang tidak dipakai disembunyikan, ruangnya tetap kosong.
- Jarak hanya memakai skala 8 / 16 / 24 / 32 / 48 / 80 px.

## 2. Tipografi

| Gaya | Ukuran | Tebal | Dipakai untuk |
|---|---|---|---|
| Display | 140 | 800 | Judul pembuka |
| H1 | 72 | 800 | Judul scene layar penuh (hasil, checklist) |
| H2 | 56 | 800 | Judul catatan di kolom samping |
| Lead | 40 | 400 | Kalimat pembuka di bawah judul besar |
| Body | 30 | 400 | Isi catatan |
| Item | 30 | 600 | Daftar langkah dan checklist |
| Subtitle | 34 | 500 | Teks VO |
| Kicker | 22, huruf kapital, jarak huruf 3 | 700 | Label kecil di atas judul |

Satu font untuk semua teks (Inter, cadangan system-ui).

## 3. Warna

| Token | Hex | Dipakai untuk |
|---|---|---|
| bg | `#f4f5f1` | Latar |
| ink | `#1f2a22` | Judul |
| body | `#3b463e` | Isi dan subtitle |
| muted | `#6b766e` | Teks sekunder, langkah belum aktif |
| line | `#dfe3dc` | Garis pemisah |
| accent | `#367c2b` | Kicker, langkah aktif, centang |
| warn | `#d92d20` | Peringatan dan kotak sorotan |
| tap | `#ffd400` | Lingkaran ketukan di rekaman |

Merah hanya untuk peringatan dan sorotan. Jangan dipakai untuk dekorasi.

## 4. Penulisan

**Istilah layar.** Tulis persis seperti di layar G5, dalam bahasa Inggris dan huruf yang sama: Work Setup, Location, Equipment, Details, Work Summary, Type, Depth, Menu, Applications, SETUP, OK, Guidance, Season. Jangan diterjemahkan dan jangan diberi tanda kutip.

**Kicker.** Huruf kapital, maksimal 4 kata. Untuk langkah: `LANGKAH 1 DARI 4`.

**Judul.** Maksimal 3 kata, tanpa titik. Kalau langkahnya adalah bagian di layar, judulnya nama bagian itu (misalnya `Location`).

**Isi.** Satu kalimat, maksimal ±60 karakter, huruf kapital hanya di awal kalimat dan istilah layar, diakhiri titik.

**Peringatan.** Satu kalimat dengan pola `Jika salah, …`, diakhiri titik. Tanpa simbol panah.

**Info tambahan.** Satu kalimat netral (abu-abu), diakhiri titik. Dipakai untuk alasan yang bukan peringatan.

**Subtitle.** Sama dengan teks VO. Maksimal 2 baris dan ±90 karakter per tampilan; kalimat panjang dipecah di titik atau koma dan ditampilkan bergantian.

**Angka dan satuan.** Ikuti layar: `0.0 cm`, `2026`. Spasi antara angka dan satuan.

## 5. Sorotan dan gerak

- Kotak sorotan: garis merah 4 px, sudut 6 px, tanpa isian, tanpa kedip.
- Nomor bagian (gambaran umum): lingkaran merah dengan angka putih di sudut kanan atas kotak.
- Ketukan di rekaman: lingkaran kuning yang membesar lalu hilang (±1 detik).
- Transisi teks: muncul dengan geser naik 16 px dan pudar ±0,4 detik. Tidak ada animasi lain pada teks.
- Kamera zoom ke bagian yang dibahas selama ±0,8 detik, lalu diam.
