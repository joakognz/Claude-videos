import React from "react";
import { C, Caption, EASE, EASE_OUT, MONO, TITLE, TL, UI, clamp01 } from "../theme";

export const CAPTION_TOP = 250;
export const MICRO_TOP = 468;

/** Keyword on an orange highlighter box that wipes in from the left; the text turns dark once the box is under it. */
export const Highlight: React.FC<{ text: string; t: number; at: number; size: number }> = ({ text, t, at, size }) => {
  const wipe = EASE_OUT(clamp01((t - at) / 0.28));
  const ink = clamp01((wipe - 0.45) / 0.3);
  const v = (a: number, b: number) => Math.round(a + (b - a) * ink);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: `0 ${size * 0.14}px`, margin: `0 ${size * 0.02}px` }}>
      <span style={{
        position: "absolute", left: 0, right: 0, top: "6%", bottom: "2%", background: C.orange, borderRadius: size * 0.06,
        transformOrigin: "left center", scale: `${wipe} 1`, boxShadow: `0 0 ${size * 0.5}px rgba(255,107,26,${0.45 * wipe})`,
      }} />
      <span style={{ position: "relative", color: `rgb(${v(255, 0x14)},${v(255, 0x11)},${v(255, 0x0f)})` }}>{text}</span>
    </span>
  );
};

/** A word that slides up out of a directional blur (the captions' motion blur). */
export const Reveal: React.FC<{ t: number; at: number; children: React.ReactNode; dist?: number }> = ({ t, at, children, dist = 34 }) => {
  const p = EASE_OUT(clamp01((t - (at - 0.08)) / 0.3));
  return (
    <span style={{ display: "inline-block", opacity: p, translate: `0px ${(1 - p) * dist}px`, filter: p < 1 ? `blur(${(1 - p) * 9}px)` : undefined }}>
      {children}
    </span>
  );
};

/** Small monospaced micro-text. */
export const Micro: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = "rgba(255,244,236,0.78)", size = 26, style }) => (
  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.24, textTransform: "uppercase", color, ...style }}>{children}</span>
);

const CaptionView: React.FC<{ cap: Caption; t: number }> = ({ cap, t }) => {
  const size = 82;
  const out = EASE(clamp01((t - (cap.end - 0.25)) / 0.25));
  const first = Math.min(cap.start, ...(cap.micro ?? []).map((m) => m[1] - 0.12));
  if (t < first - 0.5 || out >= 1) return null;
  const microOut = cap.microEnd ? EASE(clamp01((t - (cap.microEnd - 0.25)) / 0.25)) : 0;
  const leaving = { opacity: 1 - out, filter: out > 0 ? `blur(${out * 12}px)` : undefined, translate: `0px ${-out * 30}px` };
  return (
    <>
      <div style={{
        position: "absolute", left: 60, right: 60, top: CAPTION_TOP, textAlign: "center", fontFamily: TITLE, fontWeight: 800,
        fontSize: size, lineHeight: 1.12, letterSpacing: -1.5, color: C.white, textShadow: "0 4px 30px rgba(0,0,0,0.7)", ...leaving,
      }}>
        {cap.chunks.map((ch, i) => (
          <React.Fragment key={i}>
            <Reveal t={t} at={ch.t}>{ch.hl ? <Highlight text={ch.text} t={t} at={ch.t} size={size} /> : ch.text}</Reveal>
            {i < cap.chunks.length - 1 && " "}
          </React.Fragment>
        ))}
      </div>
      {cap.micro && (
        <div style={{ position: "absolute", left: 40, right: 40, top: MICRO_TOP, textAlign: "center", ...leaving, opacity: (1 - out) * (1 - microOut) }}>
          {cap.micro.map(([text, at], i) => (
            <React.Fragment key={i}>
              <Reveal t={t} at={at} dist={14}><Micro>{text}</Micro></Reveal>
              {i < cap.micro!.length - 1 && " "}
            </React.Fragment>
          ))}
        </div>
      )}
      {cap.sub && (
        <div style={{
          position: "absolute", left: 60, right: 60, top: MICRO_TOP - 6, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 44,
          color: "rgba(255,244,236,0.92)", textShadow: "0 2px 16px rgba(0,0,0,0.7)", ...leaving,
        }}>
          {cap.sub.map(([text, at], i) => (
            <React.Fragment key={i}>
              <Reveal t={t} at={at} dist={16}>{text}</Reveal>
              {i < cap.sub!.length - 1 && " "}
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
};

export const Captions: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Object.entries(TL.captions).map(([k, cap]) => <CaptionView key={k} cap={cap} t={t} />)}
  </>
);

/** Darkens the top of the frame so the captions always read. */
export const TopShade: React.FC = () => (
  <div style={{
    position: "absolute", left: 0, right: 0, top: 0, height: 720,
    background: "linear-gradient(180deg, rgba(10,8,7,0.82) 0%, rgba(10,8,7,0.6) 45%, rgba(10,8,7,0.2) 78%, rgba(10,8,7,0) 100%)",
  }} />
);
