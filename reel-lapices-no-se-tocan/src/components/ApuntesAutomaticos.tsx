import React from "react";
import { AbsoluteFill } from "remotion";
import { C, EASE, EV, MONO, S, clamp01, ramp, springAt } from "../theme";

const CARDS = [
  { label: "CITAS", icon: "calendario", at: "citas" },
  { label: "PEDIDOS", icon: "caja", at: "pedidos" },
  { label: "FACTURAS", icon: "documento", at: "facturas" },
] as const;
const X = 160;
const W = 760;
const H = 170;
const Y0 = 400;
const STEP = 230;
const HOP = 0.4; // pulse: one card every 0.4 s (matches the sfx in build.py)

const Icon: React.FC<{ kind: string; col: string }> = ({ kind, col }) => {
  const p = { fill: "none", stroke: col, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "calendario") {
    return (
      <g {...p}>
        <rect x={-38} y={-30} width={76} height={66} rx={8} /><path d="M-38 -10 H38 M-20 -40 V-22 M20 -40 V-22" />
        {[-18, 0, 18].map((x) => [8, 22].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={2.5} fill={col} stroke="none" />))}
      </g>
    );
  }
  if (kind === "caja") {
    return <g {...p}><path d="M0 -38 L36 -20 V22 L0 40 L-36 22 V-20 Z" /><path d="M-36 -20 L0 -2 L36 -20 M0 -2 V40" /></g>;
  }
  return <g {...p}><path d="M-30 -40 H14 L32 -22 V40 H-30 Z" /><path d="M14 -40 V-22 H32" /><path d="M-16 -4 H18 M-16 12 H18 M-16 28 H4" /></g>;
};

/** A plain pencil pictogram: "done by hand". */
const PencilGlyph: React.FC<{ col: string }> = ({ col }) => (
  <g transform="rotate(-35)" fill="none" stroke={col} strokeWidth={5} strokeLinejoin="round">
    <rect x={-10} y={-44} width={20} height={64} rx={2} />
    <path d="M-10 20 L0 42 L10 20" />
    <path d="M-4 33 L0 42 L4 33" fill={col} />
  </g>
);

/**
 * Scenes 6-7: "cosas que se hacen a lápiz: citas, pedidos, facturas" — three cards, each marked with a
 * grey pencil; on "hacemos que se hagan solas" the pencils go, the cards link up and an orange pulse
 * runs through them on its own.
 */
export const ApuntesAutomaticos: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.sweep || t >= S.S7 + 0.05) return null;
  const auto = ramp(t, EV.auto, EV.auto + 0.4);
  const running = t >= EV.auto + 0.35;
  const k = Math.floor((t - EV.auto - 0.35) / HOP);
  const at = ((k % 3) + 3) % 3;
  const local = (t - EV.auto - 0.35 - k * HOP) / HOP;
  // slow continuous push-in across both scenes, so the board is never still
  const push = 1 + 0.05 * ramp(t, EV.sweep, EV.auto, (x) => x) + 0.04 * ramp(t, EV.auto, S.S7, EASE);
  return (
    <AbsoluteFill style={{ background: "#050505" }}>
      <AbsoluteFill style={{
        backgroundImage: "radial-gradient(rgba(138,138,138,0.22) 1.6px, transparent 1.8px)", backgroundSize: "40px 40px",
        opacity: 0.8 * ramp(t, EV.sweep, EV.sweep + 0.5),
      }} />
      <AbsoluteFill style={{ scale: String(push), transformOrigin: "540px 640px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {/* links between the cards, drawn when the automation starts */}
          {[0, 1].map((i) => {
            const y1 = Y0 + i * STEP + H;
            const y2 = Y0 + (i + 1) * STEP;
            const d = ramp(t, EV.auto + i * 0.12, EV.auto + 0.3 + i * 0.12);
            return <line key={i} x1={X + 95} y1={y1} x2={X + 95} y2={y1 + (y2 - y1) * d} stroke={C.orange} strokeWidth={4} strokeLinecap="round" />;
          })}
          {CARDS.map((c, i) => {
            const y = Y0 + i * STEP;
            const slot = ramp(t, EV.sweep + 0.25 + i * 0.12, EV.sweep + 0.55 + i * 0.12);
            const sp = springAt(t, EV[c.at], 13, 190);
            const filled = t >= EV[c.at];
            const since = running ? (((t - EV.auto - 0.35) % (3 * HOP)) + 3 * HOP - i * HOP) % (3 * HOP) : 99;
            const lit = running && t - EV.auto - 0.35 >= i * HOP ? Math.exp(-since / 0.3) : 0;
            const done = running && t - EV.auto - 0.35 >= i * HOP;
            return (
              <g key={c.label}>
                {/* empty dashed slot first, then the card springs in on its word */}
                <rect x={X} y={y} width={W} height={H} rx={26} fill="none" stroke={C.grey} strokeOpacity={0.45 * slot * (filled ? 0 : 1)}
                  strokeWidth={3} strokeDasharray="10 12" />
                {filled && (
                  <g transform={`translate(${X + W / 2} ${y + H / 2}) scale(${0.85 + 0.15 * Math.min(1.05, sp)}) translate(${-(X + W / 2)} ${-(y + H / 2)})`} opacity={clamp01(sp * 1.6)}>
                    <rect x={X} y={y} width={W} height={H} rx={26} fill="#0e0a08" stroke={lit > 0.2 || (done && lit > 0.05) ? C.orange : C.grey}
                      strokeOpacity={lit > 0.2 ? 1 : 0.6} strokeWidth={4} />
                    {lit > 0.02 && <rect x={X - 10} y={y - 10} width={W + 20} height={H + 20} rx={34} fill="none" stroke={C.orange} strokeOpacity={lit * 0.5} strokeWidth={3} />}
                    <g transform={`translate(${X + 95} ${y + H / 2})`}><Icon kind={c.icon} col={lit > 0.25 ? C.orange : C.white} /></g>
                    <text x={X + 185} y={y + H / 2 + 14} fontFamily={MONO} fontWeight={700} fontSize={42} letterSpacing={5} fill={C.white}>{c.label}</text>
                    {/* by hand (grey pencil) → automated (orange check) */}
                    <g transform={`translate(${X + W - 80} ${y + H / 2})`} opacity={1 - auto}><PencilGlyph col={C.grey} /></g>
                    <g transform={`translate(${X + W - 80} ${y + H / 2}) scale(${Math.max(0.001, springAt(t, EV.auto + 0.35 + i * HOP, 12, 220))})`}>
                      <circle r={30} fill={C.orange} opacity={done ? 1 : 0} />
                      <path d="M-13 1 L-4 10 L14 -10" fill="none" stroke="#050505" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={done ? 1 : 0} />
                    </g>
                  </g>
                )}
              </g>
            );
          })}
          {running && (() => {
            const y1 = Y0 + at * STEP + H / 2;
            const y2 = Y0 + ((at + 1) % 3) * STEP + H / 2;
            const p = at === 2 ? 0 : EASE(clamp01(local * 1.25));
            const y = y1 + (y2 - y1) * p;
            return (
              <g>
                <circle cx={X + 95} cy={y} r={58} fill={C.orange} opacity={0.12} />
                <circle cx={X + 95} cy={y} r={12} fill={C.orangeSoft} opacity={at === 2 ? 1 - local : 1} />
              </g>
            );
          })()}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
