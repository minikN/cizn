import chalk from 'npm:chalk'
import { Props } from '@lib/managers/log/api/index.ts'

const success = (App: Cizn.Application) => ({ message, options }: Props) => {
  const { Log } = App.Manager

  Log.Api.print({ message: `${chalk.bgGreen(' DONE ')} ${message}`, options })
}

export default success