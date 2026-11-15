/**
 * Bloque «Pasos 1 y 2» (escenas paso1 → paso2 → paso2b → paso2c): la petición se teclea en el chat de Claude Code y
 * se envía; antes de tocar nada cae un marcador (checkpoint) en la línea de tiempo; cada petición nueva deja otro;
 * después, el contador de los 100 más recientes, guardados junto a la conversación, también otro día.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Barras, Caja, CajaTexto, Imagen, Mensaje, PETICION_1, Paso, PasosHud, Ventana, pulso, tecleo } from "../componentes/Interfaz";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE_OUT, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => {
  const p1 = L.ini("paso1");
  const pides = L.en("paso1", "Pides");
  const con = L.en("paso1", "con");
  const fin1 = L.fin("paso1");
  const p2 = L.ini("paso2");
  const punto = L.en("paso2", "punto");
  const cada = L.ini("paso2b");
  const haces = L.en("paso2b", "haces");
  const punto2 = L.en("paso2b", "punto");
  const envia = Math.min(fin1 + 0.05, p2 - 0.2);
  // cada mensaje nuevo deja su marcador un instante después
  const mensajes = [envia, cada + 0.05, haces, punto2 + 0.1];
  const plantas = [punto + 0.1, cada + 0.3, haces + 0.25, punto2 + 0.35];
  return {
    p1, pides, con, fin1, p2, punto, cada, haces, punto2, envia, mensajes, plantas,
    antes: L.en("paso2", "Antes"),
    claude: L.en("paso2", "Claude"),
    checkpoint: L.en("paso2", "checkpoint"),
    solo: L.en("paso2", "solo"),
    nuevo: L.en("paso2b", "nuevo"),
    guarda: L.ini("paso2c"),
    cien: L.en("paso2c", "cien"),
    recientes: L.en("paso2c", "recientes"),
    conserva: L.en("paso2c", "conserva"),
    conversacion: L.en("paso2c", "conversación"),
    asi: L.en("paso2c", "Así"),
    otro: L.en("paso2c", "otro"),
    fin: L.fin("paso2c"),
  };
};

const VY = 980; // centro de la ventana del chat
const LY = 1430; // línea de tiempo
const MX = [200, 390, 580, 770];
const Y0 = 2460; // centro de la estación «100 más recientes»

export const Pasos12: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1150, z: 0.96 },
    { t: T.pides - 0.2, x: 540, y: 1040, z: 1.12, d: 0.9 },
    { t: T.p2 - 0.25, x: 540, y: 1150, z: 1.0, d: 0.8 },
    { t: T.punto - 0.35, x: 500, y: 1165, z: 1.03, d: 0.9 },
    { t: T.checkpoint - 0.3, x: 540, y: 1160, z: 0.99, d: 0.9 },
    { t: T.cada - 0.25, x: 560, y: 1150, z: 0.97, d: 0.9 },
    { t: T.guarda - 0.35, x: 540, y: Y0 - 170, z: 1.05, d: 1.0 },
    { t: T.conserva - 0.3, x: 540, y: Y0 - 22, z: 0.97, d: 1.0 },
  ];
  const fueraA = T.guarda - 0.15;
  // chat: mensajes apilados hacia arriba
  const ALTOS = [132, 80, 80, 80];
  const subida = (i: number) => ALTOS.slice(i + 1).reduce((acc, h, k) => acc + (h + 14) * sp(t, T.mensajes[i + 1 + k], { damping: 16, stiffness: 180 }), 0);
  const escrito = t < T.envia ? tecleo(PETICION_1, t, T.pides + 0.15, T.con + 0.55) : "";
  const pensando = t > T.envia + 0.25;
  // mascota de Claude Code: va por delante del último marcador y da un saltito al dejar cada uno
  const mascotaX = MX[0] - 10 + T.plantas.reduce((acc, a, k) => acc + (k === 0 ? 150 : 190) * sp(t, a, { damping: 15, stiffness: 150 }), 0);
  const salto = T.plantas.reduce((acc, a) => acc + pulso(t, a - 0.12, 0.34), 0);
  const cuenta = Math.round(4 + 96 * ramp(t, T.cien - 0.25, T.cien + 0.75, EASE_OUT));
  const llenas = ramp(t, T.cien - 0.25, T.cien + 0.75, EASE_OUT) * 100;
  const hoja = sp(t, T.otro - 0.05, { damping: 14, stiffness: 170 });
  return (
    <>
      <Escena t={t} tomas={tomas}>
        {/* chat de Claude Code */}
        <Ventana x={540} y={VY} w={920} h={500} t={t} at={T.pides - 0.15} out={fueraA} titulo="Claude Code" logo={ep.logos.vscode} logoTab={ep.logos.claude}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 150, overflow: "hidden" }}>
            {T.mensajes.map((a, i) => {
              const s = sp(t, a, { damping: 15, stiffness: 190 });
              if (t < a) return null;
              return (
                <div key={i} style={{ position: "absolute", right: 34, bottom: 16 + subida(i), opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 60}px) scale(${0.9 + 0.1 * s})`, transformOrigin: "100% 100%" }}>
                  {i === 0 ? (
                    <Mensaje texto={PETICION_1} size={34} style={{ width: 640, height: ALTOS[0], boxSizing: "border-box" }} />
                  ) : (
                    <Mensaje texto={<Barras anchos={[260 + i * 40, 150 + i * 30]} color={C.gris} alto={11} hueco={12} />} size={34} style={{ height: ALTOS[i], boxSizing: "border-box" }} />
                  )}
                </div>
              );
            })}
            {pensando && t < T.cada && (
              <div style={{ position: "absolute", left: 40, bottom: 18, display: "flex", alignItems: "center", gap: 14, opacity: ramp(t, T.envia + 0.25, T.envia + 0.5) * (1 - ramp(t, T.cada - 0.2, T.cada)) }}>
                <Img src={staticFile(ep.logos.claude)} style={{ width: 46, transform: `rotate(${t * 90}deg)` }} />
                {[0, 1, 2].map((k) => (
                  <div key={k} style={{ width: 14, height: 14, borderRadius: "50%", background: C.acento, opacity: 0.35 + 0.65 * Math.abs(Math.sin(t * 4 - k * 0.7)) }} />
                ))}
              </div>
            )}
          </div>
          <div style={{ position: "absolute", left: 34, right: 34, bottom: 24 }}>
            <CajaTexto w={852} t={t} texto={escrito} activo={t < T.envia + 0.1} size={34} vacio="Escribe tu petición…" />
          </div>
        </Ventana>
        <Etiqueta texto="CON TUS PALABRAS" x={540} y={1330} t={t} at={T.con - 0.05} out={T.p2 - 0.05} size={46} variante="acento" fuente="titulo" />

        {/* línea de tiempo con los puntos de guardado */}
        {(() => {
          const v = vis(t, T.antes - 0.1, fueraA, 0.9);
          if (!v.on) return null;
          const p = ramp(t, T.antes - 0.1, T.antes + 0.6, EASE_OUT);
          return (
            <div style={{ position: "absolute", left: 90, top: LY - 5, width: 900 * p, height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${C.acento}, ${C.tenue})`, opacity: v.opacity }} />
          );
        })()}
        <Etiqueta texto="ANTES DE TOCAR NADA" x={540} y={1330} t={t} at={T.antes} out={T.punto - 0.1} size={40} variante="borde" fuente="titulo" />
        {MX.map((x, i) => {
          const a = T.plantas[i];
          if (t < a) return null;
          const s = sp(t, a, { damping: 9, stiffness: 210 });
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: x - 13, top: LY - 13, width: 26, height: 26, borderRadius: "50%", background: C.acento, boxShadow: `0 0 20px ${C.acento}`, opacity: fueraA > t ? 1 - ramp(t, fueraA - 0.35, fueraA) : 0 }} />
              {ep.iconos?.marcador && <Imagen src={ep.iconos.marcador} x={x} y={LY - 108 - (1 - Math.min(1, s)) * 200} w={104} t={t} at={a} out={fueraA} rot={i % 2 ? 4 : -4} desde={0.8} />}
            </React.Fragment>
          );
        })}
        {(() => {
          const v = vis(t, T.claude - 0.05, fueraA, 0.4);
          if (!v.on) return null;
          return (
            <div style={{ position: "absolute", left: mascotaX - 62, top: LY - 92 - salto * 46, opacity: v.opacity, transform: `scale(${v.scale})` }}>
              <Img src={staticFile(ep.logos.claude_code)} style={{ width: 124, display: "block" }} />
            </div>
          );
        })()}
        <Sello texto="CHECKPOINT = PUNTO DE GUARDADO" x={540} y={1535} t={t} at={T.checkpoint} out={T.cada - 0.1} size={40} rot={-2} />
        <Etiqueta texto="SE HACE SOLO" x={540} y={1640} t={t} at={T.solo - 0.2} out={T.cada - 0.1} size={40} variante="acento" fuente="titulo" />
        <Etiqueta texto="1 PETICIÓN = 1 PUNTO DE GUARDADO" x={540} y={1560} t={t} at={T.punto2 - 0.1} out={fueraA} size={42} variante="borde" fuente="titulo" />

        {/* los 100 más recientes */}
        {ep.iconos?.marcador && <Imagen src={ep.iconos.marcador} x={250} y={Y0 - 350} w={150} t={t} at={T.guarda} out={hasta + 0.4} rot={-6} escala={1 + 0.08 * pulso(t, T.cien + 0.75)} />}
        {(() => {
          const v = vis(t, T.guarda + 0.1, hasta + 0.4, 0.6);
          if (!v.on) return null;
          return (
            <div style={{ position: "absolute", left: 360, top: Y0 - 350, width: 0, height: 0 }}>
              <div style={{ position: "absolute", transform: `translate(0, -50%) scale(${v.scale * (1 + 0.1 * pulso(t, T.cien + 0.75))})`, transformOrigin: "0 50%", opacity: v.opacity, fontFamily: TITULO, fontWeight: 800, fontSize: 250, letterSpacing: -8, color: C.texto, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{cuenta}</div>
            </div>
          );
        })()}
        {(() => {
          const v = vis(t, T.guarda + 0.2, hasta + 0.4, 0.9);
          if (!v.on) return null;
          return (
            <div style={{ position: "absolute", left: 540 - 380, top: Y0 - 200, width: 760, display: "grid", gridTemplateColumns: "repeat(20, 30px)", gap: 8.4, opacity: v.opacity }}>
              {Array.from({ length: 100 }, (_, i) => {
                const on = clamp01(llenas - i);
                return <div key={i} style={{ width: 30, height: 30, borderRadius: 8, background: on > 0 ? C.acento : C.panel2, border: `2px solid ${on > 0 ? C.acento : C.borde}`, opacity: 0.35 + 0.65 * on, transform: `scale(${0.7 + 0.3 * on})` }} />;
              })}
            </div>
          );
        })()}
        <Etiqueta texto="LOS 100 MÁS RECIENTES" x={540} y={Y0 + 50} t={t} at={T.recientes - 0.1} out={hasta + 0.4} size={50} variante="borde" fuente="titulo" />
        {/* junto a la conversación */}
        <Caja x={110} y={Y0 + 150} w={860} h={150} t={t} at={T.conserva - 0.05} out={hasta + 0.4} style={{ borderRadius: 34, background: C.panel, border: `3px solid ${C.borde}`, display: "flex", alignItems: "center", gap: 30, padding: "0 36px" }}>
          <svg width={96} height={96} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d="M4 4.5 h16 a1.5 1.5 0 0 1 1.5 1.5 v9.5 a1.5 1.5 0 0 1 -1.5 1.5 h-9 l-4.5 3.5 v-3.5 h-2.5 a1.5 1.5 0 0 1 -1.5 -1.5 v-9.5 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="none" stroke={C.acento} strokeWidth={1.9} strokeLinejoin="round" />
            <path d="M7 9 h10 M7 12.5 h6" stroke={C.acento} strokeWidth={1.7} strokeLinecap="round" />
          </svg>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 42, color: C.texto, lineHeight: 1.15 }}>
            Guardados junto a
            <br />
            <span style={{ color: C.acento }}>la conversación</span>
          </div>
        </Caja>
        {ep.iconos?.marcador && <Imagen src={ep.iconos.marcador} x={880} y={Y0 + 215} w={74} t={t} at={T.conversacion} out={hasta + 0.4} rot={8} />}
        {/* otro día */}
        <Caja x={110} y={Y0 + 330} w={860} h={150} t={t} at={T.asi - 0.05} out={hasta + 0.4} style={{ borderRadius: 34, background: C.panel, border: `3px solid ${C.borde}`, display: "flex", alignItems: "center", gap: 30, padding: "0 36px" }}>
          <div style={{ width: 96, height: 96, borderRadius: 18, border: `4px solid ${C.acento}`, overflow: "hidden", flexShrink: 0, boxSizing: "border-box", background: C.panel2 }}>
            <div style={{ height: 24, background: C.acento }} />
            <div style={{ position: "relative", height: 64, overflow: "hidden" }}>
              {["HOY", "MAÑANA"].map((d, k) => (
                <div key={d} style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: k ? 17 : 26, color: C.texto, transform: `translateY(${(k - hoja) * 64}px)` }}>{d}</div>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 42, color: C.texto, lineHeight: 1.15 }}>
            Puedes volver atrás
            <br />
            <span style={{ color: C.acento }}>incluso otro día</span>
          </div>
        </Caja>
      </Escena>
      <Paso n={1} t={t} at={T.p1} out={T.pides - 0.02} />
      <Paso n={2} t={t} at={T.p2} out={T.antes - 0.02} />
      <PasosHud t={t} at={desde + 0.15} out={hasta + 0.5} inicios={[T.p1, T.p2, Infinity, Infinity, Infinity]} />
    </>
  );
};

export const eventosPasos12 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.p1 + 0.08, sfx: "golpe", vol: 0.6 },
    { t: T.pides + 0.15, sfx: "tecleo", vol: 0.3, dur: Math.max(0.3, T.con + 0.55 - T.pides - 0.15) },
    { t: T.envia, sfx: "envio", vol: 0.45 },
    { t: T.p2 + 0.08, sfx: "golpe", vol: 0.6 },
    ...T.plantas.map((a) => ({ t: a + 0.12, sfx: "tick" as const, vol: 0.5 })),
    ...T.mensajes.slice(1).map((a) => ({ t: a, sfx: "pop" as const, vol: 0.3 })),
    { t: T.checkpoint + 0.08, sfx: "golpe", vol: 0.5 },
    { t: T.guarda - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.cien + 0.75, sfx: "golpe", vol: 0.5 },
    { t: T.conserva, sfx: "pop", vol: 0.35 },
    { t: T.asi, sfx: "pop", vol: 0.35 },
    { t: T.otro, sfx: "tick", vol: 0.4 },
  ];
};
