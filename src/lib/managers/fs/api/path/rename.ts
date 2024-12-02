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
import { FSPathApi } from "@lib/managers/fs/api"
import { rename as nodeRename } from "node:fs/promises"

/**
 * Tries to rename `oldPath` to `newPath`.
 *
 * @param {string} path the path to check
 * @private
 */
const _rename = async ({ oldPath, newPath }: {oldPath: string, newPath: string}): Promise<
  Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'NO_TARGET_GIVEN'>, string>
> => {
  if (!oldPath) {
    return Failure(ErrorWith('NO_PATH_GIVEN', { options: [newPath] }))
  }
  if (!newPath) {
    return Failure(ErrorWith('NO_TARGET_GIVEN', { options: [oldPath] }))
  }

  await nodeRename(oldPath, newPath)

  return Success(newPath)
}

/**
 * Tries to rename `oldPath` to `newPath`.
 *
 * @param {Cizn.Application} app the application
 */
export const rename = (app: Cizn.Application): FSPathApi['rename'] => (oldPath, newPath, errors) => asyncPipe(
  Success({ oldPath, newPath }),
  map(guard(_rename, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    EACCESS: errors?.EACCESS ?? ErrorAs('EACCESS'),
    ENOENT: errors?.ENOENT ?? ErrorAs('ENOENT'),
  })),
)