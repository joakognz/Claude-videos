/**
 * Bloque «Cierre» (escenas cta → cta2 → avance → seguir): la pregunta palabra a palabra con el esquema del episodio
 * (imagen del usuario) y el logo de Drive → la palabra clave se escribe y se envía → sello de la auditoría → la
 * rejilla marca el episodio de hoy y se abre la tarjeta del siguiente → perfil con el logo del usuario y «Seguir».
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Check, pulso } from "../componentes/Interfaz";
import { Logo } from "../componentes/Logo";
import { GEO_REJILLA, Rejilla, posCasilla } from "../componentes/Rejilla";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, MONO, TITULO, UI, clamp01, norm, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const G = { ...GEO_REJILLA, cy: 2330 };
const PY = 3080; // tarjeta del perfil (borde superior)

const tiempos = (L: Linea, ep: EpisodioMaster) => {
  const pal = L.palabras.filter((p) => p.escena === "cta");
  const nPregunta = ep.cta.pregunta.split(/\s+/).length;
  const finClave = L.finDe("cta", ep.cta.palabra_clave);
  const sigueme = L.ini("seguir");
  return {
    pregunta: pal.slice(0, nPregunta),
    esquemas: L.en("cta", "esquemas"),
    comenta: L.en("cta", "Comenta"),
    clave: L.en("cta", ep.cta.palabra_clave),
    finClave,
    envia: finClave + 0.12,
    enlace: L.en("cta", "enlace"),
    y: L.ini("cta2"),
    negocio: L.en("cta2", "negocio"),
    sello: L.en("cta2", ep.cta.sello?.en ?? "auditoría"),
    remate: L.en("cta2", ep.cta.remate?.en ?? "optimizar"),
    en: L.ini("avance"),
    siguiente: L.en("avance", "siguiente"),
    errores: L.en("avance", "los"),
    como: L.en("avance", "cómo"),
    sigueme,
    pulsa: sigueme + 0.45,
    fin: L.fin("seguir"),
  };
};

export const Cierre: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L, ep);
  const sig = ep.siguiente_episodio;
  const c8 = posCasilla(G, sig);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 1.0 },
    { t: T.esquemas - 0.2, x: 540, y: 1160, z: 1.03, d: 0.9 },
    { t: T.comenta - 0.3, x: 540, y: 1200, z: 1.04, d: 0.9 },
    { t: T.y - 0.3, x: 540, y: 1290, z: 0.98, d: 0.9 },
    { t: T.en - 0.35, x: 540, y: G.cy, z: 1.0, d: 1.0 },
    { t: T.errores - 0.35, x: 540, y: G.cy + 30, z: 1.06, d: 0.9 },
    { t: T.sigueme - 0.4, x: 540, y: PY + 250, z: 0.96, d: 1.0 },
    { t: T.pulsa + 0.3, x: 540, y: PY + 280, z: 1.03, d: 1.6 },
  ];
  const fueraA = T.en - 0.15;
  const clave = ep.cta.palabra_clave;
  const nLetras = Math.round(clamp01((t - T.clave) / Math.max(0.3, T.finClave - T.clave)) * clave.length);
  const enviado = sp(t, T.envia, { damping: 15, stiffness: 160 });
  const tarjeta = T.errores - 0.25; // se abre la tarjeta del episodio siguiente
  const fueraB = T.sigueme - 0.15;
  const pulsado = t > T.pulsa;
  const hund = pulso(t, T.pulsa - 0.08, 0.2) * 0.08;
  const siguiendo = ramp(t, T.pulsa + 0.05, T.pulsa + 0.25);
  const mitad = Math.ceil(T.pregunta.length / 2);
  return (
    <Escena t={t} tomas={tomas}>
      {/* pregunta */}
      <div style={{ position: "absolute", left: 540, top: 800, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 72, lineHeight: 1.12, letterSpacing: -1.5, color: C.texto, whiteSpace: "nowrap", opacity: 1 - ramp(t, T.y - 0.4, T.y - 0.05) }}>
          {[T.pregunta.slice(0, mitad), T.pregunta.slice(mitad)].map((ln, i) => (
            <div key={i}>
              {ln.map((p, k) => {
                const s = sp(t, p.inicio - 0.04, { damping: 13, stiffness: 220 });
                return (
                  <span key={k} style={{ display: "inline-block", marginRight: 20, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 40}px) scale(${0.8 + 0.2 * s})`, color: norm(p.texto) === "esquemas" ? C.acento : C.texto }}>
                    {p.texto}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* el esquema del episodio (imagen del usuario) y dónde está */}
      {ep.imagenes?.esquema &&
        (() => {
          const v = vis(t, T.esquemas - 0.05, fueraA, 0.5);
          if (!v.on) return null;
          return (
            <div style={{ position: "absolute", left: 300, top: 1210, width: 0, height: 0 }}>
              <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale * (1 + 0.04 * pulso(t, T.enlace, 0.5))}) rotate(${-6 + (1 - v.s) * -10}deg)`, opacity: v.opacity, borderRadius: 18, overflow: "hidden", boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 5px ${C.acento}` }}>
                <Img src={staticFile(ep.imagenes.esquema)} style={{ width: 372, display: "block" }} />
              </div>
            </div>
          );
        })()}
      <Logo src={ep.logos.drive} x={455} y={1455} w={118} t={t} at={T.esquemas + 0.3} out={fueraA} ficha="circulo" pulsos={[T.enlace]} />
      {/* comentario: se escribe la palabra clave y se envía */}
      {(() => {
        const v = vis(t, T.comenta - 0.05, fueraA, 0.8);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 1150, width: 470, height: 116, boxSizing: "border-box", opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", padding: "0 12px 0 30px", borderRadius: 58, background: C.panel2, border: `3px solid ${nLetras > 0 && enviado < 0.5 ? C.acento : C.borde}` }}>
            <div style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.acento, letterSpacing: 2, whiteSpace: "nowrap", opacity: 1 - enviado }}>
              {clave.slice(0, nLetras)}
              {enviado < 0.2 && <span style={{ display: "inline-block", width: 5, height: 46, marginLeft: 4, verticalAlign: "middle", background: C.texto, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
            </div>
            <div style={{ width: 88, height: 88, borderRadius: "50%", background: nLetras === clave.length ? C.acento : C.tenue, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * pulso(t, T.envia - 0.1, 0.2)})` }}>
              <svg width={44} height={44} viewBox="0 0 24 24"><path d="M3 11.5 L21 3 L13.5 21 L11 13 Z" fill={C.oscuro} /></svg>
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="COMENTA" x={775} y={1095} t={t} at={T.comenta - 0.05} out={fueraA} size={34} variante="gris" fuente="titulo" />
      {t > T.envia && (
        <div style={{ position: "absolute", left: 775, top: 1208, width: 0, height: 0, opacity: Math.min(1, enviado * 2) * (1 - ramp(t, fueraA - 0.35, fueraA)) }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${126 * enviado}px) scale(${0.6 + 0.4 * enviado})`, display: "flex", alignItems: "center", gap: 14, padding: "16px 28px", borderRadius: 999, background: C.acento, boxShadow: `0 16px 50px ${C.acento}66`, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.oscuro, letterSpacing: 2 }}>{clave}</span>
            <Check size={40} p={(t - T.envia - 0.15) / 0.3} color={C.oscuro} />
          </div>
        </div>
      )}
      <Etiqueta texto="Y TE PASO EL ENLACE" x={775} y={1470} t={t} at={T.enlace - 0.3} out={fueraA} size={34} variante="borde" fuente="titulo" />
      {/* auditoría para tu negocio */}
      {ep.cta.sello && <Sello texto={ep.cta.sello.texto} x={540} y={1612} t={t} at={T.sello} out={fueraA} size={50} rot={-3} />}
      {ep.cta.remate && <Etiqueta texto={ep.cta.remate.texto} x={540} y={1716} t={t} at={T.remate - 0.05} out={fueraA} size={50} variante="texto" fuente="titulo" />}

      {/* avance: la rejilla marca el episodio de hoy y se abre el siguiente */}
      <Rejilla
        g={G}
        total={ep.total}
        estado={(n) => {
          const e = sp(t, T.en - 0.3 + ((n - 1) % 10) * 0.015, { damping: 14, stiffness: 180 });
          const hecho = n === ep.episodio ? ramp(t, T.en + 0.1, T.en + 0.45) : 0;
          const late = n === sig && t > T.siguiente - 0.1 ? 0.12 * Math.abs(Math.sin((t - T.siguiente + 0.1) * 6)) : 0;
          return {
            opacity: Math.min(1, e * 2) * (1 - 0.82 * ramp(t, tarjeta, tarjeta + 0.3)) * (1 - ramp(t, fueraB - 0.35, fueraB)),
            escala: 0.7 + 0.3 * e,
            encendida: n <= ep.episodio ? 1 : 0,
            latido: late + (n === ep.episodio ? Math.sin(Math.min(1, hecho) * Math.PI) * 0.25 : 0),
            contorno: n === sig ? ramp(t, T.siguiente - 0.1, T.siguiente + 0.1) : 0,
            check: n <= ep.episodio ? (n === ep.episodio ? hecho : 1) : 0,
          };
        }}
      />
      <Etiqueta texto="EN EL SIGUIENTE" x={c8.x} y={c8.y - 82} t={t} at={T.siguiente - 0.1} out={tarjeta + 0.1} size={26} variante="acento" />
      {(() => {
        const v = vis(t, tarjeta, fueraB, 0.2);
        if (!v.on) return null;
        // la tarjeta sale de la casilla del episodio siguiente
        const dx = (c8.x - 540) * (1 - v.s);
        const dy = (c8.y - (G.cy + 30)) * (1 - v.s);
        return (
          <div style={{ position: "absolute", left: 90, top: G.cy + 30 - 300, width: 900, height: 600, boxSizing: "border-box", borderRadius: 48, background: C.panel, border: `4px solid ${C.acento}`, boxShadow: `0 40px 110px rgba(0,0,0,0.7), 0 0 60px ${C.acento}44`, opacity: v.opacity, transform: `translate(${dx}px, ${dy}px) scale(${v.scale})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 124, letterSpacing: -3, color: C.texto, lineHeight: 1 }}>EP.{sig}</div>
              <div style={{ padding: "10px 24px", borderRadius: 999, background: C.acento, fontFamily: TITULO, fontWeight: 800, fontSize: 30, letterSpacing: 1, color: C.oscuro }}>PRÓXIMAMENTE</div>
            </div>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 84, letterSpacing: -2, color: C.acento, lineHeight: 1.05, textAlign: "center", marginTop: 14, opacity: ramp(t, T.errores, T.errores + 0.2), transform: `translateY(${(1 - sp(t, T.errores, { damping: 13 })) * 30}px)` }}>{ep.avance?.titulo}</div>
            {ep.avance?.subtitulo && <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 52, color: C.texto, opacity: ramp(t, T.como - 0.1, T.como + 0.15), transform: `translateY(${(1 - sp(t, T.como - 0.1, { damping: 13 })) * 30}px)` }}>{ep.avance.subtitulo}</div>}
          </div>
        );
      })()}

      {/* seguir: tarjeta del perfil con el logo del usuario */}
      <Logo src={ep.logos.claude_code_texto} x={540} y={PY - 105} w={380} t={t} at={T.sigueme - 0.05} sombra={false} />
      {(() => {
        const v = vis(t, T.sigueme - 0.1, Infinity, 0.85);
        if (!v.on) return null;
        return <div style={{ position: "absolute", left: 90, top: PY, width: 900, height: 660, borderRadius: 48, background: C.panel, border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.55)", opacity: v.opacity, transform: `scale(${v.scale})` }} />;
      })()}
      {(() => {
        const v = vis(t, T.sigueme, Infinity, 0.5);
        if (!v.on) return null;
        const src = ep.logos.aigencyx ?? ep.logos.claude_code;
        return (
          <div style={{ position: "absolute", left: 540 - 105, top: PY + 50, width: 210, height: 210, borderRadius: "50%", overflow: "hidden", opacity: v.opacity, transform: `scale(${v.scale})`, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", background: C.fondo, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile(src)} style={ep.logos.aigencyx ? { width: 210, height: 210, objectFit: "cover" } : { width: 150 }} />
          </div>
        );
      })()}
      <Etiqueta texto={ep.handle} x={540} y={PY + 320} t={t} at={T.sigueme - 0.02} size={58} variante="texto" fuente="titulo" />
      <Etiqueta texto={ep.serie} x={540} y={PY + 392} t={t} at={T.sigueme + 0.05} size={36} variante="gris" />
      {(() => {
        const v = vis(t, T.sigueme + 0.1, Infinity, 0.8);
        if (!v.on) return null;
        const g = { cx: 540, cy: PY + 478, celda: 24, hueco: 7, cols: 25, filas: 2 };
        return (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: v.opacity }}>
            <Rejilla g={g} total={ep.total} estado={(n) => ({ opacity: 1, escala: 1, encendida: n <= ep.episodio ? 1 : 0, latido: 0, contorno: n === sig ? 0.6 : 0, check: 0 })} />
          </div>
        );
      })()}
      {(() => {
        const v = vis(t, T.sigueme + 0.15, Infinity, 0.7);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540 - 210, top: PY + 592 - 58, width: 420, height: 116, borderRadius: 999, boxSizing: "border-box", opacity: v.opacity, transform: `scale(${v.scale * (1 - hund)})`, background: siguiendo > 0.5 ? C.panel2 : C.acento, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: UI, fontWeight: 700, fontSize: 50, color: siguiendo > 0.5 ? C.texto : C.oscuro, boxShadow: pulsado ? "none" : `0 0 ${30 + 20 * Math.sin(t * 6)}px ${C.acento}88` }}>
            {siguiendo > 0.5 ? (
              <>
                Siguiendo
                <Check size={42} p={(t - T.pulsa - 0.2) / 0.3} />
              </>
            ) : (
              "Seguir"
            )}
          </div>
        );
      })()}
      {t > T.pulsa - 0.5 && t < T.pulsa + 0.6 && (
        <div style={{ position: "absolute", left: 640, top: PY + 612, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: `5px solid ${C.acento}`, opacity: Math.min(clamp01((t - T.pulsa + 0.5) / 0.2), 1 - clamp01((t - T.pulsa - 0.3) / 0.3)), transform: `translate(${(1 - clamp01((t - T.pulsa + 0.5) / 0.4)) * 120}px, ${(1 - clamp01((t - T.pulsa + 0.5) / 0.4)) * 90}px) scale(${1 - 0.25 * pulso(t, T.pulsa, 0.2)})` }} />
      )}
    </Escena>
  );
};

export const eventosCierre = (L: Linea, ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L, ep);
  return [
    { t: T.pregunta[0].inicio, sfx: "pop", vol: 0.4 },
    { t: T.esquemas, sfx: "whoosh", vol: 0.3 },
    { t: T.esquemas + 0.3, sfx: "pop", vol: 0.4 },
    { t: T.clave, sfx: "tecleo", vol: 0.3, dur: Math.max(0.3, T.finClave - T.clave) },
    { t: T.envia, sfx: "envio", vol: 0.5 },
    { t: T.enlace - 0.3, sfx: "pop", vol: 0.35 },
    { t: T.sello + 0.08, sfx: "golpe", vol: 0.6 },
    { t: T.en - 0.3, sfx: "whoosh", vol: 0.35 },
    { t: T.en + 0.15, sfx: "tick", vol: 0.5 },
    { t: T.errores - 0.25, sfx: "whoosh", vol: 0.35 },
    { t: T.errores, sfx: "golpe", vol: 0.5 },
    { t: T.sigueme - 0.35, sfx: "whoosh", vol: 0.3 },
    { t: T.pulsa, sfx: "tick", vol: 0.6 },
    { t: T.pulsa + 0.12, sfx: "pop", vol: 0.45 },
  ];
};
