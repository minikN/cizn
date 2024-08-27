import make from '@cizn/core/generation/api/make.js'
import get from '@cizn/core/generation/api/get.js'
import set from '@cizn/core/generation/api/set.js'

export type Api = {
  make: (props: Cizn.Application.State.Derivation) => Promise<void>
  get: ({ hash }: {hash: Cizn.Application.State.Derivation['hash']}) => Promise<Cizn.Application.State.Generation>
  set: () => Promise<void>
}

const generationApi = (App: Cizn.Application): Cizn.Application.State.Generation.Api => Object.create({}, {
  make: {
    value: make(App),
    enumerable: true,
  },
  get: {
    value: get(App),
    enumerable: true,
  },
  set: {
    value: set(App),
    enumerable: true,
  },
})

export default generationApi
