/**
 * EP.13 · Las tres opciones (escenas web, auto y medida). En cada una, su carta llega boca abajo, se da la vuelta y
 * enseña la ilustración del usuario; alrededor salen los logos en el momento en que se nombran.
 * - WEB: Next.js, Astro y WordPress; al «publicada en internet», Vercel, Netlify y Hostinger. IDEA → EN INTERNET.
 * - AUTOMATIZAR: n8n y Make («se hagan solas»); el ejemplo, en un editor de flujos recreado con la floristería:
 *   WhatsApp (nuevo pedido) → Google Sheets (añadir fila) → Gmail (confirmación), con el pedido viajando por el flujo.
 * - A MEDIDA: Node.js y AWS; panel de pedidos, agenda de citas y gestor de clientes; SE ADAPTA A TI.
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { LlaveInglesa, Pildora } from "../../componentes/ep08/Dibujos";
import { Caja, Chip, Ico } from "../../componentes/ep12/Piezas12";
import { Carta, EditorFlujo } from "../../componentes/ep13/Piezas13";
import { C, TITULO, ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const Y_CARTA = 1180;
const W_CARTA = 440;

/** Carta central de la opción: entra con el bloque y se da la vuelta al decir «Opción». */
const CartaOpcion: React.FC<{ t: number; desde: number; gira: number; numero: number; img: string; rot?: number; tenue?: number; out?: number }> = ({ t, desde, gira, numero, img, rot = 0, tenue = 1, out }) => (
  <Caja x={540} y={Y_CARTA} t={t} at={desde - 0.35} out={out} desde={0.7} rot={rot}>
    <Carta w={W_CARTA} giro={sp(t, gira, { damping: 15, stiffness: 110 })} numero={numero} img={img} tenue={tenue} />
  </Caja>
);

const latido = (t: number, at: number) => (t > at ? Math.sin(Math.min(1, sp(t, at, { damping: 9, stiffness: 240 })) * Math.PI) * 4 : 0);

// ── opción 1 · web ────────────────────────────────────────────────────────────────────────────────────────────────
const tWeb = (L: Linea) => ({
  opcion: L.en("web", "Opción"),
  web: L.en("web", "web."),
  negocio: L.en("web", "negocio,"),
  desde: L.en("web", "desde"),
  idea: L.en("web", "idea"),
  publicada: L.en("web", "publicada"),
  en: L.en("web", "en"),
  internet: L.en("web", "internet."),
});

export const Web13: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tWeb(L);
  const tomas: Toma[] = [{ t: desde - 1, x: 540, y: 1100, z: 1.0 }];
  return (
    <Escena t={t} tomas={tomas}>
      <CartaOpcion t={t} desde={desde} gira={T.opcion + 0.2} numero={1} img={ep.imagenes!.web} rot={latido(t, T.internet)} />
      <Sello texto="OPCIÓN 1" x={540} y={715} t={t} at={T.opcion} size={50} rot={-3} />
      <Etiqueta texto="WEB" x={540} y={860} t={t} at={T.web - 0.05} size={64} variante="acento" fuente="titulo" />
      <Logo src={ep.logos.nextjs} x={150} y={900} w={150} t={t} at={T.web} />
      <Logo src={ep.logos.astro} x={150} y={1120} w={230} t={t} at={T.negocio} ficha="tarjeta" />
      <Logo src={ep.logos.wordpress} x={150} y={1340} w={150} t={t} at={T.desde} ficha="circulo" />
      <Logo src={ep.logos.vercel} x={930} y={900} w={200} t={t} at={T.publicada} ficha="tarjeta" />
      <Logo src={ep.logos.netlify} x={930} y={1120} w={210} t={t} at={T.en} ficha="tarjeta" />
      <Logo src={ep.logos.hostinger} x={930} y={1340} w={210} t={t} at={T.internet} ficha="tarjeta" pulsos={[T.internet + 0.3]} />
      <Caja x={330} y={1500} t={t} at={T.idea - 0.05}>
        <Pildora texto="IDEA" size={40} activa={0} />
      </Caja>
      <Flecha curva={{ a: { x: 440, y: 1500 }, c: { x: 540, y: 1470 }, b: { x: 620, y: 1500 } }} p={ramp(t, T.idea + 0.3, T.publicada + 0.2)} ancho={8} />
      <Caja x={770} y={1500} t={t} at={T.internet}>
        <Pildora texto="EN INTERNET" size={40} activa={1} />
      </Caja>
    </Escena>
  );
};
export const eventosWeb13 = (L: Linea): Evento[] => {
  const T = tWeb(L);
  return [
    { t: T.opcion, sfx: "golpe", vol: 0.4 },
    { t: T.opcion + 0.25, sfx: "whoosh", vol: 0.3 },
    { t: T.web - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.negocio, sfx: "pop", vol: 0.3 },
    { t: T.desde, sfx: "pop", vol: 0.3 },
    { t: T.idea - 0.05, sfx: "pop", vol: 0.3 },
    { t: T.publicada, sfx: "pop", vol: 0.3 },
    { t: T.en, sfx: "pop", vol: 0.3 },
    { t: T.internet, sfx: "tick", vol: 0.45 },
  ];
};

// ── opción 2 · automatizar ────────────────────────────────────────────────────────────────────────────────────────
const A = "auto";
const Y_FLUJO = 2060;
const tAuto = (L: Linea) => ({
  opcion: L.en(A, "Opción"),
  automatizar: L.en(A, "automatizar."),
  tareas: L.en(A, "tareas"),
  hagan: L.en(A, "hagan"),
  solas: L.en(A, "solas."),
  ejemplo: L.en(A, "ejemplo:"),
  pedido: L.en(A, "pedido"),
  whatsapp: L.en(A, "WhatsApp,"),
  apunta: L.en(A, "apunta"),
  hoja: L.en(A, "hoja"),
  calculo: L.en(A, "cálculo"),
  cliente: L.en(A, "cliente"),
  llega: L.en(A, "llega"),
  confirmacion: L.en(A, "confirmación"),
  correo: L.en(A, "correo."),
});

export const Auto13: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tAuto(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 1.0 },
    { t: T.ejemplo - 0.3, x: 540, y: Y_FLUJO, z: 1.0, d: 0.8 },
  ];
  const punto = t < T.whatsapp ? -1 : t < T.llega ? ramp(t, T.apunta, T.calculo) : 1 + ramp(t, T.llega, T.correo);
  return (
    <Escena t={t} tomas={tomas}>
      <CartaOpcion t={t} desde={desde} gira={T.opcion + 0.2} numero={2} img={ep.imagenes!.automatizacion} out={T.ejemplo + 0.4} />
      <Sello texto="OPCIÓN 2" x={540} y={715} t={t} at={T.opcion} out={T.ejemplo + 0.2} size={50} rot={-3} />
      <Etiqueta texto="AUTOMATIZAR" x={540} y={860} t={t} at={T.automatizar - 0.05} out={T.ejemplo + 0.4} size={60} variante="acento" fuente="titulo" />
      <Logo src={ep.logos.n8n} x={150} y={1000} w={200} t={t} at={T.tareas} out={T.ejemplo + 0.4} ficha="tarjeta" />
      <Logo src={ep.logos.make} x={930} y={1000} w={210} t={t} at={T.solas} out={T.ejemplo + 0.4} ficha="tarjeta" />
      <Caja x={540} y={1480} t={t} at={T.hagan - 0.05} out={T.ejemplo + 0.4}>
        <Chip icono={<Ico ruta="linea-coral/repite" s={50} style={{ transform: `rotate(${(t - T.hagan) * 160}deg)` }} />} texto="SE HACEN SOLAS" size={40} />
      </Caja>

      {/* ── el ejemplo, en el editor de flujos ── */}
      <Etiqueta texto="EJEMPLO · FLORISTERÍA" x={540} y={Y_FLUJO - 300} t={t} at={T.ejemplo} size={40} variante="borde" fuente="titulo" />
      <Caja x={540} y={Y_FLUJO} t={t} at={T.ejemplo - 0.1} desde={0.85}>
        <EditorFlujo
          w={980}
          t={t}
          nodos={[
            { logo: ep.logos.whatsapp, titulo: "Nuevo pedido", sub: "WhatsApp", at: T.pedido - 0.1, disparador: true },
            { logo: ep.logos.google_sheets_icono, titulo: "Añadir fila", sub: "Hoja de pedidos", at: T.hoja - 0.1 },
            { logo: ep.logos.gmail, titulo: "Confirmación", sub: "Correo al cliente", at: T.cliente - 0.1 },
          ]}
          lineas={[ramp(t, T.apunta, T.hoja), ramp(t, T.llega, T.confirmacion)]}
          punto={punto}
          hecho={ramp(t, T.correo, T.correo + 0.35)}
        />
      </Caja>
      <Caja x={540} y={Y_FLUJO + 340} t={t} at={T.correo - 0.05}>
        <Chip icono={<Ico ruta="linea-coral/check" s={50} />} texto="PEDIDO CONFIRMADO" size={40} />
      </Caja>
    </Escena>
  );
};

export const eventosAuto13 = (L: Linea): Evento[] => {
  const T = tAuto(L);
  return [
    { t: T.opcion, sfx: "golpe", vol: 0.4 },
    { t: T.opcion + 0.25, sfx: "whoosh", vol: 0.3 },
    { t: T.automatizar - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.tareas, sfx: "pop", vol: 0.3 },
    { t: T.hagan - 0.05, sfx: "pop", vol: 0.3 },
    { t: T.solas, sfx: "pop", vol: 0.3 },
    { t: T.ejemplo - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.pedido - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.apunta, sfx: "whoosh", vol: 0.2 },
    { t: T.hoja - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.cliente - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.llega, sfx: "whoosh", vol: 0.2 },
    { t: T.correo, sfx: "tick", vol: 0.5 },
  ];
};

// ── opción 3 · a medida ───────────────────────────────────────────────────────────────────────────────────────────
const M = "medida";
const tMedida = (L: Linea) => ({
  opcion: L.en(M, "Opción"),
  medida: L.en(M, "medida."),
  herramienta: L.en(M, "herramienta"),
  solo: L.en(M, "solo"),
  panel: L.en(M, "panel"),
  agenda: L.en(M, "agenda"),
  gestor: L.en(M, "gestor"),
  que: L.en(M, "Que se adapte"),
  adapte: L.en(M, "adapte"),
  ti: L.en(M, "ti,"),
  notu: L.en(M, "no tú"),
  ella: L.en(M, "ella."),
});

const IcoBarras: React.FC = () => (
  <svg width={50} height={50} viewBox="0 0 24 24" fill="none" stroke={C.acento} strokeWidth={2.4} strokeLinecap="round">
    <path d="M4 20 V13 M10 20 V8 M16 20 V11 M22 20 V5" />
  </svg>
);
const IcoAgenda: React.FC = () => (
  <svg width={50} height={50} viewBox="0 0 24 24" fill="none" stroke={C.acento} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <rect x={3} y={5} width={18} height={16} rx={3} />
    <path d="M3 10 H21 M8 3 V7 M16 3 V7" />
    <path d="M8 15 L10.5 17.5 L16 13" />
  </svg>
);

export const Medida13: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tMedida(L);
  const tomas: Toma[] = [{ t: desde - 1, x: 540, y: 1100, z: 1.0 }];
  const balanceo = t > T.ti ? Math.sin((t - T.ti) * 9) * 5 * Math.exp(-(t - T.ti) * 2.5) : 0;
  const chips = [
    { txt: "PANEL DE PEDIDOS", ico: <IcoBarras />, at: T.panel, y: 1270 },
    { txt: "AGENDA DE CITAS", ico: <IcoAgenda />, at: T.agenda, y: 1370 },
    { txt: "GESTOR DE CLIENTES", ico: <Ico ruta="linea-coral/persona" s={50} />, at: T.gestor, y: 1470 },
  ];
  return (
    <Escena t={t} tomas={tomas}>
      <CartaOpcion t={t} desde={desde} gira={T.opcion + 0.2} numero={3} img={ep.imagenes!.a_medida} rot={balanceo} />
      <Sello texto="OPCIÓN 3" x={540} y={715} t={t} at={T.opcion} size={50} rot={-3} />
      <Etiqueta texto="A MEDIDA" x={540} y={860} t={t} at={T.medida - 0.05} size={60} variante="acento" fuente="titulo" />
      <Logo src={ep.logos.nodejs} x={150} y={1000} w={190} t={t} at={T.herramienta} ficha="tarjeta" />
      <Logo src={ep.logos.aws} x={930} y={1000} w={170} t={t} at={T.solo} ficha="tarjeta" />
      <Etiqueta texto="SOLO PARA TU NEGOCIO" x={540} y={1100} t={t} at={T.solo + 0.1} out={T.panel - 0.1} size={36} variante="borde" fuente="titulo" />
      {chips.map((c) => (
        <Caja key={c.txt} x={540} y={c.y} t={t} at={c.at - 0.1} out={T.que}>
          <Chip icono={c.ico} texto={c.txt} size={40} ancho={620} activo={t >= c.at && t < c.at + 1.2 ? 1 : 0.35} />
        </Caja>
      ))}
      <Caja x={880} y={1330} t={t} at={T.adapte - 0.15} desde={0.3}>
        <div style={{ filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.6))" }}>
          <LlaveInglesa s={190} rot={-30 + Math.sin((t - T.adapte) * 5) * 25} />
        </div>
      </Caja>
      <Etiqueta texto="SE ADAPTA A TI" x={540} y={1360} t={t} at={T.adapte} size={58} variante="acento" fuente="titulo" />
      <Caja x={540} y={1470} t={t} at={T.notu - 0.05}>
        <div style={{ position: "relative", fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto, padding: "10px 26px", borderRadius: 999, background: "rgba(20,24,33,0.94)", border: `3px solid ${C.borde}` }}>
          Y NO TÚ A ELLA
          <div style={{ position: "absolute", left: 20, top: "50%", height: 6, borderRadius: 3, background: C.acento, width: `calc(${ramp(t, T.ella, T.ella + 0.3) * 100}% - 40px)` }} />
        </div>
      </Caja>
    </Escena>
  );
};

export const eventosMedida13 = (L: Linea): Evento[] => {
  const T = tMedida(L);
  return [
    { t: T.opcion, sfx: "golpe", vol: 0.4 },
    { t: T.opcion + 0.25, sfx: "whoosh", vol: 0.3 },
    { t: T.medida - 0.05, sfx: "pop", vol: 0.35 },
    { t: T.herramienta, sfx: "pop", vol: 0.3 },
    { t: T.solo, sfx: "pop", vol: 0.3 },
    { t: T.panel - 0.1, sfx: "pop", vol: 0.32 },
    { t: T.agenda - 0.1, sfx: "pop", vol: 0.32 },
    { t: T.gestor - 0.1, sfx: "pop", vol: 0.32 },
    { t: T.adapte, sfx: "golpe", vol: 0.4 },
    { t: T.ella, sfx: "whoosh", vol: 0.2 },
  ];
};
