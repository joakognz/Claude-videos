/** Sello (etiqueta importante que cae con golpe) y Etiqueta (texto corto con entrada spring). */
import React from "react";
import { C, TITULO, UI, sp, vis } from "../nucleo";

export const Sello: React.FC<{ texto: React.ReactNode; x: number; y: number; t: number; at: number; out?: number; size?: number; rot?: number; resalte?: number }> = ({
  texto, x, y, t, at, out, size = 64, rot = -4, resalte = 0,
}) => {
  if (t < at) return null;
  const s = sp(t, at, { damping: 11, stiffness: 230 });
  const v = vis(t, at, out);
  if (!v.on) return null;
  const escala = 1.9 - 0.9 * s;
  // sacudida breve al caer
  const imp = t - at;
  const sac = imp > 0.12 && imp < 0.45 ? Math.sin(imp * 70) * (0.45 - imp) * 18 : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute", transform: `translate(-50%, -50%) translateX(${sac}px) scale(${escala * (1 + 0.1 * resalte)}) rotate(${rot}deg)`,
          opacity: Math.min(1, s * 2.5) * (1 - v.out), whiteSpace: "nowrap",
          fontFamily: TITULO, fontWeight: 800, fontSize: size, letterSpacing: 2, color: resalte > 0.5 ? C.oscuro : C.acento,
          padding: `${size * 0.18}px ${size * 0.42}px`, borderRadius: size * 0.24, border: `${Math.max(4, size * 0.08)}px solid ${C.acento}`,
          background: resalte > 0 ? `rgba(217,119,87,${resalte})` : "rgba(11,13,18,0.82)",
          boxShadow: `0 0 ${30 + 50 * resalte}px rgba(217,119,87,${0.25 + 0.5 * resalte})`,
        }}
      >
        {texto}
      </div>
    </div>
  );
};

export const Etiqueta: React.FC<{
  texto: React.ReactNode; x: number; y: number; t: number; at: number; out?: number; size?: number;
  variante?: "acento" | "borde" | "texto" | "gris"; fuente?: "ui" | "titulo"; ancla?: "centro" | "izq";
}> = ({ texto, x, y, t, at, out, size = 40, variante = "borde", fuente = "ui", ancla = "centro" }) => {
  const v = vis(t, at, out, 0.7);
  if (!v.on) return null;
  const estilo: React.CSSProperties =
    variante === "acento"
      ? { background: C.acento, color: C.oscuro, padding: `${size * 0.28}px ${size * 0.6}px`, borderRadius: 999 }
      : variante === "borde"
        ? { background: "rgba(20,24,33,0.92)", color: C.texto, padding: `${size * 0.28}px ${size * 0.6}px`, borderRadius: 999, border: `3px solid ${C.acento}` }
        : variante === "gris"
          ? { color: C.gris }
          : { color: C.texto };
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute", transform: `translate(${ancla === "centro" ? "-50%" : "0"}, -50%) translateY(${v.y}px) scale(${v.scale})`,
          transformOrigin: ancla === "centro" ? "50% 50%" : "0% 50%", opacity: v.opacity, whiteSpace: "nowrap",
          fontFamily: fuente === "titulo" ? TITULO : UI, fontWeight: fuente === "titulo" ? 800 : 700, fontSize: size, letterSpacing: fuente === "titulo" ? -1 : 1,
          ...estilo,
        }}
      >
        {texto}
      </div>
    </div>
  );
};
