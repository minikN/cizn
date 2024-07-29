/* eslint-disable no-unused-vars */
import { $ } from 'execa'
import {
  access, constants, lstat, realpath, readFile,
} from 'fs/promises'

const init = (App: Cizn.Application) => async (): Promise<void> => {
  const log = App.Adapter.Log.Api
  const appState = App.State
  const configPath = App.State.Config.Current
  const defaultConfigPath = `${process.env.XDG_CONFIG_HOME}/cizn/cizn.json`
  let usedConfigPath: string = ''

  try {
    // Reading the source file
    const promisedConfigPath = await realpath(`${configPath || defaultConfigPath}`)
    usedConfigPath = promisedConfigPath
    log.info({ message: `Reading config file %d ...`, options: [usedConfigPath] })
    await access(usedConfigPath, constants.F_OK)

    if (!(await lstat(usedConfigPath)).isFile()) {
      throw new Error()
    }
  } catch(e) {
    if (configPath) {
      log.error({ message: `%d does not exist or is not readable`, options: [configPath] })
    } else {
      log.warn({ message: `%d does not exist or is not readable. Using default values.`, options: [defaultConfigPath] })
    }
  }

  const currentSourceRoot = await process.cwd()
  const currentSource = `${currentSourceRoot}/config.js`

  try {
    // Assigning fallback values to every possible config value
    const {
      package: {
        manager = undefined,
        helper = manager,
      } = {},
    } = usedConfigPath
      ? <Cizn.Application.State.Config["State"]>JSON.parse((await readFile(`${usedConfigPath}`)).toString())
      : <Cizn.Application.State.Config["State"]>{}

    // Assinging the values to {@code configuration}
    App.State.Config.State = {
      package: {
        manager: process.env?.CIZN_PACKAGE_MANAGER || manager,
        helper: process.env?.CIZN_PACKAGE_HELPER || helper,
      },
    }
  } catch(e) {
    log.error({ message: `%d does not contain valid JSON`, options: [usedConfigPath] })
  }


  const stateRoot = process.env?.XDG_STATE_HOME || `${process?.env.HOME}/.local/state`
  const generationsRoot = `${stateRoot}/cizn/generations`
  const derivationsRoot = `${stateRoot}/cizn/derivations`

  await $`mkdir -p ${stateRoot}/cizn/generations`
  await $`mkdir -p ${stateRoot}/cizn/derivations`

  appState.Source.Current = currentSource
  appState.Source.Root = currentSourceRoot

  appState.Derivation.Root = derivationsRoot
  appState.Generation.Root = generationsRoot

}

export default init