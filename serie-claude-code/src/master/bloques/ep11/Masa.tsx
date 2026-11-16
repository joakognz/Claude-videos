/**
 * EP.11 · El obrador (escena masa): una bola de masa sobre la mesa → de la misma masa salen una barra, una chapata y
 * un bollo, cada uno con su flecha → la masa = TU PROYECTO → las formas = LAS VARIANTES.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Pieza } from "../../componentes/ep08/Dibujos";
import { Barra, Bollo, Chapata, Masa, Mesa } from "../../componentes/ep11/Panaderia";
import { C, EASE_OUT, TITULO, clamp01, ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "masa";
const tiempos = (L: Linea) => ({
  obrador: L.en(E, "obrador"),
  misma: L.en(E, "misma"),
  sacas: L.en(E, "sacas"),
  barra: L.en(E, "barra"),
  chapata: L.en(E, "chapata"),
  bollo: L.en(E, "bollo"),
  masa2: L.en(E, "masa", 1),
  proyecto: L.en(E, "proyecto"),
  formas: L.en(E, "formas"),
  variantes: L.en(E, "variantes"),
  fin: L.fin(E),
});

const MASA = { x: 540, y: 1010 };
const PANES = [
  { x: 205, y: 1528, key: "barra" as const },
  { x: 540, y: 1532, key: "chapata" as const },
  { x: 875, y: 1528, key: "bollo" as const },
];

export const Masa11: React.FC<BloqueProps> = ({ t, L, desde }) => {
  const T = tiempos(L);
  const at = [T.barra, T.chapata, T.bollo];
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1120, z: 1.08 },
    { t: T.sacas - 0.2, x: 540, y: 1240, z: 0.96, d: 0.9 },
    { t: T.masa2 - 0.25, x: 540, y: 1060, z: 1.2, d: 0.8 },
    { t: T.formas - 0.25, x: 540, y: 1340, z: 0.97, d: 0.8 },
  ];
  const respira = Math.sin(clamp01((t - T.misma) / 0.8) * Math.PI) + 0.6 * Math.sin(clamp01((t - T.masa2) / 0.7) * Math.PI);
  const brillo = clamp01(1 - Math.abs(t - T.proyecto - 0.3) / 0.6);
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="EL OBRADOR" x={540} y={760} t={t} at={T.obrador - 0.05} out={T.misma - 0.1} size={42} variante="borde" fuente="titulo" />
      {/* mesa */}
      <Pieza x={540} y={1562} t={t} at={desde - 0.3}>
        <Mesa w={1000} />
      </Pieza>
      {/* la masa */}
      <Pieza x={MASA.x} y={MASA.y} t={t} at={T.obrador - 0.1}>
        <div style={{ filter: brillo > 0 ? `drop-shadow(0 0 ${40 * brillo}px ${C.acento})` : undefined }}>
          <Masa s={440} respira={respira} />
        </div>
      </Pieza>
      <Etiqueta texto="LA MISMA MASA" x={540} y={760} t={t} at={T.misma} out={T.masa2 - 0.3} size={36} variante="gris" fuente="titulo" />
      {/* flechas y panes */}
      {PANES.map((p, i) => {
        const fp = ramp(t, at[i] - 0.3, at[i] + 0.15, EASE_OUT);
        return (
          <Flecha key={i} curva={{ a: { x: MASA.x + (i - 1) * 110, y: MASA.y + 150 }, c: { x: (MASA.x + p.x) / 2 + (i - 1) * 60, y: MASA.y + 230 }, b: { x: p.x, y: p.y - 170 } }} p={fp} ancho={8} opacity={1 - 0.7 * ramp(t, T.masa2 - 0.2, T.masa2 + 0.2)} />
        );
      })}
      {PANES.map((p, i) => {
        const s = sp(t, at[i], { damping: 11, stiffness: 200 });
        if (s <= 0) return null;
        const nombre = ["BARRA", "CHAPATA", "BOLLO"][i];
        return (
          <div key={p.key} style={{ position: "absolute", left: p.x, top: p.y, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -100%) translateY(${(1 - s) * -60}px) scale(${0.4 + 0.6 * s})`, transformOrigin: "50% 100%", opacity: Math.min(1, s * 2) }}>
              {p.key === "barra" ? <Barra s={310} /> : p.key === "chapata" ? <Chapata s={260} /> : <Bollo s={210} />}
            </div>
            <div style={{ position: "absolute", left: 0, top: 82, transform: "translate(-50%, 0)", fontFamily: TITULO, fontWeight: 800, fontSize: 34, color: C.texto, opacity: Math.min(1, s * 2), whiteSpace: "nowrap" }}>{nombre}</div>
          </div>
        );
      })}
      <Etiqueta texto="= TU PROYECTO" x={540} y={1250} t={t} at={T.proyecto - 0.05} out={T.formas - 0.2} size={48} variante="acento" fuente="titulo" />
      <Sello texto="= LAS VARIANTES" x={540} y={1770} t={t} at={T.variantes - 0.05} size={58} rot={-3} />
    </Escena>
  );
};

export const eventosMasa11 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.obrador - 0.1, sfx: "pop", vol: 0.4 },
    { t: T.misma, sfx: "pop", vol: 0.3 },
    { t: T.barra - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.chapata - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.bollo - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.masa2 - 0.35, sfx: "whoosh", vol: 0.22 },
    { t: T.proyecto - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.formas - 0.35, sfx: "whoosh", vol: 0.22 },
    { t: T.variantes + 0.07, sfx: "golpe", vol: 0.5 },
  ];
};
