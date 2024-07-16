import G from '@cizn/global'

const init = (app: Cizn.Application) => () => {
  const { [G.CLI]: adapter } = app[G.ADAPTER]
  const { [G.PROGRAM]: program } = adapter

  // nothing to do
}

export default init