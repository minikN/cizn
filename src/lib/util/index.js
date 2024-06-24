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
