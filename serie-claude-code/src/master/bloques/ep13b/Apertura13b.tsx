/**
 * EP.13 v2 · Apertura: «GRACIAS» letra a letra con golpe (gracias) → la cuadrícula de 50 con el 1–12 encendidos y el 13
 * latiendo, el contador de seguidores y la captura real con la gráfica que se dibuja (cifras) → corte seco a las
 * reproducciones con zoom a la cifra y los dos picos iluminados → título con destello (titulo).
 * Las capturas son las del usuario: se recortan, se inclinan y se acercan, pero ningún número se toca.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Rejilla, olaEntrada } from "../../componentes/Rejilla";
import type { RejillaGeo } from "../../componentes/Rejilla";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { Flash, miles, temblor } from "../../componentes/ep13b/Piezas13b";
import { C, EASE_OUT, MONO, TITULO, UI, clamp01, cue, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

// ── gracias ──────────────────────────────────────────────────────────────────────────────────────────────────────
const LETRAS = "GRACIAS".split("");
const golpeLetra = (i: number) => 0.04 + i * 0.085;

export const Gracias13b: React.FC<BloqueProps> = ({ t, L }) => {
  const de = L.en("gracias", "De");
  const sh = temblor(t, LETRAS.map((_, i) => golpeLetra(i)), 9);
  const brillo = clamp01(t / 0.6) * (0.6 + 0.4 * Math.sin(t * 5));
  const vDe = vis(t, de - 0.05, Infinity, 0.7);
  return (
    <AbsoluteFill style={{ background: "#050608" }}>
      <div style={{ position: "absolute", left: 140, right: 140, top: 820, height: 520, background: `radial-gradient(closest-side, ${C.acento}55, transparent)`, opacity: brillo }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center", transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        {LETRAS.map((l, i) => {
          const a = golpeLetra(i);
          const s = sp(t, a, { damping: 10, stiffness: 280 });
          return (
            <div key={i} style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 178, lineHeight: 1, color: C.acento, letterSpacing: -2, opacity: clamp01(s * 3), transform: `scale(${2.6 - 1.6 * s}) translateY(${(1 - s) * -30}px)`, textShadow: `0 0 40px ${C.acento}88` }}>
              {l}
            </div>
          );
        })}
      </div>
      {vDe.on && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 64, color: C.texto, opacity: vDe.opacity, transform: `translateY(${vDe.y}px) scale(${vDe.scale})` }}>
          De verdad.
        </div>
      )}
      <Flash t={t} at={0.04} dur={0.25} color={C.acento} max={0.35} />
    </AbsoluteFill>
  );
};

export const eventosGracias13b = (L: Linea): Evento[] => [
  cue(golpeLetra(0), "impacto", "GRACIAS: entra la G", "medio"),
  cue(golpeLetra(2), "golpe", "GRACIAS: letra A", "bajo"),
  cue(golpeLetra(4), "golpe", "GRACIAS: letra I", "bajo"),
  cue(golpeLetra(6), "golpe", "GRACIAS: letra S", "medio"),
  cue(L.en("gracias", "De"), "click", "«De verdad.»", "bajo"),
];

// ── cifras ───────────────────────────────────────────────────────────────────────────────────────────────────────
const G: RejillaGeo = { cx: 540, cy: 1110, celda: 76, hueco: 14, cols: 10, filas: 5 };
const SEG = { w: 900, cx: 540, cy: 1215, iw: 1154, ih: 702 };
const REP = { w: 960, cx: 540, cy: 1120, iw: 1154, ih: 726 };
const enRep = (x: number, y: number) => {
  const k = REP.w / REP.iw;
  return { x: REP.cx - REP.w / 2 + x * k, y: REP.cy - (REP.ih * k) / 2 + y * k };
};

const tCifras = (L: Linea) => ({
  hace: L.en("cifras", "Hace"),
  casi: L.en("cifras", "casi"),
  hoy: L.en("cifras", "Hoy"),
  nueve: L.en("cifras", "9.000."),
  y: L.en("cifras", "Y"),
  rep: L.en("cifras", "reproducciones"),
  treinta: L.en("cifras", "30"),
});

export const Cifras13b: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tCifras(L);
  const llega = T.nueve + 0.1;
  const fase2 = t >= T.y;
  const card = enRep(180, 195);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1110, z: 1.0 },
    { t: T.hoy, x: 540, y: 1030, z: 1.0, d: 0.4 },
    { t: T.y - 0.01, x: 540, y: REP.cy, z: 1.08, d: 0.01 },
    { t: T.y + 0.08, x: card.x + 120, y: card.y + 10, z: 1.7, d: 0.32 },
    { t: T.rep - 0.15, x: 540, y: REP.cy + 30, z: 1.0, d: 0.55 },
  ];
  const sh = temblor(t, [llega, T.y, T.treinta], 12);
  // contador 0 → 9.098 (curva rápida que frena al llegar)
  const cont = ramp(t, T.hoy + 0.05, llega, EASE_OUT);
  const vCont = vis(t, T.hoy, fase2 ? T.y : Infinity, 0.6);
  const vSeg = vis(t, T.hoy + 0.22, Infinity, 0.75);
  const dibuja = ramp(t, T.hoy + 0.45, T.nueve + 0.6);
  const sRep = sp(t, T.y, { damping: 16, stiffness: 320 });
  const marco = ramp(t, T.y + 0.3, T.y + 0.5);
  const atenua = 1 - 0.8 * ramp(t, T.hoy - 0.2, T.hoy + 0.3);
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        {!fase2 && (
          <>
            <div style={{ opacity: atenua }}>
              <Rejilla
                g={G}
                total={ep.total}
                estado={(n) => {
                  const o = olaEntrada(t, desde - 0.3, G, n);
                  const hecho = n <= 12;
                  const enc = hecho ? clamp01((t - (T.hace + n * 0.07)) / 0.18) : 0;
                  const actual = n === 13;
                  const late = actual ? Math.max(0, Math.sin((t - desde) * 7)) * 0.16 : 0;
                  return { opacity: o.opacity * (hecho || actual ? 1 : 0.5), escala: 0.6 + 0.4 * o.s, encendida: enc, latido: late, contorno: actual ? 1 : 0, check: 0 };
                }}
              />
            </div>
            <Etiqueta texto="HACE UN MES" x={540} y={800} t={t} at={T.hace} out={T.hoy} size={44} variante="borde" fuente="titulo" />
            <Etiqueta texto="casi no existía…" x={540} y={1420} t={t} at={T.casi} out={T.hoy} size={46} variante="gris" />
            {vCont.on && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", opacity: vCont.opacity, transform: `scale(${vCont.scale * (1 + 0.08 * Math.sin(clamp01((t - llega) / 0.25) * Math.PI))})` }}>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 190, lineHeight: 1, color: t >= llega ? C.acento : C.texto, letterSpacing: -4, textShadow: t >= llega ? `0 0 50px ${C.acento}aa` : "none" }}>{miles(9098 * cont)}</div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.gris, letterSpacing: 8, marginTop: 6 }}>SEGUIDORES</div>
              </div>
            )}
            {vSeg.on && (
              <div style={{ position: "absolute", left: SEG.cx - SEG.w / 2, top: SEG.cy - (SEG.ih * SEG.w) / SEG.iw / 2, width: SEG.w, opacity: vSeg.opacity, transform: `translateY(${(1 - vSeg.s) * 260}px) rotate(${-4 + (1 - vSeg.s) * 8}deg) scale(${vSeg.scale})` }}>
                <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", border: `5px solid ${C.borde}`, boxShadow: "0 40px 90px rgba(0,0,0,0.7)" }}>
                  {/* parte de arriba (tarjetas) siempre; la gráfica se descubre de izquierda a derecha */}
                  <Img src={staticFile(ep.imagenes!.captura_seguidores)} style={{ width: "100%", display: "block", clipPath: "inset(0 0 52% 0)" }} />
                  <Img src={staticFile(ep.imagenes!.captura_seguidores)} style={{ position: "absolute", left: 0, top: 0, width: "100%", display: "block", clipPath: `inset(48% ${(1 - dibuja) * 100}% 0 0)` }} />
                </div>
              </div>
            )}
            <Sello texto="+8.911 SEGUIDORES" x={620} y={1530} t={t} at={T.nueve + 0.22} size={62} rot={-6} resalte={1} />
          </>
        )}
        {fase2 && (
          <>
            <div style={{ position: "absolute", left: REP.cx - REP.w / 2, top: REP.cy - (REP.ih * REP.w) / REP.iw / 2, width: REP.w, transform: `rotate(${2 - 2 * sRep}deg) scale(${1.15 - 0.15 * sRep})` }}>
              <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", border: `5px solid ${C.borde}`, boxShadow: "0 40px 90px rgba(0,0,0,0.7)" }}>
                <Img src={staticFile(ep.imagenes!.captura_reproducciones)} style={{ width: "100%", display: "block" }} />
              </div>
            </div>
            {/* marco coral sobre la cifra */}
            <div style={{ position: "absolute", left: enRep(24, 92).x, top: enRep(24, 92).y, width: (310 * REP.w) / REP.iw, height: (206 * REP.w) / REP.iw, borderRadius: 26, border: `7px solid ${C.acento}`, boxShadow: `0 0 40px ${C.acento}`, opacity: marco, transform: `scale(${1.25 - 0.25 * marco})` }} />
            {[enRep(455, 432), enRep(715, 418)].map((p, i) => {
              const k = ramp(t, T.rep + i * 0.18, T.rep + i * 0.18 + 0.3);
              const late = 1 + 0.12 * Math.sin((t - T.rep) * 8);
              return k > 0 ? (
                <div key={i} style={{ position: "absolute", left: p.x - 60, top: p.y - 60, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(closest-side, #FFFFFF, ${C.acento}cc 45%, transparent)`, opacity: k, transform: `scale(${k * late})` }} />
              ) : null;
            })}
            <Sello texto="EN 30 DÍAS" x={560} y={1500} t={t} at={T.treinta} size={76} rot={-5} resalte={1} />
          </>
        )}
      </div>
      <div style={{ position: "absolute", left: -2000, top: -2000, width: 5000, height: 6000, pointerEvents: "none" }}>
        <Flash t={t} at={T.y} dur={0.3} max={0.9} />
      </div>
    </Escena>
  );
};

export const eventosCifras13b = (L: Linea): Evento[] => {
  const T = tCifras(L);
  return [
    cue(T.hace + 0.1, "glitch", "la cuadrícula del módulo se enciende", "bajo"),
    cue(T.hoy + 0.22, "foto", "aparece la captura de seguidores", "medio"),
    cue(T.hoy + 0.5, "glitch", "la gráfica de seguidores se dibuja", "bajo"),
    cue(T.nueve + 0.1, "destello", "el contador llega a 9.098", "medio"),
    cue(T.nueve + 0.3, "remate", "sello +8.911 SEGUIDORES", "medio"),
    cue(T.y, "foto", "corte seco a la captura de reproducciones (flash)", "fuerte"),
    cue(T.y + 0.24, "zoom", "zoom de golpe a 344.114", "bajo"),
    cue(T.rep + 0.05, "destello", "se iluminan los dos picos", "bajo"),
    cue(T.treinta + 0.08, "remate", "sello EN 30 DÍAS", "medio"),
  ];
};

// ── título ───────────────────────────────────────────────────────────────────────────────────────────────────────
const tTitulo = (L: Linea) => ({
  este: L.en("titulo", "este"),
  trece: L.en("titulo", "13"),
  master: L.en("titulo", "Máster"),
  claude: L.en("titulo", "Claude"),
  code: L.en("titulo", "Code"),
  no: L.en("titulo", "no es"),
  normal: L.en("titulo", "normal."),
});

export const Titulo13b: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tTitulo(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 1.12 },
    { t: T.trece, x: 540, y: 1080, z: 0.96, d: 0.35 },
    { t: T.no - 0.1, x: 540, y: 1150, z: 1.0, d: 0.6 },
  ];
  const sh = temblor(t, [T.trece], 16);
  const rayos = ramp(t, T.trece - 0.05, T.trece + 0.3);
  const vEp = vis(t, T.trece, Infinity, 0.3);
  const vM = vis(t, T.master - 0.05, Infinity, 0.6);
  const vC = vis(t, T.claude - 0.05, Infinity, 0.6);
  const tacha = ramp(t, T.normal, T.normal + 0.3);
  const vNormal = vis(t, T.no + 0.05, Infinity, 0.7);
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        {rayos > 0 && (
          <div style={{ position: "absolute", left: 540 - 900, top: 1000 - 900, width: 1800, height: 1800, borderRadius: "50%", opacity: 0.55 * rayos, transform: `rotate(${(t - T.trece) * 14}deg) scale(${0.6 + 0.4 * rayos})`, background: `repeating-conic-gradient(${C.acento}55 0deg 7deg, transparent 7deg 18deg)`, WebkitMaskImage: "radial-gradient(closest-side, black 20%, transparent 100%)", maskImage: "radial-gradient(closest-side, black 20%, transparent 100%)" }} />
        )}
        <Logo src={ep.logos.claude} x={380} y={760} w={150} t={t} at={T.este} />
        <Logo src={ep.logos.claude_code} x={700} y={760} w={190} t={t} at={T.este + 0.12} />
        {vEp.on && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 870, textAlign: "center", opacity: vEp.opacity, transform: `scale(${vEp.scale})` }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.oscuro, background: C.acento, padding: "8px 26px", borderRadius: 12, letterSpacing: 3 }}>EP.13 · FIN DEL MÓDULO 1</span>
          </div>
        )}
        {vM.on && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 975, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 92, color: C.texto, letterSpacing: -2, opacity: vM.opacity, transform: `translateY(${vM.y}px) scale(${vM.scale})` }}>
            MÁSTER DE
          </div>
        )}
        {vC.on && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1075, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 132, lineHeight: 1, color: C.acento, letterSpacing: -3, opacity: vC.opacity, transform: `translateY(${vC.y}px) scale(${vC.scale})`, textShadow: `0 0 40px ${C.acento}77` }}>
            CLAUDE CODE
          </div>
        )}
        {vNormal.on && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", opacity: vNormal.opacity, transform: `scale(${vNormal.scale})` }}>
            <div style={{ position: "relative", fontFamily: UI, fontWeight: 700, fontSize: 58, color: C.gris }}>
              un episodio normal
              <div style={{ position: "absolute", left: -10, top: "52%", height: 9, borderRadius: 5, background: C.acento, width: `calc(${tacha * 100}% + ${20 * tacha}px)`, boxShadow: `0 0 16px ${C.acento}` }} />
            </div>
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: -2000, top: -2000, width: 5000, height: 6000, pointerEvents: "none" }}>
        <Flash t={t} at={T.trece} dur={0.5} max={0.95} />
      </div>
    </Escena>
  );
};

export const eventosTitulo13b = (L: Linea): Evento[] => {
  const T = tTitulo(L);
  return [
    cue(T.este + 0.05, "click", "entran los logos de Claude y Claude Code", "bajo"),
    cue(T.trece, "impacto", "destello del título (EP.13 · FIN DEL MÓDULO 1)", "fuerte"),
    cue(T.master, "click", "MÁSTER DE", "bajo"),
    cue(T.claude, "remate", "CLAUDE CODE", "medio"),
    cue(T.normal + 0.1, "glitch", "se tacha «un episodio normal»", "bajo"),
  ];
};
