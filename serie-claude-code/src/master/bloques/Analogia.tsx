/**
 * Bloque «Analogía» (escenas word → microsoft → guardar → nubes → versiones → compra). Pantalla dividida:
 * arriba Word → Drive, abajo VS Code → GitHub. Las flechas se dibujan, los logos entran con spring, Microsoft cae
 * sobre Word y VS Code (los dos son suyos) y después solo sobre GitHub (lo compró). La cámara encuadra siempre lo
 * que la voz nombra.
 */
import React from "react";
import { Caida, golpeEn } from "../componentes/Caida";
import { Escena } from "../componentes/Escena";
import { Flecha } from "../componentes/Flecha";
import { Logo } from "../componentes/Logo";
import { Paquete } from "../componentes/Paquete";
import { Documento, Editor } from "../componentes/Piezas";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE, TITULO, clamp01, ramp, sp, vis } from "../nucleo";
import type { Curva, Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const FA = 880; // fila Word → Drive
const FB = 1480; // fila VS Code → GitHub
const DIV = 1180; // línea que divide la pantalla
const XI = 250;
const XD = 830;
const FLECHA_A: Curva = { a: { x: 400, y: FA }, c: { x: 540, y: FA - 70 }, b: { x: 680, y: FA } };
const FLECHA_B: Curva = { a: { x: 400, y: FB }, c: { x: 540, y: FB - 70 }, b: { x: 680, y: FB } };

const tiempos = (L: Linea) => ({
  word: L.en("word", "Word.", 0),
  procesador: L.en("word", "procesador"),
  abres: L.en("word", "abres"),
  humano: L.en("word", "humano"),
  vsc: L.en("microsoft", "Visual"),
  mismo: L.en("microsoft", "mismo,"),
  codigo: L.en("microsoft", "código."),
  dos: L.en("microsoft", "Y"),
  ms1: L.en("microsoft", "Microsoft."),
  ahora: L.en("guardar", "Ahora,"),
  donde: L.en("guardar", "¿dónde"),
  wordA: L.en("nubes", "Word,"),
  drive: L.en("nubes", "Drive."),
  vscB: L.en("nubes", "Visual"),
  github: L.en("nubes", "GitHub."),
  losdos: L.en("versiones", "Los"),
  archivos: L.en("versiones", "archivos"),
  versiones: L.en("versiones", "versiones."),
  compartir: L.en("versiones", "compartirlos."),
  gh: L.en("compra", "GitHub"),
  ms2: L.en("compra", "Microsoft"),
  existia: L.en("compra", "existía."),
  mas: L.en("compra", "Más"),
});

export const Analogia: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 340, y: FA + 20, z: 1.3 },
    { t: T.abres - 0.2, x: 430, y: FA + 40, z: 1.2, d: 0.9 },
    { t: T.vsc - 0.2, x: 430, y: FB + 40, z: 1.2, d: 1.0 },
    { t: T.dos - 0.1, x: 420, y: DIV, z: 0.95, d: 1.0 },
    { t: T.ahora - 0.1, x: 560, y: DIV, z: 0.88, d: 1.0 },
    { t: T.wordA - 0.3, x: 540, y: FA + 30, z: 1.18, d: 0.9 },
    { t: T.vscB - 0.3, x: 540, y: FB + 30, z: 1.18, d: 0.9 },
    { t: T.losdos - 0.15, x: 580, y: DIV, z: 0.9, d: 1.0 },
    { t: T.gh - 0.2, x: XD - 40, y: FB - 40, z: 1.3, d: 0.9 },
    { t: T.existia - 0.35, x: XD - 60, y: FB + 60, z: 1.15, d: 0.8 },
    { t: T.mas - 0.1, x: 560, y: DIV, z: 0.9, d: 1.1 },
  ];
  const g1 = golpeEn(t, T.ms1);
  const g2 = golpeEn(t, T.ms2);
  const pA = ramp(t, T.wordA, T.drive + 0.05, EASE);
  const pB = ramp(t, T.vscB + 0.1, T.github + 0.05, EASE);
  const viaje = (a: number) => clamp01((t - a) / 0.8);
  const versiones = sp(t, T.versiones, { damping: 13, stiffness: 150 });
  const salidaDiv = T.compartir + 0.8;
  return (
    <Escena t={t} tomas={tomas}>
      {/* división de la pantalla */}
      {(() => {
        const p = ramp(t, T.vsc - 0.3, T.vsc + 0.5);
        return <div style={{ position: "absolute", left: 540 - 520 * p, top: DIV - 2, width: 1040 * p, height: 4, borderRadius: 2, background: C.borde }} />;
      })()}

      {/* fila A: Word */}
      <Etiqueta texto="PIÉNSALO COMO…" x={XI} y={FA - 190} t={t} at={desde + 0.1} out={T.procesador} size={32} variante="gris" />
      <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${1 - g1 * 0.6})`, transformOrigin: `${XI}px ${FA}px` }}>
        <Logo src={ep.logos.word} x={XI} y={FA} w={220} t={t} at={T.word - 0.15} pulsos={[T.wordA]} />
      </div>
      <Etiqueta texto="PROCESADOR DE TEXTO" x={XI} y={FA + 170} t={t} at={T.procesador} out={T.vsc - 0.05} size={28} variante="borde" />
      {(() => {
        const v = vis(t, T.abres, T.ahora - 0.1, 0.7);
        return v.on ? (
          <div style={{ position: "absolute", left: 600 - 95, top: FA - 120, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <Documento w={190} t={t} lineas={1 + 6 * ramp(t, T.abres + 0.3, T.humano + 0.4, (x) => x)} />
          </div>
        ) : null;
      })()}
      <Etiqueta texto="LENGUAJE HUMANO" x={600} y={FA + 170} t={t} at={T.humano - 0.3} out={T.vsc - 0.05} size={28} variante="acento" />

      {/* fila B: VS Code */}
      <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${1 - g1 * 0.6})`, transformOrigin: `${XI}px ${FB}px` }}>
        <Logo src={ep.logos.vscode} x={XI} y={FB} w={210} t={t} at={T.vsc - 0.1} pulsos={[T.vscB]} />
      </div>
      <Etiqueta texto="LO MISMO" x={XI} y={FB + 170} t={t} at={T.mismo} out={T.ahora} size={28} variante="borde" />
      {(() => {
        const v = vis(t, T.mismo - 0.2, T.ahora - 0.1, 0.7);
        return v.on ? (
          <div style={{ position: "absolute", left: 600 - 150, top: FB - 105, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <Editor w={300} h={210} t={t} lineas={1 + 5 * ramp(t, T.mismo, T.dos, (x) => x)} />
          </div>
        ) : null;
      })()}
      <Etiqueta texto="PERO CON CÓDIGO" x={600} y={FB + 170} t={t} at={T.codigo - 0.2} out={T.ahora} size={28} variante="acento" />

      {/* Microsoft cae sobre los dos */}
      <Caida src={ep.logos.microsoft} x={XI} y={DIV} w={250} t={t} aterriza={T.ms1} out={T.ahora + 0.35} />

      {/* ¿dónde se guarda? */}
      {[FA, FB].map((y, i) => {
        const v = vis(t, T.ahora + 0.15 + i * 0.12, i === 0 ? T.drive - 0.05 : T.github - 0.05, 0.6);
        return v.on ? (
          <div key={y} style={{ position: "absolute", left: XD - 115, top: y - 115, width: 230, height: 230, borderRadius: 40, border: `5px dashed ${C.tenue}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale})`, fontFamily: TITULO, fontWeight: 800, fontSize: 110, color: C.tenue }}>?</div>
        ) : null;
      })}
      <Etiqueta texto="¿Dónde se guarda?" x={XD - 20} y={DIV} t={t} at={T.donde - 0.05} out={T.wordA} size={44} variante="borde" fuente="titulo" />

      {/* flechas y nubes */}
      <Flecha curva={FLECHA_A} p={pA} ancho={10} />
      <Flecha curva={FLECHA_B} p={pB} ancho={10} />
      {/* versiones: tarjetas apiladas detrás de Drive y GitHub */}
      {[FA, FB].map((y) =>
        [2, 1].map((k) =>
          versiones > 0.01 ? (
            <div key={`${y}${k}`} style={{ position: "absolute", left: XD - 120 + k * 22 * versiones, top: y - 120 - k * 22 * versiones, width: 240, height: 240, borderRadius: 40, background: C.panel2, border: `3px solid ${k === 1 ? C.acento : C.borde}`, opacity: Math.min(1, versiones) * (1 - ramp(t, T.gh - 0.2, T.gh + 0.2)) * (k === 1 ? 0.9 : 0.6) }} />
          ) : null,
        ),
      )}
      <Logo src={ep.logos.drive} x={XD} y={FA} w={220} t={t} at={T.drive - 0.05} pulsos={[T.archivos + 0.8]} />
      <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${1 - g2 * 0.6})`, transformOrigin: `${XD}px ${FB}px` }}>
        <Logo src={ep.logos.github} x={XD} y={FB} w={215} ficha="circulo" t={t} at={T.github - 0.05} pulsos={[T.archivos + 0.8]} />
      </div>

      {/* los dos guardan archivos y versiones, y te dejan compartirlos */}
      {t > T.archivos && t < T.archivos + 1.0 && (
        <>
          <Paquete curva={FLECHA_A} u={EASE(viaje(T.archivos))} size={90} opacity={1 - ramp(t, T.archivos + 0.7, T.archivos + 0.95)} />
          <Paquete curva={FLECHA_B} u={EASE(viaje(T.archivos + 0.08))} size={90} opacity={1 - ramp(t, T.archivos + 0.75, T.archivos + 1.0)} />
        </>
      )}
      <Etiqueta texto="ARCHIVOS" x={240} y={DIV} t={t} at={T.archivos - 0.1} out={salidaDiv} size={30} variante="borde" />
      <Etiqueta texto="VERSIONES" x={540} y={DIV} t={t} at={T.versiones - 0.1} out={salidaDiv} size={30} variante="borde" />
      <Etiqueta texto="COMPARTIR" x={850} y={DIV} t={t} at={T.compartir - 0.1} out={salidaDiv} size={30} variante="acento" />
      {[FA, FB].map((y) =>
        [-1, 0, 1].map((k) => {
          const at = T.compartir + 0.1 + (k + 1) * 0.08;
          const v = vis(t, at, salidaDiv, 0.4);
          if (!v.on) return null;
          const px = 1010;
          const py = y + k * 95;
          const p = ramp(t, at - 0.1, at + 0.3);
          return (
            <React.Fragment key={`${y}${k}`}>
              <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: v.opacity }} width={1} height={1}>
                <line x1={XD + 115} y1={y} x2={XD + 115 + (px - 32 - XD - 115) * p} y2={y + (py - y) * p} stroke={C.acento} strokeWidth={4} strokeDasharray="8 9" />
              </svg>
              <div style={{ position: "absolute", left: px - 32, top: py - 32, width: 64, height: 64, borderRadius: "50%", background: C.panel2, border: `4px solid ${C.acento}`, opacity: v.opacity, transform: `scale(${v.scale})`, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 12, width: 20, height: 20, borderRadius: "50%", background: C.gris }} />
                <div style={{ width: 38, height: 20, borderRadius: "19px 19px 0 0", background: C.gris }} />
              </div>
            </React.Fragment>
          );
        }),
      )}

      {/* GitHub lo compró Microsoft cuando ya existía */}
      <Caida src={ep.logos.microsoft} x={XD} y={FB - 170} w={220} t={t} aterriza={T.ms2} out={hasta + 0.4} />
      <Sello texto="YA EXISTÍA" x={XD - 30} y={FB + 190} t={t} at={T.existia} out={hasta + 0.4} size={54} rot={-5} />
      <Etiqueta texto="Más adelante lo vemos a fondo" x={540} y={DIV} t={t} at={T.mas} out={hasta + 0.3} size={40} variante="borde" fuente="titulo" />
    </Escena>
  );
};

export const eventosAnalogia = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.word - 0.15, sfx: "pop", vol: 0.45 },
    { t: T.abres, sfx: "tecleo", vol: 0.18, dur: 1.2 },
    { t: T.vsc - 0.1, sfx: "pop", vol: 0.45 },
    { t: T.ms1, sfx: "golpe", vol: 0.6 },
    { t: T.wordA, sfx: "whoosh", vol: 0.25 },
    { t: T.drive - 0.05, sfx: "pop", vol: 0.45 },
    { t: T.vscB + 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.github - 0.05, sfx: "pop", vol: 0.45 },
    { t: T.archivos, sfx: "whoosh", vol: 0.25 },
    { t: T.versiones, sfx: "pop", vol: 0.35 },
    { t: T.compartir, sfx: "tick", vol: 0.35 },
    { t: T.ms2, sfx: "golpe", vol: 0.6 },
    { t: T.existia + 0.12, sfx: "golpe", vol: 0.45 },
  ];
};
