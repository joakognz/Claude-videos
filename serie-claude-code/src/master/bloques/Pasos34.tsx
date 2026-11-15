/**
 * Bloque «Pasos 3 y 4» (escenas paso3 → paso4 → paso4b → paso4c): Claude propone el cambio en colores (rojo lo que
 * quita, verde lo que añade); tú decides: aceptar o rechazar; al rechazar se pide otro cambio y llega otra propuesta.
 * Después, el escudo «nada sin tu visto bueno» y su excepción: el modo que se salta los permisos.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Aspa, Caja, CajaTexto, Check, PETICION_2, Paso, PasosHud, ROJO, VERDE, Ventana, pulso, tecleo } from "../componentes/Interfaz";
import { Logo } from "../componentes/Logo";
import { Cursor } from "../componentes/Piezas";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE, MONO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => {
  const fin4 = L.fin("paso4");
  const nada = L.ini("paso4b");
  const rechazas2 = L.en("paso4", "rechazas", 1);
  const otro = L.en("paso4", "otro");
  return {
    p3: L.ini("paso3"),
    claude: L.en("paso3", "Claude"),
    colores: L.en("paso3", "colores"),
    rojo: L.en("paso3", "rojo"),
    quita: L.en("paso3", "quita"),
    verde: L.en("paso3", "verde"),
    anade: L.en("paso3", "añade"),
    p4: L.ini("paso4"),
    tu: L.en("paso4", "Tú"),
    revisas: L.en("paso4", "revisas"),
    aceptas: L.en("paso4", "aceptas"),
    rechazas: L.en("paso4", "rechazas", 0),
    si: L.en("paso4", "Si"),
    rechazas2,
    clic: rechazas2 + 0.3,
    pides: L.en("paso4", "pides"),
    otro,
    nueva: Math.min(otro + 0.3, nada - 0.1),
    fin4,
    nada,
    visto: L.en("paso4b", "visto"),
    con: L.ini("paso4c"),
    excepcion: L.en("paso4c", "excepción"),
    activas: L.en("paso4c", "activas"),
    salta: L.en("paso4c", "salta"),
    bypass: L.en("paso4c", "bypass"),
    claude2: L.en("paso4c", "Claude"),
    pregunta: L.en("paso4c", "pregunta"),
  };
};

const VX = 70; // ventana del cambio: esquina y tamaño
const VTOP = 770;
const VW = 940;
const VH = 540;
const FILA = 66;
const SY = 2090; // escudo

const Codigo: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.texto }) => (
  <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 31, color, whiteSpace: "pre" }}>{children}</span>
);

export const Pasos34: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const fueraA = T.visto - 0.25;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1130, z: 0.96 },
    { t: T.colores - 0.3, x: 540, y: 1050, z: 1.1, d: 0.9 },
    { t: T.p4 - 0.25, x: 540, y: 1130, z: 1.0, d: 0.9 },
    { t: T.si - 0.3, x: 580, y: 1190, z: 1.03, d: 0.9 },
    { t: T.pides - 0.25, x: 540, y: 1150, z: 1.0, d: 0.8 },
    { t: T.visto - 0.7, x: 540, y: SY + 110, z: 1.05, d: 0.8 },
    { t: T.con - 0.3, x: 540, y: SY + 300, z: 0.97, d: 1.0 },
  ];
  // estado del cambio: propuesta 1 → rechazada → propuesta 2
  const quitada = ramp(t, T.clic, T.clic + 0.3);
  const vuelve = ramp(t, T.nueva, T.nueva + 0.3);
  const propuesta = ramp(t, T.colores - 0.1, T.colores + 0.25);
  const rojo = clamp01(propuesta * (1 - quitada) + vuelve);
  const verde = clamp01(propuesta * (1 - quitada) + vuelve);
  const nuevoTexto = t >= T.nueva ? "BIENVENIDO A MI NEGOCIO" : "Bienvenido a mi negocio";
  const sacudida = t > T.clic && t < T.clic + 0.4 ? Math.sin((t - T.clic) * 70) * (0.4 - (t - T.clic)) * 22 : 0;
  const brillo = (a: number, d = 0.7) => ramp(t, a - 0.05, a + 0.12) * (1 - ramp(t, a + d - 0.2, a + d));
  const escrito = t < T.nueva - 0.1 ? tecleo(PETICION_2, t, T.pides - 0.25, Math.max(T.pides + 0.3, T.otro + 0.12)) : "";
  const cur = ramp(t, T.si - 0.1, T.clic - 0.05, EASE);
  const curOp = ramp(t, T.si - 0.15, T.si + 0.1) * (1 - ramp(t, T.clic + 0.35, T.clic + 0.6));
  // excepción
  const activo = sp(t, T.activas + 0.25, { damping: 13, stiffness: 180 });
  const sinEscudo = ramp(t, T.activas + 0.25, T.activas + 0.7);
  return (
    <>
      <Escena t={t} tomas={tomas}>
        <Ventana x={VX + VW / 2} y={VTOP + VH / 2} w={VW} h={VH} t={t} at={T.claude - 0.2} out={fueraA} titulo="index.html" logo={ep.logos.vscode} sacudida={sacudida}>
          <div style={{ position: "absolute", left: 34, top: 22, display: "flex", alignItems: "center", gap: 16 }}>
            <Img src={staticFile(ep.logos.claude)} style={{ width: 50, transform: `scale(${1 + 0.25 * pulso(t, T.claude, 0.4) + 0.25 * pulso(t, T.nueva, 0.4)})` }} />
            <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 32, color: C.texto }}>Claude propone este cambio</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 96 }}>
            <div style={{ height: FILA, display: "flex", alignItems: "center", paddingLeft: 34 }}>
              <Codigo color={C.gris}>{"  <body>"}</Codigo>
            </div>
            <div style={{ height: FILA, display: "flex", alignItems: "center", paddingLeft: 34, background: `rgba(247,118,142,${0.2 * rojo + 0.25 * brillo(T.rojo, 1.0)})`, borderLeft: `8px solid rgba(247,118,142,${rojo})` }}>
              <Codigo color={rojo > 0.5 ? ROJO : C.texto}>{`${rojo > 0.5 ? "-" : " "}   <h1>Mi negocio</h1>`}</Codigo>
              <Chip texto="QUITA" color={ROJO} t={t} at={T.quita - 0.05} out={T.clic + 0.1} />
            </div>
            <div style={{ height: FILA * verde, overflow: "hidden", opacity: verde, display: "flex", alignItems: "center", paddingLeft: 34, background: `rgba(158,206,106,${0.2 + 0.25 * brillo(T.verde, 1.0) + 0.3 * brillo(T.nueva, 0.8)})`, borderLeft: `8px solid ${VERDE}` }}>
              <Codigo color={VERDE}>{`+   <h1>${nuevoTexto}</h1>`}</Codigo>
              <Chip texto="AÑADE" color={VERDE} t={t} at={T.anade - 0.05} out={T.clic + 0.1} />
            </div>
            <div style={{ height: FILA, display: "flex", alignItems: "center", gap: 12, paddingLeft: 34 + 96 }}>
              {[190, 120, 240].map((w, i) => (
                <div key={i} style={{ width: w, height: 14, borderRadius: 7, background: C.tenue }} />
              ))}
            </div>
            <div style={{ height: FILA, display: "flex", alignItems: "center", paddingLeft: 34 }}>
              <Codigo color={C.gris}>{"  </body>"}</Codigo>
            </div>
          </div>
        </Ventana>

        {/* aceptar / rechazar */}
        {[
          { x: 70, texto: "Aceptar", color: VERDE, glow: brillo(T.aceptas, 0.8), icono: "check" as const },
          { x: 550, texto: "Rechazar", color: ROJO, glow: Math.max(brillo(T.rechazas, 0.8), brillo(T.clic, 0.5)), icono: "aspa" as const },
        ].map((b, i) => {
          const v = vis(t, T.revisas - 0.05 + i * 0.08, T.pides - 0.05, 0.7);
          if (!v.on) return null;
          const hund = i === 1 ? pulso(t, T.clic - 0.05, 0.25) * 0.1 : 0;
          return (
            <div key={i} style={{ position: "absolute", left: b.x, top: 1360, width: 440, height: 124, boxSizing: "border-box", borderRadius: 34, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale * (1 + 0.07 * b.glow - hund)})`, background: b.glow > 0.05 ? `color-mix(in srgb, ${b.color} ${Math.round(18 + 70 * b.glow)}%, ${C.panel})` : C.panel, border: `4px solid ${b.color}`, boxShadow: `0 0 ${50 * b.glow}px ${b.color}99`, fontFamily: UI, fontWeight: 700, fontSize: 46, color: b.glow > 0.5 ? C.oscuro : C.texto }}>
              {b.icono === "check" ? <Check size={52} p={1} color={b.glow > 0.5 ? C.oscuro : b.color} /> : <Aspa size={48} p={1} color={b.glow > 0.5 ? C.oscuro : b.color} />}
              {b.texto}
            </div>
          );
        })}
        <Cursor x={880 + (800 - 880) * cur} y={1640 + (1420 - 1640) * cur} pulsa={pulso(t, T.clic - 0.08, 0.25)} opacity={curOp} size={76} />
        {/* otra petición */}
        <Caja x={70} y={1360} w={940} t={t} at={T.pides - 0.05} out={fueraA} desde={0.85}>
          <CajaTexto w={940} t={t} texto={escrito} activo={t < T.nueva - 0.05} size={40} vacio="Escribe tu petición…" />
        </Caja>
        <Sello texto="TÚ DECIDES" x={540} y={1578} t={t} at={T.tu} out={fueraA} size={54} rot={-3} />
        <Etiqueta texto="OTRA PROPUESTA" x={840} y={VTOP + 34} t={t} at={T.nueva + 0.1} out={fueraA} size={30} variante="acento" />

        {/* nada sin tu visto bueno */}
        {(() => {
          const v = vis(t, T.visto - 0.45, hasta + 0.4, 0.5);
          if (!v.on) return null;
          const color = sinEscudo > 0.5 ? C.tenue : C.acento;
          return (
            <div style={{ position: "absolute", left: 540 - 140, top: SY - 150, width: 280, height: 300, opacity: v.opacity * (1 - 0.35 * sinEscudo), transform: `translateY(${v.y}px) scale(${v.scale * (1 + 0.08 * pulso(t, T.visto + 0.25, 0.35))})` }}>
              <svg width={280} height={300} viewBox="0 0 24 25.7">
                <path d="M12 1.6 L21 5 V11.6 C21 17.4 17.2 21.9 12 24 C6.8 21.9 3 17.4 3 11.6 V5 Z" fill={`rgba(217,119,87,${0.14 * (1 - sinEscudo)})`} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
                <path d="M7.6 12.4 L10.9 15.7 L16.8 9.2" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={14} strokeDashoffset={14 * (1 - ramp(t, T.visto + 0.05, T.visto + 0.35) * (1 - sinEscudo))} />
                <path d="M5 21 L19 4.5" fill="none" stroke={C.gris} strokeWidth={1.7} strokeLinecap="round" strokeDasharray={22} strokeDashoffset={22 * (1 - sinEscudo)} />
              </svg>
            </div>
          );
        })()}
        <Sello texto="NADA SIN TU VISTO BUENO" x={540} y={SY + 240} t={t} at={T.visto + 0.4} out={hasta + 0.4} size={50} rot={-3} resalte={0} />
        {/* excepción */}
        <Etiqueta texto="EXCEPCIÓN" x={540} y={SY + 395} t={t} at={T.excepcion - 0.05} out={hasta + 0.4} size={44} variante="acento" fuente="titulo" />
        <Caja x={110} y={SY + 460} w={860} h={170} t={t} at={T.activas - 0.15} out={hasta + 0.4} style={{ borderRadius: 38, background: C.panel, border: `4px solid ${activo > 0.5 ? C.acento : C.borde}`, display: "flex", alignItems: "center", padding: "0 40px", boxShadow: `0 0 ${40 * pulso(t, T.bypass, 0.6)}px ${C.acento}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.texto, transform: `scale(${1 + 0.05 * pulso(t, T.bypass, 0.5)})`, transformOrigin: "0 50%" }}>Bypass permissions</div>
            <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 31, color: C.gris, marginTop: 8, opacity: ramp(t, T.salta - 0.3, T.salta) }}>Se salta los permisos</div>
          </div>
          <div style={{ width: 150, height: 84, borderRadius: 42, background: `color-mix(in srgb, ${C.acento} ${Math.round(clamp01(activo) * 100)}%, ${C.tenue})`, position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 9, left: 9 + 66 * Math.min(1.08, activo), width: 66, height: 66, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }} />
          </div>
        </Caja>
        {/* los cambios ya entran sin preguntar */}
        {t > T.claude2 - 0.1 &&
          [0, 1, 2].map((k) => {
            const u = ((((t - T.claude2) / 1.1 + k / 3) % 1) + 1) % 1;
            const op = Math.min(1, u / 0.12, (1 - u) / 0.12) * ramp(t, T.claude2 - 0.1, T.claude2 + 0.2);
            return <div key={k} style={{ position: "absolute", left: 250 + 640 * EASE(u) - 45, top: SY - 9 + (k - 1) * 46, width: 90, height: 18, borderRadius: 9, background: VERDE, opacity: op, boxShadow: `0 0 18px ${VERDE}` }} />;
          })}
        <Logo src={ep.logos.claude} x={175} y={SY} w={130} t={t} at={T.claude2 - 0.05} out={hasta + 0.4} rot={(t - T.claude2) * 40} sombra={false} />
        <Etiqueta texto="YA NO TE PREGUNTA" x={540} y={SY + 710} t={t} at={T.pregunta - 0.35} out={hasta + 0.4} size={46} variante="borde" fuente="titulo" />
      </Escena>
      <Paso n={3} t={t} at={T.p3} out={T.claude - 0.02} />
      <Paso n={4} t={t} at={T.p4} out={T.tu - 0.02} />
      <PasosHud t={t} at={desde - 0.4} out={hasta + 0.5} inicios={[-Infinity, -Infinity, T.p3, T.p4, Infinity]} />
    </>
  );
};

/** Etiqueta pequeña al final de una fila del cambio. */
const Chip: React.FC<{ texto: string; color: string; t: number; at: number; out: number }> = ({ texto, color, t, at, out }) => {
  const v = vis(t, at, out, 0.5);
  if (!v.on) return null;
  return (
    <div style={{ marginLeft: "auto", marginRight: 26, padding: "6px 20px", borderRadius: 999, background: color, color: C.oscuro, fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: 1, opacity: v.opacity, transform: `scale(${v.scale})` }}>{texto}</div>
  );
};

export const eventosPasos34 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.p3 + 0.08, sfx: "golpe", vol: 0.6 },
    { t: T.claude - 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.colores, sfx: "pop", vol: 0.4 },
    { t: T.quita, sfx: "tick", vol: 0.4 },
    { t: T.anade, sfx: "tick", vol: 0.4 },
    { t: T.p4 + 0.08, sfx: "golpe", vol: 0.6 },
    { t: T.tu + 0.08, sfx: "golpe", vol: 0.45 },
    { t: T.aceptas, sfx: "pop", vol: 0.35 },
    { t: T.rechazas, sfx: "pop", vol: 0.35 },
    { t: T.clic, sfx: "tick", vol: 0.55 },
    { t: T.pides - 0.25, sfx: "tecleo", vol: 0.3, dur: Math.max(0.4, T.otro + 0.12 - T.pides + 0.25) },
    { t: T.nueva, sfx: "envio", vol: 0.4 },
    { t: T.visto - 0.65, sfx: "whoosh", vol: 0.3 },
    { t: T.visto + 0.48, sfx: "golpe", vol: 0.55 },
    { t: T.excepcion, sfx: "pop", vol: 0.4 },
    { t: T.activas + 0.25, sfx: "tick", vol: 0.55 },
    { t: T.claude2, sfx: "whoosh", vol: 0.25 },
  ];
};
