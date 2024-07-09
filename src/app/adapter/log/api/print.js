/* global process */
import G from '@lib/static.js'
import chalk from 'chalk'

const { LOG, ADAPTER, LEVEL } = G


const print = app => ({ message, options = [] }) => {
  const { [LOG]: adapter } = app[ADAPTER]
  const { [LEVEL]: level } = adapter


  const formattedMessage = options.reduce((acc, key) => acc.replace('%d', chalk.bold(key)), message)
  console.log(`${level}${formattedMessage}`)
}

export default print