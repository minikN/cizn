// deno-lint-ignore-file require-await
import { GenerationEnvironment } from '@cizn/core/generation/api/index.ts'
import { bind, forEach, map, mapEach, mapIf, recover, tap, withError } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Failure, isSuccess, Result, Success } from '@lib/composition/result.ts'
import { CiznError, ErrorAs } from '@lib/errors/index.ts'
import { isArr } from '@lib/util/index.ts'
import { setTimestamp } from '@lib/util/partials.ts'
import { prepend, strip } from '@lib/util/string.ts'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

type AppliedType = {
  appliedAt: string
}

const hasAppliedAt = (obj: AppliedType): obj is AppliedType => !!obj?.appliedAt

/**
 * Recursively lists all files in `root`.
 *
 * TODO: One day, convert this to pipes using recursion.
 */
const getAllFiles = (relative = true) =>
async (root: string, list: string[] = [], level: number = 0): Promise<
  Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_DIR'>, string[]>
> => {
  const files = await readdir(root)
  let fileList = list

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if ((await stat(root + '/' + file)).isDirectory()) {
      const result = await getAllFiles(true)(root + '/' + file, fileList, level + 1)
      fileList = result._tag === 'value' ? result.value : []
    } else {
      fileList.push(path.join(root, '/', file))
    }
  }

  return level === 0 && relative ? Success(fileList.map((file) => file.replace(`${root}/`, ''))) : Success(fileList)
}
/**
 * Creates the directory for `path` in case it doesn't exist.
 *
 * @param {Cizn.Application} app the application
 */
const createFolderForPath = (app: Cizn.Application) => async (path: string) =>
  asyncPipe(
    Success(path),
    map(app.Manager.FS.Api.Path.getDirname),
    map(app.Manager.FS.Api.Directory.make),
    bind(() => path), // return incoming `path` again
  )

/**
 * Checks whether the file at `path` is a symlink and if its owned by cizn.
 *
 * @param {Cizn.Application} app the application
 * @returns {string} path the path of the symlink
 */
const checkSymlink = (app: Cizn.Application) => async (path: string) =>
  asyncPipe(
    Success(path),
    map(withError(app.Manager.FS.Api.Link.isOwn, {
      NOT_A_SYMLINK: ErrorAs('NOT_OWN_FILE', { label: `Unknown file exists: %d. Please delete or move` }),
    })),
    recover({ INCORRECT_PATH_GIVEN: () => path }),
    bind(() => path), // return incoming `path` again
  )

/**
 * Will delete the symlink at `path` if it exists.
 *
 * @param {Cizn.Application} app the application
 * @returns {string} path the path of the symlink
 */
const removeSymlink = (app: Cizn.Application) => async (path: string) =>
  asyncPipe(
    Success(path),
    map(app.Manager.FS.Api.Link.remove),
    recover({ INCORRECT_PATH_GIVEN: () => path }),
    bind(() => path), // return incoming `path` again
  )

/**
 * Processes each `file` of the generation.
 *
 * Does so by firstly creating the parenting directory of the file if it doesn't exists.
 * Secondly, it checks if the file already exists as part of the previous generation.
 *
 * If it does, it'll delete the symlink. If the file exists but is not a symlink
 * associated with cizn, it'll return a `NOT_OWN_FILE` error.
 *
 * Lastly, it'll write the new symlink.
 *
 * @param {Cizn.Application} app the application
 * @returns {void}
 */
const processFile = (app: Cizn.Application) =>
async ({ source, target }: { source: string; target: string }): Promise<
  Result<
    | CiznError<'NO_PATH_GIVEN'>
    | CiznError<'INCORRECT_PATH_GIVEN'>
    | CiznError<'NOT_A_SYMLINK'>
    | CiznError<'NOT_OWN_FILE'>
    | CiznError<'EACCES'>
    | CiznError<'NO_TARGET_GIVEN'>,
    undefined
  >
> =>
  asyncPipe(
    Success(target),
    bind(strip(`${app.State.Generation.Root}/.current_${app.State.Environment}/${app.State.Environment}-files/`)),
    bind(prepend(`${app.State.Environment === 'home' ? process.env.HOME : ''}/`)),
    map(createFolderForPath(app)),
    map(checkSymlink(app)),
    map(removeSymlink(app)),
    map(app.Manager.FS.Api.Link.write(source)),
    map(() => Success(undefined)),
  )

/**
 * Logs information about the generation to be applies to the user.
 *
 * @param {Cizn.Application} app the application
 * @returns {void}
 */
const logGenerationInfo = (app: Cizn.Application) => <V>(files: V) => {
  const target = files && isArr(files) ? files as string[] : []

  const env = app.State.Environment as GenerationEnvironment
  const genNumber = app.State.Generation.Current[env]?.number || 1

  app.Manager.Log.Api.info({ message: 'Applying generation %d to %d...', options: [genNumber, env] })
  app.Manager.Log.Api.info({ message: 'Symlinking %d files...', options: [target.length] })
}

/**
 * Unlinks the previously applied generation.
 *
 * @param {Cizn.Application} app the application
 */
const unlinkPreviousGenerationFiles = (app: Cizn.Application) => async (rootFolder: string) =>
  asyncPipe(
    Success(`${app.State.Generation.Root}`),
    map(app.Manager.FS.Api.Directory.read),
    // Gathers all generations for the current environment
    bind((x) => x.filter((folderName) => !folderName.includes('.'))),
    bind((x) => x.filter((folderName) => folderName.includes(<string> app.State.Environment))),
    bind((x) =>
      x.filter((folderName) =>
        !folderName.includes(
          app.State.Generation.Current[<GenerationEnvironment> app.State.Environment]?.path || '',
        )
      )
    ),
    // Finds the latest applied generation amongst them
    mapIf(
      (x) => !!x.length,
      // deno-fmt-ignore
      async (x) => await asyncPipe(
        Success(x),
        map(async (x) => {
          const gs = await mapEach(async (g: string) =>
            await app.Manager.FS.Api.File.read(`${app.State.Generation.Root}/${g}/meta`)
          )(x)
          return isSuccess(gs)
            ? Success(x.map((y, i) => ({ generation: x[i], meta: gs.value[i] })))
            : Failure(gs.error)
        }),
        map(mapEach(async ({ generation, meta }: { generation: string; meta: string }) => {
          const obj = await app.Manager.FS.Api.File.parseAsJSON(hasAppliedAt)(meta)
          return isSuccess(obj) ? Success({ generation, meta: obj.value }) : obj
        })),
        bind((x) => x.sort((a, b) => Date.parse(b.meta.appliedAt) - Date.parse(a.meta.appliedAt))),
        bind((x) => <string> x.at(0)?.generation),

        // Unlinks all files of the previously applied generation
        map(
          async (x) =>
            asyncPipe(
              Success(`${app.State.Generation.Root}/${x}/${app.State.Environment}-files`),
              map(getAllFiles(true)),
              map(mapEach((x) =>
                asyncPipe(
                  Success(x),
                  bind(prepend(`${app.State.Environment === 'home' ? process.env.HOME : ''}/`)),
                  map(checkSymlink(app)),
                  map(removeSymlink(app)),
                )
              )),
            ),
        ),
        ),
    ),
    map(() => Success(rootFolder)),
  )

/**
 * Applies the current generation, denoted by `app.State.Generation.Root` for
 * `app.State.Environment`.
 *
 * @param {Cizn.Application} app the application
 * @returns {void}
 */
const apply = (app: Cizn.Application): Cizn.Application.State.Generation.Api['apply'] => async () =>
  asyncPipe(
    Success(`${app.State.Generation.Root}/.current_${app.State.Environment}/${app.State.Environment}-files`),
    map(async (x) => {
      const timestamp = await setTimestamp(app)(
        'appliedAt',
        `${app.State.Generation.Root}/.current_${app.State.Environment}/meta`,
      )
      return isSuccess(timestamp) ? Success(x) : Failure(timestamp.error)
    }),
    map(unlinkPreviousGenerationFiles(app)),
    map(getAllFiles(false)),
    bind((x) => ({ targets: x })),
    map(async (x) => {
      const t = await mapEach(app.Manager.FS.Api.Link.read)(x.targets)
      return isSuccess(t)
        ? Success(t.value.map((link, i) => ({ target: x.targets[i], source: link })))
        : Failure(t.error)
    }),
    tap(logGenerationInfo(app)),
    map(forEach(processFile(app))),
  )

export default apply
