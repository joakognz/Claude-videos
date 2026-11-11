/**
 * Escalera (escena escalera): los cuatro peldaños se levantan uno a uno con su número y su nombre → «4 ETAPAS» →
 * un proyecto al pie de la escalera que cambia de tamaño («sea del tamaño que sea»).
 */
import React from "react";
import { Escala } from "../componentes/Caja";
import { ESC, Escalera, peldano } from "../componentes/Escalera";
import { Escena } from "../componentes/Escena";
import { Etiqueta } from "../componentes/Sello";
import { clamp01, sp } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => {
  const cuatro = L.en("escalera", "cuatro");
  return {
    ini: L.ini("escalera"),
    cuatro,
    peldanos: [0, 1, 2, 3].map((k) => cuatro - 0.15 + k * 0.2),
    etapas: L.en("escalera", "etapas"),
    cualquier: L.en("escalera", "cualquier"),
    tamano: L.en("escalera", "tamaño"),
    sea: L.en("escalera", "sea", 1),
  };
};

export const EscaleraBloque: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const p0 = peldano(0);
  const tomas: Toma[] = [
    { t: desde - 1, x: 560, y: 1380, z: 0.92 },
    { t: T.cuatro - 0.4, x: 560, y: 1290, z: 1.04, d: 1.2 },
    { t: T.cualquier - 0.3, x: 420, y: 1330, z: 1.14, d: 0.9 },
    { t: T.sea - 0.1, x: 560, y: 1300, z: 1.0, d: 0.8 },
  ];
  // «sea del tamaño que sea»: el proyecto pequeño crece, encoge y se queda mediano
  const k1 = sp(t, T.tamano - 0.1, { damping: 9, stiffness: 120 });
  const k2 = sp(t, T.sea - 0.1, { damping: 10, stiffness: 140 });
  const escala = 0.55 + 0.75 * k1 - 0.45 * k2;
  return (
    <Escena t={t} tomas={tomas}>
      <Escalera t={t} estado={(k) => ({ aparece: sp(t, T.peldanos[k], { damping: 12, stiffness: 170 }), activa: 0, hecha: 0, latido: Math.sin(clamp01((t - T.peldanos[k] - 0.1) / 0.3) * Math.PI) * 0.03 })} />
      <Etiqueta texto="4 ETAPAS" x={330} y={960} t={t} at={T.etapas} out={hasta} size={58} variante="acento" fuente="titulo" />
      <Etiqueta texto="CUALQUIER PROYECTO" x={330} y={1080} t={t} at={T.cualquier} out={hasta} size={36} variante="borde" />
      {/* el proyecto, sobre el primer peldaño */}
      <Escala x={p0.cx + ESC.px / 2} y={p0.top + ESC.py - 4} t={t} at={T.cualquier - 0.05} escala={escala} />
    </Escena>
  );
};

export const eventosEscalera = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [...T.peldanos.map((p) => ({ t: p, sfx: "pop" as const, vol: 0.32 })), { t: T.cualquier, sfx: "pop", vol: 0.3 }];
};
