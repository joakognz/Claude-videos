/**
 * Etapa 0 · Idea (escenas frase → minimo).
 *  - «Antes de tocar código»: el código queda en pausa (tachado).
 *  - «defines qué hace tu proyecto y para quién, en una frase»: un bocadillo con una frase larga (barras abstractas,
 *    sin texto inventado) que se acorta hasta «QUÉ HACE + PARA QUIÉN».
 *  - «Si no sabes decirlo simple, no sabes construirlo»: la frase en grande.
 *  - «separa lo imprescindible de lo ya veremos»: lista de funciones (fichas abstractas); las prescindibles se apagan
 *    y se van a «YA VEREMOS»; las demás quedan como «VERSIÓN MÍNIMA». «Querer todo desde el primer día»: las
 *    prescindibles intentan volver y se rechazan.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Alerta, Check, Codigo, Cruz } from "../componentes/Iconos";
import { Etiqueta } from "../componentes/Sello";
import { Frase } from "../componentes/Tarjeta";
import { C, EASE, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => ({
  antes: L.en("frase", "Antes"),
  codigo: L.en("frase", "código"),
  defines: L.en("frase", "defines"),
  queHace: L.en("frase", "qué hace"),
  paraQuien: L.en("frase", "para quién"),
  unaFrase: L.en("frase", "una frase"),
  si: L.en("frase", "Si"),
  separa: L.en("minimo", "separa"),
  imprescindible: L.en("minimo", "imprescindible"),
  yaVeremos: L.en("minimo", "«ya"),
  error: L.en("minimo", "El error"),
  querer: L.en("minimo", "querer"),
  primerDia: L.en("minimo", "primer"),
  dia: L.en("minimo", "día."),
  fin: L.fin("minimo"),
});

const BOC = { x: 540, y: 1300 };
const LISTA = { x: 360, y0: 2330, paso: 112 };
const CAJA = { x: 860, y: 2610 };
/** Funciones de la lista: true = imprescindible. */
const FUNCIONES = [true, false, true, false, true, false];
const ANCHOS = [0.72, 0.5, 0.86, 0.62, 0.58, 0.78];

export const EtapaIdea: React.FC<BloqueProps> = ({ t, L, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: T.antes - 1.2, x: 540, y: 900, z: 1.0 },
    { t: T.defines - 0.3, x: 540, y: 1250, z: 1.0, d: 0.8 },
    { t: T.unaFrase - 0.2, x: 540, y: 1300, z: 1.14, d: 0.7 },
    { t: T.si - 0.4, x: 540, y: 1880, z: 1.0, d: 0.8 },
    { t: T.separa - 0.45, x: 560, y: 2640, z: 0.98, d: 0.85 },
    { t: T.error - 0.2, x: 560, y: 2600, z: 1.04, d: 0.8 },
    { t: T.dia - 0.1, x: 470, y: 2640, z: 1.1, d: 0.6 },
  ];
  // bocadillo: frase larga (3 líneas) que se acorta a una
  const acorta = EASE(ramp(t, T.unaFrase - 0.05, T.unaFrase + 0.55, (x) => x));
  const anchoB = 860 - 200 * acorta;
  const altoB = 300 - 150 * acorta;
  const escribe = ramp(t, T.defines, T.paraQuien + 0.4, (x) => x);
  // lista
  const separa = (k: number) => (FUNCIONES[k] ? 0 : EASE(ramp(t, T.yaVeremos - 0.05 + k * 0.04, T.yaVeremos + 0.5 + k * 0.04, (x) => x)));
  const vuelve = ramp(t, T.querer, T.querer + 0.45) * (1 - ramp(t, T.primerDia + 0.15, T.dia + 0.1));
  const sacude = t > T.querer && t < T.dia + 0.1 ? Math.sin(t * 60) * 7 * vuelve : 0;
  const minima = sp(t, T.yaVeremos + 0.45, { damping: 13, stiffness: 170 });
  return (
    <Escena t={t} tomas={tomas}>
      {/* antes de tocar código */}
      {(() => {
        const v = vis(t, T.antes - 0.3, T.defines + 0.2, 0.5);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540 - 110, top: 760 - 110, width: 220, height: 220, borderRadius: 50, background: C.panel2, border: `3px solid ${C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <Codigo s={150} c={ramp(t, T.codigo, T.codigo + 0.3) > 0.5 ? C.tenue : C.texto} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Cruz s={200} p={ramp(t, T.codigo - 0.05, T.codigo + 0.4)} trazo={4} />
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="ANTES DE TOCAR CÓDIGO" x={540} y={950} t={t} at={T.antes + 0.1} out={T.defines + 0.2} size={40} variante="borde" />

      {/* bocadillo */}
      {(() => {
        const v = vis(t, T.defines - 0.15, T.si + 0.1, 0.5);
        if (!v.on) return null;
        const lineas = [1, 0.92, 0.7];
        return (
          <div style={{ position: "absolute", left: BOC.x, top: BOC.y, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", left: -anchoB / 2, top: -altoB / 2, width: anchoB, height: altoB, borderRadius: 48, background: C.texto, transform: `scale(${v.scale})`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
              {/* cola del bocadillo */}
              <div style={{ position: "absolute", left: 90, bottom: -34, width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: `40px solid ${C.texto}` }} />
              {acorta < 0.5 ? (
                <div style={{ position: "absolute", left: 56, right: 56, top: 52, opacity: 1 - acorta * 2 }}>
                  {lineas.map((w, i) => {
                    const p = clamp01(escribe * 3 - i);
                    // «qué hace» en la primera línea y «para quién» en la segunda se encienden al decirlas
                    const marca = i === 0 ? ramp(t, T.queHace, T.queHace + 0.25) : i === 1 ? ramp(t, T.paraQuien, T.paraQuien + 0.25) : 0;
                    return (
                      <div key={i} style={{ position: "relative", height: 34, marginBottom: 32, width: `${w * 100 * p}%`, borderRadius: 17, background: "#C9CED8" }}>
                        {marca > 0 && <div style={{ position: "absolute", left: i === 0 ? "8%" : "40%", width: "38%", top: 0, bottom: 0, borderRadius: 17, background: C.acento, opacity: marca }} />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, opacity: (acorta - 0.5) * 2, fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.oscuro, whiteSpace: "nowrap" }}>
                  <span style={{ background: C.acento, borderRadius: 14, padding: "6px 16px" }}>QUÉ HACE</span>+<span style={{ background: C.acento, borderRadius: 14, padding: "6px 16px" }}>PARA QUIÉN</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="QUÉ HACE" x={BOC.x - 230} y={BOC.y + 230} t={t} at={T.queHace} out={T.unaFrase} size={34} variante="acento" />
      <Etiqueta texto="PARA QUIÉN" x={BOC.x + 210} y={BOC.y + 230} t={t} at={T.paraQuien} out={T.unaFrase} size={34} variante="acento" />
      <Etiqueta texto="EN UNA FRASE" x={BOC.x} y={BOC.y + 190} t={t} at={T.unaFrase + 0.2} out={T.si + 0.1} size={40} variante="borde" />

      {/* la frase en grande */}
      <Frase lineas={["Si no sabes", "decirlo simple,", "no sabes", "construirlo."]} escena="frase" palabras={L.palabras} desde={T.si} x={540} y={1900} t={t} out={T.separa + 0.1} size={92} acento={["simple,", "construirlo."]} />

      {/* lista de funciones */}
      <Etiqueta texto="IMPRESCINDIBLE" x={LISTA.x} y={LISTA.y0 - 110} t={t} at={T.imprescindible} out={T.yaVeremos + 0.45} size={36} variante="acento" />
      {FUNCIONES.map((imp, k) => {
        const at = T.separa - 0.25 + k * 0.08;
        const v = vis(t, at, hasta, 0.6);
        if (!v.on) return null;
        const s = separa(k);
        // posición: en la lista; las prescindibles viajan a la caja «YA VEREMOS» (y vuelven un poco al «querer todo»)
        const fila = imp ? FUNCIONES.slice(0, k).filter(Boolean).length : FUNCIONES.slice(0, k).filter((x) => !x).length;
        const xL = LISTA.x;
        const yL = LISTA.y0 + k * LISTA.paso;
        const yM = LISTA.y0 + 80 + fila * LISTA.paso;
        const xC = CAJA.x;
        const yC = CAJA.y - 110 + fila * 110;
        const sep = imp ? 0 : s * (1 - vuelve * 0.55);
        const x = imp ? xL : xL + (xC - xL) * sep;
        const y = imp ? yL + (yM - yL) * EASE(ramp(t, T.yaVeremos + 0.15, T.yaVeremos + 0.6, (u) => u)) : yL + (yC - yL) * sep;
        const encendida = imp ? ramp(t, T.imprescindible - 0.05 + k * 0.03, T.imprescindible + 0.25 + k * 0.03) : 0;
        const apagada = imp ? 0 : s;
        const ancho = imp ? 500 : 500 - 220 * s;
        const rechazo = !imp ? ramp(t, T.primerDia, T.primerDia + 0.25) * (1 - ramp(t, T.dia + 0.15, T.dia + 0.4)) : 0;
        return (
          <div key={k} style={{ position: "absolute", left: x - ancho / 2 + (imp ? 0 : sacude), top: y - 40, width: ancho, height: 80, borderRadius: 22, boxSizing: "border-box", background: encendida > 0.05 ? `color-mix(in srgb, ${C.acento} ${Math.round(encendida * 22)}%, ${C.panel2})` : C.panel2, border: `3px solid ${encendida > 0.05 ? C.acento : rechazo > 0.1 ? C.acento : C.borde}`, opacity: v.opacity * (1 - 0.55 * apagada * (1 - vuelve)), transform: `translateX(${(1 - v.s) * -40}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 18, padding: "0 22px" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: encendida > 0.05 ? C.acento : C.tenue, flexShrink: 0 }} />
            <div style={{ height: 18, borderRadius: 9, width: `${ANCHOS[k] * 100}%`, background: encendida > 0.05 ? C.texto : C.gris, opacity: 0.85 }} />
            {rechazo > 0 && (
              <div style={{ position: "absolute", right: -24, top: -24, width: 56, height: 56, borderRadius: "50%", background: C.panel, border: `3px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, T.primerDia, { damping: 10, stiffness: 240 })})` }}>
                <Cruz s={36} trazo={6} p={rechazo} />
              </div>
            )}
          </div>
        );
      })}
      {/* caja «ya veremos» */}
      {(() => {
        const v = vis(t, T.yaVeremos - 0.15, hasta, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: CAJA.x - 180 + sacude * 0.5, top: CAJA.y - 200, width: 360, height: 420, borderRadius: 34, border: `4px dashed ${C.tenue}`, opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: -58, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 36, letterSpacing: 1.5, color: C.gris }}>YA VEREMOS</div>
          </div>
        );
      })()}
      {/* versión mínima: marco alrededor de las imprescindibles */}
      {minima > 0.001 && (
        <div style={{ position: "absolute", left: LISTA.x - 290, top: LISTA.y0 + 80 - 70, width: 580, height: 3 * LISTA.paso + 30, borderRadius: 36, border: `5px solid ${C.acento}`, boxShadow: `0 0 ${30 + 30 * Math.sin(clamp01((t - T.dia) / 0.5) * Math.PI)}px ${C.acento}88`, opacity: Math.min(1, minima * 1.5), transform: `scale(${1.15 - 0.15 * minima})` }}>
          <div style={{ position: "absolute", left: "50%", bottom: -36, transform: "translateX(-50%)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12, padding: "10px 26px", borderRadius: 999, background: C.acento, color: C.oscuro, fontFamily: TITULO, fontWeight: 800, fontSize: 38 }}>
            VERSIÓN MÍNIMA
            {t > T.dia && <Check s={40} c={C.oscuro} trazo={7} p={ramp(t, T.dia, T.dia + 0.3)} />}
          </div>
        </div>
      )}
      {/* el error número uno */}
      {(() => {
        const v = vis(t, T.error - 0.05, hasta, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: LISTA.y0 - 210, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 16, whiteSpace: "nowrap", padding: "14px 30px 14px 20px", borderRadius: 999, background: C.panel, border: `3px solid ${C.acento}`, fontFamily: TITULO, fontWeight: 800, fontSize: 42, color: C.texto }}>
              <Alerta s={50} />
              EL ERROR Nº 1: <span style={{ color: C.acento }}>QUERER TODO</span>
            </div>
          </div>
        );
      })()}
    </Escena>
  );
};

export const eventosIdea = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.codigo, sfx: "pop", vol: 0.3 },
    { t: T.unaFrase, sfx: "whoosh", vol: 0.3 },
    { t: T.imprescindible, sfx: "pop", vol: 0.35 },
    { t: T.yaVeremos, sfx: "whoosh", vol: 0.3 },
    { t: T.error, sfx: "pop", vol: 0.35 },
    { t: T.primerDia, sfx: "pop", vol: 0.35 },
  ];
};
