/**
 * EP.12 · Resultado y resumen (escenas resultado y resumen): proyecto creado (Google Cloud ✓) y Gmail activado (✓),
 * con la ventana 3D a un lado; sin buscar ni un botón → resumen en tres fichas: tú preparas y das permiso (tu mano),
 * Claude hace los clics (cursor 3D en bucle) y las llaves, siempre en tu mano (llave).
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Etiqueta } from "../../componentes/Sello";
import { Caja, Chip, Elemento3D, Ico, Insignia, Rotulo } from "../../componentes/ep12/Piezas12";
import { C, MONO, UI, clamp01, ramp, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const R = "resultado";
const S = "resumen";
const YR = 1110;
const YS = 1980;

const tiempos = (L: Linea) => ({
  resultado: L.en(R, "¿El"),
  proyecto: L.en(R, "proyecto"),
  creado: L.en(R, "creado"),
  gmail: L.en(R, "Gmail"),
  activado: L.en(R, "activado,"),
  buscado: L.en(R, "buscado"),
  resumen: L.en(S, "En"),
  tu: L.en(S, "tú"),
  claude: L.en(S, "Claude"),
  llaves: L.en(S, "llaves,"),
  mano: L.en(S, "mano."),
});

const Fila: React.FC<{ t: number; logo: React.ReactNode; titulo: string; detalle: React.ReactNode; check: number }> = ({ t, logo, titulo, detalle, check }) => {
  const s = sp(t, check, { damping: 10, stiffness: 230 });
  return (
    <div style={{ width: 900, display: "flex", alignItems: "center", gap: 28, padding: "24px 30px", borderRadius: 28, background: C.panel, border: `3px solid ${t > check ? C.acento : C.borde}`, boxShadow: "0 30px 70px rgba(0,0,0,0.55)", boxSizing: "border-box" }}>
      <div style={{ width: 210, display: "flex", justifyContent: "center", flexShrink: 0 }}>{logo}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 42, color: C.texto, whiteSpace: "nowrap" }}>{titulo}</div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 26, color: C.gris, marginTop: 6, whiteSpace: "nowrap" }}>{detalle}</div>
      </div>
      <div style={{ transform: `scale(${s})`, opacity: clamp01(s * 2) }}>
        <Insignia s={80} tipo="check" />
      </div>
    </div>
  );
};

export const Final: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: YR, z: 1.0 },
    { t: T.resumen - 0.45, x: 540, y: YS, z: 1.0, d: 0.85 },
  ];
  const foco = (a: number, b: number) => ramp(t, a, a + 0.3) * (1 - ramp(t, b, b + 0.3));
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── resultado ── */}
      <Rotulo texto="¿EL RESULTADO?" x={540} y={760} t={t} at={T.resultado - 0.05} size={80} out={T.resumen} />
      <Caja x={540} y={YR - 140} t={t} at={T.proyecto - 0.1} out={T.resumen + 0.1}>
        <Fila t={t} check={T.creado} titulo="Proyecto creado" detalle="pedidos-floristeria" logo={<div style={{ padding: "12px 16px", borderRadius: 16, background: "#F6F7F9" }}><Img src={staticFile(ep.logos.google_cloud)} style={{ width: 170, display: "block" }} /></div>} />
      </Caja>
      <Caja x={540} y={YR + 110} t={t} at={T.gmail - 0.1} out={T.resumen + 0.1}>
        <Fila t={t} check={T.activado} titulo="Gmail activado" detalle="Gmail API · Habilitada" logo={<Img src={staticFile(ep.logos.gmail)} style={{ width: 110 }} />} />
      </Caja>
      <Elemento3D e="ventana" x={890} y={YR + 400} w={300} t={t} at={T.resultado + 0.2} out={T.resumen} desde={1.0} tenue={0.9} />
      <Caja x={380} y={YR + 380} t={t} at={T.buscado - 0.1} out={T.resumen}>
        <Chip
          icono={
            <div style={{ position: "relative", width: 56, height: 56 }}>
              <Ico ruta="linea-coral/lupa" s={56} />
              <div style={{ position: "absolute", left: -4, top: 25, width: 64, height: 6, borderRadius: 3, background: C.texto, transform: "rotate(-40deg)" }} />
            </div>
          }
          texto="SIN BUSCAR NI UN BOTÓN" size={32}
        />
      </Caja>

      {/* ── resumen ── */}
      <Etiqueta texto="EN RESUMEN" x={540} y={YS - 360} t={t} at={T.resumen} size={36} variante="acento" fuente="titulo" />
      <Caja x={540} y={YS - 190} t={t} at={T.tu - 0.1}>
        <Chip icono={<Img src={staticFile(ep.imagenes!.mano)} style={{ width: 70 }} />} texto="TÚ PREPARAS Y DAS PERMISO" size={40} ancho={900} activo={foco(T.tu, T.claude)} />
      </Caja>
      <Caja x={540} y={YS} t={t} at={T.claude - 0.1}>
        <Chip icono={<Img src={staticFile(ep.logos.claude)} style={{ width: 62 }} />} texto="CLAUDE HACE LOS CLICS" size={40} ancho={900} activo={foco(T.claude, T.llaves)} />
      </Caja>
      <Elemento3D e="cursor" x={900} y={YS + 40} w={210} t={t} at={T.claude + 0.1} bucle={[0, 2]} tenue={0.95} />
      <Caja x={540} y={YS + 190} t={t} at={T.llaves - 0.1}>
        <Chip icono={<Ico ruta="dibujos/llave" s={70} />} texto="LAS LLAVES, SIEMPRE TUYAS" size={40} ancho={900} activo={foco(T.llaves, 999)} />
      </Caja>
      <Caja x={190} y={YS + 330} t={t} at={T.mano - 0.15} rot={-12} desde={0.3}>
        <Img src={staticFile(ep.imagenes!.mano)} style={{ width: 150, display: "block", filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.6))" }} />
      </Caja>
    </Escena>
  );
};

export const eventosFinal = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.resultado - 0.05, sfx: "golpe", vol: 0.4 },
    { t: T.proyecto - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.creado, sfx: "tick", vol: 0.5 },
    { t: T.gmail - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.activado, sfx: "tick", vol: 0.5 },
    { t: T.buscado - 0.1, sfx: "pop", vol: 0.3 },
    { t: T.resumen, sfx: "pop", vol: 0.35 },
    { t: T.tu - 0.1, sfx: "pop", vol: 0.3 },
    { t: T.claude - 0.1, sfx: "pop", vol: 0.3 },
    { t: T.llaves - 0.1, sfx: "pop", vol: 0.3 },
  ];
};
