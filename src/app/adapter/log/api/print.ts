/* global process */
import G from '@cizn/global'
import chalk from 'chalk'
import { Props } from '.'

const print = (app: Cizn.Application) => ({ message, options = [] }: Props) => {
  const { [G.LOG]: adapter } = app[G.ADAPTER]
  const { [G.LEVEL]: level } = adapter

  const formattedMessage = options.reduce((acc: string, key) => acc.replace('%d', chalk.bold(key)), message)
  console.log(`${level}${formattedMessage}`)
}

export default print