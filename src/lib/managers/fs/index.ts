import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import { pipe } from "@lib/composition/pipe"
import fsApi from './api'

export type FS = {
  Api: Cizn.Manager.FS.Api,
}

/**
 * The File System Manager
 *
 * @param {Cizn.Application} app
 */
const fileSystemManager = (app: Cizn.Application) => pipe(
  <Cizn.Manager.FS>{},
  defineNamespace('Api'),
  setNamespace('Api', fsApi(app)),
)

export default fileSystemManager