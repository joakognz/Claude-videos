/**
 * EP.8 · Página de estado (escena status): los dos últimos carteles (529 y 500) → se escribe status.claude.com →
 * página de estado recreada (barras de los últimos 90 días) → el cursor se para en una incidencia → ES SUYO, NO TUYO.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Cursor } from "../../componentes/Piezas";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Cartel, caraCodigo } from "../../componentes/ep08/Cartel";
import { Navegador, RAYA_INCIDENCIA, StatusPagina } from "../../componentes/ep08/Pantallas";
import { EASE, clamp01, ramp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "status";
const URL = "status.claude.com";
const NAV = { x: 60, y: 1180, w: 960, h: 1060 };

const tiempos = (L: Linea) => ({
  dos: L.en(E, "dos"),
  ultimos: L.en(E, "últimos,"),
  entra: L.en(E, "entra"),
  url: L.en(E, URL + "."),
  urlFin: L.finDe(E, URL + "."),
  ves: L.en(E, "ves"),
  incidencia: L.en(E, "incidencia,"),
  suyo: L.en(E, "suyo,"),
  tuyo: L.en(E, "tuyo."),
});

export const Status: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  // la raya de la incidencia en el lienzo (fila de la API)
  const paso = (NAV.w - 120) / 46;
  const raya = { x: NAV.x + 50 + 10 + RAYA_INCIDENCIA.k * paso + paso * 0.34, y: NAV.y + 84 + 34 + 70 + 26 + 2 * 152 + 80 };
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 900, z: 1.0 },
    { t: T.entra - 0.15, x: 540, y: 1560, z: 0.98, d: 0.9 },
    { t: T.ves - 0.2, x: 540, y: raya.y - 60, z: 1.12, d: 0.9 },
    { t: T.suyo - 0.2, x: 540, y: raya.y + 60, z: 1.08, d: 0.9 },
  ];
  const vNav = vis(t, T.entra - 0.1, Infinity, 0.85);
  const finUrl = Math.min(T.urlFin - 0.15, T.url + 1.0);
  const letras = ramp(t, T.url, finUrl, (x) => x) * URL.length;
  const carga = ramp(t, finUrl + 0.1, finUrl + 0.45);
  const hover = T.incidencia - 0.1;
  const c0 = { x: 980, y: raya.y + 330 };
  const ir = ramp(t, T.ves - 0.3, hover, EASE);
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="LOS DOS ÚLTIMOS" x={540} y={680} t={t} at={T.dos - 0.05} out={T.entra + 0.4} size={36} variante="gris" fuente="titulo" />
      <Cartel x={330} y={720} w={330} t={t} entra={T.dos - 0.1} caras={[{ at: 0, cara: caraCodigo("529", "AFORO COMPLETO") }]} out={T.entra + 0.5} sinCaida />
      <Cartel x={750} y={720} w={330} t={t} entra={T.ultimos - 0.1} caras={[{ at: 0, cara: caraCodigo("500", "AVERÍA") }]} out={T.entra + 0.5} sinCaida />
      {vNav.on && (
        <div style={{ position: "absolute", left: NAV.x, top: NAV.y, opacity: vNav.opacity, transform: `translateY(${vNav.y}px) scale(${vNav.scale})` }}>
          <Navegador w={NAV.w} h={NAV.h} t={t} url={URL} letras={letras} carga={carga} tema="claro">
            <StatusPagina t={t} logo={ep.logos.claude} hover={hover} w={NAV.w} />
          </Navegador>
        </div>
      )}
      {t > T.ves - 0.35 && (
        <Cursor x={c0.x + (raya.x - c0.x) * ir} y={c0.y + (raya.y - c0.y) * ir} pulsa={0} opacity={clamp01((t - T.ves + 0.35) / 0.2)} />
      )}
      <Sello texto="ES SUYO, NO TUYO" x={540} y={raya.y + 330} t={t} at={T.suyo - 0.05} out={hasta + 0.3} size={58} rot={-3} />
    </Escena>
  );
};

export const eventosStatus = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.dos - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.ultimos - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.entra - 0.1, sfx: "whoosh", vol: 0.3 },
    { t: T.url, sfx: "tecleo", vol: 0.28, dur: Math.max(0.3, Math.min(T.urlFin - 0.15, T.url + 1.0) - T.url) },
    { t: T.incidencia - 0.1, sfx: "tick", vol: 0.45 },
    { t: T.suyo + 0.07, sfx: "golpe", vol: 0.5 },
  ];
};
