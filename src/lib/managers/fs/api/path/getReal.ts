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
import { realpath } from "fs/promises"

/**
 * Tries to get the real path of `path`.
 *
 * @param {string} path the path to read
 * @private
 */
const _realPath = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  if (path) {
    return Success(await realpath(path))
  }

  return Failure(ErrorWith('NO_PATH_GIVEN', { options: [path] }))
}

/**
 * Gets the full system path of the provided `path`
 *
 * @param {Cizn.Application} app the application
 */
export const getReal = (app: Cizn.Application): FSPathApi['isReadable'] => (path, errors) => asyncPipe(
  Success(path),
  map(guard(_realPath, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
  })),
)