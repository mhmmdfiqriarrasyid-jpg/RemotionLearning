import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { iso, pts, type Pt } from "./iso";
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
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// Deterministic pseudo-random in [0, 1).
const rand = (n: number) => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

const rect = (x0: number, y0: number, x1: number, y1: number, z = 0) => [
  iso(x0, y0, z),
  iso(x1, y0, z),
  iso(x1, y1, z),
  iso(x0, y1, z),
];

const f1 = (n: number) => n.toFixed(1);

// Sugarcane: one path for stalks and one for leaves per row keeps the SVG light.
const caneRow = (y: number, sway: number) => {
  let stalks = "";
  let leaves = "";
  let i = 0;
  for (let x = FIELD.x0 + 0.5; x < FIELD.x1; x += 1.0) {
    i++;
    const h = 1.9 + rand(i * 31 + y) * 0.9;
    const jx = (rand(i * 7 + y * 3) - 0.5) * 0.4;
    const [bx, by] = iso(x + jx, y, 0);
    const [tx, ty] = iso(x + jx, y, h);
    const s = sway * Math.sin(x * 1.7 + y);
    stalks += `M${f1(bx)} ${f1(by)}L${f1(tx + s)} ${f1(ty)}`;
    for (let k = 0; k < 4; k++) {
      const t = 0.45 + k * 0.17;
      const px = bx + (tx + s - bx) * t;
      const py = by + (ty - by) * t;
      const dir = k % 2 === 0 ? -1 : 1;
      const len = 14 - k * 2;
      leaves += `M${f1(px)} ${f1(py)}q${f1(dir * len * 0.6 + s)} ${f1(-len * 0.7)} ${f1(dir * len + s)} ${f1(-len * 0.2)}`;
    }
  }
  return { stalks, leaves };
};

const ROWS = Array.from(
  { length: Math.floor((FIELD.y1 - FIELD.y0) / 2) },
  (_, i) => FIELD.y0 + 1 + i * 2,
);

// Tree line behind the field (smaller x+y is further away, drawn first).
const TREES = (() => {
  const list: { x: number; y: number; s: number; seed: number }[] = [];
  for (let i = 0; i < 26; i++) {
    list.push({ x: -5 - rand(i) * 4, y: -6 + i * 2 + rand(i + 50), s: 1 + rand(i + 9) * 0.6, seed: i });
    list.push({ x: -6 + i * 2.1 + rand(i + 80), y: -5 - rand(i + 30) * 4, s: 1 + rand(i + 19) * 0.6, seed: i + 100 });
  }
  return list.sort((a, b) => a.x + a.y - (b.x + b.y));
})();

const GRASS_TUFTS = Array.from({ length: 260 }, (_, i) => {
  const x = -15 + rand(i * 3) * 72;
  const y = -15 + rand(i * 5 + 1) * 72;
  const inside = x > BOUNDARY.x0 - 0.5 && x < BOUNDARY.x1 + 0.5 && y > BOUNDARY.y0 - 0.5 && y < BOUNDARY.y1 + 0.5;
  return inside ? null : iso(x, y, 0);
}).filter((p): p is Pt => p !== null);

const Tree: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly seed: number }> = ({
  x,
  y,
  s,
  seed,
}) => {
  const base = iso(x, y, 0);
  const top = iso(x, y, 3.2 * s);
  const r = 26 * s;
  const shade = rand(seed) > 0.5;
  return (
    <g>
      <ellipse cx={base[0] + 10} cy={base[1] + 4} rx={r * 0.9} ry={r * 0.4} fill="rgba(20,40,10,0.25)" />
      <line x1={base[0]} y1={base[1]} x2={top[0]} y2={top[1] + r * 0.6} stroke="#5b3f22" strokeWidth={6 * s} />
      <circle cx={top[0] - r * 0.45} cy={top[1] + r * 0.25} r={r * 0.75} fill={shade ? "#2f6b2a" : "#336f2c"} />
      <circle cx={top[0] + r * 0.45} cy={top[1] + r * 0.3} r={r * 0.7} fill="#2a6125" />
      <circle cx={top[0]} cy={top[1] - r * 0.15} r={r * 0.85} fill={shade ? "#3c8434" : "#408a37"} />
      <circle cx={top[0] - r * 0.25} cy={top[1] - r * 0.4} r={r * 0.35} fill="#5aa64a" opacity={0.8} />
    </g>
  );
};

export const World: React.FC<{
  readonly width: number;
  readonly height: number;
}> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (sec: number) => sec * fps;

  // Tractor: parked during the device check, drives along the AB-Line at the end.
  const driveStart = s(T.field + 3);
  const tractorX = interpolate(frame, [driveStart, s(T.end)], [TRACTOR_PARK_X, TRACTOR_END_X], {
    ...clamp,
    easing: Easing.bezier(0.4, 0, 0.6, 1),
  });
  const moving = interpolate(
    frame,
    [driveStart, driveStart + 15, s(T.end) - 20, s(T.end)],
    [0, 1, 1, 0.2],
    clamp,
  );
  const focus = tractorFocus(TRACTOR_PARK_X, TRACTOR_Y);
  const fieldCenter = iso(20, 22, 0);

  // Camera keyframes: [time, focusX, focusY, scale]
  const keys: [number, number, number, number][] = [
    [0, fieldCenter[0], fieldCenter[1] - 40, 0.6],
    [T.starfire - 0.6, fieldCenter[0] - 140, fieldCenter[1] + 90, 0.78],
    [T.starfire + 0.6, focus.receiver[0] + 10, focus.receiver[1] + 10, 3.0],
    [T.g5 - 0.3, focus.receiver[0] + 18, focus.receiver[1] + 10, 3.2],
    [T.g5 + 0.6, focus.display[0] + 30, focus.display[1] - 10, 6.5],
    [T.field - 0.4, focus.display[0] + 36, focus.display[1] - 10, 6.8],
    [T.field + 1.2, fieldCenter[0], fieldCenter[1], 0.62],
    [T.end, fieldCenter[0] + 40, fieldCenter[1] + 20, 0.66],
  ];
  const times = keys.map((k) => s(k[0]));
  const camX = interpolate(frame, times, keys.map((k) => k[1]), { ...clamp, easing: ease });
  const camY = interpolate(frame, times, keys.map((k) => k[2]), { ...clamp, easing: ease });
  const camS = interpolate(frame, times, keys.map((k) => k[3]), { ...clamp, easing: ease });
  // Gentle hand-held drift.
  const driftX = Math.sin(frame / 47) * 6;
  const driftY = Math.cos(frame / 61) * 4;
  const toScreen = (p: Pt): Pt => [
    width / 2 + (p[0] - camX) * camS + driftX,
    height / 2 + (p[1] - camY) * camS + driftY,
  ];

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
  const boundaryProgress = interpolate(frame, [s(T.field + 0.8), s(T.field + 2.6)], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const abProgress = interpolate(frame, [s(T.field + 2.4), s(T.field + 3.6)], [0, 1], {
    ...clamp,
    easing: ease,
  });

  const sway = 3 * Math.sin(frame / 12);
  const a = iso(AB.ax, AB.y, 0.05);
  const b = iso(AB.bx, AB.y, 0.05);
  const corners: Pt[] = [
    iso(BOUNDARY.x0, BOUNDARY.y0, 0.05),
    iso(BOUNDARY.x1, BOUNDARY.y0, 0.05),
    iso(BOUNDARY.x1, BOUNDARY.y1, 0.05),
    iso(BOUNDARY.x0, BOUNDARY.y1, 0.05),
  ];

  const receiverCallout = interpolate(
    frame,
    [s(T.starfire + 0.5), s(T.starfire + 0.9), s(T.g5 - 0.3), s(T.g5)],
    [0, 1, 1, 0],
    clamp,
  );
  const displayCallout = interpolate(
    frame,
    [s(T.g5 + 0.6), s(T.g5 + 1.0), s(T.status - 0.2), s(T.status + 0.1)],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fcbee" />
          <stop offset="0.6" stopColor="#cfe9f5" />
          <stop offset="1" stopColor="#f3f1dc" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset="0.25" stopColor="#fff3b0" stopOpacity={0.9} />
          <stop offset="1" stopColor="#fff3b0" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="domeGrad" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fff48a" />
          <stop offset="0.45" stopColor="#ffd400" />
          <stop offset="1" stopColor="#c99f00" />
        </radialGradient>
        <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.35} />
        </radialGradient>
        <linearGradient id="soil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6e4f2b" />
          <stop offset="1" stopColor="#8a6538" />
        </linearGradient>
      </defs>

      {/* sky, sun, clouds (screen space) */}
      <rect width={width} height={height} fill="url(#sky)" />
      <circle cx={width - 170} cy={120} r={190} fill="url(#sun)" />
      <circle cx={width - 170} cy={120} r={46} fill="#fffbe6" />
      {[0, 1, 2, 3].map((i) => {
        const cx = ((rand(i) * (width + 400) + frame * (0.4 + i * 0.15)) % (width + 400)) - 200;
        const cy = 60 + i * 45;
        const k = 0.8 + rand(i + 4) * 0.6;
        return (
          <g key={i} opacity={0.9} transform={`translate(${cx} ${cy}) scale(${k})`}>
            <ellipse cx={0} cy={10} rx={90} ry={22} fill="#ffffff" />
            <circle cx={-30} cy={0} r={30} fill="#ffffff" />
            <circle cx={15} cy={-12} r={38} fill="#ffffff" />
            <circle cx={55} cy={4} r={26} fill="#ffffff" />
          </g>
        );
      })}

      <g
        transform={`translate(${width / 2 + driftX} ${height / 2 + driftY}) scale(${camS}) translate(${-camX} ${-camY})`}
      >
        {/* ground */}
        {/* diorama base: ground slab with a soil edge */}
        <polygon points={pts([iso(58, -16, 0), iso(58, 58, 0), iso(58, 58, -2.5), iso(58, -16, -2.5)])} fill="#6b4a28" />
        <polygon points={pts([iso(-16, 58, 0), iso(58, 58, 0), iso(58, 58, -2.5), iso(-16, 58, -2.5)])} fill="#7d5a33" />
        <polygon points={pts(rect(-16, -16, 58, 58))} fill="#78a64c" />
        <polygon points={pts(rect(-12, -12, 54, 54))} fill="#6f9d45" />
        {GRASS_TUFTS.map((p, i) => (
          <path
            key={i}
            d={`M${f1(p[0] - 5)} ${f1(p[1])}l5 -9l5 9M${f1(p[0])} ${f1(p[1])}l0 -11`}
            stroke={i % 3 === 0 ? "#4f7f33" : "#8bbd5b"}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {/* farm road behind the trees */}
        <polygon points={pts(rect(-16, 43, 58, 46))} fill="#b49a6c" />
        {TREES.map((t, i) => (
          <Tree key={i} {...t} />
        ))}

        {/* soil + furrows */}
        <polygon points={pts(rect(FIELD.x0, FIELD.y0, FIELD.x1, FIELD.y1))} fill="url(#soil)" />
        {ROWS.map((y) => {
          const p = iso(FIELD.x0, y + 1, 0);
          const q = iso(FIELD.x1, y + 1, 0);
          return <line key={y} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#5a3f20" strokeWidth={5} opacity={0.6} />;
        })}
        {/* headland lane + tyre tracks */}
        <polygon points={pts(rect(FIELD.x0, FIELD.y1, FIELD.x1, BOUNDARY.y1 - 1))} fill="#b09366" />
        {[TRACTOR_Y + 0.05, TRACTOR_Y + 2.55].map((yy) => {
          const p = iso(TRACTOR_PARK_X - 2, yy, 0);
          const q = iso(tractorX + 0.6, yy, 0);
          return <line key={yy} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#8a6f47" strokeWidth={9} strokeLinecap="round" />;
        })}

        {/* sugarcane rows (back to front) */}
        {ROWS.map((y) => {
          const row = caneRow(y, sway);
          return (
            <g key={y}>
              <path d={row.stalks} stroke="#3c7d27" strokeWidth={4} strokeLinecap="round" fill="none" />
              <path d={row.leaves} stroke={y % 4 === 1 ? "#5fb340" : "#6cc04a"} strokeWidth={3} strokeLinecap="round" fill="none" />
            </g>
          );
        })}

        {/* Boundary: glow + line + corner pins */}
        {boundaryProgress > 0 ? (
          <g>
            <polygon
              points={pts(rect(BOUNDARY.x0, BOUNDARY.y0, BOUNDARY.x1, BOUNDARY.y1, 0.05))}
              fill={`rgba(255, 212, 0, ${0.1 * boundaryProgress})`}
              stroke="#ffd400"
              strokeWidth={18}
              strokeOpacity={0.3}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - boundaryProgress}
            />
            <polygon
              points={pts(rect(BOUNDARY.x0, BOUNDARY.y0, BOUNDARY.x1, BOUNDARY.y1, 0.05))}
              fill="none"
              stroke="#ffd400"
              strokeWidth={6}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - boundaryProgress}
            />
            {corners.map((c, i) =>
              boundaryProgress >= i / 4 ? <Pin key={i} p={c} pop={Math.min(1, (boundaryProgress - i / 4) * 8)} /> : null,
            )}
          </g>
        ) : null}

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
                  opacity={0.7}
                />
              );
            })}
            <line
              x1={a[0]}
              y1={a[1]}
              x2={a[0] + (b[0] - a[0]) * abProgress}
              y2={a[1] + (b[1] - a[1]) * abProgress}
              stroke="#00a3ff"
              strokeWidth={20}
              strokeOpacity={0.25}
              strokeLinecap="round"
            />
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
          frame={frame}
          moving={moving}
          receiverGlow={receiverGlow}
          displayGlow={displayGlow}
        />
      </g>

      {/* callouts (screen space, so text stays the same size while zooming) */}
      <Callout
        anchor={toScreen(iso(TRACTOR_PARK_X + 1.7, TRACTOR_Y + 1.3, 5.1))}
        dx={210}
        dy={-120}
        title="StarFire 7500"
        subtitle="GPS Receiver"
        appear={receiverCallout}
      />
      <Callout
        anchor={toScreen(iso(TRACTOR_PARK_X + 2.0, TRACTOR_Y + 2.15, 2.9))}
        dx={260}
        dy={-160}
        title="CommandCenter G5"
        subtitle="Display"
        appear={displayCallout}
      />

      <rect width={width} height={height} fill="url(#vignette)" />
    </svg>
  );
};

const Callout: React.FC<{
  readonly anchor: Pt;
  readonly dx: number;
  readonly dy: number;
  readonly title: string;
  readonly subtitle: string;
  readonly appear: number;
}> = ({ anchor, dx, dy, title, subtitle, appear }) => {
  if (appear <= 0) return null;
  const [ax, ay] = anchor;
  const ex = ax + dx * appear;
  const ey = ay + dy * appear;
  const w = 20 + title.length * 22;
  return (
    <g opacity={Math.min(1, appear * 1.5)}>
      <circle cx={ax} cy={ay} r={9} fill="#ffd400" stroke="#0f1b2a" strokeWidth={3} />
      <polyline
        points={`${ax},${ay} ${ax + dx * 0.55 * appear},${ey} ${ex},${ey}`}
        fill="none"
        stroke="#ffd400"
        strokeWidth={4}
      />
      <g transform={`translate(${ex} ${ey - 46})`}>
        <rect width={w} height={92} rx={14} fill="rgba(15,27,42,0.92)" stroke="#ffd400" strokeWidth={3} />
        <text x={18} y={34} fontSize={22} fontWeight={700} fill="#ffd400" fontFamily={FONT} letterSpacing={1}>
          {subtitle.toUpperCase()}
        </text>
        <text x={18} y={72} fontSize={34} fontWeight={800} fill="#ffffff" fontFamily={FONT}>
          {title}
        </text>
      </g>
    </g>
  );
};

const Pin: React.FC<{ readonly p: Pt; readonly pop: number }> = ({ p, pop }) => (
  <g transform={`translate(${p[0]} ${p[1]}) scale(${0.6 + 0.4 * pop})`} opacity={pop}>
    <ellipse cx={0} cy={0} rx={14} ry={7} fill="rgba(0,0,0,0.25)" />
    <line x1={0} y1={0} x2={0} y2={-64} stroke="#2b333b" strokeWidth={4} />
    <path d="M0 -64 L36 -54 L0 -42 Z" fill="#ffd400" stroke="#9c8000" strokeWidth={2} />
  </g>
);

const Marker: React.FC<{ readonly p: Pt; readonly label: string }> = ({ p, label }) => (
  <g transform={`translate(${p[0]} ${p[1]})`}>
    <ellipse cx={0} cy={0} rx={14} ry={7} fill="rgba(0,0,0,0.25)" />
    <line x1={0} y1={0} x2={0} y2={-60} stroke="#0b1b2b" strokeWidth={4} />
    <circle cx={0} cy={-76} r={22} fill="#00a3ff" stroke="#fff" strokeWidth={4} />
    <text x={0} y={-68} textAnchor="middle" fontSize={24} fontWeight={800} fill="#fff" fontFamily={FONT}>
      {label}
    </text>
  </g>
);
