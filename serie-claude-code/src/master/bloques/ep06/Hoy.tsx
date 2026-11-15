/**
 * EP.6 · bloque «Hoy» (escenas hoy → prompt):
 * HOY · PROMPTING MAESTRO → «cómo pedirle las cosas a Claude» (bocadillo → Claude) → la flecha da en el centro de
 * la diana: A LA PRIMERA → PROMPT = LO QUE LE ESCRIBES y, en el panel de Claude Code, se escribe la frase de la voz.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Logo } from "../../componentes/Logo";
import { Etiqueta } from "../../componentes/Sello";
import { C, TITULO, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Pop } from "../../ep05/kit";
import { Asterisco, Pestana, VS, Ventana } from "../../ep05/ui";
import { Ico, Medalla6, TextoVoz, tramo } from "../../ep06/kit6";

const PANEL = { x: 540, y: 2130, w: 980, h: 560 };

const tiempos = (L: LineaT) => ({
  hoy: L.ini("hoy"),
  prompting: L.en("hoy", "prompting"),
  maestro: L.en("hoy", "maestro"),
  como: L.en("hoy", "cómo"),
  pedirle: L.en("hoy", "pedirle"),
  claude: L.en("hoy", "Claude"),
  bien: L.en("hoy", "bien"),
  primera: L.en("hoy", "primera"),
  un: L.ini("prompt"),
  prompt: L.en("prompt", "prompt"),
  sencillamente: L.en("prompt", "sencillamente"),
  lo: L.en("prompt", "lo"),
  escribes: L.en("prompt", "escribes"),
  claude2: L.en("prompt", "Claude."),
  fin: L.fin("prompt"),
});

export const Hoy: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 880, z: 1.04 },
    { t: T.como - 0.25, x: 540, y: 1060, z: 1.0, d: 0.9 },
    { t: T.bien - 0.35, x: 540, y: 1210, z: 1.04, d: 0.8 },
    { t: T.un - 0.35, x: 540, y: 1880, z: 1.0, d: 0.9 },
    { t: T.lo - 0.2, x: 540, y: 2080, z: 1.02, d: 0.8 },
  ];
  const fueraA = T.un + 0.2;
  // flecha que vuela a la diana
  const vuelo = ramp(t, T.bien - 0.05, T.primera + 0.05);
  const clavada = t > T.primera + 0.05;
  const frase = tramo(L, "prompt", "lo", "Claude.");
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="HOY" x={540} y={640} t={t} at={T.hoy - 0.05} out={T.como} size={40} variante="acento" fuente="titulo" />
      {(["PROMPTING", "MAESTRO"] as const).map((w, i) => {
        const at = (i === 0 ? T.prompting : T.maestro) - 0.05;
        const v = vis(t, at, fueraA, 0.5);
        if (!v.on) return null;
        return (
          <div key={w} style={{ position: "absolute", left: 540, top: 790 + i * 125, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, fontFamily: TITULO, fontWeight: 800, fontSize: 132, letterSpacing: 2, color: i === 0 ? C.texto : C.acento, whiteSpace: "nowrap", textShadow: i === 1 ? `0 0 40px ${C.acento}55` : undefined }}>{w}</div>
          </div>
        );
      })}
      {/* cómo pedirle las cosas a Claude */}
      <Pop x={270} y={1110} t={t} at={T.pedirle - 0.05} out={fueraA} rot={-10}>
        <Medalla6 nombre="bocadillo" size={150} />
      </Pop>
      <Flecha curva={{ a: { x: 370, y: 1110 }, c: { x: 520, y: 1050 }, b: { x: 680, y: 1110 } }} p={ramp(t, T.pedirle + 0.1, T.claude)} ancho={9} opacity={1 - ramp(t, fueraA - 0.35, fueraA)} />
      <Logo src={ep.logos.claude} x={800} y={1110} w={150} t={t} at={T.claude - 0.08} out={fueraA} pulsos={[T.claude + 0.1]} />
      {/* bien a la primera: la diana */}
      <Pop x={540} y={1360} t={t} at={T.bien - 0.25} out={fueraA} latidos={clavada ? [T.primera + 0.05] : []}>
        <div style={{ position: "relative", width: 210, height: 210 }}>
          <Ico nombre="diana" size={210} grosor={1.8} />
        </div>
      </Pop>
      {vuelo > 0 && t < fueraA && (
        <div style={{ position: "absolute", left: 540 - 520 * (1 - vuelo), top: 1360 - 160 * (1 - vuelo) * (1 - vuelo), width: 0, height: 0, opacity: 1 - ramp(t, fueraA - 0.35, fueraA) }}>
          <svg width={150} height={40} viewBox="0 0 150 40" style={{ position: "absolute", left: -150, top: -20, overflow: "visible", transform: `rotate(${(1 - vuelo) * 18}deg)`, transformOrigin: "150px 20px" }}>
            <path d="M0 20 H138" stroke={C.texto} strokeWidth={7} strokeLinecap="round" />
            <path d="M150 20 L128 8 L132 20 L128 32 Z" fill={C.acento} />
            <path d="M6 20 L-10 6 M6 20 L-10 34 M22 20 L6 6 M22 20 L6 34" stroke={C.acento} strokeWidth={5} strokeLinecap="round" />
          </svg>
          {clavada && <div style={{ position: "absolute", left: -60, top: -60, width: 120, height: 120, borderRadius: "50%", border: `5px solid ${C.acento}`, opacity: 1 - ramp(t, T.primera + 0.05, T.primera + 0.6), transform: `scale(${0.4 + 1.6 * ramp(t, T.primera + 0.05, T.primera + 0.6)})` }} />}
        </div>
      )}
      <Etiqueta texto="A LA PRIMERA" x={540} y={1545} t={t} at={T.primera - 0.02} out={fueraA} size={46} variante="acento" fuente="titulo" />

      {/* ── un prompt es lo que le escribes ── */}
      {(() => {
        const v = vis(t, T.prompt - 0.08, hasta + 0.4, 0.5);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 1700, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, display: "flex", alignItems: "center", gap: 30, whiteSpace: "nowrap" }}>
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 104, color: C.texto }}>PROMPT</div>
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 104, color: C.acento, opacity: ramp(t, T.lo - 0.1, T.lo + 0.2) }}>=</div>
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="LO QUE LE ESCRIBES" x={540} y={1830} t={t} at={T.escribes - 0.05} out={hasta + 0.4} size={44} variante="borde" fuente="titulo" />
      {(() => {
        const v = vis(t, T.sencillamente - 0.1, hasta + 0.4, 0.85);
        if (!v.on) return null;
        const escribiendo = t >= T.lo - 0.05;
        return (
          <div style={{ position: "absolute", left: PANEL.x - PANEL.w / 2, top: PANEL.y - PANEL.h / 2 + 60, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <Ventana w={PANEL.w} h={PANEL.h} titulo="Claude Code">
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", background: VS.barra, borderBottom: `2px solid ${VS.borde}` }}>
                  <Pestana texto="Claude Code" icono={<Asterisco size={24} />} />
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Img src={staticFile(ep.logos.claude_code)} style={{ width: 130, opacity: 0.85 * Math.min(1, sp(t, T.sencillamente, {}) * 1.5), transform: `scale(${0.7 + 0.3 * Math.min(1, sp(t, T.sencillamente, {}))})` }} />
                </div>
                <div style={{ padding: "0 26px 26px" }}>
                  <div style={{ boxSizing: "border-box", borderRadius: 14, border: `2px solid ${escribiendo ? VS.entrada : VS.cajaBorde}`, background: "#1B1B1B", padding: "18px 22px 14px", minHeight: 120 }}>
                    {escribiendo ? (
                      <TextoVoz palabras={frase} t={t} size={40} limpiar={(w) => w.replace(/\.$/, "")} resaltes={[3]} />
                    ) : (
                      <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 30, color: VS.tenue }}>⌘ Esc to focus or unfocus Claude</span>
                    )}
                  </div>
                </div>
              </div>
            </Ventana>
          </div>
        );
      })()}
    </Escena>
  );
};

export const eventosHoy = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.hoy, sfx: "pop", vol: 0.35 },
    { t: T.prompting, sfx: "golpe", vol: 0.45 },
    { t: T.claude, sfx: "pop", vol: 0.35 },
    { t: T.bien, sfx: "whoosh", vol: 0.3 },
    { t: T.primera + 0.05, sfx: "golpe", vol: 0.5 },
    { t: T.prompt, sfx: "pop", vol: 0.4 },
    { t: T.lo, sfx: "tecleo", vol: 0.26, dur: Math.max(0.3, T.fin - T.lo) },
  ];
};
