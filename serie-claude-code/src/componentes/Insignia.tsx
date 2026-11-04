/** Insignia fija «EP.N» (regla 5), marca de agua con el usuario y el texto en pantalla de cada escena. */
import React from "react";
import { BOTTOM, MONO, TITULO, TOP, pop } from "../tema";
import type { EscenaPlan } from "../tipos";
import { useEstilo } from "./estilo";

export const Insignia: React.FC<{ episodio: number; serie: string; total: number }> = ({ episodio, serie, total }) => {
  const E = useEstilo();
  return (
    <div style={{ position: "absolute", left: 60, top: TOP + 8, height: 60, display: "flex", alignItems: "stretch", borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
      <div style={{ background: E.acento, color: E.oscuro, fontFamily: TITULO, fontWeight: 800, fontSize: 34, letterSpacing: 0.5, padding: "0 18px", display: "flex", alignItems: "center" }}>EP.{episodio}</div>
      <div style={{ background: "rgba(20,20,20,0.92)", border: `2px solid ${E.borde}`, borderLeft: "none", borderRadius: "0 14px 14px 0", color: E.texto, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 3, padding: "0 16px", display: "flex", alignItems: "center", gap: 12 }}>
        {serie.toUpperCase()}<span style={{ color: E.gris, fontWeight: 500 }}>/{total}</span>
      </div>
    </div>
  );
};

export const MarcaAgua: React.FC<{ usuario: string }> = ({ usuario }) => {
  const E = useEstilo();
  return (
    <div style={{ position: "absolute", left: 60, top: BOTTOM - 62, fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: E.texto, opacity: 0.42, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
      {usuario}
    </div>
  );
};

/** Texto en pantalla del guion: una línea corta bajo los subtítulos que cambia con los planos (regla 3). */
export const Rotulo: React.FC<{ escenas: EscenaPlan[]; t: number; y: number }> = ({ escenas, t, y }) => {
  const E = useEstilo();
  const e = escenas.find((x) => t >= x.inicio && t < x.fin);
  if (!e || !e.textos.length) return null;
  const actual = [...e.textos].reverse().find((x) => t >= x.t) ?? e.textos[0];
  const a = pop(t, actual.t, 0.25);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontWeight: 700, fontSize: 25, letterSpacing: 5, color: E.acentoSuave,
        opacity: a.opacity, translate: `0px ${(1 - a.p) * 12}px`, background: "rgba(8,8,8,0.92)", border: `2px solid ${E.borde}`, borderRadius: 12,
        padding: "8px 18px 8px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
      }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: E.acento }} />{actual.texto}
      </div>
    </div>
  );
};
