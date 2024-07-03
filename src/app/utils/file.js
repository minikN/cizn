import { curry } from '@lib/util/index.js'
import { appendFileSync, writeFileSync } from 'node:fs'

export const withFile = curry((target, path, contents) => {
  writeFileSync(target, `\
utils.withRealFile('${path}', '\n${contents}')\n`)
})

export const withRealFile = curry((target, path, contents) => {
  console.log('withRealFile')
})