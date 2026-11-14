/**
 * EP.5 · bloque «Rondas» (escenas tecnologia → publicar → contactos): las preguntas de opciones de Claude, tal como
 * salen en la grabación (pestañas, pregunta y opciones), con el logo de cada opción entrando cuando la voz la nombra.
 * RONDA 1 tecnología (Astro RECOMENDADA, Next.js, Vite, HTML/CSS) · RONDA 2 dónde publicar (Vercel, Netlify,
 * Cloudflare Pages, FTP) · RONDA 3 contactos del formulario (webhook a n8n, script PHP). Al final de cada ronda se
 * marca la opción elegida en la grabación (Astro, FTP, n8n).
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Sello } from "../../componentes/Sello";
import { C, TITULO, UI, clamp01, ramp, sp } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps, EpisodioMaster } from "../../tipos";
import { FichaFija, IconoFtp, IconoHtmlCss, Picto, latido } from "../../ep05/kit";
import { VS } from "../../ep05/ui";

type Opc = { titulo: string; desc: string; logo?: string; blanca?: boolean; h?: number; icono?: "html" | "ftp" | string; en?: [string, number?]; latido?: [string, number?]; tenue?: boolean; recomendada?: boolean };
type Ronda = { escena: string; pestanas: string[]; activa: number; pregunta: string; en: string; opciones: Opc[]; elegida: number };

const RONDAS = (ep: EpisodioMaster): Ronda[] => [
  {
    escena: "tecnologia", pestanas: ["Stack", "Estilos", "Hosting", "Leads"], activa: 0, pregunta: "¿Con qué stack quieres construir la landing?", en: "tecnología", elegida: 0,
    opciones: [
      { titulo: "Astro", desc: "Estático, muy rápido. Ideal para landings.", logo: ep.logos.astro, blanca: false, h: 78, en: ["Astro"], recomendada: true },
      { titulo: "Next.js", desc: "React con SSR. Más pesado.", logo: ep.logos.nextjs, en: ["Next.js"] },
      { titulo: "Vite + HTML/CSS/JS", desc: "Sin framework, control total, build mínimo.", logo: ep.logos.vite, en: ["Vite"] },
      { titulo: "HTML/CSS puro sin build", desc: "Archivos sueltos subibles por FTP.", icono: "html", en: ["HTML"], latido: ["CSS"] },
    ],
  },
  {
    escena: "publicar", pestanas: ["Stack", "Estilos", "Hosting", "Leads"], activa: 2, pregunta: "¿Dónde se va a desplegar la landing?", en: "publicarlo", elegida: 3,
    opciones: [
      { titulo: "Vercel", desc: "Deploy automático desde git.", logo: ep.logos.vercel, en: ["Vercel"] },
      { titulo: "Netlify", desc: "Similar a Vercel. Incluye Netlify Forms.", logo: ep.logos.netlify, en: ["Netlify"] },
      { titulo: "Cloudflare Pages", desc: "Muy rápido y gratuito.", logo: ep.logos.cloudflare_pages, en: ["Cloudflare"] },
      { titulo: "Hosting tradicional (FTP)", desc: "Se sube el build por FTP.", icono: "ftp", en: ["hosting"], latido: ["FTP"] },
    ],
  },
  {
    escena: "contactos", pestanas: ["Formulario", "Tracking", "Idiomas", "Estructura"], activa: 0, pregunta: "¿A dónde se envían los datos del formulario?", en: "formulario", elegida: 0,
    opciones: [
      { titulo: "Webhook de n8n", desc: "El formulario hace POST a un webhook.", logo: ep.logos.n8n, en: ["webhook"], latido: ["n8n"] },
      { titulo: "Script PHP en el cPanel", desc: "Un send.php que envía el email.", logo: ep.logos.php, blanca: false, h: 82, en: ["script"], latido: ["PHP"] },
      { titulo: "Servicio externo", desc: "Formspree, Web3Forms…", icono: "enlace", tenue: true },
      { titulo: "Aún no lo sé", desc: "Se decide después.", icono: "reloj", tenue: true },
    ],
  },
];

const CY = [1100, 2400, 3700];
const PANEL_TOP = -300;
const FILA0 = -150;
const FILA_H = 142;

const tiempos = (L: LineaT, ep: EpisodioMaster) =>
  RONDAS(ep).map((r) => {
    const ini = L.ini(r.escena);
    const fin = L.fin(r.escena);
    const pregunta = L.en(r.escena, r.en);
    const ops = r.opciones.map((o) => (o.en ? L.en(r.escena, o.en[0], o.en[1]) : pregunta + 0.3));
    const lats = r.opciones.map((o) => (o.latido ? L.en(r.escena, o.latido[0], o.latido[1]) : -1));
    return { ini, fin, pregunta, ops, lats, marca: fin - 0.12 };
  });

export const Rondas: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const R = RONDAS(ep);
  const T = tiempos(L, ep);
  const tomas: Toma[] = [{ t: desde - 1, x: 540, y: CY[0] - 140, z: 1.04 }];
  T.forEach((r, i) => {
    const cy = CY[i];
    if (i > 0) tomas.push({ t: r.ini - 0.3, x: 540, y: cy - 140, z: 1.04, d: 0.9 });
    tomas.push({ t: r.pregunta - 0.15, x: 540, y: cy - 40, z: 1.0, d: 0.8 });
    r.ops.forEach((at, k) => {
      if (R[i].opciones[k].tenue) return;
      const fy = cy + FILA0 + k * FILA_H + FILA_H / 2;
      tomas.push({ t: at - 0.15, x: 540, y: Math.min(cy + 60, Math.max(cy - 40, fy)), z: 1.05, d: 0.7 });
    });
    tomas.push({ t: r.marca - 0.2, x: 540, y: cy + 30, z: 0.97, d: 0.8 });
  });
  return (
    <Escena t={t} tomas={tomas}>
      {R.map((r, i) => (
        <PanelRonda key={r.escena} r={r} n={i + 1} cy={CY[i]} t={t} T={T[i]} fin={T[i + 1]?.ini ?? Infinity} />
      ))}
    </Escena>
  );
};

const PanelRonda: React.FC<{ r: Ronda; n: number; cy: number; t: number; T: ReturnType<typeof tiempos>[number]; fin: number }> = ({ r, n, cy, t, T, fin }) => {
  const ent = sp(t, T.ini - 0.1, { damping: 15, stiffness: 150 });
  if (t < T.ini - 0.2) return null;
  const marca = ramp(t, T.marca, T.marca + 0.25);
  const sale = ramp(t, fin - 0.2, fin + 0.35);
  if (sale >= 1) return null;
  return (
    <div style={{ opacity: 1 - sale }}>
      <Sello texto={`RONDA ${n}`} x={540} y={cy - 400} t={t} at={T.ini} size={64} resalte={marca} />
      <div style={{ position: "absolute", left: 50, top: cy + PANEL_TOP, width: 980, opacity: Math.min(1, ent * 1.5), transform: `translateY(${(1 - ent) * 60}px) scale(${0.94 + 0.06 * ent})` }}>
        <div style={{ boxSizing: "border-box", borderRadius: 30, background: "#202124", border: `3px solid ${VS.cajaBorde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", padding: "22px 26px 20px", fontFamily: UI, fontWeight: 600 }}>
          <div style={{ display: "flex", gap: 28, fontSize: 27, marginBottom: 14 }}>
            {r.pestanas.map((p, k) => (
              <div key={p} style={{ color: k === r.activa ? VS.enlace : k > r.activa ? VS.blanco : VS.tenue, borderBottom: k === r.activa ? `3px solid ${VS.enlace}` : "3px solid transparent", paddingBottom: 6 }}>{p}</div>
            ))}
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: VS.blanco, marginBottom: 14, opacity: clamp01((t - T.pregunta + 0.2) * 4) * 0.7 + 0.3 }}>{r.pregunta}</div>
          {r.opciones.map((o, k) => {
            const at = T.ops[k];
            const v = o.tenue ? 0.35 * clamp01((t - at) * 3) : clamp01((t - at + 0.1) / 0.3);
            const s = o.tenue ? 1 : sp(t, at - 0.05, { damping: 12, stiffness: 190 });
            const elegida = k === r.elegida ? marca : 0;
            const lat = T.lats[k] > 0 ? latido(t, [T.lats[k]], 0.18) : 0;
            return (
              <div key={o.titulo} style={{ height: FILA_H, display: "flex", alignItems: "center", gap: 22, padding: "0 14px", borderRadius: 20, background: elegida > 0.5 ? "#2E3A46" : v > 0.5 && !o.tenue && t < (T.ops[k + 1] ?? T.marca) ? "rgba(255,255,255,0.04)" : "transparent", border: `3px solid ${elegida > 0.5 ? VS.enlace : "transparent"}`, opacity: 0.18 + 0.82 * v, boxSizing: "border-box" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", border: `3px solid ${elegida > 0 ? VS.enlace : "#5A5A5A"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {elegida > 0 && <div style={{ width: 20 * elegida, height: 20 * elegida, borderRadius: "50%", background: VS.enlace }} />}
                </div>
                <div style={{ width: 212, display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0, transform: `scale(${(o.tenue ? 1 : 0.4 + 0.6 * Math.min(1.08, s)) * (1 + lat)}) rotate(${(1 - Math.min(1, s)) * -12}deg)` }}>
                  {o.logo ? (
                    <FichaFija src={o.logo} h={o.h ?? 96} blanca={o.blanca ?? true} maxW={172} />
                  ) : o.icono === "html" ? (
                    <IconoHtmlCss size={100} />
                  ) : o.icono === "ftp" ? (
                    <IconoFtp size={100} />
                  ) : (
                    <Picto nombre={o.icono ?? "enlace"} size={70} color={C.gris} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 40, fontWeight: 700, color: VS.blanco, whiteSpace: "nowrap" }}>{o.titulo}</span>
                    {o.recomendada && v > 0.3 && (
                      <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 22, letterSpacing: 1.5, color: C.oscuro, background: C.acento, padding: "6px 14px", borderRadius: 999, transform: `scale(${Math.min(1, sp(t, at + 0.25, { damping: 11, stiffness: 220 }))})` }}>RECOMENDADA</span>
                    )}
                  </div>
                  <div style={{ fontSize: 27, color: VS.tenue, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 4 }}>{o.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const eventosRondas = (L: LineaT, ep: EpisodioMaster): Evento[] => {
  const R = RONDAS(ep);
  return tiempos(L, ep).flatMap((r, i) => [
    { t: r.ini + 0.08, sfx: "golpe" as const, vol: 0.5 },
    ...r.ops.filter((_, k) => !R[i].opciones[k].tenue).map((at) => ({ t: at, sfx: "pop" as const, vol: 0.32 })),
    { t: r.marca, sfx: "tick" as const, vol: 0.5 },
  ]);
};
