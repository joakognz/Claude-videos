/**
 * EP.8 · PASO 2: los que se arreglan desde tu cuenta (escenas paso2 → e401 → e400).
 * 401: el cartel cae con «TU LLAVE YA NO ABRE», la llave no gira en la cerradura → RECONECTA (botón de inicio de
 * sesión con el logo de Claude). 400: el cartel gira a «TARJETA RECHAZADA», el datáfono deniega la tarjeta →
 * CRÉDITO / LÍMITE DE GASTO → se escribe platform.claude.com y se recrea la consola (facturación, datos ficticios).
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Cursor } from "../../componentes/Piezas";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Cartel, caraCodigo } from "../../componentes/ep08/Cartel";
import { Burbuja, Cerradura, Check, Datafono, IcoCuenta, Pieza, Pildora } from "../../componentes/ep08/Dibujos";
import { Consola, Navegador } from "../../componentes/ep08/Pantallas";
import { C, EASE, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const URL = "platform.claude.com";
const NAV = { x: 70, y: 2560, w: 940, h: 800 };
const BOTON = { x: 845, y: 2890 };

const tiempos = (L: Linea) => ({
  paso: L.en("paso2", "Paso"),
  arreglan: L.en("paso2", "arreglan"),
  cuenta0: L.en("paso2", "cuenta."),
  c401: L.en("e401", "401:"),
  llave: L.en("e401", "llave"),
  abre: L.en("e401", "abre."),
  clave: L.en("e401", "clave"),
  sesion: L.en("e401", "sesión"),
  vuelve: L.en("e401", "Vuelve"),
  inicia: L.en("e401", "inicia"),
  fin401: L.fin("e401"),
  c400: L.en("e400", "400,"),
  aviso: L.en("e400", "aviso"),
  tarjeta: L.en("e400", "tarjeta"),
  rechazada: L.en("e400", "rechazada"),
  credito: L.en("e400", "crédito"),
  limite: L.en("e400", "límite"),
  entra: L.en("e400", "Entra"),
  url: L.en("e400", URL + ","),
  urlFin: L.finDe("e400", URL + ","),
  revisa: L.en("e400", "revisa"),
  cuenta: L.en("e400", "cuenta"),
  recarga: L.en("e400", "recarga."),
});

export const Cuenta: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 950, z: 1.0 },
    { t: T.c401 - 0.55, x: 540, y: 1830, z: 0.95, d: 1.0 },
    { t: T.c400 - 0.2, x: 540, y: 1850, z: 0.99, d: 0.8 },
    { t: T.credito - 0.3, x: 540, y: 1890, z: 0.95, d: 0.9 },
    { t: T.entra - 0.2, x: 540, y: 2950, z: 1.0, d: 1.0 },
    { t: T.revisa - 0.05, x: 560, y: 2880, z: 1.08, d: 0.8 },
    { t: T.recarga - 0.25, x: 560, y: 2930, z: 1.05, d: 0.8 },
  ];
  const fueraCab = T.c401 - 0.2;
  const fuera401 = T.c400 + 0.1;
  // botón de inicio de sesión (401)
  const vLogin = vis(t, T.vuelve - 0.05, fuera401, 0.8);
  const clicLogin = T.inicia + 0.15;
  const curA = { x: 860, y: 2200 };
  const curB = { x: 600, y: 2040 };
  const irA = ramp(t, T.vuelve + 0.2, clicLogin - 0.05, EASE);
  const hundeLogin = Math.sin(clamp01((t - clicLogin) / 0.2) * Math.PI) * 0.06;
  // navegador (400)
  const vNav = vis(t, T.entra - 0.1, Infinity, 0.85);
  const finUrl = Math.min(T.urlFin - 0.1, T.url + 1.1);
  const letras = ramp(t, T.url, finUrl, (x) => x) * URL.length;
  const carga = ramp(t, finUrl + 0.1, finUrl + 0.45);
  const clicBoton = T.recarga + 0.1;
  const curC = { x: 960, y: 3260 };
  const irC = ramp(t, T.cuenta, clicBoton - 0.05, EASE);
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── cabecera ── */}
      <Sello texto="PASO 2" x={540} y={780} t={t} at={T.paso} out={fueraCab} size={60} rot={-5} />
      <Etiqueta texto="SE ARREGLA DESDE TU CUENTA" x={540} y={950} t={t} at={T.arreglan - 0.1} out={fueraCab} size={50} variante="texto" fuente="titulo" />
      <Pieza x={450} y={1130} t={t} at={T.cuenta0 - 0.1} out={fueraCab}>
        <Burbuja s={140}><IcoCuenta s={76} /></Burbuja>
      </Pieza>
      <Logo src={ep.logos.claude} x={640} y={1130} w={120} t={t} at={T.cuenta0} out={fueraCab} />

      {/* ── el cartel ── */}
      <Cartel
        x={540} y={1300} w={520} t={t} entra={T.c401 - 0.35}
        caras={[
          { at: 0, cara: caraCodigo("401", "TU LLAVE YA NO ABRE", "authentication_error") },
          { at: T.c400 - 0.05, cara: caraCodigo("400", "TARJETA RECHAZADA", "invalid_request_error") },
        ]}
        out={T.entra + 0.6}
      />

      {/* ── 401 ── */}
      <Pieza x={540} y={2000} t={t} at={T.llave - 0.2} out={T.vuelve}>
        <Cerradura t={t} entra={T.llave - 0.15} intenta={T.abre - 0.2} falla={T.abre + 0.25} />
      </Pieza>
      <Etiqueta texto="CLAVE O SESIÓN CADUCADA" x={540} y={2290} t={t} at={T.sesion - 0.05} out={T.vuelve + 0.2} size={40} variante="borde" fuente="titulo" />
      {vLogin.on && (
        <div style={{ position: "absolute", left: 540, top: 2010, width: 0, height: 0, opacity: vLogin.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vLogin.y}px) scale(${vLogin.scale * (1 - hundeLogin)})`, display: "flex", alignItems: "center", gap: 22, padding: "26px 46px", borderRadius: 999, background: "#F4F3EE", border: `5px solid ${t > clicLogin ? C.acento : "#F4F3EE"}`, boxShadow: "0 24px 60px rgba(0,0,0,0.55)", whiteSpace: "nowrap" }}>
            <Img src={staticFile(ep.logos.claude)} style={{ width: 64 }} />
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 50, color: "#1F1E1D" }}>Iniciar sesión</div>
            {t > clicLogin + 0.15 && <Check s={60} p={sp(t, clicLogin + 0.15, { damping: 10, stiffness: 220 })} />}
          </div>
        </div>
      )}
      {t > T.vuelve + 0.1 && t < fuera401 && (
        <Cursor x={curA.x + (curB.x - curA.x) * irA} y={curA.y + (curB.y - curA.y) * irA} pulsa={Math.sin(clamp01((t - clicLogin + 0.05) / 0.2) * Math.PI)} opacity={clamp01((t - T.vuelve - 0.1) / 0.2) * (1 - ramp(t, fuera401 - 0.3, fuera401))} />
      )}
      <Sello texto="RECONECTA" x={540} y={2270} t={t} at={T.vuelve + 0.4} out={fuera401} size={58} rot={4} />

      {/* ── 400 ── */}
      <Etiqueta texto="AVISO DE SALDO" x={540} y={1890} t={t} at={T.aviso - 0.05} out={T.tarjeta - 0.1} size={44} variante="acento" fuente="titulo" />
      <Pieza x={540} y={2085} t={t} at={T.tarjeta - 0.25} out={T.entra + 0.4}>
        <Datafono t={t} entra={T.tarjeta - 0.25} rechaza={T.rechazada + 0.35} />
      </Pieza>
      <Pieza x={300} y={2335} t={t} at={T.credito - 0.05} out={T.entra + 0.4}>
        <Pildora texto="CRÉDITO" size={36} />
      </Pieza>
      <Etiqueta texto="o" x={500} y={2335} t={t} at={T.credito + 0.3} out={T.entra + 0.4} size={36} variante="gris" fuente="titulo" />
      <Pieza x={740} y={2335} t={t} at={T.limite - 0.05} out={T.entra + 0.4}>
        <Pildora texto="LÍMITE DE GASTO" size={36} />
      </Pieza>

      {/* ── la consola ── */}
      {vNav.on && (
        <div style={{ position: "absolute", left: NAV.x, top: NAV.y, opacity: vNav.opacity, transform: `translateY(${vNav.y}px) scale(${vNav.scale})` }}>
          <Navegador w={NAV.w} h={NAV.h} t={t} url={URL} letras={letras} carga={carga}>
            <Consola t={t} logo={ep.logos.claude} resalteSaldo={T.revisa + 0.05} resalteGasto={T.cuenta} pulsaBoton={clicBoton} />
          </Navegador>
        </div>
      )}
      {t > T.cuenta - 0.1 && (
        <Cursor x={curC.x + (BOTON.x - curC.x) * irC} y={curC.y + (BOTON.y - curC.y) * irC} pulsa={Math.sin(clamp01((t - clicBoton + 0.05) / 0.2) * Math.PI)} opacity={clamp01((t - T.cuenta + 0.1) / 0.2)} />
      )}
      <Sello texto="REVISA Y RECARGA" x={560} y={3300} t={t} at={T.recarga} out={hasta + 0.3} size={56} rot={-3} />
    </Escena>
  );
};

export const eventosCuenta = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso + 0.12, sfx: "golpe", vol: 0.5 },
    { t: T.arreglan - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.cuenta0 - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.c401 - 0.35, sfx: "whoosh", vol: 0.3 },
    { t: T.c401 - 0.1, sfx: "golpe", vol: 0.35 },
    { t: T.llave - 0.15, sfx: "whoosh", vol: 0.2 },
    { t: T.abre + 0.25, sfx: "golpe", vol: 0.4 },
    { t: T.sesion - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.vuelve - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.vuelve + 0.52, sfx: "golpe", vol: 0.45 },
    { t: T.inicia + 0.15, sfx: "tick", vol: 0.5 },
    { t: T.c400 - 0.05, sfx: "whoosh", vol: 0.3 },
    { t: T.aviso - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.rechazada + 0.35, sfx: "golpe", vol: 0.45 },
    { t: T.credito - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.limite - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.entra - 0.1, sfx: "whoosh", vol: 0.3 },
    { t: T.url, sfx: "tecleo", vol: 0.28, dur: Math.max(0.3, Math.min(T.urlFin - 0.1, T.url + 1.1) - T.url) },
    { t: T.recarga + 0.1, sfx: "tick", vol: 0.5 },
    { t: T.recarga + 0.12, sfx: "golpe", vol: 0.45 },
  ];
};
