import React from "react";
import { clamp, COLORS, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, float, lerp, prog, pulse, vis } from "../reel/anim";
import { CommentCard } from "../reel/CommentCard";
import { BRAND, Logo } from "../reel/Logo";
import { card, enter, Icon } from "../reel/ui";
import { SOLVE } from "./Salon";
import { A, CLOSE, END, toScreen } from "./timeline";

const W = 940;
const LEFT = (1080 - W) / 2;

const Avatar: React.FC<{ letter: string; color?: string }> = ({ letter, color = "#3A3F48" }) => (
  <div style={{ width: 58, height: 58, borderRadius: 29, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: COLORS.white, flexShrink: 0 }}>
    {letter}
  </div>
);

/* ---------- Mensaje de la clienta (sin contestar) que acaba en otro sitio ---------- */
export const ClientMessage: React.FC<{ t: number }> = ({ t }) => {
  const v = vis(t, A.clienta, A.web + 0.3, 0.3, 0.3);
  if (v <= 0) return null;
  const e = prog(t, A.clienta, 0.4, easeOutBack);
  // al tardar, la tarjeta se encoge en burbuja y vuela al salón de enfrente
  const fly = prog(t, A.tardas + 0.25, A.otrositio - A.tardas - 0.1, easeInOutCubic);
  const to = toScreen(t, 11.1, 4.2, 1.2);
  const from: [number, number] = [540, 830];
  const x = lerp(from[0], to[0], fly);
  const y = lerp(from[1], to[1], fly) - Math.sin(Math.PI * fly) * 220;
  const sc = lerp(1, 0.42, fly);
  const minutes = Math.max(1, Math.min(9, Math.floor((t - A.nopuedes) / 0.28) + 1));
  const waiting = prog(t, A.nopuedes, 0.3);
  const won = prog(t, A.otrositio, 0.35, easeOutBack);
  const f = float(t, 6, 0.8);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: v }}>
      <div
        style={{
          position: "absolute",
          left: x - W / 2 + f.x * (1 - fly),
          top: y - 150 + f.y * (1 - fly),
          width: W,
          scale: `${(0.8 + 0.2 * e) * sc}`,
          rotate: `${f.rot * (1 - fly) + fly * 8}deg`,
          filter: `blur(${(1 - clamp(e)) * 12}px)`,
          opacity: 1 - clamp((fly - 0.85) * 6),
        }}
      >
        <div style={{ ...card, padding: 30, border: `2px solid ${COLORS.amber}66` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar letter="L" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.white }}>Laura</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.muted }}>Mensaje · ahora</div>
            </div>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: COLORS.amber, boxShadow: `0 0 20px ${COLORS.amber}` }} />
          </div>
          <div style={{ marginTop: 20, padding: "22px 26px", borderRadius: 26, borderBottomLeftRadius: 8, background: "#262A31", color: COLORS.white, fontSize: 36, fontWeight: 700, lineHeight: 1.25 }}>
            ¿Puedo cambiar mi cita de las 17:00 a las 18:30?
          </div>
          <div style={{ marginTop: 18, height: 40, display: "flex", alignItems: "center", gap: 12, opacity: waiting, color: "#F0C07A", fontSize: 26, fontWeight: 700 }}>
            <Icon name="clock" size={30} color="#F0C07A" stroke={8} />
            Sin responder · {minutes} min
          </div>
        </div>
      </div>
      {won > 0 ? (
        <div
          style={{
            position: "absolute",
            left: to[0],
            top: to[1] - 40,
            translate: "-50% -100%",
            scale: `${won}`,
            padding: "16px 24px",
            borderRadius: 22,
            background: "#E8EEFF",
            color: COLORS.ink,
            fontSize: 30,
            fontWeight: 800,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 0 50px rgba(221,231,255,0.5)",
          }}
        >
          <Icon name="check" size={30} color={COLORS.ink} stroke={11} />
          Reservado en otro sitio
        </div>
      ) : null}
    </div>
  );
};

/* ---------- Panel del agente: lee, agenda, confirma, cambia y rellena huecos ---------- */
const ROW_H = 104;
const ROWS = ["16:00", "17:00", "18:30", "19:30"];

const Block: React.FC<{ name: string; service: string; active?: boolean; style?: React.CSSProperties; tag?: React.ReactNode }> = ({ name, service, active, style, tag }) => (
  <div
    style={{
      position: "absolute",
      left: 130,
      right: 24,
      height: ROW_H - 16,
      borderRadius: 20,
      padding: "0 22px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: active ? "rgba(255,255,255,0.08)" : "#23262D",
      border: active ? `2px solid ${SOLVE}` : "1.5px solid rgba(255,255,255,0.08)",
      ...style,
    }}
  >
    <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.white }}>{name}</div>
    <div style={{ fontSize: 24, fontWeight: 600, color: COLORS.muted, flex: 1 }}>{service}</div>
    {tag}
  </div>
);

const Tag: React.FC<{ children: React.ReactNode; p: number; tone?: "ok" | "red" }> = ({ children, p, tone = "ok" }) => (
  <div
    style={{
      padding: "6px 14px",
      borderRadius: 12,
      fontSize: 22,
      fontWeight: 800,
      background: tone === "ok" ? SOLVE : "rgba(255,138,122,0.16)",
      color: tone === "ok" ? COLORS.ink : "#FF8A7A",
      opacity: clamp(p),
      scale: `${easeOutBack(clamp(p))}`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

export const AgentPanel: React.FC<{ t: number }> = ({ t }) => {
  const v = vis(t, A.agente + 0.25, A.peinando + 0.1, 0.35, 0.25);
  if (v <= 0) return null;
  const e = prog(t, A.agente + 0.25, 0.45, easeOutBack);
  const f = float(t, 8, 0.7);
  const kick = pulse(t, A.agenda) + pulse(t, A.cambia);
  // 1) nueva reserva leída al momento
  const inCard = prog(t, A.lee, 0.35, easeOutBack);
  const scan = clamp((t - A.lee - 0.2) / 0.7);
  const read = prog(t, A.lee + 0.9, 0.25);
  // 2) entra en la agenda (17:00)
  const drop = prog(t, A.agenda, 0.45, easeInOutCubic);
  // 3) confirmación por mensaje
  const conf = prog(t, A.confirma, 0.35, easeOutBack);
  // 4) cambio de hora: 17:00 → 18:30
  const ask = prog(t, A.otrahora, 0.3, easeOutBack);
  const move = prog(t, A.cambia, 0.45, easeInOutCubic);
  const AG_TOP = 300;
  const rowY = (i: number) => AG_TOP + i * ROW_H;
  const lauraY = lerp(rowY(1), rowY(2), move);
  const cardY = lerp(150, lauraY, drop);
  return (
    <div
      style={{
        position: "absolute",
        left: LEFT,
        top: 600,
        width: W,
        height: 900,
        opacity: v,
        scale: `${(0.85 + 0.15 * e) * (1 - 0.025 * kick)}`,
        rotate: `${(1 - clamp(e)) * -6 + f.rot}deg`,
        translate: `${f.x}px ${(1 - clamp(e)) * 120 + f.y}px`,
        filter: `blur(${(1 - clamp(e)) * 14}px)`,
      }}
    >
      <div style={{ ...card, position: "absolute", inset: 0, border: `2px solid ${SOLVE}55` }} />
      <div style={{ position: "absolute", left: 28, right: 28, top: 26, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: SOLVE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${SOLVE}66` }}>
          <Icon name="chat" size={32} color={COLORS.ink} stroke={9} />
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.white, flex: 1 }}>Tu agente de IA</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: SOLVE, fontSize: 24, fontWeight: 700 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: SOLVE, opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 4)) }} />
          Activo
        </div>
      </div>
      <div style={{ position: "absolute", left: 28, top: 230, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", color: COLORS.muted }}>AGENDA · JUEVES</div>
      {ROWS.map((h, i) => (
        <div key={h} style={{ position: "absolute", left: 28, right: 24, top: rowY(i), height: ROW_H - 16, display: "flex", alignItems: "center", borderTop: "1.5px dashed rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#8A9099", width: 100 }}>{h}</div>
        </div>
      ))}
      <Block name="Ana" service="Corte" style={{ top: rowY(0) }} />
      <Block name="Marta" service="Mechas" style={{ top: rowY(3) }} />
      {/* Laura: llega como reserva nueva, se lee, entra en la agenda y luego cambia de hora */}
      {inCard > 0 ? (
        drop < 1 ? (
          <div
            style={{
              position: "absolute",
              left: 28 + drop * 102,
              right: 24,
              top: cardY,
              height: drop > 0 ? ROW_H - 16 : 120,
              borderRadius: 22,
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "#23262D",
              border: `2px solid ${SOLVE}`,
              overflow: "hidden",
              opacity: clamp(inCard),
              scale: `${0.8 + 0.2 * inCard}`,
              boxShadow: `0 0 40px ${SOLVE}44`,
            }}
          >
            <Avatar letter="L" color="#3A3F48" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: SOLVE }}>NUEVA RESERVA</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.white }}>Laura · Color · Jue 17:00</div>
            </div>
            <Tag p={read}>Leída</Tag>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${scan * 100}%`, width: 70, background: `linear-gradient(90deg, transparent, ${SOLVE}88, transparent)`, opacity: scan > 0 && scan < 1 ? 1 : 0 }} />
          </div>
        ) : (
          <Block name="Laura" service="Color" active style={{ top: lauraY }} tag={<Tag p={move > 0 ? prog(t, A.cambia + 0.45, 0.3) : 1}>{move > 0 ? "Cambiada" : "En agenda"}</Tag>} />
        )
      ) : null}
      {/* mensajes con la clienta */}
      {conf > 0 ? (
        <div style={{ position: "absolute", left: 28, right: 28, top: 730, display: "flex", flexDirection: "column", gap: 12 }}>
          {ask <= 0 ? (
            <div style={{ alignSelf: "flex-end", maxWidth: "88%", padding: "18px 24px", borderRadius: 26, borderBottomRightRadius: 8, background: SOLVE, color: COLORS.ink, fontSize: 28, fontWeight: 700, opacity: clamp(conf), scale: `${0.8 + 0.2 * conf}`, transformOrigin: "right bottom" }}>
              Laura, tu cita del jueves a las 17:00 está confirmada ✓
            </div>
          ) : (
            <>
              <div style={{ alignSelf: "flex-start", padding: "16px 22px", borderRadius: 24, borderBottomLeftRadius: 8, background: "#262A31", color: COLORS.white, fontSize: 28, fontWeight: 700, opacity: clamp(ask), scale: `${0.8 + 0.2 * ask}`, transformOrigin: "left bottom" }}>
                ¿Puede ser a las 18:30?
              </div>
              {move > 0.6 ? (
                <div style={{ ...enter(t, A.cambia + 0.3, 16, 0.25), alignSelf: "flex-end", padding: "16px 22px", borderRadius: 24, borderBottomRightRadius: 8, background: SOLVE, color: COLORS.ink, fontSize: 28, fontWeight: 700 }}>
                  Hecho. Te espero a las 18:30 ✓
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

/* ---------- Logo y herramientas que ya usas ---------- */
const TOOLS: [string, string][] = [
  ["calendar", "Agenda"],
  ["chat", "Mensajes"],
  ["globe", "Web"],
  ["invoice", "Caja"],
  ["user", "Clientes"],
];

export const BrandTools: React.FC<{ t: number }> = ({ t }) => {
  const v = vis(t, A.aigencyx - 0.15, A.comenta + 0.1, 0.25, 0.3);
  if (v <= 0) return null;
  const d = prog(t, A.aigencyx - 0.15, 0.9, (p) => p);
  const e = prog(t, A.aigencyx - 0.15, 0.4, easeOutBack);
  const f = float(t, 9);
  const shrink = prog(t, A.herramientas, 0.4, easeInOutCubic);
  const size = lerp(500, 300, shrink);
  const cx = 540;
  const cy = 1080;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: v }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {TOOLS.map((_, i) => {
          const a = -Math.PI / 2 + (i / TOOLS.length) * Math.PI * 2 + t * 0.25;
          const p = prog(t, A.herramientas + 0.1 + i * 0.12, 0.35);
          const r = 330 * p;
          return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke={SOLVE} strokeWidth={3} strokeDasharray="8 10" strokeDashoffset={-t * 40} opacity={0.8 * p} />;
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: cx - size / 2 + f.x,
          top: cy - size / 2 + f.y,
          scale: `${0.6 + 0.4 * e}`,
          rotate: `${(1 - clamp(e)) * -20 + f.rot}deg`,
          filter: `blur(${(1 - clamp(e)) * 14}px)`,
        }}
      >
        <div style={{ position: "absolute", inset: -100, borderRadius: "50%", background: `radial-gradient(circle, ${BRAND.orange}33, transparent 65%)` }} />
        <Logo size={size} draw={d} />
      </div>
      {TOOLS.map(([icon, label], i) => {
        const a = -Math.PI / 2 + (i / TOOLS.length) * Math.PI * 2 + t * 0.25;
        const p = prog(t, A.herramientas + 0.1 + i * 0.12, 0.4, easeOutBack);
        const pc = clamp(p);
        if (pc <= 0) return null;
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: cx + Math.cos(a) * 330 * pc,
              top: cy + Math.sin(a) * 330 * pc,
              translate: "-50% -50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              opacity: pc,
              scale: `${0.5 + 0.5 * p}`,
              filter: `blur(${(1 - pc) * 10}px)`,
            }}
          >
            <div style={{ width: 120, height: 120, borderRadius: 60, background: "rgba(16,20,10,0.9)", border: `3px solid ${SOLVE}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 36px ${SOLVE}55` }}>
              <Icon name={icon} size={62} color={SOLVE} stroke={6} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.white, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
};

export const SalonComment: React.FC<{ t: number }> = ({ t }) => (
  <CommentCard t={t} start={A.comenta} typeFrom={A.auditoria} typeTo={A.auditoriaEnd} publish={A.auditoriaEnd + 0.2} end={A.sigue - 0.2} top={1000} accent={SOLVE} />
);

/* ---------- El móvil vuelve a vibrar: esta vez ya está contestado ---------- */
export const FinalAnswer: React.FC<{ t: number }> = ({ t }) => {
  const v = vis(t, A.sigue + 0.3, CLOSE + 0.2, 0.3, 0.3);
  if (v <= 0) return null;
  const e = prog(t, A.sigue + 0.3, 0.4, easeOutBack);
  const ans = prog(t, A.estavez, 0.35, easeOutBack);
  const f = float(t, 10, 0.8);
  return (
    <div
      style={{
        position: "absolute",
        left: LEFT,
        top: 1080,
        width: W,
        opacity: v,
        scale: `${0.85 + 0.15 * e}`,
        rotate: `${(1 - clamp(e)) * 6 + f.rot}deg`,
        translate: `${f.x}px ${(1 - clamp(e)) * 100 + f.y}px`,
        filter: `blur(${(1 - clamp(e)) * 12}px)`,
      }}
    >
      <div style={{ ...card, padding: 28, display: "flex", flexDirection: "column", gap: 14, border: `2px solid ${SOLVE}55` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar letter="S" />
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.white, flex: 1 }}>Sara</div>
          <div style={{ fontSize: 22, color: COLORS.muted, fontWeight: 600 }}>ahora</div>
        </div>
        <div style={{ alignSelf: "flex-start", padding: "18px 24px", borderRadius: 26, borderBottomLeftRadius: 8, background: "#262A31", color: COLORS.white, fontSize: 32, fontWeight: 700 }}>
          ¿Tenéis hueco el sábado?
        </div>
        {ans > 0 ? (
          <div style={{ alignSelf: "flex-end", maxWidth: "88%", padding: "18px 24px", borderRadius: 26, borderBottomRightRadius: 8, background: SOLVE, color: COLORS.ink, fontSize: 32, fontWeight: 700, opacity: clamp(ans), scale: `${0.8 + 0.2 * ans}`, transformOrigin: "right bottom" }}>
            Sí, te reservo el sábado a las 11:00 ✓
          </div>
        ) : null}
        <div style={{ ...enter(t, A.estavez + 0.35, 10, 0.25), alignSelf: "flex-end", color: SOLVE, fontSize: 22, fontWeight: 700 }}>Respondido por tu agente de IA</div>
      </div>
    </div>
  );
};

/** Oscurecimiento del mundo cuando hay una tarjeta delante (legibilidad). */
export const salonDim = (t: number) =>
  Math.max(
    0.35 * vis(t, A.clienta, A.tardas + 0.3, 0.3, 0.3),
    0.45 * vis(t, A.agente + 0.25, A.peinando + 0.1, 0.35, 0.25),
    0.4 * vis(t, A.aigencyx - 0.15, A.sigue, 0.3, 0.3),
    0.25 * vis(t, A.sigue + 0.3, END, 0.3, 0.3),
  );
