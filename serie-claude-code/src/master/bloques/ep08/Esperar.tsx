/**
 * EP.8 · PASO 3: los que se arreglan esperando (escenas paso3 → e429 → e529 → e500).
 * 429: ESPERE SU TURNO, la máquina de turnos escupe papeles hasta que se bloquea → LÍMITE DE USO → espera y sale tu
 * turno → depende de tu plan (pantalla de límites, sin cifras). 529: AFORO COMPLETO, cola y servidor de Anthropic al
 * 100 % → NO ES CULPA TUYA. 500: CERRADO POR AVERÍA, chispas en el servidor → REINTENTA.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Cartel, caraCodigo } from "../../componentes/ep08/Cartel";
import { Aforo, Cola, IcoReintentar, LlaveInglesa, Pieza, Pildora, RelojArena, Servidor, Turnos } from "../../componentes/ep08/Dibujos";
import { LimitesUso } from "../../componentes/ep08/Pantallas";
import { C } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const tiempos = (L: Linea) => ({
  paso: L.en("paso3", "Paso"),
  arreglan: L.en("paso3", "arreglan"),
  esperando: L.en("paso3", "esperando."),
  c429: L.en("e429", "429:"),
  espere: L.en("e429", "espere"),
  demasiado: L.en("e429", "demasiado"),
  limite: L.en("e429", "límite"),
  espera: L.en("e429", "Espera"),
  sigue: L.en("e429", "sigue."),
  ese: L.en("e429", "Ese"),
  plan: L.en("e429", "plan"),
  c529: L.en("e529", "529:"),
  aforo: L.en("e529", "aforo"),
  completo: L.en("e529", "completo."),
  servidores: L.en("e529", "servidores"),
  anthropic: L.en("e529", "Anthropic"),
  saturados: L.en("e529", "saturados."),
  culpa: L.en("e529", "No"),
  vuelve: L.en("e529", "espera"),
  c500: L.en("e500", "500:"),
  averia: L.en("e500", "avería."),
  cerrado: L.en("e500", "cerrado"),
  fallo: L.en("e500", "fallo"),
  anthropic2: L.en("e500", "Anthropic."),
  reintenta: L.en("e500", "Reintenta."),
});

const SRV = { x: 700, y: 2050 };

export const Esperar: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 960, z: 1.0 },
    { t: T.c429 - 0.55, x: 540, y: 1830, z: 0.95, d: 1.0 },
    { t: T.plan - 0.3, x: 540, y: 1880, z: 0.99, d: 0.9 },
    { t: T.c529 - 0.2, x: 560, y: 1850, z: 0.93, d: 0.9 },
    { t: T.culpa - 0.2, x: 560, y: 1900, z: 0.95, d: 0.9 },
    { t: T.c500 - 0.2, x: 540, y: 1860, z: 0.97, d: 0.9 },
  ];
  const fueraCab = T.c429 - 0.2;
  const fuera429 = T.ese - 0.05;
  const fueraPlan = T.c529 - 0.1;
  const fuera529 = T.c500 - 0.05;
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── cabecera ── */}
      <Sello texto="PASO 3" x={540} y={780} t={t} at={T.paso} out={fueraCab} size={60} rot={-5} />
      <Etiqueta texto="SE ARREGLA ESPERANDO" x={540} y={950} t={t} at={T.arreglan - 0.1} out={fueraCab} size={54} variante="texto" fuente="titulo" />
      <Pieza x={540} y={1170} t={t} at={T.esperando - 0.15} out={fueraCab}>
        <RelojArena t={t} at={T.esperando} s={130} />
      </Pieza>

      {/* ── el cartel ── */}
      <Cartel
        x={540} y={1300} w={520} t={t} entra={T.c429 - 0.35}
        caras={[
          { at: 0, cara: caraCodigo("429", "ESPERE SU TURNO", "rate_limit_error") },
          { at: T.c529 - 0.05, cara: caraCodigo("529", "AFORO COMPLETO", "overloaded_error") },
          { at: T.c500 - 0.05, cara: caraCodigo("500", "CERRADO POR AVERÍA", "api_error") },
        ]}
        out={hasta + 0.4}
      />

      {/* ── 429 ── */}
      <Pieza x={540} y={2030} t={t} at={T.espere - 0.1} out={fuera429}>
        <Turnos t={t} rapido={T.demasiado - 0.1} para={T.limite} sigue={T.sigue - 0.15} />
      </Pieza>
      <Etiqueta texto="LÍMITE DE USO" x={540} y={2300} t={t} at={T.limite} out={T.espera + 0.1} size={44} variante="acento" fuente="titulo" />
      <Etiqueta texto="ESPERA UN POCO Y SIGUE" x={540} y={2300} t={t} at={T.espera + 0.1} out={fuera429} size={40} variante="borde" fuente="titulo" />
      <Pieza x={540} y={2040} t={t} at={T.ese - 0.05} out={fueraPlan}>
        <LimitesUso t={t} at={T.ese} />
      </Pieza>
      <Etiqueta texto="DEPENDE DE TU PLAN" x={540} y={2320} t={t} at={T.plan - 0.05} out={fueraPlan} size={44} variante="acento" fuente="titulo" />

      {/* ── 529 y 500: el servidor de Anthropic ── */}
      <Pieza x={SRV.x} y={SRV.y} t={t} at={T.c529 + 0.3} out={hasta + 0.4}>
        <Servidor t={t} aforo={T.saturados - 0.6} averia={T.cerrado} />
      </Pieza>
      <Logo src={ep.logos.anthropic} x={250} y={1925} w={175} t={t} at={T.anthropic - 0.08} out={hasta + 0.4} pulsos={[T.anthropic2]} rot={-6} />
      <Pieza x={250} y={2150} t={t} at={T.aforo - 0.05} out={fuera529}>
        <Cola t={t} at={T.aforo - 0.05} n={4} />
      </Pieza>
      <Pieza x={960} y={2040} t={t} at={T.completo - 0.1} out={fuera529}>
        <Aforo t={t} at={T.completo - 0.05} />
      </Pieza>
      <Sello texto="NO ES CULPA TUYA" x={540} y={2340} t={t} at={T.culpa} out={T.vuelve - 0.05} size={54} rot={-3} />
      <Pieza x={540} y={2340} t={t} at={T.vuelve} out={fuera529}>
        <Pildora texto="ESPERA Y REINTENTA" icono={<IcoReintentar s={46} color={C.oscuro} />} size={38} />
      </Pieza>
      <Pieza x={330} y={2060} t={t} at={T.averia - 0.15} out={hasta + 0.4} rot={-20 + 25 * Math.sin(t * 4)}>
        <LlaveInglesa s={210} />
      </Pieza>
      <Etiqueta texto="FALLO INTERNO" x={540} y={2340} t={t} at={T.fallo - 0.05} out={T.reintenta - 0.05} size={44} variante="borde" fuente="titulo" />
      <Sello texto="REINTENTA" x={540} y={2340} t={t} at={T.reintenta} out={hasta + 0.3} size={60} rot={4} />
    </Escena>
  );
};

export const eventosEsperar = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.arreglan - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.c429 - 0.35, sfx: "whoosh", vol: 0.3 },
    { t: T.c429 - 0.1, sfx: "golpe", vol: 0.35 },
    { t: T.espere - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.demasiado - 0.1, sfx: "tecleo", vol: 0.25, dur: Math.max(0.3, T.limite - T.demasiado) },
    { t: T.limite, sfx: "golpe", vol: 0.4 },
    { t: T.sigue - 0.05, sfx: "tick", vol: 0.45 },
    { t: T.ese - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.c529 - 0.05, sfx: "whoosh", vol: 0.3 },
    { t: T.aforo, sfx: "pop", vol: 0.3 },
    { t: T.anthropic - 0.08, sfx: "pop", vol: 0.4 },
    { t: T.culpa + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.vuelve, sfx: "pop", vol: 0.35 },
    { t: T.c500 - 0.05, sfx: "whoosh", vol: 0.3 },
    { t: T.cerrado, sfx: "golpe", vol: 0.35 },
    { t: T.fallo - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.reintenta + 0.12, sfx: "golpe", vol: 0.5 },
  ];
};
