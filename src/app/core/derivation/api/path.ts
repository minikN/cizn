// deno-lint-ignore-file no-unused-vars require-await
import G from '@cizn/constants.ts'
import { DerivationPath, DerivationPathProps } from '@cizn/core/derivation/api/index.ts'
import { bind, guard, map } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Failure, Success } from '@lib/composition/result.ts'
import { Error, ErrorAs } from '@lib/errors/index.ts'
import { makeHash, sanitizeMultilineString } from '@lib/util/string.ts'

/**
 * Stringifies `hashParts`
 *
 * @param {Cizn.Application} app the application
 * @returns {Result<CiznError<"INVALID_CONTENT_GIVEN"> | string>}
 */
const stringifyHashParts = (app: Cizn.Application) => (hashParts: DerivationPathProps['hashParts']) => {
  const str = JSON.stringify({ ...hashParts, module: sanitizeMultilineString(hashParts.module.toString()) })

  if (str) {
    return Success(str)
  }

  return Failure(Error('INVALID_CONTENT_GIVEN'))
}

/**
 * Tries to find the derivation matching `hash`.
 *
 * It'll return the found derivation (or `undefined`) alongside the incoming hash.
 *
 * @param {Cizn.Application} app the application
 * @returns {{ derivation: string | null, hash: string }}
 */
const findExistingDerivation = (app: Cizn.Application) => (hash: string) =>
  asyncPipe(
    Success(app.State.Derivation.Root),
    map(app.Manager.FS.Api.Directory.read),
    map((derivations) =>
      Success({
        hash,
        derivation: derivations.find((file) => file.includes(hash)),
      })
    ),
  )

/**
 * Will return an object containing the `path` of a derivation as well as a boolean
 * denoting if the derivation already exists.
 *
 * @param {Cizn.Application} app the application
 * @returns {DerivationPath}
 */
const path = (app: Cizn.Application): Cizn.Application.State.Derivation.Api['path'] => async ({ hashParts, name }) =>
  asyncPipe(
    Success(hashParts),
    map(guard(stringifyHashParts(app), { TypeError: ErrorAs('INVALID_CONTENT_GIVEN') })),
    bind(makeHash),
    map(findExistingDerivation(app)),
    bind(({ derivation, hash }) => (<DerivationPath> {
      path: derivation || `${hash}-${name}.${G.DRV_EXT}`,
      exists: !!derivation,
    })),
  )

export default path
