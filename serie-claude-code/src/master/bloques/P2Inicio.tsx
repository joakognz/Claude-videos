/**
 * Parte 2, inicio: «Hoy instalamos…» (Claude Code entra en Visual Studio Code y llegan las extensiones), recuerdo de
 * la parte 1 (UN PROYECTO = UNA CARPETA), sello «BLOQUE N» y la toma real de la web de Visual Studio Code (EP.2).
 */
import React from "react";
import { Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import { Carpeta3D } from "../componentes/Carpeta3D";
import { Escena } from "../componentes/Escena";
import { IconPuzle } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE, EASE_OUT, FPS, MONO, TITULO, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

/** Línea de título grande con entrada spring. */
export const Titular: React.FC<{ txt: React.ReactNode; x?: number; y: number; t: number; at: number; out?: number; size?: number; color?: string }> = ({ txt, x = 540, y, t, at, out, size = 96, color = C.texto }) => {
  const v = vis(t, at, out, 0.8);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, fontFamily: TITULO, fontWeight: 800, fontSize: size, color, whiteSpace: "nowrap", letterSpacing: -2, textAlign: "center", lineHeight: 1.05 }}>{txt}</div>
    </div>
  );
};

/** Ficha blanca para logos que no se leen sobre el fondo oscuro (Hostinger, Live Server, Node.js). */
export const Ficha: React.FC<{ src: string; x: number; y: number; w: number; t: number; at: number; out?: number; radio?: number; pad?: number }> = ({ src, x, y, w, t, at, out, radio = 0.22, pad = 0.12 }) => {
  const v = vis(t, at, out, 0.3);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - w / 2, width: w, height: w, borderRadius: w * radio, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale}) rotate(${(1 - v.s) * -12}deg)`, boxShadow: "0 18px 50px rgba(0,0,0,0.55)" }}>
      <Img src={staticFile(src)} style={{ width: w * (1 - 2 * pad), height: w * (1 - 2 * pad), objectFit: "contain" }} />
    </div>
  );
};

// ── Hoy ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const tHoy = (L: Linea) => ({
  hoy: L.en("hoy", "Hoy"),
  instalamos: L.en("hoy", "instalamos"),
  claude: L.en("hoy", "Claude"),
  visual: L.en("hoy", "Visual"),
  ext: L.en("hoy", "extensiones"),
  rapido: L.en("hoy", "rápido"),
  esfuerzo: L.en("hoy", "esfuerzo"),
});

export const Hoy2: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tHoy(L);
  const out = hasta + 0.3;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 0.92 },
    { t: T.claude - 0.2, x: 540, y: 1120, z: 1.04, d: 1.0 },
    { t: T.ext - 0.2, x: 600, y: 1130, z: 1.1, d: 0.9 },
    { t: T.rapido - 0.3, x: 540, y: 1220, z: 1.0, d: 1.0 },
  ];
  const VSX = 720;
  const VSY = 1110;
  // la mascota de Claude Code entra en Visual Studio Code
  const m = vis(t, T.claude - 0.05, out, 0.3);
  const vuela = ramp(t, T.visual + 0.45, T.visual + 1.1, EASE);
  const mx = 280 + (VSX + 70 - 280) * vuela;
  const my = VSY - Math.sin(vuela * Math.PI) * 160 + vuela * 70;
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="HOY" x={540} y={700} t={t} at={T.hoy - 0.05} out={out} size={44} variante="acento" fuente="titulo" />
      <Titular txt="INSTALAMOS" y={820} t={t} at={T.instalamos - 0.05} out={out} />
      <Titular txt={<span style={{ color: C.acento }}>+ EXTENSIONES</span>} y={930} t={t} at={T.ext - 0.05} out={out} size={80} />
      <Logo src={ep.logos.vscode} x={VSX} y={VSY} w={230} t={t} at={T.visual - 0.05} out={out} pulsos={[T.visual + 1.05]} />
      {m.on && (
        <div style={{ position: "absolute", left: mx - 95, top: my - 95, width: 190, height: 190, borderRadius: "50%", background: C.fondo, border: `5px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: m.opacity, transform: `scale(${m.scale * (1 - 0.55 * vuela)})`, boxShadow: `0 0 40px ${C.acento}55` }}>
          <Img src={staticFile(ep.logos.claude_code)} style={{ width: 130 }} />
        </div>
      )}
      {[0, 1, 2].map((i) => {
        const v = vis(t, T.ext + 0.05 + i * 0.12, out, 0.2);
        if (!v.on) return null;
        const px = 590 + i * 130;
        const py = 1300;
        return (
          <div key={i} style={{ position: "absolute", left: px - 50, top: py - 50, width: 100, height: 100, borderRadius: 26, background: C.panel2, border: `3px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `translateY(${(1 - v.s) * -60}px) scale(${v.scale}) rotate(${(1 - v.s) * 40}deg)` }}>
            <IconPuzle s={62} color={C.acento} />
          </div>
        );
      })}
      <Etiqueta texto="⚡ MÁS RÁPIDO" x={320} y={1420} t={t} at={T.rapido - 0.05} out={out} size={44} variante="borde" fuente="titulo" />
      <Etiqueta texto="MENOS ESFUERZO" x={770} y={1420} t={t} at={T.esfuerzo - 0.05} out={out} size={44} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosHoy2 = (L: Linea): Evento[] => {
  const T = tHoy(L);
  return [
    { t: T.hoy, sfx: "pop", vol: 0.35 },
    { t: T.claude, sfx: "pop", vol: 0.4 },
    { t: T.visual, sfx: "pop", vol: 0.4 },
    { t: T.visual + 1.05, sfx: "whoosh", vol: 0.3 },
    { t: T.ext, sfx: "pop", vol: 0.45 },
    { t: T.rapido, sfx: "pop", vol: 0.35 },
    { t: T.esfuerzo, sfx: "pop", vol: 0.35 },
  ];
};

// ── Recuerdo ──────────────────────────────────────────────────────────────────────────────────────────────────────
const tRec = (L: Linea) => ({
  recuerda: L.en("recuerdo", "Recuerda"),
  proyecto: L.en("recuerdo", "proyecto"),
  carpeta: L.en("recuerdo", "carpeta"),
  archivos: L.en("recuerdo", "archivos"),
  nada: L.en("recuerdo", "Nada"),
});

export const Recuerdo: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tRec(L);
  const out = hasta + 0.3;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1060, z: 0.94 },
    { t: T.carpeta - 0.3, x: 540, y: 1100, z: 1.08, d: 1.0 },
    { t: T.nada - 0.4, x: 540, y: 1160, z: 1.0, d: 0.9 },
  ];
  const entra = sp(t, T.proyecto - 0.2, { damping: 12, stiffness: 120 });
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="RECUERDA · PARTE 1" x={540} y={720} t={t} at={T.recuerda - 0.05} out={out} size={40} variante="borde" fuente="titulo" />
      {entra > 0.001 && (
        <div style={{ position: "absolute", left: 540, top: 1060, width: 0, height: 0, opacity: Math.min(1, entra * 2) }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * entra}) translateY(${(1 - entra) * 120}px)` }}>
            <Carpeta3D w={500} abre={ramp(t, T.carpeta - 0.1, T.carpeta + 0.7, EASE_OUT)} hojas={ramp(t, T.archivos - 0.2, T.archivos + 1.0, EASE_OUT)} n={4} t={t} />
          </div>
        </div>
      )}
      <Titular txt="UN PROYECTO" y={1390} t={t} at={T.proyecto} out={out} size={84} />
      <Titular txt={<><span style={{ color: C.gris }}>=</span> <span style={{ color: C.acento }}>UNA CARPETA</span></>} y={1490} t={t} at={T.carpeta} out={out} size={84} />
      <Sello texto="NADA MÁS" x={800} y={830} t={t} at={T.nada} out={out} size={50} rot={6} />
    </Escena>
  );
};

export const eventosRecuerdo = (L: Linea): Evento[] => {
  const T = tRec(L);
  return [
    { t: T.recuerda, sfx: "pop", vol: 0.35 },
    { t: T.proyecto, sfx: "pop", vol: 0.4 },
    { t: T.carpeta, sfx: "whoosh", vol: 0.3 },
    { t: T.nada + 0.1, sfx: "golpe", vol: 0.45 },
  ];
};

// ── Sello «BLOQUE N» ───────────────────────────────────────────────────────────────────────────────────────────────
export const datosBloque = (ep: EpisodioMaster, escena: string) => ep.bloques.find((b) => b.desde === escena);

export const BloqueSello: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta, escenas }) => {
  const b = datosBloque(ep, escenas[0]);
  const ini = L.ini(escenas[0]);
  const out = hasta + 0.3;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 0.95 },
    { t: ini + 0.3, x: 540, y: 1100, z: 1.08, d: 1.4 },
  ];
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto={`BLOQUE ${b?.n ?? 1}`} x={540} y={930} t={t} at={ini} out={out} size={110} rot={-4} />
      <Titular txt={(b?.titulo ?? "").toUpperCase()} y={1130} t={t} at={ini + 0.35} out={out} size={104} color={C.texto} />
      <Logo src={ep.logos.vscode} x={440} y={1340} w={150} t={t} at={ini + 0.5} out={out} />
      <Logo src={ep.logos.claude_code} x={640} y={1340} w={130} t={t} at={ini + 0.6} out={out} sombra={false} />
    </Escena>
  );
};

export const eventosBloqueSello = (L: Linea, ep: EpisodioMaster): Evento[] =>
  ep.bloques.filter((b) => b.tipo === "bloque").map((b) => ({ t: L.ini(b.desde) + 0.1, sfx: "golpe" as const, vol: 0.6 }));

// ── Toma real: la web de Visual Studio Code (EP.2), plano corto ─────────────────────────────────────────────────────
const tToma = (L: Linea) => ({
  primero: L.ini("paso1"),
  visual: L.en("paso1", "Visual"),
  web: L.en("paso1", "web"),
  oficial: L.en("paso1", "oficial"),
  episodio: L.en("paso1", "episodio"),
  dos: L.en("paso1", "dos"),
});

export const TomaWeb: React.FC<BloqueProps> = ({ t, t0, ep, L, desde, hasta }) => {
  const T = tToma(L);
  const clip = ep.clips?.web;
  const out = hasta + 0.3;
  const entra = T.web - 0.15;
  const W = 900;
  const H = clip ? (W * clip.alto) / clip.ancho : 880;
  const cy = 1110;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 1.0 },
    { t: entra, x: 540, y: cy, z: 1.0, d: 0.6 },
    { t: entra + 0.6, x: 580, y: cy - 80, z: 1.08, d: 2.6 },
  ];
  const c = vis(t, entra, out, 0.75);
  const logo = 1 - ramp(t, entra - 0.1, entra + 0.3);
  const rate = 1.35;
  return (
    <Escena t={t} tomas={tomas}>
      {logo > 0.01 && (
        <div style={{ opacity: logo }}>
          <Logo src={ep.logos.vscode} x={540} y={1000} w={260} t={t} at={desde - 0.2} />
          <Titular txt="VISUAL STUDIO CODE" y={1240} t={t} at={T.visual - 0.05} size={70} />
        </div>
      )}
      {clip && c.on && (
        <div style={{ position: "absolute", left: 540 - W / 2, top: cy - H / 2, width: W, height: H, borderRadius: 34, overflow: "hidden", border: `4px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", opacity: c.opacity, transform: `scale(${c.scale})`, background: "#000" }}>
          <Sequence from={Math.round((entra - t0) * FPS)} layout="none">
            <OffthreadVideo src={staticFile(clip.src)} muted playbackRate={rate} style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
          </Sequence>
        </div>
      )}
      <Etiqueta texto="WEB OFICIAL" x={370} y={cy + H / 2 - 10} t={t} at={T.oficial - 0.05} out={out} size={40} variante="acento" fuente="titulo" />
      {(() => {
        const v = vis(t, T.episodio - 0.05, out, 0.3);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540 + W / 2 - 230, top: cy - H / 2 - 40, display: "flex", alignItems: "center", gap: 12, padding: "14px 26px", borderRadius: 999, background: C.acento, boxShadow: `0 12px 40px ${C.acento}77`, opacity: v.opacity, transform: `scale(${v.scale}) rotate(${(1 - v.s) * 20 + 4}deg)` }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: C.oscuro }} />
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.oscuro }}>EP.2</div>
          </div>
        );
      })()}
    </Escena>
  );
};

export const eventosTomaWeb = (L: Linea): Evento[] => {
  const T = tToma(L);
  return [
    { t: T.web - 0.15, sfx: "whoosh", vol: 0.3 },
    { t: T.episodio, sfx: "pop", vol: 0.45 },
  ];
};
