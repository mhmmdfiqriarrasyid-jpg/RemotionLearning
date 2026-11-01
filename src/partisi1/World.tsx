import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { iso, pts } from "./iso";
import { Tractor, tractorFocus } from "./Tractor";
import {
  AB,
  BOUNDARY,
  FIELD,
  T,
  TRACTOR_END_X,
  TRACTOR_PARK_X,
  TRACTOR_Y,
} from "./timeline";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);

const rect = (x0: number, y0: number, x1: number, y1: number, z = 0) => [
  iso(x0, y0, z),
  iso(x1, y0, z),
  iso(x1, y1, z),
  iso(x0, y1, z),
];

// One path per cane row keeps the SVG light.
const caneRow = (y: number, sway: number) => {
  let d = "";
  for (let x = FIELD.x0 + 0.5; x < FIELD.x1; x += 1.1) {
    const [bx, by] = iso(x, y, 0);
    const [tx, ty] = iso(x, y, 2.2);
    const s = sway * Math.sin(x * 1.7 + y);
    d += `M${bx.toFixed(1)} ${by.toFixed(1)}L${(tx + s).toFixed(1)} ${ty.toFixed(1)}`;
    d += `M${(bx + (tx - bx) * 0.6).toFixed(1)} ${(by + (ty - by) * 0.6).toFixed(1)}l${(-12 + s).toFixed(1)} -6`;
    d += `M${(bx + (tx - bx) * 0.75).toFixed(1)} ${(by + (ty - by) * 0.75).toFixed(1)}l${(12 + s).toFixed(1)} -7`;
  }
  return d;
};

const ROWS = Array.from(
  { length: Math.floor((FIELD.y1 - FIELD.y0) / 2) },
  (_, i) => FIELD.y0 + 1 + i * 2,
);

export const World: React.FC<{
  readonly width: number;
  readonly height: number;
}> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (sec: number) => sec * fps;

  // Tractor: parked during the device check, drives along the AB-Line at the end.
  const tractorX = interpolate(
    frame,
    [s(T.field + 3), s(T.end)],
    [TRACTOR_PARK_X, TRACTOR_END_X],
    { ...clamp, easing: Easing.bezier(0.4, 0, 0.6, 1) },
  );
  const focus = tractorFocus(TRACTOR_PARK_X, TRACTOR_Y);
  const fieldCenter = iso(20, 22, 0);

  // Camera keyframes: [time, focusX, focusY, scale]
  const keys: [number, number, number, number][] = [
    [0, fieldCenter[0], fieldCenter[1], 0.62],
    [T.starfire - 0.6, fieldCenter[0] - 120, fieldCenter[1] + 80, 0.75],
    [T.starfire + 0.6, focus.receiver[0], focus.receiver[1], 3.0],
    [T.g5 - 0.3, focus.receiver[0] + 8, focus.receiver[1], 3.2],
    [T.g5 + 0.6, focus.display[0] + 30, focus.display[1] - 10, 6.5],
    [T.field - 0.4, focus.display[0] + 36, focus.display[1] - 10, 6.8],
    [T.field + 1.2, fieldCenter[0], fieldCenter[1], 0.62],
    [T.end, fieldCenter[0] + 40, fieldCenter[1] + 20, 0.66],
  ];
  const times = keys.map((k) => s(k[0]));
  const camX = interpolate(frame, times, keys.map((k) => k[1]), { ...clamp, easing: ease });
  const camY = interpolate(frame, times, keys.map((k) => k[2]), { ...clamp, easing: ease });
  const camS = interpolate(frame, times, keys.map((k) => k[3]), { ...clamp, easing: ease });

  const receiverGlow = interpolate(
    frame,
    [s(T.starfire), s(T.starfire + 0.5), s(T.g5), s(T.g5 + 0.3)],
    [0, 1, 1, 0],
    clamp,
  );
  const displayGlow = interpolate(
    frame,
    [s(T.g5 + 0.3), s(T.g5 + 0.8), s(T.field), s(T.field + 0.5)],
    [0, 1, 1, 0.3],
    clamp,
  );

  const boundaryProgress = interpolate(
    frame,
    [s(T.field + 0.8), s(T.field + 2.6)],
    [0, 1],
    { ...clamp, easing: ease },
  );
  const abProgress = interpolate(
    frame,
    [s(T.field + 2.4), s(T.field + 3.6)],
    [0, 1],
    { ...clamp, easing: ease },
  );

  const sway = 3 * Math.sin(frame / 12);
  const a = iso(AB.ax, AB.y, 0.05);
  const b = iso(AB.bx, AB.y, 0.05);

  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe3f2" />
          <stop offset="1" stopColor="#e8f3e2" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#sky)" />
      <g
        transform={`translate(${width / 2} ${height / 2}) scale(${camS}) translate(${-camX} ${-camY})`}
      >
        {/* surrounding grass */}
        <polygon points={pts(rect(-14, -14, 56, 56))} fill="#6c9a45" />
        {/* soil under the cane */}
        <polygon
          points={pts(rect(FIELD.x0, FIELD.y0, FIELD.x1, FIELD.y1))}
          fill="#7a5a33"
        />
        {/* headland lane */}
        <polygon
          points={pts(rect(FIELD.x0, FIELD.y1, FIELD.x1, BOUNDARY.y1 - 1))}
          fill="#a88a5c"
        />
        {/* sugarcane rows (back to front) */}
        {ROWS.map((y) => (
          <path
            key={y}
            d={caneRow(y, sway)}
            stroke={y % 4 === 1 ? "#3f8f2c" : "#4fa336"}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {/* Boundary */}
        <polygon
          points={pts(rect(BOUNDARY.x0, BOUNDARY.y0, BOUNDARY.x1, BOUNDARY.y1, 0.05))}
          fill="rgba(255, 212, 0, 0.08)"
          stroke="#ffd400"
          strokeWidth={6}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - boundaryProgress}
          opacity={boundaryProgress > 0 ? 1 : 0}
        />

        {/* AB-Line + neighbouring guidance passes */}
        {abProgress > 0 ? (
          <g>
            {[-3, 3].map((off) => {
              const p = iso(AB.ax, AB.y + off, 0.05);
              const q = iso(AB.bx, AB.y + off, 0.05);
              return (
                <line
                  key={off}
                  x1={p[0]}
                  y1={p[1]}
                  x2={p[0] + (q[0] - p[0]) * abProgress}
                  y2={p[1] + (q[1] - p[1]) * abProgress}
                  stroke="#ffffff"
                  strokeWidth={3}
                  strokeDasharray="14 10"
                  opacity={0.6}
                />
              );
            })}
            <line
              x1={a[0]}
              y1={a[1]}
              x2={a[0] + (b[0] - a[0]) * abProgress}
              y2={a[1] + (b[1] - a[1]) * abProgress}
              stroke="#00a3ff"
              strokeWidth={7}
              strokeLinecap="round"
            />
            <Marker p={a} label="A" />
            {abProgress >= 1 ? <Marker p={b} label="B" /> : null}
          </g>
        ) : null}

        <Tractor
          x={tractorX}
          y={TRACTOR_Y}
          receiverGlow={receiverGlow}
          displayGlow={displayGlow}
        />
      </g>
    </svg>
  );
};

const Marker: React.FC<{ readonly p: readonly [number, number]; readonly label: string }> = ({
  p,
  label,
}) => (
  <g transform={`translate(${p[0]} ${p[1]})`}>
    <line x1={0} y1={0} x2={0} y2={-60} stroke="#0b1b2b" strokeWidth={4} />
    <circle cx={0} cy={-76} r={22} fill="#00a3ff" stroke="#fff" strokeWidth={4} />
    <text
      x={0}
      y={-68}
      textAnchor="middle"
      fontSize={24}
      fontWeight={800}
      fill="#fff"
      fontFamily="system-ui, sans-serif"
    >
      {label}
    </text>
  </g>
);
