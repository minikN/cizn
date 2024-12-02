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
import { access, constants } from "node:fs/promises"

/**
 * Probes the given `path` and checks for `mode`.
 *
 * @param {string} path the path to check
 * @param {number} mode mode to check against
 * @private
 */
const _probePath = async (path: string, mode = constants.F_OK): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  if (path) {
    await access(path, mode)
    return Success(path)
  }

  return Failure(ErrorWith('NO_PATH_GIVEN', { options: [path] }))
}

/**
 * Checks whether `path` is readable.
 *
 * @param {Cizn.Application} app the application
 */
export const isReadable = (app: Cizn.Application): FSPathApi['isReadable'] => (path, errors) => asyncPipe(
  Success(path),
  map(guard(_probePath, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('NOT_READABLE_FILE'),
  })),
)