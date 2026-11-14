/**
 * EP.5 · bloque «Carpeta vacía» (escenas trampa → minimo → importar):
 * OJO, hay trampa → la carpeta vacía se abre y la lupa no encuentra nada → CLAUDE.md mínimo + el aviso real de
 * Claude («Siguiente paso. Monta el proyecto…») → framework · dependencias (npm, Node.js) · git init (Git) →
 * flecha de vuelta a /init → Codex y Gemini: sus configuraciones viajan hasta Claude → NO EMPIEZAS DE CERO.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { C, MONO, TITULO, UI, enCurva, ramp, vis } from "../../nucleo";
import type { Curva, Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Chip, Comando, Ficha, FichaFija, IconoCarpeta, IconoMd, Interrogantes, Picto, Pop } from "../../ep05/kit";
import { VS } from "../../ep05/ui";

const CARP = { x: 540, y: 1140 };
const FILA_Y = 2660;
const CODEX = { x: 250, y: 3700 };
const GEMINI = { x: 820, y: 3700 };
const DESTINO = { x: 540, y: 4060 };

const tiempos = (L: LineaT) => ({
  pero: L.ini("trampa"),
  ojo: L.en("trampa", "ojo"),
  trampa: L.en("trampa", "trampa"),
  carpeta: L.en("trampa", "carpeta"),
  vacia: L.en("trampa", "vacía"),
  no: L.en("trampa", "no"),
  nada: L.en("trampa", "nada"),
  analizar: L.en("trampa", "analizar"),
  te: L.ini("minimo"),
  minimo: L.en("minimo", "mínimo"),
  avisa: L.en("minimo", "avisa"),
  primero: L.en("minimo", "primero"),
  monta: L.en("minimo", "monta"),
  framework: L.en("minimo", "framework"),
  dependencias: L.en("minimo", "dependencias"),
  git: L.en("minimo", "git"),
  vuelve: L.en("minimo", "vuelve"),
  init: L.en("minimo", "/init", 1),
  finMin: L.fin("minimo"),
  y: L.ini("importar"),
  otro: L.en("importar", "otro"),
  codex: L.en("importar", "Codex"),
  gemini: L.en("importar", "Gemini"),
  puede: L.en("importar", "puede"),
  importar: L.en("importar", "importar"),
  configuraciones: L.en("importar", "configuraciones"),
  noCero: L.en("importar", "No"),
  cero: L.en("importar", "cero"),
});

const CURVA_CODEX: Curva = { a: { x: CODEX.x + 40, y: CODEX.y + 120 }, c: { x: 300, y: 3990 }, b: { x: DESTINO.x - 120, y: DESTINO.y - 10 } };
const CURVA_GEMINI: Curva = { a: { x: GEMINI.x - 40, y: GEMINI.y + 90 }, c: { x: 790, y: 3990 }, b: { x: DESTINO.x + 120, y: DESTINO.y - 10 } };
const CURVA_INIT: Curva = { a: { x: 900, y: FILA_Y + 150 }, c: { x: 960, y: FILA_Y + 290 }, b: { x: 760, y: FILA_Y + 300 } };

export const Vacia: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 900, z: 1.08 },
    { t: T.carpeta - 0.2, x: 540, y: 1100, z: 1.0, d: 0.8 },
    { t: T.no - 0.1, x: 540, y: 1190, z: 1.14, d: 0.9 },
    { t: T.te - 0.25, x: 540, y: 2150, z: 1.06, d: 0.9 },
    { t: T.avisa - 0.1, x: 540, y: 2290, z: 1.02, d: 0.8 },
    { t: T.framework - 0.25, x: 540, y: 2600, z: 1.04, d: 0.8 },
    { t: T.vuelve - 0.2, x: 540, y: 2740, z: 1.0, d: 0.8 },
    { t: T.y - 0.25, x: 540, y: 3620, z: 1.06, d: 0.9 },
    { t: T.codex - 0.15, x: 400, y: 3720, z: 1.12, d: 0.6 },
    { t: T.gemini - 0.1, x: 680, y: 3720, z: 1.12, d: 0.6 },
    { t: T.puede - 0.1, x: 540, y: 3900, z: 0.98, d: 0.8 },
    { t: T.noCero - 0.15, x: 540, y: 4120, z: 1.02, d: 0.8 },
  ];
  const fueraA = T.te;
  const abierta = ramp(t, T.vacia - 0.1, T.vacia + 0.35);
  // lupa que busca dentro de la carpeta
  const busca = ramp(t, T.no - 0.1, T.analizar + 0.4, (n) => n);
  const lupaX = CARP.x - 150 + Math.sin(busca * Math.PI * 2) * 160;
  const lupaY = CARP.y - 10 + Math.cos(busca * Math.PI * 2) * 40;
  const pImp = ramp(t, T.importar - 0.1, T.configuraciones + 0.5, (n) => n);
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── trampa ── */}
      <Pop x={540} y={690} t={t} at={T.ojo - 0.05} out={fueraA} rot={-8}>
        <Chip icono={<Picto nombre="aviso" size={58} color={C.oscuro} grosor={2.6} />} texto="OJO" size={58} variante="acento" />
      </Pop>
      <Etiqueta texto="AQUÍ HAY TRAMPA" x={540} y={820} t={t} at={T.trampa} out={fueraA} size={40} variante="borde" fuente="titulo" />
      <Pop x={CARP.x} y={CARP.y} t={t} at={T.carpeta - 0.05} out={fueraA} rot={-10}>
        <IconoCarpeta size={340} abierta={abierta} />
      </Pop>
      {/* aire: la carpeta está vacía */}
      {abierta > 0.3 &&
        [0, 1, 2].map((k) => {
          const u = ((t - T.vacia) * 0.9 + k / 3) % 1;
          return <div key={k} style={{ position: "absolute", left: CARP.x - 90 + k * 70, top: CARP.y - 70 - u * 150, width: 46, height: 8, borderRadius: 4, background: C.gris, opacity: 0.6 * Math.sin(u * Math.PI) * (1 - ramp(t, fueraA - 0.3, fueraA)) }} />;
        })}
      <Etiqueta texto="CARPETA VACÍA" x={CARP.x} y={CARP.y + 200} t={t} at={T.vacia} out={fueraA} size={42} variante="acento" fuente="titulo" />
      {t > T.no - 0.15 && t < fueraA && (
        <div style={{ position: "absolute", left: lupaX, top: lupaY, opacity: Math.min(1, (t - T.no + 0.15) * 4) * (1 - ramp(t, fueraA - 0.3, fueraA)), filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.6))" }}>
          <Picto nombre="lupa" size={150} color={C.texto} grosor={2.4} />
        </div>
      )}
      <Interrogantes x={CARP.x} y={CARP.y - 40} t={t} at={T.nada} out={fueraA} r={230} n={3} size={64} />
      <Etiqueta texto="NADA QUE ANALIZAR" x={CARP.x} y={CARP.y + 285} t={t} at={T.analizar - 0.05} out={fueraA} size={34} variante="gris" fuente="titulo" />

      {/* ── CLAUDE.md mínimo + aviso ── */}
      <Pop x={170} y={2030} t={t} at={T.minimo - 0.1} out={T.framework - 0.3} rot={-10}>
        <IconoMd size={110} lineas={1} />
      </Pop>
      <Pop x={260} y={2030} t={t} at={T.minimo} out={T.framework - 0.3} ancla="izq">
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: C.texto }}>
          <span style={{ fontFamily: MONO, color: C.acento }}>CLAUDE.md</span> mínimo
        </div>
      </Pop>
      {(() => {
        const v = vis(t, T.avisa - 0.08, T.y, 0.85);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 2290, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, width: 940, boxSizing: "border-box", padding: "26px 32px", borderRadius: 28, background: VS.fondo, border: `3px solid ${C.acento}`, boxShadow: `0 30px 80px rgba(0,0,0,0.6)`, display: "flex", gap: 22, whiteSpace: "normal" }}>
              <Picto nombre="aviso" size={56} />
              <div style={{ flex: 1, fontFamily: UI, fontWeight: 600, fontSize: 31, lineHeight: 1.45, color: VS.texto }}>
                <b style={{ color: VS.blanco }}>Siguiente paso.</b> Monta el proyecto (framework, dependencias,{" "}
                <span style={{ fontFamily: MONO, background: "#2A2A2A", padding: "0 8px", borderRadius: 6 }}>git init</span>) y vuelve a lanzar{" "}
                <span style={{ fontFamily: MONO, background: "#2A2A2A", padding: "0 8px", borderRadius: 6 }}>/init</span>
              </div>
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="PRIMERO, LA BASE" x={540} y={FILA_Y - 205} t={t} at={T.monta} out={T.y} size={38} variante="acento" fuente="titulo" />
      <Caja x={200} at={T.framework} t={t} out={T.y} texto="framework">
        <Picto nombre="capas" size={110} />
      </Caja>
      <Caja x={540} at={T.dependencias} t={t} out={T.y} texto="dependencias">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <FichaFija src={ep.logos.npm} h={62} />
          <FichaFija src={ep.logos.nodejs} h={74} />
        </div>
      </Caja>
      <Caja x={880} at={T.git} t={t} out={T.y} texto="git init" mono>
        <FichaFija src={ep.logos.git} h={84} />
      </Caja>
      <Flecha curva={CURVA_INIT} p={ramp(t, T.vuelve - 0.1, T.init - 0.05)} ancho={9} opacity={1 - ramp(t, T.y - 0.35, T.y)} />
      <Pop x={570} y={FILA_Y + 300} t={t} at={T.init - 0.08} out={T.y} latidos={[T.init + 0.1]}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ transform: `rotate(${(t - T.init) * -160}deg)` }}>
            <Picto nombre="bucle" size={70} />
          </div>
          <Comando texto="/init" size={66} />
        </div>
      </Pop>

      {/* ── importar desde otro agente ── */}
      <Etiqueta texto="¿VIENES DE OTRO AGENTE?" x={540} y={3480} t={t} at={T.otro - 0.05} out={T.puede} size={40} variante="borde" fuente="titulo" />
      <Ficha src={ep.logos.codex} x={CODEX.x} y={CODEX.y} h={190} blanca={false} t={t} at={T.codex - 0.05} latidos={[T.importar]} />
      <Etiqueta texto="Codex" x={CODEX.x} y={CODEX.y + 130} t={t} at={T.codex + 0.05} size={34} variante="gris" />
      <Ficha src={ep.logos.gemini} x={GEMINI.x} y={GEMINI.y} h={120} blanca={false} maxW={380} t={t} at={T.gemini - 0.05} latidos={[T.importar + 0.1]} />
      <Flecha curva={CURVA_CODEX} p={ramp(t, T.importar - 0.15, T.importar + 0.45)} ancho={8} />
      <Flecha curva={CURVA_GEMINI} p={ramp(t, T.importar - 0.05, T.importar + 0.55)} ancho={8} />
      <Logo src={ep.logos.claude} x={DESTINO.x} y={DESTINO.y} w={170} t={t} at={T.puede - 0.05} pulsos={[T.configuraciones + 0.5]} />
      {[
        { c: CURVA_CODEX, txt: "~/.codex/config.toml", d: 0 },
        { c: CURVA_GEMINI, txt: "~/.gemini/settings.json", d: 0.12 },
      ].map(({ c, txt, d }) => {
        const u = Math.min(1, Math.max(0, (pImp - d) / 0.8));
        if (u <= 0 || u >= 1) return null;
        const p = enCurva(c, u);
        return (
          <div key={txt} style={{ position: "absolute", left: p.x, top: p.y, transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * Math.sin(u * Math.PI)})`, opacity: Math.min(1, u * 5, (1 - u) * 6) }}>
            <Comando texto={txt} size={26} color={C.texto} />
          </div>
        );
      })}
      <Etiqueta texto="importa sus configuraciones" x={DESTINO.x} y={DESTINO.y + 135} t={t} at={T.configuraciones} out={hasta + 0.4} size={32} variante="gris" />
      <Sello texto="NO EMPIEZAS DE CERO" x={540} y={4330} t={t} at={T.noCero} out={hasta + 0.4} size={56} rot={-3} />
    </Escena>
  );
};

const Caja: React.FC<{ x: number; at: number; t: number; out: number; texto: string; mono?: boolean; children: React.ReactNode }> = ({ x, at, t, out, texto, mono, children }) => {
  const v = vis(t, at - 0.05, out, 0.6);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x - 150, top: FILA_Y - 140, width: 300, height: 290, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
      <div style={{ width: "100%", height: "100%", boxSizing: "border-box", borderRadius: 30, background: C.panel, border: `3px solid ${C.acento}`, boxShadow: `0 30px 70px rgba(0,0,0,0.5)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ height: 160, display: "flex", alignItems: "center" }}>{children}</div>
        <div style={{ fontFamily: mono ? MONO : UI, fontWeight: 700, fontSize: 36, color: C.texto }}>{texto}</div>
      </div>
    </div>
  );
};

export const eventosVacia = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.ojo, sfx: "golpe", vol: 0.5 },
    { t: T.carpeta, sfx: "pop", vol: 0.35 },
    { t: T.vacia, sfx: "whoosh", vol: 0.22 },
    { t: T.minimo, sfx: "pop", vol: 0.35 },
    { t: T.avisa, sfx: "pop", vol: 0.35 },
    { t: T.framework, sfx: "pop", vol: 0.35 },
    { t: T.dependencias, sfx: "pop", vol: 0.35 },
    { t: T.git, sfx: "pop", vol: 0.35 },
    { t: T.init, sfx: "tick", vol: 0.5 },
    { t: T.codex, sfx: "pop", vol: 0.35 },
    { t: T.gemini, sfx: "pop", vol: 0.35 },
    { t: T.importar, sfx: "whoosh", vol: 0.3 },
    { t: T.noCero + 0.1, sfx: "golpe", vol: 0.5 },
  ];
};
