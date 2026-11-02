import React from "react";
import { AbsoluteFill } from "remotion";
import { C, EASE, EV, S, clamp01, ramp, springAt } from "../theme";

const BOX = 230;
const NODES = [
  { x: 300, y: 520, icon: "sobre" },
  { x: 780, y: 520, icon: "documento" },
  { x: 780, y: 940, icon: "engranaje" },
  { x: 300, y: 940, icon: "campana" },
] as const;
const HOP = 0.55; // one box every 0.55 s (matches the "pulse" sfx in build.py)
const DWELL = 0.15;

const Icon: React.FC<{ kind: string; col: string }> = ({ kind, col }) => {
  const p = { fill: "none", stroke: col, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "sobre":
      return <g {...p}><rect x={-56} y={-38} width={112} height={76} rx={8} /><path d="M-52 -32 L0 8 L52 -32" /></g>;
    case "documento":
      return <g {...p}><path d="M-40 -52 H20 L42 -30 V52 H-40 Z" /><path d="M20 -52 V-30 H42" /><path d="M-22 -8 H24 M-22 12 H24 M-22 32 H10" /></g>;
    case "engranaje":
      return (
        <g {...p}>
          <circle r={30} /><circle r={11} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return <path key={i} d={`M${Math.cos(a) * 34} ${Math.sin(a) * 34} L${Math.cos(a) * 50} ${Math.sin(a) * 50}`} strokeWidth={12} />;
          })}
        </g>
      );
    default:
      return <g {...p}><path d="M-36 26 C-30 16 -30 6 -30 -8 C-30 -32 -16 -46 0 -46 C16 -46 30 -32 30 -8 C30 6 30 16 36 26 Z" /><path d="M-10 38 C-6 46 6 46 10 38" /><path d="M0 -46 V-54" /></g>;
  }
};

/** Point along the connector from node i to node i+1 (box edge to box edge), p in 0..1. */
const along = (i: number, p: number) => {
  const a = NODES[i];
  const b = NODES[(i + 1) % 4];
  const dx = Math.sign(b.x - a.x);
  const dy = Math.sign(b.y - a.y);
  const ax = a.x + (dx * BOX) / 2;
  const ay = a.y + (dy * BOX) / 2;
  const bx = b.x - (dx * BOX) / 2;
  const by = b.y - (dy * BOX) / 2;
  return { x: ax + (bx - ax) * p, y: ay + (by - ay) * p };
};

/** Scene 6: a clean diagram of generic boxes; an orange pulse runs the chain on its own while "you" stay still in a corner. */
export const DiagramaAutomatico: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.sweep || t >= S.S7 + 0.05) return null;
  const k = Math.floor((t - EV.pulse0) / HOP);
  const local = t - EV.pulse0 - k * HOP;
  const running = t >= EV.pulse0;
  const at = ((k % 4) + 4) % 4;
  const travelling = running && local > DWELL;
  const pos = travelling ? along(at, EASE(clamp01((local - DWELL) / (HOP - DWELL)))) : NODES[at];
  const push = 1 + 0.05 * ramp(t, EV.mientras - 0.2, S.S7, EASE);
  const youRing = ramp(t, EV.tu - 0.05, EV.tu + 0.3);
  return (
    <AbsoluteFill style={{ background: "#050505" }}>
      <AbsoluteFill style={{
        backgroundImage: "radial-gradient(rgba(138,138,138,0.22) 1.6px, transparent 1.8px)", backgroundSize: "40px 40px",
        opacity: 0.8 * ramp(t, EV.sweep, EV.sweep + 0.5),
      }} />
      <AbsoluteFill style={{ scale: String(push), transformOrigin: "540px 760px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {NODES.map((_, i) => {
            const a = along(i, 0);
            const b = along(i, 1);
            const d = ramp(t, EV.sweep + 0.35 + i * 0.1, EV.sweep + 0.75 + i * 0.1);
            return <line key={i} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * d} y2={a.y + (b.y - a.y) * d} stroke={C.grey} strokeOpacity={0.55} strokeWidth={4} strokeDasharray="2 14" strokeLinecap="round" />;
          })}
          {/* the lit trail behind the pulse */}
          {travelling && (() => {
            const a = along(at, 0);
            return <line x1={a.x} y1={a.y} x2={pos.x} y2={pos.y} stroke={C.orange} strokeWidth={5} strokeLinecap="round" />;
          })()}
          {NODES.map((n, i) => {
            const sp = springAt(t, EV.sweep + 0.15 + i * 0.08, 13, 170);
            // glow right after the pulse arrives, fading over the hop
            const since = running ? (((t - EV.pulse0) % (4 * HOP)) + 4 * HOP - i * HOP) % (4 * HOP) : 99;
            const lit = running && t - EV.pulse0 >= i * HOP ? Math.exp(-since / 0.35) : 0;
            const col = lit > 0.25 ? C.orange : C.white;
            return (
              <g key={i} transform={`translate(${n.x} ${n.y}) scale(${Math.max(0.001, sp)})`} opacity={clamp01(sp * 1.4)}>
                <rect x={-BOX / 2} y={-BOX / 2} width={BOX} height={BOX} rx={30} fill="#0e0a08" stroke={lit > 0.25 ? C.orange : C.grey}
                  strokeOpacity={lit > 0.25 ? 1 : 0.6} strokeWidth={4} />
                {lit > 0.02 && <rect x={-BOX / 2 - 10} y={-BOX / 2 - 10} width={BOX + 20} height={BOX + 20} rx={38} fill="none" stroke={C.orange} strokeOpacity={lit * 0.5} strokeWidth={3} />}
                <Icon kind={n.icon} col={col} />
              </g>
            );
          })}
          {running && (
            <g>
              <circle cx={pos.x} cy={pos.y} r={26} fill={C.orange} opacity={0.25} />
              <circle cx={pos.x} cy={pos.y} r={12} fill={C.orangeSoft} />
            </g>
          )}
          {/* "you": a small faceless grey figure, still, in the corner */}
          <g transform="translate(948 1150)" opacity={ramp(t, EV.sweep + 0.6, EV.sweep + 1.0)}>
            <circle cx={0} cy={-46} r={22} fill={C.grey} fillOpacity={0.7} />
            <path d="M-40 26 C-40 -4 -24 -18 0 -18 C24 -18 40 -4 40 26 Z" fill={C.grey} fillOpacity={0.7} />
            {youRing > 0 && <circle cx={0} cy={-14} r={70} fill="none" stroke={C.orange} strokeOpacity={0.7 * youRing} strokeWidth={3} strokeDasharray="6 10" />}
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
