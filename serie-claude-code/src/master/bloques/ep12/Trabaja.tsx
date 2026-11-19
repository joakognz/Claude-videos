/**
 * EP.12 · Paso 4 (escena paso4): déjale trabajar. Claude maneja la ventana por detrás (tu ratón 3D, quieto, a un lado):
 * crea el proyecto, busca Gmail y pulsa «Habilitar» (cursor 3D en bucle, secundario) → «Habilitada». Lo ves en
 * directo; y si algo no te cuadra, tu tecla Esc lo para.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Toque } from "../../componentes/Piezas";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { BOTON_CREAR, FormProyecto, VENTANA, Ventana } from "../../componentes/ep12/Navegador12";
import { Caja, Chip, Elemento3D, Insignia } from "../../componentes/ep12/Piezas12";
import { BOTON_HABILITAR, PaginaCloud, PaginaGmail } from "../../componentes/ep12/Pantallas12";
import { EASE_OUT, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "paso4";
const Y = 1150;
const H = 620;
const PAG = { x: VENTANA.x - VENTANA.w / 2, y: Y - H / 2 + VENTANA.barra };
const URL_INICIO = "console.cloud.google.com";
const URL_CREAR = "console.cloud.google.com/projectcreate";
const BUSCA = "gmail api";
const PROYECTO = "pedidos-floristeria";

const tiempos = (L: Linea) => ({
  paso: L.en(E, "Paso"),
  dejale: L.en(E, "Déjale"),
  detras: L.en(E, "detrás,"),
  sin: L.en(E, "sin"),
  crea: L.en(E, "Crea"),
  proyecto: L.en(E, "proyecto,"),
  busca: L.en(E, "busca"),
  gmail: L.en(E, "Gmail"),
  pulsa: L.en(E, "pulsa"),
  habilitar: L.en(E, "Habilitar."),
  tu: L.en(E, "Tú lo ves"),
  directo: L.en(E, "directo."),
  cuadra: L.en(E, "cuadra,"),
  escape: L.en(E, "Escape"),
  para: L.en(E, "para."),
});

export const Trabaja: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 1.0 },
    { t: T.crea - 0.3, x: 540, y: Y + 20, z: 1.04, d: 0.8 },
    { t: T.pulsa - 0.3, x: 540, y: Y + 50, z: 1.06, d: 0.7 },
    { t: T.tu - 0.2, x: 540, y: Y + 40, z: 1.0, d: 0.9 },
  ];
  // la ventana: consola → formulario → búsqueda → Gmail
  const fase = t < T.crea - 0.15 ? 0 : t < T.busca ? 1 : 2;
  const url = fase === 0 ? URL_INICIO : fase === 1 ? URL_CREAR : BUSCA;
  const letras = fase === 2 ? ramp(t, T.busca, T.gmail - 0.05, (x) => x) * BUSCA.length : url.length;
  const carga = fase === 2 ? ramp(t, T.gmail - 0.05, T.gmail + 0.3, EASE_OUT) : 1;
  const brillo = ramp(t, T.detras, T.detras + 0.4) * (0.75 + 0.25 * Math.sin(t * 5.5)) * (1 - ramp(t, T.para, T.para + 0.3));
  const pulsaCrear = t > T.proyecto - 0.15 ? Math.sin(clamp01((t - T.proyecto + 0.15) / 0.22) * Math.PI) : 0;
  const creando = ramp(t, T.proyecto - 0.05, T.proyecto + 0.25);
  const pausa = ramp(t, T.para - 0.1, T.para + 0.25);
  const vV = vis(t, T.dejale - 0.1, Infinity, 0.85);
  const esc = T.escape + 0.15;
  const hundeEsc = t > esc ? Math.sin(clamp01((t - esc) / 0.25) * Math.PI) : 0;
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="PASO 4" x={540} y={740} t={t} at={T.paso} out={T.detras - 0.3} size={64} />
      <Etiqueta texto="DÉJALE TRABAJAR" x={540} y={722} t={t} at={T.detras - 0.25} out={T.crea - 0.2} size={34} variante="borde" />
      {vV.on && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: vV.opacity, transform: `translateY(${vV.y}px)` }}>
          <Ventana t={t} url={url} letras={letras} carga={carga} brillo={brillo} y={Y} h={H} fondo={fase === 1 ? "#15171D" : "#F8F9FA"} escala={vV.scale}>
            {fase === 0 && <PaginaCloud t={t} logo={ep.logos.google_cloud} sesion={-10} />}
            {fase === 1 && (
              <FormProyecto t={t} nombre={PROYECTO} letras={ramp(t, T.crea - 0.1, T.proyecto - 0.2, (x) => x) * PROYECTO.length} pulsa={pulsaCrear} creando={creando} hecho={T.proyecto + 0.2} />
            )}
            {fase === 2 && t > T.gmail - 0.05 && (
              <div style={{ position: "absolute", inset: 0, opacity: carga }}>
                <PaginaGmail t={t} logo={ep.logos.google_cloud} logoGmail={ep.logos.gmail} pulsa={T.pulsa + 0.25} habilitada={T.habilitar} />
              </div>
            )}
            {pausa > 0 && (
              <div style={{ position: "absolute", inset: 0, background: `rgba(11,13,18,${0.62 * pausa})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ transform: `scale(${sp(t, T.para - 0.1, { damping: 10, stiffness: 220 })})` }}>
                  <Insignia s={150} tipo="pausa" />
                </div>
              </div>
            )}
          </Ventana>
        </div>
      )}
      <Etiqueta
        texto={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
            <Img src={staticFile(ep.logos.claude)} style={{ width: 40, height: 40 }} />
            {t < T.para ? "CLAUDE AL MANDO" : "SE PARA"}
          </span>
        }
        x={540} y={Y - H / 2 - 2} t={t} at={T.detras} size={32} variante="borde"
      />
      {/* Claude pulsa «Crear» y «Habilitar» */}
      <Toque x={PAG.x + BOTON_CREAR.x + BOTON_CREAR.w / 2} y={PAG.y + BOTON_CREAR.y + BOTON_CREAR.h / 2} t={t} at={T.proyecto - 0.15} r={46} />
      <Toque x={PAG.x + BOTON_HABILITAR.x} y={PAG.y + BOTON_HABILITAR.y} t={t} at={T.pulsa + 0.25} r={50} />
      <Elemento3D e="cursor" x={PAG.x + BOTON_HABILITAR.x + 14} y={PAG.y + BOTON_HABILITAR.y + 36} w={230} t={t} at={T.pulsa - 0.1} out={T.directo} bucle={[0, 2]} tenue={0.9} />
      {/* tu ratón, quieto */}
      <Elemento3D e="raton" x={890} y={Y + H / 2 + 40} w={330} t={t} at={T.sin - 0.15} out={T.pulsa - 0.2} hasta={1.45} />
      <Etiqueta texto="SIN MOVER TU RATÓN" x={480} y={Y + H / 2 + 60} t={t} at={T.sin + 0.1} out={T.pulsa - 0.2} size={32} variante="borde" />
      {/* en directo */}
      <Caja x={540} y={Y + H / 2 + 70} t={t} at={T.directo - 0.1} out={T.escape - 0.2}>
        <Chip icono={<div style={{ width: 26, height: 26, borderRadius: "50%", background: "#E5484D", opacity: 0.55 + 0.45 * Math.abs(Math.sin(t * 4)), boxShadow: "0 0 18px #E5484D" }} />} texto="LO VES EN DIRECTO" size={34} />
      </Caja>
      {/* tecla Esc */}
      <Caja x={200} y={Y + H / 2 + 40} t={t} at={T.escape - 0.25} rot={-8} desde={0.3}>
        <Img src={staticFile(ep.imagenes!.esc)} style={{ width: 210, display: "block", transform: `translateY(${hundeEsc * 12}px) scale(${1 - 0.08 * hundeEsc})`, filter: "drop-shadow(0 16px 28px rgba(0,0,0,0.6))" }} />
      </Caja>
      <Etiqueta texto="PULSA ESCAPE" x={560} y={Y + H / 2 + 60} t={t} at={T.escape + 0.05} size={34} variante="acento" />
    </Escena>
  );
};

export const eventosTrabaja = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso, sfx: "golpe", vol: 0.45 },
    { t: T.detras, sfx: "pop", vol: 0.35 },
    { t: T.crea - 0.1, sfx: "tecleo", vol: 0.25, dur: T.proyecto - T.crea },
    { t: T.proyecto - 0.15, sfx: "envio", vol: 0.4 },
    { t: T.busca, sfx: "tecleo", vol: 0.25, dur: T.gmail - T.busca },
    { t: T.pulsa + 0.25, sfx: "envio", vol: 0.45 },
    { t: T.habilitar, sfx: "tick", vol: 0.5 },
    { t: T.directo - 0.1, sfx: "pop", vol: 0.3 },
    { t: T.escape + 0.15, sfx: "golpe", vol: 0.4 },
    { t: T.para - 0.1, sfx: "pop", vol: 0.35 },
  ];
};
