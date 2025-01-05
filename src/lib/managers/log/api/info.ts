import chalk from 'npm:chalk'
import { Props } from '@lib/managers/log/api/index.ts'

const info = (App: Cizn.Application) => ({ message, options }: Props) => {
  const { Log } = App.Manager

  Log.Api.print({ message: `${chalk.bgBlue(' INFO ')} ${message}`, options })
}

export default info