import { Video } from "@remotion/media";
import React from "react";
import { Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLIPS, FOOTAGE, REGIONS, SCENES, sceneAt, sceneEnd, sceneStart, TAPS, type Scene } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const RED = "#e5352b";
const YELLOW = "#ffd400";

type Cam = { readonly cx: number; readonly cy: number; readonly z: number };
const FULL: Cam = { cx: FOOTAGE.w / 2, cy: FOOTAGE.h / 2, z: 1 };
const focus = (r: { x: number; y: number; w: number; h: number }, z: number): Cam => ({
  cx: r.x + r.w / 2,
  cy: r.y + r.h / 2,
  z,
});

const CAMERA: Record<Scene, Cam> = {
  intro: FULL,
  why: FULL,
  openMenu: FULL,
  openSetup: FULL,
  overview: FULL,
  location: focus(REGIONS.location, 2.1),
  equipment: focus(REGIONS.equipment, 1.9),
  details: focus(REGIONS.details, 2.0),
  type: { cx: 676, cy: 226, z: 2.0 },
  depth: { cx: 676, cy: 236, z: 2.0 },
  ok: FULL,
  result: FULL,
  recap: FULL,
};

// Still shown under (and after) any playing clip, per scene.
const STILL: Record<Scene, string> = {
  intro: FOOTAGE.stills.afterGuidance,
  why: FOOTAGE.stills.afterGuidance,
  openMenu: FOOTAGE.stills.beforeWorkSetup,
  openSetup: FOOTAGE.stills.afterTop,
  overview: FOOTAGE.stills.afterTop,
  location: FOOTAGE.stills.afterTop,
  equipment: FOOTAGE.stills.afterTop,
  details: FOOTAGE.stills.afterDetails,
  type: FOOTAGE.stills.afterTop,
  depth: FOOTAGE.stills.afterTop,
  ok: FOOTAGE.stills.afterGuidance,
  result: FOOTAGE.stills.afterGuidance,
  recap: FOOTAGE.stills.afterGuidance,
};

// Which highlight boxes are visible in which scene.
const BOXES: { scene: Scene | Scene[]; r: keyof typeof REGIONS; n?: number; delay?: number }[] = [
  { scene: "overview", r: "location", n: 1, delay: 0.25 },
  { scene: "overview", r: "equipment", n: 2, delay: 0.4 },
  { scene: "overview", r: "detailsHeader", n: 3, delay: 0.55 },
  { scene: "overview", r: "workSummary", n: 4, delay: 0.75 },
  { scene: "location", r: "location" },
  { scene: "equipment", r: "equipment" },
  { scene: "details", r: "details" },
  { scene: "type", r: "type" },
  { scene: "depth", r: "depth" },
];

const useCamera = (t: number): Cam => {
  const times: number[] = [];
  const cams: Cam[] = [];
  for (const s of SCENES) {
    const start = sceneStart(s);
    if (times.length > 0) {
      times.push(start);
      cams.push(cams[cams.length - 1]);
    }
    times.push(start + 0.8);
    cams.push(CAMERA[s]);
  }
  const pick = (k: keyof Cam) => interpolate(t, times, cams.map((c) => c[k]), { ...clamp, easing: ease });
  return { cx: pick("cx"), cy: pick("cy"), z: pick("z") };
};

const Clip: React.FC<{ readonly scene: "openMenu" | "openSetup" | "ok" }> = ({ scene }) => {
  const { fps } = useVideoConfig();
  const clip = CLIPS[scene];
  const dur = sceneEnd(scene) - sceneStart(scene);
  const rate = (clip.to - clip.from) / dur;
  return (
    <Sequence
      name={`Footage ${scene}`}
      from={Math.round(sceneStart(scene) * fps)}
      durationInFrames={Math.round(dur * fps)}
      layout="none"
    >
      <Video
        src={staticFile(clip.src)}
        trimBefore={Math.round(clip.from * fps)}
        playbackRate={rate}
        muted
        style={{ position: "absolute", left: 0, top: 0, width: FOOTAGE.w, height: FOOTAGE.h }}
      />
    </Sequence>
  );
};

// Taps from the recording, mapped to composition time through the clip speed.
const TapRings: React.FC<{ readonly t: number }> = ({ t }) => (
  <>
    {(Object.keys(TAPS) as (keyof typeof TAPS)[]).flatMap((scene) => {
      const clip = CLIPS[scene];
      const rate = (clip.to - clip.from) / (sceneEnd(scene) - sceneStart(scene));
      return TAPS[scene].map((tap) => {
        const at = sceneStart(scene) + (tap.t - clip.from) / rate;
        const k = (t - at + 0.35) / 1.0; // ring starts slightly before the tap
        if (k < 0 || k > 1) return null;
        return (
          <g key={`${scene}-${tap.label}`} opacity={1 - Math.max(0, k - 0.6) / 0.4}>
            <circle cx={tap.x} cy={tap.y} r={18 + k * 40} fill="none" stroke={YELLOW} strokeWidth={5} vectorEffect="non-scaling-stroke" opacity={1 - k} />
            <circle cx={tap.x} cy={tap.y} r={26} fill="rgba(255,212,0,0.25)" stroke={YELLOW} strokeWidth={4} vectorEffect="non-scaling-stroke" />
          </g>
        );
      });
    })}
  </>
);

export const Screen: React.FC<{ readonly width: number; readonly height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = useCamera(t);
  const base = width / FOOTAGE.w;
  const scale = base * cam.z;
  const left = Math.min(0, Math.max(width - FOOTAGE.w * scale, width / 2 - cam.cx * scale));
  const top = Math.min(0, Math.max(height - FOOTAGE.h * scale, height / 2 - cam.cy * scale));
  const scene = sceneAt(t);

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", borderRadius: 10, backgroundColor: "#000" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: FOOTAGE.w,
          height: FOOTAGE.h,
          transformOrigin: "0 0",
          transform: `translate(${left}px, ${top}px) scale(${scale})`,
        }}
      >
        <Img src={staticFile(STILL[scene])} style={{ position: "absolute", left: 0, top: 0, width: FOOTAGE.w, height: FOOTAGE.h }} />
        <Clip scene="openMenu" />
        <Clip scene="openSetup" />
        <Clip scene="ok" />
        <svg viewBox={`0 0 ${FOOTAGE.w} ${FOOTAGE.h}`} width={FOOTAGE.w} height={FOOTAGE.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {BOXES.filter((b) => (Array.isArray(b.scene) ? b.scene.includes(scene) : b.scene === scene)).map((b) => {
            const r = REGIONS[b.r];
            const appear = interpolate(t, [sceneStart(scene) + (b.delay ?? 0.7), sceneStart(scene) + (b.delay ?? 0.7) + 0.3], [0, 1], clamp);
            const pad = 4;
            const isNumbered = b.n !== undefined;
            return (
              <g key={b.r} opacity={appear}>
                <rect
                  x={r.x - pad}
                  y={r.y - pad}
                  width={r.w + pad * 2}
                  height={r.h + pad * 2}
                  rx={6}
                  fill="none"
                  stroke={RED}
                  strokeWidth={4}
                  vectorEffect="non-scaling-stroke"
                />
                {isNumbered ? (
                  <g transform={`translate(${r.x + r.w - 6} ${r.y + 4})`}>
                    <circle r={17} fill={RED} />
                    <text y={7} textAnchor="middle" fontSize={20} fontWeight={800} fill="#fff" fontFamily="system-ui, sans-serif">
                      {b.n}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
          <TapRings t={t} />
        </svg>
      </div>
    </div>
  );
};
