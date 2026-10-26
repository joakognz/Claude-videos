import React from "react";
import { C, S, SANS, TL, clamp01, EASE_OUT, envAt, windowed, drift } from "../theme";
import {
  IconHangup, IconKeypad, IconMic, IconPhone, IconSpeaker, IconTooth, IconVoicemail,
} from "./Icons";

export const PHONE_W = 480;
export const PHONE_H = 980;
const BEZEL = 16;
const SCREEN_R = 62;

const callStart = TL.call[0].start;
const S3 = TL.captions.S3;
const missedAt = S3.words[2].start - 0.05; // "buzón"

const StatusBar: React.FC<{ t: number; dark?: boolean }> = ({ t }) => {
  const time = t >= callStart + 9 && t < S.E14 ? "23:08" : "23:07";
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
          <div style={{ width: "62%", height: "100%", borderRadius: 3, background: C.white }} />
        </div>
      </div>
    </div>
  );
};

const RoundButton: React.FC<{ bg: string; children: React.ReactNode; size?: number }> = ({ bg, children, size = 96 }) => (
  <div style={{
    width: size, height: size, borderRadius: size, background: bg, display: "flex",
    alignItems: "center", justifyContent: "center",
  }}>{children}</div>
);

const ButtonsRow: React.FC = () => (
  <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
    <div style={{ display: "flex", gap: 44 }}>
      <RoundButton bg="rgba(255,255,255,0.14)"><IconSpeaker size={42} /></RoundButton>
      <RoundButton bg="rgba(255,255,255,0.14)"><IconMic size={42} /></RoundButton>
      <RoundButton bg="rgba(255,255,255,0.14)"><IconKeypad size={42} /></RoundButton>
    </div>
    <RoundButton bg={C.red} size={104}><IconHangup size={52} /></RoundButton>
  </div>
);

const Ripples: React.FC<{ t: number; color: string; strength: number }> = ({ t, color, strength }) => (
  <>
    {[0, 1, 2].map((i) => {
      const p = ((t * 0.7 + i / 3) % 1);
      return (
        <div key={i} style={{
          position: "absolute", left: "50%", top: 250, width: 170, height: 170, marginLeft: -85, marginTop: -85,
          borderRadius: "50%", border: `3px solid ${color}`, scale: String(1 + p * 1.5),
          opacity: (1 - p) * 0.55 * strength,
        }} />
      );
    })}
  </>
);

const CallingScreen: React.FC<{ t: number }> = ({ t }) => {
  const dots = ".".repeat(1 + (Math.floor(t * 3) % 3));
  const ringing = t < S.E3 || t >= S.E14;
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1d2a33 0%,#0d1418 100%)" }}>
      <Ripples t={t} color="rgba(255,255,255,0.8)" strength={ringing ? 1 : 0} />
      <div style={{
        position: "absolute", left: "50%", top: 250, width: 170, height: 170, marginLeft: -85, marginTop: -85,
        borderRadius: "50%", background: "linear-gradient(135deg,#5b6b75,#2c3840)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <IconTooth size={84} stroke={1.8} />
      </div>
      <div style={{ position: "absolute", top: 370, width: "100%", textAlign: "center", fontFamily: SANS }}>
        <div style={{ fontWeight: 800, fontSize: 36, color: C.white }}>Clínica Sonrisa Norte</div>
        <div style={{ fontWeight: 600, fontSize: 30, color: C.muted, marginTop: 8 }}>Llamando{dots}</div>
      </div>
      <div style={{
        position: "absolute", top: 470, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 800,
        fontSize: 158, letterSpacing: -6, color: C.white, textShadow: "0 0 40px rgba(255,255,255,0.25)",
      }}>23:07</div>
      <ButtonsRow />
    </div>
  );
};

const VoicemailScreen: React.FC<{ t: number }> = ({ t }) => {
  const n = EASE_OUT(clamp01((t - missedAt) / 0.5));
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#3a1517 0%,#140809 100%)" }}>
      <div style={{ position: "absolute", top: 210, width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 190, height: 190, borderRadius: "50%", background: "rgba(255,90,95,0.16)", border: `3px solid ${C.red}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconVoicemail size={110} color={C.red} stroke={2} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 440, width: "100%", textAlign: "center", fontFamily: SANS }}>
        <div style={{ fontWeight: 800, fontSize: 50, color: C.white }}>Buzón de voz</div>
        <div style={{ fontWeight: 600, fontSize: 28, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>Fuera de horario</div>
      </div>
      {/* missed-call notification */}
      <div style={{
        position: "absolute", left: 22, right: 22, top: 84, padding: "20px 24px", borderRadius: 30,
        background: "rgba(40,40,44,0.92)", display: "flex", gap: 18, alignItems: "center",
        translate: `0px ${(1 - n) * -170}px`, opacity: n, fontFamily: SANS,
        boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
      }}>
        <div style={{ width: 62, height: 62, borderRadius: 16, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconPhone size={36} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 27, color: C.white }}>1 llamada perdida</div>
          <div style={{ fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Clínica Sonrisa Norte · 23:07</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <RoundButton bg="rgba(255,90,95,0.25)" size={104}><IconHangup size={52} color={C.red} /></RoundButton>
      </div>
    </div>
  );
};

const BARS = 26;
export const Waveform: React.FC<{ t: number; width: number; height: number; idle?: number }> = ({ t, width, height, idle = 0.18 }) => {
  const lu = envAt("lucia", t);
  const cl = envAt("cliente", t);
  const color = cl > lu * 1.15 ? C.white : C.accent;
  const level = Math.max(lu, cl);
  const bw = width / BARS;
  return (
    <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {new Array(BARS).fill(0).map((_, i) => {
        const shape = Math.sin((i / (BARS - 1)) * Math.PI);
        const wob = 0.55 + 0.45 * Math.sin(t * 11 + i * 1.3) * Math.sin(t * 7.3 + i * 0.7);
        const h = Math.max(0.08, (idle * (0.6 + 0.4 * Math.sin(t * 3 + i)) + level * 1.1 * wob) * shape);
        return (
          <div key={i} style={{
            width: bw * 0.55, height: Math.min(1, h) * height, borderRadius: bw, background: color,
            boxShadow: color === C.accent ? `0 0 14px ${C.accent}` : "0 0 10px rgba(255,255,255,0.5)",
          }} />
        );
      })}
    </div>
  );
};

const AIScreen: React.FC<{ t: number }> = ({ t }) => {
  const secs = Math.max(0, Math.floor(t - S.E4));
  const timer = `00:${String(secs).padStart(2, "0")}`;
  const lu = envAt("lucia", t);
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 70% at 50% 25%,#6a2c0c 0%,#2a140a 55%,#0f0907 100%)" }}>
      <Ripples t={t} color={C.accent} strength={0.5 + lu} />
      <div style={{
        position: "absolute", left: "50%", top: 250, width: 170, height: 170, marginLeft: -85, marginTop: -85,
        borderRadius: "50%", background: "linear-gradient(135deg,#FF8A3D,#E2560C)", display: "flex",
        alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${40 + lu * 60}px rgba(255,107,26,0.7)`,
        fontFamily: SANS, fontWeight: 800, fontSize: 82, color: C.ink,
      }}>L</div>
      <div style={{ position: "absolute", top: 370, width: "100%", textAlign: "center", fontFamily: SANS }}>
        <div style={{ fontWeight: 800, fontSize: 34, color: C.white }}>Clínica Sonrisa Norte</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 14, padding: "8px 20px", borderRadius: 40, background: "rgba(255,107,26,0.16)", border: `2px solid ${C.accent}` }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: C.accent, opacity: 0.6 + 0.4 * Math.sin(t * 6) }} />
          <span style={{ fontWeight: 800, fontSize: 28, color: C.accent }}>Lucía (IA)</span>
        </div>
        <div style={{ fontWeight: 600, fontSize: 28, color: C.muted, marginTop: 14 }}>{timer}</div>
      </div>
      <div style={{ position: "absolute", top: 560, left: 50, right: 50, display: "flex", justifyContent: "center" }}>
        <Waveform t={t} width={380} height={150} />
      </div>
      <ButtonsRow />
    </div>
  );
};

/** iPhone-style 3D mockup. The same object is reused across every scene. */
export const Phone: React.FC<{ t: number; ry: number; rx: number; rz?: number; open?: number }> = ({ t, ry, rx, rz = 0, open = 0 }) => {
  const calling = windowed(t, -1, S.E3, 0.01, 0.12) + windowed(t, S.E14 - 0.1, 999, 0.25, 0.01);
  const voicemail = windowed(t, S.E3, S.E4 - 0.05, 0.12, 0.25);
  const ai = windowed(t, S.E4 - 0.1, S.E14 - 0.1, 0.3, 0.25);
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
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: SCREEN_R, overflow: "hidden", background: "#000", transformStyle: "preserve-3d" }}>
          {calling > 0.001 && <div style={{ position: "absolute", inset: 0, opacity: calling }}><CallingScreen t={t} /></div>}
          {voicemail > 0.001 && <div style={{ position: "absolute", inset: 0, opacity: voicemail }}><VoicemailScreen t={t} /></div>}
          {ai > 0.001 && <div style={{ position: "absolute", inset: 0, opacity: ai }}><AIScreen t={t} /></div>}
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
          position: "absolute", inset: BEZEL, borderRadius: SCREEN_R, border: `2px solid rgba(255,107,26,${0.6 * open})`,
          transform: `translateZ(${open * 90}px)`, background: `rgba(255,107,26,${0.06 * open})`,
          boxShadow: `0 0 ${50 * open}px rgba(255,107,26,${0.35 * open})`,
        }} />
      )}
    </div>
  );
};
