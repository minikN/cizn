import { guard, map } from "@lib/composition/function.ts"
import { asyncPipe } from "@lib/composition/pipe.ts"
import {
  Failure, Result, Success,
} from "@lib/composition/result.ts"
import {
  CiznError,
  Error,
  ErrorAs,
} from "@lib/errors/index.ts"
import { FSDirectoryApi } from "@lib/managers/fs/api/index.ts"
import { lstat } from "node:fs/promises"

/**
 * Checks whether `path` is a directory.
 *
 * @param {string} path the path to check
 * @private
 */
const _isPathDirectory = async (path: string): Promise<
Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_A_DIR'>, string>
> => {
  if (!path) {
    return Failure(Error('NO_PATH_GIVEN', { options: [path] }))
  }

  const pathStat = await lstat(path)

  if (pathStat.isDirectory()) {
    return Success(path)
  }

  return Failure(Error('NOT_A_DIR', { options: [path] }))
}

/**
 * Checks whether `path` is a directory.
 *
 * @param {Cizn.Application} app the application
 */
export const is = (app: Cizn.Application): FSDirectoryApi['is'] => (path, errors) => asyncPipe(
  Success(path),
  map(guard(_isPathDirectory, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
    NOT_A_DIR: errors?.NOT_A_DIR ?? ErrorAs('NOT_A_DIR'),
  })),
)