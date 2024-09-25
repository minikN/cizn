import { pipe } from "@lib/util/index.js"
import { defineProp } from "@lib/composition/property.js"
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import logApi from "@lib/managers/log/api/index.js"

export type Log = {
  Program: Object
  Api: Cizn.Manager.Log.Api
  Level: string,
}

/**
 * The CLI adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Manager.Log}
 */
const logAdapter = (app: Cizn.Application): Cizn.Manager.Log => {
  const adapterComposition = pipe<Cizn.Manager.Log>(
    defineProp('Program', {}), // not using any loggin lib as of now ...
    defineNamespace('Api'),
    setNamespace('Api', logApi(app)),
    defineProp('Level', ''),
  )(<Cizn.Manager.Log>{})


  return adapterComposition
}

export default logAdapter