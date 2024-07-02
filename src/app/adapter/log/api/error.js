/* global process */
import G from '@lib/static.js'

const { LOG, ADAPTER, API, PROGRAM } = G

const info = app => ({ message, options = {} }) => {
  const { [LOG]: adapter } = app[ADAPTER]
  const { [PROGRAM]: program } = adapter

  program.error({ message: `${message}. Aborting.` })
  process.exit(1)
}

export default info