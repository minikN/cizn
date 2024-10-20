import { guard, map } from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import { CiznError, Error } from "@lib/errors"
import process from "node:process"
import { FSPathApi } from ".."

/**
 * Gets the `cwd`.
 *
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
 * Gets the current `cwd`.
 *
 * @param {string} path the path to check
 */
export const getCwd = (app: Cizn.Application): FSPathApi['getCwd'] => () => asyncPipe(
  Success(true),
  map(guard(_getCwd)),
)