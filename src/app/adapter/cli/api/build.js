/* eslint-disable no-unused-vars */
import G from '@lib/static.js'
import { access, constants, lstat, realpath } from 'node:fs/promises'
import { getFileName } from '@lib/util/index.js'

const { ADAPTER, STATE, GENERATION, DERIVATION, LOG, API, CURRENT } = G

/**
 * Building the configuration
 *
 * @param {Cizn.Application} app the main application
 * @returns {Cizn.Adapter.Cli.Api.build}
 */
const build = app => async (options, command) => {
  const log = app[ADAPTER][LOG][API]
  const {
    [DERIVATION]: { [G.API]: derivationAdapter },
    [GENERATION]: { [G.API]: generationAdapter },
  } = app[STATE]
  const { source } = options

  let configPath

  try {
    // Reading the source file
    configPath = await realpath(`${source}`)
    log.info({ message: `Reading config file %d ...`, options: [configPath] })
    await access(configPath, constants.F_OK)

    if (!(await lstat(configPath)).isFile()) {
      throw new Error()
    }
  } catch(e) {
    log.error({ message: `%d does not exist or is not readable`, options: [source] })
  }

  const { default: module } = await import(`${configPath}`)

  if (!module) {
    // error no default export
    log.error({ message: `%d does not have a default export`, options: [configPath] })
  }

  // Creating (or reusing) a derivation from the current config
  const { name, derivation } = await derivationAdapter.make({ module })

  const derivationHash = getFileName(derivation).split('-').pop()

  // Creating (or reusing) a generation from the current derivation
  await generationAdapter.make({ derivation, hash: derivationHash, name })
}

export default build
