import { curry } from "@lib/util/index.js"

/**
 * Defines immutable {@param prop} in {@obj} with {@param value}.
 *
 * @type {(function(...[*]): (*))|*}
 */
export const defineImmutableProp = curry((prop, value, obj) => {
  Object.defineProperty(obj, prop, {
    enumerable: true,
    configurable: false,

    get () {
      return value
    },
  })

  return obj
})

/**
 * Defines mutable {@param prop} in {@obj}.
 *
 * @type {(function(...[*]): (*))|*}
 */
export const defineProp = curry((prop, obj) => {
  let propValue
  Object.defineProperty(obj, prop, {
    enumerable: true,
    configurable: false,

    get () { return propValue},
    set (value) { propValue = value },
  })

  return obj
})