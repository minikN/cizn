import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import { defineProp } from "@lib/composition/property.js"
import { pipe } from "@lib/util/index.js"

export type Environment = 'home' | 'system' | undefined

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

const state = async (obj: Cizn.Application.State): Promise<Cizn.Application.State> => {
  const stateComposition = pipe<Cizn.Application.State>(
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
        Environment: undefined,
      },
      Root: null,
      Api: null,
    }),
    defineNamespace('Generation'),
    setNamespace('Generation', {
      Root: null,
      Current: null,
      Api: null,
    }),
    defineProp('Api', {}),
  )(obj)

  return stateComposition
}

export default state

