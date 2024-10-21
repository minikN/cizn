import { Derivation } from '@cizn/core/state'
import { getHash } from '@lib/util/string'
import { readdir, readFile } from 'node:fs/promises'

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
 * @returns {Derivation | null}
 */
const get = (app: Cizn.Application): Cizn.Application.State.Derivation.Api['get'] => async ({ hash }) => {
  const { Derivation } = app.State

  const computedDerivation = Derivation.State.Built.find(x => x.hash === hash)

  if (computedDerivation) {
    return computedDerivation
  }

  const derivations = await readdir(Derivation.Root)

  const existingDerivation = derivations.find(
    file => file.includes(hash),
  )

  if (!existingDerivation) {
    return null
  }

  const derivationPath = `${Derivation.Root}/${existingDerivation}`
  const derivationFileContent = await readFile(`${derivationPath}`)
  const derivationContent = JSON.parse(derivationFileContent.toString()) as Derivation

  for (let i = 0; i < derivationContent.inputs.length; i++) {
    const inputDerivation = derivationContent.inputs[i]
    const hash = getHash(inputDerivation.path)
    const foundDerivation = await Derivation.Api.get({ hash })

    foundDerivation && (derivationContent.inputs[i] = foundDerivation)
  }

  return derivationContent
}

export default get