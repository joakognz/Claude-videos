/**
 * EP.9 · Dibujos planos propios (no son marcas): iconos de trazo, carta numerada que se da la vuelta, tarjeta de
 * parte (1/2), rejilla pequeña con un episodio que se enciende, bandera de punto de guardado, móvil, regleta y
 * nodo de agente. Todo depende de t.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { GEO_REJILLA, Rejilla } from "../Rejilla";
import type { RejillaGeo } from "../Rejilla";
import { C, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";

// ── iconos de trazo ─────────────────────────────────────────────────────────────────────────────────────────────
type IcoProps = { s?: number; color?: string; grosor?: number };
const ico = (path: React.ReactNode) => ({ s = 64, color = "#FFFFFF", grosor = 2 }: IcoProps) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);
export const IcoFicha = ico(<><rect x={5} y={4} width={14} height={17} rx={2} /><path d="M9 4 V2.8 H15 V4" /><path d="M8.5 9.5 H15.5 M8.5 13 H15.5 M8.5 16.5 H12.5" /></>);
export const IcoImagen = ico(<><rect x={3} y={5} width={18} height={14} rx={2} /><circle cx={8.5} cy={10} r={1.8} /><path d="M3.5 17 L9 12 L13 15.5 L16 13 L20.5 17" /></>);
export const IcoPlano = ico(<><path d="M3 6 L9 4 L15 6 L21 4 V18 L15 20 L9 18 L3 20 Z" /><path d="M9 4 V18 M15 6 V20" /></>);
export const IcoBandera = ico(<><path d="M5 21 V4" /><path d="M5 4 H17 L14.5 8 L17 12 H5" /></>);
export const IcoOjo = ico(<><path d="M2 12 C5 6.5 9 4.5 12 4.5 S19 6.5 22 12 C19 17.5 15 19.5 12 19.5 S5 17.5 2 12 Z" /><circle cx={12} cy={12} r={3.2} /></>);
export const IcoOjoTachado = ico(<><path d="M2 12 C5 6.5 9 4.5 12 4.5 S19 6.5 22 12 C19 17.5 15 19.5 12 19.5 S5 17.5 2 12 Z" /><circle cx={12} cy={12} r={3.2} /><path d="M3.5 3.5 L20.5 20.5" /></>);
export const IcoEstrella = ico(<path d="M12 3 L14.6 8.6 L20.6 9.2 L16.1 13.3 L17.4 19.3 L12 16.2 L6.6 19.3 L7.9 13.3 L3.4 9.2 L9.4 8.6 Z" />);
export const IcoVoto = ico(<><path d="M7 10.5 V20 H4 V10.5 Z" /><path d="M7 10.5 L11 3.5 C12.6 3.5 13.4 4.6 13 6.2 L12.2 9.5 H18.5 C19.7 9.5 20.5 10.6 20.2 11.8 L18.6 18.4 C18.3 19.4 17.4 20 16.4 20 H7" /></>);
export const IcoCalendario = ico(<><rect x={3.5} y={5} width={17} height={15.5} rx={2} /><path d="M3.5 10 H20.5 M8 3 V7 M16 3 V7" /></>);
export const IcoEnchufe = ico(<><path d="M9 3 V8 M15 3 V8" /><path d="M6 8 H18 V12 A6 6 0 0 1 6 12 Z" /><path d="M12 18 V22" /></>);
export const IcoMovil = ico(<><rect x={6.5} y={2.5} width={11} height={19} rx={2.5} /><path d="M10.5 18.5 H13.5" /></>);
export const IcoMicro = ico(<><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5.5 11 A6.5 6.5 0 0 0 18.5 11 M12 17.5 V21" /></>);
export const IcoReloj = ico(<><circle cx={12} cy={12} r={8.5} /><path d="M12 7 V12 L15.5 14" /></>);
export const IcoPersona = ico(<><circle cx={12} cy={8} r={4} /><path d="M4 21 A8 8 0 0 1 20 21" /></>);
export const IcoAyudantes = ico(<><circle cx={9} cy={8} r={3.4} /><path d="M2.5 20 A6.5 6.5 0 0 1 15.5 20" /><circle cx={17} cy={9} r={2.6} /><path d="M17 14 A5 5 0 0 1 21.5 19" /></>);
export const IcoDocumento = ico(<><path d="M6 3 H14 L19 8 V21 H6 Z M14 3 V8 H19" /><path d="M9 12.5 H16 M9 16 H14" /></>);
export const IcoLupa = ico(<><circle cx={10.5} cy={10.5} r={6.5} /><path d="M15.5 15.5 L21 21" /></>);
export const IcoGlobo = ico(<><circle cx={12} cy={12} r={9} /><path d="M3 12 H21 M12 3 C15 6 15 18 12 21 C9 18 9 6 12 3" /></>);
export const IcoServidor = ico(<><rect x={4} y={4} width={16} height={7} rx={1.5} /><rect x={4} y={13} width={16} height={7} rx={1.5} /><path d="M8 7.5 H8.01 M8 16.5 H8.01" /></>);
export const IcoRayo = ico(<path d="M13 2.5 L5 13.5 H11.5 L10.5 21.5 L19 10 H12.5 Z" />);
export const IcoDados = ico(<><rect x={3} y={8} width={11} height={11} rx={2} /><path d="M10 8 L12 3.5 L21 6.5 L18.5 15 L14 14" /><path d="M6.5 11.5 H6.51 M10.5 15.5 H10.51 M8.5 13.5 H8.51" strokeWidth={2.8} /></>);
export const IcoCandado = ico(<><rect x={5} y={10.5} width={14} height={10} rx={2} /><path d="M8 10.5 V7.5 A4 4 0 0 1 16 7.5 V10.5" /></>);
export const IcoRebobinar = ico(<><path d="M11 6 L4 12 L11 18 Z" /><path d="M20 6 L13 12 L20 18 Z" /></>);
export const IcoBarra = ico(<path d="M15 3.5 L9 20.5" />);
export const IcoCodigo = ico(<path d="M8.5 7 L3.5 12 L8.5 17 M15.5 7 L20.5 12 L15.5 17 M13.5 4.5 L10.5 19.5" />);
export const IcoNegocio = ico(<><path d="M4 9 L5.5 4 H18.5 L20 9 Z" /><path d="M5 9 V20 H19 V9" /><path d="M10 20 V14 H14 V20" /></>);
export const IcoTabla = ico(<><rect x={3.5} y={4.5} width={17} height={15} rx={1.5} /><path d="M3.5 9.5 H20.5 M3.5 14.5 H20.5 M10 4.5 V19.5" /></>);
export const IcoCheck = ico(<path d="M5 12.5 L10 17.5 L19 7" />);

/** Círculo con icono (fondo panel, borde de acento). */
export const Disco: React.FC<{ s?: number; activo?: number; children: React.ReactNode; fondo?: string }> = ({ s = 130, activo = 1, children, fondo = C.panel2 }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: fondo, border: `${Math.max(4, s * 0.04)}px solid ${activo > 0.5 ? C.acento : C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: activo > 0.5 ? `0 0 ${s * 0.35}px ${C.acento}55` : "0 16px 40px rgba(0,0,0,0.45)" }}>
    {children}
  </div>
);

/** Caja posicionada en (x, y) con entrada spring y salida, centrada. */
export const Pos: React.FC<{ x: number; y: number; t: number; at: number; out?: number; children: React.ReactNode; rot?: number; escala?: number; dx?: number; dy?: number; desde?: number }> = ({
  x, y, t, at, out, children, rot = 0, escala = 1, dx = 0, dy = 0, desde = 0.5,
}) => {
  const v = vis(t, at, out, desde);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${dx}px, ${dy + v.y}px) scale(${v.scale * escala}) rotate(${rot}deg)`, opacity: v.opacity, whiteSpace: "nowrap" }}>{children}</div>
    </div>
  );
};

/** Carta que cae boca abajo (número) y se da la vuelta (icono y nombre). */
export const Carta: React.FC<{ w: number; t: number; gira: number; n: number; titulo: string; icono: React.ReactNode; brillo?: number }> = ({ w, t, gira, n, titulo, icono, brillo = 0 }) => {
  const g = clamp01(sp(t, gira, { damping: 13, stiffness: 120 }));
  const ang = g * 180;
  const frente = ang > 90;
  const h = w * 1.36;
  return (
    <div style={{ width: w, height: h, perspective: 1400 }}>
      <div style={{ width: w, height: h, position: "relative", transform: `rotateY(${frente ? ang - 180 : ang}deg)` }}>
        {!frente ? (
          <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.12, background: C.panel2, border: `${w * 0.035}px solid ${C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", backgroundImage: `repeating-linear-gradient(45deg, transparent 0 ${w * 0.08}px, rgba(217,119,87,0.08) ${w * 0.08}px ${w * 0.16}px)` }}>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: w * 0.5, color: C.acento }}>{n}</div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.12, background: C.acento, border: `${w * 0.035}px solid ${C.acentoSuave}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: w * 0.06, boxShadow: `0 0 ${30 + 40 * brillo}px ${C.acento}${brillo > 0 ? "aa" : "55"}` }}>
            {icono}
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: w * 0.13, color: C.oscuro, textAlign: "center", lineHeight: 1.05, padding: `0 ${w * 0.06}px`, whiteSpace: "normal" }}>{titulo}</div>
          </div>
        )}
      </div>
    </div>
  );
};

/** Tarjeta «PARTE n DE m» con sus segmentos. */
export const TarjetaParte: React.FC<{ t: number; at: number; n: number; de: number; titulo: string }> = ({ t, at, n, de, titulo }) => {
  const s = sp(t, at, { damping: 13, stiffness: 160 });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, transform: `scale(${0.7 + 0.3 * s})`, opacity: Math.min(1, s * 1.6), whiteSpace: "nowrap" }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.gris, letterSpacing: 4 }}>EP.9 · NIVEL EXPERTO</div>
      <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 112, color: C.texto, letterSpacing: -2 }}>
        PARTE <span style={{ color: C.acento }}>{n}</span>
        <span style={{ color: C.tenue }}>/{de}</span>
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        {Array.from({ length: de }, (_, k) => {
          const llena = k < n - 1 ? 1 : k === n - 1 ? ramp(t, at + 0.25, at + 0.75) : 0;
          return (
            <div key={k} style={{ width: 240, height: 26, borderRadius: 13, background: C.panel2, border: `3px solid ${C.borde}`, overflow: "hidden" }}>
              <div style={{ width: `${llena * 100}%`, height: "100%", background: C.acento, boxShadow: `0 0 20px ${C.acento}` }} />
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 52, color: C.acento }}>{titulo}</div>
    </div>
  );
};

const G_MINI: RejillaGeo = { ...GEO_REJILLA, celda: 34, hueco: 8 };
/** Rejilla pequeña de la serie con el episodio `ep` encendiéndose (referencia a un episodio anterior). */
export const MiniRejilla: React.FC<{ t: number; at: number; out?: number; ep: number; x: number; y: number; etiqueta: string }> = ({ t, at, out, ep, x, y, etiqueta }) => {
  const v = vis(t, at, out, 0.7);
  if (!v.on) return null;
  const g = { ...G_MINI, cx: 0, cy: 0 };
  const enc = sp(t, at + 0.35, { damping: 9, stiffness: 200 });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: v.opacity }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, padding: "26px 30px", borderRadius: 28, background: "rgba(20,24,33,0.95)", border: `3px solid ${C.borde}`, boxShadow: "0 24px 60px rgba(0,0,0,0.55)", display: "flex", alignItems: "center", gap: 28, whiteSpace: "nowrap" }}>
        <div style={{ position: "relative", width: 10 * 34 + 9 * 8, height: 5 * 34 + 4 * 8, flexShrink: 0 }}>
          <div style={{ position: "absolute", left: (10 * 34 + 9 * 8) / 2, top: (5 * 34 + 4 * 8) / 2 }}>
            <Rejilla
              g={g}
              total={50}
              estado={(n) => ({ opacity: 1, escala: 1, encendida: n < 9 ? (n === ep ? Math.min(1, enc) : 0.35) : 0, latido: n === ep ? Math.sin(Math.min(1, enc) * Math.PI) * 0.4 : 0, contorno: n === 9 ? 1 : 0, check: 0 })}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.acento }}>EP.{ep}</div>
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 30, color: C.texto }}>{etiqueta}</div>
        </div>
      </div>
    </div>
  );
};

/** Bandera clavada de punto de guardado. */
export const Bandera: React.FC<{ t: number; at: number; s?: number; activa?: number }> = ({ t, at, s = 90, activa = 1 }) => {
  const e = sp(t, at, { damping: 10, stiffness: 220 });
  if (e <= 0) return null;
  const ondea = Math.sin(t * 6 + at) * 4;
  return (
    <svg width={s} height={s * 1.3} viewBox="0 0 30 39" style={{ transform: `translateY(${(1 - Math.min(1, e)) * -60}px) scaleY(${Math.min(1, e * 1.4)})`, transformOrigin: "50% 100%", overflow: "visible" }}>
      <path d="M8 38 V3" stroke={C.texto} strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M8 3 H25 L${21 + ondea * 0.3} 9 L25 15 H8 Z`} fill={activa > 0.5 ? C.acento : C.tenue} stroke={C.oscuro} strokeWidth={1.4} strokeLinejoin="round" />
      <ellipse cx={8} cy={38} rx={6} ry={1.6} fill="rgba(0,0,0,0.4)" />
    </svg>
  );
};

/** Móvil con la app de Claude y una conversación. */
export const Movil: React.FC<{ w: number; t: number; logo: string; mensajes: { yo: boolean; texto: string; at: number }[]; entrada?: string; envia?: number; titulo?: string }> = ({ w, t, logo, mensajes, entrada = "", envia, titulo = "web-panaderia" }) => {
  const s = w / 420;
  const pulsa = envia !== undefined ? Math.sin(clamp01((t - envia + 0.08) / 0.2) * Math.PI) : 0;
  return (
    <div style={{ width: w, height: w * 2.02, borderRadius: 64 * s, background: "#0E0E10", border: `${10 * s}px solid #2C2F36`, boxShadow: "0 40px 100px rgba(0,0,0,0.7)", padding: 14 * s, boxSizing: "border-box", position: "relative" }}>
      <div style={{ position: "absolute", left: "50%", top: 20 * s, transform: "translateX(-50%)", width: 120 * s, height: 30 * s, borderRadius: 15 * s, background: "#000" }} />
      <div style={{ width: "100%", height: "100%", borderRadius: 50 * s, background: "#262624", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: UI }}>
        <div style={{ height: 150 * s, display: "flex", alignItems: "flex-end", gap: 14 * s, padding: `0 ${24 * s}px ${18 * s}px`, borderBottom: `${2 * s}px solid #3A3936` }}>
          <Img src={staticFile(logo)} style={{ width: 46 * s }} />
          <div>
            <div style={{ fontSize: 26 * s, fontWeight: 700, color: "#ECEAE4" }}>Claude</div>
            <div style={{ fontSize: 19 * s, color: "#9A978F", fontFamily: MONO }}>{titulo}</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14 * s, padding: `${18 * s}px ${20 * s}px` }}>
          {mensajes
            .filter((m) => t >= m.at - 0.05)
            .map((m, k) => {
              const e = sp(t, m.at, { damping: 15, stiffness: 190 });
              return (
                <div key={k} style={{ alignSelf: m.yo ? "flex-end" : "flex-start", maxWidth: "86%", padding: `${12 * s}px ${16 * s}px`, borderRadius: 20 * s, background: m.yo ? "#3A3936" : "transparent", border: m.yo ? "none" : `${2 * s}px solid #3A3936`, color: "#ECEAE4", fontSize: 26 * s, lineHeight: 1.3, opacity: Math.min(1, e * 1.5), transform: `translateY(${(1 - e) * 20 * s}px)` }}>
                  {m.texto}
                </div>
              );
            })}
        </div>
        <div style={{ margin: `0 ${16 * s}px ${28 * s}px`, minHeight: 74 * s, borderRadius: 26 * s, background: "#30302E", border: `${2 * s}px solid ${entrada ? C.acento : "#4A4945"}`, display: "flex", alignItems: "center", padding: `${8 * s}px ${10 * s}px ${8 * s}px ${20 * s}px`, gap: 10 * s }}>
          <div style={{ flex: 1, fontSize: 22 * s, color: entrada ? "#ECEAE4" : "#8A877F", lineHeight: 1.25 }}>{entrada || "Responder a Claude…"}</div>
          <div style={{ width: 52 * s, height: 52 * s, borderRadius: "50%", background: entrada ? C.acento : "#4A4945", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * pulsa})`, flexShrink: 0 }}>
            <svg width={26 * s} height={26 * s} viewBox="0 0 24 24"><path d="M12 19 V5 M5 12 L12 5 L19 12" stroke="#1E1E1E" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Nodo de agente: círculo con el logo de Claude y una etiqueta. */
export const NodoAgente: React.FC<{ s: number; logo: string; etiqueta?: string; activo?: number; pulso?: number }> = ({ s, logo, etiqueta, activo = 1, pulso = 0 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: s * 0.12 }}>
    <div style={{ width: s, height: s, borderRadius: "50%", background: C.panel, border: `${Math.max(4, s * 0.045)}px solid ${activo > 0.5 ? C.acento : C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${s * (0.2 + 0.25 * pulso)}px ${C.acento}${activo > 0.5 ? "77" : "22"}`, transform: `scale(${1 + 0.06 * pulso})` }}>
      <Img src={staticFile(logo)} style={{ width: s * 0.56 }} />
    </div>
    {etiqueta && <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: s * 0.2, color: C.texto, whiteSpace: "nowrap" }}>{etiqueta}</div>}
  </div>
);
