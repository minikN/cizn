import pacmanApi from "@cizn/adapter/package/pacman/api"

const init = (App: Cizn.Application) => () => {
  // Figure out correct package API here based on system
  return pacmanApi(App)
}

export default init