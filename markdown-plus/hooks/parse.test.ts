import { describe, expect, test } from 'claude-code/testing'

import { parseBlocks, parseInline, parseSections, visibleSections } from './parse'

describe('parse', () => {
  test('splits bold, code and plain text', async () => {
    expect(parseInline('a **b** `c` d')).toEqual([
      { kind: 'text', text: 'a ' },
      { kind: 'bold', text: 'b' },
      { kind: 'text', text: ' ' },
      { kind: 'code', text: 'c' },
      { kind: 'text', text: ' d' },
    ])
  })

  test('keeps fences and tables as markdown, bold prose as prose', async () => {
    const blocks = parseBlocks(
      'Hola **mundo**\n\n```js\nconst a = "**x**"\n\nfoo\n```\n\n| a | **b** |\n|---|---|\n\n- uno **dos**\n- tres',
    )
    expect(blocks.map(b => b.kind)).toEqual(['prose', 'markdown', 'prose'])
    const list = blocks[2]
    expect(list?.kind === 'prose' ? list.lines.map(l => l.marker) : null).toEqual(['•', '•'])
  })
})

describe('lists', () => {
  test('items under a paragraph of their block step in one level', async () => {
    const [block] = parseBlocks('**1. Pregunta** dos cosas:\n- **Una:** a\n• **Dos:** b\n  - sub')
    expect(block?.kind === 'prose' ? block.lines.map(l => [l.marker, l.indent]) : null).toEqual([
      ['', 0],
      ['•', 1],
      ['•', 1],
      ['•', 2],
    ])
  })

  test('a list on its own stays flush', async () => {
    const [block] = parseBlocks('- **Una:** a\n- dos')
    expect(block?.kind === 'prose' ? block.lines.map(l => l.indent) : null).toEqual([0, 0])
  })
})

describe('sections', () => {
  test('cuts at headings outside fences', async () => {
    const { intro, sections } = parseSections('Hola\n\n## Uno\nA\n```\n# no\n```\n### Dos\nB\n## Tres\nC')
    expect(intro).toBe('Hola')
    expect(sections.map(s => [s.level, s.title])).toEqual([[2, 'Uno'], [3, 'Dos'], [2, 'Tres']])
  })

  test('a collapsed heading hides its subsections only', async () => {
    const { sections } = parseSections('## Uno\n### Dos\n#### Tres\n## Cuatro')
    expect(visibleSections(sections, [0])).toEqual([true, false, false, true])
    expect(visibleSections(sections, [1])).toEqual([true, true, false, true])
  })
})
