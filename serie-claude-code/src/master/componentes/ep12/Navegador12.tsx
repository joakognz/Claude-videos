/**
 * EP.12 · Piezas de la intro «el navegador trabaja solo»: la ventana del navegador (con el brillo de «Claude al
 * mando»), el formulario de un proyecto nuevo que se rellena solo y la portada de la serie que se abre en esa ventana.
 * Datos ficticios: el proyecto es el de la floristería que sale en la serie.
 */
import React from "react";
import { C, MONO, TITULO, UI, clamp01, sp } from "../../nucleo";

export const VENTANA = { x: 540, y: 1050, w: 920, h: 700, barra: 84 };
/** Esquina superior izquierda del área de la página (coordenadas del lienzo). */
export const PAGINA = { x: VENTANA.x - VENTANA.w / 2, y: VENTANA.y - VENTANA.h / 2 + VENTANA.barra, w: VENTANA.w, h: VENTANA.h - VENTANA.barra };

/** Ventana de navegador. `brillo` (0-1) enciende el borde coral: la ventana la está manejando Claude. */
export const Ventana: React.FC<{
  t: number; url: string; letras: number; carga?: number; brillo?: number; children?: React.ReactNode;
}> = ({ t, url, letras, carga = 1, brillo = 0, children }) => {
  const escribiendo = letras < url.length;
  const { w, h, barra } = VENTANA;
  return (
    <div
      style={{
        position: "absolute", left: VENTANA.x - w / 2, top: VENTANA.y - h / 2, width: w, height: h, borderRadius: 28, overflow: "hidden",
        background: "#15171D", border: `3px solid ${brillo > 0.02 ? `color-mix(in srgb, ${C.acento} ${Math.round(brillo * 100)}%, ${C.borde})` : C.borde}`,
        boxShadow: `0 40px 100px rgba(0,0,0,0.65), 0 0 ${70 * brillo}px rgba(217,119,87,${0.55 * brillo})`,
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{ height: barra, flexShrink: 0, background: "#23262E", display: "flex", alignItems: "center", gap: 14, padding: "0 24px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c, opacity: 0.85 }} />
        ))}
        <div style={{ flex: 1, marginLeft: 16, height: 54, borderRadius: 27, background: "#121419", border: `2px solid ${escribiendo && letras > 0 ? C.acento : "#363B47"}`, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", overflow: "hidden" }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#8C93A3" strokeWidth={2.4} style={{ flexShrink: 0 }}>
            <circle cx={10.5} cy={10.5} r={6.5} />
            <path d="M15.5 15.5 L21 21" />
          </svg>
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.texto, whiteSpace: "nowrap" }}>
            {url.slice(0, Math.max(0, Math.floor(letras)))}
            {escribiendo && <span style={{ display: "inline-block", width: 3, height: 32, marginLeft: 3, verticalAlign: "middle", background: C.acento, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {children}
        {carga > 0 && carga < 1 && <div style={{ position: "absolute", left: 0, top: 0, height: 6, width: `${carga * 100}%`, background: C.acento, boxShadow: `0 0 12px ${C.acento}` }} />}
      </div>
    </div>
  );
};

/** Botón «Crear» del formulario (coordenadas dentro de la página). */
export const BOTON_CREAR = { x: 56, y: 400, w: 210, h: 78 };

/** Formulario «Nuevo proyecto»: el nombre se escribe solo, Claude pulsa «Crear» y sale el aviso de proyecto creado. */
export const FormProyecto: React.FC<{
  t: number; nombre: string; letras: number; pulsa: number; creando: number; hecho: number; opacity?: number;
}> = ({ t, nombre, letras, pulsa, creando, hecho, opacity = 1 }) => {
  const escribiendo = letras < nombre.length;
  const s = sp(t, hecho, { damping: 13, stiffness: 190 });
  const campo = (etiqueta: string, valor: React.ReactNode, y: number, activo: boolean) => (
    <>
      <div style={{ position: "absolute", left: 56, top: y, fontFamily: UI, fontWeight: 600, fontSize: 26, color: C.gris }}>{etiqueta}</div>
      <div
        style={{
          position: "absolute", left: 56, top: y + 42, width: PAGINA.w - 112, height: 80, borderRadius: 14, boxSizing: "border-box",
          border: `3px solid ${activo ? C.acento : C.borde}`, background: "#0F1116", display: "flex", alignItems: "center", padding: "0 26px",
          fontFamily: MONO, fontWeight: 500, fontSize: 34, color: C.texto, boxShadow: activo ? `0 0 24px ${C.acento}44` : "none",
        }}
      >
        {valor}
      </div>
    </>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <div style={{ position: "absolute", left: 56, top: 34, fontFamily: TITULO, fontWeight: 800, fontSize: 46, color: C.texto, letterSpacing: -1, opacity: 1 - clamp01(s * 2) }}>Nuevo proyecto</div>
      {campo(
        "Nombre del proyecto",
        <>
          {nombre.slice(0, Math.max(0, Math.floor(letras)))}
          {escribiendo && <span style={{ display: "inline-block", width: 3, height: 38, marginLeft: 2, background: C.acento, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
        </>,
        112,
        escribiendo,
      )}
      {campo("Ubicación", <span style={{ color: C.gris }}>Sin organización</span>, 248, false)}
      <div
        style={{
          position: "absolute", left: BOTON_CREAR.x, top: BOTON_CREAR.y, width: BOTON_CREAR.w, height: BOTON_CREAR.h, borderRadius: 16,
          background: C.acento, color: C.oscuro, fontFamily: UI, fontWeight: 700, fontSize: 32, letterSpacing: 1,
          display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.1 * pulsa})`,
          boxShadow: `0 10px 30px ${C.acento}55`, opacity: 1 - 0.45 * clamp01(creando * 3) * (1 - s),
        }}
      >
        CREAR
      </div>
      <div style={{ position: "absolute", left: BOTON_CREAR.x + BOTON_CREAR.w + 40, top: BOTON_CREAR.y, height: BOTON_CREAR.h, display: "flex", alignItems: "center", fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.gris, letterSpacing: 1 }}>
        CANCELAR
      </div>
      {/* aviso de proyecto creado (arriba, en el sitio del título) */}
      {t > hecho && (
        <div
          style={{
            position: "absolute", left: 56, right: 56, top: 22, height: 76, borderRadius: 16, background: "#1D2A22", border: "3px solid #3FB97A",
            display: "flex", alignItems: "center", gap: 18, padding: "0 24px", opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * -30}px)`,
            fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.texto,
          }}
        >
          <svg width={40} height={40} viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={11} fill="#3FB97A" />
            <path d="M6.5 12.5 L10.3 16 L17.5 8.5" fill="none" stroke="#0B0D12" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={18} strokeDashoffset={18 * (1 - clamp01(s * 1.3))} />
          </svg>
          Proyecto creado
          <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 28, color: C.gris }}>{nombre}</span>
        </div>
      )}
    </div>
  );
};
