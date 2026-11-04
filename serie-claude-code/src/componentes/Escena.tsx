/**
 * Escena: el lienzo actual visto por la cámara (regla 3: un plano nuevo cada 2–3 s; regla 4: siempre hacia dentro).
 * Al final de cada lienzo la cámara entra por su «portal» (la caja de Claude Code, la carpeta, la lupa…) y lo que hay
 * dentro es ya el lienzo siguiente, dibujado a escala: el corte no existe, todo es un único zoom de lo general al detalle.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { VistaImagen } from "../imagenes";
import { Etiqueta } from "../imagenes/piezas";
import { camara, escalaPortal } from "../plan";
import { H, W, ramp } from "../tema";
import type { Episodio, Lienzo, Plan } from "../tipos";
import { useEstilo } from "./estilo";

const Fondo: React.FC<{ idx: number }> = ({ idx }) => {
  const E = useEstilo();
  const tono = idx % 2 ? "#0A0908" : E.fondo;
  return (
    <div style={{ position: "absolute", left: -900, top: -1200, width: W + 1800, height: H + 2400, background: tono }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.55,
        backgroundImage: "radial-gradient(circle, #2A2A2A 2px, rgba(0,0,0,0) 2.5px)", backgroundSize: "46px 46px", backgroundPosition: "11px 11px",
      }} />
      <div style={{ position: "absolute", left: 900 - 200, top: 1200 + 500, width: W + 400, height: 1200, background: `radial-gradient(ellipse 50% 45% at 50% 50%, ${E.acento}14, rgba(0,0,0,0) 70%)` }} />
    </div>
  );
};

/** Etiquetas con flecha de un lienzo (van por encima de todo, también del portal). */
const Etiquetas: React.FC<{ L: Lienzo; plan: Plan; t: number }> = ({ L, plan, t }) => (
  <>
    {plan.escenas
      .filter((e) => e.lienzo === L.idx)
      .flatMap((e) => e.etiquetas)
      .map((et, i) => {
        const obj = L.medida.elementos[et.apunta];
        return obj ? <Etiqueta key={i} obj={obj} texto={et.texto} lado={et.lado} t={t} at={et.t} /> : null;
      })}
  </>
);

/** Todo lo que vive dentro de un lienzo (se mueve con la cámara): fondo, imagen y etiquetas con flecha. */
export const ContenidoLienzo: React.FC<{ L: Lienzo; plan: Plan; ep: Episodio; t: number; etiquetas?: boolean }> = ({ L, plan, ep, t, etiquetas = true }) => (
  <>
    <Fondo idx={L.idx} />
    <VistaImagen img={L.imagen} m={L.medida} t={t} ep={ep} fps={plan.fps} />
    {etiquetas && <Etiquetas L={L} plan={plan} t={t} />}
  </>
);

export const Escena: React.FC<{ plan: Plan; ep: Episodio; t: number }> = ({ plan, ep, t }) => {
  const L = plan.lienzos.find((l) => t < l.fin) ?? plan.lienzos[plan.lienzos.length - 1];
  const sig = plan.lienzos[L.idx + 1];
  const c = camara(L, t);
  const p = L.medida.portal;
  const k = p ? escalaPortal(L) : 1;
  // un portal con vista=false tapa su contenido (el ✓, la carpeta…) hasta que la cámara empieza a entrar
  const verHijo = !p || !sig ? 0 : p.vista === false ? ramp(t, L.entrada, L.entrada + 0.4 * (L.fin - L.entrada)) : 1;
  return (
    <AbsoluteFill style={{ perspective: 2600, overflow: "hidden" }}>
      <div style={{
        position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0",
        transform: `translate(${W / 2}px, ${H / 2}px) rotateY(${c.giro}deg) rotate(${c.rot}deg) scale(${c.s}) translate(${-c.cx}px, ${-c.cy}px)`,
      }}>
        <ContenidoLienzo L={L} plan={plan} ep={ep} t={t} etiquetas={false} />
        {p && sig && verHijo > 0 && (
          <div style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, borderRadius: p.radio, overflow: "hidden", opacity: verHijo }}>
            <div style={{ position: "absolute", left: p.w / 2 - (W / 2) * k, top: p.h / 2 - (H / 2) * k, width: W, height: H, transformOrigin: "0 0", scale: String(k) }}>
              <ContenidoLienzo L={sig} plan={plan} ep={ep} t={t} />
            </div>
          </div>
        )}
        <Etiquetas L={L} plan={plan} t={t} />
      </div>
    </AbsoluteFill>
  );
};
