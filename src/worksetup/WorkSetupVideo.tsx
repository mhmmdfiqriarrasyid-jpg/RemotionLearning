import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, FONT, FRAME, GRID, SPACE, SUBTITLE_MAX_CHARS, TEXT } from "../shared/design";
import { Subtitles } from "../shared/Subtitles";
import { INTRO, MENU_PATH, NOTES, RECAP, RESULT, STEPS } from "./copy";
import { Screen } from "./Screen";
import { CLIPS, FOOTAGE, REGIONS, sceneAt, sceneEnd, sceneStart, TAPS, type Scene } from "./timeline";
import { VO } from "./vo";

// Layout follows docs/STANDAR-VISUAL.md. Positions are fixed for the whole
// video; elements that a scene does not use are hidden, not moved.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const M = GRID.margin;
const SCREEN = { x: M, y: M, w: 1300, h: Math.round((1300 * FOOTAGE.h) / FOOTAGE.w) };
const SIDE = { x: SCREEN.x + SCREEN.w + GRID.gutter, y: M, w: FRAME.w - M - (SCREEN.x + SCREEN.w + GRID.gutter) };
const SUB = { x: M, y: SCREEN.y + SCREEN.h + SPACE.l, w: SCREEN.w };

// Standard text entrance: fade in and move up 16 px over 0.4 s.
const useEnter = (from: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = interpolate(frame / fps, [from, from + 0.4], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return { opacity: a, translate: `0px ${(1 - a) * SPACE.s}px` } as const;
};

const Mark: React.FC<{ readonly state: "done" | "active" | "todo"; readonly size?: number; readonly n?: number }> = ({
  state,
  size = 32,
  n,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      flexShrink: 0,
      boxSizing: "border-box",
      backgroundColor: state === "done" ? COLOR.accent : "transparent",
      border: `3px solid ${state === "todo" ? COLOR.line : COLOR.accent}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: state === "active" ? COLOR.accent : COLOR.muted,
      fontSize: size * 0.5,
      fontWeight: 700,
    }}
  >
    {state === "done" ? (
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
        <path d="M4 12.5 L10 18 L20 6" stroke="white" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      n
    )}
  </div>
);

// ---------- side column ----------

const STEP_OF: Partial<Record<Scene, number>> = { location: 0, equipment: 1, details: 2, type: 3, depth: 3 };
const PROGRESS_SCENES: Scene[] = ["overview", "location", "equipment", "details", "type", "depth", "ok"];

// Fixed slot: bottom of the side column, aligned with the bottom of the screen.
const Progress: React.FC<{ readonly scene: Scene }> = ({ scene }) => {
  const enter = useEnter(sceneStart("overview"));
  if (!PROGRESS_SCENES.includes(scene)) return null;
  const active = STEP_OF[scene] ?? -1;
  const done = scene === "ok" ? STEPS.length : active;
  return (
    <div
      style={{
        position: "absolute",
        left: SIDE.x,
        top: SCREEN.y + SCREEN.h,
        width: SIDE.w,
        translate: `0px -100%`,
        borderTop: `2px solid ${COLOR.line}`,
        paddingTop: SPACE.m,
        display: "flex",
        flexDirection: "column",
        gap: SPACE.s,
        ...(scene === "overview" ? { opacity: enter.opacity } : null),
      }}
    >
      {STEPS.map((name, i) => {
        const state = i < done ? "done" : i === active ? "active" : "todo";
        return (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: SPACE.s }}>
            <Mark state={state} n={i + 1} />
            <div style={{ ...TEXT.item, color: state === "todo" ? COLOR.muted : COLOR.ink }}>{name}</div>
          </div>
        );
      })}
    </div>
  );
};

const MenuPath: React.FC<{ readonly t: number }> = ({ t }) => {
  const clip = CLIPS.openMenu;
  const rate = (clip.to - clip.from) / (sceneEnd("openMenu") - sceneStart("openMenu"));
  const at = [TAPS.openMenu[0].t, TAPS.openMenu[1].t, TAPS.openMenu[3].t].map(
    (src) => sceneStart("openMenu") + (src - clip.from) / rate,
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s, marginTop: SPACE.m }}>
      {MENU_PATH.map((label, i) => {
        const next = i + 1 < at.length ? at[i + 1] : Infinity;
        const state = t >= at[i] - 0.35 ? (t >= next - 0.35 ? "done" : "active") : "todo";
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: SPACE.s }}>
            <Mark state={state} n={i + 1} />
            <div style={{ ...TEXT.item, color: state === "todo" ? COLOR.muted : COLOR.ink }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
};

const Callout: React.FC<{ readonly kind: "warn" | "info"; readonly children: React.ReactNode }> = ({ kind, children }) => (
  <div
    style={{
      ...TEXT.body,
      marginTop: SPACE.l,
      paddingLeft: SPACE.s,
      borderLeft: `4px solid ${kind === "warn" ? COLOR.warn : COLOR.line}`,
      color: kind === "warn" ? COLOR.warn : COLOR.muted,
      fontWeight: kind === "warn" ? 600 : 400,
    }}
  >
    {children}
  </div>
);

// Fixed slot: top of the side column, aligned with the top of the screen.
const Note: React.FC<{ readonly scene: Scene; readonly t: number }> = ({ scene, t }) => {
  const note = NOTES[scene];
  const enter = useEnter(sceneStart(scene));
  if (!note) return null;
  return (
    <div style={{ position: "absolute", left: SIDE.x, top: SIDE.y, width: SIDE.w, ...enter }}>
      <div style={TEXT.kicker}>{note.kicker}</div>
      <div style={{ ...TEXT.h2, marginTop: SPACE.s }}>{note.title}</div>
      <div style={{ ...TEXT.body, marginTop: SPACE.m }}>{note.body}</div>
      {scene === "openMenu" ? <MenuPath t={t} /> : null}
      {note.warn ? <Callout kind="warn">{note.warn}</Callout> : null}
      {note.info ? <Callout kind="info">{note.info}</Callout> : null}
    </div>
  );
};

// ---------- full-frame scenes ----------

const Heading: React.FC<{ readonly kicker: string; readonly title: string }> = ({ kicker, title }) => (
  <div style={{ position: "absolute", left: M, top: M }}>
    <div style={TEXT.kicker}>{kicker}</div>
    <div style={{ ...TEXT.h1, marginTop: SPACE.s }}>{title}</div>
  </div>
);

const Intro: React.FC<{ readonly t: number }> = ({ t }) => {
  const k = useEnter(0.2);
  const ti = useEnter(0.35);
  const l = useEnter(0.7);
  const out = interpolate(t, [sceneEnd("intro") - 0.4, sceneEnd("intro")], [1, 0], clamp);
  if (out <= 0) return null;
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, opacity: out, justifyContent: "center", paddingLeft: M }}>
      <div style={{ ...TEXT.kicker, ...k }}>{INTRO.kicker}</div>
      <div style={{ ...TEXT.display, marginTop: SPACE.m, ...ti }}>{INTRO.title}</div>
      <div style={{ ...TEXT.lead, marginTop: SPACE.l, ...l }}>{INTRO.lead}</div>
    </AbsoluteFill>
  );
};

const Crop: React.FC<{ readonly src: string; readonly r: { x: number; y: number; w: number; h: number }; readonly scale: number }> = ({
  src,
  r,
  scale,
}) => (
  <div style={{ position: "relative", width: r.w * scale, height: r.h * scale, overflow: "hidden", borderRadius: 6, flexShrink: 0 }}>
    <Img src={staticFile(src)} style={{ position: "absolute", left: -r.x * scale, top: -r.y * scale, width: FOOTAGE.w * scale, height: FOOTAGE.h * scale }} />
  </div>
);

// Content of full-frame scenes starts below the heading at this y.
const CONTENT_Y = M + 26 + SPACE.s + 80 + SPACE.xl;

const Result: React.FC = () => {
  const s = sceneStart("result");
  const all = useEnter(s);
  const after = useEnter(s + 2.2);
  const colW = (FRAME.w - 2 * M - GRID.gutter) / 2;
  const k = colW / FOOTAGE.w;
  const col = (c: { kicker: string; caption: string }, img: string, color: string, style: React.CSSProperties) => (
    <div style={{ width: colW, ...style }}>
      <div style={{ ...TEXT.kicker, color }}>{c.kicker}</div>
      <div style={{ position: "relative", marginTop: SPACE.s, borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}>
        <Crop src={img} r={{ x: 0, y: 0, w: FOOTAGE.w, h: FOOTAGE.h }} scale={k} />
        <div
          style={{
            position: "absolute",
            left: (REGIONS.label.x - 4) * k,
            top: (REGIONS.label.y - 4) * k,
            width: (REGIONS.label.w + 8) * k,
            height: (REGIONS.label.h + 8) * k,
            border: `4px solid ${color}`,
            borderRadius: 6,
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ ...TEXT.item, marginTop: SPACE.m }}>{c.caption}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, opacity: all.opacity }}>
      <Heading kicker={RESULT.kicker} title={RESULT.title} />
      <div style={{ position: "absolute", left: M, top: CONTENT_Y, display: "flex", gap: GRID.gutter }}>
        {col(RESULT.before, FOOTAGE.stills.beforeGuidance, COLOR.muted, {})}
        {col(RESULT.after, FOOTAGE.stills.afterGuidance, COLOR.accent, after)}
      </div>
    </AbsoluteFill>
  );
};

const Recap: React.FC<{ readonly t: number }> = ({ t }) => {
  const s = sceneStart("recap");
  const all = useEnter(s);
  const d = sceneEnd("recap") - s - 1.5;
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, opacity: all.opacity }}>
      <Heading kicker={RECAP.kicker} title={RECAP.title} />
      <div style={{ position: "absolute", left: M, top: CONTENT_Y, width: 900, borderTop: `2px solid ${COLOR.line}` }}>
        {RECAP.items.map((it, i) => {
          const on = t >= s + 0.4 + (d * i) / RECAP.items.length;
          return (
            <div key={it} style={{ display: "flex", alignItems: "center", gap: SPACE.m, padding: `${SPACE.s}px 0`, borderBottom: `2px solid ${COLOR.line}` }}>
              <Mark state={on ? "done" : "todo"} size={40} />
              <div style={TEXT.item}>{it}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const WorkSetupVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const scene = sceneAt(t);

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: SCREEN.x, top: SCREEN.y, borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}>
        <Screen width={SCREEN.w} height={SCREEN.h} />
      </div>
      <Note scene={scene} t={t} />
      <Progress scene={scene} />

      {scene === "result" ? <Result /> : null}
      {scene === "recap" ? <Recap t={t} /> : null}

      <Subtitles
        lines={VO}
        left={SUB.x}
        right={FRAME.w - SUB.x - SUB.w}
        top={SUB.y}
        variant="plain"
        align="left"
        maxChars={SUBTITLE_MAX_CHARS}
        style={TEXT.subtitle}
      />
      <Intro t={t} />

      <Track name="Voiceover">
        {VO.map((l) => (
          <Audio
            key={l.id}
            name={`VO ${l.id}`}
            src={staticFile(l.file)}
            from={Math.round(l.from * fps)}
            durationInFrames={Math.ceil((l.to - l.from) * fps) + 1}
          />
        ))}
      </Track>
    </AbsoluteFill>
  );
};
