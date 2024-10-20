import sway from './modules/sway.js'
import waybar from './modules/waybar.js'
import zsh from './modules/zsh.js'

export default () => {
  const imports = [
    sway({ wayland: true, bla: 2 }),
    waybar({ test: true, foo: 'bar' }),
    zsh({ terminal: false }),
  ]

  return { imports }
}