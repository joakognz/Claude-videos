/**
 * EP.12 · Pasos 1 y 2 (escenas paso1 y paso2).
 * Paso 1: abres tú Google Cloud en Chrome, con la sesión iniciada (tu mano lo abre); Claude trabaja sobre esa ventana.
 * Paso 2: en Visual Studio Code, con Claude Code, escribes qué quieres y le das el control de esa ventana; de tres
 * ventanas abiertas, solo esa (candado).
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { VENTANA, Ventana } from "../../componentes/ep12/Navegador12";
import { Caja, Ico, MiniVentana } from "../../componentes/ep12/Piezas12";
import { PaginaCloud, PanelClaude, escrito } from "../../componentes/ep12/Pantallas12";
import { C, EASE_OUT, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const P1 = "paso1";
const P2 = "paso2";
const YV = 1210; // ventana del paso 1
const HV = 600;
const YP = 2120; // panel del paso 2
const URL = "console.cloud.google.com";
const PETICION = ["Crea un proyecto para leer los pedidos de la floristería.", " Toma el control de la ventana de Google Cloud.", " Solo de esa."];

const tiempos = (L: Linea) => ({
  paso1: L.en(P1, "Paso"),
  prepara: L.en(P1, "Prepara"),
  abre: L.en(P1, "Abre"),
  tu: L.en(P1, "tú"),
  google: L.en(P1, "Google"),
  navegador: L.en(P1, "navegador,"),
  cuenta: L.en(P1, "cuenta"),
  claude: L.en(P1, "Claude"),
  trabaja: L.en(P1, "trabaja"),
  dejas: L.en(P1, "dejas"),
  paso2: L.en(P2, "Paso"),
  explicale: L.en(P2, "Explícale"),
  dale: L.en(P2, "dale"),
  permiso: L.en(P2, "permiso"),
  control: L.en(P2, "control"),
  esa: L.en(P2, "esa ventana."),
  solo: L.en(P2, "Solo"),
  esa2: L.en(P2, "esa", 1),
  fin: L.fin(P2),
});

export const Preparar: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1100, z: 1.0 },
    { t: T.abre - 0.2, x: 540, y: 1150, z: 1.0, d: 0.8 },
    { t: T.paso2 - 0.4, x: 540, y: 1960, z: 1.0, d: 0.9 },
    { t: T.explicale + 0.4, x: 540, y: YP - 40, z: 1.02, d: 0.9 },
    { t: T.esa - 0.45, x: 540, y: 1950, z: 0.98, d: 0.8 },
  ];
  // paso 1: ventana de Google Cloud
  const letras = ramp(t, T.abre + 0.05, T.google - 0.05, (x) => x) * URL.length;
  const carga = ramp(t, T.google - 0.05, T.google + 0.35, EASE_OUT);
  const brillo = ramp(t, T.trabaja, T.trabaja + 0.4) * (0.75 + 0.25 * Math.sin(t * 5.5));
  const vV = vis(t, T.abre - 0.1, T.paso2 + 0.4, 0.85);
  // paso 2: la petición se escribe con la voz y se envía al final
  const tramos = [
    [T.explicale + 0.1, T.dale - 0.1],
    [T.dale + 0.05, T.solo - 0.15],
    [T.solo, T.esa2 + 0.15],
  ];
  const envia = T.fin + 0.05;
  const entrada = t < envia ? PETICION.map((p, i) => escrito(p, t, tramos[i][0], tramos[i][1])).join("") : "";
  const mensajes = [{ at: envia, de: "tu" as const, contenido: PETICION.join("") }];
  const solo = ramp(t, T.solo, T.solo + 0.35);
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── PASO 1 ── */}
      <Sello texto="PASO 1" x={540} y={740} t={t} at={T.paso1} out={T.paso2} size={64} />
      <Etiqueta texto="PREPARA EL TERRENO" x={540} y={840} t={t} at={T.prepara} out={T.claude} size={34} variante="borde" />
      <Etiqueta texto="TRABAJA SOBRE LO QUE TÚ DEJAS ABIERTO" x={540} y={840} t={t} at={T.claude + 0.1} out={T.paso2 + 0.3} size={32} variante="acento" />
      {vV.on && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: vV.opacity, transform: `translateY(${vV.y}px)` }}>
          <Ventana t={t} url={URL} letras={letras} carga={carga} brillo={brillo} y={YV} h={HV} fondo="#F8F9FA" escala={vV.scale}>
            {t > T.google - 0.05 && <div style={{ position: "absolute", inset: 0, opacity: carga }}><PaginaCloud t={t} logo={ep.logos.google_cloud} sesion={T.cuenta} /></div>}
          </Ventana>
        </div>
      )}
      <Logo src={ep.logos.chrome} x={VENTANA.x + VENTANA.w / 2 - 34} y={YV - HV / 2 + 6} w={112} t={t} at={T.navegador} out={T.paso2 + 0.4} />
      <Caja x={150} y={YV + HV / 2 + 20} t={t} at={T.tu - 0.05} out={T.claude} rot={-10} desde={0.3}>
        <Img src={staticFile(ep.imagenes!.mano)} style={{ width: 170, display: "block", filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))" }} />
      </Caja>
      <Caja x={150} y={YV - HV / 2 + 10} t={t} at={T.claude} out={T.paso2 + 0.4}>
        <div style={{ width: 130, height: 130, borderRadius: "50%", background: C.panel, border: `5px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${C.acento}66` }}>
          <Img src={staticFile(ep.logos.claude)} style={{ width: 80 }} />
        </div>
      </Caja>

      {/* ── PASO 2 ── */}
      <Sello texto="PASO 2" x={540} y={1650} t={t} at={T.paso2} out={T.esa - 0.3} size={64} />
      <Caja x={540} y={YP} t={t} at={T.explicale - 0.15} desde={0.85}>
        <PanelClaude t={t} w={920} h={640} logoVs={ep.logos.vscode} logoCc={ep.logos.claude_code} mensajes={mensajes} entrada={entrada} foco={t < envia} />
      </Caja>
      <Logo src={ep.logos.vscode} x={950} y={YP - 320} w={100} t={t} at={T.explicale} out={T.esa - 0.2} />
      <Etiqueta texto="DALE PERMISO" x={540} y={YP + 350} t={t} at={T.permiso} out={T.esa - 0.4} size={32} variante="acento" />
      {/* tres ventanas abiertas: solo esa */}
      {[
        { x: 230, titulo: "Correo personal", ok: false },
        { x: 540, titulo: "Google Cloud", ok: true },
        { x: 850, titulo: "Tu banco", ok: false },
      ].map((v, i) => {
        const at = T.esa - 0.2 + (v.ok ? 0 : 0.12 * (i + 1));
        const s = sp(t, at, { damping: 13, stiffness: 200 });
        if (s <= 0) return null;
        const apaga = v.ok ? 0 : solo;
        return (
          <div key={v.titulo} style={{ position: "absolute", left: v.x - 135, top: 1680 - 90, opacity: clamp01(s * 2) * (1 - 0.6 * apaga), transform: `scale(${(0.6 + 0.4 * s) * (v.ok ? 1 + 0.1 * solo : 1 - 0.08 * apaga)})`, filter: v.ok ? `drop-shadow(0 0 ${28 * solo}px ${C.acento})` : `grayscale(${apaga})` }}>
            <div style={{ borderRadius: 20, border: `5px solid ${v.ok ? C.acento : "transparent"}` }}>
              <MiniVentana w={260} titulo={v.titulo} boton="Abrir" tono={v.ok ? 1 : 0} />
            </div>
            {v.ok && (
              <div style={{ position: "absolute", right: -30, top: -34, transform: `scale(${sp(t, T.solo, { damping: 10, stiffness: 240 })})` }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.fondo, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ico ruta="linea-coral/candado" s={50} />
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Etiqueta texto="SOLO ESA" x={540} y={1530} t={t} at={T.esa2 - 0.15} size={36} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosPreparar = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.paso1, sfx: "golpe", vol: 0.45 },
    { t: T.abre - 0.1, sfx: "whoosh", vol: 0.25 },
    { t: T.abre + 0.05, sfx: "tecleo", vol: 0.25, dur: T.google - T.abre - 0.1 },
    { t: T.navegador, sfx: "pop", vol: 0.35 },
    { t: T.cuenta, sfx: "tick", vol: 0.45 },
    { t: T.claude, sfx: "pop", vol: 0.35 },
    { t: T.paso2, sfx: "golpe", vol: 0.45 },
    { t: T.explicale + 0.1, sfx: "tecleo", vol: 0.25, dur: T.esa2 - T.explicale },
    { t: T.solo, sfx: "pop", vol: 0.4 },
    { t: T.fin + 0.05, sfx: "envio", vol: 0.4 },
  ];
};
