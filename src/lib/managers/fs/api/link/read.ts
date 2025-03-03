import { guard, map } from "@lib/composition/function.ts"
import { asyncPipe } from "@lib/composition/pipe.ts"
import { Result, Success } from "@lib/composition/result.ts"
import {
  CiznError,
  ErrorAs,
} from "@lib/errors/index.ts"
import { FSLinkApi } from "@lib/managers/fs/api/index.ts"
import { readlink } from "node:fs/promises"

/**
 * Tries to follow the symlink provided by `path`.
 *
 * @param {string} path the path to check
 * @private
 */
const _readSymlink = async (path: string): Promise<
Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'NOT_A_SYMLINK'>, string>
> => Success(await readlink(path))


/**
 * Follows the symlink provided by `path`.
 *
 * @param {Cizn.Application} app the application
 */
export const read = (app: Cizn.Application): FSLinkApi['read'] => (path, errors) => asyncPipe(
  Success(path),
  map(x => app.Manager.FS.Api.Link.is(x, errors)),
  map(guard(_readSymlink, { EINVAL: errors?.EINVAL ?? ErrorAs('INCORRECT_PATH_GIVEN') })),
)