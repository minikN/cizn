import { DerivationBuilderApi } from '@cizn/core/derivation/api/index.ts'

/**
 * Build the derivation for a file.
 *
 * @param {Cizn.Application} app the application
 */
const file = (app: Cizn.Application): DerivationBuilderApi['file'] => async (derivation) =>  await app.Manager.FS.Api.File.write({
    file: <string> derivation.env.out,
    content: <string> derivation.env.content,
  })


export default file
