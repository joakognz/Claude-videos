# Logos de AIgencyx Labs (biblioteca común)

**Esta carpeta es la biblioteca de logos de todo el repositorio**: la serie «Máster de Claude Code» y los reels sueltos.
Antes de pedirle un logo al usuario, búscalo aquí (o en `_muestrario.png`). Cuando llegue uno nuevo, se guarda aquí y se
sube a GitHub, para que ninguna sesión tenga que volver a pedirlo.

**Regla:** los logos de marcas solo salen de aquí, de archivos que aporta el usuario. Nunca se redibujan, nunca se inventan
ni se sustituyen por una versión propia. Si un episodio necesita un logo que no está, se pide al usuario con el nombre
`logo_xxx` y se espera.

Se ven todos en `_muestrario.png`, cada uno sobre el fondo oscuro de la serie y sobre claro. Los originales, tal como
llegaron, están en `_originales/`. A los de esta carpeta solo se les ha quitado el fondo blanco liso y se han recortado
(`scripts/logo_sin_fondo.py`): ninguno se ha redibujado.

En el JSON del episodio van en `"logos"` (`id` → ruta en `public/`) y en Remotion se usan con
`<Logo src={ep.logos.xxx} … />` (`src/master/componentes/Logo.tsx`). En un reel suelto, copia el archivo a su `public/`.
**Logos oscuros** (negro o marrón sobre transparente): sobre el fondo #0B0D12 no se ven, así que van con
`ficha="tarjeta"` (tarjeta clara) o `ficha="circulo"` (ficha blanca).

| Nombre (`logo_xxx`) | Archivo | Sobre el fondo oscuro | Notas |
|---|---|---|---|
| logo_aigencyx | `aigencyx.png` | tal cual | **AIgencyx Labs**, versión «Oscuro» (círculo oscuro con aro naranja). 1338 px |
| logo_aigencyx_naranja | `aigencyx_naranja.png` | tal cual | AIgencyx Labs, versión «Naranja» |
| logo_aigencyx_naranja_grande | `aigencyx_naranja_grande.png` | tal cual | AIgencyx Labs, versión «Naranja grande» (letras más grandes) |
| logo_aigencyx_claro | `aigencyx_claro.png` | tal cual | AIgencyx Labs, versión «Claro» (crema con aro naranja) |
| logo_airtable | `airtable.png` | tarjeta clara | la caja de colores se ve; «Airtable» es gris oscuro |
| logo_anthropic | `anthropic.png` | tal cual | ficha clara 3D con la cabeza y «ANTHROPIC» (ya trae su fondo) |
| logo_astro | `astro.png` | tal cual | tarjeta azul noche con «astro» y la frase «I Build Fast Static Sites» (rectangular, con su fondo) |
| logo_aws | `aws.png` | tarjeta clara | la sonrisa naranja se ve; «aws» es azul marino |
| logo_chrome | `chrome.png` | tal cual | Google Chrome |
| logo_claude | `claude.png` | tal cual | asterisco coral |
| logo_claude_code | `claude-code-mascota.png` | tal cual | la mascota pixelada (cangrejo) |
| logo_claude_code_texto | `claude-code-pixel.png` | tal cual | rótulo «CLAUDE CODE» pixelado |
| logo_cloudflare_pages | `cloudflare_pages.png` | tarjeta clara | rayo naranja; «Pages» es negro |
| logo_drive | `drive.png` | tal cual | Google Drive (CTA: esquemas) |
| logo_gemini | `gemini.png` | tal cual | rótulo «Gemini» en degradado |
| logo_gemini_icono | `gemini_icono.png` | tal cual | tarjeta oscura con las estrellas 3D (rectangular, con su fondo) |
| logo_git | `git.png` | tarjeta clara | rombo naranja con «git» en marrón oscuro |
| logo_github_gato | `github.png` | ficha blanca | octocat negro sin círculo |
| logo_github_circulo | `github_circulo.png` | tal cual | octocat blanco dentro del círculo negro |
| logo_github | `github_texto.png` | tarjeta clara | rótulo «GitHub» negro (se le quitaron los cuadros incrustados) |
| logo_github_copilot | `github_copilot.png` | tal cual | la cabeza de Copilot (blanca con contorno negro) |
| logo_github_copilot_texto | `github_copilot_texto.png` | tarjeta clara | rótulo «Copilot» negro |
| logo_gmail | `gmail.png` | tal cual | la M de colores |
| logo_google_cloud | `google_cloud.png` | tarjeta clara | la nube de colores; «Google Cloud» es gris |
| logo_google_sheets | `google_sheets.png` | tarjeta clara | la hoja verde con «Google Sheets» en gris |
| logo_google_sheets_icono | `google_sheets_icono.png` | tal cual | solo la hoja verde |
| logo_hostinger | `hostinger.png` | tal cual (pequeño, mejor en tarjeta) | la H y «HOSTINGER» en morado |
| logo_live_server | `live_server.png` | tarjeta clara | ondas moradas; el texto «Live Server» es negro |
| logo_make | `make.png` | tarjeta clara | las tres barras moradas y «make» en negro |
| logo_make_icono | `make_icono.png` | tal cual | solo las tres barras |
| logo_mcp | `mcp.png` | ficha blanca | círculo negro con el símbolo blanco |
| logo_microsoft | `microsoft.png` | tarjeta clara | el texto es gris |
| logo_n8n | `n8n.png` | tarjeta clara | los nodos rosas se ven; «n8n» es azul marino |
| logo_netlify | `netlify.png` | tarjeta clara | los destellos se ven; el texto es verde oscuro |
| logo_nextjs | `nextjs.png` | tal cual | círculo negro con la N blanca (borde suave en lo oscuro) |
| logo_nextjs_texto | `nextjs_texto.png` | tarjeta clara | rótulo «NEXT.JS» negro |
| logo_nodejs | `nodejs.png` | tarjeta clara | hexágono verde; «node» es gris oscuro |
| logo_npm | `npm.png` | tal cual | rojo con letras blancas |
| logo_openai_codex | `openai_codex.png` | tal cual | la nube azul con `>_` |
| logo_openai_codex_app | `openai_codex_app.png` | tal cual | tarjeta «Codex App · OpenAI» con su fondo (cuadrada) |
| logo_php | `php.png` | tal cual | óvalo morado |
| logo_tailwind | `tailwind.png` | tal cual | ficha clara 3D con las ondas y «tailwindcss» |
| logo_vercel | `vercel.png` | tarjeta clara | triángulo y texto negros |
| logo_vite | `vite.png` | tarjeta clara | el rayo se ve; el texto «VITE» es negro |
| logo_vscode | `vscode.png` | tal cual | Visual Studio Code |
| logo_whatsapp | `whatsapp.png` | tal cual | burbuja verde con aro blanco |
| logo_word | `word.png` | tal cual | Microsoft Word |
| logo_wordpress | `wordpress.png` | ficha blanca | negro con la W y el aro calados (transparentes) |
| logo_youtube | `youtube.png` | tal cual | rectángulo rojo con el triángulo blanco |

**AIgencyx:** los cuatro salen de las exportaciones a 1600 px del lienzo del usuario «AIgencyx Labs — imagen de perfil»
(`_originales/aigencyx_*_1600.png`), recortadas en círculo con su aro. La captura de pantalla de ese lienzo está en
`_originales/aigencyx_captura.png`. Ojo: su naranja es el de la marca (#FF6B1A), no el coral de la serie.

**Iconos sueltos sacados de un rótulo** (`make_icono`, `google_sheets_icono`): solo se ha recortado el símbolo del
archivo original, sin tocarlo.

## Cómo añadir uno
Guarda el original en `_originales/` y la versión sin fondo con
`python scripts/logo_sin_fondo.py _originales/x.png x.png` (mira los modos en el propio script; si ya llega
transparente, `--modo ninguno` solo lo recorta). Rehaz el muestrario con
`python scripts/muestrario_logos.py public/logos public/logos/_muestrario.png`, comprueba que nada se ha comido,
añade su fila a la tabla y súbelo a GitHub.

Repetidos que llegaron en mejor resolución (Claude, Drive, Visual Studio Code y Word, a 3840 px): mismo diseño que
los de aquí, así que no se han sustituido. Si alguna vez hace falta un zoom muy grande, pídelos de nuevo.
