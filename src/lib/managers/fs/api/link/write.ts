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
import { FSLinkApi } from "@lib/managers/fs/api"
import { symlink } from "node:fs/promises"

/**
 * Tries to create a symlink at `path`, pointing to `target` with `type`.
 *
 * @param {string} path the path to check
 * @private
 */
const _symlink = (target: string, type: 'file' | 'dir' | 'junction') => async (path: string):
Promise<Result<CiznError<'NO_PATH_GIVEN'> | CiznError<'NO_TARGET_GIVEN'>, string>> => {
  if (!target) {
    return Failure(ErrorWith('NO_TARGET_GIVEN', { options: [path] }))
  }

  if (!path) {
    return Failure(ErrorWith('NO_PATH_GIVEN', { options: [target] }))
  }

  await symlink(target, path, type)

  return Success(path)
}

/**
 * Tries to create a symlink at `path`, pointing to `target` with `type`.
 *
 * @param {Cizn.Application} app the application
 */
export const write = (app: Cizn.Application): FSLinkApi['write'] => (target, type = 'file') => (path, errors) =>
  asyncPipe(
    Success(path),
    map(guard(_symlink(target, type), {
      ERR_INVALID_ARG_TYPE: errors?.ERR_INVALID_ARG_TYPE ?? ErrorAs('NO_PATH_GIVEN'),
      ENOENT: errors?.ENOENT ?? ErrorAs('INCORRECT_PATH_GIVEN'),
      EACCES: errors?.EACCES ?? ErrorAs('EACCES'),
      EEXIST: errors?.EEXIST ?? ErrorAs('EEXIST'),
    })),
  )