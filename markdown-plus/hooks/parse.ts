// Splits an assistant reply into blocks: plain prose blocks holding **bold**
// (drawn by the mod with colored spans) and everything else (code fences,
// tables, headings, quotes), handed back to the surface's own Markdown.

export type Span = { kind: 'text' | 'bold' | 'code'; text: string }
export type Line = { marker: string; indent: number; spans: Span[] }
export type Block = { kind: 'markdown'; text: string } | { kind: 'prose'; lines: Line[] }

const LIST = /^(\s*)([-*+•]|\d+[.)])\s+(.*)$/
const INLINE = /(\*\*[^*\n]+?\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\n]+\))/

export function parseInline(text: string): Span[] {
  const spans: Span[] = []
  for (const part of text.split(INLINE)) {
    if (part === '') continue
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      spans.push({ kind: 'bold', text: part.slice(2, -2) })
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      spans.push({ kind: 'code', text: part.slice(1, -1) })
    } else if (part.startsWith('[')) {
      const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
      spans.push({ kind: 'text', text: m ? `${m[1]} (${m[2]})` : part })
    } else {
      spans.push({ kind: 'text', text: part })
    }
  }
  return spans
}

function isProse(lines: string[]): boolean {
  return lines.every(l => !/^\s*(#|>|\||```|~~~)/.test(l) && !/^\s*[-*_]{3,}\s*$/.test(l))
}

// `nested`: the item hangs under a paragraph line of its own block, so it
// steps in one level instead of sitting flush with the paragraph.
function toLine(raw: string, nested = false): Line {
  const m = LIST.exec(raw)
  if (!m) return { marker: '', indent: 0, spans: parseInline(raw.trim()) }
  const [, lead = '', mark = '', rest = ''] = m
  const marker = /\d/.test(mark) ? mark : '•'
  return { marker, indent: Math.floor(lead.length / 2) + (nested ? 1 : 0), spans: parseInline(rest) }
}

export function parseBlocks(text: string): Block[] {
  // Chunks separated by blank lines, a fenced code block always one chunk.
  const chunks: string[][] = []
  let cur: string[] = []
  let inFence = false
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (!inFence && line.trim() === '') {
      if (cur.length) chunks.push(cur)
      cur = []
    } else {
      cur.push(line)
    }
  }
  if (cur.length) chunks.push(cur)

  const blocks: Block[] = []
  for (const chunk of chunks) {
    const joined = chunk.join('\n')
    if (joined.includes('**') && isProse(chunk)) {
      // Continuation lines of a paragraph join the line before them.
      const lines: string[] = []
      for (const l of chunk) {
        if (lines.length && !LIST.test(l)) lines[lines.length - 1] += ' ' + l.trim()
        else lines.push(l)
      }
      let underParagraph = false
      blocks.push({
        kind: 'prose',
        lines: lines.map(l => {
          const isItem = LIST.test(l)
          if (!isItem) underParagraph = true
          return toLine(l, isItem && underParagraph)
        }),
      })
    } else {
      const last = blocks[blocks.length - 1]
      if (last?.kind === 'markdown') last.text += '\n\n' + joined
      else blocks.push({ kind: 'markdown', text: joined })
    }
  }
  return blocks
}

// A reply cut at its markdown headings (never inside a code fence): the text
// before the first heading, then one section per heading with its body.
export type Section = { level: number; title: string; body: string }

const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/

export function parseSections(text: string): { intro: string; sections: Section[] } {
  const intro: string[] = []
  const sections: { level: number; title: string; body: string[] }[] = []
  let inFence = false
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const m = inFence ? null : HEADING.exec(line)
    const last = sections[sections.length - 1]
    if (m) sections.push({ level: (m[1] ?? '#').length, title: m[2] ?? '', body: [] })
    else if (last) last.body.push(line)
    else intro.push(line)
  }
  return {
    intro: intro.join('\n').trim(),
    sections: sections.map(s => ({ ...s, body: s.body.join('\n').trim() })),
  }
}

// Which sections show: one under a collapsed heading of a lower level is hidden.
export function visibleSections(sections: Section[], collapsed: readonly number[]): boolean[] {
  let hideBelow = Infinity
  return sections.map((s, i) => {
    if (s.level <= hideBelow) hideBelow = Infinity
    const shown = hideBelow === Infinity
    if (shown && collapsed.includes(i)) hideBelow = s.level
    return shown
  })
}
