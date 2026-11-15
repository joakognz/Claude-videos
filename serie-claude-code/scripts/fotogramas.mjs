/**
 * Fotogramas sueltos de un episodio para revisar escenas sin renderizar el vídeo.
 *   node scripts/fotogramas.mjs episodios/ep-07.json out/fotos 12.5 30 "paso3+0.8" …
 * Cada instante es un segundo del reel o «escena+desfase» (desde la primera palabra de esa escena).
 * Variables: ESCALA (por defecto 0.5), BLOQUES="intro,miedo" para montar solo esos bloques.
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME_LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_CHROME ?? (fs.existsSync(CHROME_LOCAL) ? CHROME_LOCAL : undefined);
const [json, salida, ...instantes] = process.argv.slice(2);
const ep = JSON.parse(fs.readFileSync(path.resolve(ROOT, json), "utf8"));
if (process.env.BLOQUES) {
  const solo = process.env.BLOQUES.split(",");
  ep.bloques = ep.bloques.filter((b) => solo.includes(b.tipo));
}
fs.mkdirSync(salida, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: ep.composicion ?? "Episodio", inputProps: ep, puppeteerInstance: browser, logLevel: "warn" });
const pal = composition.props.calc.palabras;
let fallos = 0;
for (const ins of instantes) {
  const m = /^([a-z]\w*)([+-][\d.]+)?$/i.exec(ins);
  const t = m ? pal.find((p) => p.escena === m[1]).inicio + Number(m[2] ?? 0) : Number(ins);
  const frame = Math.max(0, Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps)));
  const nombre = `${String(frame).padStart(5, "0")}_${ins.replace(/[^\w.+-]/g, "")}.jpg`;
  try {
    await renderStill({ serveUrl, composition, inputProps: composition.props, frame, output: path.join(salida, nombre), imageFormat: "jpeg", jpegQuality: 85, scale: Number(process.env.ESCALA ?? 0.5), puppeteerInstance: browser, logLevel: "error" });
    console.log(`${nombre}  t=${t.toFixed(2)}`);
  } catch (e) {
    fallos++;
    console.error(`✗ ${ins} (t=${t.toFixed(2)}): ${String(e.message).split("\n").slice(0, 6).join(" | ")}`);
  }
}
await browser.close({ silent: true });
process.exit(fallos ? 1 : 0);
