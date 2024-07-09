import G from '@lib/static.js'

const { CLI, ADAPTER, API, PROGRAM } = G

const init = app => () => {
  const { [CLI]: adapter } = app[ADAPTER]
  const { [PROGRAM]: program } = adapter

  // nothing to do
}

export default init