# Logos de la serie «Máster de Claude Code»

**Regla:** los logos de marcas solo salen de aquí, de archivos que aporta el usuario. Nunca se redibujan, nunca se inventan
ni se sustituyen por una versión propia. Si un episodio necesita un logo que no está, se pide al usuario con el nombre
`logo_xxx` y se espera.

Se ven todos en `_muestrario.png`, cada uno sobre el fondo oscuro de la serie y sobre claro. Los originales, tal como
llegaron, están en `_originales/`. A los de esta carpeta solo se les ha quitado el fondo blanco liso y se han recortado
(`scripts/logo_sin_fondo.py`): ninguno se ha redibujado.

En el JSON del episodio van en `"logos"` (`id` → ruta en `public/`) y en Remotion se usan con
`<Logo src={ep.logos.xxx} … />` (`src/master/componentes/Logo.tsx`).
**Logos oscuros** (negro o marrón sobre transparente): sobre el fondo #0B0D12 no se ven, así que van con
`ficha="tarjeta"` (tarjeta clara) o `ficha="circulo"` (ficha blanca).

| Nombre (`logo_xxx`) | Archivo | Sobre el fondo oscuro | Notas |
|---|---|---|---|
| logo_anthropic | `anthropic.png` | tal cual | ficha clara 3D con la cabeza y «ANTHROPIC» (ya trae su fondo) |
| logo_claude | `claude.png` | tal cual | asterisco coral |
| logo_claude_code | `claude-code-mascota.png` | tal cual | la mascota pixelada (cangrejo) |
| logo_claude_code_texto | `claude-code-pixel.png` | tal cual | rótulo «CLAUDE CODE» pixelado |
| logo_vscode | `vscode.png` | tal cual | Visual Studio Code |
| logo_word | `word.png` | tal cual | Microsoft Word |
| logo_microsoft | `microsoft.png` | tarjeta clara | el texto es gris |
| logo_drive | `drive.png` | tal cual | Google Drive (CTA: esquemas) |
| logo_github_gato | `github.png` | ficha blanca | octocat negro sin círculo |
| logo_github_circulo | `github_circulo.png` | tal cual | octocat blanco dentro del círculo negro |
| logo_github | `github_texto.png` | tarjeta clara | rótulo «GitHub» negro (se le quitaron los cuadros incrustados) |
| logo_github_copilot | `github_copilot.png` | tal cual | la cabeza de Copilot (blanca con contorno negro) |
| logo_github_copilot_texto | `github_copilot_texto.png` | tarjeta clara | rótulo «Copilot» negro |
| logo_git | `git.png` | tarjeta clara | rombo naranja con «git» en marrón oscuro |
| logo_npm | `npm.png` | tal cual | rojo con letras blancas |
| logo_whatsapp | `whatsapp.png` | tal cual | burbuja verde con aro blanco |
| logo_gemini | `gemini.png` | tal cual | rótulo «Gemini» en degradado |
| logo_gemini_icono | `gemini_icono.png` | tal cual | tarjeta oscura con las estrellas 3D (rectangular, con su fondo) |
| logo_openai_codex | `openai_codex.png` | tal cual | la nube azul con `>_` |
| logo_openai_codex_app | `openai_codex_app.png` | tal cual | tarjeta «Codex App · OpenAI» con su fondo (cuadrada) |
| logo_nextjs | `nextjs.png` | tal cual | círculo negro con la N blanca (borde suave en lo oscuro) |
| logo_nextjs_texto | `nextjs_texto.png` | tarjeta clara | rótulo «NEXT.JS» negro |
| logo_vite | `vite.png` | tarjeta clara | el rayo se ve; el texto «VITE» es negro |
| logo_tailwind | `tailwind.png` | tal cual | ficha clara 3D con las ondas y «tailwindcss» |
| logo_vercel | `vercel.png` | tarjeta clara | triángulo y texto negros |
| logo_netlify | `netlify.png` | tarjeta clara | los destellos se ven; el texto es verde oscuro |
| logo_cloudflare_pages | `cloudflare_pages.png` | tarjeta clara | rayo naranja; «Pages» es negro |
| logo_n8n | `n8n.png` | tarjeta clara | los nodos rosas se ven; «n8n» es azul marino |
| logo_php | `php.png` | tal cual | óvalo morado |
| logo_astro | `astro.png` | tal cual | tarjeta azul noche con «astro» y la frase «I Build Fast Static Sites» (rectangular, con su fondo) |
| logo_aws | `aws.png` | tarjeta clara | la sonrisa naranja se ve; «aws» es azul marino |
| logo_nodejs | `nodejs.png` | tarjeta clara | hexágono verde; «node» es gris oscuro |
| logo_live_server | `live_server.png` | tarjeta clara | ondas moradas; el texto «Live Server» es negro |
| logo_youtube | `youtube.png` | tal cual | rectángulo rojo con el triángulo blanco |
| logo_wordpress | `wordpress.png` | ficha blanca | negro con la W y el aro calados (transparentes) |
| logo_chrome | `chrome.png` | tal cual | Google Chrome (llegó ya sin fondo; solo recortado y a 1024 px) |
| logo_google_cloud | `google_cloud.png` | tarjeta clara | la nube de colores con «Google Cloud» en gris |
| logo_gmail | `gmail.png` | tal cual | la M de colores (llegó sin fondo; recortado y a 1024 px) |
| logo_aigencyx | `aigencyx.png` | tal cual | AIgencyx Labs, versión oscura (círculo con aro naranja) |
| logo_aigencyx_naranja | `aigencyx_naranja.png` | tal cual | AIgencyx Labs, versión naranja |
| logo_aigencyx_claro | `aigencyx_claro.png` | tal cual | AIgencyx Labs, versión clara |

## Los que aún faltan

Pídelos cuando un episodio los necesite y guárdalos aquí: el original en `_originales/` y la versión sin fondo con
`python scripts/logo_sin_fondo.py _originales/x.png x.png` (mira los modos en el propio script). Rehaz el muestrario
con `python scripts/muestrario_logos.py public/logos public/logos/_muestrario.png` y comprueba que nada se ha comido.

hostinger.

Los tres de **AIgencyx** se han recortado en círculo de una captura de pantalla del usuario (`_originales/aigencyx_captura.png`), así que miden unos 296 px: valen hasta ese tamaño en pantalla. Si hace falta más grande, pide la exportación en PNG.

Repetidos que llegaron en mejor resolución (Claude, Drive, Visual Studio Code y Word, a 3840 px): mismo diseño que
los de aquí, así que no se han sustituido. Si alguna vez hace falta un zoom muy grande, pídelos de nuevo.
