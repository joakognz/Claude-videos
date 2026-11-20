/**
 * EP.12 · Un ejemplo (escena ejemplo): la floristería (tu ilustración) y sus pedidos, que llegan por correo → crear un
 * proyecto en Google Cloud y conectarlo con Gmail → montaña de pantallas con clics y dudas → todo se lo dejamos a
 * Claude (la montaña se recoge en su logo; la ventana 3D, pequeña, a un lado).
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Caja, Elemento3D, Insignia, MiniVentana, Sobre } from "../../componentes/ep12/Piezas12";
import { C, EASE, clamp01, ramp, rand, sp } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "ejemplo";
const YA = 1080;
const YB = 1850;
const YC = 2660;

const tiempos = (L: Linea) => ({
  ejemplo: L.en(E, "ejemplo."),
  floristeria: L.en(E, "floristería"),
  automatizacion: L.en(E, "automatización"),
  lea: L.en(E, "lea"),
  pedidos: L.en(E, "pedidos"),
  crear: L.en(E, "crear"),
  google: L.en(E, "Google"),
  conectarlo: L.en(E, "conectarlo"),
  gmail: L.en(E, "Gmail."),
  son: L.en(E, "Son"),
  clics: L.en(E, "clics,"),
  pantallas: L.en(E, "pantallas"),
  conoces: L.en(E, "conoces."),
  asi: L.en(E, "Así"),
  dejamos: L.en(E, "dejamos"),
  claude: L.en(E, "Claude."),
});

const PEDIDOS = ["Ramo de rosas", "Centro de mesa", "Ramo de novia"];
const PANTALLAS = ["Nuevo proyecto", "Biblioteca de APIs", "Consentimiento", "Credenciales", "ID de cliente", "Permisos", "Usuarios de prueba", "Descargar clave"];
const PILA = PANTALLAS.map((_, i) => ({
  x: 260 + rand(i * 3 + 1) * 560,
  y: YC - 250 + rand(i * 3 + 2) * 480,
  rot: (rand(i * 3 + 3) - 0.5) * 16,
}));

export const Ejemplo: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: YA, z: 1.0 },
    { t: T.crear - 0.45, x: 540, y: YB, z: 1.0, d: 0.8 },
    { t: T.son - 0.4, x: 540, y: YC, z: 0.97, d: 0.8 },
    { t: T.dejamos - 0.2, x: 540, y: YC, z: 1.06, d: 0.9 },
  ];
  const recoge = ramp(t, T.dejamos, T.dejamos + 0.6, EASE);
  const flecha = ramp(t, T.conectarlo, T.conectarlo + 0.6);
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── A · la floristería y sus pedidos ── */}
      <Etiqueta texto="UN EJEMPLO" x={540} y={YA - 360} t={t} at={T.ejemplo - 0.1} out={T.crear} size={34} variante="acento" />
      <Caja x={330} y={YA} t={t} at={T.floristeria - 0.05} out={T.crear} rot={-2}>
        <div style={{ width: 420, height: 560, borderRadius: 30, overflow: "hidden", border: `6px solid ${C.texto}`, boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>
          <Img src={staticFile(ep.imagenes!.floristeria)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 45%" }} />
        </div>
      </Caja>
      {PEDIDOS.map((p, i) => {
        const at = T.pedidos + i * 0.2;
        const s = sp(t, at, { damping: 14, stiffness: 150 });
        if (s <= 0) return null;
        const x = 470 + (840 - 470) * s;
        const y = YA - 40 + (i - 1) * 190;
        return (
          <div key={p} style={{ position: "absolute", left: x - 135, top: y - 90, opacity: clamp01(s * 2) * (1 - ramp(t, T.crear - 0.35, T.crear)), transform: `rotate(${(1 - s) * -20 + (i - 1) * 3}deg) scale(${0.6 + 0.4 * s})` }}>
            <Sobre s={270} texto={p} />
          </div>
        );
      })}
      <Etiqueta texto="LEE LOS PEDIDOS DEL CORREO" x={540} y={YA + 370} t={t} at={T.lea} out={T.crear} size={34} variante="borde" />

      {/* ── B · Google Cloud + Gmail ── */}
      <Etiqueta texto="1 · CREAR UN PROYECTO" x={290} y={YB - 200} t={t} at={T.crear} out={T.son + 0.2} size={30} variante="gris" />
      <Logo src={ep.logos.google_cloud} x={290} y={YB} w={330} t={t} at={T.google - 0.05} out={T.son + 0.2} ficha="tarjeta" pulsos={[T.conectarlo]} />
      <Flecha curva={{ a: { x: 480, y: YB }, c: { x: 560, y: YB - 70 }, b: { x: 650, y: YB } }} p={flecha} ancho={12} opacity={1 - ramp(t, T.son - 0.15, T.son + 0.2)} />
      <Etiqueta texto="2 · CONECTAR GMAIL" x={800} y={YB - 200} t={t} at={T.conectarlo} out={T.son + 0.2} size={30} variante="gris" />
      <Logo src={ep.logos.gmail} x={800} y={YB} w={210} t={t} at={T.gmail - 0.1} out={T.son + 0.2} />

      {/* ── C · muchos clics, en pantallas que no conoces ── */}
      {PANTALLAS.map((p, i) => {
        const at = T.son + 0.05 + i * 0.27;
        const s = sp(t, at, { damping: 13, stiffness: 190 });
        if (s <= 0) return null;
        const q = PILA[i];
        const x = q.x + (540 - q.x) * recoge;
        const y = q.y + (YC - q.y) * recoge;
        const toque = t - (at + 0.25);
        return (
          <div key={p} style={{ position: "absolute", left: x - 150, top: y - 100, opacity: clamp01(s * 2) * (1 - recoge), transform: `rotate(${q.rot * (1 - recoge)}deg) scale(${(0.5 + 0.5 * s) * (1 - 0.7 * recoge)})` }}>
            <MiniVentana w={300} titulo={p} tono={i % 3 === 1 ? 1 : 0} />
            {toque > 0 && toque < 0.6 && (
              <div style={{ position: "absolute", left: 50 - 30, top: 160 - 30, width: 60, height: 60, borderRadius: "50%", border: `6px solid ${C.acento}`, opacity: 1 - toque / 0.6, transform: `scale(${0.6 + toque * 2.2})` }} />
            )}
            {i % 3 === 0 && t > T.conoces && (
              <div style={{ position: "absolute", right: -26, top: -26, transform: `scale(${sp(t, T.conoces + i * 0.04, { damping: 10, stiffness: 240 })})` }}>
                <Insignia s={64} tipo="pregunta" />
              </div>
            )}
          </div>
        );
      })}
      <Sello texto="MUCHOS CLICS" x={540} y={YC - 420} t={t} at={T.clics} out={T.dejamos + 0.2} size={58} rot={-3} />
      <Logo src={ep.logos.claude} x={540} y={YC} w={250} t={t} at={T.dejamos + 0.25} pulsos={[T.claude]} />
      <Etiqueta texto="SE LOS DEJAMOS A CLAUDE" x={540} y={YC + 230} t={t} at={T.claude - 0.1} size={34} variante="acento" />
      <Elemento3D e="ventana" x={860} y={YC + 360} w={420} t={t} at={T.asi - 0.1} tenue={0.9} />
    </Escena>
  );
};

export const eventosEjemplo = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.ejemplo - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.floristeria, sfx: "pop", vol: 0.35 },
    { t: T.pedidos, sfx: "whoosh", vol: 0.25 },
    { t: T.google, sfx: "pop", vol: 0.4 },
    { t: T.gmail - 0.1, sfx: "pop", vol: 0.4 },
    ...PANTALLAS.map((_, i) => ({ t: T.son + 0.3 + i * 0.27, sfx: "tick" as const, vol: 0.18 })),
    { t: T.clics, sfx: "golpe", vol: 0.35 },
    { t: T.dejamos, sfx: "whoosh", vol: 0.3 },
    { t: T.dejamos + 0.25, sfx: "golpe", vol: 0.4 },
  ];
};
