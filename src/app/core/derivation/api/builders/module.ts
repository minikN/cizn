import { DerivationBuilderApi } from "@cizn/core/derivation/api/index.ts"
import fileLinker from '@cizn/core/derivation/api/builders/linkers/file.ts'

/**
 * Build the derivation for a module.
 *
 * @param {Cizn.Application} app the application
 * @returns {Promise<void>}
 */
const module = (app: Cizn.Application): DerivationBuilderApi['module'] => async (derivation) => {
  const { inputs = [] } = derivation || {}

  for (let i = 0; i < inputs.length; i++) {
    const inputDerivation = inputs[i]

    if (inputDerivation.builder === 'file') {
      await fileLinker(derivation, inputDerivation)
    }
  }
}

export default module