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
import { mkdir } from "node:fs/promises"

/**
* Tries to create a directory at `path`.
 *
 * @param {string} path the path to read
 * @private
 */
const _mkdir = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  if (path) {
    await mkdir(path, { recursive: true })
    return Success(path)
  }

  return Failure(Error('NO_PATH_GIVEN', { options: [path] }))
}

/**
* Tries to create a directory at `path`.
 *
 * @param {Cizn.Application} app the application
 */
export const make = (app: Cizn.Application): FSDirectoryApi['make'] => (path, errors) => asyncPipe(
  Success(path),
  map(guard(_mkdir, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
    EACCES: errors?.EACCES ?? ErrorAs('EACCES'),
  })),
)