/** Piezas de interfaz abstractas (sin textos inventados): editor de código, documento, cursor y toque. */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, clamp01, rand, sp } from "../nucleo";

const TOKENS = ["#D97757", "#7AA2F7", "#9ECE6A", "#E0AF68", "#BB9AF7", "#8C93A3"];

/** Líneas de código abstractas: barras de colores con sangrías, deterministas. */
const lineaCodigo = (i: number) => {
  const sangria = [0, 1, 1, 2, 2, 1, 0, 1, 2, 3, 2, 1, 0][i % 13];
  const n = 2 + Math.floor(rand(i * 3.1) * 3);
  return { sangria, toks: Array.from({ length: n }, (_, k) => ({ w: 40 + rand(i * 5 + k) * 110, c: TOKENS[Math.floor(rand(i * 7 + k * 3) * TOKENS.length)] })) };
};

export const Editor: React.FC<{
  w: number;
  h: number;
  t: number;
  /** líneas escritas (puede ser fraccionario: la última se escribe a medias) */
  lineas: number;
  logo?: string;
  pestanaActiva?: number;
  escala?: number;
}> = ({ w, h, t, lineas, logo, pestanaActiva = 0 }) => {
  const s = w / 940;
  const alto = 38 * s;
  const llenas = Math.floor(lineas);
  const parcial = lineas - llenas;
  const caret = Math.floor(t * 2.4) % 2 === 0;
  return (
    <div style={{ width: w, height: h, borderRadius: 26 * s, background: "#10131A", border: `${3 * s}px solid ${C.borde}`, boxShadow: "0 40px 90px rgba(0,0,0,0.6)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 58 * s, background: C.panel, display: "flex", alignItems: "center", padding: `0 ${22 * s}px`, gap: 12 * s, borderBottom: `${2 * s}px solid ${C.borde}` }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 16 * s, height: 16 * s, borderRadius: "50%", background: c, opacity: 0.85 }} />
        ))}
        <div style={{ flex: 1 }} />
        {logo && <Img src={staticFile(logo)} style={{ width: 34 * s, height: "auto" }} />}
        <div style={{ flex: 1 }} />
        <div style={{ width: 48 * s }} />
      </div>
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ width: 66 * s, background: C.panel, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 * s, paddingTop: 22 * s }}>
          {[0, 1, 2, 3].map((k) => (
            <div key={k} style={{ width: 30 * s, height: 30 * s, borderRadius: 7 * s, border: `${3 * s}px solid ${k === 0 ? C.texto : C.tenue}`, opacity: k === 0 ? 0.9 : 0.7 }} />
          ))}
        </div>
        <div style={{ width: 190 * s, background: "#121620", padding: `${20 * s}px ${16 * s}px`, display: "flex", flexDirection: "column", gap: 16 * s, borderRight: `${2 * s}px solid ${C.borde}` }}>
          {[0.8, 0.6, 0.7, 0.5, 0.65, 0.55].map((f, k) => (
            <div key={k} style={{ display: "flex", gap: 8 * s, alignItems: "center", paddingLeft: (k % 3 === 0 ? 0 : 16) * s }}>
              <div style={{ width: 14 * s, height: 14 * s, borderRadius: 3 * s, background: k === pestanaActiva ? C.acento : C.tenue }} />
              <div style={{ height: 10 * s, width: `${f * 100}%`, borderRadius: 5 * s, background: k === pestanaActiva ? C.gris : C.tenue }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ height: 50 * s, display: "flex", background: "#121620", borderBottom: `${2 * s}px solid ${C.borde}` }}>
            {[0, 1].map((k) => (
              <div key={k} style={{ width: 170 * s, display: "flex", alignItems: "center", gap: 10 * s, padding: `0 ${16 * s}px`, background: k === pestanaActiva ? "#10131A" : "transparent", borderTop: k === pestanaActiva ? `${3 * s}px solid ${C.acento}` : "none" }}>
                <div style={{ width: 12 * s, height: 12 * s, borderRadius: 3 * s, background: TOKENS[k + 1] }} />
                <div style={{ height: 9 * s, flex: 1, borderRadius: 5 * s, background: k === pestanaActiva ? C.gris : C.tenue }} />
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: `${18 * s}px ${18 * s}px`, display: "flex", flexDirection: "column", gap: 0 }}>
            {Array.from({ length: Math.min(llenas + 1, Math.floor((h - 160 * s) / alto)) }, (_, i) => {
              const ln = lineaCodigo(i);
              const total = ln.toks.reduce((a, k) => a + k.w + 10, 0);
              let quedan = i < llenas ? total : total * parcial;
              const ultima = i === llenas || (i === llenas - 1 && parcial === 0);
              return (
                <div key={i} style={{ height: alto, display: "flex", alignItems: "center", gap: 10 * s }}>
                  <div style={{ width: 34 * s, fontFamily: MONO, fontSize: 20 * s, color: C.tenue, textAlign: "right" }}>{i + 1}</div>
                  <div style={{ width: (14 + ln.sangria * 30) * s }} />
                  {ln.toks.map((k, j) => {
                    const ww = Math.max(0, Math.min(k.w, quedan));
                    quedan -= k.w + 10;
                    return ww > 0 ? <div key={j} style={{ width: ww * s, height: 13 * s, borderRadius: 7 * s, background: k.c, opacity: 0.92 }} /> : null;
                  })}
                  {ultima && caret && <div style={{ width: 4 * s, height: 28 * s, background: C.texto }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Página de documento (procesador de texto): líneas grises que se escriben. */
export const Documento: React.FC<{ w: number; t: number; lineas: number }> = ({ w, t, lineas }) => {
  const s = w / 300;
  const llenas = Math.floor(lineas);
  const caret = Math.floor(t * 2.4) % 2 === 0;
  return (
    <div style={{ width: w, height: w * 1.25, background: "#FFFFFF", borderRadius: 14 * s, boxShadow: "0 30px 70px rgba(0,0,0,0.55)", padding: `${30 * s}px ${26 * s}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 13 * s }}>
      <div style={{ height: 16 * s, width: "55%", background: "#2B579A", borderRadius: 8 * s, marginBottom: 8 * s, opacity: lineas > 0 ? 1 : 0.2 }} />
      {Array.from({ length: Math.min(9, llenas + 1) }, (_, i) => {
        const f = [0.95, 0.88, 0.92, 0.7, 0.9, 0.84, 0.6, 0.93, 0.75][i];
        const p = i < llenas ? 1 : lineas - llenas;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 * s }}>
            <div style={{ height: 10 * s, width: `${f * p * 100}%`, background: "#C3C8D1", borderRadius: 5 * s }} />
            {i === llenas && caret && <div style={{ width: 3 * s, height: 20 * s, background: "#2B579A" }} />}
          </div>
        );
      })}
    </div>
  );
};

/** Puntero de ratón que se desplaza y pulsa. */
export const Cursor: React.FC<{ x: number; y: number; pulsa: number; opacity?: number; size?: number }> = ({ x, y, pulsa, opacity = 1, size = 64 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity, transform: `scale(${1 - 0.18 * pulsa})`, transformOrigin: "0 0", filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.6))" }}>
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M4 2.5 L4 19.5 L8.6 15.2 L11.6 21.8 L14.6 20.4 L11.6 14 L18 14 Z" fill="#FFFFFF" stroke="#0B0D12" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  </div>
);

/** Toque en pantalla táctil: círculo que se aprieta y onda que se expande. */
export const Toque: React.FC<{ x: number; y: number; t: number; at: number; r?: number }> = ({ x, y, t, at, r = 46 }) => {
  const u = t - at;
  if (u < -0.35 || u > 0.9) return null;
  const llega = clamp01((u + 0.35) / 0.3);
  const onda = clamp01(u / 0.55);
  const aprieta = u > 0 ? sp(t, at, { damping: 10, stiffness: 300 }) : 0;
  const fuera = clamp01((u - 0.55) / 0.35);
  return (
    <>
      <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: `5px solid ${C.acento}`, boxSizing: "border-box", opacity: llega * (1 - fuera), transform: `scale(${(1.4 - 0.4 * llega) * (1 - 0.25 * Math.sin(Math.min(1, aprieta) * Math.PI))})`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }} />
      {u > 0 && <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `6px solid ${C.acento}`, boxSizing: "border-box", opacity: 1 - onda, transform: `scale(${1 + onda * 1.6})` }} />}
    </>
  );
};
