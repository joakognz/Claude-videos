/**
 * EP.12 · Intro nueva (escenas gancho e intro): «el navegador trabaja solo». Sustituye a la intro de siempre solo en
 * este episodio. Arranca ya en marcha: un navegador rellena solo el formulario de un proyecto nuevo mientras tu mano
 * está levantada y tu ratón, quieto. Claude pulsa «Crear» y el proyecto queda creado. Con «Episodio 12 de 50» el
 * mismo navegador escribe la búsqueda y abre la portada de la serie: la rejilla de 50 casillas en pequeño (se
 * enciende la 12), los logos de Claude y Claude Code, el título y el tema del episodio.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Cursor, Toque } from "../../componentes/Piezas";
import { Rejilla, olaEntrada } from "../../componentes/Rejilla";
import type { RejillaGeo } from "../../componentes/Rejilla";
import { Etiqueta } from "../../componentes/Sello";
import { BOTON_CREAR, FormProyecto, PAGINA, VENTANA, Ventana } from "../../componentes/ep12/Navegador12";
import { C, EASE_OUT, TITULO, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps, EpisodioMaster } from "../../tipos";

const G = "gancho";
const I = "intro";
const URL_PROYECTO = "console.cloud.google.com/projectcreate";
const BUSQUEDA = "máster de claude code";
const PROYECTO = "pedidos-floristeria";
/** Tu ratón (quieto) y tu mano levantada, en coordenadas del lienzo. */
const RATON = { x: PAGINA.x + 800, y: PAGINA.y + 530 };
const MANO = { x: 190, y: 1474, w: 190 };
/** Rejilla de 50 casillas dentro de la portada (coordenadas de la página): grande con «Episodio 12 de 50» y en
 * pequeño, arriba, cuando entra el título. */
const GEO_GRANDE: RejillaGeo = { cx: PAGINA.w / 2, cy: 250, celda: 56, hueco: 12, cols: 10, filas: 5 };
const GEO: RejillaGeo = { cx: PAGINA.w / 2, cy: 128, celda: 38, hueco: 9, cols: 10, filas: 5 };
const mezcla = (a: RejillaGeo, b: RejillaGeo, k: number): RejillaGeo => ({
  ...a, cy: a.cy + (b.cy - a.cy) * k, celda: a.celda + (b.celda - a.celda) * k, hueco: a.hueco + (b.hueco - a.hueco) * k,
});

const tiempos = (L: Linea) => {
  const episodio = L.en(I, "Episodio");
  const carga = episodio + 0.4;
  return {
    tocando: L.en(G, "tocando"),
    raton: L.en(G, "ratón"),
    navegador: L.en(G, "navegador"),
    trabaja: L.en(G, "trabaja"),
    solo: L.en(G, "solo"),
    episodio,
    carga,
    doce: Math.max(L.en(I, "12"), carga + 0.25),
    master: L.en(I, "Máster"),
    fin: L.fin(I),
  };
};

export const Intro12: React.FC<BloqueProps> = ({ t, ep, L }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: -1, x: 540, y: 1080, z: 0.97 },
    { t: T.raton - 0.3, x: 600, y: 1130, z: 1.04, d: 0.8 },
    { t: T.navegador - 0.15, x: 540, y: 1080, z: 1.0, d: 0.8 },
    { t: T.master - 0.3, x: 540, y: 1075, z: 1.1, d: 1.4 },
  ];
  // ── navegador: primero el proyecto, luego la búsqueda de la serie ──
  const portada = t >= T.episodio - 0.05;
  const letrasUrl = portada ? ramp(t, T.episodio - 0.05, T.carga - 0.05, (x) => x) * BUSQUEDA.length : URL_PROYECTO.length;
  const carga = portada ? ramp(t, T.carga - 0.05, T.carga + 0.35, EASE_OUT) : 1;
  const brillo = (1 - ramp(t, T.episodio, T.episodio + 0.4)) * (0.75 + 0.25 * Math.sin(t * 5.5)) * ramp(t, 0, 0.3);
  // formulario
  const letrasNombre = ramp(t, 0.05, Math.min(T.raton, 1.5), (x) => x) * PROYECTO.length;
  const pulsa = t > T.trabaja ? Math.sin(clamp01((t - T.trabaja) / 0.22) * Math.PI) : 0;
  const creando = ramp(t, T.trabaja + 0.1, T.solo);
  const salidaForm = ramp(t, T.carga - 0.1, T.carga + 0.15);
  const fueraHook = T.episodio + 0.15;
  // mano levantada: entra y saluda un poco
  const vm = vis(t, T.tocando, fueraHook, 0.3);
  const saludo = Math.sin((t - T.tocando) * 7) * 7 * Math.exp(-Math.max(0, t - T.tocando) * 1.2);
  // ratón quieto
  const vr = vis(t, 0.1, fueraHook, 0.8);
  const anillo = vis(t, T.raton, fueraHook, 0.6);
  return (
    <Escena t={t} tomas={tomas}>
      <Ventana t={t} url={portada ? BUSQUEDA : URL_PROYECTO} letras={letrasUrl} carga={portada ? carga : 1} brillo={brillo}>
        {salidaForm < 1 && (
          <FormProyecto t={t} nombre={PROYECTO} letras={letrasNombre} pulsa={pulsa} creando={creando} hecho={T.solo} opacity={1 - salidaForm} />
        )}
        {creando > 0 && creando < 1 && <div style={{ position: "absolute", left: 0, top: 0, height: 6, width: `${creando * 100}%`, background: C.acento }} />}
        {portada && t > T.carga - 0.08 && <Portada t={t} ep={ep} T={T} />}
      </Ventana>
      {/* Claude pulsa «Crear» (no es tu ratón: es un toque) */}
      <Toque x={PAGINA.x + BOTON_CREAR.x + BOTON_CREAR.w / 2} y={PAGINA.y + BOTON_CREAR.y + BOTON_CREAR.h / 2} t={t} at={T.trabaja} r={50} />
      {/* tu ratón, quieto */}
      {vr.on && (
        <div style={{ opacity: vr.opacity }}>
          {anillo.on && (
            <div
              style={{
                position: "absolute", left: RATON.x - 58, top: RATON.y - 52, width: 116, height: 116, borderRadius: "50%", border: `5px dashed ${C.acento}`,
                opacity: anillo.opacity, transform: `scale(${anillo.scale}) rotate(${t * 20}deg)`,
              }}
            />
          )}
          <Cursor x={RATON.x - 14} y={RATON.y - 26} pulsa={0} size={70} />
        </div>
      )}
      <Etiqueta texto="TU RATÓN, QUIETO" x={RATON.x - 90} y={VENTANA.y + VENTANA.h / 2 + 50} t={t} at={T.raton + 0.08} out={fueraHook} size={30} variante="borde" />
      {/* tu mano, levantada */}
      {vm.on && (
        <div style={{ position: "absolute", left: MANO.x, top: MANO.y, width: 0, height: 0 }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vm.y}px) scale(${vm.scale}) rotate(${-8 + saludo}deg)`, opacity: vm.opacity, transformOrigin: "50% 90%" }}>
            <Img src={staticFile(ep.imagenes!.mano)} style={{ width: MANO.w, display: "block", filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.6))" }} />
          </div>
        </div>
      )}
      {/* «Claude al mando» y el navegador que se nombra */}
      <Etiqueta
        texto={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
            <Img src={staticFile(ep.logos.claude)} style={{ width: 40, height: 40 }} />
            CLAUDE AL MANDO
          </span>
        }
        x={540} y={VENTANA.y - VENTANA.h / 2 - 2} t={t} at={0.12} out={fueraHook} size={32} variante="borde"
      />
      <Logo src={ep.logos.chrome} x={VENTANA.x + VENTANA.w / 2 - 34} y={VENTANA.y - VENTANA.h / 2 + 6} w={118} t={t} at={T.navegador} out={T.master - 0.1} pulsos={[T.trabaja + 0.3]} />
    </Escena>
  );
};

/** Portada de la serie dentro del navegador. */
const Portada: React.FC<{ t: number; ep: EpisodioMaster; T: ReturnType<typeof tiempos> }> = ({ t, ep, T }) => {
  const atenua = ramp(t, T.master, T.master + 0.5);
  const fila = 362;
  const fondo = ramp(t, T.carga - 0.08, T.carga + 0.1);
  const g = mezcla(GEO_GRANDE, GEO, sp(t, T.master - 0.25, { damping: 16, stiffness: 120 }));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: C.fondo, opacity: fondo }} />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.65 * atenua }}>
        <Rejilla
          g={g}
          total={ep.total}
          estado={(n) => {
            const o = olaEntrada(t, T.carga - 0.08, GEO_GRANDE, n);
            const hoy = n === ep.episodio ? sp(t, T.doce, { damping: 9, stiffness: 200 }) : 0;
            const golpe = n === ep.episodio ? Math.sin(Math.min(1, hoy) * Math.PI) * 0.4 : 0;
            const late = n === ep.episodio && t > T.doce ? Math.max(0, Math.sin((t - T.doce) * 7.5)) * 0.08 : 0;
            return { opacity: o.opacity, escala: 0.4 + 0.6 * o.s, encendida: Math.max(n < ep.episodio ? clamp01(o.s) : 0, Math.min(1, hoy)), latido: golpe + late, contorno: 0, check: 0 };
          }}
        />
      </div>
      <Etiqueta texto={`EPISODIO ${ep.episodio} DE ${ep.total}`} x={PAGINA.w / 2} y={GEO_GRANDE.cy + 216} t={t} at={T.doce + 0.05} out={T.master + 0.05} size={30} variante="gris" />
      {/* título */}
      <Logo src={ep.logos.claude} x={150} y={fila} w={104} t={t} at={T.master - 0.05} rot={(t - T.master) * 12} sombra={false} />
      <TextoPixel src={ep.logos.claude_code_texto} x={PAGINA.w / 2} y={fila} w={330} t={t} at={T.master + 0.05} />
      <Logo src={ep.logos.claude_code} x={PAGINA.w - 150} y={fila} w={124} t={t} at={T.master + 0.14} sombra={false} />
      <Letras texto={ep.serie} x={PAGINA.w / 2} y={fila + 132} t={t} at={T.master + 0.2} />
      <Etiqueta texto={`EP.${ep.episodio} · ${(ep.titulo ?? "").toUpperCase()}`} x={PAGINA.w / 2} y={fila + 206} t={t} at={T.master + 0.65} size={30} variante="acento" />
    </div>
  );
};

/** El rótulo pixelado de Claude Code se monta por franjas. */
const TextoPixel: React.FC<{ src: string; x: number; y: number; w: number; t: number; at: number }> = ({ src, x, y, w, t, at }) => {
  const v = vis(t, at, Infinity, 0.85);
  if (!v.on) return null;
  const barrido = ramp(t, at, at + 0.45, EASE_OUT);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, opacity: v.opacity, clipPath: `inset(0 ${(1 - barrido) * 100}% 0 0)` }}>
        <Img src={staticFile(src)} style={{ width: w, display: "block" }} />
      </div>
    </div>
  );
};

/** Nombre de la serie letra a letra («Máster de» en coral). */
const Letras: React.FC<{ texto: string; x: number; y: number; t: number; at: number }> = ({ texto, x, y, t, at }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
    <div style={{ position: "absolute", transform: "translate(-50%, -50%)", whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 50, letterSpacing: 2, color: C.texto }}>
      {texto.toUpperCase().split("").map((ch, i) => {
        const s = sp(t, at + i * 0.018, { damping: 14, stiffness: 220 });
        return (
          <span key={i} style={{ display: "inline-block", opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 30}px)`, color: i < texto.indexOf("Claude") ? C.acento : C.texto, whiteSpace: "pre" }}>
            {ch}
          </span>
        );
      })}
    </div>
  </div>
);

export const eventosIntro12 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: 0.0, sfx: "tecleo", vol: 0.3, dur: Math.min(T.raton, 1.5) - 0.05 },
    { t: 0.12, sfx: "pop", vol: 0.25 },
    { t: T.tocando, sfx: "pop", vol: 0.4 },
    { t: T.navegador, sfx: "pop", vol: 0.4 },
    { t: T.trabaja, sfx: "envio", vol: 0.45 },
    { t: T.solo, sfx: "tick", vol: 0.5 },
    { t: T.episodio - 0.05, sfx: "tecleo", vol: 0.3, dur: T.carga - T.episodio },
    { t: T.carga, sfx: "whoosh", vol: 0.3 },
    { t: T.doce, sfx: "tick", vol: 0.55 },
    { t: T.master + 0.05, sfx: "golpe", vol: 0.45 },
  ];
};
