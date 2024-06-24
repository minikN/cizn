import { compose } from "@lib/util/index.js"
import { defineImmutableProp } from "@lib/composition/property.js"
import G from '@lib/static.js'
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import logApi from "@cizn/adapter/log/api/index.js"
import signale from 'signale'

const { PROGRAM, API } = G

const logAdapter = (app) => {
  const adapterComposition = compose(
    defineImmutableProp(PROGRAM, signale),
    defineNamespace(API),
    setNamespace(API, logApi(app)),
  )({})


  return adapterComposition
}

export default logAdapter