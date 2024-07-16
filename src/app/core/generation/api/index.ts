import make from '@cizn/core/generation/api/make.js'
import get from '@cizn/core/generation/api/get.js'
import set from '@cizn/core/generation/api/set.js'

export type Api = {
  make: (props: Cizn.Application.State.Derivation) => Promise<void>
  get: ({hash}: {hash: Cizn.Application.State.Derivation['hash']}) => Promise<Cizn.Application.State.Generation>
  set: () => Promise<void>
}

const derivationApi = (app: Cizn.Application) => Object.create({}, {
  make: {
    value: make(app),
    enumerable: true,
  },
  get: {
    value: get(app),
    enumerable: true,
  },
  set: {
    value: set(app),
    enumerable: true,
  },
})

export default derivationApi
