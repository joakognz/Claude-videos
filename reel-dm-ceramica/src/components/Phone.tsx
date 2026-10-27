import React from "react";
import { spring } from "remotion";
import { C, FPS, S, SANS, TL, clamp01, drift, windowed } from "../theme";
import { IconBack, IconChecks, IconImage, IconInfo, IconMug, IconSend, IconSmile } from "./Icons";

export const PHONE_W = 480;
export const PHONE_H = 980;
const BEZEL = 16;
const SCREEN_R = 62;
const SCREEN_W = PHONE_W - 2 * BEZEL;

const E3 = TL.captions.E3;
const vistoAt = E3.words[2].start - 0.02; // "visto"

const StatusBar: React.FC<{ t: number }> = ({ t }) => {
  const time = t >= S.E5 + 9 && t < S.E14 ? "23:08" : "23:07";
  return (
    <div style={{
      position: "absolute", top: 26, left: 44, right: 40, height: 40, display: "flex",
      justifyContent: "space-between", alignItems: "center", fontFamily: SANS, fontWeight: 700,
      fontSize: 24, color: C.white,
    }}>
      <span>{time}</span>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        {[8, 12, 16, 20].map((h, i) => (
          <div key={i} style={{ width: 5, height: h, borderRadius: 2, background: C.white, opacity: i < 3 ? 1 : 0.4 }} />
        ))}
        <div style={{ marginLeft: 8, width: 38, height: 19, borderRadius: 6, border: "2px solid rgba(255,255,255,0.7)", padding: 2 }}>
          <div style={{ width: "34%", height: "100%", borderRadius: 3, background: C.white }} />
        </div>
      </div>
    </div>
  );
};

const Avatar: React.FC<{ ai?: boolean; t: number }> = ({ ai, t }) => (
  <div style={{ position: "relative", width: 66, height: 66, flexShrink: 0 }}>
    <div style={{
      width: 66, height: 66, borderRadius: 66, display: "flex", alignItems: "center", justifyContent: "center",
      background: ai ? "linear-gradient(135deg,#6E8B4E,#3E5A2E)" : "linear-gradient(135deg,#8a97a6,#525d6b)",
      fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.white,
      boxShadow: ai ? `0 0 0 3px ${C.accent}` : undefined,
    }}>
      {ai ? <IconMug size={36} stroke={2} /> : "C"}
    </div>
    {ai && (
      <div style={{
        position: "absolute", right: -2, bottom: -2, width: 20, height: 20, borderRadius: 20, background: C.accent,
        border: "3px solid #0c1813", opacity: 0.75 + 0.25 * Math.sin(t * 5),
      }} />
    )}
  </div>
);

const Header: React.FC<{ t: number; ai?: boolean }> = ({ t, ai }) => (
  <div style={{
    position: "absolute", top: 78, left: 0, right: 0, height: 100, display: "flex", alignItems: "center", gap: 16,
    padding: "0 26px 0 14px", borderBottom: "1.5px solid rgba(255,255,255,0.08)", fontFamily: SANS,
  }}>
    <IconBack size={38} stroke={2.6} />
    <Avatar ai={ai} t={t} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 800, fontSize: 27, color: C.white, whiteSpace: "nowrap" }}>{ai ? "Taller Olivo" : "carmen.r"}</div>
      <div style={{ fontWeight: 600, fontSize: 21, marginTop: 3, color: ai ? C.accent : "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
        {ai ? "asistente IA · en línea" : "Activa hace 1 min"}
      </div>
    </div>
    <IconInfo size={34} stroke={2} color="rgba(255,255,255,0.8)" />
  </div>
);

const Composer: React.FC<{ t: number; frozen: boolean; ai?: boolean }> = ({ t, frozen, ai }) => {
  const blink = frozen ? 1 : Math.floor(t * 2.2) % 2 === 0 ? 1 : 0.1;
  return (
    <div style={{ position: "absolute", left: 18, right: 18, bottom: 40, height: 78, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        flex: 1, height: 78, borderRadius: 40, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", padding: "0 20px", gap: 12, fontFamily: SANS,
      }}>
        <IconSmile size={32} stroke={2} color="rgba(255,255,255,0.55)" />
        <div style={{ width: 3, height: 34, borderRadius: 2, background: frozen ? C.red : C.white, opacity: blink }} />
        <span style={{ fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,0.4)", marginLeft: -6 }}>Mensaje…</span>
        <div style={{ flex: 1 }} />
        <IconImage size={32} stroke={2} color="rgba(255,255,255,0.55)" />
      </div>
      <div style={{
        width: 64, height: 64, borderRadius: 64, display: "flex", alignItems: "center", justifyContent: "center",
        background: ai ? C.accent : "rgba(255,255,255,0.1)",
      }}>
        <IconSend size={32} stroke={2.6} color={ai ? C.ink : "rgba(255,255,255,0.35)"} />
      </div>
    </div>
  );
};

const pop = (frame: number, at: number) =>
  spring({ frame: frame - at * FPS, fps: FPS, config: { damping: 13, stiffness: 170, mass: 0.8 } });

/** Customer bubble (white, left). */
export const InBubble: React.FC<{ text: string; p: number; size?: number; maxW?: number }> = ({ text, p, size = 36, maxW = 360 }) => (
  <div style={{
    alignSelf: "flex-start", maxWidth: maxW, padding: `${size * 0.48}px ${size * 0.7}px`, borderRadius: size,
    borderBottomLeftRadius: size * 0.25, background: "#F4F2EE", color: C.ink, fontFamily: SANS, fontWeight: 700,
    fontSize: size, lineHeight: 1.22, opacity: clamp01(p * 1.6), scale: String(0.6 + 0.4 * p),
    transformOrigin: "left bottom", translate: `0px ${(1 - p) * 24}px`, boxShadow: "0 8px 22px rgba(0,0,0,0.3)",
  }}>{text}</div>
);

/** ANTES (and E14): the shop's inbox, messages piling up with no reply. */
const InboxScreen: React.FC<{ t: number; frame: number; loop: boolean }> = ({ t, frame, loop }) => {
  const msgs = loop ? TL.inbox.slice(0, 1).map((m) => ({ ...m, t: S.E14 - 0.6 })) : TL.inbox;
  const visto = !loop && t >= vistoAt ? pop(frame, vistoAt) : 0;
  const frozen = !loop && t >= S.E3;
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#141b21 0%,#0a0e11 100%)" }}>
      <Header t={t} />
      <div style={{ position: "absolute", top: 205, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 1, color: "rgba(255,255,255,0.38)" }}>
        HOY · 23:07
      </div>
      <div style={{ position: "absolute", top: 252, left: 22, right: 22, display: "flex", flexDirection: "column", gap: 16 }}>
        {msgs.map((m, i) => {
          const p = t >= m.t ? pop(frame, m.t) : 0;
          if (p <= 0.001) return null;
          return <InBubble key={i} text={m.text} p={p} />;
        })}
        {visto > 0.001 && (
          <div style={{
            alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, marginLeft: 8, fontFamily: SANS,
            fontWeight: 700, fontSize: 25, color: "rgba(255,255,255,0.7)", opacity: clamp01(visto * 1.5),
            translate: `${(1 - visto) * -20}px 0px`,
          }}>
            <IconChecks size={30} stroke={2.2} color="rgba(255,255,255,0.7)" /> Visto 23:07
          </div>
        )}
      </div>
      <Composer t={t} frozen={frozen} />
    </div>
  );
};

/** Green "escribiendo…" bubble (right). */
export const TypingBubble: React.FC<{ t: number; p: number; size?: number }> = ({ t, p, size = 36 }) => (
  <div style={{
    alignSelf: "flex-end", display: "flex", gap: size * 0.28, padding: `${size * 0.62}px ${size * 0.75}px`, borderRadius: size,
    borderBottomRightRadius: size * 0.25, background: C.accent, opacity: clamp01(p * 1.6), scale: String(0.6 + 0.4 * p),
    transformOrigin: "right bottom", boxShadow: "0 0 30px rgba(61,220,151,0.35)",
  }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        width: size * 0.36, height: size * 0.36, borderRadius: size, background: C.ink,
        opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 0.9)),
        translate: `0px ${-Math.max(0, Math.sin(t * 9 - i * 0.9)) * size * 0.16}px`,
      }} />
    ))}
  </div>
);

/** DESPUÉS: the same inbox, now answered by the shop's AI assistant. */
const AIScreen: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const chip = pop(frame, S.E4 + 0.15);
  const typingIn = pop(frame, S.E4 + 0.9);
  const typingOut = clamp01((t - (S.E5 - 0.25)) / 0.2);
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 60% at 50% 0%,#13372a 0%,#0b1813 55%,#070d0a 100%)" }}>
      <Header t={t} ai />
      <div style={{ position: "absolute", top: 205, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 30,
          background: "rgba(61,220,151,0.12)", border: `1.5px solid ${C.accent}`, fontFamily: SANS, fontWeight: 800,
          fontSize: 20, color: C.accent, opacity: clamp01(chip * 1.5), scale: String(0.7 + 0.3 * chip),
        }}>
          <div style={{ width: 10, height: 10, borderRadius: 10, background: C.accent, opacity: 0.6 + 0.4 * Math.sin(t * 6) }} />
          Asistente IA activo · 24/7
        </div>
      </div>
      <div style={{ position: "absolute", left: 22, right: 22, bottom: 150, display: "flex", flexDirection: "column" }}>
        {t >= S.E4 + 0.9 && typingOut < 1 && <TypingBubble t={t} p={typingIn * (1 - typingOut)} />}
      </div>
      <Composer t={t} frozen={false} ai />
    </div>
  );
};

/** iPhone-style 3D mockup. The same object is reused across every scene. */
export const Phone: React.FC<{ t: number; frame: number; after: boolean; ry: number; rx: number; rz?: number; open?: number }> = ({
  t, frame, after, ry, rx, rz = 0, open = 0,
}) => {
  const loop = windowed(t, S.E14 - 0.15, 999, 0.3, 0.01);
  const inbox = after ? loop : 1;
  const ai = after ? 1 - loop : 0;
  // glare follows the rotation
  const glare = 30 + ry * 1.6 + drift(t, 2, 6);
  return (
    <div style={{ width: PHONE_W, height: PHONE_H, position: "relative", transformStyle: "preserve-3d", rotate: `${rz}deg`, transform: `rotateY(${ry}deg) rotateX(${rx}deg)` }}>
      {/* thickness */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{
          position: "absolute", inset: 0, borderRadius: 80, background: i === 6 ? "#0a0c0c" : "#3a403f",
          transform: `translateZ(${-i * 3}px)`,
        }} />
      ))}
      {/* frame */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 80, padding: BEZEL,
        background: "linear-gradient(135deg,#8d9392 0%,#3b4140 30%,#1d2121 60%,#6d7372 100%)",
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.18)",
      }}>
        <div style={{ position: "relative", width: SCREEN_W, height: "100%", borderRadius: SCREEN_R, overflow: "hidden", background: "#000" }}>
          {inbox > 0.001 && <div style={{ position: "absolute", inset: 0, opacity: inbox }}><InboxScreen t={t} frame={frame} loop={after} /></div>}
          {ai > 0.001 && <div style={{ position: "absolute", inset: 0, opacity: ai }}><AIScreen t={t} frame={frame} /></div>}
          <StatusBar t={t} />
          {/* dynamic island */}
          <div style={{ position: "absolute", top: 22, left: "50%", width: 130, height: 38, marginLeft: -65, borderRadius: 20, background: "#000" }} />
          {/* glass reflection */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(${glare}deg, rgba(255,255,255,0) 35%, rgba(255,255,255,${0.1 + open * 0.05}) 47%, rgba(255,255,255,0) 60%)`,
          }} />
        </div>
      </div>
      {/* side buttons */}
      <div style={{ position: "absolute", left: -5, top: 200, width: 6, height: 70, borderRadius: 3, background: "#555b5a" }} />
      <div style={{ position: "absolute", left: -5, top: 290, width: 6, height: 70, borderRadius: 3, background: "#555b5a" }} />
      <div style={{ position: "absolute", right: -5, top: 250, width: 6, height: 110, borderRadius: 3, background: "#555b5a" }} />
      {/* "opens in 3D": a floating glass copy of the UI lifts off the screen */}
      {open > 0.001 && (
        <div style={{
          position: "absolute", inset: BEZEL, borderRadius: SCREEN_R, border: `2px solid rgba(61,220,151,${0.6 * open})`,
          transform: `translateZ(${open * 90}px)`, background: `rgba(61,220,151,${0.06 * open})`,
          boxShadow: `0 0 ${50 * open}px rgba(61,220,151,${0.35 * open})`,
        }} />
      )}
    </div>
  );
};
