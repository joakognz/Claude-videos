/**
 * Piezas del EP.5: entradas genéricas con spring, fichas de logos (los adjuntos, nunca redibujados) e iconos planos
 * propios dibujados con el acento (CLAUDE.md, carpeta, FTP, HTML/CSS y pictogramas de apoyo).
 * Todo depende del tiempo t (segundos del reel): sin transiciones CSS ni temporizadores.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";

// ── texto escrito poco a poco ───────────────────────────────────────────────────────────────────────────────────────
/** Lo escrito de `texto` entre los segundos a y b (ritmo uniforme por carácter). */
export const escrito = (texto: string, t: number, a: number, b: number) =>
  texto.slice(0, Math.round(clamp01((t - a) / Math.max(0.05, b - a)) * texto.length));

/** Cursor de texto parpadeante. */
export const Caret: React.FC<{ t: number; h: number; color?: string }> = ({ t, h, color = C.texto }) => (
  <span style={{ display: "inline-block", width: Math.max(3, h * 0.08), height: h, marginLeft: 4, verticalAlign: "middle", background: color, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.15 }} />
);

// ── entrada genérica ────────────────────────────────────────────────────────────────────────────────────────────────
/** Caja centrada en (x, y) del lienzo que entra con spring en `at` y sale en `out`. */
export const Pop: React.FC<{
  x: number; y: number; t: number; at: number; out?: number; desde?: number; rot?: number; latidos?: number[];
  ancla?: "centro" | "izq"; style?: React.CSSProperties; children: React.ReactNode;
}> = ({ x, y, t, at, out, desde = 0.6, rot = 0, latidos = [], ancla = "centro", style, children }) => {
  const v = vis(t, at, out, desde);
  if (!v.on) return null;
  const lat = latido(t, latidos);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute",
          transform: `translate(${ancla === "centro" ? "-50%" : "0"}, -50%) translateY(${v.y}px) scale(${v.scale * (1 + lat)}) rotate(${(1 - v.s) * rot}deg)`,
          transformOrigin: ancla === "centro" ? "50% 50%" : "0% 50%",
          opacity: v.opacity, whiteSpace: "nowrap", ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Latido breve (escala extra) en cada uno de los segundos dados. */
export const latido = (t: number, ps: number[], k = 0.14) =>
  ps.reduce((acc, p) => {
    if (t <= p) return acc;
    const s = sp(t, p, { damping: 9, stiffness: 220 });
    return acc + Math.sin(Math.min(1, s) * Math.PI) * k * Math.exp(-(t - p) * 2.2);
  }, 0);

// ── fichas de logos ─────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * Logo adjunto sobre ficha blanca (los logos con texto oscuro no se leen sobre el fondo) o suelto.
 * `h`: alto de la ficha; el logo ocupa el 64 % y conserva su proporción.
 */
export const Ficha: React.FC<{
  src: string; x: number; y: number; h: number; t: number; at: number; out?: number; blanca?: boolean;
  latidos?: number[]; tenue?: number; maxW?: number; ancla?: "centro" | "izq"; rot?: number; alto?: number;
}> = ({ src, x, y, h, t, at, out, blanca = true, latidos = [], tenue = 1, maxW, ancla = "centro", rot = -10, alto = 0.64 }) => {
  const v = vis(t, at, out, 0.3);
  if (!v.on) return null;
  const lat = latido(t, latidos);
  const img = <Img src={staticFile(src)} style={{ height: h * (blanca ? alto : 1), width: "auto", maxWidth: maxW, objectFit: "contain", display: "block" }} />;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute", transform: `translate(${ancla === "centro" ? "-50%" : "0"}, -50%) translateY(${v.y}px) scale(${v.scale * (1 + lat)}) rotate(${(1 - v.s) * rot}deg)`,
          transformOrigin: ancla === "centro" ? "50% 50%" : "0% 50%", opacity: v.opacity * tenue,
        }}
      >
        {blanca ? (
          <div style={{ height: h, padding: `0 ${h * 0.2}px`, boxSizing: "border-box", borderRadius: h * 0.22, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 46px rgba(0,0,0,0.55)" }}>{img}</div>
        ) : (
          <div style={{ filter: "drop-shadow(0 16px 36px rgba(0,0,0,0.55))" }}>{img}</div>
        )}
      </div>
    </div>
  );
};

/** Ficha estática (sin entrada propia) para usar dentro de filas que ya animan. */
export const FichaFija: React.FC<{ src: string; h: number; blanca?: boolean; maxW?: number; alto?: number }> = ({ src, h, blanca = true, maxW, alto = 0.64 }) => {
  const img = <Img src={staticFile(src)} style={{ height: h * (blanca ? alto : 1), width: "auto", maxWidth: maxW, objectFit: "contain", display: "block" }} />;
  return blanca ? (
    <div style={{ height: h, padding: `0 ${h * 0.2}px`, boxSizing: "border-box", borderRadius: h * 0.22, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(0,0,0,0.45)", flexShrink: 0 }}>{img}</div>
  ) : (
    <div style={{ flexShrink: 0 }}>{img}</div>
  );
};

// ── tarjetas y chips ────────────────────────────────────────────────────────────────────────────────────────────────
export const Tarjeta: React.FC<{ w: number; h?: number; children: React.ReactNode; acento?: number; style?: React.CSSProperties; pad?: number }> = ({ w, h, children, acento = 0, style, pad = 28 }) => (
  <div
    style={{
      width: w, height: h, boxSizing: "border-box", padding: pad, borderRadius: 30, background: C.panel,
      border: `3px solid ${acento > 0 ? `color-mix(in srgb, ${C.acento} ${Math.round(acento * 100)}%, ${C.borde})` : C.borde}`,
      boxShadow: `0 30px 70px rgba(0,0,0,0.5)${acento > 0 ? `, 0 0 ${40 * acento}px ${C.acento}55` : ""}`, ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ icono?: React.ReactNode; texto: React.ReactNode; size?: number; variante?: "panel" | "acento" | "borde" }> = ({ icono, texto, size = 40, variante = "panel" }) => (
  <div
    style={{
      display: "inline-flex", alignItems: "center", gap: size * 0.45, padding: `${size * 0.32}px ${size * 0.6}px`, borderRadius: 999,
      background: variante === "acento" ? C.acento : C.panel2, color: variante === "acento" ? C.oscuro : C.texto,
      border: `3px solid ${variante === "panel" ? C.borde : C.acento}`, fontFamily: UI, fontWeight: 700, fontSize: size, whiteSpace: "nowrap",
      boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
    }}
  >
    {icono}
    {texto}
  </div>
);

/** Número en recuadro de acento (orden de las tarjetas). */
export const Num: React.FC<{ n: React.ReactNode; size?: number }> = ({ n, size = 64 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: C.acento, color: C.oscuro, fontFamily: TITULO, fontWeight: 800, fontSize: size * 0.56, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
);

/** Título grande (Sora) letra a letra no: palabra a palabra con spring, cada palabra en su instante. */
export const Frase: React.FC<{ palabras: { w: string; at: number; acento?: boolean }[]; t: number; size?: number; out?: number; color?: string }> = ({ palabras, t, size = 84, out, color = C.texto }) => {
  const fuera = out === undefined ? 0 : ramp(t, out - 0.35, out);
  return (
    <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: size, lineHeight: 1.12, color, opacity: 1 - fuera, whiteSpace: "nowrap", textAlign: "center" }}>
      {palabras.map(({ w, at, acento }, k) => {
        const s = sp(t, at - 0.04, { damping: 13, stiffness: 220 });
        return (
          <span key={k} style={{ display: "inline-block", marginRight: size * 0.24, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 34}px) scale(${0.82 + 0.18 * s})`, color: acento ? C.acento : undefined }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ── iconos planos (propios, no son logos de marca) ────────────────────────────────────────────────────────────────
type IP = { size: number; color?: string; fondo?: string };

/** Archivo CLAUDE.md: hoja con esquina doblada, líneas y la marca «MD». */
export const IconoMd: React.FC<IP & { lineas?: number; etiqueta?: string }> = ({ size, color = C.acento, fondo = C.panel2, lineas = 3, etiqueta = "MD" }) => (
  <svg width={size} height={size * 1.22} viewBox="0 0 100 122" style={{ display: "block", overflow: "visible" }}>
    <path d="M10 6 h56 l26 26 v80 a6 6 0 0 1 -6 6 h-76 a6 6 0 0 1 -6 -6 v-100 a6 6 0 0 1 6 -6 z" fill={fondo} stroke={color} strokeWidth={5} strokeLinejoin="round" />
    <path d="M66 6 v20 a6 6 0 0 0 6 6 h20" fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" />
    {Array.from({ length: lineas }, (_, i) => (
      <rect key={i} x={20} y={42 + i * 12} width={[52, 40, 46, 34, 44][i % 5]} height={6} rx={3} fill={C.gris} opacity={0.75} />
    ))}
    <rect x={18} y={84} width={64} height={26} rx={7} fill={color} />
    <text x={50} y={103.5} textAnchor="middle" fontFamily={TITULO} fontWeight={800} fontSize={20} fill={C.oscuro} letterSpacing={1}>{etiqueta}</text>
  </svg>
);

/** Carpeta (abierta: la tapa se inclina). */
export const IconoCarpeta: React.FC<IP & { abierta?: number }> = ({ size, color = C.acento, abierta = 0 }) => (
  <svg width={size} height={size * 0.82} viewBox="0 0 100 82" style={{ display: "block", overflow: "visible" }}>
    <path d="M6 14 a6 6 0 0 1 6 -6 h24 l8 9 h44 a6 6 0 0 1 6 6 v47 a6 6 0 0 1 -6 6 h-76 a6 6 0 0 1 -6 -6 z" fill={`color-mix(in srgb, ${color} 70%, #000)`} />
    <g transform={`translate(6 76) skewX(${-18 * abierta}) scale(1 ${1 - 0.18 * abierta}) translate(-6 -76)`}>
      <path d="M6 30 a6 6 0 0 1 6 -6 h76 a6 6 0 0 1 6 6 v40 a6 6 0 0 1 -6 6 h-76 a6 6 0 0 1 -6 -6 z" fill={color} />
    </g>
  </svg>
);

/** Servidor con flecha de subida y «FTP». */
export const IconoFtp: React.FC<IP> = ({ size, color = C.acento }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", overflow: "visible" }}>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={8} y={38 + i * 20} width={62} height={16} rx={4} fill={C.panel2} stroke={color} strokeWidth={4} />
        <circle cx={18} cy={46 + i * 20} r={3} fill={color} />
        <rect x={28} y={44 + i * 20} width={30} height={4} rx={2} fill={C.gris} />
      </g>
    ))}
    <path d="M84 70 V20 M72 32 L84 20 L96 32" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    <text x={39} y={26} textAnchor="middle" fontFamily={TITULO} fontWeight={800} fontSize={22} fill={color}>FTP</text>
  </svg>
);

/** «</>» con «HTML/CSS» debajo. */
export const IconoHtmlCss: React.FC<IP> = ({ size, color = C.acento }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
    <rect x={4} y={4} width={92} height={92} rx={18} fill={C.panel2} stroke={color} strokeWidth={4} />
    <path d="M34 26 L18 42 L34 58 M66 26 L82 42 L66 58 M56 20 L44 64" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    <text x={50} y={86} textAnchor="middle" fontFamily={TITULO} fontWeight={800} fontSize={16} fill={C.texto}>HTML/CSS</text>
  </svg>
);

/** Pictogramas de trazo (24 x 24). */
const TRAZOS: Record<string, string> = {
  check: "M5 12.5 L10 17.5 L19 7",
  cruz: "M6 6 L18 18 M18 6 L6 18",
  lupa: "M10.5 3.5 a7 7 0 1 0 0.01 0 M15.5 15.5 L21 21",
  lapiz: "M4 20 L5 15 L15.5 4.5 a2.1 2.1 0 0 1 3 3 L8 18 Z M13.5 6.5 L17.5 10.5",
  escudo: "M12 3 L19.5 6 V11.5 C19.5 16 16.3 19.6 12 21 C7.7 19.6 4.5 16 4.5 11.5 V6 Z M8.5 12 L11 14.5 L15.8 9.5",
  ojoNo: "M3 12 C5.5 7.5 8.5 5.5 12 5.5 C15.5 5.5 18.5 7.5 21 12 C18.5 16.5 15.5 18.5 12 18.5 C8.5 18.5 5.5 16.5 3 12 Z M12 9.2 a2.8 2.8 0 1 0 0.01 0 M4 4 L20 20",
  reloj: "M12 3 a9 9 0 1 0 0.01 0 M12 7 V12 L15.5 14",
  bocadillo: "M4 5.5 h16 a1.5 1.5 0 0 1 1.5 1.5 v9 a1.5 1.5 0 0 1 -1.5 1.5 h-9 l-4.5 3.5 v-3.5 h-2.5 a1.5 1.5 0 0 1 -1.5 -1.5 v-9 a1.5 1.5 0 0 1 1.5 -1.5 z",
  usuario: "M12 4 a4 4 0 1 0 0.01 0 M4.5 20.5 C5.5 16.5 8.4 14.5 12 14.5 C15.6 14.5 18.5 16.5 19.5 20.5",
  usuarios: "M9 5 a3.4 3.4 0 1 0 0.01 0 M2.5 19.5 C3.3 16 5.8 14.3 9 14.3 C12.2 14.3 14.7 16 15.5 19.5 M16 5.5 a3 3 0 1 1 0 6 M18 14.6 C20 15.3 21.2 17 21.6 19.5",
  capas: "M12 3.5 L21 8 L12 12.5 L3 8 Z M3 12 L12 16.5 L21 12 M3 16 L12 20.5 L21 16",
  bucle: "M20 12 a8 8 0 1 1 -2.4 -5.7 M20 4 V7.5 H16.5",
  aviso: "M12 3.5 L21.5 20 H2.5 Z M12 9.5 V14 M12 17 V17.2",
  matraz: "M9.5 3.5 H14.5 M10.5 3.5 V9.5 L4.8 18.6 A1.6 1.6 0 0 0 6.2 21 H17.8 A1.6 1.6 0 0 0 19.2 18.6 L13.5 9.5 V3.5 M7.2 15 H16.8",
  enlace: "M10 14 L14 10 M8.5 11.5 L6.3 13.7 a3.5 3.5 0 0 0 5 5 L13.5 16.5 M10.5 7.5 L12.7 5.3 a3.5 3.5 0 0 1 5 5 L15.5 12.5",
  avion: "M3 11.5 L21 3 L13.5 21 L11 13 Z M11 13 L21 3",
  tienda: "M3.5 9 L5 4 H19 L20.5 9 M3.5 9 H20.5 M3.5 9 a2.8 2.8 0 0 0 5.6 0 a2.8 2.8 0 0 0 5.8 0 a2.8 2.8 0 0 0 5.6 0 M5 11.5 V20 H19 V11.5 M10 20 V15 H14 V20",
  engranaje: "M12 8.6 a3.4 3.4 0 1 0 0.01 0 M12 2.5 V5 M12 19 V21.5 M2.5 12 H5 M19 12 H21.5 M5.3 5.3 L7.1 7.1 M16.9 16.9 L18.7 18.7 M5.3 18.7 L7.1 16.9 M16.9 7.1 L18.7 5.3",
  diana: "M12 3 a9 9 0 1 0 0.01 0 M12 7.5 a4.5 4.5 0 1 0 0.01 0 M12 11 a1 1 0 1 0 0.01 0",
  sol: "M12 8 a4 4 0 1 0 0.01 0 M12 2.5 V4.5 M12 19.5 V21.5 M2.5 12 H4.5 M19.5 12 H21.5 M5.3 5.3 L6.7 6.7 M17.3 17.3 L18.7 18.7 M5.3 18.7 L6.7 17.3 M17.3 6.7 L18.7 5.3",
  rayo: "M13 2.5 L5 13.5 H11 L10 21.5 L19 9.5 H13 Z",
  pin: "M12 21 C12 21 5 14.5 5 9.5 a7 7 0 0 1 14 0 C19 14.5 12 21 12 21 Z M12 7 a2.5 2.5 0 1 0 0.01 0",
  paleta: "M12 3 a9 9 0 0 0 0 18 c1.4 0 2 -1 1.4 -2.2 c-0.7 -1.3 0.2 -2.8 1.7 -2.8 H17 a4 4 0 0 0 4 -4 C21 6.8 17 3 12 3 Z M7.5 12 a1 1 0 1 0 0.01 0 M9.5 7.5 a1 1 0 1 0 0.01 0 M14.5 7.5 a1 1 0 1 0 0.01 0",
  stop: "M8.3 3 H15.7 L21 8.3 V15.7 L15.7 21 H8.3 L3 15.7 V8.3 Z M8 12 H16",
  documento: "M6 3 H14 L19 8 V21 H6 Z M14 3 V8 H19 M9 12.5 H16 M9 16 H14",
  calendario: "M4 6 H20 V20 H4 Z M4 10 H20 M8 3.5 V7.5 M16 3.5 V7.5",
  codigo: "M8.5 7 L3.5 12 L8.5 17 M15.5 7 L20.5 12 L15.5 17",
  mano: "M8 13 V5.5 a1.5 1.5 0 0 1 3 0 V11 M11 10 V4 a1.5 1.5 0 0 1 3 0 V11 M14 10 V5 a1.5 1.5 0 0 1 3 0 V13.5 C17 18 14.8 21 11.5 21 C8.8 21 7.4 19.6 6 17.3 L3.8 13.6 a1.5 1.5 0 0 1 2.5 -1.6 L8 14.5",
};
export const Picto: React.FC<{ nombre: keyof typeof TRAZOS | string; size: number; color?: string; grosor?: number; dibujo?: number }> = ({ nombre, size, color = C.acento, grosor = 2.2, dibujo = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", overflow: "visible" }}>
    <path d={TRAZOS[nombre]} fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(dibujo)} />
  </svg>
);

/** Círculo con pictograma (para listas y pasos). */
export const Medalla: React.FC<{ nombre: string; size: number; activo?: number; color?: string }> = ({ nombre, size, activo = 1, color = C.acento }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: C.panel2, border: `${Math.max(3, size * 0.04)}px solid ${activo > 0.5 ? color : C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: activo > 0.5 ? `0 0 ${size * 0.35}px ${color}55` : "none", flexShrink: 0 }}>
    <Picto nombre={nombre} size={size * 0.56} color={activo > 0.5 ? color : C.gris} />
  </div>
);

/** Interrogantes que flotan alrededor de un punto (confusión). */
export const Interrogantes: React.FC<{ x: number; y: number; t: number; at: number; out?: number; r?: number; n?: number; size?: number }> = ({ x, y, t, at, out, r = 170, n = 4, size = 70 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.75;
      const v = vis(t, at + i * 0.12, out, 0.3);
      if (!v.on) return null;
      const fl = Math.sin((t - at) * 3 + i * 1.7) * 10;
      return (
        <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * r, top: y + Math.sin(a) * r + fl, transform: `translate(-50%, -50%) scale(${v.scale}) rotate(${(i % 2 ? 12 : -12) + Math.sin((t - at) * 2 + i) * 8}deg)`, opacity: v.opacity, fontFamily: TITULO, fontWeight: 800, fontSize: size * (i % 2 ? 0.8 : 1), color: C.gris }}>
          ?
        </div>
      );
    })}
  </>
);

/** Destellos (brillante). */
export const Destellos: React.FC<{ x: number; y: number; t: number; at: number; out?: number; r?: number }> = ({ x, y, t, at, out, r = 190 }) => (
  <>
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      const v = vis(t, at + i * 0.05, out, 0.2);
      if (!v.on) return null;
      const s = 34 + (i % 3) * 14;
      const brillo = 0.75 + 0.25 * Math.sin((t - at) * 6 + i);
      return (
        <svg key={i} width={s} height={s} viewBox="0 0 24 24" style={{ position: "absolute", left: x + Math.cos(a) * r * (0.85 + 0.15 * v.s) - s / 2, top: y + Math.sin(a) * r * (0.85 + 0.15 * v.s) - s / 2, opacity: v.opacity * brillo, transform: `scale(${v.scale}) rotate(${(t - at) * 40}deg)` }}>
          <path d="M12 1 C12.8 8 16 11.2 23 12 C16 12.8 12.8 16 12 23 C11.2 16 8 12.8 1 12 C8 11.2 11.2 8 12 1 Z" fill={i % 2 ? C.acentoSuave : C.acento} />
        </svg>
      );
    })}
  </>
);

/** Texto en monoespaciada (comandos). */
export const Comando: React.FC<{ texto: React.ReactNode; size?: number; color?: string; fondo?: string }> = ({ texto, size = 44, color = C.acento, fondo = C.panel2 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", padding: `${size * 0.22}px ${size * 0.5}px`, borderRadius: size * 0.3, background: fondo, border: `3px solid ${C.borde}`, fontFamily: MONO, fontWeight: 700, fontSize: size, color, whiteSpace: "nowrap" }}>{texto}</div>
);
