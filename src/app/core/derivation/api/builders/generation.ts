import { DerivationBuilderApi } from "@cizn/core/derivation/api"
import fileLinker from '@cizn/core/derivation/api/builders/linkers/file'

/**
 * Build the derivation for a generation (meaning the root module).
 *
 * @param {Cizn.Application} app the application
 * @returns {Promise<void>}
 */
const module = (app: Cizn.Application): DerivationBuilderApi['module'] => async (derivation) => {
  const { inputs = [] } = derivation || {}

  for (let i = 0; i < inputs.length; i++) {
    const inputDerivation = inputs[i]

    if (inputDerivation.builder !== 'module') {
      // log error here, we should only have module inputs in the root module
    }

    for (let x = 0; x < inputDerivation.inputs.length; x++) {
      const childInputDerivation = inputDerivation.inputs[x]

      if (childInputDerivation.builder === 'file') {
        await fileLinker(derivation, childInputDerivation)
      }
    }
  }
}

export default module