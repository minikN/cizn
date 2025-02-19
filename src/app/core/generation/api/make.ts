import { GenerationEnvironment } from '@cizn/core/generation/api/index.ts'
import { bind, forEach, map, mapIf, tap } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Success } from '@lib/composition/result.ts'
import { concat, stripRight } from '@lib/util/string.ts'

/**
 * Creates the folder for `generation`.
 *
 * @param {Cizn.Application} app the application
 * @returns {Result<CiznError<"NO_PATH_GIVEN"> | CiznError<"INCORRECT_PATH_GIVEN">, string>}
 */
const makeGenerationFolder = (app: Cizn.Application) => async (generation: Cizn.Application.State.Generation) =>
  asyncPipe(
    Success(`${app.State.Generation.Root}/${generation.path}`),
    map(app.Manager.FS.Api.Directory.make),
  )

/**
 * Symlinks either `home-files` or `system-files`, based on the environment, from
 * `derivation` to `generation`.
 *
 * @param {Cizn.Application} app the application
 * @param {Cizn.Application.State.Derivation} derivation  source derivation
 * @param {Cizn.Application.State.Generation} generation  target generation
 * @returns {Result<CiznError<"NO_PATH_GIVEN"> | CiznError<"NO_TARGET_GIVEN"> | CiznError<"INCORRECT_PATH_GIVEN"> | CiznError<"EACCES">, string>}
 */
const symlinkDerivationFolder = (
  app: Cizn.Application,
  derivation: Cizn.Application.State.Derivation,
  generation: Cizn.Application.State.Generation,
) =>
async (file: string) =>
  asyncPipe(
    Success(`${app.State.Generation.Root}/${generation.path}/${file}`),
    bind(concat('-temp')),
    map(app.Manager.FS.Api.Link.write(`${derivation.env.out}/${file}`, 'dir')),
    map((tempPath: string) =>
      app.Manager.FS.Api.Path.rename(
        tempPath,
        stripRight('-temp')(tempPath),
      )
    ),
  )

/**
 * Symlinks `derivation` to `generation`
 *
 * @param {Cizn.Application} app the application
 * @returns {Result<NonNullable<CiznError<"NO_PATH_GIVEN"> | CiznError<"INCORRECT_PATH_GIVEN">> | CiznError<"NO_TARGET_GIVEN"> | CiznError<"EACCES">, undefined>}
 */
const symlinkDerivation = (app: Cizn.Application) =>
async (
  derivation: Cizn.Application.State.Derivation,
  generation: Cizn.Application.State.Generation,
) =>
  asyncPipe(
    Success(derivation.env.out),
    map(app.Manager.FS.Api.Directory.read),
    map((derivationFolders) =>
      Success(derivationFolders.filter((d) => d.includes(<GenerationEnvironment> app.State.Environment)))
    ),
    map(forEach(symlinkDerivationFolder(app, derivation, generation))),
  )

/**
 * Reuses the incoming `generation` by logging a message to the user and returning it.
 *
 * @param {Cizn.Application} app the application
 */
const reuseGeneration = (app: Cizn.Application) => async (generation: Cizn.Application.State.Generation) =>
  asyncPipe(
    Success(generation),
    tap(() =>
      app.Manager.Log.Api.info({
        message: 'Reusing %d generation %d ...',
        options: [<GenerationEnvironment> app.State.Environment, generation.number],
      })
    ),
  )

/**
 * Creates a generation for `derivation` based on `generation` by logging a message to the
 * user, creating the folder for the generation and executing {@link symlinkDerivation}.
 *
 * @param {Cizn.Application} app                          the application
 * @param {Cizn.Application.State.Derivation} derivation  target derivation
 * @returns {Cizn.Application.State.Generation}
 */
const makeGeneration =
  (app: Cizn.Application, derivation: Cizn.Application.State.Derivation) =>
  async (generation: Cizn.Application.State.Generation) =>
    asyncPipe(
      Success(generation),
      tap(() =>
        app.Manager.Log.Api.info({
          message: 'Moving to %d generation %d ...',
          options: [<GenerationEnvironment> app.State.Environment, generation.number],
        })
      ),
      map(makeGenerationFolder(app)),
      map(() => symlinkDerivation(app)(derivation, generation)),
      map(() => Success(generation)),
    )

/**
 * Creates or reuses a generation based on `derivation` and `Environment`.
 *
 * Does so by tasking {@link Generation.Api.path} if there is an existing generation for
 * the given generation. If so, it returns it. If not, it will create a generation by
 * symlinking the environment specific folders from the derivation to a new generation
 * folder.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application.State.Generation}
 */
const make = (app: Cizn.Application): Cizn.Application.State.Generation.Api['make'] => async (derivation) =>
  asyncPipe(
    Success(derivation.hash),
    map((hash) => app.State.Generation.Api.path({ hash })),
    // TODO: Replace both mapIf if mapIfElse
    mapIf((generation) => generation.exists, reuseGeneration(app)),
    mapIf((generation) => !generation.exists, makeGeneration(app, derivation)),
  )

export default make
