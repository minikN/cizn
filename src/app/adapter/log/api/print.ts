/* global process */
import chalk from 'chalk'
import { Props } from '.'

const print = (App: Cizn.Application) => ({ message, options = [] }: Props) => {
  const { Log } = App.Adapter
  const { Level: level } = Log

  const formattedMessage = options.reduce((acc: string, key) => acc.replace('%d', chalk.bold(key)), message)
  console.log(`${level}${formattedMessage}`)
}

export default print