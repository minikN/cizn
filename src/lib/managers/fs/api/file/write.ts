import { guard, map } from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError,
  ErrorAs,
  ErrorWith,
} from "@lib/errors"
import { FSFileApi } from "@lib/managers/fs/api"
import { writeFile as nodeWriteFile } from "node:fs/promises"

/**
 * Tries to create a file at `path` with `mode` permissions and writes
 * `content` to it.
 *
 * @param {string} file the file to write
 * @param {string} content content to write
 * @param {number} mode permissions for the file
 * @private
 */
const _writeFile = async ({
  file, content, mode = 0o600,
}: {file: string, content: string, mode?: number}): Promise<Result<CiznError<'NO_PATH_GIVEN'>, string>> => {
  if (!file) {
    return Failure(ErrorWith('NO_PATH_GIVEN', { options: [file] }))
  }

  await nodeWriteFile(file, content, { mode })

  return Success(file)
}

/**
 * Creates a file.
 *
 * @param {Cizn.Application} app the application
 */
export const write = (app: Cizn.Application): FSFileApi['write'] => (data, errors) => asyncPipe(
  Success(data),
  map(guard(_writeFile, {
    ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
    ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
    EISDIR: errors?.EISDIR ?? ErrorAs('NOT_A_FILE'),
    EACCESS: errors?.EACCESS ?? ErrorAs('EACCESS'),
  })),
)

