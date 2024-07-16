import { pipe } from "@lib/util/index.js"
import { defineProp } from "@lib/composition/property.js"
import G from '@cizn/global'
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import logApi from "@cizn/adapter/log/api/index.js"

export type Log = {
  [G.PROGRAM]: Object
  [G.API]: Cizn.Adapter.Log.Api
  [G.LEVEL]: string,
}

/**
 * The CLI adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Log}
 */
const logAdapter = (app: Cizn.Application): Cizn.Adapter.Log => {
  /** @type {Cizn.Adapter.Log} */
  const adapterComposition = pipe(
    defineProp(G.PROGRAM, {}), // not using any loggin lib as of now ...
    defineNamespace(G.API),
    setNamespace(G.API, logApi(app)),
    defineProp(G.LEVEL, ''),
  )({})


  return adapterComposition
}

export default logAdapter