import { GenerationEnvironment } from '@cizn/core/generation/api/index.ts'
import { Environment } from '@cizn/core/state.ts'
import { bind, map, tap } from '@lib/composition/function.ts'
import { pipe } from '@lib/composition/pipe.ts'
import { Failure, isFailure, Result, Success } from '@lib/composition/result.ts'
import { Error } from '@lib/errors/index.ts'
import { CliCommandProps } from '@lib/managers/cli/api/index.ts'
import { def, isStr } from '@lib/util/index.ts'
import path from 'node:path'

/**
 * Sets the application `source` to the provided value if it's available.
 *
 * This is a side effect and has no return value.
 *
 * @param {Cizn.Application} app the application
 * @returns {undefined}
 */
const setSource = (app: Cizn.Application) => ({ options }: { options: CliCommandProps; environment: Environment }) => {
  if (options?.source) {
    app.State.Source.Current = options.source
    app.State.Source.Root = path.dirname(options.source)
  }
}

/**
 * Checks if `environment` is a value not recognized by the application.
 *
 * Returns a {@link Failure} if so, otherwise returns the environment as a
 * {@link Success}.
 *
 * @param {Object} props
 * @param {Environment} props.environment the given environment
 * @returns
 */
const ensureEnvironment = ({ environment, options }: { environment: Environment; options: CliCommandProps }) =>
  isStr(environment) && environment !== 'home' && environment !== 'system'
    ? Failure(Error('NOT_KNOWN_ENVIRONMENT', {
      label: 'Environment given is not recognized. Can only be "home" or "system". Given value: %d',
      options: [<string> <unknown> environment],
    }))
    : Success({ environment, options })

/**
 * Sets the `environment`.
 *
 * @param {Cizn.Application} app the application
 * @returns {Environment} the set environment
 */
const setEnvironment = (app: Cizn.Application) =>
(
  { environment, options }: { environment: Environment; options: CliCommandProps },
) => {
  app.State.Environment = environment

  return { environment, options }
}

/**
 * Sets up the `environment` given the provided user value.
 *
 * @param {Cizn.Application} app the application
 */
export const setupEnvironment = (app: Cizn.Application) =>
(
  { environment, options }: { environment: Environment; options: CliCommandProps },
) =>
  pipe(
    Success({ environment, options }),
    tap((x) => setSource(app)(x)),
    map(ensureEnvironment),
    bind(setEnvironment(app)),
  )
/**
 * If an environment is set, it will execute `callback` with the provided `options`.
 * If not, it'll loop through all possible environments, set it per iteration and then
 * execute `callback` with the provided `options`.
 *
 * @param {Cizn.Application} app  the application
 * @param {Function} callback     the callback to apply for each environment
 */
export const withEnvironment = <T, E, V>(
  app: Cizn.Application,
  callback: (a: Cizn.Application) => (data: T) => Result<E, V> | Promise<Result<E, V>>,
) =>
async (props: T & { environment: Environment }) => {
  if (!def(props.environment)) {
    for (const currentEnv of ['home', 'system']) {
      const env = <GenerationEnvironment> currentEnv
      app.State.Environment = env

      const result = await callback(app)(props)
      if (isFailure(result)) return result
    }
    app.State.Environment = null
  } else {
    app.State.Environment = props.environment

    const result = await callback(app)(props)
    if (isFailure(result)) return result
  }

  return Success(undefined)
}

