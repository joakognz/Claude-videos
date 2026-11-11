/**
 * Etapa N (bloque «etapa», con "etapa": N en el JSON). Marco común a las cuatro:
 *  1. la escalera, con las etapas anteriores hechas; la cámara sube del peldaño anterior al N mientras la voz dice
 *     «Etapa N», el peldaño se enciende y cae el sello «ETAPA N» con golpe;
 *  2. la cámara entra en el peldaño: el contenido de la etapa sale de él y ocupa la pantalla;
 *  3. (opcional, `regreso`) el contenido vuelve al peldaño y la cámara sale a la escalera completa.
 * El contenido de cada etapa vive en su fichero (EtapaIdea, EtapaDesarrollo, EtapaStaging, EtapaProduccion).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Escalera, NOMBRES_ETAPA, peldano } from "../componentes/Escalera";
import { Escena } from "../componentes/Escena";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE, FOCO, clamp01, poseCamara, ramp, sp } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, DefBloqueJson, EpisodioMaster } from "../tipos";
import { EtapaDesarrollo, eventosDesarrollo } from "./EtapaDesarrollo";
import { EtapaIdea, eventosIdea } from "./EtapaIdea";
import { EtapaProduccion, escaleraProduccion, eventosProduccion, regresoProduccion } from "./EtapaProduccion";
import { EtapaStaging, eventosStaging } from "./EtapaStaging";

export type ContenidoEtapa = React.FC<BloqueProps>;
const CONTENIDO: Record<number, { C: ContenidoEtapa; eventos: (L: Linea, escenas: string[]) => Evento[] }> = {
  0: { C: EtapaIdea, eventos: eventosIdea },
  1: { C: EtapaDesarrollo, eventos: eventosDesarrollo },
  2: { C: EtapaStaging, eventos: eventosStaging },
  3: { C: EtapaProduccion, eventos: eventosProduccion },
};
/** Etapas que vuelven a la escalera antes de terminar (instante, en función de la línea de tiempo). */
const REGRESO: Record<number, (L: Linea) => number> = { 3: regresoProduccion };
/** Lo que se dibuja sobre la escalera tras el regreso. */
const SOBRE_ESCALERA: Record<number, React.FC<{ t: number; L: Linea; hasta: number }>> = { 3: escaleraProduccion };

/** Instante del tick de una etapa: al acabar su voz, y siempre 0,5 s antes del corte con el bloque siguiente. */
export const instanteHecho = (L: Linea, ep: EpisodioMaster, ultima: string) => {
  const fin = L.fin(ultima);
  const k = ep.escenas.findIndex((e) => e.id === ultima);
  const sig = ep.escenas[k + 1];
  const corte = sig ? (fin + L.ini(sig.id)) / 2 : L.duracion;
  return Math.min(fin + 0.15, corte - 0.5);
};

export const tiemposEtapa = (L: Linea, n: number, escenas: string[], ep: EpisodioMaster) => {
  const e0 = escenas[0];
  const fin = L.fin(escenas[escenas.length - 1]);
  return {
    hecho: instanteHecho(L, ep, escenas[escenas.length - 1]),
    etapa: L.ini(e0),
    num: L.en(e0, String(n)),
    nombre: L.finDe(e0, String(n)) + 0.1,
    portal: L.ini(escenas[1]) - 0.42,
    regreso: REGRESO[n] ? REGRESO[n](L) : Infinity,
    fin,
  };
};

const PORTAL = 0.75;

export const Etapa: React.FC<BloqueProps> = (props) => {
  const { t, ep, L, desde, hasta, escenas, bloque } = props;
  const n = bloque.etapa ?? 0;
  const T = tiemposEtapa(L, n, escenas, ep);
  const p = peldano(n);
  const previo = n > 0 ? peldano(n - 1) : null;
  const punto = { x: p.cx, y: p.top + 92 };
  const tomas: Toma[] = [
    previo ? { t: desde - 1, x: previo.foco.x, y: previo.foco.y + 40, z: 1.3 } : { t: desde - 1, x: 560, y: 1330, z: 0.92 },
    { t: T.etapa - 0.2, x: p.foco.x, y: p.foco.y + 40, z: 1.45, d: 0.85 },
    { t: T.portal, x: punto.x, y: punto.y, z: 7, d: PORTAL },
  ];
  if (T.regreso < Infinity) tomas.push({ t: T.regreso, x: 560, y: 1180, z: 0.82, d: 0.95 });
  const pose = poseCamara(tomas, t);
  // posición en pantalla del peldaño: de ahí sale el contenido
  const sx = FOCO.x + (punto.x - pose.x) * pose.z;
  const sy = FOCO.y + (punto.y - pose.y) * pose.z;
  const entra = EASE(ramp(t, T.portal, T.portal + PORTAL, (x) => x));
  const vuelve = T.regreso < Infinity ? EASE(ramp(t, T.regreso, T.regreso + PORTAL, (x) => x)) : 0;
  const u = entra * (1 - vuelve);
  const escala = Math.exp(Math.log(0.07) * (1 - u));
  const verEscalera = 1 - ramp(t, T.portal + 0.3, T.portal + PORTAL) + (T.regreso < Infinity ? ramp(t, T.regreso + 0.05, T.regreso + 0.4) : 0);
  const Contenido = CONTENIDO[n].C;
  const Sobre = SOBRE_ESCALERA[n];
  const hechaN = clamp01((t - T.hecho) / 0.3);
  return (
    <AbsoluteFill>
      {verEscalera > 0.001 && (
        <AbsoluteFill style={{ opacity: clamp01(verEscalera) }}>
          <Escena t={t} tomas={tomas}>
            <Escalera
              t={t}
              estado={(k) => ({
                aparece: 1,
                activa: k === n ? sp(t, T.num - 0.12, { damping: 12, stiffness: 200 }) * (1 - 0.6 * hechaN) : 0,
                hecha: k < n ? 1 : k === n ? hechaN : 0,
                tenue: k > n ? 0.6 : 0,
                latido: k === n ? Math.sin(clamp01((t - T.num + 0.12) / 0.35) * Math.PI) * 0.05 : 0,
              })}
            />
            {Sobre && <Sobre t={t} L={L} hasta={hasta} />}
          </Escena>
        </AbsoluteFill>
      )}
      {/* sello y nombre de la etapa (en pantalla, sobre el peldaño) */}
      <Sello texto={`ETAPA ${n}`} x={540} y={680} t={t} at={T.num - 0.05} out={T.portal + 0.25} size={80} rot={-4} />
      <Etiqueta texto={NOMBRES_ETAPA[n]} x={540} y={830} t={t} at={T.nombre} out={T.portal + 0.25} size={58} variante="texto" fuente="titulo" />
      {u > 0.001 && (
        <AbsoluteFill style={{ opacity: clamp01(u * 2.2), transformOrigin: "540px 960px", transform: `translate(${(sx - 540) * (1 - u)}px, ${(sy - 960) * (1 - u)}px) scale(${escala})` }}>
          <AbsoluteFill style={{ background: C.fondo, borderRadius: 60 * (1 - u), border: u < 0.98 ? `${6 / Math.max(0.2, escala)}px solid ${C.acento}` : "none", overflow: "hidden" }}>
            <Contenido {...props} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const eventosEtapa = (L: Linea, ep: EpisodioMaster, bloque: DefBloqueJson, escenas: string[]): Evento[] => {
  const n = bloque.etapa ?? 0;
  const T = tiemposEtapa(L, n, escenas, ep);
  const ev: Evento[] = [
    { t: T.etapa - 0.2, sfx: "whoosh", vol: 0.22 },
    { t: T.num + 0.07, sfx: "golpe", vol: 0.6 },
    { t: T.portal, sfx: "whoosh", vol: 0.35 },
    { t: T.hecho, sfx: "tick", vol: 0.6 },
  ];
  if (T.regreso < Infinity) ev.push({ t: T.regreso, sfx: "whoosh", vol: 0.35 });
  return [...ev, ...CONTENIDO[n].eventos(L, escenas)];
};
