/**
 * Avance (escena avance): tarjeta con candado que se abre. Cae el sello «PARTE N» (o «EP.N»), el candado se abre y
 * dentro aparece el icono (moneda que gira y se calma), el título y los puntos que dice la voz.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Candado, Moneda } from "../componentes/Iconos";
import { Rejilla } from "../componentes/Rejilla";
import { Sello } from "../componentes/Sello";
import { Chip, Tarjeta } from "../componentes/Tarjeta";
import { C, TITULO, clamp01, ramp, sp } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const tiempos = (L: Linea, ep: EpisodioMaster, e: string) => {
  const av = ep.avance!;
  const num = String(av.tipo === "parte" ? av.parte : av.episodio);
  const sello = (() => {
    try {
      return L.en(e, num);
    } catch {
      return L.ini(e) + 0.4;
    }
  })();
  const pal = L.palabras.filter((p) => p.escena === e);
  const abre = pal.find((p) => p.inicio > sello + 0.15)?.inicio ?? sello + 0.4;
  return {
    ini: L.ini(e),
    sello,
    abre,
    titulo: Math.min(...(av.puntos ?? []).map((p) => L.en(e, p.en))) - 0.7,
    puntos: (av.puntos ?? []).map((p) => L.en(e, p.en)),
    fin: L.fin(e),
  };
};

const CARD = { x: 540, y: 1180, w: 800, h: 860 };

export const Avance: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta, escenas }) => {
  const av = ep.avance!;
  const T = tiempos(L, ep, escenas[0]);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1140, z: 0.94 },
    { t: T.abre - 0.1, x: 540, y: 1180, z: 1.0, d: 0.8 },
    { t: T.puntos[0] - 0.2, x: 540, y: 1260, z: 1.06, d: 0.9 },
  ];
  const abierto = ramp(t, T.abre, T.abre + 0.35);
  const fueraCandado = ramp(t, T.abre + 0.35, T.abre + 0.7);
  const revela = sp(t, T.abre + 0.45, { damping: 13, stiffness: 160 });
  // moneda: gira rápido al aparecer y se calma
  const tm = Math.max(0, t - (T.abre + 0.45));
  const giro = 6 * Math.PI * (1 - Math.exp(-tm * 1.2));
  const sello = av.tipo === "parte" ? `PARTE ${av.parte}` : `EP.${av.episodio}`;
  return (
    <Escena t={t} tomas={tomas}>
      <Tarjeta x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} t={t} at={T.ini - 0.15} out={hasta} activa={revela} desde="escala">
        {/* contenido que aparece al abrirse */}
        {revela > 0.001 && (
          <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, revela * 1.5) }}>
            <div style={{ position: "absolute", left: CARD.w / 2 - 140, top: 150, width: 280, height: 280, transform: `scale(${0.4 + 0.6 * revela})` }}>
              <Moneda s={280} giro={giro} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 92, color: C.texto, letterSpacing: 1, opacity: ramp(t, T.titulo, T.titulo + 0.3), transform: `translateY(${(1 - ramp(t, T.titulo, T.titulo + 0.4)) * 30}px)` }}>
              {av.titulo.toUpperCase()}
            </div>
          </div>
        )}
        {/* candado */}
        {fueraCandado < 1 && (
          <div style={{ position: "absolute", left: CARD.w / 2 - 120, top: CARD.h / 2 - 170, width: 240, height: 240, opacity: 1 - fueraCandado, transform: `translateY(${fueraCandado * -120}px) scale(${1 + 0.1 * Math.sin(abierto * Math.PI)})` }}>
            <Candado s={240} abierto={abierto} c={C.acento} />
          </div>
        )}
      </Tarjeta>
      <Sello texto={sello} x={CARD.x} y={CARD.y - CARD.h / 2 - 10} t={t} at={T.sello - 0.03} out={hasta} size={84} rot={-4} />
      {(av.puntos ?? []).map((p, i) => (
        <Chip key={i} texto={p.texto} x={CARD.x} y={CARD.y + 220 + i * 112} t={t} at={T.puntos[i] - 0.05} out={hasta} size={44} on={0} variante="borde" />
      ))}
      {/* episodio siguiente: una casilla más se enciende en la rejilla */}
      {av.tipo === "episodio" && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: ramp(t, T.ini, T.ini + 0.4) }}>
          <Rejilla g={{ cx: 540, cy: CARD.y + CARD.h / 2 + 110, celda: 30, hueco: 8, cols: 25, filas: 2 }} total={ep.total} estado={(n) => ({ opacity: 1, escala: 1, encendida: n < (av.episodio ?? 0) ? 1 : n === av.episodio ? clamp01((t - T.sello) / 0.3) : 0, latido: n === av.episodio ? Math.sin(clamp01((t - T.sello) / 0.4) * Math.PI) * 0.4 : 0, contorno: 0, check: 0 })} />
        </div>
      )}
    </Escena>
  );
};

export const eventosAvance = (L: Linea, ep: EpisodioMaster, _b: unknown, escenas: string[]): Evento[] => {
  if (!ep.avance) return [];
  const T = tiempos(L, ep, escenas[0]);
  return [
    { t: T.sello + 0.07, sfx: "golpe", vol: 0.6 },
    { t: T.abre, sfx: "tick", vol: 0.45 },
    { t: T.abre + 0.45, sfx: "whoosh", vol: 0.3 },
    ...T.puntos.map((p) => ({ t: p, sfx: "pop" as const, vol: 0.35 })),
  ];
};
