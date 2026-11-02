import React from "react";
import { C, UI } from "../theme";

export const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: C.tile, border: `3px solid ${C.border}`, borderRadius: 18, boxSizing: "border-box", ...style }}>{children}</div>
);

export const Btn: React.FC<{ x: number; y: number; w: number; h: number; label: string; pressed?: boolean; dark?: boolean; size?: number }> = ({ x, y, w, h, label, pressed, dark = true, size = 34 }) => (
  <div style={{ position: "absolute", left: x, top: y + (pressed ? 4 : 0), width: w, height: h, borderRadius: 14, background: dark ? C.ink : C.tile, color: dark ? C.tile : C.ink,
    border: dark ? "none" : `3px solid ${C.ink}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: size, letterSpacing: "0.06em",
    boxShadow: pressed ? "none" : `0 6px 0 ${dark ? "#000" : C.border}`, opacity: pressed ? 0.92 : 1 }}>{label}</div>
);

export const Cross: React.FC<{ x: number; y: number; w: number; h: number; p: number; width?: number }> = ({ x, y, w, h, p, width = 10 }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: x, top: y }}>
    <line x1={8} y1={8} x2={8 + (w - 16) * Math.min(1, p * 2)} y2={8 + (h - 16) * Math.min(1, p * 2)} stroke={C.orange} strokeWidth={width} strokeLinecap="round" />
    {p > 0.5 && <line x1={w - 8} y1={8} x2={w - 8 - (w - 16) * Math.min(1, (p - 0.5) * 2)} y2={8 + (h - 16) * Math.min(1, (p - 0.5) * 2)} stroke={C.orange} strokeWidth={width} strokeLinecap="round" />}
  </svg>
);

export const BarLines: React.FC<{ x: number; y: number; w: number; n?: number; color?: string; gap?: number; h?: number }> = ({ x, y, w, n = 3, color = C.border, gap = 22, h = 12 }) => (
  <>
    {Array.from({ length: n }, (_, i) => <div key={i} style={{ position: "absolute", left: x, top: y + i * gap, width: w * (i === n - 1 ? 0.6 : 1), height: h, borderRadius: h / 2, background: color }} />)}
  </>
);

export const Check: React.FC<{ size: number; p?: number; ring?: boolean }> = ({ size, p = 1, ring = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {ring && <circle cx={50} cy={50} r={44} fill={C.orange} />}
    <path d="M28 52 L45 69 L74 33" fill="none" stroke={C.tile} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={90} strokeDashoffset={90 * (1 - p)} />
  </svg>
);
