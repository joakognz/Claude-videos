import React from "react";
import { C, MONO, UI, rnd } from "../theme";

export const TAB_X = (i: number, n: number) => (1080 / n) * i + 1080 / n / 2;

/** Decorative top bar: REC dot, analog clock (no numerals), mic level. Sits in the top strip, informative content stays out of it. */
export const StatusBar: React.FC<{ t: number; rec: boolean }> = ({ t, rec }) => {
  const blink = Math.floor(t * 1.8) % 2 === 0;
  const hand = (Math.floor(t * 2) % 60) * 6;
  const lvl = [0, 1, 2, 3, 4].map((i) => 10 + rnd(Math.floor(t * 10) + i * 5) * 34);
  return (
    <div style={{ position: "absolute", left: 0, top: 70, width: 1080, height: 100 }}>
      <div style={{ position: "absolute", left: 50, top: 28, display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontWeight: 700, fontSize: 36, color: C.ink }}>
        <span style={{ width: 26, height: 26, borderRadius: 13, background: rec && blink ? C.orange : C.border }} />
        REC
      </div>
      <svg width={90} height={90} style={{ position: "absolute", left: 495, top: 4 }} viewBox="-50 -50 100 100">
        <circle r={42} fill={C.tile} stroke={C.ink} strokeWidth={5} />
        <line x1={0} y1={0} x2={0} y2={-26} stroke={C.ink} strokeWidth={5} strokeLinecap="round" transform="rotate(40)" />
        <line x1={0} y1={0} x2={0} y2={-34} stroke={C.orange} strokeWidth={3} strokeLinecap="round" transform={`rotate(${hand})`} />
        <circle r={4} fill={C.ink} />
      </svg>
      <div style={{ position: "absolute", right: 56, top: 14, display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
        <svg width={34} height={54} viewBox="0 0 34 54"><rect x={10} y={2} width={14} height={28} rx={7} fill={C.ink} /><path d="M3 24a14 14 0 0 0 28 0M17 38v12" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" /></svg>
        {lvl.map((h, i) => <i key={i} style={{ display: "block", width: 8, height: h, background: C.ink, borderRadius: 2 }} />)}
      </div>
    </div>
  );
};

export const TAB_SETS: Record<string, { tabs: string[]; active: number }> = {
  hook: { tabs: ["NOTICIA", "CORREO", "LLAMADA", "HOJA"], active: 2 },
  noexistia: { tabs: ["NOTICIA", "CORREO", "LLAMADA", "HOJA"], active: 2 },
  policia: { tabs: ["NOTICIA", "CORREO", "LLAMADA", "HOJA"], active: 0 },
  correo: { tabs: ["NOTICIA", "CORREO", "LLAMADA", "HOJA"], active: 1 },
  duda: { tabs: ["NOTICIA", "CORREO", "LLAMADA", "HOJA"], active: 1 },
  lobby: { tabs: ["NOTICIA", "CORREO", "LLAMADA", "HOJA"], active: 2 },
  llamada: { tabs: ["NOTICIA", "CORREO", "LLAMADA", "HOJA"], active: 2 },
  dinero: { tabs: ["NOTICIA", "CORREO", "LLAMADA", "HOJA"], active: 3 },
  tiempo: { tabs: ["NOTICIA", "CORREO", "LLAMADA", "HOJA"], active: 3 },
  anonimo: { tabs: ["NOTICIA", "CORREO", "LLAMADA", "HOJA"], active: 2 },
  leccion1: { tabs: ["PAGOS", "VERIFICAR"], active: 0 },
  leccion2: { tabs: ["PAGOS", "VERIFICAR"], active: 1 },
  cta: { tabs: ["COMENTARIOS"], active: 0 },
  crt: { tabs: ["COMENTARIOS"], active: 0 },
};

export const TabStrip: React.FC<{ id: string }> = ({ id }) => {
  const set = TAB_SETS[id] ?? TAB_SETS.hook;
  return (
    <div style={{ position: "absolute", left: 0, top: 255, width: 1080, height: 70, background: C.tile, borderBottom: `3px solid ${C.border}`, display: "flex" }}>
      {set.tabs.map((n, i) => (
        <div key={n} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 600, fontSize: 26, letterSpacing: "0.08em",
          color: i === set.active ? C.ink : C.mid, background: i === set.active ? C.room : C.tile, borderRight: `2px solid ${C.border}`, borderBottom: i === set.active ? `5px solid ${C.ink}` : "none", boxSizing: "border-box" }}>
          {n}
        </div>
      ))}
    </div>
  );
};

/** Cursor arrow with an optional click ring */
export const Cursor: React.FC<{ x: number; y: number; click?: number }> = ({ x, y, click = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
    {click > 0 && click < 1 && (
      <div style={{ position: "absolute", left: -50 * click - 8, top: -50 * click - 8, width: 100 * click + 16, height: 100 * click + 16, borderRadius: "50%", border: `5px solid ${C.ink}`, opacity: 1 - click, boxSizing: "border-box" }} />
    )}
    <svg width={56} height={70} viewBox="0 0 28 35" style={{ position: "absolute", left: -3, top: -2, transform: click > 0 && click < 0.4 ? "scale(0.88)" : undefined, transformOrigin: "3px 2px" }}>
      <path d="M3 2v26l7-7 5 11 5-2-5-11h10z" fill={C.ink} stroke={C.tile} strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  </div>
);
