/* global process */
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import { pipe } from "@lib/util/index.js"
import { $ } from 'execa'

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

export type State = {
  Config: {
    Current: string,
    Root: string,
  }
  Derivation: {
    State: {
      Config: object,
      Packages: string[]
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
  const configRoot = await process.cwd()
  const currentConfig = `${configRoot}/config.js`
  const stateRoot = process.env?.XDG_STATE_HOME || `${process?.env.HOME}/.local/state`
  const generationsRoot = `${stateRoot}/cizn/generations`
  const derivationsRoot = `${stateRoot}/cizn/derivations`

  await $`mkdir -p ${stateRoot}/cizn/generations`
  await $`mkdir -p ${stateRoot}/cizn/derivations`

  const stateComposition = pipe<Cizn.Application.State>(
    defineNamespace('Config'),
    setNamespace('Config', {
      Current: currentConfig,
      Root: configRoot,
    }),
    defineNamespace('Derivation'),
    setNamespace('Derivation', {
      State: {
        Config: {},
        Packages: [],
      // [G.OPTIONS]: {}, // TODO: Not needed?
      // [G.MODULES]: {}, // TODO: Not needed?
      },
      Root: derivationsRoot,
      Api: null,
    }),
    defineNamespace('Generation'),
    setNamespace('Generation', {
      Root: generationsRoot,
      Current: null,
      Api: null,
    }),
  )(obj)

  return stateComposition
}

export default state

