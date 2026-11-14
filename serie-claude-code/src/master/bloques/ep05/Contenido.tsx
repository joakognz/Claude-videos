/**
 * EP.5 · bloque «Contenido» (escenas lee → sinnota):
 * Claude lee la nota al empezar cada conversación → cinco tarjetas con lo que contiene (qué es, para quién, estilo,
 * qué evitar, cómo trabajar), cada una al nombrarla → comparación SIN NOTA (confuso, repites todo) / CON NOTA
 * (arranca sabiendo cómo juegas).
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta } from "../../componentes/Sello";
import { C, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { IconoMd, Interrogantes, Medalla, Num, Picto, Pop } from "../../ep05/kit";
import { NotaAdhesiva } from "./Memoria";

const FILAS = [
  { texto: "Qué es el proyecto", pal: ["qué", 0], icono: "documento" },
  { texto: "Para quién es", pal: ["para", 0], icono: "usuarios" },
  { texto: "Qué estilo quieres", pal: ["qué", 1], icono: "paleta" },
  { texto: "Qué debe evitar", pal: ["qué", 2], icono: "stop" },
  { texto: "Cómo quieres que trabaje", pal: ["cómo", 0], icono: "engranaje" },
] as const;
const Y0 = 880;
const PASO = 138;
const SIN = { x: 290, y: 2440 };
const CON = { x: 790, y: 2440 };

const tiempos = (L: Linea) => ({
  ini: L.ini("lee"),
  lee: L.en("lee", "lee"),
  conversacion: L.en("lee", "conversación"),
  filas: FILAS.map((f) => L.en("lee", f.pal[0], f.pal[1])),
  sin: L.ini("sinnota"),
  repites: L.en("sinnota", "repites"),
  todo: L.en("sinnota", "todo"),
  cada: L.en("sinnota", "cada"),
  con: L.en("sinnota", "Con"),
  claude: L.en("sinnota", "Claude"),
  arranca: L.en("sinnota", "arranca"),
  juegas: L.en("sinnota", "juegas"),
});

export const Contenido: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 960, z: 1.02 },
    { t: T.conversacion - 0.2, x: 540, y: 980, z: 1.08, d: 0.8 },
    ...T.filas.map((f, i) => ({ t: f - 0.2, x: 540, y: Math.min(1210, 1000 + i * 55), z: 1.08 - i * 0.01, d: 0.8 })),
    { t: T.sin - 0.3, x: SIN.x + 20, y: SIN.y - 20, z: 1.28, d: 1.0 },
    { t: T.cada - 0.2, x: SIN.x + 40, y: SIN.y + 30, z: 1.2, d: 0.8 },
    { t: T.con - 0.2, x: 540, y: SIN.y, z: 0.98, d: 0.8 },
    { t: T.arranca - 0.15, x: CON.x - 30, y: CON.y - 20, z: 1.22, d: 0.8 },
    { t: T.juegas, x: 560, y: CON.y + 10, z: 1.0, d: 1.0 },
  ];
  const fueraA = T.sin;
  // tarjeta activa: la última nombrada
  const activa = T.filas.reduce((a, f, i) => (t >= f - 0.05 ? i : a), -1);
  // Claude con nota arranca
  const arr = sp(t, T.arranca, { damping: 12, stiffness: 140 });
  return (
    <Escena t={t} tomas={tomas}>
      {/* cabecera: Claude lee la nota al empezar cada conversación */}
      <Pop x={170} y={700} t={t} at={T.lee - 0.05} out={fueraA} rot={-10}>
        <IconoMd size={104} />
      </Pop>
      <Pop x={260} y={672} t={t} at={T.lee} out={fueraA} ancla="izq">
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 54, color: C.texto }}>La lee al empezar</div>
      </Pop>
      <Pop x={260} y={744} t={t} at={T.conversacion - 0.05} out={fueraA} ancla="izq">
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: TITULO, fontWeight: 800, fontSize: 54, color: C.acento }}>
          <Picto nombre="bocadillo" size={52} />
          cada conversación
        </div>
      </Pop>
      {/* barrido de lectura sobre la nota */}
      {t > T.lee && t < T.lee + 1.2 && (
        <div style={{ position: "absolute", left: 120, top: 640 + ramp(t, T.lee, T.lee + 1.1) * 110, width: 100, height: 5, background: C.acento, opacity: 0.8, boxShadow: `0 0 18px ${C.acento}` }} />
      )}
      {FILAS.map((f, i) => {
        const v = vis(t, T.filas[i] - 0.05, fueraA, 0.7);
        if (!v.on) return null;
        const on = i === activa ? 1 : 0;
        return (
          <div key={i} style={{ position: "absolute", left: 70, top: Y0 + i * PASO - 58, width: 940, height: 116, opacity: v.opacity * (on ? 1 : 0.62), transform: `translateX(${(1 - v.s) * -60}px) scale(${0.96 + 0.04 * v.s + 0.02 * on})`, transformOrigin: "0 50%" }}>
            <div style={{ height: "100%", boxSizing: "border-box", borderRadius: 28, background: C.panel, border: `3px solid ${on ? C.acento : C.borde}`, boxShadow: on ? `0 0 40px ${C.acento}44` : "0 20px 50px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 26, padding: "0 30px" }}>
              <Num n={i + 1} size={64} />
              <IconoMd size={54} lineas={2} />
              <div style={{ flex: 1, fontFamily: UI, fontWeight: 700, fontSize: 42, color: C.texto }}>{f.texto}</div>
              <Medalla nombre={f.icono} size={74} activo={on} />
            </div>
          </div>
        );
      })}

      {/* ── SIN NOTA ── */}
      <Panel x={SIN.x} y={SIN.y} t={t} at={T.sin - 0.1} out={hasta + 0.4} tenue={1 - 0.45 * ramp(t, T.con, T.con + 0.4)} />
      <Etiqueta texto="SIN NOTA" x={SIN.x} y={SIN.y - 250} t={t} at={T.sin} out={hasta + 0.4} size={40} variante="gris" fuente="titulo" />
      {(() => {
        // Claude confuso: tiembla y queda tenue (el logo no se toca)
        const w = t > T.sin ? Math.sin((t - T.sin) * 9) * 7 : 0;
        return <Logo src={ep.logos.claude} x={SIN.x} y={SIN.y - 30} w={170} t={t} at={T.sin + 0.05} tenue={0.5} rot={w} sombra={false} />;
      })()}
      <Interrogantes x={SIN.x} y={SIN.y - 30} t={t} at={T.sin + 0.15} out={hasta + 0.4} r={150} n={4} size={60} />
      {(() => {
        const v = vis(t, T.repites - 0.05, hasta + 0.4, 0.4);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: SIN.x - 150, top: SIN.y - 180, opacity: v.opacity * 0.85, transform: `scale(${v.scale}) rotate(${(t - T.repites) * -140}deg)` }}>
            <Picto nombre="bucle" size={300} color={C.acento} grosor={1.1} />
          </div>
        );
      })()}
      {[T.repites, T.todo, T.cada].map((at, i) => (
        <Pop key={i} x={SIN.x - 110 + i * 110} y={SIN.y + 150} t={t} at={at} out={hasta + 0.4} rot={-8}>
          <div style={{ padding: "10px 20px", borderRadius: 22, background: C.panel2, border: `3px solid ${C.borde}`, fontFamily: TITULO, fontWeight: 800, fontSize: 34, color: C.gris }}>…</div>
        </Pop>
      ))}
      <Etiqueta texto="REPITES TODO" x={SIN.x} y={SIN.y + 245} t={t} at={T.cada} out={hasta + 0.4} size={34} variante="borde" fuente="titulo" />

      {/* ── CON NOTA ── */}
      <Panel x={CON.x} y={CON.y} t={t} at={T.con - 0.1} out={hasta + 0.4} acento={ramp(t, T.con, T.con + 0.4)} />
      <Etiqueta texto="CON NOTA" x={CON.x} y={CON.y - 250} t={t} at={T.con} out={hasta + 0.4} size={40} variante="acento" fuente="titulo" />
      {/* estelas de arranque */}
      {t > T.arranca &&
        [0, 1, 2].map((k) => {
          const u = clamp01((t - T.arranca - k * 0.06) / 0.5);
          return <div key={k} style={{ position: "absolute", left: CON.x - 60 + k * 50, top: CON.y + 40 - 30 * arr, width: 8, height: 110 * Math.sin(u * Math.PI), background: C.acento, borderRadius: 4, opacity: 0.7 }} />;
        })}
      <div style={{ position: "absolute", left: 0, top: -40 * arr }}>
        <Logo src={ep.logos.claude} x={CON.x} y={CON.y - 30} w={170} t={t} at={T.con + 0.05} sombra={false} pulsos={[T.claude]} />
        <Pop x={CON.x + 115} y={CON.y + 50} t={t} at={T.con + 0.15} out={hasta + 0.4} rot={14}>
          <div style={{ transform: "rotate(8deg)" }}>
            <NotaAdhesiva size={92} />
          </div>
        </Pop>
      </div>
      <Pop x={CON.x - 120} y={CON.y + 60} t={t} at={T.claude} out={hasta + 0.4}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Picto nombre="check" size={46} color={C.oscuro} grosor={3.2} dibujo={ramp(t, T.claude, T.claude + 0.35)} />
        </div>
      </Pop>
      <Etiqueta texto="SABE CÓMO JUEGAS" x={CON.x} y={CON.y + 245} t={t} at={T.juegas - 0.05} out={hasta + 0.4} size={34} variante="acento" fuente="titulo" />
    </Escena>
  );
};

const Panel: React.FC<{ x: number; y: number; t: number; at: number; out: number; tenue?: number; acento?: number }> = ({ x, y, t, at, out, tenue = 1, acento = 0 }) => {
  const v = vis(t, at, out, 0.85);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x - 225, top: y - 310, width: 450, height: 620, borderRadius: 40, background: C.panel, border: `3px solid ${acento > 0.3 ? C.acento : C.borde}`, opacity: v.opacity * tenue, transform: `scale(${v.scale})`, boxShadow: `0 40px 90px rgba(0,0,0,0.5), 0 0 ${50 * acento}px ${C.acento}33` }} />
  );
};

export const eventosContenido = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.lee, sfx: "pop", vol: 0.35 },
    ...T.filas.map((f) => ({ t: f, sfx: "pop" as const, vol: 0.35 })),
    { t: T.sin, sfx: "whoosh", vol: 0.25 },
    { t: T.repites, sfx: "tick", vol: 0.3 },
    { t: T.con, sfx: "pop", vol: 0.4 },
    { t: T.claude + 0.1, sfx: "tick", vol: 0.5 },
    { t: T.arranca, sfx: "whoosh", vol: 0.3 },
  ];
};
