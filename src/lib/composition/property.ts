/**
 * Returns a function that allows the definition of an immutable
 * {@param prop} with {@param value} on {@code obj}.
 *
 * @param prop the name of the prop to set
 * @param value the value of the prop to set
 * @returns Function
 */
export const defineImmutableProp = <A, T>(prop: string, value: A): (obj: T) => T => (obj: T): T => {
  Object.defineProperty(obj, prop, {
    enumerable: true,
    configurable: false,

    get () {
      return value
    },
  })

  return obj
}

/**
 * Returns a function that allows the definition of a mutable
 * {@param prop}, with initial {@param value} on {@code obj}.
 *
 * @param {string} prop the name of the prop to set
 * @param {A} value     the value of the prop to set
 */
export const defineProp = <A, T>(prop: string, value: A): (obj: T) => T => (obj: T): T => {
  let propValue = value
  Object.defineProperty(obj, prop, {
    enumerable: true,
    configurable: false,

    get () { return propValue},
    set (value) { propValue = value },
  })

  return obj
}