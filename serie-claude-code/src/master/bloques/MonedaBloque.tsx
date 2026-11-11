/**
 * Moneda (escena calma): una moneda grande que gira deprisa y se va calmando hasta quedarse de frente; anillos que
 * respiran despacio (tono tranquilo). «POR ENCIMA» y, al decir «sorpresas», un check sereno.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Check, Moneda } from "../componentes/Iconos";
import { Etiqueta } from "../componentes/Sello";
import { C, clamp01, sp } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea, e: string) => ({
  ini: L.ini(e),
  encima: L.en(e, "por encima"),
  asustes: L.en(e, "asustes"),
  sorpresas: L.en(e, "sorpresas."),
});

const M = { x: 540, y: 1060, s: 380 };

export const MonedaBloque: React.FC<BloqueProps> = ({ t, L, desde, hasta, escenas }) => {
  const T = tiempos(L, escenas[0]);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 0.9 },
    { t: T.ini, x: 540, y: 1100, z: 0.98, d: 1.6 },
    { t: T.asustes - 0.2, x: 540, y: 1120, z: 1.1, d: 1.4 },
  ];
  // gira rápido y se calma: la vuelta total es un múltiplo de 2π, así acaba de frente
  const u = Math.max(0, t - (desde - 0.3));
  const giro = 10 * Math.PI * (1 - Math.exp(-u * 1.1));
  const entra = sp(t, desde - 0.3, { damping: 12, stiffness: 120 });
  // respiración lenta (≈ 0,25 Hz): cada vez más suave
  const calma = clamp01((t - T.ini) / 3);
  const resp = 0.5 + 0.5 * Math.sin((t - T.ini) * 1.6);
  return (
    <Escena t={t} tomas={tomas}>
      {[0, 1, 2].map((k) => {
        const r = M.s * 0.62 + k * 70 + resp * 18 * (1 - 0.3 * k);
        return <div key={k} style={{ position: "absolute", left: M.x - r, top: M.y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `3px solid ${C.acento}`, opacity: (0.32 - k * 0.09) * entra * (0.4 + 0.6 * calma) }} />;
      })}
      <div style={{ position: "absolute", left: M.x - M.s / 2, top: M.y - M.s / 2, width: M.s, height: M.s, transform: `scale(${0.3 + 0.7 * entra}) translateY(${(1 - calma) * Math.sin(t * 9) * 4}px)`, opacity: Math.min(1, entra * 2), filter: `drop-shadow(0 0 ${30 + 20 * resp}px ${C.acento}66)` }}>
        <Moneda s={M.s} giro={giro} />
      </div>
      <Etiqueta texto="POR ENCIMA" x={M.x} y={M.y + 330} t={t} at={T.encima} out={hasta} size={44} variante="borde" fuente="titulo" />
      {t > T.sorpresas - 0.1 && (
        <div style={{ position: "absolute", left: M.x + 110, top: M.y + 80, width: 110, height: 110, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, T.sorpresas - 0.1, { damping: 14, stiffness: 140 })})`, boxShadow: `0 0 30px ${C.acento}88` }}>
          <Check s={76} c={C.oscuro} trazo={6} p={clamp01((t - T.sorpresas) / 0.4)} />
        </div>
      )}
    </Escena>
  );
};

export const eventosMoneda = (L: Linea, _ep: unknown, _b: unknown, escenas: string[]): Evento[] => {
  const T = tiempos(L, escenas[0]);
  return [
    { t: T.ini - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.encima, sfx: "pop", vol: 0.3 },
    { t: T.sorpresas, sfx: "tick", vol: 0.4 },
  ];
};
