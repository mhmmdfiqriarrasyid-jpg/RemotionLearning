import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Subtitles } from "../shared/Subtitles";
import { CAB_DISPLAY, CabView } from "./CabView";
import { Cursor, type CursorStop } from "./Cursor";
import { BACK_BTN, fieldBox, G5Ui, MENU_BTN, SAVE_BTN, tileCenter, UI_H, UI_W } from "./G5Ui";
import { SAMPLE, T } from "./timeline";
import { VO } from "./vo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const RED = "#ff3b30";
const YELLOW = "#ffd400";
const GREEN = "#22c55e";

// Final on-screen placement of the large display.
const BEZEL = 24;
const UI_SCALE = 0.95;
const DISPLAY = { left: 60, top: 70, width: UI_W * UI_SCALE + BEZEL * 2 };
const PANEL_X = DISPLAY.left + DISPLAY.width + 40;

const plus = (() => {
  const b = fieldBox(2);
  return { x: b.x + b.w - 50, y: b.y + b.h / 2 };
})();
const typeBox = fieldBox(1);
const detailsBox = fieldBox(0);

const STOPS: CursorStop[] = [
  { t: T.zoomEnd, x: 760, y: 470 },
  { t: T.menuTap, x: MENU_BTN.x, y: MENU_BTN.y, click: true },
  { t: T.emTap, ...tileCenter("Equipment Manager"), click: true },
  { t: T.backTap, x: BACK_BTN.x, y: BACK_BTN.y, click: true },
  { t: T.wsTap, ...tileCenter("Work Setup"), click: true },
  { t: T.details, x: detailsBox.x + detailsBox.w * 0.7, y: detailsBox.y + detailsBox.h / 2, click: true },
  { t: T.typeOpen, x: typeBox.x + typeBox.w * 0.7, y: typeBox.y + typeBox.h / 2, click: true },
  { t: T.typePick, x: typeBox.x + typeBox.w * 0.45, y: typeBox.y + typeBox.h + 40, click: true },
  { t: T.depthFrom, x: plus.x, y: plus.y, click: true },
  { t: (T.depthFrom + T.depthTo) / 2, x: plus.x, y: plus.y, click: true },
  { t: T.depthTo, x: plus.x, y: plus.y, click: true },
  { t: T.saveTap, x: SAVE_BTN.x, y: SAVE_BTN.y, click: true },
  { t: T.saved + 0.5, x: SAVE_BTN.x + 40, y: SAVE_BTN.y + 140 },
];

export const Partisi2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Zoom from the small in-cab display to the full-screen mockup.
  const z = interpolate(t, [0.3, T.zoomEnd], [0, 1], { ...clamp, easing: ease });
  const startScale = CAB_DISPLAY.width / DISPLAY.width;
  const scale = startScale + (1 - startScale) * z;
  const x = CAB_DISPLAY.x + (DISPLAY.left - CAB_DISPLAY.x) * z;
  const y = CAB_DISPLAY.y + (DISPLAY.top - CAB_DISPLAY.y) * z;
  const rot = CAB_DISPLAY.rotate * (1 - z);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1420", fontFamily: FONT }}>
      {/* background: cab view, pushes in and blurs as the display takes over */}
      <AbsoluteFill
        style={{
          scale: String(1 + z * 0.25),
          transformOrigin: "1530px 660px",
          filter: `blur(${z * 7}px) brightness(${1 - z * 0.45})`,
        }}
      >
        <CabView />
      </AbsoluteFill>

      {/* the display */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: DISPLAY.width,
          transformOrigin: "0 0",
          transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`,
        }}
      >
        <div
          style={{
            padding: BEZEL,
            borderRadius: 34,
            backgroundColor: "#0d0f12",
            boxShadow: "0 40px 90px rgba(0,0,0,0.55), inset 0 0 0 3px #2a2f35",
          }}
        >
          <div style={{ position: "relative", width: UI_W * UI_SCALE, height: UI_H * UI_SCALE, overflow: "hidden", borderRadius: 8 }}>
            <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", scale: String(UI_SCALE) }}>
              <G5Ui />
              <Cursor stops={STOPS} appear={interpolate(t, [T.zoomEnd - 0.2, T.zoomEnd + 0.2], [0, 1], clamp)} />
            </div>
          </div>
        </div>
      </div>

      <NotesPanel />
      <Subtitles lines={VO} left={DISPLAY.left} right={1920 - (DISPLAY.left + DISPLAY.width)} bottom={36} fontSize={38} />

      <Track name="Voiceover">
        {VO.map((line) => (
          <Audio
            key={line.id}
            name={`VO ${line.id}`}
            src={staticFile(line.file)}
            from={Math.round(line.from * fps)}
            durationInFrames={Math.ceil((line.to - line.from) * fps) + 1}
          />
        ))}
      </Track>
    </AbsoluteFill>
  );
};

const NotesPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const slide = interpolate(t, [T.zoomEnd - 0.1, T.zoomEnd + 0.5], [1, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const fieldsIn = interpolate(t, [T.wsOpen, T.wsOpen + 0.4], [0, 1], clamp);
  const crumbTarget = t >= T.wsTap ? "Work Setup" : "Equipment Manager";
  const crumbOn = interpolate(t, [T.appsOpen, T.appsOpen + 0.3], [0, 1], clamp);
  const targetOn = interpolate(t, [t >= T.wsTap ? T.wsTap : T.emTap, (t >= T.wsTap ? T.wsTap : T.emTap) + 0.3], [0, 1], clamp);

  const fields = [
    { key: "Details", desc: "Nama & ID Operator", from: T.details, to: T.type },
    { key: "Type", desc: "Standarisasi Kode Pengerjaan", from: T.type, to: T.depth },
    { key: "Depth", desc: "Kedalaman Sesuai Instruksi Asisten Lapangan", from: T.depth, to: T.saveTap },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: PANEL_X,
        top: 60,
        width: 1920 - PANEL_X - 50,
        translate: `${slide * 700}px 0px`,
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* breadcrumb */}
      <div style={{ backgroundColor: "rgba(15,27,42,0.92)", borderRadius: 18, padding: "22px 24px", border: "2px solid #23384f" }}>
        <div style={{ fontSize: 20, letterSpacing: 2, color: "#9fb3c8", fontWeight: 700 }}>MENU</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap", opacity: crumbOn }}>
          <Chip label="Applications" active={false} />
          <span style={{ fontSize: 30, color: YELLOW, fontWeight: 800 }}>→</span>
          <span style={{ opacity: targetOn }}>
            <Chip label={crumbTarget} active />
          </span>
        </div>
      </div>

      {/* Work Setup fields */}
      <div
        style={{
          backgroundColor: "rgba(15,27,42,0.92)",
          borderRadius: 18,
          padding: "22px 24px",
          border: "2px solid #23384f",
          opacity: 0.35 + 0.65 * fieldsIn,
        }}
      >
        <div style={{ fontSize: 20, letterSpacing: 2, color: "#9fb3c8", fontWeight: 700 }}>WORK SETUP FIELDS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
          {fields.map((f) => {
            const active = t >= f.from && t < f.to;
            const done = t >= f.to;
            return (
              <div
                key={f.key}
                style={{
                  borderRadius: 12,
                  border: `4px solid ${active ? RED : "transparent"}`,
                  backgroundColor: active ? "rgba(255,59,48,0.12)" : "rgba(255,255,255,0.04)",
                  padding: "12px 16px",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    borderRadius: 8,
                    marginTop: 2,
                    backgroundColor: done ? GREEN : "transparent",
                    border: `3px solid ${done ? GREEN : "#5d738a"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {done ? (
                    <svg width={22} height={22} viewBox="0 0 24 24">
                      <path d="M4 12.5 L10 18 L20 6" stroke="white" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: active ? "#ffb3ad" : "white" }}>{f.key}</div>
                  <div style={{ fontSize: 26, color: "#cfe0f0", lineHeight: 1.25 }}>{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ContextCard />
    </div>
  );
};

const Chip: React.FC<{ readonly label: string; readonly active: boolean }> = ({ label, active }) => (
  <span
    style={{
      display: "inline-block",
      padding: "8px 14px",
      borderRadius: 10,
      fontSize: 26,
      fontWeight: 700,
      backgroundColor: active ? YELLOW : "#23384f",
      color: active ? "#0f1b2a" : "white",
    }}
  >
    {label}
  </span>
);

// Illustration under the notes: implement sync, then the tillage depth.
const ContextCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const depthIn = interpolate(t, [T.depth, T.depth + 0.4], [0, 1], clamp);
  const depthNow = interpolate(t, [T.depthFrom, T.depthTo], [0, SAMPLE.depthCm], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  if (depthIn <= 0) return null;
  const px = 3.2; // pixels per cm
  const surface = 56;
  return (
    <div
      style={{
        backgroundColor: "rgba(15,27,42,0.92)",
        borderRadius: 18,
        padding: "18px 20px",
        border: "2px solid #23384f",
        opacity: depthIn,
        translate: `0px ${(1 - depthIn) * 20}px`,
      }}
    >
      <div style={{ fontSize: 20, letterSpacing: 2, color: "#9fb3c8", fontWeight: 700 }}>KEDALAMAN OLAH TANAH</div>
      <svg width="100%" viewBox="0 0 400 190" style={{ marginTop: 6, display: "block" }}>
        <rect width={400} height={surface} fill="#cfe9f5" opacity={0.15} />
        {/* cane stubble on the surface */}
        {[30, 80, 330, 380].map((x) => (
          <g key={x}>
            <line x1={x} y1={surface} x2={x - 6} y2={surface - 40} stroke="#5fb340" strokeWidth={5} strokeLinecap="round" />
            <line x1={x} y1={surface} x2={x + 8} y2={surface - 34} stroke="#6cc04a" strokeWidth={5} strokeLinecap="round" />
          </g>
        ))}
        <rect y={surface} width={400} height={190 - surface} fill="#7a5a33" />
        <rect y={surface} width={400} height={depthNow * px} fill="#a07a48" />
        {/* plough disc at depth */}
        <g transform={`translate(150 ${surface + depthNow * px - 24})`}>
          <line x1={0} y1={-80 - depthNow * px + 40} x2={0} y2={-10} stroke="#c9a200" strokeWidth={10} />
          <ellipse cx={0} cy={0} rx={26} ry={30} fill="#9aa0a6" stroke="#5b6168" strokeWidth={4} transform={`rotate(${frame * 4})`} />
        </g>
        {/* depth dimension */}
        <line x1={250} y1={surface} x2={250} y2={surface + depthNow * px} stroke={YELLOW} strokeWidth={4} />
        <line x1={238} y1={surface} x2={262} y2={surface} stroke={YELLOW} strokeWidth={4} />
        <line x1={238} y1={surface + depthNow * px} x2={262} y2={surface + depthNow * px} stroke={YELLOW} strokeWidth={4} />
        <text x={272} y={surface + depthNow * px / 2 + 12} fontSize={34} fontWeight={800} fill={YELLOW} fontFamily={FONT}>
          {Math.round(depthNow)} cm
        </text>
        <line x1={0} y1={surface} x2={400} y2={surface} stroke="#3d2b17" strokeWidth={3} />
      </svg>
      <div style={{ fontSize: 20, color: "#cfe0f0", marginTop: 6 }}>Nilai contoh. Ikuti instruksi asisten lapangan.</div>
    </div>
  );
};
