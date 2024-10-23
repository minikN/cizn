import { guard, map } from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError, Error, ErrorAs,
} from "@lib/errors"
import { readdir } from "node:fs/promises"
import { FSDirectoryApi } from "@lib/managers/fs/api"

/**
 * Tries to read the contents of `path`.
 *
 * @param {string} path the path to read
 * @private
 */
const _readdir = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string[]>> => {
  if (path) {
    const contents = await readdir(path)
    return Success(contents)
  }

  return Failure(Error('NO_PATH_GIVEN'))
}

/**
 * Tries to read the contents of `path`.
 *
 * @param {Cizn.Application} app the application
 */
export const read = (app: Cizn.Application): FSDirectoryApi['read'] => (path, errors) => asyncPipe(
  Success(path),
  map(guard(_readdir, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
  })),
)