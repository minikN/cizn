/**
 * Cleans up the derivation state.
 *
 * @param {Cizn.Application} app the application
 * @returns {void}
 */
const clean = (app: Cizn.Application): Cizn.Application.State.Derivation.Api['clean'] => () => {
  const { Derivation } = app.State

  Derivation.State.Config = {}
  Derivation.State.Packages.Home = []
  Derivation.State.Packages.System = []
  Derivation.State.Built = []
}

export default clean