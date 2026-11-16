/**
 * EP.11 · Los cuatro pasos.
 * - Pedir (paso1): PASO 1 → Visual Studio Code con Claude Code; la petición se teclea al ritmo de la voz y las tres
 *   portadas (clásica, moderna, minimalista) aparecen cuando se nombran.
 * - Separar (paso2): PASO 2 → cada versión en su carpeta (version-1/2/3 en el explorador) → NO SE PISAN → las tres
 *   abiertas una al lado de otra y una lupa las compara.
 * - Mezclar (paso3): PASO 3 → la petición de mezcla; el menú de la 2 y los colores de la 3 vuelan a una portada nueva.
 * - Guardar (paso4): PASO 4 → la ganadora con su copa → git guarda → el paquete sube a GitHub → una rama nueva para
 *   la idea de mañana.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Logo } from "../../componentes/Logo";
import { Paquete } from "../../componentes/Paquete";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Check, IcoLupa, Pieza } from "../../componentes/ep08/Dibujos";
import { tecleado } from "../../componentes/ep08/Pantallas";
import { Copa, Muestras, VsCode11, WebMini } from "../../componentes/ep11/Panaderia";
import type { Estilo } from "../../componentes/ep11/Panaderia";
import { C, EASE, EASE_OUT, MONO, TITULO, UI, clamp01, enCurva, ramp, sp, vis } from "../../nucleo";
import type { Curva, Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { FILA3, tramo } from "./comun";

const ESTILOS: Estilo[] = ["clasica", "moderna", "minimalista"];
const NOMBRES = ["CLÁSICA", "MODERNA", "MINIMALISTA"];

/** Tarjeta que entra con spring en (x, y). */
const Tarjeta: React.FC<{ x: number; y: number; t: number; at: number; out?: number; rot?: number; escala?: number; children: React.ReactNode }> = ({ x, y, t, at, out, rot = 0, escala = 1, children }) => {
  const v = vis(t, at, out, 0.4);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: v.opacity }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y * 2}px) scale(${v.scale * escala}) rotate(${rot * (1 - v.s * 0.6)}deg)` }}>{children}</div>
    </div>
  );
};

/** Chapita con el número de versión. */
const Num: React.FC<{ n: number | string; s?: number; activa?: boolean }> = ({ n, s = 54, activa = true }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: activa ? C.acento : C.panel2, border: `4px solid ${activa ? C.oscuro : C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: s * 0.5, color: activa ? C.oscuro : C.texto, boxShadow: "0 8px 20px rgba(0,0,0,0.45)" }}>{n}</div>
);

// ── PASO 1 · pedir varias ────────────────────────────────────────────────────────────────────────────────────────
const E1 = "paso1";
const t1 = (L: Linea) => ({
  paso: L.en(E1, "Paso"),
  pide: L.en(E1, "Pide"),
  varias: L.en(E1, "varias"),
  vez: L.en(E1, "vez"),
  ejemplo: L.en(E1, "ejemplo"),
  hazme: L.en(E1, "hazme"),
  tres: L.en(E1, "tres"),
  clasica: L.en(E1, "clásica"),
  moderna: L.en(E1, "moderna"),
  minimalista: L.en(E1, "minimalista"),
  fin: L.fin(E1),
});

export const Pedir: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = t1(L);
  const pal = tramo(L, E1, "hazme");
  const envia = T.fin + 0.12;
  const entrada = t < envia ? tecleado(pal, t, T.fin + 0.1) : "";
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 1.0 },
    { t: T.ejemplo - 0.3, x: 540, y: 1130, z: 0.98, d: 0.9 },
    { t: T.clasica - 0.35, x: 540, y: 1600, z: 0.9, d: 0.8 },
  ];
  const cards = FILA3(1790);
  const at = [T.clasica, T.moderna, T.minimalista];
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 1" x={540} y={820} t={t} at={T.paso} out={T.ejemplo - 0.2} size={76} rot={-4} />
      <Etiqueta texto="VARIAS A LA VEZ" x={540} y={1010} t={t} at={T.varias} out={T.ejemplo - 0.2} size={50} variante="acento" fuente="titulo" />
      <Pieza x={540} y={1220} t={t} at={T.ejemplo - 0.25} out={hasta + 0.5}>
        <VsCode11
          t={t} w={1000} h={640} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code} proyecto="web-panaderia"
          archivos={[{ nombre: "CLAUDE.md" }, { nombre: "index.html" }, { nombre: "estilos.css" }]}
          mensaje={t >= envia ? { texto: pal.map((p) => p.w).join(" "), at: envia } : undefined}
          piensa={[envia + 0.15, hasta + 1]}
          entrada={entrada} foco={t > T.hazme - 0.2 && t < envia}
        />
      </Pieza>
      {cards.map((c, i) => (
        <React.Fragment key={i}>
          <Tarjeta x={c.x} y={c.y} t={t} at={at[i] - 0.05} rot={(i - 1) * 6}>
            <WebMini w={315} maqueta={ESTILOS[i]} />
          </Tarjeta>
          <Etiqueta texto={NOMBRES[i]} x={c.x} y={c.y + 255} t={t} at={at[i]} size={30} variante={i === 2 ? "acento" : "borde"} fuente="titulo" />
        </React.Fragment>
      ))}
    </Escena>
  );
};

export const eventosPedir = (L: Linea): Evento[] => {
  const T = t1(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.varias - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.ejemplo - 0.55, sfx: "whoosh", vol: 0.25 },
    { t: T.hazme, sfx: "tecleo", vol: 0.3, dur: Math.max(0.4, T.fin - T.hazme) },
    { t: T.clasica - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.moderna - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.minimalista - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.fin + 0.12, sfx: "envio", vol: 0.45 },
  ];
};

// ── PASO 2 · cada una en su carpeta y compararlas ────────────────────────────────────────────────────────────────
const E2 = "paso2";
const t2 = (L: Linea) => ({
  paso: L.en(E2, "Paso"),
  pide: L.en(E2, "Pide"),
  cada: L.en(E2, "cada"),
  carpeta: L.en(E2, "carpeta"),
  pisar: L.en(E2, "pisar"),
  anterior: L.en(E2, "anterior"),
  abres: L.en(E2, "abres"),
  lado: L.en(E2, "lado"),
  comparas: L.en(E2, "comparas"),
  fin: L.fin(E2),
});

export const Separar: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = t2(L);
  const carpetas = [T.carpeta + 0.05, T.carpeta + 0.35, T.carpeta + 0.65];
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 1.0 },
    { t: T.cada - 0.35, x: 540, y: 1150, z: 1.05, d: 0.9 },
    { t: T.abres - 0.35, x: 540, y: 1600, z: 0.92, d: 1.0 },
  ];
  const lupa = ramp(t, T.comparas - 0.1, T.fin + 0.6, EASE);
  const cards = FILA3(1640);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 2" x={540} y={800} t={t} at={T.paso} out={T.cada - 0.15} size={76} rot={-4} />
      <Pieza x={540} y={1210} t={t} at={desde - 0.2} out={T.abres + 0.1}>
        <VsCode11
          t={t} w={1000} h={600} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code} proyecto="web-panaderia"
          archivos={[
            { nombre: "CLAUDE.md" },
            ...[1, 2, 3].flatMap((n, i) => [
              { nombre: `version-${n}`, carpeta: true, at: carpetas[i], resalte: clamp01(1 - Math.abs(t - carpetas[i] - 0.3) / 0.6) },
              { nombre: "index.html", nivel: 1, at: carpetas[i] + 0.12 },
            ]),
          ]}
          respuesta={[
            { texto: "version-1/index.html", at: carpetas[0] + 0.1, check: true },
            { texto: "version-2/index.html", at: carpetas[1] + 0.1, check: true },
            { texto: "version-3/index.html", at: carpetas[2] + 0.1, check: true },
          ]}
          entrada="" foco={false}
        />
      </Pieza>
      <Etiqueta texto="UNA CARPETA POR VERSIÓN" x={540} y={830} t={t} at={T.cada} out={T.pisar - 0.1} size={42} variante="borde" fuente="titulo" />
      <Etiqueta texto="NO SE PISAN" x={540} y={830} t={t} at={T.pisar} out={T.abres - 0.1} size={48} variante="acento" fuente="titulo" />
      {cards.map((c, i) => (
        <React.Fragment key={i}>
          <Tarjeta x={c.x} y={c.y} t={t} at={T.abres + i * 0.18 - 0.05}>
            <WebMini w={315} maqueta={ESTILOS[i]} url={`version-${i + 1}/index.html`} />
          </Tarjeta>
          <Pieza x={c.x - 140} y={c.y - 205} t={t} at={T.lado + i * 0.12}>
            <Num n={i + 1} s={58} />
          </Pieza>
        </React.Fragment>
      ))}
      {lupa > 0 && lupa < 1 && (
        <div style={{ position: "absolute", left: 160 + 760 * lupa - 115, top: 1640 - 115 + Math.sin(lupa * Math.PI * 3) * 40, opacity: clamp01(lupa * 6) * clamp01((1 - lupa) * 6), filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.6))" }}>
          <div style={{ position: "absolute", left: 18, top: 18, width: 150, height: 150, borderRadius: "50%", background: "rgba(240,169,137,0.16)", border: `4px solid ${C.acento}` }} />
          <IcoLupa s={230} />
        </div>
      )}
      <Etiqueta texto="COMPÁRALAS" x={540} y={1930} t={t} at={T.comparas} size={48} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosSeparar = (L: Linea): Evento[] => {
  const T = t2(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.cada - 0.45, sfx: "whoosh", vol: 0.22 },
    { t: T.cada, sfx: "pop", vol: 0.3 },
    { t: T.carpeta + 0.05, sfx: "pop", vol: 0.35 },
    { t: T.carpeta + 0.35, sfx: "pop", vol: 0.35 },
    { t: T.carpeta + 0.65, sfx: "pop", vol: 0.35 },
    { t: T.pisar, sfx: "golpe", vol: 0.35 },
    { t: T.abres - 0.5, sfx: "whoosh", vol: 0.25 },
    { t: T.lado, sfx: "pop", vol: 0.3 },
    { t: T.comparas, sfx: "pop", vol: 0.4 },
  ];
};

// ── PASO 3 · mezclar lo mejor ────────────────────────────────────────────────────────────────────────────────────
const E3 = "paso3";
const t3 = (L: Linea) => ({
  paso: L.en(E3, "Paso"),
  mezcla: L.en(E3, "Mezcla"),
  mejor: L.en(E3, "mejor"),
  dile: L.en(E3, "Dile"),
  quedate: L.en(E3, "quédate"),
  menu: L.en(E3, "menú"),
  dos: L.en(E3, "dos"),
  colores: L.en(E3, "colores"),
  tres: L.en(E3, "tres"),
  fin: L.fin(E3),
});

export const Mezclar: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = t3(L);
  const pal = tramo(L, E3, "quédate");
  const entrada = tecleado(pal, t, T.fin + 0.1);
  const cards = FILA3(1150);
  const MEZ = { x: 540, y: 1680 };
  const vuelaMenu: Curva = { a: { x: cards[1].x + 60, y: cards[1].y - 160 }, c: { x: 900, y: 1380 }, b: { x: MEZ.x + 70, y: MEZ.y - 170 } };
  const vuelaColor: Curva = { a: { x: cards[2].x, y: cards[2].y }, c: { x: 980, y: 1560 }, b: { x: MEZ.x, y: MEZ.y } };
  const uM = ramp(t, T.dos + 0.05, T.dos + 0.75, EASE);
  const uC = ramp(t, T.tres + 0.05, T.tres + 0.75, EASE);
  const llegaM = T.dos + 0.75;
  const llegaC = T.tres + 0.75;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 1.0 },
    { t: T.mezcla - 0.2, x: 540, y: 1090, z: 0.95, d: 0.9 },
    { t: T.dos - 0.2, x: 540, y: 1340, z: 0.78, d: 1.0 },
  ];
  const pM = enCurva(vuelaMenu, uM);
  const pC = enCurva(vuelaColor, uC);
  const flash = clamp01(1 - Math.abs(t - llegaC - 0.05) / 0.35);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 3" x={540} y={790} t={t} at={T.paso} out={T.dile - 0.15} size={76} rot={-4} />
      <Etiqueta texto="LO MEJOR DE CADA UNA" x={540} y={1450} t={t} at={T.mejor - 0.05} out={T.quedate + 0.3} size={42} variante="acento" fuente="titulo" />
      {/* las tres versiones */}
      {cards.map((c, i) => (
        <React.Fragment key={i}>
          <Tarjeta x={c.x} y={c.y} t={t} at={T.mezcla - 0.1 + i * 0.12}>
            <WebMini w={315} maqueta={ESTILOS[i]} resalteMenu={i === 1 ? clamp01((t - T.menu + 0.1) / 0.25) * (1 - ramp(t, llegaM, llegaM + 0.3)) : 0} resaltePaleta={i === 2 ? clamp01((t - T.colores + 0.1) / 0.25) * (1 - ramp(t, llegaC, llegaC + 0.3)) : 0} ocultarMenu={i === 1 ? 0.6 * ramp(t, T.dos, T.dos + 0.2) : 0} />
          </Tarjeta>
          <Pieza x={c.x - 140} y={c.y - 205} t={t} at={T.mezcla + i * 0.12}>
            <Num n={i + 1} s={58} activa={(i === 1 && t > T.menu - 0.1) || (i === 2 && t > T.colores - 0.1)} />
          </Pieza>
        </React.Fragment>
      ))}
      {/* la petición */}
      <Pieza x={540} y={820} t={t} at={T.dile - 0.1}>
        <div style={{ width: 960, minHeight: 112, borderRadius: 28, background: C.panel, border: `4px solid ${t < T.fin + 0.1 ? C.acento : C.borde}`, padding: "18px 30px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.acento }}>&gt;</div>
          <div style={{ flex: 1, fontFamily: UI, fontWeight: 600, fontSize: 34, lineHeight: 1.3, color: C.texto, whiteSpace: "normal" }}>
            {entrada || <span style={{ color: C.gris }}>Pídele algo a Claude…</span>}
          </div>
        </div>
      </Pieza>
      {/* la mezcla */}
      <Tarjeta x={MEZ.x} y={MEZ.y} t={t} at={T.menu - 0.1} escala={1.08}>
        <div style={{ filter: flash > 0 ? `drop-shadow(0 0 ${50 * flash}px ${C.acento})` : undefined }}>
          <WebMini w={330} maqueta="clasica" menu={t >= llegaM ? "moderna" : "clasica"} paleta={t >= llegaC ? "minimalista" : "clasica"} ocultarMenu={t < llegaM ? 0.85 : 0} />
        </div>
      </Tarjeta>
      <Etiqueta texto="MEZCLA" x={MEZ.x} y={MEZ.y - 270} t={t} at={T.menu} size={32} variante="borde" fuente="titulo" />
      {/* el menú y los colores en vuelo */}
      {uM > 0 && uM < 1 && (
        <div style={{ position: "absolute", left: pM.x, top: pM.y, width: 0, height: 0 }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${1 + 0.25 * Math.sin(uM * Math.PI)})`, padding: "10px 16px", borderRadius: 999, background: C.panel2, border: `4px solid ${C.acento}`, display: "flex", gap: 8, boxShadow: "0 16px 40px rgba(0,0,0,0.55)" }}>
            {["Inicio", "Panes", "Pedidos"].map((m, k) => <div key={m} style={{ padding: "5px 12px", borderRadius: 999, background: k === 0 ? C.acento : "transparent", border: `2px solid ${C.acento}`, fontFamily: UI, fontWeight: 700, fontSize: 18, color: k === 0 ? C.oscuro : C.texto }}>{m}</div>)}
          </div>
        </div>
      )}
      {uC > 0 && uC < 1 && (
        <div style={{ position: "absolute", left: pC.x, top: pC.y, width: 0, height: 0 }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${1 + 0.3 * Math.sin(uC * Math.PI)})` }}>
            <Muestras paleta="minimalista" s={1.2} />
          </div>
        </div>
      )}
      {t > llegaC + 0.25 && (
        <div style={{ position: "absolute", left: MEZ.x + 150, top: MEZ.y - 230 }}>
          <Check s={84} p={sp(t, llegaC + 0.25, { damping: 10, stiffness: 220 })} />
        </div>
      )}
    </Escena>
  );
};

export const eventosMezclar = (L: Linea): Evento[] => {
  const T = t3(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.mezcla - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.mejor - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.quedate, sfx: "tecleo", vol: 0.28, dur: Math.max(0.4, T.fin - T.quedate) },
    { t: T.dos + 0.05, sfx: "whoosh", vol: 0.2 },
    { t: T.dos + 0.75, sfx: "pop", vol: 0.4 },
    { t: T.tres + 0.05, sfx: "whoosh", vol: 0.2 },
    { t: T.tres + 0.75, sfx: "pop", vol: 0.45 },
    { t: T.tres + 1.0, sfx: "tick", vol: 0.5 },
  ];
};

// ── PASO 4 · guardar la ganadora ─────────────────────────────────────────────────────────────────────────────────
const E4 = "paso4";
const t4 = (L: Linea) => ({
  paso: L.en(E4, "Paso"),
  ganadora: L.en(E4, "ganadora"),
  guardala: L.en(E4, "guárdala"),
  git: L.en(E4, "git"),
  subela: L.en(E4, "súbela"),
  github: L.en(E4, "GitHub"),
  manana: L.en(E4, "mañana"),
  idea: L.en(E4, "idea"),
  partes: L.en(E4, "partes"),
  ahi: L.en(E4, "ahí"),
  fin: L.fin(E4),
});

export const Guardar: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = t4(L);
  const GIT = { x: 250, y: 1560 };
  const GH = { x: 830, y: 1560 };
  const sube: Curva = { a: { x: GIT.x + 40, y: GIT.y - 70 }, c: { x: 540, y: 1300 }, b: { x: GH.x - 40, y: GH.y - 70 } };
  const uP = ramp(t, T.subela - 0.05, T.github + 0.35, EASE);
  const rama: Curva = { a: { x: GIT.x, y: GIT.y + 90 }, c: { x: GIT.x + 40, y: 1840 }, b: { x: 470, y: 1860 } };
  const pR = ramp(t, T.manana - 0.1, T.idea + 0.2, EASE_OUT);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 1.0 },
    { t: T.ganadora - 0.3, x: 540, y: 1080, z: 1.02, d: 0.9 },
    { t: T.guardala - 0.3, x: 540, y: 1360, z: 0.94, d: 0.9 },
    { t: T.manana - 0.3, x: 540, y: 1580, z: 0.9, d: 1.0 },
  ];
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 4" x={540} y={800} t={t} at={T.paso} out={T.ganadora - 0.1} size={76} rot={-4} />
      {/* la ganadora */}
      <Tarjeta x={540} y={1100} t={t} at={desde - 0.2}>
        <WebMini w={360} maqueta="clasica" menu="moderna" paleta="minimalista" />
      </Tarjeta>
      <Pieza x={540} y={790} t={t} at={T.ganadora - 0.05} out={T.guardala}>
        <Copa s={150} />
      </Pieza>
      <Etiqueta texto="LA GANADORA" x={540} y={1400} t={t} at={T.ganadora} out={T.guardala + 0.1} size={36} variante="acento" fuente="titulo" />
      {/* git y GitHub */}
      <Logo src={ep.logos.git} x={GIT.x} y={GIT.y} w={190} t={t} at={T.git - 0.05} ficha="tarjeta" pulsos={[T.git + 0.3]} />
      <Etiqueta texto="GUARDADA" x={GIT.x} y={GIT.y + 130} t={t} at={T.git + 0.25} out={T.manana - 0.1} size={30} variante="borde" fuente="titulo" />
      <Logo src={ep.logos.github_circulo} x={GH.x} y={GH.y} w={170} t={t} at={T.subela} pulsos={[T.github + 0.35]} />
      <Flecha curva={sube} p={ramp(t, T.subela - 0.1, T.github + 0.2, EASE_OUT)} ancho={7} discontinua opacity={0.7} />
      <Paquete curva={sube} u={uP} size={100} opacity={uP > 0 && uP < 1 ? 1 : 0} />
      {t > T.github + 0.4 && (
        <div style={{ position: "absolute", left: GH.x + 50, top: GH.y - 120 }}>
          <Check s={70} p={sp(t, T.github + 0.4, { damping: 10, stiffness: 220 })} />
        </div>
      )}
      {/* la idea de mañana parte de ahí */}
      <Flecha curva={rama} p={pR} ancho={8} />
      <Tarjeta x={650} y={1860} t={t} at={T.idea - 0.05}>
        <div style={{ width: 300, height: 170, borderRadius: 20, border: `5px dashed ${C.acento}`, background: "rgba(217,119,87,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 38, color: C.texto }}>OTRA IDEA</div>
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 24, color: C.gris }}>parte de la ganadora</div>
        </div>
      </Tarjeta>
      {t > T.ahi && (
        <div style={{ position: "absolute", left: GIT.x - 26, top: GIT.y + 64 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.acento, border: `5px solid ${C.oscuro}`, transform: `scale(${1 + 0.5 * Math.sin(clamp01((t - T.ahi) / 0.4) * Math.PI)})` }} />
        </div>
      )}
    </Escena>
  );
};

export const eventosGuardar = (L: Linea): Evento[] => {
  const T = t4(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.ganadora - 0.05, sfx: "pop", vol: 0.45 },
    { t: T.guardala - 0.45, sfx: "whoosh", vol: 0.22 },
    { t: T.git - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.git + 0.25, sfx: "tick", vol: 0.45 },
    { t: T.subela, sfx: "pop", vol: 0.35 },
    { t: T.github + 0.4, sfx: "envio", vol: 0.45 },
    { t: T.manana - 0.45, sfx: "whoosh", vol: 0.22 },
    { t: T.idea - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.ahi, sfx: "tick", vol: 0.45 },
  ];
};
