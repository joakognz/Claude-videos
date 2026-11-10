/**
 * Bloque 1, pasos 2 a 4 (escenas paso2 → paso3 → paso4 → bueno), recreados sobre la maqueta de Visual Studio Code:
 * Open Folder y elegir la carpeta · extensiones, buscar Claude Code e instalar la de Anthropic (PRO O MAX) · icono de
 * Claude en la barra lateral, nueva sesión y «hola» · Claude mira la carpeta y pregunta qué necesitas.
 * La cámara recorta la ventana (1500x1000) a 9:16 y se acerca a la zona de acción de cada momento.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Anillo } from "../componentes/Logo";
import { Cursor } from "../componentes/Piezas";
import { Etiqueta, Sello } from "../componentes/Sello";
import {
  ARCHIVOS, Bienvenida, ChatClaude, DetalleExtension, DialogoCarpeta, PanelClaude, PanelExplorer, PanelExtensiones, VS, VentanaVs, posActividad,
} from "../componentes/VsCode";
import type { Extension } from "../componentes/VsCode";
import { C, EASE, EASE_OUT, TITULO, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

/** Esquina superior izquierda de la ventana en el lienzo. */
export const WX = -210;
export const WY = 640;
export const P = (x: number, y: number, z: number, t: number, d = 0.9): Toma => ({ t, x: x + WX, y: y + WY, z, d });

export type Kf = { t: number; x: number; y: number };
/** Posición del cursor: va a cada punto llegando en su instante (viaje de 0,5 s con curva) y espera allí. */
export const rutaCursor = (t: number, kfs: Kf[]) => {
  if (t <= kfs[0].t) return { x: kfs[0].x, y: kfs[0].y };
  for (let i = 0; i + 1 < kfs.length; i++) {
    const a = kfs[i];
    const b = kfs[i + 1];
    if (t < b.t) {
      const s = Math.max(a.t, b.t - 0.55);
      const u = EASE(clamp01((t - s) / Math.max(0.01, b.t - s)));
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
    }
  }
  const z = kfs[kfs.length - 1];
  return { x: z.x, y: z.y };
};
/** 0 → 1 → 0 alrededor de cada clic. */
export const pulso = (t: number, clics: number[]) => clics.reduce((m, c) => Math.max(m, Math.sin(clamp01((t - c + 0.06) / 0.22) * Math.PI)), 0);
/** Texto que se escribe entre a y b. */
export const escribe = (txt: string, t: number, a: number, b: number) => txt.slice(0, Math.round(clamp01((t - a) / Math.max(0.2, b - a)) * txt.length));

const CLAUDE_EXT: Extension = { logo: "logos/claude.png", nombre: "Claude Code for VS Code", autor: "Anthropic", verificado: true };

const tiempos = (L: Linea) => {
  const T = {
    // paso 2
    abrelo: L.ini("paso2"),
    open: L.en("paso2", "Open"),
    elige: L.en("paso2", "elige"),
    carpeta: L.en("paso2", "carpeta"),
    proyecto: L.en("paso2", "proyecto"),
    ya: L.en("paso2", "Ya"),
    ese: L.en("paso2", "Ese"),
    abierto: L.en("paso2", "abierto"),
    // paso 3
    ahora: L.ini("paso3"),
    claude3: L.en("paso3", "Claude"),
    ext: L.en("paso3", "extensiones"),
    buscalo: L.en("paso3", "búscalo"),
    instala: L.en("paso3", "instala"),
    anthropic: L.en("paso3", "Anthropic"),
    funciona: L.en("paso3", "Funciona"),
    pro: L.en("paso3", "Pro"),
    max: L.en("paso3", "Max"),
    fin3: L.fin("paso3"),
    // paso 4
    icono: L.en("paso4", "icono"),
    barra: L.en("paso4", "barra"),
    abrelo4: L.en("paso4", "Ábrelo"),
    sesion: L.en("paso4", "sesión"),
    escribele: L.en("paso4", "escríbele"),
    hola: L.en("paso4", "hola"),
    holaFin: L.finDe("paso4", "hola"),
    // lo bueno
    bueno: L.en("bueno", "bueno"),
    mira: L.en("bueno", "mira"),
    pregunta: L.en("bueno", "pregunta"),
    necesitas: L.en("bueno", "necesitas"),
    facil: L.en("bueno", "fácil"),
    fin: L.fin("bueno"),
  };
  return {
    ...T,
    clicOpen: T.open + 0.15,
    clicCarpeta: T.carpeta + 0.05,
    clicAbrir: T.proyecto + 0.3,
    clicExt: T.ext + 0.1,
    clicItem: T.instala + 0.05,
    clicInstall: T.anthropic + 0.15,
    instalado: Math.max(T.anthropic + 1.0, T.funciona - 0.1),
    clicClaude: T.abrelo4 + 0.1,
    clicSesion: T.sesion + 0.05,
    envia: T.holaFin + 0.15,
  };
};

export const VsCodeInstalar: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const out = hasta + 0.3;
  // ── estado de la interfaz ──
  const dialogo = t >= T.clicOpen + 0.1 && t < T.clicAbrir + 0.35;
  const dOp = ramp(t, T.clicOpen + 0.1, T.clicOpen + 0.35) * (1 - ramp(t, T.clicAbrir + 0.1, T.clicAbrir + 0.35));
  const abierta = t >= T.clicAbrir + 0.25;
  const archivos = ramp(t, T.clicAbrir + 0.25, T.ya + 0.6, EASE_OUT);
  const vistaExt = t >= T.clicExt && t < T.clicClaude;
  const vistaClaude = t >= T.clicClaude && t < T.mira;
  const activo = t >= T.mira ? 0 : vistaClaude ? 5 : vistaExt ? 4 : 0;
  const busqueda = escribe("Claude Code", t, T.buscalo + 0.05, T.buscalo + 0.75);
  const resultados = ramp(t, T.buscalo + 0.6, T.buscalo + 0.9);
  const detalle = t >= T.clicItem + 0.1;
  const estadoExt = t >= T.instalado ? 2 : t >= T.clicInstall + 0.05 ? 1 : 0;
  const claudeIcono = t >= T.icono - 0.05 ? sp(t, T.icono - 0.05, { damping: 10, stiffness: 180 }) : 0;
  const pulsoIcono = Math.max(0, Math.sin(clamp01((t - T.icono) / 0.5) * Math.PI)) + Math.max(0, Math.sin(clamp01((t - T.barra) / 0.6) * Math.PI)) * 0.8;
  const entrada = t < T.envia ? escribe("hola", t, T.escribele + 0.25, T.holaFin) : "";
  const msgYo = ramp(t, T.envia, T.envia + 0.3);
  const piensa = ramp(t, T.bueno - 0.1, T.bueno + 0.3);
  const scan = clamp01((t - T.mira) / 1.3);
  const leida = t >= T.pregunta - 0.1;
  // ── cámara ──
  const tomas: Toma[] = [
    P(750, 520, 0.72, desde - 1),
    P(370, 300, 1.28, T.open - 0.75),
    P(860, 420, 1.0, T.elige - 0.25),
    P(330, 300, 1.3, T.ya - 0.25),
    P(470, 420, 1.0, T.ese - 0.1),
    P(330, 380, 1.25, T.ext - 0.7),
    P(380, 260, 1.32, T.buscalo - 0.2),
    P(900, 330, 1.12, T.instala - 0.05),
    P(960, 470, 1.05, T.pro - 0.35),
    P(300, 480, 1.38, T.icono - 0.35),
    P(430, 290, 1.15, T.abrelo4 - 0.15),
    P(940, 760, 1.12, T.escribele - 0.25),
    P(640, 330, 1.0, T.mira - 0.3),
    P(930, 330, 1.12, T.pregunta - 0.2),
    P(760, 470, 0.86, T.facil - 0.3, 1.1),
  ];
  // ── cursor ──
  const ap = posActividad;
  const kfs = [
    { t: desde, x: 900, y: 760 },
    { t: T.clicOpen - 0.05, x: 276, y: 212 },
    { t: T.clicCarpeta - 0.05, x: 945, y: 320 },
    { t: T.clicAbrir - 0.05, x: 1210, y: 648 },
    { t: T.clicAbrir + 0.6, x: 640, y: 560 },
    { t: T.clicExt - 0.05, x: ap(4).x + 6, y: ap(4).y + 6 },
    { t: T.clicItem - 0.05, x: 300, y: 205 },
    { t: T.clicInstall - 0.05, x: 760, y: 296 },
    { t: T.instalado + 0.4, x: 900, y: 600 },
    { t: T.clicClaude - 0.05, x: ap(5).x + 6, y: ap(5).y + 6 },
    { t: T.clicSesion - 0.05, x: 290, y: 122 },
    { t: T.escribele, x: 900, y: 880 },
    { t: T.fin + 1, x: 900, y: 880 },
  ];
  const cur = rutaCursor(t, kfs);
  const clics = [T.clicOpen, T.clicCarpeta, T.clicAbrir, T.clicExt, T.clicItem, T.clicInstall, T.clicClaude, T.clicSesion];
  const pul = pulso(t, clics);
  const cursorOp = ramp(t, desde, desde + 0.4) * (1 - ramp(t, T.escribele, T.escribele + 0.3));
  // ── piezas ──
  const resalte = ARCHIVOS.map((_, i) => {
    if (t < T.mira) return 0;
    const c = i / ARCHIVOS.length;
    return Math.max(0, 1 - Math.abs(scan - c - 0.12) * 4) + (leida ? 0 : 0);
  });
  const lateral = vistaClaude ? (
    <PanelClaude pulsaNueva={pulso(t, [T.clicSesion])} sesion={t > T.envia ? "hola" : "New session"} sesionOp={ramp(t, T.clicSesion + 0.1, T.clicSesion + 0.35)} />
  ) : vistaExt ? (
    <PanelExtensiones
      t={t}
      busqueda={busqueda}
      cursor={t > T.buscalo && t < T.clicItem}
      op={resultados}
      resultados={[{ ...CLAUDE_EXT, estado: estadoExt, resalte: detalle ? 1 : ramp(t, T.clicItem - 0.4, T.clicItem) * 0.6 }, null, null, null, null]}
    />
  ) : (
    <PanelExplorer abierta={abierta} archivos={archivos} pulsaBoton={pulso(t, [T.clicOpen])} resalte={resalte} />
  );
  const chat = (
    <ChatClaude
      t={t}
      entrada={entrada}
      cursor={t > T.clicSesion && t < T.envia}
      pulsaEnviar={pulso(t, [T.envia])}
      vacia={1 - msgYo}
      mensajes={[
        { de: "yo", texto: "hola", p: msgYo },
        {
          de: "claude",
          p: piensa,
          pasos: [{ txt: "mi-proyecto/", p: ramp(t, T.mira - 0.1, T.mira + 0.2), ok: leida }],
          renglones: t >= T.pregunta - 0.2 ? 2 : 0,
          texto: t >= T.pregunta ? "¿Qué necesitas?" : undefined,
          resalte: ramp(t, T.necesitas, T.necesitas + 0.3),
        },
      ]}
    />
  );
  const editor = vistaClaude || t >= T.mira ? chat : detalle ? <DetalleExtension t={t} ext={{ ...CLAUDE_EXT, estado: estadoExt, pulsa: pulso(t, [T.clicInstall]) }} /> : <Bienvenida />;
  const pestanas = vistaClaude || t >= T.mira ? [{ txt: t > T.envia ? "hola" : "Claude Code", activa: true, icono: <Img src={staticFile("logos/claude.png")} style={{ width: 22 }} /> }] : detalle ? [{ txt: "Extension: Claude Code for VS Code", activa: true }] : [{ txt: "Welcome", activa: true }];
  const win = vis(t, desde - 0.1, out, 0.86);
  return (
    <Escena t={t} tomas={tomas}>
      {win.on && (
        <div style={{ position: "absolute", left: WX, top: WY, opacity: win.opacity, transform: `scale(${win.scale})`, transformOrigin: "50% 50%" }}>
          <VentanaVs
            titulo={abierta ? "mi-proyecto" : "Welcome"}
            activo={activo}
            claude={claudeIcono}
            pulsoClaude={pulsoIcono}
            lateral={lateral}
            editor={editor}
            pestanas={pestanas}
            encima={
              <>
                {dialogo && <DialogoCarpeta op={dOp} escala={0.92 + 0.08 * dOp} sel={ramp(t, T.clicCarpeta, T.clicCarpeta + 0.15)} pulsaOpen={pulso(t, [T.clicAbrir])} />}
                {cursorOp > 0.01 && <Cursor x={cur.x} y={cur.y} pulsa={pul} opacity={cursorOp} size={58} />}
              </>
            }
          />
        </div>
      )}
      {/* el proyecto abierto */}
      {(() => {
        const v = vis(t, T.ese - 0.05, T.ahora + 0.1, 0.9);
        return v.on ? <div style={{ position: "absolute", left: WX + VS.act + 4, top: WY + VS.barra + 52, width: VS.lat - 8, height: 260, borderRadius: 14, border: `5px solid ${C.acento}`, boxShadow: `0 0 40px ${C.acento}66`, opacity: v.opacity, transform: `scale(${1.08 - 0.08 * v.s})` }} /> : null;
      })()}
      <Etiqueta texto="TU PROYECTO, ABIERTO" x={WX + 276} y={WY + 420} t={t} at={T.ese} out={T.ahora + 0.1} size={34} variante="acento" fuente="titulo" />
      {/* PRO O MAX */}
      {(() => {
        const v = vis(t, T.pro - 0.05, T.icono - 0.3, 0.3);
        if (!v.on) return null;
        const r = ramp(t, T.max, T.max + 0.25);
        return (
          <div style={{ position: "absolute", left: WX + 960, top: WY + 600, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale * (1 + 0.08 * Math.sin(r * Math.PI))}) rotate(${(1 - v.s) * -10 - 3}deg)`, display: "flex", alignItems: "center", gap: 18, padding: "18px 34px", borderRadius: 26, background: r > 0.5 ? C.acento : "rgba(11,13,18,0.92)", border: `6px solid ${C.acento}`, boxShadow: `0 0 ${40 + 40 * r}px ${C.acento}88`, whiteSpace: "nowrap" }}>
              <Img src={staticFile("logos/claude.png")} style={{ width: 64 }} />
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 64, color: r > 0.5 ? C.oscuro : C.acento, letterSpacing: 1 }}>PRO O MAX</div>
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="TU SUSCRIPCIÓN" x={WX + 960} y={WY + 720} t={t} at={T.funciona + 0.2} out={T.icono - 0.3} size={32} variante="borde" />
      {/* icono de Claude en la barra lateral */}
      <Anillo x={WX + posActividad(5).x} y={WY + posActividad(5).y} r={62} t={t} at={T.barra - 0.05} out={T.abrelo4 + 0.1} />
      <Etiqueta texto="BARRA LATERAL" x={WX + 300} y={WY + posActividad(5).y} t={t} at={T.barra} out={T.abrelo4 + 0.2} size={36} variante="acento" fuente="titulo" />
      {/* lo bueno */}
      <Sello texto="LO BUENO" x={WX + 960} y={WY + 610} t={t} at={T.bueno} out={T.mira + 0.2} size={58} rot={-4} />
      <Etiqueta texto="ASÍ DE FÁCIL" x={WX + 760} y={WY + 760} t={t} at={T.facil - 0.15} out={out} size={54} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosVsCode = (L: Linea): Evento[] => {
  const T = tiempos(L);
  const clic = (tt: number) => ({ t: tt, sfx: "tick" as const, vol: 0.28 });
  return [
    { t: T.abrelo - 0.2, sfx: "whoosh", vol: 0.3 },
    clic(T.clicOpen),
    { t: T.clicOpen + 0.1, sfx: "pop", vol: 0.3 },
    clic(T.clicCarpeta),
    clic(T.clicAbrir),
    clic(T.clicExt),
    { t: T.buscalo + 0.05, sfx: "tecleo", vol: 0.25, dur: 0.7 },
    clic(T.clicItem),
    clic(T.clicInstall),
    { t: T.pro, sfx: "golpe", vol: 0.45 },
    { t: T.icono, sfx: "pop", vol: 0.45 },
    clic(T.clicClaude),
    clic(T.clicSesion),
    { t: T.escribele + 0.25, sfx: "tecleo", vol: 0.25, dur: Math.max(0.3, T.holaFin - T.escribele - 0.25) },
    { t: T.envia, sfx: "envio", vol: 0.45 },
    { t: T.bueno, sfx: "golpe", vol: 0.4 },
    { t: T.pregunta, sfx: "pop", vol: 0.4 },
  ];
};
