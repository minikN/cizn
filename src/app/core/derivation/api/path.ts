import G from '@cizn/constants'
import { makeHash, sanitizeMultilineString } from '@lib/util/string'
import { readdir } from 'node:fs/promises'
import { DerivationPath } from '@cizn/core/derivation/api'

/**
 * Will return an object containing the `path` of a derivation as well as
 * a boolean denoting if the derivation already exists.
 *
 * @param {Cizn.Application} app the application
 * @returns {DerivationPath}
 */
const path = (app: Cizn.Application): Cizn.Application.State.Derivation.Api['path'] => async ({ hashParts, name }) => {
  const { Derivation } = app.State
  const {
    module = () => {}, env = {}, args = {}, config = {}, inputs = [],
  } = hashParts
  const hashString = JSON.stringify({
    args, env, config, inputs, module: sanitizeMultilineString(module.toString()),
  })

  const hash = makeHash(hashString)
  const derivations = await readdir(Derivation.Root)

  const existingDerivation = derivations.find(
    file => file.includes(hash),
  )

  const path = existingDerivation || `${hash}-${name}.${G.DRV_EXT}`

  return <DerivationPath>{ path, exists: !!existingDerivation }
}

export default path