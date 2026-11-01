import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { G5Illustration, StarFireIllustration } from "./Devices";
import { T } from "./timeline";
import { VO, VO_GAP } from "./vo";
import { World } from "./World";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const WORLD_W = 1180;
const PANEL_W = 1920 - WORLD_W;

const CHECKS: { label: string; active: number; done: number }[] = [
  { label: "GPS: StarFire 7500", active: T.starfire, done: T.g5 },
  { label: "Display: CommandCenter G5", active: T.g5, done: T.status },
  { label: "ACCURACY: 100% (Signal Str: 25dB)", active: T.status, done: T.status + 3.6 },
  { label: "Boundary & AB-Line Guidance Check", active: T.field, done: T.field + 3.8 },
];

export const Partisi1: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1420", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: WORLD_W, height: 1080, overflow: "hidden" }}>
        <World width={WORLD_W} height={1080} />
        <StatusCenterPopup />
        <Subtitles />
      </div>
      <Panel />
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

// Accuracy bar fills 0 -> 100% while the Status Center is open.
const useAccuracy = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [(T.status + 0.8) * fps, (T.status + 3.5) * fps], [0, 100], {
    ...clamp,
    easing: Easing.bezier(0.3, 0, 0.2, 1),
  });
};

// Large Status Center popup over the cab close-up (stylized, not the real UI).
const StatusCenterPopup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accuracy = useAccuracy();
  const appear = interpolate(
    frame,
    [(T.status + 0.1) * fps, (T.status + 0.6) * fps, (T.field - 0.5) * fps, (T.field - 0.1) * fps],
    [0, 1, 1, 0],
    { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) },
  );
  if (appear <= 0) return null;
  const full = accuracy >= 100;
  const row: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontSize: 30,
    color: "#4a5560",
  };
  const value: React.CSSProperties = { fontWeight: 800, color: "#1d2023" };
  return (
    <div
      style={{
        position: "absolute",
        right: 70,
        top: 110,
        width: 540,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: "#f4f6f7",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        opacity: appear,
        scale: String(0.9 + 0.1 * appear),
        translate: `0px ${(1 - appear) * 30}px`,
      }}
    >
      <div style={{ backgroundColor: "#2b333b", color: "white", padding: "20px 30px", fontSize: 34, fontWeight: 800 }}>
        Status Center
      </div>
      <div style={{ padding: "26px 30px 32px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={row}>
          <span>GPS</span>
          <span style={value}>StarFire 7500</span>
        </div>
        <div style={row}>
          <span>Accuracy</span>
          <span style={{ ...value, fontSize: 44, color: full ? "#1f9d55" : "#b7791f" }}>
            {Math.round(accuracy)}%
          </span>
        </div>
        <div style={{ height: 30, borderRadius: 15, backgroundColor: "#d9dee2", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${accuracy}%`,
              borderRadius: 15,
              backgroundColor: full ? "#22c55e" : "#f2b233",
            }}
          />
        </div>
        <div style={row}>
          <span>Signal Str</span>
          <span style={value}>25dB</span>
        </div>
      </div>
    </div>
  );
};

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const line = VO.find((l) => t >= l.from && t < l.to + VO_GAP);
  if (!line) return null;
  const opacity = interpolate(
    t,
    [line.from - 0.1, line.from + 0.15, line.to + VO_GAP - 0.2, line.to + VO_GAP],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 70,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(8, 14, 22, 0.78)",
          color: "white",
          fontSize: 40,
          lineHeight: 1.3,
          fontWeight: 600,
          padding: "16px 28px",
          borderRadius: 14,
          textAlign: "center",
          maxWidth: 1000,
        }}
      >
        {line.text}
      </div>
    </div>
  );
};

const Panel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (sec: number) => sec * fps;

  const slideIn = interpolate(frame, [0, s(0.8)], [PANEL_W, 0], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const accuracy = useAccuracy();
  const popup = interpolate(frame, [s(T.status + 0.1), s(T.status + 0.6)], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const boundary = interpolate(frame, [s(T.field + 0.8), s(T.field + 2.6)], [0, 1], clamp);
  const abLine = interpolate(frame, [s(T.field + 2.4), s(T.field + 3.6)], [0, 1], clamp);

  const show = (from: number, to: number) =>
    interpolate(frame, [s(from), s(from + 0.35), s(to - 0.35), s(to)], [0, 1, 1, 0], clamp);
  const starfireOpacity = show(T.starfire, T.g5);
  const g5Opacity = interpolate(frame, [s(T.g5), s(T.g5 + 0.35)], [0, 1], clamp);
  const introOpacity = interpolate(frame, [s(0.6), s(1.0), s(T.starfire - 0.3), s(T.starfire)], [0, 1, 1, 0], clamp);

  const t = frame / fps;
  const caption =
    t < T.starfire
      ? ""
      : t < T.g5
        ? "GPS Receiver · StarFire 7500"
        : t < T.status
          ? "Display · CommandCenter G5"
          : t < T.field
            ? "Status Center · Accuracy"
            : "Boundary & AB-Line";

  return (
    <div
      style={{
        position: "absolute",
        left: WORLD_W,
        top: 0,
        width: PANEL_W,
        height: 1080,
        backgroundColor: "#0f1b2a",
        borderLeft: "6px solid #ffd400",
        translate: `${slideIn}px 0px`,
        padding: "70px 56px",
        boxSizing: "border-box",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05 }}>
        CHECK DEVICE UNIT
      </div>

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        {CHECKS.map((c) => (
          <CheckRow key={c.label} label={c.label} active={c.active} done={c.done} />
        ))}
      </div>

      <div
        style={{
          marginTop: 36,
          position: "relative",
          height: 400,
          borderRadius: 20,
          backgroundColor: "#16263a",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: introOpacity, fontSize: 34, color: "#9fb3c8", fontWeight: 600, textAlign: "center", padding: 40 }}>
          Persiapan unit sebelum turun ke lapangan
        </div>
        <div style={{ position: "absolute", inset: 30, opacity: starfireOpacity }}>
          <StarFireIllustration glow={0.5 + 0.5 * Math.sin(frame / 6)} />
        </div>
        <div style={{ position: "absolute", inset: 20, opacity: g5Opacity }}>
          <G5Illustration
            mode={t >= T.field ? "map" : t >= T.status ? "status" : "home"}
            accuracy={accuracy}
            popup={t >= T.field ? 0 : popup}
            boundary={boundary}
            abLine={abLine}
          />
        </div>
      </div>
      <div style={{ marginTop: 18, fontSize: 30, fontWeight: 700, color: "#cfe0f0", minHeight: 40 }}>
        {caption}
      </div>
    </div>
  );
};

const CheckRow: React.FC<{
  readonly label: string;
  readonly active: number;
  readonly done: number;
}> = ({ label, active, done }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = interpolate(frame, [active * fps, (active + 0.3) * fps], [0.35, 1], clamp);
  const check = interpolate(frame, [done * fps, (done + 0.3) * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const isDone = check > 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: on,
        backgroundColor: on > 0.9 && !isDone ? "rgba(255,212,0,0.12)" : "transparent",
        borderRadius: 12,
        padding: "10px 14px",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          border: `3px solid ${isDone ? "#22c55e" : "#5d738a"}`,
          backgroundColor: isDone ? "#22c55e" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width={26} height={26} viewBox="0 0 24 24" style={{ scale: String(check) }}>
          <path d="M4 12.5 L10 18 L20 6" stroke="white" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ fontSize: 32, fontWeight: 600 }}>{label}</div>
    </div>
  );
};
