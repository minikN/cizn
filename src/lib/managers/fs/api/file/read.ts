import { guard, map } from "@lib/composition/function.ts"
import { asyncPipe, pipe } from "@lib/composition/pipe.ts"
import {
  Failure, Result, Success,
} from "@lib/composition/result.ts"
import {
  CiznError,
  Error,
  ErrorAs,
} from "@lib/errors/index.ts"
import { FSFileApi } from "@lib/managers/fs/api/index.ts"
import { readFile as nodeReadFile } from "node:fs/promises"

/**
 * Tries to parse `contents` as JSON.
 *
 * Expects a `isType` type guard to determine the return type of the file contents.
 *
 * @param {string} contents the content to parse
 * @private
 */
const _parseJSON = <T>(isType: (t: any) => t is T) => (contents: string): Result<
CiznError<'NO_CONTENT_GIVEN'> | CiznError<'INVALID_CONTENT_GIVEN'>
, T> => {
  if (!contents || !contents.length) {
    return Failure(Error('NO_CONTENT_GIVEN', { options: [contents] }))
  }

  const content = JSON.parse(contents)

  return isType(content)
    ? Success(content)
    : Failure(Error('INVALID_CONTENT_GIVEN'))
}

/**
 * Parses `contents` as JSON and returns it as a known type.

 * Expects a `isType` type guard to determine the return type of the file contents. If the
 * contents do not match the type guard, `INVALID_CONTENT_GIVEN` is returned.
 *
 * @example
 * import { isObj } from '@lib/util'
 * import { isDrv } from '@cizn/core/state'
 *
 * const parseAsObj = parseJSON(isObj)
 * const parseAsDrv = parseJSON(isDrv)
 *
 * const obj = parseAsObj('...') // obj's type is Object
 * const drv = parseAsDrv('...') // drv's type is Derivation
 *
 * @param {Cizn.Application} app the application
 */
export const parseAsJSON = (app: Cizn.Application): FSFileApi['parseAsJSON'] => isType => (contents, errors) => pipe(
  Success(contents),
  map(guard(_parseJSON(isType), { SyntaxError: errors?.SyntaxError ?? ErrorAs('INVALID_CONTENT_GIVEN') })),
)

/**
 * Tries to read the file at `path`.
 *
 * @param {string} path the file to read
 * @private
 */
const _readFile = async (path: string): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  if (!path) {
    return Failure(Error('NO_PATH_GIVEN', { options: [path] }))
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