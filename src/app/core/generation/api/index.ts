import make from '@cizn/core/generation/api/make'
import path from '@cizn/core/generation/api/path'
import set from '@cizn/core/generation/api/set'
import get from '@cizn/core/generation/api/get'
import apply from '@cizn/core/generation/api/apply'

export type GenerationEnvironment = Extract<Cizn.Application.State.Environment, 'home' | 'system'>

export type Api = {
  make: (props: Cizn.Application.State.Derivation) => Promise<Cizn.Application.State.Generation>
  path: ({ hash }: {hash: Cizn.Application.State.Derivation['hash']}) => Promise<Cizn.Application.State.Generation>
  set: (generation: Cizn.Application.State.Generation) => Promise<void>
  get: (generationNumber?: string) => Promise<Cizn.Application.State.Generation | null>
  apply: () => Promise<void>
}

const generationApi = (App: Cizn.Application): Cizn.Application.State.Generation.Api => Object.create({}, {
  make: {
    value: make(App),
    enumerable: true,
  },
  path: {
    value: path(App),
    enumerable: true,
  },
  set: {
    value: set(App),
    enumerable: true,
  },
  get: {
    value: get(App),
    enumerable: true,
  },
  apply: {
    value: apply(App),
    enumerable: true,
  },
})

export default generationApi
