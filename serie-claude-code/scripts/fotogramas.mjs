#!/usr/bin/env node
/**
 * Fotogramas sueltos de un episodio para revisarlo sin renderizar el vídeo entero.
 *
 *   node scripts/fotogramas.mjs episodios/ep-08.json 5.2 18.4 36 …   → out/fotogramas/ep-08/t005.20.jpg …
 *   ESCALA=0.5 node scripts/fotogramas.mjs …                         → a media resolución (más rápido)
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME_LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_CHROME ?? (fs.existsSync(CHROME_LOCAL) ? CHROME_LOCAL : undefined);
const [fichero, ...tiempos] = process.argv.slice(2);
if (!fichero || !tiempos.length) {
  console.error("Uso: node scripts/fotogramas.mjs episodios/ep-NN.json <segundos>…");
  process.exit(1);
}
const ep = JSON.parse(fs.readFileSync(path.resolve(ROOT, fichero), "utf8"));
const salida = path.join(ROOT, "out", "fotogramas", ep.carpeta ?? `ep-${String(ep.episodio).padStart(2, "0")}`);
fs.mkdirSync(salida, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: ep.composicion ?? "Episodio", inputProps: ep, puppeteerInstance: browser, logLevel: "warn" });
for (const s of tiempos) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  const out = path.join(salida, `t${Number(s).toFixed(2).padStart(6, "0")}.jpg`);
  await renderStill({ serveUrl, composition, inputProps: composition.props, frame, output: out, imageFormat: "jpeg", jpegQuality: 85, scale: Number(process.env.ESCALA ?? 0.5), puppeteerInstance: browser, logLevel: "warn" });
  console.log(path.relative(ROOT, out));
}
await browser.close({ silent: true });
