import crypto from 'node:crypto'
import { getFileName, isStr } from '@lib/util/index.ts'

/**
 * Will convert {@param str} to camel case.
 *
 * @param {string} str the input string
 * @returns {string}
 */
export const toCamelCase = (str: string) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (ltr, idx: number) => idx === 0 ? ltr.toLowerCase() : ltr.toUpperCase()).replace(/\s+/g, '')

/**
 * Will sanitize {@param str} by removing any
 * non-alphanumeric characters from it.
 *
 * @param {string} str the input string
 * @returns {string}
 */
export const sanitize = (str: string) => JSON.stringify(str).replace(/\W/g, '')

/**
 * Sanitizes `str` by removing comments and empty lines from it.
 *
 * @param {string} str string representation of a function
 * @returns {string} sanitized string
 */
export const sanitizeMultilineString = (str: string) => str
  .replace(/\/\*(.|[\r\n])*?\*\//g, '') // multiline comments
  .replace(/\/\/.*/gm, '') // normal comments
  .replace(/^\s*\n/gm, '') // empty lines

/**
 * Will return a hash for `string`.
 *
 * @param {string|object} input the input to hash
 * @returns {string}
 */
export const makeHash = (input: string | object) => crypto
  .createHash('md5')
  .update(isStr(input)
    ? <string>input
    : JSON.stringify(input))
  .digest('hex')

/**
 *  Will return the hash that is contained in `input`.
 *
 * @param {string} input  the path to get the filename from
 * @returns {string} filename
 */
export const getHash = (input: string) => getFileName(input)?.split?.('-')?.[0] || ''

/**
 * Returns `true` if `path` points to a file or directory inside
 * the users home folder.
 *
 * @param {string} path the path to check
 * @returns {boolean}
 */
export const isHomePath = (path: string) => path.startsWith('/home/') || !path.startsWith('/')

/**
 * Returns the number of a generation for `path`.
 *
 * @param {string} path the path to extract the number from
 * @returns {number}
 */
export const getGenerationNumber = (path: string) => parseInt(path.split('-')[0], 10)

/**
 * Concats `str` to `input`.
 *
 * @param {string} str the string to concat
 * @returns {string}
 */
export const concat = (str: string) => (input: string) => `${input}${str}`

/**
 * Prepends `str` to `input`.
 *
 * @param {string} prefix the string to prepend
 * @returns {string}
 */
export const prepend = (str: string) => (input: string) => `${str}${input}`

/**
 * Strips `str` from the end of `input`.
 *
 * @param {string} str the string to strip
 * @returns {string}
 */
export const stripRight = (str: string) => (input: string) => input.replace(new RegExp(`${str}+$`), '')

/**
 * Strips `str` from `input`.
 *
 * @param {string} str the string to strip
 * @returns {string}
 */
export const strip = (str: string) => (input: string) => input.replace(str, '')