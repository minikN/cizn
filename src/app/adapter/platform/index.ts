import api from "@cizn/adapter/platform/api"
import { defineNamespace, setNamespace } from "@lib/composition/namespace"
import { defineProp } from "@lib/composition/property"
import { pipe } from "@lib/util"

export type Platform = {
  Api: Cizn.Adapter.Platform.Api
  Package: Cizn.Adapter.Package
  Serice: Cizn.Adapter.Service
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

    defineProp('Package', null),
    // defineNamespace('Package'),
    // setNamespace('Package', packageAdapter(app)),

    defineNamespace('Service'),
  )(<Cizn.Adapter.Platform>{})


  return adapterComposition
}

export default platformAdapter