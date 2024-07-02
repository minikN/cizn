import crypto from 'crypto'
import { tmpdir } from 'os'
import { mkdir } from 'node:fs/promises'
import Path from 'path'

/**
 * Functional composition
 *
 * @param {...Function} functions
 * @returns {function(*): *}
 */
export const compose = (...functions) => data => functions.reduce(
  (value, func) => func(value),
  data,
)

/**
 * Asynchronous functional composition
 *
 * @param  {...Function} functions
 * @returns {function(*): *}
 */
export const composeAsync = (...functions) => param => functions.reduce(
  async (result, next) => next(await result),
  param,
)

/**
 * Simple currying function.
 *
 * @param {Function} fn
 * @returns {Function}
 */
export function curry (fn) {
  return (...xs) => {
    if (xs.length === 0) {
      throw Error('EMPTY INVOCATION')
    }

    if (xs.length >= fn.length) {
      return fn(...xs)
    }

    return curry(fn.bind(null, ...xs))
  }
}


/**
 *
 */
export const mkTempFile = async ({ name, hash = null, ext = null }) => {
  const tempDir = Path.join(tmpdir(), 'cizn')
  await mkdir(tempDir, { recursive: true })

  return Path.join(tempDir, `${name}-${hash || crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}${ext ? `.${ext}` : ''}`)
}
