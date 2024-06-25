import G from '@lib/static.js'

const { LOG, ADAPTER, API, PROGRAM } = G

const warn = app => ({ message, options }) => {
  const { [LOG]: adapter } = app[ADAPTER]
  const { [PROGRAM]: program } = adapter

  program.warn(message)
}

export default warn