/**
 * EP.13 · Resumen y votación (escenas resumen y voto): la caja cerrada con su ✓ → ¡A CONSTRUIR! → las tres cartas boca
 * arriba con su palabra; cada una se ilumina cuando la voz la dice y se escribe en un comentario de Instagram (recreado)
 * → barras de votación sin cifras → sello MÓDULO 2.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Pildora } from "../../componentes/ep08/Dibujos";
import { Caja, Insignia } from "../../componentes/ep12/Piezas12";
import { CajaHerramientas, Carta, Comentario } from "../../componentes/ep13/Piezas13";
import { C, TITULO, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const R = "resumen";
const V = "voto";
const YV = 2000;
const XS = [215, 540, 865];

const tiempos = (L: Linea) => ({
  en: L.ini(R),
  herramientas: L.en(R, "herramientas."),
  ahora: L.en(R, "Ahora,"),
  construir: L.en(R, "construir."),
  por: L.ini(V),
  donde: L.en(V, "dónde"),
  empezamos: L.en(V, "empezamos?"),
  comenta: L.en(V, "Comenta"),
  web: L.en(V, "web,"),
  automatizar: L.en(V, "automatizar"),
  medida: L.en(V, "medida."),
  la: L.en(V, "La más"),
  votada: L.en(V, "votada"),
  modulo: L.en(V, "módulo"),
});

export const Voto13: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 1.0 },
    { t: T.por - 0.25, x: 540, y: YV, z: 1.0, d: 0.8 },
  ];
  const palabras = [
    { w: "WEB", at: T.web, img: ep.imagenes!.web },
    { w: "AUTOMATIZAR", at: T.automatizar, img: ep.imagenes!.automatizacion },
    { w: "MEDIDA", at: T.medida, img: ep.imagenes!.a_medida },
  ];
  const actual = palabras.reduce((k, p, i) => (t >= p.at - 0.05 ? i : k), -1);
  const enVoto = t >= T.la - 0.05;
  const fin = (i: number) => (i + 1 < palabras.length ? palabras[i + 1].at - 0.05 : T.la);
  const escrito = actual < 0 ? "" : palabras[actual].w.slice(0, Math.max(1, Math.round(ramp(t, palabras[actual].at - 0.05, palabras[actual].at + 0.3) * palabras[actual].w.length)));
  const vBarras = vis(t, T.votada - 0.1, Infinity, 0.8);
  const vCaja = vis(t, T.en + 0.1, T.por + 0.3, 0.6);
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── en resumen ── */}
      <Etiqueta texto="EN RESUMEN" x={540} y={760} t={t} at={T.en} out={T.por + 0.3} size={44} variante="acento" fuente="titulo" />
      {vCaja.on && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: vCaja.opacity, transformOrigin: "540px 1080px", transform: `translateY(${vCaja.y}px) scale(${vCaja.scale})` }}>
          <CajaHerramientas x={540} y={1010} w={460} abre={0} />
        </div>
      )}
      <Caja x={800} y={940} t={t} at={T.herramientas} out={T.por + 0.3} desde={0.3}>
        <Insignia s={92} tipo="check" />
      </Caja>
      <Flecha curva={{ a: { x: 540, y: 1225 }, c: { x: 560, y: 1290 }, b: { x: 540, y: 1345 } }} p={ramp(t, T.ahora, T.ahora + 0.45)} ancho={10} opacity={1 - ramp(t, T.por, T.por + 0.3)} />
      <Sello texto="¡A CONSTRUIR!" x={540} y={1450} t={t} at={T.construir} out={T.por + 0.3} size={66} rot={-4} />

      {/* ── votación ── */}
      <Etiqueta texto="¿POR DÓNDE EMPEZAMOS?" x={540} y={YV - 280} t={t} at={T.donde - 0.05} out={T.modulo} size={48} variante="texto" fuente="titulo" />
      <Sello texto="MÓDULO 2" x={540} y={YV - 280} t={t} at={T.modulo} size={60} rot={-3} />
      {palabras.map((p, i) => {
        const activa = !enVoto && actual === i ? 1 : 0;
        const salta = t > p.at - 0.05 ? -Math.sin(Math.min(1, sp(t, p.at - 0.05, { damping: 9, stiffness: 240 })) * Math.PI) * 30 : 0;
        return (
          <React.Fragment key={p.w}>
            <Caja x={XS[i]} y={YV - 15 + salta} t={t} at={T.empezamos - 0.1 + i * 0.1} rot={[-4, 0, 4][i]} desde={0.5}>
              <Carta w={230} giro={1} img={p.img} activa={activa} />
            </Caja>
            <Caja x={XS[i]} y={YV + 240} t={t} at={T.comenta - 0.05 + i * 0.08}>
              <Pildora texto={p.w} size={30} activa={t >= p.at - 0.05 && (enVoto || actual === i) ? 1 : 0} />
            </Caja>
          </React.Fragment>
        );
      })}
      <Caja x={540} y={YV + 370} t={t} at={T.comenta} out={T.la}>
        <Comentario w={880} texto={escrito} caret={Math.floor(t * 2.6) % 2 === 0} envia={actual >= 0 ? ramp(t, fin(actual) - 0.2, fin(actual)) : 0} />
      </Caja>
      {vBarras.on && (
        <div style={{ position: "absolute", left: 540, top: YV + 370, width: 0, height: 0, opacity: vBarras.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${vBarras.scale})`, display: "flex", flexDirection: "column", gap: 14, width: 860 }}>
            {palabras.map((p, i) => {
              const crece = sp(t, T.votada + i * 0.1, { damping: 16, stiffness: 90 });
              const ancho = crece * (0.45 + 0.22 * Math.sin((t - T.votada) * 2.6 + i * 2.1) + 0.12 * Math.sin((t - T.votada) * 4.1 + i));
              return (
                <div key={p.w} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 250, textAlign: "right", fontFamily: TITULO, fontWeight: 800, fontSize: 30, color: C.texto }}>{p.w}</div>
                  <div style={{ flex: 1, height: 34, borderRadius: 17, background: C.panel2, border: `2px solid ${C.borde}`, overflow: "hidden" }}>
                    <div style={{ width: `${clamp01(ancho) * 100}%`, height: "100%", borderRadius: 17, background: C.acento }} />
                  </div>
                  <div style={{ width: 40, fontFamily: TITULO, fontWeight: 800, fontSize: 34, color: C.acento }}>?</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Escena>
  );
};

export const eventosVoto13 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.en, sfx: "pop", vol: 0.35 },
    { t: T.herramientas, sfx: "tick", vol: 0.45 },
    { t: T.ahora, sfx: "whoosh", vol: 0.25 },
    { t: T.construir, sfx: "golpe", vol: 0.45 },
    { t: T.por - 0.25, sfx: "whoosh", vol: 0.3 },
    { t: T.empezamos - 0.1, sfx: "pop", vol: 0.3 },
    { t: T.web - 0.05, sfx: "tecleo", vol: 0.25, dur: 0.3 },
    { t: T.automatizar - 0.05, sfx: "tecleo", vol: 0.25, dur: 0.35 },
    { t: T.medida - 0.05, sfx: "tecleo", vol: 0.25, dur: 0.3 },
    { t: T.la - 0.15, sfx: "envio", vol: 0.35 },
    { t: T.votada - 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.modulo, sfx: "golpe", vol: 0.45 },
  ];
};
