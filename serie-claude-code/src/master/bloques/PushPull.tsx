/**
 * Bloque «PUSH / PULL» (escenas acciones → push → pull → bucle → esquema): VS Code a la izquierda, GitHub a la
 * derecha y dos flechas curvas. PUSH: los paquetes suben por la de arriba. PULL: el paquete vuelve por la de abajo.
 * Después las dos funcionan en bucle con las etiquetas resaltadas al nombrarlas, y la cámara se aleja hasta el
 * esquema completo (Word y Drive tenues), parándose en cada cosa que se nombra.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Flecha } from "../componentes/Flecha";
import { Anillo, Logo } from "../componentes/Logo";
import { Paquete } from "../componentes/Paquete";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE, clamp01, ramp } from "../nucleo";
import type { Curva, Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const FY = 1300;
const XV = 220;
const XG = 860;
const ARRIBA: Curva = { a: { x: 360, y: FY - 110 }, c: { x: 540, y: FY - 280 }, b: { x: 720, y: FY - 110 } };
const ABAJO: Curva = { a: { x: 720, y: FY + 110 }, c: { x: 540, y: FY + 280 }, b: { x: 360, y: FY + 110 } };
const Y_PUSH = FY - 300;
const Y_PULL = FY + 300;
const Y_TENUE = 700;

const tiempos = (L: Linea) => ({
  imp: L.en("acciones", "lo"),
  dos: L.en("acciones", "Dos"),
  subir: L.en("push", "Subir"),
  archivos: L.en("push", "archivos"),
  vsc: L.en("push", "Visual"),
  gh1: L.en("push", "GitHub"),
  push: L.en("push", "PUSH."),
  sacar: L.en("pull", "Sacar"),
  proyecto: L.en("pull", "proyecto"),
  gh2: L.en("pull", "GitHub"),
  pull: L.en("pull", "PULL."),
  bPush: L.en("bucle", "PUSH,"),
  bPull: L.en("bucle", "PULL,"),
  finBucle: L.fin("bucle"),
  eso: L.en("esquema", "Eso"),
  arq: L.en("esquema", "arquitectura"),
  escribes: L.en("esquema", "escribes"),
  guardas: L.en("esquema", "guardas"),
  recuperas: L.en("esquema", "recuperas"),
  finEsquema: L.fin("esquema"),
});

/** Sube a 1 en a y baja a 0 en b. */
const tramo = (t: number, a: number, b: number) => ramp(t, a, a + 0.2) * (1 - ramp(t, b - 0.25, b));

export const PushPull: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1280, z: 1.1 },
    { t: T.subir - 0.35, x: 540, y: FY, z: 0.95, d: 0.9 },
    { t: T.archivos - 0.1, x: 540, y: FY - 120, z: 1.1, d: 1.0 },
    { t: T.push - 0.3, x: 540, y: FY - 160, z: 1.1, d: 0.9 },
    { t: T.sacar - 0.15, x: 540, y: FY + 120, z: 1.1, d: 1.0 },
    { t: T.pull - 0.3, x: 540, y: FY + 160, z: 1.1, d: 0.9 },
    { t: T.bPush - 0.15, x: 540, y: FY, z: 0.92, d: 1.0 },
    { t: T.eso - 0.1, x: 540, y: 1220, z: 0.78, d: 1.4 },
    { t: T.escribes - 0.2, x: 330, y: FY, z: 1.08, d: 0.9 },
    { t: T.guardas - 0.2, x: 750, y: FY, z: 1.08, d: 1.0 },
    { t: T.recuperas - 0.2, x: 540, y: FY + 150, z: 1.0, d: 0.9 },
    { t: T.finEsquema - 0.3, x: 540, y: 1220, z: 0.8, d: 1.2 },
  ];
  const pArriba = ramp(t, T.subir - 0.05, T.subir + 0.7, EASE);
  const pAbajo = ramp(t, T.sacar - 0.05, T.sacar + 0.6, EASE);
  const bucle = T.bPush - 0.15;
  const resPush = Math.max(tramo(t, T.bPush, T.bPull), tramo(t, T.guardas, T.recuperas));
  const resPull = Math.max(tramo(t, T.bPull, T.finBucle + 0.35), tramo(t, T.recuperas, T.finEsquema + 0.6));
  const llegadaPush = T.archivos + 0.15 + 2 * 0.3 + 1.3;
  const llegadaPull = T.proyecto + 0.1 + 1.2;
  return (
    <Escena t={t} tomas={tomas}>
      {/* lo importante: dos acciones */}
      <Etiqueta texto="LO IMPORTANTE" x={540} y={1230} t={t} at={T.imp - 0.05} out={T.subir - 0.05} size={104} variante="texto" fuente="titulo" />
      <Etiqueta texto="DOS ACCIONES" x={540} y={1390} t={t} at={T.dos - 0.05} out={T.subir - 0.05} size={48} variante="acento" fuente="titulo" />

      {/* esquema: Word y Drive tenues arriba */}
      <Logo src={ep.logos.word} x={XV} y={Y_TENUE} w={150} t={t} at={T.eso} tenue={0.3} sombra={false} />
      <Logo src={ep.logos.drive} x={XG} y={Y_TENUE} w={150} t={t} at={T.eso + 0.1} tenue={0.3} sombra={false} />
      <Flecha curva={{ a: { x: 330, y: Y_TENUE }, c: { x: 540, y: Y_TENUE - 40 }, b: { x: 750, y: Y_TENUE } }} p={ramp(t, T.eso + 0.1, T.eso + 0.7)} color={C.tenue} ancho={7} opacity={0.6} />
      <Etiqueta texto="TU ARQUITECTURA DE TRABAJO" x={540} y={1760} t={t} at={T.arq - 0.1} out={T.escribes - 0.05} size={46} variante="borde" fuente="titulo" />
      <Etiqueta texto="TU ARQUITECTURA DE TRABAJO" x={540} y={1760} t={t} at={T.finEsquema - 0.2} out={hasta + 0.4} size={46} variante="borde" fuente="titulo" />

      {/* flechas */}
      <Flecha curva={ARRIBA} p={pArriba} ancho={12} brillo={resPush} />
      <Flecha curva={ABAJO} p={pAbajo} ancho={12} brillo={resPull} />

      {/* logos */}
      <Logo src={ep.logos.vscode} x={XV} y={FY} w={230} t={t} at={T.subir - 0.15} pulsos={[T.vsc, llegadaPull, T.escribes]} />
      <Logo src={ep.logos.github} x={XG} y={FY} w={225} ficha="circulo" t={t} at={T.subir} pulsos={[T.gh1, llegadaPush, T.gh2, T.guardas]} />
      <Anillo x={XV} y={FY} r={160} t={t} at={T.escribes} out={T.guardas} />
      <Anillo x={XG} y={FY} r={160} t={t} at={T.guardas} out={T.recuperas} />
      <Anillo x={XV} y={FY} r={160} t={t} at={T.recuperas + 0.4} out={hasta + 0.3} />

      {/* PUSH: tres paquetes por arriba */}
      {t < bucle &&
        [0, 1, 2].map((k) => {
          const a = T.archivos + 0.15 + k * 0.3;
          const u = clamp01((t - a) / 1.3);
          if (t < a || u >= 1) return null;
          return <Paquete key={k} curva={ARRIBA} u={EASE(u)} size={100 - k * 8} opacity={Math.min(1, u * 6) * (1 - ramp(t, a + 1.15, a + 1.3))} />;
        })}
      {/* PULL: el paquete vuelve por abajo */}
      {t < bucle &&
        (() => {
          const a = T.proyecto + 0.1;
          const u = clamp01((t - a) / 1.2);
          if (t < a || u >= 1) return null;
          return <Paquete curva={ABAJO} u={EASE(u)} size={110} opacity={Math.min(1, u * 6) * (1 - ramp(t, a + 1.05, a + 1.2))} />;
        })()}
      {/* bucle: las dos flechas funcionando */}
      {t >= bucle &&
        [0, 1].flatMap((k) => {
          const per = 1.5;
          const uA = ((((t - bucle) / per + k / 2) % 1) + 1) % 1;
          const uB = ((((t - bucle) / per + k / 2 + 0.25) % 1) + 1) % 1;
          const entra = ramp(t, bucle, bucle + 0.3);
          const borde = (u: number) => Math.min(1, u / 0.08, (1 - u) / 0.1);
          return [
            <Paquete key={`a${k}`} curva={ARRIBA} u={EASE(uA)} size={86} opacity={entra * borde(uA) * (0.55 + 0.45 * resPush)} />,
            <Paquete key={`b${k}`} curva={ABAJO} u={EASE(uB)} size={86} opacity={entra * borde(uB) * (0.55 + 0.45 * resPull)} />,
          ];
        })}

      {/* etiquetas */}
      <Sello texto="PUSH = SUBIR" x={540} y={Y_PUSH} t={t} at={T.push} out={hasta + 0.4} size={58} rot={-3} resalte={resPush} />
      <Sello texto="PULL = SACAR" x={540} y={Y_PULL} t={t} at={T.pull} out={hasta + 0.4} size={58} rot={3} resalte={resPull} />
      <Etiqueta texto="ESCRIBES" x={XV} y={FY + 205} t={t} at={T.escribes} out={T.recuperas - 0.05} size={32} variante="acento" />
      <Etiqueta texto="GUARDAS" x={XG} y={FY + 205} t={t} at={T.guardas} out={hasta + 0.4} size={32} variante="acento" />
      <Etiqueta texto="RECUPERAS" x={XV} y={FY + 205} t={t} at={T.recuperas} out={hasta + 0.4} size={32} variante="acento" />
    </Escena>
  );
};

export const eventosPushPull = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.imp, sfx: "pop", vol: 0.4 },
    { t: T.dos, sfx: "pop", vol: 0.4 },
    { t: T.subir - 0.15, sfx: "pop", vol: 0.35 },
    { t: T.archivos + 0.15, sfx: "whoosh", vol: 0.3 },
    { t: T.archivos + 0.15 + 0.6 + 1.25, sfx: "tick", vol: 0.4 },
    { t: T.push + 0.1, sfx: "golpe", vol: 0.6 },
    { t: T.proyecto + 0.1, sfx: "whoosh", vol: 0.3 },
    { t: T.proyecto + 0.1 + 1.15, sfx: "tick", vol: 0.4 },
    { t: T.pull + 0.1, sfx: "golpe", vol: 0.6 },
    { t: T.bPush, sfx: "tick", vol: 0.35 },
    { t: T.bPull, sfx: "tick", vol: 0.35 },
    { t: T.eso, sfx: "whoosh", vol: 0.25 },
    { t: T.arq, sfx: "pop", vol: 0.35 },
  ];
};
