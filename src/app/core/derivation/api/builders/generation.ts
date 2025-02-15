// deno-lint-ignore-file require-await
import { linkDerivationFiles } from '@cizn/core/derivation/api/builders/linkers/file.ts'
import { DerivationBuilderApi } from '@cizn/core/derivation/api/index.ts'
import { Derivation } from '@cizn/core/state.ts'
import { forEach, map } from '@lib/composition/function.ts'
import { asyncPipe } from '@lib/composition/pipe.ts'
import { Success } from '@lib/composition/result.ts'

/**
 * Executes {@link linkDerivationFiles} for each of `target`'s inputs.
 * 
 * @param {Cizn.Application} app  the application
 * @param {Derivation} parent     the parent derivation 
 */
const processInputDerivation = (app: Cizn.Application, parent: Derivation) => async (target: Derivation) =>
  asyncPipe(
    Success(target.inputs),
    map(forEach(linkDerivationFiles(app, parent))),
  )

/**
 * Build the derivation for a generation (meaning the root module).
 *
 * @param {Cizn.Application} app the application
 */
const builder = (app: Cizn.Application): DerivationBuilderApi['generation'] => async (derivation: Derivation) =>
  asyncPipe(
    Success(derivation.inputs),
    map(forEach(processInputDerivation(app, derivation))),
  )

export default builder
