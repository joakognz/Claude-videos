import React from "react";
import { spring } from "remotion";
import { C, FPS, S, SANS, TL, clamp01, EASE, EASE_OUT, drift } from "../theme";
import { IconBell, IconBox, IconCard, IconCheck, IconMug, IconReceipt, IconSpark } from "./Icons";

const CARD_W = 610;
const CARD_H = 140;
const NODES = [
  { label: "Pregunta entendida", Icon: IconSpark, cap: "E7" },
  { label: "Catálogo y stock en tiempo real", Icon: IconBox, cap: "E8" },
  { label: "Producto recomendado", Icon: IconMug, cap: "E9" },
  { label: "Pedido creado", Icon: IconReceipt, cap: "E10" },
  { label: "Enlace de pago enviado", Icon: IconCard, cap: "E11" },
  { label: "Tienda avisada para el envío", Icon: IconBell, cap: "E12" },
].map((n, i) => ({
  ...n,
  cx: i % 2 === 0 ? 625 : 670,
  cy: 584 + i * 182,
  at: TL.captions[n.cap].start,
}));

type Pt = [number, number];
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, u: number): Pt => {
  const v = 1 - u;
  return [
    v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
    v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1],
  ];
};
const badge = (i: number): Pt => [NODES[i].cx - CARD_W / 2 + 62, NODES[i].cy];

// segment 0 starts at the opened phone, then one segment per pair of nodes
const SEGMENTS = NODES.map((n, i) => {
  const p3 = badge(i);
  const p0: Pt = i === 0 ? [270, 940] : badge(i - 1);
  const p1: Pt = i === 0 ? [360, 780] : [p0[0] - 70, p0[1] + 80];
  const p2: Pt = i === 0 ? [p3[0] - 120, p3[1]] : [p3[0] - 70, p3[1] - 80];
  let len = 0;
  let prev = p0;
  for (let k = 1; k <= 30; k++) {
    const q = bez(p0, p1, p2, p3, k / 30);
    len += Math.hypot(q[0] - prev[0], q[1] - prev[1]);
    prev = q;
  }
  return { p0, p1, p2, p3, len, d: `M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`, end: n.at, begin: n.at - 0.45 };
});

/** E6-E13: six automation nodes linked by a travelling line of green light. */
export const Flow: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  if (t < S.E6 || t > S.E13 + 0.8) return null;
  const gather = EASE(clamp01((t - S.E13) / 0.55));
  const camY = -drift(t, 31, 10) - (gather > 0 ? 0 : 0);
  return (
    <div style={{ position: "absolute", inset: 0, translate: `0px ${camY}px` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - gather }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {SEGMENTS.map((s, i) => {
          const baseIn = EASE_OUT(clamp01((t - (S.E6 + 0.4 + i * 0.08)) / 0.5));
          const p = EASE(clamp01((t - s.begin) / (s.end - s.begin)));
          const head = bez(s.p0, s.p1, s.p2, s.p3, p);
          return (
            <g key={i}>
              <path d={s.d} stroke="rgba(61,220,151,0.22)" strokeWidth={4} fill="none" strokeDasharray="2 12" strokeLinecap="round" opacity={baseIn} />
              {p > 0 && (
                <path d={s.d} stroke={C.accent} strokeWidth={6} fill="none" strokeLinecap="round" filter="url(#glow)"
                  strokeDasharray={s.len} strokeDashoffset={s.len * (1 - p)} opacity={0.75 + 0.25 * Math.sin(t * 5 + i)} />
              )}
              {p > 0 && p < 1 && <circle cx={head[0]} cy={head[1]} r={13} fill="#e4fff2" filter="url(#glow)" />}
            </g>
          );
        })}
      </svg>
      {NODES.map((n, i) => {
        const appear = EASE_OUT(clamp01((t - (S.E6 + 0.35 + i * 0.09)) / 0.6));
        const lit = spring({ frame: frame - n.at * FPS, fps: FPS, config: { damping: 9, stiffness: 160, mass: 0.7 } });
        const on = clamp01(lit);
        const pulse = on * (0.5 + 0.5 * Math.sin(t * 4 + i * 1.3));
        const x = n.cx + (1 - appear) * 90 + (540 - n.cx) * gather;
        const y = n.cy + drift(t, i + 40, 6) + (900 - n.cy) * gather;
        const Icon = n.Icon;
        return (
          <div key={i} style={{
            position: "absolute", left: x - CARD_W / 2, top: y - CARD_H / 2, width: CARD_W, height: CARD_H,
            borderRadius: 30, display: "flex", alignItems: "center", gap: 22, padding: "0 26px",
            background: on > 0 ? `rgba(12,48,34,${0.78 + 0.14 * on})` : "rgba(12,36,29,0.72)",
            border: `2px solid rgba(61,220,151,${0.22 + 0.78 * on})`,
            boxShadow: `0 0 ${20 + 30 * pulse}px rgba(61,220,151,${0.12 + 0.3 * pulse}), 0 20px 40px rgba(0,0,0,0.35)`,
            opacity: appear * (0.5 + 0.5 * on) * (1 - gather), scale: String((0.96 + 0.04 * lit) * (1 - 0.7 * gather)),
            filter: `blur(${(1 - appear) * 10 + gather * 18}px)`, fontFamily: SANS,
          }}>
            <div style={{
              width: 76, height: 76, borderRadius: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: on > 0.5 ? "rgba(61,220,151,0.16)" : "rgba(255,255,255,0.05)",
              border: `2px solid rgba(61,220,151,${0.25 + 0.75 * on})`,
            }}>
              <Icon size={44} color={on > 0.5 ? C.accent : "rgba(255,255,255,0.55)"} stroke={1.9} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: 2, color: on > 0.5 ? C.accent : "rgba(255,255,255,0.4)" }}>
                PASO {i + 1}
              </div>
              <div style={{ fontWeight: 800, fontSize: 34, lineHeight: 1.12, color: C.white, opacity: 0.55 + 0.45 * on }}>{n.label}</div>
            </div>
            <div style={{
              width: 46, height: 46, borderRadius: 46, background: C.accent, display: "flex", alignItems: "center",
              justifyContent: "center", scale: String(Math.max(0, lit)), opacity: on,
            }}>
              <IconCheck size={30} color={C.ink} stroke={3} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
