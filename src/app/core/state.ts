/* global process */
import { setNamespace, defineNamespace } from "@lib/composition/namespace.js"
import { defineProp } from "@lib/composition/property.js"
import { pipe } from "@lib/util/index.js"
import G from '@cizn/global'
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
  [G.CONFIG]: {
    [G.CURRENT]: string,
    [G.ROOT]: string,
  }
  [G.DERIVATION]: {
    [G.STATE]: {
      [G.CONFIG]: object,
      [G.PACKAGES]: string[]
    }
    [G.ROOT]: string,
    [G.API]: Cizn.Application.State.Derivation.Api
  }
  [G.GENERATION]: {
    [G.CURRENT]: string,
    [G.ROOT]: string,
    [G.API]: Cizn.Application.State.Generation.Api
  }
}

const state = async (obj: any): Promise<Cizn.Application.State> => {
  const configRoot = await process.cwd()
  const currentConfig = `${configRoot}/config.js`
  const stateRoot = process.env?.XDG_STATE_HOME || `${process?.env.HOME}/.local/state`
  const generationsRoot = `${stateRoot}/cizn/generations`
  const derivationsRoot = `${stateRoot}/cizn/derivations`

  await $`mkdir -p ${stateRoot}/cizn/generations`
  await $`mkdir -p ${stateRoot}/cizn/derivations`

  const stateComposition = pipe<Cizn.Application.State>(
    defineNamespace(G.CONFIG),
    setNamespace(G.CONFIG, {
      [G.CURRENT]: currentConfig,
      [G.ROOT]: configRoot,
    }),
    defineNamespace(G.DERIVATION),
    setNamespace(G.DERIVATION, {
      [G.STATE]: {
        [G.CONFIG]: {},
        [G.PACKAGES]: [],
        // [G.OPTIONS]: {}, // TODO: Not needed?
        // [G.MODULES]: {}, // TODO: Not needed?
      },
      [G.ROOT]: derivationsRoot,
      [G.API]: null,
    }),
    defineNamespace(G.GENERATION),
    setNamespace(G.GENERATION, {
      [G.ROOT]: generationsRoot,
      [G.CURRENT]: null,
      [G.API]: null,
    }),
  )(obj)

  return stateComposition
}

export default state

