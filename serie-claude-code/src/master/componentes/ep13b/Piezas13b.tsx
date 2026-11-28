/**
 * EP.13 v2 · Piezas propias, dibujadas en plano y en coral (nada de logos de marca: esos son siempre los archivos del
 * usuario). Caja de herramientas «MÓDULO 1», portátil con cursor, archivo CLAUDE.md, flecha de deshacer, tablero de
 * tareas, personas, escudo con candado, urna, reloj, bocadillo, cartas de las cinco opciones y contador.
 * Todo depende de parámetros que salen de t: nada de transiciones CSS ni temporizadores.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, TITULO, UI, clamp01, sp } from "../../nucleo";

export const CREMA = "#F3EEE4";

/** Sacudida de cámara breve tras un golpe en `at` (devuelve desplazamiento en px). */
export const temblor = (t: number, ats: number[], amp = 14) => {
  let x = 0;
  let y = 0;
  ats.forEach((at, i) => {
    const d = t - at;
    if (d < 0 || d > 0.45) return;
    const k = amp * (1 - d / 0.45) ** 2;
    x += Math.sin(d * 83 + i) * k;
    y += Math.cos(d * 71 + i * 2) * k * 0.7;
  });
  return { x, y };
};

/** Destello de pantalla completa (blanco o coral) que se apaga en `dur` s. */
export const Flash: React.FC<{ t: number; at: number; dur?: number; color?: string; max?: number }> = ({ t, at, dur = 0.4, color = "#FFFFFF", max = 0.85 }) => {
  const d = t - at;
  if (d < 0 || d > dur) return null;
  return <div style={{ position: "absolute", inset: 0, background: color, opacity: max * (1 - d / dur) ** 1.6, pointerEvents: "none" }} />;
};

/** Número con puntos de miles (9.098). */
export const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// ── caja de herramientas ──────────────────────────────────────────────────────────────────────────────────────────
/** Caja de herramientas de frente. (x, y) = centro de la base. abre 0 → 1: la tapa se levanta hacia atrás. */
export const Caja: React.FC<{ x: number; y: number; w: number; abre: number; brillo?: number; texto?: string; aplasta?: number }> = ({
  x, y, w, abre, brillo = 0, texto = "MÓDULO 1", aplasta = 0,
}) => {
  const h = w * 0.56;
  const tapaH = w * 0.16;
  const ang = -118 * clamp01(abre);
  const sq = 1 - 0.08 * aplasta;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transform: `scale(${1 + 0.06 * aplasta}, ${sq})`, transformOrigin: "50% 100%" }}>
      {brillo > 0 && <div style={{ position: "absolute", left: -w * 0.3, right: -w * 0.3, top: -w * 0.5, bottom: -w * 0.1, background: `radial-gradient(closest-side, ${C.acento}${Math.round(brillo * 120).toString(16).padStart(2, "0")}, transparent)` }} />}
      {/* interior (se ve cuando se abre) */}
      <div style={{ position: "absolute", left: w * 0.04, right: w * 0.04, top: -2, height: h * 0.3, background: "#07080B", borderRadius: `${w * 0.02}px ${w * 0.02}px 0 0`, opacity: clamp01(abre * 3) }} />
      {/* asa */}
      <div style={{ position: "absolute", left: w * 0.36, width: w * 0.28, top: -tapaH - w * 0.12, height: w * 0.14, border: `${w * 0.035}px solid ${C.acento}`, borderBottom: "none", borderRadius: `${w * 0.06}px ${w * 0.06}px 0 0`, transformOrigin: `${-w * 0.36 + w * 0.04}px ${w * 0.14 + tapaH}px`, transform: `rotate(${ang}deg)` }} />
      {/* tapa: gira por la bisagra de la izquierda */}
      <div style={{ position: "absolute", left: 0, top: -tapaH, width: w, height: tapaH, background: "#C5654A", borderRadius: `${w * 0.04}px ${w * 0.04}px ${w * 0.01}px ${w * 0.01}px`, transformOrigin: `${w * 0.04}px 100%`, transform: `rotate(${ang}deg)`, boxShadow: "0 -6px 20px rgba(0,0,0,0.35)" }} />
      {/* cuerpo */}
      <div style={{ position: "absolute", inset: 0, background: C.acento, borderRadius: `${w * 0.015}px ${w * 0.015}px ${w * 0.05}px ${w * 0.05}px`, boxShadow: `0 ${w * 0.06}px ${w * 0.12}px rgba(0,0,0,0.55)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.16, height: h * 0.1, background: "#B85A40" }} />
        <div style={{ marginTop: h * 0.12, fontFamily: TITULO, fontWeight: 800, fontSize: w * 0.13, color: C.oscuro, letterSpacing: 1 }}>{texto}</div>
        <div style={{ position: "absolute", left: w * 0.44, width: w * 0.12, top: h * 0.1, height: h * 0.2, background: "#E9C9B9", borderRadius: w * 0.02, border: `${w * 0.012}px solid ${C.oscuro}` }} />
      </div>
    </div>
  );
};

// ── iconos planos ────────────────────────────────────────────────────────────────────────────────────────────────
export const Portatil: React.FC<{ w: number; cursor: number; clic?: number }> = ({ w, cursor, clic = 0 }) => {
  const cx = 0.25 + 0.45 * cursor;
  const cy = 0.62 - 0.32 * Math.sin(cursor * Math.PI * 0.9);
  return (
    <svg width={w} height={w * 0.72} viewBox="0 0 100 72">
      <rect x={14} y={4} width={72} height={48} rx={4} fill={C.panel2} stroke={C.acento} strokeWidth={3.5} />
      <rect x={20} y={10} width={26} height={5} rx={2} fill={C.acento} opacity={0.8} />
      <rect x={20} y={19} width={40} height={4} rx={2} fill={C.borde} />
      <rect x={20} y={26} width={32} height={4} rx={2} fill={C.borde} />
      <rect x={56} y={34} width={22} height={10} rx={3} fill={C.acento} opacity={0.35 + 0.65 * clic} />
      <path d="M4 56 H96 L90 66 H10 Z" fill={C.acento} />
      <g transform={`translate(${14 + 72 * cx} ${4 + 48 * cy}) scale(${1 - 0.2 * Math.sin(clamp01(clic) * Math.PI)})`}>
        <path d="M0 0 L0 13 L3.5 9.8 L6 15 L8.4 14 L6 8.8 L10.5 8.6 Z" fill="#FFFFFF" stroke={C.oscuro} strokeWidth={1.2} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

export const ArchivoMd: React.FC<{ w: number; logo: string; lineas: number }> = ({ w, logo, lineas }) => (
  <div style={{ width: w, height: w * 1.25, background: CREMA, borderRadius: w * 0.06, position: "relative", boxShadow: "0 18px 40px rgba(0,0,0,0.5)", clipPath: `polygon(0 0, 78% 0, 100% 17%, 100% 100%, 0 100%)` }}>
    <div style={{ position: "absolute", right: 0, top: 0, width: w * 0.22, height: w * 0.22, background: C.acento, clipPath: "polygon(0 0, 100% 100%, 0 100%)" }} />
    <Img src={staticFile(logo)} style={{ position: "absolute", left: w * 0.1, top: w * 0.1, width: w * 0.2 }} />
    <div style={{ position: "absolute", left: w * 0.1, top: w * 0.36, fontFamily: MONO, fontWeight: 700, fontSize: w * 0.13, color: C.oscuro }}>CLAUDE.md</div>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ position: "absolute", left: w * 0.1, top: w * (0.62 + i * 0.14), height: w * 0.06, borderRadius: w * 0.03, background: i === 0 ? C.acento : "#C9C2B4", width: w * [0.7, 0.55, 0.75, 0.45][i] * clamp01(lineas * 4 - i) }} />
    ))}
  </div>
);

export const Deshacer: React.FC<{ w: number; gira: number }> = ({ w, gira }) => (
  <svg width={w} height={w} viewBox="0 0 100 100" style={{ transform: `rotate(${-360 * gira}deg)` }}>
    <circle cx={50} cy={50} r={46} fill={C.panel2} stroke={C.acento} strokeWidth={4} />
    <path d="M30 40 A24 24 0 1 1 30 64" fill="none" stroke={C.acento} strokeWidth={9} strokeLinecap="round" />
    <path d="M14 34 L32 26 L36 46 Z" fill={C.acento} stroke={C.acento} strokeWidth={4} strokeLinejoin="round" />
  </svg>
);

/** Tablero de tareas: tres columnas; p 0 → 1 mueve las tarjetas de «por hacer» a «hecho». */
export const Tablero: React.FC<{ w: number; p: number }> = ({ w, p }) => {
  const col = w / 3;
  const tarjetas = [0, 1, 2];
  return (
    <div style={{ width: w, height: w * 0.78, background: C.panel, border: `3px solid ${C.borde}`, borderRadius: w * 0.05, position: "relative", overflow: "hidden" }}>
      {["PLAN", "EN CURSO", "HECHO"].map((n, i) => (
        <div key={n} style={{ position: "absolute", left: col * i, top: 0, width: col, height: "100%", borderRight: i < 2 ? `2px dashed ${C.borde}` : undefined }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: w * 0.05, color: i === 2 ? C.acento : C.gris, textAlign: "center", marginTop: w * 0.04 }}>{n}</div>
        </div>
      ))}
      {tarjetas.map((k) => {
        const u = clamp01(p * 3 - k * 0.7);
        const c = Math.min(2, u * 2);
        return (
          <div key={k} style={{ position: "absolute", left: col * c + col * 0.12, top: w * (0.16 + k * 0.19), width: col * 0.76, height: w * 0.14, borderRadius: w * 0.025, background: c >= 1.99 ? C.acento : C.panel2, border: `2px solid ${C.acento}`, display: "flex", alignItems: "center", paddingLeft: w * 0.02, boxSizing: "border-box" }}>
            <div style={{ width: col * 0.4, height: w * 0.03, borderRadius: 4, background: c >= 1.99 ? C.oscuro : C.gris }} />
          </div>
        );
      })}
    </div>
  );
};

export const Persona: React.FC<{ w: number; color?: string }> = ({ w, color = C.acento }) => (
  <svg width={w} height={w * 1.1} viewBox="0 0 100 110">
    <circle cx={50} cy={30} r={24} fill={color} />
    <path d="M8 110 C8 72 28 60 50 60 C72 60 92 72 92 110 Z" fill={color} />
  </svg>
);

/** Escudo con candado. cierra 0 → 1 baja el arco del candado. */
export const Escudo: React.FC<{ w: number; cierra: number; brillo?: number }> = ({ w, cierra, brillo = 0 }) => (
  <svg width={w} height={w * 1.18} viewBox="0 0 100 118" style={{ overflow: "visible", filter: brillo > 0 ? `drop-shadow(0 0 ${24 * brillo}px ${C.acento})` : undefined }}>
    <path d="M50 4 L92 18 V54 C92 84 72 104 50 114 C28 104 8 84 8 54 V18 Z" fill={C.panel2} stroke={C.acento} strokeWidth={5} strokeLinejoin="round" />
    <g transform={`translate(0 ${-12 * (1 - clamp01(cierra))})`}>
      <path d="M36 58 V46 A14 14 0 0 1 64 46 V58" fill="none" stroke={CREMA} strokeWidth={7} strokeLinecap="round" />
    </g>
    <rect x={30} y={56} width={40} height={32} rx={6} fill={C.acento} />
    <circle cx={50} cy={70} r={4.5} fill={C.oscuro} />
    <rect x={48} y={70} width={4} height={10} rx={2} fill={C.oscuro} />
  </svg>
);

/** Urna con una papeleta que cae por la ranura (cae 0 → 1). */
export const Urna: React.FC<{ w: number; cae: number }> = ({ w, cae }) => {
  const y = -70 + 92 * clamp01(cae);
  return (
    <svg width={w} height={w * 0.95} viewBox="0 -75 100 170" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id="urna-hueco">
          <rect x={-20} y={-90} width={140} height={110} />
        </clipPath>
      </defs>
      <g clipPath="url(#urna-hueco)">
        <g transform={`translate(30 ${y}) rotate(${-8 * (1 - clamp01(cae))})`}>
          <rect x={0} y={0} width={40} height={52} rx={3} fill={CREMA} stroke={C.oscuro} strokeWidth={2.5} />
          <path d="M8 26 L16 34 L31 16" fill="none" stroke={C.acento} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <rect x={4} y={20} width={92} height={72} rx={6} fill={C.acento} />
      <rect x={4} y={20} width={92} height={10} fill="#B85A40" />
      <rect x={26} y={16} width={48} height={8} rx={4} fill={C.oscuro} />
      <text x={50} y={72} textAnchor="middle" fontFamily={TITULO} fontWeight={800} fontSize={22} fill={C.oscuro}>VOTA</text>
    </svg>
  );
};

/** Reloj con agujas (vueltas = cuántas vueltas ha dado el minutero). */
export const Reloj: React.FC<{ w: number; vueltas: number }> = ({ w, vueltas }) => (
  <svg width={w} height={w} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={45} fill={C.panel2} stroke={C.acento} strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1={50} y1={10} x2={50} y2={i % 3 === 0 ? 18 : 15} stroke={i % 3 === 0 ? C.acento : C.gris} strokeWidth={3} transform={`rotate(${i * 30} 50 50)`} />
    ))}
    <line x1={50} y1={50} x2={50} y2={28} stroke={CREMA} strokeWidth={6} strokeLinecap="round" transform={`rotate(${vueltas * 30} 50 50)`} />
    <line x1={50} y1={50} x2={50} y2={17} stroke={C.acento} strokeWidth={4} strokeLinecap="round" transform={`rotate(${vueltas * 360} 50 50)`} />
    <circle cx={50} cy={50} r={5} fill={CREMA} />
  </svg>
);

export const Bocadillo: React.FC<{ children: React.ReactNode; size?: number; acento?: boolean }> = ({ children, size = 40, acento = false }) => (
  <div style={{ position: "relative", padding: `${size * 0.45}px ${size * 0.7}px`, borderRadius: size * 0.6, background: acento ? C.acento : C.panel2, border: `3px solid ${C.acento}`, fontFamily: UI, fontWeight: 700, fontSize: size, color: acento ? C.oscuro : C.texto, whiteSpace: "nowrap", boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}>
    {children}
    <div style={{ position: "absolute", left: size * 0.8, bottom: -size * 0.42, width: size * 0.6, height: size * 0.5, background: acento ? C.acento : C.panel2, borderLeft: `3px solid ${C.acento}`, borderBottom: `3px solid ${C.acento}`, transform: "skewX(-30deg)" }} />
  </div>
);

/** Anillo de historia de Instagram (degradado coral) con el logo dentro. */
export const AnilloHistoria: React.FC<{ w: number; logo: string; gira: number }> = ({ w, logo, gira }) => (
  <div style={{ width: w, height: w, borderRadius: "50%", background: `conic-gradient(from ${gira * 360}deg, ${C.acento}, #F4C26B, ${C.acento}, #C2477A, ${C.acento})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: w * 0.88, height: w * 0.88, borderRadius: "50%", background: C.fondo, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile(logo)} style={{ width: w * 0.62 }} />
    </div>
  </div>
);

// ── cartas de las opciones ───────────────────────────────────────────────────────────────────────────────────────
/** Carta de una opción. giro 0 = dorso («?»), 1 = cara (número, icono y palabra). */
export const CartaOpcion: React.FC<{ w: number; giro: number; n: number; palabra: string; sub: string; activa?: number; children?: React.ReactNode }> = ({
  w, giro, n, palabra, sub, activa = 0, children,
}) => {
  const h = w * 1.4;
  const ang = 180 * (1 - clamp01(giro));
  const r = w * 0.07;
  const sombra = `0 ${w * 0.08}px ${w * 0.2}px rgba(0,0,0,0.6), 0 0 ${w * 0.25 * activa}px rgba(217,119,87,${0.75 * activa})`;
  const cara: React.CSSProperties = { position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: r, overflow: "hidden", boxSizing: "border-box", boxShadow: sombra };
  return (
    <div style={{ width: w, height: h, perspective: w * 4 }}>
      <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d", transform: `rotateY(${ang}deg)` }}>
        {/* cara */}
        <div style={{ ...cara, background: C.panel, border: `${w * 0.02}px solid ${C.acento}` }}>
          <div style={{ height: w * 0.2, background: C.acento, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${w * 0.07}px` }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: w * 0.075, color: C.oscuro, letterSpacing: 2 }}>OPCIÓN</div>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: w * 0.13, color: C.oscuro }}>{n}/5</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: w * 0.2, height: w * 0.78, display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: `radial-gradient(${C.borde} ${w * 0.008}px, transparent ${w * 0.011}px)`, backgroundSize: `${w * 0.08}px ${w * 0.08}px` }}>
            {children}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: w * 0.07, textAlign: "center" }}>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: w * (palabra.length > 7 ? 0.15 : 0.2), color: C.texto, letterSpacing: -1, lineHeight: 1 }}>{palabra}</div>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: w * 0.065, color: C.acento, marginTop: w * 0.03, letterSpacing: 1 }}>{sub}</div>
          </div>
        </div>
        {/* dorso */}
        <div style={{ ...cara, transform: "rotateY(180deg)", background: C.acento, border: `${w * 0.02}px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0 ${w * 0.03}px, transparent ${w * 0.03}px ${w * 0.06}px)` }}>
          <div style={{ position: "absolute", inset: w * 0.06, borderRadius: r * 0.7, border: `${w * 0.012}px solid ${C.oscuro}55` }} />
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: w * 0.6, color: C.oscuro, lineHeight: 1 }}>?</div>
        </div>
      </div>
    </div>
  );
};

/** Entrada con muelle (escala, opacidad, giro) en `at`. */
export const entra = (t: number, at: number, cfg: { damping?: number; stiffness?: number } = {}) => {
  const s = sp(t, at, { damping: 12, stiffness: 200, ...cfg });
  return { s, op: clamp01(s * 2), on: t >= at };
};
