import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { Subtitles } from "../shared/Subtitles";
import { Screen } from "./Screen";
import { CLIPS, FOOTAGE, REGIONS, sceneAt, sceneEnd, sceneStart, TAPS, type Scene } from "./timeline";
import { VO } from "./vo";

// Clean, light layout: big screen recording, one short note per step.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const BG = "#f4f5f1";
const INK = "#1f2a22";
const MUTED = "#6b766e";
const GREEN = "#367c2b";
const RED = "#d92d20";
const LINE = "#dfe3dc";

const SCREEN = { x: 60, y: 60, w: 1360, h: Math.round((1360 * FOOTAGE.h) / FOOTAGE.w) };
const SIDE = { x: SCREEN.x + SCREEN.w + 60, y: 60, w: 1920 - (SCREEN.x + SCREEN.w + 60) - 60 };

const fade = (t: number, from: number, d = 0.4) =>
  interpolate(t, [from, from + d], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });

const STEPS = ["Location", "Equipment", "Details", "Work Summary"] as const;
const STEP_OF: Partial<Record<Scene, number>> = { location: 0, equipment: 1, details: 2, type: 3, depth: 3 };

type Note = { kicker: string; title: string; text: string; warn?: string };
const NOTES: Partial<Record<Scene, Note>> = {
  why: { kicker: "KENAPA PENTING", title: "Peta kerja akurat", text: "Data Work Setup menentukan akurasi coverage map." },
  openMenu: { kicker: "MEMBUKA", title: "Work Setup", text: "" },
  openSetup: { kicker: "JALAN PINTAS", title: "Tombol SETUP", text: "Di pojok kiri bawah layar Guidance." },
  overview: { kicker: "ISI WORK SETUP", title: "4 bagian", text: "Cek semuanya sebelum mulai kerja." },
  location: { kicker: "LANGKAH 1", title: "Location", text: "Pilih Boundary sesuai lokasi kerja.", warn: "Salah pilih → data terekam di lokasi lain." },
  equipment: { kicker: "LANGKAH 2", title: "Equipment", text: "Traktor dan implement harus sesuai.", warn: "Salah pilih → luasan kerja salah." },
  details: { kicker: "LANGKAH 3", title: "Details", text: "Nama operator dan tahun kerja (Season). Dipakai untuk penggajian operator." },
  type: { kicker: "LANGKAH 4", title: "Type", text: "Pilih sesuai tipe kerja yang dilakukan.", warn: "Jika salah, tidak bisa diubah." },
  depth: { kicker: "LANGKAH 4", title: "Depth", text: "Isi sesuai instruksi asisten lapangan." },
  ok: { kicker: "SIMPAN", title: "Tekan OK", text: "Setelah semua data benar." },
};

const Check: React.FC<{ readonly on: boolean; readonly size?: number }> = ({ on, size = 30 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      flexShrink: 0,
      backgroundColor: on ? GREEN : "transparent",
      border: `3px solid ${on ? GREEN : "#b9c1b8"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {on ? (
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
        <path d="M4 12.5 L10 18 L20 6" stroke="white" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : null}
  </div>
);

// Four-step progress, shown from the overview until OK.
const Progress: React.FC<{ readonly scene: Scene; readonly t: number }> = ({ scene, t }) => {
  const active = STEP_OF[scene];
  const order: Scene[] = ["overview", "location", "equipment", "details", "type", "depth", "ok"];
  const idx = order.indexOf(scene);
  if (idx < 0) return null;
  const doneUpTo = scene === "ok" ? 4 : (active ?? -1);
  const s = sceneStart("overview");
  const d = sceneEnd("overview") - s;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 56 }}>
      {STEPS.map((name, i) => {
        const shown = scene === "overview" ? fade(t, s + d * (0.35 + i * 0.13)) : 1;
        const isActive = active === i;
        return (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 16, opacity: shown }}>
            <Check on={i < doneUpTo} />
            <div style={{ fontSize: 30, fontWeight: isActive ? 800 : 500, color: isActive ? INK : MUTED }}>
              {i + 1}. {name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Menu path for the "open" scene, lighting up with each tap in the recording.
const MenuPath: React.FC<{ readonly t: number }> = ({ t }) => {
  const clip = CLIPS.openMenu;
  const rate = (clip.to - clip.from) / (sceneEnd("openMenu") - sceneStart("openMenu"));
  const at = (src: number) => sceneStart("openMenu") + (src - clip.from) / rate;
  const steps = [
    { label: "Menu", at: at(TAPS.openMenu[0].t) },
    { label: "Applications", at: at(TAPS.openMenu[1].t) },
    { label: "Work Setup", at: at(TAPS.openMenu[3].t) },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
      {steps.map((s, i) => {
        const on = t >= s.at - 0.35;
        return (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 16, opacity: on ? 1 : 0.35 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: on ? GREEN : "#c9cfc7", color: "white", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i + 1}
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, color: INK }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const Side: React.FC<{ readonly scene: Scene; readonly t: number }> = ({ scene, t }) => {
  const note = NOTES[scene];
  if (!note) return null;
  const a = fade(t, sceneStart(scene), 0.45);
  return (
    <div style={{ position: "absolute", left: SIDE.x, top: SIDE.y, width: SIDE.w, color: INK }}>
      <Progress scene={scene} t={t} />
      <div style={{ opacity: a, translate: `0px ${(1 - a) * 16}px` }}>
        <div style={{ fontSize: 22, letterSpacing: 3, fontWeight: 700, color: GREEN }}>{note.kicker}</div>
        <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.05, marginTop: 10 }}>{note.title}</div>
        {note.text ? <div style={{ fontSize: 32, lineHeight: 1.35, marginTop: 18, color: "#3b463e" }}>{note.text}</div> : null}
        {scene === "openMenu" ? <MenuPath t={t} /> : null}
        {note.warn ? (
          <div style={{ marginTop: 26, paddingLeft: 18, borderLeft: `5px solid ${RED}`, fontSize: 30, lineHeight: 1.3, fontWeight: 700, color: RED }}>
            {note.warn}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Intro: React.FC<{ readonly t: number }> = ({ t }) => {
  const out = interpolate(t, [sceneEnd("intro") - 0.4, sceneEnd("intro")], [1, 0], clamp);
  if (out <= 0) return null;
  const a = fade(t, 0.2, 0.8);
  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: out, justifyContent: "center", paddingLeft: 160, color: INK }}>
      <div style={{ width: 90, height: 8, backgroundColor: GREEN, borderRadius: 4, opacity: a }} />
      <div style={{ fontSize: 160, fontWeight: 800, lineHeight: 1, marginTop: 36, opacity: a, translate: `0px ${(1 - a) * 30}px` }}>Work Setup</div>
      <div style={{ fontSize: 46, marginTop: 28, color: "#4a564d", opacity: fade(t, 0.7, 0.8) }}>
        Isi data pekerjaan sebelum traktor mulai jalan.
      </div>
    </AbsoluteFill>
  );
};

const Crop: React.FC<{ readonly src: string; readonly r: { x: number; y: number; w: number; h: number }; readonly scale: number }> = ({
  src,
  r,
  scale,
}) => (
  <div style={{ position: "relative", width: r.w * scale, height: r.h * scale, overflow: "hidden", borderRadius: 10 }}>
    <Img src={staticFile(src)} style={{ position: "absolute", left: -r.x * scale, top: -r.y * scale, width: FOOTAGE.w * scale, height: FOOTAGE.h * scale }} />
  </div>
);

const Result: React.FC<{ readonly t: number }> = ({ t }) => {
  const s = sceneStart("result");
  const a = fade(t, s, 0.5);
  const b = fade(t, s + 2.2, 0.5);
  const W = 860;
  const k = W / FOOTAGE.w;
  const col = (title: string, color: string, img: string, caption: string, show: number) => (
    <div style={{ width: W, opacity: show }}>
      <div style={{ fontSize: 24, letterSpacing: 3, fontWeight: 700, color }}>{title}</div>
      <div style={{ position: "relative", marginTop: 14, boxShadow: "0 16px 40px rgba(0,0,0,0.12)", borderRadius: 12, overflow: "hidden" }}>
        <Crop src={img} r={{ x: 0, y: 0, w: FOOTAGE.w, h: FOOTAGE.h }} scale={k} />
        <div
          style={{
            position: "absolute",
            left: (REGIONS.label.x - 4) * k,
            top: (REGIONS.label.y - 4) * k,
            width: (REGIONS.label.w + 8) * k,
            height: (REGIONS.label.h + 8) * k,
            border: `4px solid ${color}`,
            borderRadius: 6,
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 24 }}>
        <Crop src={img} r={REGIONS.label} scale={2} />
        <div style={{ fontSize: 30, color: INK, fontWeight: 600 }}>{caption}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: a }}>
      <div style={{ position: "absolute", left: 60, top: 60, display: "flex", gap: 80 }}>
        {col("SEBELUM", MUTED, FOOTAGE.stills.beforeGuidance, "Masih \"Tillage\"", 1)}
        {col("SESUDAH", GREEN, FOOTAGE.stills.afterGuidance, "Sesuai Type yang dipilih", b)}
      </div>
    </AbsoluteFill>
  );
};

const Recap: React.FC<{ readonly t: number }> = ({ t }) => {
  const s = sceneStart("recap");
  const a = fade(t, s, 0.5);
  const items = ["Location", "Equipment", "Details", "Type & Depth", "OK"];
  const d = sceneEnd("recap") - s - 1.5;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: a, justifyContent: "center", paddingLeft: 160, color: INK }}>
      <div style={{ fontSize: 24, letterSpacing: 3, fontWeight: 700, color: GREEN }}>SEBELUM MULAI KERJA</div>
      <div style={{ fontSize: 84, fontWeight: 800, marginTop: 10 }}>Cek Work Setup</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 40, width: 900 }}>
        {items.map((it, i) => {
          const on = t >= s + 0.4 + (d * i) / items.length;
          return (
            <div key={it} style={{ display: "flex", alignItems: "center", gap: 24, padding: "18px 0", borderTop: i === 0 ? `2px solid ${LINE}` : undefined, borderBottom: `2px solid ${LINE}` }}>
              <Check on={on} size={44} />
              <div style={{ fontSize: 44, fontWeight: 700 }}>{it}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const WorkSetupVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const scene = sceneAt(t);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: SCREEN.x, top: SCREEN.y, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.14)" }}>
        <Screen width={SCREEN.w} height={SCREEN.h} />
      </div>
      <Side scene={scene} t={t} />

      {scene === "result" ? <Result t={t} /> : null}
      {scene === "recap" ? <Recap t={t} /> : null}
      <Subtitles lines={VO} left={SCREEN.x} right={60} bottom={46} fontSize={34} variant="plain" align="left" />
      <Intro t={t} />

      <Track name="Voiceover">
        {VO.map((l) => (
          <Audio
            key={l.id}
            name={`VO ${l.id}`}
            src={staticFile(l.file)}
            from={Math.round(l.from * fps)}
            durationInFrames={Math.ceil((l.to - l.from) * fps) + 1}
          />
        ))}
      </Track>
    </AbsoluteFill>
  );
};
