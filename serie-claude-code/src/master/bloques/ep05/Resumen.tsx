/**
 * EP.5 · bloque «Resumen» (escena resumen): RECUERDA → carpeta → /init → entrevista → revisar, cada paso cuando la
 * voz lo dice, unidos por flechas que se dibujan.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Etiqueta } from "../../componentes/Sello";
import { C, MONO, UI, ramp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { IconoCarpeta, Medalla, Num } from "../../ep05/kit";

const FILAS = [
  { en: "carpeta", texto: "Carpeta" },
  { en: "init", texto: "/init", mono: true },
  { en: "entrevista", texto: "Entrevista" },
  { en: "revisar", texto: "Revisar" },
];
const Y0 = 860;
const PASO = 196;

const tiempos = (L: LineaT) => ({
  recuerda: L.ini("resumen"),
  filas: FILAS.map((f) => L.en("resumen", f.en)),
});

export const Resumen: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 960, z: 1.06 },
    ...T.filas.map((f, i) => ({ t: f - 0.2, x: 540, y: 980 + i * 70, z: 1.06 - i * 0.015, d: 0.6 })),
  ];
  const activo = T.filas.reduce((a, f, i) => (t >= f - 0.05 ? i : a), -1);
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="RECUERDA" x={540} y={690} t={t} at={T.recuerda} out={hasta + 0.4} size={46} variante="acento" fuente="titulo" />
      {FILAS.map((f, i) => {
        const v = vis(t, T.filas[i] - 0.06, hasta + 0.4, 0.6);
        const y = Y0 + i * PASO;
        return (
          <React.Fragment key={f.en}>
            {i > 0 && <Flecha curva={{ a: { x: 540, y: y - PASO + 66 }, c: { x: 548, y: y - PASO / 2 }, b: { x: 540, y: y - 70 } }} p={ramp(t, T.filas[i] - 0.25, T.filas[i] - 0.02)} ancho={8} />}
            {v.on && (
              <div style={{ position: "absolute", left: 170, top: y - 62, width: 740, height: 124, opacity: v.opacity * (i === activo ? 1 : 0.7), transform: `translateY(${v.y}px) scale(${v.scale * (i === activo ? 1.04 : 1)})` }}>
                <div style={{ height: "100%", boxSizing: "border-box", borderRadius: 30, background: C.panel, border: `3px solid ${i === activo ? C.acento : C.borde}`, boxShadow: i === activo ? `0 0 44px ${C.acento}44` : "0 20px 50px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 30, padding: "0 30px" }}>
                  <Num n={i + 1} size={66} />
                  <div style={{ width: 96, display: "flex", justifyContent: "center" }}>
                    {i === 0 ? <IconoCarpeta size={88} /> : i === 1 ? <Medalla nombre="codigo" size={86} /> : i === 2 ? <Medalla nombre="bocadillo" size={86} /> : <Medalla nombre="lupa" size={86} />}
                  </div>
                  <div style={{ fontFamily: f.mono ? MONO : UI, fontWeight: 700, fontSize: 58, color: f.mono ? C.acento : C.texto }}>{f.texto}</div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </Escena>
  );
};

export const eventosResumen = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [{ t: T.recuerda, sfx: "pop", vol: 0.35 }, ...T.filas.map((f) => ({ t: f, sfx: "tick" as const, vol: 0.4 }))];
};
