import G from '@cizn/constants'
import { isStr } from '@lib/util'
import { makeHash, sanitizeMultilineString } from '@lib/util/string'
import { readdir } from 'node:fs/promises'
import { GetProps, GetType } from '.'

const get = (App: Cizn.Application) => async ({
  hashParts, name, builder,
}: GetProps): GetType => {
  const { Derivation, Environment: environment } = App.State

  const {
    module = () => {}, env = {}, args = {}, config = {}, inputs = [],
  } = hashParts
  const hashString = JSON.stringify({
    args, env, config, inputs, module: sanitizeMultilineString(module.toString()),
  })

  const hash = makeHash(hashString)
  const derivations = await readdir(Derivation.Root)

  const includeEnvironment = !isStr(environment)
    ? false
    : builder === 'generation'

  const existingDerivation = derivations.find(
    file => includeEnvironment
      ? file.includes(`${environment}-${hash}`)
      : file.includes(hash),
  )

  const path = existingDerivation || `${name}-${includeEnvironment ? `${environment}-` : ''}${hash}.${G.DRV_EXT}`

  return { path, exists: !!existingDerivation }
}

export default get