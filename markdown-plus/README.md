# markdown-plus

Un mod de Claude Code que cambia cómo se dibujan las respuestas de Claude:

- **Negritas en color.** Cada negrita toma el siguiente color de una paleta cálida
  (terracota, miel, canela y coral), pensada para leerse en fondo claro y oscuro.
  También puedes fijar un único color.
- **Cabeceras plegables.** Cada cabecera lleva un botón `▾` / `▸` que pliega su
  sección y todas sus subsecciones. El estado se guarda por mensaje.
- **Un estilo por nivel.** El terminal solo tiene un tamaño de letra, así que cada
  nivel se distingue por color, mayúsculas, subrayado, cursiva y una línea debajo:

  | Nivel | Estilo |
  |---|---|
  | `#` | MAYÚSCULAS, terracota, línea `━` |
  | `##` | miel, línea `─` |
  | `###` | canela, subrayado |
  | `####` | coral |
  | `#####` | canela, cursiva |
  | `######` | canela, cursiva y atenuado |

  Los subniveles se sangran a partir del nivel más alto de la respuesta.

Los bloques de código, las tablas, las citas y el resto del Markdown se siguen
dibujando con el renderizador normal de Claude Code. Las respuestas sin negritas
ni cabeceras no se tocan.

Funciona en el terminal, en la app de escritorio, en VS Code y en el móvil.

## Requisitos

- Claude Code **2.1.286 o posterior**.
- Los *function hooks* activados. Son una función en acceso anticipado (*early
  access*), así que la API puede cambiar sin aviso entre versiones.

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/aseth0/my-claude-mods.git ~/my-claude-mods
   ```

2. Añade la carpeta del mod a `~/.claude/settings.json` y activa los function hooks:

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "/ruta/a/my-claude-mods/markdown-plus",
       "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1"
     }
   }
   ```

   Si ya cargas otros mods, separa las rutas con `:`.

3. Reinicia Claude Code por completo. `/reload-plugins` no vuelve a leer las
   variables de entorno.

> Si `settings.json` tiene un error de sintaxis (por ejemplo, una coma de menos),
> Claude Code descarta todos los mods sin avisar.

## Configuración

| Opción | Valores | Por defecto | Qué hace |
|---|---|---|---|
| `palette` | `calida`, `unica` | `calida` | `calida` rota entre los cuatro colores; `unica` usa siempre `color`. |
| `color` | clave del tema, nombre de color o hex | `#E07A5F` | El color de las negritas con la paleta `unica`. |

## Compatibilidad con mod-switch

Si tienes cargado un mod `mod-switch` que guarda en su estado
`mod-switch.disabled` la lista de mods apagados, markdown-plus se aparta cuando
aparece en esa lista. Sin ese mod, markdown-plus funciona igual.

## Desarrollo

```bash
claude plugin validate markdown-plus
claude plugin test markdown-plus
```

Claude Code genera la carpeta `.claude-plugin/types/` (declaraciones TypeScript
y `tsconfig.json`) la primera vez que carga el mod, así que no está en el
repositorio. Hasta entonces, tu editor no encontrará los tipos de `claude-code`.

- `hooks/parse.ts` parte la respuesta en secciones y bloques, y separa la prosa
  con negritas del resto del Markdown.
- `hooks/register.tsx` dibuja las cabeceras, los botones de plegado y las
  negritas en color.

## Cambios

Consulta [CHANGELOG.md](CHANGELOG.md).
