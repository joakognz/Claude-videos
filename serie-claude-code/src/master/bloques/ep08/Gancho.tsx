/**
 * EP.8 · Gancho (escena gancho): editor con Claude Code trabajando → de repente cae un aviso de error con un número
 * que no se lee → «Respira»: el aviso se aleja y un anillo respira → sello NO HAS ROTO NADA → los errores van a
 * pasar (tres avisos en abanico) → una lupa los lee → la barra del proyecto ya no se queda a medias.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Editor } from "../../componentes/Piezas";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { AvisoError, Check, IcoLupa } from "../../componentes/ep08/Dibujos";
import { C, EASE, EASE_OUT, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "gancho";
const tiempos = (L: Linea) => ({
  claude: L.en(E, "Claude"),
  repente: L.en(E, "repente,"),
  sale: L.en(E, "sale"),
  numero: L.en(E, "número."),
  respira: L.en(E, "Respira:"),
  roto: L.en(E, "roto"),
  errores: L.en(E, "errores"),
  van: L.en(E, "van"),
  pasar: L.en(E, "pasar,"),
  saber: L.en(E, "saber"),
  leerlos: L.en(E, "leerlos"),
  evita: L.en(E, "evita"),
  medias: L.en(E, "medias."),
  fin: L.fin(E),
});

const FAN = [
  { x: 470, y: 1890, rot: -5, num: "401" },
  { x: 560, y: 2015, rot: 3, num: "429" },
  { x: 500, y: 2140, rot: -2, num: "529" },
];

export const Gancho: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1060, z: 1.0 },
    { t: T.claude - 0.2, x: 560, y: 1030, z: 1.06, d: 0.9 },
    { t: T.sale - 0.05, x: 540, y: 1070, z: 1.14, d: 0.45 },
    { t: T.respira - 0.1, x: 540, y: 1060, z: 0.98, d: 1.3 },
    { t: T.errores - 0.25, x: 540, y: 2060, z: 1.0, d: 0.9 },
    { t: T.leerlos - 0.1, x: 540, y: 2030, z: 1.1, d: 0.9 },
    { t: T.evita - 0.1, x: 540, y: 2270, z: 1.0, d: 0.9 },
  ];
  // sacudida al caer el aviso
  const k = t - (T.sale + 0.22);
  const sac = k > 0 ? Math.exp(-k * 7) : 0;
  const jx = Math.sin(k * 61) * 16 * sac;
  const jy = Math.cos(k * 47) * 10 * sac;
  // editor
  const lineas = 1 + 9 * ramp(t, desde, T.sale, (x) => x);
  const atenua = ramp(t, T.sale, T.sale + 0.3);
  // aviso principal
  const cae = sp(t, T.sale, { damping: 12, stiffness: 170 });
  const aleja = ramp(t, T.respira, T.respira + 0.8, EASE);
  const fueraA = T.errores - 0.2;
  // respiración: inspira y suelta una vez
  const resp = Math.sin(clamp01((t - T.respira) / 1.9) * Math.PI);
  // lupa
  const lupa = ramp(t, T.saber - 0.1, T.leerlos + 1.2, EASE);
  const lx = 260 + 520 * lupa;
  const ly = 1830 + 330 * lupa;
  // barra del proyecto
  const vB = vis(t, T.evita - 0.15, Infinity, 0.8);
  const llena = 0.5 + 0.5 * ramp(t, T.medias + 0.05, T.medias + 0.55, EASE_OUT);
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${jx}px, ${jy}px)` }}>
        {/* ── editor con Claude Code ── */}
        <div style={{ position: "absolute", left: 70, top: 760, opacity: (1 - 0.55 * atenua) * (1 - ramp(t, fueraA - 0.3, fueraA)), transform: `scale(${1 - 0.04 * aleja})` }}>
          <Editor w={940} h={600} t={t} lineas={lineas} logo={ep.logos.vscode} />
        </div>
        <Logo src={ep.logos.claude_code} x={930} y={730} w={150} t={t} at={T.claude - 0.1} out={fueraA} pulsos={[T.claude + 0.4]} />
        <Etiqueta texto="CLAUDE CODE TRABAJANDO" x={540} y={1430} t={t} at={T.claude + 0.1} out={T.sale + 0.1} size={34} variante="gris" />

        {/* ── el aviso ── */}
        {t > T.sale - 0.05 && t < fueraA + 0.1 && (
          <div style={{ position: "absolute", left: 540, top: 1060, width: 0, height: 0, opacity: Math.min(1, cae * 3) * (1 - 0.65 * aleja) * (1 - ramp(t, fueraA - 0.3, fueraA)) }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${(1 - cae) * -520}px) scale(${(1 - 0.3 * aleja) * (0.9 + 0.1 * cae)}) rotate(${(1 - cae) * -6}deg)` }}>
              <AvisoError w={900} t={t} />
            </div>
          </div>
        )}
        <Etiqueta texto="¿UN NÚMERO?" x={540} y={1300} t={t} at={T.numero} out={T.respira + 0.2} size={44} variante="acento" fuente="titulo" />

        {/* ── respira ── */}
        {resp > 0 && (
          <div style={{ position: "absolute", left: 540, top: 1060, width: 0, height: 0 }}>
            {[1, 0.7].map((f, i) => (
              <div key={i} style={{ position: "absolute", left: -330 * f, top: -330 * f, width: 660 * f, height: 660 * f, borderRadius: "50%", border: `${8 - 3 * i}px solid ${C.acento}`, opacity: resp * (0.85 - 0.4 * i), transform: `scale(${0.35 + 0.65 * resp})`, boxShadow: `0 0 60px ${C.acento}55` }} />
            ))}
          </div>
        )}
        <Etiqueta texto="RESPIRA" x={540} y={1060} t={t} at={T.respira + 0.05} out={T.roto - 0.1} size={70} variante="texto" fuente="titulo" />
        <Sello texto="NO HAS ROTO NADA" x={540} y={1060} t={t} at={T.roto} out={fueraA} size={66} rot={-4} />

        {/* ── los errores van a pasar ── */}
        {FAN.map((f, i) => {
          const at = [T.errores, T.van, T.pasar][i];
          const s = sp(t, at, { damping: 12, stiffness: 190 });
          if (s <= 0) return null;
          const enf = ramp(t, T.leerlos - 0.1 + i * 0.32, T.leerlos + 0.2 + i * 0.32);
          return (
            <div key={i} style={{ position: "absolute", left: f.x, top: f.y, width: 0, height: 0, opacity: Math.min(1, s * 2) * (1 - 0.6 * ramp(t, T.evita, T.evita + 0.4)) }}>
              <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${(1 - s) * -200}px) rotate(${f.rot}deg) scale(${0.85 + 0.15 * s})` }}>
                <AvisoError w={720} t={t} numero={f.num} enfoque={enf} seed={i * 5} />
              </div>
            </div>
          );
        })}
        <Etiqueta texto="VAN A PASAR" x={540} y={1700} t={t} at={T.pasar} out={T.saber + 0.2} size={40} variante="borde" fuente="titulo" />
        <Etiqueta texto="SABER LEERLOS" x={540} y={1700} t={t} at={T.saber + 0.1} out={T.evita - 0.1} size={40} variante="acento" fuente="titulo" />
        {t > T.saber - 0.15 && t < T.evita + 0.5 && (
          <div style={{ position: "absolute", left: lx - 110, top: ly - 110, opacity: clamp01((t - T.saber + 0.15) / 0.2) * (1 - ramp(t, T.evita, T.evita + 0.4)), filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.6))" }}>
            <div style={{ position: "absolute", left: 18, top: 18, width: 150, height: 150, borderRadius: "50%", background: "rgba(240,169,137,0.16)", border: `4px solid ${C.acento}` }} />
            <IcoLupa s={230} />
          </div>
        )}

        {/* ── no lo dejes a medias ── */}
        {vB.on && (
          <div style={{ position: "absolute", left: 130, top: 2350, width: 820, opacity: vB.opacity, transform: `translateY(${vB.y}px) scale(${vB.scale})` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto }}>TU PROYECTO</div>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 36, color: llena > 0.99 ? C.acento : C.gris }}>{Math.round(llena * 100)} %</div>
            </div>
            <div style={{ height: 46, borderRadius: 23, background: C.panel2, border: `3px solid ${C.borde}`, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${llena * 100}%`, background: C.acento, boxShadow: `0 0 30px ${C.acento}` }} />
            </div>
            <div style={{ position: "absolute", left: 360, top: 130, fontFamily: TITULO, fontWeight: 800, fontSize: 34, color: C.gris, opacity: 1 - ramp(t, T.medias, T.medias + 0.3) }}>A MEDIAS</div>
            {t > T.medias + 0.5 && (
              <div style={{ position: "absolute", left: 840, top: 52 }}>
                <Check s={86} p={sp(t, T.medias + 0.5, { damping: 10, stiffness: 220 })} />
              </div>
            )}
          </div>
        )}
      </div>
    </Escena>
  );
};

export const eventosGancho = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.claude - 0.1, sfx: "pop", vol: 0.4 },
    { t: T.sale - 0.15, sfx: "whoosh", vol: 0.35 },
    { t: T.sale + 0.2, sfx: "golpe", vol: 0.55 },
    { t: T.respira, sfx: "whoosh", vol: 0.22 },
    { t: T.roto + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.errores, sfx: "pop", vol: 0.35 },
    { t: T.van, sfx: "pop", vol: 0.35 },
    { t: T.pasar, sfx: "pop", vol: 0.35 },
    { t: T.saber, sfx: "whoosh", vol: 0.25 },
    { t: T.medias + 0.5, sfx: "tick", vol: 0.5 },
  ];
};
