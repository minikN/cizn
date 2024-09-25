import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import { pipe } from "@lib/composition/pipe"
import fsApi from './api'

// export default {
//   isPathReadable,
//   getRealPath,
//   isFile,
// }

export type FS = {
  Api: Cizn.Manager.FS.Api,
}

// /**
//  * The CLI adapter
//  *
//  * @param {Cizn.Application} app
//  * @returns {Cizn.Adapter.Log}
//  */
// const fileSystemManager = (app: Cizn.Application): Cizn.Manager.FS => {
//   const adapterComposition = pipe<Cizn.Adapter.Log>(
//     defineProp('Program', {}), // not using any loggin lib as of now ...
//     defineNamespace('Api'),
//     setNamespace('Api', logApi(app)),
//     defineProp('Level', ''),
//   )(<Cizn.Adapter.Log>{})


//   return adapterComposition
// }
const fileSystemManager = (app: Cizn.Application) => pipe(
  <Cizn.Manager.FS>{},
  defineNamespace('Api'),
  setNamespace('Api', fsApi(app)),
)

export default fileSystemManager