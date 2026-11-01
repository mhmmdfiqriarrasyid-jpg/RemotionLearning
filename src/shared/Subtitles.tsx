import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { VO_GAP, type VoLine } from "./vo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Splits a line into captions of at most maxChars. Breaks at sentence ends
// (. ! ? :) first; a sentence that is still too long is broken at commas.
// Each caption gets a share of the line's time proportional to its length.
const pack = (parts: string[], maxChars: number) => {
  const out: string[] = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (last !== undefined && last.length + 1 + p.length <= maxChars) out[out.length - 1] = `${last} ${p}`;
    else out.push(p);
  }
  return out;
};

const chunk = (line: VoLine, maxChars: number) => {
  const sentences = line.text.split(/(?<=[.!?:])\s+/);
  const pieces = sentences.flatMap((sn) => (sn.length <= maxChars ? [sn] : pack(sn.split(/(?<=,)\s+/), maxChars)));
  const chunks = pack(pieces, maxChars);
  const total = chunks.reduce((n, c) => n + c.length, 0);
  let acc = 0;
  return chunks.map((text) => {
    const from = line.from + ((line.to - line.from) * acc) / total;
    acc += text.length;
    const to = line.from + ((line.to - line.from) * acc) / total;
    return { text, from, to };
  });
};

export const Subtitles: React.FC<{
  readonly lines: readonly VoLine[];
  readonly left: number;
  readonly right: number;
  readonly bottom?: number;
  readonly top?: number; // anchor to the top so 1- and 2-line captions start at the same y
  readonly fontSize?: number;
  readonly variant?: "box" | "plain"; // plain = dark text, no background
  readonly align?: "center" | "left";
  readonly maxChars?: number; // split long lines into several captions
  readonly style?: React.CSSProperties; // text style override (plain variant)
}> = ({ lines, left, right, bottom, top, fontSize = 40, variant = "box", align = "center", maxChars, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const current = lines.find((l) => t >= l.from && t < l.to + VO_GAP);
  if (!current) return null;
  const caps = maxChars ? chunk(current, maxChars) : [{ text: current.text, from: current.from, to: current.to }];
  const idx = caps.findIndex((c, i) => t < (i === caps.length - 1 ? c.to + VO_GAP : caps[i + 1].from));
  const cap = caps[idx < 0 ? caps.length - 1 : idx];
  const isFirst = cap === caps[0];
  const isLast = cap === caps[caps.length - 1];
  const opacity = interpolate(
    t,
    [cap.from - 0.1, cap.from + 0.15, (isLast ? cap.to + VO_GAP : cap.to) - 0.2, isLast ? cap.to + VO_GAP : cap.to + 0.05],
    [isFirst ? 0 : 0.4, 1, 1, isLast ? 0 : 1],
    clamp,
  );
  const line = { text: cap.text };
  return (
    <div style={{ position: "absolute", left, right, bottom, top, display: "flex", justifyContent: align === "left" ? "flex-start" : "center", opacity }}>
      <div
        style={
          variant === "plain"
            ? { color: "#1f2a22", fontSize, lineHeight: 1.35, fontWeight: 500, textAlign: align, ...style }
            : {
                backgroundColor: "rgba(8, 14, 22, 0.82)",
                color: "white",
                fontSize,
                lineHeight: 1.3,
                fontWeight: 600,
                padding: "14px 28px",
                borderRadius: 14,
                textAlign: "center",
              }
        }
      >
        {line.text}
      </div>
    </div>
  );
};
