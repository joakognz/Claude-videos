// Exporta a PNG los artboards del logo de AIgencyx Labs tal como están en el diseño del usuario (sin tocar nada).
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const [src, font, out] = process.argv.slice(2);
const boards = { "Main.dc.html": "naranja", "Grande.dc.html": "naranja_grande", "Oscuro.dc.html": "oscuro", "Claro.dc.html": "claro" };
(async () => {
  const b = await chromium.launch();
  const fontB64 = fs.readFileSync(font).toString("base64");
  for (const [file, name] of Object.entries(boards)) {
    const html = fs.readFileSync(path.join(src, file), "utf8");
    const cuerpo = html.slice(html.indexOf("</helmet>") + 9, html.indexOf("</x-dc>"));
    const props = JSON.parse(html.match(/data-props='([^']+)'/)[1]);
    const marcado = cuerpo.replaceAll("{{accent}}", props.accent.default);
    if (/<script|on\w+=/i.test(marcado)) throw new Error("marcado inesperado en " + file);
    const page = await b.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
      @font-face{font-family:'Sora';src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 800;}
      body{margin:0}</style></head><body>${marcado}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    const ok = await page.evaluate(() => document.fonts.check("800 300px Sora"));
    await page.screenshot({ path: path.join(out, `aigencyx_${name}.png`) });
    console.log(name, "accent", props.accent.default, "sora:", ok);
    await page.close();
  }
  await b.close();
})();
