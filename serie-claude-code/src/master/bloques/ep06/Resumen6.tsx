/**
 * EP.6 · bloque «Resumen» (escena resumen): RECUERDA → contexto → tarea acotada → ejemplos → y si te atascas,
 * entrevista. Cada fila cuando la voz la dice, unidas por flechas que se dibujan.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Etiqueta } from "../../componentes/Sello";
import { C, TITULO, UI, ramp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Num } from "../../ep05/kit";
import { Medalla6 } from "../../ep06/kit6";

const FILAS = [
  { en: "contexto,", texto: "Contexto", icono: "usuario" },
  { en: "tarea", texto: "Tarea acotada", icono: "recorte" },
  { en: "ejemplos.", texto: "Ejemplos", icono: "captura" },
  { en: "atascas,", texto: "Entrevista", icono: "bocadillo", antes: "SI TE ATASCAS" },
];
const Y0 = 860;
const PASO = 200;

const tiempos = (L: LineaT) => ({
  recuerda: L.ini("resumen"),
  filas: FILAS.map((f) => L.en("resumen", f.en)),
  entreviste: L.en("resumen", "entreviste."),
});

export const Resumen6: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 960, z: 1.06 },
    ...T.filas.map((f, i) => ({ t: f - 0.2, x: 540, y: 990 + i * 75, z: 1.05 - i * 0.015, d: 0.6 })),
  ];
  const activo = T.filas.reduce((a, f, i) => (t >= f - 0.05 ? i : a), -1);
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="RECUERDA" x={540} y={680} t={t} at={T.recuerda} out={T.filas[2]} size={46} variante="acento" fuente="titulo" />
      {FILAS.map((f, i) => {
        const v = vis(t, T.filas[i] - 0.06, hasta + 0.4, 0.6);
        const y = Y0 + i * PASO + (i === 3 ? 40 : 0);
        return (
          <React.Fragment key={f.en}>
            {i > 0 && i < 3 && <Flecha curva={{ a: { x: 540, y: y - PASO + 66 }, c: { x: 548, y: y - PASO / 2 }, b: { x: 540, y: y - 70 } }} p={ramp(t, T.filas[i] - 0.25, T.filas[i] - 0.02)} ancho={8} />}
            {i === 3 && <Etiqueta texto={f.antes} x={540} y={y - 102} t={t} at={T.filas[i] - 0.25} out={hasta + 0.4} size={30} variante="gris" fuente="titulo" />}
            {v.on && (
              <div style={{ position: "absolute", left: 150, top: y - 64, width: 780, height: 128, opacity: v.opacity * (i === activo ? 1 : 0.72), transform: `translateY(${v.y}px) scale(${v.scale * (i === activo ? 1.04 : 1)})` }}>
                <div style={{ height: "100%", boxSizing: "border-box", borderRadius: 30, background: i === 3 && t >= T.entreviste - 0.05 ? C.acento : C.panel, border: `3px solid ${i === activo ? C.acento : C.borde}`, boxShadow: i === activo ? `0 0 44px ${C.acento}44` : "0 20px 50px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 30, padding: "0 30px" }}>
                  {i < 3 ? <Num n={i + 1} size={66} /> : <div style={{ width: 66, fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: t >= T.entreviste - 0.05 ? C.oscuro : C.acento, textAlign: "center" }}>+</div>}
                  <Medalla6 nombre={f.icono} size={90} />
                  <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 56, color: i === 3 && t >= T.entreviste - 0.05 ? C.oscuro : C.texto }}>{f.texto}</div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </Escena>
  );
};

export const eventosResumen6 = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [{ t: T.recuerda, sfx: "pop", vol: 0.35 }, ...T.filas.map((f) => ({ t: f, sfx: "tick" as const, vol: 0.4 })), { t: T.entreviste, sfx: "pop", vol: 0.35 }];
};
