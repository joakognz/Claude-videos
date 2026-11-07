/**
 * Iconos genéricos de trazo (no son logos de marca): cara, motor, memoria, ordenador, hosting, VPS, nube, reloj, luna,
 * candado, puzle, check… Se dibujan en un lienzo de 64x64 y se tiñen con `color`. Los logos de marca nunca se dibujan:
 * salen de los ficheros de public/logos.
 */
import React from "react";
import { C } from "../nucleo";

type P = { s?: number; color?: string; w?: number; style?: React.CSSProperties };
const Base: React.FC<P & { children: React.ReactNode }> = ({ s = 80, color = C.texto, w = 3.6, style, children }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
);

/** Cara = lo que ve el cliente (ventana de navegador). */
export const IconCara: React.FC<P> = (p) => (
  <Base {...p}>
    <rect x="6" y="10" width="52" height="44" rx="7" />
    <path d="M6 22 H58" />
    <circle cx="13" cy="16" r="1.6" fill={p.color ?? C.texto} />
    <circle cx="19" cy="16" r="1.6" fill={p.color ?? C.texto} />
    <rect x="13" y="29" width="16" height="17" rx="3" />
    <path d="M36 31 H50 M36 38 H50 M36 45 H46" />
  </Base>
);

/** Motor = lo que lo mueve todo (engranaje). */
export const IconMotor: React.FC<P & { giro?: number }> = ({ giro = 0, ...p }) => (
  <Base {...p}>
    <g transform={`rotate(${giro} 32 32)`}>
      <circle cx="32" cy="32" r="11" />
      <circle cx="32" cy="32" r="4" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <path key={i} d={`M${32 + Math.cos(a) * 16} ${32 + Math.sin(a) * 16} L${32 + Math.cos(a) * 24} ${32 + Math.sin(a) * 24}`} strokeWidth={(p.w ?? 3.6) * 2.1} />;
      })}
    </g>
  </Base>
);

/** Memoria = donde se guarda lo importante (base de datos). */
export const IconMemoria: React.FC<P> = (p) => (
  <Base {...p}>
    <ellipse cx="32" cy="14" rx="20" ry="7" />
    <path d="M12 14 V50 C12 54 21 57 32 57 C43 57 52 54 52 50 V14" />
    <path d="M12 26 C12 30 21 33 32 33 C43 33 52 30 52 26" />
    <path d="M12 38 C12 42 21 45 32 45 C43 45 52 42 52 38" />
  </Base>
);

export const IconOrdenador: React.FC<P> = (p) => (
  <Base {...p}>
    <rect x="11" y="14" width="42" height="29" rx="4" />
    <path d="M5 50 H59 L55 43 H9 Z" />
  </Base>
);

/** Hosting web = globo con meridianos. */
export const IconHosting: React.FC<P> = (p) => (
  <Base {...p}>
    <circle cx="32" cy="32" r="22" />
    <ellipse cx="32" cy="32" rx="9" ry="22" />
    <path d="M10 32 H54 M13 21 H51 M13 43 H51" />
  </Base>
);

/** VPS = servidor (tres bandejas con luces). */
export const IconVps: React.FC<P> = (p) => (
  <Base {...p}>
    {[8, 24, 40].map((y) => (
      <g key={y}>
        <rect x="8" y={y} width="48" height="14" rx="4" />
        <circle cx="16" cy={y + 7} r="1.8" fill={p.color ?? C.texto} />
        <path d={`M30 ${y + 7} H48`} />
      </g>
    ))}
  </Base>
);

export const IconNube: React.FC<P> = (p) => (
  <Base {...p}>
    <path d="M18 46 A11 11 0 0 1 17 24 A15 15 0 0 1 46 22 A12 12 0 0 1 47 46 Z" />
  </Base>
);

export const IconLuna: React.FC<P & { fill?: boolean }> = ({ fill, ...p }) => (
  <Base {...p}>
    <path d="M44 41 A19 19 0 1 1 25 12 A15 15 0 0 0 44 41 Z" fill={fill ? (p.color ?? C.texto) : "none"} />
  </Base>
);

/** Reloj con manillas que giran con t (segundos). */
export const IconReloj: React.FC<P & { t?: number }> = ({ t = 0, ...p }) => (
  <Base {...p}>
    <circle cx="32" cy="32" r="23" />
    <path d="M32 10 V13 M32 51 V54 M10 32 H13 M51 32 H54" />
    <path d={`M32 32 L${32 + Math.sin(t * 6) * 15} ${32 - Math.cos(t * 6) * 15}`} />
    <path d={`M32 32 L${32 + Math.sin(t * 0.5) * 10} ${32 - Math.cos(t * 0.5) * 10}`} />
  </Base>
);

export const IconCandado: React.FC<P & { abierto?: number }> = ({ abierto = 0, ...p }) => (
  <Base {...p}>
    <rect x="13" y="29" width="38" height="28" rx="6" />
    <path d="M20 29 V21 A12 12 0 0 1 44 21 V29" transform={`rotate(${-abierto * 38} 20 29) translate(0 ${-abierto * 3})`} />
    <circle cx="32" cy="43" r="3.4" fill={p.color ?? C.texto} />
  </Base>
);

/** Extensión = pieza de puzle. */
export const IconPuzle: React.FC<P> = (p) => (
  <Base {...p}>
    <path d="M10 22 H24 A6 6 0 1 1 36 22 H50 V36 A6 6 0 1 0 50 48 V54 H10 Z" />
  </Base>
);

export const IconCheck: React.FC<P & { p?: number }> = ({ p: prog = 1, ...r }) => (
  <Base {...r} w={r.w ?? 6}>
    <path d="M14 33 L27 46 L51 18" strokeDasharray={60} strokeDashoffset={60 * (1 - prog)} />
  </Base>
);

export const IconDoc: React.FC<P> = (p) => (
  <Base {...p}>
    <path d="M16 6 H38 L50 18 V58 H16 Z" />
    <path d="M38 6 V18 H50" />
    <path d="M23 30 H43 M23 38 H43 M23 46 H36" />
  </Base>
);

/** Esquema = cajas unidas por líneas. */
export const IconEsquema: React.FC<P> = (p) => (
  <Base {...p}>
    <rect x="22" y="6" width="20" height="14" rx="3" />
    <rect x="5" y="42" width="20" height="14" rx="3" />
    <rect x="39" y="42" width="20" height="14" rx="3" />
    <path d="M32 20 V31 M15 42 V31 H49 V42" />
  </Base>
);

export const IconCubo: React.FC<P> = (p) => (
  <Base {...p}>
    <path d="M32 6 L56 19 V45 L32 58 L8 45 V19 Z" />
    <path d="M8 19 L32 32 L56 19 M32 32 V58" />
  </Base>
);

/** Base = pilares sobre una losa. */
export const IconBase: React.FC<P> = (p) => (
  <Base {...p}>
    <path d="M6 54 H58 M10 54 V24 H54 V54" />
    <path d="M32 10 L58 24 H6 Z" />
    <path d="M22 34 V48 M32 34 V48 M42 34 V48" />
  </Base>
);

export const IconCarpetaPlana: React.FC<P> = (p) => (
  <Base {...p}>
    <path d="M6 16 A4 4 0 0 1 10 12 H24 L30 19 H54 A4 4 0 0 1 58 23 V48 A4 4 0 0 1 54 52 H10 A4 4 0 0 1 6 48 Z" />
  </Base>
);

/** Signo de pregunta grande (texto con la tipografía de títulos). */
export const Pregunta: React.FC<{ s?: number; color?: string }> = ({ s = 200, color = C.acento }) => (
  <div style={{ fontFamily: "Sora, Inter, sans-serif", fontWeight: 800, fontSize: s, lineHeight: 1, color, textShadow: `0 0 40px ${color}66` }}>?</div>
);

export const IconFlechaArriba: React.FC<P> = (p) => (
  <Base {...p} w={p.w ?? 6}>
    <path d="M32 56 V10 M12 28 L32 8 L52 28" />
  </Base>
);
