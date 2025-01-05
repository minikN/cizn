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
import { readdir } from "node:fs/promises"

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

  return Failure(Error('NO_PATH_GIVEN', { options: [path] }))
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