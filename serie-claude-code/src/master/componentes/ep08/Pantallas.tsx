/**
 * EP.8 · Pantallas recreadas (las «tomas»): navegador, consola de Claude (facturación), límites de uso, página de
 * estado y Visual Studio Code con el panel de Claude Code. Misma interfaz que las reales, con datos ficticios.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, UI, clamp01, rand, ramp, sp } from "../../nucleo";

// ── navegador ─────────────────────────────────────────────────────────────────────────────────────────────────────
export const Navegador: React.FC<{
  w: number; h: number; t: number; url: string; letras: number; tema?: "oscuro" | "claro"; carga?: number; children?: React.ReactNode;
}> = ({ w, h, t, url, letras, tema = "oscuro", carga = 1, children }) => {
  const claro = tema === "claro";
  const escribiendo = letras < url.length;
  return (
    <div style={{ width: w, height: h, borderRadius: 26, overflow: "hidden", background: claro ? "#FAF9F5" : "#1F1E1D", border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.65)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 84, flexShrink: 0, background: "#2A2C33", display: "flex", alignItems: "center", gap: 14, padding: "0 24px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c, opacity: 0.85 }} />
        ))}
        <div style={{ flex: 1, marginLeft: 16, height: 54, borderRadius: 27, background: "#16181D", border: `2px solid ${escribiendo && letras > 0 ? C.acento : "#3A3F4B"}`, display: "flex", alignItems: "center", gap: 12, padding: "0 22px" }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#8C93A3" strokeWidth={2.4}><rect x={5} y={10} width={14} height={10} rx={2} /><path d="M8 10 V7 A4 4 0 0 1 16 7 V10" /></svg>
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 32, color: C.texto, whiteSpace: "nowrap" }}>
            {url.slice(0, Math.max(0, Math.floor(letras)))}
            {escribiendo && <span style={{ display: "inline-block", width: 3, height: 34, marginLeft: 3, verticalAlign: "middle", background: C.acento, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: carga }}>{children}</div>
        {carga < 1 && <div style={{ position: "absolute", left: 0, top: 0, height: 5, width: `${carga * 100}%`, background: C.acento }} />}
      </div>
    </div>
  );
};

// ── consola de Claude: facturación (datos ficticios) ──────────────────────────────────────────────────────────────
const CONSOLA = { fondo: "#1F1E1D", lateral: "#181817", tarjeta: "#262624", borde: "#3A3936", texto: "#ECEAE4", gris: "#9A978F" };
const MENU = ["Panel de control", "Claves de API", "Uso", "Límites de velocidad", "Facturación", "Límites de gasto"];

export const Consola: React.FC<{ t: number; logo: string; resalteSaldo: number; resalteGasto: number; pulsaBoton: number }> = ({ t, logo, resalteSaldo, resalteGasto, pulsaBoton }) => {
  const rs = clamp01((t - resalteSaldo) / 0.3);
  const rg = clamp01((t - resalteGasto) / 0.3);
  const hund = Math.sin(clamp01((t - pulsaBoton) / 0.22) * Math.PI) * 0.06;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", background: CONSOLA.fondo, fontFamily: UI }}>
      <div style={{ width: 290, background: CONSOLA.lateral, padding: "26px 18px", display: "flex", flexDirection: "column", gap: 6, borderRight: `2px solid ${CONSOLA.borde}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <Img src={staticFile(logo)} style={{ width: 36 }} />
          <div style={{ fontFamily: "Georgia, serif", fontSize: 30, color: CONSOLA.texto }}>Claude Console</div>
        </div>
        {MENU.map((m) => (
          <div key={m} style={{ padding: "12px 14px", borderRadius: 10, fontSize: 25, fontWeight: 600, color: m === "Facturación" ? CONSOLA.texto : CONSOLA.gris, background: m === "Facturación" ? "#33322F" : "transparent", whiteSpace: "nowrap" }}>
            {m}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: "34px 34px", display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: CONSOLA.texto }}>Facturación</div>
        <div style={{ borderRadius: 18, background: CONSOLA.tarjeta, border: `3px solid ${rs > 0 ? C.acento : CONSOLA.borde}`, padding: "26px 28px", boxShadow: rs > 0 ? `0 0 ${40 * rs}px ${C.acento}55` : "none" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: CONSOLA.texto }}>Saldo de créditos</div>
          <div style={{ fontSize: 21, color: CONSOLA.gris, marginTop: 6, lineHeight: 1.35 }}>Se consume con el uso de la API y de Claude Code.</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 18 }}>
            <div>
              <div style={{ fontSize: 56, fontWeight: 700, color: rs > 0.5 ? C.acento : CONSOLA.texto }}>0,00 US$</div>
              <div style={{ fontSize: 21, color: CONSOLA.gris }}>Saldo restante</div>
            </div>
            <div style={{ padding: "14px 22px", borderRadius: 12, background: "#F4F3EE", color: "#1F1E1D", fontSize: 24, fontWeight: 700, transform: `scale(${1 - hund})`, boxShadow: t > pulsaBoton - 0.3 ? `0 0 0 ${4 + 3 * Math.sin(t * 8)}px ${C.acento}` : "none", whiteSpace: "nowrap" }}>
              Comprar créditos
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 18, background: CONSOLA.tarjeta, border: `3px solid ${rg > 0 ? C.acento : CONSOLA.borde}`, padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: CONSOLA.texto }}>Gasto este mes</div>
            <div style={{ fontSize: 21, color: rg > 0.5 ? C.acento : CONSOLA.gris, fontWeight: 700 }}>100 % utilizado</div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: CONSOLA.texto, marginTop: 10 }}>50,00 US$</div>
          <div style={{ fontSize: 21, color: CONSOLA.gris }}>de 50 US$ de límite</div>
          <div style={{ marginTop: 14, height: 14, borderRadius: 7, background: "#3A3936", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${60 + 40 * ramp(t, resalteGasto - 0.6, resalteGasto + 0.3)}%`, background: C.acento }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── límites de uso (datos ficticios, sin cifras) ──────────────────────────────────────────────────────────────────
export const LimitesUso: React.FC<{ t: number; at: number; w?: number }> = ({ t, at, w = 760 }) => {
  const filas = ["Solicitudes", "Tokens de entrada", "Tokens de salida"];
  return (
    <div style={{ width: w, borderRadius: 26, background: CONSOLA.fondo, border: `3px solid ${CONSOLA.borde}`, padding: "30px 34px", boxSizing: "border-box", fontFamily: UI, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: CONSOLA.texto }}>Límites de velocidad</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 22 }}>
        <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#33322F", border: `3px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.acento }}>2</div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: CONSOLA.texto }}>Nivel 2</div>
          <div style={{ fontSize: 22, color: CONSOLA.gris }}>Tu nivel decide cuánto puedes pedir por minuto.</div>
        </div>
      </div>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {filas.map((f, k) => {
          const p = ramp(t, at + 0.2 + k * 0.15, at + 0.9 + k * 0.15);
          return (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 250, fontSize: 24, color: CONSOLA.texto, whiteSpace: "nowrap" }}>{f}</div>
              <div style={{ flex: 1, height: 14, borderRadius: 7, background: "#3A3936", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${p * [70, 55, 40][k]}%`, background: C.acento }} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 22, color: CONSOLA.gris }}>/min</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── página de estado (status) ─────────────────────────────────────────────────────────────────────────────────────
const SERVICIOS = ["claude.ai", "Claude Console (platform.claude.com)", "Claude API (api.anthropic.com)", "Claude Code"];
const N_RAYAS = 46;
const colorRaya = (fila: number, k: number) => {
  const r = rand(fila * 101 + k * 7.3);
  return r > 0.94 ? "#D9513C" : r > 0.86 ? "#E8A33B" : "#76AD3E";
};
/** Raya con incidencia en la que se para el cursor (fila de la API). */
export const RAYA_INCIDENCIA = { fila: 2, k: 33 };

export const StatusPagina: React.FC<{ t: number; logo: string; hover: number; w: number }> = ({ t, logo, hover, w }) => {
  const tip = sp(t, hover, { damping: 14, stiffness: 200 });
  const anchoBarra = w - 120;
  const paso = anchoBarra / N_RAYAS;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FAF9F5", padding: "34px 50px", fontFamily: UI }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
        <Img src={staticFile(logo)} style={{ width: 44 }} />
        <div style={{ fontFamily: "Georgia, serif", fontSize: 38, color: "#1F1E1D" }}>Claude Status</div>
      </div>
      <div style={{ borderRadius: 14, border: "2px solid #E3E0D8", background: "#FFFFFF" }}>
        {SERVICIOS.map((s, fila) => (
          <div key={s} style={{ padding: "22px 10px 18px", borderTop: fila ? "2px solid #EEEBE4" : "none", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 0 12px" }}>
              <div style={{ fontSize: 25, fontWeight: 700, color: "#1F1E1D", whiteSpace: "nowrap" }}>{s}</div>
              <div style={{ fontSize: 21, fontWeight: 600, color: "#5B9A3C" }}>Operational</div>
            </div>
            <div style={{ display: "flex", gap: paso * 0.32 }}>
              {Array.from({ length: N_RAYAS }, (_, k) => {
                const marcada = fila === RAYA_INCIDENCIA.fila && k === RAYA_INCIDENCIA.k;
                const c = marcada ? "#D9513C" : colorRaya(fila, k);
                return <div key={k} style={{ width: paso * 0.68, height: 52, borderRadius: 3, background: c, transform: marcada && tip > 0 ? `scaleY(${1 + 0.18 * tip})` : undefined, outline: marcada && tip > 0 ? `3px solid ${C.acento}` : undefined }} />;
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#8A877F", paddingTop: 10 }}>
              <span>90 days ago</span>
              <span>{["99.4", "99.9", "99.5", "99.4"][fila]} % uptime</span>
              <span>Today</span>
            </div>
            {marcadaTip(fila, tip, paso)}
          </div>
        ))}
      </div>
    </div>
  );
};

const marcadaTip = (fila: number, tip: number, paso: number) => {
  if (fila !== RAYA_INCIDENCIA.fila || tip <= 0.01) return null;
  const x = 10 + RAYA_INCIDENCIA.k * paso;
  return (
    <div style={{ position: "absolute", left: x - 170, top: 132, width: 340, padding: "16px 20px", borderRadius: 12, background: "#FFFFFF", boxShadow: "0 16px 40px rgba(0,0,0,0.25)", border: "2px solid #E3E0D8", opacity: Math.min(1, tip * 1.6), transform: `translateY(${(1 - tip) * 16}px) scale(${0.9 + 0.1 * tip})`, zIndex: 5 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#1F1E1D" }}>12 Oct 2026</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, fontSize: 20, color: "#3A3936" }}>
        <div style={{ width: 14, height: 14, borderRadius: 3, background: "#D9513C" }} />
        Major outage · 1 hrs 12 mins
      </div>
    </div>
  );
};

// ── Visual Studio Code con el panel de Claude Code ────────────────────────────────────────────────────────────────
export type PalabraTecleada = { w: string; at: number };

/** Texto que se escribe al ritmo de la voz: cada palabra se teclea entre su instante y el de la siguiente. */
export const tecleado = (pal: PalabraTecleada[], t: number, fin: number) => {
  let out = "";
  pal.forEach((p, k) => {
    const sig = pal[k + 1]?.at ?? fin;
    const u = clamp01((t - p.at) / Math.max(0.08, Math.min(0.5, sig - p.at)));
    if (u <= 0) return;
    out += (k ? " " : "") + p.w.slice(0, Math.ceil(u * p.w.length));
  });
  return out;
};

export const VsCode: React.FC<{
  t: number; w: number; h: number; logoVs: string; logoCc: string;
  enviado: number; piensa: number; interrumpe: number; tacha: number; entrada: string; enfocaEntrada: number;
}> = ({ t, w, h, logoVs, logoCc, enviado, piensa, interrumpe, tacha, entrada, enfocaEntrada }) => {
  const burbuja = sp(t, enviado, { damping: 14, stiffness: 180 });
  const pensando = t > piensa && t < interrumpe;
  const cortado = t >= interrumpe;
  const tachado = ramp(t, tacha, tacha + 0.35);
  const foco = t > enfocaEntrada;
  return (
    <div style={{ width: w, height: h, borderRadius: 24, overflow: "hidden", background: "#1E1E1E", border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.65)", display: "flex", flexDirection: "column", fontFamily: UI }}>
      <div style={{ height: 64, background: "#2B2B2B", display: "flex", alignItems: "center", gap: 12, padding: "0 22px", flexShrink: 0 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c, opacity: 0.85 }} />
        ))}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
          <Img src={staticFile(logoVs)} style={{ width: 30 }} />
          <div style={{ fontSize: 24, color: "#BBBBBB", fontWeight: 600 }}>web-floristeria</div>
        </div>
        <div style={{ width: 80 }} />
      </div>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ width: 64, background: "#252526", display: "flex", flexDirection: "column", alignItems: "center", gap: 26, paddingTop: 22 }}>
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} style={{ width: 30, height: 30, borderRadius: 7, border: `3px solid ${k === 0 ? "#DDDDDD" : "#6A6A6A"}` }} />
          ))}
        </div>
        <div style={{ width: 250, background: "#1B1B1C", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12, borderRight: "2px solid #2D2D2D" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#9D9D9D", letterSpacing: 1 }}>EXPLORER</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#CCCCCC", marginTop: 6 }}>⌄ WEB-FLORISTERIA</div>
          {["CLAUDE.md", "index.html", "estilos.css", "carrito.js"].map((f) => (
            <div key={f} style={{ fontSize: 21, color: "#CCCCCC", paddingLeft: 22, whiteSpace: "nowrap" }}>{f}</div>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ height: 54, display: "flex", background: "#252526", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: "#1E1E1E", borderTop: `3px solid ${C.acento}` }}>
              <Img src={staticFile(logoCc)} style={{ width: 30 }} />
              <div style={{ fontSize: 22, color: "#E6E6E6", fontWeight: 600 }}>Claude Code</div>
            </div>
          </div>
          <div style={{ flex: 1, padding: "24px 24px", display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
            {burbuja > 0 && (
              <div style={{ alignSelf: "stretch", padding: "16px 20px", borderRadius: 12, background: "#2D2D30", border: `2px solid ${tachado > 0 ? C.acento : "#3C3C3C"}`, fontSize: 30, color: "#E6E6E6", opacity: Math.min(1, burbuja * 1.5) * (1 - 0.45 * tachado), transform: `translateY(${(1 - burbuja) * 20}px)`, position: "relative" }}>
                arregla la web
                {tachado > 0 && <div style={{ position: "absolute", left: 16, top: "50%", height: 5, width: `${tachado * 210}px`, background: C.acento, borderRadius: 3 }} />}
              </div>
            )}
            {pensando && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#9D9D9D" }}>
                <svg width={34} height={34} viewBox="0 0 24 24" style={{ transform: `rotate(${t * 220}deg)` }}>
                  {Array.from({ length: 6 }, (_, k) => (
                    <path key={k} d="M12 12 L12 3" stroke={C.acento} strokeWidth={3} strokeLinecap="round" transform={`rotate(${k * 60} 12 12)`} />
                  ))}
                </svg>
                <span style={{ fontStyle: "italic" }}>Thinking{".".repeat(1 + (Math.floor(t * 3) % 3))}</span>
              </div>
            )}
            {cortado && <div style={{ fontSize: 26, fontStyle: "italic", color: "#9D9D9D", opacity: clamp01((t - interrumpe) / 0.2) }}>Interrupted</div>}
            <div style={{ flex: 1 }} />
            <div style={{ borderRadius: 14, border: `2px solid ${foco ? C.acento : "#3C3C3C"}`, background: "#252526", padding: "16px 18px", minHeight: 150, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ fontSize: 27, lineHeight: 1.35, color: entrada ? "#E6E6E6" : "#7A7A7A" }}>
                {entrada || "Esc to focus or unfocus Claude"}
                {foco && <span style={{ display: "inline-block", width: 3, height: 30, marginLeft: 3, verticalAlign: "middle", background: C.acento, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
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

/** La web de la floristería en el navegador (vista previa local), con el botón de comprar. */
export const WebFloristeria: React.FC<{ t: number; img: string; w: number; resalte: number; pulsa: number }> = ({ t, img, w, resalte, pulsa }) => {
  const r = clamp01((t - resalte) / 0.25);
  const k = t - pulsa;
  const hund = k > 0 && k < 0.25 ? Math.sin((k / 0.25) * Math.PI) * 0.08 : 0;
  const nada = k > 0.25 ? Math.sin((k - 0.25) * 40) * Math.exp(-(k - 0.25) * 6) * 8 : 0;
  const s = w / 440;
  return (
    <div style={{ width: w, borderRadius: 22 * s, overflow: "hidden", background: "#EDE3C8", border: `3px solid ${C.borde}`, boxShadow: "0 30px 80px rgba(0,0,0,0.65)" }}>
      <div style={{ height: 52 * s, background: "#2A2C33", display: "flex", alignItems: "center", gap: 8 * s, padding: `0 ${16 * s}px` }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 11 * s, height: 11 * s, borderRadius: "50%", background: c, opacity: 0.85 }} />
        ))}
        <div style={{ flex: 1, marginLeft: 8 * s, height: 32 * s, borderRadius: 16 * s, background: "#16181D", display: "flex", alignItems: "center", padding: `0 ${14 * s}px`, fontFamily: UI, fontWeight: 600, fontSize: 18 * s, color: "#C9CCD3" }}>localhost:4321</div>
      </div>
      <div style={{ position: "relative", height: 470 * s, overflow: "hidden" }}>
        <Img src={staticFile(img)} style={{ position: "absolute", left: 0, top: -120 * s, width: "100%" }} />
        <div style={{ position: "absolute", left: "50%", bottom: 34 * s, transform: `translateX(-50%) translateX(${nada}px) scale(${1 - hund + 0.06 * r})`, padding: `${14 * s}px ${44 * s}px`, borderRadius: 999, background: C.acento, border: `${4 * s}px solid #1C1A1A`, fontFamily: UI, fontWeight: 700, fontSize: 30 * s, color: "#1C1A1A", boxShadow: r > 0 ? `0 0 0 ${(5 + 4 * Math.sin(t * 8)) * s}px rgba(217,119,87,0.45)` : "0 8px 20px rgba(0,0,0,0.3)" }}>
          Comprar
        </div>
      </div>
    </div>
  );
};
