import React from "react";
import { boxFaces, circleXY, circleXZ, iso, pts, type BoxColors } from "./iso";

// Stylized row-crop tractor in isometric view. Not a brand-accurate model.
const GREEN: BoxColors = { top: "#58a842", front: "#2f6d24", side: "#3b8530" };
const GREEN_DARK: BoxColors = { top: "#3f8a30", front: "#24561c", side: "#2d6a23" };
const DARK: BoxColors = { top: "#3a3f45", front: "#22262a", side: "#2c3136" };
const ROOF: BoxColors = { top: "#fbfbf7", front: "#c9c9c2", side: "#e2e2db" };
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
  readonly spin: number; // radians
}> = ({ cx, y, r, near, spin }) => {
  const lugs = Math.round(r * 14);
  return (
    <g>
      {/* tyre width: back rim then face */}
      <polygon points={pts(circleXZ(cx, y - 0.35, r, r))} fill="#0c0d0e" />
      <polygon points={pts(circleXZ(cx, y, r, r))} fill={near ? "#1d1f22" : "#141517"} />
      {/* tread lugs (rotate with distance travelled) */}
      {Array.from({ length: lugs }, (_, i) => {
        const a = spin + (i / lugs) * Math.PI * 2;
        const p = iso(cx + Math.cos(a) * r * 0.98, y + 0.01, r + Math.sin(a) * r * 0.98);
        const q = iso(cx + Math.cos(a) * r * 0.8, y + 0.01, r + Math.sin(a) * r * 0.8);
        return (
          <line
            key={i}
            x1={p[0]}
            y1={p[1]}
            x2={q[0]}
            y2={q[1]}
            stroke="#34383d"
            strokeWidth={near ? 3 : 2}
            strokeLinecap="round"
          />
        );
      })}
      <polygon points={pts(circleXZ(cx, y + 0.02, r, r * 0.58))} fill="#e8bf00" />
      <polygon points={pts(circleXZ(cx, y + 0.03, r, r * 0.5))} fill={YELLOW} />
      {/* rim bolts */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = spin + (i / 6) * Math.PI * 2;
        const p = iso(cx + Math.cos(a) * r * 0.32, y + 0.04, r + Math.sin(a) * r * 0.32);
        return <circle key={i} cx={p[0]} cy={p[1]} r={near ? 2.6 : 2} fill="#9c8000" />;
      })}
      <polygon points={pts(circleXZ(cx, y + 0.05, r, r * 0.16))} fill="#b39400" />
    </g>
  );
};

// Curved fender over a rear wheel (arc in the x-z plane).
const Fender: React.FC<{
  readonly cx: number;
  readonly y: number;
  readonly cz: number;
  readonly near: boolean;
}> = ({ cx, y, cz, near }) => {
  const n = 16;
  const arc = (r: number, yy: number) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = Math.PI * 0.08 + (i / n) * Math.PI * 0.84;
      return iso(cx + Math.cos(a) * r, yy, cz + Math.sin(a) * r);
    });
  const outer = arc(1.5, y);
  const inner = arc(1.36, y).reverse();
  const back = arc(1.5, y - 0.5).reverse();
  return (
    <g>
      {/* top surface of the fender */}
      <polygon points={pts([...outer, ...back])} fill={near ? "#58a842" : "#4c9a3a"} />
      {/* outer face */}
      <polygon points={pts([...outer, ...inner])} fill={near ? "#3b8530" : "#2f6d24"} />
    </g>
  );
};

export const Tractor: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly frame: number;
  readonly moving: number; // 0..1, how fast the tractor is moving
  readonly receiverGlow: number; // 0..1 highlight on the StarFire receiver
  readonly displayGlow: number; // 0..1 highlight on the in-cab display
}> = ({ x, y, frame, moving, receiverGlow, displayGlow }) => {
  const roofZ = 4.0;
  // Small engine vibration, stronger when driving.
  const jitter = Math.sin(frame * 2.3) * (0.4 + moving * 0.6);
  const domeC = iso(x + 1.7, y + 1.3, roofZ + 0.25);
  const display = [
    iso(x + 1.2, y + 2.15, 2.3),
    iso(x + 2.0, y + 2.15, 2.3),
    iso(x + 2.0, y + 2.15, 3.0),
    iso(x + 1.2, y + 2.15, 3.0),
  ];
  const spinRear = -(x / 1.3);
  const spinFront = -(x / 0.75);
  const beaconOn = Math.floor(frame / 8) % 2 === 0;
  const beacon = iso(x + 0.15, y + 0.3, roofZ + 0.25);
  const stack = iso(x + 3.68, y + 1.08, 3.45);

  return (
    <g>
      {/* soft shadow */}
      <polygon
        points={pts(circleXY(x + 2.6, y + 1.5, 0, 3.4))}
        fill="rgba(20,30,10,0.28)"
      />
      <g transform={`translate(0 ${jitter})`}>
        {/* far-side wheels */}
        <Wheel cx={x + 0.6} y={y} r={1.3} near={false} spin={spinRear} />
        <Wheel cx={x + 4.3} y={y + 0.3} r={0.75} near={false} spin={spinFront} />
        {/* front axle + weights */}
        <Box b={boxFaces(x + 4.1, y + 0.35, 0.55, 0.4, 1.9, 0.3)} c={DARK} />
        <Box b={boxFaces(x + 5.15, y + 0.7, 0.55, 0.45, 1.2, 0.5)} c={DARK} />
        {/* chassis and hood */}
        <Box b={boxFaces(x + 0.2, y + 0.5, 0.8, 1.8, 1.6, 0.8)} c={DARK} />
        <Box b={boxFaces(x + 1.9, y + 0.6, 0.9, 3.3, 1.4, 1.2)} c={GREEN} />
        <Box b={boxFaces(x + 1.9, y + 0.65, 2.1, 3.25, 1.3, 0.12)} c={GREEN_DARK} />
        {/* yellow hood stripe on the visible side */}
        <polygon
          points={pts(boxFaces(x + 2.0, y + 2.0, 1.55, 3.1, 0.01, 0.12).side)}
          fill={YELLOW}
        />
        {/* side vents */}
        {[0, 1, 2, 3].map((i) => (
          <polygon
            key={i}
            points={pts(boxFaces(x + 3.6 + i * 0.32, y + 2.01, 1.05, 0.18, 0.01, 0.35).side)}
            fill="#1f4a18"
          />
        ))}
        {/* grille + headlights */}
        <polygon
          points={pts(boxFaces(x + 5.2, y + 0.75, 1.0, 0.01, 1.1, 0.95).front)}
          fill="#16210f"
        />
        {[0.82, 1.6].map((yy) => (
          <polygon
            key={yy}
            points={pts(boxFaces(x + 5.21, y + yy, 1.7, 0.01, 0.25, 0.16).front)}
            fill="#fff8d6"
          />
        ))}
        {/* exhaust stack */}
        <Box b={boxFaces(x + 3.6, y + 1.0, 2.1, 0.16, 0.16, 1.35)} c={DARK} />
        {/* rear fenders */}
        <Fender cx={x + 0.6} y={y - 0.05} cz={1.3} near={false} />
        {/* cab base + glass */}
        <Box b={boxFaces(x, y + 0.2, 1.6, 2.2, 2.2, 0.35)} c={GREEN} />
        <Box
          b={boxFaces(x, y + 0.2, 1.95, 2.2, 2.2, 2.05)}
          c={{ top: "#a9dcee", front: "#86c3d8", side: "#a9dcee" }}
          opacity={0.5}
        />
        {/* operator silhouette + seat + steering wheel */}
        <Box b={boxFaces(x + 0.5, y + 0.9, 1.95, 0.6, 0.8, 0.5)} c={DARK} />
        <Box b={boxFaces(x + 0.55, y + 0.95, 2.45, 0.45, 0.7, 0.75)} c={{ top: "#3d6f9a", front: "#2a5277", side: "#335f86" }} />
        <polygon points={pts(circleXY(x + 0.8, y + 1.3, 3.45, 0.24))} fill="#c98f66" />
        <ellipse
          cx={iso(x + 1.45, y + 1.3, 2.75)[0]}
          cy={iso(x + 1.45, y + 1.3, 2.75)[1]}
          rx={10}
          ry={5}
          fill="none"
          stroke="#15171a"
          strokeWidth={3}
        />
        {/* in-cab display (right corner post) */}
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
        <line
          x1={iso(x + 1.3, y + 2.17, 2.55)[0]}
          y1={iso(x + 1.3, y + 2.17, 2.55)[1]}
          x2={iso(x + 1.9, y + 2.17, 2.55)[0]}
          y2={iso(x + 1.9, y + 2.17, 2.55)[1]}
          stroke="#00a3ff"
          strokeWidth={1.5}
        />
        {displayGlow > 0 ? (
          <polygon
            points={pts(display)}
            fill="rgba(255,212,0,0.12)"
            stroke={YELLOW}
            strokeWidth={3}
            opacity={displayGlow}
          />
        ) : null}
        {/* cab pillars + door handle */}
        <Box b={boxFaces(x + 2.1, y + 2.3, 1.95, 0.1, 0.1, 2.05)} c={DARK} />
        <Box b={boxFaces(x, y + 2.3, 1.95, 0.1, 0.1, 2.05)} c={DARK} />
        <Box b={boxFaces(x + 2.1, y + 0.2, 1.95, 0.1, 0.1, 2.05)} c={DARK} />
        <polygon points={pts(boxFaces(x + 0.25, y + 2.41, 2.6, 0.3, 0.01, 0.06).side)} fill="#15171a" />
        {/* step ladder */}
        {[0.55, 0.95, 1.35].map((z) => (
          <Box key={z} b={boxFaces(x + 0.55, y + 2.4, z, 0.7, 0.3, 0.07)} c={DARK} />
        ))}
        {/* roof */}
        <Box b={boxFaces(x - 0.15, y + 0.05, roofZ, 2.5, 2.5, 0.25)} c={ROOF} />
        <Box b={boxFaces(x + 2.35, y + 0.4, roofZ - 0.08, 0.06, 1.8, 0.1)} c={{ top: "#fff8d6", front: "#fff8d6", side: "#e0d9b8" }} />
        {/* amber beacon */}
        <ellipse cx={beacon[0]} cy={beacon[1]} rx={6} ry={3} fill="#33373b" />
        <path
          d={`M ${beacon[0] - 5} ${beacon[1] - 1} Q ${beacon[0]} ${beacon[1] - 14} ${beacon[0] + 5} ${beacon[1] - 1} Z`}
          fill={beaconOn ? "#ffa31a" : "#b86b00"}
        />
        {beaconOn ? (
          <circle cx={beacon[0]} cy={beacon[1] - 6} r={14} fill="#ffb33a" opacity={0.25} />
        ) : null}
        {/* StarFire-style receiver dome */}
        {receiverGlow > 0 ? (
          <>
            <ellipse
              cx={domeC[0]}
              cy={domeC[1] - 6}
              rx={28 + receiverGlow * 14}
              ry={16 + receiverGlow * 8}
              fill="rgba(255,212,0,0.12)"
              stroke={YELLOW}
              strokeWidth={2.5}
              opacity={receiverGlow}
            />
            {[0, 1, 2].map((i) => {
              const k = ((frame / 20 + i / 3) % 1) * receiverGlow;
              return (
                <path
                  key={i}
                  d={`M ${domeC[0] - 18 - k * 30} ${domeC[1] - 26 - k * 22} Q ${domeC[0]} ${domeC[1] - 44 - k * 40} ${domeC[0] + 18 + k * 30} ${domeC[1] - 26 - k * 22}`}
                  fill="none"
                  stroke={YELLOW}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  opacity={(1 - k) * receiverGlow}
                />
              );
            })}
          </>
        ) : null}
        <rect x={domeC[0] - 9} y={domeC[1] - 2} width={18} height={6} fill="#5b6168" />
        <ellipse cx={domeC[0]} cy={domeC[1] - 1} rx={17} ry={7} fill="#1f4d18" />
        <path
          d={`M ${domeC[0] - 16} ${domeC[1] - 4} Q ${domeC[0]} ${domeC[1] - 32} ${domeC[0] + 16} ${domeC[1] - 4} Z`}
          fill="url(#domeGrad)"
        />
        {/* near-side wheels */}
        <Wheel cx={x + 0.6} y={y + 2.6} r={1.3} near spin={spinRear} />
        <Wheel cx={x + 4.3} y={y + 2.3} r={0.75} near spin={spinFront} />
        {/* near fender over the rear wheel */}
        <Fender cx={x + 0.6} y={y + 2.75} cz={1.3} near />
      </g>
      {/* exhaust smoke */}
      {Array.from({ length: 5 }, (_, i) => {
        const k = (frame / 30 + i / 5) % 1;
        return (
          <circle
            key={i}
            cx={stack[0] - k * (20 + moving * 60)}
            cy={stack[1] - k * 55}
            r={4 + k * 12}
            fill="#9aa0a6"
            opacity={(1 - k) * (0.25 + moving * 0.35)}
          />
        );
      })}
    </g>
  );
};

// Points the camera can focus on, in projected pixels.
export const tractorFocus = (x: number, y: number) => ({
  receiver: iso(x + 1.7, y + 1.3, 4.4),
  display: iso(x + 1.6, y + 2.15, 2.65),
  body: iso(x + 2.6, y + 1.3, 1.5),
});
