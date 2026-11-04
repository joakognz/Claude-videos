/** Piezas comunes de las imágenes: cajas, chips, código abstracto, cursor y la geometría de etiquetas y flechas. */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import { MONO, TITULO, UI, anchoMono, pop, rand } from "../tema";
import type { Rect } from "../tipos";

export const unir = (a: Rect, b: Rect): Rect => {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
};
export const crecer = (r: Rect, d: number): Rect => ({ x: r.x - d, y: r.y - d, w: r.w + 2 * d, h: r.h + 2 * d });
export const pos = (r: Rect): React.CSSProperties => ({ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h });

/** Caja que aparece con un pequeño rebote en `at` (si `at` es undefined está siempre). */
export const Caja: React.FC<{
  r: Rect; t: number; at?: number; radio?: number; borde?: string; grosor?: number; fondo?: string; brillo?: boolean;
  style?: React.CSSProperties; children?: React.ReactNode;
}> = ({ r, t, at, radio = 28, borde, grosor = 3, fondo, brillo, style, children }) => {
  const E = useEstilo();
  const a = at === undefined ? { opacity: 1, scale: 1 } : pop(t, at);
  return (
    <div style={{
      ...pos(r), borderRadius: radio, border: `${grosor}px solid ${borde ?? E.borde}`, background: fondo ?? E.panel,
      boxSizing: "border-box", opacity: a.opacity, scale: String(a.scale),
      boxShadow: brillo ? `0 0 60px ${E.acento}55, inset 0 0 30px ${E.acento}22` : "0 18px 50px rgba(0,0,0,0.45)",
      ...style,
    }}>{children}</div>
  );
};

export const Antetitulo: React.FC<{ texto: string; color?: string; size?: number; style?: React.CSSProperties }> = ({ texto, color, size = 30, style }) => {
  const E = useEstilo();
  return <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.18, color: color ?? E.acento, textTransform: "uppercase", ...style }}>{texto}</div>;
};

/** Líneas de código abstractas (barras), sin inventar contenido: se escriben solas entre `desde` y `desde + n*paso`. */
export const CodigoAbstracto: React.FC<{ r: Rect; t: number; desde: number; lineas: number; semilla?: number; paso?: number; alto?: number }> = ({
  r, t, desde, lineas, semilla = 3, paso = 0.13, alto = 54,
}) => {
  const E = useEstilo();
  const filas = Array.from({ length: lineas }, (_, i) => {
    const sangria = [0, 1, 1, 2, 1, 0, 1, 2, 2, 1, 0][(i + semilla) % 11];
    const w = 0.28 + rand(semilla * 31 + i) * 0.5;
    const p = Math.min(1, Math.max(0, (t - desde - i * paso) / (paso * 1.1)));
    return { sangria, w, p };
  });
  const activa = filas.findIndex((f) => f.p < 1);
  return (
    <div style={{ ...pos(r) }}>
      {filas.map((f, i) => {
        const x = 70 + f.sangria * 44;
        const anchoTotal = (r.w - x - 30) * f.w;
        const tok = 0.25 + rand(semilla * 7 + i * 3) * 0.3;
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: i * alto, height: alto, width: r.w }}>
            <div style={{ position: "absolute", left: 6, top: alto * 0.22, fontFamily: MONO, fontSize: alto * 0.42, color: E.gris, opacity: 0.55 }}>{i + 1}</div>
            <div style={{ position: "absolute", left: x, top: alto * 0.3, height: alto * 0.4, width: anchoTotal * f.p, borderRadius: 8, overflow: "hidden", display: "flex", gap: 10 }}>
              <div style={{ width: `${tok * 100}%`, background: E.acento, opacity: 0.85, borderRadius: 8 }} />
              <div style={{ flex: 1, background: "#4A4A4A", borderRadius: 8 }} />
            </div>
            {i === activa && t >= desde && (
              <div style={{ position: "absolute", left: x + anchoTotal * f.p + 6, top: alto * 0.18, width: 6, height: alto * 0.64, background: E.acentoSuave }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const CursorTexto: React.FC<{ t: number; alto: number; color?: string }> = ({ t, alto, color }) => {
  const E = useEstilo();
  const on = Math.floor(t * 2.2) % 2 === 0;
  return <span style={{ display: "inline-block", width: alto * 0.08, height: alto, marginLeft: 6, background: color ?? E.acentoSuave, opacity: on ? 1 : 0, verticalAlign: "middle" }} />;
};

/** Barra de ventana con tres puntos y título opcional. */
export const BarraVentana: React.FC<{ w: number; titulo?: string }> = ({ w, titulo }) => {
  const E = useEstilo();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: 70, borderBottom: `2px solid ${E.borde}`, display: "flex", alignItems: "center", paddingLeft: 30, gap: 14, boxSizing: "border-box" }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: i === 0 ? E.acento : "#3A3A3A" }} />)}
      {titulo && <div style={{ marginLeft: 24, fontFamily: MONO, fontWeight: 500, fontSize: 28, color: E.gris, letterSpacing: 1 }}>{titulo}</div>}
    </div>
  );
};

// ── etiquetas y flechas (regla 7) ────────────────────────────────────────────────────────────────────────────────
export const ETQ = { size: 28, tracking: 2, padX: 20, alto: 56, sep: 78 };

/** Dónde va una etiqueta respecto a su objetivo y desde dónde sale la flecha. Pura: la usa el plan para encuadrar. */
export const geometriaEtiqueta = (obj: Rect, texto: string, lado: "arriba" | "abajo" | "izquierda" | "derecha" = "arriba") => {
  const w = anchoMono(texto, ETQ.size, ETQ.tracking) + ETQ.padX * 2;
  const h = ETQ.alto;
  const cx = obj.x + obj.w / 2, cy = obj.y + obj.h / 2;
  let x = cx - w / 2, y = obj.y - ETQ.sep - h;
  if (lado === "abajo") y = obj.y + obj.h + ETQ.sep;
  if (lado === "izquierda") { x = obj.x - ETQ.sep - w; y = cy - h / 2; }
  if (lado === "derecha") { x = obj.x + obj.w + ETQ.sep; y = cy - h / 2; }
  x = Math.min(1040 - w, Math.max(40, x));
  const caja = { x, y, w, h };
  // la flecha sale del borde de la etiqueta que mira al objetivo y llega al borde del objetivo
  const desde = lado === "arriba" ? { x: x + w / 2, y: y + h } : lado === "abajo" ? { x: x + w / 2, y } : lado === "izquierda" ? { x: x + w, y: y + h / 2 } : { x, y: y + h / 2 };
  const px = Math.min(obj.x + obj.w - 10, Math.max(obj.x + 10, desde.x));
  const py = Math.min(obj.y + obj.h - 10, Math.max(obj.y + 10, desde.y));
  const hasta = lado === "arriba" ? { x: px, y: obj.y - 8 } : lado === "abajo" ? { x: px, y: obj.y + obj.h + 8 } : lado === "izquierda" ? { x: obj.x - 8, y: py } : { x: obj.x + obj.w + 8, y: py };
  return { caja, desde, hasta };
};

export const Etiqueta: React.FC<{ obj: Rect; texto: string; lado?: "arriba" | "abajo" | "izquierda" | "derecha"; t: number; at: number }> = ({ obj, texto, lado, t, at }) => {
  const E = useEstilo();
  if (t < at) return null;
  const g = geometriaEtiqueta(obj, texto, lado);
  const a = pop(t, at, 0.22);
  const dib = Math.min(1, Math.max(0, (t - at - 0.1) / 0.3));
  const dx = g.hasta.x - g.desde.x, dy = g.hasta.y - g.desde.y;
  const len = Math.hypot(dx, dy);
  // curva suave: el punto de control se separa en perpendicular
  const mx = (g.desde.x + g.hasta.x) / 2 - dy * 0.18, my = (g.desde.y + g.hasta.y) / 2 + dx * 0.18;
  const ang = Math.atan2(g.hasta.y - my, g.hasta.x - mx);
  const cab = 22;
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }} width={1} height={1}>
        <path d={`M ${g.desde.x} ${g.desde.y} Q ${mx} ${my} ${g.hasta.x} ${g.hasta.y}`} stroke={E.acento} strokeWidth={5} fill="none" strokeLinecap="round"
          strokeDasharray={len * 1.3} strokeDashoffset={len * 1.3 * (1 - dib)} />
        {dib >= 1 && (
          <path d={`M ${g.hasta.x - cab * Math.cos(ang - 0.45)} ${g.hasta.y - cab * Math.sin(ang - 0.45)} L ${g.hasta.x} ${g.hasta.y} L ${g.hasta.x - cab * Math.cos(ang + 0.45)} ${g.hasta.y - cab * Math.sin(ang + 0.45)}`}
            stroke={E.acento} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <div style={{
        ...pos(g.caja), borderRadius: 12, background: E.acento, color: E.oscuro, fontFamily: MONO, fontWeight: 700, fontSize: ETQ.size,
        letterSpacing: ETQ.tracking, display: "flex", alignItems: "center", justifyContent: "center", opacity: a.opacity, scale: String(a.scale),
        boxShadow: `0 10px 30px rgba(0,0,0,0.5)`,
      }}>{texto}</div>
    </>
  );
};

export const TextoGrande: React.FC<{ texto: string; size: number; color?: string; peso?: number; style?: React.CSSProperties }> = ({ texto, size, color, peso = 800, style }) => {
  const E = useEstilo();
  return <div style={{ fontFamily: TITULO, fontWeight: peso, fontSize: size, lineHeight: 1.02, letterSpacing: -size * 0.03, color: color ?? E.texto, ...style }}>{texto}</div>;
};

export const TextoUI: React.FC<{ texto: string; size: number; color?: string; peso?: number; style?: React.CSSProperties }> = ({ texto, size, color, peso = 700, style }) => {
  const E = useEstilo();
  return <div style={{ fontFamily: UI, fontWeight: peso, fontSize: size, lineHeight: 1.1, letterSpacing: -size * 0.015, color: color ?? E.texto, ...style }}>{texto}</div>;
};

/** Un ✓ dentro de un círculo que aparece con rebote. */
export const Tick: React.FC<{ x: number; y: number; d: number; t: number; at: number; color?: string; fondo?: string }> = ({ x, y, d, t, at, color, fondo }) => {
  const E = useEstilo();
  if (t < at) return null;
  const a = pop(t, at, 0.25);
  const dib = Math.min(1, (t - at) / 0.25);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: d, height: d, borderRadius: d / 2, background: fondo ?? E.acento, opacity: a.opacity, scale: String(a.scale), display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={d * 0.62} height={d * 0.62} viewBox="0 0 24 24">
        <path d="M4 12.5 L10 18 L20 6" stroke={color ?? E.oscuro} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - dib)} />
      </svg>
    </div>
  );
};
