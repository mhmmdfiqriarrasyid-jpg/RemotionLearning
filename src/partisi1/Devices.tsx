import React from "react";

// Stylized illustrations, drawn from public descriptions only (no official
// artwork or logos): a dome-shaped GNSS receiver in yellow/green, and a
// 10.1-inch landscape touchscreen display.

const YELLOW = "#ffd400";
const GREEN = "#367c2b";

export const StarFireIllustration: React.FC<{ readonly glow: number }> = ({
  glow,
}) => (
  <svg viewBox="0 0 400 260" width="100%" height="100%">
    <defs>
      <radialGradient id="domeShade" cx="0.35" cy="0.25" r="0.9">
        <stop offset="0" stopColor="#fff27a" />
        <stop offset="0.45" stopColor={YELLOW} />
        <stop offset="1" stopColor="#c9a200" />
      </radialGradient>
    </defs>
    {/* signal rings */}
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M ${200 - 70 - i * 34} ${70 - i * 18} Q 200 ${-10 - i * 26} ${200 + 70 + i * 34} ${70 - i * 18}`}
        fill="none"
        stroke={YELLOW}
        strokeWidth={5}
        strokeLinecap="round"
        opacity={glow * (1 - i * 0.28)}
      />
    ))}
    {/* square hoop mounting bracket */}
    <rect x={150} y={196} width={100} height={46} rx={6} fill="#5b6168" />
    <rect x={130} y={234} width={140} height={14} rx={4} fill="#3b4046" />
    {/* receiver base */}
    <ellipse cx={200} cy={190} rx={150} ry={26} fill="#1e4a17" />
    <rect x={50} y={160} width={300} height={30} fill={GREEN} />
    <ellipse cx={200} cy={160} rx={150} ry={26} fill="#2f6d24" />
    {/* dome */}
    <path d="M 62 160 Q 70 62 200 56 Q 330 62 338 160 Z" fill="url(#domeShade)" />
    <ellipse cx={150} cy={100} rx={40} ry={14} fill="#fff" opacity={0.25} />
  </svg>
);

type ScreenMode = "home" | "status" | "map";

export const G5Illustration: React.FC<{
  readonly mode: ScreenMode;
  readonly accuracy: number; // 0..100
  readonly popup: number; // 0..1 Status Center popup appearance
  readonly boundary: number; // 0..1
  readonly abLine: number; // 0..1
  readonly tractor?: number; // 0..1 position along the AB-Line on the map
}> = ({ mode, accuracy, popup, boundary, abLine, tractor = 0 }) => {
  // 10.1" touchscreen ~16:10. Screen area 560 x 350 inside a black bezel.
  const sx = 40;
  const sy = 30;
  const sw = 560;
  const sh = 350;
  return (
    <svg viewBox="0 0 640 420" width="100%" height="100%">
      {/* bezel */}
      <rect x={10} y={8} width={620} height={398} rx={26} fill="#121416" />
      <rect x={18} y={16} width={604} height={382} rx={20} fill="#1d2023" />
      {/* screen */}
      <rect x={sx} y={sy} width={sw} height={sh} rx={6} fill="#20262c" />
      {/* top status bar */}
      <rect x={sx} y={sy} width={sw} height={38} rx={6} fill="#2b333b" />
      <circle cx={sx + 22} cy={sy + 19} r={8} fill={accuracy >= 100 ? "#36d27a" : "#f2b233"} />
      <text x={sx + 38} y={sy + 25} fontSize={16} fill="#e7ecef" fontFamily="system-ui, sans-serif">
        GPS
      </text>
      <rect x={sx + sw - 96} y={sy + 12} width={14} height={14} fill="#c9d1d6" />
      <rect x={sx + sw - 76} y={sy + 12} width={14} height={14} fill="#c9d1d6" />
      <rect x={sx + sw - 56} y={sy + 12} width={14} height={14} fill="#c9d1d6" />
      <rect x={sx + sw - 36} y={sy + 12} width={14} height={14} fill="#c9d1d6" />

      {/* main area: top-down field map */}
      <g transform={`translate(${sx + 20} ${sy + 52})`}>
        <rect width={sw - 40} height={sh - 120} rx={6} fill="#5d7f3e" />
        {Array.from({ length: 11 }, (_, i) => (
          <line
            key={i}
            x1={30}
            x2={sw - 70}
            y1={20 + i * 15}
            y2={20 + i * 15}
            stroke="#3f8f2c"
            strokeWidth={5}
          />
        ))}
        {mode === "map" ? (
          <>
            <rect
              x={12}
              y={8}
              width={sw - 64}
              height={sh - 136}
              fill="none"
              stroke={YELLOW}
              strokeWidth={4}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - boundary}
            />
            <line
              x1={40}
              y1={196}
              x2={40 + (sw - 120) * abLine}
              y2={196}
              stroke="#00a3ff"
              strokeWidth={5}
              strokeLinecap="round"
            />
            {abLine > 0 ? <ScreenPin x={40} y={196} label="A" /> : null}
            {abLine >= 1 ? <ScreenPin x={sw - 80} y={196} label="B" /> : null}
            {abLine > 0 ? (
              <g transform={`translate(${40 + (sw - 120) * tractor} 196)`}>
                <path d="M -11 -9 L 13 0 L -11 9 Z" fill="#ffffff" stroke="#0d0f12" strokeWidth={2} />
              </g>
            ) : null}
          </>
        ) : null}
      </g>

      {/* bottom shortcut bar */}
      <rect x={sx} y={sy + sh - 56} width={sw} height={56} fill="#2b333b" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={i}
          x={sx + 24 + i * 88}
          y={sy + sh - 44}
          width={64}
          height={32}
          rx={6}
          fill={i === 0 && mode !== "home" ? "#4a5560" : "#38424b"}
        />
      ))}

      {/* Status Center popup */}
      {popup > 0 ? (
        <g
          opacity={popup}
          transform={`translate(${sx + 70} ${sy + 50 + (1 - popup) * 30})`}
        >
          <rect width={420} height={230} rx={10} fill="#f4f6f7" />
          <rect width={420} height={46} rx={10} fill="#2b333b" />
          <rect y={36} width={420} height={10} fill="#2b333b" />
          <text x={20} y={31} fontSize={20} fontWeight={700} fill="#fff" fontFamily="system-ui, sans-serif">
            Status Center
          </text>
          <text x={20} y={84} fontSize={18} fill="#4a5560" fontFamily="system-ui, sans-serif">
            GPS
          </text>
          <text x={400} y={84} textAnchor="end" fontSize={18} fontWeight={700} fill="#1d2023" fontFamily="system-ui, sans-serif">
            StarFire 7500
          </text>
          <text x={20} y={128} fontSize={18} fill="#4a5560" fontFamily="system-ui, sans-serif">
            Accuracy
          </text>
          <text x={400} y={128} textAnchor="end" fontSize={22} fontWeight={800} fill={accuracy >= 100 ? "#1f9d55" : "#b7791f"} fontFamily="system-ui, sans-serif">
            {Math.round(accuracy)}%
          </text>
          <rect x={20} y={142} width={380} height={22} rx={11} fill="#d9dee2" />
          <rect
            x={20}
            y={142}
            width={380 * (accuracy / 100)}
            height={22}
            rx={11}
            fill={accuracy >= 100 ? "#22c55e" : "#f2b233"}
          />
          <text x={20} y={204} fontSize={18} fill="#4a5560" fontFamily="system-ui, sans-serif">
            Signal Str
          </text>
          <text x={400} y={204} textAnchor="end" fontSize={18} fontWeight={700} fill="#1d2023" fontFamily="system-ui, sans-serif">
            25dB
          </text>
        </g>
      ) : null}
    </svg>
  );
};

const ScreenPin: React.FC<{ readonly x: number; readonly y: number; readonly label: string }> = ({
  x,
  y,
  label,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={13} fill="#00a3ff" stroke="#fff" strokeWidth={3} />
    <text y={6} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" fontFamily="system-ui, sans-serif">
      {label}
    </text>
  </g>
);
