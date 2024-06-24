import { setNamespace, defineNamespace } from "@lib/composition/namespace.js"
import { compose } from "@lib/util/index.js"
import G from '@lib/static.js'
import 'zx/globals'
// /* global process */
// import { readlink, realpath, readdir, mkdir } from 'node:fs/promises'
// import * as path from "node:path"

// export const testFn = () => {
//   console.log('test')
// }

// /**
//  * Initializes the application state.
//  *
//  * @param {PathLike} config
//  * @param {import('@commander-js/extra-typings').Command} command
//  * @returns {Promise<void>}
//  * @constructor
//  */
// const State = async ({ config: configPath }, command) => {
//   return new Promise(async (resolve) => {
//     const config = await realpath(configPath)
//     const configRoot = path.dirname(config)
//     const stateRoot = process.env?.XDG_STATE_HOME || configRoot
//     const generationsRoot = `${stateRoot}/cizn/generations`
//     const derivationsRoot = `${stateRoot}/cizn/derivations`
//     let lastWorkingGeneration = null
//     let currentGenerationRoot = null
//     let currentGeneration = null

//     await mkdir(generationsRoot, { recursive: true })
//     await mkdir(derivationsRoot, { recursive: true })

//     resolve({
//       config,
//       configRoot,
//       stateRoot,
//       generationsRoot,
//       derivationsRoot,
//       lastWorkingGeneration,
//       currentGenerationRoot,
//       currentGeneration,
//     })
//   }).catch(e => command.error(e.message))
// }

// export default State
const { CONFIG, GENERATION, DERIVATION, CURRENT, ROOT } = G


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
    setNamespace(CONFIG, {
      [CURRENT]: currentConfig,
      [ROOT]: configRoot,
    }),
    defineNamespace(DERIVATION),
    setNamespace(DERIVATION, {
      [CURRENT]: derivationsRoot,
      [ROOT]: null,
    }),
    defineNamespace(GENERATION),
    setNamespace(GENERATION, {
      [CURRENT]: generationsRoot,
      [ROOT]: null,
    }),

  )(obj)

  return stateComposition
}

export default state

