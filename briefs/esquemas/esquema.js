/*
 * Piezas de los esquemas de AIgencyx Labs (estilo de briefs/esquemas/referencias/): lienzo 1920x1080, fondo #1C1C1E,
 * cajas naranjas «a mano alzada» (rough.js, como Excalidraw), flechas blancas, Poppins y checks naranjas.
 * Se usa desde un HTML (ver esquema_ep13.html) y se pasa a PNG con render.mjs.
 */
const NARANJA = "#F2781F";
const BORDE = "#F7A766";
const GRIS = "#A4A4A5";

const svg = document.getElementById("lienzo");
const capa = document.getElementById("textos");
const rc = rough.svg(svg);
let semilla = 7;

/** Rectángulo redondeado como trazado SVG. */
const rectRedondo = (x, y, w, h, r) =>
  `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} ` +
  `L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

/** Caja naranja con título (y subtítulo opcional) centrados. */
function caja(x, y, w, h, titulo, { sub, size = 24 } = {}) {
  svg.appendChild(
    rc.path(rectRedondo(x, y, w, h, 10), { fill: NARANJA, fillStyle: "solid", stroke: BORDE, strokeWidth: 2, roughness: 0.9, bowing: 0.6, seed: semilla++ }),
  );
  const d = document.createElement("div");
  d.className = "caja";
  Object.assign(d.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
  d.innerHTML = `<div class="titulo" style="font-size:${size}px">${titulo}</div>${sub ? `<div class="sub">${sub}</div>` : ""}`;
  capa.appendChild(d);
}

/** Texto libre. ancla: "izq" | "centro" | "der". */
function texto(x, y, w, html, { size = 22, color = "#FFFFFF", peso = 400, ancla = "izq", alto = 1.4 } = {}) {
  const d = document.createElement("div");
  d.className = "texto";
  const left = ancla === "centro" ? x - w / 2 : ancla === "der" ? x - w : x;
  Object.assign(d.style, { left: `${left}px`, top: `${y}px`, width: `${w}px`, fontSize: `${size}px`, color, fontWeight: peso, textAlign: ancla === "centro" ? "center" : ancla === "der" ? "right" : "left", lineHeight: alto });
  d.innerHTML = html;
  capa.appendChild(d);
}

/** Lista con checks naranjas (✓) o avisos (!). */
function lista(x, y, w, items, { size = 24, hueco = 14 } = {}) {
  const d = document.createElement("div");
  d.className = "lista";
  Object.assign(d.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, fontSize: `${size}px`, gap: `${hueco}px` });
  d.innerHTML = items
    .map((it) => {
      const aviso = it.startsWith("!");
      const marca = aviso
        ? `<span class="marca aviso">!</span>`
        : `<svg class="marca" viewBox="0 0 24 24" width="${size * 0.85}" height="${size * 0.85}"><path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke="${NARANJA}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      return `<div class="item">${marca}<div>${aviso ? it.slice(1) : it}</div></div>`;
    })
    .join("");
  capa.appendChild(d);
}

/** Flecha blanca a mano alzada: de a a b, curvada por el punto de control c (opcional). */
function flecha(a, b, c, { color = "#FFFFFF", grosor = 2 } = {}) {
  const ctrl = c ?? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  svg.appendChild(rc.path(`M ${a.x} ${a.y} Q ${ctrl.x} ${ctrl.y} ${b.x} ${b.y}`, { stroke: color, strokeWidth: grosor, roughness: 0.8, bowing: 0.5, seed: semilla++ }));
  const ang = Math.atan2(b.y - ctrl.y, b.x - ctrl.x);
  const L = 18;
  for (const s of [-1, 1]) {
    const p = { x: b.x - L * Math.cos(ang + s * 0.45), y: b.y - L * Math.sin(ang + s * 0.45) };
    svg.appendChild(rc.line(p.x, p.y, b.x, b.y, { stroke: color, strokeWidth: grosor, roughness: 0.6, seed: semilla++ }));
  }
}

/** Título, subtítulo y firma del esquema. */
function cabecera(titulo, sub) {
  texto(65, 30, 1400, titulo, { size: 40, peso: 700 });
  if (sub) texto(65, 86, 1400, sub, { size: 22, color: GRIS });
  texto(1880, 1036, 400, "@aigencyx.labs", { size: 22, color: GRIS, peso: 700, ancla: "der" });
}
