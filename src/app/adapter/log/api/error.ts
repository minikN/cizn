/* global process */
import G from '@lib/static.js'
import chalk from 'chalk'

const { LOG, ADAPTER, API, PROGRAM } = G

const info = app => ({ message, options = {} }) => {
  const { [LOG]: adapter } = app[ADAPTER]

  adapter[API].print({ message: `${chalk.bgRed(' FAIL ')} ${message}. Aborting.`, options })
  process.exit(1)
}

export default info