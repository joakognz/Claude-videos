/**
 * EP.13 v2 · Cómo votar: caja de comentario de Instagram donde se teclea y se borra cada palabra al ritmo de la voz,
 * y el anillo de historias (votar) → contador de 48 h que empieza a bajar, UN VOTO POR PERSONA y barras sin
 * resultados (plazo) → cuadrícula de 50 con el 14 latiendo, tarjeta EP.14 · MÓDULO 2 y el botón Seguir (final).
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Rejilla, olaEntrada } from "../../componentes/Rejilla";
import type { RejillaGeo } from "../../componentes/Rejilla";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Comentario } from "../../componentes/ep13/Piezas13";
import { AnilloHistoria, temblor } from "../../componentes/ep13b/Piezas13b";
import { C, MONO, TITULO, UI, clamp01, cue, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const PALABRAS = ["APPS", "AUTO", "WEB", "ESCALAR", "SEGURIDAD"];

// ── votar ────────────────────────────────────────────────────────────────────────────────────────────────────────
const V = "votar";
const tVotar = (L: Linea) => ({
  como: L.en(V, "¿Cómo"),
  comenta: L.en(V, "Comenta"),
  palabra: L.en(V, "palabra"),
  reel: L.en(V, "reel:"),
  w: PALABRAS.map((p) => L.en(V, `${p}${p === "SEGURIDAD" ? "." : ","}`)),
  en: L.en(V, "En mis"),
  historias: L.en(V, "historias"),
  explicada: L.en(V, "explicada."),
});

const CHIPS = [
  { x: 260, y: 1300 }, { x: 540, y: 1300 }, { x: 790, y: 1300 }, { x: 300, y: 1410 }, { x: 770, y: 1410 },
];

export const Votar13b: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tVotar(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1060, z: 1.08 },
    { t: T.comenta, x: 540, y: 1120, z: 1.0, d: 0.5 },
    { t: T.en - 0.1, x: 540, y: 1150, z: 1.02, d: 0.5 },
  ];
  // texto de la caja: cada palabra se teclea en ~0,25 s y se borra justo antes de la siguiente
  let texto = "";
  let activa = -1;
  PALABRAS.forEach((p, i) => {
    const a = T.w[i] - 0.05;
    const borra = i < 4 ? T.w[i + 1] - 0.2 : T.w[i] + 0.65;
    if (t >= a && t < borra + 0.12) {
      activa = i;
      const n = t < borra ? Math.ceil(clamp01((t - a) / 0.26) * p.length) : Math.floor((1 - clamp01((t - borra) / 0.12)) * p.length);
      texto = p.slice(0, n);
    }
  });
  const vCaja = vis(t, T.comenta - 0.05, Infinity, 0.7);
  const fuera = ramp(t, T.en - 0.15, T.en + 0.15);
  const vAnillo = vis(t, T.en, Infinity, 0.4);
  return (
    <Escena t={t} tomas={tomas}>
      {(() => {
        const v = vis(t, T.como - 0.05, T.en + 0.1, 0.6);
        return v.on ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", opacity: v.opacity, transform: `scale(${v.scale})`, fontFamily: TITULO, fontWeight: 800, fontSize: 104, color: C.texto, letterSpacing: -2 }}>
            ¿CÓMO <span style={{ color: C.acento }}>VOTAR?</span>
          </div>
        ) : null;
      })()}
      {vCaja.on && (
        <div style={{ position: "absolute", left: 80, top: 1000, opacity: vCaja.opacity * (1 - fuera), transform: `translateY(${vCaja.y * 2 + fuera * -120}px) scale(${vCaja.scale * (1 - 0.12 * fuera)})`, transformOrigin: "50% 0%" }}>
          <Comentario w={920} texto={texto} caret={Math.floor(t * 3) % 2 === 0 || texto.length > 0} envia={0} />
        </div>
      )}
      <Etiqueta texto="UNA SOLA PALABRA" x={540} y={1180} t={t} at={T.palabra - 0.05} out={T.w[0] - 0.1} size={40} variante="borde" fuente="titulo" />
      {PALABRAS.map((p, i) => {
        const e = vis(t, T.w[0] - 0.4 + i * 0.06, T.en, 0.5);
        if (!e.on) return null;
        const on = activa === i;
        const hecho = t > T.w[i];
        return (
          <div key={p} style={{ position: "absolute", left: CHIPS[i].x, top: CHIPS[i].y, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${e.scale * (on ? 1.18 : 1)})`, opacity: e.opacity, padding: "14px 30px", borderRadius: 16, fontFamily: TITULO, fontWeight: 800, fontSize: 50, background: on ? C.acento : C.panel2, color: on ? C.oscuro : hecho ? C.texto : C.gris, border: `4px solid ${on || hecho ? C.acento : C.borde}`, boxShadow: on ? `0 0 40px ${C.acento}` : undefined, whiteSpace: "nowrap" }}>
              {p}
            </div>
          </div>
        );
      })}
      {vAnillo.on && (
        <div style={{ position: "absolute", left: 540 - 125, top: 1110, opacity: vAnillo.opacity, transform: `scale(${vAnillo.scale})` }}>
          <AnilloHistoria w={250} logo={ep.logos.aigencyx} gira={(t - T.en) * 0.6} />
        </div>
      )}
      {vAnillo.on && (
        <div style={{ position: "absolute", left: 140, top: 1060, width: 800, display: "flex", gap: 10, opacity: vAnillo.opacity }}>
          {PALABRAS.map((p, i) => (
            <div key={p} style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
              <div style={{ width: `${clamp01((t - T.historias - i * 0.25) / 0.25) * 100}%`, height: "100%", background: C.texto }} />
            </div>
          ))}
        </div>
      )}
      <Etiqueta texto="EN MIS HISTORIAS" x={540} y={1430} t={t} at={T.historias} size={46} variante="acento" fuente="titulo" />
      <Sello texto="CADA OPCIÓN EXPLICADA" x={540} y={1530} t={t} at={T.explicada} size={44} rot={-3} />
    </Escena>
  );
};

export const eventosVotar13b = (L: Linea): Evento[] => {
  const T = tVotar(L);
  return [
    cue(T.como, "remate", "¿CÓMO VOTAR?", "medio"),
    cue(T.comenta + 0.05, "interfaz", "aparece la caja de comentario", "bajo"),
    ...T.w.map((w, i) => cue(w - 0.05, "teclado", `se teclea ${PALABRAS[i]}`, "bajo", { desde: [0, 3.1, 1.2, 6.4, 4.5][i], dur: 0.3 })),
    cue(T.en + 0.05, "destello", "anillo de historias", "medio"),
    cue(T.explicada, "click", "sello CADA OPCIÓN EXPLICADA", "bajo"),
  ];
};

// ── plazo ────────────────────────────────────────────────────────────────────────────────────────────────────────
const P = "plazo";
const tPlazo = (L: Linea) => ({ tenéis: L.en(P, "Tenéis"), h48: L.en(P, "48"), horas: L.en(P, "horas."), un: L.en(P, "Un voto"), persona: L.en(P, "persona.") });

export const Plazo13b: React.FC<BloqueProps> = ({ t, L, desde }) => {
  const T = tPlazo(L);
  const tomas: Toma[] = [{ t: desde - 1, x: 540, y: 1100, z: 1.1 }, { t: T.h48, x: 540, y: 1110, z: 1.0, d: 0.4 }];
  const sh = temblor(t, [T.h48], 12);
  const seg = Math.max(0, 48 * 3600 - Math.max(0, t - T.horas) * 47);
  const hh = String(Math.floor(seg / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seg % 3600) / 60)).padStart(2, "0");
  const ss = String(Math.floor(seg % 60)).padStart(2, "0");
  const v = sp(t, T.h48 - 0.05, { damping: 10, stiffness: 250 });
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        {t >= T.h48 - 0.05 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", opacity: clamp01(v * 2.5), transform: `scale(${1.8 - 0.8 * v})` }}>
            <div style={{ display: "inline-block", fontFamily: MONO, fontWeight: 700, fontSize: 140, color: C.texto, background: C.panel, border: `5px solid ${C.acento}`, borderRadius: 30, padding: "8px 40px", boxShadow: `0 0 50px ${C.acento}55`, letterSpacing: 2 }}>
              <span style={{ color: C.acento }}>{hh}</span>:{mm}:{ss}
            </div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.gris, letterSpacing: 8, marginTop: 18 }}>PARA VOTAR</div>
          </div>
        )}
        {PALABRAS.map((p, i) => {
          const y = 990 + i * 84;
          const e = vis(t, T.horas - 0.1 + i * 0.07, Infinity, 0.6);
          if (!e.on) return null;
          const fill = 0.05 + 0.07 * clamp01((t - T.horas - i * 0.1) / 0.8) * (1 + 0.3 * Math.sin(t * 3 + i * 1.7));
          return (
            <div key={p} style={{ position: "absolute", left: 100, top: y, width: 880, height: 64, display: "flex", alignItems: "center", gap: 20, opacity: e.opacity, transform: `translateX(${(1 - e.s) * -80}px)` }}>
              <div style={{ width: 250, fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto }}>{p}</div>
              <div style={{ flex: 1, height: 44, borderRadius: 12, background: C.panel2, border: `3px solid ${C.borde}`, overflow: "hidden" }}>
                <div style={{ width: `${fill * 100}%`, height: "100%", background: C.acento }} />
              </div>
              <div style={{ width: 40, fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.acento }}>?</div>
            </div>
          );
        })}
        <Sello texto="UN VOTO POR PERSONA" x={540} y={1520} t={t} at={T.un} size={60} rot={-4} resalte={1} />
      </div>
    </Escena>
  );
};

export const eventosPlazo13b = (L: Linea): Evento[] => {
  const T = tPlazo(L);
  return [
    cue(T.h48, "impacto", "golpe: contador 48:00:00", "bajo"),
    cue(T.horas + 0.1, "glitch", "aparecen las barras de voto vacías", "bajo"),
    cue(T.un, "remate", "sello UN VOTO POR PERSONA", "medio"),
  ];
};

// ── final: módulo 2 y seguir ─────────────────────────────────────────────────────────────────────────────────────
const F = "modulo2";
const G: RejillaGeo = { cx: 540, cy: 850, celda: 52, hueco: 12, cols: 10, filas: 5 };
const tFinal = (L: Linea) => ({
  votada: L.en(F, "votada"),
  abre: L.en(F, "abre"),
  modulo: L.en(F, "módulo"),
  construimos: L.en(F, "construimos"),
  juntos: L.en(F, "juntos"),
  episodio: L.en(F, "episodio"),
  catorce: L.en(F, "14."),
  sigueme: L.en("cierre", "Sígueme"),
  resultado: L.en("cierre", "resultado."),
});

export const Final13b: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tFinal(L);
  const sig = ep.siguiente_episodio;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1040, z: 1.04 },
    { t: T.episodio, x: 540, y: 1080, z: 1.0, d: 0.8 },
    { t: T.sigueme - 0.3, x: 540, y: 1130, z: 1.0, d: 0.8 },
  ];
  const pulsa = T.sigueme + 0.45;
  const hund = Math.sin(clamp01((t - pulsa + 0.08) / 0.2) * Math.PI) * 0.08;
  const siguiendo = ramp(t, pulsa + 0.05, pulsa + 0.25);
  const vPerfil = vis(t, T.sigueme - 0.15, Infinity, 0.8);
  const vTarj = vis(t, T.modulo - 0.05, Infinity, 0.6);
  const sh = temblor(t, [T.modulo], 10);
  const entra = desde - 0.4;
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        <Rejilla
          g={G}
          total={ep.total}
          estado={(n) => {
            const o = olaEntrada(t, entra, G, n);
            const hecho = n <= ep.episodio;
            const prox = n === sig;
            const late = prox && t > T.modulo ? Math.max(0, Math.sin((t - T.modulo) * 6.5)) * 0.18 : 0;
            return {
              opacity: o.opacity * (hecho || prox ? 1 : 0.5), escala: 0.6 + 0.4 * o.s, encendida: hecho ? 1 : prox ? 0.5 * clamp01((t - T.modulo) / 0.3) : 0, latido: late,
              contorno: prox ? clamp01((t - T.abre) / 0.3) : 0, check: hecho ? clamp01((t - entra - 0.4 - n * 0.025) / 0.3) : 0,
            };
          }}
        />
        <Etiqueta texto="LA MÁS VOTADA" x={540} y={1090} t={t} at={T.votada - 0.05} out={T.modulo - 0.05} size={48} variante="borde" fuente="titulo" />
        {vTarj.on && (
          <div style={{ position: "absolute", left: 540, top: 1205, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vTarj.y}px) scale(${vTarj.scale * (1 + 0.06 * Math.sin(clamp01((t - T.catorce) / 0.25) * Math.PI))})`, opacity: vTarj.opacity, display: "flex", alignItems: "center", gap: 30, padding: "26px 40px", borderRadius: 30, background: C.panel, border: `4px solid ${C.acento}`, boxShadow: `0 0 50px ${C.acento}44`, whiteSpace: "nowrap" }}>
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 96, color: t >= T.episodio ? C.acento : C.tenue, lineHeight: 1 }}>EP.{sig}</div>
              <div>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: C.texto, lineHeight: 1.05 }}>{ep.avance?.titulo ?? "MÓDULO 2"}</div>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 36, color: C.acento, opacity: clamp01((t - T.construimos) / 0.3) }}>{ep.avance?.subtitulo}</div>
              </div>
            </div>
          </div>
        )}
        <Etiqueta texto="LO CONSTRUIMOS JUNTOS" x={540} y={1370} t={t} at={T.juntos - 0.05} out={T.sigueme - 0.2} size={36} variante="gris" fuente="titulo" />
        {vPerfil.on && (
          <div style={{ position: "absolute", left: 540, top: 1440, width: 0, height: 0, opacity: vPerfil.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vPerfil.y}px) scale(${vPerfil.scale})`, display: "flex", alignItems: "center", gap: 24, padding: "20px 22px 20px 20px", borderRadius: 999, background: C.panel, border: `3px solid ${C.borde}`, whiteSpace: "nowrap", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
              <Img src={staticFile(ep.logos.aigencyx)} style={{ width: 104, height: 104, display: "block" }} />
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.texto }}>{ep.handle}</div>
              <div style={{ width: 290, height: 96, borderRadius: 999, transform: `scale(${1 - hund})`, background: siguiendo > 0.5 ? C.panel2 : C.acento, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: UI, fontWeight: 700, fontSize: 42, color: siguiendo > 0.5 ? C.texto : C.oscuro, boxShadow: t < pulsa ? `0 0 ${26 + 18 * Math.sin(t * 6)}px ${C.acento}88` : "none" }}>
                {siguiendo > 0.5 ? (
                  <>
                    Siguiendo
                    <svg width={36} height={36} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.acento} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - clamp01((t - pulsa - 0.2) / 0.3))} /></svg>
                  </>
                ) : (
                  "Seguir"
                )}
              </div>
            </div>
          </div>
        )}
        {t > pulsa - 0.5 && t < pulsa + 0.6 && (
          <div style={{ position: "absolute", left: 790, top: 1450, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: `5px solid ${C.acento}`, opacity: Math.min(clamp01((t - pulsa + 0.5) / 0.2), 1 - clamp01((t - pulsa - 0.3) / 0.3)), transform: `translate(${(1 - clamp01((t - pulsa + 0.5) / 0.4)) * 110}px, ${(1 - clamp01((t - pulsa + 0.5) / 0.4)) * 80}px) scale(${1 - 0.25 * Math.sin(clamp01((t - pulsa) / 0.2) * Math.PI)})` }} />
        )}
        <Etiqueta texto="NO TE PIERDAS EL RESULTADO" x={540} y={1560} t={t} at={T.resultado} size={30} variante="gris" fuente="titulo" />
      </div>
    </Escena>
  );
};

export const eventosFinal13b = (L: Linea): Evento[] => {
  const T = tFinal(L);
  return [
    cue(T.votada, "click", "LA MÁS VOTADA", "bajo"),
    cue(T.modulo, "remate", "tarjeta MÓDULO 2 y casilla 14 latiendo", "medio"),
    cue(T.catorce, "destello", "EP.14 se enciende", "medio"),
    cue(T.sigueme - 0.15, "zoom", "baja la cámara al perfil", "bajo"),
    cue(T.sigueme + 0.45, "interfaz", "se pulsa Seguir", "medio"),
    cue(T.sigueme + 0.7, "acierto", "Siguiendo ✓", "bajo"),
  ];
};
