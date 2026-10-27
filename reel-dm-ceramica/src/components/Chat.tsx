import React from "react";
import { spring } from "remotion";
import { C, ChatEvent, FPS, S, SANS, TL, clamp01 } from "../theme";
import { IconCheck, IconLock } from "./Icons";

// Sizes are in phone pixels; during E5 the phone is scaled ×1.45, so 31 px text reads at ≥ 44 px.
const FONT = 31;

const grow = (frame: number, at: number) =>
  spring({ frame: frame - at * FPS, fps: FPS, config: { damping: 200, stiffness: 150 } });
const pop = (frame: number, at: number) =>
  spring({ frame: frame - at * FPS, fps: FPS, config: { damping: 12, stiffness: 170, mass: 0.8 } });

/** Collapsible row: grid 0fr → 1fr animates the row's height so older messages scroll up smoothly. */
const Row: React.FC<{ h: number; children: React.ReactNode }> = ({ h, children }) => (
  <div style={{ display: "grid", gridTemplateRows: `${Math.max(0, h)}fr` }}>
    <div style={{ minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", padding: "7px 4px" }}>{children}</div>
  </div>
);

const bubbleIn = (p: number, right: boolean): React.CSSProperties => ({
  opacity: clamp01(p * 1.6), scale: String(0.55 + 0.45 * p), transformOrigin: right ? "right bottom" : "left bottom",
  translate: `0px ${(1 - p) * 20}px`,
});

const Bubble: React.FC<{ who: "cliente" | "ia"; text: string; p: number }> = ({ who, text, p }) => {
  const ia = who === "ia";
  return (
    <div style={{
      alignSelf: ia ? "flex-end" : "flex-start", maxWidth: 360, padding: "14px 21px", borderRadius: FONT,
      [ia ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 8,
      background: ia ? C.accent : "#F4F2EE", color: C.ink, fontFamily: SANS, fontWeight: 700, fontSize: FONT,
      lineHeight: 1.2, boxShadow: ia ? "0 0 26px rgba(61,220,151,0.3)" : "0 8px 20px rgba(0,0,0,0.3)", ...bubbleIn(p, ia),
    }}>{text}</div>
  );
};

const Typing: React.FC<{ t: number; p: number }> = ({ t, p }) => (
  <div style={{
    alignSelf: "flex-end", display: "flex", gap: 9, padding: "19px 24px", borderRadius: FONT, borderBottomRightRadius: 8,
    background: C.accent, boxShadow: "0 0 26px rgba(61,220,151,0.3)", ...bubbleIn(p, true),
  }}>
    {[0, 1, 2].map((i) => {
      const b = Math.max(0, Math.sin(t * 9 - i * 0.9));
      return <div key={i} style={{ width: 12, height: 12, borderRadius: 12, background: C.ink, opacity: 0.35 + 0.65 * b, translate: `0px ${-b * 5}px` }} />;
    })}
  </div>
);

/** Hand-drawn ceramic mug (vector, no photos). */
export const Mug: React.FC<{ size: number; t: number }> = ({ size, t }) => (
  <svg width={size} height={size * 0.82} viewBox="0 0 200 164">
    <defs>
      <linearGradient id="glaze" x1="0" x2="1">
        <stop offset="0" stopColor="#6E8B4E" />
        <stop offset="0.55" stopColor="#8DA866" />
        <stop offset="1" stopColor="#56713C" />
      </linearGradient>
      <linearGradient id="clay" x1="0" x2="1">
        <stop offset="0" stopColor="#E9D9C3" />
        <stop offset="0.6" stopColor="#F6EBDC" />
        <stop offset="1" stopColor="#D8C3A6" />
      </linearGradient>
    </defs>
    <ellipse cx="92" cy="152" rx="70" ry="8" fill="rgba(0,0,0,0.25)" />
    {/* steam */}
    {[0, 1].map((i) => (
      <path key={i} d={`M${78 + i * 26} 30 c-8 -10 8 -14 0 -26`} stroke="rgba(255,255,255,0.55)" strokeWidth="4" fill="none"
        strokeLinecap="round" opacity={0.4 + 0.4 * Math.sin(t * 3 + i * 2)} transform={`translate(0 ${Math.sin(t * 2 + i) * 3})`} />
    ))}
    {/* handle */}
    <path d="M148 64 c30 -4 34 50 2 52" stroke="url(#clay)" strokeWidth="14" fill="none" strokeLinecap="round" />
    {/* body */}
    <path d="M32 44 h118 v78 c0 16 -14 28 -30 28 h-58 c-16 0 -30 -12 -30 -28 z" fill="url(#clay)" />
    {/* glaze dipped on the top half, with drips */}
    <path d="M32 44 h118 v34 c-6 0 -8 10 -14 10 s-6 -12 -14 -12 s-8 18 -16 18 s-8 -16 -16 -16 s-6 8 -14 8 s-8 -14 -16 -14 s-6 12 -14 12 s-6 -8 -14 -8 z" fill="url(#glaze)" />
    <ellipse cx="91" cy="44" rx="59" ry="10" fill="#4A6234" />
    <ellipse cx="91" cy="42" rx="53" ry="7" fill="#3A4E29" />
    {/* speckles */}
    {[[48, 104], [70, 118], [102, 110], [126, 124], [60, 132], [118, 98], [88, 134], [136, 108]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={1.8} fill="#9C8466" />
    ))}
    <path d="M44 56 v20" stroke="rgba(255,255,255,0.35)" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const ProductCard: React.FC<{ p: number; t: number }> = ({ p, t }) => (
  <div style={{
    alignSelf: "flex-end", width: 330, borderRadius: 28, overflow: "hidden", background: "#13241d",
    border: `2px solid ${C.accent}`, fontFamily: SANS, boxShadow: "0 0 30px rgba(61,220,151,0.25)", ...bubbleIn(p, true),
  }}>
    <div style={{ height: 176, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% 60%,#2b4a3a,#13241d 75%)" }}>
      <div style={{ translate: `0px ${Math.sin(t * 2) * 4}px`, rotate: `${Math.sin(t * 1.3) * 2}deg` }}><Mug size={200} t={t} /></div>
    </div>
    <div style={{ padding: "12px 18px 16px" }}>
      <div style={{ fontWeight: 800, fontSize: 30, lineHeight: 1.1, color: C.white }}>Taza artesanal</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontWeight: 800, fontSize: 40, color: C.accent }}>24 €</span>
        <span style={{ fontWeight: 800, fontSize: 22, color: C.ink, background: "#FFD166", padding: "5px 12px", borderRadius: 14 }}>Quedan 3</span>
      </div>
    </div>
  </div>
);

const PayCard: React.FC<{ p: number; done: number }> = ({ p, done }) => (
  <div style={{
    alignSelf: "flex-end", width: 330, borderRadius: 28, padding: "18px 20px", background: "#13241d", position: "relative",
    border: `2px solid ${C.accent}`, fontFamily: SANS, boxShadow: "0 0 30px rgba(61,220,151,0.25)", ...bubbleIn(p, true),
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 30, color: C.white }}>
      <IconLock size={32} color={C.accent} stroke={2.4} /> Enlace de pago
    </div>
    <div style={{ fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>Pedido #1047 · 24,00 €</div>
    <div style={{
      marginTop: 14, height: 62, borderRadius: 31, background: C.accent, display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 800, fontSize: 28, color: C.ink,
    }}>Pagar ahora</div>
    {/* confirmed stamp */}
    <div style={{
      position: "absolute", right: -14, top: -16, width: 62, height: 62, borderRadius: 62, background: C.white,
      border: `4px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center",
      scale: String(Math.max(0, done)), boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
    }}>
      <IconCheck size={36} color={C.accentDeep} stroke={3.4} />
    </div>
  </div>
);

const Confirm: React.FC<{ p: number }> = ({ p }) => (
  <div style={{
    alignSelf: "center", display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 24,
    background: "rgba(61,220,151,0.14)", border: `1.5px solid ${C.accent}`, fontFamily: SANS, fontWeight: 800, fontSize: 24,
    color: C.accent, opacity: clamp01(p * 1.5), scale: String(0.6 + 0.4 * p),
  }}>
    <IconCheck size={26} color={C.accent} stroke={3} /> Pedido confirmado · 23:08
  </div>
);

type Item = { at: number; until?: number; render: (p: number) => React.ReactNode };

/** E4-E13: the shop's DM thread, answered by the AI assistant. */
export const ChatThread: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const confirmAt = TL.chat.find((e) => e.kind === "confirm")?.t ?? 999;
  const items: Item[] = [
    // E4: the assistant is already typing
    { at: S.E4 + 0.9, until: S.E5 - 0.3, render: (p) => <Typing t={t} p={p} /> },
    ...TL.chat.map((e: ChatEvent): Item => {
      switch (e.kind) {
        case "msg":
          return { at: e.t, render: (p) => <Bubble who={e.who ?? "cliente"} text={e.text ?? ""} p={p} /> };
        case "typing":
          return { at: e.t, until: e.t + (e.dur ?? 1), render: (p) => <Typing t={t} p={p} /> };
        case "product":
          return { at: e.t, render: (p) => <ProductCard p={p} t={t} /> };
        case "pay":
          return { at: e.t, render: (p) => <PayCard p={p} done={pop(frame, confirmAt)} /> };
        default:
          return { at: e.t, render: (p) => <Confirm p={p} /> };
      }
    }),
  ];
  return (
    <div style={{
      position: "absolute", top: 186, bottom: 136, left: 16, right: 16, display: "flex", flexDirection: "column",
      justifyContent: "flex-end", overflow: "hidden",
      maskImage: "linear-gradient(to bottom, transparent 0px, black 46px)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 46px)",
    }}>
      {items.map((it, i) => {
        if (t < it.at - 0.05) return null;
        const h = grow(frame, it.at) * (it.until ? 1 - grow(frame, it.until) : 1);
        if (it.until && t > it.until + 0.6) return null;
        const p = pop(frame, it.at) * (it.until ? 1 - clamp01((t - it.until) / 0.12) : 1);
        return <Row key={i} h={h}>{it.render(p)}</Row>;
      })}
    </div>
  );
};
