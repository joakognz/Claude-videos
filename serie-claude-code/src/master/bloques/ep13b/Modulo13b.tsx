/**
 * EP.13 v2 · El módulo 1: montaje rápido de «detrás de cámaras» (reloj, guion tachado, capas de la línea de tiempo,
 * botón RENDER pulsado varias veces, escena descartada, contador de 1 a 12) y la caja MÓDULO 1 que se cierra de golpe
 * con el sello COMPLETADO (detras). Después, la caja se abre y cada herramienta salta de ella al ritmo de la voz (repaso).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Escena } from "../../componentes/Escena";

/** Centra su contenido en (x, y) del lienzo. */
const En: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)" }}>{children}</div>
);
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { ArchivoMd, Caja, Deshacer, Portatil, Reloj, Tablero, temblor } from "../../componentes/ep13b/Piezas13b";
import { C, EASE_OUT, MONO, TITULO, clamp01, cue, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

// ── detrás de cámaras ────────────────────────────────────────────────────────────────────────────────────────────
const E = "detras";
const tDetras = (L: Linea) => {
  const horas = L.en(E, "horas");
  const guion = L.en(E, "guion,");
  const pruebas = L.en(E, "pruebas");
  const rehacer = L.en(E, "rehacer");
  const convencian = L.en(E, "convencían.");
  const doce = L.en(E, "12");
  return {
    mentir: L.en(E, "mentir:"),
    detras: L.en(E, "detrás"),
    horas, guion, pruebas, rehacer, convencian, doce,
    asi: L.en(E, "así."),
    hoy: L.en(E, "hoy,"),
    cerramos: L.en(E, "cerramos"),
    uno: L.en(E, "1."),
    // cortes del montaje (cada 0,3–0,5 s): [inicio, plano]
    cortes: [
      [horas, "reloj"], [guion, "guion"], [guion + 0.42, "guion2"], [pruebas, "capas"], [pruebas + 0.4, "reloj2"],
      [rehacer, "render"], [rehacer + 0.42, "render"], [rehacer + 0.84, "render"], [convencian - 0.1, "tachada"], [convencian + 0.4, "reloj3"],
      [convencian + 0.8, "tachada2"],
    ] as [number, string][],
  };
};

const Visor: React.FC<{ t: number }> = ({ t }) => (
  <>
    {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j], k) => (
      <div key={k} style={{ position: "absolute", left: 140 + i * 740, top: 690 + j * 760, width: 60, height: 60, borderLeft: i === 0 ? `8px solid ${C.texto}` : undefined, borderRight: i === 1 ? `8px solid ${C.texto}` : undefined, borderTop: j === 0 ? `8px solid ${C.texto}` : undefined, borderBottom: j === 1 ? `8px solid ${C.texto}` : undefined, opacity: 0.85 }} />
    ))}
    <div style={{ position: "absolute", left: 230, top: 740, display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontWeight: 700, fontSize: 38, color: C.texto }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#E5484D", opacity: Math.sin(t * 9) > 0 ? 1 : 0.2 }} />
      REC
    </div>
  </>
);

const Plano: React.FC<{ tipo: string; t: number; a: number; T: ReturnType<typeof tDetras> }> = ({ tipo, t, a, T }) => {
  const u = t - a;
  const punch = 1.08 - 0.08 * EASE_OUT(clamp01(u / 0.18));
  const caja = (children: React.ReactNode) => (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${punch})`, transformOrigin: "540px 1100px" }}>{children}</div>
  );
  if (tipo.startsWith("reloj"))
    return caja(
      <En x={540} y={1100}>
        <div style={{ textAlign: "center" }}>
          <Reloj w={tipo === "reloj" ? 420 : 340} vueltas={(t - T.horas) * 2.2} />
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 70, color: C.texto, marginTop: 24 }}>{tipo === "reloj" ? "HORAS" : tipo === "reloj2" ? "Y MÁS HORAS" : "OTRA VEZ"}</div>
        </div>
      </En>,
    );
  if (tipo.startsWith("guion")) {
    const tachas = tipo === "guion" ? clamp01(u / 0.4) * 2 : 2 + clamp01(u / 0.3) * 2;
    return caja(
      <En x={540} y={1100}>
        <div style={{ width: 620, height: 760, background: "#F3EEE4", borderRadius: 18, padding: 50, boxSizing: "border-box", transform: `rotate(${tipo === "guion" ? -3 : 2}deg)`, boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.oscuro }}>GUION · EP.{tipo === "guion" ? 7 : 11}</div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ position: "relative", height: 26, width: [460, 380, 500, 420, 300, 440][i], marginTop: 52, borderRadius: 13, background: "#BDB5A6" }}>
              <div style={{ position: "absolute", left: -12, top: 6, height: 14, borderRadius: 7, background: C.acento, width: `calc(${clamp01(tachas - i) * 100}% + 24px)`, opacity: clamp01(tachas - i) > 0 ? 1 : 0 }} />
            </div>
          ))}
        </div>
      </En>,
    );
  }
  if (tipo === "capas")
    return caja(
      <En x={540} y={1100}>
        <div style={{ width: 900, padding: 30, background: C.panel, border: `3px solid ${C.borde}`, borderRadius: 24, boxSizing: "border-box", position: "relative" }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.gris, marginBottom: 18 }}>LÍNEA DE TIEMPO · PRUEBA 23</div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 70, marginBottom: 14, borderRadius: 10, background: C.panel2, position: "relative" }}>
              {[0, 1, 2].map((j) => {
                const x = (i * 97 + j * 251) % 520;
                const w = 140 + ((i * 53 + j * 71) % 160);
                return <div key={j} style={{ position: "absolute", left: x + 10, top: 10, width: w * clamp01(u / 0.3 - i * 0.12), height: 50, borderRadius: 8, background: [C.acento, "#5B8DEF", "#9B7BEA", "#4FB38A", "#E2B33F"][i], opacity: 0.85 }} />;
              })}
            </div>
          ))}
          <div style={{ position: "absolute", top: 70, bottom: 20, left: 40 + 820 * clamp01(u / 0.45), width: 6, background: "#FFFFFF", boxShadow: "0 0 12px #fff" }} />
        </div>
      </En>,
    );
  if (tipo === "render") {
    const pulsa = Math.sin(clamp01(u / 0.14) * Math.PI);
    const barra = clamp01((u - 0.08) / 0.3);
    return caja(
      <En x={540} y={1100}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-block", fontFamily: TITULO, fontWeight: 800, fontSize: 96, color: C.oscuro, background: C.acento, padding: "26px 80px", borderRadius: 30, transform: `scale(${1 - 0.1 * pulsa}) translateY(${pulsa * 10}px)`, boxShadow: `0 ${18 - 12 * pulsa}px 0 #8E4630, 0 0 60px ${C.acento}66` }}>RENDER</div>
          <div style={{ width: 640, height: 30, margin: "70px auto 0", borderRadius: 15, background: C.panel2, overflow: "hidden" }}>
            <div style={{ width: `${barra * 100}%`, height: "100%", background: C.texto }} />
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 36, color: C.gris, marginTop: 22 }}>{`claude-code-ep-xx_v${Math.max(2, Math.round((a - T.rehacer) / 0.42) + 3)}.mp4`}</div>
        </div>
      </En>,
    );
  }
  // escena descartada
  const x = clamp01(u / 0.2);
  return caja(
    <En x={540} y={1100}>
      <div style={{ position: "relative", width: 560, height: 760, borderRadius: 28, background: C.panel2, border: `4px solid ${C.borde}`, transform: `rotate(${tipo === "tachada" ? 3 : -4}deg)` }}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 60, height: 320, borderRadius: 18, background: C.panel, border: `3px dashed ${C.borde}` }} />
        <div style={{ position: "absolute", left: 40, top: 430, width: 300, height: 30, borderRadius: 15, background: C.borde }} />
        <div style={{ position: "absolute", left: 40, top: 490, width: 420, height: 30, borderRadius: 15, background: C.borde }} />
        <svg style={{ position: "absolute", inset: 0 }} width={560} height={760} viewBox="0 0 560 760">
          <path d="M60 80 L500 680" stroke={C.acento} strokeWidth={34} strokeLinecap="round" strokeDasharray={760} strokeDashoffset={760 * (1 - x)} />
          <path d="M500 80 L60 680" stroke={C.acento} strokeWidth={34} strokeLinecap="round" strokeDasharray={760} strokeDashoffset={760 * (1 - clamp01(x * 2 - 1))} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: -110, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 64, color: C.acento }}>{tipo === "tachada" ? "NO ME CONVENCE" : "OTRA VEZ"}</div>
      </div>
    </En>,
  );
};

export const Detras13b: React.FC<BloqueProps> = ({ t, L, desde }) => {
  const T = tDetras(L);
  const montaje = t >= T.horas && t < T.doce - 0.05;
  const corte = [...T.cortes].reverse().find(([a]) => t >= a);
  const tomas: Toma[] = [{ t: desde - 1, x: 540, y: 1100, z: 1.0 }];
  const sh = temblor(t, [T.cerramos + 0.25, T.uno], 18);
  // contador 1 → 12
  const n12 = Math.max(1, Math.min(12, Math.floor(1 + ramp(t, T.doce - 0.05, T.asi + 0.1) * 11.999)));
  const vCont = vis(t, T.doce - 0.05, T.cerramos - 0.2, 0.7);
  const cierra = 1 - ramp(t, T.cerramos + 0.05, T.cerramos + 0.28, (x) => x * x);
  const abre = t < T.cerramos ? ramp(t, T.hoy - 0.6, T.hoy - 0.2) : cierra;
  const golpe = Math.sin(clamp01((t - T.cerramos - 0.28) / 0.2) * Math.PI);
  const vCaja = vis(t, T.hoy - 0.7, Infinity, 0.5);
  return (
    <Escena t={t} tomas={tomas} puntos={!montaje}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        {t < T.horas && (
          <>
            <Visor t={t} />
            <Etiqueta texto="DETRÁS DE CÁMARAS" x={540} y={1100} t={t} at={T.detras - 0.1} size={70} variante="texto" fuente="titulo" />
            <Etiqueta texto="sin filtro" x={540} y={1210} t={t} at={T.mentir} size={42} variante="gris" />
          </>
        )}
        {montaje && corte && (
          <>
            <AbsoluteFill style={{ background: "#07080B" }} />
            <Plano key={corte[0]} tipo={corte[1]} t={t} a={corte[0]} T={T} />
          </>
        )}
        {vCont.on && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: vCont.opacity, transform: `scale(${vCont.scale})` }}>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 220, lineHeight: 1, color: C.acento }}>{n12}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.texto, letterSpacing: 8 }}>{n12 === 12 ? "DOCE EPISODIOS" : "EPISODIOS"}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 50 }}>
              {Array.from({ length: 13 }, (_, i) => {
                const on = i < n12;
                const trece = i === 12 && t >= T.hoy;
                return <div key={i} style={{ width: 60, height: 60, borderRadius: 14, background: on ? C.acento : C.panel2, border: `3px solid ${trece ? C.texto : on ? C.acento : C.borde}`, transform: `scale(${trece ? 1.15 + 0.1 * Math.sin(t * 9) : 1})`, boxShadow: trece ? `0 0 26px ${C.texto}` : undefined }} />;
              })}
            </div>
          </div>
        )}
        {vCaja.on && (
          <div style={{ opacity: vCaja.opacity, transform: `translateY(${vCaja.y * 3}px)` }}>
            <Caja x={540} y={1470} w={420} abre={abre} aplasta={golpe} brillo={golpe} />
          </div>
        )}
        <Sello texto="COMPLETADO ✓" x={540} y={1180} t={t} at={T.uno} size={84} rot={-7} resalte={1} />
      </div>
    </Escena>
  );
};

export const eventosDetras13b = (L: Linea): Evento[] => {
  const T = tDetras(L);
  return [
    cue(T.detras, "click", "DETRÁS DE CÁMARAS", "bajo"),
    // montaje: sonido en uno de cada dos o tres cortes
    cue(T.horas, "glitch", "corte: reloj", "bajo"),
    cue(T.horas + 0.6, "reloj", "agujas del reloj girando", "bajo", { dur: 1.6 }),
    cue(T.pruebas, "glitch", "corte: capas de la línea de tiempo", "bajo"),
    cue(T.rehacer + 0.05, "interfaz", "botón RENDER pulsado", "medio"),
    cue(T.rehacer + 0.89, "interfaz", "RENDER otra vez", "bajo"),
    cue(T.convencian + 0.05, "remate", "escena tachada: NO ME CONVENCE", "bajo"),
    cue(T.convencian + 0.85, "glitch", "corte: otra escena tachada", "bajo"),
    cue(T.doce, "click", "contador DOCE EPISODIOS", "bajo"),
    cue(T.asi + 0.1, "destello", "el contador llega a 12", "medio"),
    cue(T.cerramos + 0.28, "impacto", "la caja MÓDULO 1 se cierra de golpe", "fuerte"),
    cue(T.uno + 0.02, "acierto", "sello COMPLETADO", "medio"),
  ];
};

// ── repaso ───────────────────────────────────────────────────────────────────────────────────────────────────────
const R = "repaso";
const CAJA = { x: 540, y: 1530, w: 260 };
const tRepaso = (L: Linea) => ({
  instalar: L.en(R, "instalar"),
  claude: L.en(R, "Claude Code dentro"),
  visual: L.en(R, "Visual"),
  contexto: L.en(R, "contexto"),
  md: L.en(R, "CLAUDE.md,"),
  corregir: L.en(R, "corregirlo"),
  miedo: L.en(R, "miedo,"),
  planifique: L.en(R, "planifique,"),
  reparta: L.en(R, "reparta"),
  conecte: L.en(R, "conecte"),
  herramientas: L.en(R, "herramientas."),
  use: L.en(R, "use"),
  ordenador: L.en(R, "ordenador."),
  esa: L.en(R, "Esa"),
  caja: L.en(R, "caja"),
});

type Herr = { x: number; y: number; at: number; etiqueta: string; etAt: number };

export const Repaso13b: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tRepaso(L);
  const H: Herr[] = [
    { x: 250, y: 790, at: T.claude - 0.1, etiqueta: "INSTALAR", etAt: T.visual },
    { x: 830, y: 790, at: T.md - 0.15, etiqueta: "CONTEXTO", etAt: T.md + 0.3 },
    { x: 250, y: 1040, at: T.corregir, etiqueta: "SIN MIEDO", etAt: T.miedo },
    { x: 830, y: 1040, at: T.planifique - 0.1, etiqueta: "PLANIFICA Y REPARTE", etAt: T.reparta },
    { x: 250, y: 1290, at: T.conecte, etiqueta: "CONECTA", etAt: T.herramientas },
    { x: 830, y: 1290, at: T.use - 0.1, etiqueta: "USA TU ORDENADOR", etAt: T.ordenador },
  ];
  // cámara: se acerca a cada herramienta y al final abre plano con la caja
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1250, z: 1.12 },
    ...H.map((h) => ({ t: h.at + 0.1, x: 540 + (h.x - 540) * 0.12, y: 1130 + (h.y - 1040) * 0.12, z: 1.04, d: 0.5 })),
    { t: T.esa - 0.15, x: 540, y: 1170, z: 0.94, d: 0.6 },
  ];
  const abre = ramp(t, desde + 0.1, desde + 0.5);
  const latido = H.reduce((acc, h) => acc + (t > h.at && t < h.at + 0.25 ? Math.sin(((t - h.at) / 0.25) * Math.PI) : 0), 0);
  const final = ramp(t, T.esa, T.caja + 0.2);
  // vuelo de cada herramienta: sale de la caja con un arco y gira
  const vuelo = (h: Herr, children: React.ReactNode, w: number) => {
    const s = sp(t, h.at, { damping: 13, stiffness: 150 });
    if (t < h.at) return null;
    const u = clamp01(s);
    const x = CAJA.x + (h.x - CAJA.x) * u;
    const y = CAJA.y - 120 + (h.y - CAJA.y + 120) * s - Math.sin(u * Math.PI) * 220;
    const giro = (1 - s) * (h.x < 540 ? -200 : 200);
    // al final se juntan un poco alrededor de la caja
    const fx = x;
    const fy = y - 10 * final;
    return (
      <div style={{ position: "absolute", left: fx, top: fy, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${(0.3 + 0.7 * Math.min(1.1, s)) * (1 - 0.1 * final)}) rotate(${giro}deg)`, width: w, display: "flex", justifyContent: "center" }}>{children}</div>
      </div>
    );
  };
  return (
    <Escena t={t} tomas={tomas}>
      {final > 0 && <div style={{ position: "absolute", left: 540 - 520, top: 1100 - 520, width: 1040, height: 1040, borderRadius: "50%", background: `radial-gradient(closest-side, ${C.acento}33, transparent)`, opacity: final }} />}
      <Caja x={CAJA.x} y={CAJA.y} w={CAJA.w} abre={abre} brillo={Math.min(1, latido + final)} aplasta={latido * 0.5} />
      {vuelo(
        H[0],
        <div style={{ position: "relative", width: 360, height: 200 }}>
          <Logo src={ep.logos.claude_code} x={95} y={100} w={170} t={t} at={H[0].at} sombra={false} />
          <Logo src={ep.logos.vscode} x={275} y={100} w={130} t={t} at={T.visual - 0.1} sombra={false} />
        </div>,
        360,
      )}
      {vuelo(H[1], <ArchivoMd w={170} logo={ep.logos.claude} lineas={ramp(t, T.md, T.md + 0.6)} />, 200)}
      {vuelo(H[2], <Deshacer w={190} gira={ramp(t, T.miedo - 0.2, T.miedo + 0.5)} />, 200)}
      {vuelo(H[3], <Tablero w={300} p={ramp(t, T.reparta - 0.1, T.conecte)} />, 300)}
      {vuelo(
        H[4],
        <div style={{ position: "relative", width: 300, height: 170 }}>
          <Logo src={ep.logos.github_circulo} x={90} y={85} w={150} t={t} at={H[4].at} ficha="circulo" sombra={false} />
          <Logo src={ep.logos.mcp} x={225} y={85} w={120} t={t} at={H[4].at + 0.25} ficha="circulo" sombra={false} />
        </div>,
        300,
      )}
      {vuelo(H[5], <Portatil w={270} cursor={ramp(t, T.use, T.ordenador + 0.4)} clic={Math.sin(clamp01((t - T.ordenador - 0.4) / 0.2) * Math.PI)} />, 280)}
      {H.map((h, i) => (
        <Etiqueta key={i} texto={h.etiqueta} x={h.x} y={h.y + (i === 3 ? 160 : 135)} t={t} at={h.etAt} size={30} variante={i % 2 ? "acento" : "borde"} fuente="titulo" />
      ))}
      <Sello texto="TU CAJA DE HERRAMIENTAS" x={540} y={1640} t={t} at={T.caja} size={54} rot={-3} resalte={1} />
    </Escena>
  );
};

export const eventosRepaso13b = (L: Linea): Evento[] => {
  const T = tRepaso(L);
  return [
    cue(T.claude, "zoom", "sale Claude Code de la caja (la cámara se acerca)", "bajo"),
    cue(T.visual, "click", "logo de Visual Studio Code", "bajo"),
    cue(T.md, "remate", "sale el archivo CLAUDE.md", "medio"),
    cue(T.corregir + 0.1, "interfaz", "sale la flecha de deshacer", "bajo"),
    cue(T.miedo, "click", "sello SIN MIEDO", "bajo"),
    cue(T.planifique, "remate", "sale el tablero de tareas", "medio"),
    cue(T.reparta + 0.3, "click", "las tareas se reparten", "bajo"),
    cue(T.conecte + 0.1, "glitch", "salen GitHub y MCP (conexiones)", "bajo"),
    cue(T.use, "interfaz", "sale el portátil con el cursor", "medio"),
    cue(T.ordenador + 0.45, "click", "el cursor hace clic", "bajo"),
    cue(T.esa - 0.1, "zoom", "la cámara abre plano con la caja", "bajo"),
    cue(T.caja, "destello", "sello TU CAJA DE HERRAMIENTAS", "medio"),
  ];
};
