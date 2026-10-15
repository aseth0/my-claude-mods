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
      'Hello **world**\n\n```js\nconst a = "**x**"\n\nfoo\n```\n\n| a | **b** |\n|---|---|\n\n- one **two**\n- three',
    )
    expect(blocks.map(b => b.kind)).toEqual(['prose', 'markdown', 'prose'])
    const list = blocks[2]
    expect(list?.kind === 'prose' ? list.lines.map(l => l.marker) : null).toEqual(['•', '•'])
  })
})

describe('lists', () => {
  test('items under a paragraph of their block step in one level', async () => {
    const [block] = parseBlocks('**1. Question** two things:\n- **One:** a\n• **Two:** b\n  - sub')
    expect(block?.kind === 'prose' ? block.lines.map(l => [l.marker, l.indent]) : null).toEqual([
      ['', 0],
      ['•', 1],
      ['•', 1],
      ['•', 2],
    ])
  })

  test('a list on its own stays flush', async () => {
    const [block] = parseBlocks('- **One:** a\n- two')
    expect(block?.kind === 'prose' ? block.lines.map(l => l.indent) : null).toEqual([0, 0])
  })
})

describe('sections', () => {
  test('cuts at headings outside fences', async () => {
    const { intro, sections } = parseSections('Hello\n\n## One\nA\n```\n# no\n```\n### Two\nB\n## Three\nC')
    expect(intro).toBe('Hello')
    expect(sections.map(s => [s.level, s.title])).toEqual([[2, 'One'], [3, 'Two'], [2, 'Three']])
  })

  test('a collapsed heading hides its subsections only', async () => {
    const { sections } = parseSections('## One\n### Two\n#### Three\n## Four')
    expect(visibleSections(sections, [0])).toEqual([true, false, false, true])
    expect(visibleSections(sections, [1])).toEqual([true, true, false, true])
  })
})
