/**
 * EP.13 · Gancho (escena gancho): las 13 casillas del módulo 1 se encienden → sello MÓDULO 1 ✓ con el logo de AIgencyx
 * → ¿ACABAS DE LLEGAR? → EMPIEZA AQUÍ → el cronómetro: todo el módulo en 2 minutos → tres cartas boca abajo: DECIDES TÚ.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Caja } from "../../componentes/ep12/Piezas12";
import { Carta, FilaModulo } from "../../componentes/ep13/Piezas13";
import { ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "gancho";
const YA = 1060;
const YB = 1960;
const YC = 2860;

const tiempos = (L: Linea) => ({
  hoy: L.en(E, "Hoy"),
  cerramos: L.en(E, "cerramos"),
  modulo: L.en(E, "módulo"),
  uno: L.en(E, "1."),
  si: L.en(E, "Si"),
  acabas: L.en(E, "acabas"),
  mejor: L.en(E, "mejor"),
  empezar: L.en(E, "empezar:"),
  todo: L.en(E, "todo"),
  modulo2: L.en(E, "módulo", 1),
  par: L.en(E, "par"),
  minutos: L.en(E, "minutos."),
  y: L.en(E, "Y al final"),
  final: L.en(E, "final,"),
  decides: L.en(E, "decides"),
  viene: L.en(E, "viene."),
});

export const Gancho13: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: YA, z: 1.0 },
    { t: T.si - 0.25, x: 540, y: YB, z: 1.0, d: 0.8 },
    { t: T.y - 0.25, x: 540, y: YC, z: 1.0, d: 0.8 },
  ];
  const salto = (i: number) => {
    const at = T.viene + i * 0.1;
    return t > at ? -Math.sin(Math.min(1, sp(t, at, { damping: 9, stiffness: 260 })) * Math.PI) * 40 : 0;
  };
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── módulo 1 cerrado ── */}
      <FilaModulo x={540} y={YA - 170} n={13} celda={60} hueco={10} t={t} enciende={(k) => T.hoy - 0.15 + k * 0.055} check={(k) => T.modulo + 0.2 + k * 0.03} opacity={1 - ramp(t, T.si, T.si + 0.5)} />
      <Sello texto="MÓDULO 1 ✓" x={540} y={YA} t={t} at={T.modulo} out={T.si + 0.5} size={78} rot={-4} />
      <Logo src={ep.logos.aigencyx} x={540} y={YA + 210} w={210} t={t} at={T.uno} out={T.si + 0.5} pulsos={[T.uno + 0.3]} />

      {/* ── si acabas de llegar ── */}
      <Etiqueta texto="¿ACABAS DE LLEGAR?" x={540} y={YB - 260} t={t} at={T.acabas - 0.05} out={T.y + 0.5} size={50} variante="borde" fuente="titulo" />
      <Sello texto="EMPIEZA AQUÍ" x={540} y={YB - 110} t={t} at={T.mejor} out={T.y + 0.5} size={66} rot={3} resalte={sp(t, T.empezar, { damping: 12 }) * 1} />
      <Caja x={330} y={YB + 120} t={t} at={T.todo - 0.05} out={T.y + 0.5} desde={0.3} rot={-8}>
        <Img src={staticFile(ep.imagenes!.cronometro)} style={{ width: 250, display: "block", filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))", transform: `rotate(${Math.sin(t * 9) * (t > T.par ? 4 : 0)}deg)` }} />
      </Caja>
      <Etiqueta texto="TODO EL MÓDULO" x={730} y={YB + 60} t={t} at={T.modulo2 - 0.05} out={T.y + 0.5} size={42} variante="texto" fuente="titulo" />
      <Etiqueta texto="EN 2 MINUTOS" x={730} y={YB + 170} t={t} at={T.par} out={T.y + 0.5} size={50} variante="acento" fuente="titulo" />

      {/* ── decides tú ── */}
      <Etiqueta texto="DECIDES TÚ" x={540} y={YC - 330} t={t} at={T.decides} size={64} variante="acento" fuente="titulo" />
      {[0, 1, 2].map((i) => (
        <Caja key={i} x={[225, 540, 855][i]} y={YC + 60 + salto(i)} t={t} at={T.final - 0.1 + i * 0.12} rot={[-7, 0, 7][i]} desde={0.4}>
          <Carta w={250} giro={0} img={ep.imagenes!.web} />
        </Caja>
      ))}
    </Escena>
  );
};

export const eventosGancho13 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.hoy, sfx: "whoosh", vol: 0.3 },
    { t: T.modulo, sfx: "golpe", vol: 0.5 },
    { t: T.uno, sfx: "pop", vol: 0.4 },
    { t: T.si - 0.25, sfx: "whoosh", vol: 0.25 },
    { t: T.acabas - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.mejor, sfx: "golpe", vol: 0.4 },
    { t: T.todo - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.par, sfx: "tick", vol: 0.5 },
    { t: T.y - 0.25, sfx: "whoosh", vol: 0.25 },
    { t: T.final - 0.1, sfx: "pop", vol: 0.3 },
    { t: T.decides, sfx: "golpe", vol: 0.4 },
    { t: T.viene, sfx: "tick", vol: 0.4 },
  ];
};
