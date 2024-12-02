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

  return Failure(ErrorWith('NOT_OWN_FILE', { options: [path] }))
}

/**
 * Checks whether the symlink pointed to from `path` is managed by cizn.
 *
 * @param {Cizn.Application} app the application
 */
export const isOwn = (app: Cizn.Application): FSLinkApi['isOwn'] => (path, errors) => asyncPipe(
  Success(path),
  map(x => app.Manager.FS.Api.Link.is(x, errors)),
  map(x => app.Manager.FS.Api.Link.read(x, errors)),
  map(guard(_isOwnSymlink(app), {
    NOT_OWN_FILE: errors?.NOT_OWN_FILE ?? ErrorAs('NOT_OWN_FILE'),
    NOT_A_SYMLINK: errors?.NOT_OWN_FILE ?? ErrorAs('NOT_OWN_FILE'),
  })),
)