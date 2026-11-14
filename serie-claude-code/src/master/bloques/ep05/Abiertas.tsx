/**
 * EP.5 · bloque «Preguntas abiertas» (escenas abiertas → prueba):
 * PREGUNTAS ABIERTAS en 5 grupos, como en la grabación (Cliente y oferta 1–3, Marca y contenido 4–6, Formulario 7,
 * Técnico 8–11, Plazos 12), cada grupo con una de sus preguntas reales → ES UNA PRUEBA → se escribe la petición real
 * («Como esto es una prueba invéntate todos los datos y crea ya el archivo CLAUDE.md») y se envía.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Sello } from "../../componentes/Sello";
import { C, TITULO, UI, sp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Chip, Medalla, Picto, Pop, escrito } from "../../ep05/kit";
import { Asterisco, Entrada, Pestana, VS, Ventana } from "../../ep05/ui";

const GRUPOS = [
  { titulo: "Cliente y oferta", rango: "1–3", ejemplo: "Nombre de la clínica, ciudad y web o redes", icono: "usuarios", en: "cliente" },
  { titulo: "Marca y contenido", rango: "4–6", ejemplo: "¿Hay logo, colores y tipografías definidos?", icono: "paleta", en: "marca" },
  { titulo: "Formulario", rango: "7", ejemplo: "Campos y casilla de consentimiento", icono: "documento", en: "formulario" },
  { titulo: "Técnico", rango: "8–11", ejemplo: "Dominio, hosting y acceso FTP", icono: "engranaje", en: "parte" },
  { titulo: "Plazos", rango: "12", ejemplo: "¿Hay fecha de entrega o campaña?", icono: "calendario", en: "plazos" },
];
const Y0 = 860;
const PASO = 150;
/** La petición de la grabación (solo «claude. MD» → «CLAUDE.md»). */
const PRUEBA = "Como esto es una prueba invéntate todos los datos y crea ya el archivo CLAUDE.md";
const V = { x: 540, y: 2470, w: 980, h: 620 };

const tiempos = (L: LineaT) => {
  const dices = L.en("prueba", "dices");
  const archivo = L.finDe("prueba", "archivo»");
  return {
    luego: L.ini("abiertas"),
    preguntas: L.en("abiertas", "preguntas"),
    grupos: GRUPOS.map((g) => L.en("abiertas", g.en)),
    como: L.ini("prueba"),
    prueba: L.en("prueba", "prueba"),
    dices,
    escribeA: dices + 0.15,
    escribeB: archivo - 0.1,
    envia: archivo + 0.05,
  };
};

export const Abiertas: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 900, z: 1.06 },
    ...T.grupos.map((g, i) => ({ t: g - 0.2, x: 540, y: Math.min(1230, 960 + i * 70), z: 1.06, d: 0.8 })),
    { t: T.como - 0.25, x: 540, y: 2180, z: 1.08, d: 0.9 },
    { t: T.dices - 0.1, x: 540, y: 2420, z: 1.06, d: 0.8 },
  ];
  const fueraA = T.como;
  const enviado = t >= T.envia;
  const texto = enviado ? "" : escrito(PRUEBA, t, T.escribeA, T.escribeB);
  const activo = T.grupos.reduce((a, g, i) => (t >= g - 0.05 ? i : a), -1);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PREGUNTAS ABIERTAS" x={540} y={700} t={t} at={T.preguntas} out={fueraA} size={56} rot={-2} />
      {GRUPOS.map((g, i) => {
        const v = vis(t, T.grupos[i] - 0.05, fueraA, 0.7);
        if (!v.on) return null;
        const on = i === activo;
        return (
          <div key={g.titulo} style={{ position: "absolute", left: 60, top: Y0 + i * PASO - 64, width: 960, height: 128, opacity: v.opacity * (on ? 1 : 0.65), transform: `translateX(${(1 - v.s) * 70}px) scale(${0.96 + 0.04 * v.s})` }}>
            <div style={{ height: "100%", boxSizing: "border-box", borderRadius: 28, background: C.panel, border: `3px solid ${on ? C.acento : C.borde}`, boxShadow: on ? `0 0 40px ${C.acento}44` : "0 20px 50px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 24, padding: "0 28px" }}>
              <Medalla nombre={g.icono} size={84} activo={on ? 1 : 0} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 44, color: C.texto }}>{g.titulo}</div>
                <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 27, color: C.gris, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.ejemplo}</div>
              </div>
              <div style={{ minWidth: 92, padding: "8px 14px", borderRadius: 16, background: on ? C.acento : C.panel2, color: on ? C.oscuro : C.gris, fontFamily: TITULO, fontWeight: 800, fontSize: 30, textAlign: "center" }}>{g.rango}</div>
            </div>
          </div>
        );
      })}

      {/* ── es una prueba ── */}
      <Pop x={540} y={2010} t={t} at={T.prueba - 0.05} out={hasta + 0.4} rot={-8} latidos={[T.prueba + 0.4]}>
        <Chip icono={<Picto nombre="matraz" size={52} color={C.oscuro} grosor={2.4} />} texto="ES UNA PRUEBA" size={52} variante="acento" />
      </Pop>
      {(() => {
        const v = vis(t, T.como + 0.1, hasta + 0.4, 0.88);
        if (!v.on) return null;
        const s = sp(t, T.envia, { damping: 15, stiffness: 160 });
        return (
          <div style={{ position: "absolute", left: V.x - V.w / 2, top: V.y - V.h / 2, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <Ventana w={V.w} h={V.h} buscador="landing-cliente-clínica-estética">
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", background: VS.barra, borderBottom: `2px solid ${VS.borde}` }}>
                  <Pestana texto="/init" icono={<Asterisco size={24} />} />
                </div>
                <div style={{ flex: 1, padding: "26px 30px", fontFamily: UI, fontWeight: 600, fontSize: 26, color: VS.tenue, lineHeight: 1.45, whiteSpace: "normal" }}>
                  Con esas respuestas escribo el CLAUDE.md definitivo con comandos, arquitectura de secciones, contexto del cliente…
                  {enviado && (
                    <div style={{ marginTop: 20, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 60}px)`, background: VS.caja, border: `2px solid ${VS.cajaBorde}`, borderRadius: 12, padding: "14px 20px", color: VS.blanco, fontSize: 30 }}>{PRUEBA}</div>
                  )}
                </div>
                <div style={{ padding: "0 26px 26px" }}>
                  <Entrada w={V.w - 52} texto={texto} t={t} size={32} foco={!enviado} resaltar={{ desde: "invéntate" }} />
                </div>
              </div>
            </Ventana>
          </div>
        );
      })()}
    </Escena>
  );
};

export const eventosAbiertas = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.preguntas + 0.08, sfx: "golpe", vol: 0.5 },
    ...T.grupos.map((g) => ({ t: g, sfx: "pop" as const, vol: 0.32 })),
    { t: T.prueba, sfx: "pop", vol: 0.4 },
    { t: T.escribeA, sfx: "tecleo", vol: 0.28, dur: T.escribeB - T.escribeA },
    { t: T.envia, sfx: "envio", vol: 0.45 },
  ];
};
