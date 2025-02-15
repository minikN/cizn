// deno-lint-ignore-file require-await
import { Derivation, Environment } from '@cizn/core/state.ts'
import { bind, guard, map, tap, tapIf } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Failure, isSuccess, Success } from '@lib/composition/result.ts'
import { CliCommandProps } from '@lib/managers/cli/api/index.ts'
import { getFileName } from '@lib/util/index.ts'
import { setupEnvironment, withEnvironment } from '@lib/util/partials.ts'

/**
 * Builds or reuses the generation denoted by the incoming `derivation`.
 * 
 * @param {Cizn.Application} app the main application
 */
const makeGeneration = (app: Cizn.Application) => async ({ derivation }: { derivation: Derivation }) =>
  asyncPipe(
    Success(derivation),
    map(async (derivation) => {
      const generation = await app.State.Generation.Api.make(derivation)
      return isSuccess(generation) ? Success(undefined) : Failure(generation.error)
    }),
  )

/**
 * Builds or reuses a derivation and generation from the current configuration.
 * 
 * Does so only for `environment`, if specified, or for all environments. 
 *
 * @param {Cizn.Application} app the main application
 */
const build = (app: Cizn.Application): Cizn.Manager.Cli.Api['build'] => async (environment: Environment, options: CliCommandProps) =>
  asyncPipe(
    Success({ environment, options }),
    map(setupEnvironment(app)),
    bind((x) => ({ ...x, sourcePath: app.State.Source.Current })),
    map(async (x) => {
      const sourcePath = await app.Manager.FS.Api.Path.getReal(`${app.State.Source.Current}`)
      return isSuccess(sourcePath)
        ? Success(Object.assign(x, { sourcePath: sourcePath.value }))
        : Failure(sourcePath.error)
    }),
    tap(({ sourcePath }) => app.Manager.Log.Api.info({ message: `Reading source file %d ...`, options: [sourcePath] })),
    map(async (x) => {
      const readable = await app.Manager.FS.Api.Path.isReadable(x.sourcePath)
      return isSuccess(readable) ? Success(x) : Failure(readable.error)
    }),
    map(async (x) => {
      const isFile = await app.Manager.FS.Api.File.is(x.sourcePath)
      return isSuccess(isFile) ? Success(Object.assign(x, { isFile: isFile.value })) : Failure(isFile.error)
    }),
    tapIf(
      ({ isFile }) => !isFile,
      () =>
        app.Manager.Log.Api.error({
          message: `%d does not exist or is not readable`,
          options: [`${app.State.Source.Current}`],
        }),
    ),
    map(guard(async (x) => {
      const { default: module }: { default: Cizn.Application.State.Derivation.FileModule } = await import(
        `${x.sourcePath}`
      )
      return Success(Object.assign(x, { module }))
    })),
    tapIf(
      ({ module }) => !module,
      () =>
        app.Manager.Log.Api.error({
          message: `%d does not have a default export`,
          options: [app.State.Source.Current],
        }),
    ),
    map(guard(async (x) => {
      const derivation = await app.State.Derivation.Api.make({
        module: x.module,
        builder: 'generation',
        data: { name: getFileName(app.State.Source.Current) },
      })
      return isSuccess(derivation)
        ? Success(Object.assign(x, { derivation: derivation.value }))
        : Failure(derivation.error)
    })),
    map(withEnvironment(app, makeGeneration)),
    (result) => app.Manager.Cli.Result = result,
    () => undefined
  )

export default build
