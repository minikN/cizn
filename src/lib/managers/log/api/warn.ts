import chalk from 'npm:chalk'
import { Props } from '@lib/managers/log/api/index.ts'

const warn = (App: Cizn.Application) => ({ message, options }: Props) => {
  const { Log } = App.Manager

  Log.Api.print({ message: `${chalk.bgYellow(' WARN ')} ${message}`, options })
}

export default warn