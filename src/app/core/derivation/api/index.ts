import make from '@cizn/core/derivation/api/make.js'
import get from '@cizn/core/derivation/api/get.js'

export type GetProps = {
  name: string,
  hashParts: {
    config?: Object,
    args?: Object,
    module: Cizn.Application.State.Derivation.Module | string,
  }
}

export type GetType = Promise<{
  path?: Cizn.Application.State.Derivation['path'],
  hash?: Cizn.Application.State.Derivation['hash'],
}>

export type Api = {
  make: (module: Cizn.Application.State.Derivation.Module) => Cizn.Application.State.Derivation
  get: (props: GetProps) => GetType
}

const derivationApi = (app: Cizn.Application): Api => Object.create({}, {
  make: {
    value: make(app),
    enumerable: true,
  },
  get: {
    value: get(app),
    enumerable: true,
  },
})

export default derivationApi
