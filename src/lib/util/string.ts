/**
 * Will convert {@param str} to camel case.
 *
 * @param {string} str the input string
 * @returns {string}
 */
export const toCamelCase = (str: string) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (ltr, idx) => idx === 0 ? ltr.toLowerCase() : ltr.toUpperCase()).replace(/\s+/g, '')

/**
 * Will sanitize {@param str} by removing any
 * non-alphanumeric characters from it.
 *
 * @param {string} str the input string
 * @returns {string}
 */
export const sanitize = (str: string) => JSON.stringify(str).replace(/\W/g, '')