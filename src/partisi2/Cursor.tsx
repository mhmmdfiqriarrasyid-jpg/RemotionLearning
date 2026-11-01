import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type CursorStop = { readonly t: number; readonly x: number; readonly y: number; readonly click?: boolean };

// Touch pointer that travels between stops and shows a ripple on each click.
// Coordinates are in the parent's space (the G5 UI box).
export const Cursor: React.FC<{ readonly stops: readonly CursorStop[]; readonly appear: number }> = ({
  stops,
  appear,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Arrive at each stop 0.35 s before its time, hold, then move on.
  const times: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  stops.forEach((s, i) => {
    const arrive = i === 0 ? s.t : Math.max(s.t - 0.35, times[times.length - 1] + 0.05);
    times.push(arrive, Math.max(arrive + 0.01, s.t + 0.1));
    xs.push(s.x, s.x);
    ys.push(s.y, s.y);
  });
  const opts = { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) };
  const x = interpolate(t, times, xs, opts);
  const y = interpolate(t, times, ys, opts);
  const lastClick = [...stops].reverse().find((s) => s.click && t >= s.t);
  const since = lastClick ? t - lastClick.t : 99;
  const ripple = since < 0.45 ? since / 0.45 : -1;
  const press = since < 0.15 ? 0.88 : 1;

  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: appear, pointerEvents: "none" }}>
      {ripple >= 0 ? (
        <div
          style={{
            position: "absolute",
            left: x - 20 - ripple * 40,
            top: y - 20 - ripple * 40,
            width: 40 + ripple * 80,
            height: 40 + ripple * 80,
            borderRadius: "50%",
            border: "5px solid #ffd400",
            opacity: 1 - ripple,
          }}
        />
      ) : null}
      <svg
        width={70}
        height={84}
        viewBox="0 0 70 84"
        style={{ position: "absolute", left: x - 22, top: y - 6, scale: String(press), transformOrigin: "22px 6px", filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.45))" }}
      >
        {/* hand pointer */}
        <path
          d="M22 6 c5 0 8 4 8 8 v22 l4 -1 c4 -1 8 1 9 5 l1 0 c4 -1 8 1 9 5 l1 0 c4 -1 8 2 8 6 v14 c0 10 -8 18 -18 18 h-12 c-7 0 -12 -3 -16 -9 l-12 -18 c-2 -4 -1 -8 3 -10 c3 -2 7 -1 9 2 l4 5 V14 c0 -4 3 -8 7 -8 z"
          fill="#ffffff"
          stroke="#0d0f12"
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
