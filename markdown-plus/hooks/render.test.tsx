import { expect, test } from 'claude-code/testing'

const TEXT = 'Intro **negrita**\n\n## Sección\nCuerpo **uno**\n\n### Sub\nDentro'

test('pressing a heading folds its section and subsections', async $ => {
  for (const surface of ['terminal', 'desktop', 'mobile', 'vscode'] as const) {
    const ui = await $.ui.mount({
      plugin: 'markdown-plus',
      surface,
      component: 'AssistantMessage',
      props: { text: TEXT, isFirstOfReply: true },
    })
    expect(await ui.find({ key: 'h1' })).toBeDefined()
    await ui.press({ key: 'h0' })
    expect(await ui.find({ key: 'h1' })).toBeUndefined()
    await ui.press({ key: 'h0' })
    expect(await ui.find({ key: 'h1' })).toBeDefined()
    await ui.unmount()
  }
})

test('each heading level is drawn in its own style', async $ => {
  for (const surface of ['terminal', 'desktop', 'mobile', 'vscode'] as const) {
    const ui = await $.ui.mount({
      plugin: 'markdown-plus',
      surface,
      component: 'AssistantMessage',
      props: { text: '# Grande\nA\n\n## Mediana\nB\n\n### Pequeña\nC', isFirstOfReply: false },
    })
    expect(await ui.find({ type: 'Text', text: 'GRANDE' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Mediana' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^━+$/ })).toBeDefined()
    await ui.unmount()
  }
})
