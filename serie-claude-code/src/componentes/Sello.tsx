/**
 * Sello «PASO N» (regla 6): cae de golpe en el centro (con su golpe de sonido y una sacudida), se queda un momento y
 * vuela a su hueco arriba a la derecha; cuando el paso se completa recibe su tick.
 */
import React from "react";
import { MONO, TITULO, TOP, clamp01, lerp, ramp } from "../tema";
import type { EscenaPlan } from "../tipos";
import { useEstilo } from "./estilo";

const GRANDE = { w: 560, h: 200, cx: 540, cy: 1010 };
const ESC_DOCK = 0.32;

/** Sacudida de pantalla tras cada golpe (px). */
export const sacudida = (pasos: NonNullable<EscenaPlan["paso"]>[], t: number) => {
  let x = 0, y = 0;
  for (const p of pasos) {
    const d = t - (p.t + 0.16);
    if (d < 0 || d > 0.4) continue;
    const a = Math.exp(-d * 11) * 16;
    x += a * Math.sin(d * 95);
    y += a * Math.cos(d * 77);
  }
  return { x, y };
};

const Tick: React.FC<{ d: number; p: number }> = ({ d, p }) => {
  const E = useEstilo();
  return (
    <div style={{ width: d, height: d, borderRadius: d / 2, background: E.acento, display: "flex", alignItems: "center", justifyContent: "center", scale: String(0.6 + 0.4 * Math.min(1, p * 1.4) + Math.sin(Math.min(1, p) * Math.PI) * 0.15), opacity: clamp01(p * 3), boxShadow: `0 0 20px ${E.acento}` }}>
      <svg width={d * 0.6} height={d * 0.6} viewBox="0 0 24 24"><path d="M4 12.5 L10 18 L20 6" stroke={E.oscuro} strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - clamp01(p * 1.5))} /></svg>
    </div>
  );
};

export const Sello: React.FC<{ n: number; t: number; at: number; completo: number; slot: number; slots: number; hasta: number }> = ({ n, t, at, completo, slot, slots, hasta }) => {
  const E = useEstilo();
  if (t < at || t > hasta + 0.3) return null;
  const caida = ramp(t, at, at + 0.16, (u) => u * u);
  const vuelo = ramp(t, at + 1.05, at + 1.45);
  // hueco en la fila superior derecha
  const dw = GRANDE.w * ESC_DOCK;
  const dockCx = 1020 - (slots - 1 - slot) * (dw + 16) - dw / 2;
  const dockCy = TOP + 38;
  const cx = lerp(GRANDE.cx, dockCx, vuelo), cy = lerp(GRANDE.cy, dockCy, vuelo);
  const s = lerp(lerp(2.3, 1, caida), ESC_DOCK, vuelo);
  const rot = lerp(lerp(-16, -7, caida), 0, vuelo);
  const salida = 1 - ramp(t, hasta, hasta + 0.3);
  const tick = clamp01((t - completo) / 0.35);
  return (
    <div style={{
      position: "absolute", left: cx - GRANDE.w / 2, top: cy - GRANDE.h / 2, width: GRANDE.w, height: GRANDE.h, scale: String(s), rotate: `${rot}deg`,
      opacity: caida * salida, borderRadius: 26, border: `9px solid ${E.acento}`, boxSizing: "border-box", background: vuelo > 0.5 ? E.oscuro : "rgba(8,8,8,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${60 * (1 - vuelo)}px ${E.acento}66`,
    }}>
      <div style={{ position: "absolute", inset: 10, borderRadius: 16, border: `3px solid ${E.acento}`, opacity: 0.8 }} />
      <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 118, letterSpacing: 4, color: E.acento, lineHeight: 1, display: "flex", alignItems: "baseline", gap: 26 }}>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 70, letterSpacing: 10 }}>PASO</span>{n}
      </div>
      {t >= completo && (
        <div style={{ position: "absolute", right: -46, top: -46 }}><Tick d={120} p={tick} /></div>
      )}
    </div>
  );
};

export const Sellos: React.FC<{ escenas: EscenaPlan[]; t: number; hasta: number }> = ({ escenas, t, hasta }) => {
  const pasos = escenas.filter((e) => e.paso).map((e) => e.paso!);
  return (
    <>
      {pasos.map((p, i) => <Sello key={i} n={p.n} t={t} at={p.t} completo={p.completo} slot={i} slots={pasos.length} hasta={hasta} />)}
    </>
  );
};
