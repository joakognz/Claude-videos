/**
 * Tarjeta (panel con entrada spring, número opcional, estados activa/tenue), Chip (icono + texto que entra cuando
 * la voz lo dice) y Frase (texto grande que aparece palabra a palabra sincronizado con la voz).
 */
import React from "react";
import { C, TITULO, UI, clamp01, norm, ramp, sp, vis } from "../nucleo";
import type { Palabra } from "../nucleo";

export const Tarjeta: React.FC<{
  x: number; y: number; w: number; h: number; t: number; at: number; out?: number;
  numero?: number | string; activa?: number; tenue?: number; radio?: number; children?: React.ReactNode; fondo?: string; desde?: "abajo" | "escala";
}> = ({ x, y, w, h, t, at, out, numero, activa = 0, tenue = 0, radio = 34, children, fondo, desde = "abajo" }) => {
  const v = vis(t, at, out, desde === "escala" ? 0.4 : 0.75);
  if (!v.on) return null;
  const a = clamp01(activa);
  const giro = (1 - v.s) * (desde === "abajo" ? 8 : 0);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute", left: -w / 2, top: -h / 2, width: w, height: h, boxSizing: "border-box", borderRadius: radio,
          background: fondo ?? `linear-gradient(165deg, ${C.panel2} 0%, ${C.panel} 100%)`,
          border: `3px solid ${a > 0.05 ? C.acento : C.borde}`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.55)${a > 0.05 ? `, 0 0 ${50 * a}px ${C.acento}55` : ""}`,
          opacity: v.opacity * (1 - 0.6 * clamp01(tenue)),
          transform: `translateY(${desde === "abajo" ? v.y * 2 : 0}px) scale(${v.scale}) rotate(${giro}deg)`,
        }}
      >
        {numero !== undefined && (
          <div style={{ position: "absolute", left: -18, top: -18, width: 64, height: 64, borderRadius: 20, background: C.acento, color: C.oscuro, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 38, boxShadow: `0 8px 24px ${C.acento}66`, transform: `scale(${sp(t, at + 0.12, { damping: 10, stiffness: 220 })})` }}>
            {numero}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

/** Chip con icono y texto. Posición absoluta (x, y = centro izquierdo si ancla="izq"). */
export const Chip: React.FC<{
  texto: React.ReactNode; icono?: React.ReactNode; x: number; y: number; t: number; at: number; out?: number;
  size?: number; on?: number; ancla?: "centro" | "izq"; variante?: "borde" | "lleno" | "suave";
}> = ({ texto, icono, x, y, t, at, out, size = 30, on = 0, ancla = "centro", variante = "borde" }) => {
  const v = vis(t, at, out, 0.6);
  if (!v.on) return null;
  const lleno = variante === "lleno" || on > 0.5;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute", transform: `translate(${ancla === "centro" ? "-50%" : "0"}, -50%) translateX(${(1 - v.s) * (ancla === "izq" ? -30 : 0)}px) scale(${v.scale})`,
          transformOrigin: ancla === "centro" ? "50% 50%" : "0% 50%", opacity: v.opacity, whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: size * 0.4, padding: `${size * 0.32}px ${size * 0.6}px ${size * 0.32}px ${icono ? size * 0.4 : size * 0.6}px`, borderRadius: 999,
          background: lleno ? C.acento : variante === "suave" ? "rgba(27,32,43,0.95)" : "rgba(20,24,33,0.95)",
          border: `3px solid ${lleno || variante === "borde" ? C.acento : C.borde}`,
          color: lleno ? C.oscuro : C.texto, fontFamily: UI, fontWeight: 700, fontSize: size, letterSpacing: 0.5,
          boxShadow: lleno ? `0 8px 30px ${C.acento}55` : "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        {icono}
        {texto}
      </div>
    </div>
  );
};

/** Cada palabra de un texto con el instante en que la voz la dice (en orden, dentro de una escena). */
export const sincronizar = (pal: Palabra[], escena: string, texto: string, desde = -Infinity) => {
  const ws = pal.filter((p) => p.escena === escena && p.inicio >= desde - 0.01);
  let j = 0;
  return texto.split(/\s+/).filter(Boolean).map((w) => {
    const k = ws.findIndex((p, i) => i >= j && norm(p.texto) === norm(w));
    if (k >= 0) {
      j = k + 1;
      return { w, at: ws[k].inicio };
    }
    return { w, at: ws[Math.min(j, ws.length - 1)]?.inicio ?? desde };
  });
};

/** Texto grande que aparece palabra a palabra con la voz. `lineas`: el texto ya partido en líneas. */
export const Frase: React.FC<{
  lineas: string[]; escena: string; palabras: Palabra[]; x: number; y: number; t: number; out?: number; size?: number;
  acento?: string[]; desde?: number; peso?: number; interlineado?: number;
}> = ({ lineas, escena, palabras, x, y, t, out, size = 76, acento = [], desde, peso = 800, interlineado = 1.12 }) => {
  const sync = sincronizar(palabras, escena, lineas.join(" "), desde);
  let k = 0;
  const salida = out === undefined ? 0 : ramp(t, out - 0.35, out);
  if (salida >= 1) return null;
  const acentos = new Set(acento.map(norm));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${-24 * salida}px)`, textAlign: "center", fontFamily: TITULO, fontWeight: peso, fontSize: size, lineHeight: interlineado, color: C.texto, whiteSpace: "nowrap", opacity: 1 - salida, letterSpacing: -1, textShadow: "0 6px 30px rgba(11,13,18,0.95), 0 0 12px rgba(11,13,18,0.9)" }}>
        {lineas.map((ln, i) => (
          <div key={i}>
            {ln.split(/\s+/).filter(Boolean).map((w) => {
              const { at } = sync[k++];
              const s = sp(t, at - 0.06, { damping: 13, stiffness: 220 });
              return (
                <span key={k} style={{ display: "inline-block", marginRight: size * 0.24, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * size * 0.45}px) scale(${0.82 + 0.18 * s})`, color: acentos.has(norm(w)) ? C.acento : C.texto }}>
                  {w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
