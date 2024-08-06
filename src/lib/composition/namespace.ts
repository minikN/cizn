export const defineNamespace = (namespace: string) => <T>(obj: T) => {
  const ns = {}

  Object.defineProperty(obj, namespace, {
    get () {
      return ns
    },
    enumerable: true,
  })

  return obj
}

export const setNamespace = (symbol: string, value: object) => <T extends {[key: string]: any}>(obj: T) => {
  Object.assign(obj[symbol], { ...value })
  return obj
}
