/**
 * Carpeta 3D: panel trasero con pestaña, hojas que asoman y tapa delantera que se abre (rotateX) al ir `abre` de 0 a 1.
 * Todo son transformaciones calculadas por fotograma (sin transiciones CSS). Las hojas pueden llevar un esquema.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, clamp01, rand } from "../nucleo";
import { IconDoc, IconEsquema } from "./Iconos";

type Props = {
  /** ancho de la carpeta en el lienzo */
  w: number;
  /** 0 cerrada → 1 abierta */
  abre: number;
  /** 0 → 1: las hojas salen una a una */
  hojas?: number;
  /** nº de hojas */
  n?: number;
  /** logo en la tapa (ruta en public/) */
  logo?: string;
  /** con esquemas y documentos en las hojas (la carpeta de Drive) */
  conEsquemas?: boolean;
  /** color de la carpeta */
  color?: string;
  /** balanceo suave (segundos) */
  t?: number;
};

export const Carpeta3D: React.FC<Props> = ({ w, abre, hojas = 0, n = 4, logo, conEsquemas = false, color = C.acento, t = 0 }) => {
  const h = w * 0.74;
  const ang = abre * 62;
  const bal = Math.sin(t * 1.4) * 1.6;
  return (
    <div style={{ width: w, height: h, perspective: w * 3.2, transform: `rotateZ(${bal * 0.4}deg)` }}>
      <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d", transform: `rotateX(${-14 + bal}deg) rotateY(${-12 + Math.sin(t * 0.9) * 4}deg)` }}>
        {/* trasera + pestaña */}
        <div style={{ position: "absolute", left: 0, top: h * 0.06, width: w, height: h * 0.94, borderRadius: w * 0.07, background: `color-mix(in srgb, ${color} 62%, #000)` }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: w * 0.4, height: h * 0.16, borderRadius: `${w * 0.05}px ${w * 0.05}px 0 0`, background: `color-mix(in srgb, ${color} 62%, #000)` }} />
        {/* hojas */}
        {Array.from({ length: n }, (_, i) => {
          const u = clamp01(hojas * (n + 0.8) - i);
          const sube = u * (h * (0.34 + 0.05 * i));
          const giro = (rand(i * 9 + 3) - 0.5) * 9 * u;
          const ancho = w * (0.8 - i * 0.025);
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: (w - ancho) / 2 + (rand(i + 2) - 0.5) * w * 0.05, top: h * 0.36 - sube, width: ancho, height: h * 0.74, borderRadius: w * 0.03,
                background: i % 2 ? "#F1F3F8" : "#FFFFFF", transform: `translateZ(${i * 4 + 2}px) rotateZ(${giro}deg)`, boxShadow: "0 -4px 18px rgba(0,0,0,0.25)",
                opacity: u > 0 ? 1 : 0, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: w * 0.05, boxSizing: "border-box",
              }}
            >
              {conEsquemas ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: w * 0.03 }}>
                  {i % 2 ? <IconEsquema s={w * 0.2} color={C.acento} /> : <IconDoc s={w * 0.2} color="#44506A" />}
                  <div style={{ width: ancho * 0.6, height: w * 0.018, borderRadius: 99, background: "#C9CFDB" }} />
                  <div style={{ width: ancho * 0.45, height: w * 0.018, borderRadius: 99, background: "#C9CFDB" }} />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: w * 0.04, width: "100%" }}>
                  {[0.7, 0.55, 0.62].map((k, j) => (
                    <div key={j} style={{ width: ancho * k, height: w * 0.024, borderRadius: 99, background: j === 0 ? C.acento : "#C9CFDB" }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {/* tapa delantera */}
        <div
          style={{
            position: "absolute", left: 0, top: h * 0.28, width: w, height: h * 0.72, borderRadius: w * 0.07, transformOrigin: "50% 100%",
            transform: `translateZ(${n * 4 + 8}px) rotateX(${-ang}deg)`, background: `linear-gradient(180deg, color-mix(in srgb, ${color} 100%, #fff 10%), ${color})`,
            boxShadow: "0 22px 50px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {logo && <Img src={staticFile(logo)} style={{ width: w * 0.36, height: "auto", opacity: 0.98, filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.35))" }} />}
        </div>
      </div>
    </div>
  );
};
