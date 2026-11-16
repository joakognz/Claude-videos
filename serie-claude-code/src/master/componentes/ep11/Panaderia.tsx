/**
 * EP.11 · Piezas de «Variantes infinitas»: la web de la panadería en tres estilos (y sus mezclas), los panes del
 * obrador (masa, barra, chapata, bollo), iconos de otros negocios y Visual Studio Code con el panel de Claude Code.
 * Son dibujos y pantallas recreadas con datos ficticios: ningún logo de marca se dibuja aquí.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, TITULO, UI, clamp01, sp } from "../../nucleo";

export const TINTA = "#1C1A1A";

// ── estilos de la web ─────────────────────────────────────────────────────────────────────────────────────────────
export type Estilo = "clasica" | "moderna" | "minimalista";
export type Paleta = { fondo: string; tinta: string; suave: string; acento: string; textoBoton: string };
export const PALETAS: Record<string, Paleta> = {
  clasica: { fondo: "#F3E6CF", tinta: "#3B2A1E", suave: "#8A6F57", acento: "#A8551F", textoBoton: "#FFF7EA" },
  moderna: { fondo: "#15171C", tinta: "#FFFFFF", suave: "#8C93A3", acento: "#D97757", textoBoton: "#15171C" },
  minimalista: { fondo: "#FFFFFF", tinta: "#1C1C1C", suave: "#9A9A9A", acento: "#6E9E7E", textoBoton: "#FFFFFF" },
  peluqueria: { fondo: "#F6E9F1", tinta: "#3A1F33", suave: "#93718A", acento: "#B04C8A", textoBoton: "#FFFFFF" },
  taller: { fondo: "#1D2530", tinta: "#F2F4F7", suave: "#8E9AAB", acento: "#E3B23C", textoBoton: "#1D2530" },
};
export type Negocio = { nombre: string; lema: string; icono: "pan" | "tijeras" | "llave"; menu: [string, string, string] };
export const NEGOCIOS: Record<string, Negocio> = {
  panaderia: { nombre: "La Espiga", lema: "Pan recién hecho", icono: "pan", menu: ["Inicio", "Panes", "Pedidos"] },
  peluqueria: { nombre: "Tijera Fina", lema: "Corte y color", icono: "tijeras", menu: ["Inicio", "Servicios", "Cita"] },
  taller: { nombre: "Taller Pistón", lema: "Revisión y reparación", icono: "llave", menu: ["Inicio", "Servicios", "Cita"] },
};

export const IcoNegocio: React.FC<{ tipo: Negocio["icono"]; s: number; color: string; fondo?: string }> = ({ tipo, s, color, fondo = "none" }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
    {tipo === "pan" && (
      <>
        <path d="M6 30 C6 18 15 12 24 12 C33 12 42 18 42 30 C42 34 39 36 35 36 H13 C9 36 6 34 6 30 Z" fill={fondo} />
        <path d="M16 18 L20 26 M24 16 L27 25 M32 18 L34 26" />
      </>
    )}
    {tipo === "tijeras" && (
      <>
        <circle cx={14} cy={34} r={6} fill={fondo} />
        <circle cx={34} cy={34} r={6} fill={fondo} />
        <path d="M18 30 L34 8 M30 30 L14 8" />
      </>
    )}
    {tipo === "llave" && (
      <>
        <path d="M30 8 A9 9 0 0 0 22 21 L8 35 A3.5 3.5 0 0 0 13 40 L27 26 A9 9 0 0 0 40 18 L34 22 L28 20 L26 14 Z" fill={fondo} />
      </>
    )}
  </svg>
);

/** Menú de la web en tres estilos: subrayado clásico, píldoras modernas o solo un icono de hamburguesa. */
const Menu: React.FC<{ estilo: Estilo; p: Paleta; items: string[]; s: number }> = ({ estilo, p, items, s }) => {
  if (estilo === "minimalista") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 5 * s }}>
        {[0, 1, 2].map((k) => <div key={k} style={{ width: 30 * s, height: 3.5 * s, borderRadius: 2 * s, background: p.tinta }} />)}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: (estilo === "moderna" ? 8 : 16) * s }}>
      {items.map((it, k) =>
        estilo === "moderna" ? (
          <div key={it} style={{ padding: `${5 * s}px ${12 * s}px`, borderRadius: 999, background: k === 0 ? p.acento : "transparent", border: `${2 * s}px solid ${p.acento}`, fontFamily: UI, fontWeight: 700, fontSize: 15 * s, color: k === 0 ? p.textoBoton : p.tinta }}>{it}</div>
        ) : (
          <div key={it} style={{ fontFamily: UI, fontWeight: 600, fontSize: 16 * s, color: p.tinta, borderBottom: k === 0 ? `${2.5 * s}px solid ${p.acento}` : "none", paddingBottom: 3 * s }}>{it}</div>
        ),
      )}
    </div>
  );
};

/**
 * Portada de la web de un negocio (ficticia) dentro de una ventana de navegador.
 * maqueta: cómo se reparte la portada · menu: estilo del menú · paleta: colores. Así se puede mezclar.
 */
export const WebMini: React.FC<{
  w: number; maqueta: Estilo; menu?: Estilo; paleta?: string; negocio?: string; url?: string;
  /** halos de atención (0–1) sobre el menú y sobre los colores */
  resalteMenu?: number; resaltePaleta?: number; ocultarMenu?: number; ocultarPaleta?: number;
}> = ({ w, maqueta, menu = maqueta, paleta = maqueta, negocio = "panaderia", url = "localhost:5173", resalteMenu = 0, resaltePaleta = 0, ocultarMenu = 0, ocultarPaleta = 0 }) => {
  const s = w / 320;
  const p = PALETAS[paleta];
  const n = NEGOCIOS[negocio];
  const h = 400 * s;
  const halo = (r: number) => (r > 0 ? `0 0 0 ${4 * s}px rgba(217,119,87,${0.9 * r}), 0 0 ${26 * s}px rgba(217,119,87,${0.7 * r})` : "none");
  const boton = (texto: string, fino = false) => (
    <div style={{ padding: `${(fino ? 6 : 9) * s}px ${(fino ? 16 : 22) * s}px`, borderRadius: maqueta === "clasica" ? 6 * s : 999, background: fino ? "transparent" : p.acento, border: `${2 * s}px solid ${p.acento}`, fontFamily: UI, fontWeight: 700, fontSize: 16 * s, color: fino ? p.acento : p.textoBoton, whiteSpace: "nowrap" }}>{texto}</div>
  );
  return (
    <div style={{ width: w, borderRadius: 16 * s, overflow: "hidden", border: `${2 * s}px solid ${C.borde}`, boxShadow: "0 30px 70px rgba(0,0,0,0.6)", background: p.fondo }}>
      <div style={{ height: 34 * s, background: "#2A2C33", display: "flex", alignItems: "center", gap: 6 * s, padding: `0 ${11 * s}px` }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 8 * s, height: 8 * s, borderRadius: "50%", background: c, opacity: 0.85 }} />)}
        <div style={{ flex: 1, marginLeft: 6 * s, height: 21 * s, borderRadius: 11 * s, background: "#16181D", display: "flex", alignItems: "center", padding: `0 ${10 * s}px`, fontFamily: UI, fontWeight: 600, fontSize: 11.5 * s, color: "#C9CCD3", whiteSpace: "nowrap", overflow: "hidden" }}>{url}</div>
      </div>
      <div style={{ position: "relative", height: h, background: p.fondo, boxShadow: `inset 0 0 0 0 transparent` }}>
        {/* halo de colores: rodea toda la página */}
        {resaltePaleta > 0 && <div style={{ position: "absolute", inset: 6 * s, borderRadius: 10 * s, boxShadow: halo(resaltePaleta), zIndex: 3 }} />}
        {/* cabecera con el menú */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 54 * s, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${18 * s}px`, borderBottom: maqueta === "minimalista" ? "none" : `${1.5 * s}px solid ${p.suave}44` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 * s, opacity: 1 }}>
            <IcoNegocio tipo={n.icono} s={24 * s} color={p.acento} />
            {maqueta !== "minimalista" && <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 15 * s, color: p.tinta, whiteSpace: "nowrap" }}>{n.nombre}</div>}
          </div>
          <div style={{ opacity: 1 - ocultarMenu, borderRadius: 999, boxShadow: halo(resalteMenu), padding: `${3 * s}px ${4 * s}px` }}>
            <Menu estilo={menu} p={p} items={n.menu} s={s} />
          </div>
        </div>
        {/* portada */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 54 * s, bottom: 0, opacity: 1 - 0.85 * ocultarPaleta }}>
          {maqueta === "clasica" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 * s }}>
              <div style={{ width: 92 * s, height: 92 * s, borderRadius: "50%", border: `${3 * s}px solid ${p.acento}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcoNegocio tipo={n.icono} s={58 * s} color={p.acento} />
              </div>
              <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 34 * s, color: p.tinta }}>{n.nombre}</div>
              <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 17 * s, color: p.suave }}>{n.lema}</div>
              <div style={{ marginTop: 6 * s }}>{boton("Haz tu pedido")}</div>
            </div>
          )}
          {maqueta === "moderna" && (
            <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${18 * s}px`, gap: 8 * s }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 * s }}>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 36 * s, lineHeight: 1.0, color: p.tinta, letterSpacing: -1 * s }}>{n.lema.split(" ").slice(0, 2).join(" ")}<br /><span style={{ color: p.acento }}>{n.lema.split(" ").slice(2).join(" ") || "hoy"}</span></div>
                <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 14 * s, color: p.suave }}>{n.nombre}</div>
                <div style={{ alignSelf: "flex-start" }}>{boton("Pedir ahora")}</div>
              </div>
              <div style={{ width: 120 * s, height: 120 * s, borderRadius: 26 * s, background: `${p.acento}22`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(-6deg)` }}>
                <IcoNegocio tipo={n.icono} s={86 * s} color={p.acento} />
              </div>
            </div>
          )}
          {maqueta === "minimalista" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 * s }}>
              <div style={{ fontFamily: UI, fontWeight: 300, fontSize: 30 * s, color: p.tinta, letterSpacing: 6 * s, textTransform: "uppercase" }}>{n.nombre}</div>
              <div style={{ width: 40 * s, height: 2 * s, background: p.acento }} />
              <div style={{ fontFamily: UI, fontWeight: 400, fontSize: 14 * s, color: p.suave, letterSpacing: 2 * s }}>{n.lema.toLowerCase()}</div>
              <div style={{ marginTop: 8 * s }}>{boton("Ver más", true)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Paleta de colores de un estilo (tres muestras), para verla volar hacia la mezcla. */
export const Muestras: React.FC<{ paleta: string; s?: number }> = ({ paleta, s = 1 }) => {
  const p = PALETAS[paleta];
  return (
    <div style={{ display: "flex", gap: 8 * s, padding: `${10 * s}px ${12 * s}px`, borderRadius: 16 * s, background: C.panel2, border: `${3 * s}px solid ${C.acento}`, boxShadow: "0 16px 40px rgba(0,0,0,0.55)" }}>
      {[p.fondo, p.acento, p.tinta].map((c, k) => <div key={k} style={{ width: 40 * s, height: 40 * s, borderRadius: 10 * s, background: c, border: `${2 * s}px solid #00000033` }} />)}
    </div>
  );
};

// ── el obrador ────────────────────────────────────────────────────────────────────────────────────────────────────
const CORTEZA = "#D99A4E";
const MIGA = "#F2D3A0";
const HARINA = "#F7EFE2";

/** Bola de masa sobre la mesa, con un poco de harina. `respira`: se hincha un poco. */
export const Masa: React.FC<{ s: number; respira?: number }> = ({ s, respira = 0 }) => (
  <svg width={s} height={s * 0.7} viewBox="0 0 200 140" style={{ overflow: "visible" }}>
    <ellipse cx={100} cy={122} rx={92} ry={14} fill="#00000044" />
    <path d={`M18 118 C14 ${70 - 8 * respira} 52 ${30 - 10 * respira} 100 ${30 - 10 * respira} C148 ${30 - 10 * respira} 186 ${70 - 8 * respira} 182 118 Z`} fill={HARINA} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
    <path d="M60 70 C70 62 82 60 92 62" stroke="#D8CBB6" strokeWidth={5} fill="none" strokeLinecap="round" />
    {[[40, 100], [150, 96], [120, 108], [70, 110]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#E3D7C3" />)}
  </svg>
);

export const Barra: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s * 0.42} viewBox="0 0 240 100" style={{ overflow: "visible" }}>
    <ellipse cx={120} cy={90} rx={110} ry={9} fill="#00000044" />
    <path d="M12 62 C10 36 40 24 120 24 C200 24 230 36 228 62 C226 80 200 84 120 84 C40 84 14 80 12 62 Z" fill={CORTEZA} stroke={TINTA} strokeWidth={5} />
    {[60, 100, 140, 180].map((x) => <path key={x} d={`M${x - 14} 44 C${x - 4} 38 ${x + 6} 38 ${x + 16} 46`} stroke={TINTA} strokeWidth={4.5} fill="none" strokeLinecap="round" />)}
  </svg>
);

export const Chapata: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s * 0.56} viewBox="0 0 200 112" style={{ overflow: "visible" }}>
    <ellipse cx={100} cy={102} rx={92} ry={9} fill="#00000044" />
    <path d="M16 40 C18 26 40 22 100 22 C160 22 182 26 184 40 L186 82 C186 94 170 96 100 96 C30 96 14 94 14 82 Z" fill={MIGA} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
    {[[50, 46], [96, 40], [140, 52], [70, 70], [128, 74]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={9} ry={5} fill="#E7C089" />)}
  </svg>
);

export const Bollo: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s * 0.8} viewBox="0 0 150 120" style={{ overflow: "visible" }}>
    <ellipse cx={75} cy={110} rx={64} ry={8} fill="#00000044" />
    <path d="M12 96 C8 50 36 22 75 22 C114 22 142 50 138 96 C136 104 120 106 75 106 C30 106 14 104 12 96 Z" fill={CORTEZA} stroke={TINTA} strokeWidth={5} />
    <path d="M48 52 C60 42 90 42 102 52" stroke={TINTA} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    {[[56, 70], [84, 64], [100, 78], [66, 84]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={4} ry={2.4} fill="#FFF3DC" transform={`rotate(${i * 40} ${x} ${y})`} />)}
  </svg>
);

/** Mesa de madera del obrador. */
export const Mesa: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, height: 70, borderRadius: 18, background: "#7A5232", border: `5px solid ${TINTA}`, boxShadow: "0 30px 60px rgba(0,0,0,0.55)", position: "relative", overflow: "hidden" }}>
    {[18, 40].map((y) => <div key={y} style={{ position: "absolute", left: 30, right: 30, top: y, height: 4, borderRadius: 2, background: "#5E3D24" }} />)}
  </div>
);

// ── Visual Studio Code con el panel de Claude Code (datos ficticios) ──────────────────────────────────────────────
export type Archivo = { nombre: string; nivel?: number; carpeta?: boolean; at?: number; resalte?: number };
export type Linea11 = { texto: string; at: number; check?: boolean };

export const VsCode11: React.FC<{
  t: number; w: number; h: number; logoVs: string; logoCc: string; proyecto: string; archivos: Archivo[];
  /** mensaje enviado (burbuja) */
  mensaje?: { texto: string; at: number };
  piensa?: [number, number];
  respuesta?: Linea11[];
  entrada: string; foco: boolean;
}> = ({ t, w, h, logoVs, logoCc, proyecto, archivos, mensaje, piensa, respuesta = [], entrada, foco }) => {
  const burbuja = mensaje ? sp(t, mensaje.at, { damping: 14, stiffness: 180 }) : 0;
  const pensando = piensa && t > piensa[0] && t < piensa[1];
  return (
    <div style={{ width: w, height: h, borderRadius: 24, overflow: "hidden", background: "#1E1E1E", border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.65)", display: "flex", flexDirection: "column", fontFamily: UI }}>
      <div style={{ height: 64, background: "#2B2B2B", display: "flex", alignItems: "center", gap: 12, padding: "0 22px", flexShrink: 0 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c, opacity: 0.85 }} />)}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
          <Img src={staticFile(logoVs)} style={{ width: 30 }} />
          <div style={{ fontSize: 24, color: "#BBBBBB", fontWeight: 600 }}>{proyecto}</div>
        </div>
        <div style={{ width: 80 }} />
      </div>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ width: 64, background: "#252526", display: "flex", flexDirection: "column", alignItems: "center", gap: 26, paddingTop: 22 }}>
          {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{ width: 30, height: 30, borderRadius: 7, border: `3px solid ${k === 0 ? "#DDDDDD" : "#6A6A6A"}` }} />)}
        </div>
        <div style={{ width: 280, background: "#1B1B1C", padding: "18px 14px", display: "flex", flexDirection: "column", gap: 10, borderRight: "2px solid #2D2D2D", flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#9D9D9D", letterSpacing: 1 }}>EXPLORER</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#CCCCCC", marginTop: 6, whiteSpace: "nowrap" }}>⌄ {proyecto.toUpperCase()}</div>
          {archivos.map((f) => {
            const a = f.at === undefined ? 1 : sp(t, f.at, { damping: 13, stiffness: 200 });
            if (a <= 0) return null;
            const r = f.resalte ?? 0;
            return (
              <div key={f.nombre + (f.nivel ?? 0)} style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 10 + (f.nivel ?? 0) * 22, opacity: Math.min(1, a * 1.5), transform: `translateX(${(1 - a) * -30}px)`, borderRadius: 6, background: r > 0 ? `rgba(217,119,87,${0.28 * r})` : "transparent", fontSize: 21, color: f.carpeta ? "#E8C48A" : "#CCCCCC", whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: MONO, fontSize: 18, color: f.carpeta ? "#E8C48A" : "#7AA2F7" }}>{f.carpeta ? "▸" : "◇"}</span>
                {f.nombre}
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ height: 54, display: "flex", background: "#252526", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: "#1E1E1E", borderTop: `3px solid ${C.acento}` }}>
              <Img src={staticFile(logoCc)} style={{ width: 30 }} />
              <div style={{ fontSize: 22, color: "#E6E6E6", fontWeight: 600 }}>Claude Code</div>
            </div>
          </div>
          <div style={{ flex: 1, padding: "22px 22px", display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
            {mensaje && burbuja > 0 && (
              <div style={{ padding: "14px 18px", borderRadius: 12, background: "#2D2D30", border: "2px solid #3C3C3C", fontSize: 25, lineHeight: 1.3, color: "#E6E6E6", opacity: Math.min(1, burbuja * 1.5), transform: `translateY(${(1 - burbuja) * 20}px)` }}>{mensaje.texto}</div>
            )}
            {pensando && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#9D9D9D" }}>
                <svg width={30} height={30} viewBox="0 0 24 24" style={{ transform: `rotate(${t * 220}deg)` }}>
                  {Array.from({ length: 6 }, (_, k) => <path key={k} d="M12 12 L12 3" stroke={C.acento} strokeWidth={3} strokeLinecap="round" transform={`rotate(${k * 60} 12 12)`} />)}
                </svg>
                <span style={{ fontStyle: "italic" }}>Thinking{".".repeat(1 + (Math.floor(t * 3) % 3))}</span>
              </div>
            )}
            {respuesta.map((r, k) =>
              t >= r.at ? (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 21, color: r.check ? "#B8E0A0" : "#CCCCCC", opacity: clamp01((t - r.at) / 0.2), whiteSpace: "nowrap" }}>
                  <span style={{ color: r.check ? "#9ECE6A" : C.acento }}>{r.check ? "✓" : "●"}</span>
                  {r.texto}
                </div>
              ) : null,
            )}
            <div style={{ flex: 1 }} />
            <div style={{ borderRadius: 14, border: `2px solid ${foco ? C.acento : "#3C3C3C"}`, background: "#252526", padding: "14px 18px", minHeight: 132, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ fontSize: 25, lineHeight: 1.33, color: entrada ? "#E6E6E6" : "#7A7A7A" }}>
                {entrada || "Esc to focus or unfocus Claude"}
                {foco && <span style={{ display: "inline-block", width: 3, height: 28, marginLeft: 3, verticalAlign: "middle", background: C.acento, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <div style={{ fontSize: 26, color: "#7A7A7A" }}>+</div>
                <div style={{ flex: 1 }} />
                <div style={{ width: 40, height: 40, borderRadius: 10, background: entrada ? C.acento : "#3C3C3C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={22} height={22} viewBox="0 0 24 24"><path d="M12 19 V5 M5 12 L12 5 L19 12" stroke="#1E1E1E" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Copa de la versión ganadora (dibujo plano). */
export const Copa: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none" stroke={TINTA} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round">
    <path d="M14 6 H34 V16 A10 10 0 0 1 14 16 Z" fill={C.acento} />
    <path d="M14 9 H7 C7 16 10 19 14.5 19 M34 9 H41 C41 16 38 19 33.5 19" />
    <path d="M24 26 V34" />
    <path d="M16 42 H32 L30 34 H18 Z" fill={C.acento} />
  </svg>
);
