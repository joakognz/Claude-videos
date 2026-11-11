/**
 * Etapa 2 · Staging (escenas copia → regla).
 *  - Copia de prueba publicada (navegador con etiqueta STAGING) con candado y contraseña.
 *  - La pruebas como el usuario: botones que se pulsan con tick y un ✓ grande («¿hace lo que debe?»).
 *  - Romperlo a propósito: datos raros y un campo vacío en un formulario; otra persona encuentra fallos que tú no ves.
 *  - Claude arregla lo encontrado (los fallos pasan a tick).
 *  - Sello «REGLA DE ORO»: los problemas, aquí, no con tu cliente.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Alerta, Bicho, Candado, Check, Cursor, Escudo, Globo, Lupa, Persona } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => ({
  es: L.ini("copia"),
  copia: L.en("copia", "copia"),
  publicada: L.en("copia", "publicada,"),
  contrasena: L.en("copia", "contraseña"),
  falta: L.en("copia", "hace falta"),
  aqui: L.ini("usuario"),
  usuario: L.en("usuario", "usuario."),
  van: L.en("usuario", "¿Van"),
  botones: L.en("usuario", "botones?"),
  hace: L.en("usuario", "¿Hace"),
  debe: L.en("usuario", "debe?"),
  intenta: L.ini("romper"),
  proposito: L.en("romper", "propósito:"),
  datos: L.en("romper", "datos"),
  raros: L.en("romper", "raros,"),
  campos: L.en("romper", "campos"),
  pruebe: L.en("romper", "pruebe"),
  persona: L.en("romper", "otra persona,"),
  ve: L.en("romper", "ve"),
  fallos: L.en("romper", "fallos"),
  noVes: L.en("romper", "no ves."),
  pidele: L.en("arreglar", "pídele"),
  claude: L.en("arreglar", "Claude"),
  arregle: L.en("arreglar", "arregle"),
  encuentres: L.en("arreglar", "encuentres."),
  regla: L.en("regla", "regla"),
  oro: L.en("regla", "oro:"),
  problemas: L.en("regla", "problemas"),
  aquiR: L.en("regla", "aquí,"),
  cliente: L.en("regla", "cliente."),
});

const WEB = { x: 540, y: 1180, w: 880, h: 620 };
const FORM = { x: 540, y: 2050 };
const REGLA = { x: 540, y: 2960 };
/** Caracteres «raros» que se escriben en los campos (símbolos, no datos inventados). */
const RAROS = ["#%&?!@@", "¿¿¡¡;;**"];

export const EtapaStaging: React.FC<BloqueProps> = ({ t, ep, L, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: T.es - 1.2, x: 540, y: 1120, z: 0.98 },
    { t: T.contrasena - 0.3, x: 540, y: 1200, z: 1.08, d: 0.7 },
    { t: T.aqui - 0.2, x: 500, y: 1180, z: 1.0, d: 0.8 },
    { t: T.van - 0.2, x: 560, y: 1260, z: 1.12, d: 0.6 },
    { t: T.intenta - 0.35, x: 540, y: 2010, z: 1.0, d: 0.85 },
    { t: T.pruebe - 0.25, x: 560, y: 2080, z: 0.96, d: 0.7 },
    { t: T.pidele - 0.3, x: 540, y: 2060, z: 1.02, d: 0.7 },
    { t: T.regla - 0.4, x: 540, y: 2960, z: 1.0, d: 0.85 },
  ];
  const candado = sp(t, T.contrasena - 0.15, { damping: 11, stiffness: 190 });
  const cierra = ramp(t, T.contrasena + 0.25, T.contrasena + 0.55);
  const puntos = Math.floor(clamp01((t - T.contrasena) / 0.9) * 8);
  const btn = [T.botones - 0.25, T.botones + 0.05, T.botones + 0.3];
  // cursor del usuario: pasa por los tres botones
  const bx = [WEB.x - 260, WEB.x, WEB.x + 260];
  let cx = WEB.x + 380;
  let cy = WEB.y + 300;
  btn.forEach((b, i) => {
    const u = clamp01((t - (b - 0.25)) / 0.22);
    cx += (bx[i] + 40 - cx) * u;
    cy += (WEB.y + 170 - cy) * u;
  });
  const okGrande = sp(t, T.debe - 0.05, { damping: 10, stiffness: 200 });
  // fallos encontrados por la otra persona y arreglados por Claude
  const fallos = [
    { x: FORM.x + 300, y: FORM.y - 90, at: T.fallos - 0.05, fix: T.arregle - 0.05 },
    { x: FORM.x + 300, y: FORM.y + 150, at: T.noVes, fix: T.arregle + 0.25 },
  ];
  const lupaU = ramp(t, T.ve - 0.2, T.noVes + 0.3);
  return (
    <Escena t={t} tomas={tomas}>
      {/* navegador: la copia de prueba */}
      {(() => {
        const v = vis(t, T.es - 0.6, T.intenta + 0.3, 0.7);
        if (!v.on) return null;
        const url = ramp(t, T.publicada - 0.1, T.publicada + 0.5);
        return (
          <div style={{ position: "absolute", left: WEB.x - WEB.w / 2, top: WEB.y - WEB.h / 2, width: WEB.w, height: WEB.h, borderRadius: 28, background: C.panel, border: `3px solid ${C.acento}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", overflow: "hidden", opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <div style={{ height: 84, background: C.panel2, display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
              <Globo s={42} c={url > 0.2 ? C.acento : C.gris} />
              <div style={{ flex: 1, height: 44, borderRadius: 22, background: C.fondo, display: "flex", alignItems: "center", padding: "0 18px", gap: 8 }}>
                {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ width: 16, height: 10, borderRadius: 5, background: C.tenue, opacity: clamp01(url * 12 - i) }} />)}
              </div>
              <div style={{ padding: "8px 18px", borderRadius: 12, background: C.acento, color: C.oscuro, fontFamily: MONO, fontWeight: 700, fontSize: 28, transform: `scale(${sp(t, T.es - 0.3, { damping: 12, stiffness: 200 })})` }}>STAGING</div>
            </div>
            {/* página de ejemplo (abstracta) */}
            <div style={{ padding: "40px 54px" }}>
              <div style={{ height: 30, width: "55%", borderRadius: 15, background: C.gris, opacity: 0.8 }} />
              <div style={{ height: 16, width: "85%", borderRadius: 8, background: C.tenue, marginTop: 26 }} />
              <div style={{ height: 16, width: "70%", borderRadius: 8, background: C.tenue, marginTop: 16 }} />
            </div>
          </div>
        );
      })()}
      {/* botones de la página */}
      {bx.map((x, i) => {
        const v = vis(t, T.aqui + 0.1 + i * 0.1, T.intenta + 0.3, 0.6);
        if (!v.on) return null;
        const ok = clamp01((t - btn[i]) / 0.25);
        const hund = Math.sin(clamp01((t - btn[i] + 0.05) / 0.15) * Math.PI) * 0.12;
        return (
          <div key={i} style={{ position: "absolute", left: x - 110, top: WEB.y + 130, width: 220, height: 84, borderRadius: 999, background: ok > 0 ? C.acento : C.panel2, border: `3px solid ${ok > 0 ? C.acento : C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale * (1 - hund)})` }}>
            {ok > 0 ? <Check s={50} c={C.oscuro} trazo={7} p={ok} /> : <div style={{ width: 90, height: 14, borderRadius: 7, background: C.gris }} />}
          </div>
        );
      })}
      {t > T.van - 0.6 && t < T.intenta + 0.2 && (
        <div style={{ position: "absolute", left: cx, top: cy, opacity: ramp(t, T.van - 0.6, T.van - 0.3) * (1 - ramp(t, T.debe, T.debe + 0.3)) }}>
          <Cursor s={74} />
        </div>
      )}
      {/* el usuario */}
      {(() => {
        const v = vis(t, T.usuario - 0.25, T.intenta + 0.3, 0.5);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: WEB.x - WEB.w / 2 - 20, top: WEB.y + 250, opacity: v.opacity, transform: `scale(${v.scale})`, display: "flex", alignItems: "center", gap: 14, padding: "12px 28px 12px 14px", borderRadius: 999, background: C.panel2, border: `3px solid ${C.borde}` }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.panel, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Persona s={50} />
            </div>
            <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.texto, letterSpacing: 1 }}>EL USUARIO</span>
          </div>
        );
      })()}
      {/* ✓ grande: hace lo que debe */}
      {okGrande > 0.001 && t < T.intenta + 0.3 && (
        <div style={{ position: "absolute", left: WEB.x + WEB.w / 2 - 130, top: WEB.y - WEB.h / 2 + 40, width: 170, height: 170, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${okGrande}) rotate(${(1 - okGrande) * -30}deg)`, boxShadow: `0 0 50px ${C.acento}AA`, opacity: 1 - ramp(t, T.intenta, T.intenta + 0.3) }}>
          <Check s={120} c={C.oscuro} trazo={6} p={ramp(t, T.debe, T.debe + 0.3)} />
        </div>
      )}
      {/* candado y contraseña */}
      {candado > 0.001 && t < T.aqui + 0.2 && (
        <div style={{ position: "absolute", left: WEB.x - 190, top: WEB.y - 120, width: 380, height: 300, borderRadius: 30, background: "rgba(11,13,18,0.92)", border: `3px solid ${C.acento}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, transform: `translateY(${(1 - candado) * -160}px) scale(${0.8 + 0.2 * candado})`, opacity: Math.min(1, candado * 1.5) * (1 - ramp(t, T.aqui - 0.2, T.aqui + 0.15)) }}>
          <Candado s={120} abierto={1 - cierra} c={C.acento} />
          <div style={{ width: 300, height: 64, borderRadius: 16, background: C.panel2, border: `2px solid ${C.borde}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, boxSizing: "border-box" }}>
            {Array.from({ length: puntos }, (_, i) => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: C.texto }} />)}
          </div>
        </div>
      )}
      <Etiqueta texto="COPIA DE PRUEBA" x={WEB.x} y={WEB.y - WEB.h / 2 - 70} t={t} at={T.copia} out={T.aqui + 0.2} size={42} variante="borde" />
      <Etiqueta texto="SI HACE FALTA" x={WEB.x} y={WEB.y + WEB.h / 2 + 60} t={t} at={T.falta} out={T.aqui + 0.2} size={32} variante="gris" />

      {/* formulario: datos raros y campos vacíos */}
      {(() => {
        const v = vis(t, T.intenta - 0.2, T.regla, 0.7);
        if (!v.on) return null;
        const sac = t > T.raros && t < T.raros + 0.5 ? Math.sin(t * 70) * 8 * (1 - (t - T.raros) / 0.5) : 0;
        return (
          <div style={{ position: "absolute", left: FORM.x - 400 + sac, top: FORM.y - 300, width: 800, height: 600, borderRadius: 30, background: C.panel, border: `3px solid ${C.borde}`, opacity: v.opacity, transform: `scale(${v.scale})` }}>
            {[0, 1, 2].map((i) => {
              const raro = i < 2 ? RAROS[i] : "";
              const at = i === 0 ? T.datos : T.raros - 0.1;
              const n = Math.floor(clamp01((t - at) / 0.5) * raro.length);
              const vacio = i === 2 ? ramp(t, T.campos, T.campos + 0.3) : 0;
              const malo = i < 2 ? ramp(t, at + 0.5, at + 0.7) : vacio;
              return (
                <div key={i} style={{ position: "absolute", left: 50, top: 60 + i * 170 }}>
                  <div style={{ width: 180, height: 14, borderRadius: 7, background: C.gris, marginBottom: 16 }} />
                  <div style={{ width: 560, height: 82, borderRadius: 18, boxSizing: "border-box", background: C.panel2, border: `3px ${i === 2 && vacio > 0 ? "dashed" : "solid"} ${malo > 0.3 ? C.acento : C.borde}`, display: "flex", alignItems: "center", padding: "0 22px", fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.texto, letterSpacing: 3 }}>
                    {raro.slice(0, n)}
                    {i === 2 && vacio > 0 && <span style={{ color: C.tenue, fontSize: 30, letterSpacing: 1 }}>{"           "}</span>}
                  </div>
                  {malo > 0 && i < 3 && (
                    <div style={{ position: "absolute", left: 580, top: 34, transform: `scale(${sp(t, (i < 2 ? at + 0.5 : T.campos), { damping: 10, stiffness: 230 })})` }}>
                      <Alerta s={66} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}
      <Etiqueta texto="ROMPERLO A PROPÓSITO" x={FORM.x} y={FORM.y - 380} t={t} at={T.intenta + 0.2} out={T.pruebe} size={40} variante="acento" />
      <Etiqueta texto="DATOS RAROS" x={FORM.x - 200} y={FORM.y + 360} t={t} at={T.raros} out={T.pruebe} size={34} variante="borde" />
      <Etiqueta texto="CAMPOS VACÍOS" x={FORM.x + 200} y={FORM.y + 360} t={t} at={T.campos} out={T.pruebe} size={34} variante="borde" />
      {/* otra persona y sus fallos */}
      {(() => {
        const v = vis(t, T.persona - 0.15, T.regla - 0.2, 0.5);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: FORM.x - 360, top: FORM.y - 420, opacity: v.opacity, transform: `translateX(${(1 - v.s) * -120}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 14, padding: "12px 28px 12px 14px", borderRadius: 999, background: C.acento }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.oscuro, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Persona s={50} c={C.acentoSuave} />
            </div>
            <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.oscuro, letterSpacing: 1 }}>OTRA PERSONA</span>
          </div>
        );
      })()}
      {lupaU > 0 && lupaU < 1 && (
        <div style={{ position: "absolute", left: FORM.x + 120 + Math.sin(lupaU * Math.PI * 2) * 60, top: FORM.y - 200 + lupaU * 300, opacity: Math.sin(lupaU * Math.PI) * 1.4 }}>
          <Lupa s={130} c={C.acentoSuave} />
        </div>
      )}
      {fallos.map((f, i) => {
        if (t < f.at || t > T.regla) return null;
        const s = sp(t, f.at, { damping: 9, stiffness: 220 });
        const arreglado = clamp01((t - f.fix) / 0.3);
        return (
          <div key={i} style={{ position: "absolute", left: f.x - 50, top: f.y - 50, width: 100, height: 100, borderRadius: "50%", background: arreglado > 0.5 ? C.acento : C.panel, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s * (1 + Math.sin(arreglado * Math.PI) * 0.25)})`, boxShadow: `0 0 30px ${C.acento}88` }}>
            {arreglado > 0.5 ? <Check s={70} c={C.oscuro} trazo={7} p={(arreglado - 0.5) * 2} /> : <Bicho s={66} />}
          </div>
        );
      })}
      {/* Claude arregla lo encontrado */}
      <Logo src={ep.logos.claude} x={FORM.x - 290} y={FORM.y + 470} w={120} t={t} at={T.claude - 0.1} out={T.regla - 0.1} rot={(t - T.claude) * 25} />
      {[0, 1].map((i) => {
        const a = fallos[i].fix - 0.35;
        const u = ramp(t, a, a + 0.35);
        if (u <= 0 || u >= 1) return null;
        const x0 = FORM.x - 290;
        const y0 = FORM.y + 470;
        return <div key={i} style={{ position: "absolute", left: x0 + (fallos[i].x - x0) * u - 14, top: y0 + (fallos[i].y - y0) * u - 14, width: 28, height: 28, borderRadius: "50%", background: C.acentoSuave, boxShadow: `0 0 26px ${C.acento}` }} />;
      })}

      {/* regla de oro */}
      <Sello texto="REGLA DE ORO" x={REGLA.x} y={REGLA.y - 330} t={t} at={T.oro - 0.05} out={hasta} size={88} rot={-3} />
      {(() => {
        const v = vis(t, T.problemas - 0.1, hasta, 0.7);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: REGLA.x, top: REGLA.y - 170, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 50, color: C.texto, textAlign: "center", lineHeight: 1.2 }}>
              Los problemas, <span style={{ color: C.acento }}>aquí</span>,<br />no con tu cliente.
            </div>
          </div>
        );
      })()}
      {/* aquí (staging) frente a tu cliente */}
      {(() => {
        const a = vis(t, T.aquiR - 0.15, hasta, 0.5);
        const b = vis(t, T.cliente - 0.2, hasta, 0.5);
        return (
          <>
            {a.on && (
              <div style={{ position: "absolute", left: REGLA.x - 400, top: REGLA.y + 10, width: 340, height: 300, borderRadius: 34, background: C.panel2, border: `4px solid ${C.acento}`, opacity: a.opacity, transform: `scale(${a.scale})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <div style={{ position: "relative", width: 110, height: 110 }}>
                  <Bicho s={110} />
                  <div style={{ position: "absolute", inset: -14, borderRadius: "50%", border: `6px solid ${C.texto}` }} />
                </div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.acento }}>STAGING</div>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 28, color: C.texto, letterSpacing: 1 }}>AQUÍ</div>
              </div>
            )}
            {b.on && (
              <div style={{ position: "absolute", left: REGLA.x + 60, top: REGLA.y + 10, width: 340, height: 300, borderRadius: 34, background: C.panel2, border: `4px solid ${C.borde}`, opacity: b.opacity, transform: `scale(${b.scale})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <div style={{ position: "relative", width: 110, height: 110 }}>
                  <Persona s={110} />
                  <div style={{ position: "absolute", right: -30, bottom: -14 }}>
                    <Escudo s={72} p={ramp(t, T.cliente + 0.1, T.cliente + 0.4)} />
                  </div>
                </div>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.texto, letterSpacing: 1, marginTop: 10 }}>TU CLIENTE</div>
              </div>
            )}
          </>
        );
      })()}
    </Escena>
  );
};

export const eventosStaging = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.copia, sfx: "pop", vol: 0.35 },
    { t: T.contrasena - 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.contrasena + 0.3, sfx: "tick", vol: 0.35 },
    { t: T.contrasena + 0.05, sfx: "tecleo", vol: 0.25, dur: 0.85 },
    { t: T.botones - 0.25, sfx: "pop", vol: 0.3 },
    { t: T.botones + 0.05, sfx: "pop", vol: 0.3 },
    { t: T.botones + 0.3, sfx: "pop", vol: 0.3 },
    { t: T.debe, sfx: "tick", vol: 0.45 },
    { t: T.datos, sfx: "tecleo", vol: 0.25, dur: 1.0 },
    { t: T.campos, sfx: "pop", vol: 0.3 },
    { t: T.fallos, sfx: "pop", vol: 0.35 },
    { t: T.noVes, sfx: "pop", vol: 0.35 },
    { t: T.arregle, sfx: "tick", vol: 0.4 },
    { t: T.arregle + 0.3, sfx: "tick", vol: 0.4 },
    { t: T.oro + 0.07, sfx: "golpe", vol: 0.6 },
  ];
};
