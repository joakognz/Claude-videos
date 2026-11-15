/**
 * Bloque «Paso 5: volver atrás» (escenas paso5 → paso5b → paso5c → paso5d → paso5e): algo falla → con el cuadro de
 * texto vacío, Escape dos veces o /rewind → el menú «Rewind to…» recreado (elegir mensaje → «Fork and rewind» →
 * Continue → «Code rewind successful») → la máquina del tiempo → y el aviso: lo tocado a mano no se deshace.
 * Los textos de la interfaz son los de Claude Code; mensajes y rutas son ficticios.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Aspa, Caja, CajaTexto, Check, Imagen, PETICION_2, Paso, PasosHud, ROJO, Rebobinado, VERDE, Ventana, pulso, tecleo } from "../componentes/Interfaz";
import { Cursor } from "../componentes/Piezas";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE, MONO, TITULO, UI, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => {
  const eliges = L.en("paso5c", "Eliges");
  const volver = L.en("paso5c", "volver");
  const confirmas = L.en("paso5c", "confirmas");
  const clic1 = Math.max(volver + 0.1, eliges + 0.65);
  const clic2 = Math.max(confirmas + 0.15, clic1 + 0.75);
  return {
    p5: L.ini("paso5"),
    algo: L.en("paso5", "Algo"),
    vuelves: L.en("paso5", "Vuelves"),
    con: L.ini("paso5b"),
    vacio: L.en("paso5b", "vacío"),
    pulsa: L.en("paso5b", "pulsa"),
    escape: L.en("paso5b", "Escape"),
    dos: L.en("paso5b", "dos"),
    veces: L.en("paso5b", "veces"),
    escribe: L.en("paso5b", "escribe"),
    barra: L.en("paso5b", "barra"),
    rewind: L.en("paso5b", "rewind"),
    rebobinar: L.en("paso5b", "rebobinar"),
    se: L.ini("paso5c"),
    menu: L.en("paso5c", "menú"),
    mensajes: L.en("paso5c", "mensajes"),
    eliges, volver, confirmas, clic1, clic2,
    recuperas: L.en("paso5c", "recuperas"),
    codigo: L.en("paso5c", "código"),
    conversacion: L.en("paso5c", "conversación"),
    estaban: L.en("paso5c", "estaban"),
    es: L.ini("paso5d"),
    maquina: L.en("paso5d", "máquina"),
    proyecto: L.en("paso5d", "proyecto"),
    eso: L.ini("paso5e"),
    deshace: L.en("paso5e", "deshace"),
    claude: L.en("paso5e", "Claude"),
    no: L.en("paso5e", "no"),
    mano: L.en("paso5e", "mano"),
  };
};

const BY = 1950; // estación B: panel del rewind (borde superior)
const PX = 90;
const PW = 900;
const PH = 730;
const CY = 3290; // estación C: máquina del tiempo
const DY = 4250; // estación D: lo tocado a mano
const FILAS = [
  { texto: PETICION_2, hace: "just now" },
  { texto: "Cambia el título de la portada por «Bienv…", hace: "2m ago" },
  { texto: "Crea un index.html con el título Mi negocio", hace: "6m ago" },
  { texto: "/init", hace: "9m ago" },
];
const FILA_H = 88;
const LISTA_Y = 196;

const Tecla: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ display: "inline-block", padding: "2px 12px", margin: "0 6px", borderRadius: 8, border: `2px solid ${C.borde}`, background: C.panel2, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.texto }}>{children}</span>
);

export const Paso5: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1130, z: 0.96 },
    { t: T.algo - 0.2, x: 540, y: 1060, z: 1.08, d: 0.8 },
    { t: T.con - 0.3, x: 540, y: 930, z: 1.08, d: 0.9 },
    { t: T.pulsa - 0.3, x: 540, y: 1150, z: 1.02, d: 0.9 },
    { t: T.escribe - 0.3, x: 540, y: 1040, z: 1.08, d: 0.9 },
    { t: T.rebobinar - 0.45, x: 540, y: 1150, z: 0.98, d: 0.9 },
    { t: T.se - 0.35, x: 540, y: BY + 380, z: 0.98, d: 1.0 },
    { t: T.eliges - 0.2, x: 540, y: BY + 350, z: 1.06, d: 0.9 },
    { t: T.clic1 + 0.15, x: 540, y: BY + 380, z: 1.0, d: 0.8 },
    { t: T.clic2 + 0.3, x: 540, y: BY + 400, z: 1.12, d: 0.9 },
    { t: T.es - 0.35, x: 540, y: CY + 40, z: 1.0, d: 1.0 },
    { t: T.eso - 0.35, x: 540, y: DY - 20, z: 0.97, d: 1.0 },
    { t: T.no - 0.2, x: 540, y: DY - 10, z: 1.0, d: 1.0 },
  ];
  const fueraA = T.se - 0.15;
  // estación A
  const escrito = tecleo("/rewind", t, T.barra, Math.max(T.barra + 0.4, T.rewind + 0.35));
  const hundida = Math.max(pulso(t, T.dos - 0.05, 0.26), pulso(t, Math.max(T.veces, T.dos + 0.3), 0.26));
  const veces = t < T.dos ? 0 : t < Math.max(T.veces, T.dos + 0.3) ? 1 : 2;
  // estación B: menú → diálogo → resultado
  const sel = sp(t, T.eliges + 0.3, { damping: 16, stiffness: 220 });
  const lista = 1 - ramp(t, T.clic1 + 0.05, T.clic1 + 0.2);
  const dialogo = ramp(t, T.clic1 + 0.15, T.clic1 + 0.3);
  const fueraPanel = T.clic2 + 0.5;
  const p1 = ramp(t, T.eliges - 0.1, T.eliges + 0.45, EASE);
  const p2 = ramp(t, T.clic1 + 0.2, T.clic2 - 0.12, EASE);
  const filaY = BY + LISTA_Y + FILA_H * 1.5;
  const contY = BY + 524 + 42;
  const curX = 840 + (610 - 840) * p1 + (560 - 610) * p2;
  const curY = BY + 700 + (filaY - (BY + 700)) * p1 + (contY - filaY) * p2;
  const curOp = ramp(t, T.eliges - 0.15, T.eliges + 0.05) * (1 - ramp(t, T.clic2 + 0.3, T.clic2 + 0.5));
  const res = T.clic2 + 0.45; // aparece el resultado
  const retro = sp(t, Math.max(res + 0.15, T.recuperas - 0.1), { damping: 15, stiffness: 120 });
  const MX = [250, 540, 830];
  return (
    <>
      <Escena t={t} tomas={tomas}>
        {/* A · algo ha fallado */}
        <Ventana x={540} y={960} w={780} h={420} t={t} at={T.algo - 0.2} out={T.con - 0.1} titulo="index.html" logo={ep.logos.vscode} sacudida={t > T.algo && t < T.algo + 0.5 ? Math.sin((t - T.algo) * 70) * (0.5 - (t - T.algo)) * 20 : 0}>
          {[0, 1, 2].map((k) => {
            const roto = ramp(t, T.algo, T.algo + 0.3) * (1 - ramp(t, T.vuelves + 0.2, T.vuelves + 0.7));
            return <div key={k} style={{ position: "absolute", left: 60 + k * 30, top: 60 + k * 84, width: [520, 380, 440][k], height: 30, borderRadius: 15, background: k === 0 ? C.gris : C.tenue, transform: `rotate(${[-7, 5, -11][k] * roto}deg) translate(${[30, -20, 60][k] * roto}px, ${[10, 30, 50][k] * roto}px)` }} />;
          })}
          {(() => {
            const v = vis(t, T.algo + 0.05, T.vuelves + 0.45, 0.3);
            return v.on ? (
              <div style={{ position: "absolute", right: 60, top: 70, opacity: v.opacity, transform: `scale(${v.scale * (1 + 0.06 * Math.sin(t * 9))})` }}>
                <svg width={170} height={160} viewBox="0 0 24 22.6">
                  <path d="M12 2 L22.5 20.4 H1.5 Z" fill="rgba(247,118,142,0.18)" stroke={ROJO} strokeWidth={1.7} strokeLinejoin="round" />
                  <path d="M12 8.2 V14" stroke={ROJO} strokeWidth={2} strokeLinecap="round" />
                  <circle cx={12} cy={17.1} r={1.15} fill={ROJO} />
                </svg>
              </div>
            ) : null;
          })()}
        </Ventana>
        <Etiqueta texto="¿ALGO HA FALLADO?" x={540} y={1260} t={t} at={T.algo + 0.1} out={T.vuelves - 0.05} size={54} variante="borde" fuente="titulo" />
        <Rebobinado x={540} y={990} r={300} t={t} at={T.vuelves - 0.05} out={T.con - 0.1} grosor={16} vel={200} />
        <Sello texto="VUELVES ATRÁS" x={540} y={1300} t={t} at={T.vuelves} out={T.con - 0.1} size={64} rot={-3} />

        {/* A · Escape dos veces o /rewind */}
        <Caja x={90} y={730} w={900} t={t} at={T.con - 0.05} out={fueraA} desde={0.85}>
          <CajaTexto w={900} t={t} texto={escrito} activo size={46} vacio="" mono />
        </Caja>
        <Etiqueta texto="CUADRO DE TEXTO VACÍO" x={540} y={905} t={t} at={T.vacio - 0.45} out={T.escribe - 0.1} size={40} variante="borde" fuente="titulo" />
        {ep.iconos?.esc && <Imagen src={ep.iconos.esc} x={470} y={1170} w={270} t={t} at={T.pulsa - 0.05} out={fueraA} escala={1 - 0.13 * hundida} dy={hundida * 14} rot={-3} />}
        {veces > 0 && (
          <div style={{ position: "absolute", left: 760, top: 1160, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * sp(t, veces === 1 ? T.dos : Math.max(T.veces, T.dos + 0.3), { damping: 9, stiffness: 240 })})`, fontFamily: TITULO, fontWeight: 800, fontSize: 150, color: C.acento, whiteSpace: "nowrap", opacity: 1 - ramp(t, fueraA - 0.35, fueraA) }}>×{veces}</div>
          </div>
        )}
        <Etiqueta texto="ESCAPE, DOS VECES" x={540} y={1390} t={t} at={T.escape - 0.05} out={T.escribe - 0.1} size={46} variante="acento" fuente="titulo" />
        <Etiqueta texto="O ESCRIBE /rewind" x={540} y={905} t={t} at={T.escribe} out={fueraA} size={42} variante="acento" fuente="titulo" />
        <Sello texto="REWIND = REBOBINAR" x={540} y={1470} t={t} at={T.rebobinar - 0.1} out={fueraA} size={54} rot={-3} />

        {/* B · menú «Rewind to…» y diálogo «Fork and rewind» */}
        {(() => {
          const v = vis(t, T.se, fueraPanel, 0.86);
          if (!v.on) return null;
          return (
            <div style={{ position: "absolute", left: PX, top: BY, width: PW, height: PH, boxSizing: "border-box", borderRadius: 30, background: "#12151C", border: `3px solid ${C.acento}`, boxShadow: "0 50px 110px rgba(0,0,0,0.7)", opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, overflow: "hidden" }}>
              {/* lista de mensajes */}
              <div style={{ position: "absolute", inset: 0, opacity: lista, padding: "36px 40px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 42, color: C.texto, flex: 1 }}>Rewind to…</div>
                  <Aspa size={34} p={1} color={C.gris} grosor={2.4} />
                </div>
                <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 28, color: C.gris, lineHeight: 1.3, marginTop: 12 }}>Select a message to restore code and fork the conversation from that point.</div>
                <div style={{ position: "absolute", left: 40, right: 40, top: LISTA_Y, height: FILA_H * FILAS.length, borderRadius: 16, border: `2px solid ${C.borde}`, overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: FILA_H * sel, height: FILA_H, boxSizing: "border-box", background: "rgba(217,119,87,0.16)", border: `3px solid ${C.acento}`, borderRadius: 10 }} />
                  {FILAS.map((f, i) => {
                    const s = sp(t, T.mensajes - 0.15 + i * 0.07, { damping: 15, stiffness: 200 });
                    return (
                      <div key={i} style={{ position: "absolute", left: 0, right: 0, top: FILA_H * i, height: FILA_H, display: "flex", alignItems: "center", padding: "0 26px", boxSizing: "border-box", borderTop: i ? `2px solid ${C.borde}` : "none", opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * 40}px)` }}>
                        <div style={{ flex: 1, fontFamily: f.texto.startsWith("/") ? MONO : UI, fontWeight: 600, fontSize: 30, color: C.texto, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.texto}</div>
                        <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 26, color: C.gris, marginLeft: 20, whiteSpace: "nowrap" }}>{f.hace}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ position: "absolute", left: 34, bottom: 44, fontFamily: UI, fontWeight: 600, fontSize: 26, color: C.gris, whiteSpace: "nowrap" }}>
                  <Tecla>↑</Tecla>
                  <Tecla>↓</Tecla>to navigate ·<Tecla>Enter</Tecla>to select ·<Tecla>Esc</Tecla>to close
                </div>
              </div>
              {/* diálogo de confirmación */}
              {dialogo > 0 && (
                <div style={{ position: "absolute", inset: 0, opacity: dialogo, padding: "36px 40px", transform: `translateY(${(1 - dialogo) * 24}px)` }}>
                  <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 42, color: C.texto }}>Fork and rewind</div>
                  <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 28, color: C.gris, lineHeight: 1.3, marginTop: 14 }}>A new forked conversation will be created after rewinding.</div>
                  <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.texto, lineHeight: 1.3, marginTop: 24 }}>
                    <span style={{ color: ROJO }}>1 line</span> will be removed and <span style={{ color: VERDE }}>1 line</span> will be added across 1 file:
                  </div>
                  <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 30, color: C.texto, marginTop: 18, paddingLeft: 8 }}>• mi-proyecto/index.html</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: UI, fontWeight: 600, fontSize: 27, color: C.gris, marginTop: 26, lineHeight: 1.25 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", border: `3px solid ${C.gris}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 22, flexShrink: 0 }}>i</div>
                    Rewinding does not affect files edited manually or via bash.
                  </div>
                  <div style={{ position: "absolute", left: 40, right: 40, top: 524, height: 84, borderRadius: 14, background: C.acento, display: "flex", alignItems: "center", padding: "0 26px", fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.oscuro, transform: `scale(${1 - 0.04 * pulso(t, T.clic2 - 0.06, 0.25)})`, boxShadow: `0 0 ${24 + 30 * pulso(t, T.clic2, 0.4)}px ${C.acento}88` }}>
                    <span style={{ opacity: 0.6, marginRight: 14 }}>1</span>Continue
                  </div>
                  <div style={{ position: "absolute", left: 40, right: 40, top: 622, height: 76, borderRadius: 14, border: `2px solid ${C.borde}`, boxSizing: "border-box", display: "flex", alignItems: "center", padding: "0 26px", fontFamily: UI, fontWeight: 600, fontSize: 32, color: C.texto }}>
                    <span style={{ color: C.gris, marginRight: 14 }}>2</span>Never mind
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        <Cursor x={curX} y={curY} pulsa={Math.max(pulso(t, T.clic1 - 0.08, 0.25), pulso(t, T.clic2 - 0.08, 0.25))} opacity={curOp} size={78} />

        {/* B · resultado: vuelve al punto elegido */}
        {(() => {
          const v = vis(t, res, T.es - 0.15, 0.8);
          if (!v.on) return null;
          return (
            <div style={{ position: "absolute", left: 540, top: BY + 120, width: 0, height: 0 }}>
              <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, opacity: v.opacity, display: "flex", alignItems: "center", gap: 18, padding: "20px 38px", borderRadius: 999, background: C.panel, border: `3px solid ${VERDE}`, fontFamily: UI, fontWeight: 600, fontStyle: "italic", fontSize: 40, color: C.texto, whiteSpace: "nowrap" }}>
                <Check size={44} p={ramp(t, res + 0.1, res + 0.4)} color={VERDE} />
                Code rewind successful
              </div>
            </div>
          );
        })()}
        {(() => {
          const v = vis(t, res + 0.05, T.es - 0.15, 0.9);
          if (!v.on) return null;
          return <div style={{ position: "absolute", left: 130, top: BY + 420 - 5, width: 820, height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${C.acento}, ${C.tenue})`, opacity: v.opacity }} />;
        })()}
        {ep.iconos?.marcador &&
          MX.map((x, i) => <Imagen key={i} src={ep.iconos!.marcador} x={x} y={BY + 320} w={98} t={t} at={res + 0.05 + i * 0.07} out={T.es - 0.15} rot={i % 2 ? 4 : -4} tenue={i === 2 ? 1 - 0.7 * Math.min(1, retro) : 1} escala={i === 1 ? 1 + 0.18 * Math.min(1, retro) : 1} />)}
        {(() => {
          const v = vis(t, res + 0.2, T.es - 0.15, 0.6);
          if (!v.on) return null;
          const x = MX[2] + (MX[1] - MX[2]) * retro;
          return <div style={{ position: "absolute", left: x - 26, top: BY + 420 - 26, width: 52, height: 52, borderRadius: "50%", boxSizing: "border-box", background: C.texto, border: `8px solid ${C.acento}`, boxShadow: `0 0 34px ${C.acento}`, opacity: v.opacity }} />;
        })()}
        {[
          { x: 100, texto: "CÓDIGO", at: T.codigo },
          { x: 555, texto: "CONVERSACIÓN", at: T.conversacion },
        ].map((c, i) => (
          <Caja key={i} x={c.x} y={BY + 500} w={425} h={120} t={t} at={Math.max(res + 0.2, c.at - 0.05)} out={T.es - 0.15} style={{ borderRadius: 30, background: C.panel, border: `3px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: TITULO, fontWeight: 800, fontSize: i ? 36 : 44, color: C.texto }}>
            {c.texto}
            <Check size={50} p={ramp(t, Math.max(res + 0.3, c.at + 0.1), Math.max(res + 0.3, c.at + 0.1) + 0.3)} />
          </Caja>
        ))}
        <Etiqueta texto="TAL COMO ESTABAN" x={540} y={BY + 710} t={t} at={T.estaban - 0.4} out={T.es - 0.15} size={46} variante="acento" fuente="titulo" />

        {/* C · máquina del tiempo */}
        {ep.iconos?.reloj && <Imagen src={ep.iconos.reloj} x={540} y={CY - 60} w={285} t={t} at={T.es - 0.1} out={T.eso - 0.15} rot={Math.sin((t - T.es) * 4) * -6} escala={1 + 0.08 * pulso(t, T.maquina, 0.4)} />}
        <Rebobinado x={540} y={CY - 50} r={208} t={t} at={T.es + 0.05} out={T.eso - 0.15} grosor={15} vel={190} />
        <Sello texto="MÁQUINA DEL TIEMPO" x={540} y={CY + 280} t={t} at={T.maquina + 0.05} out={T.eso - 0.15} size={62} rot={-3} />
        <Etiqueta texto="PARA TU PROYECTO" x={540} y={CY + 420} t={t} at={T.proyecto - 0.25} out={T.eso - 0.15} size={40} variante="borde" fuente="titulo" />

        {/* D · lo que se deshace y lo que no */}
        <Etiqueta texto="ESO SÍ" x={540} y={DY - 395} t={t} at={T.eso} out={hasta + 0.4} size={70} variante="texto" fuente="titulo" />
        {[
          { x: 60, at: T.deshace - 0.1, titulo: ["Lo que cambió", "Claude"], estado: "SE DESHACE", color: VERDE, ok: true, marca: T.claude + 0.2 },
          { x: 555, at: T.no - 0.1, titulo: ["Lo que tocaste", "tú a mano"], estado: "NO SE DESHACE", color: ROJO, ok: false, marca: T.mano - 0.1 },
        ].map((c, i) => (
          <Caja key={i} x={c.x} y={DY - 300} w={465} h={620} t={t} at={c.at} out={hasta + 0.4} style={{ borderRadius: 40, background: C.panel, border: `4px solid ${t > c.marca ? c.color : C.borde}`, boxShadow: `0 30px 80px rgba(0,0,0,0.5)` }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 286, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 42, lineHeight: 1.15, color: C.texto }}>
              {c.titulo[0]}
              <br />
              <span style={{ color: C.acento }}>{c.titulo[1]}</span>
            </div>
            {(() => {
              const v = vis(t, c.marca, Infinity, 0.5);
              return v.on ? (
                <div style={{ position: "absolute", left: 30, right: 30, bottom: 44, height: 110, borderRadius: 26, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: UI, fontWeight: 700, fontSize: c.ok ? 40 : 34, letterSpacing: 0.5, color: C.oscuro, opacity: v.opacity, transform: `scale(${v.scale})`, whiteSpace: "nowrap" }}>
                  {c.ok ? <Check size={48} p={ramp(t, c.marca + 0.05, c.marca + 0.35)} color={C.oscuro} /> : <Aspa size={40} p={ramp(t, c.marca + 0.05, c.marca + 0.35)} color={C.oscuro} grosor={4} />}
                  {c.estado}
                </div>
              ) : null;
            })()}
          </Caja>
        ))}
        {(() => {
          const v = vis(t, T.deshace, hasta + 0.4, 0.3);
          return v.on ? (
            <div style={{ position: "absolute", left: 60 + 232 - 90, top: DY - 300 + 60, opacity: v.opacity, transform: `scale(${v.scale * (1 + 0.15 * pulso(t, T.claude, 0.4))}) rotate(${(t - T.deshace) * -50}deg)` }}>
              <Img src={staticFile(ep.logos.claude)} style={{ width: 180, display: "block" }} />
            </div>
          ) : null;
        })()}
        {ep.iconos?.mano && <Imagen src={ep.iconos.mano} x={555 + 232} y={DY - 300 + 150} w={175} t={t} at={T.no + 0.05} out={hasta + 0.4} rot={Math.sin((t - T.no) * 6) * 7} escala={1 + 0.12 * pulso(t, T.mano, 0.4)} />}
      </Escena>
      <Paso n={5} t={t} at={T.p5} out={T.algo - 0.02} />
      <PasosHud t={t} at={desde - 0.4} out={hasta + 0.5} inicios={[-Infinity, -Infinity, -Infinity, -Infinity, T.p5]} />
    </>
  );
};

export const eventosPaso5 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.p5 + 0.08, sfx: "golpe", vol: 0.6 },
    { t: T.algo, sfx: "golpe", vol: 0.45 },
    { t: T.vuelves - 0.05, sfx: "whoosh", vol: 0.4 },
    { t: T.vuelves + 0.1, sfx: "golpe", vol: 0.5 },
    { t: T.con, sfx: "pop", vol: 0.35 },
    { t: T.pulsa, sfx: "pop", vol: 0.4 },
    { t: T.dos, sfx: "golpe", vol: 0.55 },
    { t: Math.max(T.veces, T.dos + 0.3), sfx: "golpe", vol: 0.6 },
    { t: T.barra, sfx: "tecleo", vol: 0.3, dur: Math.max(0.4, T.rewind + 0.35 - T.barra) },
    { t: T.rebobinar, sfx: "golpe", vol: 0.5 },
    { t: T.se - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.se + 0.05, sfx: "pop", vol: 0.45 },
    { t: T.eliges + 0.3, sfx: "tick", vol: 0.4 },
    { t: T.clic1, sfx: "tick", vol: 0.55 },
    { t: T.clic2, sfx: "tick", vol: 0.6 },
    { t: T.clic2 + 0.45, sfx: "envio", vol: 0.45 },
    { t: T.codigo, sfx: "pop", vol: 0.35 },
    { t: T.conversacion, sfx: "pop", vol: 0.35 },
    { t: T.es - 0.3, sfx: "whoosh", vol: 0.35 },
    { t: T.maquina + 0.13, sfx: "golpe", vol: 0.6 },
    { t: T.eso - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.claude + 0.2, sfx: "tick", vol: 0.5 },
    { t: T.mano - 0.1, sfx: "golpe", vol: 0.5 },
  ];
};
