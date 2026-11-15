/**
 * Piezas del EP.6 «Prompting maestro»: iconos planos propios (en coral, no son logos de marca), el móvil con la web
 * de ejemplo (boceto: sin teléfono, sin precios ni nombre de empresa) y el texto que se escribe al ritmo de la voz.
 * Todo depende del tiempo t (segundos del reel): sin transiciones CSS ni temporizadores.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, TITULO, UI, clamp01, norm, sp } from "../nucleo";
import type { Linea as LineaT, Palabra } from "../nucleo";

// ── iconos de trazo (24 x 24) ────────────────────────────────────────────────────────────────────────────────────
const TRAZOS6: Record<string, string> = {
  llave: "M15.5 3.5 a5 5 0 0 0 -4.9 6.6 L3.8 16.9 a1.9 1.9 0 0 0 2.7 2.7 L13.3 12.8 a5 5 0 0 0 6.6 -4.9 L17 10.8 L14.6 10.2 L14 7.8 Z",
  megafono: "M3.5 9.5 V14.5 H7 L16 19.5 V4.5 L7 9.5 Z M7 14.5 L8.6 20.5 H11 L9.8 15.6 M19 9 a4 4 0 0 1 0 6",
  embudo: "M3 4 H21 L14 12.8 V19 L10 21 V12.8 Z",
  robot: "M7 8.5 H17 a2.5 2.5 0 0 1 2.5 2.5 V17 a2.5 2.5 0 0 1 -2.5 2.5 H7 a2.5 2.5 0 0 1 -2.5 -2.5 V11 a2.5 2.5 0 0 1 2.5 -2.5 Z M12 8.5 V5.2 M12 3.2 a1 1 0 1 0 0.01 0 M9.3 13 a1.1 1.1 0 1 0 0.01 0 M14.7 13 a1.1 1.1 0 1 0 0.01 0 M9.5 16.5 H14.5 M2.5 12.5 V15.5 M21.5 12.5 V15.5",
  bola: "M12 3 a7 7 0 1 0 0.01 0 M6.5 19.5 H17.5 L16 22 H8 Z M8.6 8 a4 4 0 0 1 3.4 -2.2",
  captura: "M3.5 5 H20.5 V19 H3.5 Z M3.5 15.5 L8.5 10.5 L13 15 L15.5 12.5 L20.5 17.5 M15.5 8.6 a1.3 1.3 0 1 0 0.01 0",
  clip: "M16.5 6.5 L8.6 14.4 a1.8 1.8 0 0 0 2.6 2.6 L19 9.2 a3.4 3.4 0 0 0 -4.8 -4.8 L6.3 12.3 a5 5 0 0 0 7.1 7.1 L19.5 13.3",
  candado: "M6 11 H18 V20.5 H6 Z M8.5 11 V7.8 a3.5 3.5 0 0 1 7 0 V11 M12 14.5 V17",
  precio: "M3.5 12.5 L11.5 4.5 H19.5 V12.5 L11.5 20.5 Z M15.5 8.5 a1 1 0 1 0 0.01 0",
  recorte: "M7 2.5 V17 H21.5 M2.5 7 H17 V21.5",
  marca: "M12 7 L13.5 10.1 L16.9 10.6 L14.5 13 L15 16.4 L12 14.8 L9 16.4 L9.5 13 L7.1 10.6 L10.5 10.1 Z M12 2.5 a9.5 9.5 0 1 0 0.01 0",
  pagina: "M6 2.5 H18 a1.5 1.5 0 0 1 1.5 1.5 V20 a1.5 1.5 0 0 1 -1.5 1.5 H6 a1.5 1.5 0 0 1 -1.5 -1.5 V4 a1.5 1.5 0 0 1 1.5 -1.5 Z M8 6.5 H16 M8 10 H16 M8 13.5 H13",
  secreto: "M12 3 L13.8 9.2 L20 11 L13.8 12.8 L12 19 L10.2 12.8 L4 11 L10.2 9.2 Z M19 3.5 V6.5 M17.5 5 H20.5",
  teclado: "M3 6.5 H21 V17.5 H3 Z M6.5 10 H7 M10 10 H10.5 M13.5 10 H14 M17 10 H17.5 M7.5 14 H16.5",
  check: "M5 12.5 L10 17.5 L19 7",
  cruz: "M6 6 L18 18 M18 6 L6 18",
  usuario: "M12 4 a4 4 0 1 0 0.01 0 M4.5 20.5 C5.5 16.5 8.4 14.5 12 14.5 C15.6 14.5 18.5 16.5 19.5 20.5",
  documento: "M6 3 H14 L19 8 V21 H6 Z M14 3 V8 H19 M9 12.5 H16 M9 16 H14",
  paleta: "M12 3 a9 9 0 0 0 0 18 c1.4 0 2 -1 1.4 -2.2 c-0.7 -1.3 0.2 -2.8 1.7 -2.8 H17 a4 4 0 0 0 4 -4 C21 6.8 17 3 12 3 Z M7.5 12 a1 1 0 1 0 0.01 0 M9.5 7.5 a1 1 0 1 0 0.01 0 M14.5 7.5 a1 1 0 1 0 0.01 0",
  bocadillo: "M4 5.5 h16 a1.5 1.5 0 0 1 1.5 1.5 v9 a1.5 1.5 0 0 1 -1.5 1.5 h-9 l-4.5 3.5 v-3.5 h-2.5 a1.5 1.5 0 0 1 -1.5 -1.5 v-9 a1.5 1.5 0 0 1 1.5 -1.5 z",
  bucle: "M20 12 a8 8 0 1 1 -2.4 -5.7 M20 4 V7.5 H16.5",
  aviso: "M12 3.5 L21.5 20 H2.5 Z M12 9.5 V14 M12 17 V17.2",
  pin: "M12 21 C12 21 5 14.5 5 9.5 a7 7 0 0 1 14 0 C19 14.5 12 21 12 21 Z M12 7 a2.5 2.5 0 1 0 0.01 0",
  codigo: "M8.5 7 L3.5 12 L8.5 17 M15.5 7 L20.5 12 L15.5 17",
  lapiz: "M4 20 L5 15 L15.5 4.5 a2.1 2.1 0 0 1 3 3 L8 18 Z M13.5 6.5 L17.5 10.5",
  diana: "M12 3 a9 9 0 1 0 0.01 0 M12 7.5 a4.5 4.5 0 1 0 0.01 0 M12 11 a1 1 0 1 0 0.01 0",
};

export const Ico: React.FC<{ nombre: string; size: number; color?: string; grosor?: number; dibujo?: number; relleno?: string }> = ({ nombre, size, color = C.acento, grosor = 2.2, dibujo = 1, relleno = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", overflow: "visible" }}>
    <path d={TRAZOS6[nombre]} fill={relleno} stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(dibujo)} />
  </svg>
);

/** Círculo con icono (activo: borde y brillo coral). */
export const Medalla6: React.FC<{ nombre: string; size: number; activo?: number; color?: string; tachado?: number }> = ({ nombre, size, activo = 1, color = C.acento, tachado = 0 }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
    <div style={{ width: size, height: size, boxSizing: "border-box", borderRadius: "50%", background: C.panel2, border: `${Math.max(3, size * 0.04)}px solid ${activo > 0.5 ? color : C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: activo > 0.5 ? `0 0 ${size * 0.35}px ${color}55` : "none" }}>
      <Ico nombre={nombre} size={size * 0.56} color={activo > 0.5 ? color : C.gris} />
    </div>
    {tachado > 0 && (
      <div style={{ position: "absolute", inset: 0 }}>
        <Ico nombre="cruz" size={size} color={C.acento} grosor={2} dibujo={tachado} />
      </div>
    )}
  </div>
);

/** Insignia redonda con ✓ o ✗ (para resultados). */
export const Veredicto: React.FC<{ ok: boolean; size: number; dibujo: number }> = ({ ok, size, dibujo }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: ok ? C.acento : C.panel2, border: `${size * 0.06}px solid ${ok ? C.acento : C.gris}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: ok ? `0 0 ${size * 0.5}px ${C.acento}88` : "0 12px 30px rgba(0,0,0,0.5)" }}>
    <Ico nombre={ok ? "check" : "cruz"} size={size * 0.6} color={ok ? C.oscuro : C.gris} grosor={3.2} dibujo={dibujo} />
  </div>
);

// ── texto de la voz que se escribe palabra a palabra ─────────────────────────────────────────────────────────────
/** Palabras de una escena entre la palabra `desde` y la palabra `hasta` (incluidas), con sus tiempos de la voz. */
export const tramo = (L: LineaT, escena: string, desde: string, hasta: string): Palabra[] => {
  const ws = L.palabras.filter((p) => p.escena === escena);
  const a = ws.findIndex((p) => norm(p.texto) === norm(desde));
  const b = ws.findIndex((p, i) => i >= a && norm(p.texto) === norm(hasta));
  if (a < 0 || b < 0) throw new Error(`No encuentro el tramo «${desde} … ${hasta}» en ${escena}`);
  return ws.slice(a, b + 1);
};

/**
 * Texto que se escribe al ritmo de la voz: cada palabra aparece letra a letra mientras suena. Las palabras de
 * `resaltes` (índices) se ponen en coral y con subrayado desde que suenan.
 */
export const TextoVoz: React.FC<{ palabras: Palabra[]; t: number; size: number; color?: string; resaltes?: number[]; limpiar?: (w: string) => string; cursor?: boolean; fuente?: string }> = ({
  palabras, t, size, color = "#E8E8E8", resaltes = [], limpiar = (w) => w, cursor = true, fuente = UI,
}) => {
  const escritas = palabras.filter((p) => t >= p.inicio - 0.05);
  return (
    <span style={{ fontFamily: fuente, fontWeight: 600, fontSize: size, lineHeight: 1.42, color }}>
      {escritas.map((p, i) => {
        const w = limpiar(p.texto);
        const k = palabras.indexOf(p);
        const dur = Math.max(0.12, Math.min(0.5, p.fin - p.inicio));
        const n = Math.max(1, Math.round(clamp01((t - p.inicio + 0.05) / dur) * w.length));
        const res = resaltes.includes(k);
        const s = res ? sp(t, p.inicio, { damping: 16, stiffness: 200 }) : 0;
        return (
          <React.Fragment key={k}>
            <span style={{ color: res ? `color-mix(in srgb, ${C.acento} ${Math.round(Math.min(1, s) * 100)}%, ${color})` : undefined, borderBottom: res ? `${Math.max(3, size * 0.1)}px solid rgba(217,119,87,${Math.min(1, s)})` : undefined }}>
              {w.slice(0, n)}
            </span>
            {i < escritas.length - 1 ? " " : ""}
          </React.Fragment>
        );
      })}
      {cursor && <span style={{ display: "inline-block", width: Math.max(3, size * 0.08), height: size * 1.1, marginLeft: 4, verticalAlign: "middle", background: color, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.15 }} />}
    </span>
  );
};

/** Quita las comillas angulares y la puntuación final de una palabra de la voz (lo que se teclea en la caja). */
export const sinComillas = (w: string) => w.replace(/[«»]/g, "").replace(/\.$/, "");

// ── el móvil con la web de ejemplo ───────────────────────────────────────────────────────────────────────────────
const AZUL = "#2F6FE4";
const AZUL_OSCURO = "#163A82";
const AZUL_CLARO = "#DCE8FF";
const VERDE_WA = "#25D366";

export type EstadoWeb = {
  /** 0 = boceto gris genérico, 1 = la web pedida */
  modo: "generica" | "pedida";
  /** progreso de cada pieza (0–1) en la web pedida */
  pagina?: number;
  cabecera?: number;
  boton?: number;
  azul?: number;
  precios?: number;
};

/** Móvil con la web. La genérica es un boceto gris; la pedida se monta pieza a pieza al nombrarla. */
export const Telefono: React.FC<{ w: number; estado: EstadoWeb; whatsapp: string; t: number; tenue?: number }> = ({ w, estado, whatsapp, t, tenue = 1 }) => {
  const s = w / 400;
  const h = 780 * s;
  const az = estado.modo === "pedida" ? clamp01(estado.azul ?? 0) : 0;
  const mezcla = (a: string, b: string) => `color-mix(in srgb, ${b} ${Math.round(az * 100)}%, ${a})`;
  const fondoPag = estado.modo === "generica" ? "#E9EBEF" : mezcla("#F2F3F5", "#F4F8FF");
  const barra = estado.modo === "generica" ? "#C5CAD3" : mezcla("#C5CAD3", AZUL);
  const pieza = (p: number | undefined) => {
    const k = clamp01(p ?? 0);
    return { opacity: Math.min(1, k * 1.6), transform: `translateY(${(1 - k) * 24 * s}px) scale(${0.9 + 0.1 * k})` };
  };
  return (
    <div style={{ width: w, height: h, borderRadius: 56 * s, background: "#0E1016", border: `${8 * s}px solid #2B3040`, boxShadow: "0 40px 100px rgba(0,0,0,0.65)", padding: 14 * s, boxSizing: "border-box", opacity: tenue }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 42 * s, overflow: "hidden", background: fondoPag, position: "relative", display: "flex", flexDirection: "column" }}>
        {/* barra del navegador */}
        <div style={{ height: 56 * s, flexShrink: 0, background: "#FFFFFF", borderBottom: `${2 * s}px solid #DADDE3`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "70%", height: 26 * s, borderRadius: 13 * s, background: "#EEF0F3" }} />
        </div>
        {estado.modo === "generica" ? (
          <div style={{ padding: 22 * s, display: "flex", flexDirection: "column", gap: 18 * s }}>
            <div style={{ height: 40 * s, borderRadius: 8 * s, background: barra }} />
            <div style={{ height: 180 * s, borderRadius: 14 * s, background: "#D3D7DE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ico nombre="captura" size={90 * s} color="#AEB4BF" grosor={1.6} />
            </div>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 34 * s, color: "#9AA1AD" }}>Lorem ipsum</div>
            {[92, 80, 86, 60].map((p, i) => (
              <div key={i} style={{ height: 14 * s, width: `${p}%`, borderRadius: 7 * s, background: "#CDD1D8" }} />
            ))}
            <div style={{ display: "flex", gap: 12 * s, marginTop: 6 * s }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ flex: 1, height: 90 * s, borderRadius: 10 * s, background: "#D9DCE2" }} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", ...pieza(estado.pagina) }}>
            {/* cabecera: fontanero de Madrid */}
            <div style={{ ...pieza(estado.cabecera), background: mezcla("#9AA1AD", AZUL_OSCURO), padding: `${22 * s}px ${22 * s}px ${26 * s}px`, display: "flex", flexDirection: "column", gap: 12 * s }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
                <div style={{ width: 64 * s, height: 64 * s, borderRadius: 16 * s, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ico nombre="llave" size={42 * s} color={mezcla("#6B7280", AZUL)} grosor={2.4} />
                </div>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 36 * s, color: "#FFFFFF", lineHeight: 1.05 }}>Fontanero</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 * s, fontFamily: UI, fontWeight: 700, fontSize: 24 * s, color: "#FFFFFF", opacity: 0.9 }}>
                <Ico nombre="pin" size={28 * s} color="#FFFFFF" grosor={2.2} />
                Madrid
              </div>
            </div>
            {/* botón grande de WhatsApp */}
            <div style={{ padding: `${24 * s}px ${22 * s}px ${8 * s}px` }}>
              <div style={{ ...pieza(estado.boton), height: 96 * s, borderRadius: 48 * s, background: VERDE_WA, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 * s, boxShadow: `0 ${10 * s}px ${26 * s}px rgba(37,211,102,0.45)`, transform: `${pieza(estado.boton).transform} scale(${1 + 0.04 * Math.sin(t * 5) * clamp01(estado.boton ?? 0)})` }}>
                <div style={{ width: 62 * s, height: 62 * s, borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Img src={staticFile(whatsapp)} style={{ width: 46 * s, height: 46 * s, objectFit: "contain" }} />
                </div>
                <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 30 * s, color: "#FFFFFF" }}>WhatsApp</div>
              </div>
            </div>
            {/* sección de precios (sin cifras) */}
            <div style={{ ...pieza(estado.precios), padding: `${18 * s}px ${22 * s}px`, display: "flex", flexDirection: "column", gap: 12 * s }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 * s, fontFamily: TITULO, fontWeight: 800, fontSize: 30 * s, color: mezcla("#5B6270", AZUL_OSCURO) }}>
                <Ico nombre="precio" size={32 * s} color={mezcla("#5B6270", AZUL)} grosor={2.4} />
                Precios
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ height: 66 * s, borderRadius: 14 * s, background: "#FFFFFF", border: `${3 * s}px solid ${mezcla("#D3D7DE", AZUL_CLARO)}`, display: "flex", alignItems: "center", padding: `0 ${16 * s}px`, gap: 14 * s }}>
                  <div style={{ width: 34 * s, height: 34 * s, borderRadius: 10 * s, background: mezcla("#C5CAD3", AZUL) }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 * s }}>
                    <div style={{ height: 12 * s, width: `${[70, 56, 64][i]}%`, borderRadius: 6 * s, background: "#B9BFCA" }} />
                    <div style={{ height: 10 * s, width: `${[44, 52, 38][i]}%`, borderRadius: 5 * s, background: "#DADDE3" }} />
                  </div>
                  <div style={{ width: 70 * s, height: 30 * s, borderRadius: 15 * s, background: mezcla("#D3D7DE", AZUL_CLARO) }} />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* barra inferior del sistema */}
        <div style={{ position: "absolute", left: "35%", right: "35%", bottom: 10 * s, height: 6 * s, borderRadius: 3 * s, background: "#9AA1AD" }} />
      </div>
    </div>
  );
};

/** Barras de calidad (0–5) que se llenan con `nivel`. */
export const Calidad: React.FC<{ nivel: number; ancho?: number; alto?: number }> = ({ nivel, ancho = 200, alto = 70 }) => {
  const n = 5;
  const g = ancho * 0.06;
  const bw = (ancho - g * (n - 1)) / n;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: g, height: alto }}>
      {Array.from({ length: n }, (_, i) => {
        const on = clamp01(nivel - i);
        return <div key={i} style={{ width: bw, height: alto * (0.36 + 0.16 * i), borderRadius: bw * 0.25, background: on > 0 ? `color-mix(in srgb, ${C.acento} ${Math.round(on * 100)}%, ${C.panel2})` : C.panel2, border: `3px solid ${on > 0.5 ? C.acento : C.borde}`, boxShadow: on > 0.5 ? `0 0 16px ${C.acento}66` : "none" }} />;
      })}
    </div>
  );
};
