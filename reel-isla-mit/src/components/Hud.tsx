import React from "react";
import { Cam, L2W, V3, project } from "../camera";
import { C, EASE, EASE_OUT, EV, MONO, S, TITLE, UI, clamp01, springAt, windowed } from "../theme";
import { SILHOUETTE } from "../world/City";
import { BLOCK, LAND1, LAND2, PICO, PICO_H, TOWER_L, TOWER_L_N, TOWER_R, TOWER_R_N, towerLand } from "../world/layout";
import { Micro, MICRO_TOP } from "./Captions";

const at = (p: V3, cam: Cam) => project(L2W(p), cam);

/** Top-down lobster glyph (for the row of 13 agents). */
export const LobsterIcon: React.FC<{ size: number; color: string; glow?: number }> = ({ size, color, glow = 0 }) => (
  <svg width={size * 0.75} height={size} viewBox="0 0 60 80" fill={color} stroke={color} strokeLinecap="round"
    style={{ filter: glow > 0 ? `drop-shadow(0 0 ${10 * glow}px rgba(255,107,26,${0.9 * glow}))` : undefined }}>
    <path d="M27 15 L15 1 M33 15 L45 1" strokeWidth="1.6" fill="none" />
    <path d="M25 23 L13 18 M35 23 L47 18" strokeWidth="3.4" fill="none" />
    <ellipse cx="9" cy="11" rx="5.5" ry="8.5" transform="rotate(-18 9 11)" stroke="none" />
    <ellipse cx="51" cy="11" rx="5.5" ry="8.5" transform="rotate(18 51 11)" stroke="none" />
    <path d="M23 27 L13 31 M23 32 L13 37 M37 27 L47 31 M37 32 L47 37" strokeWidth="2" fill="none" />
    <ellipse cx="30" cy="28" rx="8.5" ry="12.5" stroke="none" />
    <ellipse cx="30" cy="43" rx="7" ry="4" stroke="none" />
    <ellipse cx="30" cy="51" rx="6" ry="3.8" stroke="none" />
    <ellipse cx="30" cy="58.5" rx="5" ry="3.4" stroke="none" />
    <path d="M30 61 L20 74 L30 70 L40 74 Z" stroke="none" />
  </svg>
);

/** E2: the hours run from 00:00 to 30:00. */
const Counter: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, EV.counter0 - 0.1, S.E3 - 0.05, 0.3, 0.3);
  if (o <= 0) return null;
  const p = EASE(clamp01((t - EV.counter0) / (EV.counter1 - EV.counter0)));
  const mins = Math.floor(p * 30 * 60);
  const hh = String(Math.floor(mins / 60)).padStart(2, "0");
  const mm = String(mins % 60).padStart(2, "0");
  const done = p >= 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 388, display: "flex", flexDirection: "column", alignItems: "center", opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 26, fontFamily: MONO, fontWeight: 700 }}>
        <span style={{ fontSize: 70, color: done ? C.orange : C.cream, textShadow: done ? "0 0 24px rgba(255,107,26,0.7)" : "0 2px 16px rgba(0,0,0,0.6)", minWidth: 300, textAlign: "right" }}>{hh}:{mm} H</span>
        <span style={{ fontSize: 44, color: "rgba(255,244,236,0.5)" }}>→</span>
        <span style={{ fontSize: 44, color: "rgba(255,244,236,0.5)" }}>30:00 H</span>
      </div>
      <div style={{ marginTop: 16, width: 620, height: 6, borderRadius: 3, background: "rgba(255,244,236,0.14)" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 3, background: C.orange, boxShadow: "0 0 14px rgba(255,107,26,0.9)" }} />
      </div>
    </div>
  );
};

/** E5: thirteen agents, six of them light up. */
const AgentsRow: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, EV.row, S.E5B + 0.2, 0.35, 0.3);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: MICRO_TOP + 56, display: "flex", justifyContent: "center", gap: 14, opacity: o }}>
      {Array.from({ length: 13 }, (_, i) => {
        const s = springAt(t, EV.row + i * 0.04, 12, 200);
        // the six that found the trick, spread along the row
        const order = [1, 3, 5, 8, 10, 12].indexOf(i);
        const on = order >= 0 ? EASE_OUT(clamp01((t - EV.six - order * EV.sixStep) / 0.2)) : 0;
        return (
          <div key={i} style={{ scale: String(Math.max(0, s) * (1 + 0.18 * Math.sin(Math.PI * on))), opacity: clamp01(s * 1.5) }}>
            <LobsterIcon size={58} color={on > 0.5 ? C.orange : "rgba(255,244,236,0.22)"} glow={on} />
          </div>
        );
      })}
    </div>
  );
};

/** E5: "+ DISTANCIA" over the arrow between the two landings. */
const DistanceTag: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.land2 + 0.35, S.E6 + 0.3, 0.3, 0.4);
  if (o <= 0) return null;
  const [x, y] = at([(LAND1[0] + LAND2[0]) / 2, 0, LAND1[2] + 0.55], cam);
  const s = springAt(t, EV.land2 + 0.35, 11, 200);
  return (
    <div style={{
      position: "absolute", left: x, top: y - 92, translate: "-50% 0", scale: String(0.7 + 0.3 * s), opacity: o,
      padding: "12px 26px", borderRadius: 999, background: C.orange, color: C.ink, fontFamily: MONO, fontWeight: 700, fontSize: 34,
      letterSpacing: 5, whiteSpace: "nowrap", boxShadow: "0 0 40px rgba(255,107,26,0.6), 0 10px 30px rgba(0,0,0,0.5)",
    }}>+ DISTANCIA →</div>
  );
};

/** E6: who played and who didn't, the challenge and the block counts. */
const GroupLabels: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.spawn + 0.3, S.E7 + 0.1, 0.35, 0.35);
  if (o <= 0) return null;
  const count = (side: "L" | "R", n: number) => Array.from({ length: n }, (_, i) => towerLand(side, i)).filter((x) => t >= x).length;
  const nl = count("L", TOWER_L_N);
  const nr = count("R", TOWER_R_N);
  const [tlx, tly] = at([TOWER_L[0], BLOCK * Math.max(nl, 1), TOWER_L[2]], cam);
  const [trx, try_] = at([TOWER_R[0], BLOCK * Math.max(nr, 1), TOWER_R[2]], cam);
  const [px, py] = at([PICO[0], PICO_H, PICO[2]], cam);
  const reto = windowed(t, EV.work - 0.2, S.E7 + 0.1, 0.3, 0.35);
  const pill = (x: number, y: number, text: string, lit: boolean, d: number) => {
    const s = springAt(t, EV.spawn + 0.3 + d, 12, 200);
    return (
      <div style={{
        position: "absolute", left: x, top: y + 30, translate: "-50% 0", scale: String(0.7 + 0.3 * s), opacity: o * clamp01(s * 1.4),
        padding: "10px 22px", borderRadius: 999, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, whiteSpace: "nowrap",
        background: lit ? C.orange : "rgba(42,33,27,0.92)", color: lit ? C.ink : "rgba(255,244,236,0.55)",
        border: lit ? "none" : "1.5px solid rgba(255,244,236,0.18)", boxShadow: lit ? "0 0 30px rgba(255,107,26,0.55)" : "none",
      }}>{text}</div>
    );
  };
  const num = (x: number, y: number, n: number, lit: boolean) => n > 0 && (
    <div style={{
      position: "absolute", left: x, top: y - 96, translate: "-50% 0", opacity: o, fontFamily: TITLE, fontWeight: 800, fontSize: 64,
      color: lit ? C.orange : "rgba(255,244,236,0.45)", textShadow: lit ? "0 0 26px rgba(255,107,26,0.7)" : "none",
    }}>{n}</div>
  );
  return (
    <>
      {pill(250, 640, "JUGARON", true, 0)}
      {pill(830, 640, "NO JUGARON", false, 0.12)}
      {num(tlx, tly, nl, true)}
      {num(trx, try_, nr, false)}
      {reto > 0 && (
        <div style={{ position: "absolute", left: px, top: py - 64, translate: "-50% 0", opacity: reto, whiteSpace: "nowrap" }}>
          <Micro size={22} color={C.orangeSoft}>RETO · APILAR BLOQUES</Micro>
        </div>
      )}
    </>
  );
};

const PhoneGlyph = () => (
  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
const CalendarGlyph = () => (
  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h2M14 14h2M8 18h2" />
  </svg>
);
const MobileGlyph = () => (
  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2M9 7h6M9 11h4" />
  </svg>
);

/** E8: the figure answers the phone, the diary and the mobile at once. */
const Icons: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.icons - 0.1, S.E9 + 0.1, 0.2, 0.4);
  if (o <= 0) return null;
  const [hx, hy] = project([SILHOUETTE[0], 1.12, SILHOUETTE[2]], cam);
  const items: [React.ReactNode, number, number, string][] = [
    [<PhoneGlyph key="p" />, -235, -40, "TELÉFONO"],
    [<CalendarGlyph key="c" />, -175, -235, "AGENDA"],
    [<MobileGlyph key="m" />, 20, -300, "MÓVIL"],
  ];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: o }}>
      {items.map(([glyph, dx, dy, label], i) => {
        const a = EV.icons + i * 0.25;
        const s = springAt(t, a, 11, 190);
        if (s <= 0) return null;
        const bob = Math.sin(t * 2.2 + i * 1.7) * 6;
        const x = hx + dx * Math.min(1, s);
        const y = hy + dy * Math.min(1, s) + bob;
        const check = EASE_OUT(clamp01((t - a - 0.6) / 0.25));
        const pulse = (((t - a) * 1.4) % 1);
        return (
          <g key={i}>
            <line x1={hx} y1={hy} x2={x} y2={y} stroke={C.orange} strokeWidth={3} strokeDasharray="8 8" strokeDashoffset={-t * 40} opacity={0.8} />
            <circle cx={x} cy={y} r={48 + pulse * 30} fill="none" stroke={C.orange} strokeWidth={3} opacity={(1 - pulse) * 0.6} />
            <foreignObject x={x - 48} y={y - 48} width={96} height={96} style={{ overflow: "visible" }}>
              <div style={{
                width: 96, height: 96, borderRadius: 48, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 36px rgba(255,107,26,0.7)", scale: String(Math.max(0.01, s)),
              }}>{glyph}</div>
            </foreignObject>
            {check > 0 && (
              <foreignObject x={x + 20} y={y - 56} width={44} height={44} style={{ overflow: "visible" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 20, background: C.cream, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: UI, fontWeight: 700, fontSize: 26, scale: String(check), border: `3px solid ${C.ink}`,
                }}>✓</div>
              </foreignObject>
            )}
            <foreignObject x={x - 100} y={y + 52} width={200} height={40} style={{ overflow: "visible" }}>
              <div style={{ textAlign: "center", opacity: clamp01(s) }}><Micro size={18} color={C.orangeSoft}>{label}</Micro></div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
};

export const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    <Counter t={t} />
    <AgentsRow t={t} />
    <DistanceTag t={t} cam={cam} />
    <GroupLabels t={t} cam={cam} />
    <Icons t={t} cam={cam} />
  </>
);
