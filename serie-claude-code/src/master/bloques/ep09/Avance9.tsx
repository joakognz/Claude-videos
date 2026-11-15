/**
 * EP.9 · Avance (escena avance), para las dos partes.
 * Parte 1: PARTE 2/2 · LAS POTENTES y tres discos (ayudantes, conexiones, desde el móvil) al nombrarlos.
 * Parte 2: la rejilla marca el EP.9 hecho y el EP.10 late → EP.10 · EL MAPA COMPLETO.
 * Al final, el perfil con el logo de AIgencyx Labs (archivo del usuario) y el botón Seguir → Siguiendo.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Rejilla } from "../../componentes/Rejilla";
import { Etiqueta } from "../../componentes/Sello";
import { Disco, IcoAyudantes, IcoEnchufe, IcoMovil, Pos } from "../../componentes/ep09/Piezas9";
import { C, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps, EpisodioMaster } from "../../tipos";

const E = "avance";
const G = { cx: 540, cy: 820, celda: 54, hueco: 12, cols: 10, filas: 5 };

const tiempos = (L: Linea, ep: EpisodioMaster) => {
  const sigueme = L.en(E, "Sígueme");
  if ((ep.parte?.n ?? 1) === 1)
    return { primera: L.en(E, "segunda"), titulo: L.en(E, "potentes:"), a: L.en(E, "ayudantes"), b: L.en(E, "conexiones"), c: L.en(E, "móvil."), sigueme };
  return { primera: L.en(E, "siguiente"), titulo: L.en(E, "mapa"), a: L.en(E, "episodio,"), b: L.en(E, "completo"), c: L.en(E, "Code."), sigueme };
};

/** Perfil de la cuenta con el botón Seguir. */
const Perfil: React.FC<{ t: number; at: number; pulsa: number; logo: string; handle: string; y: number }> = ({ t, at, pulsa, logo, handle, y }) => {
  const v = vis(t, at, Infinity, 0.8);
  if (!v.on) return null;
  const hund = Math.sin(clamp01((t - pulsa + 0.08) / 0.2) * Math.PI) * 0.08;
  const siguiendo = ramp(t, pulsa + 0.05, pulsa + 0.25);
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: y, width: 0, height: 0, opacity: v.opacity }}>
        <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 24, padding: "20px 22px 20px 20px", borderRadius: 999, background: C.panel, border: `3px solid ${C.borde}`, whiteSpace: "nowrap", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ width: 104, height: 104, borderRadius: "50%", overflow: "hidden", border: `4px solid ${C.acento}` }}>
            <Img src={staticFile(logo)} style={{ width: 104, height: 104 }} />
          </div>
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.texto }}>{handle}</div>
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
      {t > pulsa - 0.5 && t < pulsa + 0.6 && (
        <div style={{ position: "absolute", left: 790, top: y + 10, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: `5px solid ${C.acento}`, opacity: Math.min(clamp01((t - pulsa + 0.5) / 0.2), 1 - clamp01((t - pulsa - 0.3) / 0.3)), transform: `translate(${(1 - clamp01((t - pulsa + 0.5) / 0.4)) * 110}px, ${(1 - clamp01((t - pulsa + 0.5) / 0.4)) * 80}px) scale(${1 - 0.25 * Math.sin(clamp01((t - pulsa) / 0.2) * Math.PI)})` }} />
      )}
    </>
  );
};

export const Avance9: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L, ep);
  const parte1 = (ep.parte?.n ?? 1) === 1;
  const pulsa = T.sigueme + 0.45;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1020, z: 1.02 },
    { t: T.primera, x: 540, y: 1060, z: 1.0, d: 1.0 },
    { t: T.sigueme - 0.3, x: 540, y: 1150, z: 1.0, d: 1.0 },
  ];
  const logoPerfil = ep.logos.aigencyx ?? ep.logos.claude_code;
  if (parte1) {
    const discos = [
      { at: T.a, x: 220, txt: "AYUDANTES", Ico: IcoAyudantes },
      { at: T.b, x: 540, txt: "CONEXIONES", Ico: IcoEnchufe },
      { at: T.c - 0.3, x: 860, txt: "DESDE EL MÓVIL", Ico: IcoMovil },
    ];
    const llena = ramp(t, T.primera, T.primera + 0.6);
    return (
      <Escena t={t} tomas={tomas}>
        <Pos x={540} y={800} t={t} at={desde - 0.1}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 96, color: C.texto }}>
              PARTE <span style={{ color: C.acento }}>2</span>
              <span style={{ color: C.tenue }}>/2</span>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              {[1, llena].map((f, k) => (
                <div key={k} style={{ width: 240, height: 24, borderRadius: 12, background: C.panel2, border: `3px solid ${C.borde}`, overflow: "hidden" }}>
                  <div style={{ width: `${f * 100}%`, height: "100%", background: k === 0 ? C.tenue : C.acento, boxShadow: k === 1 ? `0 0 ${10 + 10 * Math.sin(t * 6)}px ${C.acento}` : "none" }} />
                </div>
              ))}
            </div>
          </div>
        </Pos>
        <Etiqueta texto="LAS POTENTES" x={540} y={1010} t={t} at={T.titulo - 0.05} size={66} variante="acento" fuente="titulo" />
        {discos.map((d) => (
          <React.Fragment key={d.txt}>
            <Pos x={d.x} y={1230} t={t} at={d.at - 0.05}>
              <Disco s={170} activo={1}>
                <d.Ico s={92} color={C.acento} grosor={2.2} />
              </Disco>
            </Pos>
            <Etiqueta texto={d.txt} x={d.x} y={1370} t={t} at={d.at} size={30} variante="texto" fuente="titulo" />
          </React.Fragment>
        ))}
        <Perfil t={t} at={T.sigueme - 0.15} pulsa={pulsa} logo={logoPerfil} handle={ep.handle} y={1560} />
      </Escena>
    );
  }
  const sig = ep.siguiente_episodio;
  return (
    <Escena t={t} tomas={tomas}>
      <Rejilla
        g={G}
        total={ep.total}
        estado={(n) => {
          const e = sp(t, desde - 0.25 + ((n - 1) % 10) * 0.015, { damping: 14, stiffness: 180 });
          const hecho = n === ep.episodio ? ramp(t, T.primera - 0.1, T.primera + 0.25) : 0;
          const late = n === sig && t > T.a - 0.1 ? 0.14 * Math.abs(Math.sin((t - T.a + 0.1) * 6)) : 0;
          return {
            opacity: Math.min(1, e * 2),
            escala: 0.7 + 0.3 * e,
            encendida: n <= ep.episodio ? 1 : 0,
            latido: late + (n === ep.episodio ? Math.sin(Math.min(1, hecho) * Math.PI) * 0.25 : 0),
            contorno: n === sig ? ramp(t, T.a - 0.1, T.a + 0.1) : 0,
            check: n < ep.episodio ? 1 : n === ep.episodio ? hecho : 0,
          };
        }}
      />
      <Etiqueta texto={`EP.${sig}`} x={540} y={1120} t={t} at={T.a} size={86} variante="texto" fuente="titulo" />
      <Etiqueta texto={ep.avance?.titulo ?? "PRÓXIMAMENTE"} x={540} y={1235} t={t} at={T.titulo - 0.05} size={58} variante="acento" fuente="titulo" />
      {ep.avance?.subtitulo && <Etiqueta texto={ep.avance.subtitulo} x={540} y={1330} t={t} at={T.c} size={34} variante="gris" fuente="titulo" />}
      <Perfil t={t} at={T.sigueme - 0.15} pulsa={pulsa} logo={logoPerfil} handle={ep.handle} y={1490} />
    </Escena>
  );
};

export const eventosAvance9 = (L: Linea, ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L, ep);
  return [
    { t: T.primera, sfx: "tick", vol: 0.45 },
    { t: T.titulo - 0.05, sfx: "golpe", vol: 0.4 },
    { t: T.a, sfx: "pop", vol: 0.35 },
    { t: T.b, sfx: "pop", vol: 0.35 },
    { t: T.c, sfx: "pop", vol: 0.35 },
    { t: T.sigueme - 0.15, sfx: "whoosh", vol: 0.25 },
    { t: T.sigueme + 0.45, sfx: "tick", vol: 0.55 },
  ];
};
