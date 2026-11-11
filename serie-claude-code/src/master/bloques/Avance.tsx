/**
 * Avance (escena avance): tarjeta con candado que se abre. Cae el sello «PARTE N» (o «EP.N»), el candado se abre y
 * dentro aparece el icono (moneda que gira y se calma), el título y los puntos que dice la voz.
 * Con "tipo": "episodio" (último reel de un episodio): sello «EP.N», la rejilla de la serie dentro de la tarjeta con la
 * casilla del episodio siguiente que se enciende al abrirse, el icono «corazon» (la mascota de Claude Code con latido),
 * título en dos líneas si es largo y hasta tres puntos.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Candado, Moneda } from "../componentes/Iconos";
import { Rejilla } from "../componentes/Rejilla";
import { Sello } from "../componentes/Sello";
import { Chip, Tarjeta } from "../componentes/Tarjeta";
import { C, TITULO, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const tiempos = (L: Linea, ep: EpisodioMaster, e: string) => {
  const av = ep.avance!;
  const num = String(av.tipo === "parte" ? av.parte : av.episodio);
  const sello = (() => {
    if (av.en) return L.en(e, av.en);
    try {
      return L.en(e, num);
    } catch {
      return L.ini(e) + 0.4;
    }
  })();
  const pal = L.palabras.filter((p) => p.escena === e);
  // el candado se abre con la primera palabra que sigue al sello (o a la frase del sello)
  const trasSello = av.en ? L.finDe(e, av.en) + 0.05 : sello + 0.15;
  const abre = pal.find((p) => p.inicio > trasSello)?.inicio ?? sello + 0.4;
  return {
    ini: L.ini(e),
    sello,
    abre,
    titulo: av.titulo_en ? L.en(e, av.titulo_en) : Math.min(...(av.puntos ?? []).map((p) => L.en(e, p.en))) - 0.7,
    puntos: (av.puntos ?? []).map((p) => L.en(e, p.en)),
    fin: L.fin(e),
  };
};

const CARD = { x: 540, y: 1180, w: 800, h: 860 };

export const Avance: React.FC<BloqueProps> = (props) => (props.ep.avance?.tipo === "episodio" ? <AvanceEpisodio {...props} /> : <AvanceParte {...props} />);

const AvanceParte: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta, escenas }) => {
  const av = ep.avance!;
  const T = tiempos(L, ep, escenas[0]);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1140, z: 0.94 },
    { t: T.abre - 0.1, x: 540, y: 1180, z: 1.0, d: 0.8 },
    { t: T.puntos[0] - 0.2, x: 540, y: 1260, z: 1.06, d: 0.9 },
  ];
  const abierto = ramp(t, T.abre, T.abre + 0.35);
  const fueraCandado = ramp(t, T.abre + 0.35, T.abre + 0.7);
  const revela = sp(t, T.abre + 0.45, { damping: 13, stiffness: 160 });
  // moneda: gira rápido al aparecer y se calma
  const tm = Math.max(0, t - (T.abre + 0.45));
  const giro = 6 * Math.PI * (1 - Math.exp(-tm * 1.2));
  const sello = av.tipo === "parte" ? `PARTE ${av.parte}` : `EP.${av.episodio}`;
  return (
    <Escena t={t} tomas={tomas}>
      <Tarjeta x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} t={t} at={T.ini - 0.15} out={hasta} activa={revela} desde="escala">
        {/* contenido que aparece al abrirse */}
        {revela > 0.001 && (
          <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, revela * 1.5) }}>
            <div style={{ position: "absolute", left: CARD.w / 2 - 140, top: 150, width: 280, height: 280, transform: `scale(${0.4 + 0.6 * revela})` }}>
              <Moneda s={280} giro={giro} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 92, color: C.texto, letterSpacing: 1, opacity: ramp(t, T.titulo, T.titulo + 0.3), transform: `translateY(${(1 - ramp(t, T.titulo, T.titulo + 0.4)) * 30}px)` }}>
              {av.titulo.toUpperCase()}
            </div>
          </div>
        )}
        {/* candado */}
        {fueraCandado < 1 && (
          <div style={{ position: "absolute", left: CARD.w / 2 - 120, top: CARD.h / 2 - 170, width: 240, height: 240, opacity: 1 - fueraCandado, transform: `translateY(${fueraCandado * -120}px) scale(${1 + 0.1 * Math.sin(abierto * Math.PI)})` }}>
            <Candado s={240} abierto={abierto} c={C.acento} />
          </div>
        )}
      </Tarjeta>
      <Sello texto={sello} x={CARD.x} y={CARD.y - CARD.h / 2 - 10} t={t} at={T.sello - 0.03} out={hasta} size={84} rot={-4} />
      {(av.puntos ?? []).map((p, i) => (
        <Chip key={i} texto={p.texto} x={CARD.x} y={CARD.y + 220 + i * 112} t={t} at={T.puntos[i] - 0.05} out={hasta} size={44} on={0} variante="borde" />
      ))}
    </Escena>
  );
};

/** Partir un título largo en dos líneas por la palabra central. */
const dosLineas = (txt: string) => {
  const w = txt.split(" ");
  if (txt.length <= 14 || w.length < 2) return [txt];
  let mejor = 1;
  for (let k = 1; k < w.length; k++) if (Math.abs(w.slice(0, k).join(" ").length - w.slice(k).join(" ").length) < Math.abs(w.slice(0, mejor).join(" ").length - w.slice(mejor).join(" ").length)) mejor = k;
  return [w.slice(0, mejor).join(" "), w.slice(mejor).join(" ")];
};

const CARD_EP = { x: 540, y: 1130, w: 860, h: 900 };

/** Avance al episodio siguiente: rejilla con la casilla nueva, mascota con latido, título y puntos. */
const AvanceEpisodio: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta, escenas }) => {
  const av = ep.avance!;
  const T = tiempos(L, ep, escenas[0]);
  const top = CARD_EP.y - CARD_EP.h / 2;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1110, z: 0.93 },
    { t: T.abre - 0.1, x: 540, y: 1120, z: 0.96, d: 0.8 },
    { t: T.puntos[0] - 0.3, x: 540, y: 1190, z: 1.0, d: 1.0 },
  ];
  const abierto = ramp(t, T.abre, T.abre + 0.35);
  const fueraCandado = ramp(t, T.abre + 0.35, T.abre + 0.7);
  const revela = sp(t, T.abre + 0.45, { damping: 13, stiffness: 160 });
  const nuevo = av.episodio ?? ep.episodio + 1;
  const enciende = clamp01((t - (T.abre + 0.2)) / 0.3);
  // latido (corazón): dos pulsos seguidos cada 1,1 s
  const fase = Math.max(0, t - (T.titulo - 0.1)) % 1.1;
  const latido = t > T.titulo - 0.1 ? Math.exp(-((fase - 0.08) ** 2) / 0.003) * 0.09 + Math.exp(-((fase - 0.3) ** 2) / 0.003) * 0.06 : 0;
  const titulo = dosLineas(av.titulo.toUpperCase());
  return (
    <Escena t={t} tomas={tomas}>
      <Tarjeta x={CARD_EP.x} y={CARD_EP.y} w={CARD_EP.w} h={CARD_EP.h} t={t} at={T.ini - 0.15} out={hasta} activa={revela} desde="escala" />
      {/* la rejilla de la serie, dentro de la tarjeta: se enciende la casilla del episodio siguiente */}
      {(() => {
        const v = vis(t, T.ini, hasta, 0.9);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: v.opacity }}>
            <Rejilla g={{ cx: 540, cy: top + 95, celda: 24, hueco: 6, cols: 25, filas: 2 }} total={ep.total} estado={(n) => ({ opacity: 1, escala: 1, encendida: n < nuevo ? 1 : n === nuevo ? enciende : 0, latido: n === nuevo ? Math.sin(clamp01((t - T.abre - 0.2) / 0.45) * Math.PI) * 0.6 : 0, contorno: n === nuevo && enciende < 1 ? 0.8 : 0, check: 0 })} />
          </div>
        );
      })()}
      {/* candado */}
      {fueraCandado < 1 && t > T.ini - 0.15 && (
        <div style={{ position: "absolute", left: CARD_EP.x - 120, top: CARD_EP.y - 110, width: 240, height: 240, opacity: (1 - fueraCandado) * ramp(t, T.ini - 0.15, T.ini + 0.2), transform: `translateY(${fueraCandado * -120}px) scale(${1 + 0.1 * Math.sin(abierto * Math.PI)})` }}>
          <Candado s={240} abierto={abierto} c={C.acento} />
        </div>
      )}
      {/* contenido */}
      {revela > 0.001 && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: Math.min(1, revela * 1.5) * (1 - ramp(t, hasta - 0.35, hasta)) }}>
          <div style={{ position: "absolute", left: 540 - 105, top: top + 290 - 105, width: 210, height: 210, borderRadius: "50%", background: C.fondo, border: `6px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(0.5 + 0.5 * revela) * (1 + latido)})`, boxShadow: `0 0 ${40 + 300 * latido}px ${C.acento}88` }}>
            {av.icono === "moneda" ? <Moneda s={150} giro={0} /> : <Img src={staticFile(ep.logos.claude_code)} style={{ width: 140 }} />}
          </div>
          {/* onda del latido */}
          {t > T.titulo - 0.1 && <div style={{ position: "absolute", left: 540 - 105 - 60 * (fase / 1.1), top: top + 290 - 105 - 60 * (fase / 1.1), width: 210 + 120 * (fase / 1.1), height: 210 + 120 * (fase / 1.1), borderRadius: "50%", border: `4px solid ${C.acento}`, opacity: 0.7 * (1 - fase / 1.1) }} />}
          <div style={{ position: "absolute", left: 540, top: top + 490, width: 0, height: 0, opacity: ramp(t, T.titulo, T.titulo + 0.3) }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${(1 - ramp(t, T.titulo, T.titulo + 0.4)) * 30}px)`, textAlign: "center", whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 66, lineHeight: 1.08, color: C.texto }}>
              {titulo.map((ln, i) => (
                <div key={i}>{ln}</div>
              ))}
            </div>
          </div>
        </div>
      )}
      <Sello texto={`EP.${nuevo}`} x={CARD_EP.x} y={top - 6} t={t} at={T.sello - 0.03} out={hasta} size={84} rot={-4} />
      {(av.puntos ?? []).map((p, i) => (
        <Chip key={i} texto={p.texto} x={CARD_EP.x} y={top + 650 + i * 92} t={t} at={T.puntos[i] - 0.05} out={hasta} size={40} variante="borde" />
      ))}
    </Escena>
  );
};

export const eventosAvance = (L: Linea, ep: EpisodioMaster, _b: unknown, escenas: string[]): Evento[] => {
  if (!ep.avance) return [];
  const T = tiempos(L, ep, escenas[0]);
  return [
    { t: T.sello + 0.07, sfx: "golpe", vol: 0.6 },
    { t: T.abre, sfx: "tick", vol: 0.45 },
    { t: T.abre + 0.45, sfx: "whoosh", vol: 0.3 },
    ...T.puntos.map((p) => ({ t: p, sfx: "pop" as const, vol: 0.35 })),
  ];
};
