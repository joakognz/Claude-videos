/**
 * Meta (escenas meta → app): un camino que sube hasta la bandera → «qué vas a poder construir» → tres tarjetas que
 * entran una a una y la cámara visita: 1 web de WordPress (publicada, segura, accesos), 2 automatización (servidor con
 * reloj 24/7, VPS, sin pantalla), 3 mini-app (pantalla que se enciende, desplegada, en marcha).
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Bandera, Candado, Check, Codigo, Cohete, Engranaje, Globo, Llave, Monitor, Movil, OjoTachado, Reloj, Servidor } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta } from "../componentes/Sello";
import { Frase, Tarjeta } from "../componentes/Tarjeta";
import { C, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const FILA = 1330;
const XS = [205, 540, 875];
const CW = 300;
const CH = 430;
const BANDERA = { x: 540, y: 700 };
/** Camino de la parte de abajo hasta la bandera (curva en S). */
const CAMINO = "M 540 2380 C 220 2160, 220 1880, 540 1700 S 860 1240, 540 1020 S 520 860, 540 800";

const tiempos = (L: Linea) => ({
  ini: L.ini("meta"),
  meta: L.en("meta", "meta"),
  que: L.en("meta", "Qué"),
  tres: L.en("tres", "Tres"),
  proyectos: L.en("tres", "proyectos"),
  c1: L.en("web", "1"),
  wp: L.en("web", "WordPress"),
  publicada: L.en("web", "publicada"),
  segura: L.en("web", "segura"),
  accesos: L.en("web", "accesos"),
  listos: L.en("web", "listos"),
  c2: L.en("automatizacion", "2"),
  auto: L.en("automatizacion", "automatización"),
  corre: L.en("automatizacion", "corre"),
  vps: L.en("automatizacion", "VPS"),
  sinPantalla: L.en("automatizacion", "sin pantalla"),
  nadie: L.en("automatizacion", "nadie"),
  mire: L.en("automatizacion", "mire"),
  c3: L.en("app", "3"),
  app: L.en("app", "mini-app"),
  medida: L.en("app", "medida"),
  pantalla: L.en("app", "pantalla"),
  desplegada: L.en("app", "desplegada"),
  marcha: L.en("app", "marcha"),
});

/** Fila de una tarjeta: icono + texto + check cuando la voz lo dice. */
const Fila: React.FC<{ y: number; icono: React.ReactNode; texto: string; t: number; at: number; ok?: number }> = ({ y, icono, texto, t, at, ok }) => {
  const v = vis(t, at - 0.05, Infinity, 0.6);
  if (!v.on) return null;
  const c = ok === undefined ? 0 : clamp01((t - ok) / 0.3);
  return (
    <div style={{ position: "absolute", left: 26, right: 22, top: y - 26, height: 52, display: "flex", alignItems: "center", gap: 12, opacity: v.opacity, transform: `translateX(${(1 - v.s) * -24}px)` }}>
      <div style={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{icono}</div>
      <div style={{ flex: 1, fontFamily: UI, fontWeight: 700, fontSize: 19, letterSpacing: 0.5, color: C.texto, whiteSpace: "nowrap" }}>{texto}</div>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: c > 0 ? C.acento : "transparent", border: `2px solid ${c > 0 ? C.acento : C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + Math.sin(c * Math.PI) * 0.3})` }}>
        {c > 0 && <Check s={24} c={C.oscuro} trazo={7} p={c} />}
      </div>
    </div>
  );
};

const Titulo: React.FC<{ texto: string; t: number; at: number }> = ({ texto, t, at }) => {
  const s = sp(t, at, { damping: 14, stiffness: 200 });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 158, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 25, letterSpacing: 0.5, color: C.texto, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 14}px)` }}>
      {texto}
    </div>
  );
};

export const Meta: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1950, z: 1.0 },
    { t: T.ini - 0.1, x: 540, y: 1250, z: 0.86, d: 1.1 },
    { t: T.meta - 0.35, x: 540, y: 860, z: 1.25, d: 0.8 },
    { t: T.que - 0.2, x: 540, y: 900, z: 1.06, d: 0.8 },
    { t: T.tres - 0.3, x: 540, y: 1130, z: 0.86, d: 0.9 },
    { t: T.c1 - 0.3, x: XS[0], y: FILA - 10, z: 2.05, d: 0.9 },
    { t: T.c2 - 0.3, x: XS[1], y: FILA - 10, z: 2.05, d: 0.9 },
    { t: T.c3 - 0.3, x: XS[2], y: FILA - 10, z: 2.05, d: 0.9 },
    { t: T.marcha - 0.05, x: 540, y: 1180, z: 0.95, d: 0.9 },
  ];
  const traza = ramp(t, T.ini - 0.1, T.meta - 0.05);
  // mientras la cámara visita una tarjeta, las vecinas (que asoman cortadas por el encuadre) se atenúan
  const visitas = [T.c1, T.c2, T.c3, T.marcha + 0.25].map((x) => x - 0.3);
  const enVisita = ramp(t, visitas[0], visitas[0] + 0.4) * (1 - ramp(t, visitas[3], visitas[3] + 0.4));
  const tenue = (k: number) => enVisita * (1 - ramp(t, visitas[k], visitas[k] + 0.4) * (1 - ramp(t, visitas[k + 1], visitas[k + 1] + 0.4)));
  const hecha = [T.listos + 0.2, T.mire + 0.2, T.marcha + 0.2];
  return (
    <Escena t={t} tomas={tomas}>
      {/* camino */}
      <svg width={1080} height={2500} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={CAMINO} fill="none" stroke={C.panel2} strokeWidth={46} strokeLinecap="round" />
        <path d={CAMINO} fill="none" stroke={C.borde} strokeWidth={46} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - traza} opacity={0.9} />
        <path d={CAMINO} fill="none" stroke={C.acento} strokeWidth={6} strokeLinecap="round" pathLength={100} strokeDasharray="2.2 2.2" strokeDashoffset={0} style={{ clipPath: "none" }} opacity={traza > 0 ? 1 : 0} mask="url(#revela)" />
        <defs>
          <mask id="revela" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={2500}>
            <path d={CAMINO} fill="none" stroke="#fff" strokeWidth={60} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - traza} />
          </mask>
        </defs>
      </svg>
      {/* bandera: cae y se clava al decir «meta» */}
      {t > T.meta - 0.25 && (
        <div style={{ position: "absolute", left: BANDERA.x - 125, top: BANDERA.y - 160, width: 250, height: 250, transformOrigin: "30% 96%", transform: `translateY(${(1 - sp(t, T.meta - 0.25, { damping: 10, stiffness: 180 })) * -260}px) rotate(${(1 - sp(t, T.meta - 0.1, { damping: 7, stiffness: 160 })) * 10}deg)`, opacity: clamp01((t - T.meta + 0.25) / 0.12) }}>
          <Bandera s={250} t={t} />
        </div>
      )}
      {/* anillo que se expande al clavarla */}
      {t > T.meta && t < T.meta + 0.8 && (
        <div style={{ position: "absolute", left: BANDERA.x - 60 - 140 * ramp(t, T.meta, T.meta + 0.8), top: BANDERA.y + 84 - 18 - 40 * ramp(t, T.meta, T.meta + 0.8), width: 120 + 280 * ramp(t, T.meta, T.meta + 0.8), height: 36 + 80 * ramp(t, T.meta, T.meta + 0.8), borderRadius: "50%", border: `4px solid ${C.acento}`, opacity: 1 - ramp(t, T.meta, T.meta + 0.8) }} />
      )}
      <Etiqueta texto="LA META" x={BANDERA.x} y={BANDERA.y + 150} t={t} at={T.meta + 0.05} out={T.tres + 0.2} size={36} variante="acento" />
      <Frase lineas={["Qué vas a poder", "construir"]} escena="meta" palabras={L.palabras} x={540} y={BANDERA.y + 300} t={t} out={T.tres - 0.05} size={74} acento={["construir"]} />
      <Etiqueta texto="3 PROYECTOS REALES" x={540} y={BANDERA.y + 230} t={t} at={T.proyectos - 0.05} out={T.c1 + 0.2} size={40} variante="borde" />

      {/* 1 · web de WordPress */}
      <Tarjeta x={XS[0]} y={FILA} w={CW} h={CH} t={t} at={T.tres + 0.05} numero={1} tenue={tenue(0)} activa={ramp(t, T.c1 - 0.1, T.c1 + 0.3) * (1 - 0.6 * ramp(t, T.c2 - 0.3, T.c2)) + 0.6 * ramp(t, hecha[0], hecha[0] + 0.3) * ramp(t, T.c2 - 0.3, T.c2)} out={hasta}>
        <Logo src={ep.logos.wordpress} x={CW / 2} y={86} w={112} t={t} at={T.c1 + 0.1} ficha="circulo" pulsos={[T.wp]} />
        <Titulo texto="WEB DE WORDPRESS" t={t} at={T.c1 + 0.2} />
        <Fila y={240} icono={<Globo s={36} />} texto="PUBLICADA" t={t} at={T.publicada} ok={T.publicada + 0.3} />
        <Fila y={300} icono={<Candado s={36} abierto={1 - ramp(t, T.segura, T.segura + 0.35)} />} texto="SEGURA" t={t} at={T.segura} ok={T.segura + 0.35} />
        <Fila y={360} icono={<Llave s={36} />} texto="ACCESOS LISTOS" t={t} at={T.accesos} ok={T.listos} />
      </Tarjeta>

      {/* 2 · automatización */}
      <Tarjeta x={XS[1]} y={FILA} w={CW} h={CH} t={t} at={T.tres + 0.18} numero={2} tenue={tenue(1)} activa={ramp(t, T.c2 - 0.1, T.c2 + 0.3) * (1 - 0.6 * ramp(t, T.c3 - 0.3, T.c3)) + 0.6 * ramp(t, hecha[1], hecha[1] + 0.3) * ramp(t, T.c3 - 0.3, T.c3)} out={hasta}>
        {(() => {
          const v = vis(t, T.c2 + 0.1, Infinity, 0.4);
          if (!v.on) return null;
          return (
            <div style={{ position: "absolute", left: CW / 2 - 70, top: 30, width: 140, height: 112, opacity: v.opacity, transform: `scale(${v.scale})` }}>
              <Servidor s={104} t={t} style={{ position: "absolute", left: 0, top: 4 }} />
              <div style={{ position: "absolute", left: 76, top: 44, width: 70, height: 70, borderRadius: "50%", background: C.panel, boxShadow: `0 0 0 4px ${C.panel}` }}>
                <Reloj s={70} t={t} />
              </div>
              <div style={{ position: "absolute", left: 82, top: -6, padding: "2px 8px", borderRadius: 8, background: C.acento, color: C.oscuro, fontFamily: MONO, fontWeight: 700, fontSize: 18 }}>24/7</div>
              {/* sin que nadie la mire */}
              {t > T.nadie - 0.05 && (
                <div style={{ position: "absolute", left: -44, top: 46, width: 54, height: 54, borderRadius: "50%", background: C.panel, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, T.nadie - 0.05, { damping: 10, stiffness: 220 })})`, border: `2px solid ${C.acento}` }}>
                  <OjoTachado s={38} p={ramp(t, T.nadie + 0.05, T.mire)} />
                </div>
              )}
            </div>
          );
        })()}
        <Titulo texto="AUTOMATIZACIÓN" t={t} at={T.auto} />
        <Fila y={240} icono={<Engranaje s={34} giro={t * 120} />} texto="CORRE SOLA" t={t} at={T.corre} ok={T.corre + 0.5} />
        <Fila y={300} icono={<Servidor s={34} t={t} />} texto="EN UN VPS" t={t} at={T.vps - 0.1} ok={T.vps + 0.35} />
        <Fila y={360} icono={<Monitor s={36} tachado={ramp(t, T.sinPantalla, T.sinPantalla + 0.4)} />} texto="SIN PANTALLA" t={t} at={T.sinPantalla - 0.05} ok={T.mire} />
      </Tarjeta>

      {/* 3 · mini-app */}
      <Tarjeta x={XS[2]} y={FILA} w={CW} h={CH} t={t} at={T.tres + 0.31} numero={3} tenue={tenue(2)} activa={ramp(t, T.c3 - 0.1, T.c3 + 0.3) * (1 - 0.4 * ramp(t, T.marcha + 0.3, T.marcha + 0.7)) + 0.4 * ramp(t, hecha[2], hecha[2] + 0.3)} out={hasta}>
        {(() => {
          const v = vis(t, T.c3 + 0.1, Infinity, 0.4);
          if (!v.on) return null;
          const sube = sp(t, T.desplegada, { damping: 12, stiffness: 160 });
          return (
            <div style={{ position: "absolute", left: CW / 2 - 60, top: 22 - 14 * sube, width: 120, height: 124, opacity: v.opacity, transform: `scale(${v.scale})` }}>
              <Movil s={120} encendido={ramp(t, T.pantalla - 0.1, T.pantalla + 0.35)} />
              {/* destello de despliegue */}
              {t > T.desplegada && <div style={{ position: "absolute", left: 10, right: 10, top: 118, height: 8, borderRadius: 4, background: C.acento, opacity: 1 - ramp(t, T.desplegada, T.desplegada + 0.6), transform: `scaleX(${0.4 + ramp(t, T.desplegada, T.desplegada + 0.6)})` }} />}
            </div>
          );
        })()}
        <Titulo texto="MINI-APP" t={t} at={T.app} />
        <Fila y={240} icono={<Codigo s={34} />} texto="A MEDIDA" t={t} at={T.medida - 0.05} ok={T.medida + 0.35} />
        <Fila y={300} icono={<Monitor s={36} encendido={ramp(t, T.pantalla - 0.1, T.pantalla + 0.35)} />} texto="CON PANTALLA" t={t} at={T.pantalla - 0.2} ok={T.pantalla + 0.35} />
        <Fila y={360} icono={<Cohete s={36} t={t} llama={ramp(t, T.desplegada, T.desplegada + 0.2)} />} texto="DESPLEGADA" t={t} at={T.desplegada - 0.05} ok={T.desplegada + 0.4} />
        {/* en marcha: punto que late */}
        {(() => {
          const v = vis(t, T.marcha - 0.25, Infinity, 0.6);
          if (!v.on) return null;
          return (
            <div style={{ position: "absolute", left: 0, right: 0, top: 398, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: v.opacity, fontFamily: UI, fontWeight: 700, fontSize: 17, color: C.acentoSuave, letterSpacing: 1 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.acento, boxShadow: `0 0 ${8 + 8 * Math.abs(Math.sin(t * 4))}px ${C.acento}` }} />
              EN MARCHA
            </div>
          );
        })()}
      </Tarjeta>
    </Escena>
  );
};

export const eventosMeta = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.ini, sfx: "whoosh", vol: 0.25 },
    { t: T.meta, sfx: "golpe", vol: 0.4 },
    { t: T.tres + 0.05, sfx: "pop", vol: 0.35 },
    { t: T.tres + 0.18, sfx: "pop", vol: 0.3 },
    { t: T.tres + 0.31, sfx: "pop", vol: 0.3 },
    { t: T.listos, sfx: "tick", vol: 0.45 },
    { t: T.mire, sfx: "tick", vol: 0.45 },
    { t: T.marcha + 0.05, sfx: "tick", vol: 0.45 },
  ];
};
