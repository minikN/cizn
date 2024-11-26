import { guard, map } from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import {
  Failure, Result, Success,
} from "@lib/composition/result"
import {
  CiznError, Error, ErrorAs,
} from "@lib/errors"
import { FSLinkApi } from "@lib/managers/fs/api"

/**
 * Checks whether the symlink pointed to from `path` is managed by cizn.
 *
 * @param {string} path the path to check
 * @private
 */
const _isOwnSymlink = (app: Cizn.Application) => async (path: string): Promise<
Result<CiznError<'NOT_OWN_FILE'>, string>
> => {
  if (path.includes(app.State.Derivation.Root) || path.includes(app.State.Generation.Root)) {
    return Success(path)
  }

  return Failure(Error('NOT_OWN_FILE'))
}

/**
 * Checks whether the symlink pointed to from `path` is managed by cizn.
 *
 * @param {Cizn.Application} app the application
 */
export const isOwn = (app: Cizn.Application): FSLinkApi['isOwn'] => (path, errors) => asyncPipe(
  Success(path),
  map(app.Manager.FS.Api.Link.is),
  map(app.Manager.FS.Api.Link.read),
  map(guard(_isOwnSymlink(app), { NOT_OWN_FILE: errors?.NOT_OWN_FILE ?? ErrorAs('NOT_OWN_FILE') })),
)