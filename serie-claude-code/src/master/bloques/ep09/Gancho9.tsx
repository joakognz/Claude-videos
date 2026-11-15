/**
 * EP.9 · Parte 1 · Gancho (escenas parte → gancho → encargo): tarjeta PARTE 1/2 → dos formas de usar Claude Code
 * (A CIEGAS con los dados / EXPERTO con la estrella) → cuatro cartas boca abajo → votos de la comunidad → cada día →
 * el encargo: la fachada de la panadería (ilustración del usuario) y su web todavía en alambre.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta } from "../../componentes/Sello";
import { WebPanaderia } from "../../componentes/ep09/Panaderia";
import { Carta, IcoCalendario, IcoDados, IcoEstrella, IcoOjoTachado, IcoVoto, Pos, TarjetaParte } from "../../componentes/ep09/Piezas9";
import { C, EASE, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const tiempos = (L: Linea) => ({
  parte: L.en("parte", "Parte"),
  hay: L.en("gancho", "Hay"),
  dos: L.en("gancho", "dos"),
  pedir: L.en("gancho", "pedir"),
  cruzar: L.en("gancho", "cruzar"),
  trabajar: L.en("gancho", "trabajar"),
  experto: L.en("gancho", "experto."),
  diferencia: L.en("gancho", "diferencia"),
  cuatro: L.en("gancho", "cuatro"),
  funciones: L.en("gancho", "funciones."),
  votadas: L.en("gancho", "votadas"),
  comunidad: L.en("gancho", "comunidad,"),
  usar: L.en("gancho", "usar", 1),
  dia: L.en("gancho", "día."),
  te: L.en("encargo", "Te"),
  encargo: L.en("encargo", "encargo:"),
  web: L.en("encargo", "web"),
  panaderia: L.en("encargo", "panadería."),
});

const CARTAS = [135, 405, 675, 945];

export const Gancho9: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 1.0 },
    { t: T.hay - 0.2, x: 540, y: 1090, z: 1.0, d: 0.8 },
    { t: T.trabajar - 0.2, x: 560, y: 1100, z: 1.02, d: 0.8 },
    { t: T.diferencia - 0.3, x: 540, y: 1960, z: 1.0, d: 0.9 },
    { t: T.dia - 0.2, x: 540, y: 1990, z: 1.04, d: 0.8 },
    { t: T.te - 0.35, x: 560, y: 2960, z: 1.0, d: 1.0 },
  ];
  const fueraParte = T.hay + 0.1;
  const fuera2 = T.diferencia + 0.4;
  const fuera4 = T.te + 0.3;
  const vA = vis(t, T.pedir - 0.1, fuera2, 0.6);
  const vB = vis(t, T.trabajar - 0.1, fuera2, 0.6);
  const dado = t > T.cruzar ? (t - T.cruzar) * 700 * Math.exp(-(t - T.cruzar) * 1.6) : 0;
  const vWeb = vis(t, T.web - 0.1, Infinity, 0.7);
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── PARTE 1/2 ── */}
      {t < fueraParte + 0.1 && (
        <div style={{ position: "absolute", left: 540, top: 1070, width: 0, height: 0, opacity: 1 - ramp(t, fueraParte - 0.35, fueraParte) }}>
          <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
            <TarjetaParte t={t} at={desde - 0.1} n={ep.parte?.n ?? 1} de={ep.parte?.de ?? 2} titulo="LAS DE CADA DÍA" />
          </div>
        </div>
      )}

      {/* ── dos formas ── */}
      <Etiqueta texto="DOS FORMAS DE USAR" x={540} y={720} t={t} at={T.dos} out={fuera2} size={44} variante="gris" fuente="titulo" />
      <Logo src={ep.logos.claude_code} x={540} y={820} w={150} t={t} at={T.hay + 0.2} out={fuera2} />
      {vA.on && (
        <div style={{ position: "absolute", left: 290, top: 1170, width: 0, height: 0, opacity: vA.opacity * (1 - 0.5 * ramp(t, T.experto, T.experto + 0.4)) }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vA.y}px) scale(${vA.scale}) rotate(-3deg)`, width: 420, height: 520, borderRadius: 36, background: C.panel, border: `4px solid ${C.borde}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
            <div style={{ padding: "16px 24px", borderRadius: 18, background: C.panel2, border: `3px solid ${C.borde}`, fontFamily: UI, fontWeight: 600, fontSize: 32, color: C.texto }}>«hazme una web»</div>
            <div style={{ transform: `rotate(${dado}deg)` }}>
              <IcoDados s={130} color={C.gris} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.gris }}>
              <IcoOjoTachado s={52} color={C.gris} grosor={2.4} />A CIEGAS
            </div>
          </div>
        </div>
      )}
      {vB.on && (
        <div style={{ position: "absolute", left: 790, top: 1170, width: 0, height: 0, opacity: vB.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vB.y}px) scale(${vB.scale * (1 + 0.05 * Math.sin(clamp01((t - T.experto) / 0.4) * Math.PI))}) rotate(3deg)`, width: 420, height: 520, borderRadius: 36, background: C.panel, border: `4px solid ${C.acento}`, boxShadow: `0 0 60px ${C.acento}44`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
            {[0, 1, 2, 3].map((k) => {
              const e = clamp01((t - T.trabajar - 0.15 - k * 0.18) / 0.25);
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 16, opacity: e, transform: `translateX(${(1 - e) * 30}px)` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.acento, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={28} height={28} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.oscuro} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div style={{ width: 200, height: 18, borderRadius: 9, background: C.borde }} />
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.acento, marginTop: 10 }}>
              <IcoEstrella s={52} color={C.acento} grosor={2.4} />EXPERTO
            </div>
          </div>
        </div>
      )}

      {/* ── cuatro funciones ── */}
      <Etiqueta texto="4 FUNCIONES" x={540} y={1610} t={t} at={T.funciones - 0.1} out={fuera4} size={60} variante="texto" fuente="titulo" />
      {CARTAS.map((x, k) => {
        const at = T.cuatro + k * 0.12;
        const s = sp(t, at, { damping: 12, stiffness: 170 });
        if (s <= 0) return null;
        const voto = sp(t, T.votadas + k * 0.15, { damping: 10, stiffness: 220 });
        const barra = ramp(t, T.votadas + k * 0.15, T.comunidad + 0.4 + k * 0.1, EASE);
        const brillo = Math.max(0, Math.sin((t - T.usar) * 4 - k * 0.8)) * (t > T.usar ? 1 : 0);
        return (
          <React.Fragment key={k}>
            <div style={{ position: "absolute", left: x, top: 1960, width: 0, height: 0, opacity: Math.min(1, s * 2) * (1 - ramp(t, fuera4 - 0.35, fuera4)) }}>
              <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${(1 - s) * -260}px) rotate(${(1 - s) * (k % 2 ? 12 : -12)}deg) scale(${1 + 0.06 * brillo})` }}>
                <Carta w={210} t={t} gira={1e9} n={k + 1} titulo="" icono={null} />
              </div>
            </div>
            {voto > 0 && (
              <div style={{ position: "absolute", left: x, top: 2190, width: 0, height: 0, opacity: Math.min(1, voto * 2) * (1 - ramp(t, fuera4 - 0.35, fuera4)) }}>
                <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${voto})`, display: "flex", alignItems: "center", gap: 10 }}>
                  <IcoVoto s={44} color={C.acento} grosor={2.4} />
                  <div style={{ width: 110, height: 16, borderRadius: 8, background: C.panel2, overflow: "hidden" }}>
                    <div style={{ width: `${barra * (100 - k * 9)}%`, height: "100%", background: C.acento }} />
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      <Etiqueta texto="LAS MÁS VOTADAS" x={540} y={2310} t={t} at={T.comunidad - 0.1} out={T.usar - 0.05} size={44} variante="acento" fuente="titulo" />
      <Pos x={540} y={2320} t={t} at={T.usar - 0.05} out={fuera4}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 30px", borderRadius: 999, background: C.panel2, border: `3px solid ${C.acento}` }}>
          <IcoCalendario s={50} color={C.acento} grosor={2.4} />
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.texto }}>CADA DÍA</span>
        </div>
      </Pos>

      {/* ── el encargo: la panadería ── */}
      <Pos x={300} y={2960} t={t} at={T.te - 0.15} rot={-3} desde={0.7}>
        <div style={{ width: 470, height: 836, borderRadius: 32, overflow: "hidden", border: `5px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}>
          <Img src={staticFile(ep.imagenes!.panaderia)} style={{ width: 470 }} />
        </div>
      </Pos>
      <Etiqueta texto="EL ENCARGO" x={300} y={2620} t={t} at={T.encargo - 0.05} size={40} variante="acento" fuente="titulo" />
      {vWeb.on && (
        <div style={{ position: "absolute", left: 770, top: 3050, width: 0, height: 0, opacity: vWeb.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vWeb.y}px) scale(${vWeb.scale}) rotate(${2 * (1 - vWeb.s) + 2}deg)` }}>
            <WebPanaderia w={520} t={t} estilo={0} construye={ramp(t, T.web, T.panaderia + 0.6)} img={ep.imagenes!.panaderia} url="web-panaderia" />
          </div>
        </div>
      )}
      <Etiqueta texto="SU WEB" x={770} y={2640} t={t} at={T.web} out={hasta + 0.4} size={40} variante="borde" fuente="titulo" />
    </Escena>
  );
};

export const eventosGancho9 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.parte, sfx: "golpe", vol: 0.4 },
    { t: T.dos, sfx: "pop", vol: 0.35 },
    { t: T.pedir - 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.cruzar, sfx: "tick", vol: 0.35 },
    { t: T.trabajar - 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.experto, sfx: "pop", vol: 0.4 },
    ...[0, 1, 2, 3].map((k) => ({ t: T.cuatro + k * 0.12 + 0.15, sfx: "golpe" as const, vol: 0.28 })),
    { t: T.votadas, sfx: "pop", vol: 0.35 },
    { t: T.usar, sfx: "tick", vol: 0.35 },
    { t: T.te - 0.15, sfx: "whoosh", vol: 0.3 },
    { t: T.web - 0.1, sfx: "pop", vol: 0.4 },
  ];
};
