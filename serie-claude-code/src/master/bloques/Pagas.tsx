/**
 * Lo que se paga (escenas pagas → ojo). Sin ninguna cifra: solo conceptos.
 *  - «¿Qué pagas? Dos cosas»: tarjeta de Claude y tarjeta de Hostinger (logos adjuntos).
 *  - Claude, dos formas: interruptores SUSCRIPCIÓN MENSUAL y POR USO; para empezar, PLAN PRO.
 *  - El hosting depende del proyecto: una web → HOSTING BÁSICO; automatización o app → VPS (una moneda más).
 *  - Etiqueta fija «PRECIOS ORIENTATIVOS · COMPRUÉBALOS» mientras se habla de precios; en «Ojo» pasa al centro.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Check, EtiquetaPrecio, Globo, Lupa, Moneda, Movil, Servidor } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta } from "../componentes/Sello";
import { Frase, Tarjeta } from "../componentes/Tarjeta";
import { C, EASE, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => ({
  ini: L.ini("pagas"),
  que: L.en("pagas", "¿qué"),
  dos: L.en("pagas", "Dos"),
  claude: L.en("pagas", "Claude,"),
  hosting: L.en("pagas", "hosting"),
  vps: L.en("pagas", "VPS"),
  formasIni: L.ini("formas"),
  formas: L.en("formas", "formas:"),
  suscripcion: L.en("formas", "suscripción"),
  gastes: L.en("formas", "gastes."),
  empezar: L.en("formas", "Para empezar,"),
  pro: L.en("formas", "Pro"),
  suficiente: L.en("formas", "suficiente."),
  hIni: L.ini("hosting"),
  depende: L.en("hosting", "depende"),
  web: L.en("hosting", "web?"),
  basico: L.en("hosting", "básico."),
  auto: L.en("hosting", "automatización"),
  app: L.en("hosting", "app?"),
  vpsH: L.en("hosting", "VPS,"),
  cuesta: L.en("hosting", "cuesta"),
  ojo: L.ini("ojo"),
  cambian: L.en("ojo", "cambian,"),
  mira: L.en("ojo", "mira"),
  actual: L.en("ojo", "actual"),
  fin: L.fin("ojo"),
});

const A = { y: 1230 };
const B = { y: 2080 };
const H = { y: 3080 };

/** Interruptor: se enciende (pomo a la derecha, fondo de acento) según `on` (0 → 1). */
const Interruptor: React.FC<{ on: number }> = ({ on }) => (
  <div style={{ position: "relative", width: 128, height: 68, borderRadius: 34, background: `color-mix(in srgb, ${C.acento} ${Math.round(on * 100)}%, ${C.panel})`, border: `3px solid ${on > 0.5 ? C.acento : C.borde}`, boxSizing: "border-box", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: 5, left: 5 + on * 60, width: 52, height: 52, borderRadius: "50%", background: on > 0.5 ? C.oscuro : C.gris, boxShadow: "0 4px 10px rgba(0,0,0,0.4)" }} />
  </div>
);

/** Monedas en fila: «cuánto» sin cifras (una, o una más). */
const Monedas: React.FC<{ n: number; t: number; at: number }> = ({ n, t, at }) => (
  <div style={{ display: "flex", gap: 6 }}>
    {Array.from({ length: n }, (_, i) => {
      const s = sp(t, at + i * 0.12, { damping: 10, stiffness: 220 });
      return (
        <div key={i} style={{ transform: `translateY(${(1 - s) * -30}px) scale(${s})`, opacity: Math.min(1, s * 2) }}>
          <Moneda s={58} giro={0} />
        </div>
      );
    })}
  </div>
);

export const Pagas: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 980, z: 1.0 },
    { t: T.claude - 0.35, x: 540, y: 1170, z: 1.0, d: 0.8 },
    { t: T.formasIni - 0.4, x: 540, y: B.y, z: 1.0, d: 0.9 },
    { t: T.pro - 0.3, x: 540, y: B.y - 20, z: 1.04, d: 0.7 },
    { t: T.hIni - 0.4, x: 540, y: H.y, z: 1.0, d: 0.9 },
    { t: T.cuesta - 0.25, x: 540, y: H.y + 40, z: 1.03, d: 0.7 },
    { t: T.ojo - 0.25, x: 540, y: 2120, z: 0.5, d: 1.1 },
  ];
  // interruptores: suscripción al nombrarla; por uso al decir «gastes» (la suscripción se apaga); con el plan Pro
  // vuelve la suscripción
  const sus = ramp(t, T.suscripcion - 0.05, T.suscripcion + 0.25) * (1 - ramp(t, T.gastes - 0.05, T.gastes + 0.25)) + ramp(t, T.pro - 0.1, T.pro + 0.2);
  const uso = ramp(t, T.gastes - 0.05, T.gastes + 0.25) * (1 - ramp(t, T.pro - 0.1, T.pro + 0.2));
  const okPro = clamp01((t - T.suficiente) / 0.35);
  // etiqueta de precios: fija arriba; con «Ojo» baja al centro y crece
  const precios = ep.precios?.texto ?? "PRECIOS ORIENTATIVOS · COMPRUÉBALOS";
  const pv = vis(t, T.que - 0.1, hasta, 0.6);
  const centro = EASE(ramp(t, T.ojo - 0.15, T.ojo + 0.55, (x) => x));
  const velo = 0.72 * centro * (1 - ramp(t, hasta - 0.35, hasta));
  return (
    <>
      <Escena t={t} tomas={tomas}>
        {/* A · qué pagas: dos cosas */}
        <Frase lineas={["¿Qué pagas?"]} escena="pagas" palabras={L.palabras} desde={T.que} x={540} y={720} t={t} out={T.claude - 0.2} size={104} acento={["pagas?"]} />
        <Etiqueta texto="DOS COSAS" x={540} y={870} t={t} at={T.dos} out={T.formasIni} size={40} variante="acento" fuente="titulo" />
        {[0, 1].map((i) => {
          const at = i === 0 ? T.claude : T.hosting;
          return (
            <Tarjeta key={i} x={i === 0 ? 290 : 790} y={A.y} w={440} h={420} t={t} at={at - 0.2} out={T.formasIni + 0.3} activa={ramp(t, at - 0.1, at + 0.2) * (1 - ramp(t, T.formasIni - 0.3, T.formasIni))} numero={i + 1}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 34, color: C.texto, lineHeight: 1.15 }}>
                {i === 0 ? "EL USO DE CLAUDE" : (
                  <>
                    HOSTING <span style={{ color: C.gris, fontSize: 28 }}>O</span> <span style={{ color: t > T.vps ? C.acento : C.texto }}>VPS</span>
                  </>
                )}
              </div>
              <div style={{ position: "absolute", right: 22, top: 22, transform: `scale(${sp(t, at + 0.25, { damping: 10, stiffness: 220 })})` }}>
                <Moneda s={64} giro={0} />
              </div>
            </Tarjeta>
          );
        })}
        <Logo src={ep.logos.claude} x={290} y={A.y - 70} w={170} t={t} at={T.claude - 0.05} out={T.formasIni + 0.3} rot={(t - T.claude) * 10} />
        <Logo src={ep.logos.hostinger} x={790} y={A.y - 70} w={250} t={t} at={T.hosting - 0.05} out={T.formasIni + 0.3} ficha="tarjeta" />

        {/* B · Claude, dos formas */}
        <Logo src={ep.logos.claude} x={540 - 190} y={B.y - 300} w={78} t={t} at={T.formasIni - 0.1} out={T.hIni + 0.3} sombra={false} rot={(t - T.formasIni) * 15} />
        <Etiqueta texto="DOS FORMAS" x={560} y={B.y - 300} t={t} at={T.formas - 0.1} out={T.hIni + 0.3} size={46} variante="texto" fuente="titulo" />
        {[0, 1].map((i) => {
          const v = vis(t, (i === 0 ? T.suscripcion : T.gastes) - 0.35, T.hIni + 0.3, 0.7);
          if (!v.on) return null;
          const on = i === 0 ? clamp01(sus) : clamp01(uso);
          return (
            <div key={i} style={{ position: "absolute", left: 120, top: B.y - 170 + i * 180, width: 840, height: 140, boxSizing: "border-box", borderRadius: 34, background: C.panel2, border: `3px solid ${on > 0.5 ? C.acento : C.borde}`, boxShadow: on > 0.5 ? `0 0 40px ${C.acento}44` : "none", display: "flex", alignItems: "center", gap: 28, padding: "0 34px", opacity: v.opacity, transform: `translateX(${(1 - v.s) * -60}px) scale(${v.scale})` }}>
              <Interruptor on={on} />
              <div style={{ flex: 1, fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: on > 0.5 ? C.texto : C.gris, whiteSpace: "nowrap" }}>{i === 0 ? "SUSCRIPCIÓN MENSUAL" : "POR USO"}</div>
              {/* PLAN PRO: pegatina en la esquina de la suscripción */}
              {i === 0 && t > T.pro - 0.1 && (
                <div style={{ position: "absolute", right: -18, top: -40, display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 999, background: C.acento, color: C.oscuro, fontFamily: UI, fontWeight: 700, fontSize: 32, whiteSpace: "nowrap", boxShadow: `0 10px 30px ${C.acento}66`, transform: `rotate(-4deg) scale(${sp(t, T.pro - 0.1, { damping: 10, stiffness: 220 })})` }}>
                  PLAN PRO
                  {okPro > 0 && <Check s={30} c={C.oscuro} trazo={7} p={okPro} />}
                </div>
              )}
            </div>
          );
        })}
        <Etiqueta texto="PARA EMPEZAR" x={540} y={B.y + 230} t={t} at={T.empezar} out={T.hIni + 0.3} size={38} variante="borde" />

        {/* C · el hosting depende del proyecto */}
        <Logo src={ep.logos.hostinger} x={540} y={H.y - 330} w={230} t={t} at={T.hIni - 0.1} out={T.ojo + 0.4} ficha="tarjeta" />
        <Etiqueta texto="DEPENDE DEL PROYECTO" x={540} y={H.y - 195} t={t} at={T.depende} out={T.ojo + 0.4} size={38} variante="borde" />
        {[0, 1].map((i) => {
          const at = i === 0 ? T.web : T.auto;
          const res = i === 0 ? T.basico - 0.25 : T.vpsH - 0.1;
          const v = vis(t, at - 0.15, T.ojo + 0.4, 0.7);
          if (!v.on) return null;
          const r = vis(t, res, T.ojo + 0.4, 0.7);
          const flecha = ramp(t, res - 0.3, res);
          const y = H.y - 40 + i * 230;
          return (
            <div key={i} style={{ position: "absolute", left: 0, top: y, width: 1080, height: 0, opacity: v.opacity }}>
              {/* proyecto */}
              <div style={{ position: "absolute", left: 70, top: -95, width: 360, height: 190, borderRadius: 30, background: C.panel2, border: `3px solid ${C.borde}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${v.scale})` }}>
                <div style={{ display: "flex", gap: 10 }}>{i === 0 ? <Globo s={74} /> : <><Servidor s={70} t={t} /><Movil s={70} /></>}</div>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 26, color: C.texto, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{i === 0 ? "UNA WEB" : "AUTOMATIZACIÓN O APP"}</div>
              </div>
              {/* flecha */}
              <div style={{ position: "absolute", left: 450, top: -4, width: 90 * flecha, height: 8, borderRadius: 4, background: C.acento }} />
              {flecha > 0.9 && <div style={{ position: "absolute", left: 532, top: -16, width: 0, height: 0, borderTop: "20px solid transparent", borderBottom: "20px solid transparent", borderLeft: `26px solid ${C.acento}` }} />}
              {/* resultado */}
              {r.on && (
                <div style={{ position: "absolute", left: 580, top: -95, width: 430, height: 190, borderRadius: 30, background: C.panel2, border: `3px solid ${C.acento}`, boxShadow: `0 0 36px ${C.acento}44`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: r.opacity, transform: `scale(${r.scale})` }}>
                  <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto, whiteSpace: "nowrap" }}>{i === 0 ? "HOSTING BÁSICO" : "VPS"}</div>
                  <Monedas n={i === 0 ? 1 : 2} t={t} at={i === 0 ? res + 0.15 : T.cuesta} />
                </div>
              )}
            </div>
          );
        })}
        <Etiqueta texto="CUESTA ALGO MÁS" x={795} y={H.y + 330} t={t} at={T.cuesta} out={T.ojo + 0.4} size={34} variante="acento" />
      </Escena>

      {/* ojo: velo y etiqueta de precios en el centro */}
      {velo > 0.001 && <div style={{ position: "absolute", inset: 0, background: C.fondo, opacity: velo }} />}
      {t > T.ojo - 0.1 && (() => {
        const v = vis(t, T.ojo, hasta, 0.4);
        return (
          <div style={{ position: "absolute", left: 540, top: 820, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", left: -110, top: -110, transform: `scale(${v.scale})` }}>
              <EtiquetaPrecio s={220} giro={-12 + Math.sin(Math.max(0, t - T.cambian) * 7) * 14 * Math.exp(-Math.max(0, t - T.cambian) * 1.2)} />
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="LOS PRECIOS CAMBIAN" x={540} y={1180} t={t} at={T.cambian - 0.05} out={hasta} size={50} variante="texto" fuente="titulo" />
      {(() => {
        const v = vis(t, T.mira - 0.05, hasta, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 1420, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 16, whiteSpace: "nowrap", padding: "14px 32px 14px 20px", borderRadius: 999, background: C.panel2, border: `3px solid ${C.acento}`, fontFamily: UI, fontWeight: 700, fontSize: 36, color: C.texto }}>
              <Lupa s={52} c={C.acento} />
              MIRA EL PRECIO <span style={{ color: C.acento }}>ACTUAL</span>
            </div>
          </div>
        );
      })()}
      {/* etiqueta fija de precios */}
      {pv.on && (
        <div style={{ position: "absolute", left: 540, top: 592 + (1300 - 592) * centro, width: 0, height: 0, opacity: pv.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${pv.scale * (1 + 0.32 * centro) * (1 + 0.05 * Math.sin(clamp01((t - T.actual) / 0.4) * Math.PI))})`, whiteSpace: "nowrap", padding: "10px 26px", borderRadius: 999, background: centro > 0.5 ? C.acento : "rgba(20,24,33,0.92)", border: `3px solid ${centro > 0.5 ? C.acento : C.tenue}`, fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: 1.5, color: centro > 0.5 ? C.oscuro : C.gris }}>
            {precios}
          </div>
        </div>
      )}
    </>
  );
};

export const eventosPagas = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.que, sfx: "pop", vol: 0.3 },
    { t: T.claude, sfx: "pop", vol: 0.35 },
    { t: T.hosting, sfx: "pop", vol: 0.35 },
    { t: T.suscripcion, sfx: "tick", vol: 0.35 },
    { t: T.gastes, sfx: "tick", vol: 0.35 },
    { t: T.pro, sfx: "pop", vol: 0.4 },
    { t: T.web, sfx: "pop", vol: 0.3 },
    { t: T.auto, sfx: "pop", vol: 0.3 },
    { t: T.cuesta, sfx: "pop", vol: 0.35 },
    { t: T.ojo - 0.15, sfx: "whoosh", vol: 0.35 },
    { t: T.ojo + 0.05, sfx: "golpe", vol: 0.35 },
  ];
};
