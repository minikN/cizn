import { Derivation, isDrv } from '@cizn/core/state.ts'
import {
  bind,
  map,
  mapEach,
  mapType,
} from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import {
  Failure,
  Result, Success,
} from '@lib/composition/result.ts'
import { CiznError, Error } from '@lib/errors/index.ts'
import { isStr } from '@lib/util/index.ts'
import { getHash } from '@lib/util/string.ts'

/**
 * Finds the derivation that matches `hash` amongst the already built derivations.
 * Will return the provided `hash` otherwise.
 *
 * @param {Cizn.Application} app the application
 */
const findComputedDerivation = (app: Cizn.Application) => (hash: string) =>
  app.State.Derivation.State.Built.find(x => x.hash === hash) || hash

/**
 * Reads the derivation root and find the file matching `hash` and returns it.
 * Will return `undefined` otherwise.
 *
 * @param {Cizn.Application} app the application
 */
const findDerivation = (app: Cizn.Application) => (hash: string) => asyncPipe(
  Success(app.State.Derivation.Root),
  map(app.Manager.FS.Api.Directory.read),
  bind(drvs => drvs.find(drv => drv.includes(hash))),
)

/**
 * Returns the hash of the derivation denoted by `path`.
 *
 * @param {string} path the derivation path
 */
const getDerivationHash = (path: string): Result<CiznError<"MALFORMED_DERIVATION_HASH">, string> => {
  const hash = getHash(path)

  return hash.length
    ? Success(hash)
    : Failure(Error('MALFORMED_DERIVATION_HASH'))
}

/**
 * Returns the derivation that matches the hash of `input`'s `path`.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application.State.Derivation.Api['get']}
 */
const getInputDerivation = (app: Cizn.Application) => async (input: Derivation) => asyncPipe(
  Success(input),
  map(x => getDerivationHash(x.path)),
  map(get(app)),
)

/**
 * Builds the full derivation tree from the derivation denoted by `file`.
 *
 * @param {Cizn.Application} app the application
 */
const readDerivation = (app: Cizn.Application) => (file: string) => asyncPipe(
  Success(`${app.State.Derivation.Root}/${file}`),
  map(app.Manager.FS.Api.File.read),
  map(app.Manager.FS.Api.File.parseAsJSON(isDrv)),
  map(derivation => asyncPipe(
    Success(derivation.inputs),
    map(mapEach(getInputDerivation(app))),
    bind(inputs => ({ ...derivation, inputs } as Derivation)),
  )),
)

/**
 * Returns the derivation that matches `hash`.
 *
 * Will firstly look through the list of already computed derivations amongst
 * `Derivation.State.Built`. If a derivation amongst them is found, it'll
 * return it.
 *
 * If not, it'll look through the already built derivations on the file system
 * and find the one matching the hash. After that, it'll recursively call itself
 * with each of its `inputs`. This will eventually return a complete tree of
 * the derivation.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application.State.Derivation.Api['get']}
 */
const get = (app: Cizn.Application): Cizn.Application.State.Derivation.Api['get'] => async (hash: string) => asyncPipe(
  Success(hash),
  bind(findComputedDerivation(app)),
  mapType(isStr, findDerivation(app)),
  mapType(isStr, readDerivation(app)),
)

export default get