/**
 * EP.13 v2 · «Llevo días pensando…» en negro, solo texto, y el golpe «LO ELEGÍS VOSOTROS» con la urna (agradecer) →
 * cinco cartas boca abajo (cinco) → cada opción: su carta se da la vuelta, la fila de arriba marca cuál va, sello
 * OPCIÓN N/5 y una demo propia (opcion; un mismo bloque para apps, auto, web, escalar y seguridad).
 * Las cartas son nuevas (no son las historias del usuario): estilo oscuro de la serie e iconos planos propios.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Bocadillo, CREMA, CartaOpcion, Escudo, Persona, Urna, entra, temblor } from "../../componentes/ep13b/Piezas13b";
import { C, EASE_OUT, MONO, TITULO, UI, clamp01, cue, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

// ── agradecer ────────────────────────────────────────────────────────────────────────────────────────────────────
const A = "agradecer";
const tAgr = (L: Linea) => ({
  llevo: L.en(A, "Llevo"),
  como: L.en(A, "cómo"),
  esto: L.finDe(A, "esto."),
  dolores: L.en(A, "dolores"),
  tengo: L.en(A, "lo tengo"),
  el: L.en(A, "el próximo"),
  elegis: L.en(A, "elegís"),
  vosotros: L.en(A, "vosotros."),
});

const Tecleo: React.FC<{ texto: string; t: number; a: number; b: number; size: number; color?: string; font?: string }> = ({ texto, t, a, b, size, color = C.texto, font = UI }) => {
  const n = Math.floor(clamp01((t - a) / Math.max(0.01, b - a)) * texto.length);
  if (t < a) return null;
  return (
    <div style={{ fontFamily: font, fontWeight: 700, fontSize: size, color, whiteSpace: "nowrap" }}>
      {texto.slice(0, n)}
      {n < texto.length && <span style={{ display: "inline-block", width: size * 0.08, height: size * 0.95, background: C.acento, verticalAlign: "middle", marginLeft: 4 }} />}
    </div>
  );
};

export const Agradecer13b: React.FC<BloqueProps> = ({ t, L, desde }) => {
  const T = tAgr(L);
  const punch = sp(t, T.elegis, { damping: 11, stiffness: 240 });
  const z = t < T.elegis ? 1 : 1.22 - 0.16 * punch;
  const tomas: Toma[] = [{ t: desde - 1, x: 540, y: 1080, z: 1 }];
  const sh = temblor(t, [T.elegis], 20);
  const fueraTexto = ramp(t, T.el - 0.3, T.el);
  const vClaro = vis(t, T.tengo, T.el - 0.05, 0.8);
  const vProx = vis(t, T.el, Infinity, 0.7);
  const vEleg = sp(t, T.elegis, { damping: 10, stiffness: 260 });
  const vUrna = vis(t, T.elegis + 0.15, Infinity, 0.4);
  return (
    <Escena t={t} tomas={tomas} puntos={false}>
      <AbsoluteFill style={{ background: "#050608" }} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${z})`, transformOrigin: "540px 1080px" }}>
        <div style={{ position: "absolute", left: 90, top: 900, opacity: 1 - fueraTexto }}>
          <Tecleo texto="Llevo días pensando" t={t} a={T.llevo} b={T.como - 0.1} size={62} />
          <div style={{ height: 22 }} />
          <Tecleo texto="cómo agradeceros todo esto." t={t} a={T.como} b={T.esto} size={62} color={C.acento} />
        </div>
        {/* dolores de cabeza: bolas de papel que caen */}
        {[0, 1, 2].map((i) => {
          const a = T.dolores - 0.15 + i * 0.22;
          if (t < a) return null;
          const u = t - a;
          const y = Math.min(1380, 640 + 0.5 * 5200 * u * u);
          const rebote = u > 0.53 ? Math.abs(Math.sin((u - 0.53) * 9)) * 50 * Math.exp(-(u - 0.53) * 5) : 0;
          const x = 300 + i * 240;
          return (
            <div key={i} style={{ position: "absolute", left: x - 55, top: y - 55 - rebote, width: 110, height: 104, borderRadius: "46% 54% 50% 50%", background: CREMA, opacity: 1 - fueraTexto, transform: `rotate(${u * 300 + i * 40}deg)`, boxShadow: "inset -14px -10px 0 #CFC6B6, 0 16px 30px rgba(0,0,0,0.5)" }}>
              <div style={{ position: "absolute", left: 20, top: 30, width: 60, height: 6, background: "#BDB5A6", transform: "rotate(25deg)" }} />
              <div style={{ position: "absolute", left: 30, top: 60, width: 50, height: 6, background: "#BDB5A6", transform: "rotate(-30deg)" }} />
            </div>
          );
        })}
        {vClaro.on && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", opacity: vClaro.opacity, transform: `scale(${vClaro.scale})`, fontFamily: MONO, fontWeight: 700, fontSize: 48, color: C.gris, letterSpacing: 6 }}>LO TENGO CLARO</div>
        )}
        {vProx.on && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", opacity: vProx.opacity, transform: `translateY(${vProx.y}px)`, fontFamily: TITULO, fontWeight: 800, fontSize: 76, color: C.texto }}>EL PRÓXIMO MÓDULO</div>
        )}
        {t >= T.elegis && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", transform: `scale(${2.2 - 1.2 * vEleg})`, opacity: clamp01(vEleg * 3) }}>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 112, lineHeight: 1.02, color: C.texto }}>LO ELEGÍS</div>
            <div style={{ display: "inline-block", fontFamily: TITULO, fontWeight: 800, fontSize: 150, lineHeight: 1.05, color: C.oscuro, background: C.acento, padding: "0 30px", borderRadius: 18, marginTop: 10, boxShadow: `0 0 60px ${C.acento}99` }}>VOSOTROS</div>
          </div>
        )}
        {vUrna.on && (
          <div style={{ position: "absolute", left: 540 - 140, top: 1240, opacity: vUrna.opacity, transform: `translateY(${vUrna.y * 2}px) scale(${vUrna.scale})` }}>
            <Urna w={280} cae={ramp(t, T.vosotros, T.vosotros + 0.45, (x) => x * x)} />
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: -2000, top: -2000, width: 5000, height: 6000, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: C.acento, opacity: t >= T.elegis && t < T.elegis + 0.3 ? 0.45 * (1 - (t - T.elegis) / 0.3) : 0 }} />
      </div>
    </Escena>
  );
};

export const eventosAgradecer13b = (L: Linea): Evento[] => {
  const T = tAgr(L);
  return [
    cue(T.llevo, "teclado", "se teclea «Llevo días pensando…»", "bajo", { desde: 0, dur: 1.1 }),
    cue(T.dolores + 0.38, "golpe", "caen las bolas de papel", "bajo"),
    cue(T.tengo, "click", "LO TENGO CLARO", "bajo"),
    cue(T.elegis, "riser", "sube hacia «LO ELEGÍS VOSOTROS»", "bajo"),
    cue(T.elegis + 0.02, "impacto", "golpe de zoom: LO ELEGÍS VOSOTROS", "medio"),
    cue(T.vosotros + 0.45, "interfaz", "la papeleta entra en la urna", "bajo"),
  ];
};

// ── cinco cartas ─────────────────────────────────────────────────────────────────────────────────────────────────
const CARTAS = { y: 1080, w: 172, hueco: 18 };
const xCarta = (i: number) => 540 + (i - 2) * (CARTAS.w + CARTAS.hueco);

export const Cinco13b: React.FC<BloqueProps> = ({ t, L, desde }) => {
  const tenéis = L.en("cinco", "Tenéis");
  const cinco = L.en("cinco", "5");
  const opciones = L.en("cinco", "opciones.");
  const tomas: Toma[] = [{ t: desde - 1, x: 540, y: 1120, z: 1.1 }, { t: cinco, x: 540, y: 1120, z: 1.0, d: 0.5 }];
  return (
    <Escena t={t} tomas={tomas}>
      {[0, 1, 2, 3, 4].map((i) => {
        const e = entra(t, tenéis + 0.05 + i * 0.09, { damping: 13, stiffness: 210 });
        if (!e.on) return null;
        return (
          <div key={i} style={{ position: "absolute", left: xCarta(i) - CARTAS.w / 2, top: CARTAS.y - (CARTAS.w * 1.4) / 2, opacity: e.op, transform: `translateY(${(1 - e.s) * 700}px) rotate(${(1 - e.s) * (i - 2) * 25 + (i - 2) * 2}deg)` }}>
            <CartaOpcion w={CARTAS.w} giro={0} n={i + 1} palabra="" sub="" activa={Math.max(0, Math.sin((t - cinco - i * 0.08) * 7)) * 0.6} />
          </div>
        );
      })}
      <Etiqueta texto="5" x={540} y={760} t={t} at={cinco - 0.05} size={150} variante="texto" fuente="titulo" />
      <Sello texto="5 OPCIONES" x={540} y={1400} t={t} at={opciones} size={74} rot={-4} resalte={1} />
    </Escena>
  );
};

export const eventosCinco13b = (L: Linea): Evento[] => [
  cue(L.en("cinco", "Tenéis") + 0.25, "interfaz", "caen las cinco cartas boca abajo", "medio"),
  cue(L.en("cinco", "5"), "click", "el número 5", "bajo"),
  cue(L.en("cinco", "opciones."), "remate", "sello 5 OPCIONES", "medio"),
];

// ── cada opción ──────────────────────────────────────────────────────────────────────────────────────────────────
type Cfg = { n: number; palabra: string; sub: string; titulo: string; demo: string };
const OPC: Record<string, Cfg> = {
  apps: { n: 1, palabra: "APPS", sub: "A MEDIDA", titulo: "Apps", demo: "Una" },
  auto: { n: 2, palabra: "AUTO", sub: "AUTOMATIZACIONES", titulo: "Automatizaciones.", demo: "Que lo que" },
  web: { n: 3, palabra: "WEB", sub: "DESARROLLO WEB", titulo: "Desarrollo", demo: "Tu página," },
  escalar: { n: 4, palabra: "ESCALAR", sub: "CON CLAUDE", titulo: "Escalar", demo: "Pasar" },
  seguridad: { n: 5, palabra: "SEGURIDAD", sub: "CIBERSEGURIDAD", titulo: "Ciberseguridad.", demo: "Proteger" },
};
const ORDEN = ["apps", "auto", "web", "escalar", "seguridad"];

/** Icono de la cara de cada carta. */
const IconoCarta: React.FC<{ id: string; w: number; t: number; at: number }> = ({ id, w, t, at }) => {
  const u = clamp01((t - at) / 0.6);
  if (id === "apps")
    return (
      <svg width={w} height={w} viewBox="0 0 100 100">
        <rect x={28} y={6} width={44} height={88} rx={8} fill={C.panel2} stroke={C.acento} strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={35} y={22 + i * 20} width={30 * clamp01(u * 3 - i)} height={12} rx={3} fill={i === 0 ? C.acento : CREMA} />
        ))}
        <circle cx={50} cy={84} r={4} fill={C.acento} />
      </svg>
    );
  if (id === "auto")
    return (
      <svg width={w} height={w} viewBox="0 0 100 100" style={{ transform: `rotate(${(t - at) * 120}deg)` }}>
        <path d="M50 14 A36 36 0 0 1 86 50" fill="none" stroke={C.acento} strokeWidth={9} strokeLinecap="round" />
        <path d="M50 86 A36 36 0 0 1 14 50" fill="none" stroke={C.acento} strokeWidth={9} strokeLinecap="round" />
        <path d="M78 42 L86 56 L96 44 Z" fill={C.acento} />
        <path d="M22 58 L14 44 L4 56 Z" fill={C.acento} />
        <path d="M54 30 L40 54 H52 L46 72 L62 46 H50 Z" fill={CREMA} />
      </svg>
    );
  if (id === "web")
    return (
      <svg width={w} height={w} viewBox="0 0 100 100">
        <rect x={6} y={16} width={88} height={68} rx={7} fill={C.panel2} stroke={C.acento} strokeWidth={4} />
        <rect x={6} y={16} width={88} height={14} rx={7} fill={C.acento} />
        <rect x={16} y={40} width={40 * u} height={10} rx={3} fill={CREMA} />
        <rect x={16} y={56} width={28 * u} height={8} rx={3} fill={C.gris} />
        <rect x={16} y={70} width={22} height={8} rx={3} fill={C.acento} opacity={u} />
      </svg>
    );
  if (id === "escalar")
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: w * 0.04 }}>
        <div style={{ opacity: u }}><Persona w={w * 0.28} color={C.gris} /></div>
        <Persona w={w * 0.36} />
        <div style={{ opacity: u }}><Persona w={w * 0.28} color={C.gris} /></div>
      </div>
    );
  return <Escudo w={w * 0.78} cierra={u} />;
};

export const Opcion13b: React.FC<BloqueProps> = ({ t, ep, L, desde, escenas }) => {
  const id = escenas[0];
  const cfg = OPC[id];
  const t0 = L.ini(id);
  const t1 = L.en(id, cfg.titulo);
  const td = L.en(id, cfg.demo);
  const fin = L.fin(id);
  const gira = ramp(t, t0 + 0.05, t1 + 0.1, EASE_OUT);
  const mueve = ramp(t, td - 0.25, td + 0.25);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1110, z: 1.08 },
    { t: t1, x: 540, y: 1110, z: 1.0, d: 0.35 },
    { t: td - 0.2, x: 540, y: 1140, z: 1.0, d: 0.5 },
  ];
  const sh = temblor(t, [t1 + 0.1], 10);
  // carta grande: centro → arriba a la izquierda
  const cw = 380;
  const cx = 540 + (230 - 540) * mueve;
  const cy = 1090 + (905 - 1090) * mueve;
  const esc = 1 - 0.47 * mueve;
  const eC = entra(t, desde - 0.3, { damping: 14, stiffness: 220 });
  const k = ORDEN.indexOf(id);
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        {/* fila de las cinco: las anteriores ya boca arriba, la actual se ilumina */}
        {ORDEN.map((o, i) => {
          const w = 72;
          const x = 540 + (i - 2) * (w + 16);
          const activa = i === k ? 0.6 + 0.4 * Math.sin(t * 8) : 0;
          return (
            <div key={o} style={{ position: "absolute", left: x - w / 2, top: 700 - (w * 1.4) / 2, opacity: i <= k ? 1 : 0.5, transform: `scale(${i === k ? 1.15 : 0.95})` }}>
              <div style={{ width: w, height: w * 1.4, borderRadius: 8, background: i < k ? C.panel2 : i === k ? C.acento : C.panel2, border: `3px solid ${i <= k ? C.acento : C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: activa ? `0 0 ${24 * activa}px ${C.acento}` : undefined }}>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: i < k ? 16 : 38, color: i === k ? C.oscuro : i < k ? C.acento : C.gris }}>{i < k ? OPC[o].palabra : i === k ? String(i + 1) : "?"}</div>
              </div>
            </div>
          );
        })}
        {/* carta grande */}
        <div style={{ position: "absolute", left: cx - cw / 2, top: cy - (cw * 1.4) / 2, opacity: eC.op, transform: `scale(${esc * (0.7 + 0.3 * eC.s) * (1 + 0.06 * Math.sin(clamp01((t - t1 - 0.1) / 0.25) * Math.PI))}) rotate(${-3 * mueve}deg)` }}>
          <CartaOpcion w={cw} giro={gira} n={cfg.n} palabra={cfg.palabra} sub={cfg.sub} activa={gira}>
            <IconoCarta id={id} w={cw * 0.55} t={t} at={t1} />
          </CartaOpcion>
        </div>
        <Sello texto={`OPCIÓN ${cfg.n}/5`} x={540} y={1440} t={t} at={t0 + 0.02} out={td - 0.3} size={56} rot={-4} />
        <Etiqueta texto={`COMENTA ${cfg.palabra}`} x={245} y={1135} t={t} at={td + 0.2} size={cfg.palabra.length > 6 ? 27 : 32} variante="acento" fuente="titulo" />
        <Demo id={id} t={t} L={L} ep={ep} fin={fin} />
      </div>
    </Escena>
  );
};

/** Demos de cada opción (zona derecha y de abajo, con la carta pequeña arriba a la izquierda). */
const Demo: React.FC<{ id: string; t: number; L: Linea; ep: BloqueProps["ep"]; fin: number }> = ({ id, t, L, ep }) => {
  if (id === "apps") {
    const T = { app: L.en(id, "aplicación"), reservas: L.en(id, "reservas,"), clientes: L.en(id, "clientes"), datos: L.en(id, "datos"), mismo: L.en(id, "mismo") };
    const v = vis(t, T.app - 0.1, Infinity, 0.7);
    const filas = [
      { n: "Reservas", at: T.reservas, d: "Hoy · 4 citas" },
      { n: "Clientes", at: T.clientes, d: "Ficha de cada uno" },
      { n: "Datos", at: T.datos, d: "Todo al día" },
    ];
    const junta = ramp(t, T.mismo - 0.2, T.mismo + 0.2);
    return (
      <>
        {v.on && (
          <div style={{ position: "absolute", left: 470, top: 820, width: 520, height: 640, borderRadius: 40, background: C.panel, border: `5px solid ${C.acento}`, opacity: v.opacity, transform: `translateY(${v.y * 3}px) scale(${v.scale * (1 + 0.04 * Math.sin(junta * Math.PI))})`, boxShadow: `0 30px 70px rgba(0,0,0,0.6), 0 0 ${60 * junta}px ${C.acento}66`, overflow: "hidden" }}>
            <div style={{ height: 96, background: C.acento, display: "flex", alignItems: "center", padding: "0 34px", fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.oscuro }}>Tu negocio</div>
            {filas.map((f, i) => {
              const e = entra(t, f.at - 0.05);
              return (
                <div key={i} style={{ margin: "28px 30px 0", height: 130, borderRadius: 22, background: C.panel2, border: `3px solid ${e.on ? C.acento : C.borde}`, display: "flex", alignItems: "center", gap: 22, padding: "0 26px", opacity: 0.35 + 0.65 * e.op, transform: `translateX(${(1 - e.s) * 80}px)` }}>
                  <div style={{ width: 66, height: 66, borderRadius: 16, background: e.on ? C.acento : C.borde, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 34, color: C.oscuro }}>{f.n[0]}</div>
                  <div>
                    <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 40, color: C.texto }}>{f.n}</div>
                    <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 28, color: C.gris }}>{f.d}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Logo src={ep.logos.nodejs} x={230} y={1290} w={190} t={t} at={T.app + 0.1} ficha="tarjeta" />
        <Logo src={ep.logos.aws} x={230} y={1460} w={160} t={t} at={T.app + 0.3} ficha="tarjeta" />
        <Sello texto="TODO EN UN SITIO" x={730} y={1520} t={t} at={T.mismo} size={50} rot={-4} resalte={1} />
      </>
    );
  }
  if (id === "auto") {
    const T = { repites: L.en(id, "repites"), solo: L.en(id, "haga solo."), entra: L.en(id, "Entra"), wa: L.en(id, "WhatsApp"), apunta: L.en(id, "apunta"), hoja: L.en(id, "hoja") };
    const vLoop = vis(t, T.repites - 0.1, T.entra - 0.1, 0.6);
    const flecha = ramp(t, T.wa + 0.2, T.apunta + 0.1);
    const viaje = ramp(t, T.wa + 0.25, T.apunta + 0.15);
    const vHoja = vis(t, T.apunta - 0.1, Infinity, 0.7);
    const fila = ramp(t, T.hoja - 0.1, T.hoja + 0.35);
    return (
      <>
        {vLoop.on && (
          <div style={{ position: "absolute", left: 560, top: 820, width: 380, textAlign: "center", opacity: vLoop.opacity, transform: `scale(${vLoop.scale})` }}>
            <svg width={220} height={220} viewBox="0 0 100 100" style={{ transform: `rotate(${(t - T.repites) * 260}deg)` }}>
              <path d="M50 12 A38 38 0 1 1 15 35" fill="none" stroke={C.acento} strokeWidth={9} strokeLinecap="round" />
              <path d="M4 30 L18 22 L24 40 Z" fill={C.acento} />
            </svg>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 38, color: C.texto, letterSpacing: 4, marginTop: 8 }}>CADA DÍA</div>
          </div>
        )}
        <Sello texto="SE HACE SOLO" x={740} y={1220} t={t} at={T.solo} out={T.entra - 0.1} size={58} rot={-5} resalte={1} />
        <Logo src={ep.logos.whatsapp} x={220} y={1365} w={150} t={t} at={T.entra} pulsos={[T.wa]} />
        {t > T.entra + 0.1 && t < T.apunta + 0.6 && (
          <div style={{ position: "absolute", left: 220 + (860 - 220) * viaje - 20, top: 1215, opacity: 1 - ramp(t, T.apunta + 0.1, T.apunta + 0.5) }}>
            <Bocadillo size={32}>Pedido: 2 ramos</Bocadillo>
          </div>
        )}
        <Flecha curva={{ a: { x: 320, y: 1365 }, c: { x: 540, y: 1290 }, b: { x: 770, y: 1365 } }} p={flecha} ancho={9} />
        <Logo src={ep.logos.google_sheets_icono} x={860} y={1365} w={120} t={t} at={T.entra + 0.2} pulsos={[T.apunta + 0.15]} />
        {vHoja.on && (
          <div style={{ position: "absolute", left: 200, top: 1455, width: 680, opacity: vHoja.opacity, transform: `translateY(${vHoja.y}px)`, borderRadius: 14, overflow: "hidden", border: `3px solid #2E9E5B`, background: "#F7F8F6", fontFamily: MONO, fontWeight: 700, fontSize: 26, color: "#22262E" }}>
            <div style={{ display: "flex", background: "#2E9E5B", color: "#FFFFFF", padding: "8px 18px" }}>
              <div style={{ width: 260 }}>PEDIDO</div>
              <div style={{ width: 200 }}>HORA</div>
              <div>ESTADO</div>
            </div>
            <div style={{ display: "flex", padding: "10px 18px", background: fila > 0.95 ? "#FFF1EA" : undefined }}>
              <div style={{ width: 260 }}>{"2 ramos".slice(0, Math.round(fila * 7))}</div>
              <div style={{ width: 200 }}>{fila > 0.5 ? "10:42" : ""}</div>
              <div style={{ color: C.acento }}>{fila > 0.9 ? "✓ apuntado" : ""}</div>
            </div>
          </div>
        )}
      </>
    );
  }
  if (id === "web") {
    const T = { web: L.en(id, "web."), pagina: L.en(id, "Tu página,"), creada: L.en(id, "creada"), claude: L.en(id, "Claude"), idea: L.en(id, "idea"), publicada: L.en(id, "publicada.") };
    const v = vis(t, T.pagina - 0.1, Infinity, 0.7);
    const codigo = ramp(t, T.creada, T.idea);
    const pub = ramp(t, T.publicada, T.publicada + 0.3);
    const lineas = ["<header>Tu negocio</header>", "<h1>Bienvenido</h1>", "<a>Pide cita</a>", "<footer>…</footer>"];
    const anclas = [
      { src: ep.logos.nextjs, y: 1250, w: 110, ficha: "circulo" as const },
      { src: ep.logos.astro, y: 1375, w: 190, ficha: undefined },
      { src: ep.logos.vercel, y: 1500, w: 150, ficha: "tarjeta" as const },
    ];
    return (
      <>
        {anclas.map((a, i) => {
          const ang = (t - T.web) * 2.2 + i * 2.1;
          return <Logo key={i} src={a.src} x={215 + Math.cos(ang) * 28} y={a.y + Math.sin(ang) * 18} w={a.w} t={t} at={T.web - 0.1 + i * 0.15} ficha={a.ficha} />;
        })}
        {v.on && (
          <div style={{ position: "absolute", left: 420, top: 830, width: 600, height: 560, borderRadius: 26, overflow: "hidden", background: pub > 0.5 ? CREMA : C.panel, border: `5px solid ${C.acento}`, opacity: v.opacity, transform: `translateY(${v.y * 3}px) scale(${v.scale})`, boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>
            <div style={{ height: 64, background: C.panel2, display: "flex", alignItems: "center", gap: 12, padding: "0 20px" }}>
              {["#E5484D", "#E2B33F", "#4FB38A"].map((c) => <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />)}
              <div style={{ marginLeft: 14, flex: 1, height: 38, borderRadius: 19, background: C.panel, fontFamily: MONO, fontSize: 24, color: C.gris, display: "flex", alignItems: "center", paddingLeft: 18 }}>tu-negocio.es</div>
            </div>
            {pub < 0.5 ? (
              <div style={{ padding: 30, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.texto, lineHeight: 1.8 }}>
                {lineas.map((l, i) => {
                  const n = Math.floor(clamp01(codigo * 4 - i) * l.length);
                  return <div key={i} style={{ color: i % 2 ? C.acentoSuave : C.texto }}>{l.slice(0, n)}</div>;
                })}
              </div>
            ) : (
              <div style={{ padding: 34 }}>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: C.oscuro, lineHeight: 1.05 }}>Tu negocio,<br />en internet.</div>
                <div style={{ display: "inline-block", marginTop: 26, fontFamily: TITULO, fontWeight: 800, fontSize: 30, background: C.acento, color: C.oscuro, padding: "12px 26px", borderRadius: 12 }}>Pide cita</div>
                <div style={{ display: "flex", gap: 16, marginTop: 30 }}>{[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, height: 110, borderRadius: 12, background: "#E4DDCF" }} />)}</div>
              </div>
            )}
          </div>
        )}
        <Logo src={ep.logos.claude_code} x={930} y={830} w={150} t={t} at={T.claude - 0.05} />
        <Etiqueta texto="IDEA" x={560} y={1450} t={t} at={T.idea} out={T.publicada} size={38} variante="borde" fuente="titulo" />
        <Sello texto="PUBLICADA ✓" x={720} y={1480} t={t} at={T.publicada + 0.1} size={62} rot={-5} resalte={1} />
      </>
    );
  }
  if (id === "escalar") {
    const T = { pasar: L.en(id, "Pasar"), tu: L.en(id, "tú solo"), equipo: L.en(id, "equipo"), mismo: L.en(id, "mismo") };
    const v1 = vis(t, T.pasar - 0.1, Infinity, 0.6);
    const tres = sp(t, T.equipo - 0.05, { damping: 12, stiffness: 180 });
    const nueve = sp(t, T.equipo + 0.35, { damping: 12, stiffness: 180 });
    const lineas = ramp(t, T.mismo, T.mismo + 0.4);
    const pos = (i: number) => {
      const fila = Math.floor(i / 3);
      const col = i % 3;
      return { x: 700 + (col - 1) * 200, y: 1180 + (fila - 1) * 190 };
    };
    return (
      <>
        {v1.on &&
          Array.from({ length: 9 }, (_, i) => {
            const p = pos(i);
            const central = i === 4;
            const fila1 = i >= 3 && i <= 5;
            const s = central ? 1 : fila1 ? tres : nueve;
            if (s <= 0.01) return null;
            const x = 700 + (p.x - 700) * s;
            const y = 1180 + (p.y - 1180) * s;
            return (
              <div key={i} style={{ position: "absolute", left: x - 70, top: y - 77, opacity: v1.opacity * Math.min(1, s * 2), transform: `scale(${central ? v1.scale * (1 + 0.15 * (1 - tres)) : 0.6 + 0.4 * s})` }}>
                <Persona w={140} color={central ? C.acento : "#C9C2B4"} />
              </div>
            );
          })}
        {lineas > 0 &&
          Array.from({ length: 9 }, (_, i) => (i === 4 ? null : <Flecha key={i} curva={{ a: { x: 700, y: 1150 }, c: { x: (700 + pos(i).x) / 2, y: (1150 + pos(i).y) / 2 - 30 }, b: { x: pos(i).x, y: pos(i).y - 20 } }} p={lineas} ancho={5} discontinua opacity={0.7} />))}
        <Etiqueta texto="TÚ SOLO" x={700} y={1300} t={t} at={T.tu} out={T.equipo + 0.2} size={36} variante="borde" fuente="titulo" />
        <Etiqueta texto="UN EQUIPO" x={760} y={860} t={t} at={T.equipo + 0.1} size={40} variante="acento" fuente="titulo" />
        <Sello texto="MISMO MÉTODO" x={680} y={1505} t={t} at={T.mismo} size={60} rot={-4} resalte={1} />
      </>
    );
  }
  // seguridad
  const T = { proteger: L.en(id, "Proteger"), construyes: L.en(id, "construyes,"), claves: L.en(id, "claves"), datos: L.en(id, "datos"), vista: L.en(id, "vista.") };
  const v = vis(t, T.proteger - 0.1, Infinity, 0.6);
  const cierra = ramp(t, T.construyes + 0.1, T.construyes + 0.35, (x) => x * x);
  const tapa = ramp(t, T.claves + 0.15, T.claves + 0.5);
  const chip = (texto: React.ReactNode, y: number, at: number, oculta: number) => {
    const e = entra(t, at);
    if (!e.on) return null;
    return (
      <div style={{ position: "absolute", left: 470, top: y, width: 520, opacity: e.op, transform: `translateX(${(1 - e.s) * 120}px)`, display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderRadius: 18, background: C.panel2, border: `3px solid ${oculta > 0.5 ? C.acento : C.borde}`, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.texto, boxSizing: "border-box" }}>
        {texto}
        <svg width={34} height={40} viewBox="0 0 24 28" style={{ marginLeft: "auto", opacity: oculta }}>
          <path d="M6 12 V8 A6 6 0 0 1 18 8 V12" fill="none" stroke={C.acento} strokeWidth={3} />
          <rect x={2} y={12} width={20} height={15} rx={3} fill={C.acento} />
        </svg>
      </div>
    );
  };
  return (
    <>
      {v.on && (
        <div style={{ position: "absolute", left: 640 - 150, top: 800, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale * (1 + 0.08 * Math.sin(clamp01((t - T.construyes - 0.35) / 0.25) * Math.PI))})` }}>
          <Escudo w={300} cierra={cierra} brillo={cierra} />
        </div>
      )}
      {chip(
        <span>
          .env  CLAVE_API=<span style={{ filter: `blur(${tapa * 9}px)` }}>ab12-cd34-ef56</span>
          {tapa > 0.6 ? <span style={{ color: C.gris }}>••••••</span> : null}
        </span>,
        1200,
        T.claves - 0.05,
        tapa,
      )}
      {chip(<span>clientes.xlsx</span>, 1320, T.datos - 0.05, ramp(t, T.datos + 0.2, T.datos + 0.5))}
      <Sello texto="A SALVO" x={640} y={1500} t={t} at={T.vista} size={70} rot={-5} resalte={1} />
    </>
  );
};

export const eventosOpcion13b = (L: Linea, id: string): Evento[] => {
  const cfg = OPC[id];
  const t0 = L.ini(id);
  const t1 = L.en(id, cfg.titulo);
  const td = L.en(id, cfg.demo);
  const base = [
    cue(t0 + 0.25, "interfaz", `${cfg.palabra}: la carta se da la vuelta`, "medio"),
    cue(t1 + 0.1, "remate", `${cfg.palabra}: palabra de la carta`, "medio"),
    cue(td + 0.2, "click", `${cfg.palabra}: etiqueta COMENTA ${cfg.palabra}`, "bajo"),
  ];
  const extra: Evento[] =
    id === "apps"
      ? [cue(L.en(id, "aplicación") + 0.1, "click", "logos de Node.js y AWS", "bajo"), cue(L.en(id, "reservas,"), "click", "fila Reservas", "bajo"), cue(L.en(id, "datos"), "click", "fila Datos", "bajo"), cue(L.en(id, "mismo"), "destello", "sello TODO EN UN SITIO", "medio")]
      : id === "auto"
        ? [cue(L.en(id, "haga solo."), "remate", "sello SE HACE SOLO", "medio"), cue(L.en(id, "WhatsApp"), "destello", "llega el pedido por WhatsApp", "bajo"), cue(L.en(id, "apunta") + 0.15, "glitch", "el pedido viaja a la hoja de cálculo", "bajo"), cue(L.en(id, "hoja") + 0.35, "acierto", "fila apuntada ✓", "bajo")]
        : id === "web"
          ? [cue(L.en(id, "web.") + 0.05, "click", "Next.js, Astro y Vercel", "bajo"), cue(L.en(id, "creada") + 0.05, "teclado", "se escribe el código de la página", "bajo", { desde: 2.0, dur: 1.4 }), cue(L.en(id, "publicada."), "destello", "la página se publica", "medio"), cue(L.en(id, "publicada.") + 0.12, "remate", "sello PUBLICADA", "bajo")]
          : id === "escalar"
            ? [cue(L.en(id, "equipo"), "glitch", "la persona se multiplica: equipo", "bajo"), cue(L.en(id, "equipo") + 0.4, "click", "de 3 a 9 personas", "bajo"), cue(L.en(id, "mismo"), "destello", "sello MISMO MÉTODO", "medio")]
            : [cue(L.en(id, "construyes,") + 0.35, "interfaz", "el candado se cierra", "medio"), cue(L.en(id, "claves") + 0.3, "glitch", "la clave se emborrona", "bajo"), cue(L.en(id, "datos") + 0.3, "click", "clientes.xlsx bloqueado", "bajo"), cue(L.en(id, "vista."), "remate", "sello A SALVO", "medio")];
  return [...base, ...extra];
};
