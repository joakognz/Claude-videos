import React from "react";
import { Cam, L2W, V3, project } from "../camera";
import { C, EASE, EASE_IN, EASE_OUT, EV, Msg, S, TITLE, TL, beat, clamp01, lerp, rand, springAt, windowed } from "../theme";
import {
  CTR, FLIGHT, HUMAN_CENTRE, HUMAN_HOME, ORB_SIZE, TENT, arc, humanAt, orbAt, orbTop, towerIndex, towerSlot,
} from "../world/layout";
import { Micro } from "./Captions";

const at = (p: V3, cam: Cam) => project(L2W(p), cam);
const HUD_Y = 590;

// ── icons (drawn on a 24 px grid) ─────────────────────────────────────────
const Icon: React.FC<{ kind: string; color: string; size: number }> = ({ kind, color, size }) => {
  const sw = { fill: "none", stroke: color, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {kind === "tent" && <><path d="M2.5 20 L12 4 L21.5 20 Z" {...sw} /><path d="M12 4 L12 20 M9 20 L12 13 L15 20" {...sw} /></>}
      {kind === "pin" && <><path d="M12 21 C7 15 5 12 5 9 a7 7 0 0 1 14 0 c0 3 -2 6 -7 12 Z" {...sw} /><circle cx="12" cy="9" r="2.4" {...sw} /></>}
      {kind === "cal" && <><rect x="3.5" y="5" width="17" height="15" rx="2" {...sw} /><path d="M3.5 10 H20.5 M8 3 V7 M16 3 V7 M8 14 H10 M14 14 H16" {...sw} /></>}
      {kind === "board" && <><rect x="3" y="4" width="18" height="12" rx="1.5" {...sw} /><path d="M7 12 L10 9 L13 11 L17 7 M9 16 L7 21 M15 16 L17 21" {...sw} /></>}
      {kind === "dots" && <><circle cx="6" cy="12" r="2" fill={color} /><circle cx="12" cy="12" r="2" fill={color} /><circle cx="18" cy="12" r="2" fill={color} /></>}
      {kind === "heart" && <path d="M12 20 C5 15 3 12 3 8.5 A4.5 4.5 0 0 1 12 6.5 A4.5 4.5 0 0 1 21 8.5 C21 12 19 15 12 20 Z" fill={color} />}
      {kind === "thumb" && <><path d="M7 11 V20 H4 V11 Z" fill={color} /><path d="M7 11 L11 3.5 C12.5 3.5 13.5 4.5 13 6.5 L12.3 10 H18.5 C19.8 10 20.6 11.2 20.2 12.4 L18.3 18.6 C18 19.4 17.3 20 16.4 20 H7" fill={color} /></>}
    </svg>
  );
};

/** A chat bubble centred on (x, y): rounded box with a little tail. */
const Bubble: React.FC<{
  x: number; y: number; size: number; fill: string; stroke?: string; dash?: boolean; icon: string; iconColor: string;
  opacity?: number; blur?: number; iconOpacity?: number; tilt?: number;
}> = ({ x, y, size, fill, stroke, dash, icon, iconColor, opacity = 1, blur = 0, iconOpacity = 1, tilt = 0 }) => {
  const w = size * 1.32;
  const h = size;
  return (
    <div style={{
      position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, opacity, rotate: `${tilt}deg`,
      filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
    }}>
      <svg width={w} height={h + size * 0.22} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path
          d={`M${h * 0.3} 0 H${w - h * 0.3} A${h * 0.3} ${h * 0.3} 0 0 1 ${w} ${h * 0.3} V${h * 0.7} A${h * 0.3} ${h * 0.3} 0 0 1 ${w - h * 0.3} ${h}
            H${w * 0.42} L${w * 0.28} ${h + size * 0.2} L${w * 0.3} ${h} H${h * 0.3} A${h * 0.3} ${h * 0.3} 0 0 1 0 ${h * 0.7} V${h * 0.3} A${h * 0.3} ${h * 0.3} 0 0 1 ${h * 0.3} 0 Z`}
          fill={fill} stroke={stroke ?? "none"} strokeWidth={stroke ? Math.max(2, size * 0.045) : 0} strokeDasharray={dash ? `${size * 0.12} ${size * 0.09}` : undefined}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: iconOpacity }}>
        <Icon kind={icon} color={iconColor} size={size * 0.6} />
      </div>
    </div>
  );
};

// ── the offsite bubble (the human's: cream) ───────────────────────────────
const TENT_FROM: V3 = [HUMAN_HOME[0], HUMAN_HOME[1] + 1.55, HUMAN_HOME[2]];

const TentBubble: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  if (t < EV.stand + 0.1 || t > EV.dissolve + 1.6) return null;
  const travel = EASE(clamp01((t - EV.tent - 0.35) / 2.4));
  const p: V3 = [lerp(TENT_FROM[0], TENT[0], travel), lerp(TENT_FROM[1], TENT[1], travel) + 0.08 * Math.sin(t * 1.6), lerp(TENT_FROM[2], TENT[2], travel)];
  const [x, y] = at(p, cam);
  const born = springAt(t, EV.stand + 0.1, 11, 220);
  const grow = springAt(t, EV.grow, 10, 160);
  const size = (60 + 92 * grow) * (1 + 0.07 * beat(t) * (t < EV.drain1 ? 1 : 0)) * Math.max(0, born);
  const hollow = EASE(clamp01((t - EV.hollow) / 0.6));
  const gone = clamp01((t - EV.dissolve) / 0.35);
  const dotsPhase = Math.floor(t * 4) % 3;
  if (gone < 1) {
    return (
      <Bubble x={x} y={y} size={size} fill={`rgba(255,244,236,${0.96 * (1 - hollow * 0.92)})`} stroke={hollow > 0.02 ? C.cream : undefined}
        dash={hollow > 0.3} icon={t < EV.tent ? "dots" : "tent"} iconColor={hollow > 0.5 ? C.cream : C.ink}
        iconOpacity={(t < EV.tent ? [1, 0.6, 0.3][dotsPhase] : 1) * (1 - 0.6 * hollow)} opacity={(1 - gone) * clamp01(born * 2)} />
    );
  }
  // dissolve into particles
  const q = clamp01((t - EV.dissolve - 0.35) / 1.2);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 46 }, (_, i) => {
        const a = rand(i + 7) * Math.PI * 2;
        const d = (40 + rand(i + 8) * 170) * EASE_OUT(q);
        const rise = -60 * q * rand(i + 9);
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.8 + rise} r={2 + rand(i + 10) * 4} fill={C.cream} opacity={(1 - q) * 0.9} />;
      })}
    </svg>
  );
};

// ── the agents' messages (orange) ─────────────────────────────────────────
const msgIcon = (m: Msg, i: number) => {
  if (m.k === "tower") return ["pin", "cal", "board", "tent"][i % 4];
  if (m.k === "heart") return i % 2 === 0 ? "heart" : "thumb";
  return m.k;
};

/** Where a message is at time te (world). Messages in the tower stay in their slot. */
const msgPos = (m: Msg, te: number): V3 | null => {
  const p = (te - m.t) / FLIGHT;
  if (p < 0) return null;
  const from = orbTop(m.a, m.t);
  if (m.k === "tower") {
    const slot = L2W(towerSlot(towerIndex(m)));
    return arc(from, slot, EASE_OUT(clamp01(p)), 0.8);
  }
  if (p > 1) return null;
  return arc(from, orbTop(m.b, te), EASE(p), 1.2);
};

const Messages: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const out: React.ReactNode[] = [];
  TL.msgs.forEach((m, i) => {
    if (m.t > t) return;
    // "a media frase": in flight when the money runs out / the cap is hit → freeze and fade
    const stop = m.k === "dots" ? (m.t < EV.drain1 ? EV.drain1 : EV.cap) : Infinity;
    const te = Math.min(t, stop);
    let fade = t > stop ? 1 - clamp01((t - stop) / 0.6) : 1;
    if (m.k === "tower") fade = 1 - clamp01((t - EV.drain1 - towerIndex(m) * 0.015) / 0.5);
    if (fade <= 0) return;
    const pNow = (te - m.t) / FLIGHT;
    if (m.k !== "tower" && pNow > 1) return;
    const land = m.k === "tower" ? 1 : 1 - clamp01((pNow - 0.82) / 0.18);
    const birth = clamp01((te - m.t) / 0.12);
    const icon = msgIcon(m, i);
    const flatter = m.k === "heart";
    const size = (m.k === "tower" ? 40 : 60) * (0.5 + 0.5 * birth) * (0.6 + 0.4 * land);
    const moving = m.k !== "tower" || pNow < 1;
    // ghost copies behind fast movers (motion blur)
    const ghosts = moving ? [0.05, 0.1, 0.15] : [];
    [...ghosts.reverse(), 0].forEach((lag, g) => {
      const pos = msgPos(m, Math.max(m.t, te - lag));
      if (!pos) return;
      const [x, y] = project(pos, cam);
      const bob = m.k === "tower" && pNow >= 1 ? Math.sin(t * 2 + i) * 3 : 0;
      out.push(
        <Bubble key={`${i}-${g}`} x={x} y={y + bob} size={size} fill={flatter ? C.ink : C.orange} stroke={flatter ? C.orange : undefined}
          icon={icon} iconColor={flatter ? C.cream : C.ink} opacity={fade * (lag === 0 ? 1 : 0.32 - lag * 1.4)} blur={lag * 30}
          iconOpacity={m.k === "dots" && t > stop ? 0.5 : 1} />,
      );
    });
  });
  return <>{out}</>;
};

// ── E5: the counter inside a clock ring ───────────────────────────────────
const Counter: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, EV.tower - 0.1, S.E6 + 0.05, 0.3, 0.3);
  if (o <= 0) return null;
  const p = clamp01((t - EV.tower) / (EV.count1 - EV.tower));
  const n = Math.floor(150 * EASE_IN(p) * 0.4 + 150 * p * 0.6);
  const done = p >= 1;
  const hand = EASE(p) * 720;
  const pop = done ? 1 + 0.15 * Math.sin(Math.PI * clamp01((t - EV.count1) / 0.3)) : 1;
  const R = 92;
  return (
    <div style={{ position: "absolute", left: 70, top: HUD_Y + 40, width: 260, height: 260, opacity: o, scale: String(0.85 + 0.15 * o) }}>
      <svg width={260} height={260} style={{ position: "absolute", inset: 0 }}>
        <circle cx={130} cy={130} r={R + 26} fill="rgba(20,17,15,0.82)" />
        <circle cx={130} cy={130} r={R} fill="none" stroke="rgba(255,244,236,0.16)" strokeWidth={8} />
        <circle cx={130} cy={130} r={R} fill="none" stroke={C.orange} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * R * ((hand % 360) / 360 || (done ? 1 : 0))} 999`} transform="rotate(-90 130 130)"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,107,26,0.8))" }} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={130 + Math.cos(a) * (R + 14)} y1={130 + Math.sin(a) * (R + 14)} x2={130 + Math.cos(a) * (R + 20)} y2={130 + Math.sin(a) * (R + 20)} stroke="rgba(255,244,236,0.5)" strokeWidth={3} />;
        })}
        <line x1={130} y1={130} x2={130 + Math.sin((hand * Math.PI) / 180) * (R - 14)} y2={130 - Math.cos((hand * Math.PI) / 180) * (R - 14)} stroke={C.cream} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 84, textAlign: "center", fontFamily: TITLE, fontWeight: 800, fontSize: 70, color: done ? C.orange : C.cream, scale: String(pop), textShadow: done ? "0 0 24px rgba(255,107,26,0.7)" : "none" }}>
        {n}{done ? "+" : ""}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center" }}><Micro size={17}>MENSAJES</Micro></div>
    </div>
  );
};

/** Horizontal bar used by the credits (E6) and the budget (E10). */
const Bar: React.FC<{ t: number; label: string; value: string; fill: number; o: number; cap?: number; capHit?: number; sparks?: boolean; flicker?: boolean }> = ({
  t, label, value, fill, o, cap, capHit = 0, sparks, flicker,
}) => {
  const W = 760;
  const x0 = (1080 - W) / 2;
  const fx = x0 + W * fill;
  const fl = flicker ? 0.55 + 0.45 * Math.sign(Math.sin(t * 40)) : 1;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: x0, top: HUD_Y + 44, width: W, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Micro size={22}>{label}</Micro>
        <span style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 44, color: C.cream }}>{value}</span>
      </div>
      <div style={{
        position: "absolute", left: x0 - 8, top: HUD_Y + 104, width: W + 16, height: 40, borderRadius: 20, background: "rgba(20,17,15,0.85)",
        border: "1.5px solid rgba(255,244,236,0.18)", translate: `0px ${capHit * 4 * Math.sin(t * 90)}px`,
      }} />
      <div style={{
        position: "absolute", left: x0, top: HUD_Y + 112, width: Math.max(0, W * fill), height: 24, borderRadius: 12, background: C.orange,
        boxShadow: `0 0 ${18 + 20 * beat(t)}px rgba(255,107,26,0.8)`, opacity: fl,
      }} />
      {cap !== undefined && (
        <>
          <div style={{
            position: "absolute", left: x0 + W * cap - 3, top: HUD_Y + 92, width: 6, height: 64, borderRadius: 3, background: C.cream,
            boxShadow: `0 0 ${14 + 40 * capHit}px rgba(255,244,236,${0.6 + 0.4 * capHit})`, scale: `1 ${1 + 0.35 * capHit}`,
          }} />
          <div style={{ position: "absolute", left: x0 + W * cap - 60, top: HUD_Y + 164, width: 120, textAlign: "center" }}>
            <Micro size={18} color={C.cream}>TOPE</Micro>
          </div>
        </>
      )}
      {sparks && fill > 0.005 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {Array.from({ length: 14 }, (_, i) => {
            const life = ((t * 2.2 + rand(i + 3)) % 1);
            const a = -Math.PI / 2 + (rand(i + Math.floor(t * 2.2 + rand(i + 3)) * 13) - 0.5) * 2.4;
            const d = 10 + life * 70;
            return <circle key={i} cx={fx + Math.cos(a) * d} cy={HUD_Y + 124 + Math.sin(a) * d + life * life * 40} r={2.5 * (1 - life) + 1} fill={i % 3 ? C.orangeSoft : C.cream} opacity={1 - life} />;
          })}
        </svg>
      )}
    </div>
  );
};

const Credits: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, S.E6 - 0.05, S.E7 + 0.1, 0.3, 0.35);
  if (o <= 0) return null;
  const p = EASE_IN(clamp01((t - EV.drain0) / (EV.drain1 - EV.drain0)));
  const left = 30 * (1 - p);
  return <Bar t={t} label="CRÉDITOS" value={`${Math.ceil(left - 1e-6)} $`} fill={1 - p} o={o} sparks={p > 0 && p < 1} flicker={p >= 1} />;
};

const Budget: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, EV.meter - 0.25, S.E11 + 0.05, 0.3, 0.3);
  if (o <= 0) return null;
  const CAP = 0.8;
  const p = clamp01((t - EV.meter) / (EV.cap - EV.meter));
  const fill = CAP * (0.15 + 0.85 * EASE_IN(p));
  const hit = Math.max(0, 1 - (t - EV.cap) / 0.35) * (t >= EV.cap ? 1 : 0);
  return <Bar t={t} label="PRESUPUESTO" value={t >= EV.cap ? "TOPE" : `${Math.round(fill * 100)} %`} fill={fill} o={o} cap={CAP} capHit={hit} />;
};

// ── E9: turn tokens dealt to the orbs, then spent on flattery ─────────────
const Tokens: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  if (t < EV.deal || t > S.E10 + 0.5) return null;
  const hand = humanAt(t).p;
  const [hx, hy] = at([hand[0], HUMAN_CENTRE[1] + 1.0, hand[2]], cam);
  const out: React.ReactNode[] = [];
  const spent = (k: number) => TL.msgs.filter((m) => m.k === "heart" && m.a === k && m.t <= t).length;
  for (let k = 0; k < 5; k++) {
    const p = orbAt(k, t);
    const [ox, oy] = at([p[0], p[1] + ORB_SIZE[k] + 0.15, p[2]], cam);
    for (let j = 0; j < 3; j++) {
      if (j < spent(k)) continue;
      const a = EV.deal + 0.1 + (k * 3 + j) * 0.06;
      const q = EASE_OUT(clamp01((t - a) / 0.45));
      if (t < a) continue;
      const tx = ox + 44;
      const ty = oy - j * 14;
      const x = lerp(hx, tx, q);
      const y = lerp(hy, ty, q) - Math.sin(Math.PI * q) * 90;
      out.push(
        <div key={`${k}${j}`} style={{
          position: "absolute", left: x - 21, top: y - 10, width: 42, height: 20, borderRadius: "50%", background: C.cream,
          border: `2.5px solid ${C.ink}`, boxShadow: "0 0 16px rgba(255,244,236,0.7)",
        }} />,
      );
    }
  }
  return <>{out}</>;
};

// ── E10: the supervision lens over the group ──────────────────────────────
const Lens: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.lens - 0.1, S.E11 + 0.1, 0.35, 0.35);
  if (o <= 0) return null;
  const [cx, cy] = at([CTR[0], CTR[1] + 1.0 + 1.3, CTR[2]], cam);
  const s = springAt(t, EV.lens - 0.1, 12, 140);
  const sweep = (t - EV.lens) * 1.6;
  const x = cx + Math.sin(sweep) * 150;
  const y = cy + Math.sin(sweep * 2) * 40 - 20;
  const R = 175 * s;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
      <defs>
        <radialGradient id="lensfill">
          <stop offset="0%" stopColor="rgba(255,244,236,0.0)" />
          <stop offset="85%" stopColor="rgba(255,244,236,0.06)" />
          <stop offset="100%" stopColor="rgba(255,244,236,0.18)" />
        </radialGradient>
      </defs>
      <line x1={x + R * 0.72} y1={y + R * 0.72} x2={x + R * 1.25} y2={y + R * 1.25} stroke={C.cream} strokeWidth={16} strokeLinecap="round" />
      <circle cx={x} cy={y} r={R} fill="url(#lensfill)" stroke={C.cream} strokeWidth={7} style={{ filter: "drop-shadow(0 0 14px rgba(255,244,236,0.45))" }} />
      <path d={`M ${x - R * 0.55} ${y - R * 0.45} A ${R * 0.75} ${R * 0.75} 0 0 1 ${x - R * 0.1} ${y - R * 0.7}`} stroke="rgba(255,244,236,0.6)" strokeWidth={5} fill="none" strokeLinecap="round" />
    </svg>
  );
};

/** The drop: one orange flash from the office. */
const DropFlash: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const q = (t - EV.drop) / 0.45;
  if (q < 0 || q > 1) return null;
  const [x, y] = at([TENT[0], TENT[1] - 1.2, TENT[2]], cam);
  return (
    <div style={{
      position: "absolute", inset: 0, opacity: 0.55 * (1 - EASE_OUT(q)),
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,176,102,0.9) 0%, rgba(255,107,26,0.45) 22%, rgba(255,107,26,0) 60%)`,
    }} />
  );
};

export const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    <DropFlash t={t} cam={cam} />
    <Lens t={t} cam={cam} />
    <TentBubble t={t} cam={cam} />
    <Messages t={t} cam={cam} />
    <Tokens t={t} cam={cam} />
    <Counter t={t} />
    <Credits t={t} />
    <Budget t={t} />
  </>
);
