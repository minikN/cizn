/* eslint-disable @typescript-eslint/no-unused-vars */
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

/**
 * Tries to read the file at `path`.
 *
 * @param {string} path the file to read
 * @private
 */
const _readFile = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  if (!path) {
    return Failure(Error('NO_PATH_GIVEN'))
  }

  return Success((await nodeReadFile(path)).toString())
}

/**
 * Tries to parse `contents` as JSON.
 *
 * @param {string} contents the content to parse
 * @private
 */
const _parseJSON = (contents: string): Result<CiznError<'NO_CONTENT_GIVEN'>, object> => {
  if (!contents || !contents.length) {
    return Failure(Error('NO_CONTENT_GIVEN'))
  }

  return Success(JSON.parse(contents))
}

/**
 * Checks whether `path` is a file.
 *
 * @param {Cizn.Application} app the application
 */
export const isFile = (app: Cizn.Application) => <F extends (...args: any) => any>(path: string, errors?: {[key: string]: F}): Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string> => asyncPipe(
  Success(path),
  map(guard(_isPathFile, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
  })),
)

/**
 * Reads the file at `path`.

 * @param {Cizn.Application} app the application
 */
export const readFile = (app: Cizn.Application) => <F extends (...args: any) => any>(path: string, errors?: {[key: string]: F}): Result<NonNullable<CiznError<'NO_PATH_GIVEN'> | CiznError<'INCORRECT_PATH_GIVEN'> | CiznError<'NOT_A_FILE'>>, string> => asyncPipe(
  Success(path),
  map(guard(_readFile, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
    EISDIR: errors?.EISDIR ?? ErrorAs('NOT_A_FILE'),
  })),
)

/**
 * Parses `contents` as JSON.
 *
 * @param {Cizn.Application} app the application
 */
export const parseJSON = (app: Cizn.Application) => <F extends (...args: any) => any>(contents: string, errors?: {[key: string]: F}): Result<CiznError<'NO_CONTENT_GIVEN'> | CiznError<'INVALID_CONTENT_GIVEN'>, object> => pipe(
  Success(contents),
  map(guard(_parseJSON, { SyntaxError: errors?.SyntaxError ?? ErrorAs('INVALID_CONTENT_GIVEN') })),
)
