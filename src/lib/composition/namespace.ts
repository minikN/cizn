export const defineNamespace = <T>(namespace: string) => (obj: T) => {
  const ns = {}

  Object.defineProperty(obj, namespace, {
    get () {
      return ns
    },
    enumerable: true,
  })

  return obj as T
}

export const setNamespace = (symbol: string, value: object) => <T extends {[key: string]: any}>(obj: T) => {
  Object.assign(obj[symbol], { ...value })
  return obj as T
}
