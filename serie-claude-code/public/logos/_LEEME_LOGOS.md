# Logos de la serie «Máster de Claude Code»

**Regla:** los logos de marcas solo salen de aquí, de archivos que aporta el usuario. Nunca se redibujan, nunca se inventan
ni se sustituyen por una versión propia. Si un episodio necesita un logo que no está, se pide al usuario con el nombre
`logo_xxx` y se espera.

En el JSON del episodio van en `"logos"` (`id` → ruta en `public/`), y en Remotion se usan con
`<Logo src={ep.logos.xxx} … />` (`src/master/componentes/Logo.tsx`).

## Los que hay en el repositorio

| Nombre (`logo_xxx`) | Archivo | Tamaño | Notas de uso |
|---|---|---|---|
| logo_claude | `claude.png` | 999x1000, transparente | asterisco coral de Claude. Intro, consola, página de estado |
| logo_claude_code | `claude-code-mascota.png` | 447x280, transparente | la mascota pixelada (cangrejo). Se le quitó solo el fondo blanco liso del borde; los ojos siguen blancos |
| logo_claude_code_texto | `claude-code-pixel.png` | 659x354, transparente | rótulo «CLAUDE CODE» pixelado. Intro y cierre |
| logo_vscode | `vscode.png` | 1000x995, transparente | Visual Studio Code |
| logo_word | `word.png` | 1000x930, transparente | Microsoft Word |
| logo_drive | `drive.png` | 1000x893, transparente | Google Drive (CTA: esquemas) |
| logo_github_gato | `github.png` | 512x500, transparente | octocat negro: **siempre sobre ficha blanca** (`ficha="circulo"`), porque sobre el fondo oscuro no se ve |
| logo_microsoft | `microsoft.png` | 766x476, transparente | texto gris: **sobre tarjeta clara** (`ficha="tarjeta"`) |
| logo_anthropic | `anthropic.png` | 980x980, transparente | ficha clara 3D con la cabeza y «ANTHROPIC»: ya trae su fondo, va tal cual |
| logo_whatsapp | `whatsapp.png` | 1400x1400, fondo blanco | bocadillo verde con borde blanco: el fondo blanco viene en el archivo; se usa pequeño dentro de botones claros (web de la panadería, plan del EP.9) |
| logo_hostinger | `hostinger.png` | 600x336, transparente | morado: sobre ficha clara (en el EP.9, la clavija de la regleta) |
| logo_airtable | `airtable.png` | 512x256, transparente | texto gris oscuro: **sobre fondo claro** (clavija de la regleta y cabecera de la tabla de encargos) |
| logo_mcp | `mcp.png` | 600x600, transparente | círculo negro con el símbolo blanco: **sobre ficha blanca** (`ficha="circulo"`), porque sobre el fondo oscuro no se ve |
| logo_aigencyx | `aigencyx.png` | 800x800, fondo #14110F | variante «Oscuro» del lienzo del usuario «AIgencyx Labs – Perfil», pasada a PNG sin cambios. Avatar redondo del botón Seguir |

## Los que el usuario tiene en su carpeta pero aún no están aquí

Hay que pedirlos cuando un episodio los necesite (y guardarlos aquí con el nombre en minúsculas y sin `logo_`):
nodejs, github (con texto: el que había traía el fondo de cuadros incrustado), aws, youtube, live_server, git, npm,
github_copilot, astro, nextjs, vite, tailwind, vercel, netlify, cloudflare_pages, n8n, php, openai_codex, gemini.
