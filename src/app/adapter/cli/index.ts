import { pipe } from "@lib/util/index.js"
import { defineImmutableProp } from "@lib/composition/property.js"
import { APP_NAME, APP_VERSION } from "@cizn/index.js"
import G from '@cizn/global'
import { program } from "@commander-js/extra-typings"
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import cliApi from "@cizn/adapter/cli/api/index.js"
import { Command } from "commander"

export type Cli = {
  readonly _name: string,
  readonly _version: string,
  [G.PROGRAM]: Command
  [G.API]: Cizn.Adapter.Cli.Api
}

/**
 * The CLI adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Cli}
 */
const cliAdapter = (app: Cizn.Application): Cizn.Adapter.Cli => {
  /** @type {Cizn.Adapter.Cli} */
  const adapterComposition = pipe(
    defineImmutableProp('_name', APP_NAME),
    defineImmutableProp('_version', APP_VERSION),
    defineImmutableProp(G.PROGRAM, program),
    defineNamespace(G.API),
    setNamespace(G.API, cliApi(app)),
  )({})


  return adapterComposition
}

export default cliAdapter