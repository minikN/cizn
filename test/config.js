import sway from './modules/sway.js'
import waybar from './modules/waybar.js'
import zsh from './modules/zsh.js'

const config = () => ({
  modules: [
    sway({ wayland: true, bla: 2 }),
    waybar({ test: true, foo: 'bar' }),
    zsh({ terminal: false, foo: 1 }),
  ]
})

export default {
  name: 'config',
  module: config,
}