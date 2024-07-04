/* eslint-disable no-unused-vars */
import G from '@lib/static.js'
import { access, constants, lstat, realpath } from 'node:fs/promises'

const { ADAPTER, STATE, MODULES, DERIVATION, LOG, API, CURRENT } = G

/**
 * Building the configuration
 *
 * @param {Cizn.Application} app the main application
 * @returns {Cizn.Adapter.Cli.Api.build}
 */
const build = app => async (options, command) => {
  const log = app[ADAPTER][LOG][API]
  const { [DERIVATION]: { [G.API]: derivationAdapter } } = app[STATE]
  const { source } = options

  let configPath

  try {
    // Reading the source file
    log.info({ message: `Reading config file ${configPath} ...` })
    configPath = await realpath(`${source}`)
    await access(configPath, constants.F_OK)

    if (!(await lstat(configPath)).isFile()) {
      throw new Error()
    }
  } catch(e) {
    log.error({ message: `${source} does not exist or is not readable` })
  }

  const { default: module } = await import(`${configPath}`)

  if (!module) {
    // error no default export
  }

  await derivationAdapter.make({ module })
}

export default build
