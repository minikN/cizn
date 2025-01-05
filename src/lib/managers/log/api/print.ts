/* global process */
import chalk from 'npm:chalk'
import { Props } from '@lib/managers/log/api/index.ts'

const print = (App: Cizn.Application) => ({ message, options = [] }: Props) => {
  const { Log } = App.Manager
  const { Level: level } = Log

  const formattedMessage = options.reduce((acc: string, key) => acc.replace('%d', chalk.bold(key)), message)
  console.log(`${level}${formattedMessage}`)
}

export default print