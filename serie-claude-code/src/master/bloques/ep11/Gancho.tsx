/**
 * EP.11 · Gancho (escena gancho): pides la web de tu negocio en Claude Code → llega una portada → se abre en abanico
 * en cinco, todas distintas → logo de Claude Code → PROBAR IDEAS / CASI NO CUESTA → detrás asoman muchas más y cae
 * el sello VARIANTES.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { WebMini } from "../../componentes/ep11/Panaderia";
import type { Estilo } from "../../componentes/ep11/Panaderia";
import { C, EASE, UI, clamp01, ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "gancho";
const tiempos = (L: Linea) => ({
  pides: L.en(E, "pides"),
  negocio: L.en(E, "negocio"),
  finNegocio: L.finDe(E, "negocio"),
  una: L.en(E, "una"),
  llegan: L.en(E, "llegan"),
  cinco: L.en(E, "cinco"),
  distintas: L.en(E, "distintas"),
  claude: L.en(E, "Claude"),
  probar: L.en(E, "probar"),
  cuesta: L.en(E, "cuesta"),
  pedir: L.en(E, "pedir"),
  variantes: L.en(E, "variantes"),
  fin: L.fin(E),
});

const PEDIDO = "hazme la web de mi negocio";
/** Las cinco portadas del abanico: mismas piezas, combinadas de otra manera. */
const CINCO: { maqueta: Estilo; menu: Estilo; paleta: string }[] = [
  { maqueta: "clasica", menu: "clasica", paleta: "clasica" },
  { maqueta: "minimalista", menu: "minimalista", paleta: "moderna" },
  { maqueta: "moderna", menu: "moderna", paleta: "moderna" },
  { maqueta: "clasica", menu: "moderna", paleta: "minimalista" },
  { maqueta: "moderna", menu: "clasica", paleta: "clasica" },
];

export const Gancho11: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const envia = T.finNegocio + 0.1;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 1.05 },
    { t: T.una - 0.3, x: 540, y: 1120, z: 1.05, d: 0.8 },
    { t: T.cinco - 0.25, x: 540, y: 1160, z: 0.94, d: 0.8 },
    { t: T.claude - 0.2, x: 540, y: 1090, z: 0.9, d: 1.0 },
    { t: T.variantes - 0.3, x: 540, y: 1120, z: 0.84, d: 1.2 },
  ];
  // barra de petición
  const letras = Math.round(ramp(t, T.pides, T.finNegocio, (x) => x) * PEDIDO.length);
  const vBarra = sp(t, desde - 0.2, { damping: 14, stiffness: 160 });
  const fueraBarra = ramp(t, T.claude - 0.4, T.claude - 0.05);
  const destello = clamp01(1 - (t - envia) / 0.4) * (t > envia ? 1 : 0);
  // la primera portada y el abanico
  const llega = sp(t, T.una - 0.05, { damping: 13, stiffness: 170 });
  const abre = sp(t, T.cinco - 0.15, { damping: 15, stiffness: 120 });
  const baile = (i: number) => (t > T.distintas - 0.1 ? Math.sin((t - T.distintas) * 9 + i) * 3 * Math.exp(-(t - T.distintas) * 2.5) : 0);
  const ola = ramp(t, T.pedir - 0.1, T.variantes + 0.4, EASE);
  return (
    <Escena t={t} tomas={tomas}>
      {/* muchas más detrás (variantes que quieras) */}
      {ola > 0 &&
        Array.from({ length: 10 }, (_, k) => {
          const ang = (k / 10) * Math.PI * 2 + 0.3;
          const r = 520 + (k % 2) * 90;
          const a = clamp01(ola * 10 - k * 0.6);
          if (a <= 0) return null;
          const c = CINCO[k % 5];
          return (
            <div key={k} style={{ position: "absolute", left: 540 + Math.cos(ang) * r * 1.05, top: 1180 + Math.sin(ang) * r * 0.8, width: 0, height: 0, opacity: 0.38 * a }}>
              <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * a}) rotate(${(k % 3 - 1) * 8}deg)` }}>
                <WebMini w={210} maqueta={c.maqueta} menu={c.menu} paleta={c.paleta} />
              </div>
            </div>
          );
        })}

      {/* barra de petición */}
      <div style={{ position: "absolute", left: 540, top: 760, width: 0, height: 0, opacity: Math.min(1, vBarra * 1.5) * (1 - fueraBarra) }}>
        <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${(1 - vBarra) * 30}px)`, width: 860, height: 112, borderRadius: 56, background: C.panel, border: `4px solid ${t > T.pides && t < envia ? C.acento : C.borde}`, display: "flex", alignItems: "center", gap: 22, padding: "0 30px", boxSizing: "border-box", boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 ${50 * destello}px ${C.acento}` }}>
          <Img src={staticFile(ep.logos.claude_code)} style={{ width: 58 }} />
          <div style={{ flex: 1, fontFamily: UI, fontWeight: 600, fontSize: 40, color: letras ? C.texto : C.gris, whiteSpace: "nowrap", overflow: "hidden" }}>
            {letras ? PEDIDO.slice(0, letras) : "Pídele algo a Claude…"}
            {t < envia && <span style={{ display: "inline-block", width: 4, height: 42, marginLeft: 4, verticalAlign: "middle", background: C.acento, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
          </div>
          <div style={{ width: 66, height: 66, borderRadius: 33, background: letras ? C.acento : C.panel2, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * destello})` }}>
            <svg width={34} height={34} viewBox="0 0 24 24"><path d="M12 19 V5 M5 12 L12 5 L19 12" stroke={C.oscuro} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>

      {/* una portada que se abre en cinco */}
      {llega > 0 &&
        CINCO.map((c, i) => {
          const k = i - 2;
          const x = 540 + k * 205 * abre;
          const y = 1200 + Math.abs(k) * 55 * abre - (1 - llega) * 300;
          const rot = k * 7 * abre + baile(i);
          const vis1 = i === 2 ? 1 : clamp01(abre * 3);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: Math.min(1, llega * 2) * vis1, zIndex: 5 - Math.abs(k) }}>
              <div style={{ position: "absolute", transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${(i === 2 ? 1.25 - 0.25 * abre : 1) * (0.9 + 0.1 * llega)})` }}>
                <WebMini w={300} maqueta={c.maqueta} menu={c.menu} paleta={c.paleta} />
              </div>
            </div>
          );
        })}
      <Etiqueta texto="×5" x={880} y={900} t={t} at={T.cinco} out={T.claude + 0.2} size={92} variante="acento" fuente="titulo" />
      <Etiqueta texto="TODAS DISTINTAS" x={540} y={1530} t={t} at={T.distintas - 0.05} out={T.probar - 0.1} size={44} variante="borde" fuente="titulo" />
      <Logo src={ep.logos.claude_code} x={540} y={780} w={170} t={t} at={T.claude - 0.05} pulsos={[T.probar]} out={T.variantes + 0.2} />
      <Etiqueta texto="PROBAR IDEAS" x={540} y={1530} t={t} at={T.probar} out={T.variantes - 0.15} size={48} variante="acento" fuente="titulo" />
      <Etiqueta texto="CASI NO CUESTA" x={540} y={1625} t={t} at={T.cuesta} out={T.variantes - 0.15} size={36} variante="gris" fuente="titulo" />
      <Sello texto="VARIANTES" x={540} y={1560} t={t} at={T.variantes} size={84} rot={-4} />
    </Escena>
  );
};

export const eventosGancho11 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.pides, sfx: "tecleo", vol: 0.3, dur: Math.max(0.4, T.finNegocio - T.pides) },
    { t: T.finNegocio + 0.1, sfx: "envio", vol: 0.45 },
    { t: T.una - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.cinco - 0.45, sfx: "whoosh", vol: 0.3 },
    { t: T.cinco, sfx: "pop", vol: 0.4 },
    { t: T.distintas - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.claude - 0.05, sfx: "pop", vol: 0.4 },
    { t: T.probar, sfx: "pop", vol: 0.35 },
    { t: T.cuesta, sfx: "pop", vol: 0.3 },
    { t: T.variantes + 0.12, sfx: "golpe", vol: 0.5 },
  ];
};
