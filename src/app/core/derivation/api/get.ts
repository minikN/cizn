import G from '@cizn/global'
import crypto from 'crypto'
import { readdir } from 'node:fs/promises'
import { GetProps, GetType } from '.'

const get = (app: Cizn.Application) => async ({ hashParts, name }: GetProps): GetType => {
  const { [G.DERIVATION]: derivation } = app[G.STATE]

  const { module = () => {}, args = {}, config = {} } = hashParts
  const hashString = `${JSON.stringify(args)}${JSON.stringify(config)}${module.toString()}`

  const hash = crypto
    .createHash('md5')
    .update(hashString)
    .digest('hex')

  const derivations = await readdir(derivation[G.ROOT])

  const existingDerivation = derivations.find(file => file.includes(hash))

  return existingDerivation
    ? { path: existingDerivation }
    : { hash }
}

export default get