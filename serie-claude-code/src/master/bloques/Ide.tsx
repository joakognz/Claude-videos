/**
 * Bloque «¿Qué es?» (escenas ide → escribir): logo + «¿Qué es?» → editor en el que se ve el código que se escribe →
 * «IDE» con golpe, que se despliega letra a letra en Integrated / Development / Environment, con la traducción que
 * dice la voz debajo → vuelta al editor: lo abres y escribes en lenguaje de programación.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Logo } from "../componentes/Logo";
import { Editor } from "../componentes/Piezas";
import { Etiqueta } from "../componentes/Sello";
import { C, EASE, TITULO, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const SIGLA = [
  { letra: "I", palabra: "Integrated" },
  { letra: "D", palabra: "Development" },
  { letra: "E", palabra: "Environment" },
];
const TRADUCCION = ["entorno", "de", "desarrollo", "integrado"];
const FILAS = [2330, 2480, 2630];
const IZQ = 215;

const tiempos = (L: Linea) => ({
  que: L.en("ide", "qué"),
  programa: L.en("ide", "programa"),
  ver: L.en("ide", "ver"),
  su: L.en("ide", "Su"),
  nombre: L.en("ide", "nombre"),
  ide: L.en("ide", "IDE:"),
  entorno: L.en("ide", "entorno"),
  trad: TRADUCCION.map((w) => L.en("ide", w)),
  finIde: L.fin("ide"),
  abres: L.en("escribir", "abres"),
  escribes: L.en("escribir", "escribes"),
  lenguaje: L.en("escribir", "lenguaje"),
  finEscribir: L.fin("escribir"),
});

export const Ide: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 880, z: 1.12 },
    { t: T.programa - 0.25, x: 540, y: 1330, z: 0.98, d: 1.0 },
    { t: T.ver - 0.2, x: 540, y: 1480, z: 1.06, d: 1.0 },
    { t: T.su - 0.15, x: 540, y: 2380, z: 1.08, d: 1.0 },
    { t: T.ide - 0.1, x: 540, y: 2450, z: 1.22, d: 0.7 },
    { t: T.entorno - 0.15, x: 540, y: 2560, z: 1.0, d: 0.9 },
    { t: T.finIde + 0.05, x: 540, y: 1420, z: 1.08, d: 1.1 },
    { t: T.lenguaje - 0.3, x: 540, y: 1560, z: 1.12, d: 0.9 },
  ];
  // líneas de código: se escriben mientras la voz habla de programar y luego al «escribes»
  const lineas = 1 + 5 * ramp(t, T.programa, T.su, (x) => x) + 5 * ramp(t, T.escribes, T.finEscribir + 0.2, (x) => x);
  const vEd = vis(t, T.programa - 0.1, Infinity, 0.85);
  const abre = t > T.abres ? Math.sin(clamp01((t - T.abres) / 0.35) * Math.PI) * 0.04 : 0;
  // IDE → despliegue
  const despliega = ramp(t, T.entorno - 0.1, T.entorno + 0.45, EASE);
  return (
    <Escena t={t} tomas={tomas}>
      <Logo src={ep.logos.vscode} x={540} y={700} w={150} t={t} at={T.que - 0.25} out={T.programa + 0.5} />
      <Etiqueta texto="¿Qué es?" x={540} y={905} t={t} at={T.que - 0.1} out={T.programa + 0.6} size={128} variante="texto" fuente="titulo" />

      {vEd.on && (
        <div style={{ position: "absolute", left: 70, top: 1120, opacity: vEd.opacity, transform: `translateY(${vEd.y}px) scale(${vEd.scale * (1 + abre)})`, transformOrigin: "50% 50%" }}>
          <Editor w={940} h={600} t={t} lineas={lineas} logo={ep.logos.vscode} pestanaActiva={t > T.abres ? 1 : 0} />
        </div>
      )}
      <Etiqueta texto="VER LO QUE ESTÁS PROGRAMANDO" x={540} y={1800} t={t} at={T.ver} out={T.su + 0.2} size={36} variante="borde" />
      <Etiqueta texto="LENGUAJE DE PROGRAMACIÓN" x={540} y={1800} t={t} at={T.lenguaje} out={hasta + 0.3} size={40} variante="acento" />

      <Etiqueta texto="NOMBRE TÉCNICO" x={540} y={2190} t={t} at={T.nombre - 0.05} out={T.finIde + 0.3} size={36} variante="gris" />
      {SIGLA.map((s, i) => {
        const at = T.ide + i * 0.07;
        const e = sp(t, at, { damping: 11, stiffness: 240 });
        if (t < at) return null;
        const fuera = ramp(t, T.finIde + 0.05, T.finIde + 0.4);
        // posición A (en fila, grande) → B (columna, a la izquierda)
        const ax = 330 + i * 210;
        const ay = 2450;
        const bx = IZQ + 38;
        const by = FILAS[i];
        const x = ax + (bx - ax) * despliega;
        const y = ay + (by - ay) * despliega;
        const size = 300 + (120 - 300) * despliega;
        return (
          <div key={s.letra} style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: Math.min(1, e * 2) * (1 - fuera) * (despliega > 0.98 ? 0 : 1) }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${(1.6 - 0.6 * e)})`, fontFamily: TITULO, fontWeight: 800, fontSize: size, color: despliega > 0 ? C.acento : C.texto, lineHeight: 1, textShadow: `0 0 ${40 * (1 - despliega)}px ${C.acento}66` }}>{s.letra}</div>
          </div>
        );
      })}
      {despliega > 0.95 &&
        SIGLA.map((s, i) => {
          const a = T.entorno + 0.35 + i * 0.42;
          const n = Math.round(clamp01((t - a) / 0.42) * (s.palabra.length - 1));
          const fuera = ramp(t, T.finIde + 0.05, T.finIde + 0.4);
          return (
            <div key={s.palabra} style={{ position: "absolute", left: IZQ, top: FILAS[i] - 66, height: 132, display: "flex", alignItems: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 120, lineHeight: 1, opacity: 1 - fuera, whiteSpace: "nowrap" }}>
              <span style={{ color: C.acento }}>{s.letra}</span>
              <span style={{ color: C.texto, fontSize: 96 }}>{s.palabra.slice(1, 1 + n)}</span>
              {n < s.palabra.length - 1 && t > a && <span style={{ display: "inline-block", width: 6, height: 90, marginLeft: 6, background: C.acento }} />}
            </div>
          );
        })}
      <div style={{ position: "absolute", left: 540, top: 2800, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 700, fontSize: 52, color: C.acentoSuave }}>
          {TRADUCCION.map((w, i) => {
            const s = sp(t, T.trad[i] - 0.03, { damping: 14, stiffness: 240 });
            const fuera = ramp(t, T.finIde + 0.05, T.finIde + 0.4);
            return (
              <span key={w} style={{ display: "inline-block", marginRight: 16, opacity: Math.min(1, s * 1.6) * (1 - fuera), transform: `translateY(${(1 - s) * 24}px)` }}>
                {i === 0 ? "Entorno" : w}
              </span>
            );
          })}
        </div>
      </div>
    </Escena>
  );
};

export const eventosIde = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.que - 0.1, sfx: "pop", vol: 0.4 },
    { t: T.programa, sfx: "tecleo", vol: 0.22, dur: Math.min(1.6, T.su - T.programa) },
    { t: T.ide + 0.08, sfx: "golpe", vol: 0.55 },
    { t: T.entorno - 0.05, sfx: "whoosh", vol: 0.3 },
    { t: T.abres, sfx: "pop", vol: 0.35 },
    { t: T.escribes, sfx: "tecleo", vol: 0.25, dur: Math.min(1.8, T.finEscribir - T.escribes) },
    { t: T.lenguaje, sfx: "pop", vol: 0.35 },
  ];
};
