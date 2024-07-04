import crypto from 'crypto'
import { tmpdir } from 'os'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'path'

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
 * Will attempt to create a temporary file with the {@param props.name},
 * {@param props.hash} and {@param props.ext} given. If the hash is not
 * present, it will create one.
 *
 * Will return the path to the temporary file.
 *
 * @param {Object} props            props
 * @param {string} props.name       the name to use
 * @param {string} [props.hash]     the hash to use
 * @param {string} [props.ext='js'] the extension to use
 * @returns {string}
 */
export const mkTempFile = async ({ name, hash = null, ext = 'js' }) => {
  const tempDir = path.join(tmpdir(), 'cizn')
  await mkdir(tempDir, { recursive: true })

  const tempFile = path.join(tempDir, `${name}-${hash || crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}${ext ? `.${ext}` : ''}`)

  await writeFile(tempFile, '')

  return tempFile
}

/**
 * Will parse the name of the file given by {@param filePath}
 * and return it
 *
 * @param {string} filePath the path to get the filename from
 * @returns {string}
 */
export const getFileName = filePath => path.basename(`${filePath}`).split('.')[0]
