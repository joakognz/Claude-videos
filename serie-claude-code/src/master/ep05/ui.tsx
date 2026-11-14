/**
 * Pantallas recreadas del EP.5 a partir de la grabación real (Visual Studio Code con el panel de Claude Code en
 * macOS): mismas piezas, textos y orden que en la grabación, a un tamaño que se lee en vertical. Las rutas con el
 * nombre del usuario se sustituyen por «~/Desktop/…».
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, UI, clamp01, sp } from "../nucleo";
import { Caret } from "./kit";

/** Paleta del tema oscuro de Visual Studio Code y del panel de Claude Code (medida en la grabación). */
export const VS = {
  fondo: "#1F1F1F",
  barra: "#181818",
  lateral: "#181818",
  borde: "#2B2B2B",
  texto: "#CCCCCC",
  tenue: "#8B8B8B",
  blanco: "#E8E8E8",
  caja: "#2A2A2A",
  cajaBorde: "#3A3A3A",
  codigo: "#141414",
  enlace: "#4DAAFC",
  entrada: "#C44B3B",
  verde: "#3FB950",
  amarillo: "#F5C400",
};

/** Ventana de macOS con barra de título (semáforo + título o buscador centrado). */
export const Ventana: React.FC<{ w: number; h: number; titulo?: React.ReactNode; buscador?: string; children: React.ReactNode; fondo?: string; s?: number }> = ({
  w, h, titulo, buscador, children, fondo = VS.fondo, s = 1,
}) => (
  <div style={{ width: w, height: h, borderRadius: 26 * s, overflow: "hidden", background: fondo, border: `2px solid #3A3A3A`, boxShadow: "0 50px 110px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)", display: "flex", flexDirection: "column" }}>
    <div style={{ height: 64 * s, flexShrink: 0, background: VS.barra, borderBottom: `2px solid ${VS.borde}`, display: "flex", alignItems: "center", padding: `0 ${24 * s}px`, gap: 12 * s, position: "relative" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 18 * s, height: 18 * s, borderRadius: "50%", background: c }} />
      ))}
      {(titulo || buscador) && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          {buscador ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 * s, padding: `${6 * s}px ${22 * s}px`, borderRadius: 10 * s, background: "#262626", border: `2px solid #333`, fontFamily: UI, fontWeight: 600, fontSize: 24 * s, color: VS.texto }}>
              <svg width={22 * s} height={22 * s} viewBox="0 0 24 24"><path d="M10.5 3.5 a7 7 0 1 0 0.01 0 M15.5 15.5 L21 21" fill="none" stroke={VS.tenue} strokeWidth={2.4} strokeLinecap="round" /></svg>
              {buscador}
            </div>
          ) : (
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 26 * s, color: VS.texto }}>{titulo}</div>
          )}
        </div>
      )}
    </div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
  </div>
);

/** Explorador de Visual Studio Code (columna izquierda) con la carpeta del proyecto y sus archivos. */
export const Explorador: React.FC<{ w: number; carpeta: string; archivos?: { nombre: string; aparece: number; activo?: boolean }[]; t: number; editores?: string[] }> = ({ w, carpeta, archivos = [], t, editores = [] }) => (
  <div style={{ width: w, height: "100%", background: VS.lateral, borderRight: `2px solid ${VS.borde}`, padding: "22px 0", boxSizing: "border-box", fontFamily: UI, fontWeight: 600, color: VS.texto, flexShrink: 0 }}>
    <div style={{ fontSize: 20, letterSpacing: 1, color: VS.tenue, padding: "0 22px 16px" }}>EXPLORER</div>
    {editores.length > 0 && (
      <>
        <div style={{ fontSize: 19, fontWeight: 700, padding: "6px 22px" }}>⌄ OPEN EDITORS</div>
        {editores.map((e) => (
          <div key={e} style={{ fontSize: 22, padding: "6px 22px 6px 52px", display: "flex", alignItems: "center", gap: 10, background: "#2A2D2E" }}>
            <Asterisco size={20} />
            {e}
          </div>
        ))}
      </>
    )}
    <div style={{ fontSize: 19, fontWeight: 700, padding: "10px 22px 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>⌄ {carpeta}</div>
    {archivos.map((a) => {
      const s = sp(t, a.aparece, { damping: 14, stiffness: 200 });
      if (t < a.aparece) return null;
      return (
        <div key={a.nombre} style={{ fontSize: 23, padding: "7px 22px 7px 48px", display: "flex", alignItems: "center", gap: 10, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * -30}px)`, background: a.activo ? "#37373D" : "transparent" }}>
          <span style={{ color: VS.enlace, fontFamily: MONO, fontWeight: 700, fontSize: 20 }}>↓</span>
          {a.nombre}
        </div>
      );
    })}
  </div>
);

/** El asterisco de Claude tal como aparece en la pestaña (se usa el logo adjunto, a tamaño de icono). */
export const Asterisco: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile("logos/claude.png")} style={{ width: size, height: size, objectFit: "contain" }} />;

/** Pestaña de editor. */
export const Pestana: React.FC<{ texto: string; icono?: React.ReactNode; activa?: boolean; cursiva?: boolean }> = ({ texto, icono, activa = true, cursiva }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "0 22px", height: 54, background: activa ? VS.fondo : VS.barra, borderTop: activa ? `3px solid ${VS.enlace}` : "3px solid transparent", fontFamily: UI, fontWeight: 600, fontSize: 23, color: activa ? VS.blanco : VS.tenue, fontStyle: cursiva ? "italic" : undefined }}>
    {icono}
    {texto}
    <span style={{ marginLeft: 8, color: VS.tenue }}>×</span>
  </div>
);

// ── piezas del chat de Claude Code ───────────────────────────────────────────────────────────────────────────────
/** Mensaje del usuario (recuadro gris). */
export const MsgUsuario: React.FC<{ children: React.ReactNode; mono?: boolean; size?: number }> = ({ children, mono, size = 25 }) => (
  <div style={{ background: VS.caja, border: `2px solid ${VS.cajaBorde}`, borderRadius: 12, padding: "14px 20px", fontFamily: mono ? MONO : UI, fontWeight: mono ? 500 : 600, fontSize: size, lineHeight: 1.4, color: VS.blanco, whiteSpace: "normal" }}>{children}</div>
);

/** Línea del transcript con su punto (gris, verde si es una herramienta terminada, coral si está trabajando). */
export const Linea: React.FC<{ children: React.ReactNode; punto?: "gris" | "verde" | "coral" | "no"; size?: number; tenue?: boolean }> = ({ children, punto = "gris", size = 25, tenue }) => (
  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", fontFamily: UI, fontWeight: 600, fontSize: size, lineHeight: 1.42, color: tenue ? VS.tenue : VS.texto, whiteSpace: "normal" }}>
    <div style={{ width: 10, height: 10, borderRadius: "50%", marginTop: size * 0.5, flexShrink: 0, background: punto === "verde" ? VS.verde : punto === "coral" ? C.acento : punto === "no" ? "transparent" : VS.tenue }} />
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

/** Herramienta (p. ej. «Bash · List root directory») con su caja IN/OUT opcional. */
export const Herramienta: React.FC<{ nombre: string; desc: string; entrada?: string; salida?: string; size?: number }> = ({ nombre, desc, entrada, salida, size = 25 }) => (
  <Linea punto="verde" size={size}>
    <div>
      <b style={{ color: VS.blanco }}>{nombre}</b> <span style={{ color: VS.texto }}>{desc}</span>
    </div>
    {(entrada || salida) && (
      <div style={{ marginTop: 10, background: VS.codigo, border: `2px solid ${VS.borde}`, borderRadius: 10, padding: "12px 16px", fontFamily: MONO, fontWeight: 500, fontSize: size * 0.82, color: VS.texto, display: "flex", flexDirection: "column", gap: 8 }}>
        {entrada && (
          <div style={{ display: "flex", gap: 16, whiteSpace: "nowrap", overflow: "hidden" }}>
            <span style={{ color: VS.tenue }}>IN</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{entrada}</span>
          </div>
        )}
        {salida && (
          <div style={{ display: "flex", gap: 16, whiteSpace: "pre", overflow: "hidden" }}>
            <span style={{ color: VS.tenue }}>OUT</span>
            <span>{salida}</span>
          </div>
        )}
      </div>
    )}
  </Linea>
);

/** Spinner «Computing…» de Claude Code (asterisco coral que gira). */
export const Trabajando: React.FC<{ t: number; texto?: string; size?: number }> = ({ t, texto = "Computing…", size = 25 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: UI, fontWeight: 700, fontSize: size, color: VS.blanco }}>
    <span style={{ display: "inline-block", color: C.acento, fontSize: size * 1.2, transform: `rotate(${t * 220}deg)` }}>✳</span>
    {texto}
  </div>
);

/** Caja de entrada del panel (borde rojizo con el foco). Escribe `texto` y muestra el cursor. */
export const Entrada: React.FC<{ w: number; texto: string; t: number; foco?: boolean; marcador?: string; size?: number; resaltar?: { desde: string; color?: string } }> = ({
  w, texto, t, foco = true, marcador = "⌘ Esc to focus or unfocus Claude", size = 25, resaltar,
}) => {
  let cuerpo: React.ReactNode = texto;
  if (resaltar && texto.includes(resaltar.desde)) {
    const i = texto.indexOf(resaltar.desde);
    cuerpo = (
      <>
        {texto.slice(0, i)}
        <span style={{ color: resaltar.color ?? C.acento }}>{texto.slice(i)}</span>
      </>
    );
  }
  return (
    <div style={{ width: w, boxSizing: "border-box", borderRadius: 14, border: `2px solid ${foco ? VS.entrada : VS.cajaBorde}`, background: "#1B1B1B", padding: "16px 20px 12px" }}>
      <div style={{ fontFamily: UI, fontWeight: 600, fontSize: size, lineHeight: 1.42, color: texto ? VS.blanco : VS.tenue, minHeight: size * 1.42, whiteSpace: "normal" }}>
        {texto ? cuerpo : marcador}
        {foco && <Caret t={t} h={size * 1.1} color={VS.blanco} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 12, fontFamily: UI, fontWeight: 600, fontSize: size * 0.8, color: VS.tenue }}>
        <span style={{ fontSize: size }}>+</span>
        <span style={{ border: `2px solid ${VS.tenue}`, borderRadius: 5, padding: "0 6px", fontSize: size * 0.7 }}>/</span>
        <div style={{ flex: 1 }} />
        <span>⚡ Auto</span>
      </div>
    </div>
  );
};

/** Menú de comandos que se abre al escribir «/». */
export const MenuComandos: React.FC<{ w: number; items: { cmd: string; desc: string }[]; activo: number; size?: number }> = ({ w, items, activo, size = 25 }) => (
  <div style={{ width: w, boxSizing: "border-box", borderRadius: 14, background: "#252526", border: `2px solid ${VS.cajaBorde}`, padding: "10px 0", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
    {items.map((it, i) => (
      <div key={it.cmd} style={{ display: "flex", alignItems: "baseline", gap: 20, padding: "12px 22px", background: i === activo ? "#04395E" : "transparent", fontFamily: UI, fontWeight: 600, fontSize: size, color: VS.blanco, whiteSpace: "nowrap", overflow: "hidden" }}>
        <span style={{ fontFamily: MONO, fontWeight: 700 }}>{it.cmd}</span>
        <span style={{ color: VS.tenue, fontSize: size * 0.86, overflow: "hidden", textOverflow: "ellipsis" }}>{it.desc}</span>
      </div>
    ))}
  </div>
);

// ── AskUserQuestion ─────────────────────────────────────────────────────────────────────────────────────────────────
export type Opcion = { titulo: string; desc?: string };
/** Diálogo de preguntas de Claude Code: pestañas, pregunta, opciones con botón de radio. */
export const Dialogo: React.FC<{
  w: number; pestanas: string[]; activa: number; pregunta: string; opciones: Opcion[]; visibles?: number[]; marcada?: number; marca?: number;
  size?: number; t: number; multi?: boolean;
}> = ({ w, pestanas, activa, pregunta, opciones, visibles, marcada = -1, marca = 0, size = 26, t, multi }) => (
  <div style={{ width: w, boxSizing: "border-box", borderRadius: 16, background: "#252526", border: `2px solid ${VS.cajaBorde}`, padding: "20px 26px 18px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", fontFamily: UI, fontWeight: 600 }}>
    <div style={{ display: "flex", gap: 26, fontSize: size * 0.9, color: VS.tenue, marginBottom: 18, alignItems: "center" }}>
      {pestanas.map((p, i) => (
        <div key={p} style={{ color: i === activa ? VS.enlace : i > activa ? VS.blanco : VS.tenue, borderBottom: i === activa ? `3px solid ${VS.enlace}` : "3px solid transparent", paddingBottom: 6 }}>{p}</div>
      ))}
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: size }}>⌄</span>
      <span style={{ fontSize: size }}>×</span>
    </div>
    <div style={{ fontSize: size * 1.08, color: VS.blanco, marginBottom: 16, whiteSpace: "normal", lineHeight: 1.3 }}>{pregunta}</div>
    {opciones.map((o, i) => {
      const v = visibles ? clamp01(visibles[i]) : 1;
      const sel = i === marcada ? clamp01(marca) : 0;
      return (
        <div key={o.titulo} style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "12px 10px", borderRadius: 10, background: sel > 0.5 ? "#2F3337" : "transparent", opacity: 0.25 + 0.75 * v, transform: `translateX(${(1 - v) * -18}px)` }}>
          <div style={{ width: size * 1.05, height: size * 1.05, borderRadius: multi ? 6 : "50%", border: `2px solid ${sel > 0 ? VS.enlace : "#5A5A5A"}`, marginTop: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {sel > 0 && <div style={{ width: size * 0.55 * sel, height: size * 0.55 * sel, borderRadius: multi ? 3 : "50%", background: VS.enlace }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: size, color: VS.blanco }}>{o.titulo}</div>
            {o.desc && <div style={{ fontSize: size * 0.82, color: VS.tenue, lineHeight: 1.35, whiteSpace: "normal", marginTop: 4 }}>{o.desc}</div>}
          </div>
        </div>
      );
    })}
    <div style={{ borderTop: `2px solid ${VS.borde}`, marginTop: 10, paddingTop: 14, fontSize: size * 0.82, color: VS.tenue, display: "flex", justifyContent: "space-between" }}>
      <span>Submit answers</span>
      <span>Esc to cancel</span>
    </div>
    {t < 0 && null}
  </div>
);

// ── editor de CLAUDE.md ─────────────────────────────────────────────────────────────────────────────────────────────
export type LineaMd = { n: number; texto: string };
/** Colores de Markdown como en la grabación (encabezados en azul, negritas resaltadas, código en tono cálido). */
const colorLinea = (s: string) => (s.startsWith("#") ? "#569CD6" : s.startsWith("```") ? "#CE9178" : s.startsWith("- **") || s.startsWith("**") ? "#E8C07A" : s.startsWith("|") ? "#B5CEA8" : VS.texto);

export const EditorMd: React.FC<{ w: number; h: number; lineas: LineaMd[]; scroll: number; size?: number; resalte?: number }> = ({ w, h, lineas, scroll, size = 24, resalte = -1 }) => {
  const alto = size * 1.62;
  return (
    <div style={{ width: w, height: h, overflow: "hidden", background: VS.fondo, position: "relative", fontFamily: MONO, fontWeight: 500, fontSize: size }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 18 - scroll * alto }}>
        {lineas.map((l, i) => (
          <div key={i} style={{ height: alto, display: "flex", alignItems: "center", gap: 22, background: l.n === resalte ? "rgba(77,170,252,0.14)" : "transparent", whiteSpace: "pre" }}>
            <div style={{ width: 70, textAlign: "right", color: l.n === resalte ? VS.blanco : "#6E7681", flexShrink: 0 }}>{l.n > 0 ? l.n : ""}</div>
            <div style={{ color: l.texto === "⋯" ? "#6E7681" : colorLinea(l.texto), overflow: "hidden", textOverflow: "ellipsis" }}>{l.texto}</div>
          </div>
        ))}
      </div>
      {/* minimapa */}
      <div style={{ position: "absolute", right: 10, top: 14, width: 60, bottom: 14, opacity: 0.5 }}>
        {Array.from({ length: 44 }, (_, i) => (
          <div key={i} style={{ height: 3, marginBottom: 4, width: `${30 + ((i * 37) % 60)}%`, background: i % 7 === 0 ? "#569CD6" : "#6E7681" }} />
        ))}
      </div>
    </div>
  );
};

/** Diálogo «Nueva carpeta» de macOS (tal como en la grabación). */
export const DialogoCarpeta: React.FC<{ w: number; nombre: string; t: number; pulsa?: number }> = ({ w, nombre, t, pulsa = 0 }) => {
  const s = w / 720;
  return (
    <div style={{ width: w, boxSizing: "border-box", borderRadius: 30 * s, background: "#2C2C2E", border: `2px solid #48484A`, padding: `${34 * s}px ${36 * s}px ${30 * s}px`, boxShadow: "0 40px 100px rgba(0,0,0,0.7)", fontFamily: UI, fontWeight: 600, color: "#F2F2F2" }}>
      <div style={{ fontSize: 34 * s, fontWeight: 700, marginBottom: 14 * s }}>Nueva carpeta</div>
      <div style={{ fontSize: 25 * s, color: "#D0D0D0", marginBottom: 20 * s }}>Nombre de la nueva carpeta dentro de “Escritorio”:</div>
      <div style={{ border: `${4 * s}px solid #E5B800`, borderRadius: 12 * s, background: "#1C1C1E", padding: `${12 * s}px ${16 * s}px`, fontSize: 30 * s, whiteSpace: "nowrap", overflow: "hidden" }}>
        {nombre}
        <Caret t={t} h={32 * s} color="#FFFFFF" />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 18 * s, marginTop: 26 * s }}>
        <div style={{ padding: `${10 * s}px ${26 * s}px`, borderRadius: 12 * s, background: "#48484A", fontSize: 27 * s }}>Cancelar</div>
        <div style={{ padding: `${10 * s}px ${30 * s}px`, borderRadius: 12 * s, background: VS.amarillo, color: "#1C1C1E", fontSize: 27 * s, fontWeight: 700, transform: `scale(${1 - 0.1 * Math.sin(clamp01(pulsa) * Math.PI)})` }}>Crear</div>
      </div>
    </div>
  );
};
