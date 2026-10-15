export type Collapsed = number[]

declare module 'claude-code' {
  interface PluginState {
    'markdown-plus': { collapsed: StateFamily<Collapsed> }
  }
}
