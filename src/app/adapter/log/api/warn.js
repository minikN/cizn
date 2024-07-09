import G from '@lib/static.js'
import chalk from 'chalk'

const { LOG, ADAPTER, API, PROGRAM } = G

const warn = app => ({ message, options }) => {
  const { [LOG]: adapter } = app[ADAPTER]

  adapter[API].print({ message: `${chalk.bgYellow(' WARN ')} ${message}`, options })
}

export default warn