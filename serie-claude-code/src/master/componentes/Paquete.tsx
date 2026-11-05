/** Paquete de archivos (tres hojas en una caja de acento) que viaja por una curva. */
import React from "react";
import { C, enCurva, tangente } from "../nucleo";
import type { Curva } from "../nucleo";

export const Hojas: React.FC<{ size: number; color?: string }> = ({ size, color = C.acento }) => (
  <div style={{ position: "relative", width: size, height: size * 0.92 }}>
    {[2, 1, 0].map((k) => (
      <div
        key={k}
        style={{
          position: "absolute", left: size * (0.18 + k * 0.08), top: size * (0.02 + k * 0.07), width: size * 0.52, height: size * 0.66,
          background: k === 0 ? "#FFFFFF" : k === 1 ? "#E8EAEE" : "#C9CDD5", borderRadius: size * 0.06, boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          padding: `${size * 0.1}px ${size * 0.07}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: size * 0.05,
        }}
      >
        {k === 0 && [0.9, 0.7, 0.85, 0.55].map((f, i) => <div key={i} style={{ height: size * 0.035, width: `${f * 100}%`, background: i === 0 ? color : "#B7BCC6", borderRadius: 4 }} />)}
      </div>
    ))}
    <div style={{ position: "absolute", left: size * 0.08, right: size * 0.08, bottom: 0, height: size * 0.42, background: color, borderRadius: size * 0.08, boxShadow: `0 8px 24px ${color}66` }} />
  </div>
);

export const Paquete: React.FC<{ curva: Curva; u: number; size?: number; opacity?: number }> = ({ curva, u, size = 110, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const p = enCurva(curva, u);
  const ang = (tangente(curva, Math.min(0.99, Math.max(0.01, u))) * 180) / Math.PI;
  // se inclina un poco según suba o baje por la curva
  const inclina = Math.sin((ang * Math.PI) / 180) * 12 * Math.sign(Math.cos((ang * Math.PI) / 180) || 1);
  const estela = [0.06, 0.12, 0.18].map((d, i) => {
    const q = enCurva(curva, Math.max(0, u - d * (u > 0 ? 1 : 0)));
    return <div key={i} style={{ position: "absolute", left: q.x - 10 + i, top: q.y - 10 + i, width: 20 - 2 * i, height: 20 - 2 * i, borderRadius: "50%", background: C.acento, opacity: opacity * (0.5 - i * 0.14) }} />;
  });
  return (
    <>
      {u > 0.02 && estela}
      <div style={{ position: "absolute", left: p.x, top: p.y, width: 0, height: 0, opacity }}>
        <div style={{ position: "absolute", transform: `translate(-50%, -55%) rotate(${inclina}deg)` }}>
          <Hojas size={size} />
        </div>
      </div>
    </>
  );
};
