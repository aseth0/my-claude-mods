import { atom, memberOf, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { parseBlocks, parseSections, visibleSections } from './parse'
import type { Section } from './parse'

// mod-switch: while its /mods panel has this mod off, every hook steps aside.
declare module 'claude-code' {
  interface PluginState {
    'mod-switch': { disabled: string[] }
  }
}
const SWITCH = { plugin: 'mod-switch', key: 'disabled' } as const
async function isSwitchedOff($: EngineInterface) {
  const off = await $.state.get(SWITCH).then(s => s.value, () => undefined)
  return Array.isArray(off) && off.includes('markdown-plus')
}

// Terracota, miel, canela, coral: tonos medios que se leen en fondo claro y oscuro.
const WARM = ['#E07A5F', '#E9A23B', '#C8875E', '#D96C75']

// How each heading level reads: the terminal has one font size, so size is
// told by case, weight, underline, a rule beneath and the space around it.
type HeadingStyle = {
  color: string
  upper?: boolean
  underline?: boolean
  italic?: boolean
  dim?: boolean
  rule?: string
}
const HEADING: Record<number, HeadingStyle> = {
  1: { color: '#E07A5F', upper: true, rule: '━' },
  2: { color: '#E9A23B', rule: '─' },
  3: { color: '#C8875E', underline: true },
  4: { color: '#D96C75' },
  5: { color: '#C8875E', italic: true },
  6: { color: '#C8875E', italic: true, dim: true },
}

// Per message: the indices of its collapsed headings.
const collapsed = atom({ plugin: 'markdown-plus', key: 'collapsed' } as const, [])

const HAS_HEADING = /^#{1,6}\s/m

export const register: Register = (on, options) => {
  const single = typeof options.color === 'string' && options.color ? options.color : WARM[0]
  const palette = options.palette === 'unica' ? [single] : WARM

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (await isSwitchedOff($)) return next(e)
    const { text } = e.props
    // Nothing bold and no headings, or a summary row: the engine draws it as always.
    if (e.props.isSummary || (!text.includes('**') && !HAS_HEADING.test(text))) return next(e)

    const { intro, sections } = parseSections(text)
    const needsUs = sections.length > 0 || parseBlocks(text).some(b => b.kind === 'prose')
    if (!needsUs) return next(e)

    const { Box, Text, Markdown, Button } = $.ui.resolve(e)
    const bullet = e.surface === 'terminal' && e.props.isFirstOfReply
    const mine = memberOf(collapsed, e)
    const folded = await read($, mine)
    const shown = visibleSections(sections, folded)
    // Sub-levels step in from the reply's top heading level.
    const top = Math.min(...sections.map(s => s.level))
    const indent = (s: Section) => Math.min(s.level - top, 3) * 2

    // Each bold in the reply takes the next color of the palette.
    let nth = 0
    const nextColor = () => palette[nth++ % palette.length]

    const prose = (md: string) =>
      parseBlocks(md).map(block =>
        block.kind === 'markdown' ? (
          <Markdown text={block.text} />
        ) : (
          <Box flexDirection="column">
            {block.lines.map(line => (
              // The marker sits in its own column so wrapped lines align under the text.
              <Box flexDirection="row" alignItems="flex-start" paddingLeft={line.indent * 2}>
                {line.marker ? <Text>{`${line.marker} `}</Text> : null}
                <Box flexShrink={1}>
                <Text>
                  {line.spans.map(span =>
                    span.kind === 'bold' ? (
                      <Text bold color={nextColor()}>{span.text}</Text>
                    ) : span.kind === 'code' ? (
                      <Text color="permission">{span.text}</Text>
                    ) : (
                      span.text
                    ),
                  )}
                </Text>
                </Box>
              </Box>
            ))}
          </Box>
        ),
      )

    const toggle = (i: number) => () =>
      update($, mine, list => (list.includes(i) ? list.filter(n => n !== i) : [...list, i]))

    const heading = (s: Section, i: number) => {
      const st = HEADING[s.level] ?? HEADING[6]!
      const plain = s.title.replace(/\*\*|`/g, '')
      const title = st.upper ? plain.toUpperCase() : plain
      const isFolded = folded.includes(i)
      return (
        <Box flexDirection="column">
          <Box key={`row${i}`} flexDirection="row">
            <Button
              key={`h${i}`}
              plain
              label={isFolded ? '▸' : '▾'}
              hover={{ color: st.color }}
              onPress={toggle(i)}
            />
            <Text> </Text>
            <Text
              bold={!st.dim}
              color={st.color}
              underline={st.underline}
              italic={st.italic}
              dimColor={st.dim}
            >
              {title}
            </Text>
            {isFolded ? <Text dimColor> …</Text> : null}
          </Box>
          {st.rule && !isFolded ? (
            <Text color={st.color} dimColor={s.level > 1}>
              {st.rule.repeat(Math.min(title.length + 2, 72))}
            </Text>
          ) : null}
        </Box>
      )
    }

    const body = (
      <Box flexDirection="column" gap={1} flexGrow={1}>
        {intro ? prose(intro) : null}
        {sections.map((s, i) => {
          if (!shown[i]) return null
          const isFolded = folded.includes(i)
          return (
            <Box flexDirection="column" gap={1} paddingLeft={indent(s)} marginTop={s.level === 1 && i > 0 ? 1 : 0}>
              {heading(s, i)}
              {!isFolded && s.body ? prose(s.body) : null}
            </Box>
          )
        })}
      </Box>
    )

    if (!bullet) return body

    return (
      <Box flexDirection="row">
        <Text>{'⏺ '}</Text>
        {body}
      </Box>
    )
  })
}
