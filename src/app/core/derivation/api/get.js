import G from '@lib/static.js'
import crypto from 'crypto'
import { readdir } from 'node:fs/promises'

const { ADAPTER, LOG, MODULES, OPTIONS, STATE, API, DERIVATION } = G

const get = app => async ({ module, name }) => {
  const { [DERIVATION]: derivation } = app[STATE]
  const { [LOG]: logAdapter } = app[ADAPTER]

  const hash = crypto
    .createHash('md5')
    .update(typeof module === 'string' ? module : module.toString())
    .digest('hex')

  const derivations = await readdir(derivation[G.ROOT])

  const existingDerivation = derivations.find(file => file.includes(hash))

  if (existingDerivation) {
    logAdapter[G.API].info({ message: `Existing derivation found for ${name} module. Reusing it.` })

    return { derivation: existingDerivation }
  }

  return { hash }
}

export default get