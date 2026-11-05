/** Lienzo con cámara continua: los hijos se colocan en coordenadas del lienzo y la cámara los encuadra. */
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, poseCamara, transformCamara } from "../nucleo";
import type { Toma } from "../nucleo";

export const Escena: React.FC<{ t: number; tomas: Toma[]; children: React.ReactNode; puntos?: boolean; opacity?: number }> = ({
  t,
  tomas,
  children,
  puntos = true,
  opacity = 1,
}) => {
  const p = poseCamara(tomas, t);
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: transformCamara(p) }}>
        {puntos && (
          // trama de puntos del lienzo: se mueve con la cámara y hace legible cada desplazamiento
          <div
            style={{
              position: "absolute", left: -3000, top: -3000, width: 7080, height: 9920,
              backgroundImage: `radial-gradient(${C.borde} 2.2px, transparent 2.6px)`,
              backgroundSize: "54px 54px", opacity: 0.55,
            }}
          />
        )}
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Caja absoluta centrada en (x, y) del lienzo. */
export const En: React.FC<{ x: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
    <div style={{ position: "absolute", transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}>{children}</div>
  </div>
);
