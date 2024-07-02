import G from '@lib/static.js'
import { readdir } from 'node:fs/promises'

const { ADAPTER, LOG, MODULES, OPTIONS, STATE, API, DERIVATION } = G

const has = app => async ({ hash, name }) => {
  const { [DERIVATION]: derivation } = app[STATE]
  const { [LOG]: logAdapter } = app[ADAPTER]

  const derivations = await readdir(derivation[G.ROOT])

  const existingDerivation = derivations.find(file => file.includes(hash))

  if (existingDerivation) {
    logAdapter[G.API].info({ message: `Existing derivation found for ${name} module. Reusing it.` })
  }

  return existingDerivation
}

export default has