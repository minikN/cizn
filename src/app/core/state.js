/* global process */
import { readlink, realpath, readdir, mkdir } from 'node:fs/promises'
import * as path from "node:path"

export const testFn = () => {
  console.log('test')
}

/**
 * Initializes the application state.
 *
 * @param {PathLike} config
 * @param {import('@commander-js/extra-typings').Command} command
 * @returns {Promise<void>}
 * @constructor
 */
const State = async ({ config: configPath }, command) => {
  return new Promise(async (resolve) => {
    const config = await realpath(configPath)
    const configRoot = path.dirname(config)
    const stateRoot = process.env?.XDG_STATE_HOME || configRoot
    const generationsRoot = `${stateRoot}/cizn/generations`
    const derivationsRoot = `${stateRoot}/cizn/derivations`
    let lastWorkingGeneration = null
    let currentGenerationRoot = null
    let currentGeneration = null

    await mkdir(generationsRoot, { recursive: true })
    await mkdir(derivationsRoot, { recursive: true })

    resolve({
      config,
      configRoot,
      stateRoot,
      generationsRoot,
      derivationsRoot,
      lastWorkingGeneration,
      currentGenerationRoot,
      currentGeneration,
    })
  }).catch(e => command.error(e.message))
}

export default State
