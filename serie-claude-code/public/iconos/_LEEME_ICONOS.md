# Iconos y dibujos de la serie (no son logos)

Iconos planos propios de la serie, que se pueden usar en cualquier episodio. **No son marcas:** los logos solo salen de
`public/logos/`. Se ven todos en `_muestrario.png` (o abriendo `_muestrario.html`).

- `linea/`: iconos de trazo blanco, 24x24 escalables (conexion, cuenta, lupa, repite, ramas, atasca, reintentar,
  enlace, alerta, check, cruz, candado, llave, tarjeta, datafono, turnos, servidor, reloj-arena, carpeta,
  llave-inglesa, tecla, tienda, cartel, comentario, enviar, persona).
- `linea-coral/`: los mismos en el acento #D97757.
- `dibujos/`: ilustraciones planas con relleno (candado, llave, tarjeta, datafono, maquina-turnos, ticket, servidor,
  reloj-arena, carpeta, llave-inglesa, tecla-esc, persona, cartel, aviso-error, insignia-check, insignia-cruz).

- `usuario/`: iconos dibujados que aportó el usuario (estilo trazo grueso con relleno de color): `cronometro`,
  `mano`, `marcador`, `matraz` y `tecla-esc`. Cada uno tiene dos versiones: la normal, con contorno oscuro (mejor sobre
  claro o sobre tarjeta), y `_pegatina`, con borde crema, pensada para el fondo oscuro de la serie. La hoja original
  está en `usuario/_hoja_original.png` y el muestrario, en `usuario/_muestrario.png`.

En Remotion: `<Img src={staticFile("iconos/linea-coral/lupa.svg")} style={{ width: 80 }} />`.

**Versiones animadas** (para mover piezas con la voz): `src/master/componentes/ep08/Dibujos.tsx` (cerradura con la
llave que no gira, datáfono que deniega, máquina de turnos, servidor con aforo y chispas, reloj de arena que gira, cola de
personas, tecla Esc que se hunde, aviso de error con dígitos que ruedan) y `Cartel.tsx` (el cartel colgante que cae, se
balancea y gira para cambiar de cara).

Para añadir un icono: escribe su entrada en `scripts/iconos.py` (en `LINEA` o en `DIBUJOS`) y ejecuta
`python scripts/iconos.py`. Después, captura el muestrario de nuevo.
