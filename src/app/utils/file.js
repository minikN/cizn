
import { sanitize, toCamelCase } from '@lib/util/string.js'
import { curry } from '@lib/util/index.js'
import { appendFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'path'

/**
 * Writes instructions to create a file at {@link target}
 * with {@link contents} to {@link source}.
 */
export const withFile = curry((source, target, contents) => {
  appendFileSync(source, `\
utils.withRealFile('${target}', \`\n${contents}\`)\n`)
})

/**
 * Writes {@link contents} to file at {@link source}.
 */
export const withRealFile = curry((source, target, contents) => {
  const filePath = `${source}/${target}`
  if (existsSync(filePath)) {
    appendFileSync(filePath, contents)
  } else {
    const basePath = path.dirname(filePath)
    mkdirSync(basePath, { recursive: true })
    writeFileSync(filePath, contents)
  }

})

/**
 * Writes instructions to include {@link target} with
 * as {@link name} to {@link source}. Will also sanitize
 * the name to avoid broken imports.
 */
export const include = curry((source, name, target) => {
  const fnName = sanitize(toCamelCase(name))

  appendFileSync(source, `\
const {default: ${fnName} } = await import('${target}')
await ${fnName}?.(utils)\n`)
})
