import G from '@cizn/constants'
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import { defineImmutableProp } from "@lib/composition/property.js"
import cliApi from "@lib/managers/cli/api/index.js"
import { pipe } from "@lib/util/index.js"
import { Command } from "commander"

export type Cli = {
  readonly _name: string,
  readonly _version: string,
  Program: Command
  Global: Command
  Api: Cizn.Manager.Cli.Api
}

/**
 * The CLI adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Cli}
 */
const cliAdapter = (app: Cizn.Application): Cizn.Manager.Cli => {
  const adapterComposition = pipe<Cizn.Manager.Cli>(
    defineImmutableProp('_name', G.APP_NAME),
    defineImmutableProp('_version', G.APP_VERSION),
    defineImmutableProp('Program', new Command),
    defineImmutableProp('Global', new Command),
    defineNamespace('Api'),
    setNamespace('Api', cliApi(app)),
  )(<Cizn.Manager.Cli>{})

  return adapterComposition
}

export default cliAdapter