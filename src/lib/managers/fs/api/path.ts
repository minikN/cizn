import { guard, map } from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError, Error, ErrorAs,
} from "@lib/errors"
import {
  access, constants, realpath,
} from "node:fs/promises"
import process from "node:process"

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

  return Failure(Error('NO_PATH_GIVEN'))
}


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

  return Failure(Error('NO_PATH_GIVEN'))
}

/**
 * Probes the given `path` and checks for `mode`.
 *
 * @param {string} path the path to check
 * @param {number} mode mode to check against
 * @private
 */
const _getCwd = async (): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  const cwd = await process.cwd()
  if (cwd) {
    return Success(cwd)
  }

  return Failure(Error('NO_PATH_GIVEN'))
}

/**
 * Gets the full system path of the provided `path`
 *
 * @param {string} path the path to read
 */
export const getRealPath = (app: Cizn.Application) => (path: string): Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'>>, string> => asyncPipe(
  Success(path),
  map(guard(_realPath, {
    ERR_INVALID_ARG_TYPE: ErrorAs('NO_PATH_GIVEN'),
    ENOENT: ErrorAs('INCORRECT_PATH_GIVEN'),
  })),
)

/**
 * Checks whether `path` is readable.
 *
 * @param {string} path the path to check
 */
export const isPathReadable = (app: Cizn.Application) => (path: string): Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_READABLE_FILE'>>, string> => asyncPipe(
  Success(path),
  map(guard(_probePath, {
    ERR_INVALID_ARG_TYPE: ErrorAs('NO_PATH_GIVEN'),
    ENOENT: ErrorAs('NOT_READABLE_FILE'),
  })),
)


export const getCwd = (app: Cizn.Application) => (): Result<CiznError<'NO_PATH_GIVEN'>, string> => asyncPipe(
  Success(true),
  map(guard(_getCwd)),
)