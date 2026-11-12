#!/usr/bin/env node
/**
 * Portadas de los reels: una imagen 1080x1920 por JSON que tenga "portada".
 *
 *   node scripts/portada.mjs                          → todos los episodios/ep-*.json con "portada"
 *   node scripts/portada.mjs episodios/ep-04-p2.json  → solo ese → out/<salida>_portada.png
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = path.resolve(ROOT, process.env.SALIDA ?? "out");
const CHROME_LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_CHROME ?? (fs.existsSync(CHROME_LOCAL) ? CHROME_LOCAL : undefined);

const args = process.argv.slice(2);
const ficheros = (args.length ? args : fs.readdirSync(path.join(ROOT, "episodios")).filter((f) => /^ep-\d+(-p\d+)?\.json$/.test(f)).sort().map((f) => `episodios/${f}`))
  .map((f) => path.resolve(ROOT, f))
  .filter((f) => JSON.parse(fs.readFileSync(f, "utf8")).portada);
fs.mkdirSync(SALIDA, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable });
for (const f of ficheros) {
  const ep = JSON.parse(fs.readFileSync(f, "utf8"));
  const nombre = `${ep.salida ?? `claude-code-ep-${String(ep.episodio).padStart(2, "0")}`}_portada`;
  const composition = await selectComposition({ serveUrl, id: "Portada", inputProps: ep, puppeteerInstance: browser, logLevel: "warn" });
  const out = path.join(SALIDA, `${nombre}.png`);
  await renderStill({ serveUrl, composition, inputProps: ep, frame: 0, output: out, imageFormat: "png", puppeteerInstance: browser, logLevel: "warn", overwrite: true });
  console.log(`  ✓ ${path.relative(ROOT, out)}`);
}
await browser.close({ silent: true });
