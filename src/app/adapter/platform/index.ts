import api from "@cizn/adapter/platform/api/index.ts"
import { defineNamespace, setNamespace } from "@lib/composition/namespace.ts"
import { defineProp } from "@lib/composition/property.ts"
import { pipe } from "@lib/util/index.ts"

export type Platform = {
  Api: Cizn.Adapter.Platform.Api
  Package: Cizn.Adapter.Package
  Service: Cizn.Adapter.Service
}

/**
 * The file adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Log}
 */
const platformAdapter = (app: Cizn.Application): Cizn.Adapter.Platform => {
  const adapterComposition = pipe<Cizn.Adapter.Platform>(
    defineNamespace('Api'),
    setNamespace('Api', api(app)),
    defineProp('Package', null), // Will get set by api's init method
    defineNamespace('Service'),
  )(<Cizn.Adapter.Platform>{})


  return adapterComposition
}

export default platformAdapter