/**
 * EP.9 · Parte 1 · PASO 1 «Dale memoria» (escena memoria): Visual Studio Code con CLAUDE.md, las reglas se teclean
 * con la voz (panadería, colores tostados con sus muestras, trato cercano) → sello UNA SOLA VEZ → el archivo se
 * convierte en la ficha del empleado nuevo (PRIMER DÍA) → tres sesiones la leen y los bocadillos repetidos se tachan
 * → rejilla pequeña con el EP.5 encendido.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { P, SERIF } from "../../componentes/ep09/Panaderia";
import { IcoCheck, IcoFicha, IcoPersona, MiniRejilla, Pos } from "../../componentes/ep09/Piezas9";
import { C, EASE, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "memoria";
const tiempos = (L: Linea) => ({
  paso: L.en(E, "Paso"),
  dale: L.en(E, "Dale"),
  archivo: L.en(E, "archivo"),
  claudemd: L.en(E, "CLAUDE.md"),
  escribes: L.en(E, "escribes"),
  reglas: L.en(E, "reglas"),
  sola: L.en(E, "sola"),
  es: L.en(E, "es"),
  panaderia: L.en(E, "panadería,"),
  colores: L.en(E, "colores"),
  tostados: L.en(E, "tostados"),
  trato: L.en(E, "trato"),
  cercano: L.en(E, "cercano."),
  como: L.en(E, "Es como"),
  ficha: L.en(E, "ficha"),
  nuevo: L.en(E, "nuevo"),
  primer: L.en(E, "primer"),
  claude: L.en(E, "Claude"),
  lee: L.en(E, "lee"),
  sesion: L.en(E, "sesión,"),
  tu: L.en(E, "tú"),
  repetirte: L.en(E, "repetirte."),
  vimos: L.en(E, "Lo vimos"),
  cinco: L.en(E, "5."),
  fin: L.fin(E),
});

const REGLAS = (T: ReturnType<typeof tiempos>) => [
  { txt: "# Reglas del proyecto", a: T.escribes, b: T.sola, color: C.acentoSuave },
  { txt: "- Web de una panadería", a: T.es, b: T.panaderia + 0.5, color: "#E6E6E6" },
  { txt: "- Colores tostados", a: T.colores, b: T.tostados + 0.5, color: "#E6E6E6" },
  { txt: "- Trato cercano", a: T.trato, b: T.cercano + 0.4, color: "#E6E6E6" },
];

const escribe = (txt: string, t: number, a: number, b: number) => txt.slice(0, Math.round(clamp01((t - a) / Math.max(0.25, b - a)) * txt.length));

export const Memoria: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const reglas = REGLAS(T);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 1.0 },
    { t: T.archivo - 0.3, x: 540, y: 1170, z: 1.04, d: 0.9 },
    { t: T.colores - 0.2, x: 560, y: 1200, z: 1.1, d: 0.8 },
    { t: T.como - 0.3, x: 540, y: 1920, z: 1.0, d: 1.0 },
    { t: T.claude - 0.3, x: 540, y: 2160, z: 0.97, d: 0.9 },
    { t: T.vimos - 0.3, x: 540, y: 2960, z: 1.0, d: 0.9 },
  ];
  const fueraEditor = T.como + 0.25;
  const vEd = vis(t, T.archivo - 0.15, fueraEditor, 0.8);
  const vFicha = vis(t, T.ficha - 0.2, T.vimos + 0.2, 0.6);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 1" x={540} y={740} t={t} at={T.paso} out={T.archivo + 0.2} size={60} rot={-5} />
      <Etiqueta texto="DALE MEMORIA" x={540} y={880} t={t} at={T.dale} out={fueraEditor} size={56} variante="texto" fuente="titulo" />

      {/* ── CLAUDE.md en el editor ── */}
      {vEd.on && (
        <div style={{ position: "absolute", left: 90, top: 980, opacity: vEd.opacity, transform: `translateY(${vEd.y}px) scale(${vEd.scale})`, transformOrigin: "50% 0" }}>
          <div style={{ width: 900, height: 520, borderRadius: 24, overflow: "hidden", background: "#1E1E1E", border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.65)", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 60, background: "#2B2B2B", display: "flex", alignItems: "center", gap: 12, padding: "0 22px" }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c, opacity: 0.85 }} />
              ))}
              <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
                <Img src={staticFile(ep.logos.vscode)} style={{ width: 30 }} />
                <div style={{ fontFamily: UI, fontSize: 24, color: "#BBBBBB", fontWeight: 600 }}>web-panaderia</div>
              </div>
              <div style={{ width: 80 }} />
            </div>
            <div style={{ height: 56, background: "#252526", display: "flex" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px", background: "#1E1E1E", borderTop: `3px solid ${C.acento}` }}>
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#519ABA" strokeWidth={2.4}><path d="M4 6 V18 M4 6 L9 12 L14 6 V18 M18 6 V18 M15.5 15.5 L18 18 L20.5 15.5" /></svg>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: "#E6E6E6" }}>CLAUDE.md</div>
              </div>
            </div>
            <div style={{ flex: 1, padding: "26px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              {reglas.map((r, k) => {
                const txt = escribe(r.txt, t, r.a, r.b);
                const activa = t >= r.a && t < r.b + 0.1;
                return (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 22, height: 48 }}>
                    <div style={{ width: 30, fontFamily: MONO, fontSize: 24, color: "#5A5A5A", textAlign: "right" }}>{k + 1}</div>
                    <div style={{ fontFamily: MONO, fontWeight: k === 0 ? 700 : 500, fontSize: 36, color: r.color, whiteSpace: "nowrap" }}>
                      {txt}
                      {activa && <span style={{ display: "inline-block", width: 4, height: 38, marginLeft: 4, verticalAlign: "middle", background: C.acento, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
                    </div>
                    {k === 2 && t > T.tostados && (
                      <div style={{ display: "flex", gap: 10, marginLeft: 8 }}>
                        {[P.crema, P.mostaza, P.pan, P.miga, P.tinta].map((c, j) => {
                          const e = sp(t, T.tostados + j * 0.08, { damping: 10, stiffness: 240 });
                          return <div key={c} style={{ width: 40, height: 40, borderRadius: 10, background: c, border: "3px solid #F6ECD6", transform: `scale(${e})` }} />;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <Logo src={ep.logos.claude_code} x={930} y={990} w={140} t={t} at={T.claudemd} out={fueraEditor} />
      <Sello texto="UNA SOLA VEZ" x={760} y={1540} t={t} at={T.sola} out={fueraEditor} size={50} rot={-6} />

      {/* ── la ficha del empleado nuevo ── */}
      {vFicha.on && (
        <div style={{ position: "absolute", left: 540, top: 1890, width: 0, height: 0, opacity: vFicha.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vFicha.y}px) scale(${vFicha.scale}) rotate(${-2 + (1 - vFicha.s) * 8}deg)`, width: 640, borderRadius: 28, background: P.papel, border: `5px solid ${P.tinta}`, boxShadow: `12px 12px 0 ${P.tinta}, 0 40px 90px rgba(0,0,0,0.5)`, padding: "70px 44px 40px", boxSizing: "border-box" }}>
            <div style={{ position: "absolute", left: "50%", top: -34, transform: "translateX(-50%)", width: 170, height: 64, borderRadius: 16, background: "#9AA3B2", border: `5px solid ${P.tinta}` }} />
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
              <IcoFicha s={60} color={P.tinta} grosor={2.4} />
              <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 48, color: P.tinta, whiteSpace: "nowrap" }}>Ficha del proyecto</div>
            </div>
            {["Web de una panadería", "Colores tostados", "Trato cercano"].map((r) => (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: UI, fontWeight: 700, fontSize: 36, color: P.tinta, padding: "8px 0", borderBottom: `3px dashed #C9B998` }}>
                <IcoCheck s={38} color={P.coral} grosor={3} />
                {r}
              </div>
            ))}
          </div>
        </div>
      )}
      <Pos x={890} y={1660} t={t} at={T.nuevo - 0.05} out={T.vimos + 0.2} rot={8}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderRadius: 999, background: C.acento, boxShadow: `0 12px 40px ${C.acento}66` }}>
          <IcoPersona s={44} color={C.oscuro} grosor={2.6} />
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 38, color: C.oscuro }}>NUEVO</span>
        </div>
      </Pos>
      <Etiqueta texto="PRIMER DÍA" x={210} y={2210} t={t} at={T.primer} out={T.claude + 0.2} size={40} variante="borde" fuente="titulo" />

      {/* ── la lee en cada sesión ── */}
      {[0, 1, 2].map((k) => {
        const x = 180 + k * 360;
        const at = T.claude + k * 0.28;
        const v = vis(t, at, T.vimos + 0.2, 0.6);
        if (!v.on) return null;
        const lee = sp(t, T.lee + k * 0.25, { damping: 11, stiffness: 200 });
        const tacha = ramp(t, T.repetirte - 0.15 + k * 0.1, T.repetirte + 0.25 + k * 0.1, EASE);
        return (
          <div key={k} style={{ position: "absolute", left: x, top: 2420, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, width: 330, height: 290, borderRadius: 26, background: C.panel, border: `3px solid ${lee > 0.5 ? C.acento : C.borde}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Img src={staticFile(ep.logos.claude)} style={{ width: 46 }} />
                <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 38, color: C.texto }}>Sesión {k + 1}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 14, background: P.papel, transform: `scale(${0.6 + 0.4 * Math.min(1, lee)})`, opacity: Math.min(1, lee * 2) }}>
                <IcoFicha s={40} color={P.tinta} grosor={2.4} />
                <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 32, color: P.tinta }}>leída</span>
                <IcoCheck s={38} color={P.coral} grosor={3} />
              </div>
              {t > T.tu - 0.1 && (
                <div style={{ position: "relative", padding: "6px 14px", borderRadius: 12, background: C.panel2, fontFamily: UI, fontWeight: 600, fontSize: 25, color: C.gris, whiteSpace: "nowrap", opacity: clamp01((t - T.tu + 0.1) / 0.2) * (1 - 0.5 * tacha) }}>
                  «es una panadería…»
                  <div style={{ position: "absolute", left: 8, top: "50%", height: 4, width: `${tacha * 92}%`, background: C.acento, borderRadius: 2 }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <Etiqueta texto="EN CADA SESIÓN" x={540} y={2620} t={t} at={T.sesion - 0.1} out={T.repetirte - 0.05}size={40} variante="acento" fuente="titulo" />
      <Etiqueta texto="DEJAS DE REPETIRTE" x={540} y={2620} t={t} at={T.repetirte} out={T.vimos + 0.2} size={40} variante="acento" fuente="titulo" />

      {/* ── EP.5 ── */}
      <MiniRejilla t={t} at={T.vimos - 0.1} out={hasta + 0.4} ep={5} x={540} y={2960} etiqueta="CLAUDE.md e /init" />
    </Escena>
  );
};

export const eventosMemoria = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.dale, sfx: "pop", vol: 0.35 },
    { t: T.archivo - 0.15, sfx: "whoosh", vol: 0.25 },
    { t: T.escribes, sfx: "tecleo", vol: 0.22, dur: T.sola - T.escribes },
    { t: T.sola + 0.12, sfx: "golpe", vol: 0.4 },
    { t: T.es, sfx: "tecleo", vol: 0.22, dur: T.cercano + 0.4 - T.es },
    { t: T.tostados, sfx: "pop", vol: 0.3 },
    { t: T.ficha - 0.2, sfx: "whoosh", vol: 0.3 },
    { t: T.nuevo, sfx: "pop", vol: 0.4 },
    { t: T.lee, sfx: "tick", vol: 0.35 },
    { t: T.lee + 0.25, sfx: "tick", vol: 0.35 },
    { t: T.lee + 0.5, sfx: "tick", vol: 0.35 },
    { t: T.repetirte, sfx: "whoosh", vol: 0.2 },
    { t: T.cinco, sfx: "pop", vol: 0.4 },
  ];
};
