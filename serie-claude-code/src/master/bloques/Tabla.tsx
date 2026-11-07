/**
 * Tabla de los 7 tipos de proyecto, de menos a más complejo. Las filas numeradas entran en escalera; al nombrar cada
 * tipo se resalta con zoom y muestra sus bloques (cara, motor, memoria) y dónde vive. En el ERP se despliega su
 * significado y el bloque cierra con la flecha hacia arriba de la regla.
 * Escenas: siete → t1…t7 → regla.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { IconCara, IconFlechaArriba, IconHosting, IconMemoria, IconMotor, IconNube, IconOrdenador, IconVps } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta } from "../componentes/Sello";
import { C, EASE_IN, EASE_OUT, TITULO, UI, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

type Vive = "ordenador" | "hosting" | "vps" | "nube";
type Fila = { n: number; id: string; nombre: string; sub?: string; bloques: [boolean, boolean, boolean]; vive?: Vive; deduccion?: boolean; ancla: string };

/** Datos de cada tipo: lo que lleva y dónde vive, tal como lo dice el guion (3, 6 y 7: el guion no dice dónde viven). */
export const FILAS: Fila[] = [
  { n: 1, id: "t1", nombre: "KIT", bloques: [false, false, false], vive: "ordenador", ancla: "kit" },
  { n: 2, id: "t2", nombre: "LANDING", bloques: [true, false, false], vive: "hosting", ancla: "landing" },
  { n: 3, id: "t3", nombre: "WEB CON LOGIN", bloques: [true, true, true], vive: "hosting", deduccion: true, ancla: "web" },
  { n: 4, id: "t4", nombre: "AUTOMATIZACIONES", sub: "Paquete de", bloques: [false, true, false], vive: "vps", ancla: "paquete" },
  { n: 5, id: "t5", nombre: "AGENTE DE IA", bloques: [false, true, true], vive: "vps", ancla: "agente" },
  { n: 6, id: "t6", nombre: "MINI-APP", bloques: [true, true, true], vive: "hosting", deduccion: true, ancla: "mini-app" },
  { n: 7, id: "t7", nombre: "ERP", bloques: [true, true, true], vive: "nube", deduccion: true, ancla: "ERP" },
];

const X0 = 50;
const AN = 980;
const Y0 = 700; // y del centro de la fila 1
const PASO = 150;
const yFila = (i: number) => Y0 + i * PASO;

const tiempos = (L: Linea) => ({
  siete: L.en("siete", "siete"),
  tipos: L.en("siete", "tipos"),
  menos: L.en("siete", "menos"),
  complejo: L.en("siete", "complejo"),
  filas: FILAS.map((f, i) => ({ ini: L.ini(f.id), nombre: L.en(f.id, f.ancla), fin: L.fin(f.id), i })),
  vive: FILAS.map((f) => {
    const w = f.vive === "ordenador" ? "ordenador" : f.vive === "hosting" ? "hosting" : f.vive === "vps" ? "VPS" : "";
    try {
      return w ? L.en(f.id, w) : null;
    } catch {
      return null;
    }
  }),
  bloquesAt: FILAS.map((f) => {
    const w = ["cara", "motor", "memoria"].find((x) => {
      try {
        return L.en(f.id, x) >= 0;
      } catch {
        return false;
      }
    });
    try {
      return w ? L.en(f.id, w) : L.en(f.id, f.ancla) + 0.5;
    } catch {
      return L.ini(f.id) + 0.5;
    }
  }),
  erp: L.en("t7", "ERP"),
  planif: L.en("t7", "Planificación"),
  tres: L.en("t7", "tres"),
  regla: L.ini("regla"),
  mas1: L.en("regla", "partes"),
  mas2: L.en("regla", "infraestructura"),
  compl: L.en("regla", "complejidad"),
  coste: L.en("regla", "coste"),
  finRegla: L.fin("regla"),
});

const ICONO_VIVE: Record<Vive, React.FC<{ s?: number; color?: string }>> = { ordenador: IconOrdenador, hosting: IconHosting, vps: IconVps, nube: IconNube };

export const Tabla: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const out = hasta + 0.3;
  // la fila activa es la del tipo que se está nombrando
  const activa = (() => {
    let a = -1;
    T.filas.forEach((f) => {
      if (t >= f.ini - 0.1) a = f.i;
    });
    return t >= T.regla - 0.2 ? -1 : a;
  })();
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1130, z: 0.82 },
    { t: T.tipos - 0.2, x: 540, y: 1140, z: 0.8, d: 0.9 },
    ...T.filas.map((f, i) => ({ t: f.ini - 0.2, x: 540, y: yFila(i) + 60, z: 0.99, d: 0.8 })),
    { t: T.erp - 0.3, x: 540, y: yFila(6) + 120, z: 0.97, d: 0.9 },
    { t: T.regla - 0.2, x: 540, y: 1180, z: 0.8, d: 1.1 },
  ];
  const panel = vis(t, desde + 0.1, out, 0.85);
  return (
    <Escena t={t} tomas={tomas}>
      {panel.on && (
        <div style={{ position: "absolute", left: X0 - 20, top: 500, width: AN + 40, height: 1330, borderRadius: 46, background: C.panel, border: `3px solid ${C.borde}`, opacity: panel.opacity, transform: `scale(${panel.scale})`, boxShadow: "0 40px 100px rgba(0,0,0,0.55)" }} />
      )}
      {/* cabecera */}
      {(() => {
        const v = vis(t, T.siete - 0.05, out, 0.8);
        return v.on ? (
          <div style={{ position: "absolute", left: X0, top: 530, width: AN, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: v.opacity, transform: `translateY(${v.y}px)` }}>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: C.texto, letterSpacing: -1 }}>
              7 TIPOS <span style={{ color: C.acento }}>DE PROYECTO</span>
            </div>
          </div>
        ) : null;
      })()}
      {(() => {
        const v = vis(t, T.menos - 0.1, out, 0.8);
        return v.on ? (
          <>
            <div style={{ position: "absolute", left: X0 + 330, top: 622, opacity: v.opacity, fontFamily: UI, fontWeight: 700, fontSize: 26, color: C.gris, letterSpacing: 2 }}>LLEVA</div>
            <div style={{ position: "absolute", left: X0 + 760, top: 622, opacity: v.opacity, fontFamily: UI, fontWeight: 700, fontSize: 26, color: C.gris, letterSpacing: 2 }}>VIVE EN</div>
          </>
        ) : null;
      })()}
      {/* filas */}
      {FILAS.map((f, i) => {
        const y = yFila(i);
        // entrada en escalera durante «siete tipos»: cada fila llega un poco después de la anterior
        const entra = T.tipos - 0.25 + i * 0.16;
        const v = vis(t, entra, out, 0.9);
        if (!v.on) return null;
        const fi = T.filas[i];
        const llena = sp(t, fi.ini - 0.05, { damping: 14, stiffness: 170 });
        const act = activa === i ? 1 : 0;
        const hecha = t > fi.ini - 0.1 ? 1 : 0;
        const ocupada = hecha * (activa === i ? 1 : 0.7);
        const dx = (1 - v.s) * -160;
        return (
          <div key={f.id} style={{ position: "absolute", left: X0, top: y - PASO / 2 + 6, width: AN, height: PASO - 12, opacity: v.opacity, transform: `translateX(${dx}px) scale(${1 + 0.045 * act * ramp(t, fi.ini - 0.1, fi.ini + 0.3, EASE_OUT)})`, borderRadius: 30, background: act ? `color-mix(in srgb, ${C.acento} 18%, ${C.panel2})` : hecha ? C.panel2 : "transparent", border: `3px solid ${act ? C.acento : hecha ? C.borde : C.borde + "88"}`, boxShadow: act ? `0 0 44px ${C.acento}55` : "none" }}>
            {/* número */}
            <div style={{ position: "absolute", left: 22, top: 26, width: 82, height: 82, borderRadius: 24, background: hecha ? C.acento : C.panel2, color: hecha ? C.oscuro : C.tenue, fontFamily: TITULO, fontWeight: 800, fontSize: 54, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.18 * Math.sin(Math.min(1, llena) * Math.PI) * (hecha ? 1 : 0)})` }}>{f.n}</div>
            {hecha > 0 && (
              <>
                {/* nombre */}
                <div style={{ position: "absolute", left: 128, top: 0, height: PASO - 12, width: 360, display: "flex", flexDirection: "column", justifyContent: "center", opacity: Math.min(1, llena * 1.6), transform: `translateX(${(1 - llena) * 30}px)` }}>
                  {f.sub && <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 24, color: C.gris, marginBottom: 2 }}>{f.sub}</div>}
                  <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: f.nombre.length > 12 ? 33 : 42, color: C.texto, letterSpacing: -0.5, whiteSpace: "nowrap", opacity: ocupada }}>{f.nombre}</div>
                </div>
                {/* bloques */}
                {[IconCara, IconMotor, IconMemoria].map((Ic, k) => {
                  const on = f.bloques[k];
                  const at = T.bloquesAt[i] + k * 0.12;
                  const s = sp(t, Math.min(at, fi.nombre + 0.6) + (on ? 0 : 0.15), { damping: 12, stiffness: 190 });
                  const x = 500 + k * 100;
                  return (
                    <div key={k} style={{ position: "absolute", left: x, top: 22, width: 88, height: 88, borderRadius: 22, background: on ? ["#E87A55", "#5B8DEF", "#E5B455"][k] : "transparent", border: `3px ${on ? "solid" : "dashed"} ${on ? "transparent" : C.tenue}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(1, s * 1.6) * (on ? 1 : 0.55), transform: `scale(${0.6 + 0.4 * s})` }}>
                      <Ic s={56} color={on ? C.oscuro : C.tenue} />
                    </div>
                  );
                })}
                {/* dónde vive */}
                {f.vive && (() => {
                  const Iv = ICONO_VIVE[f.vive];
                  const at = (T.vive[i] ?? fi.nombre) + 0.1;
                  const s = sp(t, Math.max(at, fi.ini + 0.9), { damping: 12, stiffness: 180 });
                  return (
                    <div style={{ position: "absolute", left: 820, top: 16, width: 140, height: 100, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(1, s * 1.6), transform: `scale(${0.6 + 0.4 * s})` }}>
                      {f.vive === "nube" ? <Logo src="logos/aws.png" x={70} y={52} w={120} t={t} at={Math.max(at, fi.ini + 0.9) - 0.05} ficha="tarjeta" sombra={false} /> : <Iv s={80} color={f.deduccion ? C.acentoSuave : C.texto} />}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        );
      })}
      {/* el kit lleva el logo de Claude Code */}
      <Logo src="logos/claude-code-mascota.png" x={X0 + 440} y={yFila(0) + 2} w={64} t={t} at={T.filas[0].nombre} out={out} sombra={false} />
      {/* ERP: se despliega su significado */}
      {(() => {
        const v = vis(t, T.planif - 0.4, out, 0.6);
        return v.on ? (
          <div style={{ position: "absolute", left: X0 + 30, top: yFila(6) + 82, width: AN - 60, opacity: v.opacity, transform: `scaleY(${0.2 + 0.8 * v.s})`, transformOrigin: "50% 0", background: C.acento, color: C.oscuro, borderRadius: 26, padding: "16px 30px", fontFamily: TITULO, fontWeight: 800, fontSize: 40, textAlign: "center", boxShadow: `0 16px 50px ${C.acento}55` }}>
            ERP = PLANIFICACIÓN DE RECURSOS EMPRESARIALES
          </div>
        ) : null;
      })()}
      {/* regla: flecha hacia arriba */}
      {(() => {
        const v = vis(t, T.regla - 0.15, out, 0.8);
        if (!v.on) return null;
        const sube = ramp(t, T.regla, T.coste + 0.6, EASE_IN);
        const items = [
          { txt: "MÁS PARTES", at: T.mas1 },
          { txt: "MÁS INFRAESTRUCTURA", at: T.mas2 },
          { txt: "MÁS COMPLEJIDAD", at: T.compl },
          { txt: "MÁS COSTE", at: T.coste },
        ];
        return (
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: v.opacity }}>
            <div style={{ position: "absolute", left: 0, top: 500, width: 1080, height: 1330, background: `${C.panel}F2`, borderRadius: 46 }} />
            <div style={{ position: "absolute", left: 50, top: 700 + (1 - sube) * 560, transform: `scale(${0.8 + 0.2 * v.s})` }}>
              <IconFlechaArriba s={250} color={C.acento} w={5} />
            </div>
            {items.map((it, k) => {
              const iv = vis(t, it.at - 0.05, out, 0.8);
              return iv.on ? (
                <div key={k} style={{ position: "absolute", left: 320, top: 760 + k * 170, opacity: iv.opacity, transform: `translateX(${(1 - iv.s) * 60}px)`, fontFamily: TITULO, fontWeight: 800, fontSize: k === 3 ? 70 : 54, color: k === 3 ? C.acento : C.texto, whiteSpace: "nowrap", letterSpacing: -1 }}>
                  {k > 0 && <span style={{ color: C.gris, marginRight: 14 }}>{k === 3 ? "=" : "+"}</span>}
                  {it.txt}
                </div>
              ) : null;
            })}
          </div>
        );
      })()}
      <Etiqueta texto="DE MENOS A MÁS COMPLEJO" x={540} y={1795} t={t} at={T.complejo - 0.2} out={T.filas[0].ini - 0.2} size={34} variante="gris" />
    </Escena>
  );
};

export const eventosTabla = (L: Linea, _ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L);
  return [
    ...FILAS.map((_, i) => ({ t: T.tipos - 0.25 + i * 0.16, sfx: "pop" as const, vol: 0.18 })),
    ...T.filas.map((f) => ({ t: f.ini, sfx: "tick" as const, vol: 0.5 })),
    { t: T.planif - 0.3, sfx: "golpe", vol: 0.45 },
    { t: T.regla, sfx: "whoosh", vol: 0.4 },
    { t: T.coste, sfx: "golpe", vol: 0.5 },
  ];
};
