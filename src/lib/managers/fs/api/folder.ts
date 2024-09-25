import { guard, map } from "@lib/composition/function"
import { asyncPipe, pipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError, Error, ErrorAs,
} from "@lib/errors"
import { mkdir } from "node:fs/promises"

/**
 * Tries to get the real path of `path`.
 *
 * @param {string} path the path to read
 * @private
 */
const _mkdir = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  if (path) {
    await mkdir(path, { recursive: true })
    return Success(path)
  }

  return Failure(Error('NO_PATH_GIVEN'))
}


/**
 * Checks whether `path` is readable.
 *
 * @param {string} path the path to check
 */
export const makeDirectory = (app: Cizn.Application) => (path: string): Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>, string> => asyncPipe(
  Success(path),
  map(guard(_mkdir, {
    ERR_INVALID_ARG_TYPE: ErrorAs('NO_PATH_GIVEN'),
    ENOENT: ErrorAs('INCORRECT_PATH_GIVEN'),
  })),
)
