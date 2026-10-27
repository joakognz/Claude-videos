import React from "react";
import { clamp, COLORS, easeOutBack, float, prog, vis } from "./anim";
import { Logo } from "./Logo";
import { card, Icon } from "./ui";

/** Campo de comentarios que escribe una palabra y la publica. */
export const CommentCard: React.FC<{
  t: number; start: number; typeFrom: number; typeTo: number; publish: number; end: number; word?: string; top?: number;
}> = ({ t, start, typeFrom, typeTo, publish, end, word = "AUDITORIA", top = 1060 }) => {
  const v = vis(t, start + 0.1, end + 0.2, 0.4, 0.35);
  if (v <= 0) return null;
  const e = prog(t, start + 0.1, 0.5);
  const n = Math.floor(clamp((t - typeFrom) / (typeTo - typeFrom)) * word.length + 0.0001);
  const typed = word.slice(0, n);
  const ready = t >= publish - 0.2;
  const press = Math.sin(Math.PI * clamp((t - publish) / 0.25));
  const posted = prog(t, publish + 0.25, 0.4, easeOutBack);
  const caret = Math.floor(t * 2.2) % 2 === 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top,
        opacity: v,
        filter: `blur(${(1 - e) * 14}px)`,
        translate: `${float(t, 3, 0.7).x}px ${(1 - e) * 120 + float(t, 3, 0.7).y}px`,
        rotate: `${float(t, 3, 0.6).rot}deg`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: -70, position: "relative", zIndex: 1 }}>
        <Logo size={150} draw={prog(t, start + 0.2, 0.7, (p) => p)} />
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
              <div style={{ fontSize: 36, color: COLORS.white, fontWeight: 800, letterSpacing: "0.04em" }}>{word}</div>
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
              scale: `${1 - 0.1 * (t > publish ? press : 0)}`,
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

