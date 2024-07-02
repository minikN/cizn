import { compose } from "@lib/util/index.js"
import { defineProp } from "@lib/composition/property.js"
import G from '@lib/static.js'
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import logApi from "@cizn/adapter/log/api/index.js"
import signale from 'signale'

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
    defineProp(PROGRAM, signale),
    defineNamespace(API),
    setNamespace(API, logApi(app)),
    defineProp(LEVEL, 0),
  )({})


  return adapterComposition
}

export default logAdapter