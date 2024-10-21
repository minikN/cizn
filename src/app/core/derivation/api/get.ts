import { Derivation } from '@cizn/core/state'
import { readdir, readFile } from 'node:fs/promises'

/**
 * Returns the contents of a derivation if it exists or `null` if it doesn't.
 *
 * @param {Cizn.Application} app the application
 * @returns {Derivation | null}
 */
const get = (app: Cizn.Application): Cizn.Application.State.Derivation.Api['get'] => async ({ hash }) => {
  const { Derivation } = app.State

  const derivations = await readdir(Derivation.Root)

  const existingDerivation = derivations.find(
    file => file.includes(hash),
  )

  if (!existingDerivation) {
    return null
  }

  const derivationPath = `${Derivation.Root}/${existingDerivation}`
  const derivationFileContent = await readFile(`${derivationPath}`)
  const derivationContent = JSON.parse(derivationFileContent.toString())

  return <Derivation>derivationContent
}

export default get