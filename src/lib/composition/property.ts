import { curry } from "@lib/util/index.js"

/**
 * Defines immutable {@param prop} in {@obj} with {@param value}.
 *
 * @type {(function(...[*]): (*))|*}
 */
export const defineImmutableProp = curry((prop: string | symbol, value: any, obj: any) => {
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
 * Defines mutable {@param prop} in {@param obj}.
 *
 * @type {(function(...[*]): (*))|*}
 */
export const defineProp = curry((prop: string | symbol, value: any, obj: any) => {
  let propValue = value
  Object.defineProperty(obj, prop, {
    enumerable: true,
    configurable: false,

    get () { return propValue},
    set (value) { propValue = value },
  })

  return obj
})