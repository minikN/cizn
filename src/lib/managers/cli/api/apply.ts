import { GenerationEnvironment } from '@cizn/core/generation/api'
import { Environment } from '@cizn/core/state'
import { guard, map } from '@lib/composition/function'
import { asyncPipe } from '@lib/composition/pipe'
import { Result, Success } from '@lib/composition/result'
import { ErrorAs, isError } from '@lib/errors'
import { def } from '@lib/util'
import { CliCommandProps } from '.'
import _setup from './command/setup'

/**
 * If an environment is set, it will execute `callback` with the provided `options`.
 * If not, it'll loop through all possible environments, set it per iteration and then
 * execute `callback` with the provided `options`.
 *
 * @param {Cizn.Application} app  the application
 * @param {Function} callback     the callback to apply for each environment
 * @returns {undefined}
 */
const withEnvironment = <E, V>(
  app: Cizn.Application, callback: (a: Cizn.Application) => (options: CliCommandProps) => Result<E, V>) => async (
    { environment, options }: {environment: Environment, options: CliCommandProps},
  ) => {
    if (!def(environment)) {
      for (const currentEnv of ['home', 'system']) {
        const env = <GenerationEnvironment>currentEnv
        app.State.Environment = env

        const result = await callback(app)(options)
        if (isError(result)) return result
      }
      app.State.Environment = null
    } else {
      app.State.Environment = environment

      const result = await callback(app)(options)
      if (isError(result)) return result
    }

    return Success(undefined)
  }

/**
 * Applies either the newest generation or the one denoted by the `--generation` args
 * provided by the user.
 *
 * @param {Cizn.Application} app the application
 * @returns {undefined}
 */
const applyGeneration = (app: Cizn.Application) => (options: CliCommandProps) => asyncPipe(
  Success(options.generation),
  map(app.State.Generation.Api.get),
  map(app.State.Generation.Api.set),
  map(guard(app.State.Generation.Api.apply, {
    EACCES: ErrorAs('EACCES', {
      reasons: [
        'You didn\'t run the command with elevated privilegdes. Try prepending "sudo -E" to it',
      ],
    }),
  })),
)

/**
 * Applies either the newest generation or the one denoted by the `--generation` args
 * provided by the user.
 *
 * @param {Cizn.Application} app the application
 * @returns {undefined}
 */
const apply = (app: Cizn.Application) => async (environment: Environment, options: CliCommandProps) => asyncPipe(
  Success({ environment, options }),
  map(_setup(app)),
  map(withEnvironment(app, applyGeneration)),
  result => app.Manager.Cli.Result = result,
)

export default apply
