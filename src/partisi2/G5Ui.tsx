import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SAMPLE, T } from "./timeline";

// Stylized mockup of a G5-style display UI, laid out in a 1280x800 box.
// Not a copy of the real John Deere interface.

export const UI_W = 1280;
export const UI_H = 800;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BG = "#1b2026";
const BAR = "#262d35";
const CARD = "#2c343d";
const TEXT = "#e8edf1";
const MUTED = "#9aa7b3";
const YELLOW = "#ffd400";
const RED = "#ff3b30";
const GREEN = "#22c55e";

// Tile positions on the Applications page (also used to aim the cursor).
const TILE = { w: 270, h: 230, gapX: 26, gapY: 26, left: 52, top: 130 };
export const APPS = [
  "Equipment Manager",
  "Work Setup",
  "Guidance",
  "Status Center",
  "Data Manager",
  "Work Monitor",
  "Coverage Map",
  "Settings",
] as const;
export const tileCenter = (name: (typeof APPS)[number]) => {
  const i = APPS.indexOf(name);
  const col = i % 4;
  const row = Math.floor(i / 4);
  return {
    x: TILE.left + col * (TILE.w + TILE.gapX) + TILE.w / 2,
    y: TILE.top + row * (TILE.h + TILE.gapY) + TILE.h / 2,
  };
};

// Form rows on the Work Setup page.
const FORM = { left: 90, top: 190, labelW: 220, fieldW: 700, rowH: 120 };
export const fieldBox = (row: number) => ({
  x: FORM.left + FORM.labelW,
  y: FORM.top + row * FORM.rowH,
  w: FORM.fieldW,
  h: 84,
});
export const MENU_BTN = { x: 70, y: UI_H - 48 };
export const BACK_BTN = { x: 60, y: 38 };
export const SAVE_BTN = { x: UI_W - 190, y: UI_H - 172, w: 230, h: 72 };

const Icon: React.FC<{ readonly name: string }> = ({ name }) => {
  const c = YELLOW;
  switch (name) {
    case "Equipment Manager":
      return (
        <g>
          <rect x={4} y={34} width={34} height={22} rx={4} fill={c} />
          <rect x={14} y={18} width={20} height={18} rx={3} fill="none" stroke={c} strokeWidth={4} />
          <circle cx={14} cy={60} r={10} fill="none" stroke={c} strokeWidth={4} />
          <circle cx={36} cy={62} r={6} fill="none" stroke={c} strokeWidth={4} />
          <line x1={44} y1={50} x2={56} y2={50} stroke={c} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={62 + i * 6} cy={56} r={7} fill="none" stroke={c} strokeWidth={3} />
          ))}
        </g>
      );
    case "Work Setup":
      return (
        <g>
          <rect x={14} y={10} width={52} height={62} rx={6} fill="none" stroke={c} strokeWidth={4} />
          <rect x={28} y={4} width={24} height={12} rx={3} fill={c} />
          {[28, 42, 56].map((y) => (
            <line key={y} x1={24} y1={y} x2={56} y2={y} stroke={c} strokeWidth={4} strokeLinecap="round" />
          ))}
        </g>
      );
    case "Guidance":
      return (
        <g>
          <circle cx={40} cy={40} r={30} fill="none" stroke={c} strokeWidth={5} />
          <circle cx={40} cy={40} r={7} fill={c} />
          <line x1={40} y1={10} x2={40} y2={33} stroke={c} strokeWidth={5} />
          <line x1={12} y1={50} x2={33} y2={43} stroke={c} strokeWidth={5} />
          <line x1={68} y1={50} x2={47} y2={43} stroke={c} strokeWidth={5} />
        </g>
      );
    case "Status Center":
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={10 + i * 17} y={60 - i * 14} width={12} height={14 + i * 14} rx={2} fill={c} />
          ))}
        </g>
      );
    case "Data Manager":
      return (
        <g>
          <path d="M8 22 L30 22 L36 30 L72 30 L72 66 L8 66 Z" fill="none" stroke={c} strokeWidth={4} strokeLinejoin="round" />
          <line x1={20} y1={48} x2={60} y2={48} stroke={c} strokeWidth={4} />
        </g>
      );
    case "Work Monitor":
      return (
        <g>
          <path d="M10 60 A 30 30 0 0 1 70 60" fill="none" stroke={c} strokeWidth={5} />
          <line x1={40} y1={60} x2={58} y2={36} stroke={c} strokeWidth={5} strokeLinecap="round" />
          <circle cx={40} cy={60} r={5} fill={c} />
        </g>
      );
    case "Coverage Map":
      return (
        <g>
          <path d="M8 18 L30 10 L50 18 L72 10 L72 66 L50 74 L30 66 L8 74 Z" fill="none" stroke={c} strokeWidth={4} strokeLinejoin="round" />
          <path d="M14 40 L66 40" stroke={c} strokeWidth={6} opacity={0.6} />
        </g>
      );
    default:
      return (
        <g>
          <circle cx={40} cy={40} r={14} fill="none" stroke={c} strokeWidth={5} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={40 + Math.cos(a) * 20}
                y1={40 + Math.sin(a) * 20}
                x2={40 + Math.cos(a) * 30}
                y2={40 + Math.sin(a) * 30}
                stroke={c}
                strokeWidth={7}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      );
  }
};

const TopBar: React.FC<{ readonly title: string; readonly back: boolean }> = ({ title, back }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: UI_W,
      height: 76,
      backgroundColor: BAR,
      display: "flex",
      alignItems: "center",
      padding: "0 28px",
      boxSizing: "border-box",
      gap: 18,
    }}
  >
    {back ? (
      <svg width={40} height={40} viewBox="0 0 40 40">
        <path d="M26 8 L12 20 L26 32" stroke={TEXT} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : null}
    <div style={{ fontSize: 34, fontWeight: 700, color: TEXT, flex: 1 }}>{title}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: TEXT, fontSize: 24 }}>
      <span style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: GREEN, display: "inline-block" }} />
      GPS
      <svg width={40} height={28} viewBox="0 0 40 28" style={{ marginLeft: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 10} y={20 - i * 6} width={7} height={8 + i * 6} fill={TEXT} />
        ))}
      </svg>
      <span style={{ marginLeft: 16 }}>07:42</span>
    </div>
  </div>
);

const ShortcutBar: React.FC<{ readonly menuActive: boolean }> = ({ menuActive }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      bottom: 0,
      width: UI_W,
      height: 96,
      backgroundColor: BAR,
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "0 24px",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        width: 92,
        height: 70,
        borderRadius: 12,
        backgroundColor: menuActive ? YELLOW : "#3a444f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={40} height={40} viewBox="0 0 40 40">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} x={c * 14} y={r * 14} width={10} height={10} rx={2} fill={menuActive ? "#1b2026" : TEXT} />
          )),
        )}
      </svg>
    </div>
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} style={{ width: 150, height: 70, borderRadius: 12, backgroundColor: "#323b45" }} />
    ))}
  </div>
);

// Run page: field map with sugarcane rows and the tractor icon.
const HomePage: React.FC = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <TopBar title="Run Page" back={false} />
    <svg style={{ position: "absolute", left: 24, top: 96 }} width={UI_W - 48} height={UI_H - 216}>
      <rect width="100%" height="100%" rx={12} fill="#4f6f36" />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={60} x2={UI_W - 110} y1={40 + i * 36} y2={40 + i * 36} stroke="#3f8f2c" strokeWidth={14} strokeLinecap="round" />
      ))}
      <path d="M 560 300 L 600 320 L 560 340 Z" fill="#fff" stroke="#000" strokeWidth={3} />
    </svg>
  </div>
);

const AppsPage: React.FC<{ readonly pressed: string | null }> = ({ pressed }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <TopBar title="Applications" back={false} />
    {APPS.map((name) => {
      const c = tileCenter(name);
      const isPressed = pressed === name;
      return (
        <div
          key={name}
          style={{
            position: "absolute",
            left: c.x - TILE.w / 2,
            top: c.y - TILE.h / 2,
            width: TILE.w,
            height: TILE.h,
            borderRadius: 18,
            backgroundColor: isPressed ? "#3c4855" : CARD,
            border: isPressed ? `4px solid ${YELLOW}` : "4px solid transparent",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            scale: isPressed ? "0.97" : "1",
          }}
        >
          <svg width={80} height={80} viewBox="0 0 80 80">
            <Icon name={name} />
          </svg>
          <div style={{ color: TEXT, fontSize: 26, fontWeight: 600, textAlign: "center" }}>{name}</div>
        </div>
      );
    })}
  </div>
);

const EquipmentPage: React.FC<{ readonly sync: number }> = ({ sync }) => {
  const done = sync >= 1;
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <TopBar title="Equipment Manager" back />
      <div style={{ position: "absolute", left: 60, top: 120, right: 60, display: "flex", gap: 40, alignItems: "stretch" }}>
        {[
          { label: "Tractor", value: "Traktor Unit 07", icon: "tractor" },
          { label: "Implement", value: SAMPLE.implement, icon: "plow" },
        ].map((card, i) => (
          <div
            key={card.label}
            style={{
              flex: 1,
              height: 330,
              borderRadius: 20,
              backgroundColor: CARD,
              padding: 30,
              boxSizing: "border-box",
              border: i === 1 ? `4px solid ${done ? GREEN : YELLOW}` : "4px solid transparent",
            }}
          >
            <div style={{ color: MUTED, fontSize: 24 }}>{card.label}</div>
            <div style={{ color: TEXT, fontSize: 34, fontWeight: 700, marginTop: 8 }}>{card.value}</div>
            <svg width={420} height={180} viewBox="0 0 420 180" style={{ marginTop: 20 }}>
              {card.icon === "tractor" ? (
                <g>
                  <rect x={60} y={70} width={170} height={60} rx={10} fill="#3b8530" />
                  <rect x={70} y={20} width={90} height={60} rx={8} fill="none" stroke="#3b8530" strokeWidth={8} />
                  <circle cx={100} cy={140} r={36} fill="#15171a" />
                  <circle cx={100} cy={140} r={18} fill={YELLOW} />
                  <circle cx={210} cy={150} r={24} fill="#15171a" />
                  <circle cx={210} cy={150} r={11} fill={YELLOW} />
                </g>
              ) : (
                <g>
                  <rect x={40} y={60} width={300} height={22} rx={6} fill="#c9a200" />
                  {[0, 1, 2].map((d) => (
                    <g key={d} transform={`translate(${90 + d * 100} 120) rotate(${frame * (done ? 0 : 3)})`}>
                      <ellipse cx={0} cy={0} rx={34} ry={40} fill="#9aa0a6" stroke="#5b6168" strokeWidth={5} />
                      <line x1={-30} y1={0} x2={30} y2={0} stroke="#5b6168" strokeWidth={4} />
                    </g>
                  ))}
                  <line x1={70} y1={82} x2={90} y2={110} stroke="#c9a200" strokeWidth={8} />
                  <line x1={170} y1={82} x2={190} y2={110} stroke="#c9a200" strokeWidth={8} />
                  <line x1={270} y1={82} x2={290} y2={110} stroke="#c9a200" strokeWidth={8} />
                </g>
              )}
            </svg>
          </div>
        ))}
      </div>
      {/* connection status */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 480, borderRadius: 20, backgroundColor: CARD, padding: "26px 30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: TEXT, fontSize: 30, fontWeight: 700 }}>
          <span>{done ? "Implement tersinkron" : "Menyinkronkan implement…"}</span>
          <span style={{ color: done ? GREEN : YELLOW }}>{Math.round(sync * 100)}%</span>
        </div>
        <div style={{ marginTop: 18, height: 22, borderRadius: 11, backgroundColor: "#46515c", overflow: "hidden" }}>
          <div style={{ width: `${sync * 100}%`, height: "100%", backgroundColor: done ? GREEN : YELLOW, borderRadius: 11 }} />
        </div>
      </div>
    </div>
  );
};

const FieldRow: React.FC<{
  readonly row: number;
  readonly label: string;
  readonly value: string;
  readonly placeholder: string;
  readonly active: boolean;
  readonly done: boolean;
  readonly caret: boolean;
  readonly suffix?: React.ReactNode;
}> = ({ row, label, value, placeholder, active, done, caret, suffix }) => {
  const frame = useCurrentFrame();
  const box = fieldBox(row);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);
  return (
    <>
      <div style={{ position: "absolute", left: FORM.left, top: box.y + 20, color: TEXT, fontSize: 32, fontWeight: 700 }}>{label}</div>
      <div
        style={{
          position: "absolute",
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          borderRadius: 12,
          backgroundColor: "#11161b",
          border: `3px solid ${done ? GREEN : "#4a5560"}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          fontSize: 32,
          color: value ? TEXT : "#5e6a75",
        }}
      >
        <span style={{ flex: 1 }}>
          {value || placeholder}
          {caret ? <span style={{ color: YELLOW, opacity: Math.floor(frame / 8) % 2 ? 0 : 1 }}>|</span> : null}
        </span>
        {suffix}
        {done ? (
          <svg width={36} height={36} viewBox="0 0 24 24" style={{ marginLeft: 12 }}>
            <path d="M4 12.5 L10 18 L20 6" stroke={GREEN} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
      {active ? (
        <div
          style={{
            position: "absolute",
            left: FORM.left - 24,
            top: box.y - 16,
            width: box.x + box.w - FORM.left + 48,
            height: box.h + 32,
            borderRadius: 18,
            border: `5px solid ${RED}`,
            boxShadow: `0 0 ${18 + pulse * 18}px rgba(255,59,48,${0.45 + pulse * 0.3})`,
            boxSizing: "border-box",
          }}
        />
      ) : null}
    </>
  );
};

const WorkSetupPage: React.FC<{ readonly t: number }> = ({ t }) => {
  const nameFull = `${SAMPLE.operator} · ${SAMPLE.operatorId}`;
  const typed = Math.round(
    interpolate(t, [T.detailsTypeFrom, T.detailsTypeTo], [0, nameFull.length], clamp),
  );
  const typeSelected = t >= T.typePick;
  const dropdownOpen = t >= T.typeOpen && t < T.typePick + 0.35;
  const depth = Math.round(
    interpolate(t, [T.depthFrom, T.depthTo], [0, SAMPLE.depthCm], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) }),
  );
  const active = t >= T.saveTap ? -1 : t >= T.depth ? 2 : t >= T.type ? 1 : t >= T.details ? 0 : -1;
  const saved = t >= T.saved;
  const typeBox = fieldBox(1);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <TopBar title="Work Setup" back />
      <div style={{ position: "absolute", left: 40, top: 110, right: 40, bottom: 120, borderRadius: 20, backgroundColor: CARD }} />
      <div style={{ position: "absolute", left: FORM.left, top: 130, color: MUTED, fontSize: 24 }}>
        Isi sebelum mulai bekerja
      </div>
      <FieldRow
        row={0}
        label="Details"
        value={nameFull.slice(0, typed)}
        placeholder="Nama & ID operator"
        active={active === 0}
        done={typed >= nameFull.length && t >= T.type}
        caret={active === 0 && typed < nameFull.length}
      />
      <FieldRow
        row={1}
        label="Type"
        value={typeSelected ? SAMPLE.typeOptions[SAMPLE.typeIndex] : ""}
        placeholder="Pilih kode pengerjaan"
        active={active === 1}
        done={typeSelected && t >= T.depth}
        caret={false}
        suffix={
          <svg width={30} height={30} viewBox="0 0 30 30">
            <path d="M6 11 L15 20 L24 11" stroke={TEXT} strokeWidth={4} fill="none" strokeLinecap="round" />
          </svg>
        }
      />
      <FieldRow
        row={2}
        label="Depth"
        value={t >= T.depthFrom ? `${depth} cm` : ""}
        placeholder="Kedalaman (cm)"
        active={active === 2}
        done={t >= T.saveTap}
        caret={false}
        suffix={
          <div style={{ display: "flex", gap: 10 }}>
            {["−", "+"].map((s) => (
              <div key={s} style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: "#3a444f", color: TEXT, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s}
              </div>
            ))}
          </div>
        }
      />
      {/* Save button */}
      <div
        style={{
          position: "absolute",
          left: SAVE_BTN.x - SAVE_BTN.w / 2,
          top: SAVE_BTN.y - SAVE_BTN.h / 2,
          width: SAVE_BTN.w,
          height: SAVE_BTN.h,
          borderRadius: 14,
          backgroundColor: saved ? GREEN : YELLOW,
          color: "#1b2026",
          fontSize: 30,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {saved ? "✓ Saved" : "Save"}
      </div>
      {/* Type dropdown */}
      {dropdownOpen ? (
        <div
          style={{
            position: "absolute",
            left: typeBox.x,
            top: typeBox.y + typeBox.h + 6,
            width: typeBox.w,
            borderRadius: 12,
            backgroundColor: "#11161b",
            border: "3px solid #4a5560",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            zIndex: 2,
          }}
        >
          {SAMPLE.typeOptions.map((opt, i) => {
            const hl = i === SAMPLE.typeIndex && t >= T.typePick - 0.35;
            return (
              <div
                key={opt}
                style={{
                  padding: "16px 24px",
                  fontSize: 28,
                  color: TEXT,
                  backgroundColor: hl ? "#3c4855" : "transparent",
                  borderLeft: hl ? `6px solid ${YELLOW}` : "6px solid transparent",
                }}
              >
                {opt}
              </div>
            );
          })}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: FORM.left, bottom: 135, color: MUTED, fontSize: 20 }}>
        Contoh data. Gunakan data operator dan standar kode kebun yang berlaku.
      </div>
    </div>
  );
};

// Index of the Applications tile under the cursor at time t (for press state).
const pressedTile = (t: number) => {
  if (t >= T.emTap - 0.15 && t < T.emOpen) return "Equipment Manager";
  if (t >= T.wsTap - 0.15 && t < T.wsOpen) return "Work Setup";
  return null;
};

export const G5Ui: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const page =
    t >= T.wsOpen ? "ws" : t >= T.appsAgain ? "apps" : t >= T.emOpen ? "em" : t >= T.appsOpen ? "apps" : "home";
  const pageStart =
    page === "ws" ? T.wsOpen : page === "em" ? T.emOpen : page === "apps" ? (t >= T.appsAgain ? T.appsAgain : T.appsOpen) : 0;
  const enter = interpolate(t, [pageStart, pageStart + 0.3], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const sync = interpolate(t, [T.emOpen + 0.3, T.syncDone], [0, 1], clamp);

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: UI_W, height: UI_H, backgroundColor: BG, overflow: "hidden", fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, opacity: pageStart === 0 ? 1 : enter, translate: `${(1 - enter) * 60}px 0px` }}>
        {page === "home" ? <HomePage /> : null}
        {page === "apps" ? <AppsPage pressed={pressedTile(t)} /> : null}
        {page === "em" ? <EquipmentPage sync={sync} /> : null}
        {page === "ws" ? <WorkSetupPage t={t} /> : null}
      </div>
      {page !== "ws" && page !== "em" ? <ShortcutBar menuActive={t >= T.menuTap - 0.15 && t < T.appsOpen + 0.2} /> : null}
    </div>
  );
};
