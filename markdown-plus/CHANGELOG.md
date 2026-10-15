# Changelog

All notable changes to markdown-plus are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.5.0] - 2026-10-15

### Changed

- Everything is now in English: settings, docs, code comments and tests.
- **Breaking:** the `palette` values are renamed from `calida` / `unica` to
  `warm` / `single`. If you had set `unica`, set `single` again.

## [0.4.0] - 2026-10-15

First published version.

### Added

- Colored bold text with the warm palette (terracotta, honey, cinnamon and coral)
  or a single configurable color (`palette` and `color`).
- Foldable headings with a `▾` / `▸` button. Folding a heading also hides its
  subsections, and the state is kept per message.
- A distinct style for each heading level (case, underline, italics and a rule
  beneath) and indentation by depth.
- Bulleted and numbered lists inside bold prose, with wrapped lines aligned under
  the text and items under a paragraph indented one level.
- `mod-switch` support: the mod steps aside while it is in `mod-switch.disabled`.
- Parsing tests (`parse.test.ts`) and rendering tests for terminal, desktop,
  mobile and VS Code (`render.test.tsx`).

[Unreleased]: https://github.com/aseth0/my-claude-mods/compare/markdown-plus-v0.5.0...HEAD
[0.5.0]: https://github.com/aseth0/my-claude-mods/compare/markdown-plus-v0.4.0...markdown-plus-v0.5.0
[0.4.0]: https://github.com/aseth0/my-claude-mods/releases/tag/markdown-plus-v0.4.0
