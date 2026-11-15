/**
 * EP.9 · La web de la panadería, recreada a partir del boceto del usuario (lienzo «Boceto web – Panadería»): crema,
 * tinta, coral y mostaza, Fraunces y DM Sans, sombras duras. Versión vertical para el reel. Todo depende de t.
 * También el boceto a mano de la portada (para «pega una captura») y su versión en alambre.
 */
import { loadFont } from "@remotion/fonts";
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, UI, clamp01, rand } from "../../nucleo";

export const SERIF = "Fraunces";
export const SANS = "DM Sans";
loadFont({ family: SERIF, url: staticFile("fonts/fraunces-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: SANS, url: staticFile("fonts/dm-sans-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: SANS, url: staticFile("fonts/dm-sans-latin-700-normal.woff2"), weight: "700" });

/** Paleta del boceto del usuario. */
export const P = { crema: "#F6ECD6", tinta: "#221E20", coral: "#E8604C", mostaza: "#F2B134", verde: "#2F9E8F", azul: "#4D6FCF", papel: "#FFF8E8", pan: "#D9913F", miga: "#8A4F1A", pie: "#1D6B61" };

// ── panes (dibujos del boceto del usuario) ───────────────────────────────────────────────────────────────────────
export const PanBarra: React.FC<{ s?: number }> = ({ s = 120 }) => (
  <svg width={s} height={s * 0.73} viewBox="0 0 150 110"><g transform="rotate(-18 75 55)"><rect x="8" y="40" width="134" height="32" rx="16" fill={P.pan} stroke={P.tinta} strokeWidth="4" /><path d="M40 46l8 20M70 46l8 20M100 46l8 20" stroke={P.miga} strokeWidth="4" strokeLinecap="round" /></g></svg>
);
export const PanHogaza: React.FC<{ s?: number }> = ({ s = 120 }) => (
  <svg width={s} height={s * 0.79} viewBox="0 0 140 110"><ellipse cx="70" cy="58" rx="60" ry="40" fill={P.pan} stroke={P.tinta} strokeWidth="4" /><path d="M42 38l12 36M68 34l12 40M94 38l10 34" stroke={P.miga} strokeWidth="4" strokeLinecap="round" /></svg>
);
export const PanCruasan: React.FC<{ s?: number }> = ({ s = 120 }) => (
  <svg width={s} height={s * 0.67} viewBox="0 0 150 100"><path d="M14 80C14 30 46 12 75 12s61 18 61 68" fill="none" stroke={P.tinta} strokeWidth="36" strokeLinecap="round" /><path d="M14 80C14 30 46 12 75 12s61 18 61 68" fill="none" stroke="#f0a64a" strokeWidth="26" strokeLinecap="round" /><path d="M52 28l-4 24M75 22v28M98 28l4 24" stroke={P.tinta} strokeWidth="4" strokeLinecap="round" /></svg>
);
export const PanTarta: React.FC<{ s?: number }> = ({ s = 120 }) => (
  <svg width={s} height={s * 0.92} viewBox="0 0 120 110"><rect x="14" y="52" width="92" height="46" rx="8" fill={P.crema} stroke={P.tinta} strokeWidth="4" /><rect x="26" y="26" width="68" height="30" rx="8" fill="#ef8a76" stroke={P.tinta} strokeWidth="4" /><path d="M60 26V10" stroke={P.tinta} strokeWidth="4" strokeLinecap="round" /><circle cx="60" cy="8" r="5" fill={P.mostaza} stroke={P.tinta} strokeWidth="3" /></svg>
);
const Espiga: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 40 40"><ellipse cx="20" cy="22" rx="17" ry="12" fill={P.mostaza} stroke={P.tinta} strokeWidth="3" /><path d="M12 17l4 10M20 15l4 11M28 17l3 9" stroke={P.tinta} strokeWidth="2.5" strokeLinecap="round" /></svg>
);

export const PRODUCTOS = [
  { nombre: "Barras", fondo: P.mostaza, Dibujo: PanBarra },
  { nombre: "Hogazas", fondo: P.verde, Dibujo: PanHogaza },
  { nombre: "Bollería", fondo: P.coral, Dibujo: PanCruasan },
];

/** Desplazamiento «roto» determinista de cada sección cuando algo se rompe. */
const roto = (k: number, r: number) => ({
  transform: `translate(${(rand(k * 3.3) - 0.5) * 120 * r}px, ${(rand(k * 5.1) - 0.3) * 90 * r}px) rotate(${(rand(k * 7.7) - 0.5) * 22 * r}deg)`,
});

export type WebProps = {
  w: number;
  t: number;
  /** 0 = alambre (boceto), 1 = con el estilo de la panadería */
  estilo?: number;
  /** 0..1: secciones que ya existen (cabecera, portada, ilustración, productos) */
  construye?: number;
  /** 0..1: botón de encargos por WhatsApp */
  whatsapp?: number;
  logoWhatsapp?: string;
  /** 0..1: la web se rompe (secciones descolocadas) */
  rota?: number;
  /** 0..1: franja «Los más encargados» (datos de Airtable) */
  destacados?: number;
  /** 0..1: novedad en la portada (cambio pedido desde el móvil) */
  novedad?: number;
  img: string;
  barra?: boolean;
  url?: string;
};

/** La web (portada) en una ventana de navegador. Alto ≈ 1,55·w. */
export const WebPanaderia: React.FC<WebProps> = ({ w, estilo = 1, construye = 1, whatsapp = 0, logoWhatsapp, rota = 0, destacados = 0, novedad = 0, img, barra = true, url = "localhost:4321" }) => {
  const s = w / 700;
  const sec = (k: number) => clamp01((construye * 4 - k) * 1.4);
  const al = 1 - estilo;
  const caja = (extra: React.CSSProperties = {}): React.CSSProperties => ({ border: `${3 * s}px solid ${P.tinta}`, borderRadius: 16 * s, ...extra });
  const linea = (ancho: string, alto = 14) => <div style={{ width: ancho, height: alto * s, borderRadius: 7 * s, background: "#B9AE97" }} />;
  return (
    <div style={{ width: w, borderRadius: 24 * s, overflow: "hidden", background: P.crema, border: `${3 * s}px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", fontFamily: SANS, color: P.tinta, position: "relative" }}>
      {barra && (
        <div style={{ height: 58 * s, background: "#2A2C33", display: "flex", alignItems: "center", gap: 9 * s, padding: `0 ${18 * s}px` }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 13 * s, height: 13 * s, borderRadius: "50%", background: c, opacity: 0.85 }} />
          ))}
          <div style={{ flex: 1, marginLeft: 10 * s, height: 36 * s, borderRadius: 18 * s, background: "#16181D", display: "flex", alignItems: "center", padding: `0 ${16 * s}px`, fontFamily: UI, fontWeight: 600, fontSize: 20 * s, color: "#C9CCD3" }}>{url}</div>
        </div>
      )}
      <div style={{ position: "relative", padding: `${22 * s}px ${30 * s}px ${30 * s}px` }}>
        {/* cabecera */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: sec(0), ...roto(1, rota) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 * s, fontFamily: SERIF, fontWeight: 800, fontSize: 30 * s }}>
            {al < 1 && <div style={{ opacity: estilo }}><Espiga s={38 * s} /></div>}
            <span style={{ opacity: estilo }}>Panadería</span>
          </div>
          <div style={{ display: "flex", gap: 16 * s, fontSize: 18 * s, fontWeight: 500, opacity: estilo }}>
            <span>Pan</span>
            <span>Encargos</span>
            <span>Dónde</span>
          </div>
          {al > 0.02 && (
            <div style={{ position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "space-between", opacity: al }}>
              {linea("34%", 22)}
              {linea("30%", 14)}
            </div>
          )}
        </div>
        {/* portada */}
        <div style={{ marginTop: 26 * s, display: "flex", gap: 22 * s, alignItems: "stretch", opacity: sec(1), ...roto(2, rota) }}>
          <div style={{ flex: 1.15, minWidth: 0, position: "relative" }}>
            <div style={{ opacity: estilo }}>
              <div style={{ display: "inline-block", background: novedad > 0.5 ? P.coral : P.mostaza, ...caja({ borderRadius: 999 }), padding: `${4 * s}px ${12 * s}px`, fontWeight: 700, fontSize: 15 * s, transform: `scale(${1 + 0.12 * Math.sin(clamp01(novedad) * Math.PI)})`, transformOrigin: "0 50%" }}>
                {novedad > 0.5 ? "¡Nuevo! Pan de centeno" : "Horno de barrio"}
              </div>
              <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 46 * s, lineHeight: 1.0, letterSpacing: -1.2 * s, margin: `${14 * s}px 0 ${12 * s}px` }}>Pan de verdad, hecho esta madrugada.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 * s, alignItems: "flex-start" }}>
                <div style={{ background: P.coral, ...caja({ borderRadius: 12 * s }), boxShadow: `${4 * s}px ${4 * s}px 0 ${P.tinta}`, padding: `${9 * s}px ${16 * s}px`, fontWeight: 700, fontSize: 18 * s }}>Encargar para mañana</div>
                {whatsapp > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 * s, background: "#25D366", ...caja({ borderRadius: 12 * s }), boxShadow: `${4 * s}px ${4 * s}px 0 ${P.tinta}`, padding: `${7 * s}px ${14 * s}px`, fontWeight: 700, fontSize: 18 * s, transform: `scale(${whatsapp})`, transformOrigin: "0 50%", opacity: Math.min(1, whatsapp * 2) }}>
                    {logoWhatsapp && <Img src={staticFile(logoWhatsapp)} style={{ width: 30 * s, height: 30 * s, borderRadius: 8 * s }} />}
                    Encargar por WhatsApp
                  </div>
                )}
              </div>
            </div>
            {al > 0.02 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 12 * s, opacity: al }}>
                {linea("45%", 20)}
                {linea("95%", 30)}
                {linea("80%", 30)}
                {linea("60%", 30)}
                <div style={{ width: "55%", height: 40 * s, borderRadius: 12 * s, border: `${3 * s}px dashed #8E846F`, marginTop: 8 * s }} />
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0, opacity: sec(2), ...roto(3, rota) }}>
            <div style={{ position: "relative", height: 300 * s, ...caja({ borderRadius: 22 * s }), overflow: "hidden", boxShadow: `${8 * s}px ${8 * s}px 0 ${P.tinta}`, background: "#E9DCBC", transform: `rotate(${2 * estilo}deg)` }}>
              <Img src={staticFile(img)} style={{ position: "absolute", left: "-6%", top: -38 * s, width: "112%", opacity: estilo }} />
              {al > 0.02 && (
                <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: al }} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 0 L100 100 M100 0 L0 100" stroke="#8E846F" strokeWidth="1.2" />
                </svg>
              )}
            </div>
          </div>
        </div>
        {/* destacados (Airtable) */}
        {destacados > 0 && (
          <div style={{ marginTop: 22 * s, ...caja({ borderRadius: 18 * s }), background: P.mostaza, boxShadow: `${5 * s}px ${5 * s}px 0 ${P.tinta}`, padding: `${12 * s}px ${16 * s}px`, opacity: clamp01(destacados * 2), transform: `scale(${0.85 + 0.15 * clamp01(destacados)})`, transformOrigin: "50% 0" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 24 * s, marginBottom: 6 * s }}>★ Los más encargados</div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {PRODUCTOS.map(({ nombre, Dibujo }, k) => (
                <div key={nombre} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: clamp01(destacados * 3 - k * 0.6), transform: `translateY(${(1 - clamp01(destacados * 3 - k * 0.6)) * -30 * s}px)` }}>
                  <Dibujo s={70 * s} />
                  <div style={{ fontWeight: 700, fontSize: 15 * s }}>{nombre}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* productos */}
        <div style={{ marginTop: 24 * s, display: "flex", gap: 16 * s, opacity: sec(3), ...roto(4, rota) }}>
          {PRODUCTOS.map(({ nombre, fondo, Dibujo }, k) => (
            <div key={nombre} style={{ flex: 1, ...caja({ borderRadius: 18 * s }), background: estilo > 0.5 ? P.papel : "transparent", boxShadow: estilo > 0.5 ? `${5 * s}px ${5 * s}px 0 ${P.tinta}` : "none", overflow: "hidden", ...roto(5 + k, rota * 0.6) }}>
              <div style={{ height: 96 * s, background: estilo > 0.5 ? fondo : "transparent", borderBottom: `${3 * s}px solid ${P.tinta}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ opacity: estilo }}>
                  <Dibujo s={92 * s} />
                </div>
              </div>
              <div style={{ padding: `${8 * s}px ${12 * s}px ${12 * s}px`, fontFamily: SERIF, fontWeight: 800, fontSize: 20 * s }}>
                <span style={{ opacity: estilo }}>{nombre}</span>
              </div>
            </div>
          ))}
        </div>
        {rota > 0.02 && (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: rota }}>
            <path d="M38 0 L44 18 L36 30 L47 46 L40 61 L52 78 L46 100" stroke={C.acento} strokeWidth="0.9" fill="none" />
            <path d="M44 18 L58 24 M47 46 L30 52" stroke={C.acento} strokeWidth="0.6" fill="none" />
          </svg>
        )}
      </div>
    </div>
  );
};

/** Boceto a mano de la portada (papel con trazos temblorosos). */
export const Boceto: React.FC<{ w: number; t: number; etiquetas?: number; tacha?: number }> = ({ w, etiquetas = 0, tacha = 0 }) => {
  const s = w / 400;
  const trazo = { fill: "none", stroke: "#2B3A55", strokeWidth: 3.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const nombres = [
    { txt: "header", x: 200, y: 44 },
    { txt: "hero", x: 112, y: 160 },
    { txt: "CTA", x: 92, y: 262 },
    { txt: "grid", x: 200, y: 400 },
  ];
  return (
    <div style={{ width: w, height: w * 1.2, background: "#FBF7EE", borderRadius: 8 * s, boxShadow: "0 24px 60px rgba(0,0,0,0.55)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(#FBF7EE 0 27px, #DCE6F2 27px 29px)", backgroundSize: `100% ${29 * s}px`, opacity: 0.7 }} />
      <svg width={w} height={w * 1.2} viewBox="0 0 400 480" style={{ position: "absolute", inset: 0 }}>
        <path d="M24 30 Q200 24 376 32 L374 64 Q200 70 26 62 Z" {...trazo} />
        <path d="M40 46 q8 -6 16 0 q8 6 16 0" {...trazo} />
        <path d="M300 48 h16 M326 48 h16 M352 48 h12" {...trazo} />
        <path d="M30 100 Q110 96 190 102 M30 130 Q100 126 182 132 M30 160 Q90 156 150 162" {...trazo} strokeWidth={5} />
        <path d="M34 240 Q90 236 150 242 L148 280 Q90 284 36 278 Z" {...trazo} />
        <path d="M216 96 L370 92 L372 300 L214 304 Z" {...trazo} />
        <path d="M232 280 L262 220 L292 262 L316 236 L356 286" {...trazo} />
        <circle cx="330" cy="140" r="16" {...trazo} />
        <path d="M30 340 L130 338 L128 450 L32 452 Z M150 338 L250 340 L252 452 L148 450 Z M272 340 L372 338 L370 450 L274 452 Z" {...trazo} />
        <path d="M60 380 q20 -18 40 0 M180 382 q20 -18 40 0 M300 380 q20 -18 40 0" {...trazo} />
      </svg>
      {nombres.map((n, k) => {
        const e = clamp01(etiquetas * 4 - k);
        if (e <= 0) return null;
        return (
          <div key={n.txt} style={{ position: "absolute", left: n.x * s, top: n.y * s, transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * e})`, opacity: e * (1 - 0.65 * tacha), padding: `${4 * s}px ${12 * s}px`, borderRadius: 999, background: C.panel2, border: `${2 * s}px solid ${C.gris}`, fontFamily: MONO, fontWeight: 700, fontSize: 20 * s, color: C.texto, whiteSpace: "nowrap" }}>
            {n.txt}
            {tacha > 0 && <div style={{ position: "absolute", left: 6 * s, top: "50%", height: 3 * s, width: `calc(${tacha * 100}% - ${12 * s}px)`, background: C.acento }} />}
          </div>
        );
      })}
    </div>
  );
};

/** Captura de una web cualquiera (miniatura ficticia, sin marca). */
export const CapturaWeb: React.FC<{ w: number }> = ({ w }) => {
  const s = w / 300;
  return (
    <div style={{ width: w, height: w * 0.78, background: "#FFFFFF", borderRadius: 10 * s, overflow: "hidden", boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ height: 22 * s, background: "#E4E7EC", display: "flex", alignItems: "center", gap: 4 * s, paddingLeft: 8 * s }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 7 * s, height: 7 * s, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{ padding: 12 * s, display: "flex", gap: 10 * s }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 * s }}>
          <div style={{ height: 12 * s, width: "80%", borderRadius: 4 * s, background: "#3D3A4B" }} />
          <div style={{ height: 12 * s, width: "60%", borderRadius: 4 * s, background: "#3D3A4B" }} />
          <div style={{ height: 6 * s, width: "90%", borderRadius: 3 * s, background: "#C9CDD6" }} />
          <div style={{ height: 6 * s, width: "70%", borderRadius: 3 * s, background: "#C9CDD6" }} />
          <div style={{ height: 18 * s, width: "50%", borderRadius: 9 * s, background: "#7C6CF2", marginTop: 4 * s }} />
        </div>
        <div style={{ width: 110 * s, height: 110 * s, borderRadius: 12 * s, background: "linear-gradient(135deg, #FFD3A8, #F28C8C)" }} />
      </div>
      <div style={{ display: "flex", gap: 8 * s, padding: `0 ${12 * s}px` }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ flex: 1, height: 44 * s, borderRadius: 8 * s, background: "#EEF0F4" }} />
        ))}
      </div>
    </div>
  );
};

/** Captura de un error (miniatura ficticia). */
export const CapturaError: React.FC<{ w: number }> = ({ w }) => {
  const s = w / 300;
  return (
    <div style={{ width: w, height: w * 0.78, background: "#1E1E1E", borderRadius: 10 * s, overflow: "hidden", boxShadow: "0 18px 40px rgba(0,0,0,0.5)", padding: 14 * s, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 8 * s }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 * s }}>
        <div style={{ width: 22 * s, height: 22 * s, borderRadius: "50%", background: "#F14C4C", color: "#1E1E1E", fontFamily: UI, fontWeight: 700, fontSize: 16 * s, display: "flex", alignItems: "center", justifyContent: "center" }}>!</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 17 * s, color: "#F14C4C" }}>Error</div>
      </div>
      {[0.9, 0.75, 0.82, 0.5].map((f, k) => (
        <div key={k} style={{ height: 8 * s, width: `${f * 100}%`, borderRadius: 4 * s, background: k === 0 ? "#F14C4C88" : "#555" }} />
      ))}
    </div>
  );
};
