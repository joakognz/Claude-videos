/**
 * EP.8 · La tienda (escenas tienda → paso1): la floristería (ilustración adjunta) → cae un cartel en su puerta → la
 * cámara se acerca → el cartel no riñe: dice QUÉ PASA y QUÉ HACER → PASO 1: ¿trae número? → SÍ: casi nunca es tu
 * proyecto (carpeta con ✓), es la CONEXIÓN o tu CUENTA. NO: paso 4.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Cartel, caraTexto } from "../../componentes/ep08/Cartel";
import { Carpeta, Check, IcoConexion, IcoCuenta, IcoLupa, Pieza, Pildora } from "../../componentes/ep08/Dibujos";
import { C, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

/** La ilustración (1080 x 1920) a 900 px de ancho; la ventana de la puerta va de (712, 738) a (915, 1072). */
export const TIENDA = { x0: 90, y0: 160, w: 900, s: 900 / 1080 };
export const enTienda = (px: number, py: number) => ({ x: TIENDA.x0 + px * TIENDA.s, y: TIENDA.y0 + py * TIENDA.s });
export const CLAVO = enTienda(813, 770);

export const Escaparate: React.FC<{ src: string; t: number; at: number; out?: number }> = ({ src, t, at, out }) => {
  const v = vis(t, at, out, 0.88);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: TIENDA.x0, top: TIENDA.y0, width: TIENDA.w, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, transformOrigin: "50% 60%", borderRadius: 40, overflow: "hidden", border: `4px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}>
      <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
    </div>
  );
};

const tiempos = (L: Linea) => ({
  piensa: L.en("tienda", "Piensa"),
  numero: L.en("tienda", "número"),
  cartel: L.en("tienda", "cartel"),
  cuelga: L.en("tienda", "cuelga"),
  puerta: L.en("tienda", "puerta"),
  rine: L.en("tienda", "riñe:"),
  dice: L.en("tienda", "dice"),
  pasa: L.en("tienda", "pasa"),
  hacer: L.en("tienda", "qué", 1),
  finTienda: L.fin("tienda"),
  paso: L.en("paso1", "Paso"),
  mira: L.en("paso1", "Mira"),
  trae: L.en("paso1", "trae"),
  si: L.en("paso1", "Si"),
  casi: L.en("paso1", "casi"),
  proyecto: L.en("paso1", "proyecto."),
  conexion: L.en("paso1", "conexión"),
  cuenta: L.en("paso1", "cuenta."),
});

export const Tienda: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const img = ep.imagenes?.floristeria ?? "";
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 980, z: 0.62 },
    { t: T.cuelga - 0.1, x: CLAVO.x - 10, y: CLAVO.y + 130, z: 2.6, d: 1.1 },
    { t: T.dice - 0.2, x: CLAVO.x - 20, y: CLAVO.y + 130, z: 2.15, d: 0.9 },
    { t: T.paso - 0.35, x: 540, y: 2170, z: 1.0, d: 1.1 },
    { t: T.proyecto - 0.4, x: 540, y: 2420, z: 1.0, d: 0.9 },
    { t: T.conexion - 0.3, x: 540, y: 2560, z: 1.0, d: 0.9 },
  ];
  const fuera1 = T.paso + 0.6;
  const yesDraw = ramp(t, T.si, T.si + 0.45);
  return (
    <Escena t={t} tomas={tomas}>
      <Escaparate src={img} t={t} at={desde - 0.1} out={fuera1 + 0.4} />
      <Etiqueta texto="CADA NÚMERO" x={540} y={1840} t={t} at={T.numero - 0.05} out={T.cuelga} size={44} variante="borde" fuente="titulo" />
      <Cartel x={CLAVO.x} y={CLAVO.y} w={150} t={t} entra={T.cartel - 0.05} caras={[{ at: 0, cara: caraTexto("???", "ERROR") }]} golpes={[T.rine]} out={fuera1 + 0.4} />
      <Etiqueta texto="NO TE RIÑE" x={CLAVO.x} y={CLAVO.y + 175} t={t} at={T.rine - 0.05} out={T.dice} size={18} variante="texto" fuente="titulo" />
      <Etiqueta texto="QUÉ PASA" x={CLAVO.x - 150} y={CLAVO.y + 55} t={t} at={T.pasa - 0.1} out={fuera1} size={17} variante="acento" fuente="titulo" />
      <Etiqueta texto="QUÉ HACER" x={CLAVO.x + 150} y={CLAVO.y + 105} t={t} at={T.hacer - 0.05} out={fuera1} size={17} variante="acento" fuente="titulo" />

      {/* ── PASO 1: ¿trae número? ── */}
      <Sello texto="PASO 1" x={540} y={1990} t={t} at={T.paso} out={T.trae - 0.1} size={60} rot={-5} />
      <Pieza x={250} y={2140} t={t} at={T.mira - 0.05} out={hasta + 0.3}>
        <IcoLupa s={92} color={C.acento} />
      </Pieza>
      <Etiqueta texto="¿TRAE NÚMERO?" x={580} y={2140} t={t} at={T.trae - 0.1} out={hasta + 0.3} size={66} variante="texto" fuente="titulo" />
      <Flecha curva={{ a: { x: 470, y: 2215 }, c: { x: 380, y: 2240 }, b: { x: 360, y: 2290 } }} p={yesDraw} ancho={8} />
      <Flecha curva={{ a: { x: 690, y: 2215 }, c: { x: 780, y: 2240 }, b: { x: 790, y: 2290 } }} p={ramp(t, T.si + 0.2, T.si + 0.6)} ancho={6} color={C.tenue} />
      <Pieza x={360} y={2350} t={t} at={T.si + 0.15} out={hasta + 0.3}>
        <Pildora texto="SÍ" size={42} />
      </Pieza>
      <Pieza x={790} y={2350} t={t} at={T.si + 0.35} out={hasta + 0.3}>
        <Pildora texto="NO → PASO 4" size={30} activa={0} />
      </Pieza>
      <Flecha curva={{ a: { x: 360, y: 2400 }, c: { x: 360, y: 2470 }, b: { x: 450, y: 2500 } }} p={ramp(t, T.casi - 0.1, T.casi + 0.3)} ancho={7} />
      <Pieza x={560} y={2520} t={t} at={T.casi} out={hasta + 0.3}>
        <div style={{ position: "relative" }}>
          <Carpeta s={170} />
          {t > T.proyecto && (
            <div style={{ position: "absolute", right: -26, bottom: -14 }}>
              <Check s={70} p={sp(t, T.proyecto, { damping: 10, stiffness: 220 })} fondo={C.texto} />
            </div>
          )}
        </div>
      </Pieza>
      <Etiqueta texto="CASI NUNCA ES TU PROYECTO" x={560} y={2650} t={t} at={T.proyecto - 0.05} out={hasta + 0.3} size={34} variante="gris" fuente="titulo" />
      <Pieza x={320} y={2790} t={t} at={T.conexion - 0.05} out={hasta + 0.3}>
        <Pildora texto="CONEXIÓN" icono={<IcoConexion s={44} color={C.oscuro} />} size={40} />
      </Pieza>
      <Etiqueta texto="o" x={548} y={2790} t={t} at={T.conexion + 0.4} out={hasta + 0.3} size={40} variante="gris" fuente="titulo" />
      <Pieza x={770} y={2790} t={t} at={T.cuenta - 0.05} out={hasta + 0.3}>
        <Pildora texto="CUENTA" icono={<IcoCuenta s={44} color={C.oscuro} />} size={40} />
      </Pieza>
    </Escena>
  );
};

export const eventosTienda = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.piensa - 0.05, sfx: "pop", vol: 0.3 },
    { t: T.cartel + 0.25, sfx: "golpe", vol: 0.35 },
    { t: T.cuelga - 0.05, sfx: "whoosh", vol: 0.25 },
    { t: T.pasa - 0.1, sfx: "pop", vol: 0.4 },
    { t: T.hacer - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.trae - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.si + 0.15, sfx: "pop", vol: 0.4 },
    { t: T.proyecto, sfx: "tick", vol: 0.45 },
    { t: T.conexion - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.cuenta - 0.05, sfx: "pop", vol: 0.4 },
  ];
};
