import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import { pipe } from '@lib/composition/pipe'
import { def } from "@lib/util"
import { GenerationEnvironment } from "./generation/api"

export type Environment = 'home' | 'system' | null

type Builder = 'generation' | 'module' | 'package' | 'service'

export type FileDerivation = {
  builder: 'file',
  env: FileDerivationEnvironment
}

export type DerivationData = {
  content?: string,
  path?: string,
  name?: string,
}

export type DerivationEnvironment = {
  out: string,
  content?: string,
  path?: string,
  name: string,
}

export type FileDerivationEnvironment = DerivationEnvironment & {
  content: string,
  path: string,
}

export type Derivation = {
  name: string,
  path: string,
  hash: string,

  inputs: Derivation[],
  outputs?: string[],
} & (FileDerivation | {
  // TODO: Create more derivation types (for service, package, ...)
  builder: Builder,
  env: DerivationEnvironment
})

export type Generation = {
  number: number,
  exists: boolean,
  path: string,
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
      Built: Derivation[],
      Packages: {
        Home: string[],
        System: string[]
      }
    }
    Root: string,
    Api: Cizn.Application.State.Derivation.Api
  }
  Generation: {
    Current: {
      [Property in GenerationEnvironment]: Generation | null
    }
    Root: string,
    Api: Cizn.Application.State.Generation.Api
  }
}

// type guards
export const isDrv = (x: unknown): x is Derivation => def(x)
  && Object.hasOwnProperty.call(x, 'name')
  && Object.hasOwnProperty.call(x, 'path')
  && Object.hasOwnProperty.call(x, 'hash')

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
      Built: [],
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
    Current: {
      'home': null,
      'system': null,
    },
  }),
)

export default state

