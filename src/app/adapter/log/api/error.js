import G from '@lib/static.js'

const { LOG, ADAPTER, API, PROGRAM } = G

const info = app => ({ message, options }) => {
  const { [LOG]: adapter } = app[ADAPTER]
  const { [PROGRAM]: program } = adapter

  program.error(message)
}

export default info