/**
 * EP.12 · Pantallas recreadas a partir del vídeo de la lección (solo la interfaz; datos ficticios): la consola de
 * Google Cloud con la sesión iniciada, la página de la API de Gmail con «Habilitar», la verificación de la cuenta y
 * Visual Studio Code con el panel de Claude Code. Van dentro de la Ventana del navegador (Navegador12) salvo el panel.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, UI, clamp01, sp } from "../../nucleo";

const CLARO = { fondo: "#F8F9FA", barra: "#FFFFFF", borde: "#DADCE0", texto: "#202124", gris: "#5F6368", azul: "#1A73E8", verde: "#188038" };
export const CUENTA = "floristeria@ejemplo.com";

/** Cabecera clara de la consola: logo de Google Cloud, selector de proyecto, buscador y tu avatar. */
const Cabecera: React.FC<{ logo: string; proyecto?: string; avatar?: number }> = ({ logo, proyecto, avatar = 0 }) => (
  <div style={{ height: 92, background: CLARO.barra, borderBottom: `2px solid ${CLARO.borde}`, display: "flex", alignItems: "center", gap: 22, padding: "0 26px" }}>
    <svg width={34} height={34} viewBox="0 0 24 24"><path d="M3 6 H21 M3 12 H21 M3 18 H21" stroke={CLARO.gris} strokeWidth={2.4} strokeLinecap="round" /></svg>
    <Img src={staticFile(logo)} style={{ height: 56 }} />
    {proyecto && (
      <div style={{ padding: "8px 18px", borderRadius: 10, border: `2px solid ${CLARO.borde}`, fontFamily: UI, fontWeight: 600, fontSize: 24, color: CLARO.texto, whiteSpace: "nowrap" }}>{proyecto}</div>
    )}
    <div style={{ flex: 1 }} />
    <div
      style={{
        width: 56, height: 56, borderRadius: "50%", background: C.acento, color: "#FFFFFF", fontFamily: UI, fontWeight: 700, fontSize: 30,
        display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.25 * avatar})`, boxShadow: avatar > 0 ? `0 0 ${30 * avatar}px ${C.acento}` : "none",
      }}
    >
      F
    </div>
  </div>
);

/** Consola de Google Cloud con la sesión iniciada (aún sin proyecto). */
export const PaginaCloud: React.FC<{ t: number; logo: string; sesion: number }> = ({ t, logo, sesion }) => {
  const s = sp(t, sesion, { damping: 14, stiffness: 180 });
  return (
    <div style={{ position: "absolute", inset: 0, background: CLARO.fondo }}>
      <Cabecera logo={logo} avatar={t > sesion ? Math.sin(clamp01((t - sesion) / 0.5) * Math.PI) : 0} />
      <div style={{ padding: "24px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 38, color: CLARO.texto }}>Te damos la bienvenida</div>
        {[
          ["Crear un proyecto", "Empieza aquí tu automatización"],
          ["APIs y servicios", "Conecta Gmail y otros servicios"],
        ].map(([a, b]) => (
          <div key={a} style={{ padding: "14px 24px", borderRadius: 16, background: "#FFFFFF", border: `2px solid ${CLARO.borde}` }}>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: CLARO.azul }}>{a}</div>
            <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 24, color: CLARO.gris, marginTop: 6 }}>{b}</div>
          </div>
        ))}
      </div>
      {t > sesion && (
        <div
          style={{
            position: "absolute", left: 40, right: 40, bottom: 22, height: 70, borderRadius: 14, background: "#E6F4EA", border: `2px solid #A8DAB5`,
            display: "flex", alignItems: "center", gap: 16, padding: "0 22px", opacity: clamp01(s * 1.6), transform: `translateY(${(1 - s) * 30}px)`,
            fontFamily: UI, fontWeight: 700, fontSize: 26, color: CLARO.texto, whiteSpace: "nowrap",
          }}
        >
          <svg width={36} height={36} viewBox="0 0 24 24"><circle cx={12} cy={12} r={11} fill={CLARO.verde} /><path d="M6.5 12.5 L10.3 16 L17.5 8.5" fill="none" stroke="#FFF" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
          Sesión iniciada
          <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, color: CLARO.gris }}>{CUENTA}</span>
        </div>
      )}
    </div>
  );
};

/** Página de la API de Gmail: «Habilitar» se pulsa en `pulsa` y el estado pasa a «Habilitada» en `habilitada`. */
export const PaginaGmail: React.FC<{ t: number; logo: string; logoGmail: string; pulsa: number; habilitada: number }> = ({ t, logo, logoGmail, pulsa, habilitada }) => {
  const hund = t > pulsa ? Math.sin(clamp01((t - pulsa) / 0.22) * Math.PI) : 0;
  const ok = t >= habilitada;
  const s = sp(t, habilitada, { damping: 13, stiffness: 190 });
  return (
    <div style={{ position: "absolute", inset: 0, background: CLARO.fondo }}>
      <Cabecera logo={logo} proyecto="pedidos-floristeria" />
      <div style={{ padding: "40px 44px", display: "flex", gap: 34, alignItems: "flex-start" }}>
        <div style={{ width: 130, height: 130, borderRadius: 22, background: "#FFFFFF", border: `2px solid ${CLARO.borde}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Img src={staticFile(logoGmail)} style={{ width: 90 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 48, color: CLARO.texto }}>Gmail API</div>
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 25, color: CLARO.azul }}>Google Enterprise API</div>
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 26, color: CLARO.gris, whiteSpace: "nowrap" }}>Consulta y gestiona el correo de Gmail.</div>
          <div style={{ display: "flex", gap: 18, marginTop: 18, alignItems: "center" }}>
            <div
              style={{
                padding: "16px 34px", borderRadius: 10, background: ok ? "#FFFFFF" : CLARO.azul, border: `2px solid ${ok ? CLARO.borde : CLARO.azul}`,
                color: ok ? CLARO.azul : "#FFFFFF", fontFamily: UI, fontWeight: 700, fontSize: 30, transform: `scale(${1 - 0.1 * hund})`,
                boxShadow: ok ? "none" : "0 8px 24px rgba(26,115,232,0.35)",
              }}
            >
              {ok ? "GESTIONAR" : "HABILITAR"}
            </div>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 28, color: CLARO.azul }}>Probar esta API</div>
          </div>
        </div>
      </div>
      <div style={{ margin: "6px 44px", padding: "22px 26px", borderRadius: 16, background: "#FFFFFF", border: `2px solid ${ok ? "#A8DAB5" : CLARO.borde}`, display: "flex", gap: 40 }}>
        {[
          ["Nombre del servicio", "gmail.googleapis.com"],
          ["Estado", ok ? "Habilitada" : "Inhabilitada"],
        ].map(([a, b], i) => (
          <div key={a} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 22, color: CLARO.gris }}>{a}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: i ? UI : MONO, fontWeight: i ? 700 : 500, fontSize: 26, color: i && ok ? CLARO.verde : CLARO.texto }}>
              {i === 1 && ok && (
                <svg width={30} height={30} viewBox="0 0 24 24" style={{ transform: `scale(${0.5 + 0.5 * clamp01(s)})` }}><circle cx={12} cy={12} r={11} fill={CLARO.verde} /><path d="M6.5 12.5 L10.3 16 L17.5 8.5" fill="none" stroke="#FFF" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
              {b}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Botón «Habilitar» dentro de la página (para el toque y el cursor 3D), en coordenadas de la página. */
export const BOTON_HABILITAR = { x: 44 + 130 + 34 + 128, y: 92 + 40 + 230 };

/** Verificación de la cuenta: «Demuestra que eres tú». La contraseña la escribes tú (puntos). */
export const PaginaVerificar: React.FC<{ t: number; w: number; foco: number; puntos: number }> = ({ t, w, foco, puntos }) => {
  const enFoco = t > foco;
  return (
    <div style={{ width: w, borderRadius: 28, background: "#FFFFFF", padding: "44px 48px", boxSizing: "border-box", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 50, color: CLARO.texto, letterSpacing: -1 }}>Demuestra que eres tú</div>
      <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 26, color: CLARO.gris, lineHeight: 1.35 }}>Para proteger tu cuenta, confirma que eres tú.</div>
      <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 12, padding: "8px 18px 8px 8px", borderRadius: 999, border: `2px solid ${CLARO.borde}` }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.acento, color: "#FFF", fontFamily: UI, fontWeight: 700, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>F</div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, color: CLARO.texto }}>{CUENTA}</div>
      </div>
      <div style={{ position: "relative", marginTop: 14, height: 92, borderRadius: 12, border: `${enFoco ? 4 : 2}px solid ${enFoco ? CLARO.azul : CLARO.borde}`, display: "flex", alignItems: "center", padding: "0 24px", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 18, top: -18, padding: "0 8px", background: "#FFFFFF", fontFamily: UI, fontWeight: 600, fontSize: 22, color: enFoco ? CLARO.azul : CLARO.gris }}>Introduce tu contraseña</div>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 40, letterSpacing: 8, color: CLARO.texto }}>{"•".repeat(Math.max(0, Math.floor(puntos)))}</div>
        {enFoco && puntos < 10 && <div style={{ width: 3, height: 44, marginLeft: 4, background: CLARO.azul, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
      </div>
      <div style={{ alignSelf: "flex-end", marginTop: 10, padding: "16px 34px", borderRadius: 999, background: CLARO.azul, color: "#FFFFFF", fontFamily: UI, fontWeight: 700, fontSize: 28 }}>Siguiente</div>
    </div>
  );
};

// ── Visual Studio Code con el panel de Claude Code ────────────────────────────────────────────────────────────────
export type Mensaje = { at: number; de: "tu" | "claude"; contenido: React.ReactNode };

/** Panel de Claude Code (dentro de Visual Studio Code): conversación y caja de escribir. */
export const PanelClaude: React.FC<{
  t: number; w: number; h: number; logoVs: string; logoCc: string; mensajes: Mensaje[]; entrada: string; foco: boolean; resalteEntrada?: string;
}> = ({ t, w, h, logoVs, logoCc, mensajes, entrada, foco, resalteEntrada }) => (
  <div style={{ width: w, height: h, borderRadius: 26, overflow: "hidden", background: "#1E1E1E", border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.65)", display: "flex", flexDirection: "column", fontFamily: UI }}>
    <div style={{ height: 66, background: "#2B2B2B", display: "flex", alignItems: "center", gap: 12, padding: "0 22px", flexShrink: 0 }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c, opacity: 0.85 }} />
      ))}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
        <Img src={staticFile(logoVs)} style={{ width: 32 }} />
        <div style={{ fontSize: 24, color: "#BBBBBB", fontWeight: 600 }}>pedidos-floristeria</div>
      </div>
      <div style={{ width: 80 }} />
    </div>
    <div style={{ height: 58, display: "flex", background: "#252526", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: "#1E1E1E", borderTop: `3px solid ${C.acento}` }}>
        <Img src={staticFile(logoCc)} style={{ width: 34 }} />
        <div style={{ fontSize: 24, color: "#E6E6E6", fontWeight: 600 }}>Claude Code</div>
      </div>
    </div>
    <div style={{ flex: 1, padding: "22px 26px", display: "flex", flexDirection: "column", gap: 16, minHeight: 0, overflow: "hidden" }}>
      {mensajes
        .filter((m) => t > m.at)
        .map((m, i) => {
          const s = sp(t, m.at, { damping: 14, stiffness: 190 });
          const tu = m.de === "tu";
          return (
            <div
              key={i}
              style={{
                alignSelf: tu ? "stretch" : "flex-start", padding: tu ? "14px 20px" : "4px 0", borderRadius: 12, background: tu ? "#2D2D30" : "transparent",
                border: tu ? "2px solid #3C3C3C" : "none", fontSize: 28, lineHeight: 1.35, color: "#E6E6E6", opacity: clamp01(s * 1.5), transform: `translateY(${(1 - s) * 18}px)`,
                display: "flex", gap: 14, alignItems: "flex-start",
              }}
            >
              {!tu && <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.acento, marginTop: 13, flexShrink: 0 }} />}
              <div style={{ minWidth: 0 }}>{m.contenido}</div>
            </div>
          );
        })}
      <div style={{ flex: 1 }} />
      <div style={{ borderRadius: 14, border: `2px solid ${foco ? C.acento : "#3C3C3C"}`, background: "#252526", padding: "16px 18px", minHeight: 120, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ fontSize: 27, lineHeight: 1.35, color: entrada ? (resalteEntrada ?? "#E6E6E6") : "#7A7A7A" }}>
          {entrada || "Pregunta lo que quieras a Claude"}
          {foco && <span style={{ display: "inline-block", width: 3, height: 30, marginLeft: 3, verticalAlign: "middle", background: C.acento, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
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
);

/** Texto que se escribe letra a letra entre `a` y `b` (segundos). */
export const escrito = (texto: string, t: number, a: number, b: number) => texto.slice(0, Math.round(clamp01((t - a) / Math.max(0.05, b - a)) * texto.length));
