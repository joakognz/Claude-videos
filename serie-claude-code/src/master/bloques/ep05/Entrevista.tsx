/**
 * EP.5 · bloque «Entrevista» (escenas entrevista → rondas):
 * ¿Cómo sacamos uno bueno sin escribir código? (</> tachado) → Claude y tú frente a frente, bocadillos de
 * pregunta y sello ENTREVISTA → en el panel de Claude Code se escribe la petición real («…preguntarme todo lo que
 * necesites…») y se envía → Claude responde que preguntará por rondas y abre las preguntas.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { C, TITULO, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Frase, Medalla, Picto, Pop, escrito } from "../../ep05/kit";
import { Asterisco, Entrada, Linea, MsgUsuario, Pestana, VS, Ventana } from "../../ep05/ui";
import { Aparece } from "./Pasos";

/** La petición tal como se escribió en la grabación (solo se corrige «Claude. MD» → «CLAUDE.md»). */
export const PETICION =
  "Este es un proyecto dedicado para crear la Landing Page de mi cliente, que es una clínica estética lo que quiero que hagas ahora es preguntarme todo lo que necesites para crear ese archivo CLAUDE.md de manera profesional.";
const V = { x: 540, y: 2420, w: 980, h: 900 };

const tiempos = (L: LineaT) => {
  const le = L.en("entrevista", "Le");
  const nec = L.finDe("entrevista", "necesarias");
  return {
    entonces: L.ini("entrevista"),
    como: L.en("entrevista", "cómo"),
    sacamos: L.en("entrevista", "sacamos"),
    uno: L.en("entrevista", "uno"),
    bueno: L.en("entrevista", "bueno"),
    sin: L.en("entrevista", "sin"),
    escribir: L.en("entrevista", "escribir"),
    codigo: L.en("entrevista", "código"),
    dejando: L.en("entrevista", "Dejando"),
    claude: L.en("entrevista", "Claude"),
    te: L.en("entrevista", "te"),
    entreviste: L.en("entrevista", "entreviste"),
    le,
    preguntas: L.en("entrevista", "preguntas"),
    nec,
    escribeA: le - 0.1,
    escribeB: nec - 0.05,
    envia: Math.max(nec + 0.1, L.ini("rondas") - 0.25),
    y: L.ini("rondas"),
    pregunta: L.en("rondas", "pregunta"),
    rondas: L.en("rondas", "rondas"),
  };
};

export const Entrevista: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 860, z: 1.08 },
    { t: T.sin - 0.2, x: 540, y: 960, z: 1.04, d: 0.8 },
    { t: T.dejando - 0.25, x: 540, y: 1230, z: 1.06, d: 0.8 },
    { t: T.entreviste - 0.1, x: 540, y: 1260, z: 1.12, d: 0.6 },
    { t: T.le - 0.3, x: 540, y: 2620, z: 1.06, d: 0.9 },
    { t: T.envia - 0.1, x: 540, y: 2400, z: 1.0, d: 0.8 },
    { t: T.rondas - 0.2, x: 540, y: 2330, z: 1.06, d: 0.8 },
  ];
  const fueraA = T.le;
  const enviado = t >= T.envia;
  const texto = enviado ? "" : escrito(PETICION, t, T.escribeA, T.escribeB);
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", left: 540, top: 720, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
          <Frase t={t} out={T.dejando} size={66} palabras={[{ w: "¿Cómo", at: T.como }, { w: "sacamos", at: T.sacamos }, { w: "uno", at: T.uno }, { w: "bueno", at: T.bueno, acento: true }]} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 540, top: 805, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
          <Frase t={t} out={T.dejando} size={66} palabras={[{ w: "sin", at: T.sin }, { w: "escribir", at: T.escribir }, { w: "código?", at: T.codigo }]} />
        </div>
      </div>
      <Pop x={540} y={1000} t={t} at={T.codigo - 0.05} out={T.dejando + 0.1} rot={-10}>
        <div style={{ position: "relative" }}>
          <Medalla nombre="codigo" size={170} />
          <div style={{ position: "absolute", left: 0, top: 0 }}>
            <Picto nombre="cruz" size={170} grosor={2.2} dibujo={ramp(t, T.codigo + 0.15, T.codigo + 0.45)} />
          </div>
        </div>
      </Pop>
      {/* la entrevista: Claude pregunta, tú respondes */}
      <Logo src={ep.logos.claude} x={290} y={1230} w={170} t={t} at={T.claude - 0.05} out={fueraA} pulsos={[T.entreviste]} />
      <Pop x={790} y={1230} t={t} at={T.te - 0.05} out={fueraA}>
        <Medalla nombre="usuario" size={170} />
      </Pop>
      <Etiqueta texto="TÚ" x={790} y={1355} t={t} at={T.te} out={fueraA} size={30} variante="gris" fuente="titulo" />
      {[0, 1, 2].map((k) => {
        const at = T.claude + 0.25 + k * 0.32;
        const v = vis(t, at, fueraA, 0.4);
        if (!v.on) return null;
        const izq = k % 2 === 0;
        return (
          <div key={k} style={{ position: "absolute", left: izq ? 400 : 560, top: 1110 + k * 60, opacity: v.opacity, transform: `scale(${v.scale})`, transformOrigin: izq ? "0 100%" : "100% 100%" }}>
            <div style={{ padding: "10px 24px", borderRadius: 26, borderBottomLeftRadius: izq ? 6 : 26, borderBottomRightRadius: izq ? 26 : 6, background: izq ? C.acento : C.panel2, border: `3px solid ${izq ? C.acento : C.borde}`, fontFamily: TITULO, fontWeight: 800, fontSize: 34, color: izq ? C.oscuro : C.texto }}>{izq ? "?" : "…"}</div>
          </div>
        );
      })}
      <Sello texto="ENTREVISTA" x={540} y={1470} t={t} at={T.entreviste} out={fueraA} size={60} rot={-3} />

      {/* ── la petición en el panel ── */}
      {(() => {
        const v = vis(t, T.le - 0.2, hasta + 0.4, 0.88);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: V.x - V.w / 2, top: V.y - V.h / 2, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <Ventana w={V.w} h={V.h} buscador="landing-cliente-clínica-estética">
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", background: VS.barra, borderBottom: `2px solid ${VS.borde}` }}>
                  <Pestana texto="/init" icono={<Asterisco size={24} />} />
                </div>
                <div style={{ flex: 1, padding: "24px 30px", display: "flex", flexDirection: "column", gap: 18, overflow: "hidden" }}>
                  <div style={{ opacity: enviado ? 0.45 : 0.8 }}>
                    <Linea size={26}>
                      He creado <span style={{ color: VS.enlace }}>CLAUDE.md</span>, pero la carpeta está vacía, así que el archivo es solo un marcador.
                    </Linea>
                  </div>
                  {enviado && (
                    <Aparece t={t} at={T.envia} desde={40}>
                      <MsgUsuario size={25}>{PETICION}</MsgUsuario>
                    </Aparece>
                  )}
                  {enviado && (
                    <Aparece t={t} at={T.pregunta - 0.1}>
                      <Linea size={26}>Perfecto. Te voy a preguntar en dos rondas de opciones rápidas y luego unas pocas preguntas abiertas sobre el cliente.</Linea>
                    </Aparece>
                  )}
                  {enviado && (
                    <Aparece t={t} at={T.rondas - 0.05}>
                      <Linea size={26} punto="verde">
                        <b style={{ color: VS.blanco }}>AskUserQuestion</b>
                      </Linea>
                    </Aparece>
                  )}
                  {enviado && (
                    <Aparece t={t} at={T.rondas + 0.1}>
                      <div style={{ display: "flex", gap: 26, padding: "14px 22px", borderRadius: 14, background: "#252526", border: `2px solid ${VS.cajaBorde}`, fontFamily: "Inter", fontWeight: 600, fontSize: 24 }}>
                        {["Stack", "Estilos", "Hosting", "Leads"].map((p, i) => (
                          <span key={p} style={{ color: i === 0 ? VS.enlace : VS.blanco, borderBottom: i === 0 ? `3px solid ${VS.enlace}` : "none", paddingBottom: 4 }}>{p}</span>
                        ))}
                      </div>
                    </Aparece>
                  )}
                </div>
                <div style={{ padding: "0 26px 26px" }}>
                  <Entrada w={V.w - 52} texto={texto} t={t} size={27} foco={!enviado} resaltar={{ desde: "preguntarme todo lo que necesites" }} />
                </div>
              </div>
            </Ventana>
          </div>
        );
      })()}
      {(() => {
        // la clave de la petición se subraya cuando la voz dice «preguntas»
        const s = sp(t, T.preguntas, { damping: 14, stiffness: 160 });
        return <Etiqueta texto="«Hazme todas las preguntas»" x={540} y={2330} t={t} at={T.preguntas - 0.05} out={T.envia + 0.2} size={40 + 0 * s} variante="acento" fuente="titulo" />;
      })()}
      <Etiqueta texto="POR RONDAS" x={540} y={1915} t={t} at={T.rondas} out={hasta + 0.4} size={42} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosEntrevista = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.codigo + 0.15, sfx: "tick", vol: 0.4 },
    { t: T.claude, sfx: "pop", vol: 0.35 },
    { t: T.entreviste + 0.08, sfx: "golpe", vol: 0.5 },
    { t: T.le - 0.3, sfx: "whoosh", vol: 0.28 },
    { t: T.escribeA, sfx: "tecleo", vol: 0.26, dur: T.escribeB - T.escribeA },
    { t: T.envia, sfx: "envio", vol: 0.45 },
    { t: T.rondas, sfx: "pop", vol: 0.4 },
  ];
};
