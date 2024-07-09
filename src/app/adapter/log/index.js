import { compose } from "@lib/util/index.js"
import { defineProp } from "@lib/composition/property.js"
import G from '@lib/static.js'
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import logApi from "@cizn/adapter/log/api/index.js"

const { PROGRAM, API, LEVEL } = G

/**
 * The CLI adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Log}
 */
const logAdapter = (app) => {
  /** @type {Cizn.Adapter.Log} */
  const adapterComposition = compose(
    defineProp(PROGRAM, {}), // not using any loggin lib as of now ...
    defineNamespace(API),
    setNamespace(API, logApi(app)),
    defineProp(LEVEL, ''),
  )({})


  return adapterComposition
}

export default logAdapter