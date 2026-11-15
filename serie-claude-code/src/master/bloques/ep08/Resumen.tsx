/**
 * EP.8 · Resumen (escena resumen): vuelta a la puerta de la floristería. El cartel gira con la voz: un número →
 * RESPIRA, CONEXIÓN o CUENTA; SIN NÚMERO → REFORMULA; y al final gira a ABIERTO mientras la cámara se aleja.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Cartel, caraCodigo, caraTexto } from "../../componentes/ep08/Cartel";
import { IcoConexion, IcoCuenta, Pieza, Pildora } from "../../componentes/ep08/Dibujos";
import { C } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { CLAVO, Escaparate } from "./Tienda";

const E = "resumen";
const tiempos = (L: Linea) => ({
  numero: L.en(E, "número,"),
  respira: L.en(E, "respira,"),
  conexion: L.en(E, "conexión"),
  cuenta: L.en(E, "cuenta."),
  hay: L.en(E, "hay"),
  reformula: L.en(E, "reformula"),
  pides: L.en(E, "pides."),
  fin: L.fin(E),
});

export const Resumen: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const abierto = T.reformula + 0.65;
  const tomas: Toma[] = [
    { t: desde - 1, x: CLAVO.x - 40, y: CLAVO.y + 170, z: 1.55 },
    { t: T.numero - 0.3, x: CLAVO.x - 50, y: CLAVO.y + 150, z: 1.75, d: 0.9 },
    { t: T.hay - 0.3, x: CLAVO.x - 30, y: CLAVO.y + 170, z: 1.7, d: 0.8 },
    { t: abierto - 0.1, x: CLAVO.x - 110, y: CLAVO.y + 240, z: 1.2, d: 1.0 },
  ];
  const fueraNum = T.hay - 0.1;
  return (
    <Escena t={t} tomas={tomas}>
      <Escaparate src={ep.imagenes?.floristeria ?? ""} t={t} at={desde - 0.6} />
      <Cartel
        x={CLAVO.x} y={CLAVO.y} w={172} t={t} entra={desde - 0.6} sinCaida
        caras={[
          { at: 0, cara: caraTexto("???", "ERROR") },
          { at: T.numero - 0.05, cara: caraCodigo("529", "RESPIRA") },
          { at: T.hay - 0.05, cara: caraTexto("SIN NÚMERO") },
          { at: abierto, cara: caraTexto("ABIERTO", undefined, "#B44E33") },
        ]}
      />
      <Etiqueta texto="¿VES UN NÚMERO?" x={CLAVO.x - 40} y={CLAVO.y - 50} t={t} at={T.numero - 0.1} out={fueraNum} size={22} variante="borde" fuente="titulo" />
      <Etiqueta texto="RESPIRA" x={CLAVO.x - 185} y={CLAVO.y + 110} t={t} at={T.respira - 0.05} out={fueraNum} size={24} variante="acento" fuente="titulo" />
      <Pieza x={CLAVO.x - 60} y={CLAVO.y + 235} t={t} at={T.conexion - 0.05} out={fueraNum}>
        <Pildora texto="CONEXIÓN" icono={<IcoConexion s={20} color={C.oscuro} />} size={17} />
      </Pieza>
      <Pieza x={CLAVO.x + 80} y={CLAVO.y + 280} t={t} at={T.cuenta - 0.05} out={fueraNum}>
        <Pildora texto="CUENTA" icono={<IcoCuenta s={20} color={C.oscuro} />} size={17} />
      </Pieza>
      <Etiqueta texto="¿SIN NÚMERO?" x={CLAVO.x - 40} y={CLAVO.y - 50} t={t} at={T.hay - 0.05} out={abierto - 0.1} size={22} variante="borde" fuente="titulo" />
      <Sello texto="REFORMULA" x={CLAVO.x - 20} y={CLAVO.y + 250} t={t} at={T.reformula} out={abierto} size={28} rot={-4} />
    </Escena>
  );
};

export const eventosResumen = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.numero - 0.05, sfx: "whoosh", vol: 0.25 },
    { t: T.respira - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.conexion - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.cuenta - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.hay - 0.05, sfx: "whoosh", vol: 0.25 },
    { t: T.reformula + 0.12, sfx: "golpe", vol: 0.45 },
    { t: T.reformula + 0.65, sfx: "tick", vol: 0.5 },
  ];
};
