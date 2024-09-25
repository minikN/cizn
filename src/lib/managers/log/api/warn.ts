import chalk from 'chalk'
import { Props } from '.'

const warn = (App: Cizn.Application) => ({ message, options }: Props) => {
  const { Log } = App.Manager

  Log.Api.print({ message: `${chalk.bgYellow(' WARN ')} ${message}`, options })
}

export default warn