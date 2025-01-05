import { Environment } from "@cizn/core/state.ts"
import {
  bind, map, tap,
} from "@lib/composition/function.ts"
import { pipe } from "@lib/composition/pipe.ts"
import { Failure, Success } from "@lib/composition/result.ts"
import { Error } from '@lib/errors/index.ts'
import { CliCommandProps } from "@lib/managers/cli/api/index.ts"
import { isStr } from "@lib/util/index.ts"
import path from "node:path"

/**
 * Sets the application `source` to the provided value if it's available.
 *
 * This is a side effect and has no return value.
 *
 * @param {Cizn.Application} app the application
 * @returns {undefined}
 */
const setSource = (app: Cizn.Application) => ({ options }: { options: CliCommandProps, environment: Environment }) => {
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
const ensureEnvironment = ({ environment, options }: { environment: Environment, options: CliCommandProps}) =>
  isStr(environment) && environment !== 'home' && environment !== 'system'
    ? Failure(Error('NOT_KNOWN_ENVIRONMENT', {
      label: 'Environment given is not recognized. Can only be "home" or "system". Given value: %d',
      options: [<string><unknown>environment],
    }))
    : Success({ environment, options })

/**
 * Sets the `environment`.
 *
 * @param {Cizn.Application} app the application
 * @returns {Environment} the set environment
 */
const setEnvironment = (app: Cizn.Application) => (
  { environment, options }: { environment: Environment, options: CliCommandProps},
) => {
  app.State.Environment = environment

  return { environment, options }
}

/**
 * Sets up the `environment` given the provided user value.
 *
 * @param {Cizn.Application} app the application
 * @returns {SuccessType<Environment>}
 */
const _setup = (app: Cizn.Application) => (
  { environment, options }: { environment: Environment, options: CliCommandProps},
) => pipe(
  Success({ environment, options }),
  tap(x => setSource(app)(x)),
  map(ensureEnvironment),
  bind(setEnvironment(app)),
)

export default _setup

