/**
 * EP.6 · bloque «Claves» (escenas claves → clave1 → clave2 → clave3):
 * ¿Qué ha cambiado? → TRES CLAVES (1 2 3) → la cámara baja por las tres:
 * CLAVE 1 · DA CONTEXTO: para quién (Fontanero de Madrid) · de qué va (Web de una página) · qué estilo (Colores azules),
 *   los datos de la petición buena.
 * CLAVE 2 · ACOTA LA TAREA: las secciones de esa web; el marco de recorte señala lo que SÍ toca y el candado lo que NO.
 * CLAVE 3 · SEÑALA EJEMPLOS: una referencia y una captura van a Claude Code → 1 EJEMPLO > 1.000 EXPLICACIONES.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { C, TITULO, UI, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";
import { Frase, Num, Pop } from "../../ep05/kit";
import { Ico, Medalla6 } from "../../ep06/kit6";

const S1 = 1800;
const S2 = 3000;
const S3 = 4200;

const tiempos = (L: LineaT) => ({
  que: L.ini("claves"),
  cambiado: L.en("claves", "cambiado?"),
  tres: L.en("claves", "Tres"),
  claves: L.en("claves", "claves."),
  c1: L.ini("clave1"),
  contexto: L.en("clave1", "contexto."),
  dile1: L.en("clave1", "Dile"),
  quien: L.en("clave1", "quién"),
  va: L.en("clave1", "va"),
  estilo: L.en("clave1", "estilo"),
  fin1: L.fin("clave1"),
  c2: L.ini("clave2"),
  acota: L.en("clave2", "Acota"),
  tarea: L.en("clave2", "tarea."),
  exactamente: L.en("clave2", "exactamente"),
  toque: L.en("clave2", "toque…"),
  no: L.en("clave2", "no."),
  fin2: L.fin("clave2"),
  c3: L.ini("clave3"),
  senala: L.en("clave3", "Señala"),
  ejemplos: L.en("clave3", "ejemplos."),
  referencia: L.en("clave3", "referencia"),
  captura: L.en("clave3", "captura,"),
  pasasela: L.en("clave3", "pásasela."),
  un: L.en("clave3", "Un"),
  vale: L.en("clave3", "vale"),
  mil: L.en("clave3", "mil"),
  explicaciones: L.en("clave3", "explicaciones."),
});

const Titulo: React.FC<{ texto: string; y: number; t: number; at: number; out: number }> = ({ texto, y, t, at, out }) => {
  const v = vis(t, at, out, 0.6);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: 540, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 86, color: C.texto, letterSpacing: 1 }}>{texto}</div>
    </div>
  );
};

/** Fila de la clave 1: icono · dato que pides → valor de la petición del fontanero. */
const FilaContexto: React.FC<{ y: number; icono: string; dato: string; valor: string; t: number; at: number; out: number; activa: boolean }> = ({ y, icono, dato, valor, t, at, out, activa }) => {
  const v = vis(t, at, out, 0.7);
  if (!v.on) return null;
  const val = sp(t, at + 0.3, { damping: 14, stiffness: 180 });
  return (
    <div style={{ position: "absolute", left: 80, top: y - 64, width: 920, height: 128, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
      <div style={{ height: "100%", boxSizing: "border-box", borderRadius: 30, background: C.panel, border: `3px solid ${activa ? C.acento : C.borde}`, boxShadow: activa ? `0 0 40px ${C.acento}44` : "0 20px 50px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", gap: 26, padding: "0 28px" }}>
        <Medalla6 nombre={icono} size={88} activo={activa ? 1 : 0.4} />
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 44, color: C.texto, whiteSpace: "nowrap" }}>{dato}</div>
        <div style={{ flex: 1 }} />
        <div style={{ opacity: Math.min(1, val * 1.5), transform: `translateX(${(1 - val) * 30}px)`, fontFamily: UI, fontWeight: 700, fontSize: 34, color: C.acentoSuave, whiteSpace: "nowrap", padding: "8px 18px", borderRadius: 999, background: C.panel2, border: `2px solid ${C.borde}` }}>{valor}</div>
      </div>
    </div>
  );
};

const SECCIONES = [
  { icono: "llave", texto: "Cabecera" },
  { icono: "bocadillo", texto: "Botón de WhatsApp" },
  { icono: "precio", texto: "Precios" },
];

export const Claves: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 880, z: 1.04 },
    { t: T.tres - 0.2, x: 540, y: 920, z: 1.06, d: 0.7 },
    { t: T.c1 - 0.3, x: 540, y: S1 - 200, z: 1.04, d: 0.9 },
    { t: T.dile1 - 0.2, x: 540, y: S1 + 30, z: 1.02, d: 0.8 },
    { t: T.c2 - 0.3, x: 540, y: S2 - 200, z: 1.04, d: 0.9 },
    { t: T.exactamente - 0.2, x: 540, y: S2 + 60, z: 1.04, d: 0.8 },
    { t: T.c3 - 0.3, x: 540, y: S3 - 200, z: 1.04, d: 0.9 },
    { t: T.referencia - 0.25, x: 540, y: S3 + 20, z: 1.04, d: 0.8 },
    { t: T.un - 0.25, x: 540, y: S3 + 380, z: 1.04, d: 0.8 },
  ];
  const fuera0 = T.c1 + 0.3;
  const fuera1 = T.c2 + 0.4;
  const fuera2 = T.c3 + 0.4;
  const fin = hasta + 0.4;
  // clave 2: el marco de recorte sobre «Precios» y el candado en el resto
  const marco = ramp(t, T.toque - 0.1, T.toque + 0.4);
  const bloqueo = ramp(t, T.no - 0.05, T.no + 0.3);
  // clave 3: la referencia y la captura viajan a Claude Code
  const viaje = ramp(t, T.pasasela - 0.05, T.pasasela + 0.55);
  return (
    <Escena t={t} tomas={tomas}>
      {/* ── ¿Qué ha cambiado? Tres claves ── */}
      <div style={{ position: "absolute", left: 540, top: 660, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
          <Frase t={t} out={fuera0} size={80} palabras={[{ w: "¿Qué", at: T.que }, { w: "ha", at: T.que + 0.12 }, { w: "cambiado?", at: T.cambiado, acento: true }]} />
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <Pop key={i} x={250 + i * 290} y={930} t={t} at={T.tres - 0.05 + i * 0.16} out={fuera0} rot={i % 2 ? 10 : -10} latidos={[T.claves + 0.1]}>
          <Num n={i + 1} size={170} />
        </Pop>
      ))}
      <Etiqueta texto="TRES CLAVES" x={540} y={1130} t={t} at={T.claves - 0.05} out={fuera0} size={48} variante="acento" fuente="titulo" />

      {/* ── CLAVE 1 · DA CONTEXTO ── */}
      <Sello texto="CLAVE 1" x={540} y={S1 - 410} t={t} at={T.c1} out={fuera1} size={62} rot={-3} />
      <Titulo texto="DA CONTEXTO" y={S1 - 270} t={t} at={T.contexto - 0.1} out={fuera1} />
      <FilaContexto y={S1 - 100} icono="usuario" dato="Para quién" valor="Fontanero de Madrid" t={t} at={T.quien - 0.1} out={fuera1} activa={t >= T.quien - 0.1 && t < T.va - 0.1} />
      <FilaContexto y={S1 + 60} icono="documento" dato="De qué va" valor="Web de una página" t={t} at={T.va - 0.2} out={fuera1} activa={t >= T.va - 0.2 && t < T.estilo - 0.1} />
      <FilaContexto y={S1 + 220} icono="paleta" dato="Qué estilo" valor="Colores azules" t={t} at={T.estilo - 0.1} out={fuera1} activa={t >= T.estilo - 0.1} />

      {/* ── CLAVE 2 · ACOTA LA TAREA ── */}
      <Sello texto="CLAVE 2" x={540} y={S2 - 410} t={t} at={T.c2} out={fuera2} size={62} rot={3} />
      <Titulo texto="ACOTA LA TAREA" y={S2 - 270} t={t} at={T.acota - 0.1} out={fuera2} />
      <Pop x={540} y={S2 - 150} t={t} at={T.tarea - 0.05} out={fuera2}>
        <Ico nombre="recorte" size={80} grosor={2.4} dibujo={ramp(t, T.tarea - 0.05, T.tarea + 0.4)} />
      </Pop>
      {SECCIONES.map((sec, i) => {
        const y = S2 + 20 + i * 150;
        const v = vis(t, T.tarea + 0.1 + i * 0.14, fuera2, 0.7);
        if (!v.on) return null;
        const si = i === 2;
        const op = si ? 1 : 1 - 0.55 * bloqueo;
        return (
          <div key={sec.texto} style={{ position: "absolute", left: 130, top: y - 58, width: 820, height: 116, opacity: v.opacity * op, transform: `translateY(${v.y}px) scale(${v.scale})` }}>
            <div style={{ height: "100%", boxSizing: "border-box", borderRadius: 26, background: C.panel, border: `3px solid ${C.borde}`, display: "flex", alignItems: "center", gap: 24, padding: "0 28px" }}>
              {i === 1 ? <Img src={staticFile(ep.logos.whatsapp)} style={{ width: 64, height: 64, objectFit: "contain" }} /> : <Ico nombre={sec.icono} size={64} grosor={2.2} color={si ? C.acento : C.gris} />}
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 44, color: C.texto }}>{sec.texto}</div>
              <div style={{ flex: 1 }} />
              {!si && bloqueo > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: bloqueo, transform: `scale(${0.6 + 0.4 * bloqueo})` }}>
                  <Ico nombre="candado" size={56} color={C.gris} grosor={2.4} />
                  <div style={{ padding: "6px 18px", borderRadius: 999, border: `3px solid ${C.gris}`, color: C.gris, fontFamily: TITULO, fontWeight: 800, fontSize: 30 }}>NO</div>
                </div>
              )}
              {si && marco > 0.6 && (
                <div style={{ padding: "6px 20px", borderRadius: 999, background: C.acento, color: C.oscuro, fontFamily: TITULO, fontWeight: 800, fontSize: 34, opacity: ramp(t, T.toque + 0.2, T.toque + 0.4) }}>SÍ</div>
              )}
            </div>
          </div>
        );
      })}
      {marco > 0 && t < fuera2 && (
        <svg style={{ position: "absolute", left: 100, top: S2 + 320 - 88, overflow: "visible", opacity: 1 - ramp(t, fuera2 - 0.35, fuera2) }} width={880} height={176}>
          <rect x={4} y={4} width={872} height={168} rx={34} fill="none" stroke={C.acento} strokeWidth={7} strokeDasharray="26 16" pathLength={1000} strokeDashoffset={(1 - marco) * 1000} />
        </svg>
      )}

      {/* ── CLAVE 3 · SEÑALA EJEMPLOS ── */}
      <Sello texto="CLAVE 3" x={540} y={S3 - 410} t={t} at={T.c3} out={T.un + 0.1} size={62} rot={-3} />
      <Titulo texto="SEÑALA EJEMPLOS" y={S3 - 270} t={t} at={T.senala - 0.1} out={T.un + 0.2} />
      {(() => {
        const items = [
          { x: 290, at: T.referencia, titulo: "REFERENCIA", web: true },
          { x: 790, at: T.captura, titulo: "CAPTURA", web: false },
        ];
        return items.map((it, k) => {
          const v = vis(t, it.at - 0.08, fin, 0.6);
          if (!v.on) return null;
          // viajan hacia Claude Code y vuelven más pequeñas a su sitio, ya «entregadas»
          const dx = (540 - it.x) * Math.sin(viaje * Math.PI) * 0.55;
          const dy = 230 * Math.sin(viaje * Math.PI);
          const esc = 1 - 0.35 * Math.sin(viaje * Math.PI) - 0.12 * (viaje >= 1 ? 1 : 0);
          return (
            <div key={k} style={{ position: "absolute", left: it.x, top: S3 - 40, width: 0, height: 0 }}>
              <div style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${dx}px, ${dy + v.y}px) scale(${v.scale * esc}) rotate(${(k ? 4 : -4) * (1 - v.s)}deg)`, opacity: v.opacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative", width: 340, height: 230, borderRadius: 22, background: "#FFFFFF", boxShadow: "0 30px 70px rgba(0,0,0,0.55)", overflow: "hidden", padding: 18, boxSizing: "border-box" }}>
                  {it.web ? (
                    <>
                      <div style={{ height: 30, borderRadius: 8, background: "#C5CAD3", marginBottom: 14 }} />
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1.3, height: 120, borderRadius: 12, background: "#DCE1E8" }} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                          {[90, 70, 80, 50].map((w, j) => (
                            <div key={j} style={{ height: 14, width: `${w}%`, borderRadius: 7, background: "#C9CED6" }} />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ width: "100%", height: "100%", borderRadius: 12, background: "#E9ECF1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Ico nombre="captura" size={130} color="#8E96A4" grosor={1.6} />
                    </div>
                  )}
                  <div style={{ position: "absolute", right: 10, top: -6, transform: "rotate(18deg)" }}>
                    <Ico nombre="clip" size={70} color={C.acento} grosor={2.6} />
                  </div>
                </div>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.texto, letterSpacing: 1 }}>{it.titulo}</div>
              </div>
            </div>
          );
        });
      })()}
      <Logo src={ep.logos.claude_code} x={540} y={S3 + 230} w={150} t={t} at={T.pasasela - 0.15} out={fin} pulsos={[T.pasasela + 0.45]} />
      {/* 1 ejemplo > 1.000 explicaciones */}
      <Pop x={260} y={S3 + 520} t={t} at={T.un - 0.05} out={fin} rot={-8} latidos={[T.vale]}>
        <div style={{ width: 330, height: 230, boxSizing: "border-box", borderRadius: 30, background: C.acento, boxShadow: `0 0 60px ${C.acento}66`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 110, color: C.oscuro, lineHeight: 1 }}>1</div>
          <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 40, color: C.oscuro, letterSpacing: 1 }}>EJEMPLO</div>
        </div>
      </Pop>
      <Pop x={540} y={S3 + 520} t={t} at={T.vale - 0.05} out={fin}>
        <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 120, color: C.texto }}>&gt;</div>
      </Pop>
      <Pop x={815} y={S3 + 520} t={t} at={T.mil - 0.06} out={fin} rot={8}>
        <div style={{ position: "relative", width: 330, height: 230 }}>
          {[3, 2, 1, 0].map((k) => (
            <div key={k} style={{ position: "absolute", left: k * 10, top: k * -10, width: 300, height: 210, boxSizing: "border-box", borderRadius: 24, background: C.panel2, border: `3px solid ${C.borde}`, padding: 20, display: "flex", flexDirection: "column", gap: 10, opacity: 1 - k * 0.18 }}>
              {k === 0 && (
                <>
                  <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: C.gris, lineHeight: 1 }}>1.000</div>
                  <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 28, color: C.gris, letterSpacing: 1 }}>EXPLICACIONES</div>
                  {[80, 64, 72].map((w, j) => (
                    <div key={j} style={{ height: 10, width: `${w}%`, borderRadius: 5, background: C.borde }} />
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </Pop>
      <Flecha curva={{ a: { x: 400, y: S3 + 120 }, c: { x: 420, y: S3 + 230 }, b: { x: 470, y: S3 + 230 } }} p={ramp(t, T.pasasela - 0.05, T.pasasela + 0.35)} ancho={8} opacity={1 - ramp(t, fin - 0.4, fin)} />
      <Flecha curva={{ a: { x: 680, y: S3 + 120 }, c: { x: 660, y: S3 + 230 }, b: { x: 610, y: S3 + 230 } }} p={ramp(t, T.pasasela, T.pasasela + 0.4)} ancho={8} opacity={1 - ramp(t, fin - 0.4, fin)} />
    </Escena>
  );
};

export const eventosClaves = (L: LineaT): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.tres, sfx: "pop", vol: 0.35 },
    { t: T.claves, sfx: "tick", vol: 0.45 },
    { t: T.c1 + 0.08, sfx: "golpe", vol: 0.5 },
    { t: T.quien, sfx: "pop", vol: 0.3 },
    { t: T.va, sfx: "pop", vol: 0.3 },
    { t: T.estilo, sfx: "pop", vol: 0.3 },
    { t: T.fin1 - 0.1, sfx: "tick", vol: 0.45 },
    { t: T.c2 + 0.08, sfx: "golpe", vol: 0.5 },
    { t: T.toque, sfx: "pop", vol: 0.35 },
    { t: T.no, sfx: "tick", vol: 0.45 },
    { t: T.c3 + 0.08, sfx: "golpe", vol: 0.5 },
    { t: T.referencia, sfx: "pop", vol: 0.3 },
    { t: T.captura, sfx: "pop", vol: 0.3 },
    { t: T.pasasela, sfx: "whoosh", vol: 0.3 },
    { t: T.mil, sfx: "pop", vol: 0.35 },
    { t: T.explicaciones, sfx: "tick", vol: 0.5 },
  ];
};
