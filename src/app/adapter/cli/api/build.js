import G from '@lib/static.js'
import { $ } from 'execa'
import { access, constants, lstatSync } from 'node:fs'
const { ADAPTER, STATE, DERIVATION, LOG, API } = G

const build = app => async (options, command) => {
  const log = app[ADAPTER][LOG][API]
  const derivation = app[STATE][DERIVATION]

  const { source } = options
  const { stdout: configPath } = await $`realpath ${source}`
  log.info({ message: `Reading config file ${configPath} ...` })

  access(configPath, constants.F_OK, (err) => {
    if (err || !lstatSync(configPath).isFile()) {
      log.error({ message: `${configPath} does not exist. Aborting.` })
    }
  })

  try {
    const { config } = await import(`${configPath}`)
    await derivation[API].make({ config })

  } catch (e) {
    log.error({ message: `Error reading config file: ${e.message}` })
  }
}

export default build
