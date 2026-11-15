/**
 * EP.6 · bloque «Regla» (escenas regla → mente):
 * LA REGLA → lo que PIDES → Claude → lo que RECIBES, con barras de calidad: las de la derecha siguen a las de la
 * izquierda → Claude MUY CAPAZ · la bola de cristal se tacha: NO LEE TU MENTE → MEJOR EXPLICAS = MEJOR SALE →
 * las vueltas bajan de 3 a 1: MENOS VUELTAS.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { C, TITULO, UI, clamp01, ramp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Chip, Destellos, Pop } from "../../ep05/kit";
import { Calidad, Ico, Medalla6 } from "../../ep06/kit6";

const FILA = 1020;

const tiempos = (L: LineaT) => ({
  y: L.ini("regla"),
  regla: L.en("regla", "regla"),
  calidad: L.en("regla", "calidad"),
  recibes: L.en("regla", "recibes"),
  depende: L.en("regla", "depende"),
  calidad2: L.en("regla", "calidad", 1),
  pides: L.en("regla", "pides."),
  finRegla: L.fin("regla"),
  claude: L.ini("mente"),
  capaz: L.en("mente", "capaz"),
  pero: L.en("mente", "pero"),
  mente: L.en("mente", "mente."),
  cuanto: L.en("mente", "Cuanto"),
  explicas: L.en("mente", "explicas"),
  mejor2: L.en("mente", "mejor", 1),
  sale: L.en("mente", "sale"),
  menos: L.en("mente", "menos"),
  vueltas: L.en("mente", "vueltas"),
  das: L.en("mente", "das."),
});

const CajaFlujo: React.FC<{ titulo: string; icono: string; nivel: number; activo: number }> = ({ titulo, icono, nivel, activo }) => (
  <div style={{ width: 280, boxSizing: "border-box", padding: "26px 24px 24px", borderRadius: 30, background: C.panel, border: `3px solid ${activo > 0.5 ? C.acento : C.borde}`, boxShadow: activo > 0.5 ? `0 0 40px ${C.acento}44` : "0 24px 60px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
    <Medalla6 nombre={icono} size={110} />
    <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto, letterSpacing: 1 }}>{titulo}</div>
    <Calidad nivel={nivel} ancho={190} alto={66} />
  </div>
);

export const Regla: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 900, z: 1.04 },
    { t: T.calidad - 0.3, x: 540, y: 1010, z: 1.0, d: 0.9 },
    { t: T.pides - 0.2, x: 540, y: 1050, z: 1.04, d: 0.8 },
    { t: T.claude - 0.35, x: 540, y: 1850, z: 1.04, d: 0.9 },
    { t: T.cuanto - 0.3, x: 540, y: 2120, z: 1.04, d: 0.8 },
    { t: T.menos - 0.3, x: 540, y: 2300, z: 1.06, d: 0.8 },
  ];
  const fueraA = T.claude + 0.15;
  // calidad: lo que pides sube de 1 a 5 y lo que recibes lo sigue con retraso
  const pide = 1 + 4 * ramp(t, T.pides + 0.15, T.finRegla + 0.5);
  const recibe = t < T.depende ? 1 : 1 + 4 * ramp(t, T.pides + 0.45, T.finRegla + 0.8);
  const giro = ramp(t, T.vueltas - 0.1, T.das + 0.5);
  const contador = Math.max(1, 3 - Math.floor(ramp(t, T.vueltas, T.das + 0.2) * 2.999));
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="LA REGLA" x={540} y={650} t={t} at={T.regla} out={fueraA} size={66} rot={-3} />
      <Etiqueta texto="CALIDAD" x={540} y={790} t={t} at={T.calidad - 0.05} out={fueraA} size={38} variante="gris" fuente="titulo" />
      <Pop x={200} y={FILA} t={t} at={T.pides - 0.06} out={fueraA} rot={-8}>
        <CajaFlujo titulo="PIDES" icono="bocadillo" nivel={pide} activo={ramp(t, T.pides, T.pides + 0.2)} />
      </Pop>
      <Pop x={880} y={FILA} t={t} at={T.recibes - 0.06} out={fueraA} rot={8}>
        <CajaFlujo titulo="RECIBES" icono="documento" nivel={recibe} activo={ramp(t, T.finRegla, T.finRegla + 0.3)} />
      </Pop>
      <Logo src={ep.logos.claude} x={540} y={FILA} w={130} t={t} at={T.depende - 0.1} out={fueraA} pulsos={[T.pides + 0.3]} />
      <Flecha curva={{ a: { x: 350, y: FILA + 90 }, c: { x: 410, y: FILA + 150 }, b: { x: 470, y: FILA + 70 } }} p={ramp(t, T.pides + 0.05, T.pides + 0.4)} ancho={8} opacity={1 - ramp(t, fueraA - 0.35, fueraA)} />
      <Flecha curva={{ a: { x: 610, y: FILA + 70 }, c: { x: 670, y: FILA + 150 }, b: { x: 730, y: FILA + 90 } }} p={ramp(t, T.pides + 0.35, T.pides + 0.7)} ancho={8} opacity={1 - ramp(t, fueraA - 0.35, fueraA)} />
      <Etiqueta texto="DEPENDE DE" x={540} y={FILA - 150} t={t} at={T.depende - 0.05} out={fueraA} size={34} variante="borde" fuente="titulo" />

      {/* ── Claude es muy capaz, pero no lee tu mente ── */}
      <Logo src={ep.logos.claude} x={290} y={1760} w={190} t={t} at={T.claude - 0.08} out={hasta + 0.4} pulsos={[T.capaz]} />
      <Destellos x={290} y={1760} t={t} at={T.capaz - 0.05} out={T.mente + 0.6} r={150} />
      <Etiqueta texto="MUY CAPAZ" x={290} y={1925} t={t} at={T.capaz - 0.03} out={hasta + 0.4} size={36} variante="acento" fuente="titulo" />
      <Pop x={790} y={1760} t={t} at={T.pero - 0.05} out={hasta + 0.4} rot={10}>
        <Medalla6 nombre="bola" size={200} tachado={ramp(t, T.mente, T.mente + 0.35)} activo={1 - ramp(t, T.mente, T.mente + 0.3)} />
      </Pop>
      <Etiqueta texto="NO LEE TU MENTE" x={790} y={1925} t={t} at={T.mente - 0.03} out={hasta + 0.4} size={36} variante="borde" fuente="titulo" />

      {/* mejor explicas = mejor sale */}
      <Pop x={280} y={2130} t={t} at={T.explicas - 0.1} out={hasta + 0.4} rot={-6}>
        <Chip icono={<Ico nombre="bocadillo" size={44} grosor={2.4} />} texto="Mejor explicas" size={40} />
      </Pop>
      <Flecha curva={{ a: { x: 520, y: 2130 }, c: { x: 560, y: 2100 }, b: { x: 600, y: 2130 } }} p={ramp(t, T.mejor2 - 0.2, T.sale - 0.05)} ancho={8} opacity={1 - ramp(t, hasta, hasta + 0.4)} />
      <Pop x={820} y={2130} t={t} at={T.sale - 0.08} out={hasta + 0.4} rot={6}>
        <Chip icono={<Ico nombre="check" size={44} color={C.oscuro} grosor={3} />} texto="Mejor sale" size={40} variante="acento" />
      </Pop>
      {/* menos vueltas */}
      {(() => {
        const v = vis(t, T.menos - 0.06, hasta + 0.4, 0.5);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 2370, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, display: "flex", alignItems: "center", gap: 34, padding: "22px 40px", borderRadius: 34, background: C.panel, border: `3px solid ${C.borde}`, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>
              <div style={{ transform: `rotate(${giro * -720}deg)` }}>
                <Ico nombre="bucle" size={110} grosor={2.4} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 52, color: C.texto }}>MENOS VUELTAS</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: UI, fontWeight: 700, fontSize: 38, color: C.gris }}>
                  {[3, 2, 1].map((n) => (
                    <div key={n} style={{ width: 62, height: 62, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 38, background: n === contador ? C.acento : C.panel2, color: n === contador ? C.oscuro : n > contador ? C.tenue : C.gris, border: `3px solid ${n === contador ? C.acento : C.borde}`, textDecoration: n > contador ? "line-through" : undefined, opacity: n >= contador || clamp01(giro) < 1 ? 1 : 0.5 }}>{n}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </Escena>
  );
};

export const eventosRegla = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.regla + 0.08, sfx: "golpe", vol: 0.5 },
    { t: T.recibes, sfx: "pop", vol: 0.35 },
    { t: T.pides, sfx: "pop", vol: 0.35 },
    { t: T.finRegla + 0.3, sfx: "tick", vol: 0.45 },
    { t: T.capaz, sfx: "pop", vol: 0.3 },
    { t: T.mente + 0.05, sfx: "tick", vol: 0.45 },
    { t: T.sale, sfx: "pop", vol: 0.35 },
    { t: T.das, sfx: "tick", vol: 0.45 },
  ];
};
