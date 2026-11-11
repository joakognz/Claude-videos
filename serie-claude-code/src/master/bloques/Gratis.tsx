/**
 * Lo gratis (escena gratis): «LA BUENA NOTICIA» → «Casi todo el entorno es gratis.» → tres baldosas que entran al
 * nombrarlas (Visual Studio Code y Node.js con sus logos adjuntos, extensiones con un pictograma); cada una recibe su
 * etiqueta «0 €» cuando la voz dice «gratis».
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Extensiones } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta } from "../componentes/Sello";
import { Frase, Tarjeta } from "../componentes/Tarjeta";
import { C, MONO, TITULO, UI, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea, e: string) => ({
  buena: L.en(e, "buena"),
  casi: L.en(e, "casi"),
  gratis0: L.en(e, "gratis", 0),
  visual: L.en(e, "Visual"),
  gratis1: L.en(e, "gratis", 1),
  node: L.en(e, "Node.js,"),
  gratis2: L.en(e, "gratis", 2),
  ext: L.en(e, "extensiones,"),
  gratis3: L.en(e, "gratis", 3),
  instalar: L.en(e, "instalar."),
});

const FILA = 1330;
const XS = [205, 540, 875];

/** Pegatina «0 €» que cae sobre la baldosa. */
const CeroEuros: React.FC<{ x: number; y: number; t: number; at: number; out: number }> = ({ x, y, t, at, out }) => {
  const v = vis(t, at - 0.05, out, 0.3);
  if (!v.on) return null;
  const s = sp(t, at - 0.05, { damping: 9, stiffness: 230 });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: v.opacity }}>
      <div style={{ position: "absolute", left: -62, top: -62, width: 124, height: 124, borderRadius: "50%", background: C.acento, border: `5px solid ${C.oscuro}`, boxShadow: `0 0 0 4px ${C.acento}, 0 12px 30px rgba(0,0,0,0.5)`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(2 - s) * v.scale}) rotate(${(1 - s) * -40 + 10}deg)`, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.oscuro, whiteSpace: "nowrap" }}>
        0 €
      </div>
    </div>
  );
};

export const Gratis: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta, escenas }) => {
  const e = escenas[0];
  const T = tiempos(L, e);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 900, z: 1.0 },
    { t: T.visual - 0.4, x: 540, y: FILA - 120, z: 1.0, d: 0.85 },
    { t: T.node - 0.35, x: 540, y: FILA - 100, z: 1.02, d: 0.8 },
    { t: T.ext - 0.35, x: 540, y: FILA - 90, z: 1.03, d: 0.8 },
    { t: T.instalar - 0.1, x: 540, y: FILA - 160, z: 0.98, d: 0.9 },
  ];
  const baldosas = [
    { at: T.visual, gratis: T.gratis1, nombre: "VS CODE" },
    { at: T.node, gratis: T.gratis2, nombre: "NODE.JS" },
    { at: T.ext, gratis: T.gratis3, nombre: "EXTENSIONES" },
  ];
  // la baldosa de la que habla la voz va encendida; las demás, un poco atenuadas mientras tanto
  const actual = baldosas.findIndex((b, i) => t >= b.at - 0.2 && (i === 2 || t < baldosas[i + 1].at - 0.2));
  const final = ramp(t, T.instalar - 0.1, T.instalar + 0.4);
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="LA BUENA NOTICIA" x={540} y={640} t={t} at={T.buena - 0.05} out={T.visual + 0.3} size={42} variante="acento" fuente="titulo" />
      <Frase lineas={["Casi todo el entorno", "es gratis."]} escena={e} palabras={L.palabras} desde={T.casi} x={540} y={830} t={t} size={86} acento={["gratis."]} />
      {baldosas.map((b, i) => {
        const activa = (actual === i ? 1 : 0) * (1 - final) + final * 0.4;
        const tenue = actual >= 0 && actual !== i && final < 0.5 ? 0.5 : 0;
        return (
          <Tarjeta key={i} x={XS[i]} y={FILA} w={300} h={380} t={t} at={b.at - 0.15} out={hasta} activa={activa} tenue={tenue}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 286, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 30, color: C.texto, letterSpacing: 0.5 }}>{b.nombre}</div>
            {i === 2 && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 328, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 20, color: C.acentoSuave, letterSpacing: 1, opacity: ramp(t, T.gratis3, T.gratis3 + 0.3) }}>GRATIS DE INSTALAR</div>
            )}
          </Tarjeta>
        );
      })}
      <Logo src={ep.logos.vscode} x={XS[0]} y={FILA - 50} w={150} t={t} at={T.visual} out={hasta} pulsos={[T.gratis1]} />
      <Logo src={ep.logos.nodejs} x={XS[1]} y={FILA - 50} w={210} t={t} at={T.node} out={hasta} ficha="tarjeta" pulsos={[T.gratis2]} />
      {(() => {
        const v = vis(t, T.ext, hasta, 0.3);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: XS[2] - 75, top: FILA - 125, opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <Extensiones s={150} p={ramp(t, T.ext + 0.1, T.gratis3)} />
          </div>
        );
      })()}
      {baldosas.map((b, i) => (
        <CeroEuros key={i} x={XS[i] + 118} y={FILA - 168} t={t} at={b.gratis} out={hasta} />
      ))}
    </Escena>
  );
};

export const eventosGratis = (L: Linea, _ep: unknown, _b: unknown, escenas: string[]): Evento[] => {
  const T = tiempos(L, escenas[0]);
  return [
    { t: T.buena, sfx: "pop", vol: 0.35 },
    { t: T.visual, sfx: "pop", vol: 0.3 },
    { t: T.node, sfx: "pop", vol: 0.3 },
    { t: T.ext, sfx: "pop", vol: 0.3 },
    { t: T.gratis1, sfx: "golpe", vol: 0.3 },
    { t: T.gratis2, sfx: "golpe", vol: 0.3 },
    { t: T.gratis3, sfx: "golpe", vol: 0.3 },
  ];
};
