import G from '@cizn/global'
import chalk from 'chalk'
import { Props } from '.'

const info = (app: Cizn.Application) => ({ message, options }: Props) => {
  const { [G.LOG]: adapter } = app[G.ADAPTER]

  adapter[G.API].print({ message: `${chalk.bgBlue(' INFO ')} ${message}`, options })
}

export default info