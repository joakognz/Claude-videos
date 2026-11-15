/**
 * EP.6 · bloque «Truco» (escenas truco → escribele → ep5 → agente):
 * EL TRUCO · QUE CASI NADIE USA → tú con interrogantes, Claude, bocadillos: QUE TE ENTREVISTE → en el panel de Claude
 * Code se escribe «Antes de empezar, hazme todas las preguntas que necesites» al ritmo de la voz y se envía →
 * preguntas que se convierten en detalle: SACA EL DETALLE → EP.5: la pregunta real de aquella grabación (stack de la
 * landing) y el CLAUDE.md ✓ → MÁS ALLÁ: tú ↔ tu agente de IA (ANTES) → Claude Code.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { C, TITULO, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Destellos, IconoMd, Interrogantes, Pop } from "../../ep05/kit";
import { Asterisco, Dialogo, MsgUsuario, Pestana, VS, Ventana } from "../../ep05/ui";
import { Aparece } from "../ep05/Pasos";
import { Ico, Medalla6, TextoVoz, sinComillas, tramo } from "../../ep06/kit6";

const P = { y: 2120, w: 980, h: 600 };
const D = 3260;
const A = 4180;

const tiempos = (L: LineaT) => {
  const peticion = tramo(L, "escribele", "«Antes", "necesites».");
  return {
    peticion,
    truco: L.en("truco", "truco"),
    casi: L.en("truco", "casi"),
    si: L.en("truco", "Si"),
    explicar: L.en("truco", "explicar"),
    diselo: L.en("truco", "díselo"),
    claude: L.en("truco", "Claude"),
    pidele: L.en("truco", "pídele"),
    entreviste: L.en("truco", "entreviste."),
    escribele: L.ini("escribele"),
    todas: L.en("escribele", "todas"),
    envia: peticion[peticion.length - 1].fin + 0.08,
    asi: L.en("escribele", "Así"),
    saca: L.en("escribele", "saca"),
    detalle: L.en("escribele", "detalle"),
    palabras: L.en("escribele", "palabras."),
    es: L.ini("ep5"),
    episodio: L.en("ep5", "episodio"),
    crear: L.en("ep5", "crear"),
    md: L.en("ep5", "CLAUDE.md."),
    y: L.ini("agente"),
    mas: L.en("agente", "más"),
    hablalo: L.en("agente", "háblalo"),
    antes: L.en("agente", "antes"),
    agente: L.en("agente", "agente"),
    inteligencia: L.en("agente", "inteligencia"),
    artificial: L.en("agente", "artificial."),
  };
};

/** La pregunta real del EP.5 (recreada de aquella grabación). */
const OPCIONES_EP5 = [
  { titulo: "Astro", desc: "Estático, muy rápido. Ideal para landings." },
  { titulo: "Next.js", desc: "React con SSR. Más pesado." },
  { titulo: "Vite + HTML/CSS/JS", desc: "Sin framework, control total, build mínimo." },
  { titulo: "HTML/CSS puro sin build", desc: "Archivos sueltos subibles por FTP." },
];

export const Truco: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 900, z: 1.04 },
    { t: T.si - 0.25, x: 540, y: 1060, z: 1.04, d: 0.8 },
    { t: T.entreviste - 0.15, x: 540, y: 1150, z: 1.06, d: 0.7 },
    { t: T.escribele - 0.35, x: 540, y: P.y + 40, z: 1.02, d: 0.9 },
    { t: T.saca - 0.2, x: 540, y: P.y + 260, z: 0.98, d: 0.8 },
    { t: T.es - 0.35, x: 540, y: D + 20, z: 1.0, d: 0.9 },
    { t: T.y - 0.3, x: 540, y: A, z: 1.04, d: 0.9 },
    { t: T.agente - 0.2, x: 600, y: A + 40, z: 1.02, d: 0.8 },
  ];
  const fueraA = T.escribele;
  const fueraB = T.es + 0.3;
  const fueraC = T.y + 0.3;
  const enviado = t >= T.envia;
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── el truco que casi nadie usa ── */}
      <Sello texto="EL TRUCO" x={540} y={650} t={t} at={T.truco} out={fueraA} size={70} rot={-3} />
      <Destellos x={540} y={650} t={t} at={T.truco + 0.1} out={T.si + 0.4} r={230} />
      <Etiqueta texto="QUE CASI NADIE USA" x={540} y={790} t={t} at={T.casi - 0.05} out={fueraA} size={40} variante="borde" fuente="titulo" />
      <Pop x={280} y={1090} t={t} at={T.si - 0.05} out={fueraA} rot={-8}>
        <Medalla6 nombre="usuario" size={180} />
      </Pop>
      <Interrogantes x={280} y={1090} t={t} at={T.explicar - 0.05} out={T.pidele + 0.2} r={150} n={3} size={64} />
      <Etiqueta texto="TÚ" x={280} y={1220} t={t} at={T.si} out={fueraA} size={30} variante="gris" fuente="titulo" />
      <Logo src={ep.logos.claude} x={800} y={1090} w={170} t={t} at={T.claude - 0.08} out={fueraA} pulsos={[T.entreviste]} />
      {[0, 1, 2, 3].map((k) => {
        const at = T.pidele + k * 0.28;
        const v = vis(t, at, fueraA, 0.4);
        if (!v.on) return null;
        const deClaude = k % 2 === 0;
        return (
          <div key={k} style={{ position: "absolute", left: deClaude ? 560 : 400, top: 990 + k * 46, opacity: v.opacity, transform: `scale(${v.scale})`, transformOrigin: deClaude ? "100% 100%" : "0 100%" }}>
            <div style={{ padding: "8px 22px", borderRadius: 24, borderBottomRightRadius: deClaude ? 6 : 24, borderBottomLeftRadius: deClaude ? 24 : 6, background: deClaude ? C.acento : C.panel2, border: `3px solid ${deClaude ? C.acento : C.borde}`, fontFamily: TITULO, fontWeight: 800, fontSize: 32, color: deClaude ? C.oscuro : C.texto }}>{deClaude ? "?" : "…"}</div>
          </div>
        );
      })}
      <Sello texto="QUE TE ENTREVISTE" x={540} y={1360} t={t} at={T.entreviste} out={fueraA} size={56} rot={-2} />

      {/* ── la petición en el panel ── */}
      {(() => {
        const v = vis(t, T.escribele - 0.25, fueraB, 0.88);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540 - P.w / 2, top: P.y - P.h / 2, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <Ventana w={P.w} h={P.h} titulo="Claude Code">
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", background: VS.barra, borderBottom: `2px solid ${VS.borde}` }}>
                  <Pestana texto="Claude Code" icono={<Asterisco size={24} />} />
                </div>
                <div style={{ flex: 1, padding: "26px 30px", display: "flex", flexDirection: "column", gap: 18, justifyContent: "flex-end" }}>
                  {enviado && (
                    <Aparece t={t} at={T.envia} desde={40}>
                      <MsgUsuario size={34}>Antes de empezar, hazme todas las preguntas que necesites.</MsgUsuario>
                    </Aparece>
                  )}
                </div>
                <div style={{ padding: "0 26px 26px" }}>
                  <div style={{ boxSizing: "border-box", borderRadius: 14, border: `2px solid ${enviado ? VS.cajaBorde : VS.entrada}`, background: "#1B1B1B", padding: "16px 22px", minHeight: 76 }}>
                    {!enviado && t >= T.peticion[0].inicio - 0.05 ? (
                      <TextoVoz palabras={T.peticion} t={t} size={36} limpiar={(w) => sinComillas(w) + (w.endsWith("».") ? "." : "")} resaltes={[4, 5, 6]} />
                    ) : (
                      <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 30, color: VS.tenue }}>⌘ Esc to focus or unfocus Claude</span>
                    )}
                  </div>
                </div>
              </div>
            </Ventana>
          </div>
        );
      })()}
      <Etiqueta texto="ESCRÍBELE" x={540} y={P.y - P.h / 2 - 70} t={t} at={T.escribele - 0.05} out={T.saca - 0.1} size={40} variante="acento" fuente="titulo" />
      {/* las preguntas sacan el detalle */}
      {[0, 1, 2, 3].map((k) => {
        const x = 195 + k * 230;
        const v = vis(t, T.saca - 0.1 + k * 0.14, fueraB, 0.5);
        if (!v.on) return null;
        const vuelta = ramp(t, T.detalle - 0.05 + k * 0.16, T.detalle + 0.25 + k * 0.16);
        const ok = vuelta > 0.5;
        return (
          <div key={k} style={{ position: "absolute", left: x - 90, top: P.y + P.h / 2 + 60, width: 180, height: 150, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale}) rotateY(${Math.sin(vuelta * Math.PI) * 80}deg)` }}>
            <div style={{ width: "100%", height: "100%", boxSizing: "border-box", borderRadius: 26, background: ok ? C.acento : C.panel, border: `3px solid ${ok ? C.acento : C.borde}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: ok ? `0 0 34px ${C.acento}55` : "0 20px 50px rgba(0,0,0,0.45)" }}>
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 30, color: ok ? C.oscuro : C.gris }}>{k + 1}</div>
              {ok ? <Ico nombre="check" size={58} color={C.oscuro} grosor={3.2} /> : <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 60, color: C.acento, lineHeight: 1 }}>?</div>}
            </div>
          </div>
        );
      })}
      <Etiqueta texto="SACA EL DETALLE" x={540} y={P.y + P.h / 2 + 290} t={t} at={T.detalle - 0.03} out={fueraB} size={42} variante="acento" fuente="titulo" />

      {/* ── EP.5: la entrevista para el CLAUDE.md ── */}
      <Etiqueta texto="EN EL EP.5" x={540} y={D - 470} t={t} at={T.es - 0.05} out={fueraC} size={44} variante="borde" fuente="titulo" />
      {(() => {
        const v = vis(t, T.es + 0.05, fueraC, 0.85);
        if (!v.on) return null;
        const vis4 = OPCIONES_EP5.map((_, i) => clamp01((t - (T.es + 0.25 + i * 0.12)) / 0.25));
        return (
          <div style={{ position: "absolute", left: 540 - 450, top: D - 380, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <Dialogo w={900} t={t} pestanas={["Stack", "Estilos", "Hosting", "Leads"]} activa={0} pregunta="¿Con qué stack quieres construir la landing?" opciones={OPCIONES_EP5} visibles={vis4} marcada={0} marca={ramp(t, T.crear - 0.1, T.crear + 0.2)} size={28} />
          </div>
        );
      })()}
      <Pop x={860} y={D + 360} t={t} at={T.md - 0.1} out={fueraC} rot={12} latidos={[T.md + 0.3]}>
        <div style={{ position: "relative" }}>
          <IconoMd size={150} lineas={3} />
          <div style={{ position: "absolute", right: -30, top: -26, width: 76, height: 76, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.min(1.1, sp(t, T.md + 0.2, { damping: 10, stiffness: 240 }))})` }}>
            <Ico nombre="check" size={48} color={C.oscuro} grosor={3.2} dibujo={ramp(t, T.md + 0.3, T.md + 0.6)} />
          </div>
        </div>
      </Pop>
      <Etiqueta texto="CLAUDE.md" x={560} y={D + 380} t={t} at={T.md - 0.05} out={fueraC} size={46} variante="texto" fuente="titulo" />

      {/* ── más allá: háblalo antes con tu agente de IA ── */}
      <Etiqueta texto="MÁS ALLÁ" x={540} y={A - 400} t={t} at={T.mas - 0.05} out={hasta + 0.4} size={44} variante="acento" fuente="titulo" />
      <Pop x={170} y={A} t={t} at={T.hablalo - 0.1} out={hasta + 0.4} rot={-8}>
        <Medalla6 nombre="usuario" size={150} />
      </Pop>
      <Etiqueta texto="TÚ" x={170} y={A + 120} t={t} at={T.hablalo} out={hasta + 0.4} size={30} variante="gris" fuente="titulo" />
      {[0, 1].map((k) => {
        const v = vis(t, T.hablalo + 0.1 + k * 0.3, hasta + 0.4, 0.4);
        if (!v.on) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 255 + k * 40, top: A - 130 + k * 60, opacity: v.opacity, transform: `scale(${v.scale})`, padding: "6px 18px", borderRadius: 22, background: k ? C.acento : C.panel2, border: `3px solid ${k ? C.acento : C.borde}`, fontFamily: TITULO, fontWeight: 800, fontSize: 28, color: k ? C.oscuro : C.texto }}>…</div>
        );
      })}
      <Pop x={540} y={A} t={t} at={T.agente - 0.12} out={hasta + 0.4} rot={8} latidos={[T.inteligencia]}>
        <Medalla6 nombre="robot" size={200} />
      </Pop>
      <Etiqueta texto="ANTES" x={540} y={A - 160} t={t} at={T.antes - 0.03} out={hasta + 0.4} size={34} variante="borde" fuente="titulo" />
      <Etiqueta texto="TU AGENTE DE IA" x={540} y={A + 160} t={t} at={T.inteligencia - 0.05} out={hasta + 0.4} size={36} variante="acento" fuente="titulo" />
      <Flecha curva={{ a: { x: 660, y: A }, c: { x: 720, y: A - 40 }, b: { x: 790, y: A } }} p={ramp(t, T.artificial - 0.1, T.artificial + 0.3)} ancho={8} opacity={1 - ramp(t, hasta, hasta + 0.4)} />
      <Logo src={ep.logos.claude_code} x={910} y={A} w={150} t={t} at={T.artificial + 0.05} out={hasta + 0.4} />
    </Escena>
  );
};

export const eventosTruco = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  const p = T.peticion;
  return [
    { t: T.truco + 0.08, sfx: "golpe", vol: 0.5 },
    { t: T.si, sfx: "pop", vol: 0.3 },
    { t: T.claude, sfx: "pop", vol: 0.3 },
    { t: T.entreviste + 0.08, sfx: "golpe", vol: 0.45 },
    { t: p[0].inicio, sfx: "tecleo", vol: 0.25, dur: p[p.length - 1].fin - p[0].inicio },
    { t: T.envia, sfx: "envio", vol: 0.45 },
    { t: T.saca, sfx: "pop", vol: 0.3 },
    { t: T.detalle, sfx: "tick", vol: 0.45 },
    { t: T.es, sfx: "whoosh", vol: 0.28 },
    { t: T.md, sfx: "tick", vol: 0.5 },
    { t: T.hablalo, sfx: "pop", vol: 0.3 },
    { t: T.agente, sfx: "pop", vol: 0.35 },
    { t: T.artificial + 0.05, sfx: "tick", vol: 0.45 },
  ];
};
