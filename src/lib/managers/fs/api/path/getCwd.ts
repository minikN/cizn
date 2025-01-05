import { guard, map } from "@lib/composition/function.ts"
import { asyncPipe } from "@lib/composition/pipe.ts"
import {
  Failure, Result, Success,
} from "@lib/composition/result.ts"
import { CiznError, Error } from "@lib/errors/index.ts"
import process from "node:process"
import { FSPathApi } from "@lib/managers/fs/api/index.ts"

/**
 * Gets the `cwd`.
 *
 * @private
 */
const _getCwd = async (): Promise<Result<CiznError<'NO_CWD_GIVEN'>, string>> => {
  const cwd = await process.cwd()
  if (cwd) {
    return Success(cwd)
  }

  return Failure(Error('NO_CWD_GIVEN'))
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