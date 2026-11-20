/**
 * EP.12 · Qué es (escena que): rótulo COMPUTER USE con Claude Code → escribe código + usa tu ordenador (pantalla con
 * programas) → tres fichas: abre páginas, rellena campos, pulsa botones (cursor 3D en bucle, secundario) → tú y Claude
 * sentados juntos: le pides «crea el proyecto» y lo hace.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Cursor } from "../../componentes/Piezas";
import { Etiqueta } from "../../componentes/Sello";
import { Caja, Chip, Elemento3D, Ico, Insignia, Rotulo } from "../../componentes/ep12/Piezas12";
import { C, MONO, UI, clamp01, ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "que";
const YA = 1040;
const YB = 1820;
const YC = 2600;
const YD = 3360;

const tiempos = (L: Linea) => ({
  computer: L.en(E, "Computer"),
  claude: L.en(E, "Claude"),
  no: L.en(E, "no solo"),
  escribe: L.en(E, "escribe"),
  tambien: L.en(E, "también"),
  programas: L.en(E, "programas"),
  ordenador: L.en(E, "ordenador."),
  abre: L.en(E, "Abre"),
  rellena: L.en(E, "rellena"),
  pulsa: L.en(E, "pulsa"),
  ayudante: L.en(E, "ayudante"),
  sentado: L.en(E, "sentado"),
  lado: L.en(E, "lado,"),
  hace: L.en(E, "hace"),
  pides: L.en(E, "pides."),
});

const CODIGO = ["<main>", "  <h1>Floristería</h1>", "  <button>Comprar", "</main>"];

export const Que: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: YA, z: 0.98 },
    { t: T.no - 0.35, x: 540, y: YB, z: 1.0, d: 0.8 },
    { t: T.abre - 0.4, x: 540, y: YC, z: 1.0, d: 0.75 },
    { t: T.ayudante - 0.75, x: 540, y: YD - 30, z: 1.02, d: 0.8 },
  ];
  // B: el código se escribe; la pantalla del ordenador se enciende
  const lineas = ramp(t, T.escribe, T.tambien, (x) => x) * CODIGO.join("").length;
  let resto = lineas;
  const enciende = ramp(t, T.ordenador - 0.1, T.ordenador + 0.3);
  // D: Claude se sienta a tu lado
  const acerca = sp(t, T.sentado, { damping: 15, stiffness: 120 });
  const xClaude = 860 - 120 * acerca;
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── A · COMPUTER USE ── */}
      <Logo src={ep.logos.claude_code} x={540} y={YA - 250} w={200} t={t} at={T.claude} out={T.no + 0.3} sombra={false} />
      <Rotulo texto="COMPUTER" x={540} y={YA - 50} t={t} at={T.computer - 0.05} size={132} out={T.no + 0.3} />
      <Rotulo texto="USE" x={540} y={YA + 100} t={t} at={T.computer + 0.3} size={132} color={C.acento} out={T.no + 0.3} />
      {t < T.no + 0.3 && <TextoPixel src={ep.logos.claude_code_texto} x={540} y={YA + 280} w={300} t={t} at={T.claude + 0.15} />}

      {/* ── B · escribe código + usa tu ordenador ── */}
      <Etiqueta texto="ESCRIBE CÓDIGO" x={290} y={YB - 210} t={t} at={T.escribe} out={T.abre} size={30} variante="gris" />
      <Caja x={290} y={YB} t={t} at={T.escribe - 0.1} out={T.abre}>
        <div style={{ width: 400, height: 280, borderRadius: 22, background: C.panel, border: `3px solid ${C.borde}`, padding: "26px 24px", boxSizing: "border-box", opacity: 1 - 0.4 * ramp(t, T.tambien, T.tambien + 0.4) }}>
          {CODIGO.map((ln, i) => {
            const n = Math.max(0, Math.min(ln.length, Math.floor(resto)));
            resto -= ln.length;
            return (
              <div key={i} style={{ fontFamily: MONO, fontWeight: 500, fontSize: 28, lineHeight: 1.6, color: i % 3 === 0 ? C.acento : C.texto, whiteSpace: "pre" }}>
                {ln.slice(0, n)}
              </div>
            );
          })}
        </div>
      </Caja>
      <Caja x={540} y={YB} t={t} at={T.tambien} out={T.abre}>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 90, color: C.acento }}>+</div>
      </Caja>
      <Etiqueta texto="USA TU ORDENADOR" x={790} y={YB - 210} t={t} at={T.tambien + 0.1} out={T.abre} size={30} variante="borde" />
      <Caja x={790} y={YB + 10} t={t} at={T.tambien + 0.1} out={T.abre}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: 400, height: 260, borderRadius: 22, background: "#10131A", border: `6px solid color-mix(in srgb, ${C.acento} ${Math.round(enciende * 100)}%, ${C.borde})`,
              boxShadow: `0 0 ${60 * enciende}px rgba(217,119,87,${0.45 * enciende})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 28,
            }}
          >
            {[
              <Img key="c" src={staticFile(ep.logos.chrome)} style={{ width: 86 }} />,
              <Ico key="f" ruta="linea-coral/carpeta" s={86} />,
              <Ico key="m" ruta="linea-coral/comentario" s={86} />,
            ].map((el, i) => {
              const s = sp(t, T.programas + i * 0.12, { damping: 11, stiffness: 220 });
              return (
                <div key={i} style={{ transform: `scale(${s})`, opacity: clamp01(s * 2) }}>
                  {el}
                </div>
              );
            })}
          </div>
          <div style={{ width: 70, height: 46, background: C.borde }} />
          <div style={{ width: 200, height: 14, borderRadius: 7, background: C.borde }} />
        </div>
      </Caja>

      {/* ── C · lo que hace por ti ── */}
      <Caja x={540} y={YC - 190} t={t} at={T.abre} out={T.ayudante}>
        <Chip icono={<Img src={staticFile(ep.logos.chrome)} style={{ width: 62 }} />} texto="ABRE PÁGINAS" size={44} ancho={720} activo={1 - 0.7 * ramp(t, T.rellena, T.rellena + 0.3)} />
      </Caja>
      <Caja x={540} y={YC} t={t} at={T.rellena} out={T.ayudante}>
        <Chip
          icono={
            <div style={{ width: 66, height: 46, borderRadius: 10, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", paddingLeft: 8, boxSizing: "border-box" }}>
              <div style={{ width: 4, height: 26, background: C.texto, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.15 }} />
            </div>
          }
          texto="RELLENA CAMPOS" size={44} ancho={720} activo={1 - 0.7 * ramp(t, T.pulsa, T.pulsa + 0.3)}
        />
      </Caja>
      <Caja x={540} y={YC + 190} t={t} at={T.pulsa} out={T.ayudante}>
        <Chip icono={<div style={{ position: "relative", width: 60, height: 60 }}><Cursor x={8} y={2} pulsa={0} size={56} /></div>} texto="PULSA BOTONES" size={44} ancho={720} />
      </Caja>
      <Elemento3D e="cursor" x={930} y={YC + 250} w={300} t={t} at={T.pulsa + 0.15} out={T.ayudante} bucle={[0, 2]} tenue={0.9} />

      {/* ── D · tu ayudante ── */}
      <div style={{ position: "absolute", left: 140, top: YD + 150, width: 800, height: 22, borderRadius: 11, background: C.borde, opacity: clamp01(sp(t, T.ayudante) * 1.5) }} />
      <Caja x={330} y={YD} t={t} at={T.ayudante - 0.1}>
        <Ico ruta="dibujos/persona" s={230} />
      </Caja>
      <Etiqueta texto="TÚ" x={330} y={YD + 230} t={t} at={T.ayudante} size={34} variante="texto" fuente="titulo" />
      <Caja x={xClaude} y={YD + 10} t={t} at={T.ayudante + 0.1}>
        <div style={{ width: 210, height: 210, borderRadius: "50%", background: C.panel, border: `5px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${C.acento}55` }}>
          <Img src={staticFile(ep.logos.claude)} style={{ width: 130 }} />
        </div>
      </Caja>
      <Etiqueta texto="CLAUDE" x={xClaude} y={YD + 230} t={t} at={T.ayudante + 0.15} size={34} variante="acento" fuente="titulo" />
      <Caja x={360} y={YD - 230} t={t} at={T.lado - 0.1} rot={-2}>
        <Burbuja texto="Crea el proyecto" />
      </Caja>
      <Caja x={xClaude + 30} y={YD - 210} t={t} at={T.hace} rot={2}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Insignia s={78} tipo="check" />
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 40, color: C.texto }}>Hecho</div>
        </div>
      </Caja>
    </Escena>
  );
};

const Burbuja: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{ position: "relative", padding: "20px 30px", borderRadius: 26, background: C.texto, color: C.oscuro, fontFamily: UI, fontWeight: 700, fontSize: 40, boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}>
    {texto}
    <div style={{ position: "absolute", left: 50, bottom: -18, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `22px solid ${C.texto}` }} />
  </div>
);

const TextoPixel: React.FC<{ src: string; x: number; y: number; w: number; t: number; at: number }> = ({ src, x, y, w, t, at }) => {
  const s = sp(t, at, { damping: 14, stiffness: 170 });
  if (s <= 0) return null;
  const barrido = ramp(t, at, at + 0.45);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * s})`, opacity: clamp01(s * 1.6), clipPath: `inset(0 ${(1 - barrido) * 100}% 0 0)` }}>
        <Img src={staticFile(src)} style={{ width: w, display: "block" }} />
      </div>
    </div>
  );
};

export const eventosQue = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.computer - 0.05, sfx: "golpe", vol: 0.4 },
    { t: T.claude, sfx: "pop", vol: 0.35 },
    { t: T.escribe, sfx: "tecleo", vol: 0.25, dur: T.tambien - T.escribe },
    { t: T.tambien, sfx: "pop", vol: 0.35 },
    { t: T.programas, sfx: "pop", vol: 0.3 },
    { t: T.abre, sfx: "pop", vol: 0.35 },
    { t: T.rellena, sfx: "pop", vol: 0.35 },
    { t: T.pulsa, sfx: "pop", vol: 0.35 },
    { t: T.ayudante, sfx: "pop", vol: 0.35 },
    { t: T.lado - 0.1, sfx: "pop", vol: 0.3 },
    { t: T.hace, sfx: "tick", vol: 0.5 },
  ];
};
