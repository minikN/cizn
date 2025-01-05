import { defineNamespace, setNamespace } from "@lib/composition/namespace.ts"
import { pipe } from "@lib/composition/pipe.ts"
import fsApi from '@lib/managers/fs/api/index.ts'

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