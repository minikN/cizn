/**
 * Functional composition.
 *
 * @param {Function[]} functions
 * @returns {function(*): *}
 */
export const compose = (...functions) => data => functions.reduce(
  (value, func) => func(value),
  data,
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
