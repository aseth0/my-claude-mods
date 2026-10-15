# Changelog

Todos los cambios importantes de markdown-plus se anotan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y
las versiones siguen [Semantic Versioning](https://semver.org/lang/es/).

## [Sin publicar]

## [0.4.0] - 2026-10-15

Primera versión publicada.

### Añadido

- Negritas en color con la paleta cálida (terracota, miel, canela y coral) o con
  un único color configurable (`palette` y `color`).
- Cabeceras plegables con un botón `▾` / `▸`. Plegar una cabecera oculta también
  sus subsecciones, y el estado se guarda por mensaje.
- Un estilo distinto para cada nivel de cabecera (mayúsculas, subrayado, cursiva y
  línea inferior) y sangría según la profundidad.
- Listas con viñetas y numeradas dentro de la prosa con negritas, con las líneas
  largas alineadas bajo el texto y los elementos bajo un párrafo sangrados un nivel.
- Soporte de `mod-switch`: el mod se aparta cuando está en `mod-switch.disabled`.
- Tests de análisis (`parse.test.ts`) y de dibujo en terminal, escritorio, móvil
  y VS Code (`render.test.tsx`).

[Sin publicar]: https://github.com/aseth0/my-claude-mods/compare/markdown-plus-v0.4.0...HEAD
[0.4.0]: https://github.com/aseth0/my-claude-mods/releases/tag/markdown-plus-v0.4.0
