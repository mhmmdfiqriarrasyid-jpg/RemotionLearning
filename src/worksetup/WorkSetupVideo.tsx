import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Subtitles } from "../shared/Subtitles";
import { Screen } from "./Screen";
import { CLIPS, FOOTAGE, line, REGIONS, sceneAt, sceneEnd, sceneStart, TAPS, type Scene } from "./timeline";
import { VO } from "./vo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const RED = "#ff3b30";
const YELLOW = "#ffd400";
const GREEN = "#22c55e";
const NAVY = "#0f1b2a";
const CARD_BG = "rgba(15,27,42,0.95)";

const SCREEN = { x: 60, y: 120, w: 1240, h: Math.round((1240 * FOOTAGE.h) / FOOTAGE.w) };
const PANEL = { x: 1340, y: 120, w: 520 };

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: frame / fps, frame, fps };
};

const appear = (t: number, from: number, d = 0.4) =>
  interpolate(t, [from, from + d], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });

// ---------- small building blocks ----------

const Crop: React.FC<{
  readonly src: string;
  readonly r: { x: number; y: number; w: number; h: number };
  readonly scale: number;
  readonly border?: string;
}> = ({ src, r, scale, border }) => (
  <div
    style={{
      position: "relative",
      width: r.w * scale,
      height: r.h * scale,
      overflow: "hidden",
      borderRadius: 10,
      border: border ? `4px solid ${border}` : undefined,
      boxSizing: "content-box",
      backgroundColor: "#000",
    }}
  >
    <Img
      src={staticFile(src)}
      style={{ position: "absolute", left: -r.x * scale, top: -r.y * scale, width: FOOTAGE.w * scale, height: FOOTAGE.h * scale }}
    />
  </div>
);

const Card: React.FC<{ readonly children: React.ReactNode; readonly style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      backgroundColor: CARD_BG,
      borderRadius: 20,
      padding: "26px 28px",
      border: "2px solid #23384f",
      color: "white",
      ...style,
    }}
  >
    {children}
  </div>
);

const Kicker: React.FC<{ readonly children: React.ReactNode; readonly color?: string }> = ({ children, color = "#9fb3c8" }) => (
  <div style={{ fontSize: 22, letterSpacing: 2, fontWeight: 800, color }}>{children}</div>
);

const Warning: React.FC<{ readonly children: React.ReactNode; readonly strong?: boolean }> = ({ children, strong }) => (
  <div
    style={{
      marginTop: 18,
      borderRadius: 14,
      padding: "16px 18px",
      backgroundColor: strong ? RED : "rgba(255,59,48,0.14)",
      border: `3px solid ${RED}`,
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
      fontSize: 28,
      lineHeight: 1.3,
      fontWeight: strong ? 800 : 600,
      color: strong ? "white" : "#ffd2cf",
    }}
  >
    <svg width={34} height={34} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M12 2 L23 21 H1 Z" fill={strong ? "white" : RED} />
      <rect x={11} y={8} width={2.4} height={7} fill={strong ? RED : "white"} />
      <rect x={11} y={16.6} width={2.4} height={2.4} fill={strong ? RED : "white"} />
    </svg>
    <span>{children}</span>
  </div>
);

const Num: React.FC<{ readonly n: number | string }> = ({ n }) => (
  <div
    style={{
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: RED,
      color: "white",
      fontSize: 30,
      fontWeight: 900,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {n}
  </div>
);

const SectionCard: React.FC<{
  readonly n: number;
  readonly title: string;
  readonly what: string;
  readonly children?: React.ReactNode;
}> = ({ n, title, what, children }) => (
  <Card>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Num n={n} />
      <div style={{ fontSize: 46, fontWeight: 900 }}>{title}</div>
    </div>
    <div style={{ fontSize: 30, lineHeight: 1.3, marginTop: 16, color: "#e3edf6" }}>{what}</div>
    {children}
  </Card>
);

const Value: React.FC<{ readonly label: string; readonly value: string }> = ({ label, value }) => (
  <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 12, fontSize: 26, borderTop: "1px solid #23384f", paddingTop: 12 }}>
    <span style={{ color: "#9fb3c8" }}>{label}</span>
    <span style={{ fontWeight: 800, textAlign: "right" }}>{value}</span>
  </div>
);

// ---------- scene-specific cards ----------

const CoverageCard: React.FC<{ readonly t: number }> = ({ t }) => {
  const s = sceneStart("why");
  const k = interpolate(t, [s + 0.4, sceneEnd("why") - 0.3], [0, 1], clamp);
  // serpentine passes across the field
  const passes = 5;
  const W = 440;
  const H = 300;
  const laneH = (H - 40) / passes;
  const total = k * passes;
  return (
    <Card>
      <Kicker>COVERAGE MAP · PETA KERJA</Kicker>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 14, display: "block" }}>
        <rect x={10} y={10} width={W - 20} height={H - 20} rx={10} fill="#5d4a2c" stroke={YELLOW} strokeWidth={4} />
        {Array.from({ length: passes }, (_, i) => {
          const p = Math.max(0, Math.min(1, total - i));
          if (p <= 0) return null;
          const y = 20 + i * laneH;
          const ltr = i % 2 === 0;
          const x0 = ltr ? 20 : W - 20 - (W - 40) * p;
          return <rect key={i} x={x0} y={y} width={(W - 40) * p} height={laneH - 4} fill="#22c55e" opacity={0.75} />;
        })}
        {(() => {
          const i = Math.min(passes - 1, Math.floor(total));
          const p = Math.min(1, total - i);
          const ltr = i % 2 === 0;
          const x = ltr ? 20 + (W - 40) * p : W - 20 - (W - 40) * p;
          const y = 20 + i * laneH + laneH / 2 - 2;
          return (
            <g transform={`translate(${x} ${y}) rotate(${ltr ? 0 : 180})`}>
              <rect x={-16} y={-12} width={30} height={24} rx={4} fill="#367c2b" stroke="#fff" strokeWidth={2} />
              <rect x={-24} y={-20} width={8} height={40} fill="#ffd400" />
            </g>
          );
        })()}
      </svg>
      <div style={{ fontSize: 28, lineHeight: 1.3, marginTop: 14 }}>
        Area yang sudah dikerjakan terekam sebagai <b style={{ color: GREEN }}>coverage map</b>. Data Work Setup menentukan
        rekaman ini akurat atau tidak.
      </div>
    </Card>
  );
};

const StepsCard: React.FC<{ readonly t: number }> = ({ t }) => {
  const clip = CLIPS.openMenu;
  const rate = (clip.to - clip.from) / (sceneEnd("openMenu") - sceneStart("openMenu"));
  const at = (src: number) => sceneStart("openMenu") + (src - clip.from) / rate;
  const steps = [
    { label: "Menu", at: at(TAPS.openMenu[0].t), hint: "kanan bawah" },
    { label: "Applications", at: at(TAPS.openMenu[1].t), hint: "tab kiri" },
    { label: "Work Setup", at: at(TAPS.openMenu[3].t), hint: "scroll ke bawah" },
  ];
  return (
    <Card>
      <Kicker>CARA MEMBUKA</Kicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        {steps.map((s, i) => {
          const on = t >= s.at - 0.35;
          return (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 16px",
                borderRadius: 14,
                backgroundColor: on ? "rgba(255,212,0,0.14)" : "rgba(255,255,255,0.04)",
                border: `3px solid ${on ? YELLOW : "transparent"}`,
                opacity: on ? 1 : 0.45,
              }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: on ? YELLOW : "#23384f", color: on ? NAVY : "white", fontWeight: 900, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i + 1}
              </div>
              <div>
                <div style={{ fontSize: 34, fontWeight: 800 }}>{s.label}</div>
                <div style={{ fontSize: 22, color: "#9fb3c8" }}>{s.hint}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const ShortcutCard: React.FC = () => (
  <Card>
    <Kicker color={YELLOW}>JALAN PINTAS</Kicker>
    <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 18 }}>
      <div style={{ width: 120, height: 110, borderRadius: 12, backgroundColor: "#efeee6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `4px solid ${YELLOW}` }}>
        <svg width={64} height={52} viewBox="0 0 64 52">
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path d={`M4 ${10 + i * 16} l5 5 l9 -10`} stroke="#1d1d1b" strokeWidth={4} fill="none" />
              <rect x={24} y={8 + i * 16} width={38} height={8} rx={2} fill="#1d1d1b" />
            </g>
          ))}
        </svg>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#1d1d1b" }}>SETUP</div>
      </div>
      <div style={{ fontSize: 30, lineHeight: 1.3 }}>
        Tekan <b>SETUP</b> di pojok kiri bawah layar Guidance untuk langsung membuka Work Setup.
      </div>
    </div>
  </Card>
);

const OverviewCard: React.FC<{ readonly t: number }> = ({ t }) => {
  const items = ["Location", "Equipment", "Details", "Work Summary"];
  const s = sceneStart("overview");
  const d = sceneEnd("overview") - s;
  return (
    <Card>
      <Kicker>4 BAGIAN WAJIB DICEK</Kicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
        {items.map((it, i) => {
          const a = appear(t, s + d * (0.35 + i * 0.13));
          return (
            <div key={it} style={{ display: "flex", alignItems: "center", gap: 16, opacity: a, translate: `${(1 - a) * 30}px 0px` }}>
              <Num n={i + 1} />
              <div style={{ fontSize: 38, fontWeight: 800 }}>{it}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const WidthDiagram: React.FC<{ readonly t: number }> = ({ t }) => {
  const k = interpolate(t, [sceneStart("equipment") + 4, sceneStart("equipment") + 7], [0, 1], clamp);
  const row = (label: string, w: number, color: string, ok: boolean) => (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 22, color: ok ? "#bdf5cf" : "#ffd2cf", fontWeight: 700 }}>{label}</div>
      <svg width="100%" viewBox="0 0 440 60" style={{ display: "block", marginTop: 4 }}>
        <rect x={0} y={4} width={440} height={52} rx={8} fill="#5d4a2c" />
        <rect x={0} y={30 - w / 2} width={440 * k} height={w} fill={color} opacity={0.8} />
        <rect x={440 * k - 14} y={30 - w / 2 - 4} width={14} height={w + 8} fill={YELLOW} />
      </svg>
    </div>
  );
  return (
    <div style={{ marginTop: 10 }}>
      {row("Lebar implement benar → luasan benar", 30, GREEN, true)}
      {row("Lebar implement salah → luasan salah", 50, RED, false)}
    </div>
  );
};

const TypeCard: React.FC = () => (
  <SectionCard n={4} title="Work Summary · Type" what="Pilih Type sesuai tipe kerja yang dilakukan.">
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
      <div style={{ fontSize: 22, color: "#9fb3c8", fontWeight: 700 }}>SEBELUM (belum diisi)</div>
      <Crop src={FOOTAGE.stills.beforeWorkSetup} r={{ x: 606, y: 178, w: 268, h: 42 }} scale={1.7} border="#5d738a" />
      <div style={{ fontSize: 22, color: "#bdf5cf", fontWeight: 700, marginTop: 4 }}>SESUDAH</div>
      <Crop src={FOOTAGE.stills.afterTop} r={{ x: 608, y: 177, w: 268, h: 42 }} scale={1.7} border={GREEN} />
    </div>
    <Warning strong>Sangat penting: data Type yang salah tidak bisa diubah.</Warning>
  </SectionCard>
);

const OkCard: React.FC = () => (
  <Card>
    <Kicker>SIMPAN</Kicker>
    <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 18 }}>
      <div style={{ padding: "14px 30px", borderRadius: 12, backgroundColor: "#1f7a2e", color: "white", fontSize: 36, fontWeight: 900, border: `4px solid ${YELLOW}` }}>
        ✓ OK
      </div>
      <div style={{ fontSize: 30, lineHeight: 1.3 }}>Tekan OK setelah semua data benar.</div>
    </div>
  </Card>
);

const PanelFor: React.FC<{ readonly scene: Scene; readonly t: number }> = ({ scene, t }) => {
  switch (scene) {
    case "why":
      return <CoverageCard t={t} />;
    case "openMenu":
      return <StepsCard t={t} />;
    case "openSetup":
      return <ShortcutCard />;
    case "overview":
      return <OverviewCard t={t} />;
    case "location":
      return (
        <SectionCard n={1} title="Location" what="Pilih Boundary sesuai lokasi kerja.">
          <Value label="Contoh" value="5 South" />
          <Warning>Jika salah, data akan terekam di lokasi yang salah di sistem.</Warning>
        </SectionCard>
      );
    case "equipment":
      return (
        <SectionCard n={2} title="Equipment" what="Pastikan traktor dan implement sesuai.">
          <Value label="Traktor" value="7350R" />
          <Value label="Implement" value="Bed Ripper (2 Rows)" />
          <WidthDiagram t={t} />
        </SectionCard>
      );
    case "details":
      return (
        <SectionCard n={3} title="Details" what="Pilih nama operator dan tahun kerja (Season).">
          <Value label="Operator" value="Fiqri Ar Rasyid" />
          <Value label="Season" value="2026" />
          <Warning>Berhubungan dengan penggajian operator.</Warning>
        </SectionCard>
      );
    case "type":
      return <TypeCard />;
    case "depth":
      return (
        <SectionCard n={4} title="Work Summary · Depth" what="Isi kedalaman sesuai instruksi asisten lapangan.">
          <div style={{ marginTop: 16 }}>
            <Crop src={FOOTAGE.stills.afterTop} r={{ x: 470, y: 228, w: 406, h: 42 }} scale={1.12} border={YELLOW} />
          </div>
          <div style={{ fontSize: 22, color: "#9fb3c8", marginTop: 12 }}>Di rekaman contoh nilainya masih 0.0 cm.</div>
        </SectionCard>
      );
    case "ok":
      return <OkCard />;
    default:
      return null;
  }
};

// ---------- full-frame scenes ----------

const Intro: React.FC<{ readonly t: number }> = ({ t }) => {
  const out = interpolate(t, [sceneEnd("intro") - 0.4, sceneEnd("intro")], [1, 0], clamp);
  const a = appear(t, 0.2, 0.8);
  if (out <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Img src={staticFile(FOOTAGE.stills.afterGuidance)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(10px) brightness(0.45)", scale: "1.1" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", color: "white" }}>
        <div style={{ fontSize: 30, letterSpacing: 6, color: YELLOW, fontWeight: 800, opacity: a }}>G5 COMMANDCENTER · PANDUAN OPERATOR</div>
        <div style={{ fontSize: 170, fontWeight: 900, lineHeight: 1, marginTop: 20, opacity: a, translate: `0px ${(1 - a) * 40}px` }}>Work Setup</div>
        <div style={{ fontSize: 46, marginTop: 28, color: "#e3edf6", opacity: appear(t, 0.7, 0.8), maxWidth: 1300, textAlign: "center" }}>
          Isi data pekerjaan sebelum traktor mulai jalan
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Result: React.FC<{ readonly t: number }> = ({ t }) => {
  const s = sceneStart("result");
  const a = appear(t, s, 0.5);
  const b = appear(t, s + 2.2, 0.5);
  const col = (title: string, color: string, img: string, labelImg: string, caption: string, show: number) => (
    <div style={{ width: 860, opacity: show, translate: `0px ${(1 - show) * 30}px` }}>
      <div style={{ fontSize: 34, fontWeight: 900, color }}>{title}</div>
      <div style={{ position: "relative", marginTop: 12 }}>
        <Crop src={img} r={{ x: 0, y: 0, w: FOOTAGE.w, h: FOOTAGE.h }} scale={860 / FOOTAGE.w - 0.01} />
        <div
          style={{
            position: "absolute",
            left: (REGIONS.label.x - 4) * (860 / FOOTAGE.w),
            top: (REGIONS.label.y - 4) * (860 / FOOTAGE.w),
            width: (REGIONS.label.w + 8) * (860 / FOOTAGE.w),
            height: (REGIONS.label.h + 8) * (860 / FOOTAGE.w),
            border: `5px solid ${color}`,
            borderRadius: 8,
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 18 }}>
        <Crop src={labelImg} r={REGIONS.label} scale={2.1} border={color} />
        <div style={{ fontSize: 28, color: "#e3edf6", lineHeight: 1.3 }}>{caption}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1420", opacity: a }}>
      <div style={{ position: "absolute", left: 60, top: 40, fontSize: 26, letterSpacing: 3, color: "#9fb3c8", fontWeight: 800 }}>HASIL DI LAYAR GUIDANCE</div>
      <div style={{ position: "absolute", left: 60, top: 100, display: "flex", gap: 80 }}>
        {col("SEBELUM", "#ff8a80", FOOTAGE.stills.beforeGuidance, FOOTAGE.stills.beforeGuidance, "Label masih \"Tillage\"", 1)}
        {col("SESUDAH", GREEN, FOOTAGE.stills.afterGuidance, FOOTAGE.stills.afterGuidance, "Label sesuai Type yang dipilih", b)}
      </div>
    </AbsoluteFill>
  );
};

const Recap: React.FC<{ readonly t: number }> = ({ t }) => {
  const s = sceneStart("recap");
  const a = appear(t, s, 0.5);
  const items = [
    ["Location", "Boundary sesuai lokasi kerja"],
    ["Equipment", "Traktor & implement sesuai"],
    ["Details", "Nama operator & Season"],
    ["Type & Depth", "Tipe kerja & kedalaman sesuai instruksi"],
    ["OK", "Simpan, lalu cek label di Guidance"],
  ];
  const d = line("recap").to - line("recap").from;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1420", opacity: a, justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 1200, color: "white" }}>
        <div style={{ fontSize: 28, letterSpacing: 4, color: YELLOW, fontWeight: 800 }}>CHECKLIST SEBELUM MULAI KERJA</div>
        <div style={{ fontSize: 80, fontWeight: 900, marginTop: 8 }}>Work Setup</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 34 }}>
          {items.map(([k, v], i) => {
            const c = appear(t, s + 0.4 + (d * 0.85 * i) / items.length, 0.3);
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 24, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "18px 24px" }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, border: `4px solid ${c > 0 ? GREEN : "#5d738a"}`, backgroundColor: c > 0 ? GREEN : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width={36} height={36} viewBox="0 0 24 24" style={{ scale: String(c) }}>
                    <path d="M4 12.5 L10 18 L20 6" stroke="white" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontSize: 42, fontWeight: 800, width: 330 }}>{k}</div>
                <div style={{ fontSize: 34, color: "#cfe0f0" }}>{v}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Header: React.FC<{ readonly scene: Scene }> = ({ scene }) => {
  const step: Partial<Record<Scene, string>> = {
    openMenu: "Membuka Work Setup",
    openSetup: "Membuka Work Setup",
    overview: "Isi Work Setup",
    location: "1 / 4 · Location",
    equipment: "2 / 4 · Equipment",
    details: "3 / 4 · Details",
    type: "4 / 4 · Work Summary",
    depth: "4 / 4 · Work Summary",
    ok: "Simpan",
    why: "Kenapa penting?",
  };
  return (
    <div style={{ position: "absolute", left: 60, top: 34, right: 60, display: "flex", alignItems: "center", gap: 20, color: "white" }}>
      <div style={{ fontSize: 44, fontWeight: 900 }}>Work Setup</div>
      {step[scene] ? (
        <div style={{ fontSize: 28, fontWeight: 800, padding: "6px 16px", borderRadius: 10, backgroundColor: YELLOW, color: NAVY }}>{step[scene]}</div>
      ) : null}
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 22, color: "#9fb3c8" }}>Rekaman: G5 CommandCenter (simulator)</div>
    </div>
  );
};

export const WorkSetupVideo: React.FC = () => {
  const { t, fps } = useT();
  const scene = sceneAt(t);
  const panelIn = appear(t, sceneStart(scene), 0.45);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1420", fontFamily: FONT }}>
      <Header scene={scene} />
      <div style={{ position: "absolute", left: SCREEN.x, top: SCREEN.y, boxShadow: "0 30px 70px rgba(0,0,0,0.5)", borderRadius: 10 }}>
        <Screen width={SCREEN.w} height={SCREEN.h} />
      </div>
      <div style={{ position: "absolute", left: PANEL.x, top: PANEL.y, width: PANEL.w, opacity: panelIn, translate: `${(1 - panelIn) * 40}px 0px` }}>
        <PanelFor scene={scene} t={t} />
      </div>

      {scene === "result" ? <Result t={t} /> : null}
      {scene === "recap" ? <Recap t={t} /> : null}
      <Intro t={t} />

      <Subtitles lines={VO} left={60} right={60} bottom={34} fontSize={36} />

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
