import G from '@lib/static.js'
import chalk from 'chalk'

const { LOG, ADAPTER, API, PROGRAM } = G

const info = app => ({ message, options }) => {
  const { [LOG]: adapter } = app[ADAPTER]

  adapter[API].print({ message: `${chalk.bgBlue(' INFO ')} ${message}`, options })
}

export default info