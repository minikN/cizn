import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import { pipe } from '@lib/composition/pipe'

export type Environment = 'home' | 'system' | null

export type DerivationEnvironment = {
  out?: string,
  content?: string,
  path?: string,
  name?: string,
}

export type Derivation = {
  name: string,
  path: string,
  hash: string,

  env?: DerivationEnvironment,
  inputs?: Derivation[],
  outputs?: string[],
  builder?: 'generation' | 'module' | 'file' | 'package' | 'service',
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
  Environment: Cizn.Application.State.Environment
  Source: {
    Current: string,
    Root: string,
  }
  Config: Cizn.Application.State.Config
  Derivation: {
    State: {
      Config: { [key: string]: string | boolean | number | null },
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

/**
 * Composes the application state
 *
 * @returns {Cizn.Application.State}
 */
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
      Environment: null,
    },
    Root: null,
  }),
  defineNamespace('Generation'),
  setNamespace('Generation', {
    Root: null,
    Current: null,
  }),
)

export default state

