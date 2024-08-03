import { defineNamespace, setNamespace } from "@lib/composition/namespace"
import { defineProp } from "@lib/composition/property"
import { pipe } from "@lib/util"
import { Result, ResultPromise } from "execa"

export type Package = {
  Api: Cizn.Adapter.Package.Api
  Manager: {
    Exec: string,
    Arguments: string[]
    Root: boolean
  }
  Helper: {
    Exec: string | undefined,
    Arguments: string[]
    Root: boolean,
  }
  Run: (args: string[], options?: Object) => Promise<Result<{}>>
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
      Root: true,
    }),
    defineNamespace('Helper'),
    setNamespace('Helper', {
      Exec: null,
      Arguments: null,
      Root: true,
    }),
    defineProp('Api', {}),
  )(<Cizn.Adapter.Package>{})

  return adapterComposition
}

export default packageAdapter