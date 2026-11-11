/**
 * Iconos genéricos de la serie (trazo redondeado sobre una rejilla de 48). Son pictogramas, no logos: los logos de
 * marca siempre salen de los ficheros adjuntos (componente Logo). Los parámetros numéricos (0 → 1) permiten animarlos
 * desde el tiempo del reel.
 */
import React from "react";
import { C, clamp01 } from "../nucleo";

type Base = { s?: number; c?: string; trazo?: number; style?: React.CSSProperties };
const Svg: React.FC<Base & { children: React.ReactNode }> = ({ s = 96, style, children }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" style={{ display: "block", overflow: "visible", ...style }}>
    {children}
  </svg>
);
const st = (c: string, w: number) => ({ fill: "none", stroke: c, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

/** Trazo que se dibuja: p de 0 a 1. */
const dash = (largo: number, p: number) => ({ strokeDasharray: largo, strokeDashoffset: largo * (1 - clamp01(p)) });

export const Check: React.FC<Base & { p?: number }> = ({ c = C.acento, trazo = 5, p = 1, ...b }) => (
  <Svg {...b}>
    <path d="M10 25 L20 35 L38 14" {...st(c, trazo)} {...dash(46, p)} />
  </Svg>
);

export const Cruz: React.FC<Base & { p?: number }> = ({ c = C.acento, trazo = 5, p = 1, ...b }) => (
  <Svg {...b}>
    <path d="M12 12 L36 36" {...st(c, trazo)} {...dash(34, p * 2)} />
    <path d="M36 12 L12 36" {...st(c, trazo)} {...dash(34, p * 2 - 1)} />
  </Svg>
);

export const Bandera: React.FC<Base & { t?: number }> = ({ c = C.acento, trazo = 3, t = 0, ...b }) => {
  // la tela ondea con el tiempo
  const o = (k: number) => Math.sin(t * 5 + k) * 1.6;
  return (
    <Svg {...b}>
      <path d="M12 44 L12 5" {...st(C.texto, trazo)} />
      <path d={`M13 6 C 20 ${4 + o(0)}, 26 ${9 + o(1)}, 37 ${6 + o(2)} L 37 ${24 + o(2)} C 26 ${27 + o(1)}, 20 ${22 + o(0)}, 13 ${24}`} fill={c} stroke={c} strokeWidth={1.5} strokeLinejoin="round" />
      <ellipse cx={12} cy={44} rx={7} ry={2} fill={C.tenue} />
    </Svg>
  );
};

export const Servidor: React.FC<Base & { t?: number }> = ({ c = C.texto, trazo = 3, t = 0, ...b }) => (
  <Svg {...b}>
    {[6, 19, 32].map((y, i) => (
      <g key={i}>
        <rect x={6} y={y} width={36} height={10} rx={3} {...st(c, trazo)} />
        <circle cx={12.5} cy={y + 5} r={1.9} fill={Math.sin(t * 6 + i * 2.1) > -0.2 ? C.acento : C.tenue} />
        <path d={`M20 ${y + 5} L35 ${y + 5}`} {...st(C.gris, 2)} />
      </g>
    ))}
  </Svg>
);

export const Reloj: React.FC<Base & { t?: number }> = ({ c = C.texto, trazo = 3, t = 0, ...b }) => {
  const m = t * 2.4; // la aguja larga da una vuelta cada ~2,6 s: el reloj nunca se para
  const h = t * 0.2;
  return (
    <Svg {...b}>
      <circle cx={24} cy={24} r={19} {...st(c, trazo)} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={24 + Math.sin(a) * 15.5} cy={24 - Math.cos(a) * 15.5} r={i % 3 === 0 ? 1.3 : 0.7} fill={C.gris} />;
      })}
      <path d={`M24 24 L${24 + Math.sin(h) * 8} ${24 - Math.cos(h) * 8}`} {...st(c, trazo)} />
      <path d={`M24 24 L${24 + Math.sin(m) * 13} ${24 - Math.cos(m) * 13}`} {...st(C.acento, 2.4)} />
      <circle cx={24} cy={24} r={2.2} fill={C.acento} />
    </Svg>
  );
};

export const Candado: React.FC<Base & { abierto?: number }> = ({ c = C.texto, trazo = 3, abierto = 0, ...b }) => {
  const sube = clamp01(abierto) * 7;
  return (
    <Svg {...b}>
      <g transform={`translate(${clamp01(abierto) * 5} ${-sube}) rotate(${-clamp01(abierto) * 22} 33 21)`}>
        <path d="M15 21 L15 15 A9 9 0 0 1 33 15 L33 21" {...st(c, trazo)} />
      </g>
      <rect x={10} y={21} width={28} height={21} rx={4} fill={c} />
      <circle cx={24} cy={30} r={2.6} fill={C.fondo} />
      <path d="M24 31 L24 36" {...st(C.fondo, 2.6)} />
    </Svg>
  );
};

export const Llave: React.FC<Base> = ({ c = C.texto, trazo = 3, ...b }) => (
  <Svg {...b}>
    <circle cx={15} cy={17} r={8} {...st(c, trazo)} />
    <circle cx={15} cy={17} r={2.4} fill={c} />
    <path d="M21 22 L40 41 M33 34 L37 30 M37 38 L41 34" {...st(c, trazo)} />
  </Svg>
);

export const Movil: React.FC<Base & { encendido?: number }> = ({ c = C.texto, trazo = 3, encendido = 1, ...b }) => (
  <Svg {...b}>
    <rect x={12} y={4} width={24} height={40} rx={5} {...st(c, trazo)} />
    <rect x={15.5} y={9} width={17} height={28} rx={2} fill={C.acento} opacity={0.15 + 0.85 * clamp01(encendido)} />
    {encendido > 0.3 && (
      <g opacity={clamp01((encendido - 0.3) / 0.7)}>
        <rect x={18} y={12} width={12} height={4} rx={1.5} fill={C.fondo} />
        <rect x={18} y={19} width={5} height={5} rx={1.2} fill={C.fondo} />
        <rect x={25} y={19} width={5} height={5} rx={1.2} fill={C.fondo} />
        <rect x={18} y={27} width={12} height={6} rx={1.5} fill={C.fondo} opacity={0.6} />
      </g>
    )}
    <path d="M21 40.5 L27 40.5" {...st(c, 2)} />
  </Svg>
);

export const Monitor: React.FC<Base & { tachado?: number; encendido?: number }> = ({ c = C.texto, trazo = 3, tachado = 0, encendido = 0, ...b }) => (
  <Svg {...b}>
    <rect x={5} y={8} width={38} height={25} rx={3} {...st(c, trazo)} />
    {encendido > 0 && <rect x={8.5} y={11.5} width={31} height={18} rx={1.5} fill={C.acento} opacity={0.85 * clamp01(encendido)} />}
    <path d="M18 41 L30 41 M24 33 L24 41" {...st(c, trazo)} />
    {tachado > 0 && <path d="M6 42 L42 6" {...st(C.acento, trazo + 1)} {...dash(51, tachado)} />}
  </Svg>
);

export const Carpeta: React.FC<Base & { abierta?: number; relleno?: string }> = ({ c = C.acento, abierta = 0, relleno, ...b }) => {
  const a = clamp01(abierta);
  return (
    <Svg {...b}>
      <path d="M4 12 A3 3 0 0 1 7 9 L18 9 L22 13 L41 13 A3 3 0 0 1 44 16 L44 39 A3 3 0 0 1 41 42 L7 42 A3 3 0 0 1 4 39 Z" fill={relleno ?? c} opacity={0.75} />
      {/* tapa: se abre hacia delante */}
      <path d={`M4 ${19 + a * 6} A3 3 0 0 1 7 ${16 + a * 6} L41 ${16 + a * 6} A3 3 0 0 1 44 ${19 + a * 6} L44 39 A3 3 0 0 1 41 42 L7 42 A3 3 0 0 1 4 39 Z`} fill={relleno ?? c} />
    </Svg>
  );
};

export const Documento: React.FC<Base & { tipo?: "texto" | "esquema" }> = ({ c = C.texto, trazo = 2.6, tipo = "texto", ...b }) => (
  <Svg {...b}>
    <path d="M11 4 L30 4 L39 13 L39 44 L11 44 Z" fill={C.panel2} {...{ stroke: c, strokeWidth: trazo, strokeLinejoin: "round" }} />
    <path d="M30 4 L30 13 L39 13" {...st(c, trazo)} />
    {tipo === "texto" ? (
      <path d="M16 20 L34 20 M16 26 L34 26 M16 32 L28 32" {...st(C.gris, 2.4)} />
    ) : (
      <g>
        <rect x={15} y={18} width={8} height={6} rx={1.5} fill={C.acento} />
        <rect x={27} y={18} width={8} height={6} rx={1.5} fill={C.gris} />
        <rect x={21} y={32} width={8} height={6} rx={1.5} fill={C.acento} />
        <path d="M19 24 L24 32 M31 24 L26 32" {...st(C.gris, 1.8)} />
      </g>
    )}
  </Svg>
);

export const Guardar: React.FC<Base> = ({ c = C.texto, trazo = 3, ...b }) => (
  <Svg {...b}>
    <path d="M7 7 L35 7 L41 13 L41 41 L7 41 Z" {...st(c, trazo)} />
    <rect x={14} y={7} width={17} height={10} fill={c} opacity={0.9} />
    <rect x={13} y={25} width={22} height={13} rx={1.5} fill={C.acento} />
  </Svg>
);

export const Deshacer: React.FC<Base & { p?: number }> = ({ c = C.acento, trazo = 4, p = 1, ...b }) => (
  <Svg {...b}>
    <path d="M14 18 L32 18 A10 10 0 0 1 32 38 L18 38" {...st(c, trazo)} {...dash(54, p)} />
    <path d="M20 10 L12 18 L20 26" {...st(c, trazo)} opacity={clamp01(p * 3)} />
  </Svg>
);

export const Cohete: React.FC<Base & { t?: number; llama?: number }> = ({ c = C.texto, trazo = 2.6, t = 0, llama = 1, ...b }) => {
  const f = 1 + Math.sin(t * 40) * 0.18 + Math.sin(t * 23) * 0.1;
  return (
    <Svg {...b}>
      {llama > 0 && (
        <path d={`M19 37 Q24 ${37 + 12 * llama * f} 29 37 Z`} fill={C.acento} opacity={clamp01(llama)} />
      )}
      {llama > 0 && <path d={`M21.5 37 Q24 ${37 + 6 * llama * f} 26.5 37 Z`} fill={C.acentoSuave} opacity={clamp01(llama)} />}
      <path d="M24 4 C 33 10, 33 26, 30 36 L18 36 C 15 26, 15 10, 24 4 Z" fill={C.panel2} stroke={c} strokeWidth={trazo} strokeLinejoin="round" />
      <circle cx={24} cy={18} r={4} fill={C.acento} stroke={c} strokeWidth={2} />
      <path d="M17 27 L10 35 L18 34 M31 27 L38 35 L30 34" fill={C.acento} stroke={c} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
};

export const Moneda: React.FC<Base & { giro?: number }> = ({ c = C.acento, giro = 0, ...b }) => {
  // giro en radianes: la moneda se achata como si girara sobre su eje vertical
  const k = Math.abs(Math.cos(giro));
  return (
    <Svg {...b}>
      <g transform={`translate(24 24) scale(${Math.max(0.08, k)} 1) translate(-24 -24)`}>
        <circle cx={24} cy={24} r={20} fill={c} />
        <circle cx={24} cy={24} r={15.5} fill="none" stroke={C.oscuro} strokeOpacity={0.35} strokeWidth={2} />
        <path d="M30.5 16.5 A9 9 0 1 0 30.5 31.5 M14.5 21.5 L27 21.5 M14.5 26.5 L27 26.5" {...st(C.oscuro, 3)} strokeOpacity={0.75} />
      </g>
    </Svg>
  );
};

export const Persona: React.FC<Base & { relleno?: string }> = ({ c = C.texto, relleno, ...b }) => (
  <Svg {...b}>
    <circle cx={24} cy={16} r={8} fill={relleno ?? c} />
    <path d="M8 43 C 8 32, 16 27, 24 27 C 32 27, 40 32, 40 43 Z" fill={relleno ?? c} />
  </Svg>
);

export const Escudo: React.FC<Base & { p?: number }> = ({ c = C.texto, trazo = 3, p = 1, ...b }) => (
  <Svg {...b}>
    <path d="M24 4 L40 10 L40 22 C 40 33, 32 40, 24 44 C 16 40, 8 33, 8 22 L8 10 Z" {...st(c, trazo)} />
    <path d="M16 24 L22 30 L33 18" {...st(C.acento, 4)} {...dash(26, p)} />
  </Svg>
);

export const Globo: React.FC<Base> = ({ c = C.texto, trazo = 2.6, ...b }) => (
  <Svg {...b}>
    <circle cx={24} cy={24} r={18} {...st(c, trazo)} />
    <ellipse cx={24} cy={24} rx={8} ry={18} {...st(c, trazo)} />
    <path d="M6 24 L42 24 M9 15 L39 15 M9 33 L39 33" {...st(c, trazo)} />
  </Svg>
);

export const OjoTachado: React.FC<Base & { p?: number }> = ({ c = C.texto, trazo = 3, p = 1, ...b }) => (
  <Svg {...b}>
    <path d="M4 24 C 10 14, 17 10, 24 10 C 31 10, 38 14, 44 24 C 38 34, 31 38, 24 38 C 17 38, 10 34, 4 24 Z" {...st(c, trazo)} />
    <circle cx={24} cy={24} r={6} fill={c} />
    <path d="M8 40 L40 8" {...st(C.acento, trazo + 1)} {...dash(46, p)} />
  </Svg>
);

export const Enlace: React.FC<Base> = ({ c = C.texto, trazo = 3.4, ...b }) => (
  <Svg {...b}>
    <path d="M21 27 A7 7 0 0 0 31 27 L38 20 A7 7 0 0 0 28 10 L25 13" {...st(c, trazo)} />
    <path d="M27 21 A7 7 0 0 0 17 21 L10 28 A7 7 0 0 0 20 38 L23 35" {...st(c, trazo)} />
  </Svg>
);

export const Lupa: React.FC<Base> = ({ c = C.texto, trazo = 3.4, ...b }) => (
  <Svg {...b}>
    <circle cx={20} cy={20} r={12} {...st(c, trazo)} />
    <path d="M29 29 L42 42" {...st(c, trazo + 1.5)} />
  </Svg>
);

export const Bicho: React.FC<Base> = ({ c = C.acento, trazo = 2.6, ...b }) => (
  <Svg {...b}>
    <ellipse cx={24} cy={28} rx={9} ry={12} fill={c} />
    <circle cx={24} cy={14} r={5.5} fill={c} />
    <path d="M24 18 L24 40" {...st(C.oscuro, 1.8)} />
    <path d="M15 22 L8 18 M15 29 L7 29 M15 36 L9 41 M33 22 L40 18 M33 29 L41 29 M33 36 L39 41 M21 10 L18 5 M27 10 L30 5" {...st(c, trazo)} />
  </Svg>
);

export const Codigo: React.FC<Base> = ({ c = C.texto, trazo = 3.6, ...b }) => (
  <Svg {...b}>
    <path d="M16 14 L6 24 L16 34 M32 14 L42 24 L32 34 M27 10 L21 38" {...st(c, trazo)} />
  </Svg>
);

export const Alerta: React.FC<Base> = ({ c = C.acento, trazo = 3.4, ...b }) => (
  <Svg {...b}>
    <path d="M24 6 L44 41 L4 41 Z" fill={c} stroke={c} strokeWidth={trazo} strokeLinejoin="round" />
    <path d="M24 18 L24 29" {...st(C.oscuro, 4)} />
    <circle cx={24} cy={35} r={2.4} fill={C.oscuro} />
  </Svg>
);

export const Engranaje: React.FC<Base & { giro?: number }> = ({ c = C.texto, giro = 0, ...b }) => (
  <Svg {...b}>
    <g transform={`rotate(${giro} 24 24)`}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={21} y={3} width={6} height={9} rx={1.5} fill={c} transform={`rotate(${i * 45} 24 24)`} />
      ))}
      <circle cx={24} cy={24} r={13} fill={c} />
      <circle cx={24} cy={24} r={5.5} fill={C.fondo} />
    </g>
  </Svg>
);

export const LlaveInglesa: React.FC<Base> = ({ c = C.texto, ...b }) => (
  <Svg {...b}>
    <path d="M30 6 A10 10 0 0 0 23 21 L7 37 A3.5 3.5 0 0 0 12 42 L28 26 A10 10 0 0 0 43 19 L36 23 L30 19 L29 12 Z" fill={c} />
  </Svg>
);

export const Mejora: React.FC<Base & { p?: number }> = ({ c = C.texto, trazo = 3.6, p = 1, ...b }) => (
  <Svg {...b}>
    <path d="M6 38 L17 27 L25 33 L41 14" {...st(c, trazo)} {...dash(52, p)} />
    <path d="M31 14 L41 14 L41 24" {...st(c, trazo)} opacity={clamp01(p * 2 - 1)} />
  </Svg>
);

export const Cursor: React.FC<Base> = ({ c = C.texto, ...b }) => (
  <Svg {...b}>
    <path d="M10 5 L10 38 L18.5 30.5 L24 43 L30 40.5 L24.5 28 L36 28 Z" fill={c} stroke={C.oscuro} strokeWidth={2.4} strokeLinejoin="round" />
  </Svg>
);

export const Pulso: React.FC<Base & { t?: number }> = ({ c = C.acento, trazo = 3.4, t = 0, ...b }) => {
  // línea de pulso que avanza: el proyecto está vivo
  const off = (t * 40) % 96;
  return (
    <Svg {...b}>
      <path d="M2 26 L12 26 L16 16 L22 36 L27 10 L31 26 L46 26" {...st(c, trazo)} strokeDasharray="70 26" strokeDashoffset={-off} />
    </Svg>
  );
};

export const Comentario: React.FC<Base> = ({ c = C.gris, trazo = 3, ...b }) => (
  <Svg {...b}>
    <path d="M8 11 h32 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-18 l-9 7 v-7 h-5 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" {...st(c, trazo)} />
  </Svg>
);

export const Enviar: React.FC<Base> = ({ c = C.oscuro, ...b }) => (
  <Svg {...b}>
    <path d="M6 23 L42 6 L27 42 L22 27 Z" fill={c} />
  </Svg>
);

/** Extensiones: piezas que encajan, una se está añadiendo. */
export const Extensiones: React.FC<Base & { p?: number }> = ({ c = C.texto, p = 1, ...b }) => (
  <Svg {...b}>
    <rect x={6} y={6} width={16} height={16} rx={3.5} fill={c} />
    <rect x={6} y={26} width={16} height={16} rx={3.5} fill={c} />
    <rect x={26} y={26} width={16} height={16} rx={3.5} fill={c} />
    <rect x={26 + 6 * (1 - clamp01(p))} y={6 - 6 * (1 - clamp01(p))} width={16} height={16} rx={3.5} fill={C.acento} transform={`rotate(${(1 - clamp01(p)) * 20} 34 14)`} />
  </Svg>
);

/** Reglas: lista de tres con casillas marcadas. */
export const Reglas: React.FC<Base & { p?: number }> = ({ c = C.texto, trazo = 3, p = 1, ...b }) => (
  <Svg {...b}>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={5} y={6 + i * 13} width={10} height={10} rx={2.5} fill={clamp01(p * 3 - i) > 0.5 ? C.acento : "none"} stroke={C.acento} strokeWidth={2.2} />
        <path d={`M20 ${11 + i * 13} L43 ${11 + i * 13}`} {...st(c, trazo)} />
      </g>
    ))}
  </Svg>
);

/** Etiqueta de precio sin cifra (con interrogante): «los precios cambian». */
export const EtiquetaPrecio: React.FC<Base & { giro?: number }> = ({ c = C.acento, giro = 0, ...b }) => (
  <Svg {...b}>
    <g transform={`rotate(${giro} 24 24)`}>
      <path d="M26 5 L43 5 L43 22 L22 43 L5 26 Z" fill={c} stroke={C.oscuro} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={36} cy={12} r={3} fill={C.oscuro} />
      <path d="M19.5 22 A4.5 4.5 0 1 1 25 26.5 L24 30" fill="none" stroke={C.oscuro} strokeWidth={3} strokeLinecap="round" />
      <circle cx={23.4} cy={34.5} r={1.9} fill={C.oscuro} />
    </g>
  </Svg>
);

/** Icono por nombre (para los JSON). */
export const ICONOS: Record<string, React.FC<Base & { t?: number }>> = {
  meta: Bandera,
  bandera: Bandera,
  moneda: Moneda,
  servidor: Servidor,
  reloj: Reloj,
  candado: Candado,
  cohete: Cohete,
  carpeta: Carpeta,
  documento: Documento,
};
