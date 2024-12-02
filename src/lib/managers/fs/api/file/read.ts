import { guard, map } from "@lib/composition/function"
import { asyncPipe, pipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError,
  ErrorAs,
  ErrorWith,
} from "@lib/errors"
import { FSFileApi } from "@lib/managers/fs/api"
import { readFile as nodeReadFile } from "node:fs/promises"

/**
 * Tries to parse `contents` as JSON.
 *
 * @param {string} contents the content to parse
 * @private
 */
const _parseJSON = (contents: string): Result<CiznError<'NO_CONTENT_GIVEN'>, object> => {
  if (!contents || !contents.length) {
    return Failure(ErrorWith('NO_CONTENT_GIVEN', { options: [contents] }))
  }

  return Success(JSON.parse(contents))
}

/**
 * Parses `contents` as JSON.
 *
 * @param {Cizn.Application} app the application
 */
export const parseAsJSON = (app: Cizn.Application): FSFileApi['parseAsJSON'] => (contents, errors) => pipe(
  Success(contents),
  map(guard(_parseJSON, { SyntaxError: errors?.SyntaxError ?? ErrorAs('INVALID_CONTENT_GIVEN') })),
)

/**
 * Tries to read the file at `path`.
 *
 * @param {string} path the file to read
 * @private
 */
const _readFile = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  if (!path) {
    return Failure(ErrorWith('NO_PATH_GIVEN', { options: [path] }))
  }

  return Success((await nodeReadFile(path)).toString())
}

/**
 * Reads the file at `path`.

 * @param {Cizn.Application} app the application
 */
export const read = (app: Cizn.Application): FSFileApi['read'] => (path, errors) => asyncPipe(
  Success(path),
  map(guard(_readFile, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
    EISDIR: errors?.EISDIR ?? ErrorAs('NOT_A_FILE'),
  })),
)