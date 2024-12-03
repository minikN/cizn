import {
  guard, map, recover,
} from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError,
  ErrorAs,
  ErrorWith,
} from "@lib/errors"
import { FSDirectoryApi } from "@lib/managers/fs/api"
import { rmdir } from "node:fs/promises"

/**
 * Tries to delete the directory at `path`.
 *
 * @param {string} path the path to check
 * @private
 */
const _rmdir = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  if (!path) {
    return Failure(ErrorWith('NO_PATH_GIVEN', { options: [path] }))
  }

  await rmdir(path)

  return Success(path)
}

/**
 * Tries to delete the directory at `path`.
 *
 * @param {Cizn.Application} app the application
 */
export const remove = (app: Cizn.Application): FSDirectoryApi['remove'] => (path, errors) => asyncPipe(
  Success(path),
  map(x => app.Manager.FS.Api.Directory.is(x, errors)),
  map(guard(_rmdir, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    EACCES: errors?.EACCES ?? ErrorAs('EACCES'),
  })),
  recover({ INCORRECT_PATH_GIVEN: () => path }),
)