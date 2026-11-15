/**
 * EP.8 · Dibujos planos (no son marcas): cerradura con llave, datáfono, máquina de turnos, servidor, reloj de arena,
 * carpeta, aviso de error, tecla Esc, gente en cola e iconos pequeños. Todo depende de t (sin CSS transitions).
 */
import React from "react";
import { C, EASE, EASE_OUT, MONO, TITULO, UI, clamp01, rand, ramp, sp, vis } from "../../nucleo";

const BLANCO = "#FFFFFF";
const OSC = "#0B0D12";

/** Caja centrada en (x, y) con entrada spring y salida. */
export const Pieza: React.FC<{ x: number; y: number; t: number; at: number; out?: number; children: React.ReactNode; escala?: number; rot?: number; dx?: number; dy?: number }> = ({
  x, y, t, at, out, children, escala = 1, rot = 0, dx = 0, dy = 0,
}) => {
  const v = vis(t, at, out, 0.5);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${dx}px, ${dy + v.y}px) scale(${v.scale * escala}) rotate(${rot}deg)`, opacity: v.opacity }}>{children}</div>
    </div>
  );
};

const Cruz: React.FC<{ s: number; p: number }> = ({ s, p }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: C.acento, border: `${s * 0.07}px solid ${OSC}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p})`, boxShadow: `0 0 ${s * 0.5}px ${C.acento}88` }}>
    <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24"><path d="M5 5 L19 19 M19 5 L5 19" stroke={OSC} strokeWidth={4} strokeLinecap="round" /></svg>
  </div>
);

export const Check: React.FC<{ s: number; p: number; fondo?: string; color?: string }> = ({ s, p, fondo = C.acento, color = OSC }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: fondo, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.min(1.15, p)})`, boxShadow: `0 0 ${s * 0.45}px ${C.acento}77` }}>
    <svg width={s * 0.62} height={s * 0.62} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={color} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - clamp01(p))} /></svg>
  </div>
);

// ── cerradura y llave (401) ───────────────────────────────────────────────────────────────────────────────────────
export const Cerradura: React.FC<{ t: number; entra: number; intenta: number; falla: number }> = ({ t, entra, intenta, falla }) => {
  const llega = ramp(t, entra, entra + 0.55, EASE_OUT);
  const k = t - intenta;
  const forcejeo = k > 0 ? Math.sin(k * 26) * Math.exp(-k * 2.8) * 16 : 0;
  const sacude = k > 0 ? Math.sin(k * 40) * Math.exp(-k * 5) * 10 : 0;
  const retira = ramp(t, falla + 0.2, falla + 0.6, EASE);
  const kx = -360 + 250 * llega - 60 * retira;
  const x = sp(t, falla, { damping: 9, stiffness: 260 });
  return (
    <div style={{ position: "relative", width: 640, height: 380 }}>
      {/* candado */}
      <div style={{ position: "absolute", left: 360, top: 0, transform: `translateX(${sacude}px)` }}>
        <svg width={250} height={360} viewBox="0 0 250 360">
          <path d="M 55 160 L 55 100 A 70 70 0 0 1 195 100 L 195 160" fill="none" stroke={BLANCO} strokeWidth={30} strokeLinecap="round" />
          <rect x={10} y={140} width={230} height={210} rx={34} fill={C.acento} stroke={OSC} strokeWidth={8} />
          <circle cx={125} cy={225} r={26} fill={OSC} />
          <path d="M 113 236 L 137 236 L 132 300 L 118 300 Z" fill={OSC} />
        </svg>
      </div>
      {/* llave */}
      <div style={{ position: "absolute", left: 300 + kx, top: 205, transformOrigin: "100% 50%", transform: `rotate(${forcejeo}deg)` }}>
        <svg width={250} height={90} viewBox="0 0 250 90">
          <circle cx={45} cy={45} r={38} fill={BLANCO} stroke={OSC} strokeWidth={6} />
          <circle cx={45} cy={45} r={13} fill={OSC} />
          <rect x={78} y={36} width={170} height={20} rx={6} fill={BLANCO} stroke={OSC} strokeWidth={5} />
          <path d="M 180 56 L 180 76 L 196 76 L 196 56 M 214 56 L 214 70 L 230 70 L 230 56" fill={BLANCO} stroke={OSC} strokeWidth={5} strokeLinejoin="round" />
        </svg>
      </div>
      {t > falla && (
        <div style={{ position: "absolute", left: 560, top: 70 }}>
          <Cruz s={110} p={x} />
        </div>
      )}
    </div>
  );
};

// ── datáfono y tarjeta (400) ──────────────────────────────────────────────────────────────────────────────────────
export const Datafono: React.FC<{ t: number; entra: number; rechaza: number }> = ({ t, entra, rechaza }) => {
  const mete = ramp(t, entra + 0.15, entra + 0.65, EASE);
  const saca = sp(t, rechaza + 0.15, { damping: 12, stiffness: 160 });
  const den = t > rechaza;
  const tiembla = den ? Math.sin((t - rechaza) * 45) * Math.exp(-(t - rechaza) * 5) * 8 : 0;
  const cy = -70 + 110 * mete - 120 * saca;
  const cx = 70 * saca;
  const opT = clamp01((t - entra) / 0.2);
  return (
    <div style={{ position: "relative", width: 520, height: 470 }}>
      {/* tarjeta: entra por arriba */}
      <div style={{ position: "absolute", left: 160 + cx, top: 40 + cy, opacity: opT, transform: `rotate(${12 * saca}deg)`, zIndex: 0 }}>
        <div style={{ width: 200, height: 128, borderRadius: 16, background: BLANCO, border: `6px solid ${OSC}`, boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 22, height: 22, background: C.acento }} />
          <div style={{ position: "absolute", left: 20, top: 62, width: 40, height: 30, borderRadius: 6, background: "#E0B860", border: `3px solid ${OSC}` }} />
          <div style={{ position: "absolute", left: 76, top: 74, width: 92, height: 10, borderRadius: 5, background: "#C3C8D1" }} />
        </div>
      </div>
      {/* cuerpo */}
      <div style={{ position: "absolute", left: 125, top: 110, width: 270, height: 350, borderRadius: 40, background: "#2A3140", border: `7px solid ${OSC}`, boxSizing: "border-box", transform: `translateX(${tiembla}px)`, zIndex: 1 }}>
        <div style={{ position: "absolute", left: 50, top: -9, width: 156, height: 16, borderRadius: 8, background: OSC }} />
        <div style={{ position: "absolute", left: 28, top: 32, width: 200, height: 112, borderRadius: 16, background: den ? C.acento : "#CFE3E8", border: `5px solid ${OSC}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: den ? 30 : 34, color: OSC, letterSpacing: 1 }}>
          {den ? "DENEGADA" : mete > 0.9 ? "…" : "PAGAR"}
        </div>
        <div style={{ position: "absolute", left: 40, top: 168, display: "grid", gridTemplateColumns: "repeat(3, 44px)", gap: "14px 22px" }}>
          {Array.from({ length: 9 }, (_, k) => (
            <div key={k} style={{ width: 44, height: 30, borderRadius: 9, background: "#4A5263" }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── máquina de turnos (429) ───────────────────────────────────────────────────────────────────────────────────────
export const Turnos: React.FC<{ t: number; rapido: number; para: number; sigue: number }> = ({ t, rapido, para, sigue }) => {
  const tickets: { at: number; n: number; ok?: boolean }[] = [];
  for (let k = 0; rapido + k * 0.16 < para; k++) tickets.push({ at: rapido + k * 0.16, n: 37 + k });
  const ultimo = 37 + tickets.length;
  tickets.push({ at: sigue + 0.15, n: ultimo, ok: true });
  const espera = t > para && t < sigue + 0.15;
  const golpe = t > para ? Math.sin((t - para) * 40) * Math.exp(-(t - para) * 6) * 7 : 0;
  return (
    <div style={{ position: "relative", width: 640, height: 420 }}>
      {tickets.map((k, i) => {
        const u = t - k.at;
        if (u < 0) return null;
        if (k.ok) {
          const p = sp(t, k.at, { damping: 13, stiffness: 120 });
          return (
            <div key={i} style={{ position: "absolute", left: 250, top: 300, transform: `translate(${p * 150}px, ${p * 10}px) rotate(${p * 6}deg)`, zIndex: 2 }}>
              <Ticket n={k.n} ok />
            </div>
          );
        }
        // salen disparados con parábola y se apilan fuera de cuadro
        const lado = i % 2 === 0 ? 1 : -1;
        const vx = lado * (160 + rand(i) * 160);
        const tx = Math.min(u, 1.2);
        const y = 300 - 260 * tx + 520 * tx * tx;
        const op = 1 - clamp01((u - 0.7) / 0.4);
        if (op <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 250, top: y, opacity: op, transform: `translateX(${vx * tx}px) rotate(${lado * u * 260}deg)`, zIndex: 0 }}>
            <Ticket n={k.n} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 190, top: 20, width: 260, height: 300, borderRadius: 36, background: C.acento, border: `7px solid ${OSC}`, boxSizing: "border-box", transform: `rotate(${golpe * 0.4}deg) translateX(${golpe}px)`, zIndex: 1 }}>
        <div style={{ position: "absolute", left: 26, top: 26, width: 194, height: 104, borderRadius: 14, background: espera ? BLANCO : OSC, border: `5px solid ${OSC}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: espera ? 36 : 52, color: espera ? OSC : C.acento }}>
          {espera ? "ESPERE" : String(t < rapido ? 37 : Math.min(ultimo, 37 + Math.floor(Math.max(0, t - rapido) / 0.16)))}
        </div>
        <div style={{ position: "absolute", left: 30, top: 160, fontFamily: TITULO, fontWeight: 800, fontSize: 30, color: OSC, letterSpacing: 2 }}>SU TURNO</div>
        <div style={{ position: "absolute", left: 40, top: 238, width: 166, height: 20, borderRadius: 10, background: OSC }} />
      </div>
    </div>
  );
};

const Ticket: React.FC<{ n: number; ok?: boolean }> = ({ n, ok }) => (
  <div style={{ width: 136, height: 84, borderRadius: 10, background: BLANCO, border: `5px solid ${OSC}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: MONO, fontWeight: 700, fontSize: 36, color: OSC }}>
    {n}
    {ok && <Check s={40} p={1} />}
  </div>
);

// ── servidor (529 / 500) ──────────────────────────────────────────────────────────────────────────────────────────
export const Servidor: React.FC<{ t: number; averia?: number; aforo?: number }> = ({ t, averia = Infinity, aforo = Infinity }) => {
  const roto = t > averia;
  const lleno = ramp(t, aforo, aforo + 1.2, EASE);
  return (
    <div style={{ position: "relative", width: 300, height: 400 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 300, height: 400, borderRadius: 30, background: "#1B202B", border: `7px solid ${OSC}`, boxSizing: "border-box", boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} style={{ position: "absolute", left: 22, top: 26 + k * 88, width: 242, height: 66, borderRadius: 14, background: "#2A3140", border: `4px solid ${OSC}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 12, padding: "0 18px" }}>
            {[0, 1, 2].map((j) => {
              const on = roto ? Math.floor(t * 9 + k * 3 + j) % 7 === 0 : Math.floor(t * (3 + lleno * 9) + k * 2 + j * 3) % 3 !== 0;
              return <div key={j} style={{ width: 16, height: 16, borderRadius: "50%", background: on ? (roto ? C.acento : lleno > 0.6 ? C.acento : "#F0A989") : "#4A5263", boxShadow: on ? `0 0 12px ${C.acento}` : "none" }} />;
            })}
            <div style={{ flex: 1 }} />
            <div style={{ width: 56, height: 10, borderRadius: 5, background: "#4A5263" }} />
          </div>
        ))}
      </div>
      {roto && <Chispas t={t} at={averia} x={230} y={120} />}
    </div>
  );
};

/** Indicador de aforo (barra vertical que se llena hasta el 100 %). */
export const Aforo: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const p = ramp(t, at, at + 1.2, EASE);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ width: 70, height: 300, borderRadius: 20, background: "#1B202B", border: `5px solid ${C.borde}`, boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${p * 100}%`, background: C.acento, boxShadow: `0 0 30px ${C.acento}` }} />
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 36, color: p > 0.98 ? C.acento : C.texto, whiteSpace: "nowrap" }}>{Math.round(p * 100)} %</div>
    </div>
  );
};

/** Personitas que llegan y hacen cola. */
export const Cola: React.FC<{ t: number; at: number; n?: number }> = ({ t, at, n = 6 }) => (
  <div style={{ position: "relative", width: n * 78, height: 170 }}>
    {Array.from({ length: n }, (_, k) => {
      const s = sp(t, at + k * 0.16, { damping: 12, stiffness: 160 });
      if (s <= 0) return null;
      const bote = Math.abs(Math.sin(t * 5 + k)) * 6;
      return (
        <div key={k} style={{ position: "absolute", left: k * 78, bottom: bote, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * -160}px)` }}>
          <svg width={64} height={150} viewBox="0 0 64 150">
            <circle cx={32} cy={28} r={22} fill={k % 3 === 0 ? "#F0A989" : "#8C93A3"} stroke={OSC} strokeWidth={5} />
            <path d="M 6 146 L 6 84 A 26 26 0 0 1 58 84 L 58 146 Z" fill={k % 3 === 0 ? C.acento : "#4A5263"} stroke={OSC} strokeWidth={5} />
          </svg>
        </div>
      );
    })}
  </div>
);

const Chispas: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => (
  <svg style={{ position: "absolute", left: x - 90, top: y - 90, overflow: "visible" }} width={180} height={180}>
    {Array.from({ length: 8 }, (_, k) => {
      const ciclo = ((t - at) * 2.2 + rand(k) ) % 1;
      const a = (k / 8) * Math.PI * 2 + rand(k + 3);
      const r0 = 20 + ciclo * 50;
      const r1 = r0 + 26 * (1 - ciclo);
      return <line key={k} x1={90 + Math.cos(a) * r0} y1={90 + Math.sin(a) * r0} x2={90 + Math.cos(a) * r1} y2={90 + Math.sin(a) * r1} stroke={k % 2 ? "#FFD27A" : C.acento} strokeWidth={7} strokeLinecap="round" opacity={1 - ciclo} />;
    })}
  </svg>
);

/** Llave inglesa (avería). */
export const LlaveInglesa: React.FC<{ s?: number; rot?: number }> = ({ s = 170, rot = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ transform: `rotate(${rot}deg)` }}>
    <path d="M 66 10 A 22 22 0 0 0 46 40 L 12 74 A 9 9 0 0 0 26 88 L 60 54 A 22 22 0 0 0 90 34 L 76 40 L 64 36 L 60 24 L 66 10 Z" fill={BLANCO} stroke={OSC} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

// ── reloj de arena (PASO 3) ───────────────────────────────────────────────────────────────────────────────────────
export const RelojArena: React.FC<{ t: number; at: number; s?: number }> = ({ t, at, s = 200 }) => {
  const ciclo = 1.3;
  const k = Math.max(0, Math.floor((t - at) / ciclo));
  const giro = (k + sp(t, at + k * ciclo, { damping: 12, stiffness: 140 })) * 180;
  const u = clamp01(((t - at) % ciclo) / ciclo);
  return (
    <svg width={s} height={s * 1.3} viewBox="0 0 100 130" style={{ transform: `rotate(${giro}deg)` }}>
      <path d="M 18 8 L 82 8 M 18 122 L 82 122" stroke={BLANCO} strokeWidth={7} strokeLinecap="round" />
      <path d="M 24 10 C 24 46 46 52 46 65 C 46 78 24 84 24 120 L 76 120 C 76 84 54 78 54 65 C 54 52 76 46 76 10 Z" fill="none" stroke={BLANCO} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${30 + u * 12} ${18 + u * 30} L ${70 - u * 12} ${18 + u * 30} L 52 60 L 48 60 Z`} fill={C.acento} />
      <path d={`M 30 116 L 70 116 L ${60 - u * 6} ${116 - u * 30} L ${40 + u * 6} ${116 - u * 30} Z`} fill={C.acento} />
      <line x1={50} y1={62} x2={50} y2={114} stroke={C.acento} strokeWidth={2.5} strokeDasharray="3 4" />
    </svg>
  );
};

// ── carpeta de proyecto ───────────────────────────────────────────────────────────────────────────────────────────
export const Carpeta: React.FC<{ s?: number }> = ({ s = 180 }) => (
  <svg width={s} height={s * 0.8} viewBox="0 0 100 80">
    <path d="M 6 14 A 6 6 0 0 1 12 8 L 38 8 L 46 16 L 88 16 A 6 6 0 0 1 94 22 L 94 70 A 6 6 0 0 1 88 76 L 12 76 A 6 6 0 0 1 6 70 Z" fill={C.acento} stroke={OSC} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 6 30 L 94 30" stroke={OSC} strokeWidth={4} />
  </svg>
);

// ── aviso de error del gancho ─────────────────────────────────────────────────────────────────────────────────────
export const AvisoError: React.FC<{ w: number; t: number; numero?: string; enfoque?: number; seed?: number }> = ({ w, t, numero, enfoque = 0, seed = 0 }) => {
  const s = w / 860;
  // dígitos que ruedan (borrosos) hasta que se enfocan
  const rueda = [0, 1, 2].map((k) => String(Math.floor(rand(Math.floor(t * 14) + k * 17 + seed) * 10))).join("");
  const txt = enfoque > 0.5 && numero ? numero : rueda;
  return (
    <div style={{ width: w, height: 190 * s, borderRadius: 26 * s, background: "#151A23", border: `${3 * s}px solid ${C.acento}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 28 * s, padding: `0 ${34 * s}px`, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 ${40 * s}px ${C.acento}44`, overflow: "hidden" }}>
      <svg width={92 * s} height={84 * s} viewBox="0 0 24 22">
        <path d="M 12 1.5 L 23 20.5 L 1 20.5 Z" fill={C.acento} stroke={OSC} strokeWidth={1.2} strokeLinejoin="round" />
        <path d="M 12 8 L 12 13.5" stroke={OSC} strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={12} cy={17} r={1.4} fill={OSC} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 * s }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 50 * s, color: C.texto, whiteSpace: "nowrap" }}>
          API Error ·{" "}
          <span style={{ display: "inline-block", color: C.acento, filter: `blur(${(1 - enfoque) * 7 * s}px)`, minWidth: 96 * s }}>{txt}</span>
        </div>
        <div style={{ display: "flex", gap: 12 * s }}>
          {[220, 140, 180].map((ww, k) => (
            <div key={k} style={{ width: ww * s, height: 14 * s, borderRadius: 7 * s, background: "#4A5263" }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── tecla Esc ─────────────────────────────────────────────────────────────────────────────────────────────────────
export const TeclaEsc: React.FC<{ t: number; pulsa: number; s?: number }> = ({ t, pulsa, s = 260 }) => {
  const k = t - pulsa;
  const hunde = k > 0 && k < 0.35 ? Math.sin((k / 0.35) * Math.PI) : 0;
  return (
    <div style={{ width: s, height: s * 0.9, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: s * 0.1, width: s, height: s * 0.8, borderRadius: s * 0.14, background: "#7A3E2C", border: `${s * 0.025}px solid ${OSC}`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: 0, top: s * 0.1 * hunde, width: s, height: s * 0.8, borderRadius: s * 0.14, background: C.acento, border: `${s * 0.025}px solid ${OSC}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: s * 0.3, color: OSC, boxShadow: hunde > 0 ? `0 0 ${s * 0.4}px ${C.acento}` : "none" }}>
        Esc
      </div>
    </div>
  );
};

// ── iconos pequeños (trazo) ───────────────────────────────────────────────────────────────────────────────────────
type IcoProps = { s?: number; color?: string };
const svgIco = (path: React.ReactNode) => ({ s = 64, color = BLANCO }: IcoProps) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);
export const IcoConexion = svgIco(<><path d="M9 3 V8 M15 3 V8" /><path d="M6 8 H18 V12 A6 6 0 0 1 6 12 Z" /><path d="M12 18 V22" /></>);
export const IcoCuenta = svgIco(<><circle cx={12} cy={8} r={4} /><path d="M4 21 A8 8 0 0 1 20 21" /></>);
export const IcoLupa = svgIco(<><circle cx={10.5} cy={10.5} r={6.5} /><path d="M15.5 15.5 L21 21" /></>);
export const IcoRepite = svgIco(<><path d="M4 12 A8 8 0 0 1 18.5 7.5" /><path d="M19 3 V8 H14" /><path d="M20 12 A8 8 0 0 1 5.5 16.5" /><path d="M5 21 V16 H10" /></>);
export const IcoRamas = svgIco(<><path d="M6 21 V13 C6 9 9 8 12 8 H18" /><path d="M15 5 L18 8 L15 11" /><path d="M6 13 C6 16 9 17 11 19" /></>);
export const IcoAtasca = svgIco(<><rect x={2.5} y={9} width={19} height={6} rx={3} /><path d="M3.5 12 H11" strokeWidth={3.4} /><path d="M15 4 V7 M18 5 L16.5 7.2 M12 5 L13.5 7.2" /></>);
export const IcoReintentar = svgIco(<><path d="M20 12 A8 8 0 1 1 17 5.8" /><path d="M20 3 V8 H15" /></>);
export const IcoEnlace = svgIco(<><path d="M10 14 A4 4 0 0 0 15.6 14 L19 10.6 A4 4 0 0 0 13.4 5 L12 6.4" /><path d="M14 10 A4 4 0 0 0 8.4 10 L5 13.4 A4 4 0 0 0 10.6 19 L12 17.6" /></>);

/** Burbuja redonda de icono (fondo panel, borde de acento). */
export const Burbuja: React.FC<{ s?: number; activa?: number; children: React.ReactNode }> = ({ s = 130, activa = 1, children }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: C.panel2, border: `5px solid ${activa > 0.5 ? C.acento : C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: activa > 0.5 ? `0 0 ${s * 0.3}px ${C.acento}55` : "none" }}>
    {children}
  </div>
);

/** Píldora con icono y texto. */
export const Pildora: React.FC<{ texto: string; icono?: React.ReactNode; size?: number; activa?: number }> = ({ texto, icono, size = 44, activa = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.4, padding: `${size * 0.3}px ${size * 0.62}px`, borderRadius: 999, background: activa > 0.5 ? C.acento : C.panel2, border: `4px solid ${C.acento}`, fontFamily: TITULO, fontWeight: 800, fontSize: size, color: activa > 0.5 ? OSC : C.texto, whiteSpace: "nowrap", boxShadow: activa > 0.5 ? `0 12px 40px ${C.acento}55` : "none" }}>
    {icono}
    {texto}
  </div>
);

export { BLANCO, OSC };
export const EaseUsado = EASE;
