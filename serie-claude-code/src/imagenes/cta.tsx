/** Llamado a la acción (últimos 6 s, regla 10): seguir la cuenta, la pregunta y el comentario que se escribe solo. */
import React from "react";
import { useEstilo } from "../componentes/estilo";
import { Logo } from "../componentes/Logo";
import type { Ctx } from "../plan";
import { MONO, TITULO, UI, pop, ramp } from "../tema";
import type { Medida } from "../tipos";
import { Caja, crecer, pos, unir } from "./piezas";

type Img = { tipo: "cta" };

const PERFIL = { x: 60, y: 650, w: 960, h: 190 };
const PREGUNTA = { x: 60, y: 880, w: 960, h: 300 };
const CAMPO = { x: 60, y: 1225, w: 960, h: 140 };
const SEGUIR = { x: PERFIL.x + PERFIL.w - 300, y: PERFIL.y + 50, w: 260, h: 90 };

export const medirCta = (_img: Img, ctx: Ctx): Medida => {
  const cta = ctx.ep.cta ?? {};
  const palabra = (cta.comenta ?? "AUDITORIA").toUpperCase();
  const tSeguir = ctx.at(cta.seguir ?? "Sígueme", ctx.inicio + 0.2);
  const tPregunta = ctx.at(cta.pregunta?.split(" ").slice(0, 2).join(" "), tSeguir + 1.8);
  const tComenta = ctx.at("Comenta", ctx.fin - 1.6);
  const tPalabra = ctx.at(cta.comenta, tComenta + 0.5);
  const t0 = tComenta + 0.15;
  const t1 = Math.min(ctx.fin - 0.35, Math.max(t0 + 0.6, tPalabra + 0.55));
  return {
    elementos: { perfil: PERFIL, seguir: SEGUIR, pregunta: PREGUNTA, comentario: CAMPO },
    focos: [{ t: tSeguir, rect: crecer(PERFIL, 40) }, { t: tPregunta, rect: crecer(PREGUNTA, 30) }, { t: tComenta - 0.1, rect: crecer(unir(PREGUNTA, CAMPO), 30) }],
    t: { seguir: tSeguir, pulsa: tSeguir + 0.45, pregunta: tPregunta, comenta: tComenta, t0, t1, enviar: t1 + 0.12, letras: palabra.length },
    eventos: [
      { t: tSeguir + 0.45, sfx: "pop", vol: 0.5 },
      { t: t0, sfx: "tecleo", vol: 0.32, dur: t1 - t0 },
      { t: t1 + 0.12, sfx: "envio", vol: 0.55 },
    ],
  };
};

export const VistaCta: React.FC<{ img: Img; m: Medida; t: number; usuario: string; pregunta?: string; palabra: string }> = ({ m, t, usuario, pregunta, palabra }) => {
  const E = useEstilo();
  const pulsado = t >= m.t.pulsa;
  const pres = ramp(t, m.t.pulsa - 0.08, m.t.pulsa) * (1 - ramp(t, m.t.pulsa + 0.02, m.t.pulsa + 0.18));
  const n = Math.round(Math.min(1, Math.max(0, (t - m.t.t0) / (m.t.t1 - m.t.t0))) * palabra.length);
  const enviado = t >= m.t.enviar;
  const envPres = ramp(t, m.t.enviar - 0.08, m.t.enviar) * (1 - ramp(t, m.t.enviar + 0.02, m.t.enviar + 0.2));
  const caret = Math.floor(t * 2.6) % 2 === 0 || (n > 0 && n < palabra.length);
  const pq = pop(t, m.t.pregunta, 0.35);
  return (
    <>
      <Caja r={PERFIL} t={t} at={m.t.seguir - 0.3} radio={36} fondo="#101010">
        <div style={{ position: "absolute", left: 30, top: 30 }}><Logo size={130} /></div>
        <div style={{ position: "absolute", left: 190, top: 52, fontFamily: UI, fontWeight: 700, fontSize: 44, color: E.texto, letterSpacing: -0.5 }}>{usuario}</div>
        <div style={{ position: "absolute", left: 190, top: 108, fontFamily: MONO, fontWeight: 500, fontSize: 26, color: E.gris, letterSpacing: 2 }}>SERIE CLAUDE CODE</div>
      </Caja>
      <div style={{
        ...pos(SEGUIR), borderRadius: 45, background: pulsado ? "#262626" : E.acento, color: pulsado ? E.texto : E.oscuro,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: UI, fontWeight: 700, fontSize: 38,
        scale: String((1 - 0.12 * pres) * pop(t, m.t.seguir - 0.2).scale), opacity: pop(t, m.t.seguir - 0.2).opacity,
        boxShadow: pulsado ? "none" : `0 0 40px ${E.acento}77`,
      }}>{pulsado ? "Siguiendo ✓" : "Seguir"}</div>
      {pregunta && (
        <div style={{ ...pos(PREGUNTA), opacity: pq.opacity, translate: `0px ${(1 - pq.p) * 30}px`, display: "flex", alignItems: "center" }}>
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 74, lineHeight: 1.06, letterSpacing: -2.4, color: E.texto }}>{pregunta}</div>
        </div>
      )}
      <Caja r={CAMPO} t={t} at={m.t.comenta - 0.25} radio={34} fondo="#100c0a" borde={n > 0 && !enviado ? E.acento : "#4A4A4A"}>
        <div style={{ position: "absolute", left: 34, top: 0, bottom: 0, right: 260, display: "flex", alignItems: "center", fontFamily: UI, fontWeight: 700, fontSize: 52, letterSpacing: 3, color: E.texto, whiteSpace: "nowrap" }}>
          {n > 0 ? palabra.slice(0, n) : <span style={{ color: E.gris, fontWeight: 600, fontSize: 42, letterSpacing: 0 }}>Añade un comentario…</span>}
          {caret && !enviado && <span style={{ width: 5, height: 58, background: E.acento, marginLeft: 8 }} />}
        </div>
        <div style={{
          position: "absolute", right: 22, top: 25, width: 220, height: 84, borderRadius: 42, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: UI, fontWeight: 700, fontSize: 36, background: n === palabra.length ? E.acento : "rgba(255,107,26,0.18)",
          color: n === palabra.length ? E.oscuro : "rgba(255,255,255,0.5)", scale: String(1 - 0.12 * envPres),
        }}>{enviado ? "Enviado ✓" : "Enviar"}</div>
      </Caja>
    </>
  );
};
