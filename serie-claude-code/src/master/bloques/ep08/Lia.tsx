/**
 * EP.8 · PASO 4: cuando no hay número y Claude se lía (escenas paso4 → escape).
 * Cartel SIN NÚMERO → SE ATASCA / REPITE / SE VA POR LAS RAMAS → tecla Esc y Visual Studio Code con el panel de
 * Claude Code recreado: «arregla la web» pensando → Interrupted → REFORMULA y MÁS CONTEXTO → la petición vaga se tacha
 * y se escribe la buena al ritmo de la voz, con la web de la floristería (ilustración adjunta) y su botón de comprar.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Cursor } from "../../componentes/Piezas";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Cartel, caraTexto } from "../../componentes/ep08/Cartel";
import { Burbuja, IcoAtasca, IcoRamas, IcoRepite, Pieza, TeclaEsc } from "../../componentes/ep08/Dibujos";
import { VsCode, WebFloristeria, tecleado } from "../../componentes/ep08/Pantallas";
import type { PalabraTecleada } from "../../componentes/ep08/Pantallas";
import { EASE, clamp01, ramp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const VS = { x: 70, y: 2000, w: 940, h: 900 };
const WEB = { x: 300, y: 2330, w: 440 };

const tiempos = (L: Linea) => ({
  paso: L.en("paso4", "Paso"),
  numero: L.en("paso4", "número,"),
  claude: L.en("paso4", "Claude"),
  lia: L.en("paso4", "lía:"),
  atasca: L.en("paso4", "atasca,"),
  repite: L.en("paso4", "repite"),
  ramas: L.en("paso4", "va"),
  fin4: L.fin("paso4"),
  pulsa: L.en("escape", "Pulsa"),
  tecla: L.en("escape", "tecla"),
  escape: L.en("escape", "Escape"),
  visual: L.en("escape", "Visual"),
  para: L.en("escape", "para."),
  pideselo: L.en("escape", "pídeselo"),
  dale: L.en("escape", "dale"),
  ejemplo: L.en("escape", "Por"),
  arregla: L.en("escape", "«arregla"),
  dile: L.en("escape", "dile:"),
  en: L.en("escape", "«en la web"),
  floristeria: L.en("escape", "floristería,"),
  comprar: L.en("escape", "comprar"),
  pulsarlo: L.en("escape", "pulsarlo»."),
  fin: L.fin("escape"),
});

export const Lia: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  // la petición buena se escribe palabra a palabra con la voz
  const ws = L.palabras.filter((p) => p.escena === "escape" && p.inicio >= T.en - 0.01);
  const pal: PalabraTecleada[] = ws.map((p, k) => ({ w: k === 0 ? "En" : p.texto.replace(/[«»]/g, ""), at: p.inicio }));
  const entrada = tecleado(pal, t, T.fin);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 1.0 },
    { t: T.numero - 0.3, x: 540, y: 1290, z: 0.96, d: 1.0 },
    { t: T.fin4 - 0.15, x: 540, y: 2440, z: 0.98, d: 1.0 },
    { t: T.escape - 0.1, x: 540, y: 2440, z: 1.06, d: 0.6 },
    { t: T.pideselo - 0.2, x: 540, y: 2420, z: 0.98, d: 0.9 },
    { t: T.arregla - 0.25, x: 570, y: 2330, z: 1.08, d: 0.8 },
    { t: T.dile - 0.1, x: 545, y: 2540, z: 1.04, d: 0.8 },
    { t: T.floristeria - 0.15, x: 500, y: 2470, z: 0.98, d: 0.9 },
  ];
  const fuera4 = T.fin4 + 0.4;
  const vVs = vis(t, T.fin4 - 0.3, Infinity, 0.85);
  const vWeb = vis(t, T.floristeria - 0.05, Infinity, 0.7);
  const boton = { x: WEB.x, y: WEB.y + 205 };
  const c0 = { x: 620, y: 2780 };
  const ir = ramp(t, T.comprar, T.pulsarlo, EASE);
  const mareo = t > T.lia ? Math.sin((t - T.lia) * 9) * 18 * Math.exp(-(t - T.lia) * 0.8) : 0;
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── PASO 4: sin número ── */}
      <Sello texto="PASO 4" x={540} y={780} t={t} at={T.paso} out={T.numero + 0.2} size={60} rot={-5} />
      <Cartel x={540} y={900} w={430} t={t} entra={T.numero - 0.3} caras={[{ at: 0, cara: caraTexto("SIN NÚMERO") }]} golpes={[T.lia]} out={fuera4} />
      <Logo src={ep.logos.claude_code} x={880} y={1130} w={150} t={t} at={T.claude - 0.08} out={fuera4} rot={mareo} />
      {[
        { at: T.atasca, x: 230, txt: "SE ATASCA", ico: <IcoAtasca s={74} /> },
        { at: T.repite, x: 540, txt: "REPITE", ico: <IcoRepite s={74} /> },
        { at: T.ramas, x: 850, txt: "SE VA POR LAS RAMAS", ico: <IcoRamas s={74} /> },
      ].map((it, i) => (
        <React.Fragment key={i}>
          <Pieza x={it.x} y={1500} t={t} at={it.at - 0.08} out={fuera4} rot={i === 1 ? (t - it.at) * 200 * Math.exp(-(Math.max(0, t - it.at)) * 1.2) : 0}>
            <Burbuja s={140}>{it.ico}</Burbuja>
          </Pieza>
          <Etiqueta texto={it.txt} x={it.x} y={1640} t={t} at={it.at} out={fuera4} size={i === 2 ? 26 : 32} variante="texto" fuente="titulo" />
        </React.Fragment>
      ))}

      {/* ── Visual Studio Code con Claude Code ── */}
      {vVs.on && (
        <div style={{ position: "absolute", left: VS.x, top: VS.y, opacity: vVs.opacity, transform: `translateY(${vVs.y}px) scale(${vVs.scale})` }}>
          <VsCode
            t={t} w={VS.w} h={VS.h} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code}
            enviado={T.fin4 - 0.3} piensa={T.fin4} interrumpe={T.para} tacha={T.arregla} entrada={entrada} enfocaEntrada={T.dile}
          />
        </div>
      )}
      <Pieza x={540} y={2420} t={t} at={T.tecla - 0.1} out={T.para + 0.35}>
        <TeclaEsc t={t} pulsa={T.escape + 0.12} s={300} />
      </Pieza>
      <Logo src={ep.logos.vscode} x={920} y={1990} w={130} t={t} at={T.visual - 0.08} out={T.pideselo} />
      <Etiqueta texto="SE PARA" x={540} y={2660} t={t} at={T.para - 0.05} out={T.pideselo} size={44} variante="acento" fuente="titulo" />
      <Sello texto="REFORMULA" x={320} y={2020} t={t} at={T.pideselo} out={T.ejemplo + 0.2} size={52} rot={-5} />
      <Sello texto="MÁS CONTEXTO" x={730} y={2020} t={t} at={T.dale} out={T.ejemplo + 0.2} size={52} rot={4} />
      <Etiqueta texto="DILE:" x={720} y={2540} t={t} at={T.dile - 0.05} out={T.en + 0.5} size={40} variante="acento" fuente="titulo" />

      {/* ── la web de la floristería ── */}
      {vWeb.on && (
        <div style={{ position: "absolute", left: WEB.x, top: WEB.y, width: 0, height: 0 }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vWeb.y}px) scale(${vWeb.scale}) rotate(${-3 * (1 - vWeb.s)}deg)`, opacity: vWeb.opacity }}>
            <WebFloristeria t={t} img={ep.imagenes?.floristeria ?? ""} w={WEB.w} resalte={T.comprar - 0.05} pulsa={T.pulsarlo + 0.1} />
          </div>
        </div>
      )}
      {t > T.comprar - 0.1 && (
        <Cursor x={c0.x + (boton.x + 30 - c0.x) * ir} y={c0.y + (boton.y - c0.y) * ir} pulsa={Math.sin(clamp01((t - T.pulsarlo - 0.05) / 0.2) * Math.PI)} opacity={clamp01((t - T.comprar + 0.1) / 0.2) * (1 - ramp(t, hasta - 0.1, hasta + 0.2))} />
      )}
      <Etiqueta texto="NO HACE NADA" x={WEB.x} y={WEB.y + 320} t={t} at={T.pulsarlo + 0.3} out={hasta + 0.3} size={30} variante="borde" fuente="titulo" />
    </Escena>
  );
};

export const eventosLia = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.numero - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.numero - 0.05, sfx: "golpe", vol: 0.3 },
    { t: T.claude - 0.08, sfx: "pop", vol: 0.35 },
    { t: T.atasca - 0.08, sfx: "pop", vol: 0.4 },
    { t: T.repite - 0.08, sfx: "pop", vol: 0.4 },
    { t: T.ramas - 0.08, sfx: "pop", vol: 0.4 },
    { t: T.fin4 - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.escape + 0.12, sfx: "golpe", vol: 0.55 },
    { t: T.visual - 0.08, sfx: "pop", vol: 0.35 },
    { t: T.para, sfx: "tick", vol: 0.45 },
    { t: T.pideselo + 0.12, sfx: "golpe", vol: 0.45 },
    { t: T.dale + 0.12, sfx: "golpe", vol: 0.45 },
    { t: T.arregla, sfx: "whoosh", vol: 0.2 },
    { t: T.en, sfx: "tecleo", vol: 0.25, dur: Math.max(0.5, T.fin - T.en - 0.2) },
    { t: T.floristeria - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.pulsarlo + 0.1, sfx: "tick", vol: 0.45 },
  ];
};
