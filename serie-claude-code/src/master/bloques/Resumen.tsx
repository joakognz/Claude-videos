/**
 * Resumen (escena resumen): la escalera completa con sus cuatro ticks; la bandera de la meta se clava arriba y la
 * cámara sube por los peldaños mientras la voz los nombra.
 */
import React from "react";
import { Escalera, NOMBRES_ETAPA, peldano } from "../componentes/Escalera";
import { Escena } from "../componentes/Escena";
import { Bandera } from "../componentes/Iconos";
import { Etiqueta } from "../componentes/Sello";
import { clamp01, norm, sp } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => ({
  ini: L.ini("resumen"),
  meta: L.en("resumen", "meta"),
  cuatro: L.en("resumen", "cuatro"),
  // cada etapa, cuando la voz la nombra
  nombres: NOMBRES_ETAPA.map((n) => L.en("resumen", norm(n))),
  fin: L.fin("resumen"),
});

export const Resumen: React.FC<BloqueProps> = ({ t, L, desde }) => {
  const T = tiempos(L);
  const p3 = peldano(3);
  const bandera = { x: p3.cx + 15, y: p3.top - 26 };
  const tomas: Toma[] = [
    { t: desde - 1, x: 560, y: 1200, z: 0.86 },
    { t: T.meta - 0.3, x: 700, y: 1060, z: 1.0, d: 0.7 },
    { t: T.cuatro - 0.2, x: 560, y: 1230, z: 0.88, d: 0.6 },
    ...T.nombres.map((at, k) => ({ t: at - 0.25, x: peldano(k).foco.x, y: peldano(k).foco.y + 60, z: 1.22, d: 0.55 })),
    { t: T.fin + 0.1, x: 600, y: 1150, z: 0.95, d: 0.6 },
  ];
  const clava = sp(t, T.meta - 0.15, { damping: 10, stiffness: 180 });
  return (
    <Escena t={t} tomas={tomas}>
      <Escalera
        t={t}
        estado={(k) => {
          const ola = Math.sin(clamp01((t - T.cuatro - k * 0.09) / 0.35) * Math.PI) * 0.05;
          const nombrada = clamp01((t - T.nombres[k] + 0.05) / 0.2) * (k === 3 ? 1 : 1 - clamp01((t - T.nombres[k + 1] + 0.05) / 0.2));
          return { aparece: 1, activa: nombrada, hecha: 1, latido: ola + Math.sin(clamp01((t - T.nombres[k]) / 0.3) * Math.PI) * 0.04 };
        }}
      />
      {/* la meta, arriba de todo */}
      {clava > 0.001 && (
        <div style={{ position: "absolute", left: bandera.x - 50, top: bandera.y - 230, width: 200, height: 200, transformOrigin: "25% 96%", transform: `translateY(${(1 - clava) * -240}px)`, opacity: Math.min(1, clava * 3) }}>
          <Bandera s={200} t={t} />
        </div>
      )}
      <Etiqueta texto="RESUMEN" x={330} y={720} t={t} at={T.ini} out={T.nombres[0]} size={46} variante="borde" fuente="titulo" />
      <Etiqueta texto="UNA META CLARA" x={330} y={840} t={t} at={T.meta} out={T.nombres[0]} size={40} variante="acento" />
    </Escena>
  );
};

export const eventosResumen = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [{ t: T.meta, sfx: "golpe", vol: 0.35 }, ...T.nombres.map((at) => ({ t: at, sfx: "pop" as const, vol: 0.3 }))];
};
