/**
 * EP.6 · bloque «Peticiones» (escenas diferencia → floja → buena): MISMO CLAUDE, DISTINTA PETICIÓN.
 * Arriba, la caja de Claude Code; en medio, Claude; abajo, dos móviles.
 * PETICIÓN FLOJA: se escribe «hazme una web» (al ritmo de la voz) → sale un boceto gris genérico → ✗ NO TE SIRVE.
 * PETICIÓN BUENA: se escribe la petición larga; cada pieza se subraya cuando suena y aparece en el móvil (una
 * página · fontanero de Madrid · botón grande de WhatsApp · colores azules · sección de precios) → ✓ A LA PRIMERA.
 * La web es un boceto: sin teléfono, sin precios y sin nombre de empresa.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Logo } from "../../componentes/Logo";
import { Etiqueta } from "../../componentes/Sello";
import { C, TITULO, UI, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Frase, Pop } from "../../ep05/kit";
import { Asterisco, VS } from "../../ep05/ui";
import { TextoVoz, Telefono, Veredicto, sinComillas, tramo } from "../../ep06/kit6";

const CAJA = { x: 50, y: 810, w: 980 };
const CLAUDE_Y = 1200;
const TEL = { y: 1690, w: 400, izq: 280, der: 800 };

const tiempos = (L: LineaT) => {
  const floja = tramo(L, "floja", "«hazme", "web».");
  const buena = tramo(L, "buena", "«hazme", "precios».");
  return {
    floja,
    buena,
    mira: L.ini("diferencia"),
    diferencia: L.en("diferencia", "diferencia."),
    mismo: L.en("diferencia", "Mismo"),
    claude: L.en("diferencia", "Claude,"),
    distinta: L.en("diferencia", "distinta"),
    peticion: L.en("diferencia", "petición."),
    p1: L.ini("floja"),
    floja1: L.en("floja", "floja:"),
    enviaF: floja[floja.length - 1].fin + 0.05,
    resultadoF: L.en("floja", "Resultado:"),
    generico: L.en("floja", "genérico"),
    sirve: L.en("floja", "sirve."),
    p2: L.ini("buena"),
    buena1: L.en("buena", "buena:"),
    hazme2: buena[0].inicio,
    pagina: L.en("buena", "página"),
    fontanero: L.en("buena", "fontanero"),
    boton: L.en("buena", "botón"),
    whatsapp: L.en("buena", "WhatsApp,"),
    colores: L.en("buena", "colores"),
    azules: L.en("buena", "azules"),
    seccion: L.en("buena", "sección"),
    precios: L.en("buena", "precios»."),
    enviaB: buena[buena.length - 1].fin + 0.05,
    resultadoB: L.en("buena", "Resultado:"),
    puedes: L.en("buena", "puedes"),
    primera: L.en("buena", "primera."),
  };
};

export const Peticiones: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 0.9 },
    { t: T.p1 - 0.3, x: 540, y: 980, z: 1.08, d: 0.8 },
    { t: T.enviaF - 0.1, x: 400, y: 1450, z: 1.0, d: 0.8 },
    { t: T.resultadoF - 0.1, x: TEL.izq + 40, y: TEL.y, z: 1.12, d: 0.8 },
    { t: T.p2 - 0.35, x: 540, y: 1000, z: 1.02, d: 0.9 },
    { t: T.pagina - 0.2, x: 640, y: 1380, z: 0.86, d: 1.0 },
    { t: T.resultadoB - 0.15, x: TEL.der - 40, y: TEL.y, z: 1.1, d: 0.8 },
    { t: T.primera - 0.25, x: 540, y: TEL.y - 30, z: 0.92, d: 0.9 },
  ];
  // la caja: primero la petición floja, luego se vacía y se escribe la buena
  const enBuena = t >= T.hazme2 - 0.05;
  const enviadaF = t >= T.enviaF;
  const enviadaB = t >= T.enviaB;
  const pulso = (at: number) => Math.sin(Math.min(1, Math.max(0, (t - at) / 0.25)) * Math.PI);
  const resaltesB = [4, 5, 8, 9, 10, 13, 14, 15, 16, 17, 18, 21, 22, 23];
  const piezaB = (a: number) => sp(t, a - 0.05, { damping: 13, stiffness: 170 });
  return (
    <Escena t={t} tomas={tomas}>
      {/* título */}
      {[
        [{ w: "Mismo", at: T.mismo }, { w: "Claude,", at: T.claude, acento: true }],
        [{ w: "distinta", at: T.distinta }, { w: "petición", at: T.peticion, acento: true }],
      ].map((ps, i) => (
        <div key={i} style={{ position: "absolute", left: 540, top: 560 + i * 95, width: 0, height: 0 }}>
          <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
            <Frase t={t} out={T.p1 + 0.2} size={80} palabras={ps} />
          </div>
        </div>
      ))}

      {/* caja de Claude Code */}
      {(() => {
        const v = vis(t, T.mira - 0.1, hasta + 0.4, 0.9);
        if (!v.on) return null;
        const escribiendo = enBuena ? !enviadaB : t >= T.floja[0].inicio - 0.05 && !enviadaF;
        const pal = enBuena ? T.buena : T.floja;
        const mostrar = t >= T.floja[0].inicio - 0.05;
        return (
          <div style={{ position: "absolute", left: CAJA.x, top: CAJA.y, width: CAJA.w, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, transformOrigin: "50% 0" }}>
            <div style={{ borderRadius: 26, background: "#1F1F1F", border: "2px solid #3A3A3A", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", padding: "18px 24px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: UI, fontWeight: 700, fontSize: 26, color: VS.texto, marginBottom: 14 }}>
                <Asterisco size={28} />
                Claude Code
                <div style={{ flex: 1 }} />
                {enBuena ? (
                  <span style={{ padding: "4px 16px", borderRadius: 999, background: C.acento, color: C.oscuro, fontSize: 22 }}>PETICIÓN BUENA</span>
                ) : t >= T.p1 - 0.05 ? (
                  <span style={{ padding: "4px 16px", borderRadius: 999, background: "#3A3A3A", color: VS.texto, fontSize: 22 }}>PETICIÓN FLOJA</span>
                ) : null}
              </div>
              <div style={{ borderRadius: 14, border: `2px solid ${escribiendo ? VS.entrada : VS.cajaBorde}`, background: "#1B1B1B", padding: "16px 20px", minHeight: 64 }}>
                {mostrar ? (
                  <TextoVoz palabras={pal} t={t} size={enBuena ? 36 : 44} limpiar={sinComillas} resaltes={enBuena ? resaltesB : []} cursor={escribiendo} />
                ) : (
                  <span style={{ fontFamily: UI, fontWeight: 600, fontSize: 30, color: VS.tenue }}>⌘ Esc to focus or unfocus Claude</span>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Claude en medio: el mismo para las dos peticiones */}
      <Logo src={ep.logos.claude} x={540} y={CLAUDE_Y} w={110} t={t} at={T.claude - 0.1} out={hasta + 0.4} pulsos={[T.enviaF, T.enviaB]} />
      <Flecha curva={{ a: { x: 490, y: CLAUDE_Y + 40 }, c: { x: 330, y: CLAUDE_Y + 40 }, b: { x: TEL.izq, y: TEL.y - 420 } }} p={ramp(t, T.enviaF, T.enviaF + 0.4)} ancho={8} color={C.gris} opacity={1 - 0.6 * ramp(t, T.p2, T.p2 + 0.4)} />
      <Flecha curva={{ a: { x: 590, y: CLAUDE_Y + 40 }, c: { x: 750, y: CLAUDE_Y + 40 }, b: { x: TEL.der, y: TEL.y - 420 } }} p={ramp(t, T.pagina - 0.3, T.pagina + 0.1)} ancho={8} />

      {/* móvil de la petición floja */}
      {(() => {
        const v = vis(t, T.diferencia - 0.1, hasta + 0.4, 0.7);
        if (!v.on) return null;
        const hecho = sp(t, T.resultadoF - 0.05, { damping: 14, stiffness: 150 });
        return (
          <div style={{ position: "absolute", left: TEL.izq - TEL.w / 2, top: TEL.y - 390, opacity: v.opacity * (enBuena ? 1 - 0.45 * ramp(t, T.hazme2, T.hazme2 + 0.5) + 0.45 * ramp(t, T.primera - 0.2, T.primera + 0.2) : 1), transform: `translateY(${v.y}px) scale(${v.scale * (1 + 0.03 * pulso(T.sirve))})` }}>
            {t < T.resultadoF - 0.05 ? (
              <div style={{ width: TEL.w, height: 780, borderRadius: 56, border: `6px dashed ${C.borde}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 90, color: C.tenue }}>?</div>
            ) : (
              <div style={{ opacity: Math.min(1, hecho * 1.6), transform: `scale(${0.85 + 0.15 * hecho})` }}>
                <Telefono w={TEL.w} estado={{ modo: "generica" }} whatsapp={ep.logos.whatsapp} t={t} />
              </div>
            )}
          </div>
        );
      })()}
      <Etiqueta texto="GENÉRICO" x={TEL.izq} y={TEL.y + 40} t={t} at={T.generico - 0.05} out={T.p2 + 0.3} size={44} variante="borde" fuente="titulo" />
      <Pop x={TEL.izq + 150} y={TEL.y - 330} t={t} at={T.sirve - 0.08} out={hasta + 0.4} rot={-20}>
        <Veredicto ok={false} size={120} dibujo={ramp(t, T.sirve, T.sirve + 0.3)} />
      </Pop>
      <Etiqueta texto="NO TE SIRVE" x={TEL.izq} y={TEL.y + 450} t={t} at={T.sirve - 0.03} out={hasta + 0.4} size={40} variante="borde" fuente="titulo" />

      {/* móvil de la petición buena */}
      {(() => {
        const v = vis(t, T.diferencia - 0.05, hasta + 0.4, 0.7);
        if (!v.on) return null;
        const vacio = t < T.pagina - 0.05;
        return (
          <div style={{ position: "absolute", left: TEL.der - TEL.w / 2, top: TEL.y - 390, opacity: v.opacity * (t < T.p2 ? 0.55 : 1), transform: `translateY(${v.y}px) scale(${v.scale * (1 + 0.03 * pulso(T.primera))})` }}>
            {vacio ? (
              <div style={{ width: TEL.w, height: 780, borderRadius: 56, border: `6px dashed ${C.borde}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 90, color: C.tenue }}>?</div>
            ) : (
              <Telefono
                w={TEL.w}
                t={t}
                whatsapp={ep.logos.whatsapp}
                estado={{ modo: "pedida", pagina: piezaB(T.pagina), cabecera: piezaB(T.fontanero), boton: piezaB(T.boton), azul: ramp(t, T.colores, T.azules + 0.3), precios: piezaB(T.seccion) }}
              />
            )}
          </div>
        );
      })()}
      <Pop x={TEL.der + 150} y={TEL.y - 330} t={t} at={T.puedes - 0.05} out={hasta + 0.4} rot={20} latidos={[T.primera]}>
        <Veredicto ok size={120} dibujo={ramp(t, T.puedes + 0.05, T.puedes + 0.35)} />
      </Pop>
      <Etiqueta texto="USABLE A LA PRIMERA" x={TEL.der - 20} y={TEL.y + 450} t={t} at={T.primera - 0.05} out={hasta + 0.4} size={40} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosPeticiones = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  const fl = T.floja;
  const bu = T.buena;
  return [
    { t: T.mismo, sfx: "pop", vol: 0.3 },
    { t: T.p1, sfx: "pop", vol: 0.3 },
    { t: fl[0].inicio, sfx: "tecleo", vol: 0.26, dur: fl[fl.length - 1].fin - fl[0].inicio },
    { t: T.enviaF, sfx: "envio", vol: 0.4 },
    { t: T.resultadoF, sfx: "pop", vol: 0.35 },
    { t: T.sirve + 0.05, sfx: "golpe", vol: 0.4 },
    { t: bu[0].inicio, sfx: "tecleo", vol: 0.24, dur: bu[bu.length - 1].fin - bu[0].inicio },
    { t: T.pagina, sfx: "pop", vol: 0.3 },
    { t: T.fontanero, sfx: "pop", vol: 0.3 },
    { t: T.boton, sfx: "pop", vol: 0.3 },
    { t: T.seccion, sfx: "pop", vol: 0.3 },
    { t: T.enviaB, sfx: "envio", vol: 0.4 },
    { t: T.puedes + 0.05, sfx: "tick", vol: 0.5 },
    { t: T.primera + 0.05, sfx: "golpe", vol: 0.45 },
  ];
};
