import { guard, map } from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError,
  Error,
  ErrorAs,
} from "@lib/errors"
import { FSLinkApi } from "@lib/managers/fs/api"
import { lstat } from "node:fs/promises"

/**
 * Checks whether `path` is a symbolic link.
 *
 * @param {string} path the path to check
 * @private
 */
const _isPathSymlink = async (path: string): Promise<
Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_A_SYMLINK'>, string>
> => {
  if (!path) {
    return Failure(Error('NO_PATH_GIVEN', { options: [path] }))
  }

  if ((await lstat(path)).isSymbolicLink()) {
    return Success(path)
  }

  return Failure(Error('NOT_A_SYMLINK', { options: [path] }))
}

/**
 * Checks whether `path` is a symbolic link.
 *
 * @param {Cizn.Application} app the application
 */
export const is = (app: Cizn.Application): FSLinkApi['is'] => (path, errors) => asyncPipe(
  Success(path),
  map(guard(_isPathSymlink, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
    NOT_A_SYMLINK: errors?.NOT_A_SYMLINK ?? ErrorAs('NOT_A_SYMLINK'),
  })),
)