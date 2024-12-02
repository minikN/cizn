/* eslint-disable no-unused-vars,@stylistic/js/object-curly-newline */

import {
  bind, forEach, map, recover,
  tap,
  withError,
} from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import { Result, Success } from "@lib/composition/result"
import { CiznError, ErrorAs } from "@lib/errors"
import { isArr } from "@lib/util"
import { prepend, strip } from "@lib/util/string"
import {
  readdir,
  stat,
} from "node:fs/promises"
import path from "node:path"
import { GenerationEnvironment } from "."

/**
 * Recursively lists all files in `root`.
 *
 * TODO: One day, convert this to pipes using recursion.
 */
const getAllFiles = (relative = true) => async (root: string, list: string[] = [], level: number = 0): Promise<
  Result<CiznError<"NO_PATH_GIVEN"> | CiznError<"INCORRECT_PATH_GIVEN"> | CiznError<"NOT_A_DIR">, string[]>
  > => {
  const files = await readdir(root)
  let fileList = list

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if ((await stat(root + "/" + file)).isDirectory()) {
      const result = await getAllFiles(true)(root + "/" + file, fileList, level + 1)
      fileList = result._tag === 'value'
        ? result.value
        : []
    } else {
      fileList.push(path.join(root, "/", file))
    }
  }

  return level === 0 && relative
    ? Success(fileList.map(file => file.replace(`${root}/`, '')))
    : Success(fileList)
}


const createFolderForPath = (app: Cizn.Application) => async (path: string) => asyncPipe(
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
const checkSymlink = (app: Cizn.Application) => async (path: string) => asyncPipe(
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
const removeSymlink = (app: Cizn.Application) => async (path: string) => asyncPipe(
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
const processFile = (app: Cizn.Application) => async (file: string): Promise<Result<
  | CiznError<"NO_PATH_GIVEN">
  | CiznError<"INCORRECT_PATH_GIVEN">
  | CiznError<"NOT_A_SYMLINK">
  | CiznError<"NOT_OWN_FILE">
  | CiznError<"EACCESS">
  | CiznError<"NO_TARGET_GIVEN">,
  undefined
>> => asyncPipe(
  Success(file),
  bind(strip(`${app.State.Generation.Root}/.current_${app.State.Environment}/${app.State.Environment}-files/`)),
  bind(prepend(`${app.State.Environment === 'home' ? process.env.HOME : ''}/`)),
  map(createFolderForPath(app)),
  map(checkSymlink(app)),
  map(removeSymlink(app)),
  map(app.Manager.FS.Api.Link.write(file)),
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
 * Applies the current generation, denoted by `app.State.Generation.Root` for
 * `app.State.Environment`.
 *
 * @param {Cizn.Application} app the application
 * @returns {void}
 */
const apply = (app: Cizn.Application) => async () => asyncPipe(
  Success(`${app.State.Generation.Root}/.current_${app.State.Environment}/${app.State.Environment}-files`),
  map(getAllFiles(false)),
  tap(logGenerationInfo(app)),
  map(forEach(processFile(app))),
)

export default apply