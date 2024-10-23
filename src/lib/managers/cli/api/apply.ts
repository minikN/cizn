/* eslint-disable no-unused-vars */
import { GenerationEnvironment } from '@cizn/core/generation/api'
import { Environment } from '@cizn/core/state'
import { def } from '@lib/util'
import { CliCommandProps } from '.'
import _setup from './command/setup'

/**
 * Building the configuration
 *
 * @param {Cizn.Application} app the main application
 * @returns {Cizn.Adapter.Cli.Api['build']}
 */
const apply = (app: Cizn.Application) => async (environment: Environment, options: CliCommandProps) => {
  _setup(app)(environment, options)

  const log = app.Manager.Log.Api
  const { Generation } = app.State

  if (!def(environment)) {
    for (const currentEnvironment of ['system', 'home']) {
      app.State.Environment = <GenerationEnvironment>currentEnvironment

      // app.State.Generation.Current[<GenerationEnvironment>currentEnvironment] = await Generation.Api.get(options.generation)
      const generation = await Generation.Api.get(options.generation)

      if (!generation) {
        options.generation
          ? log.error({ message: 'Could not find generation %d.', options: [options.generation] })
          : log.error({ message: 'No generation to apply' })
      } else {
        await Generation.Api.set(generation)
        await Generation.Api.apply()
      }

    }
  } else {
    const generation = await Generation.Api.get(options.generation)

    if (!generation) {
      options.generation
        ? log.error({ message: 'Could not find generation %d.', options: [options.generation] })
        : log.error({ message: 'No generation to apply' })
    } else {
      await Generation.Api.set(generation)
      await Generation.Api.apply()
    }

  }


}

export default apply
