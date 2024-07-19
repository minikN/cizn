import { defineNamespace, setNamespace } from "@lib/composition/namespace"
import { pipe } from "@lib/util"
import publicApi from "@cizn/adapter/file/api/public"
import internalApi from "@cizn/adapter/file/api/internal"

export type File = {
  Public: Cizn.Adapter.File.PublicApi
  Internal: Cizn.Adapter.File.InternalApi
}

/**
 * The file adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Log}
 */
const fileAdapter = (app: Cizn.Application): Cizn.Adapter.File => {
  const adapterComposition = pipe<Cizn.Adapter.File>(
    defineNamespace('Public'),
    defineNamespace('Internal'),
    setNamespace('Public', publicApi(app)),
    setNamespace('Internal', internalApi(app)),
  )(<Cizn.Adapter.File>{})


  return adapterComposition
}

export default fileAdapter