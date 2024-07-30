import api from "@cizn/adapter/package/api"
import { defineProp } from "@lib/composition/property"
import { pipe } from "@lib/util"

export type Package = {
  Api: Cizn.Adapter.Package.Api
}

/**
 * The file adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Log}
 */
const packageAdapter = (app: Cizn.Application): Cizn.Adapter.Package => {
  const adapterComposition = pipe<Cizn.Adapter.Package>(
    defineProp('Api', null),
  )(<Cizn.Adapter.Package>{})

  const packageApi = api(app)
  const initializedPackageApi = packageApi.init()
  adapterComposition.Api = initializedPackageApi

  return adapterComposition
}

export default packageAdapter