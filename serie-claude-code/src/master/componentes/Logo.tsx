/** Logo de un fichero adjunto (nunca redibujado), con entrada spring y salida. Ficha opcional cuando el logo no se lee sobre el fondo. */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, sp, vis } from "../nucleo";

export type LogoProps = {
  src: string;
  x: number;
  y: number;
  /** ancho del logo en el lienzo */
  w: number;
  t: number;
  at: number;
  out?: number;
  /** "circulo": ficha blanca redonda (octocat negro). "tarjeta": tarjeta clara (texto gris de Microsoft). */
  ficha?: "circulo" | "tarjeta";
  tenue?: number;
  /** golpes de atención: pequeño latido en esos segundos */
  pulsos?: number[];
  sombra?: boolean;
  rot?: number;
};

export const Logo: React.FC<LogoProps> = ({ src, x, y, w, t, at, out, ficha, tenue = 1, pulsos = [], sombra = true, rot = 0 }) => {
  const v = vis(t, at, out, 0.25);
  if (!v.on) return null;
  const giro = (1 - v.s) * -14 + rot;
  const latido = pulsos.reduce((acc, p) => {
    const k = sp(t, p, { damping: 9, stiffness: 220 });
    return acc + (t > p ? Math.sin(Math.min(1, k) * Math.PI) * 0.14 * Math.exp(-(t - p) * 2.2) : 0);
  }, 0);
  const img = <Img src={staticFile(src)} style={{ width: ficha ? w * 0.74 : w, height: "auto", display: "block" }} />;
  const caja: React.CSSProperties =
    ficha === "circulo"
      ? { width: w, height: w, borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: sombra ? "0 18px 50px rgba(0,0,0,0.55)" : undefined }
      : ficha === "tarjeta"
        ? { padding: `${w * 0.1}px ${w * 0.13}px`, borderRadius: w * 0.09, background: "#F6F7F9", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: sombra ? "0 22px 60px rgba(0,0,0,0.6)" : undefined }
        : { filter: sombra ? "drop-shadow(0 18px 40px rgba(0,0,0,0.55))" : undefined };
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale * (1 + latido)}) rotate(${giro}deg)`, opacity: v.opacity * tenue }}>
        <div style={caja}>{img}</div>
      </div>
    </div>
  );
};

/** Anillo de foco alrededor de algo que la voz acaba de nombrar. */
export const Anillo: React.FC<{ x: number; y: number; r: number; t: number; at: number; out?: number }> = ({ x, y, r, t, at, out }) => {
  const v = vis(t, at, out, 0.7);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `6px solid ${C.acento}`, opacity: v.opacity, transform: `scale(${v.scale})`, boxShadow: `0 0 40px ${C.acento}88, inset 0 0 30px ${C.acento}44` }} />
  );
};
