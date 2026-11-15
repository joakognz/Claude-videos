#!/usr/bin/env node
/**
 * Fotogramas sueltos de un episodio para revisarlo sin renderizar el vídeo entero (un solo bundle).
 *
 *   node scripts/fotogramas.mjs episodios/ep-06.json 4.5 12 30.2 …   → out/fotogramas/ep-06_004.50.jpg …
 *
 * Opciones (variables de entorno): ESCALA (0.5), SALIDA (out/fotogramas).
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME_LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_CHROME ?? (fs.existsSync(CHROME_LOCAL) ? CHROME_LOCAL : undefined);
const [fichero, ...segundos] = process.argv.slice(2);
if (!fichero || !segundos.length) {
  console.error("Uso: node scripts/fotogramas.mjs episodios/ep-NN.json <segundo> [<segundo> …]");
  process.exit(1);
}
const escala = Number(process.env.ESCALA ?? 0.5);
const salida = path.resolve(ROOT, process.env.SALIDA ?? "out/fotogramas");
fs.mkdirSync(salida, { recursive: true });

const ep = JSON.parse(fs.readFileSync(path.resolve(ROOT, fichero), "utf8"));
const tag = `ep-${String(ep.episodio).padStart(2, "0")}`;
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: ep.composicion ?? "Episodio", inputProps: ep, puppeteerInstance: browser, logLevel: "warn" });
for (const s of segundos) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  const out = path.join(salida, `${tag}_${Number(s).toFixed(2).padStart(6, "0")}.jpg`);
  await renderStill({ serveUrl, composition, inputProps: composition.props, frame, output: out, imageFormat: "jpeg", jpegQuality: 85, scale: escala, puppeteerInstance: browser, logLevel: "warn", overwrite: true });
  console.log(out);
}
await browser.close({ silent: true });
