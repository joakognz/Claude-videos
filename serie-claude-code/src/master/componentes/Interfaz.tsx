/**
 * Piezas de interfaz del EP.7 en adelante: imágenes del usuario (iconos, esquemas: nunca redibujados), ventana con
 * barra de título, texto que se teclea, indicador de pasos y pequeñas formas planas en el color de acento.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";

/** Imagen de un fichero (icono o ilustración del usuario) centrada en (x, y): entra con spring y sale. Se anima entera. */
export const Imagen: React.FC<{
  src: string; x: number; y: number; w: number; t: number; at: number; out?: number;
  rot?: number; escala?: number; tenue?: number; dy?: number; sombra?: boolean; desde?: number;
}> = ({ src, x, y, w, t, at, out, rot = 0, escala = 1, tenue = 1, dy = 0, sombra = true, desde = 0.3 }) => {
  const v = vis(t, at, out, desde);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y + dy}px) scale(${v.scale * escala}) rotate(${rot + (1 - v.s) * -16}deg)`, opacity: v.opacity * tenue, filter: sombra ? "drop-shadow(0 16px 30px rgba(0,0,0,0.5))" : undefined }}>
        <Img src={staticFile(src)} style={{ width: w, height: "auto", display: "block" }} />
      </div>
    </div>
  );
};

/** Golpe de atención: 0 → 1 → 0 alrededor de `at` (para hundir una tecla o hacer latir algo). */
export const pulso = (t: number, at: number, dur = 0.28) => Math.sin(clamp01((t - at) / dur) * Math.PI);

/** Texto que se va tecleando entre a y b. */
export const tecleo = (texto: string, t: number, a: number, b: number) => texto.slice(0, Math.round(clamp01((t - a) / Math.max(0.05, b - a)) * texto.length));

/** Cursor de texto parpadeante. */
export const Caret: React.FC<{ t: number; h: number; color?: string }> = ({ t, h, color = C.texto }) => (
  <span style={{ display: "inline-block", width: Math.max(3, h * 0.08), height: h, marginLeft: 3, verticalAlign: "middle", background: color, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.12 }} />
);

/** Ventana con barra de título (logo real de la app en la barra). Los hijos se colocan en coordenadas de la ventana. */
export const Ventana: React.FC<{
  x: number; y: number; w: number; h: number; t: number; at: number; out?: number;
  titulo?: string; logo?: string; logoTab?: string; sacudida?: number; children?: React.ReactNode; fondo?: string;
}> = ({ x, y, w, h, t, at, out, titulo, logo, logoTab, sacudida = 0, children, fondo = "#10131A" }) => {
  const v = vis(t, at, out, 0.86);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: v.opacity, transform: `translate(${sacudida}px, ${v.y}px) scale(${v.scale})`, borderRadius: 28, background: fondo, border: `3px solid ${C.borde}`, boxShadow: "0 40px 90px rgba(0,0,0,0.6)", overflow: "hidden" }}>
      <div style={{ height: 66, background: C.panel, borderBottom: `2px solid ${C.borde}`, display: "flex", alignItems: "center", gap: 12, padding: "0 22px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 17, height: 17, borderRadius: "50%", background: c, opacity: 0.85 }} />
        ))}
        {logo && <Img src={staticFile(logo)} style={{ width: 36, height: "auto", marginLeft: 14 }} />}
        {titulo && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 10, padding: "8px 16px", borderRadius: 12, background: "#10131A", border: `2px solid ${C.borde}` }}>
            {logoTab && <Img src={staticFile(logoTab)} style={{ width: 28, height: "auto" }} />}
            <span style={{ fontFamily: UI, fontWeight: 600, fontSize: 26, color: C.texto, whiteSpace: "nowrap" }}>{titulo}</span>
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: 0, top: 68, right: 0, bottom: 0 }}>{children}</div>
    </div>
  );
};

/** Caja en coordenadas del lienzo (esquina superior izquierda) con entrada spring y salida. */
export const Caja: React.FC<{ x: number; y: number; w: number; h?: number; t: number; at: number; out?: number; desde?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, t, at, out, desde = 0.85, style, children }) => {
  const v = vis(t, at, out, desde);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, ...style }}>{children}</div>
  );
};

/** Barras abstractas de texto o código (sin texto inventado). */
export const Barras: React.FC<{ anchos: number[]; color?: string; alto?: number; hueco?: number; p?: number }> = ({ anchos, color = C.tenue, alto = 14, hueco = 16, p = 1 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: hueco }}>
    {anchos.map((a, i) => (
      <div key={i} style={{ height: alto, width: a * clamp01(p * anchos.length - i), borderRadius: alto / 2, background: color }} />
    ))}
  </div>
);

/** Marca de verificación que se dibuja (p: 0 → 1). */
export const Check: React.FC<{ size: number; p: number; color?: string; grosor?: number }> = ({ size, p, color = C.acento, grosor = 3.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - clamp01(p))} />
  </svg>
);
export const Aspa: React.FC<{ size: number; p: number; color?: string; grosor?: number }> = ({ size, p, color = C.acento, grosor = 3.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 6 L18 18" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeDasharray={17} strokeDashoffset={17 * (1 - clamp01(p * 2))} />
    <path d="M18 6 L6 18" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeDasharray={17} strokeDashoffset={17 * (1 - clamp01(p * 2 - 1))} />
  </svg>
);

/** Flecha circular de rebobinado (antihoraria) centrada en (x, y): gira sola alrededor de lo que rodea. */
export const Rebobinado: React.FC<{ x: number; y: number; r: number; t: number; at: number; out?: number; grosor?: number; vel?: number; color?: string }> = ({ x, y, r, t, at, out, grosor = 10, vel = 150, color = C.acento }) => {
  const v = vis(t, at, out, 0.6);
  if (!v.on) return null;
  const p = ramp(t, at, at + 0.5);
  const R = r;
  const largo = 2 * Math.PI * R * 0.78;
  const giro = -(t - at) * vel;
  const s = r * 2 + 80;
  return (
    <div style={{ position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, opacity: v.opacity, transform: `scale(${v.scale}) rotate(${giro}deg)` }}>
      <svg width={s} height={s} viewBox={`${-s / 2} ${-s / 2} ${s} ${s}`}>
        {/* arco de 280° en sentido antihorario, con la punta al final */}
        <path d={`M ${R} 0 A ${R} ${R} 0 1 0 ${R * Math.cos(1.396)} ${R * Math.sin(1.396)}`} fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeDasharray={largo} strokeDashoffset={largo * (1 - p)} opacity={0.95} />
        <g transform={`translate(${R * Math.cos(1.396)} ${R * Math.sin(1.396)}) rotate(${80 - 180}) scale(${p})`}>
          <path d={`M ${grosor * 1.2} 0 L ${-grosor * 2.0} ${-grosor * 2.0} L ${-grosor * 1.2} 0 L ${-grosor * 2.0} ${grosor * 2.0} Z`} fill={color} stroke={color} strokeWidth={grosor * 0.5} strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
};

/** Indicador fijo de los cinco pasos (en pantalla, no en el lienzo): hechos con ✓, el actual resaltado con su nombre. */
export const PASOS = ["PIDES", "CHECKPOINT", "CLAUDE PROPONE", "TÚ DECIDES", "VUELVES ATRÁS"];
export const PasosHud: React.FC<{ t: number; at: number; out: number; inicios: number[] }> = ({ t, at, out, inicios }) => {
  const v = vis(t, at, out, 0.8);
  if (!v.on) return null;
  const actual = inicios.reduce((acc, ini, i) => (t >= ini ? i : acc), -1);
  const celda = 66;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 566, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, opacity: v.opacity, transform: `translateY(${-v.y * 0.4}px)` }}>
      {PASOS.map((nombre, i) => {
        const hecho = i < actual;
        const es = i === actual;
        const s = es ? sp(t, inicios[i], { damping: 10, stiffness: 220 }) : 1;
        return (
          <React.Fragment key={i}>
            <div style={{ height: celda, minWidth: celda, padding: es ? "0 20px 0 6px" : 0, boxSizing: "border-box", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: hecho || es ? C.acento : C.panel2, border: `3px solid ${hecho || es ? C.acento : C.borde}`, transform: `scale(${es ? 0.8 + 0.2 * s : 1})`, boxShadow: es ? `0 0 26px ${C.acento}88` : "none" }}>
              {hecho ? (
                <Check size={38} p={1} color={C.oscuro} />
              ) : (
                <div style={{ width: es ? 40 : undefined, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 36, color: es ? C.oscuro : C.gris }}>{i + 1}</div>
              )}
              {es && <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: 1, color: C.oscuro, whiteSpace: "nowrap" }}>{nombre}</div>}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Burbuja de mensaje del usuario en el chat. */
export const Mensaje: React.FC<{ texto: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ texto, size = 30, style }) => (
  <div style={{ padding: `${size * 0.5}px ${size * 0.75}px`, borderRadius: size * 0.6, background: C.panel2, border: `2px solid ${C.borde}`, fontFamily: UI, fontWeight: 600, fontSize: size, color: C.texto, lineHeight: 1.25, ...style }}>{texto}</div>
);

/** Cuadro de texto del chat de Claude Code. */
export const CajaTexto: React.FC<{ w: number; t: number; texto: string; activo?: boolean; size?: number; vacio?: string; mono?: boolean }> = ({ w, t, texto, activo = true, size = 30, vacio, mono = false }) => (
  <div style={{ width: w, minHeight: size * 2.5, boxSizing: "border-box", padding: `${size * 0.6}px ${size * 0.8}px`, borderRadius: size * 0.7, background: C.panel, border: `3px solid ${activo ? C.acento : C.borde}`, fontFamily: mono ? MONO : UI, fontWeight: mono ? 700 : 600, fontSize: size, color: mono ? C.acento : C.texto, lineHeight: 1.25, boxShadow: activo ? `0 0 30px ${C.acento}33` : "none" }}>
    {texto}
    {activo && <Caret t={t} h={size * 1.05} />}
    {!texto && vacio && <span style={{ color: C.tenue, marginLeft: 8 }}>{vacio}</span>}
  </div>
);

/** Peticiones de ejemplo del episodio (datos ficticios, las mismas en todas las escenas). */
export const PETICION_1 = "Cambia el título de la portada por «Bienvenido a mi negocio»";
export const PETICION_2 = "Mejor ponlo todo en mayúsculas";
export const ROJO = "#F7768E";
export const VERDE = "#9ECE6A";

/** Sello «PASO N» grande en el centro mientras la voz lo dice. */
export const Paso: React.FC<{ n: number; t: number; at: number; out: number; y?: number }> = ({ n, t, at, out, y = 1130 }) => {
  if (t < at) return null;
  const s = sp(t, at, { damping: 11, stiffness: 230 });
  const v = vis(t, at, out);
  if (!v.on) return null;
  const imp = t - at;
  const sac = imp > 0.12 && imp < 0.45 ? Math.sin(imp * 70) * (0.45 - imp) * 18 : 0;
  return (
    <div style={{ position: "absolute", left: 540, top: y, width: 0, height: 0, zIndex: 5 }}>
      <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateX(${sac}px) scale(${1.9 - 0.9 * s}) rotate(-4deg)`, opacity: Math.min(1, s * 2.5) * (1 - v.out), whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 150, letterSpacing: 2, color: C.oscuro, padding: "26px 64px", borderRadius: 40, background: C.acento, boxShadow: `0 0 90px ${C.acento}88, 0 30px 80px rgba(0,0,0,0.6)` }}>
        PASO {n}
      </div>
    </div>
  );
};
