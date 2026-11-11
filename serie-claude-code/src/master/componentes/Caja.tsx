/** Caja de proyecto (pictograma en perspectiva) apoyada en un punto: la base queda en (x, y) y escala desde ahí. */
import React from "react";
import { C, vis } from "../nucleo";

export const Escala: React.FC<{ x: number; y: number; t: number; at: number; out?: number; escala?: number; tam?: number }> = ({ x, y, t, at, out, escala = 1, tam = 120 }) => {
  const v = vis(t, at, out, 0.3);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: v.opacity }}>
      <div style={{ position: "absolute", left: -tam / 2, top: -tam, width: tam, height: tam, transformOrigin: "50% 100%", transform: `scale(${v.scale * escala})` }}>
        <svg width={tam} height={tam} viewBox="0 0 48 48" style={{ overflow: "visible" }}>
          <path d="M24 4 L44 13 L24 22 L4 13 Z" fill={C.acentoSuave} stroke={C.oscuro} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M4 13 L24 22 L24 46 L4 37 Z" fill={C.acento} stroke={C.oscuro} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M44 13 L24 22 L24 46 L44 37 Z" fill="#B85F42" stroke={C.oscuro} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M14 8.5 L34 17.5 L34 25" fill="none" stroke={C.oscuro} strokeOpacity={0.35} strokeWidth={2} />
        </svg>
      </div>
    </div>
  );
};
