import sway from './modules/sway.js'
import waybar from './modules/waybar.js'
import zsh from './modules/zsh.js'

export const config = [
  sway({ wayland: true }),
  waybar({ test: false }),
  zsh(),
]