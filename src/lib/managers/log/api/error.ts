/* global process */
import chalk from 'npm:chalk'
import { Props } from '@lib/managers/log/api/index.ts'
import process from 'node:process'

const error = (App: Cizn.Application) => ({ message, options = [], error = {} }: Props) => {
  const { Log } = App.Manager

  const reasons = error.reasons?.length
    ? error.reasons.reduce((acc, key) => `${acc}\n- ${key}`, '\nThis could be because:')
    : null

  Log.Api.print({ message: `${chalk.bgRed(' FAIL ')} ${message}. Aborting.${reasons || ''}`, options })
  process.exit(1)
}

export default error
