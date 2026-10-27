import React from "react";
import { clamp, COLORS, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, keys, lerp, prog, vis } from "./anim";
import { T, toScreen } from "./timeline";
import { BRAND, Logo } from "./Logo";
import { card, enter, Icon } from "./ui";

/* ---------- Interior del ámbar: camarero, libreta y teléfono ---------- */
export const Interior: React.FC<{ t: number }> = ({ t }) => {
  const v = vis(t, T.s11, T.s12 + 0.15, 0.3, 0.22);
  if (v <= 0) return null;
  const e = prog(t, T.s11, 0.35);
  const ringing = t > T.s11phone ? 1 : 0;
  const shake = ringing * Math.sin(t * 70) * 5 * (Math.sin(t * 6) > -0.3 ? 1 : 0.2);
  const scribble = prog(t, T.s11 + 0.1, 0.9, (p) => p);
  const msgs = [0, 1, 2].map((i) => prog(t, T.s11msgs + i * 0.15, 0.22, easeOutBack));
  const lampFlicker = 0.75 + 0.25 * Math.sin(t * 17) * Math.sin(t * 5.3);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 640,
        width: 920,
        height: 820,
        borderRadius: 48,
        overflow: "hidden",
        opacity: v,
        scale: `${0.88 + 0.12 * e}`,
        filter: `blur(${(1 - e) * 14}px)`,
        boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 0 2px ${COLORS.amber}44`,
      }}
    >
      <svg width={920} height={820} viewBox="0 0 920 820">
        <defs>
          <radialGradient id="intLamp" cx="0.5" cy="0.18" r="0.7">
            <stop offset="0%" stopColor="#E8B062" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#2A1A0C" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="intWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#24180E" />
            <stop offset="100%" stopColor="#120C07" />
          </linearGradient>
        </defs>
        <rect width={920} height={820} fill="url(#intWall)" />
        <rect width={920} height={820} fill="url(#intLamp)" opacity={lampFlicker} />
        {/* lámpara colgante */}
        <line x1={460} y1={0} x2={460} y2={110} stroke="#3A2A18" strokeWidth={4} />
        <path d="M410 150 Q460 90 510 150 Z" fill="#3A2A18" />
        <ellipse cx={460} cy={152} rx={22} ry={8} fill="#FFD08A" opacity={lampFlicker} />
        {/* estantería */}
        <rect x={80} y={230} width={300} height={10} fill="#3A2A18" />
        {[100, 140, 175, 220, 260, 300, 335].map((x, i) => (
          <rect key={x} x={x} y={175 + (i % 2) * 10} width={22} height={55 - (i % 2) * 10} rx={6} fill={i % 3 === 0 ? "#5A3E1E" : "#3D2C1A"} />
        ))}
        {/* mostrador */}
        <rect x={0} y={600} width={920} height={220} fill="#1A120B" />
        <rect x={0} y={590} width={920} height={20} fill="#3A2A18" />
        {/* camarero */}
        <g transform="translate(300 300)">
          <ellipse cx={0} cy={300} rx={90} ry={16} fill="rgba(0,0,0,0.5)" />
          <rect x={-60} y={70} width={120} height={230} rx={50} fill="#E7E2DA" />
          <rect x={-50} y={150} width={100} height={150} rx={20} fill="#2A2420" />
          <circle cx={0} cy={20} r={48} fill="#D9B38C" />
          <path d="M-48 10 Q0 -50 48 10 Q30 -20 -48 10" fill="#2A1E14" />
          {/* brazo y libreta */}
          <rect x={30} y={110} width={110} height={30} rx={15} fill="#E7E2DA" transform="rotate(-25 30 110)" />
          <g transform={`translate(120 40) rotate(${-8 + Math.sin(t * 3) * 2})`}>
            <rect x={0} y={0} width={150} height={190} rx={10} fill="#F2E6CF" />
            <rect x={0} y={0} width={150} height={20} rx={8} fill="#B3542E" />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const p = clamp(scribble * 6 - i);
              return <path key={i} d={`M16 ${44 + i * 24} q 14 -8 28 0 t 28 0 t 28 0 t 28 0`} stroke="#5B4B3A" strokeWidth={3} fill="none" strokeDasharray={120} strokeDashoffset={120 * (1 - p)} />;
            })}
            <line x1={14} y1={92} x2={130} y2={80} stroke="#B3542E" strokeWidth={4} opacity={clamp(scribble * 3 - 2)} />
          </g>
          <rect x={250} y={60} width={10} height={120} rx={4} fill="#E2B04A" transform={`rotate(${30 + Math.sin(t * 9) * 6} 255 120)`} />
        </g>
        {/* teléfono fijo sonando */}
        <g transform={`translate(700 ${520}) rotate(${shake * 0.8})`}>
          <rect x={-90} y={0} width={180} height={80} rx={20} fill="#2E2318" stroke={COLORS.amber} strokeOpacity={0.5} strokeWidth={3} />
          <path d={`M-100 ${-10 - Math.abs(shake) * 2} q 100 -50 200 0 l -20 30 q -80 -30 -160 0 z`} fill="#3D2E1F" stroke={COLORS.amber} strokeOpacity={0.6} strokeWidth={3} />
          {[0, 1, 2].map((i) => {
            const k = ((t * 1.6 + i / 3) % 1);
            return ringing ? (
              <path key={i} d={`M ${-120 - k * 60} ${-30 - k * 40} q ${-30} 40 0 80 M ${120 + k * 60} ${-30 - k * 40} q 30 40 0 80`} stroke={COLORS.amber} strokeWidth={5} fill="none" strokeLinecap="round" opacity={(1 - k) * 0.9} />
            ) : null;
          })}
        </g>
        {/* móvil con mensajes sin leer */}
        <g transform="translate(560 600)">
          <rect x={-40} y={-10} width={110} height={30} rx={10} fill="#0E0F12" transform="skewX(-30)" />
          {msgs.map((m, i) => (
            <g key={i} opacity={clamp(m)} transform={`translate(${-60 + i * 16} ${-90 - i * 72}) scale(${0.7 + 0.3 * m})`}>
              <rect x={0} y={0} width={290} height={60} rx={18} fill="#2B2620" stroke="rgba(255,255,255,0.08)" />
              <circle cx={30} cy={30} r={9} fill={COLORS.amber} />
              <rect x={52} y={20} width={150} height={10} rx={5} fill="#7E7466" />
              <rect x={52} y={36} width={100} height={8} rx={4} fill="#5A5248" />
            </g>
          ))}
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", gap: 14 }}>
        {[
          ["Libreta", T.s11 + 0.05],
          ["Teléfono sonando", T.s11phone],
          ["Mensajes sin leer", T.s11msgs],
        ].map(([label, at]) => (
          <div key={label as string} style={{ ...enter(t, at as number, 14, 0.3), padding: "10px 18px", borderRadius: 16, background: "rgba(217,151,58,0.14)", border: `1.5px solid ${COLORS.amber}88`, color: "#F0C07A", fontSize: 24, fontWeight: 700 }}>
            {label as string}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- 23:00 y mensajes sin respuesta ---------- */
export const LateNight: React.FC<{ t: number }> = ({ t }) => {
  const v = vis(t, T.s12 + 0.05, T.s13 + 0.55, 0.3, 0.22);
  if (v <= 0) return null;
  const minutes = keys(t, [[T.s12 + 0.1, -6], [T.s12 + 0.8, 0]], easeOutCubic);
  const hourA = ((23 + minutes / 60) % 12) * 30;
  const minA = (minutes * 6 + 360) % 360;
  const none = prog(t, T.s12none, 0.4);
  const ce = prog(t, T.s12 + 0.05, 0.35, easeOutBack);
  const bubbles: [string, number, string][] = [
    ["¿Hay mesa mañana?", T.s12q1, "23:00"],
    ["Somos 8, ¿hay sitio?", T.s12q2, "23:01"],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: v }}>
      <div style={{ position: "absolute", left: 540 - 150, top: 650, width: 300, height: 300, scale: `${0.7 + 0.3 * ce}`, filter: `blur(${(1 - clamp(ce)) * 12}px)`, opacity: clamp(ce) }}>
        <svg width={300} height={300} viewBox="0 0 300 300">
          <circle cx={150} cy={150} r={140} fill="#16120D" stroke={COLORS.amber} strokeWidth={8} />
          <circle cx={150} cy={150} r={150} fill="none" stroke={COLORS.amber} strokeOpacity={0.25} strokeWidth={14} />
          {new Array(12).fill(0).map((_, i) => (
            <rect key={i} x={147} y={24} width={6} height={i % 3 === 0 ? 26 : 14} rx={3} fill="#C9B79A" transform={`rotate(${i * 30} 150 150)`} />
          ))}
          <rect x={144} y={70} width={12} height={84} rx={6} fill="#F2E6CF" transform={`rotate(${hourA} 150 150)`} />
          <rect x={146} y={40} width={8} height={114} rx={4} fill={COLORS.amber} transform={`rotate(${minA} 150 150)`} />
          <circle cx={150} cy={150} r={10} fill="#F2E6CF" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1010, display: "flex", flexDirection: "column", gap: 22 }}>
        {bubbles.map(([text, at, time]) => (
          <div key={text} style={{ ...enter(t, at, 30), alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 6, opacity: Math.min(prog(t, at, 0.3), 1 - 0.45 * none) }}>
            <div style={{ padding: "22px 30px", borderRadius: 30, borderBottomLeftRadius: 8, background: "#2A2621", color: COLORS.white, fontSize: 36, fontWeight: 700, border: "1.5px solid rgba(255,255,255,0.07)" }}>{text}</div>
            <div style={{ fontSize: 22, color: COLORS.muted, fontWeight: 600, paddingLeft: 12 }}>{time} · ✓</div>
          </div>
        ))}
        <div style={{ ...enter(t, T.s12none, 16), display: "flex", alignItems: "center", gap: 14, marginTop: 12, color: "#F0C07A", fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: COLORS.amber, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 4)) }} />
          Sin respuesta
        </div>
      </div>
    </div>
  );
};

/* ---------- La burbuja viaja del ámbar al verde ---------- */
export const TravelBubble: React.FC<{ t: number }> = ({ t }) => {
  const start = T.s13 + 0.55;
  const dur = 0.8;
  const v = vis(t, T.s13 + 0.45, T.s14a + 0.1, 0.2, 0.3);
  if (v <= 0) return null;
  const p = prog(t, start, dur, easeInOutCubic);
  const from = toScreen(t, 3.0, 2.3, 1.1);
  const to = toScreen(t, 0.1, -2.1, 1.2);
  const x = lerp(from[0], to[0], p);
  const y = lerp(from[1], to[1], p) - Math.sin(Math.PI * p) * 260;
  const arrived = prog(t, start + dur, 0.35, easeOutBack);
  const col = p > 0.6 ? COLORS.lime : "#2A2621";
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: v }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          translate: "-50% -100%",
          padding: "20px 28px",
          borderRadius: 30,
          background: col,
          color: p > 0.6 ? COLORS.ink : COLORS.white,
          fontSize: 34,
          fontWeight: 800,
          whiteSpace: "nowrap",
          scale: `${1 - 0.25 * Math.sin(Math.PI * p) * 0.5}`,
          boxShadow: p > 0.6 ? `0 0 50px ${COLORS.lime}88` : "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        {arrived > 0 ? (
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ scale: `${arrived}`, display: "inline-block" }}>
              <Icon name="check" size={34} color={COLORS.ink} stroke={11} />
            </span>
            Reservado
          </span>
        ) : (
          "¿Hay mesa mañana?"
        )}
      </div>
      {arrived > 0 ? (
        <div
          style={{
            position: "absolute",
            left: to[0],
            top: to[1] + 60,
            width: 40 + 500 * arrived,
            height: (40 + 500 * arrived) * 0.58,
            translate: "-50% -50%",
            borderRadius: "50%",
            border: `4px solid ${COLORS.lime}`,
            opacity: 1 - clamp(arrived),
          }}
        />
      ) : null}
    </div>
  );
};

/* ---------- Iconos de procesos sobre el restaurante verde ---------- */
const PROCESSES: [string, string][] = [
  ["calendar", "Reservas"],
  ["bag", "Pedidos"],
  ["truck", "Proveedores"],
  ["clock", "Turnos"],
  ["invoice", "Facturas"],
];

export const ProcessIcons: React.FC<{ t: number }> = ({ t }) => {
  const off = prog(t, T.s15 + 0.1, 0.6, easeInCubic);
  if (t < T.icons[0] - 0.1 || off >= 1) return null;
  const anchor = toScreen(t, 0, -2.25, 1.1);
  const R = 360;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {PROCESSES.map((_, i) => {
          const a = Math.PI * (1.08 + (i / 4) * 0.84);
          const e = prog(t, T.icons[i], 0.4);
          const px = anchor[0] + Math.cos(a) * R * (0.4 + 0.6 * e);
          const py = anchor[1] + Math.sin(a) * R * 0.95 * (0.4 + 0.6 * e);
          return (
            <line key={i} x1={anchor[0]} y1={anchor[1]} x2={px} y2={py} stroke={COLORS.lime} strokeWidth={3} strokeDasharray="8 10" strokeDashoffset={-t * 40} opacity={e * (1 - off) * 0.8} />
          );
        })}
      </svg>
      {PROCESSES.map(([icon, label], i) => {
        const a = Math.PI * (1.08 + (i / 4) * 0.84);
        const e = prog(t, T.icons[i], 0.4, easeOutBack);
        const ec = clamp(e);
        if (ec <= 0) return null;
        const px = anchor[0] + Math.cos(a) * R * (0.4 + 0.6 * ec);
        const py = anchor[1] + Math.sin(a) * R * 0.95 * (0.4 + 0.6 * ec);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: px,
              top: py,
              translate: "-50% -50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              opacity: ec * (1 - off),
              scale: `${(0.5 + 0.5 * e) * (1 - 0.4 * off)}`,
              filter: `blur(${(1 - ec) * 10 + off * 10}px)`,
            }}
          >
            <div
              style={{
                width: 132,
                height: 132,
                borderRadius: 66,
                background: "rgba(16,20,10,0.88)",
                border: `3px solid ${COLORS.lime}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 40px ${COLORS.lime}55`,
              }}
            >
              <Icon name={icon} size={70} stroke={6} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.white, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Comenta AUDITORIA ---------- */
export const CommentBox: React.FC<{ t: number }> = ({ t }) => {
  const v = vis(t, T.s16 + 0.1, T.close + 0.2, 0.4, 0.35);
  if (v <= 0) return null;
  const e = prog(t, T.s16 + 0.1, 0.5);
  const word = "AUDITORIA";
  const n = Math.floor(clamp((t - T.s16type[0]) / (T.s16type[1] - T.s16type[0])) * word.length + 0.0001);
  const typed = word.slice(0, n);
  const ready = t >= T.s16publish - 0.2;
  const press = Math.sin(Math.PI * clamp((t - T.s16publish) / 0.25));
  const posted = prog(t, T.s16publish + 0.25, 0.4, easeOutBack);
  const caret = Math.floor(t * 2.2) % 2 === 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1060,
        opacity: v,
        filter: `blur(${(1 - e) * 14}px)`,
        translate: `0 ${(1 - e) * 120}px`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: -70, position: "relative", zIndex: 1 }}>
        <Logo size={150} draw={prog(t, T.s16 + 0.2, 0.7, (p) => p)} />
      </div>
      <div style={{ ...card, padding: "84px 30px 34px" }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.muted, textAlign: "center", marginBottom: 22 }}>Comentarios</div>
        {posted > 0 ? (
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 24, opacity: clamp(posted), scale: `${0.8 + 0.2 * posted}`, filter: `blur(${(1 - clamp(posted)) * 8}px)` }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: "#3A3F48", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="user" size={38} color={COLORS.white} stroke={8} />
            </div>
            <div>
              <div style={{ fontSize: 24, color: COLORS.muted, fontWeight: 600 }}>tu_restaurante · ahora</div>
              <div style={{ fontSize: 36, color: COLORS.white, fontWeight: 800, letterSpacing: "0.04em" }}>AUDITORIA</div>
            </div>
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#3A3F48", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="user" size={38} color={COLORS.white} stroke={8} />
          </div>
          <div
            style={{
              flex: 1,
              height: 84,
              borderRadius: 42,
              border: `2px solid ${n > 0 && posted <= 0 ? COLORS.lime : "rgba(255,255,255,0.14)"}`,
              display: "flex",
              alignItems: "center",
              padding: "0 26px",
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: "0.04em",
              color: COLORS.white,
            }}
          >
            {posted > 0 ? (
              <span style={{ color: "#6B717B", fontWeight: 600, letterSpacing: 0, fontSize: 28 }}>Añade un comentario…</span>
            ) : n === 0 ? (
              <span style={{ color: "#6B717B", fontWeight: 600, letterSpacing: 0, fontSize: 28 }}>
                {caret ? <span style={{ color: COLORS.lime }}>|</span> : <span style={{ opacity: 0 }}>|</span>}Añade un comentario…
              </span>
            ) : (
              <span>
                {typed}
                <span style={{ color: COLORS.lime, opacity: caret ? 1 : 0 }}>|</span>
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: ready ? COLORS.ink : "#5A606A",
              background: ready ? COLORS.lime : "transparent",
              padding: "16px 24px",
              borderRadius: 24,
              scale: `${1 - 0.1 * (t > T.s16publish ? press : 0)}`,
              boxShadow: ready ? `0 0 36px ${COLORS.lime}77` : "none",
            }}
          >
            Publicar
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Revelado del logo ---------- */
export const BrandReveal: React.FC<{ t: number }> = ({ t }) => {
  const v = vis(t, T.s14brand, T.s14b + 0.1, 0.25, 0.25);
  if (v <= 0) return null;
  const d = prog(t, T.s14brand, 0.9, (p) => p);
  const e = prog(t, T.s14brand, 0.4, easeOutBack);
  const out = prog(t, T.s14b - 0.15, 0.25, easeInCubic);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 260,
        top: 760,
        opacity: v,
        scale: `${(0.6 + 0.4 * e) * (1 + 0.3 * out)}`,
        filter: `blur(${(1 - clamp(e)) * 14 + out * 16}px)`,
      }}
    >
      <div style={{ position: "absolute", inset: -120, borderRadius: "50%", background: `radial-gradient(circle, ${BRAND.orange}33, transparent 65%)` }} />
      <Logo size={520} draw={d} />
    </div>
  );
};

/* Oscurecimiento del mundo cuando hay una tarjeta delante (legibilidad) */
export const dimAmount = (t: number) =>
  Math.max(
    0.42 * vis(t, T.s3, T.s10 + 0.2, 0.35, 0.3),
    0.5 * vis(t, T.s11, T.s12 + 0.2, 0.3, 0.25),
    0.3 * vis(t, T.s12 + 0.1, T.s13 + 0.5, 0.3, 0.25),
    0.35 * vis(t, T.s14brand, T.s14b + 0.15, 0.3, 0.25),
    0.4 * vis(t, T.s16, T.close + 0.2, 0.5, 0.4),
  );

