import { curry } from '@lib/util/index.js'
import { appendFileSync } from 'node:fs'

export const withFile = curry((target, path, contents) => {
  appendFileSync(target, `\
withRealFile('${path}', '\n${contents}')\n`)
})