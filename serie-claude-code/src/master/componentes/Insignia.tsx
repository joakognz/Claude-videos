/** Insignia fija «EP.N/50» (arriba a la izquierda) y marca de agua con el usuario (arriba a la derecha, fuera de la interfaz de Instagram de abajo). */
import React from "react";
import { C, MONO, TOP, UI, vis } from "../nucleo";

export const Insignia: React.FC<{ t: number; at: number; episodio: number; total: number; parte?: number; partes?: number }> = ({ t, at, episodio, total, parte, partes }) => {
  const v = vis(t, at, Infinity, 0.5);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: 44, top: TOP + 6, opacity: v.opacity, transform: `scale(${v.scale})`, transformOrigin: "0 50%", display: "flex", alignItems: "center", gap: 12, padding: "12px 24px 12px 18px", borderRadius: 999, background: "rgba(20,24,33,0.9)", border: `2px solid ${C.borde}` }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: C.acento, boxShadow: `0 0 14px ${C.acento}` }} />
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 38, color: C.texto, letterSpacing: 1 }}>
        EP.{episodio}
        {parte ? <span style={{ color: C.acentoSuave }}> · {parte}/{partes}</span> : <span style={{ color: C.gris }}>/{total}</span>}
      </div>
    </div>
  );
};

export const MarcaAgua: React.FC<{ handle: string }> = ({ handle }) => (
  <div style={{ position: "absolute", right: 44, top: TOP + 20, fontFamily: UI, fontWeight: 600, fontSize: 32, color: C.texto, opacity: 0.45, letterSpacing: 0.5 }}>{handle}</div>
);
