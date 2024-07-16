import G from '@cizn/global'
import chalk from 'chalk'
import { Props } from '.'

const success = (app: Cizn.Application) => ({ message, options }: Props) => {
  const { [G.LOG]: adapter } = app[G.ADAPTER]

  adapter[G.API].print({ message: `${chalk.bgGreen(' DONE ')} ${message}`, options })
}

export default success