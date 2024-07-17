import { curry } from "@lib/util/index.js"

export const defineNamespace = curry((namespace: PropertyKey, obj: any) => {
  const ns = {}

  Object.defineProperty(obj, namespace, {
    get () {
      return ns
    },
    enumerable: true,
  })

  return obj
})

export const setNamespace = curry((symbol: PropertyKey, value: any, obj: any) => {
  Object.assign(obj[symbol], { ...value })
  return obj
})
