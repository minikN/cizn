import { guard, map } from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError, Error, ErrorAs,
} from "@lib/errors"
import { lstat } from "node:fs/promises"
import { FSFileApi } from ".."

/**
 * Checks whether `path` is a file.
 *
 * @param {string} path the path to check
 * @private
 */
const _isPathFile = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>, string>> => {
  if (!path) {
    return Failure(Error('NO_PATH_GIVEN'))
  }

  if ((await lstat(path)).isFile()) {
    return Success(path)
  }

  return Failure(Error('NOT_A_FILE'))
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
  })),
)