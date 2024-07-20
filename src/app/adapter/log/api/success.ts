import chalk from 'chalk'
import { Props } from '.'

const success = (App: Cizn.Application) => ({ message, options }: Props) => {
  const { Log } = App.Adapter

  Log.Api.print({ message: `${chalk.bgGreen(' DONE ')} ${message}`, options })
}

export default success