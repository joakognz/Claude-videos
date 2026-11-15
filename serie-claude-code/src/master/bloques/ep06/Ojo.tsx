/**
 * EP.6 · bloque «Ojo» (escenas ojo → noexperto → tu):
 * OJO → Claude Code y su código que se escribe solo: CRACK ESCRIBIENDO CÓDIGO ✓ · PERO NO EN TODO →
 * NO ES EXPERTO EN… cuatro fichas con ✗ (prompts que vendan · comunicación · branding · embudos de venta) →
 * AHÍ ENTRAS TÚ… O TU AGENTE: las ✗ pasan a ✓ → TENLO EN CUENTA.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { C, TITULO, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Pop } from "../../ep05/kit";
import { Ico, Medalla6 } from "../../ep06/kit6";

const G = 2100;
const FICHAS = [
  { icono: "robot", texto: "Prompts que vendan", en: "prompts", x: 290, y: G - 175 },
  { icono: "megafono", texto: "Comunicación", en: "comunicación,", x: 790, y: G - 175 },
  { icono: "marca", texto: "Branding", en: "branding,", x: 290, y: G + 175 },
  { icono: "embudo", texto: "Embudos de venta", en: "embudos", x: 790, y: G + 175 },
];
const P = 2720;

const tiempos = (L: LineaT) => ({
  ojo: L.en("ojo", "ojo."),
  claude: L.en("ojo", "Claude"),
  crack: L.en("ojo", "crack"),
  escribiendo: L.en("ojo", "escribiendo"),
  codigo: L.en("ojo", "código,"),
  pero: L.en("ojo", "pero", 1),
  todo: L.en("ojo", "todo."),
  no: L.ini("noexperto"),
  fichas: FICHAS.map((f) => L.en("noexperto", f.en)),
  fin2: L.fin("noexperto"),
  ahi: L.ini("tu"),
  tu: L.en("tu", "tú…"),
  agente: L.en("tu", "agente."),
  tenlo: L.en("tu", "Tenlo"),
  cuenta: L.en("tu", "cuenta."),
});

export const Ojo: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 950, z: 1.04 },
    { t: T.crack - 0.2, x: 540, y: 1080, z: 1.04, d: 0.8 },
    { t: T.no - 0.3, x: 540, y: G - 120, z: 1.0, d: 0.9 },
    { t: T.fichas[2] - 0.25, x: 540, y: G + 40, z: 1.0, d: 0.8 },
    { t: T.ahi - 0.25, x: 540, y: G + 340, z: 0.8, d: 0.9 },
    { t: T.tenlo - 0.2, x: 540, y: G + 380, z: 0.84, d: 0.8 },
  ];
  const fueraA = T.no + 0.25;
  const fin = hasta + 0.4;
  const escrito = ramp(t, T.escribiendo - 0.1, T.codigo + 0.5);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello
        texto={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 18 }}>
            <Ico nombre="aviso" size={64} grosor={2.6} />
            OJO
          </span>
        }
        x={540} y={650} t={t} at={T.ojo} out={fueraA} size={76} rot={-3}
      />
      <Logo src={ep.logos.claude_code} x={540} y={900} w={190} t={t} at={T.claude - 0.1} out={fueraA} pulsos={[T.crack]} />
      {/* código que se escribe solo (barras abstractas) */}
      {(() => {
        const v = vis(t, T.crack - 0.1, fueraA, 0.8);
        if (!v.on) return null;
        const lineas = [{ s: 0, w: 46, c: C.acento }, { s: 1, w: 70, c: C.gris }, { s: 1, w: 54, c: C.acentoSuave }, { s: 2, w: 40, c: C.gris }, { s: 1, w: 62, c: C.gris }, { s: 0, w: 30, c: C.acento }];
        return (
          <div style={{ position: "absolute", left: 540 - 330, top: 1080, width: 660, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, boxSizing: "border-box", padding: "24px 28px", borderRadius: 26, background: C.panel, border: `3px solid ${C.borde}`, display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            {lineas.map((l, i) => {
              const k = clamp01(escrito * lineas.length - i);
              return (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", paddingLeft: l.s * 36 }}>
                  <div style={{ width: 26, fontFamily: "JetBrains Mono", fontSize: 20, color: C.tenue }}>{i + 1}</div>
                  <div style={{ height: 16, width: `${l.w * k}%`, borderRadius: 8, background: l.c, opacity: 0.85 }} />
                </div>
              );
            })}
          </div>
        );
      })()}
      <Etiqueta
        texto={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            <Ico nombre="check" size={40} color={C.oscuro} grosor={3.2} />
            CRACK ESCRIBIENDO CÓDIGO
          </span>
        }
        x={540} y={1450} t={t} at={T.crack - 0.03} out={fueraA} size={40} variante="acento" fuente="titulo"
      />
      <Etiqueta texto="PERO NO EN TODO" x={540} y={1560} t={t} at={T.todo - 0.05} out={fueraA} size={40} variante="borde" fuente="titulo" />

      {/* ── no es experto en… ── */}
      <Etiqueta texto="NO ES EXPERTO EN…" x={540} y={G - 420} t={t} at={T.no - 0.05} out={T.ahi} size={44} variante="borde" fuente="titulo" />
      {FICHAS.map((f, i) => {
        const at = T.fichas[i];
        const v = vis(t, at - 0.1, fin, 0.6);
        if (!v.on) return null;
        const cruz = ramp(t, at + 0.25, at + 0.5);
        const giro = ramp(t, T.tu + i * 0.12, T.tu + 0.3 + i * 0.12);
        const ok = giro > 0.5;
        return (
          <div key={f.texto} style={{ position: "absolute", left: f.x - 225, top: f.y - 150, width: 450, height: 300, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <div style={{ width: "100%", height: "100%", boxSizing: "border-box", borderRadius: 32, background: C.panel, border: `3px solid ${ok ? C.acento : C.borde}`, boxShadow: ok ? `0 0 40px ${C.acento}44` : "0 24px 60px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: "0 20px" }}>
              <Medalla6 nombre={f.icono} size={120} activo={ok ? 1 : 0.4} />
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto, textAlign: "center", lineHeight: 1.1 }}>{f.texto}</div>
            </div>
            {cruz > 0 && (
              <div style={{ position: "absolute", right: -16, top: -16, width: 84, height: 84, borderRadius: "50%", background: ok ? C.acento : C.panel2, border: `5px solid ${ok ? C.acento : C.gris}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.min(1.1, sp(t, at + 0.25, { damping: 10, stiffness: 240 })) * (1 - 0.3 * Math.sin(giro * Math.PI))})` }}>
                <Ico nombre={ok ? "check" : "cruz"} size={50} color={ok ? C.oscuro : C.gris} grosor={3.2} dibujo={ok ? ramp(t, T.tu + 0.15 + i * 0.12, T.tu + 0.45 + i * 0.12) : cruz} />
              </div>
            )}
          </div>
        );
      })}

      {/* ── ahí entras tú… o tu agente ── */}
      <Etiqueta texto="AHÍ ENTRAS TÚ" x={540} y={P - 170} t={t} at={T.ahi - 0.05} out={fin} size={46} variante="acento" fuente="titulo" />
      <Pop x={400} y={P} t={t} at={T.tu - 0.1} out={fin} rot={-8}>
        <Medalla6 nombre="usuario" size={170} />
      </Pop>
      <Etiqueta texto="TÚ" x={400} y={P + 125} t={t} at={T.tu} out={fin} size={30} variante="gris" fuente="titulo" />
      <Pop x={540} y={P} t={t} at={T.agente - 0.2} out={fin}>
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.gris }}>o</div>
      </Pop>
      <Pop x={680} y={P} t={t} at={T.agente - 0.1} out={fin} rot={8}>
        <Medalla6 nombre="robot" size={170} />
      </Pop>
      <Etiqueta texto="TU AGENTE" x={680} y={P + 125} t={t} at={T.agente} out={fin} size={30} variante="gris" fuente="titulo" />
      <Etiqueta texto="TENLO EN CUENTA" x={540} y={P + 250} t={t} at={T.tenlo - 0.05} out={fin} size={44} variante="borde" fuente="titulo" />
    </Escena>
  );
};

export const eventosOjo = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.ojo + 0.08, sfx: "golpe", vol: 0.55 },
    { t: T.claude, sfx: "pop", vol: 0.3 },
    { t: T.escribiendo, sfx: "tecleo", vol: 0.2, dur: 0.8 },
    { t: T.crack, sfx: "tick", vol: 0.45 },
    ...T.fichas.map((f) => ({ t: f, sfx: "pop" as const, vol: 0.32 })),
    { t: T.tu, sfx: "tick", vol: 0.5 },
    { t: T.agente, sfx: "pop", vol: 0.35 },
    { t: T.tenlo, sfx: "golpe", vol: 0.4 },
  ];
};
