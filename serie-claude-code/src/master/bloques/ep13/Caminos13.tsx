/**
 * EP.13 · Tres caminos (escena giro): la caja de herramientas se cierra con un golpe (LAS HERRAMIENTAS ✓) → sube y se
 * hace pequeña: ahora, ALGO REAL → de ella salen tres caminos hacia tres cartas boca abajo, 1, 2 y 3.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Caja } from "../../componentes/ep12/Piezas12";
import { ArchivoClaude, CajaHerramientas, Carta, Ficha, PiezaCaja } from "../../componentes/ep13/Piezas13";
import { EASE, ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { CAJA } from "./Repaso13";

const E = "giro";
const XS = [215, 540, 865];
const Y_CARTA = 1330;

const tiempos = (L: Linea) => ({
  eso: L.en(E, "Eso"),
  herramientas: L.en(E, "herramientas."),
  ahora: L.en(E, "Ahora"),
  real: L.en(E, "real."),
  tienes: L.en(E, "Tienes"),
  tres: L.en(E, "3"),
  caminos: L.en(E, "caminos."),
});

export const Caminos13: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [{ t: desde - 1, x: 540, y: 1100, z: 1.0 }];
  const cierra = sp(t, T.eso, { damping: 13, stiffness: 200 });
  const golpe = t > T.eso + 0.25 ? Math.sin((t - T.eso - 0.25) * 22) * Math.exp(-(t - T.eso - 0.25) * 7) : 0;
  const sube = ramp(t, T.ahora, T.ahora + 0.7, EASE);
  const k = 1 - 0.45 * sube;
  const dy = -455 * sube;
  const yaDentro = desde - 5;
  const fondo = CAJA.y + 8;
  const miniLogo = (src: string, w: number) => (
    <Ficha s={200}>
      <Img src={staticFile(src)} style={{ width: w }} />
    </Ficha>
  );
  const finCaja = CAJA.y + dy + CAJA.w * 0.4 * k;
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: `${CAJA.x}px ${CAJA.y}px`, transform: `translateY(${dy}px) scale(${k})` }}>
        <CajaHerramientas x={CAJA.x} y={CAJA.y} w={CAJA.w} abre={1 - cierra} golpe={golpe}>
          <PiezaCaja t={t} at={yaDentro} cae={yaDentro} x0={330} y0={fondo} xf={330} yf={fondo} rot={-14}>{miniLogo(ep.logos.claude_code, 140)}</PiezaCaja>
          <PiezaCaja t={t} at={yaDentro} cae={yaDentro} x0={430} y0={fondo} xf={430} yf={fondo} rot={8}>{miniLogo(ep.logos.vscode, 130)}</PiezaCaja>
          <PiezaCaja t={t} at={yaDentro} cae={yaDentro} x0={520} y0={fondo - 10} xf={520} yf={fondo - 10} rot={-10}>
            <ArchivoClaude w={250} logo={ep.logos.claude} lineas={5} />
          </PiezaCaja>
          <PiezaCaja t={t} at={yaDentro} cae={yaDentro} x0={750} y0={fondo} xf={750} yf={fondo} rot={12}>{miniLogo(ep.logos.github_circulo, 140)}</PiezaCaja>
        </CajaHerramientas>
      </div>
      <Sello texto="LAS HERRAMIENTAS ✓" x={540} y={1030} t={t} at={T.herramientas} out={T.ahora + 0.2} size={50} rot={-3} />
      <Etiqueta texto="AHORA, ALGO REAL" x={540} y={1110} t={t} at={T.real - 0.15} out={T.tres - 0.05} size={54} variante="acento" fuente="titulo" />
      {XS.map((x, i) => (
        <Flecha
          key={i}
          curva={{ a: { x: 540, y: finCaja + 20 }, c: { x, y: finCaja + 40 }, b: { x, y: Y_CARTA - 215 } }}
          p={ramp(t, T.caminos - 0.1 + i * 0.08, T.caminos + 0.45 + i * 0.08)}
          discontinua
          ancho={8}
        />
      ))}
      {XS.map((x, i) => (
        <Caja key={`c${i}`} x={x} y={Y_CARTA} t={t} at={T.tres - 0.05 + i * 0.12} rot={[-5, 0, 5][i]} desde={0.4}>
          <Carta w={230} giro={0} numero={i + 1} img={ep.imagenes!.web} />
        </Caja>
      ))}
    </Escena>
  );
};

export const eventosCaminos13 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.eso + 0.2, sfx: "golpe", vol: 0.5 },
    { t: T.herramientas, sfx: "pop", vol: 0.35 },
    { t: T.ahora, sfx: "whoosh", vol: 0.3 },
    { t: T.real - 0.15, sfx: "pop", vol: 0.35 },
    { t: T.tres - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.tres + 0.07, sfx: "pop", vol: 0.3 },
    { t: T.tres + 0.19, sfx: "pop", vol: 0.3 },
    { t: T.caminos, sfx: "whoosh", vol: 0.25 },
  ];
};
