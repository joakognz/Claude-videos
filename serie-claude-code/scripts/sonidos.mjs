#!/usr/bin/env node
/**
 * Efectos de sonido con la librería del usuario (joakognz/sonidos-videos), para los episodios con
 * "efectos": { "cues": "episodios/ep-NN/cues.json" } en su JSON (EP.11 en adelante).
 *
 *   node scripts/sonidos.mjs episodios/ep-11.json [--repo RUTA_DE_LA_LIBRERIA]
 *
 * 1. Calcula la línea de tiempo del episodio (la misma que el render) y saca sus eventos de sonido.
 * 2. scripts/sfx_libreria.py elige un archivo real para cada evento, alinea su pico y ajusta su volumen.
 * 3. Deja public/episodios/ep-NN/cues.json (lo lee el render) y out/claude-code-ep-NN.sonidos.txt (momento → archivo).
 * Hay que volver a ejecutarlo si cambian la voz, el guion o los bloques.
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, selectComposition } from "@remotion/renderer";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME_LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_CHROME ?? (fs.existsSync(CHROME_LOCAL) ? CHROME_LOCAL : undefined);

const args = process.argv.slice(2);
const i = args.indexOf("--repo");
const repo = i >= 0 ? args.splice(i, 2)[1] : null;
if (!args.length) {
  console.error("Uso: node scripts/sonidos.mjs episodios/ep-NN.json [--repo RUTA]");
  process.exit(1);
}

const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable });
let fallos = 0;
for (const f of args) {
  const fichero = path.resolve(ROOT, f);
  const ep = JSON.parse(fs.readFileSync(fichero, "utf8"));
  const nn = String(ep.episodio).padStart(2, "0");
  // sin los cues: así la línea de tiempo no depende de un cues.json anterior
  const { efectos, ...sin } = ep;
  const composition = await selectComposition({ serveUrl, id: ep.composicion ?? "Master", inputProps: sin, puppeteerInstance: browser, logLevel: "warn" });
  const { calc } = composition.props;
  fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
  const salida = path.join(ROOT, "out", `claude-code-ep-${nn}.eventos.json`);
  fs.writeFileSync(salida, JSON.stringify({ duracion: calc.duracion, eventos: calc.eventos, palabras: calc.palabras }));
  console.log(`EP.${nn}: ${calc.eventos.length} eventos de sonido en ${calc.duracion.toFixed(1)} s`);
  const py = spawnSync("python3", [path.join(ROOT, "scripts/sfx_libreria.py"), "--episodio", fichero, "--eventos", salida, ...(repo ? ["--repo", repo] : [])], { stdio: "inherit" });
  if (py.status !== 0) fallos++;
  if (!efectos?.cues) console.warn(`  ⚠ ${f} no declara "efectos": { "cues": "episodios/ep-${nn}/cues.json" }: el render seguirá con los efectos antiguos`);
}
await browser.close({ silent: true });
process.exit(fallos ? 1 : 0);
