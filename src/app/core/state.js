/* global process */
import { setNamespace, defineNamespace } from "@lib/composition/namespace.js"
import { defineProp } from "@lib/composition/property.js"
import { compose } from "@lib/util/index.js"
import G from '@lib/static.js'
import { $ } from 'execa'

const { MODULES, OPTIONS, CONFIG, GENERATION, DERIVATION, CURRENT, ROOT, API, STATE } = G


const state = async (obj) => {
  const configRoot = await process.cwd()
  const currentConfig = `${configRoot}/config.js`
  const stateRoot = process.env?.XDG_STATE_HOME || `${process?.env.HOME}/.local/state`
  const generationsRoot = `${stateRoot}/cizn/generations`
  const derivationsRoot = `${stateRoot}/cizn/derivations`

  await $`mkdir -p ${stateRoot}/cizn/generations`
  await $`mkdir -p ${stateRoot}/cizn/derivations`

  const stateComposition = compose(
    defineNamespace(CONFIG),
    defineProp(MODULES, {}),
    defineProp(OPTIONS, {}),
    setNamespace(CONFIG, {
      [CURRENT]: currentConfig,
      [ROOT]: configRoot,
    }),
    defineNamespace(DERIVATION),
    setNamespace(DERIVATION, {
      [CURRENT]: null,
      [STATE]: {
        [OPTIONS]: {},
        [MODULES]: {},
      },
      [ROOT]: derivationsRoot,
      [API]: null,
    }),
    defineNamespace(GENERATION),
    setNamespace(GENERATION, {
      [CURRENT]: generationsRoot,
      [ROOT]: null,
      [API]: null,
    }),

  )(obj)

  return stateComposition
}

export default state

