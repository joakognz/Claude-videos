/**
 * Bloque «Conseguirlo» (escenas hoy → conseguir → buscador → gratis):
 * agenda de hoy → logo de VS Code y «¿Dónde conseguirlo?» → buscador recreado («visual studio code» se escribe,
 * sale el primer resultado y el cursor lo pulsa) → la grabación real de la web oficial (zoom al toque en Download)
 * → sellos GRATIS y CÓDIGO ABIERTO.
 */
import React from "react";
import { Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Logo } from "../componentes/Logo";
import { Cursor, Toque } from "../componentes/Piezas";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE, FPS, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const CONSULTA = "visual studio code";
/** Texto del primer resultado y dirección, tal como salen en la grabación. */
const RESULTADO = { titulo: "Visual Studio Code - Build what comes next", url: "code.visualstudio.com" };

/** La grabación (ya recortada y acelerada ×1,30): 1000 x 982 px. Toques medidos sobre el original. */
const CLIP = { w: 1000, h: 982, escala: 0.92, cx: 540, cy: 3600, toques: [{ s: 1.385, x: 960, y: 110 }, { s: 2.077, x: 802, y: 224 }] };
const enClip = (px: number, py: number) => ({
  x: CLIP.cx - (CLIP.w * CLIP.escala) / 2 + px * CLIP.escala,
  y: CLIP.cy - (CLIP.h * CLIP.escala) / 2 + py * CLIP.escala,
});

const tiempos = (L: Linea) => ({
  que: L.en("hoy", "qué"),
  organiza: L.en("hoy", "organiza"),
  primero: L.en("conseguir", "Primero"),
  donde: L.en("conseguir", "dónde"),
  busca: L.en("buscador", "Busca"),
  escribeA: L.en("buscador", "Visual"),
  escribeB: L.finDe("buscador", "Code"),
  navegador: L.en("buscador", "navegador"),
  entra: L.en("buscador", "Entra"),
  descargalo: L.en("buscador", "descárgalo"),
  gratis: L.en("gratis", "gratis"),
  abierto: L.en("gratis", "código"),
  finGratis: L.fin("gratis"),
});

export const Conseguir: React.FC<BloqueProps> = ({ t, t0, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const clip = ep.clips?.web;
  const t1 = enClip(CLIP.toques[0].x, CLIP.toques[0].y);
  const clic = T.entra - 0.12;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1040, z: 0.94 },
    { t: T.que - 0.15, x: 540, y: 1000, z: 1.06, d: 0.9 },
    { t: T.organiza - 0.2, x: 540, y: 1130, z: 1.06, d: 0.9 },
    { t: T.primero - 0.2, x: 540, y: 2120, z: 1.0, d: 1.0 },
    { t: T.donde + 0.3, x: 540, y: 2150, z: 1.16, d: 1.0 },
    { t: T.busca - 0.3, x: 540, y: 2960, z: 1.1, d: 0.9 },
    { t: T.navegador - 0.15, x: 540, y: 3010, z: 1.04, d: 0.8 },
    { t: clic + 0.05, x: 540, y: CLIP.cy, z: 1.0, d: 0.7 },
    { t: T.entra + 0.6, x: 740, y: t1.y + 60, z: 1.65, d: 0.75 },
    { t: T.gratis - 0.35, x: 540, y: CLIP.cy, z: 1.0, d: 0.95 },
    { t: T.abierto + 0.1, x: 540, y: CLIP.cy + 40, z: 1.06, d: 1.2 },
  ];

  // buscador
  const nLetras = Math.round(clamp01((t - T.escribeA) / Math.max(0.3, T.escribeB - T.escribeA)) * CONSULTA.length);
  const crece = sp(t, clic, { damping: 17, stiffness: 120 });
  const buscadorFuera = T.entra + 0.25;
  // cursor: entra, va al resultado y pulsa
  const cur0 = { x: 900, y: 3330 };
  const cur1 = { x: 330, y: 3075 };
  const ir = ramp(t, T.navegador + 0.1, clic - 0.08, EASE);
  const pulsa = Math.sin(clamp01((t - clic + 0.08) / 0.18) * Math.PI);
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── hoy ── */}
      <Etiqueta texto="HOY" x={540} y={830} t={t} at={desde + 0.15} out={T.primero + 0.2} size={40} variante="acento" fuente="titulo" />
      <Agenda n={1} y={990} t={t} at={T.que - 0.05} out={T.primero + 0.2}>
        ¿Qué es <span style={{ color: C.acento }}>Visual Studio Code</span>?
      </Agenda>
      <Agenda n={2} y={1150} t={t} at={T.organiza - 0.1} out={T.primero + 0.2}>
        Cómo se organiza tu forma de trabajar
      </Agenda>

      {/* ── dónde conseguirlo ── */}
      <Logo src={ep.logos.vscode} x={540} y={2060} w={300} t={t} at={T.primero + 0.05} out={T.busca + 0.3} pulsos={[T.donde]} />
      <Etiqueta texto="PRIMERO" x={540} y={1830} t={t} at={T.primero} out={T.busca + 0.3} size={34} variante="gris" />
      <Etiqueta texto="¿Dónde conseguirlo?" x={540} y={2330} t={t} at={T.donde - 0.05} out={T.busca + 0.3} size={72} variante="texto" fuente="titulo" />

      {/* ── buscador ── */}
      {(() => {
        const v = vis(t, T.busca - 0.1, buscadorFuera);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 90, top: 2870, width: 900, height: 120, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, borderRadius: 60, background: C.panel2, border: `3px solid ${nLetras > 0 ? C.acento : C.borde}`, display: "flex", alignItems: "center", gap: 22, padding: "0 36px", boxSizing: "border-box", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <svg width={46} height={46} viewBox="0 0 24 24"><circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke={C.gris} strokeWidth={2.6} /><path d="M15.5 15.5 L21 21" stroke={C.gris} strokeWidth={2.6} strokeLinecap="round" /></svg>
            <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 52, color: C.texto, whiteSpace: "nowrap" }}>
              {CONSULTA.slice(0, nLetras)}
              <span style={{ display: "inline-block", width: 4, height: 54, marginLeft: 4, verticalAlign: "middle", background: C.acento, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.15 }} />
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="EN TU NAVEGADOR" x={540} y={2800} t={t} at={T.navegador} out={buscadorFuera} size={30} variante="gris" />
      {(() => {
        const v = vis(t, T.navegador - 0.05, buscadorFuera + 0.1);
        if (!v.on) return null;
        const marcado = clamp01((t - clic) / 0.15);
        return (
          <div style={{ position: "absolute", left: 90, top: 3015, width: 900, height: 160, opacity: v.opacity * (1 - crece * 0.0), transform: `translateY(${v.y}px) scale(${v.scale})`, borderRadius: 26, background: marcado > 0 ? `rgba(217,119,87,${0.16 * marcado})` : C.panel, border: `3px solid ${marcado > 0 ? C.acento : C.borde}`, display: "flex", alignItems: "center", gap: 26, padding: "0 30px", boxSizing: "border-box" }}>
            <Img src={staticFile(ep.logos.vscode)} style={{ width: 70, height: "auto" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 33, color: C.texto, whiteSpace: "nowrap" }}>{RESULTADO.titulo}</div>
              <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.acentoSuave }}>{RESULTADO.url}</div>
            </div>
          </div>
        );
      })()}
      {t > T.navegador && t < buscadorFuera + 0.2 && (
        <Cursor x={cur0.x + (cur1.x - cur0.x) * ir} y={cur0.y + (cur1.y - cur0.y) * ir} pulsa={pulsa} opacity={clamp01((t - T.navegador) / 0.2) * (1 - clamp01((t - buscadorFuera) / 0.2))} />
      )}

      {/* ── la web oficial: grabación real ── */}
      {clip && t > clic - 0.05 && (
        <div style={{ position: "absolute", left: CLIP.cx, top: CLIP.cy, width: 0, height: 0 }}>
          <div
            style={{
              position: "absolute", width: CLIP.w * CLIP.escala, height: CLIP.h * CLIP.escala,
              transform: `translate(-50%, -50%) translateY(${(1 - crece) * (3095 - CLIP.cy)}px) scale(${0.18 + 0.82 * crece})`,
              opacity: clamp01(crece * 3) * (1 - ramp(t, hasta + 0.2, hasta + 0.4)), borderRadius: 28, overflow: "hidden",
              border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.7)", background: "#000",
            }}
          >
            <Sequence from={Math.round((T.entra - t0) * FPS)} layout="none">
              <OffthreadVideo src={staticFile(clip.src)} muted style={{ width: "100%", height: "100%", display: "block" }} />
            </Sequence>
          </div>
        </div>
      )}
      {CLIP.toques.map((q, i) => {
        const p = enClip(q.x, q.y);
        return <Toque key={i} x={p.x} y={p.y} t={t} at={T.entra + q.s} r={40} />;
      })}
      <Sello texto="GRATIS" x={300} y={CLIP.cy - 330} t={t} at={T.gratis} out={hasta + 0.3} size={78} rot={-6} />
      <Sello texto="CÓDIGO ABIERTO" x={640} y={CLIP.cy + 330} t={t} at={T.abierto} out={hasta + 0.3} size={64} rot={4} />
    </Escena>
  );
};

const Agenda: React.FC<{ n: number; y: number; t: number; at: number; out: number; children: React.ReactNode }> = ({ n, y, t, at, out, children }) => {
  const v = vis(t, at, out, 0.8);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: 90, top: y - 60, width: 900, height: 120, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 28, padding: "0 30px", boxSizing: "border-box", borderRadius: 28, background: C.panel, border: `3px solid ${C.borde}` }}>
      <div style={{ width: 66, height: 66, borderRadius: 18, background: C.acento, color: C.oscuro, fontFamily: TITULO, fontWeight: 800, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
      <div style={{ fontFamily: TITULO, fontWeight: 700, fontSize: 44, color: C.texto, lineHeight: 1.15 }}>{children}</div>
    </div>
  );
};

export const eventosConseguir = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.que - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.organiza - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.primero + 0.05, sfx: "pop", vol: 0.45 },
    { t: T.escribeA, sfx: "tecleo", vol: 0.32, dur: T.escribeB - T.escribeA },
    { t: T.navegador - 0.05, sfx: "pop", vol: 0.3 },
    { t: T.entra - 0.12, sfx: "tick", vol: 0.45 },
    { t: T.entra - 0.05, sfx: "whoosh", vol: 0.3 },
    { t: T.entra + CLIP.toques[0].s, sfx: "tick", vol: 0.4 },
    { t: T.entra + CLIP.toques[1].s, sfx: "tick", vol: 0.35 },
    { t: T.gratis + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.abierto + 0.12, sfx: "golpe", vol: 0.5 },
  ];
};
