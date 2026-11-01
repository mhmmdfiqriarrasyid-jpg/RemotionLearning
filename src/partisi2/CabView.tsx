import React from "react";
import { useCurrentFrame } from "remotion";

// View from the operator seat through the windshield over sugarcane rows.
// Stylized; drawn in a 1920x1080 coordinate space.

const rand = (n: number) => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

const VP = { x: 960, y: 420 }; // vanishing point
const ROWS = Array.from({ length: 23 }, (_, i) => i - 11);

export const CabView: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 14) * 3;

  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="p2sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fc1ea" />
          <stop offset="1" stopColor="#e6f2f0" />
        </linearGradient>
        <linearGradient id="p2soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9b7a4e" />
          <stop offset="1" stopColor="#6e4f2b" />
        </linearGradient>
        <linearGradient id="p2hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4c9a3a" />
          <stop offset="1" stopColor="#2a6121" />
        </linearGradient>
        <linearGradient id="p2glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.14} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.08} />
        </linearGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#p2sky)" />
      {/* distant tree line + hills */}
      <path d="M0 430 Q 300 360 620 410 T 1240 400 T 1920 420 L1920 440 L0 440 Z" fill="#7fa78a" />
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={i * 50 + rand(i) * 30} cy={418 - rand(i + 3) * 14} r={16 + rand(i + 7) * 12} fill="#4f7f48" />
      ))}
      <rect y={420} width={1920} height={660} fill="url(#p2soil)" />

      {/* sugarcane rows in perspective (far to near) */}
      {ROWS.map((r) => {
        const bx = VP.x + r * 300;
        const plants = [];
        for (let k = 0; k < 16; k++) {
          const t = Math.pow((k + 1) / 16, 1.8);
          const x = VP.x + (bx - VP.x) * t;
          const y = VP.y + (1080 + 200 - VP.y) * t;
          const h = 18 + t * 520 * (0.85 + rand(r * 31 + k) * 0.3);
          const w = 1 + t * 9;
          const s = sway * t * (0.6 + rand(k + r) * 0.8);
          const leaf = 10 + t * 90;
          plants.push(
            <g key={k}>
              <line x1={x} y1={y} x2={x + s} y2={y - h} stroke="#3d7f28" strokeWidth={w} strokeLinecap="round" />
              {[0.45, 0.6, 0.75, 0.9].map((p, j) => (
                <path
                  key={j}
                  d={`M${x + s * p} ${y - h * p} q ${(j % 2 ? 1 : -1) * leaf * 0.6 + s} ${-leaf * 0.5} ${(j % 2 ? 1 : -1) * leaf + s} ${leaf * 0.15}`}
                  stroke={j % 2 ? "#5fb340" : "#6cc04a"}
                  strokeWidth={w * 0.8}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            </g>,
          );
        }
        // the tractor drives in the lane at r = 0: skip that row
        return r === 0 ? null : <g key={r}>{plants}</g>;
      })}

      {/* tractor hood */}
      <path d="M 640 1080 L 760 820 Q 960 790 1160 820 L 1280 1080 Z" fill="url(#p2hood)" />
      <path d="M 760 820 Q 960 790 1160 820 L 1150 840 Q 960 812 770 840 Z" fill="#6cbf53" />
      <path d="M 905 815 L 1015 815 L 1050 1080 L 870 1080 Z" fill="#3f8a30" opacity={0.6} />
      <rect x={1010} y={700} width={22} height={140} rx={6} fill="#22262a" />

      {/* cab frame + dashboard */}
      <path d="M0 0 L 230 0 L 300 1080 L 0 1080 Z" fill="#15181b" />
      <path d="M1920 0 L 1690 0 L 1620 1080 L 1920 1080 Z" fill="#15181b" />
      <rect width={1920} height={70} fill="#15181b" />
      <path d="M0 960 Q 960 900 1920 960 L1920 1080 L0 1080 Z" fill="#1f2327" />
      <rect width={1920} height={1080} fill="url(#p2glass)" />

      {/* G5 display mounted on the right corner post */}
      <g transform="translate(1380 560) rotate(-6)">
        <rect x={0} y={0} width={300} height={196} rx={14} fill="#0d0f12" />
        <rect x={12} y={12} width={276} height={172} rx={6} fill="#20262c" />
        <rect x={12} y={12} width={276} height={20} fill="#2b333b" />
        <rect x={22} y={40} width={256} height={118} fill="#5d7f3e" />
        <rect x={140} y={160} width={30} height={60} fill="#22262a" />
      </g>
    </svg>
  );
};

// Where the small in-cab display sits (used for the zoom transition).
export const CAB_DISPLAY = { x: 1380, y: 560, width: 300, rotate: -6 } as const;
