/* eslint-disable no-unused-vars */
import G from '@lib/static.js'
import { realpath, access, lstat, constants, readFile } from 'node:fs/promises'
import { mkTempFile } from '@lib/util/index.js'
import { locate } from 'func-loc'
const { ADAPTER, STATE, MODULES, DERIVATION, LOG, API } = G

const build = app => async (options, command) => {
  const log = app[ADAPTER][LOG][API]
  const derivation = app[STATE][DERIVATION]
  const { source } = options

  let configPath

  try {
    configPath = await realpath(`${source}`)
    log.info({ message: `Reading config file ${configPath} ...` })

    await access(configPath, constants.F_OK)
    if (!(await lstat(configPath)).isFile()) {
      throw new Error()
    }
  } catch(e) {
    log.error({ message: `${source} does not exist or is not readable` })
  }

  try {
    const { config } = await import(`${configPath}`)
    const derivationTempFile = await mkTempFile({ name: 'derivation', ext: 'drv' })

    await derivation[G.API].init({ config })

    for (let i = 0; i < config.length; i++) {
      const { name, args = {}, module } = config[i]

      if (!name) {
        log.error({ message: `A module has no defined name It needs to export a name property. Aborting.` })
      }

      if (derivation[STATE][MODULES][name]) {
        log.error({ message: `Module ${name} declared multiple times. Aborting.` })
      }

      derivation[G.STATE][MODULES][name] = { args, module }

      const moduleFileLocation = await locate(module)
      const moduleFile = await readFile(`${moduleFileLocation.path}`)

      await derivation[API].make({ name, file: moduleFile, fn: module, args })
    }
    const x = 1
  } catch (e) {
    log.error({ message: `Error readind config file: ${e.message}` })
  }
}

export default build
