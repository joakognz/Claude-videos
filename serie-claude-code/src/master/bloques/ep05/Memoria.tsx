/**
 * EP.5 · bloque «Memoria» (escenas hoy → empleado → nota):
 * HOY y el título → todo gira en torno a un archivo (iconos en órbita alrededor de CLAUDE.md) → Claude, empleado
 * nuevo que llega cada mañana sin recordar nada de ayer (bocadillo que se vacía), brillante (destellos) pero con la
 * memoria en blanco → la mesa y la nota adhesiva CLAUDE.md que cae sobre ella.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { C, MONO, TITULO, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Destellos, Frase, IconoMd, Medalla, Picto } from "../../ep05/kit";

const ORBITA = { x: 540, y: 1255, r: 250 };
const CLAUDE = { x: 540, y: 2360 };
const BOCADILLO = { x: 250, y: 2080 };
const MESA_Y = 2600;

const tiempos = (L: Linea) => ({
  hoy: L.ini("hoy"),
  preparamos: L.en("hoy", "preparamos"),
  el: L.en("hoy", "el"),
  proyecto: L.en("hoy", "proyecto"),
  antes: L.en("hoy", "antes"),
  de: L.en("hoy", "de"),
  empezar: L.en("hoy", "empezar"),
  todo: L.en("hoy", "todo"),
  gira: L.en("hoy", "gira"),
  archivo: L.en("hoy", "archivo"),
  claudemd: L.en("hoy", "CLAUDE.md"),
  imagina: L.ini("empleado"),
  claude: L.en("empleado", "Claude"),
  empleado: L.en("empleado", "empleado"),
  nuevo: L.en("empleado", "nuevo"),
  llega: L.en("empleado", "llega"),
  manana: L.en("empleado", "mañana"),
  sin: L.en("empleado", "sin"),
  nada: L.en("empleado", "nada"),
  ayer: L.en("empleado", "ayer"),
  brillante: L.en("empleado", "Brillante"),
  memoria: L.en("empleado", "memoria"),
  blanco: L.en("empleado", "blanco"),
  nota0: L.ini("nota"),
  nota: L.en("nota", "nota"),
  dejas: L.en("nota", "dejas"),
  mesa: L.en("nota", "mesa"),
});

const ICONOS_ORBITA = ["codigo", "paleta", "usuarios", "stop", "engranaje", "documento"];

export const Memoria: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 980, z: 0.98 },
    { t: T.preparamos - 0.1, x: 540, y: 930, z: 1.08, d: 0.8 },
    { t: T.todo - 0.25, x: 540, y: 1190, z: 1.0, d: 0.9 },
    { t: T.archivo - 0.2, x: 540, y: 1270, z: 1.14, d: 0.8 },
    { t: T.claudemd - 0.05, x: 540, y: 1300, z: 1.06, d: 0.7 },
    { t: T.imagina - 0.35, x: 540, y: 2330, z: 1.04, d: 1.0 },
    { t: T.empleado - 0.1, x: 540, y: 2420, z: 1.12, d: 0.8 },
    { t: T.llega - 0.15, x: 640, y: 2300, z: 1.04, d: 0.8 },
    { t: T.sin - 0.15, x: 470, y: 2250, z: 1.08, d: 0.8 },
    { t: T.brillante - 0.15, x: 540, y: 2360, z: 1.14, d: 0.7 },
    { t: T.memoria - 0.2, x: 470, y: 2300, z: 1.04, d: 0.8 },
    { t: T.nota0 - 0.15, x: 560, y: 2420, z: 0.98, d: 0.9 },
    { t: T.dejas - 0.1, x: 620, y: 2520, z: 1.12, d: 0.8 },
    { t: T.mesa + 0.2, x: 560, y: 2520, z: 1.04, d: 1.0 },
  ];
  const fueraA = T.imagina; // lo de la primera estación ya no se ve

  // nota adhesiva: aparece flotando al decir CLAUDE.md y cae a la mesa al decir «dejas»
  const notaVis = vis(t, T.nota0 - 0.05, Infinity, 0.5);
  const cae = sp(t, T.dejas - 0.05, { damping: 11, stiffness: 160 });
  const notaX = 770 + (740 - 770) * cae;
  const notaY = 2190 + (MESA_Y - 112 - 2190) * cae;
  const notaRot = -14 + 10 * cae + Math.sin((t - T.nota0) * 3) * 4 * (1 - cae);

  // bocadillo: «ayer» se borra y queda en blanco
  const borra = ramp(t, T.nada, T.ayer + 0.25);
  const blanco = ramp(t, T.memoria - 0.1, T.memoria + 0.3);

  return (
    <Escena t={t} tomas={tomas}>
      {/* ── estación A: hoy ── */}
      <Etiqueta texto="HOY" x={540} y={700} t={t} at={T.hoy + 0.05} out={T.todo + 0.3} size={40} variante="acento" fuente="titulo" />
      <div style={{ position: "absolute", left: 540, top: 840, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
          <Frase t={t} out={T.todo + 0.3} size={78} palabras={[{ w: "Preparamos", at: T.preparamos }, { w: "el", at: T.el }, { w: "proyecto", at: T.proyecto, acento: true }]} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 540, top: 945, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
          <Frase t={t} out={T.todo + 0.3} size={60} color={C.gris} palabras={[{ w: "antes", at: T.antes }, { w: "de", at: T.de }, { w: "empezar", at: T.empezar }]} />
        </div>
      </div>
      {/* órbita: todo gira en torno a un archivo */}
      {(() => {
        const v = vis(t, T.todo - 0.05, fueraA, 0.5);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: ORBITA.x - ORBITA.r, top: ORBITA.y - ORBITA.r, width: ORBITA.r * 2, height: ORBITA.r * 2, borderRadius: "50%", border: `3px dashed ${C.borde}`, opacity: v.opacity, transform: `scale(${v.scale}) rotate(${(t - T.todo) * 12}deg)` }} />
        );
      })()}
      {ICONOS_ORBITA.map((n, i) => {
        const at = T.todo + i * 0.12;
        const v = vis(t, at, fueraA, 0.3);
        if (!v.on) return null;
        const giro = sp(t, T.gira, { damping: 20, stiffness: 60 });
        const a = (i / ICONOS_ORBITA.length) * Math.PI * 2 - Math.PI / 2 + giro * 0.9 + Math.max(0, t - T.gira) * 0.5;
        const r = ORBITA.r * (0.6 + 0.4 * v.s);
        return (
          <div key={n} style={{ position: "absolute", left: ORBITA.x + Math.cos(a) * r - 48, top: ORBITA.y + Math.sin(a) * r - 48, opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <Medalla nombre={n} size={96} activo={t > T.archivo ? 0 : 1} />
          </div>
        );
      })}
      {(() => {
        const v = vis(t, T.archivo - 0.03, fueraA, 0.3);
        if (!v.on) return null;
        const golpe = Math.sin(clamp01((t - T.claudemd) / 0.3) * Math.PI) * 0.12;
        return (
          <div style={{ position: "absolute", left: ORBITA.x, top: ORBITA.y, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale * (1 + golpe)}) rotate(${(1 - v.s) * -16}deg)`, opacity: v.opacity, filter: `drop-shadow(0 0 ${30 * ramp(t, T.claudemd - 0.1, T.claudemd + 0.2)}px ${C.acento}88)` }}>
              <IconoMd size={190} />
            </div>
          </div>
        );
      })()}
      <Sello texto={<span style={{ fontFamily: MONO }}>CLAUDE.md</span>} x={540} y={1545} t={t} at={T.claudemd} out={fueraA} size={58} rot={-3} />

      {/* ── estación B: el empleado nuevo ── */}
      <Logo src={ep.logos.claude} x={CLAUDE.x} y={CLAUDE.y} w={230} t={t} at={T.claude - 0.03} pulsos={[T.nuevo, T.brillante]} />
      <Etiqueta texto="EMPLEADO NUEVO" x={CLAUDE.x} y={CLAUDE.y + 200} t={t} at={T.empleado} out={T.nota0 + 0.1} size={40} variante="borde" fuente="titulo" />
      {/* cada mañana: el sol sale */}
      {(() => {
        const v = vis(t, T.llega - 0.05, T.nota0, 0.4);
        if (!v.on) return null;
        const sube = sp(t, T.llega, { damping: 16, stiffness: 90 });
        return (
          <div style={{ position: "absolute", left: 815 - 70, top: 2190 - 70 + (1 - sube) * 90, opacity: v.opacity, transform: `rotate(${(t - T.llega) * 25}deg)` }}>
            <Picto nombre="sol" size={140} grosor={2} />
          </div>
        );
      })()}
      <Etiqueta texto="CADA MAÑANA" x={815} y={2310} t={t} at={T.manana} out={T.nota0} size={30} variante="gris" />
      {/* bocadillo de pensamiento: ayer → en blanco */}
      {(() => {
        const v = vis(t, T.sin - 0.05, T.nota0 + 0.2, 0.5);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: BOCADILLO.x, top: BOCADILLO.y, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})` }}>
              <div style={{ width: 300, height: 220, borderRadius: 110, background: `color-mix(in srgb, #FFFFFF ${Math.round(blanco * 92)}%, ${C.panel2})`, border: `4px solid ${blanco > 0.5 ? "#FFFFFF" : C.borde}`, boxShadow: blanco > 0 ? `0 0 ${60 * blanco}px rgba(255,255,255,0.35)` : "none", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <div style={{ opacity: 1 - borra, filter: `blur(${borra * 10}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <Picto nombre="calendario" size={64} color={C.texto} />
                  <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto }}>AYER</div>
                </div>
                {t > T.ayer - 0.1 && blanco < 1 && (
                  <div style={{ position: "absolute", opacity: 1 - blanco }}>
                    <Picto nombre="cruz" size={130} color={C.acento} grosor={3} dibujo={ramp(t, T.ayer - 0.1, T.ayer + 0.25)} />
                  </div>
                )}
              </div>
              {/* burbujas pequeñas hacia Claude */}
              <div style={{ position: "absolute", left: 230, top: 215, width: 36, height: 36, borderRadius: "50%", background: blanco > 0.5 ? "#FFFFFF" : C.panel2, border: `4px solid ${C.borde}` }} />
              <div style={{ position: "absolute", left: 268, top: 258, width: 20, height: 20, borderRadius: "50%", background: blanco > 0.5 ? "#FFFFFF" : C.panel2, border: `3px solid ${C.borde}` }} />
            </div>
          </div>
        );
      })()}
      <Destellos x={CLAUDE.x} y={CLAUDE.y} t={t} at={T.brillante} out={T.memoria} r={190} />
      <Etiqueta texto="BRILLANTE" x={CLAUDE.x + 10} y={CLAUDE.y - 210} t={t} at={T.brillante + 0.05} out={T.memoria} size={38} variante="acento" fuente="titulo" />
      <Etiqueta texto="MEMORIA EN BLANCO" x={BOCADILLO.x + 40} y={BOCADILLO.y - 160} t={t} at={T.memoria} out={T.nota0 + 0.2} size={34} variante="borde" fuente="titulo" />

      {/* ── la mesa y la nota ── */}
      {(() => {
        const v = vis(t, T.nota0 - 0.1, Infinity, 0.9);
        if (!v.on) return null;
        const brillo = ramp(t, T.mesa - 0.1, T.mesa + 0.3);
        return (
          <div style={{ position: "absolute", left: 90, top: MESA_Y + (1 - v.s) * 120, opacity: v.opacity, width: 900 }}>
            <div style={{ height: 46, borderRadius: 14, background: `linear-gradient(180deg, #5A4636 0%, #3E3027 100%)`, border: `3px solid ${brillo > 0.3 ? C.acento : "#6B5444"}`, boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 ${40 * brillo}px ${C.acento}55` }} />
            <div style={{ position: "absolute", left: 70, top: 46, width: 34, height: 190, background: "#3E3027", borderRadius: "0 0 8px 8px" }} />
            <div style={{ position: "absolute", right: 70, top: 46, width: 34, height: 190, background: "#3E3027", borderRadius: "0 0 8px 8px" }} />
          </div>
        );
      })()}
      {notaVis.on && (
        <div style={{ position: "absolute", left: notaX, top: notaY, width: 0, height: 0 }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${notaVis.scale}) rotate(${notaRot}deg)`, opacity: notaVis.opacity }}>
            <NotaAdhesiva size={210} />
          </div>
        </div>
      )}
      <Etiqueta texto="LA NOTA EN LA MESA" x={540} y={MESA_Y + 150} t={t} at={T.mesa - 0.05} out={hasta + 0.4} size={40} variante="borde" fuente="titulo" />
    </Escena>
  );
};

/** Nota adhesiva coral con «CLAUDE.md» y líneas: el archivo como nota en la mesa. */
export const NotaAdhesiva: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, position: "relative", background: C.acento, borderRadius: 8, boxShadow: "0 22px 40px rgba(0,0,0,0.5)", padding: size * 0.11, boxSizing: "border-box", clipPath: `polygon(0 0, 100% 0, 100% 82%, 82% 100%, 0 100%)` }}>
    <div style={{ position: "absolute", right: 0, bottom: 0, width: size * 0.18, height: size * 0.18, background: C.acentoSuave }} />
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: size * 0.135, color: C.oscuro, letterSpacing: 0.5 }}>CLAUDE.md</div>
    {[0.86, 0.7, 0.8, 0.55].map((f, i) => (
      <div key={i} style={{ height: size * 0.045, width: `${f * 100}%`, background: "rgba(11,13,18,0.55)", borderRadius: 4, marginTop: size * 0.075 }} />
    ))}
  </div>
);

export const eventosMemoria = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.hoy + 0.05, sfx: "pop", vol: 0.35 },
    { t: T.todo, sfx: "whoosh", vol: 0.25 },
    { t: T.archivo, sfx: "pop", vol: 0.4 },
    { t: T.claudemd + 0.1, sfx: "golpe", vol: 0.5 },
    { t: T.claude, sfx: "pop", vol: 0.4 },
    { t: T.empleado, sfx: "pop", vol: 0.3 },
    { t: T.ayer, sfx: "tick", vol: 0.35 },
    { t: T.brillante, sfx: "pop", vol: 0.4 },
    { t: T.nota0, sfx: "whoosh", vol: 0.25 },
    { t: T.dejas + 0.25, sfx: "golpe", vol: 0.45 },
  ];
};
