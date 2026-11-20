#!/usr/bin/env node
/**
 * Pasa un esquema HTML a PNG de 1920x1080 con el Chromium de la máquina.
 *   node briefs/esquemas/render.mjs briefs/esquemas/esquema_ep13.html briefs/serie-claude-code-ep-13/7_publicacion/esquema_ep13.png
 */
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = require(path.resolve("serie-claude-code/node_modules/playwright"));
}
const [entrada, salida] = process.argv.slice(2);
if (!entrada || !salida) {
  console.error("Uso: node briefs/esquemas/render.mjs <esquema.html> <salida.png>");
  process.exit(1);
}
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.resolve(entrada)).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.locator("#hoja").screenshot({ path: salida });
await browser.close();
console.log(`✓ ${salida}`);
