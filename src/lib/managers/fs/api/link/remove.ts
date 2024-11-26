import {
  guard, map, recover,
} from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError, Error, ErrorAs,
} from "@lib/errors"
import { FSLinkApi } from "@lib/managers/fs/api"
import { unlink } from "node:fs/promises"

/**
 * Tries to delete the symlink at `path`.
 *
 * @param {string} path the path to check
 * @private
 */
const _unlink = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>, string>> => {
  if (!path) {
    return Failure(Error('NO_PATH_GIVEN'))
  }

  await unlink(path)

  return Success(path)
}

/**
 * Tries to delete the symlink at `path`.
 *
 * @param {Cizn.Application} app the application
 */
export const remove = (app: Cizn.Application): FSLinkApi['remove'] => (path, errors) => asyncPipe(
  Success(path),
  map(app.Manager.FS.Api.Link.is),
  map(guard(_unlink, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    EACCESS: errors?.EACCESS ?? ErrorAs('EACCESS'),
    NOT_A_SYMLINK: errors?.NOT_A_SYMLINK ?? ErrorAs('NOT_A_SYMLINK'),
  })),
  recover({ INCORRECT_PATH_GIVEN: () => path }),
)