/* eslint-disable no-unused-vars */
import {
  access, constants, lstat, realpath,
} from 'node:fs/promises'
import {
  def, getFileName, isStr,
} from '@lib/util/index.js'
import { BuildProps } from '.'
import { Environment } from '@cizn/core/state'
import path from 'path'

/**
 * Building the configuration
 *
 * @param {Cizn.Application} App the main application
 * @returns {Cizn.Adapter.Cli.Api['build']}
 */
const build = (App: Cizn.Application) => async (environment: Environment, options: BuildProps) => {
  const log = App.Adapter.Log.Api
  const {
    Derivation: { Api: derivationAdapter },
    Generation: { Api: generationAdapter },
  } = App.State
  const { source } = options

  if (source) {
    App.State.Source.Current = source
    App.State.Source.Root = path.dirname(source)
  }

  if (isStr(environment) && environment !== 'home' && environment !== 'system') {
    const falseEnvironment = <unknown>environment
    log.error({
      message: 'Environment given is not recognized. Can only be "home" or "system". Given value: %d',
      options: [<string>falseEnvironment],
    })
  }

  App.State.Environment = environment

  let sourcePath: string = ''

  try {
    // Reading the source file
    sourcePath = await realpath(`${App.State.Source.Current}`)
    log.info({ message: `Reading source file %d ...`, options: [sourcePath] })
    await access(sourcePath, constants.F_OK)

    if (!(await lstat(sourcePath)).isFile()) {
      throw new Error()
    }
  } catch(e) {
    log.error({ message: `%d does not exist or is not readable`, options: [source] })
  }

  const { default: module }: { default: Cizn.Application.State.Derivation.Module } = await import(`${sourcePath}`)

  if (!module) {
    // error no default export
    log.error({ message: `%d does not have a default export`, options: sourcePath ? [sourcePath] : [] })
  }

  if (!def(environment)) {
    // Building both system and home environments
    for (const currentEnvironment of ['system', 'home']) {
      // Cleaning state between environments
      App.State.Derivation.State.Config = {}
      App.State.Derivation.State.Packages.Home = []
      App.State.Derivation.State.Packages.System = []

      // Setting current environment
      App.State.Environment = <Environment>currentEnvironment

      log.info({ message: 'Building %d derivation ...', options: [<string>currentEnvironment] })

      // Creating (or reusing) a derivation from the current config
      const { name, path } = await derivationAdapter.make(module)
      const derivationHash = getFileName(path).split('-').pop()

      // Creating (or reusing) a generation from the current derivation
      await generationAdapter.make({
        path, hash: derivationHash, name,
      })
    }
  } else {
    log.info({ message: 'Building %d derivation ...', options: [<string>environment] })

    // Just building the environment given by the user
    // Creating (or reusing) a derivation from the current config
    const { name, path } = await derivationAdapter.make(module)
    const derivationHash = getFileName(path).split('-').pop()

    // Creating (or reusing) a generation from the current derivation
    await generationAdapter.make({
      path, hash: derivationHash, name,
    })
  }
}

export default build
