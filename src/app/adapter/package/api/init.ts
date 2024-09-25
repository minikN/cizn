import {
  CiznError,
  NotFoundError,
  NotSupportedError,
} from "@lib/util/error"
import { $ } from 'execa'

import pacmanApi from '@cizn/adapter/package/pacman/api'

type ApiFunction = (App: Cizn.Application) => Cizn.Adapter.Package.Api

type ApiType = {
  [pacman: string]: ApiFunction
}

const apiMapping: ApiType = {
  pacman: pacmanApi,
  yay: pacmanApi,
}

const packageManagerMappings = {
  pacman: ['arch'],
  dpkg: ['ubuntu', 'debian'],
}

// const packageApiMappings = { pacman: ['pacman', 'yay'] }

/**
 * Determines the correct package manager to use based on
 * the system type
 * @returns Promise<string>
 */
const _determinePackageManager = async (): Promise<string> => {
  const { stdout } = await $`cat /etc/os-release`
  const osId = stdout
    ?.split('\n')
    ?.find(x => x.includes('ID'))
    ?.split('=')
    .pop()

  const foundExecutable = Object
    .entries(packageManagerMappings)
    .reduce(
      (acc: string | null, [key, value]) => osId && value.includes(osId)
        ? key
        : acc,
      null,
    )

  if(!osId) throw NotFoundError()
  if(!foundExecutable) throw NotSupportedError([osId])

  return foundExecutable
}

const init = (app: Cizn.Application) => async (): Promise<Cizn.Adapter.Package.Api | void> => {
  // Figure out correct package API here based on system
  const { Platform: { Package } } = app.Adapter
  const { Log: { Api: log } } = app.Manager
  const { Config: { State } } = app.State
  const { manager: defaultManager, helper: defaultHelper } = State.package || {}

  try {
    const { stdout: manager } = await $`which ${defaultManager || await _determinePackageManager()}`
    const { stdout: helper = undefined } = defaultHelper
      ? await $`which ${defaultHelper}`
      : {}

    Package.Manager.Exec = manager
    Package.Helper.Exec = helper

    const managerName = manager && manager.split('/').pop()
    const helperName = helper && helper.split('/').pop()

    if (managerName || helperName) {
      const targetApi = apiMapping[<string>helperName] || apiMapping[<string>managerName]
      const loadedApi = <Cizn.Adapter.Package.Api>targetApi(app)

      loadedApi.init()

      return loadedApi
    }
  } catch (e) {
    if ((e as Error).name === 'CiznNotFoundError') {
      log.error({
        message: `Could not determine operating system reading %d. You can manually define the
       package manager (and optionally helper) to use using either a config file (%d) or the
       following environment variables: %d, %d.
       Consult the documentation or man page for more information`,
        options: ['/etc/os-release', '--config', 'CIZN_PACKAGE_MANAGER', 'CIZN_PACKAGE_HELPER'],
      })
    } else if ((e as Error).name === 'CiznNotSupportedError') {
      log.error({
        message: `The selected operating system identifier (%d) is currently not supported.`,
        options: (e as CiznError).options,
      })
    } else {
      log.error({ message: 'Generic error: %d', options: [(e as Error).message] })
    }
  }
}

export default init