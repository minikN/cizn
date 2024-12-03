/* eslint-disable no-unused-vars */
import { Environment } from '@cizn/core/state'
import { def, getFileName } from '@lib/util/index.js'
import {
  access, constants, lstat, realpath,
} from 'node:fs/promises'
import { CliCommandProps } from '.'
import _setup from './command/setup'

/**
 * Building the configuration
 *
 * @param {Cizn.Application} app the main application
 * @returns {Cizn.Adapter.Cli.Api['build']}
 */
const build = (app: Cizn.Application) => async (environment: Environment, options: CliCommandProps) => {
  const log = app.Manager.Log.Api

  const { Derivation, Generation } = app.State
  const { source } = options

  _setup(app)({ environment, options })

  let sourcePath: string = ''

  try {
    // Reading the source file
    sourcePath = await realpath(`${app.State.Source.Current}`)
    log.info({ message: `Reading source file %d ...`, options: [sourcePath] })
    await access(sourcePath, constants.F_OK)

    if (!(await lstat(sourcePath)).isFile()) {
      throw new Error()
    }
  } catch(e) {
    log.error({ message: `%d does not exist or is not readable`, options: [<string>source] })
  }

  const { default: module }: { default: Cizn.Application.State.Derivation.Module } = await import(`${sourcePath}`)

  if (!module) {
    // error no default export
    log.error({ message: `%d does not have a default export`, options: sourcePath ? [sourcePath] : [] })
  }

  // Creating (or reusing) a derivation from the current config
  const derivation = await Derivation.Api.make(module, 'generation', { name: getFileName(<string>source) })

  // TODO: Once converted to functional style, implement setEnvironment and withEnvironment wrappers
  // setEnvironment simply sets App.State.Environment to the input value
  // const withEnvironment = (app) => callback => previousValue => {
  //   if (!app.State.Environment) {
  //     return callback(previousValue)
  //   }

  //   const result = {}
  //   for (const environment of ['system', 'home']) {
  //     app.State.Environment = <Environment>environment
  //     result[environment] = callback(previousValue)
  //   }

  //   // should be {home: <result of cb for home>, system: <result of cb for sytem>}
  //   return result
  // }

  if (!def(environment)) {
    // Building both system and home environments
    for (const currentEnvironment of ['system', 'home']) {
      // Setting current environment
      app.State.Environment = <Environment>currentEnvironment

      // Creating (or reusing) a generation from the current derivation
      const generation = await Generation.Api.make(derivation)
    }
  } else {
    // Creating (or reusing) a generation from the current derivation
    const generation = await Generation.Api.make(derivation)
  }
}

export default build
