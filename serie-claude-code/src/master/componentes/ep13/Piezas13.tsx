/**
 * EP.13 · Piezas propias: la carta de cada opción (dorso con número; cara con la ilustración del usuario, que se da la
 * vuelta en 3D), la caja de herramientas del módulo 1 (se abre, recibe piezas y se cierra), la fila de casillas del
 * módulo, iconos planos propios (rebobinar, plan, equipo, abanico de webs), un editor de flujos recreado con datos
 * ficticios y la caja de comentario de Instagram. Todo depende de t: nada de transiciones CSS ni temporizadores.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, TITULO, UI, clamp01, sp } from "../../nucleo";

export const OSC = "#0B0D12";
export const CREMA = "#F6EEDC";
const CORAL_CLARO = "#E8906F";
const CORAL_OSCURO = "#B65C40";

// ── carta de opción ───────────────────────────────────────────────────────────────────────────────────────────────
/** Carta 9:16. giro 0 = dorso (número), 1 = cara (ilustración). `activa` le da borde y brillo coral. */
export const Carta: React.FC<{ w: number; giro: number; numero?: number; img: string; activa?: number; tenue?: number }> = ({
  w, giro, numero, img, activa = 0, tenue = 1,
}) => {
  const h = (w * 16) / 9;
  const ang = 180 * (1 - clamp01(giro));
  const r = w * 0.07;
  const borde = w * 0.024;
  const sombra = `0 ${w * 0.08}px ${w * 0.2}px rgba(0,0,0,0.6), 0 0 ${w * 0.18 * activa}px rgba(217,119,87,${0.8 * activa})`;
  return (
    <div style={{ width: w, height: h, perspective: w * 4, opacity: tenue }}>
      <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d", transform: `rotateY(${ang}deg)` }}>
        <div
          style={{
            position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: r, overflow: "hidden",
            border: `${borde}px solid ${activa > 0.5 ? C.acento : CREMA}`, background: CREMA, boxShadow: sombra, boxSizing: "border-box",
          }}
        >
          <Img src={staticFile(img)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div
          style={{
            position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: r,
            background: C.panel2, border: `${borde}px solid ${C.acento}`, boxSizing: "border-box", boxShadow: sombra, overflow: "hidden",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            backgroundImage: `radial-gradient(${C.borde} ${w * 0.012}px, transparent ${w * 0.014}px)`, backgroundSize: `${w * 0.1}px ${w * 0.1}px`,
          }}
        >
          <div style={{ position: "absolute", inset: w * 0.06, borderRadius: r * 0.7, border: `${w * 0.008}px dashed ${C.acento}66` }} />
          {numero !== undefined && <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: w * 0.52, lineHeight: 1, color: C.acento }}>{numero}</div>}
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: numero !== undefined ? w * 0.16 : w * 0.46, lineHeight: 1.1, color: numero !== undefined ? C.gris : C.acento }}>?</div>
        </div>
      </div>
    </div>
  );
};

// ── caja de herramientas ──────────────────────────────────────────────────────────────────────────────────────────
/**
 * Caja de herramientas vista de frente. (x, y) es el centro del borde superior del cuerpo. abre 0 → 1 inclina la tapa
 * hacia atrás. Los hijos (en coordenadas del lienzo) se pintan entre el hueco y el frente: lo que cae dentro se tapa.
 */
export const CajaHerramientas: React.FC<{ x: number; y: number; w: number; abre: number; golpe?: number; opacity?: number; children?: React.ReactNode }> = ({
  x, y, w, abre, golpe = 0, opacity = 1, children,
}) => {
  const h = w * 0.4;
  const tapa = w * 0.1;
  const trazo = Math.max(4, w * 0.011);
  const a = clamp01(abre);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity }}>
      {/* tapa con asa: gira hacia atrás sobre su borde inferior */}
      <div style={{ position: "absolute", left: x - w / 2 - w * 0.015, top: y - tapa, width: w * 1.03, height: tapa, perspective: w * 2.2 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", transformOrigin: "50% 100%", transform: `rotateX(${a * 52}deg) translateY(${golpe * -6}px)` }}>
          <svg style={{ position: "absolute", left: "50%", top: -w * 0.13, transform: "translateX(-50%)", overflow: "visible" }} width={w * 0.36} height={w * 0.14} viewBox="0 0 100 40">
            <path d="M 10 40 L 10 16 A 12 12 0 0 1 22 4 L 78 4 A 12 12 0 0 1 90 16 L 90 40" fill="none" stroke={OSC} strokeWidth={13} strokeLinecap="round" />
            <path d="M 10 40 L 10 16 A 12 12 0 0 1 22 4 L 78 4 A 12 12 0 0 1 90 16 L 90 40" fill="none" stroke={C.gris} strokeWidth={6} strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", inset: 0, borderRadius: `${w * 0.03}px ${w * 0.03}px ${w * 0.008}px ${w * 0.008}px`, background: CORAL_CLARO, border: `${trazo}px solid ${OSC}`, boxSizing: "border-box" }} />
        </div>
      </div>
      {/* hueco: la pared de atrás, oscura */}
      {a > 0.02 && (
        <div style={{ position: "absolute", left: x - w * 0.47, top: y - w * 0.05 * a, width: w * 0.94, height: w * 0.08 * a + trazo, borderRadius: `${w * 0.02}px ${w * 0.02}px 0 0`, background: "#2A1A14", border: `${trazo}px solid ${OSC}`, borderBottom: "none", boxSizing: "border-box" }} />
      )}
      {children}
      {/* frente */}
      <div
        style={{
          position: "absolute", left: x - w / 2, top: y, width: w, height: h, borderRadius: `${w * 0.012}px ${w * 0.012}px ${w * 0.05}px ${w * 0.05}px`,
          background: C.acento, border: `${trazo}px solid ${OSC}`, boxSizing: "border-box", boxShadow: "0 40px 80px rgba(0,0,0,0.55)",
          transform: `scaleY(${1 - golpe * 0.04})`, transformOrigin: "50% 100%",
        }}
      >
        <div style={{ position: "absolute", left: -trazo, right: -trazo, top: h * 0.28, height: h * 0.12, background: CORAL_OSCURO, borderTop: `${trazo}px solid ${OSC}`, borderBottom: `${trazo}px solid ${OSC}` }} />
        <div style={{ position: "absolute", left: "50%", top: h * 0.2, width: w * 0.15, height: h * 0.3, transform: "translateX(-50%)", borderRadius: w * 0.015, background: "#D9D3C7", border: `${trazo}px solid ${OSC}`, boxSizing: "border-box" }}>
          <div style={{ position: "absolute", left: "50%", top: "50%", width: w * 0.03, height: w * 0.03, transform: "translate(-50%, -50%)", borderRadius: "50%", background: OSC }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: h * 0.12, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: w * 0.06, letterSpacing: w * 0.006, color: OSC }}>MÓDULO 1</div>
      </div>
    </div>
  );
};

/** Pieza que entra en `at`, cae dentro de la caja en `cae` y se queda asomando por el borde. */
export const PiezaCaja: React.FC<{
  t: number; at: number; cae: number; x0: number; y0: number; xf: number; yf: number; escalaFinal?: number; rot?: number; children: React.ReactNode;
}> = ({ t, at, cae, x0, y0, xf, yf, escalaFinal = 0.42, rot = 0, children }) => {
  if (t < at) return null;
  const s = sp(t, at, { damping: 13, stiffness: 170 });
  const d = 0.5;
  const u = clamp01((t - cae) / d);
  const k = u * u; // gravedad: acelera al caer
  const salto = u > 0 ? Math.sin(Math.min(1, u * 1.6) * Math.PI) * -60 * (1 - u) : 0;
  const x = x0 + (xf - x0) * u;
  const y = y0 + (yf - y0) * k + salto;
  const esc = (0.6 + 0.4 * s) * (1 + (escalaFinal - 1) * u);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${esc}) rotate(${rot * u + (1 - s) * -10}deg)`, opacity: clamp01(s * 1.8), whiteSpace: "nowrap" }}>{children}</div>
    </div>
  );
};

// ── fila de casillas del módulo ───────────────────────────────────────────────────────────────────────────────────
export const FilaModulo: React.FC<{ x: number; y: number; n: number; celda: number; hueco: number; t: number; enciende: (k: number) => number; late?: number; check?: (k: number) => number; opacity?: number }> = ({
  x, y, n, celda, hueco, t, enciende, late, check, opacity = 1,
}) => {
  const ancho = n * celda + (n - 1) * hueco;
  return (
    <div style={{ position: "absolute", left: x - ancho / 2, top: y - celda / 2, width: ancho, height: celda, opacity }}>
      {Array.from({ length: n }, (_, i) => {
        const k = i + 1;
        const at = enciende(k);
        const on = t >= at ? clamp01(sp(t, at, { damping: 10, stiffness: 220 })) : 0;
        const golpe = t >= at ? Math.sin(Math.min(1, sp(t, at, { damping: 10, stiffness: 220 })) * Math.PI) * 0.25 : 0;
        const latido = late !== undefined && k === n && t > late ? Math.max(0, Math.sin((t - late) * 6)) * 0.12 : 0;
        const ck = check ? clamp01((t - check(k)) / 0.3) : 0;
        return (
          <div
            key={k}
            style={{
              position: "absolute", left: i * (celda + hueco), top: 0, width: celda, height: celda, borderRadius: celda * 0.22, boxSizing: "border-box",
              background: on > 0 ? `color-mix(in srgb, ${C.acento} ${Math.round(on * 100)}%, ${C.panel2})` : C.panel2,
              border: `${Math.max(2, celda * 0.05)}px solid ${on > 0.5 || (late !== undefined && k === n) ? C.acento : C.borde}`,
              boxShadow: on > 0 ? `0 0 ${celda * 0.5 * on}px ${C.acento}88` : "none", transform: `scale(${1 + golpe + latido})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: celda * 0.4, color: on > 0.5 ? OSC : C.gris,
            }}
          >
            {ck > 0 ? (
              <svg width={celda * 0.62} height={celda * 0.62} viewBox="0 0 24 24">
                <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={OSC} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - ck)} />
              </svg>
            ) : (
              k
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── iconos planos propios (no son marcas) ─────────────────────────────────────────────────────────────────────────
/** Botón de rebobinar: dos triángulos que giran una vuelta hacia atrás cuando `gira` va de 0 a 1. */
export const Rebobinar: React.FC<{ s: number; gira: number }> = ({ s, gira }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: C.panel2, border: `${s * 0.04}px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${s * 0.3}px ${C.acento}55` }}>
    <svg width={s * 0.8} height={s * 0.8} viewBox="0 0 100 100" style={{ transform: `rotate(${-360 * gira}deg)` }}>
      <path d="M 50 14 A 36 36 0 1 1 18 66" fill="none" stroke={C.acento} strokeWidth={7} strokeLinecap="round" strokeDasharray="6 12" opacity={0.6} />
    </svg>
    <svg width={s * 0.5} height={s * 0.5} viewBox="0 0 24 24" style={{ position: "absolute" }}>
      <path d="M11.5 5 L3 12 L11.5 19 Z M21 5 L12.5 12 L21 19 Z" fill={C.texto} stroke={OSC} strokeWidth={1} strokeLinejoin="round" />
    </svg>
  </div>
);

/** Lista de plan: tres casillas que se marcan. */
export const Plan: React.FC<{ s: number; p: number }> = ({ s, p }) => (
  <div style={{ width: s * 0.82, height: s, borderRadius: s * 0.08, background: CREMA, border: `${s * 0.035}px solid ${OSC}`, boxSizing: "border-box", padding: `${s * 0.16}px ${s * 0.1}px`, display: "flex", flexDirection: "column", gap: s * 0.11, position: "relative" }}>
    <div style={{ position: "absolute", left: "50%", top: -s * 0.06, width: s * 0.34, height: s * 0.12, transform: "translateX(-50%)", borderRadius: s * 0.03, background: C.gris, border: `${s * 0.03}px solid ${OSC}` }} />
    {[0, 1, 2].map((i) => {
      const ck = clamp01(p * 3 - i);
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: s * 0.06 }}>
          <div style={{ width: s * 0.15, height: s * 0.15, borderRadius: s * 0.03, border: `${s * 0.025}px solid ${OSC}`, background: ck > 0 ? C.acento : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {ck > 0 && (
              <svg width={s * 0.12} height={s * 0.12} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={OSC} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - ck)} /></svg>
            )}
          </div>
          <div style={{ height: s * 0.06, flex: 1, borderRadius: s * 0.03, background: "#B9B1A3" }} />
        </div>
      );
    })}
  </div>
);

/** Abanico de webs: cinco miniaturas de página, cada una con su color, que se abren en abanico. */
export const AbanicoWebs: React.FC<{ s: number; p: number }> = ({ s, p }) => {
  const colores = ["#E8604C", "#F2B33D", "#2E9E8F", "#4C6FD6", C.acento];
  return (
    <div style={{ position: "relative", width: s, height: s }}>
      {colores.map((c, i) => {
        const k = i - 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: s * 0.25, top: s * 0.12, width: s * 0.5, height: s * 0.68, borderRadius: s * 0.05, background: "#FFFFFF",
              border: `${s * 0.02}px solid ${OSC}`, boxSizing: "border-box", transformOrigin: "50% 120%", transform: `rotate(${k * 17 * p}deg)`, overflow: "hidden",
              boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ height: s * 0.07, background: "#E2DDD3", borderBottom: `${s * 0.012}px solid ${OSC}` }} />
            <div style={{ margin: s * 0.03, height: s * 0.2, borderRadius: s * 0.02, background: c }} />
            <div style={{ margin: `0 ${s * 0.03}px`, height: s * 0.03, borderRadius: s * 0.015, background: "#C9C2B5" }} />
            <div style={{ margin: `${s * 0.02}px ${s * 0.03}px`, width: "60%", height: s * 0.03, borderRadius: s * 0.015, background: "#C9C2B5" }} />
          </div>
        );
      })}
    </div>
  );
};

/** Equipo: tres figuras (la del centro, coral) para «reparte el trabajo». */
export const Equipo: React.FC<{ s: number; p: number }> = ({ s, p }) => (
  <div style={{ position: "relative", width: s, height: s * 0.8 }}>
    {[-1, 0, 1].map((k) => {
      const centro = k === 0;
      const e = centro ? 1 : 0.82;
      const dx = k * s * 0.3 * p;
      return (
        <svg key={k} width={s * 0.42 * e} height={s * 0.6 * e} viewBox="0 0 40 56" style={{ position: "absolute", left: s / 2 - (s * 0.21 * e) + dx, top: centro ? s * 0.08 : s * 0.18, zIndex: centro ? 2 : 1 }}>
          <circle cx={20} cy={13} r={10} fill={centro ? C.acento : CREMA} stroke={OSC} strokeWidth={3} />
          <path d="M 3 54 A 17 19 0 0 1 37 54 Z" fill={centro ? C.acento : CREMA} stroke={OSC} strokeWidth={3} strokeLinejoin="round" />
        </svg>
      );
    })}
  </div>
);

/** Ficha cuadrada para la caja: fondo panel, borde coral, contenido centrado. */
export const Ficha: React.FC<{ s: number; children: React.ReactNode; clara?: boolean; activa?: number }> = ({ s, children, clara = false, activa = 1 }) => (
  <div
    style={{
      width: s, height: s, borderRadius: s * 0.2, background: clara ? "#F6F7F9" : C.panel, border: `${Math.max(3, s * 0.025)}px solid ${activa > 0.5 ? C.acento : C.borde}`,
      boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 20px 50px rgba(0,0,0,0.55), 0 0 ${s * 0.2 * activa}px rgba(217,119,87,${0.35 * activa})`,
    }}
  >
    {children}
  </div>
);

/** Archivo CLAUDE.md: hoja con el nombre en código y el asterisco de Claude. */
export const ArchivoClaude: React.FC<{ w: number; logo: string; lineas: number }> = ({ w, logo, lineas }) => (
  <div style={{ width: w, height: w * 1.2, borderRadius: w * 0.06, background: "#FFFFFF", border: `${w * 0.02}px solid ${OSC}`, boxSizing: "border-box", padding: w * 0.08, display: "flex", flexDirection: "column", gap: w * 0.05, boxShadow: "0 30px 70px rgba(0,0,0,0.55)", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", right: 0, top: 0, width: w * 0.2, height: w * 0.2, background: "#E2DDD3", borderBottomLeftRadius: w * 0.05, borderLeft: `${w * 0.015}px solid ${OSC}`, borderBottom: `${w * 0.015}px solid ${OSC}` }} />
    <div style={{ display: "flex", alignItems: "center", gap: w * 0.04 }}>
      <Img src={staticFile(logo)} style={{ width: w * 0.16 }} />
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: w * 0.1, color: OSC }}>CLAUDE.md</div>
    </div>
    {[0.9, 0.7, 0.82, 0.6, 0.75].map((f, i) => (
      <div key={i} style={{ height: w * 0.04, width: `${f * clamp01(lineas - i) * 100}%`, borderRadius: w * 0.02, background: i === 0 ? C.acento : "#C3C8D1" }} />
    ))}
  </div>
);

// ── editor de flujos (recreado, datos ficticios) ──────────────────────────────────────────────────────────────────
export type NodoFlujo = { logo: string; titulo: string; sub: string; at: number; disparador?: boolean };

/**
 * Panel de un editor de flujos de automatización (modelo: la captura de referencias/n8n_flujo.webp), recreado con los
 * pedidos de la floristería. Los nodos entran en su `at`; `lineas[i]` (0 → 1) dibuja la conexión i → i + 1; `punto`
 * (0 → nodos - 1) es el pedido que recorre el flujo; `hecho` marca el último nodo.
 */
export const EditorFlujo: React.FC<{ w: number; t: number; nodos: NodoFlujo[]; lineas: number[]; punto: number; hecho: number }> = ({ w, t, nodos, lineas, punto, hecho }) => {
  const s = w / 960;
  const h = 470 * s;
  const n = nodos.length;
  const nodoW = 150 * s;
  const cx = (i: number) => (w / n) * (i + 0.5);
  const cy = 250 * s;
  const activo = Math.round(punto);
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 28 * s, background: "#26272C", border: `3px solid #3B3D44`, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#45474F 2px, transparent 2.6px)", backgroundSize: `${26 * s}px ${26 * s}px`, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 74 * s, background: "#1D1E22", borderBottom: "2px solid #3B3D44", display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${28 * s}px` }}>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30 * s, color: "#E6E6EA" }}>Pedidos · Floristería</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 * s, fontFamily: UI, fontWeight: 600, fontSize: 24 * s, color: "#B9BAC2" }}>
          Activo
          <div style={{ width: 62 * s, height: 34 * s, borderRadius: 999, background: "#2E9E6A", position: "relative" }}>
            <div style={{ position: "absolute", right: 4 * s, top: 4 * s, width: 26 * s, height: 26 * s, borderRadius: "50%", background: "#FFFFFF" }} />
          </div>
        </div>
      </div>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={w} height={h}>
        {nodos.slice(0, -1).map((_, i) => {
          const x1 = cx(i) + nodoW / 2 + 8 * s;
          const x2 = cx(i + 1) - nodoW / 2 - 8 * s;
          const p = clamp01(lineas[i] ?? 0);
          return (
            <g key={i}>
              <line x1={x1} y1={cy} x2={x1 + (x2 - x1) * p} y2={cy} stroke="#9A9CA5" strokeWidth={4 * s} />
              {p > 0.95 && <path d={`M ${x2 - 14 * s} ${cy - 10 * s} L ${x2} ${cy} L ${x2 - 14 * s} ${cy + 10 * s} Z`} fill="#9A9CA5" />}
            </g>
          );
        })}
      </svg>
      {nodos.map((nd, i) => {
        const e = t >= nd.at ? sp(t, nd.at, { damping: 12, stiffness: 190 }) : 0;
        if (e <= 0) return null;
        const brilla = punto >= 0 && activo === i ? 1 : 0;
        const ok = i === n - 1 ? clamp01(hecho) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: cx(i), top: cy, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * e})`, opacity: clamp01(e * 1.6) }}>
              <div
                style={{
                  width: nodoW, height: nodoW, borderRadius: nd.disparador ? `${nodoW * 0.5}px ${nodoW * 0.14}px ${nodoW * 0.14}px ${nodoW * 0.5}px` : nodoW * 0.14,
                  background: "#3A3B42", border: `${4 * s}px solid ${brilla ? C.acento : "#5A5C66"}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: brilla ? `0 0 ${40 * s}px ${C.acento}AA` : "0 14px 30px rgba(0,0,0,0.45)",
                }}
              >
                <Img src={staticFile(nd.logo)} style={{ width: nodoW * 0.56, display: "block" }} />
              </div>
              {ok > 0 && (
                <div style={{ position: "absolute", right: -18 * s, top: -18 * s, width: 54 * s, height: 54 * s, borderRadius: "50%", background: "#2E9E6A", border: `${4 * s}px solid #26272C`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, nd.at, {}) > 0 ? Math.min(1.1, ok * 1.4) : 0})` }}>
                  <svg width={32 * s} height={32 * s} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke="#FFFFFF" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - ok)} /></svg>
                </div>
              )}
              <div style={{ position: "absolute", left: "50%", top: nodoW + 18 * s, transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 28 * s, color: "#F2F2F4" }}>{nd.titulo}</div>
                <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 21 * s, color: "#9A9CA5", marginTop: 4 * s }}>{nd.sub}</div>
              </div>
            </div>
          </div>
        );
      })}
      {punto >= 0 && punto <= n - 1 && (
        <div style={{ position: "absolute", left: cx(0) + (cx(n - 1) - cx(0)) * (punto / (n - 1)) - 22 * s, top: cy - 22 * s - 105 * s, width: 44 * s, height: 44 * s, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 44 * s, height: 44 * s, borderRadius: 10 * s, background: CREMA, border: `${4 * s}px solid ${OSC}`, transform: `rotate(${Math.sin(t * 9) * 8}deg)`, boxShadow: `0 0 ${24 * s}px ${C.acento}` }}>
            <div style={{ margin: `${8 * s}px ${7 * s}px 0`, height: 5 * s, borderRadius: 3 * s, background: C.acento }} />
            <div style={{ margin: `${5 * s}px ${7 * s}px 0`, height: 5 * s, borderRadius: 3 * s, background: "#B9B1A3" }} />
          </div>
        </div>
      )}
    </div>
  );
};

// ── caja de comentario de Instagram (recreada) ────────────────────────────────────────────────────────────────────
export const Comentario: React.FC<{ w: number; texto: string; caret: boolean; envia: number }> = ({ w, texto, caret, envia }) => {
  const s = w / 900;
  const pulsa = Math.sin(clamp01(envia) * Math.PI);
  return (
    <div style={{ width: w, display: "flex", alignItems: "center", gap: 22 * s, padding: `${20 * s}px ${26 * s}px`, borderRadius: 999, background: "#1B1E26", border: `3px solid ${C.borde}`, boxSizing: "border-box", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
      <div style={{ width: 72 * s, height: 72 * s, borderRadius: "50%", background: C.panel2, border: `3px solid ${C.gris}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={44 * s} height={44 * s} viewBox="0 0 24 24" fill="none" stroke={C.gris} strokeWidth={2.2} strokeLinecap="round"><circle cx={12} cy={8} r={4} /><path d="M4 21 A8 8 0 0 1 20 21" /></svg>
      </div>
      <div style={{ flex: 1, fontFamily: UI, fontWeight: 700, fontSize: 40 * s, color: texto ? C.texto : C.gris, whiteSpace: "nowrap", overflow: "hidden" }}>
        {texto || "Añade un comentario…"}
        {caret && <span style={{ display: "inline-block", width: 4 * s, height: 44 * s, marginLeft: 4 * s, background: C.acento, verticalAlign: "middle" }} />}
      </div>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 36 * s, color: texto ? "#4C9EFF" : "#2F4A6B", transform: `scale(${1 - 0.15 * pulsa})` }}>Publicar</div>
    </div>
  );
};
