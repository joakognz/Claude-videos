#!/usr/bin/env node
/** Fotogramas de prueba: node scripts/fotos.mjs episodios/ep-03-p1.json salida 540 t1 t2 … (segundos). El ancho 540 = prueba a 540x960. */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [fichero, salida, ancho, ...ts] = process.argv.slice(2);
const CHROME_LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_CHROME ?? (fs.existsSync(CHROME_LOCAL) ? CHROME_LOCAL : undefined);
const ep = JSON.parse(fs.readFileSync(path.resolve(ROOT, fichero), "utf8"));
fs.mkdirSync(salida, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: ep.composicion ?? "Master", inputProps: ep, puppeteerInstance: browser, logLevel: "error" });
for (const t of ts) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(t) * 30));
  await renderStill({ serveUrl, composition, inputProps: composition.props, frame, scale: Number(ancho) / 1080, output: path.join(salida, `t${String(t).padStart(6, "0")}.png`), puppeteerInstance: browser, imageFormat: "png", logLevel: "error" });
}
await browser.close({ silent: true });
console.log(`${ts.length} fotogramas en ${salida}`);
