/**
 * Etapa 3 · Producción (escenas publicar → final).
 *  - Lo publicas donde toque: un cohete despega y su trayectoria se abre hacia HOSTING y VPS.
 *  - Compruebas que funciona publicado: TU ORDENADOR ✓ frente a ONLINE con fallo.
 *  - Accesos listos para el cliente (llaves) y lo básico de seguridad: contraseñas y candado SSL.
 *  - «Y ojo»: el contenido vuelve al peldaño 3 y la cámara sale a la escalera; del peldaño sale una flecha circular
 *    «NO ES EL FINAL» con mantener, arreglar y mejorar, y un punto que no deja de girar (un proyecto vivo).
 */
import React from "react";
import { peldano } from "../componentes/Escalera";
import { Escena } from "../componentes/Escena";
import { Candado, Check, Cohete, Cruz, Engranaje, Escudo, Globo, Llave, LlaveInglesa, Lupa, Mejora, Monitor, Persona, Pulso, Servidor } from "../componentes/Iconos";
import { Etiqueta } from "../componentes/Sello";
import { C, MONO, TITULO, UI, clamp01, enCurva, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const tiempos = (L: Linea) => ({
  lo: L.ini("publicar"),
  publicas: L.en("publicar", "publicas"),
  toque: L.en("publicar", "toque,"),
  segun: L.en("publicar", "según"),
  hosting: L.en("publicar", "hosting,"),
  vps: L.en("publicar", "VPS..."),
  compruebas: L.ini("online"),
  funciona: L.en("online", "funciona"),
  publicado: L.en("online", "publicado,"),
  ordenador: L.en("online", "ordenador"),
  falla: L.en("online", "falla"),
  online: L.en("online", "online."),
  dejas: L.ini("accesos"),
  accesos: L.en("accesos", "accesos"),
  cliente: L.en("accesos", "cliente,"),
  basico: L.en("accesos", "básico"),
  seguridad: L.en("accesos", "seguridad:"),
  contrasenas: L.en("accesos", "contraseñas"),
  ssl: L.en("accesos", "SSL."),
  ojo: L.ini("final"),
  produccion: L.en("final", "producción"),
  final: L.en("final", "final."),
  mantener: L.en("final", "mantener,"),
  arreglar: L.en("final", "arreglar"),
  mejorar: L.en("final", "mejorar."),
  vivo: L.en("final", "Un proyecto"),
  evolucionando: L.en("final", "evolucionando."),
});

/** La etapa vuelve a la escalera al decir «Y ojo». */
export const regresoProduccion = (L: Linea) => L.ini("final") - 0.35;

const PAD = { x: 540, y: 1430 };
const DEST = [
  { x: 270, y: 640, texto: "HOSTING" },
  { x: 810, y: 640, texto: "VPS" },
];
const PANT = { y: 1960 };
const SEG = { y: 2780 };

export const EtapaProduccion: React.FC<BloqueProps> = ({ t, L }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: T.lo - 1.2, x: 540, y: 1200, z: 1.1 },
    { t: T.toque, x: 540, y: 1010, z: 1.04, d: 1.2 },
    { t: T.compruebas - 0.35, x: 540, y: 1960, z: 1.0, d: 0.85 },
    { t: T.falla - 0.25, x: 700, y: 1960, z: 1.12, d: 0.6 },
    { t: T.dejas - 0.35, x: 540, y: 2760, z: 1.0, d: 0.85 },
  ];
  // cohete: en la plataforma, despega al decir «toque» y se queda flotando entre los dos destinos
  const despega = ramp(t, T.toque - 0.1, T.segun + 0.5);
  const ry = PAD.y - 160 - despega * 420 + Math.sin(t * 3) * 6 * despega;
  const llama = ramp(t, T.toque - 0.3, T.toque);
  const destOn = [T.hosting - 0.1, T.vps - 0.1];
  const lupa = ramp(t, T.compruebas, T.publicado + 0.5);
  const okLocal = clamp01((t - T.ordenador) / 0.3);
  const fallo = ramp(t, T.falla - 0.05, T.falla + 0.15);
  const llaves = ramp(t, T.accesos - 0.05, T.cliente + 0.1);
  return (
    <Escena t={t} tomas={tomas}>
      {/* plataforma */}
      {(() => {
        const v = vis(t, T.lo - 0.4, T.compruebas + 0.2, 0.7);
        if (!v.on) return null;
        return <div style={{ position: "absolute", left: PAD.x - 170, top: PAD.y, width: 340, height: 30, borderRadius: 15, background: C.panel2, border: `3px solid ${C.borde}`, opacity: v.opacity, transform: `scaleX(${v.scale})` }} />;
      })()}
      {/* humo del despegue */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = T.toque - 0.05 + i * 0.07;
        const u = ramp(t, a, a + 1.1);
        if (u <= 0 || u >= 1) return null;
        const dx = (i - 2) * 70 * u;
        return <div key={i} style={{ position: "absolute", left: PAD.x + dx - 50 * (0.5 + u), top: PAD.y - 30 - 40 * u, width: 100 * (0.5 + u), height: 100 * (0.5 + u), borderRadius: "50%", background: C.tenue, opacity: 0.5 * (1 - u) }} />;
      })}
      {/* trayectorias a hosting y VPS */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {DEST.map((d, i) => {
          const p = ramp(t, destOn[i] - 0.05, destOn[i] + 0.45);
          if (p <= 0) return null;
          return <path key={i} d={`M ${PAD.x} ${PAD.y - 640} Q ${(PAD.x + d.x) / 2} ${d.y + 40} ${d.x} ${d.y + 120}`} fill="none" stroke={C.acento} strokeWidth={7} strokeLinecap="round" strokeDasharray="4 18" pathLength={1000} strokeDashoffset={-t * 60} style={{ clipPath: `inset(0 ${i === 0 ? 0 : (1 - p) * 100}% 0 ${i === 0 ? (1 - p) * 100 : 0}%)` }} opacity={p} />;
        })}
      </svg>
      {DEST.map((d, i) => {
        const v = vis(t, destOn[i], T.compruebas + 0.2, 0.4);
        if (!v.on) return null;
        return (
          <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", left: -120, top: -110, width: 240, height: 220, borderRadius: 40, background: C.panel2, border: `4px solid ${C.acento}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${v.scale})`, boxShadow: `0 0 ${40 * Math.sin(clamp01((t - destOn[i]) / 0.5) * Math.PI)}px ${C.acento}` }}>
              {i === 0 ? <Globo s={100} /> : <Servidor s={100} t={t} />}
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 38, color: C.texto }}>{d.texto}</div>
            </div>
          </div>
        );
      })}
      {(() => {
        const v = vis(t, T.publicas - 0.15, T.compruebas + 0.2, 0.5);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: PAD.x - 150, top: ry - 150, opacity: v.opacity, transform: `scale(${v.scale}) rotate(${Math.sin(t * 2) * 3 * despega}deg)` }}>
            <Cohete s={300} t={t} llama={llama} />
          </div>
        );
      })()}
      <Etiqueta texto="SEGÚN EL PROYECTO" x={540} y={PAD.y + 110} t={t} at={T.segun} out={T.compruebas + 0.1} size={34} variante="gris" />

      {/* tu ordenador frente a online */}
      {[0, 1].map((i) => {
        const v = vis(t, T.compruebas - 0.3 + i * 0.12, T.dejas + 0.2, 0.6);
        if (!v.on) return null;
        const x = i === 0 ? 280 : 800;
        const mal = i === 1 ? fallo : 0;
        const glitch = mal > 0 && t < T.online + 0.6 ? Math.sin(t * 90) * 10 * mal : 0;
        const carga = i === 1 ? ramp(t, T.publicado - 0.1, T.publicado + 0.6) : 1;
        return (
          <div key={i} style={{ position: "absolute", left: x - 235, top: PANT.y - 200, width: 470, height: 400, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 470, height: 300, borderRadius: 26, background: C.panel, border: `4px solid ${mal > 0.3 ? C.acento : i === 0 && okLocal > 0 ? C.acento : C.borde}`, overflow: "hidden", transform: `translateX(${glitch}px)` }}>
              <div style={{ height: 50, background: C.panel2, display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
                {i === 0 ? <Monitor s={34} /> : <Globo s={34} />}
                <div style={{ flex: 1, height: 20, borderRadius: 10, background: C.fondo }} />
              </div>
              <div style={{ padding: "28px 30px", opacity: carga }}>
                <div style={{ height: 22, width: "60%", borderRadius: 11, background: C.gris }} />
                <div style={{ height: 14, width: "85%", borderRadius: 7, background: C.tenue, marginTop: 22 }} />
                <div style={{ height: 14, width: "70%", borderRadius: 7, background: C.tenue, marginTop: 14 }} />
                <div style={{ height: 50, width: 160, borderRadius: 25, background: mal > 0.3 ? C.tenue : C.acento, marginTop: 26 }} />
              </div>
              {/* franjas de fallo */}
              {mal > 0.2 && [40, 120, 200].map((y, k) => <div key={k} style={{ position: "absolute", left: 0, right: 0, top: y + ((t * 300 + k * 50) % 40), height: 16 + k * 4, background: C.acento, opacity: 0.35 * mal, transform: `translateX(${Math.sin(t * 50 + k) * 30}px)` }} />)}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 310, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 34, letterSpacing: 1, color: C.texto }}>{i === 0 ? "TU ORDENADOR" : "ONLINE"}</div>
            {/* estado */}
            {((i === 0 && okLocal > 0) || (i === 1 && mal > 0)) && (
              <div style={{ position: "absolute", right: -26, top: -30, width: 96, height: 96, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, i === 0 ? T.ordenador : T.falla, { damping: 10, stiffness: 230 })})`, boxShadow: `0 0 30px ${C.acento}AA` }}>
                {i === 0 ? <Check s={64} c={C.oscuro} trazo={7} p={okLocal} /> : <Cruz s={60} c={C.oscuro} trazo={7} p={mal} />}
              </div>
            )}
          </div>
        );
      })}
      {lupa > 0 && lupa < 1 && (
        <div style={{ position: "absolute", left: 680 + Math.sin(lupa * Math.PI * 2) * 80, top: PANT.y - 160 + lupa * 120, opacity: Math.min(1, Math.sin(lupa * Math.PI) * 2) }}>
          <Lupa s={130} c={C.acentoSuave} />
        </div>
      )}

      {/* accesos y seguridad */}
      {(() => {
        const v = vis(t, T.accesos - 0.1, Infinity, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 760 - 150, top: SEG.y - 420, width: 300, height: 220, borderRadius: 34, background: C.panel2, border: `3px solid ${llaves >= 1 ? C.acento : C.borde}`, opacity: v.opacity, transform: `scale(${v.scale})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Persona s={90} />
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.texto, letterSpacing: 1 }}>CLIENTE</div>
          </div>
        );
      })()}
      {(() => {
        const v = vis(t, T.dejas - 0.15, Infinity, 0.5);
        if (!v.on) return null;
        const p = enCurva({ a: { x: 260, y: SEG.y - 310 }, c: { x: 500, y: SEG.y - 520 }, b: { x: 650, y: SEG.y - 330 } }, llaves);
        return (
          <div style={{ position: "absolute", left: p.x - 70, top: p.y - 70, opacity: v.opacity, transform: `scale(${v.scale}) rotate(${-20 + llaves * 40}deg)` }}>
            <Llave s={150} c={C.acento} />
            <div style={{ position: "absolute", left: 46, top: 28 }}>
              <Llave s={120} />
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="ACCESOS LISTOS" x={300} y={SEG.y - 160} t={t} at={T.accesos + 0.2} out={Infinity} size={36} variante="acento" />
      {/* seguridad: escudo, contraseñas, SSL */}
      {(() => {
        const v = vis(t, T.basico - 0.1, Infinity, 0.6);
        if (!v.on) return null;
        const puntos = Math.floor(clamp01((t - T.contrasenas) / 0.6) * 8);
        const ssl = ramp(t, T.ssl - 0.05, T.ssl + 0.3);
        return (
          <div style={{ position: "absolute", left: 540 - 420, top: SEG.y - 40, width: 840, height: 330, borderRadius: 34, background: C.panel, border: `3px solid ${ssl > 0.5 ? C.acento : C.borde}`, opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <div style={{ position: "absolute", left: 40, top: 40, display: "flex", alignItems: "center", gap: 18 }}>
              <Escudo s={84} p={ramp(t, T.seguridad, T.seguridad + 0.4)} />
              <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.texto }}>SEGURIDAD</span>
            </div>
            <div style={{ position: "absolute", left: 40, top: 170, width: 470, height: 100, borderRadius: 22, background: C.panel2, border: `3px solid ${puntos > 0 ? C.acento : C.borde}`, display: "flex", alignItems: "center", padding: "0 26px", gap: 14, boxSizing: "border-box", opacity: ramp(t, T.contrasenas - 0.25, T.contrasenas) }}>
              {Array.from({ length: puntos }, (_, i) => <div key={i} style={{ width: 24, height: 24, borderRadius: "50%", background: C.texto }} />)}
            </div>
            <div style={{ position: "absolute", left: 560, top: 140, width: 240, height: 160, borderRadius: 26, background: ssl > 0.5 ? C.acento : C.panel2, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: ramp(t, T.ssl - 0.3, T.ssl - 0.05), transform: `scale(${1 + Math.sin(ssl * Math.PI) * 0.12})` }}>
              <Candado s={90} abierto={1 - ssl} c={ssl > 0.5 ? C.oscuro : C.texto} />
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: ssl > 0.5 ? C.oscuro : C.texto }}>SSL</span>
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="CONTRASEÑAS" x={330} y={SEG.y + 330} t={t} at={T.contrasenas} out={Infinity} size={32} variante="borde" />
    </Escena>
  );
};

/** Sobre la escalera, tras volver: flecha circular desde el peldaño 3 y lo que sigue (mantener, arreglar, mejorar). */
export const escaleraProduccion: React.FC<{ t: number; L: Linea; hasta: number }> = ({ t, L, hasta }) => {
  const T = tiempos(L);
  if (t < T.ojo) return null;
  const p3 = peldano(3);
  const cx = p3.cx + 15;
  const r = 175;
  const cy = p3.top - 26 - r - 20;
  const traza = ramp(t, T.produccion - 0.1, T.final + 0.2);
  // el punto da vueltas sin parar desde que la flecha se cierra
  const giro = t > T.final + 0.2 ? (t - (T.final + 0.2)) * 1.4 : 0;
  const ang = Math.PI / 2 - giro * Math.PI * 2;
  type IconoChip = React.FC<{ s?: number; c?: string; giro?: number }>;
  const chips: { texto: string; at: number; Icono: IconoChip }[] = [
    { texto: "MANTENER", at: T.mantener, Icono: Engranaje },
    { texto: "ARREGLAR", at: T.arreglar, Icono: LlaveInglesa },
    { texto: "MEJORAR", at: T.mejorar, Icono: Mejora },
  ];
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <marker id="puntaFinal" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={4} markerHeight={4} orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill={C.acento} />
          </marker>
        </defs>
        {/* circunferencia que sale de la huella del peldaño 3 (abajo) y da la vuelta en sentido antihorario */}
        <path
          d={`M ${cx} ${cy + r} A ${r} ${r} 0 1 0 ${cx + r * Math.sin(-0.35)} ${cy + r * Math.cos(-0.35)}`}
          fill="none" stroke={C.acento} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - traza}
          markerEnd={traza > 0.97 ? "url(#puntaFinal)" : undefined} style={{ filter: `drop-shadow(0 0 14px ${C.acento})` }}
        />
      </svg>
      {giro > 0 && <div style={{ position: "absolute", left: cx + r * Math.cos(ang) - 18, top: cy + r * Math.sin(ang) - 18, width: 36, height: 36, borderRadius: "50%", background: C.acentoSuave, boxShadow: `0 0 26px ${C.acento}, 0 0 50px ${C.acento}` }} />}
      {t > T.vivo - 0.2 && (
        <div style={{ position: "absolute", left: cx - 70, top: cy - 70, opacity: ramp(t, T.vivo - 0.2, T.vivo + 0.2), transform: `scale(${sp(t, T.vivo - 0.2, { damping: 11, stiffness: 200 })})` }}>
          <Pulso s={140} t={t} />
        </div>
      )}
      <Etiqueta texto="NO ES EL FINAL" x={390} y={600} t={t} at={T.final - 0.35} out={hasta} size={50} variante="acento" fuente="titulo" />
      {chips.map((c, i) => {
        const v = vis(t, c.at - 0.08, hasta, 0.6);
        if (!v.on) return null;
        const brillo = Math.sin(clamp01((t - c.at) / 0.5) * Math.PI);
        return (
          <div key={i} style={{ position: "absolute", left: 120, top: 700 + i * 110, opacity: v.opacity, transform: `translateX(${(1 - v.s) * -40}px) scale(${v.scale * (1 + 0.08 * brillo)})`, transformOrigin: "0 50%", display: "flex", alignItems: "center", gap: 16, padding: "12px 30px 12px 16px", borderRadius: 999, background: brillo > 0.3 ? C.acento : C.panel2, border: `3px solid ${C.acento}`, fontFamily: UI, fontWeight: 700, fontSize: 38, color: brillo > 0.3 ? C.oscuro : C.texto, whiteSpace: "nowrap" }}>
            <c.Icono s={52} c={brillo > 0.3 ? C.oscuro : C.texto} giro={t * 90} />
            {c.texto}
          </div>
        );
      })}
      <Etiqueta texto="UN PROYECTO VIVO" x={330} y={1090} t={t} at={T.vivo} out={hasta} size={40} variante="borde" />
    </>
  );
};

export const eventosProduccion = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.publicas, sfx: "pop", vol: 0.3 },
    { t: T.toque - 0.1, sfx: "whoosh", vol: 0.45, dur: 1.5 },
    { t: T.hosting - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.vps - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.ordenador, sfx: "tick", vol: 0.4 },
    { t: T.falla, sfx: "golpe", vol: 0.3 },
    { t: T.cliente, sfx: "pop", vol: 0.3 },
    { t: T.contrasenas, sfx: "tecleo", vol: 0.22, dur: 0.6 },
    { t: T.ssl, sfx: "tick", vol: 0.45 },
    { t: T.final - 0.35, sfx: "pop", vol: 0.4 },
    { t: T.mantener, sfx: "pop", vol: 0.3 },
    { t: T.arreglar, sfx: "pop", vol: 0.3 },
    { t: T.mejorar, sfx: "pop", vol: 0.3 },
  ];
};
