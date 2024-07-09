import G from '@lib/static.js'
import chalk from 'chalk'

const { LOG, ADAPTER, API, PROGRAM } = G

const success = app => ({ message, options }) => {
  const { [LOG]: adapter } = app[ADAPTER]

  adapter[API].print({ message: `${chalk.bgGreen(' DONE ')} ${message}`, options })
}

export default success