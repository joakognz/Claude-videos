/**
 * EP.13 · Repaso (escenas repaso y experto): la caja de herramientas del módulo 1 se abre y cada frase deja una pieza
 * que cae dentro (Claude Code, Visual Studio Code, la carpeta y GitHub · CLAUDE.md y la floristería · contexto, tarea y
 * ejemplos · rebobinar y el error leído con lupa), mientras se enciende la casilla de su episodio. Luego, NIVEL EXPERTO:
 * cinco fichas (plan, equipo, MCP, variantes y el cursor que usa tu ordenador).
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Cursor } from "../../componentes/Piezas";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { AvisoError, Carpeta } from "../../componentes/ep08/Dibujos";
import { Caja, Chip, Ico } from "../../componentes/ep12/Piezas12";
import { AbanicoWebs, ArchivoClaude, CajaHerramientas, Equipo, FilaModulo, Ficha, PiezaCaja, Plan, Rebobinar } from "../../componentes/ep13/Piezas13";
import { C, clamp01, ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const R = "repaso";
const X = "experto";
export const CAJA = { x: 540, y: 1335, w: 600 };
const ROW_Y = 715;
const ITEM_Y = 1000;
const FONDO_Y = CAJA.y + 8;

const tiempos = (L: Linea) => ({
  vamos: L.en(R, "Vamos"),
  repaso: L.en(R, "repaso."),
  claude: L.en(R, "Claude"),
  visual: L.en(R, "Visual"),
  carpeta: L.en(R, "carpeta"),
  github: L.en(R, "GitHub."),
  prepararlo: L.en(R, "Sabes prepararlo"),
  claudemd: L.en(R, "CLAUDE.md,"),
  negocio: L.en(R, "negocio"),
  pedir: L.en(R, "Sabes pedir"),
  contexto: L.en(R, "contexto,"),
  tarea: L.en(R, "tarea"),
  ejemplos: L.en(R, "ejemplos."),
  corregir: L.en(R, "Sabes corregir"),
  miedo: L.en(R, "miedo:"),
  rebobinas: L.en(R, "rebobinas."),
  error: L.en(R, "error,"),
  leerlo: L.en(R, "leerlo."),
  finRepaso: L.fin(R),
  y: L.ini(X),
  experto: L.en(X, "experto:"),
  planifica: L.en(X, "planifica,"),
  reparte: L.en(X, "reparte"),
  conecta: L.en(X, "conecta"),
  variantes: L.en(X, "variantes"),
  usa: L.en(X, "usa"),
  ordenador: L.en(X, "ordenador."),
});

export const Repaso13: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [{ t: desde - 1, x: 540, y: 1100, z: 1.0 }];
  const caidas = [T.prepararlo - 0.4, T.pedir - 0.4, T.corregir - 0.4, T.finRepaso - 0.15];
  const golpe = caidas.reduce((a, c) => a + (t > c + 0.5 ? Math.sin((t - c - 0.5) * 22) * Math.exp(-(t - c - 0.5) * 7) : 0), 0);
  const abre = sp(t, T.repaso - 0.1, { damping: 12, stiffness: 120 });
  // casillas del módulo: cada una se enciende con la frase de su episodio
  const enciende = [T.claude, T.visual, T.carpeta, T.github, T.claudemd, T.pedir + 0.3, T.rebobinas, T.error, T.planifica, T.reparte, T.variantes, T.ordenador, Infinity];
  const fichaLogo = (src: string, w: number, clara = false) => (
    <Ficha s={200} clara={clara}>
      <Img src={staticFile(src)} style={{ width: w }} />
    </Ficha>
  );
  const mini = (texto: string, x: number, at: number) => (
    <Etiqueta texto={texto} x={x} y={ITEM_Y + 125} t={t} at={at + 0.1} size={22} variante="gris" />
  );
  return (
    <Escena t={t} tomas={tomas}>
      <FilaModulo x={540} y={ROW_Y} n={13} celda={56} hueco={10} t={t} enciende={(k) => enciende[k - 1]} late={desde} />
      <Etiqueta texto="REPASO DEL MÓDULO 1" x={540} y={ITEM_Y} t={t} at={T.vamos} out={T.claude - 0.1} size={58} variante="texto" fuente="titulo" />

      <CajaHerramientas x={CAJA.x} y={CAJA.y} w={CAJA.w} abre={abre} golpe={golpe}>
        {/* qué es y dónde trabaja */}
        <PiezaCaja t={t} at={T.claude - 0.1} cae={caidas[0]} x0={200} y0={ITEM_Y} xf={330} yf={FONDO_Y} rot={-14}>{fichaLogo(ep.logos.claude_code, 140)}</PiezaCaja>
        <PiezaCaja t={t} at={T.visual - 0.1} cae={caidas[0] + 0.06} x0={420} y0={ITEM_Y} xf={430} yf={FONDO_Y} rot={8}>{fichaLogo(ep.logos.vscode, 130)}</PiezaCaja>
        <PiezaCaja t={t} at={T.carpeta - 0.1} cae={caidas[0] + 0.12} x0={640} y0={ITEM_Y} xf={650} yf={FONDO_Y} rot={-6}>
          <Ficha s={200}><Carpeta s={140} /></Ficha>
        </PiezaCaja>
        <PiezaCaja t={t} at={T.github - 0.1} cae={caidas[0] + 0.18} x0={860} y0={ITEM_Y} xf={750} yf={FONDO_Y} rot={12}>{fichaLogo(ep.logos.github_circulo, 140)}</PiezaCaja>

        {/* CLAUDE.md */}
        <PiezaCaja t={t} at={T.claudemd - 0.1} cae={caidas[1]} x0={470} y0={ITEM_Y} xf={520} yf={FONDO_Y - 10} rot={-10}>
          <ArchivoClaude w={250} logo={ep.logos.claude} lineas={ramp(t, T.claudemd, T.negocio, (n) => n) * 5} />
        </PiezaCaja>
        <PiezaCaja t={t} at={T.negocio - 0.1} cae={caidas[1] + 0.08} x0={790} y0={ITEM_Y + 40} xf={600} yf={FONDO_Y} rot={14}>
          <div style={{ width: 220, height: 220, borderRadius: "50%", overflow: "hidden", border: `6px solid ${C.acento}`, boxShadow: "0 20px 50px rgba(0,0,0,0.55)" }}>
            <Img src={staticFile(ep.imagenes!.floristeria)} style={{ width: 220, height: 220, objectFit: "cover", objectPosition: "50% 30%" }} />
          </div>
        </PiezaCaja>

        {/* pedir bien */}
        {[
          { txt: "CONTEXTO", at: T.contexto, y: ITEM_Y - 110, ico: "linea-coral/lupa" },
          { txt: "TAREA CONCRETA", at: T.tarea, y: ITEM_Y, ico: "linea-coral/check" },
          { txt: "EJEMPLOS", at: T.ejemplos, y: ITEM_Y + 110, ico: "linea-coral/comentario" },
        ].map((c, i) => (
          <PiezaCaja key={c.txt} t={t} at={c.at - 0.1} cae={caidas[2] + i * 0.07} x0={540} y0={c.y} xf={[380, 560, 720][i]} yf={FONDO_Y} rot={[-8, 6, -4][i]}>
            <Chip icono={<Ico ruta={c.ico} s={50} />} texto={c.txt} size={44} ancho={560} />
          </PiezaCaja>
        ))}

        {/* corregir sin miedo · leer el error */}
        <PiezaCaja t={t} at={T.corregir} cae={caidas[3]} x0={250} y0={ITEM_Y} xf={420} yf={FONDO_Y} rot={-12}>
          <Rebobinar s={210} gira={ramp(t, T.rebobinas, T.rebobinas + 0.8)} />
        </PiezaCaja>
        <PiezaCaja t={t} at={T.error - 0.1} cae={caidas[3] + 0.08} x0={690} y0={ITEM_Y} xf={640} yf={FONDO_Y} rot={8} escalaFinal={0.3}>
          <div style={{ position: "relative" }}>
            <AvisoError w={500} t={t} numero="429" enfoque={ramp(t, T.leerlo, T.leerlo + 0.35)} />
            {t > T.leerlo - 0.1 && (
              <div style={{ position: "absolute", left: 300, top: 60, transform: `scale(${sp(t, T.leerlo - 0.1, { damping: 11 })})` }}>
                <Ico ruta="linea-coral/lupa" s={130} />
              </div>
            )}
          </div>
        </PiezaCaja>
      </CajaHerramientas>
      <Etiqueta texto="SIN MIEDO" x={250} y={ITEM_Y - 150} t={t} at={T.miedo} out={caidas[3]} size={32} variante="acento" fuente="titulo" />

      {/* ── nivel experto ── */}
      <Sello texto="NIVEL EXPERTO" x={540} y={ITEM_Y - 165} t={t} at={T.experto} size={56} rot={-3} />
      <Caja x={130} y={ITEM_Y} t={t} at={T.planifica - 0.1}>
        <Ficha s={170}><Plan s={110} p={ramp(t, T.planifica, T.planifica + 0.7)} /></Ficha>
      </Caja>
      {mini("PLANIFICA", 130, T.planifica)}
      <Caja x={335} y={ITEM_Y} t={t} at={T.reparte - 0.1}>
        <Ficha s={170}><Equipo s={130} p={sp(t, T.reparte + 0.15, { damping: 12 })} /></Ficha>
      </Caja>
      {mini("REPARTE", 335, T.reparte)}
      <Caja x={540} y={ITEM_Y} t={t} at={T.conecta - 0.1}>
        <Ficha s={170} clara><Img src={staticFile(ep.logos.mcp)} style={{ width: 120 }} /></Ficha>
      </Caja>
      {mini("CONECTA", 540, T.conecta)}
      <Caja x={745} y={ITEM_Y} t={t} at={T.variantes - 0.1}>
        <Ficha s={170}><AbanicoWebs s={150} p={sp(t, T.variantes + 0.1, { damping: 11 })} /></Ficha>
      </Caja>
      {mini("VARIANTES", 745, T.variantes)}
      <Caja x={950} y={ITEM_Y} t={t} at={T.usa - 0.1}>
        <Ficha s={170}>
          <div style={{ position: "relative", width: 120, height: 90, borderRadius: 10, background: C.panel2, border: `4px solid ${C.gris}` }}>
            <div style={{ position: "absolute", left: 14, top: 14, width: 60, height: 14, borderRadius: 7, background: clamp01((t - T.ordenador) / 0.2) > 0.5 ? C.acento : C.borde }} />
            <Cursor x={30 + 30 * (1 - ramp(t, T.usa, T.ordenador))} y={14 + 26 * (1 - ramp(t, T.usa, T.ordenador))} pulsa={Math.sin(clamp01((t - T.ordenador) / 0.25) * Math.PI)} size={48} />
          </div>
        </Ficha>
      </Caja>
      {mini("TU ORDENADOR", 950, T.usa)}
    </Escena>
  );
};

export const eventosRepaso13 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  const ev: Evento[] = [
    { t: T.vamos, sfx: "whoosh", vol: 0.3 },
    { t: T.repaso - 0.1, sfx: "golpe", vol: 0.35 },
  ];
  for (const at of [T.claude, T.visual, T.carpeta, T.github, T.claudemd, T.negocio, T.contexto, T.tarea, T.ejemplos, T.corregir, T.error]) ev.push({ t: at - 0.1, sfx: "pop", vol: 0.3 });
  for (const c of [T.prepararlo - 0.4, T.pedir - 0.4, T.corregir - 0.4, T.finRepaso - 0.15]) ev.push({ t: c + 0.45, sfx: "golpe", vol: 0.3 });
  ev.push({ t: T.rebobinas, sfx: "whoosh", vol: 0.3 }, { t: T.leerlo, sfx: "tick", vol: 0.45 });
  ev.push({ t: T.experto, sfx: "golpe", vol: 0.45 });
  for (const at of [T.planifica, T.reparte, T.conecta, T.variantes, T.usa]) ev.push({ t: at - 0.1, sfx: "pop", vol: 0.32 });
  ev.push({ t: T.ordenador, sfx: "tick", vol: 0.45 });
  return ev;
};
