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
import { FSFileApi } from "@lib/managers/fs/api"
import { rm } from "node:fs/promises"

/**
 * Tries to delete the file at `path`.
 *
 * @param {string} path the path to check
 * @private
 */
const _rm = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>, string>> => {
  if (!path) {
    return Failure(ErrorWith('NO_PATH_GIVEN', { options: [path] }))
  }

  await rm(path)

  return Success(path)
}

/**
 * Tries to delete the file at `path`.
 *
 * @param {Cizn.Application} app the application
 */
export const remove = (app: Cizn.Application): FSFileApi['remove'] => (path, errors) => asyncPipe(
  Success(path),
  map(x => app.Manager.FS.Api.File.is(x, errors)),
  map(guard(_rm, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    EACCESS: errors?.EACCESS ?? ErrorAs('EACCESS'),
  })),
  recover({ INCORRECT_PATH_GIVEN: () => path }),
)