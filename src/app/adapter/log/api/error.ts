/* global process */
import chalk from 'chalk'
import { Props } from '.'

const info = (App: Cizn.Application) => ({ message, options = [] }: Props) => {
  const { Log } = App.Adapter

  Log.Api.print({ message: `${chalk.bgRed(' FAIL ')} ${message}. Aborting.`, options })
  process.exit(1)
}

export default info