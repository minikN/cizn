import G from '@cizn/global'
import chalk from 'chalk'
import { Props } from '.'

const info = (App: Cizn.Application) => ({ message, options }: Props) => {
  const { Log } = App.Adapter

  Log.Api.print({ message: `${chalk.bgBlue(' INFO ')} ${message}`, options })
}

export default info