/**
 * EP.13 v2 · El módulo 1: las 12 casillas de los episodios encendidas, la 13 se enciende con «hoy» y la caja MÓDULO 1
 * se cierra de golpe con el sello COMPLETADO (detras). Después, la caja se abre y cada herramienta salta de ella al
 * ritmo de la voz (repaso).
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { ArchivoMd, Caja, Deshacer, Portatil, Tablero, temblor } from "../../componentes/ep13b/Piezas13b";
import { C, MONO, TITULO, clamp01, cue, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

// ── cerramos el módulo 1 ─────────────────────────────────────────────────────────────────────────────────────────
const E = "detras";
const tDetras = (L: Linea) => ({
  hoy: L.en(E, "hoy,"),
  este: L.en(E, "este,"),
  cerramos: L.en(E, "cerramos"),
  uno: L.en(E, "1."),
});

export const Detras13b: React.FC<BloqueProps> = ({ t, L, desde }) => {
  const T = tDetras(L);
  const tomas: Toma[] = [{ t: desde - 1, x: 540, y: 1120, z: 1.08 }, { t: T.cerramos, x: 540, y: 1150, z: 1.0, d: 0.5 }];
  const sh = temblor(t, [T.cerramos + 0.28, T.uno], 18);
  const vCont = vis(t, desde - 0.2, Infinity, 0.7);
  const cierra = 1 - ramp(t, T.cerramos + 0.05, T.cerramos + 0.28, (x) => x * x);
  const abre = t < T.cerramos ? ramp(t, desde, desde + 0.4) : cierra;
  const golpe = Math.sin(clamp01((t - T.cerramos - 0.28) / 0.2) * Math.PI);
  const vCaja = vis(t, desde - 0.1, Infinity, 0.5);
  const trece = sp(t, T.hoy, { damping: 10, stiffness: 240 });
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        {vCont.on && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: vCont.opacity, transform: `scale(${vCont.scale})` }}>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 200, lineHeight: 1, color: t >= T.este ? C.texto : C.acento }}>{t >= T.este ? "EP.13" : "12"}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 42, color: C.texto, letterSpacing: 8 }}>{t >= T.este ? "CIERRA EL MÓDULO" : "EPISODIOS"}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 50 }}>
              {Array.from({ length: 13 }, (_, i) => {
                const on = i < 12 ? clamp01((t - desde + 0.1 - i * 0.03) / 0.12) : trece;
                const es13 = i === 12;
                return <div key={i} style={{ width: 60, height: 60, borderRadius: 14, background: on > 0.5 ? C.acento : C.panel2, border: `3px solid ${es13 && on > 0.5 ? C.texto : on > 0.5 ? C.acento : C.borde}`, transform: `scale(${es13 ? 0.7 + 0.45 * trece + (trece > 0.9 ? 0.08 * Math.sin(t * 9) : 0) : 1})`, boxShadow: es13 && on > 0.5 ? `0 0 26px ${C.texto}` : undefined }} />;
              })}
            </div>
          </div>
        )}
        {vCaja.on && (
          <div style={{ opacity: vCaja.opacity, transform: `translateY(${vCaja.y * 3}px)` }}>
            <Caja x={540} y={1470} w={420} abre={abre} aplasta={golpe} brillo={golpe} />
          </div>
        )}
        <Sello texto="COMPLETADO ✓" x={540} y={1360} t={t} at={T.uno} size={84} rot={-7} resalte={1} />
      </div>
    </Escena>
  );
};

export const eventosDetras13b = (L: Linea): Evento[] => {
  const T = tDetras(L);
  return [
    cue(T.hoy, "destello", "se enciende la casilla 13", "medio"),
    cue(T.este, "click", "EP.13 · CIERRA EL MÓDULO", "bajo"),
    cue(T.cerramos + 0.28, "impacto", "la caja MÓDULO 1 se cierra de golpe", "fuerte"),
    cue(T.uno + 0.02, "acierto", "sello COMPLETADO", "medio"),
  ];
};

// ── repaso ───────────────────────────────────────────────────────────────────────────────────────────────────────
const R = "repaso";
const CAJA = { x: 540, y: 1530, w: 260 };
const tRepaso = (L: Linea) => ({
  instalar: L.en(R, "instalar"),
  claude: L.en(R, "Claude Code dentro"),
  visual: L.en(R, "Visual"),
  contexto: L.en(R, "contexto"),
  md: L.en(R, "CLAUDE.md,"),
  corregir: L.en(R, "corregirlo"),
  miedo: L.en(R, "miedo,"),
  planifique: L.en(R, "planifique,"),
  reparta: L.en(R, "reparta"),
  conecte: L.en(R, "conecte"),
  herramientas: L.en(R, "herramientas."),
  use: L.en(R, "use"),
  ordenador: L.en(R, "ordenador."),
  esa: L.en(R, "Esa"),
  caja: L.en(R, "caja"),
});

type Herr = { x: number; y: number; at: number; etiqueta: string; etAt: number };

export const Repaso13b: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tRepaso(L);
  const H: Herr[] = [
    { x: 250, y: 790, at: T.claude - 0.1, etiqueta: "INSTALAR", etAt: T.visual },
    { x: 830, y: 790, at: T.md - 0.15, etiqueta: "CONTEXTO", etAt: T.md + 0.3 },
    { x: 250, y: 1040, at: T.corregir, etiqueta: "SIN MIEDO", etAt: T.miedo },
    { x: 830, y: 1040, at: T.planifique - 0.1, etiqueta: "PLANIFICA Y REPARTE", etAt: T.reparta },
    { x: 250, y: 1290, at: T.conecte, etiqueta: "CONECTA", etAt: T.herramientas },
    { x: 830, y: 1290, at: T.use - 0.1, etiqueta: "USA TU ORDENADOR", etAt: T.ordenador },
  ];
  // cámara: se acerca a cada herramienta y al final abre plano con la caja
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1250, z: 1.12 },
    ...H.map((h) => ({ t: h.at + 0.1, x: 540 + (h.x - 540) * 0.12, y: 1130 + (h.y - 1040) * 0.12, z: 1.04, d: 0.5 })),
    { t: T.esa - 0.15, x: 540, y: 1170, z: 0.94, d: 0.6 },
  ];
  const abre = ramp(t, desde + 0.1, desde + 0.5);
  const latido = H.reduce((acc, h) => acc + (t > h.at && t < h.at + 0.25 ? Math.sin(((t - h.at) / 0.25) * Math.PI) : 0), 0);
  const final = ramp(t, T.esa, T.caja + 0.2);
  // vuelo de cada herramienta: sale de la caja con un arco y gira
  const vuelo = (h: Herr, children: React.ReactNode, w: number) => {
    const s = sp(t, h.at, { damping: 13, stiffness: 150 });
    if (t < h.at) return null;
    const u = clamp01(s);
    const x = CAJA.x + (h.x - CAJA.x) * u;
    const y = CAJA.y - 120 + (h.y - CAJA.y + 120) * s - Math.sin(u * Math.PI) * 220;
    const giro = (1 - s) * (h.x < 540 ? -200 : 200);
    // al final se juntan un poco alrededor de la caja
    const fx = x;
    const fy = y - 10 * final;
    return (
      <div style={{ position: "absolute", left: fx, top: fy, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${(0.3 + 0.7 * Math.min(1.1, s)) * (1 - 0.1 * final)}) rotate(${giro}deg)`, width: w, display: "flex", justifyContent: "center" }}>{children}</div>
      </div>
    );
  };
  return (
    <Escena t={t} tomas={tomas}>
      {final > 0 && <div style={{ position: "absolute", left: 540 - 520, top: 1100 - 520, width: 1040, height: 1040, borderRadius: "50%", background: `radial-gradient(closest-side, ${C.acento}33, transparent)`, opacity: final }} />}
      <Caja x={CAJA.x} y={CAJA.y} w={CAJA.w} abre={abre} brillo={Math.min(1, latido + final)} aplasta={latido * 0.5} />
      {vuelo(
        H[0],
        <div style={{ position: "relative", width: 360, height: 200 }}>
          <Logo src={ep.logos.claude_code} x={95} y={100} w={170} t={t} at={H[0].at} sombra={false} />
          <Logo src={ep.logos.vscode} x={275} y={100} w={130} t={t} at={T.visual - 0.1} sombra={false} />
        </div>,
        360,
      )}
      {vuelo(H[1], <ArchivoMd w={170} logo={ep.logos.claude} lineas={ramp(t, T.md, T.md + 0.6)} />, 200)}
      {vuelo(H[2], <Deshacer w={190} gira={ramp(t, T.miedo - 0.2, T.miedo + 0.5)} />, 200)}
      {vuelo(H[3], <Tablero w={300} p={ramp(t, T.reparta - 0.1, T.conecte)} />, 300)}
      {vuelo(
        H[4],
        <div style={{ position: "relative", width: 300, height: 170 }}>
          <Logo src={ep.logos.github_circulo} x={90} y={85} w={150} t={t} at={H[4].at} ficha="circulo" sombra={false} />
          <Logo src={ep.logos.mcp} x={225} y={85} w={120} t={t} at={H[4].at + 0.25} ficha="circulo" sombra={false} />
        </div>,
        300,
      )}
      {vuelo(H[5], <Portatil w={270} cursor={ramp(t, T.use, T.ordenador + 0.4)} clic={Math.sin(clamp01((t - T.ordenador - 0.4) / 0.2) * Math.PI)} />, 280)}
      {H.map((h, i) => (
        <Etiqueta key={i} texto={h.etiqueta} x={h.x} y={h.y + (i === 3 ? 160 : 135)} t={t} at={h.etAt} size={30} variante={i % 2 ? "acento" : "borde"} fuente="titulo" />
      ))}
      <Sello texto="TU CAJA DE HERRAMIENTAS" x={540} y={1640} t={t} at={T.caja} size={54} rot={-3} resalte={1} />
    </Escena>
  );
};

export const eventosRepaso13b = (L: Linea): Evento[] => {
  const T = tRepaso(L);
  return [
    cue(T.claude, "zoom", "sale Claude Code de la caja (la cámara se acerca)", "bajo"),
    cue(T.visual, "click", "logo de Visual Studio Code", "bajo"),
    cue(T.md, "remate", "sale el archivo CLAUDE.md", "medio"),
    cue(T.corregir + 0.1, "interfaz", "sale la flecha de deshacer", "bajo"),
    cue(T.miedo, "click", "sello SIN MIEDO", "bajo"),
    cue(T.planifique, "remate", "sale el tablero de tareas", "medio"),
    cue(T.reparta + 0.3, "click", "las tareas se reparten", "bajo"),
    cue(T.conecte + 0.1, "glitch", "salen GitHub y MCP (conexiones)", "bajo"),
    cue(T.use, "interfaz", "sale el portátil con el cursor", "medio"),
    cue(T.ordenador + 0.45, "click", "el cursor hace clic", "bajo"),
    cue(T.esa - 0.1, "zoom", "la cámara abre plano con la caja", "bajo"),
    cue(T.caja, "destello", "sello TU CAJA DE HERRAMIENTAS", "medio"),
  ];
};
