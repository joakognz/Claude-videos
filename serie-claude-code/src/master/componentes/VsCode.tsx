/**
 * Maqueta animada de Visual Studio Code para recrear las tomas de pantalla (sin datos privados): ventana con barra de
 * actividad, explorador, extensiones, panel y chat de Claude Code, editor de código, navegador y diálogo de carpeta.
 * Todo se dibuja en un lienzo «de pantalla» de 1500x1000 y la cámara del bloque encuadra la zona de acción (recorte
 * 9:16 con zoom). Cada pieza recibe el estado ya calculado desde el tiempo: aquí no hay temporizadores.
 * Los únicos logos son los ficheros de public/logos (Claude, Hostinger, Live Server…); los iconos de la interfaz son
 * trazos genéricos.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, UI, clamp01, rand } from "../nucleo";

export const VS = { W: 1500, H: 1000, barra: 46, act: 76, lat: 400, estado: 36, pest: 52 };
export const VSC = {
  fondo: "#1E1E1E",
  lateral: "#252526",
  act: "#333333",
  titulo: "#3C3C3C",
  borde: "#3C3C3C",
  azul: "#0E639C",
  azulClaro: "#3794FF",
  texto: "#CCCCCC",
  tenue: "#8B8B8B",
  estado: "#007ACC",
  sel: "#04395E",
  hover: "#2A2D2E",
};

/** x, y (en el lienzo de la ventana) del centro de cada icono de la barra de actividad. */
export const posActividad = (i: number) => ({ x: VS.act / 2, y: VS.barra + 46 + i * 78 });
/** Zonas útiles para encuadrar con la cámara (coordenadas de la ventana). */
export const ZONA = {
  lateral: { x: VS.act + VS.lat / 2, y: VS.H / 2 },
  editor: { x: VS.act + VS.lat + (VS.W - VS.act - VS.lat) / 2, y: VS.H / 2 },
};

const Svg: React.FC<{ s: number; color: string; children: React.ReactNode; w?: number }> = ({ s, color, children, w = 1.8 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const ICONOS_ACT = [
  // explorador
  <><path d="M14 3H7a2 2 0 0 0-2 2v12" /><path d="M9 7h8l3 3v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" /></>,
  // buscar
  <><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5.5 5.5" /></>,
  // control de código
  <><circle cx="6" cy="5" r="2.2" /><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="8" r="2.2" /><path d="M6 7.2v9.6M18 10.2c0 4-6 3-11 6.6" /></>,
  // ejecutar
  <><path d="M7 4.5v15l12-7.5z" /></>,
  // extensiones
  <><rect x="3.5" y="10.5" width="6" height="6" rx="0.6" /><rect x="9.5" y="10.5" width="6" height="6" rx="0.6" /><rect x="3.5" y="16.5" width="6" height="4" rx="0.6" /><rect x="13" y="3.5" width="6.5" height="6.5" rx="0.6" transform="rotate(12 16 7)" /></>,
];

type Pestana = { txt: string; activa?: boolean; sucia?: boolean; icono?: React.ReactNode };

/** Ventana completa. `activo`: índice de la barra de actividad (5 = Claude). `claude`: 0 → 1, aparece su icono. */
export const VentanaVs: React.FC<{
  titulo: string;
  activo: number;
  claude?: number;
  pulsoClaude?: number;
  lateral: React.ReactNode;
  editor: React.ReactNode;
  pestanas?: Pestana[];
  estado?: React.ReactNode;
  encima?: React.ReactNode;
}> = ({ titulo, activo, claude = 0, pulsoClaude = 0, lateral, editor, pestanas = [], estado, encima }) => (
  <div style={{ position: "relative", width: VS.W, height: VS.H, borderRadius: 18, overflow: "hidden", background: VSC.fondo, boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 0 2px #000", fontFamily: UI }}>
    {/* barra de título */}
    <div style={{ position: "absolute", left: 0, top: 0, width: VS.W, height: VS.barra, background: VSC.titulo, display: "flex", alignItems: "center", padding: "0 20px", boxSizing: "border-box", gap: 12 }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c }} />
      ))}
      <div style={{ flex: 1, textAlign: "center", fontSize: 20, fontWeight: 600, color: VSC.texto }}>{titulo}</div>
      <div style={{ width: 80 }} />
    </div>
    {/* barra de actividad */}
    <div style={{ position: "absolute", left: 0, top: VS.barra, width: VS.act, height: VS.H - VS.barra - VS.estado, background: VSC.act }}>
      {ICONOS_ACT.map((ic, i) => {
        const p = posActividad(i);
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: p.y - VS.barra - 30, width: VS.act, height: 60, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: `4px solid ${activo === i ? "#FFFFFF" : "transparent"}`, boxSizing: "border-box" }}>
            <Svg s={38} color={activo === i ? "#FFFFFF" : "#858585"}>{ic}</Svg>
          </div>
        );
      })}
      {claude > 0.001 && (() => {
        const p = posActividad(5);
        return (
          <div style={{ position: "absolute", left: 0, top: p.y - VS.barra - 30, width: VS.act, height: 60, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: `4px solid ${activo === 5 ? "#FFFFFF" : "transparent"}`, boxSizing: "border-box", opacity: Math.min(1, claude * 1.5) }}>
            <div style={{ transform: `scale(${(0.3 + 0.7 * claude) * (1 + 0.25 * pulsoClaude)})`, filter: pulsoClaude > 0 ? `drop-shadow(0 0 ${14 * pulsoClaude}px ${C.acento})` : undefined }}>
              <Img src={staticFile("logos/claude.png")} style={{ width: 40, display: "block" }} />
            </div>
          </div>
        );
      })()}
    </div>
    {/* lateral */}
    <div style={{ position: "absolute", left: VS.act, top: VS.barra, width: VS.lat, height: VS.H - VS.barra - VS.estado, background: VSC.lateral, overflow: "hidden" }}>{lateral}</div>
    {/* pestañas + editor */}
    <div style={{ position: "absolute", left: VS.act + VS.lat, top: VS.barra, right: 0, height: VS.pest, background: "#252526", display: "flex" }}>
      {pestanas.map((p, i) => (
        <div key={i} style={{ height: VS.pest, padding: "0 22px", display: "flex", alignItems: "center", gap: 10, background: p.activa ? VSC.fondo : "#2D2D2D", borderTop: p.activa ? `2px solid ${VSC.azulClaro}` : "2px solid transparent", color: p.activa ? "#FFFFFF" : VSC.tenue, fontSize: 20, borderRight: "1px solid #252526" }}>
          {p.icono}
          {p.txt}
          <span style={{ marginLeft: 6, fontSize: 18, color: VSC.tenue }}>{p.sucia ? "●" : "×"}</span>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: VS.act + VS.lat, top: VS.barra + VS.pest, right: 0, height: VS.H - VS.barra - VS.pest - VS.estado, background: VSC.fondo, overflow: "hidden" }}>{editor}</div>
    {/* barra de estado */}
    <div style={{ position: "absolute", left: 0, bottom: 0, width: VS.W, height: VS.estado, background: VSC.estado, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 18px", boxSizing: "border-box", color: "#FFFFFF", fontSize: 18, gap: 24 }}>
      {estado}
    </div>
    {encima}
  </div>
);

/** Cabecera de sección del lateral («EXPLORER», «EXTENSIONS»…). */
export const CabeceraLateral: React.FC<{ txt: string }> = ({ txt }) => (
  <div style={{ height: 50, display: "flex", alignItems: "center", padding: "0 22px", fontSize: 17, fontWeight: 700, letterSpacing: 1.2, color: VSC.texto }}>{txt}</div>
);

export const BotonVs: React.FC<{ txt: React.ReactNode; pulsa?: number; ancho?: number | string; size?: number; tipo?: "azul" | "gris" }> = ({ txt, pulsa = 0, ancho = "auto", size = 21, tipo = "azul" }) => (
  <div style={{ width: ancho, padding: `${size * 0.42}px ${size * 0.8}px`, boxSizing: "border-box", borderRadius: 4, background: tipo === "azul" ? VSC.azul : "#3A3D41", color: "#FFFFFF", fontSize: size, fontWeight: 600, textAlign: "center", transform: `scale(${1 - 0.06 * Math.sin(clamp01(pulsa) * Math.PI)})`, boxShadow: pulsa > 0 && pulsa < 1 ? `0 0 0 4px ${VSC.azulClaro}88` : "none", whiteSpace: "nowrap" }}>
    {txt}
  </div>
);

// ── explorador ─────────────────────────────────────────────────────────────────────────────────────────────────────
export const ARCHIVOS = [
  { nombre: "index.html", color: "#E44D26", marca: "<>" },
  { nombre: "estilos.css", color: "#42A5F5", marca: "#" },
  { nombre: "app.js", color: "#F1D84B", marca: "JS" },
  { nombre: "imagenes", color: "#C09553", marca: "▸", carpeta: true },
];

export const PanelExplorer: React.FC<{
  abierta: boolean;
  nombre?: string;
  /** 0 → 1: aparecen los archivos */
  archivos?: number;
  /** resaltado por archivo (0 → 1) */
  resalte?: number[];
  pulsaBoton?: number;
}> = ({ abierta, nombre = "MI-PROYECTO", archivos = 1, resalte = [], pulsaBoton = 0 }) => (
  <div>
    <CabeceraLateral txt="EXPLORER" />
    {!abierta ? (
      <div style={{ padding: "0 22px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: VSC.texto, marginBottom: 18 }}>⌄ NO FOLDER OPENED</div>
        <div style={{ fontSize: 20, color: VSC.texto, lineHeight: 1.4, marginBottom: 20 }}>You have not yet opened a folder.</div>
        <BotonVs txt="Open Folder" pulsa={pulsaBoton} ancho="100%" />
      </div>
    ) : (
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: VSC.texto, padding: "4px 22px 10px" }}>⌄ {nombre}</div>
        {ARCHIVOS.map((a, i) => {
          const u = clamp01(archivos * (ARCHIVOS.length + 1) - i);
          const r = resalte[i] ?? 0;
          return (
            <div key={a.nombre} style={{ height: 48, display: "flex", alignItems: "center", gap: 14, padding: "0 22px 0 44px", opacity: u, transform: `translateX(${(1 - u) * -30}px)`, background: r > 0 ? `rgba(55,148,255,${0.32 * r})` : "transparent", boxShadow: r > 0.5 ? `inset 3px 0 0 ${C.acento}` : "none" }}>
              <span style={{ width: 30, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: a.marca.length > 1 ? 16 : 22, color: a.color }}>{a.marca}</span>
              <span style={{ fontSize: 22, color: VSC.texto }}>{a.nombre}</span>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

/** Página de bienvenida del editor. */
export const Bienvenida: React.FC = () => (
  <div style={{ padding: "80px 70px", color: VSC.texto }}>
    <div style={{ fontSize: 56, fontWeight: 400, color: "#E7E7E7" }}>Visual Studio Code</div>
    <div style={{ fontSize: 28, color: VSC.tenue, marginTop: 6 }}>Editing evolved</div>
    <div style={{ fontSize: 26, marginTop: 60, marginBottom: 18 }}>Start</div>
    {["New File…", "Open…", "Clone Git Repository…", "Connect to…"].map((s) => (
      <div key={s} style={{ fontSize: 23, color: VSC.azulClaro, marginBottom: 14 }}>{s}</div>
    ))}
  </div>
);

/** Diálogo del sistema para elegir carpeta (centrado en la ventana). */
export const DialogoCarpeta: React.FC<{ op: number; escala: number; sel: number; pulsaOpen: number }> = ({ op, escala, sel, pulsaOpen }) => {
  if (op <= 0.001) return null;
  const W = 820;
  const H = 540;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: VS.W, height: VS.H, background: `rgba(0,0,0,${0.35 * op})` }}>
      <div style={{ position: "absolute", left: (VS.W - W) / 2 + 120, top: 150, width: W, height: H, borderRadius: 16, background: "#2B2B2E", border: "1px solid #48484C", boxShadow: "0 40px 90px rgba(0,0,0,0.7)", opacity: op, transform: `scale(${escala})`, overflow: "hidden" }}>
        <div style={{ height: 56, borderBottom: "1px solid #3E3E42", display: "flex", alignItems: "center", padding: "0 22px", gap: 14 }}>
          <div style={{ width: 120, height: 14, borderRadius: 7, background: "#4A4A4F" }} />
          <div style={{ flex: 1 }} />
          <div style={{ width: 170, height: 30, borderRadius: 8, background: "#3A3A3E" }} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 56, width: 190, bottom: 0, background: "#262628", padding: "20px 18px", boxSizing: "border-box" }}>
          {[0.7, 0.55, 0.8, 0.6, 0.5].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: i === 1 ? "#3B82F6" : "#5A5A60" }} />
              <div style={{ width: 120 * f, height: 10, borderRadius: 5, background: "#55555B" }} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 220, top: 90, display: "flex", gap: 44 }}>
          {[0, 1, 2].map((i) => {
            const esta = i === 1;
            return (
              <div key={i} style={{ width: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, background: esta && sel > 0 ? `rgba(59,130,246,${0.45 * sel})` : "transparent" }}>
                <svg width={110} height={90} viewBox="0 0 110 90">
                  <path d="M6 14 a6 6 0 0 1 6 -6 h28 l9 9 h49 a6 6 0 0 1 6 6 v55 a6 6 0 0 1 -6 6 h-86 a6 6 0 0 1 -6 -6 z" fill={esta ? "#5AA9F5" : "#4C8ED6"} opacity={esta ? 1 : 0.55} />
                </svg>
                {esta ? <div style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFF" }}>mi-proyecto</div> : <div style={{ width: 90, height: 10, borderRadius: 5, background: "#55555B", marginTop: 6 }} />}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", right: 22, bottom: 20, display: "flex", gap: 14 }}>
          <BotonVs txt="Cancel" tipo="gris" />
          <BotonVs txt="Open" pulsa={pulsaOpen} />
        </div>
      </div>
    </div>
  );
};

// ── extensiones ────────────────────────────────────────────────────────────────────────────────────────────────────
export type Extension = {
  logo?: string;
  nombre: string;
  autor: string;
  verificado?: boolean;
  /** 0 instalar · 1 instalando · 2 instalada */
  estado?: number;
  resalte?: number;
  pulsa?: number;
};

const Verificado: React.FC<{ s?: number }> = ({ s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill={VSC.azulClaro} />
    <path d="M7.5 12.5 L10.5 15.5 L16.5 9" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Girando: React.FC<{ t: number; s?: number }> = ({ t, s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ transform: `rotate(${t * 400}deg)` }}>
    <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
    <path d="M12 3 a9 9 0 0 1 9 9" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const BotonInstalar: React.FC<{ estado: number; t: number; pulsa?: number; size?: number }> = ({ estado, t, pulsa = 0, size = 18 }) =>
  estado >= 2 ? (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: size, color: "#89D185", fontWeight: 700 }}>✓ Installed</div>
  ) : estado >= 1 ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: `${size * 0.3}px ${size * 0.6}px`, borderRadius: 4, background: VSC.azul, color: "#fff", fontSize: size, fontWeight: 600 }}>
      <Girando t={t} s={size + 2} /> Installing
    </div>
  ) : (
    <BotonVs txt="Install" pulsa={pulsa} size={size} />
  );

/** Lateral de extensiones: buscador (texto que se escribe) y resultados. Los que no son el bueno, abstractos. */
export const PanelExtensiones: React.FC<{ t: number; busqueda: string; cursor?: boolean; resultados: (Extension | null)[]; op?: number }> = ({ t, busqueda, cursor, resultados, op = 1 }) => (
  <div>
    <CabeceraLateral txt="EXTENSIONS: MARKETPLACE" />
    <div style={{ margin: "0 18px 14px", height: 46, borderRadius: 4, background: "#3C3C3C", border: `1px solid ${busqueda ? VSC.azulClaro : "#3C3C3C"}`, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 21, color: busqueda ? "#FFFFFF" : VSC.tenue }}>
      {busqueda || "Search Extensions in Marketplace"}
      {cursor && <span style={{ display: "inline-block", width: 2, height: 24, marginLeft: 2, background: "#fff", opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0 }} />}
    </div>
    <div style={{ opacity: op }}>
      {resultados.map((r, i) =>
        r ? (
          <div key={i} style={{ height: 118, display: "flex", gap: 16, padding: "14px 18px", boxSizing: "border-box", background: r.resalte ? `rgba(4,57,94,${r.resalte})` : "transparent", boxShadow: (r.resalte ?? 0) > 0.5 ? `inset 0 0 0 2px ${VSC.azulClaro}` : "none" }}>
            <div style={{ width: 64, height: 64, borderRadius: 10, background: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {r.logo && <Img src={staticFile(r.logo)} style={{ width: 54, height: 54, objectFit: "contain" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 21, fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.nombre}</div>
              <div style={{ width: "86%", height: 9, borderRadius: 5, background: "#4A4A4F", margin: "10px 0" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 18, color: VSC.texto }}>
                  {r.verificado && <Verificado s={18} />}
                  {r.autor}
                </div>
                <BotonInstalar estado={r.estado ?? 0} t={t} pulsa={r.pulsa} size={16} />
              </div>
            </div>
          </div>
        ) : (
          <div key={i} style={{ height: 118, display: "flex", gap: 16, padding: "14px 18px", boxSizing: "border-box", opacity: 0.55 }}>
            <div style={{ width: 64, height: 64, borderRadius: 10, background: "#3A3A3E", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: `${50 + rand(i * 7) * 35}%`, height: 14, borderRadius: 7, background: "#55555B" }} />
              <div style={{ width: "86%", height: 9, borderRadius: 5, background: "#3E3E42", margin: "14px 0" }} />
              <div style={{ width: "40%", height: 9, borderRadius: 5, background: "#3E3E42" }} />
            </div>
          </div>
        ),
      )}
    </div>
  </div>
);

/** Ficha de una extensión en el editor (icono grande, nombre, autor y botón de instalar). */
export const DetalleExtension: React.FC<{ t: number; ext: Extension; extra?: React.ReactNode }> = ({ t, ext, extra }) => (
  <div style={{ padding: "50px 56px", color: VSC.texto }}>
    <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
      <div style={{ width: 170, height: 170, borderRadius: 24, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {ext.logo && <Img src={staticFile(ext.logo)} style={{ width: 140, height: 140, objectFit: "contain" }} />}
      </div>
      <div>
        <div style={{ fontSize: 44, fontWeight: 700, color: "#FFFFFF" }}>{ext.nombre}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 26, color: VSC.azulClaro, margin: "10px 0 20px" }}>
          {ext.verificado && <Verificado s={26} />}
          {ext.autor}
        </div>
        <BotonInstalar estado={ext.estado ?? 0} t={t} pulsa={ext.pulsa} size={24} />
      </div>
    </div>
    <div style={{ height: 2, background: "#333", margin: "40px 0 30px" }} />
    {[0.92, 0.85, 0.95, 0.7, 0.88, 0.6].map((f, i) => (
      <div key={i} style={{ width: `${f * 100}%`, height: 12, borderRadius: 6, background: "#3A3A3E", marginBottom: 22 }} />
    ))}
    {extra}
  </div>
);

// ── Claude Code ────────────────────────────────────────────────────────────────────────────────────────────────────
export const PanelClaude: React.FC<{ pulsaNueva: number; sesion?: string; sesionOp?: number }> = ({ pulsaNueva, sesion, sesionOp = 0 }) => (
  <div>
    <CabeceraLateral txt="CLAUDE CODE" />
    <div style={{ padding: "0 18px" }}>
      <BotonVs txt="+  New session" pulsa={pulsaNueva} ancho="100%" />
      <div style={{ fontSize: 16, fontWeight: 700, color: VSC.tenue, letterSpacing: 1, margin: "26px 4px 12px" }}>SESSIONS</div>
      {sesion && (
        <div style={{ height: 46, display: "flex", alignItems: "center", gap: 12, padding: "0 12px", borderRadius: 6, background: VSC.sel, opacity: sesionOp, fontSize: 21, color: "#FFFFFF" }}>
          <Img src={staticFile("logos/claude.png")} style={{ width: 22 }} />
          {sesion}
        </div>
      )}
    </div>
  </div>
);

export type Mensaje = {
  de: "yo" | "claude";
  /** texto del usuario o línea final destacada de Claude */
  texto?: string;
  /** 0 → 1: aparición */
  p: number;
  /** Claude: herramientas que usa (texto corto) con su avance 0 → 1 */
  pasos?: { txt: React.ReactNode; p: number; ok?: boolean }[];
  /** Claude: renglones abstractos antes del texto */
  renglones?: number;
  resalte?: number;
};

/** Chat de Claude Code en el editor: mensajes y caja de entrada con lo que se escribe. */
export const ChatClaude: React.FC<{ t: number; mensajes: Mensaje[]; entrada: string; cursor?: boolean; pulsaEnviar?: number; vacia?: number }> = ({ t, mensajes, entrada, cursor, pulsaEnviar = 0, vacia = 0 }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
    <div style={{ flex: 1, padding: "34px 44px", display: "flex", flexDirection: "column", gap: 22, overflow: "hidden" }}>
      {vacia > 0 && (
        <div style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: vacia }}>
          <Img src={staticFile("logos/claude-code-mascota.png")} style={{ width: 120 }} />
        </div>
      )}
      {mensajes.map((m, i) => {
        if (m.p <= 0.001) return null;
        const est: React.CSSProperties = { opacity: Math.min(1, m.p * 1.6), transform: `translateY(${(1 - m.p) * 24}px)` };
        if (m.de === "yo")
          return (
            <div key={i} style={{ ...est, alignSelf: "flex-start", maxWidth: "80%", padding: "14px 22px", borderRadius: 12, background: "#2F3138", border: "1px solid #44464E", fontSize: 30, color: "#FFFFFF" }}>
              {m.texto}
            </div>
          );
        return (
          <div key={i} style={{ ...est, display: "flex", gap: 16 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.acento, marginTop: 12, flexShrink: 0, boxShadow: `0 0 12px ${C.acento}` }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              {(m.pasos ?? []).map((s, k) =>
                s.p > 0.001 ? (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 25, color: VSC.texto, opacity: Math.min(1, s.p * 2), padding: "8px 14px", borderRadius: 8, background: "#26282E", border: "1px solid #3A3D44", alignSelf: "flex-start" }}>
                    {s.ok ? <span style={{ color: "#89D185", fontWeight: 700 }}>✓</span> : <Girando t={t} s={20} />}
                    {s.txt}
                  </div>
                ) : null,
              )}
              {Array.from({ length: m.renglones ?? 0 }, (_, k) => {
                const u = clamp01(m.p * (m.renglones ?? 1) * 1.3 - k);
                return <div key={k} style={{ width: `${(0.62 + rand(i * 9 + k) * 0.33) * 100 * u}%`, height: 12, borderRadius: 6, background: "#4A4D55" }} />;
              })}
              {m.texto && (
                <div style={{ fontSize: 36, fontWeight: 700, color: "#FFFFFF", padding: (m.resalte ?? 0) > 0 ? "6px 14px" : 0, borderRadius: 8, background: (m.resalte ?? 0) > 0 ? `rgba(217,119,87,${0.35 * (m.resalte ?? 0)})` : "transparent", alignSelf: "flex-start", boxShadow: (m.resalte ?? 0) > 0.5 ? `0 0 0 3px ${C.acento}` : "none" }}>{m.texto}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
    {/* caja de entrada */}
    <div style={{ margin: "0 34px 26px", minHeight: 80, borderRadius: 12, border: `2px solid ${entrada ? C.acento : "#44464E"}`, background: "#26282E", display: "flex", alignItems: "center", padding: "0 14px 0 22px", gap: 14 }}>
      <div style={{ flex: 1, fontSize: 30, color: entrada ? "#FFFFFF" : VSC.tenue, whiteSpace: "nowrap", overflow: "hidden" }}>
        {entrada || "Ask Claude…"}
        {cursor && <span style={{ display: "inline-block", width: 3, height: 30, marginLeft: 3, verticalAlign: "middle", background: "#fff", opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0 }} />}
      </div>
      <div style={{ width: 54, height: 54, borderRadius: 10, background: entrada ? C.acento : "#3A3D44", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * Math.sin(clamp01(pulsaEnviar) * Math.PI)})` }}>
        <svg width={28} height={28} viewBox="0 0 24 24"><path d="M12 19 V5 M5.5 11.5 L12 5 L18.5 11.5" fill="none" stroke={C.oscuro} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  </div>
);

// ── código y navegador (Live Server) ───────────────────────────────────────────────────────────────────────────────
const TOK = ["#569CD6", "#9CDCFE", "#CE9178", "#4EC9B0", "#C586C0", "#DCDCAA"];
/** Código abstracto (barras de colores). La línea `cambia` pasa a `colorCambio` cuando cambio → 1. */
export const Codigo: React.FC<{ lineas?: number; cambia?: number; cambio?: number; colorCambio?: string }> = ({ lineas = 16, cambia = 6, cambio = 0, colorCambio = C.acento }) => (
  <div style={{ padding: "26px 0", fontFamily: MONO }}>
    {Array.from({ length: lineas }, (_, i) => {
      const sangria = [0, 1, 2, 2, 1, 1, 2, 3, 3, 2, 1, 2, 2, 1, 0, 0][i % 16];
      const n = 2 + Math.floor(rand(i * 3.3) * 3);
      const esta = i === cambia;
      return (
        <div key={i} style={{ height: 40, display: "flex", alignItems: "center", gap: 10, background: esta && cambio > 0 ? `rgba(217,119,87,${0.18 * Math.min(1, cambio * 2)})` : "transparent" }}>
          <div style={{ width: 54, textAlign: "right", fontSize: 18, color: "#5A5A5A" }}>{i + 1}</div>
          <div style={{ width: sangria * 30 + 10 }} />
          {Array.from({ length: n }, (_, k) => (
            <div key={k} style={{ width: 40 + rand(i * 5 + k) * 120, height: 14, borderRadius: 7, background: esta && k === n - 1 ? (cambio > 0.5 ? colorCambio : TOK[2]) : TOK[Math.floor(rand(i * 7 + k * 3) * TOK.length)], opacity: 0.85 }} />
          ))}
        </div>
      );
    })}
  </div>
);

/** Ventana de navegador con la web local. `recarga` 0 → 1: gira el icono y la página parpadea. */
export const Navegador: React.FC<{ w: number; h: number; url: string; recarga?: number; color: string; t: number }> = ({ w, h, url, recarga = 0, color, t }) => {
  const flash = Math.sin(clamp01(recarga) * Math.PI);
  return (
    <div style={{ width: w, height: h, borderRadius: 16, overflow: "hidden", background: "#F4F5F7", boxShadow: "0 40px 100px rgba(0,0,0,0.65)", fontFamily: UI }}>
      <div style={{ height: 56, background: "#DEE1E6", display: "flex", alignItems: "center", gap: 14, padding: "0 18px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
        ))}
        <svg width={28} height={28} viewBox="0 0 24 24" style={{ transform: `rotate(${recarga * 360}deg)`, marginLeft: 10 }}>
          <path d="M19 12 a7 7 0 1 1 -2.05 -4.95 M19 4.5 v3.5 h-3.5" fill="none" stroke="#5F6368" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ flex: 1, height: 36, borderRadius: 18, background: "#FFFFFF", display: "flex", alignItems: "center", padding: "0 18px", fontSize: 19, color: "#3C4043", whiteSpace: "nowrap", overflow: "hidden" }}>{url}</div>
      </div>
      <div style={{ position: "relative", height: h - 56, opacity: 1 - 0.55 * flash }}>
        <div style={{ height: 66, background: "#FFFFFF", display: "flex", alignItems: "center", padding: "0 30px", gap: 22, borderBottom: "1px solid #E3E5E8" }}>
          <div style={{ width: 90, height: 18, borderRadius: 9, background: "#2C2F36" }} />
          <div style={{ flex: 1 }} />
          {[60, 70, 54].map((x, i) => (
            <div key={i} style={{ width: x, height: 12, borderRadius: 6, background: "#B9BDC4" }} />
          ))}
        </div>
        <div style={{ margin: 30, height: h * 0.36, borderRadius: 18, background: color, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px", gap: 18 }}>
          <div style={{ width: "62%", height: 30, borderRadius: 15, background: "rgba(255,255,255,0.95)" }} />
          <div style={{ width: "44%", height: 16, borderRadius: 8, background: "rgba(255,255,255,0.7)" }} />
          <div style={{ width: 150, height: 44, borderRadius: 22, background: "#0B0D12", marginTop: 8 }} />
        </div>
        <div style={{ display: "flex", gap: 22, margin: "0 30px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1, height: h * 0.2, borderRadius: 14, background: "#FFFFFF", border: "1px solid #E3E5E8", padding: 18, boxSizing: "border-box" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: color, opacity: 0.8, marginBottom: 14 }} />
              <div style={{ width: "80%", height: 10, borderRadius: 5, background: "#C9CDD3", marginBottom: 10 }} />
              <div style={{ width: "60%", height: 10, borderRadius: 5, background: "#DADDE1" }} />
            </div>
          ))}
        </div>
        {/* destello del refresco */}
        <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", opacity: 0.6 * flash * (0.5 + 0.5 * Math.sin(t * 30)) }} />
      </div>
    </div>
  );
};

/** Botón «Go Live» / «Port : 5500» de la barra de estado (Live Server). */
export const EstadoLive: React.FC<{ activo: number; resalte?: number }> = ({ activo, resalte = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 12px", borderRadius: 4, background: resalte > 0 ? `rgba(255,255,255,${0.25 * resalte})` : "transparent", fontWeight: 600 }}>
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="2.5" fill="#fff" />
      <path d="M7.5 7.5 a6.4 6.4 0 0 0 0 9 M16.5 7.5 a6.4 6.4 0 0 1 0 9 M4.6 4.6 a10.4 10.4 0 0 0 0 14.8 M19.4 4.6 a10.4 10.4 0 0 1 0 14.8" />
    </svg>
    {activo > 0.5 ? "Port : 5500" : "Go Live"}
  </div>
);
