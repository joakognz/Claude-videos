/**
 * EP.8 · El cartel colgante (hilo visual del episodio): cuelga de un clavo con su cuerda, cae con un rebote, se
 * balancea y gira sobre sí mismo (giro 3D en Y) para enseñar cada cara: un código de error, una pregunta, «ABIERTO»…
 */
import React from "react";
import { C, EASE, MONO, TITULO, clamp01, ramp, sp } from "../../nucleo";

export const CREMA = "#F6EEDC";
export const TINTA = "#1C1A1A";
export const TINTA_SUAVE = "#7A6F62";

export type Cara = { at: number; cara: (w: number) => React.ReactNode };

const GIRO = 0.46; // segundos que tarda en dar la vuelta

/** Ángulo de balanceo (grados) por los golpes recibidos en `golpes`. */
const balanceo = (t: number, golpes: number[], fuerza = 7) =>
  golpes.reduce((a, g) => (t > g ? a + fuerza * Math.sin((t - g) * 7.2) * Math.exp(-(t - g) * 2.1) : a), 0) + 0.9 * Math.sin(t * 1.45);

export const Cartel: React.FC<{
  /** clavo */
  x: number;
  y: number;
  w: number;
  t: number;
  /** cae en este instante */
  entra: number;
  caras: Cara[];
  out?: number;
  /** golpes extra (balanceo) */
  golpes?: number[];
  cuerda?: number;
  /** sin caída: aparece ya colgado (con un fundido) */
  sinCaida?: boolean;
}> = ({ x, y, w, t, entra, caras, out, golpes = [], cuerda, sinCaida = false }) => {
  if (t < entra - 0.05) return null;
  const h = w * 0.62;
  const cu = cuerda ?? w * 0.3;
  const s = sinCaida ? 1 : sp(t, entra, { damping: 11, stiffness: 150 });
  const dy = (1 - s) * -(h * 2.6);
  const fuera = out === undefined ? 0 : ramp(t, out - 0.35, out);
  const op = (sinCaida ? clamp01((t - entra) / 0.3) : clamp01((t - entra) / 0.12)) * (1 - fuera);
  if (op <= 0.001) return null;
  // cara actual y giro
  let i = 0;
  caras.forEach((c, k) => {
    if (c.at <= t) i = k;
  });
  let rot = 0;
  let cara = caras[i];
  if (i > 0 && t < caras[i].at + GIRO) {
    const p = ramp(t, caras[i].at, caras[i].at + GIRO, EASE);
    if (p < 0.5) {
      cara = caras[i - 1];
      rot = p * 180;
    } else rot = (p - 1) * 180;
  }
  const ang = balanceo(t, [entra + 0.22, ...caras.slice(1).map((c) => c.at + 0.2), ...golpes], sinCaida ? 4 : 7);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: op }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translateY(${dy}px) rotate(${ang}deg) scale(${1 - 0.1 * fuera})` }}>
        <svg style={{ position: "absolute", left: -w / 2, top: 0, overflow: "visible" }} width={w} height={cu + 4}>
          <path d={`M ${w * 0.2} ${cu + 2} L ${w / 2} 0 L ${w * 0.8} ${cu + 2}`} stroke={TINTA} strokeWidth={Math.max(3, w * 0.012)} fill="none" strokeLinejoin="round" />
        </svg>
        <div style={{ position: "absolute", left: -w / 2, top: cu, width: w, height: h, perspective: w * 3 }}>
          <div
            style={{
              position: "relative", width: "100%", height: "100%", boxSizing: "border-box", transform: `rotateY(${rot}deg)`,
              borderRadius: w * 0.07, background: CREMA, border: `${Math.max(3, w * 0.022)}px solid ${TINTA}`, overflow: "hidden",
              boxShadow: "0 26px 60px rgba(0,0,0,0.5)",
            }}
          >
            {[0.2, 0.8].map((f) => (
              <div key={f} style={{ position: "absolute", left: w * f - w * 0.018, top: w * 0.025, width: w * 0.036, height: w * 0.036, borderRadius: "50%", background: TINTA, opacity: 0.85 }} />
            ))}
            {cara.cara(w)}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: -w * 0.028, top: -w * 0.028, width: w * 0.056, height: w * 0.056, borderRadius: "50%", background: "#B8BEC6", border: `${Math.max(2, w * 0.009)}px solid ${TINTA}`, boxSizing: "border-box" }} />
    </div>
  );
};

/** Cara con un código: el número grande, el nombre técnico y la frase en una franja de acento. */
export const caraCodigo = (codigo: string, frase: string, tecnico?: string) => (w: number) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: w * 0.005, paddingTop: w * 0.04 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: w * (codigo.length > 3 ? 0.18 : 0.25), lineHeight: 1, color: TINTA, letterSpacing: w * 0.01 }}>{codigo}</div>
      {tecnico && <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: w * 0.048, color: TINTA_SUAVE, letterSpacing: 0.5 }}>{tecnico}</div>}
    </div>
    <div style={{ width: "100%", padding: `${w * 0.03}px 0`, background: C.acento, borderTop: `${Math.max(3, w * 0.018)}px solid ${TINTA}`, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: w * (frase.length > 16 ? 0.062 : 0.072), color: TINTA, letterSpacing: 1, whiteSpace: "nowrap" }}>
      {frase}
    </div>
  </div>
);

/** Cara de texto (pregunta, «ABIERTO»…), con una línea pequeña opcional. */
export const caraTexto = (texto: string, sub?: string, color: string = TINTA) => (w: number) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: w * 0.02, paddingTop: w * 0.03 }}>
    <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: w * Math.min(0.2, 1.22 / Math.max(1, texto.length)), lineHeight: 1, color, letterSpacing: w * 0.006, whiteSpace: "nowrap" }}>{texto}</div>
    {sub && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: w * 0.055, color: TINTA_SUAVE, letterSpacing: 1, whiteSpace: "nowrap" }}>{sub}</div>}
  </div>
);
