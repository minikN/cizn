import { guard, map } from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError,
  ErrorAs,
  ErrorWith,
} from "@lib/errors"
import { FSFileApi } from "@lib/managers/fs/api"
import { lstat } from "node:fs/promises"

/**
 * Checks whether `path` is a file.
 *
 * @param {string} path the path to check
 * @private
 */
const _isPathFile = async (path: string): Promise<
  Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>, string>
> => {
  if (!path) {
    return Failure(ErrorWith('NO_PATH_GIVEN', { options: [path] }))
  }

  const pathStat = await lstat(path)

  if (pathStat.isFile() || pathStat.isSymbolicLink()) {
    return Success(path)
  }

  return Failure(ErrorWith('NOT_A_FILE', { options: [path] }))
}

/**
 * Checks whether `path` is a file.
 *
 * @param {Cizn.Application} app the application
 */
export const is = (app: Cizn.Application): FSFileApi['is'] => (path, errors) => asyncPipe(
  Success(path),
  map(guard(_isPathFile, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
    NOT_A_FILE: errors?.NOT_A_FILE ?? ErrorAs('NOT_A_FILE'),
  })),
)