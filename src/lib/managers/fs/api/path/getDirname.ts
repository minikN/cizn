// deno-lint-ignore-file no-unused-vars require-await
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
import { FSPathApi } from "@lib/managers/fs/api/index.ts"
import { dirname } from "node:path"

/**
 * Tries to get the `dirname` of the provided `path`
 *
 * @param {string} path the path to read
 * @private
 */
const _dirname = (path: string): Result<CiznError<'NO_PATH_GIVEN'>, string> => {
  if (path) {
    return Success(dirname(path))
  }

  return Failure(Error('NO_PATH_GIVEN', { options: [path] }))
}

/**
 * Gets the `dirname` of the provided `path`
 *
 * @param {Cizn.Application} app the application
 */
export const getDirname = (app: Cizn.Application): FSPathApi['getDirname'] => async (path, errors) => asyncPipe(
  Success(path),
  map(guard(_dirname, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    TypeError: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
  })),
)