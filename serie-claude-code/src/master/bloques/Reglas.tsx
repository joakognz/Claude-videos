/**
 * Tres reglas (escenas reglas → regla3). Sello «3 REGLAS» y, para cada regla, su sello «REGLA N» con golpe:
 *  1. Empieza con lo mínimo: un medidor que se llena justo hasta «LO MÍNIMO»; PLAN PRO + HOSTING BÁSICO bastan;
 *     el «plan grande por si acaso» intenta llenarlo entero y se tacha.
 *  2. El modelo adecuado a cada tarea: LIGERO → LO SENCILLO (gasta menos), POTENTE → LO COMPLICADO.
 *  3. Vigila tu gasto la primera semana: contador y curva de gasto; al ajustar, la curva no llega a dispararse.
 * Sin cifras: medidores, monedas y curvas sin números.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Check, Cruz, Engranaje, Moneda, OjoTachado } from "../componentes/Iconos";
import { Etiqueta, Sello } from "../componentes/Sello";
import { Chip, Frase } from "../componentes/Tarjeta";
import { C, EASE, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => ({
  ini: L.ini("reglas"),
  tres: L.en("reglas", "tres"),
  reglas: L.en("reglas", "reglas"),
  gastar: L.en("reglas", "gastar"),
  r1: L.en("regla1", "1"),
  empieza: L.en("regla1", "empieza"),
  minimo: L.en("regla1", "mínimo."),
  pro: L.en("regla1", "Pro"),
  hosting: L.en("regla1", "hosting"),
  bastan: L.en("regla1", "bastan"),
  contrates: L.en("regla1", "contrates"),
  grande: L.en("regla1", "grande"),
  acaso: L.en("regla1", "acaso»."),
  r2: L.en("regla2", "2"),
  modelo: L.en("regla2", "modelo"),
  tarea: L.en("regla2", "tarea."),
  sencillo: L.en("regla2", "sencillo,"),
  ligero: L.en("regla2", "ligero"),
  gasta: L.en("regla2", "gasta menos."),
  potentes: L.en("regla2", "potentes,"),
  guardalos: L.en("regla2", "guárdalos"),
  complicado: L.en("regla2", "complicado."),
  r3: L.en("regla3", "3"),
  vigila: L.en("regla3", "vigila"),
  semana: L.en("regla3", "semana."),
  ritmo: L.en("regla3", "ritmo real"),
  ajustas: L.en("regla3", "ajustas"),
  dispare: L.en("regla3", "dispare."),
});

const S1 = 2000;
const S2 = 3000;
const S3 = 4000;
const MIN = 0.3; // dónde está «lo mínimo» en el medidor

/** Curva de gasto de la primera semana (u de 0 a 1 a lo ancho): sin ajustar se dispara; ajustada, se aplana. */
const curva = (u: number, ajuste: number) => {
  const libre = 0.08 + 0.92 * Math.pow(u, 2.2);
  const ajustada = u < 0.55 ? 0.08 + 0.92 * Math.pow(u, 2.2) : 0.08 + 0.92 * Math.pow(0.55, 2.2) + (u - 0.55) * 0.18;
  return libre + (ajustada - libre) * ajuste;
};

export const ReglasBloque: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 980, z: 1.0 },
    { t: T.r1 - 0.45, x: 540, y: S1, z: 1.0, d: 0.9 },
    { t: T.contrates - 0.3, x: 540, y: S1 + 110, z: 1.0, d: 0.8 },
    { t: T.r2 - 0.45, x: 540, y: S2, z: 1.0, d: 0.9 },
    { t: T.potentes - 0.3, x: 560, y: S2 + 40, z: 1.04, d: 0.8 },
    { t: T.r3 - 0.45, x: 540, y: S3, z: 1.0, d: 0.9 },
    { t: T.ajustas - 0.25, x: 560, y: S3 + 90, z: 1.07, d: 0.8 },
  ];
  // regla 1 · medidor: se llena justo hasta lo mínimo; el plan grande lo intenta llenar entero
  const llena = MIN * sp(t, T.minimo - 0.25, { damping: 16, stiffness: 120 });
  const grande = ramp(t, T.grande - 0.1, T.grande + 0.5) * (1 - ramp(t, T.acaso, T.acaso + 0.4));
  const tachado = ramp(t, T.acaso - 0.05, T.acaso + 0.3);
  // regla 3 · gráfica
  const dibuja = ramp(t, T.vigila, T.ajustas + 0.5, (x) => x);
  const ajuste = EASE(ramp(t, T.ajustas, T.ajustas + 0.6, (x) => x));
  const G = { x: 130, y: S3 - 60, w: 820, h: 400 };
  const puntos = (hasta1: number, aj: number) =>
    Array.from({ length: 41 }, (_, k) => k / 40)
      .filter((u) => u <= hasta1 + 1e-6)
      .map((u) => `${G.x + 60 + u * (G.w - 120)},${G.y + G.h - 60 - curva(u, aj) * (G.h - 120)}`)
      .join(" ");
  const nivel = curva(Math.min(1, dibuja), ajuste);
  return (
    <Escena t={t} tomas={tomas}>
      {/* 3 reglas */}
      <Sello texto="3 REGLAS" x={540} y={820} t={t} at={T.reglas - 0.05} out={T.r1 + 0.3} size={96} rot={-3} />
      {[0, 1, 2].map((k) => {
        const v = vis(t, T.tres + 0.25 + k * 0.12, T.r1 + 0.3, 0.4);
        if (!v.on) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 330 + k * 210 - 60, top: 1030 - 60, width: 120, height: 120, borderRadius: 32, background: C.panel2, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 64, color: C.acento, opacity: v.opacity, transform: `scale(${v.scale})` }}>
            {k + 1}
          </div>
        );
      })}
      <Etiqueta texto="PARA NO GASTAR DE MÁS" x={540} y={1210} t={t} at={T.gastar - 0.05} out={T.r1 + 0.3} size={40} variante="borde" />

      {/* regla 1 */}
      <Sello texto="REGLA 1" x={540} y={S1 - 400} t={t} at={T.r1 - 0.05} out={T.r2 - 0.1} size={76} rot={-3} />
      <Frase lineas={["Empieza con lo mínimo."]} escena="regla1" palabras={L.palabras} desde={T.empieza} x={540} y={S1 - 255} t={t} out={T.r2 - 0.1} size={68} acento={["mínimo."]} />
      {(() => {
        const v = vis(t, T.empieza - 0.2, T.r2 - 0.1, 0.7);
        if (!v.on) return null;
        const W = 820;
        return (
          <div style={{ position: "absolute", left: 130, top: S1 - 110, width: W, height: 90, opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 45, background: C.panel, border: `3px solid ${C.borde}`, overflow: "hidden" }}>
              {/* intento del plan grande: relleno fantasma hasta el final */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(llena + (1 - llena) * grande) * 100}%`, background: `repeating-linear-gradient(135deg, ${C.acento}55 0 14px, transparent 14px 28px)` }} />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${llena * 100}%`, background: `linear-gradient(90deg, #B85F42, ${C.acento})`, boxShadow: `0 0 26px ${C.acento}` }} />
              {Array.from({ length: 11 }, (_, k) => <div key={k} style={{ position: "absolute", left: `${(k + 1) * (100 / 12)}%`, top: 20, bottom: 20, width: 3, background: "rgba(255,255,255,0.12)" }} />)}
            </div>
            {/* marca de lo mínimo */}
            <div style={{ position: "absolute", left: W * MIN - 3, top: -26, width: 6, height: 142, borderRadius: 3, background: C.texto }} />
            <div style={{ position: "absolute", left: W * MIN, top: -70, transform: "translateX(-50%)", whiteSpace: "nowrap", fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: 1.5, color: C.texto }}>LO MÍNIMO</div>
            {t > T.minimo + 0.25 && (
              <div style={{ position: "absolute", left: W * MIN + 16, top: 12, width: 66, height: 66, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, T.minimo + 0.25, { damping: 10, stiffness: 230 })})` }}>
                <Check s={46} c={C.oscuro} trazo={7} p={clamp01((t - T.minimo - 0.3) / 0.3)} />
              </div>
            )}
          </div>
        );
      })()}
      <Chip texto="PLAN PRO" x={330} y={S1 + 70} t={t} at={T.pro - 0.05} out={T.r2 - 0.1} size={38} variante="lleno" />
      <Chip texto="HOSTING BÁSICO" x={720} y={S1 + 70} t={t} at={T.hosting - 0.05} out={T.r2 - 0.1} size={38} variante="lleno" />
      <Etiqueta texto="BASTAN PARA APRENDER" x={540} y={S1 + 175} t={t} at={T.bastan} out={T.r2 - 0.1} size={38} variante="borde" />
      {(() => {
        const v = vis(t, T.contrates - 0.1, T.r2 - 0.1, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: S1 + 340, width: 0, height: 0, opacity: v.opacity * (1 - 0.45 * tachado) }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateX(${(1 - v.s) * 300}px) scale(${v.scale * (1 + 0.06 * grande)})`, padding: "26px 44px", borderRadius: 34, background: C.panel2, border: `4px solid ${C.acento}`, whiteSpace: "nowrap", textAlign: "center" }}>
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 52, color: C.texto }}>PLAN GRANDE</div>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 32, color: C.gris, marginTop: 4 }}>«POR SI ACASO»</div>
              <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 10, marginTop: -5, borderRadius: 5, background: C.acento, transformOrigin: "0 50%", transform: `rotate(-8deg) scaleX(${tachado})` }} />
              {tachado > 0 && (
                <div style={{ position: "absolute", right: -46, top: -46, width: 96, height: 96, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, T.acaso - 0.05, { damping: 10, stiffness: 230 })})` }}>
                  <Cruz s={62} c={C.oscuro} trazo={7} p={tachado} />
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* regla 2 */}
      <Sello texto="REGLA 2" x={540} y={S2 - 400} t={t} at={T.r2 - 0.05} out={T.r3 - 0.1} size={76} rot={-3} />
      <Frase lineas={["Usa el modelo adecuado", "a cada tarea."]} escena="regla2" palabras={L.palabras} x={540} y={S2 - 230} t={t} out={T.r3 - 0.1} size={62} acento={["adecuado"]} />
      {[0, 1].map((i) => {
        const x = i === 0 ? 290 : 790;
        const tarea = i === 0 ? T.sencillo : T.complicado;
        const modelo = i === 0 ? T.ligero : T.potentes;
        const vt = vis(t, T.tarea - 0.05 + i * 0.12, T.r3 - 0.1, 0.7);
        const vm = vis(t, modelo - 0.1, T.r3 - 0.1, 0.5);
        const onT = ramp(t, tarea - 0.1, tarea + 0.2);
        const flecha = ramp(t, Math.max(modelo, tarea) - 0.05, Math.max(modelo, tarea) + 0.35) * (1 - ramp(t, T.r3 - 0.45, T.r3 - 0.1));
        return (
          <React.Fragment key={i}>
            {vt.on && (
              <div style={{ position: "absolute", left: x - 210, top: S2 - 110, width: 420, height: 200, borderRadius: 30, background: C.panel2, border: `3px solid ${onT > 0.5 ? C.acento : C.borde}`, boxShadow: onT > 0.5 ? `0 0 36px ${C.acento}44` : "none", opacity: vt.opacity * (0.55 + 0.45 * onT), transform: `scale(${vt.scale})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto, whiteSpace: "nowrap" }}>{i === 0 ? "LO SENCILLO" : "LO COMPLICADO"}</div>
                {/* la tarea: una pieza o muchas */}
                <div style={{ display: "flex", gap: 8 }}>
                  {Array.from({ length: i === 0 ? 1 : 5 }, (_, k) => <div key={k} style={{ width: 34, height: 34, borderRadius: 8, background: onT > 0.5 ? C.acento : C.tenue, transform: `rotate(${i === 1 ? (k - 2) * 8 : 0}deg)` }} />)}
                </div>
              </div>
            )}
            {flecha > 0 && <div style={{ position: "absolute", left: x - 4, top: S2 + 90 + 110 * (1 - flecha), width: 8, height: 110 * flecha, borderRadius: 4, background: C.acento }} />}
            {flecha > 0.9 && <div style={{ position: "absolute", left: x - 18, top: S2 + 82, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderBottom: `24px solid ${C.acento}` }} />}
            {vm.on && (
              <div style={{ position: "absolute", left: x, top: S2 + 300, width: 0, height: 0, opacity: vm.opacity }}>
                <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${vm.scale})`, display: "flex", alignItems: "center", gap: 18, padding: "18px 34px 18px 22px", borderRadius: 999, background: C.panel, border: `4px solid ${C.acento}`, whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 42, color: C.texto }}>
                  <Engranaje s={i === 0 ? 52 : 86} c={C.acento} giro={t * (i === 0 ? 260 : 70)} />
                  {i === 0 ? "LIGERO" : "POTENTE"}
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      {(() => {
        const v = vis(t, T.gasta - 0.05, T.r3 - 0.1, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 290, top: S2 + 420, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap", fontFamily: UI, fontWeight: 700, fontSize: 32, color: C.acentoSuave }}>
              <Moneda s={44} giro={0} />
              GASTA MENOS
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="GUÁRDALOS" x={790} y={S2 + 420} t={t} at={T.guardalos} out={T.r3 - 0.1} size={32} variante="borde" />

      {/* regla 3 */}
      <Sello texto="REGLA 3" x={540} y={S3 - 400} t={t} at={T.r3 - 0.05} out={hasta} size={76} rot={-3} />
      <Frase lineas={["Vigila tu gasto", "la primera semana."]} escena="regla3" palabras={L.palabras} x={540} y={S3 - 230} t={t} out={hasta} size={62} acento={["vigila", "semana."]} />
      {(() => {
        const v = vis(t, T.vigila - 0.1, hasta, 0.7);
        if (!v.on) return null;
        const yLim = G.y + G.h - 60 - 0.82 * (G.h - 120);
        const salvo = clamp01((t - T.dispare) / 0.35);
        return (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", left: G.x, top: G.y, width: G.w, height: G.h, borderRadius: 30, background: C.panel, border: `3px solid ${C.borde}`, transform: `scale(${v.scale})` }} />
            {/* zona en la que el gasto «se dispara» */}
            <div style={{ position: "absolute", left: G.x + 3, top: G.y + 3, width: G.w - 6, height: yLim - G.y - 3, borderRadius: "28px 28px 0 0", background: `rgba(217,119,87,${0.1 + 0.15 * Math.sin(clamp01((t - T.dispare) / 0.5) * Math.PI)})` }} />
            <div style={{ position: "absolute", left: G.x + 20, top: yLim - 2, width: G.w - 40, height: 0, borderTop: `4px dashed ${C.acento}` }} />
            <div style={{ position: "absolute", left: G.x + G.w - 30, top: yLim - 46, transform: "translateX(-100%)", whiteSpace: "nowrap", fontFamily: UI, fontWeight: 700, fontSize: 24, letterSpacing: 1, color: C.acentoSuave }}>SE DISPARA</div>
            {/* los 7 días */}
            {Array.from({ length: 7 }, (_, k) => {
              const x = G.x + 60 + (k / 6) * (G.w - 120);
              const on = dibuja >= k / 6;
              return <div key={k} style={{ position: "absolute", left: x - 7, top: G.y + G.h - 46, width: 14, height: 14, borderRadius: "50%", background: on ? C.acento : C.tenue }} />;
            })}
            <div style={{ position: "absolute", left: G.x + 30, top: G.y + G.h + 34, fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: C.gris, whiteSpace: "nowrap" }}>PRIMERA SEMANA</div>
            <svg width={1080} height={5000} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              {/* lo que pasaría sin ajustar (después de ajustar queda como fantasma) */}
              {ajuste > 0 && <polyline points={puntos(Math.min(1, dibuja), 0)} fill="none" stroke={C.tenue} strokeWidth={5} strokeDasharray="10 12" opacity={ajuste} />}
              <polyline points={puntos(Math.min(1, dibuja), ajuste)} fill="none" stroke={C.acento} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${C.acento})` }} />
            </svg>
            {/* contador de gasto (sin cifras): aguja que sigue a la curva */}
            <div style={{ position: "absolute", left: G.x + G.w - 170, top: G.y + G.h + 14, width: 150, height: 92 }}>
              <svg width={150} height={92} viewBox="0 0 150 92">
                <path d="M 12 82 A 63 63 0 0 1 138 82" fill="none" stroke={C.borde} strokeWidth={12} strokeLinecap="round" />
                <path d="M 12 82 A 63 63 0 0 1 138 82" fill="none" stroke={C.acento} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - nivel} />
                <line x1={75} y1={82} x2={75 + Math.cos(Math.PI * (1 - nivel)) * 50} y2={82 - Math.sin(Math.PI * (1 - nivel)) * 50} stroke={C.texto} strokeWidth={5} strokeLinecap="round" />
                <circle cx={75} cy={82} r={7} fill={C.texto} />
              </svg>
            </div>
            <div style={{ position: "absolute", left: G.x + G.w - 345, top: G.y + G.h + 50, display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.texto, opacity: ramp(t, T.vigila, T.vigila + 0.3) }}>
              <OjoTachado s={40} p={0} />
              GASTO
            </div>
            {salvo > 0 && (
              <div style={{ position: "absolute", left: G.x + G.w - 260, top: G.y + 128, width: 84, height: 84, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, T.dispare, { damping: 10, stiffness: 230 })})`, boxShadow: `0 0 30px ${C.acento}AA` }}>
                <Check s={56} c={C.oscuro} trazo={7} p={salvo} />
              </div>
            )}
          </div>
        );
      })()}
      <Etiqueta texto="TU RITMO REAL" x={430} y={S3 + 130} t={t} at={T.ritmo - 0.05} out={hasta} size={32} variante="borde" />
      <Etiqueta texto="AJUSTAS" x={640} y={S3 + 30} t={t} at={T.ajustas - 0.05} out={hasta} size={34} variante="acento" />
    </Escena>
  );
};

export const eventosReglas = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.reglas + 0.02, sfx: "golpe", vol: 0.6 },
    { t: T.r1 + 0.02, sfx: "golpe", vol: 0.55 },
    { t: T.minimo + 0.25, sfx: "tick", vol: 0.45 },
    { t: T.pro, sfx: "pop", vol: 0.3 },
    { t: T.hosting, sfx: "pop", vol: 0.3 },
    { t: T.contrates, sfx: "whoosh", vol: 0.25 },
    { t: T.acaso, sfx: "golpe", vol: 0.3 },
    { t: T.r2 + 0.02, sfx: "golpe", vol: 0.55 },
    { t: T.ligero, sfx: "pop", vol: 0.35 },
    { t: T.potentes, sfx: "pop", vol: 0.35 },
    { t: T.r3 + 0.02, sfx: "golpe", vol: 0.55 },
    { t: T.ajustas, sfx: "whoosh", vol: 0.25 },
    { t: T.dispare, sfx: "tick", vol: 0.45 },
  ];
};
