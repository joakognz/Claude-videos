/**
 * EP.9 · Parte 2 · Gancho (escenas parte → gancho → seguimos): tarjeta PARTE 2/2 → tres preguntas que caen al
 * decirlas (¿repartir el trabajo? ¿usar tus herramientas? ¿hacerte caso desde el móvil?) → «Puede»: las tres se
 * marcan → LAS POTENTES con un rayo → la panadería (ilustración del usuario) y su web terminada en la parte 1.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta } from "../../componentes/Sello";
import { Check } from "../../componentes/ep08/Dibujos";
import { WebPanaderia } from "../../componentes/ep09/Panaderia";
import { Disco, IcoAyudantes, IcoEnchufe, IcoMovil, IcoRayo, Pos, TarjetaParte } from "../../componentes/ep09/Piezas9";
import { C, TITULO, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const tiempos = (L: Linea) => ({
  parte: L.en("parte", "Parte"),
  y: L.en("gancho", "¿Y"),
  claude: L.en("gancho", "Claude"),
  repartir: L.en("gancho", "repartir"),
  usar: L.en("gancho", "usar"),
  hacerte: L.en("gancho", "hacerte"),
  movil: L.en("gancho", "móvil?"),
  puede: L.en("gancho", "Puede."),
  son: L.en("gancho", "Son"),
  potentes: L.en("gancho", "potentes,"),
  hoy: L.en("gancho", "hoy"),
  todas: L.en("gancho", "todas."),
  seguimos: L.en("seguimos", "Seguimos"),
  web: L.en("seguimos", "web"),
  panaderia: L.en("seguimos", "panadería."),
});

export const Gancho2: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 1.0 },
    { t: T.y - 0.2, x: 540, y: 1180, z: 1.0, d: 0.8 },
    { t: T.son - 0.2, x: 540, y: 1260, z: 0.98, d: 0.8 },
    { t: T.seguimos - 0.35, x: 560, y: 2400, z: 1.0, d: 0.9 },
  ];
  const fueraParte = T.y + 0.1;
  const fuera = T.seguimos + 0.2;
  const preguntas = [
    { at: T.repartir, txt: "¿Repartir el trabajo?", Ico: IcoAyudantes },
    { at: T.usar, txt: "¿Usar tus herramientas?", Ico: IcoEnchufe },
    { at: T.hacerte, txt: "¿Hacerte caso desde el móvil?", Ico: IcoMovil },
  ];
  const puede = sp(t, T.puede, { damping: 11, stiffness: 200 });
  const vWeb = vis(t, T.web - 0.1, Infinity, 0.75);
  return (
    <Escena t={t} tomas={tomas}>
      {t < fueraParte + 0.1 && (
        <div style={{ position: "absolute", left: 540, top: 1070, width: 0, height: 0, opacity: 1 - ramp(t, fueraParte - 0.35, fueraParte) }}>
          <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
            <TarjetaParte t={t} at={desde - 0.1} n={ep.parte?.n ?? 2} de={ep.parte?.de ?? 2} titulo="LAS POTENTES" />
          </div>
        </div>
      )}

      {/* ── tres preguntas ── */}
      <Logo src={ep.logos.claude_code} x={540} y={790} w={170} t={t} at={T.claude - 0.05} out={fuera} pulsos={[T.puede]} />
      {preguntas.map((p, k) => {
        const v = vis(t, p.at - 0.1, fuera, 0.6);
        if (!v.on) return null;
        const on = puede > 0.02;
        return (
          <div key={k} style={{ position: "absolute", left: 540, top: 1020 + k * 190, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) translateX(${(1 - v.s) * (k % 2 ? 90 : -90)}px) scale(${v.scale * (1 + 0.04 * Math.sin(clamp01(puede) * Math.PI))})`, width: 940, height: 160, borderRadius: 30, background: on ? C.panel2 : C.panel, border: `4px solid ${on ? C.acento : C.borde}`, display: "flex", alignItems: "center", gap: 26, padding: "0 30px", boxSizing: "border-box", whiteSpace: "nowrap" }}>
              <Disco s={104} activo={on ? 1 : 0}>
                <p.Ico s={58} color={C.acento} grosor={2.2} />
              </Disco>
              <div style={{ flex: 1, fontFamily: TITULO, fontWeight: 800, fontSize: 41, color: C.texto }}>{p.txt}</div>
              {t > T.puede && <Check s={84} p={Math.min(1.15, sp(t, T.puede + k * 0.1, { damping: 10, stiffness: 220 }))} />}
            </div>
          </div>
        );
      })}
      <Pos x={540} y={1640} t={t} at={T.son - 0.05} out={fuera}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 40px", borderRadius: 999, background: C.acento, boxShadow: `0 16px 50px ${C.acento}66` }}>
          <IcoRayo s={60} color={C.oscuro} grosor={2.6} />
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 60, color: C.oscuro }}>LAS POTENTES</span>
        </div>
      </Pos>
      <Etiqueta texto="HOY, TODAS" x={540} y={1770} t={t} at={T.hoy} out={fuera} size={40} variante="borde" fuente="titulo" />

      {/* ── seguimos con la panadería ── */}
      <Pos x={300} y={2420} t={t} at={T.seguimos - 0.15} rot={-3} desde={0.7}>
        <div style={{ width: 430, height: 764, borderRadius: 30, overflow: "hidden", border: `5px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}>
          <Img src={staticFile(ep.imagenes!.panaderia)} style={{ width: 430 }} />
        </div>
      </Pos>
      {vWeb.on && (
        <div style={{ position: "absolute", left: 760, top: 2470, width: 0, height: 0, opacity: vWeb.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vWeb.y}px) scale(${vWeb.scale}) rotate(2deg)` }}>
            <WebPanaderia w={540} t={t} whatsapp={1} logoWhatsapp={ep.logos.whatsapp} img={ep.imagenes!.panaderia} />
          </div>
        </div>
      )}
      <Etiqueta texto="LA WEB DE LA PARTE 1" x={760} y={2080} t={t} at={T.panaderia - 0.1} out={hasta + 0.4} size={36} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosGancho2 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.parte, sfx: "golpe", vol: 0.4 },
    { t: T.claude - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.repartir - 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.usar - 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.hacerte - 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.puede, sfx: "tick", vol: 0.5 },
    { t: T.puede + 0.1, sfx: "tick", vol: 0.4 },
    { t: T.puede + 0.2, sfx: "tick", vol: 0.4 },
    { t: T.son - 0.05, sfx: "golpe", vol: 0.45 },
    { t: T.seguimos - 0.15, sfx: "whoosh", vol: 0.3 },
    { t: T.web - 0.1, sfx: "pop", vol: 0.4 },
  ];
};
