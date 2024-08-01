import api from "@cizn/adapter/package/api"
import { defineNamespace, setNamespace } from "@lib/composition/namespace"
import { defineImmutableProp, defineProp } from "@lib/composition/property"
import { pipe } from "@lib/util"

export type Package = {
  Api: Cizn.Adapter.Package.Api
  Manager: {
    Exec: string,
    Arguments: string[]
  }
  Helper: {
    Exec: string,
    Arguments: string[]
  }
}

/**
 * The file adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Log}
 */
const packageAdapter = async (app: Cizn.Application): Promise<Cizn.Adapter.Package> => {
  const adapterComposition = pipe<Cizn.Adapter.Package>(
    defineNamespace('Manager'),
    setNamespace('Manager', {
      Exec: null,
      Arguments: null,
    }),
    defineNamespace('Helper'),
    setNamespace('Helper', {
      Exec: null,
      Arguments: null,
    }),
    defineProp('Api', {}),
  )(<Cizn.Adapter.Package>{})

  return adapterComposition
}

export default packageAdapter