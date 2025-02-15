// deno-lint-ignore-file require-await
import { Environment } from '@cizn/core/state.ts'
import { guard, map } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Success } from '@lib/composition/result.ts'
import { ErrorAs } from '@lib/errors/index.ts'
import { CliCommandProps } from '@lib/managers/cli/api/index.ts'
import { setupEnvironment, withEnvironment } from '@lib/util/partials.ts'

/**
 * Applies either the newest generation or the one denoted by the `--generation` args
 * provided by the user.
 *
 * @param {Cizn.Application} app the application
 */
const applyGeneration = (app: Cizn.Application) => ({ options }: { options: CliCommandProps }) =>
  asyncPipe(
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
 */
const apply = (app: Cizn.Application): Cizn.Manager.Cli.Api['apply'] => async (environment: Environment, options: CliCommandProps) =>
  asyncPipe(
    Success({ environment, options }),
    map(setupEnvironment(app)),
    map(withEnvironment(app, applyGeneration)),
    (result) => app.Manager.Cli.Result = result,
    () => undefined,
  )

export default apply
