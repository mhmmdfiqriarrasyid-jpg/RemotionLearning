import React from "react";
import { boxFaces, circleXY, circleXZ, iso, pts, type BoxColors } from "./iso";

// Stylized row-crop tractor in isometric view. Not a brand-accurate model.
const GREEN: BoxColors = { top: "#4c9a3a", front: "#2f6d24", side: "#367c2b" };
const DARK: BoxColors = { top: "#3a3f45", front: "#22262a", side: "#2c3136" };
const ROOF: BoxColors = { top: "#f4f4f0", front: "#c9c9c2", side: "#dcdcd5" };
const YELLOW = "#ffd400";

const Box: React.FC<{
  readonly b: ReturnType<typeof boxFaces>;
  readonly c: BoxColors;
  readonly opacity?: number;
}> = ({ b, c, opacity = 1 }) => (
  <g opacity={opacity} strokeLinejoin="round">
    <polygon points={pts(b.side)} fill={c.side} />
    <polygon points={pts(b.front)} fill={c.front} />
    <polygon points={pts(b.top)} fill={c.top} />
  </g>
);

const Wheel: React.FC<{
  readonly cx: number;
  readonly y: number;
  readonly r: number;
  readonly near: boolean;
}> = ({ cx, y, r, near }) => (
  <g>
    <polygon
      points={pts(circleXZ(cx, y, r, r))}
      fill={near ? "#1b1d1f" : "#121314"}
    />
    <polygon points={pts(circleXZ(cx, y + 0.01, r, r * 0.55))} fill={YELLOW} />
    <polygon
      points={pts(circleXZ(cx, y + 0.02, r, r * 0.18))}
      fill="#b39400"
    />
  </g>
);

export const Tractor: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly receiverGlow: number; // 0..1 highlight on the StarFire receiver
  readonly displayGlow: number; // 0..1 highlight on the in-cab display
}> = ({ x, y, receiverGlow, displayGlow }) => {
  const roofZ = 4.0;
  const domeC = iso(x + 1.7, y + 1.3, roofZ + 0.25);
  const display = [
    iso(x + 1.2, y + 2.15, 2.3),
    iso(x + 2.0, y + 2.15, 2.3),
    iso(x + 2.0, y + 2.15, 3.0),
    iso(x + 1.2, y + 2.15, 3.0),
  ];

  return (
    <g>
      {/* shadow */}
      <polygon
        points={pts(circleXY(x + 2.6, y + 1.3, 0, 3.2))}
        fill="rgba(0,0,0,0.25)"
      />
      {/* far-side wheels */}
      <Wheel cx={x + 0.6} y={y} r={1.3} near={false} />
      <Wheel cx={x + 4.3} y={y + 0.3} r={0.75} near={false} />
      {/* chassis and hood */}
      <Box b={boxFaces(x + 0.2, y + 0.5, 0.8, 1.8, 1.6, 0.8)} c={DARK} />
      <Box b={boxFaces(x + 1.9, y + 0.6, 0.9, 3.3, 1.4, 1.2)} c={GREEN} />
      {/* grille */}
      <polygon
        points={pts(boxFaces(x + 5.2, y + 0.75, 1.0, 0.01, 1.1, 0.9).front)}
        fill="#1d2a1a"
      />
      {/* exhaust */}
      <Box b={boxFaces(x + 3.6, y + 1.0, 2.1, 0.15, 0.15, 1.3)} c={DARK} />
      {/* cab: frame + glass */}
      <Box b={boxFaces(x, y + 0.2, 1.6, 2.2, 2.2, 0.35)} c={GREEN} />
      <Box
        b={boxFaces(x, y + 0.2, 1.95, 2.2, 2.2, 2.05)}
        c={{ top: "#9fd3e6", front: "#7fbcd2", side: "#9fd3e6" }}
        opacity={0.55}
      />
      {/* in-cab display (corner post, right side) */}
      <polygon points={pts(display)} fill="#0d0f12" stroke="#000" strokeWidth={2} />
      <polygon
        points={pts([
          iso(x + 1.27, y + 2.16, 2.38),
          iso(x + 1.93, y + 2.16, 2.38),
          iso(x + 1.93, y + 2.16, 2.92),
          iso(x + 1.27, y + 2.16, 2.92),
        ])}
        fill="#5d7f3e"
      />
      <polygon
        points={pts([
          iso(x + 1.27, y + 2.16, 2.84),
          iso(x + 1.93, y + 2.16, 2.84),
          iso(x + 1.93, y + 2.16, 2.92),
          iso(x + 1.27, y + 2.16, 2.92),
        ])}
        fill="#2b333b"
      />
      {displayGlow > 0 ? (
        <polygon
          points={pts(display)}
          fill="none"
          stroke="#ffd400"
          strokeWidth={3}
          opacity={displayGlow}
        />
      ) : null}
      {/* cab pillars */}
      <Box b={boxFaces(x + 2.1, y + 2.3, 1.95, 0.1, 0.1, 2.05)} c={DARK} />
      <Box b={boxFaces(x, y + 2.3, 1.95, 0.1, 0.1, 2.05)} c={DARK} />
      <Box b={boxFaces(x + 2.1, y + 0.2, 1.95, 0.1, 0.1, 2.05)} c={DARK} />
      {/* roof */}
      <Box b={boxFaces(x - 0.15, y + 0.05, roofZ, 2.5, 2.5, 0.25)} c={ROOF} />
      {/* StarFire-style receiver dome on the roof front */}
      {receiverGlow > 0 ? (
        <ellipse
          cx={domeC[0]}
          cy={domeC[1] - 4}
          rx={30 + receiverGlow * 10}
          ry={18 + receiverGlow * 6}
          fill="none"
          stroke={YELLOW}
          strokeWidth={2.5}
          opacity={receiverGlow}
        />
      ) : null}
      <ellipse cx={domeC[0]} cy={domeC[1]} rx={17} ry={7} fill="#1f4d18" />
      <path
        d={`M ${domeC[0] - 16} ${domeC[1] - 3} Q ${domeC[0]} ${domeC[1] - 30} ${domeC[0] + 16} ${domeC[1] - 3} Z`}
        fill={YELLOW}
      />
      {/* near-side wheels */}
      <Wheel cx={x + 0.6} y={y + 2.6} r={1.3} near />
      <Wheel cx={x + 4.3} y={y + 2.3} r={0.75} near />
    </g>
  );
};

// Points the camera can focus on, in projected pixels.
export const tractorFocus = (x: number, y: number) => ({
  receiver: iso(x + 1.7, y + 1.3, 4.4),
  display: iso(x + 1.6, y + 2.15, 2.65),
  body: iso(x + 2.6, y + 1.3, 1.5),
});
