import { pipe } from "@lib/util/index.js"
import { defineProp } from "@lib/composition/property.js"
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import logApi from "@cizn/adapter/log/api/index.js"

export type Log = {
  Program: Object
  Api: Cizn.Adapter.Log.Api
  Level: string,
}

/**
 * The CLI adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Log}
 */
const logAdapter = (app: Cizn.Application): Cizn.Adapter.Log => {
  const adapterComposition = pipe<Cizn.Adapter.Log>(
    defineProp('Program', {}), // not using any loggin lib as of now ...
    defineNamespace('Api'),
    setNamespace('Api', logApi(app)),
    defineProp('Level', ''),
  )(<Cizn.Adapter.Log>{})


  return adapterComposition
}

export default logAdapter