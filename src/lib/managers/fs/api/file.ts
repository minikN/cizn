import { guard, map } from "@lib/composition/function"
import { asyncPipe, pipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError, Error, ErrorAs,
} from "@lib/errors"
import { lstat, readFile as nodeReadFile } from "node:fs/promises"

/**
 *
 * Checks whether `path` is a file.
 *
 * @param {string} path the path to check
 * @private
 */
const _isPathFile = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>, string>> => {
  if (!path) {
    return Failure(Error('NO_PATH_GIVEN'))
  }

  if ((await lstat(path)).isFile()) {
    return Success(path)
  }

  return Failure(Error('NOT_A_FILE'))
}

const _readFile = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  if (!path) {
    return Failure(Error('NO_PATH_GIVEN'))
  }

  return Success((await nodeReadFile(path)).toString())
}

const _parseJSON = (contents: string): Result<CiznError<'NO_CONTENT_GIVEN'>, object> => {
  if (!contents || !contents.length) {
    return Failure(Error('NO_CONTENT_GIVEN'))
  }

  return Success(JSON.parse(contents))
}


/**
 * Checks whether `path` is a file.
 *
 * @param {string} path the path to check
 */
export const isFile = (app: Cizn.Application) => (path: string): Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string> => asyncPipe(
  Success(path),
  map(guard(_isPathFile, {
    ERR_INVALID_ARG_TYPE: ErrorAs('NO_PATH_GIVEN'),
    ENOENT: ErrorAs('INCORRECT_PATH_GIVEN'),
  })),
)

export const readFile = (app: Cizn.Application) => (path: string): Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string> => asyncPipe(
  Success(path),
  map(guard(_readFile, {
    ERR_INVALID_ARG_TYPE: ErrorAs('NO_PATH_GIVEN'),
    ENOENT: ErrorAs('INCORRECT_PATH_GIVEN'),
    EISDIR: ErrorAs('NOT_A_FILE'),
  })),
)

export const parseJSON = (app: Cizn.Application) => (contents: string): Result<CiznError<'NO_CONTENT_GIVEN'> | CiznError<'INVALID_CONTENT_GIVEN'>, object> => pipe(
  Success(contents),
  map(guard(_parseJSON, { SyntaxError: ErrorAs('INVALID_CONTENT_GIVEN') })),
)
