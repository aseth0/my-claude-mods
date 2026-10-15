# markdown-plus

A Claude Code mod that changes how Claude's replies are drawn:

- **Colored bold text.** Each bold span takes the next color of a warm palette
  (terracotta, honey, cinnamon and coral), chosen to read on both light and dark
  backgrounds. You can also pin a single color.
- **Foldable headings.** Each heading gets a `▾` / `▸` button that folds its
  section and all its subsections. The folded state is kept per message.
- **A style per level.** The terminal has a single font size, so each level is
  told apart by color, case, underline, italics and a rule beneath:

  | Level | Style |
  |---|---|
  | `#` | UPPERCASE, terracotta, `━` rule |
  | `##` | honey, `─` rule |
  | `###` | cinnamon, underlined |
  | `####` | coral |
  | `#####` | cinnamon, italic |
  | `######` | cinnamon, italic and dimmed |

  Sub-levels are indented from the reply's top heading level.

Code blocks, tables, quotes and the rest of the Markdown are still drawn by
Claude Code's own renderer. Replies with no bold text and no headings are left
untouched.

Works in the terminal, the desktop app, VS Code and on mobile.

## Requirements

- Claude Code **2.1.286 or later**.
- Function hooks enabled. They are an early-access feature, so the API may
  change between releases without notice.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aseth0/my-claude-mods.git ~/my-claude-mods
   ```

2. Add the mod's folder to `~/.claude/settings.json` and enable function hooks:

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "/path/to/my-claude-mods/markdown-plus",
       "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1"
     }
   }
   ```

   If you already load other mods, separate the paths with `:`.

3. Fully restart Claude Code. `/reload-plugins` does not re-read environment
   variables.

> If `settings.json` has a syntax error (a missing comma, for example), Claude
> Code silently drops every mod.

## Configuration

| Option | Values | Default | What it does |
|---|---|---|---|
| `palette` | `warm`, `single` | `warm` | `warm` cycles through the four colors; `single` always uses `color`. |
| `color` | theme key, color name or hex | `#E07A5F` | The bold color with the `single` palette. |

## mod-switch support

If you load a `mod-switch` mod that keeps the list of disabled mods in its
`mod-switch.disabled` state, markdown-plus steps aside while it is on that list.
Without that mod, markdown-plus works the same.

## Development

```bash
claude plugin validate markdown-plus
claude plugin test markdown-plus
```

Claude Code generates the `.claude-plugin/types/` folder (TypeScript
declarations and `tsconfig.json`) the first time it loads the mod, so it is not
in the repository. Until then, your editor will not find the `claude-code` types.

- `hooks/parse.ts` splits a reply into sections and blocks, and separates prose
  with bold text from the rest of the Markdown.
- `hooks/register.tsx` draws the headings, the fold buttons and the colored
  bold text.

## Changes

See [CHANGELOG.md](CHANGELOG.md).
