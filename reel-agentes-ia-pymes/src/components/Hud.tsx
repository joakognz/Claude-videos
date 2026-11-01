import React from "react";
import { Cam, L2W, V3, project } from "../camera";
import { C, EASE_OUT, EV, MONO, S, UI, clamp01, springAt, windowed } from "../theme";
import { BAD_CARD, BOARD, CLIENT, CLOCK, COINS, HUMAN, OVERDUE, agentAt, cardAt, envelopeAt, invAt } from "../world/layout";

const at = (p: V3, cam: Cam) => project(L2W(p), cam);

/** A small mono pill pinned to a point of the world. `lit` = orange (AI / status), else dark with cream text. */
const Pill: React.FC<{
  x: number; y: number; o: number; s: number; lit?: boolean; size?: number; children: React.ReactNode; flash?: number;
}> = ({ x, y, o, s, lit, size = 24, children, flash = 0 }) => {
  if (o <= 0.001) return null;
  const on = lit || flash > 0.5;
  return (
    <div style={{
      position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String((0.7 + 0.3 * s) * (1 + 0.12 * flash)), opacity: o * clamp01(s * 1.4),
      padding: `${size * 0.42}px ${size * 0.9}px`, borderRadius: 999, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.16,
      whiteSpace: "nowrap", textTransform: "uppercase",
      background: on ? C.orange : "rgba(26,22,19,0.9)", color: on ? C.ink : "rgba(255,244,236,0.82)",
      border: on ? "none" : "1.5px solid rgba(255,244,236,0.22)",
      boxShadow: on ? "0 0 30px rgba(255,107,26,0.55), 0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.5)",
    }}>{children}</div>
  );
};

const flashAt = (t: number, a: number) => (t > a ? Math.exp(-(t - a) / 0.45) : 0);

/** E1 and the lesson: what each tool is. */
const ToolLabels: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = Math.max(windowed(t, EV.tools + 0.3, S.E2 + 0.6, 0.3, 0.4), windowed(t, EV.rails + 0.3, S.E10 + 0.1, 0.3, 0.4));
  if (o <= 0) return null;
  const items: [V3, string, number, number][] = [
    [[BOARD[0], 2.55, BOARD[2]], "TURNOS", 0, EV.f1],
    [[CLOCK[0], 1.95, CLOCK[2]], "FICHAJES", 0.16, EV.f2],
    [[invAt(2)[0], -0.05, invAt(2)[2] + 0.7], "FACTURAS", 0.32, EV.f3],
  ];
  return (
    <>
      {items.map(([p, label, d, f]) => {
        const [x, y] = at(p, cam);
        const s = springAt(t, (t < S.E3 ? EV.tools + 0.3 : EV.rails + 0.3) + d, 12, 190);
        return <Pill key={label} x={x} y={y} o={o} s={s} flash={flashAt(t, f)}>{label}</Pill>;
      })}
    </>
  );
};

/** E2: a chat bubble — answering is not doing. */
const Bubble: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.bubble, EV.exec + 0.05, 0.15, 0.2);
  if (o <= 0) return null;
  const [x, y] = at(agentAt(t), cam);
  const s = springAt(t, EV.bubble, 11, 200);
  return (
    <div style={{
      position: "absolute", left: x + 40, top: y - 150, opacity: o, scale: String(0.6 + 0.4 * s), transformOrigin: "0% 100%",
      padding: "18px 30px", borderRadius: "30px 30px 30px 6px", background: C.cream, display: "flex", gap: 12,
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    }}>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ width: 16, height: 16, borderRadius: 8, background: C.ink, opacity: 0.3 + 0.7 * Math.max(0, Math.sin(t * 9 - k * 0.9)) }} />
      ))}
    </div>
  );
};

/** E3–E5: status tags on the tools. */
const Tags: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const out: React.ReactNode[] = [];
  const tag = (key: string, p: V3, a: number, b: number, text: React.ReactNode, lit: boolean, size = 24) => {
    const o = windowed(t, a, b, 0.2, 0.3);
    if (o <= 0) return;
    const [x, y] = at(p, cam);
    out.push(<Pill key={key} x={x} y={y} o={o} s={springAt(t, a, 12, 200)} lit={lit} size={size}>{text}</Pill>);
  };
  const boardTop: V3 = [BOARD[0], 2.55, BOARD[2]];
  tag("gap", boardTop, EV.gap + 0.15, EV.walk1, "TURNO SIN CUBRIR", false);
  tag("ok", boardTop, EV.walk1, S.E4 + 0.1, "TURNO CUBIERTO ✓", true);
  const c = cardAt(BAD_CARD);
  tag("card", [c[0] - 0.4, -0.05, c[2] + 0.75], EV.flag + 0.2, S.E5 + 0.1, "FICHAJE INCOMPLETO", true);
  const inv = invAt(OVERDUE);
  tag("od", [inv[0] + 0.2, 1.25, inv[2]], EV.overdue + 0.1, EV.fold + 0.2, "VENCIDA", false);
  const e = envelopeAt(t);
  tag("draft", [e[0], e[1] + 0.85, e[2]], EV.draft - 0.2, S.E6 - 0.05, "BORRADOR · PIDE TU OK", false, 22);
  tag("draft2", [e[0], e[1] + 0.85, e[2]], EV.deliver0, EV.approve, "BORRADOR · PIDE TU OK", false, 22);
  tag("sent", [e[0], e[1] + 0.85, e[2]], EV.approve, EV.send + 0.25, "APROBADO ✓", true, 22);
  return <>{out}</>;
};

/** E6–E7: who says so, and how far it has really arrived. */
const Claims: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.pills - 0.1, S.E8 + 0.2, 0.25, 0.35);
  if (o <= 0) return null;
  const test = t >= EV.test;
  const glitch = test && t < EV.test + 0.3 ? (Math.floor(t * 30) % 2 === 0 ? 0.4 : 1) : 1;
  const [ax, ay] = at([-1.05, 2.75, -2.35], cam);
  const [bx, by] = at([invAt(2)[0], 1.45, invAt(2)[2]], cam);
  return (
    <>
      <Pill x={ax} y={ay} o={o * glitch} s={springAt(t, EV.pills, 12, 200)} size={26}>{test ? "HOMEBASE · ACCESO LIMITADO" : "SEGÚN HOMEBASE"}</Pill>
      <Pill x={bx} y={by} o={o * glitch} s={springAt(t, EV.pills + 0.25, 12, 200)} size={26}>{test ? "INTUIT · BETA" : "SEGÚN INTUIT"}</Pill>
    </>
  );
};

/** E8: the person's approval stamp. */
const Stamp: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.approve - 0.05, S.E9 + 0.1, 0.1, 0.35);
  if (o <= 0) return null;
  const [x, y] = at([HUMAN[0] - 1.05, 2.45, HUMAN[2]], cam);
  const s = springAt(t, EV.approve, 9, 260);
  const ring = clamp01((t - EV.approve) / 0.6);
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", opacity: o }}>
      <div style={{
        position: "absolute", left: "50%", top: "50%", width: 110, height: 110, translate: "-50% -50%", borderRadius: "50%",
        border: `4px solid ${C.cream}`, scale: String(1 + ring * 1.4), opacity: 1 - ring,
      }} />
      <div style={{
        width: 104, height: 104, borderRadius: "50%", background: C.cream, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: UI, fontWeight: 700, fontSize: 64, scale: String(Math.max(0.01, s)), rotate: `${(1 - Math.min(1, s)) * -25}deg`,
        boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
      }}>✓</div>
    </div>
  );
};

/** E10: money and clients go to the person, not round the loop. */
const Review: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.coins, S.E11 + 0.1, 0.25, 0.35);
  if (o <= 0) return null;
  const [hx, hy] = at([HUMAN[0], 0.9, HUMAN[2]], cam);
  const [cx, cy] = at([COINS[0] + 0.15, 0.35, COINS[2] + 0.15], cam);
  const [kx, ky] = at([CLIENT[0], 0.7, CLIENT[2]], cam);
  const line = (x: number, y: number, a: number) => {
    const p = EASE_OUT(clamp01((t - a) / 0.4));
    return <line x1={x} y1={y} x2={x + (hx - x) * p} y2={y + (hy - y) * p} stroke={C.orange} strokeWidth={4} strokeDasharray="10 10" strokeDashoffset={-t * 40} opacity={0.9} />;
  };
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
        {t > EV.halo - 0.1 && line(cx, cy, EV.halo - 0.1)}
        {t > EV.halo && line(kx, ky, EV.halo)}
      </svg>
      <Pill x={cx} y={cy + 70} o={o} s={springAt(t, EV.coins + 0.2, 12, 200)} size={22}>DINERO</Pill>
      <Pill x={kx} y={ky + 110} o={windowed(t, EV.client, S.E11 + 0.1, 0.25, 0.35)} s={springAt(t, EV.client + 0.1, 12, 200)} size={22}>CLIENTES</Pill>
    </>
  );
};

export const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    <ToolLabels t={t} cam={cam} />
    <Bubble t={t} cam={cam} />
    <Tags t={t} cam={cam} />
    <Claims t={t} cam={cam} />
    <Stamp t={t} cam={cam} />
    <Review t={t} cam={cam} />
  </>
);
