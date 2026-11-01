import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { VO_GAP, type VoLine } from "./vo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Shows the current voice-over line as a subtitle box.
export const Subtitles: React.FC<{
  readonly lines: readonly VoLine[];
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
  readonly fontSize?: number;
}> = ({ lines, left, right, bottom, fontSize = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const line = lines.find((l) => t >= l.from && t < l.to + VO_GAP);
  if (!line) return null;
  const opacity = interpolate(
    t,
    [line.from - 0.1, line.from + 0.15, line.to + VO_GAP - 0.2, line.to + VO_GAP],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <div style={{ position: "absolute", left, right, bottom, display: "flex", justifyContent: "center", opacity }}>
      <div
        style={{
          backgroundColor: "rgba(8, 14, 22, 0.82)",
          color: "white",
          fontSize,
          lineHeight: 1.3,
          fontWeight: 600,
          padding: "14px 28px",
          borderRadius: 14,
          textAlign: "center",
        }}
      >
        {line.text}
      </div>
    </div>
  );
};
