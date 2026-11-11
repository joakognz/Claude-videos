/**
 * Etapa 1 · Desarrollo (escenas carpeta → guardar).
 *  - La carpeta se abre en Visual Studio Code (logo adjunto) y sus archivos viajan como contexto a Claude.
 *  - Por trozos: una funcionalidad se construye, se prueba (tick) y empieza la siguiente. «Hazme la app entera»: tachado.
 *  - Revisa antes de aceptar (escáner y botón ACEPTAR), guarda avances (puntos de guardado) y, si algo se rompe,
 *    flecha atrás al último guardado.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Carpeta, Check, Cruz, Cursor, Deshacer, Documento, Guardar, Lupa } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta } from "../componentes/Sello";
import { C, EASE, MONO, TITULO, UI, clamp01, enCurva, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => ({
  preparas: L.ini("carpeta"),
  carpeta: L.en("carpeta", "carpeta,"),
  abres: L.en("carpeta", "abres"),
  visual: L.en("carpeta", "Visual"),
  das: L.en("carpeta", "das"),
  contexto: L.en("carpeta", "contexto"),
  claude: L.en("carpeta", "Claude."),
  construyes: L.en("trozos", "construyes"),
  trozos: L.en("trozos", "trozos:"),
  funcionalidad: L.en("trozos", "funcionalidad,"),
  pruebas: L.en("trozos", "pruebas,"),
  siguiente: L.en("trozos", "siguiente."),
  nunca: L.en("trozos", "Nunca"),
  hazme: L.en("trozos", "«hazme"),
  entera: L.en("trozos", "entera»."),
  revisa: L.ini("guardar"),
  aceptar: L.en("guardar", "aceptar,"),
  guarda: L.en("guardar", "guarda"),
  avances: L.en("guardar", "avances"),
  algo: L.en("guardar", "algo"),
  rompe: L.en("guardar", "rompe."),
  fin: L.fin("guardar"),
});

const VS = { x: 540, y: 1180, w: 960, h: 640 };
const FUN = { x: 540, y0: 1960, paso: 150 };
const DIFF = { x: 540, y: 2900 };

/** Barra de código abstracta (sin texto inventado). */
const Barras: React.FC<{ n: number; t: number; at: number; dur?: number; semilla?: number; ancho?: number }> = ({ n, t, at, dur = 0.8, semilla = 1, ancho = 1 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const p = clamp01((t - at - (i * dur) / n) / 0.25);
      const w = (0.35 + 0.55 * Math.abs(Math.sin(i * 2.3 + semilla))) * ancho;
      const ind = (i % 3 === 1 ? 1 : i % 4 === 2 ? 2 : 0) * 28;
      return <div key={i} style={{ height: 14, marginBottom: 16, marginLeft: ind, width: `${w * 100 * p}%`, borderRadius: 7, background: i % 5 === 0 ? C.acento : i % 3 === 0 ? "#7FB7E8" : C.gris, opacity: 0.85 }} />;
    })}
  </>
);

export const EtapaDesarrollo: React.FC<BloqueProps> = ({ t, ep, L, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: T.preparas - 1.2, x: 540, y: 1040, z: 1.06 },
    { t: T.abres - 0.15, x: 540, y: 1150, z: 0.98, d: 0.8 },
    { t: T.das - 0.25, x: 700, y: 1200, z: 1.12, d: 0.8 },
    { t: T.construyes - 0.3, x: 540, y: 2040, z: 1.0, d: 0.85 },
    { t: T.hazme - 0.35, x: 540, y: 2250, z: 1.0, d: 0.7 },
    { t: T.revisa - 0.4, x: 540, y: 2920, z: 1.0, d: 0.85 },
    { t: T.algo - 0.2, x: 540, y: 2930, z: 1.08, d: 0.6 },
  ];
  // la carpeta: aparece grande, se abre y vuela a la barra lateral de VS Code
  const vuela = EASE(ramp(t, T.abres + 0.05, T.visual + 0.25, (x) => x));
  const cx = 540 + (VS.x - VS.w / 2 + 110 - 540) * vuela;
  const cy = 1000 + (VS.y - VS.h / 2 + 130 - 1000) * vuela;
  const cs = 340 - 280 * vuela;
  const ventana = sp(t, T.abres - 0.05, { damping: 14, stiffness: 150 }) * (1 - ramp(t, T.construyes - 0.1, T.construyes + 0.35));
  const panelClaude = sp(t, T.das - 0.1, { damping: 14, stiffness: 170 });
  // funcionalidades
  const f1 = ramp(t, T.funcionalidad - 0.1, T.pruebas - 0.15);
  const t1 = clamp01((t - T.pruebas - 0.05) / 0.3);
  const f2 = ramp(t, T.siguiente - 0.1, T.siguiente + 2.6);
  // revisión y guardado
  const escaner = ramp(t, T.revisa, T.aceptar - 0.1);
  const aceptado = clamp01((t - T.aceptar - 0.15) / 0.3);
  const guardados = [T.guarda - 0.05, T.avances, T.avances + 0.3];
  const rotura = ramp(t, T.rompe - 0.18, T.rompe) * (1 - ramp(t, T.rompe + 0.3, T.rompe + 0.55));
  const deshace = ramp(t, T.rompe + 0.05, T.rompe + 0.45);
  return (
    <Escena t={t} tomas={tomas}>
      {/* ventana de Visual Studio Code */}
      {ventana > 0.001 && (
        <div style={{ position: "absolute", left: VS.x - VS.w / 2, top: VS.y - VS.h / 2, width: VS.w, height: VS.h, borderRadius: 26, overflow: "hidden", background: "#1E1E1E", border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", opacity: Math.min(1, ventana * 1.5), transform: `scale(${0.7 + 0.3 * ventana})` }}>
          <div style={{ height: 70, background: "#2D2D2D", display: "flex", alignItems: "center", gap: 12, padding: "0 24px" }}>
            {["#5A5F6B", "#5A5F6B", "#5A5F6B"].map((c, i) => <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: c }} />)}
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: UI, fontWeight: 600, fontSize: 26, color: C.gris }}>VS Code</span>
            <div style={{ width: 60 }} />
          </div>
          {/* barra lateral: el explorador con la carpeta y sus archivos */}
          <div style={{ position: "absolute", left: 0, top: 70, bottom: 0, width: 250, background: "#252526", padding: "26px 22px", boxSizing: "border-box" }}>
            <div style={{ height: 70 }} />
            {[0, 1, 2, 3].map((i) => {
              const p = clamp01((t - T.visual - 0.1 - i * 0.12) / 0.25);
              const vuelaCtx = i < 3 ? EASE(ramp(t, T.contexto - 0.1 + i * 0.12, T.contexto + 0.45 + i * 0.12, (x) => x)) : 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, marginLeft: 26, opacity: p, transform: `translateX(${(1 - p) * -20}px)` }}>
                  <div style={{ width: 22, height: 26, borderRadius: 4, background: i === 3 ? C.acento : "#9AA0AA", opacity: vuelaCtx > 0 ? 0.4 : 1 }} />
                  <div style={{ height: 12, width: 90 + ((i * 37) % 50), borderRadius: 6, background: "#6B717D" }} />
                </div>
              );
            })}
          </div>
          {/* editor */}
          <div style={{ position: "absolute", left: 280, top: 110, width: 380 }}>
            <Barras n={12} t={t} at={T.visual + 0.2} dur={2.4} />
          </div>
          {/* panel de Claude */}
          {panelClaude > 0.001 && (
            <div style={{ position: "absolute", right: 0, top: 70, bottom: 0, width: 280 * panelClaude, background: "#1A1B20", borderLeft: `3px solid ${C.acento}`, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 24, top: 24, width: 230 }}>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 24, color: C.acentoSuave, letterSpacing: 1, marginLeft: 70, marginTop: 12 }}>CONTEXTO</div>
              </div>
            </div>
          )}
        </div>
      )}
      {panelClaude > 0.5 && <Logo src={ep.logos.claude} x={VS.x + VS.w / 2 - 230} y={VS.y - VS.h / 2 + 128} w={56} t={t} at={T.das} out={T.construyes + 0.3} sombra={false} rot={(t - T.das) * 20} />}
      {ventana > 0.5 && <Logo src={ep.logos.vscode} x={VS.x - VS.w / 2 + 54} y={VS.y - VS.h / 2 - 48} w={110} t={t} at={T.visual - 0.05} out={T.construyes + 0.3} pulsos={[T.visual + 0.6]} />}
      {/* documentos de contexto: de la barra lateral a Claude */}
      {[0, 1, 2].map((i) => {
        const a = T.contexto - 0.1 + i * 0.12;
        const u = EASE(ramp(t, a, a + 0.55, (x) => x));
        if (u <= 0 || t > T.construyes + 0.3) return null;
        const p = enCurva({ a: { x: VS.x - VS.w / 2 + 120, y: VS.y - VS.h / 2 + 200 + i * 44 }, c: { x: VS.x, y: VS.y - VS.h / 2 - 120 }, b: { x: VS.x + VS.w / 2 - 140, y: VS.y - VS.h / 2 + 230 + i * 92 } }, u);
        return (
          <div key={i} style={{ position: "absolute", left: p.x - 36, top: p.y - 36, transform: `rotate(${(1 - u) * (i - 1) * 25}deg) scale(${0.7 + 0.3 * u})` }}>
            <Documento s={72} tipo={i === 1 ? "esquema" : "texto"} />
          </div>
        );
      })}
      {/* la carpeta */}
      {(() => {
        const v = vis(t, T.preparas - 0.1, Infinity, 0.4);
        if (!v.on || vuela >= 1) return null;
        const golpe = Math.sin(clamp01((t - T.carpeta) / 0.35) * Math.PI) * 0.12;
        return (
          <div style={{ position: "absolute", left: cx - cs / 2, top: cy - cs / 2, width: cs, height: cs, opacity: v.opacity * (1 - ramp(t, T.visual + 0.1, T.visual + 0.3)), transform: `scale(${v.scale * (1 + golpe)})` }}>
            <Carpeta s={cs} abierta={ramp(t, T.carpeta + 0.15, T.abres + 0.1)} />
          </div>
        );
      })()}
      <Etiqueta texto="LA CARPETA" x={540} y={1240} t={t} at={T.carpeta} out={T.abres + 0.1} size={40} variante="borde" />

      {/* por trozos */}
      <Etiqueta texto="POR TROZOS" x={540} y={FUN.y0 - 150} t={t} at={T.trozos - 0.05} out={T.revisa} size={44} variante="acento" fuente="titulo" />
      {[0, 1, 2].map((i) => {
        const at = i === 0 ? T.funcionalidad - 0.2 : i === 1 ? T.siguiente - 0.15 : T.siguiente + 0.1;
        const v = vis(t, at, T.revisa, 0.7);
        if (!v.on) return null;
        const prog = i === 0 ? f1 : i === 1 ? f2 * 0.7 : 0;
        const hecha = i === 0 ? t1 : 0;
        const espera = i === 2;
        return (
          <div key={i} style={{ position: "absolute", left: FUN.x - 400, top: FUN.y0 + i * FUN.paso - 58, width: 800, height: 116, boxSizing: "border-box", borderRadius: 28, background: espera ? "transparent" : C.panel2, border: `3px ${espera ? "dashed" : "solid"} ${hecha > 0 || (i === 1 && prog > 0) ? C.acento : C.borde}`, opacity: v.opacity * (espera ? 0.6 : 1), transform: `translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 22, padding: "0 28px" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: espera ? C.tenue : C.acento, width: 40 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 32, color: espera ? C.tenue : C.texto, letterSpacing: 0.5 }}>FUNCIONALIDAD</div>
              <div style={{ marginTop: 10, height: 12, borderRadius: 6, background: C.panel, overflow: "hidden" }}>
                <div style={{ width: `${prog * 100}%`, height: "100%", background: C.acento }} />
              </div>
            </div>
            <div style={{ width: 150, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
              {i === 0 && t > T.pruebas - 0.1 && <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 24, color: C.acentoSuave, opacity: ramp(t, T.pruebas - 0.1, T.pruebas + 0.1) }}>PRUEBA</span>}
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: hecha > 0 ? C.acento : "transparent", border: `3px solid ${hecha > 0 ? C.acento : C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + Math.sin(hecha * Math.PI) * 0.3})` }}>
                {hecha > 0 && <Check s={40} c={C.oscuro} trazo={7} p={hecha} />}
              </div>
            </div>
          </div>
        );
      })}
      {/* «hazme la app entera»: tachado */}
      {(() => {
        const v = vis(t, T.hazme - 0.1, T.revisa, 0.6);
        if (!v.on) return null;
        const tacha = ramp(t, T.entera - 0.05, T.entera + 0.3);
        return (
          <div style={{ position: "absolute", left: 540, top: 2470, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale}) rotate(${-2 + Math.sin(clamp01((t - T.entera) / 0.4) * Math.PI * 3) * 2 * tacha}deg)`, padding: "26px 44px", borderRadius: 40, background: C.texto, whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: C.oscuro }}>
              «Hazme la app entera»
              <div style={{ position: "absolute", left: 28, right: 28, top: "50%", height: 10, marginTop: -5, borderRadius: 5, background: C.acento, transformOrigin: "0 50%", transform: `scaleX(${tacha})` }} />
              <div style={{ position: "absolute", right: -40, top: -46, width: 92, height: 92, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, T.entera, { damping: 10, stiffness: 230 })})` }}>
                <Cruz s={60} c={C.oscuro} trazo={7} p={tacha} />
              </div>
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="NUNCA" x={540} y={2340} t={t} at={T.nunca} out={T.revisa} size={44} variante="acento" fuente="titulo" />

      {/* revisar antes de aceptar · guardar avances · flecha atrás */}
      {(() => {
        const v = vis(t, T.revisa - 0.2, hasta, 0.7);
        if (!v.on) return null;
        const sac = rotura > 0 ? Math.sin(t * 70) * 10 * rotura : 0;
        return (
          <div style={{ position: "absolute", left: DIFF.x - 420 + sac, top: DIFF.y - 250, width: 840, height: 400, borderRadius: 30, background: C.panel2, border: `3px solid ${rotura > 0.2 ? C.acento : C.borde}`, opacity: v.opacity, transform: `scale(${v.scale})`, overflow: "hidden" }}>
            {Array.from({ length: 6 }, (_, i) => {
              const tipo = i === 1 || i === 4 ? "+" : i === 2 ? "-" : " ";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, height: 46, padding: "0 30px", marginTop: i === 0 ? 30 : 4, background: tipo === "+" ? "rgba(217,119,87,0.16)" : tipo === "-" ? "rgba(140,147,163,0.12)" : "transparent" }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, width: 20, color: tipo === "+" ? C.acento : C.gris }}>{tipo}</span>
                  <div style={{ height: 13, width: 180 + ((i * 97) % 300), borderRadius: 7, background: tipo === "-" ? C.tenue : C.gris }} />
                </div>
              );
            })}
            {/* escáner de revisión */}
            {escaner > 0 && escaner < 1 && <div style={{ position: "absolute", left: 0, right: 0, top: 24 + escaner * 300, height: 6, background: C.acentoSuave, boxShadow: `0 0 26px ${C.acento}` }} />}
            {/* grieta al romperse */}
            {rotura > 0 && (
              <svg width={840} height={400} style={{ position: "absolute", left: 0, top: 0 }}>
                <path d="M 470 0 L 440 90 L 500 150 L 430 250 L 480 320 L 450 400" fill="none" stroke={C.acento} strokeWidth={8} strokeLinejoin="round" opacity={rotura} />
              </svg>
            )}
          </div>
        );
      })()}
      {(() => {
        const v = vis(t, T.revisa - 0.05, T.aceptar + 0.6, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: DIFF.x - 420 + 30 + 780 * Math.min(1, escaner), top: DIFF.y - 250 + 20 + escaner * 260, opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <Lupa s={86} c={C.acentoSuave} />
          </div>
        );
      })()}
      <Etiqueta texto="REVISA" x={DIFF.x - 280} y={DIFF.y - 320} t={t} at={T.revisa} out={hasta} size={38} variante="borde" />
      {/* botón aceptar */}
      {(() => {
        const v = vis(t, T.revisa + 0.3, hasta, 0.7);
        if (!v.on) return null;
        const hund = Math.sin(clamp01((t - T.aceptar - 0.05) / 0.2) * Math.PI) * 0.1;
        return (
          <div style={{ position: "absolute", left: DIFF.x + 140, top: DIFF.y + 98, width: 270, height: 84, borderRadius: 999, background: aceptado > 0 ? C.acento : C.panel, border: `3px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: v.opacity, transform: `scale(${v.scale * (1 - hund)})`, fontFamily: UI, fontWeight: 700, fontSize: 32, color: aceptado > 0 ? C.oscuro : C.texto }}>
            ACEPTAR
            {aceptado > 0 && <Check s={36} c={C.oscuro} trazo={7} p={aceptado} />}
          </div>
        );
      })()}
      {t > T.aceptar - 0.6 && t < T.aceptar + 0.5 && (
        <div style={{ position: "absolute", left: DIFF.x + 300 + (1 - ramp(t, T.aceptar - 0.6, T.aceptar - 0.1)) * 140, top: DIFF.y + 150 + (1 - ramp(t, T.aceptar - 0.6, T.aceptar - 0.1)) * 100, opacity: ramp(t, T.aceptar - 0.6, T.aceptar - 0.4) * (1 - ramp(t, T.aceptar + 0.2, T.aceptar + 0.5)) }}>
          <Cursor s={70} />
        </div>
      )}
      {/* línea de guardados */}
      {(() => {
        const v = vis(t, T.guarda - 0.15, hasta, 0.6);
        if (!v.on) return null;
        const xs = [180, 330, 480];
        return (
          <div style={{ position: "absolute", left: 0, top: DIFF.y + 330, width: 1080, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", left: 120, top: -3, width: 760 * ramp(t, T.guarda - 0.1, T.avances + 0.4), height: 6, borderRadius: 3, background: C.borde }} />
            <div style={{ position: "absolute", left: 40, top: -45, transform: `scale(${v.scale})` }}>
              <Guardar s={90} />
            </div>
            {guardados.map((g, i) => {
              const s = sp(t, g, { damping: 10, stiffness: 220 });
              const ultimo = i === 2;
              return <div key={i} style={{ position: "absolute", left: xs[i] - 18 + 60, top: -18, width: 36, height: 36, borderRadius: "50%", background: C.acento, transform: `scale(${s * (ultimo ? 1 + 0.3 * Math.sin(clamp01((t - T.rompe - 0.2) / 0.4) * Math.PI) : 1)})`, boxShadow: `0 0 16px ${C.acento}` }} />;
            })}
            {/* flecha atrás: vuelve al último guardado */}
            {deshace > 0 && (
              <div style={{ position: "absolute", left: 640, top: -120 }}>
                <Deshacer s={150} p={deshace} />
              </div>
            )}
          </div>
        );
      })()}
      <Etiqueta texto="GUARDA AVANCES" x={760} y={DIFF.y + 420} t={t} at={T.avances} out={hasta} size={36} variante="acento" />
    </Escena>
  );
};

export const eventosDesarrollo = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.carpeta, sfx: "pop", vol: 0.35 },
    { t: T.abres, sfx: "whoosh", vol: 0.3 },
    { t: T.contexto, sfx: "whoosh", vol: 0.25 },
    { t: T.pruebas + 0.05, sfx: "tick", vol: 0.4 },
    { t: T.entera, sfx: "golpe", vol: 0.35 },
    { t: T.aceptar + 0.05, sfx: "tick", vol: 0.4 },
    { t: T.guarda, sfx: "pop", vol: 0.3 },
    { t: T.rompe - 0.15, sfx: "golpe", vol: 0.3 },
    { t: T.rompe + 0.1, sfx: "whoosh", vol: 0.3 },
  ];
};
