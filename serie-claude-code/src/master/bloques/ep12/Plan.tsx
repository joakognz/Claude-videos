/**
 * EP.12 · Paso 3 (escena paso3): antes de tocar nada, Claude enseña el plan. Se marcan sus tres puntos al decirlos
 * (crear el proyecto, activar Gmail, preparar las credenciales); las credenciales son las llaves (llave grande) y,
 * si le falta un dato, Claude pregunta.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Caja, Ico, Insignia } from "../../componentes/ep12/Piezas12";
import { C, MONO, TITULO, UI, clamp01, ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "paso3";
const Y = 1140;

const tiempos = (L: Linea) => ({
  paso: L.en(E, "Paso"),
  antes: L.en(E, "Antes"),
  ensena: L.en(E, "enseña"),
  crear: L.en(E, "crear"),
  activar: L.en(E, "activar"),
  preparar: L.en(E, "preparar"),
  llaves: L.en(E, "llaves"),
  falta: L.en(E, "falta"),
  pregunta: L.en(E, "pregunta."),
});

export const Plan: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: Y - 40, z: 1.0 },
    { t: T.crear - 0.3, x: 540, y: Y, z: 1.04, d: 1.2 },
    { t: T.falta - 0.4, x: 540, y: Y + 60, z: 1.0, d: 0.8 },
  ];
  const items = [
    { at: T.crear, titulo: "Crear el proyecto", detalle: <span style={{ fontFamily: MONO, fontWeight: 500 }}>pedidos-floristeria</span>, icono: <Ico ruta="linea-coral/carpeta" s={50} /> },
    { at: T.activar, titulo: "Activar Gmail", detalle: "para leer los pedidos", icono: <Img src={staticFile(ep.logos.gmail)} style={{ width: 52 }} /> },
    { at: T.preparar, titulo: "Preparar las credenciales", detalle: "las llaves de la automatización", icono: <Ico ruta="linea-coral/llave" s={52} /> },
  ];
  const sube = ramp(t, T.falta - 0.3, T.falta + 0.2);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 3" x={540} y={740} t={t} at={T.paso} out={T.ensena + 0.4} size={64} />
      <Etiqueta texto="ANTES DE TOCAR NADA" x={540} y={840} t={t} at={T.antes} out={T.ensena + 0.5} size={34} variante="borde" />
      <Caja x={540} y={Y - 30 * sube} t={t} at={T.ensena - 0.1} desde={0.85}>
        <div style={{ width: 920, borderRadius: 30, background: C.panel, border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", padding: "30px 34px 34px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
            <Img src={staticFile(ep.logos.claude)} style={{ width: 54 }} />
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 46, color: C.texto }}>El plan</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 24, color: C.gris, letterSpacing: 1 }}>ANTES DE EMPEZAR</div>
          </div>
          {items.map((it, i) => {
            const s = sp(t, it.at, { damping: 14, stiffness: 190 });
            const marca = ramp(t, it.at + 0.25, it.at + 0.55);
            const foco = i === 2 ? ramp(t, T.llaves - 0.1, T.llaves + 0.3) * (1 - sube) : 0;
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 22, padding: "20px 22px", marginTop: i ? 16 : 0, borderRadius: 20,
                  background: foco > 0 ? `rgba(217,119,87,${0.16 * foco})` : C.panel2, border: `3px solid ${foco > 0.3 ? C.acento : C.borde}`,
                  opacity: clamp01(s * 1.6) * (s > 0 ? 1 : 0.15), transform: `translateX(${(1 - s) * 60}px)`,
                }}
              >
                <div style={{ width: 54, height: 54, borderRadius: 14, border: `4px solid ${C.acento}`, background: marca > 0.5 ? C.acento : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width={34} height={34} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.oscuro} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - marca)} /></svg>
                </div>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.gris, width: 34 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 38, color: C.texto, whiteSpace: "nowrap" }}>{it.titulo}</div>
                  <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 26, color: C.gris, marginTop: 4, whiteSpace: "nowrap" }}>{it.detalle}</div>
                </div>
                <div style={{ width: 70, display: "flex", justifyContent: "center", flexShrink: 0 }}>{it.icono}</div>
              </div>
            );
          })}
        </div>
      </Caja>
      {/* las credenciales son las llaves */}
      <Caja x={860} y={Y + 300} t={t} at={T.llaves - 0.05} out={T.falta - 0.2} rot={-18} desde={0.2}>
        <Ico ruta="dibujos/llave" s={250} style={{ filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))" }} />
      </Caja>
      <Etiqueta texto="LAS LLAVES DE TU AUTOMATIZACIÓN" x={470} y={Y + 410} t={t} at={T.llaves + 0.2} out={T.falta - 0.2} size={32} variante="acento" />
      {/* y si le falta un dato, pregunta */}
      <Caja x={540} y={Y + 420} t={t} at={T.falta} desde={0.7}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 30px 22px 22px", borderRadius: 26, background: C.panel2, border: `3px solid ${C.acento}`, boxShadow: "0 24px 60px rgba(0,0,0,0.55)" }}>
          <div style={{ transform: `scale(${sp(t, T.pregunta - 0.1, { damping: 9, stiffness: 240 })})` }}>
            <Insignia s={76} tipo="pregunta" />
          </div>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.texto }}>¿Uso la cuenta de la tienda?</div>
        </div>
      </Caja>
    </Escena>
  );
};

export const eventosPlan = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso, sfx: "golpe", vol: 0.45 },
    { t: T.ensena - 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.crear + 0.25, sfx: "tick", vol: 0.45 },
    { t: T.activar + 0.25, sfx: "tick", vol: 0.45 },
    { t: T.preparar + 0.25, sfx: "tick", vol: 0.45 },
    { t: T.llaves - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.falta, sfx: "pop", vol: 0.4 },
  ];
};
