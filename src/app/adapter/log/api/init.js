import G from '@lib/static.js'

const { CLI, ADAPTER, API, PROGRAM } = G

const init = app => () => {
  const { [CLI]: adapter } = app[ADAPTER]
  const { [PROGRAM]: program } = adapter

  program.wrapAll()

}

export default init