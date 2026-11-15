/**
 * EP.9 · Parte 1 · PASO 4 «Los checkpoints» (escena guardado): tus mensajes sobre un camino y, antes de cada uno, una
 * bandera de guardado → la mascota de Claude Code (logo del usuario) recorre las banderas como en un videojuego:
 * PARTIDA GUARDADA → la web de la panadería se rompe → en el panel de Claude Code, el ratón sobre tu mensaje, el botón de
 * rebobinar y «Rewind code to here» → la web vuelve atrás pieza a pieza → NO PIERDES NADA → rejilla con el EP.7.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Cursor } from "../../componentes/Piezas";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { ChatClaude } from "../../componentes/ep09/Chat";
import { WebPanaderia } from "../../componentes/ep09/Panaderia";
import { Bandera, IcoRebobinar, MiniRejilla, Pos } from "../../componentes/ep09/Piezas9";
import { C, EASE, EASE_OUT, MONO, UI, clamp01, ramp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "guardado";
const tiempos = (L: Linea) => ({
  paso: L.en(E, "Paso"),
  checkpoints: L.en(E, "checkpoints."),
  antes: L.en(E, "Antes"),
  mensaje: L.en(E, "mensaje"),
  guarda: L.en(E, "guarda"),
  codigo: L.en(E, "código."),
  son: L.en(E, "Son"),
  puntos: L.en(E, "puntos"),
  videojuego: L.en(E, "videojuego."),
  si: L.en(E, "Si"),
  rompe: L.en(E, "rompe,"),
  pasa: L.en(E, "pasa"),
  raton: L.en(E, "ratón"),
  encima: L.en(E, "encima"),
  pulsa: L.en(E, "pulsa"),
  rebobinar: L.en(E, "rebobinar,"),
  vuelve: L.en(E, "vuelve"),
  punto: L.en(E, "punto."),
  no: L.en(E, "No"),
  nada: L.en(E, "nada."),
  te: L.en(E, "Te"),
  siete: L.en(E, "7."),
});

const XS = [230, 540, 850];
const LINEA_Y = 1270;
const WEB = { x: 540, y: 1860, w: 680 };
const CHAT = { x: 70, y: 2330, w: 940, h: 600 };

export const Guardado: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1060, z: 1.0 },
    { t: T.antes - 0.3, x: 540, y: 1140, z: 1.02, d: 0.8 },
    { t: T.si - 0.35, x: 540, y: 1880, z: 1.0, d: 0.8 },
    { t: T.pasa - 0.2, x: 560, y: 2600, z: 1.04, d: 0.8 },
    { t: T.vuelve - 0.25, x: 540, y: 1900, z: 1.0, d: 0.8 },
    { t: T.te - 0.3, x: 540, y: 2420, z: 1.0, d: 0.8 },
  ];
  const fueraCamino = T.si + 0.2;
  // la mascota recorre las banderas
  const anda = ramp(t, T.son, T.videojuego + 0.2, (x) => x);
  const mx = 110 + (XS[2] - 110) * anda;
  const salto = Math.abs(Math.sin(anda * Math.PI * 6)) * 34 * (anda > 0 && anda < 1 ? 1 : 0);
  // la web se rompe y vuelve
  const rota = ramp(t, T.rompe - 0.1, T.rompe + 0.35, EASE_OUT) * (1 - ramp(t, T.vuelve - 0.1, T.punto + 0.3, EASE));
  const vWeb = vis(t, T.si - 0.3, T.te + 0.1, 0.8);
  const vChat = vis(t, T.rompe + 0.1, T.no - 0.2, 0.85);
  // cursor hacia el botón de rebobinar del tercer mensaje
  const boton = { x: 950, y: 2600 };
  const ir = ramp(t, T.raton - 0.1, T.encima + 0.3, EASE);
  const ir2 = ramp(t, T.rebobinar + 0.1, T.rebobinar + 0.45, EASE);
  const cx = 640 + (boton.x - 640) * ir + (720 - boton.x) * ir2;
  const cy = 2840 + (boton.y - 2840) * ir + (2740 - boton.y) * ir2;
  const pulsa = Math.max(Math.sin(clamp01((t - T.rebobinar + 0.05) / 0.2) * Math.PI), Math.sin(clamp01((t - T.rebobinar - 0.5) / 0.2) * Math.PI));
  const rebobina = t > T.vuelve - 0.1 && t < T.punto + 0.4;
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 4" x={540} y={740} t={t} at={T.paso} out={T.antes + 0.2} size={60} rot={-5} />
      <Etiqueta texto="CHECKPOINTS" x={540} y={870} t={t} at={T.checkpoints - 0.05} out={T.son - 0.1} size={70} variante="texto" fuente="titulo" />

      {/* ── el camino con tus mensajes y las banderas ── */}
      {t > T.antes - 0.3 && t < fueraCamino + 0.1 && (
        <div style={{ position: "absolute", left: 110, top: LINEA_Y, width: 860 * ramp(t, T.antes - 0.3, T.antes + 0.4, EASE), height: 10, borderRadius: 5, background: C.borde, opacity: 1 - ramp(t, fueraCamino - 0.3, fueraCamino) }} />
      )}
      {XS.map((x, k) => (
        <React.Fragment key={k}>
          <Pos x={x} y={1090} t={t} at={T.antes + k * 0.35} out={fueraCamino}>
            <div style={{ padding: "14px 22px", borderRadius: 20, borderBottomLeftRadius: 4, background: "#2D2D30", border: `3px solid ${C.borde}`, fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.texto }}>Tú · {k + 1}</div>
          </Pos>
          <div style={{ position: "absolute", left: x - 34, top: LINEA_Y - 127, opacity: 1 - ramp(t, fueraCamino - 0.3, fueraCamino) }}>
            <Bandera t={t} at={T.guarda + k * 0.3} s={100} activa={anda * 3 > k ? 1 : 0.6} />
          </div>
        </React.Fragment>
      ))}
      <Etiqueta texto="GUARDA CÓMO ESTABA" x={540} y={1400} t={t} at={T.guarda} out={T.puntos} size={40} variante="acento" fuente="titulo" />
      {t > T.son - 0.2 && t < fueraCamino + 0.1 && (
        <div style={{ position: "absolute", left: mx - 75, top: LINEA_Y - 100 - salto, opacity: clamp01((t - T.son + 0.2) / 0.2) * (1 - ramp(t, fueraCamino - 0.3, fueraCamino)) }}>
          <Img src={staticFile(ep.logos.claude_code)} style={{ width: 150 }} />
        </div>
      )}
      <Pos x={540} y={1460} t={t} at={T.videojuego - 0.1} out={fueraCamino}>
        <div style={{ padding: "16px 30px", background: C.oscuro, border: `6px solid ${C.acento}`, boxShadow: `8px 8px 0 ${C.acento}55`, fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.acento, letterSpacing: 4 }}>PARTIDA GUARDADA ✓</div>
      </Pos>

      {/* ── algo se rompe ── */}
      {vWeb.on && (
        <div style={{ position: "absolute", left: WEB.x, top: WEB.y, width: 0, height: 0, opacity: vWeb.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vWeb.y}px) scale(${vWeb.scale}) translateX(${rota > 0.9 && t < T.pasa ? Math.sin(t * 60) * 6 : 0}px)` }}>
            <WebPanaderia w={WEB.w} t={t} whatsapp={1} logoWhatsapp={ep.logos.whatsapp} rota={rota} img={ep.imagenes!.panaderia} />
          </div>
        </div>
      )}
      <Etiqueta texto="SE ROMPE" x={540} y={1440} t={t} at={T.rompe} out={T.pasa + 0.2} size={48} variante="acento" fuente="titulo" />
      {rebobina && (
        <div style={{ position: "absolute", left: WEB.x - 70, top: WEB.y - 70, width: 140, height: 140, borderRadius: "50%", background: "rgba(11,13,18,0.85)", border: `5px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(clamp01((t - T.vuelve + 0.1) / 0.2), 1 - ramp(t, T.punto + 0.1, T.punto + 0.4)) }}>
          <IcoRebobinar s={80} color={C.acento} grosor={2.4} />
        </div>
      )}

      {/* ── el panel: rebobinar ── */}
      {vChat.on && (
        <div style={{ position: "absolute", left: CHAT.x, top: CHAT.y, opacity: vChat.opacity, transform: `translateY(${vChat.y}px) scale(${vChat.scale})` }}>
          <ChatClaude
            t={t} w={CHAT.w} h={CHAT.h} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code}
            rebobinar={{ indice: 2, hover: T.encima, pulsa: T.rebobinar, elige: T.rebobinar + 0.5, cierra: T.vuelve + 0.3 }}
            mensajes={[
              { tipo: "yo", at: 0, texto: "añade el botón de WhatsApp" },
              { tipo: "claude", at: 0, texto: "Hecho: botón añadido." },
              { tipo: "yo", at: 0, texto: "cambia la tipografía de toda la web" },
              { tipo: "claude", at: 0, texto: "Cambiada." },
            ]}
          />
        </div>
      )}
      {t > T.raton - 0.2 && t < T.vuelve + 0.4 && <Cursor x={cx} y={cy} pulsa={pulsa} opacity={clamp01((t - T.raton + 0.2) / 0.2) * (1 - ramp(t, T.vuelve + 0.1, T.vuelve + 0.4))} />}
      <Sello texto="NO PIERDES NADA" x={540} y={2420} t={t} at={T.no} out={T.te + 0.2} size={58} rot={-4} />

      {/* ── EP.7 ── */}
      <MiniRejilla t={t} at={T.te - 0.1} out={hasta + 0.4} ep={7} x={540} y={2640} etiqueta="Cambios y correcciones" />
    </Escena>
  );
};

export const eventosGuardado = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.checkpoints, sfx: "pop", vol: 0.35 },
    ...[0, 1, 2].map((k) => ({ t: T.antes + k * 0.35, sfx: "pop" as const, vol: 0.28 })),
    ...[0, 1, 2].map((k) => ({ t: T.guarda + k * 0.3 + 0.1, sfx: "tick" as const, vol: 0.4 })),
    { t: T.videojuego - 0.1, sfx: "golpe", vol: 0.35 },
    { t: T.rompe, sfx: "golpe", vol: 0.55 },
    { t: T.pasa - 0.2, sfx: "whoosh", vol: 0.25 },
    { t: T.rebobinar, sfx: "tick", vol: 0.5 },
    { t: T.rebobinar + 0.5, sfx: "tick", vol: 0.5 },
    { t: T.vuelve - 0.1, sfx: "whoosh", vol: 0.35 },
    { t: T.no + 0.12, sfx: "golpe", vol: 0.45 },
    { t: T.siete, sfx: "pop", vol: 0.4 },
  ];
};
