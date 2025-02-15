// deno-lint-ignore-file require-await
import { linkDerivationFiles } from '@cizn/core/derivation/api/builders/linkers/file.ts'
import { DerivationBuilderApi } from '@cizn/core/derivation/api/index.ts'
import { Derivation } from '@cizn/core/state.ts'
import { forEach, map } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Success } from '@lib/composition/result.ts'

/**
 * Build the derivation for a module.
 *
 * @param {Cizn.Application} app the application
 * @returns {Promise<void>}
 */
const builder = (app: Cizn.Application): DerivationBuilderApi['module'] => async (derivation: Derivation) =>
  asyncPipe(
    Success(derivation.inputs),
    map(forEach(linkDerivationFiles(app, derivation))),
  )

export default builder
