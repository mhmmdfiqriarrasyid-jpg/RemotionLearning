// All on-screen text for the Work Setup video, written to docs/STANDAR-VISUAL.md:
// kicker = capitals (max 4 words), title = max 3 words without a period,
// body = one sentence ending with a period, warn = "Jika salah, ...".
// Screen terms are written exactly as on the G5 display.
import type { Scene } from "./timeline";

export type Note = {
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  readonly warn?: string;
  readonly info?: string;
};

export const NOTES: Partial<Record<Scene, Note>> = {
  why: { kicker: "Kenapa penting", title: "Peta kerja akurat", body: "Data Work Setup menentukan akurasi coverage map." },
  openMenu: { kicker: "Cara membuka", title: "Lewat Menu", body: "Tekan berurutan:" },
  openSetup: { kicker: "Cara membuka", title: "Lewat SETUP", body: "Tekan SETUP di kiri bawah layar Guidance." },
  overview: { kicker: "Isi Work Setup", title: "Empat bagian", body: "Cek semuanya sebelum mulai kerja." },
  location: {
    kicker: "Langkah 1 dari 4",
    title: "Location",
    body: "Pilih Boundary sesuai lokasi kerja.",
    warn: "Jika salah, data terekam di lokasi lain.",
  },
  equipment: {
    kicker: "Langkah 2 dari 4",
    title: "Equipment",
    body: "Pilih traktor dan implement yang dipakai.",
    warn: "Jika salah, luasan kerja terekam salah.",
  },
  details: {
    kicker: "Langkah 3 dari 4",
    title: "Details",
    body: "Pilih nama operator dan Season.",
    info: "Data ini dipakai untuk penggajian operator.",
  },
  type: {
    kicker: "Langkah 4 dari 4",
    title: "Type",
    body: "Pilih sesuai tipe kerja yang dilakukan.",
    warn: "Jika salah, data tidak bisa diubah.",
  },
  depth: { kicker: "Langkah 4 dari 4", title: "Depth", body: "Isi sesuai instruksi asisten lapangan." },
  ok: { kicker: "Simpan", title: "Tekan OK", body: "Lakukan setelah semua data benar." },
};

export const MENU_PATH = ["Menu", "Applications", "Work Setup"] as const;
export const STEPS = ["Location", "Equipment", "Details", "Work Summary"] as const;

export const INTRO = {
  kicker: "Panduan operator G5",
  title: "Work Setup",
  lead: "Isi data pekerjaan sebelum traktor mulai jalan.",
} as const;

export const RESULT = {
  kicker: "Hasil di layar Guidance",
  title: "Label pekerjaan berubah",
  before: { kicker: "Sebelum", caption: "Label: Tillage" },
  after: { kicker: "Sesudah", caption: "Label: sesuai Type" },
} as const;

export const RECAP = {
  kicker: "Sebelum mulai kerja",
  title: "Cek Work Setup",
  items: ["Location", "Equipment", "Details", "Type dan Depth", "OK"],
} as const;
