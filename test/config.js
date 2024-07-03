import sway from './modules/sway.js'
import waybar from './modules/waybar.js'
import zsh from './modules/zsh.js'

export default () => {
  const modules = [
    sway({ wayland: true }),
    waybar({ test: true, foo: 'bar' }),
    zsh({ terminal: true }),
  ]

  return {
    modules,
  }
}