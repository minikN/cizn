import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import { defineProp } from "@lib/composition/property.js"
import stateApi from "@cizn/core/state/api"
import derivationApi from "@cizn/core/derivation/api/index.js"
// import { pipe } from "@lib/util/index.js"
import { pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { tee } from "@lib/composition/function"
import generationApi from "./generation/api"

export type Environment = O.Option<'home' | 'system'>

type ApiTypes = O.Option<'Derivation' | 'Generation'>

export type Derivation = {
  name: string,
  path: string,
  hash?: string,
}

export type Generation = {
  number: number,
  path?: string,
  hash?: string,
}

export type Config = {
  package?: {
    manager?: string,
    helper?: string,
  }
}

export type State = {
  Api: Cizn.Application.State.Api
  Environment: Cizn.Application.State.Environment
  Source: {
    Current: string,
    Root: string,
  }
  Config: Cizn.Application.State.Config
  Derivation: {
    State: {
      Config: object,
      Packages: {
        Home: string[],
        System: string[]
      }
    }
    Root: string,
    Api: Cizn.Application.State.Derivation.Api
  }
  Generation: {
    Current: string,
    Root: string,
    Api: Cizn.Application.State.Generation.Api
  }
}

const state = pipe(
  <Cizn.Application.State>{},
  defineNamespace('Config'),
  setNamespace('Config', {
    Current: null,
    State: {},
  }),
  defineNamespace('Source'),
  setNamespace('Source', {
    Current: null,
    Root: null,
  }),
  defineNamespace('Derivation'),
  setNamespace('Derivation', {
    State: {
      Config: {},
      Packages: {
        Home: [],
        System: [],
      },
      Environment: O.none,
    },
    Root: null,
  }),
  defineNamespace('Generation'),
  setNamespace('Generation', {
    Root: null,
    Current: null,
  }),
)

/**
 * Helper function to build the {@param ns} api.
 *
 * @param {Function} fn builder function for the {@param ns} api
 * @param {ApiTypes} ns the api to build
 * @returns {Cizn.Application}
 */
const setApi = (fn: Function, ns: ApiTypes = O.none) => tee((app: Cizn.Application) => pipe(
  ns,
  O.matchW(
    () => app.State,
    api => app.State[api],
  ),
  defineNamespace('Api'),
  setNamespace('Api', fn(app)),
))

export const setStateApi = setApi(stateApi)
export const setDerivationApi = setApi(derivationApi, O.some('Derivation'))
export const setGenerationApi = setApi(generationApi, O.some('Generation'))

export default state

