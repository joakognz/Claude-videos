/**
 * EP.9 · Parte 2 · PASO 2 «MCP» (escena mcp): logo de MCP → ESTÁNDAR ABIERTO y Anthropic → la regleta: Claude Code
 * en un extremo y los enchufes libres → Airtable se enchufa → la tabla de encargos (datos ficticios, solo barras) →
 * se teclea «pon en la portada los panes más encargados esta semana» y la web de la panadería estrena «Los más
 * encargados» → Hostinger se enchufa: DOMINIO y HOSTING → de CÓDIGO a NEGOCIO.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { teclea } from "../../componentes/ep09/Chat";
import { PRODUCTOS, WebPanaderia } from "../../componentes/ep09/Panaderia";
import { IcoCodigo, IcoGlobo, IcoNegocio, IcoServidor, IcoTabla, Pos } from "../../componentes/ep09/Piezas9";
import { C, EASE, EASE_OUT, TITULO, UI, clamp01, ramp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "mcp";
const tiempos = (L: Linea) => ({
  paso: L.en(E, "Paso"),
  mcp: L.en(E, "MCP:"),
  conecta: L.en(E, "conecta"),
  estandar: L.en(E, "estándar"),
  creo: L.en(E, "creó"),
  anthropic: L.en(E, "Anthropic,"),
  como: L.en(E, "como"),
  enchufe: L.en(E, "enchufe"),
  claude: L.en(E, "Claude"),
  programas: L.en(E, "programas."),
  conectas: L.en(E, "conectas"),
  airtable: L.en(E, "Airtable,"),
  donde: L.en(E, "donde"),
  encargos: L.en(E, "encargos,"),
  pides: L.en(E, "pides:"),
  pon: L.en(E, "«pon"),
  panes: L.en(E, "panes"),
  encargados: L.en(E, "encargados"),
  semana: L.en(E, "semana»."),
  finSemana: L.finDe(E, "semana»."),
  hostinger: L.en(E, "Hostinger"),
  conexion: L.en(E, "conexión,"),
  dominio: L.en(E, "dominio"),
  hosting: L.en(E, "hosting."),
  ya: L.en(E, "Ya"),
  escribe: L.en(E, "escribe"),
  trabaja: L.en(E, "trabaja"),
  datos: L.en(E, "datos"),
  negocio: L.en(E, "negocio."),
});

const REG = { x0: 270, x1: 1010, y: 1760 };
const ENCHUFES = [420, 665, 905];

const Regleta: React.FC<{ t: number; at: number; activos: number[]; luz: number }> = ({ t, at, activos, luz }) => {
  const v = vis(t, at, Infinity, 0.8);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: REG.x0, top: REG.y - 70, width: REG.x1 - REG.x0, height: 140, opacity: v.opacity, transform: `translateY(${v.y}px) scaleX(${0.6 + 0.4 * v.s})`, transformOrigin: "0 50%", borderRadius: 40, background: "#E9E6DF", border: `6px solid ${C.oscuro}`, boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}>
      <div style={{ position: "absolute", right: 12, top: 50, width: 32, height: 32, borderRadius: 10, background: luz > 0.5 ? "#4EC97B" : "#B6B2A8", boxShadow: luz > 0.5 ? "0 0 24px #4EC97B" : "none" }} />
      {ENCHUFES.map((x, k) => (
        <div key={k} style={{ position: "absolute", left: x - REG.x0 - 50, top: 15, width: 100, height: 100, borderRadius: "50%", background: "#CFCBC2", border: `5px solid ${activos[k] > 0.5 ? C.acento : "#9C978C"}`, boxShadow: activos[k] > 0.5 ? `0 0 30px ${C.acento}` : "inset 0 6px 12px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.oscuro }} />
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.oscuro }} />
        </div>
      ))}
    </div>
  );
};

/** Ficha de herramienta (logo del usuario sobre tarjeta clara) que baja y se enchufa en la regleta. */
const Clavija: React.FC<{ t: number; at: number; enchufa: number; x: number; src: string; out?: number }> = ({ t, at, enchufa, x, src, out }) => {
  const v = vis(t, at, out, 0.7);
  if (!v.on) return null;
  const baja = ramp(t, at, enchufa, EASE_OUT);
  const golpe = t > enchufa ? Math.sin(clamp01((t - enchufa) / 0.2) * Math.PI) * 10 : 0;
  const y = REG.y - 380 + 120 * baja + golpe;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: v.opacity }}>
      <div style={{ position: "absolute", left: -4, top: 80, width: 8, height: 170, background: C.oscuro, borderLeft: "3px solid #3A3F4B" }} />
      <div style={{ position: "absolute", left: -32, top: 230, width: 64, height: 46, borderRadius: 10, background: "#3A3F4B", border: `4px solid ${C.oscuro}` }} />
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, padding: "20px 26px", borderRadius: 24, background: "#F6F7F9", boxShadow: "0 22px 60px rgba(0,0,0,0.6)" }}>
        <Img src={staticFile(src)} style={{ width: 160, display: "block" }} />
      </div>
    </div>
  );
};

export const Mcp: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1060, z: 1.0 },
    { t: T.como - 0.3, x: 560, y: 1640, z: 1.0, d: 0.9 },
    { t: T.donde - 0.3, x: 540, y: 2390, z: 1.0, d: 0.9 },
    { t: T.hostinger - 0.25, x: 560, y: 1660, z: 1.0, d: 0.8 },
    { t: T.ya - 0.2, x: 540, y: 1800, z: 0.98, d: 0.8 },
  ];
  const fueraTop = T.como + 0.4;
  const airtableIn = T.airtable;
  const hostingerIn = T.hostinger + 0.6;
  const activos = [t > airtableIn ? 1 : t > T.programas ? 0.6 : 0, t > hostingerIn ? 1 : t > T.programas ? 0.6 : 0, t > T.programas ? 0.6 : 0];
  const peticion = teclea("pon en la portada los panes más encargados esta semana", t, T.pon, T.finSemana);
  const vabla = vis(t, T.donde - 0.15, T.hostinger, 0.75);
  const vPet = vis(t, T.pides - 0.2, T.hostinger, 0.85);
  const vWeb = vis(t, T.panes - 0.2, T.hostinger, 0.8);
  const vuela = ramp(t, T.encargados, T.semana + 0.1, EASE);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 2" x={540} y={740} t={t} at={T.paso} out={T.mcp + 0.3} size={60} rot={-5} />
      <Logo src={ep.logos.mcp} x={540} y={980} w={230} t={t} at={T.mcp - 0.1} out={fueraTop} ficha="circulo" pulsos={[T.conecta]} />
      <Etiqueta texto="MCP" x={540} y={1170} t={t} at={T.mcp} out={T.estandar - 0.1} size={80} variante="texto" fuente="titulo" />
      <Etiqueta texto="CONECTA TUS HERRAMIENTAS" x={540} y={1280} t={t} at={T.conecta} out={fueraTop} size={42} variante="acento" fuente="titulo" />
      <Etiqueta texto="ESTÁNDAR ABIERTO" x={540} y={1170} t={t} at={T.estandar} out={fueraTop} size={46} variante="borde" fuente="titulo" />
      <Logo src={ep.logos.anthropic} x={860} y={960} w={180} t={t} at={T.anthropic - 0.1} out={fueraTop} />
      <Etiqueta texto="LO CREÓ ANTHROPIC" x={860} y={1080} t={t} at={T.anthropic} out={fueraTop} size={26} variante="gris" fuente="titulo" />

      {/* ── la regleta ── */}
      <Etiqueta texto="ENCHUFE UNIVERSAL" x={600} y={1500} t={t} at={T.enchufe} out={T.conectas} size={44} variante="acento" fuente="titulo" />
      <svg width={1080} height={2000} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {t > T.claude - 0.1 && <path d={`M 150 ${REG.y + 80} C 160 ${REG.y + 160}, 250 ${REG.y + 60}, ${REG.x0 + 4} ${REG.y}`} fill="none" stroke={C.oscuro} strokeWidth={22} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - ramp(t, T.claude - 0.1, T.claude + 0.4))} />}
        {t > T.claude - 0.1 && <path d={`M 150 ${REG.y + 80} C 160 ${REG.y + 160}, 250 ${REG.y + 60}, ${REG.x0 + 4} ${REG.y}`} fill="none" stroke="#3A3F4B" strokeWidth={14} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - ramp(t, T.claude - 0.1, T.claude + 0.4))} />}
      </svg>
      <Regleta t={t} at={T.enchufe - 0.1} activos={activos} luz={t > T.programas ? 1 : 0} />
      <Logo src={ep.logos.claude_code} x={140} y={REG.y - 30} w={170} t={t} at={T.claude - 0.15} />
      <Etiqueta texto="TUS PROGRAMAS" x={640} y={1900} t={t} at={T.programas - 0.05} out={T.conectas + 0.2} size={34} variante="gris" fuente="titulo" />
      <Clavija t={t} at={T.conectas - 0.2} enchufa={airtableIn} x={ENCHUFES[0]} src={ep.logos.airtable} />
      <Clavija t={t} at={T.hostinger - 0.15} enchufa={hostingerIn} x={ENCHUFES[1]} src={ep.logos.hostinger} />

      {/* ── los encargos en Airtable y la petición ── */}
      {vPet.on && (
        <div style={{ position: "absolute", left: 70, top: 2040, width: 940, opacity: vPet.opacity, transform: `translateY(${vPet.y}px) scale(${vPet.scale})`, borderRadius: 22, background: "#252526", border: `3px solid ${peticion && t < T.finSemana + 0.2 ? C.acento : "#3C3C3C"}`, padding: "18px 24px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18 }}>
          <Img src={staticFile(ep.logos.claude_code)} style={{ width: 52 }} />
          <div style={{ flex: 1, fontFamily: UI, fontWeight: 600, fontSize: 34, lineHeight: 1.3, color: peticion ? "#E6E6E6" : "#7A7A7A", minHeight: 88 }}>{peticion || "Claude Code"}</div>
        </div>
      )}
      {vabla.on && (
        <div style={{ position: "absolute", left: 40, top: 2270, width: 510, opacity: vabla.opacity, transform: `translateY(${vabla.y}px) scale(${vabla.scale})`, transformOrigin: "50% 0", borderRadius: 24, background: "#FFFFFF", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "#F2F4F7", borderBottom: "2px solid #E1E5EB" }}>
            <IcoTabla s={40} color="#3B4250" grosor={2.2} />
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: "#1F2633" }}>Encargos</div>
            <div style={{ flex: 1 }} />
            <Img src={staticFile(ep.logos.airtable)} style={{ width: 120 }} />
          </div>
          {PRODUCTOS.map((p, k) => {
            const barra = [0.9, 0.62, 0.78][k] * ramp(t, T.encargos - 0.1 + k * 0.12, T.encargos + 0.5 + k * 0.12, EASE_OUT);
            const despega = clamp01(vuela * 1.4 - k * 0.15);
            return (
              <div key={p.nombre} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "2px solid #EEF0F4" }}>
                <div style={{ width: 70, height: 50, display: "flex", alignItems: "center", justifyContent: "center", transform: `translate(${despega * 420}px, ${despega * 40}px) scale(${1 - 0.3 * despega})`, opacity: 1 - despega }}>
                  <p.Dibujo s={66} />
                </div>
                <div style={{ width: 130, fontFamily: UI, fontWeight: 700, fontSize: 26, color: "#1F2633" }}>{p.nombre}</div>
                <div style={{ flex: 1, height: 20, borderRadius: 10, background: "#EEF0F4" }}>
                  <div style={{ width: `${barra * 100}%`, height: "100%", borderRadius: 10, background: p.fondo }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {vWeb.on && (
        <div style={{ position: "absolute", left: 805, top: 2530, width: 0, height: 0, opacity: vWeb.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vWeb.y}px) scale(${vWeb.scale})` }}>
            <WebPanaderia w={480} t={t} whatsapp={1} logoWhatsapp={ep.logos.whatsapp} destacados={ramp(t, T.encargados + 0.3, T.semana + 0.3)} img={ep.imagenes!.panaderia} />
          </div>
        </div>
      )}
      <Etiqueta texto="LOS DATOS DE TUS ENCARGOS" x={300} y={2700} t={t} at={T.encargos} out={T.hostinger} size={28} variante="borde" fuente="titulo" />

      {/* ── Hostinger: dominio y hosting ── */}
      {[
        { at: T.dominio, x: 420, txt: "DOMINIO", Ico: IcoGlobo },
        { at: T.hosting, x: 830, txt: "HOSTING", Ico: IcoServidor },
      ].map((c) => (
        <Pos key={c.txt} x={c.x} y={1920} t={t} at={c.at - 0.05} out={T.ya + 0.1}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 28px", borderRadius: 999, background: C.panel2, border: `4px solid ${C.acento}` }}>
            <c.Ico s={46} color={C.acento} grosor={2.4} />
            <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto }}>{c.txt}</span>
          </div>
        </Pos>
      ))}

      {/* ── de código a negocio ── */}
      <Pos x={290} y={2020} t={t} at={T.escribe - 0.05} out={hasta + 0.3}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, padding: "16px 30px", borderRadius: 999, background: C.panel2, border: `4px solid ${C.borde}`, opacity: 1 - 0.5 * ramp(t, T.trabaja, T.trabaja + 0.3) }}>
          <IcoCodigo s={50} color={C.gris} grosor={2.4} />
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.gris }}>CÓDIGO</span>
          <div style={{ position: "absolute", left: 20, right: 20, top: "50%", height: 6, background: C.acento, transform: `scaleX(${ramp(t, T.trabaja, T.trabaja + 0.35)})`, transformOrigin: "0 50%" }} />
        </div>
      </Pos>
      <Pos x={540} y={2020} t={t} at={T.trabaja} out={hasta + 0.3}>
        <svg width={90} height={50} viewBox="0 0 60 40"><path d="M4 20 H50 M38 8 L52 20 L38 32" fill="none" stroke={C.acento} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Pos>
      <Pos x={800} y={2020} t={t} at={T.datos - 0.05} out={hasta + 0.3}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 30px", borderRadius: 999, background: C.acento, boxShadow: `0 16px 50px ${C.acento}66` }}>
          <IcoNegocio s={50} color={C.oscuro} grosor={2.4} />
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.oscuro }}>NEGOCIO</span>
        </div>
      </Pos>
    </Escena>
  );
};

export const eventosMcp = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.mcp - 0.1, sfx: "pop", vol: 0.45 },
    { t: T.estandar, sfx: "pop", vol: 0.3 },
    { t: T.anthropic - 0.1, sfx: "pop", vol: 0.4 },
    { t: T.enchufe - 0.1, sfx: "whoosh", vol: 0.3 },
    { t: T.claude - 0.15, sfx: "pop", vol: 0.35 },
    { t: T.programas, sfx: "tick", vol: 0.4 },
    { t: T.airtable, sfx: "golpe", vol: 0.45 },
    { t: T.donde - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.pon, sfx: "tecleo", vol: 0.25, dur: T.finSemana - T.pon },
    { t: T.panes - 0.2, sfx: "pop", vol: 0.35 },
    { t: T.encargados, sfx: "whoosh", vol: 0.3 },
    { t: T.semana + 0.2, sfx: "pop", vol: 0.4 },
    { t: T.hostinger + 0.6, sfx: "golpe", vol: 0.45 },
    { t: T.dominio, sfx: "pop", vol: 0.35 },
    { t: T.hosting, sfx: "pop", vol: 0.35 },
    { t: T.trabaja, sfx: "whoosh", vol: 0.25 },
    { t: T.datos, sfx: "golpe", vol: 0.4 },
  ];
};
