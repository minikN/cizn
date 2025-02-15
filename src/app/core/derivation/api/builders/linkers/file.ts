// deno-lint-ignore-file require-await
import { Derivation } from '@cizn/core/state.ts'
import { bind, map, mapIfElse } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Failure, isSuccess, Success } from '@lib/composition/result.ts'
import { isHomePath } from '@lib/util/string.ts'

/**
 * Symlinks all files from `sourceDervation` to `targetDerivation`.
 *
 * Will also create the `home-files` and `system-files` folders in
 * the `targetDerivation` if necessary.
 *
 * @param {Derivation} targetDerivation the target derivation
 * @param {Derivation} sourceDerivation the source derivation
 */
const linker = (app: Cizn.Application) => async (targetDerivation: Derivation, sourceDerivation: Derivation) =>
  asyncPipe(
    Success({
      path: sourceDerivation.env.path,
      out: sourceDerivation.env.out,
      isHomeFile: isHomePath(sourceDerivation.env.path || ''),
    }),
    mapIfElse(
      ({ isHomeFile }) => isHomeFile,
      async (x) =>
        asyncPipe(
          Success(`${targetDerivation.env.out}/home-files`),
          map(app.Manager.FS.Api.Directory.make),
          bind(() => x),
        ),
      async (x) =>
        asyncPipe(
          Success(`${targetDerivation.env.out}/system-files`),
          map(app.Manager.FS.Api.Directory.make),
          bind(() => x),
        ),
    ),
    bind((x) =>
      Object.assign(x, {
        targetPath: `${targetDerivation.env.out}/${x.isHomeFile ? 'home-files' : 'system-files'}/${x.path}`,
      })
    ),
    bind((x) => Object.assign(x, { tempPath: `${x.targetPath}-temp` })),
    map(async (x) => {
      const symlinkPath = await app.Manager.FS.Api.Path.getDirname(x.targetPath)

      return isSuccess(symlinkPath)
        ? Success(Object.assign(x, { symlinkPath: symlinkPath.value }))
        : Failure(symlinkPath.error)
    }),
    map(async (x) => {
      const folder = await app.Manager.FS.Api.Directory.make(x.symlinkPath)
      return isSuccess(folder) ? Success(x) : Failure(folder.error)
    }),
    map(async (x) => {
      const folder = await app.Manager.FS.Api.Link.write(x.out, 'file')(x.tempPath)
      return isSuccess(folder) ? Success(x) : Failure(folder.error)
    }),
    map(async (x) => {
      const renamed = await app.Manager.FS.Api.Path.rename(x.tempPath, x.targetPath)
      return isSuccess(renamed) ? Success(undefined) : Failure(renamed.error)
    }),
  )

/**
 * Links all files from `source` to `target` if `target` is a file derivation.
 * 
 * @param {Cizn.Application} app    the application
 * @param {Derivation} source  the root derivation 
 */
export const linkDerivationFiles = (app: Cizn.Application, source: Derivation) => async (target: Derivation) => {
  const fileLinker = linker(app)

  return asyncPipe(
    Success(target),
    mapIfElse(
      (x) => x.builder === 'file',
      async () => await fileLinker(source, target),
      () => Success(undefined),
    ),
  )
}
