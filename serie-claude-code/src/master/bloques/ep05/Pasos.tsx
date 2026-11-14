/**
 * EP.5 · bloque «Pasos» (escenas paso1 → paso2 → paso3), recreado de la grabación:
 * PASO 1: carpeta + diálogo «Nueva carpeta» de macOS (se escribe landing-cliente-clínica-estética y se pulsa Crear)
 * PASO 2: logo y nombre de Visual Studio Code → ventana con el proyecto → se abre el panel de Claude Code
 * PASO 3: se escribe /init (menú de comandos) → Claude explora el proyecto → crea CLAUDE.md → tú lo revisas y ajustas.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Anillo, Logo } from "../../componentes/Logo";
import { Sello } from "../../componentes/Sello";
import { C, MONO, TITULO, UI, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Chip, Comando, IconoCarpeta, IconoMd, Picto, Pop, escrito } from "../../ep05/kit";
import { Asterisco, DialogoCarpeta, Entrada, Explorador, Herramienta, Linea, MenuComandos, MsgUsuario, Pestana, Trabajando, VS, Ventana } from "../../ep05/ui";

const CARPETA = "landing-cliente-clínica-estética";
const CARPETA_MAY = "LANDING-CLIENTE-CLÍNICA-ESTÉTICA";
const V2 = { x: 540, y: 2640, w: 980, h: 760 };
const V3 = { x: 540, y: 3920, w: 980, h: 940 };

const tiempos = (L: LineaT) => {
  const p1 = L.ini("paso1");
  const p2 = L.ini("paso2");
  const p3 = L.ini("paso3");
  const est = L.finDe("paso1", "estética");
  const crear = Math.min(est + 0.2, p2 - 0.3);
  const init3 = L.en("paso3", "/init");
  return {
    p1, p2, p3,
    carpeta: L.en("paso1", "carpeta"),
    ejemplo: L.en("paso1", "ejemplo"),
    landing: L.en("paso1", "landing"),
    crear,
    abrela: L.en("paso2", "Ábrela"),
    visual: L.en("paso2", "Visual"),
    abre: L.en("paso2", "abre"),
    panel: L.en("paso2", "panel"),
    claude2: L.en("paso2", "Claude"),
    escribe: L.en("paso3", "Escribe"),
    init3,
    enter: init3 + 0.42,
    claude3: L.en("paso3", "Claude"),
    analiza: L.en("paso3", "analiza"),
    genera: L.en("paso3", "genera"),
    claudemd: L.en("paso3", "CLAUDE.md"),
    tu: L.en("paso3", "Tú"),
    revisas: L.en("paso3", "revisas"),
    ajustas: L.en("paso3", "ajustas"),
    fin3: L.fin("paso3"),
  };
};

export const Pasos: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 880, z: 1.1 },
    { t: T.carpeta - 0.2, x: 540, y: 1010, z: 1.04, d: 0.8 },
    { t: T.ejemplo - 0.2, x: 540, y: 1230, z: 1.08, d: 0.8 },
    { t: T.landing, x: 540, y: 1280, z: 1.18, d: 0.9 },
    { t: T.crear - 0.1, x: 540, y: 1100, z: 1.06, d: 0.7 },
    { t: T.p2 - 0.3, x: 540, y: 2240, z: 1.04, d: 0.9 },
    { t: T.abrela - 0.1, x: 540, y: 2560, z: 0.94, d: 0.8 },
    { t: T.panel - 0.15, x: 700, y: 2650, z: 1.12, d: 0.8 },
    { t: T.p3 - 0.3, x: 540, y: 3560, z: 1.02, d: 0.9 },
    { t: T.escribe - 0.05, x: 580, y: 4170, z: 1.12, d: 0.8 },
    { t: T.claude3 - 0.25, x: 600, y: 3860, z: 1.0, d: 0.8 },
    { t: T.genera - 0.1, x: 600, y: 3780, z: 1.05, d: 0.8 },
    { t: T.tu - 0.2, x: 540, y: 4060, z: 1.04, d: 0.8 },
  ];
  const nombre = escrito(CARPETA, t, T.landing, T.crear - 0.15);
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── PASO 1 ── */}
      <Sello texto="PASO 1" x={540} y={690} t={t} at={T.p1} out={T.ejemplo} size={64} />
      <Hecho x={540 + 380} y={1072} t={t} at={T.crear + 0.1} out={T.p2 + 0.3} />
      <Pop x={540} y={930} t={t} at={T.carpeta - 0.05} rot={-12}>
        <IconoCarpeta size={230} abierta={0} />
      </Pop>
      <Pop x={540} y={1072} t={t} at={T.crear + 0.05}>
        <Comando texto={CARPETA} size={34} color={C.texto} />
      </Pop>
      {(() => {
        const v = vis(t, T.ejemplo - 0.05, T.crear + 0.35, 0.85);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 1310, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity }}>
              <DialogoCarpeta w={900} nombre={nombre} t={t} pulsa={ramp(t, T.crear - 0.1, T.crear + 0.15)} />
            </div>
          </div>
        );
      })()}

      {/* ── PASO 2 ── */}
      <Sello texto="PASO 2" x={540} y={1965} t={t} at={T.p2} out={T.panel - 0.1} size={64} />
      <Hecho x={1000} y={2300} t={t} at={T.p3 - 0.45} out={T.p3 + 0.6} />
      <Logo src={ep.logos.vscode} x={175} y={2140} w={120} t={t} at={T.visual - 0.05} pulsos={[T.visual + 0.6]} />
      <Pop x={262} y={2140} t={t} at={T.visual} ancla="izq">
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 64, color: C.texto }}>Visual Studio Code</div>
      </Pop>
      {(() => {
        const v = vis(t, T.abrela - 0.05, hasta + 0.4, 0.88);
        if (!v.on) return null;
        const panel = sp(t, T.abre, { damping: 16, stiffness: 150 });
        return (
          <div style={{ position: "absolute", left: V2.x - V2.w / 2, top: V2.y - V2.h / 2, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <Ventana w={V2.w} h={V2.h} buscador={CARPETA}>
              <div style={{ display: "flex", height: "100%" }}>
                <Explorador w={300} carpeta={CARPETA_MAY} t={t} editores={t > T.abre + 0.2 ? ["Claude Code"] : []} />
                <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                  {/* página de bienvenida */}
                  <div style={{ position: "absolute", left: 50, top: 70, opacity: 1 - panel, fontFamily: UI, fontWeight: 600 }}>
                    <div style={{ fontSize: 46, color: VS.texto }}>Visual Studio Code</div>
                    <div style={{ fontSize: 26, color: VS.tenue, marginBottom: 36 }}>Editing evolved</div>
                    <div style={{ fontSize: 26, color: VS.texto, marginBottom: 14 }}>Start</div>
                    {["New File…", "Open…", "Clone Git Repository…", "Connect to…"].map((s) => (
                      <div key={s} style={{ fontSize: 24, color: VS.enlace, marginBottom: 12 }}>{s}</div>
                    ))}
                  </div>
                  {/* panel de Claude Code */}
                  <div style={{ position: "absolute", inset: 0, background: VS.fondo, transform: `translateX(${(1 - panel) * 105}%)`, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", background: VS.barra, borderBottom: `2px solid ${VS.borde}` }}>
                      <Pestana texto="Claude Code" icono={<Asterisco size={24} />} />
                    </div>
                    <div style={{ padding: "16px 24px", fontFamily: UI, fontWeight: 600, fontSize: 24, color: VS.texto, borderBottom: `2px solid ${VS.borde}` }}>Untitled</div>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 30, fontFamily: "Georgia, serif", fontSize: 40, color: VS.blanco }}>
                      <Asterisco size={36} />
                      Claude Code
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
                      <Img src={staticFile(ep.logos.claude_code)} style={{ width: 120 }} />
                      <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 24, color: VS.texto, textAlign: "center", whiteSpace: "normal", width: 460, lineHeight: 1.4 }}>
                        Highlight any text and press <span style={{ border: `2px solid ${VS.tenue}`, borderRadius: 5, padding: "0 6px" }}>Option</span>{" "}
                        <span style={{ border: `2px solid ${VS.tenue}`, borderRadius: 5, padding: "0 6px" }}>K</span> to chat about it
                      </div>
                    </div>
                    <div style={{ padding: "0 22px 22px" }}>
                      <Entrada w={636} texto="" t={t} size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </Ventana>
          </div>
        );
      })()}
      <Anillo x={V2.x - V2.w / 2 + 300 + 340} y={2660} r={110} t={t} at={T.claude2 - 0.05} out={T.p3} />

      {/* ── PASO 3 ── */}
      <Sello texto="PASO 3" x={540} y={3330} t={t} at={T.p3} out={T.escribe} size={64} />
      <Sello texto="PASO 3" x={540} y={3330} t={t} at={T.claudemd - 0.2} out={T.tu} size={52} />
      {(() => {
        const v = vis(t, T.p3 + 0.2, hasta + 0.4, 0.88);
        if (!v.on) return null;
        const enviado = t >= T.enter;
        const texto = enviado ? "" : escrito("/init", t, T.init3 - 0.42, T.init3 + 0.12);
        const menu = !enviado && texto.length > 0;
        const atenua = ramp(t, T.tu - 0.1, T.tu + 0.3);
        return (
          <div style={{ position: "absolute", left: V3.x - V3.w / 2, top: V3.y - V3.h / 2, opacity: v.opacity * (1 - 0.45 * atenua), transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <Ventana w={V3.w} h={V3.h} buscador={CARPETA}>
              <div style={{ display: "flex", height: "100%" }}>
                <Explorador w={270} carpeta={CARPETA_MAY} t={t} editores={[enviado ? "/init" : "Claude Code"]} archivos={[{ nombre: "CLAUDE.md", aparece: T.claudemd, activo: true }]} />
                <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <div style={{ display: "flex", background: VS.barra, borderBottom: `2px solid ${VS.borde}` }}>
                    <Pestana texto={enviado ? "/init" : "Claude Code"} icono={<Asterisco size={24} />} />
                  </div>
                  <div style={{ padding: "14px 24px", fontFamily: UI, fontWeight: 600, fontSize: 24, color: VS.texto, borderBottom: `2px solid ${VS.borde}` }}>{enviado ? "/init" : "Untitled"}</div>
                  <div style={{ flex: 1, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18, overflow: "hidden" }}>
                    {enviado && <Aparece t={t} at={T.enter}><MsgUsuario mono>/init</MsgUsuario></Aparece>}
                    <Aparece t={t} at={T.claude3}>
                      <Linea>I'll explore the codebase to understand its structure, tooling, and architecture before writing the CLAUDE.md.</Linea>
                    </Aparece>
                    <Aparece t={t} at={T.analiza}>
                      <Herramienta nombre="Bash" desc="List root directory and all files" entrada={`cd "~/Desktop/${CARPETA}" && ls -la`} />
                    </Aparece>
                    {t >= T.analiza + 0.4 && t < T.claudemd && (
                      <div style={{ paddingLeft: 26 }}>
                        <Trabajando t={t} />
                      </div>
                    )}
                    <Aparece t={t} at={T.claudemd}>
                      <Linea>
                        He creado <span style={{ color: VS.enlace }}>CLAUDE.md</span>.
                      </Linea>
                    </Aparece>
                  </div>
                  {menu && (
                    <div style={{ position: "absolute", left: 22, bottom: 150 }}>
                      <MenuComandos w={666} items={[{ cmd: "/init", desc: "Initialize a new CLAUDE.md file with codebase documentation" }]} activo={0} />
                    </div>
                  )}
                  <div style={{ padding: "0 22px 22px" }}>
                    <Entrada w={666} texto={texto} t={t} size={25} foco={!enviado || t < T.enter + 0.2} />
                  </div>
                </div>
              </div>
            </Ventana>
          </div>
        );
      })()}
      <Pop x={880} y={3560} t={t} at={T.claudemd - 0.02} out={T.tu} rot={-16} latidos={[T.claudemd + 0.35]}>
        <div style={{ filter: `drop-shadow(0 0 30px ${C.acento}88)` }}>
          <IconoMd size={150} />
        </div>
      </Pop>
      {/* tú lo revisas y lo ajustas */}
      {(() => {
        const v = vis(t, T.tu - 0.05, hasta + 0.4, 0.85);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 4060, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, opacity: v.opacity, width: 880, boxSizing: "border-box", padding: "34px 40px", borderRadius: 36, background: C.panel, border: `3px solid ${C.acento}`, boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 50px ${C.acento}33`, display: "flex", alignItems: "center", gap: 34 }}>
              <IconoMd size={120} />
              <div style={{ position: "absolute", right: -26, top: -26 }}>
                {t > T.fin3 - 0.3 && <Hecho x={0} y={0} t={t} at={T.fin3 - 0.3} />}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.texto }}>CLAUDE.md</div>
                <div style={{ display: "flex", gap: 18 }}>
                  <Aparece t={t} at={T.revisas}>
                    <Chip icono={<Picto nombre="lupa" size={40} />} texto="Lo revisas" size={36} />
                  </Aparece>
                  <Aparece t={t} at={T.ajustas}>
                    <Chip icono={<Picto nombre="lapiz" size={40} color={C.oscuro} />} texto="Lo ajustas" size={36} variante="acento" />
                  </Aparece>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </Escena>
  );
};

/** Insignia de paso completado: círculo de acento con ✓ que se dibuja. */
const Hecho: React.FC<{ x: number; y: number; t: number; at: number; out?: number }> = ({ x, y, t, at, out }) => (
  <Pop x={x} y={y} t={t} at={at} out={out} rot={-20}>
    <div style={{ width: 84, height: 84, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${C.acento}88` }}>
      <Picto nombre="check" size={54} color={C.oscuro} grosor={3.4} dibujo={ramp(t, at + 0.1, at + 0.4)} />
    </div>
  </Pop>
);

/** Elemento de una lista que entra con spring (sin posición absoluta: para columnas flex). */
export const Aparece: React.FC<{ t: number; at: number; children: React.ReactNode; desde?: number }> = ({ t, at, children, desde = 16 }) => {
  if (t < at) return null;
  const s = sp(t, at, { damping: 16, stiffness: 200 });
  return <div style={{ opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * desde}px)` }}>{children}</div>;
};

export const eventosPasos = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.p1 + 0.08, sfx: "golpe", vol: 0.5 },
    { t: T.carpeta, sfx: "pop", vol: 0.35 },
    { t: T.ejemplo, sfx: "pop", vol: 0.3 },
    { t: T.landing, sfx: "tecleo", vol: 0.28, dur: T.crear - 0.15 - T.landing },
    { t: T.crear, sfx: "tick", vol: 0.5 },
    { t: T.p2 + 0.08, sfx: "golpe", vol: 0.5 },
    { t: T.visual, sfx: "pop", vol: 0.35 },
    { t: T.abre, sfx: "whoosh", vol: 0.28 },
    { t: T.p3 - 0.35, sfx: "tick", vol: 0.45 },
    { t: T.p3 + 0.08, sfx: "golpe", vol: 0.5 },
    { t: T.init3 - 0.42, sfx: "tecleo", vol: 0.3, dur: 0.5 },
    { t: T.enter, sfx: "envio", vol: 0.4 },
    { t: T.claudemd, sfx: "pop", vol: 0.45 },
    { t: T.revisas, sfx: "pop", vol: 0.35 },
    { t: T.ajustas, sfx: "pop", vol: 0.35 },
    { t: T.fin3 - 0.25, sfx: "tick", vol: 0.5 },
  ];
};
