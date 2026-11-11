/** Subtítulos arriba (regla 5): palabra a palabra, la que suena en un recuadro de acento; máximo 2 líneas. */
import React from "react";
import { C, TOP, UI, clamp01, norm, sp } from "../nucleo";
import type { Palabra } from "../nucleo";

const SIZE = 66;
const ANCHO = 960;
const anchoPalabra = (w: string) => w.length * SIZE * 0.56 + 30;

type Bloque = { lineas: Palabra[][]; ini: number; fin: number };

/** Parte las palabras en bloques de 1–2 líneas: corta en final de frase y cuando no cabe. */
export const trocear = (pal: Palabra[]): Bloque[] => {
  const out: { lineas: Palabra[][] }[] = [];
  let cur: Palabra[][] = [[]];
  let ancho = 0;
  const cerrar = () => {
    if (cur[0].length) out.push({ lineas: cur.filter((l) => l.length) });
    cur = [[]];
    ancho = 0;
  };
  pal.forEach((p, i) => {
    const a = anchoPalabra(p.texto);
    if (ancho + a > ANCHO) {
      if (cur.length === 2) {
        // no dejar colgada al final del bloque una palabra corta sin puntuación («a», «y», «en»): pasa al siguiente
        const ult = cur[1][cur[1].length - 1];
        const colgada = ult && cur[1].length > 1 && norm(ult.texto).length <= 3 && !/[.,;:?!]$/.test(ult.texto) ? cur[1].pop()! : null;
        cerrar();
        if (colgada) {
          cur[0].push(colgada);
          ancho = anchoPalabra(colgada.texto);
        }
      } else {
        cur.push([]);
        ancho = 0;
      }
    }
    cur[cur.length - 1].push(p);
    ancho += a;
    const sig = pal[i + 1];
    const n = cur.flat().length;
    const pausa = sig ? sig.inicio - p.fin > 0.28 : true;
    const escena = sig && sig.escena !== p.escena;
    const finFrase = /[.?!]$/.test(p.texto) || (/:$/.test(p.texto) && n >= 3);
    if (escena || finFrase || (/[,;]$/.test(p.texto) && n >= 4 && pausa)) cerrar();
  });
  cerrar();
  // cada bloque entra 0,12 s antes de su primera palabra, pero nunca antes de que haya sonado la última del anterior
  const res: Bloque[] = [];
  out.forEach((b, k) => {
    const todas = b.lineas.flat();
    const sig = out[k + 1]?.lineas[0][0];
    const previo = res[k - 1];
    const ini = Math.max(todas[0].inicio - 0.12, previo ? previo.fin : -Infinity);
    const ultima = todas[todas.length - 1];
    const fin = Math.max(ultima.inicio + 0.1, Math.min(sig ? sig.inicio - 0.12 : Infinity, ultima.fin + 0.7));
    res.push({ lineas: b.lineas, ini, fin });
  });
  return res;
};

export const Subtitulos: React.FC<{ bloques: Bloque[]; t: number; ocultarAntesDe?: number }> = ({ bloques, t, ocultarAntesDe = 0 }) => {
  if (t < ocultarAntesDe) return null;
  const b = bloques.find((x) => t >= x.ini && t < x.fin);
  if (!b) return null;
  const todas = b.lineas.flat();
  const ent = sp(t, b.ini, { damping: 16, stiffness: 220 });
  const sal = clamp01((t - (b.fin - 0.12)) / 0.12);
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: TOP + 92, textAlign: "center", opacity: Math.min(1, ent * 1.5) * (1 - sal), transform: `translateY(${(1 - ent) * 18}px)` }}>
      {b.lineas.map((ln, i) => (
        <div key={i} style={{ fontFamily: UI, fontWeight: 700, fontSize: SIZE, lineHeight: 1.24, letterSpacing: -1, whiteSpace: "nowrap" }}>
          {ln.map((w, k) => {
            const idx = todas.indexOf(w);
            const sig = todas[idx + 1];
            const visible = t >= w.inicio - 0.04;
            const activa = visible && t < (sig ? sig.inicio - 0.02 : w.fin + 0.2);
            const p = sp(t, w.inicio - 0.04, { damping: 15, stiffness: 300 });
            return (
              <span
                key={k}
                style={{
                  display: "inline-block", padding: "0px 13px", margin: "0px 1px", borderRadius: 14,
                  background: activa ? C.acento : "rgba(0,0,0,0)", color: activa ? C.oscuro : C.texto,
                  opacity: visible ? Math.min(1, p * 1.4) : 0, transform: `scale(${visible ? 0.84 + 0.16 * p : 1})`,
                  textShadow: activa ? "none" : "0 4px 18px rgba(0,0,0,0.9)",
                  boxShadow: activa ? `0 6px 26px ${C.acento}55` : "none",
                }}
              >
                {w.texto}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Degradado oscuro detrás de la franja de subtítulos para que se lean sobre cualquier plano. */
export const VeloSuperior: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 640, opacity, background: "linear-gradient(180deg, rgba(11,13,18,0.96) 0%, rgba(11,13,18,0.9) 62%, rgba(11,13,18,0) 100%)" }} />
);
