import api from "@cizn/adapter/package/api"
import { defineNamespace, setNamespace } from "@lib/composition/namespace"
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
    defineNamespace('Api'),
    setNamespace('Api', api(app).init()),
  )(<Cizn.Adapter.Package>{})

  return adapterComposition
}

export default packageAdapter