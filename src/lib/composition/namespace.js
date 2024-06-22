import { curry } from "@lib/util/index.js"

export const defineNamespace = curry((namespace, obj) => {
  const ns = {}

  Object.defineProperty(obj, namespace, {
    get () {
      return ns
    },
    iterable: true,
  })

  return obj
})

export const setNamespace = curry((symbol, value, obj) => {
  Object.assign(obj[symbol], { ...value })
  return obj
})
