import G from '@cizn/global'
import crypto from 'crypto'
import { readdir } from 'node:fs/promises'
import { GetProps, GetType } from '.'

const get = (App: Cizn.Application) => async ({ hashParts, name }: GetProps): GetType => {
  const { Derivation } = App.State

  const {
    module = () => {}, args = {}, config = {},
  } = hashParts
  const hashString = `${JSON.stringify(args)}${JSON.stringify(config)}${module.toString()}`

  const hash = crypto
    .createHash('md5')
    .update(hashString)
    .digest('hex')

  const derivations = await readdir(Derivation.Root)

  const existingDerivation = derivations.find(file => file.includes(hash))

  return existingDerivation
    ? { path: existingDerivation }
    : { hash }
}

export default get