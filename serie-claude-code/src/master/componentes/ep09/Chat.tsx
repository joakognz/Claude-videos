/**
 * EP.9 · Visual Studio Code con el panel de Claude Code, recreado con datos ficticios (proyecto web-panaderia).
 * Una sola pieza configurable: mensajes, cuadro de entrada con adjunto, selector de modo (Manual → Plan), menú de
 * comandos con «/», historial de sesiones, botón de rebobinar, contador de agentes, Remote Control y micrófono.
 * Las etiquetas de la interfaz están en inglés, como en la extensión real.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, UI, clamp01, ramp, sp } from "../../nucleo";

const VS = { barra: "#2B2B2B", lateral: "#252526", panel: "#1E1E1E", caja: "#252526", borde: "#3C3C3C", texto: "#E6E6E6", gris: "#9D9D9D", tenue: "#6A6A6A", azul: "#3B6FD8" };

export type Mensaje = {
  tipo: "yo" | "claude" | "nota" | "sistema";
  texto: React.ReactNode;
  at: number;
  /** se tacha o se atenúa desde este instante */
  apaga?: number;
  /** resaltado (borde de acento) */
  resalta?: number;
};

export type ChatProps = {
  t: number;
  w: number;
  h: number;
  logoVs: string;
  logoCc: string;
  proyecto?: string;
  mensajes?: Mensaje[];
  /** texto del cuadro de entrada */
  entrada?: string;
  foco?: boolean;
  placeholder?: string;
  /** imagen adjunta en el cuadro (miniatura) */
  adjunto?: { nodo: React.ReactNode; at: number; enviado?: number };
  /** modo: Manual hasta `plan`, Plan desde entonces; `abre` despliega el selector */
  modo?: { abre?: number; plan?: number };
  /** menú de comandos con «/» */
  barra?: { abre: number; cierra: number; resalta?: string; filtro?: string };
  /** historial de sesiones */
  historial?: { abre: number; elige: number; cierra: number };
  /** botón de rebobinar sobre el mensaje `indice` */
  rebobinar?: { indice: number; hover: number; pulsa: number; elige: number; cierra: number };
  /** contador de agentes */
  agentes?: { at: number; n: number };
  /** pastilla de Remote Control */
  remote?: number;
  /** micrófono grabando entre a y b */
  microfono?: { a: number; b: number };
  /** instante en que se pulsa enviar */
  envia?: number;
  /** cuántos mensajes recientes caben (los anteriores se desplazan hacia arriba) */
  escala?: number;
};

const ICONOS_LATERAL = [
  <path key="a" d="M5 3 H14 L19 8 V21 H5 Z M14 3 V8 H19" />,
  <><circle key="b" cx={11} cy={11} r={6} /><path d="M16 16 L21 21" /></>,
  <><circle key="c" cx={7} cy={6} r={2.5} /><circle cx={7} cy={18} r={2.5} /><circle cx={17} cy={9} r={2.5} /><path d="M7 8.5 V15.5 M17 11.5 C17 15 12 14 8.5 16.5" /></>,
  <path key="d" d="M4 4 H10 V10 H4 Z M14 4 H20 V10 H14 Z M4 14 H10 V20 H4 Z M14 14 H20 V20 H14 Z" />,
];

export const ChatClaude: React.FC<ChatProps> = ({
  t, w, h, logoVs, logoCc, proyecto = "web-panaderia", mensajes = [], entrada = "", foco = false, placeholder = "Esc to focus or unfocus Claude",
  adjunto, modo, barra, historial, rebobinar, agentes, remote, microfono, envia, escala = 1,
}) => {
  const s = (w / 940) * escala;
  const esPlan = modo?.plan !== undefined && t >= modo.plan;
  const abierto = modo?.abre !== undefined && t >= modo.abre && !(modo.plan !== undefined && t >= modo.plan + 0.35);
  const menuModo = modo?.abre !== undefined ? clamp01((t - modo.abre) / 0.18) * (1 - ramp(t, (modo.plan ?? 1e9) + 0.25, (modo.plan ?? 1e9) + 0.45)) : 0;
  const vBarra = barra ? clamp01((t - barra.abre) / 0.18) * (1 - ramp(t, barra.cierra - 0.15, barra.cierra)) : 0;
  const vHist = historial ? clamp01((t - historial.abre) / 0.2) * (1 - ramp(t, historial.cierra - 0.2, historial.cierra)) : 0;
  const graba = microfono && t >= microfono.a && t < microfono.b;
  const pulsaEnvio = envia !== undefined ? Math.sin(clamp01((t - envia + 0.08) / 0.2) * Math.PI) : 0;
  const visibles = mensajes.filter((m) => t >= m.at - 0.05);
  const fuente = 27 * s;
  return (
    <div style={{ width: w, height: h, borderRadius: 24 * s, overflow: "hidden", background: VS.panel, border: `${3 * s}px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.65)", display: "flex", flexDirection: "column", fontFamily: UI, position: "relative" }}>
      {/* barra de título */}
      <div style={{ height: 62 * s, background: VS.barra, display: "flex", alignItems: "center", gap: 12 * s, padding: `0 ${22 * s}px`, flexShrink: 0 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 16 * s, height: 16 * s, borderRadius: "50%", background: c, opacity: 0.85 }} />
        ))}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 * s }}>
          <Img src={staticFile(logoVs)} style={{ width: 30 * s }} />
          <div style={{ fontSize: 24 * s, color: "#BBBBBB", fontWeight: 600 }}>{proyecto}</div>
        </div>
        <div style={{ width: 80 * s }} />
      </div>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ width: 66 * s, background: VS.lateral, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 * s, paddingTop: 24 * s, flexShrink: 0 }}>
          {ICONOS_LATERAL.map((ico, k) => (
            <svg key={k} width={34 * s} height={34 * s} viewBox="0 0 24 24" fill="none" stroke={k === 0 ? "#DDDDDD" : VS.tenue} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              {ico}
            </svg>
          ))}
          <Img src={staticFile(logoCc)} style={{ width: 36 * s, opacity: 0.95 }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
          {/* pestaña del panel */}
          <div style={{ height: 56 * s, display: "flex", alignItems: "center", background: VS.lateral, flexShrink: 0 }}>
            <div style={{ height: "100%", display: "flex", alignItems: "center", gap: 10 * s, padding: `0 ${20 * s}px`, background: VS.panel, borderTop: `${3 * s}px solid ${C.acento}` }}>
              <Img src={staticFile(logoCc)} style={{ width: 30 * s }} />
              <div style={{ fontSize: 22 * s, color: VS.texto, fontWeight: 600 }}>Claude Code</div>
            </div>
            <div style={{ flex: 1 }} />
            {/* historial (reloj) y sesión nueva */}
            <div style={{ display: "flex", gap: 18 * s, paddingRight: 20 * s }}>
              <div style={{ width: 40 * s, height: 40 * s, borderRadius: 8 * s, background: vHist > 0 || (historial && t > historial.abre - 0.5 && t < historial.abre + 0.2) ? "#3A3D41" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={28 * s} height={28 * s} viewBox="0 0 24 24" fill="none" stroke={VS.gris} strokeWidth={2} strokeLinecap="round"><circle cx={12} cy={12} r={8.5} /><path d="M12 7 V12 L15.5 14" /></svg>
              </div>
              <svg width={28 * s} height={28 * s} viewBox="0 0 24 24" fill="none" stroke={VS.gris} strokeWidth={2} strokeLinecap="round" style={{ marginTop: 6 * s }}><circle cx={12} cy={12} r={8.5} /><path d="M12 8 V16 M8 12 H16" /></svg>
            </div>
          </div>
          {/* mensajes */}
          <div style={{ flex: 1, padding: `${22 * s}px ${24 * s}px ${10 * s}px`, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 18 * s, overflow: "hidden", position: "relative" }}>
            {visibles.map((m, k) => {
              const e = sp(t, m.at, { damping: 15, stiffness: 190 });
              const apaga = m.apaga !== undefined ? ramp(t, m.apaga, m.apaga + 0.35) : 0;
              const res = m.resalta !== undefined ? clamp01((t - m.resalta) / 0.2) : 0;
              const idx = mensajes.indexOf(m);
              const hover = rebobinar && rebobinar.indice === idx && t > rebobinar.hover && t < rebobinar.cierra;
              const comun: React.CSSProperties = { opacity: Math.min(1, e * 1.5) * (1 - 0.55 * apaga), transform: `translateY(${(1 - e) * 24 * s}px)`, position: "relative", flexShrink: 0 };
              if (m.tipo === "yo")
                return (
                  <div key={k} style={{ ...comun, padding: `${14 * s}px ${18 * s}px`, borderRadius: 10 * s, background: "#2D2D30", border: `${2 * s}px solid ${hover || res > 0 ? C.acento : "#3C3C3C"}`, fontSize: fuente, color: VS.texto, lineHeight: 1.3 }}>
                    {m.texto}
                    {hover && (
                      <div style={{ position: "absolute", right: 12 * s, top: "50%", transform: "translateY(-50%)", width: 46 * s, height: 46 * s, borderRadius: 10 * s, background: t > rebobinar!.pulsa ? C.acento : "#3A3D41", display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp01((t - rebobinar!.hover) / 0.15) }}>
                        <svg width={30 * s} height={30 * s} viewBox="0 0 24 24" fill="none" stroke={t > rebobinar!.pulsa ? C.oscuro : VS.texto} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12 A8 8 0 1 0 7 5.8" /><path d="M4 3 V8 H9" /></svg>
                      </div>
                    )}
                  </div>
                );
              if (m.tipo === "claude")
                return (
                  <div key={k} style={{ ...comun, display: "flex", gap: 14 * s, fontSize: fuente, color: VS.texto, lineHeight: 1.35 }}>
                    <div style={{ width: 10 * s, height: 10 * s, borderRadius: "50%", background: C.acento, marginTop: 14 * s, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>{m.texto}</div>
                  </div>
                );
              if (m.tipo === "sistema")
                return (
                  <div key={k} style={{ ...comun, display: "flex", gap: 14 * s, fontSize: fuente * 0.92, color: VS.texto, lineHeight: 1.35 }}>
                    <div style={{ width: 10 * s, height: 10 * s, borderRadius: "50%", background: "#4EC97B", marginTop: 13 * s, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>{m.texto}</div>
                  </div>
                );
              return (
                <div key={k} style={{ ...comun, fontSize: fuente * 0.92, fontStyle: "italic", color: VS.gris }}>
                  {m.texto}
                </div>
              );
            })}
          </div>
          {/* cuadro de entrada */}
          <div style={{ margin: `0 ${20 * s}px ${20 * s}px`, borderRadius: 14 * s, border: `${2.5 * s}px solid ${foco ? C.acento : VS.borde}`, background: VS.caja, padding: `${14 * s}px ${16 * s}px`, display: "flex", flexDirection: "column", gap: 10 * s, flexShrink: 0, position: "relative" }}>
            {adjunto && t >= adjunto.at && (adjunto.enviado === undefined || t < adjunto.enviado) && (
              <div style={{ alignSelf: "flex-start", position: "relative", transform: `scale(${sp(t, adjunto.at, { damping: 12, stiffness: 200 })})`, transformOrigin: "0 100%" }}>
                {adjunto.nodo}
                <div style={{ position: "absolute", right: -10 * s, top: -10 * s, width: 26 * s, height: 26 * s, borderRadius: "50%", background: "#3A3D41", border: `${2 * s}px solid ${VS.borde}`, color: VS.texto, fontSize: 16 * s, display: "flex", alignItems: "center", justifyContent: "center" }}>×</div>
              </div>
            )}
            <div style={{ fontSize: fuente, lineHeight: 1.35, color: entrada ? VS.texto : "#7A7A7A", minHeight: 38 * s, fontFamily: entrada.startsWith("/") ? MONO : UI, wordBreak: "break-word" }}>
              {entrada || placeholder}
              {foco && <span style={{ display: "inline-block", width: 3 * s, height: 30 * s, marginLeft: 3 * s, verticalAlign: "middle", background: C.acento, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 * s }}>
              <div style={{ fontSize: 30 * s, color: "#8A8A8A", lineHeight: 1 }}>+</div>
              <div style={{ width: 30 * s, height: 30 * s, borderRadius: 6 * s, border: `${2 * s}px solid #8A8A8A`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 18 * s, color: "#8A8A8A" }}>/</div>
              {remote !== undefined && t >= remote && (
                <div style={{ padding: `${4 * s}px ${12 * s}px`, borderRadius: 999, background: VS.azul, color: "#FFFFFF", fontSize: 19 * s, fontWeight: 600, transform: `scale(${sp(t, remote, { damping: 11, stiffness: 220 })})` }}>Remote Control</div>
              )}
              {agentes && t >= agentes.at && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 * s, padding: `${4 * s}px ${12 * s}px`, borderRadius: 999, background: "#33302C", border: `${2 * s}px solid ${C.acento}`, color: VS.texto, fontSize: 19 * s, fontWeight: 600, transform: `scale(${sp(t, agentes.at, { damping: 11, stiffness: 220 })})` }}>
                  <div style={{ width: 10 * s, height: 10 * s, borderRadius: "50%", background: C.acento, opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 4)) }} />
                  {agentes.n} agents
                </div>
              )}
              <div style={{ flex: 1 }} />
              {/* selector de modo */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 * s, padding: `${5 * s}px ${12 * s}px`, borderRadius: 8 * s, background: abierto ? "#3A3D41" : "transparent", border: `${2 * s}px solid ${esPlan ? C.acento : "transparent"}`, color: esPlan ? C.acentoSuave : "#B5B5B5", fontSize: 21 * s, fontWeight: 600 }}>
                {esPlan ? (
                  <svg width={22 * s} height={22 * s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M5 4 H19 V20 H5 Z M8.5 9 H15.5 M8.5 13 H15.5 M8.5 17 H12.5" /></svg>
                ) : (
                  <svg width={22 * s} height={22 * s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8 13 V5.5 A1.5 1.5 0 0 1 11 5.5 V11 M11 10 V4 A1.5 1.5 0 0 1 14 4 V11 M14 10.5 V5.5 A1.5 1.5 0 0 1 17 5.5 V14 C17 18 14.5 21 11 21 C8 21 6.5 19 5 16.5 L3.5 13.5 A1.4 1.4 0 0 1 6 12.3 L8 15" /></svg>
                )}
                {esPlan ? "Plan" : "Manual"}
              </div>
              {/* micrófono */}
              <div style={{ width: 42 * s, height: 42 * s, borderRadius: 10 * s, background: graba ? VS.azul : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={26 * s} height={26 * s} viewBox="0 0 24 24" fill="none" stroke={graba ? "#FFFFFF" : "#8A8A8A"} strokeWidth={2.2} strokeLinecap="round"><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5.5 11 A6.5 6.5 0 0 0 18.5 11 M12 17.5 V21" /></svg>
              </div>
              <div style={{ width: 42 * s, height: 42 * s, borderRadius: 10 * s, background: entrada || (adjunto && t > adjunto.at) ? C.acento : "#3C3C3C", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * pulsaEnvio})` }}>
                <svg width={22 * s} height={22 * s} viewBox="0 0 24 24"><path d="M12 19 V5 M5 12 L12 5 L19 12" stroke="#1E1E1E" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
            {/* ondas del micrófono */}
            {graba && (
              <div style={{ position: "absolute", right: 70 * s, top: -64 * s, display: "flex", alignItems: "center", gap: 6 * s, padding: `${8 * s}px ${14 * s}px`, borderRadius: 999, background: VS.azul }}>
                {Array.from({ length: 9 }, (_, k) => (
                  <div key={k} style={{ width: 6 * s, height: (10 + 24 * Math.abs(Math.sin(t * 9 + k * 1.3))) * s, borderRadius: 3 * s, background: "#FFFFFF" }} />
                ))}
              </div>
            )}
            {/* menú de modos */}
            {menuModo > 0.01 && (
              <div style={{ position: "absolute", right: 90 * s, bottom: 70 * s, width: 400 * s, borderRadius: 12 * s, background: "#2C2C2E", border: `${2 * s}px solid ${VS.borde}`, boxShadow: "0 20px 50px rgba(0,0,0,0.6)", padding: 8 * s, opacity: menuModo, transform: `translateY(${(1 - menuModo) * 20 * s}px)` }}>
                {[
                  { k: "Manual", d: "Asks before edits" },
                  { k: "Plan", d: "Plans before changes" },
                  { k: "Edit automatically", d: "Edits without asking" },
                ].map((o, i) => {
                  const marcado = i === 1 && modo?.plan !== undefined && t > modo.plan - 0.35;
                  return (
                    <div key={o.k} style={{ padding: `${10 * s}px ${14 * s}px`, borderRadius: 8 * s, background: marcado ? C.acento : "transparent", color: marcado ? C.oscuro : VS.texto }}>
                      <div style={{ fontSize: 23 * s, fontWeight: 700 }}>{o.k}</div>
                      <div style={{ fontSize: 17 * s, opacity: 0.75 }}>{o.d}</div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* menú de comandos */}
            {barra && vBarra > 0.01 && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: "100%", marginBottom: 10 * s, borderRadius: 12 * s, background: "#2C2C2E", border: `${2 * s}px solid ${VS.borde}`, boxShadow: "0 20px 50px rgba(0,0,0,0.6)", padding: 8 * s, opacity: vBarra, transform: `translateY(${(1 - vBarra) * 20 * s}px)` }}>
                <div style={{ fontSize: 17 * s, color: VS.gris, padding: `${4 * s}px ${12 * s}px` }}>Slash Commands</div>
                {COMANDOS.filter((c) => !barra.filtro || c.k.startsWith(barra.filtro)).map((c) => {
                  const marcado = barra.resalta === c.k;
                  return (
                    <div key={c.k} style={{ display: "flex", gap: 16 * s, alignItems: "baseline", padding: `${8 * s}px ${12 * s}px`, borderRadius: 8 * s, background: marcado ? C.acento : "transparent", color: marcado ? C.oscuro : VS.texto }}>
                      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 23 * s }}>{c.k}</span>
                      <span style={{ fontSize: 18 * s, opacity: 0.75 }}>{c.d}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* historial de sesiones */}
          {historial && vHist > 0.01 && (
            <div style={{ position: "absolute", right: 16 * s, top: 62 * s, width: 560 * s, borderRadius: 14 * s, background: "#2C2C2E", border: `${2 * s}px solid ${VS.borde}`, boxShadow: "0 24px 60px rgba(0,0,0,0.65)", padding: 10 * s, opacity: vHist, transform: `translateY(${(1 - vHist) * -16 * s}px)` }}>
              <div style={{ fontSize: 19 * s, color: VS.gris, padding: `${4 * s}px ${12 * s}px ${8 * s}px` }}>Session history</div>
              {SESIONES.map((ses, i) => {
                const marcado = i === 1 && t > historial.elige - 0.3;
                return (
                  <div key={ses.k} style={{ display: "flex", justifyContent: "space-between", padding: `${12 * s}px ${14 * s}px`, borderRadius: 8 * s, background: marcado ? C.acento : "transparent", color: marcado ? C.oscuro : VS.texto, fontSize: 23 * s, fontWeight: 600 }}>
                    <span>{ses.k}</span>
                    <span style={{ opacity: 0.7, fontWeight: 500 }}>{ses.cuando}</span>
                  </div>
                );
              })}
            </div>
          )}
          {/* menú de rebobinar */}
          {rebobinar && t > rebobinar.pulsa && t < rebobinar.cierra && (
            <div style={{ position: "absolute", right: 30 * s, top: "38%", width: 560 * s, borderRadius: 12 * s, background: "#2C2C2E", border: `${2 * s}px solid ${VS.borde}`, boxShadow: "0 24px 60px rgba(0,0,0,0.65)", padding: 8 * s, opacity: clamp01((t - rebobinar.pulsa) / 0.15) * (1 - ramp(t, rebobinar.cierra - 0.2, rebobinar.cierra)) }}>
              {["Fork conversation from here", "Rewind code to here", "Fork conversation and rewind code"].map((o, i) => {
                const marcado = i === 1 && t > rebobinar.elige - 0.3;
                return (
                  <div key={o} style={{ padding: `${12 * s}px ${14 * s}px`, borderRadius: 8 * s, background: marcado ? C.acento : "transparent", color: marcado ? C.oscuro : VS.texto, fontSize: 23 * s, fontWeight: 600 }}>
                    {o}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const COMANDOS = [
  { k: "/init", d: "Create a CLAUDE.md file" },
  { k: "/clear", d: "Clear conversation" },
  { k: "/model", d: "Switch model" },
  { k: "/mcp", d: "Manage MCP servers" },
  { k: "/plan", d: "Switch to plan mode" },
  { k: "/remote-control", d: "Continue from another device" },
];

const SESIONES = [
  { k: "Botón de WhatsApp", cuando: "hoy" },
  { k: "Portada de la panadería", cuando: "ayer" },
  { k: "CLAUDE.md del proyecto", cuando: "hace 3 días" },
];

/** Texto tecleado al ritmo de la voz entre a y b (letra a letra). */
export const teclea = (texto: string, t: number, a: number, b: number) => texto.slice(0, Math.round(clamp01((t - a) / Math.max(0.2, b - a)) * texto.length));
