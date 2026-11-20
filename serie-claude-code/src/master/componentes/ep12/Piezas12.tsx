/**
 * EP.12 · Piezas comunes: las mini animaciones 3D del usuario (con fondo transparente), iconos de la serie, cajas con
 * entrada spring, chips con icono, sobres de pedido y ventanitas para el «muchos clics».
 */
import React from "react";
import { Freeze, Img, OffthreadVideo, staticFile } from "remotion";
import { C, MONO, TITULO, UI, clamp01, sp, vis } from "../../nucleo";

// ── mini animaciones 3D ───────────────────────────────────────────────────────────────────────────────────────────
export type Elem3D = "ventana" | "raton" | "cursor" | "cuadricula";
/** Tamaño (px) y número de fotogramas de cada clip de public/elementos3d/ (los saca scripts/elementos3d.py). */
const CLIP: Record<Elem3D, { w: number; h: number; n: number }> = {
  ventana: { w: 484, h: 480, n: 134 },
  raton: { w: 464, h: 500, n: 134 },
  cursor: { w: 420, h: 474, n: 119 },
  cuadricula: { w: 540, h: 370, n: 134 },
};

/**
 * Mini animación 3D del usuario. Es secundaria: va pequeña, a un lado y algo tenue. El clip empieza en `desde` (s)
 * cuando entra, se queda quieto en `hasta` (s) o en su último fotograma, o se repite entre los dos valores de `bucle`.
 */
export const Elemento3D: React.FC<{
  e: Elem3D; x: number; y: number; w: number; t: number; at: number; out?: number;
  desde?: number; hasta?: number; bucle?: [number, number]; tenue?: number; rot?: number;
}> = ({ e, x, y, w, t, at, out, desde = 0, hasta, bucle, tenue = 0.92, rot = 0 }) => {
  const v = vis(t, at, out, 0.5);
  if (!v.on) return null;
  const c = CLIP[e];
  let u = desde + Math.max(0, t - at);
  if (bucle && u > bucle[1]) u = bucle[0] + ((u - bucle[0]) % (bucle[1] - bucle[0]));
  if (hasta !== undefined) u = Math.min(u, hasta);
  const f = Math.max(0, Math.min(c.n - 1, Math.round(u * 30)));
  const h = (w * c.h) / c.w;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: v.opacity * tenue, transform: `translateY(${v.y}px) scale(${v.scale}) rotate(${rot}deg)` }}>
      <Freeze frame={f}>
        <OffthreadVideo src={staticFile(`elementos3d/${e}.webm`)} transparent muted style={{ width: w, height: h, display: "block" }} />
      </Freeze>
    </div>
  );
};

// ── piezas sueltas ────────────────────────────────────────────────────────────────────────────────────────────────
/** Icono SVG de public/iconos/ (p. ej. "linea-coral/llave" o "dibujos/candado"). */
export const Ico: React.FC<{ ruta: string; s: number; style?: React.CSSProperties }> = ({ ruta, s, style }) => (
  <Img src={staticFile(`iconos/${ruta}.svg`)} style={{ width: s, height: s, display: "block", ...style }} />
);

/** Caja centrada en (x, y) del lienzo, con entrada spring y salida. */
export const Caja: React.FC<{ x: number; y: number; t: number; at: number; out?: number; desde?: number; rot?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x, y, t, at, out, desde = 0.6, rot = 0, children, style,
}) => {
  const v = vis(t, at, out, desde);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale}) rotate(${rot}deg)`, opacity: v.opacity, whiteSpace: "nowrap", ...style }}>{children}</div>
    </div>
  );
};

/** Chip: icono + texto en una píldora oscura con borde (coral si `activo`). */
export const Chip: React.FC<{ icono?: React.ReactNode; texto: React.ReactNode; size?: number; activo?: number; ancho?: number }> = ({ icono, texto, size = 40, activo = 1, ancho }) => (
  <div
    style={{
      display: "flex", alignItems: "center", gap: size * 0.45, padding: `${size * 0.32}px ${size * 0.6}px ${size * 0.32}px ${size * 0.38}px`, borderRadius: 999,
      background: "rgba(20,24,33,0.95)", border: `3px solid color-mix(in srgb, ${C.acento} ${Math.round(activo * 100)}%, ${C.borde})`,
      boxShadow: `0 18px 44px rgba(0,0,0,0.5), 0 0 ${30 * activo}px rgba(217,119,87,${0.25 * activo})`, width: ancho, boxSizing: "border-box",
    }}
  >
    {icono && <div style={{ width: size * 1.4, height: size * 1.4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icono}</div>}
    <div style={{ fontFamily: UI, fontWeight: 700, fontSize: size, color: C.texto, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{texto}</div>
  </div>
);

/** Sobre de pedido (dibujo plano propio). */
export const Sobre: React.FC<{ s: number; texto?: string }> = ({ s, texto }) => (
  <div style={{ position: "relative", width: s, height: s * 0.66 }}>
    <svg width={s} height={s * 0.66} viewBox="0 0 120 80" style={{ display: "block", filter: "drop-shadow(0 12px 22px rgba(0,0,0,0.5))" }}>
      <rect x={2} y={2} width={116} height={76} rx={10} fill="#F6EEDC" />
      <path d="M4 8 L60 46 L116 8" fill="none" stroke={C.acento} strokeWidth={6} strokeLinejoin="round" />
    </svg>
    {texto && (
      <div style={{ position: "absolute", left: 0, right: 0, bottom: s * 0.07, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: s * 0.105, color: "#3A3530", whiteSpace: "nowrap" }}>{texto}</div>
    )}
  </div>
);

/** Ventanita genérica (para la montaña de pantallas). */
export const MiniVentana: React.FC<{ w: number; titulo: string; boton?: string; tono?: number }> = ({ w, titulo, boton = "Siguiente", tono = 0 }) => {
  const h = w * 0.66;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.06, overflow: "hidden", background: tono ? "#F4F2EE" : "#1A1E27", border: `3px solid ${tono ? "#D8D2C8" : C.borde}`, boxShadow: "0 20px 50px rgba(0,0,0,0.55)" }}>
      <div style={{ height: h * 0.18, background: tono ? "#E4DFD7" : "#262B36", display: "flex", alignItems: "center", gap: w * 0.025, padding: `0 ${w * 0.05}px` }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: w * 0.035, height: w * 0.035, borderRadius: "50%", background: c, opacity: 0.85 }} />
        ))}
      </div>
      <div style={{ padding: w * 0.06, display: "flex", flexDirection: "column", gap: w * 0.04 }}>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: w * 0.07, color: tono ? "#2A2622" : C.texto, whiteSpace: "nowrap", overflow: "hidden" }}>{titulo}</div>
        <div style={{ height: w * 0.035, width: "80%", borderRadius: 99, background: tono ? "#CFC8BD" : "#343B49" }} />
        <div style={{ height: w * 0.035, width: "55%", borderRadius: 99, background: tono ? "#CFC8BD" : "#343B49" }} />
        <div style={{ alignSelf: "flex-start", marginTop: w * 0.01, padding: `${w * 0.02}px ${w * 0.05}px`, borderRadius: w * 0.025, background: "#1A73E8", color: "#FFFFFF", fontFamily: UI, fontWeight: 700, fontSize: w * 0.05 }}>{boton}</div>
      </div>
    </div>
  );
};

/** Burbuja de «?» o de pausa/play, coral. */
export const Insignia: React.FC<{ s: number; tipo: "pregunta" | "pausa" | "play" | "check" | "cruz"; color?: string }> = ({ s, tipo, color = C.acento }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 24px ${color}66` }}>
    <svg width={s * 0.56} height={s * 0.56} viewBox="0 0 24 24">
      {tipo === "pregunta" && (
        <>
          <path d="M8.5 9 A3.6 3.6 0 1 1 13.6 12.4 C12.6 13 12 13.8 12 15" fill="none" stroke={C.oscuro} strokeWidth={3} strokeLinecap="round" />
          <circle cx={12} cy={19.5} r={1.7} fill={C.oscuro} />
        </>
      )}
      {tipo === "pausa" && <path d="M8.5 5 V19 M15.5 5 V19" stroke={C.oscuro} strokeWidth={3.6} strokeLinecap="round" />}
      {tipo === "play" && <path d="M8 5 L19 12 L8 19 Z" fill={C.oscuro} />}
      {tipo === "check" && <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.oscuro} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />}
      {tipo === "cruz" && <path d="M6 6 L18 18 M18 6 L6 18" stroke="#FFFFFF" strokeWidth={3.4} strokeLinecap="round" />}
    </svg>
  </div>
);

/** Texto grande letra a letra (títulos). */
export const Rotulo: React.FC<{ texto: string; x: number; y: number; t: number; at: number; size: number; color?: string; out?: number }> = ({ texto, x, y, t, at, size, color = C.texto, out }) => {
  const v = vis(t, at, out, 1);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: 1 - v.out }}>
      <div style={{ position: "absolute", transform: "translate(-50%, -50%)", whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: size, letterSpacing: -1, color }}>
        {texto.split("").map((ch, i) => {
          const s = sp(t, at + i * 0.03, { damping: 13, stiffness: 210 });
          return (
            <span key={i} style={{ display: "inline-block", opacity: clamp01(s * 1.5), transform: `translateY(${(1 - s) * size * 0.5}px) scale(${0.6 + 0.4 * s})`, whiteSpace: "pre" }}>
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export { MONO };
