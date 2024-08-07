import { pipe } from "@lib/util/index.js"
import { defineImmutableProp } from "@lib/composition/property.js"
import { APP_NAME, APP_VERSION } from "@cizn/index.js"
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import cliApi from "@cizn/adapter/cli/api/index.js"
import { Command } from "commander"

export type Cli = {
  readonly _name: string,
  readonly _version: string,
  Program: Command
  Global: Command
  Api: Cizn.Adapter.Cli.Api
}

/**
 * The CLI adapter
 *
 * @param {Cizn.Application} app
 * @returns {Cizn.Adapter.Cli}
 */
const cliAdapter = (app: Cizn.Application): Cizn.Adapter.Cli => {
  const adapterComposition = pipe<Cizn.Adapter.Cli>(
    defineImmutableProp('_name', APP_NAME),
    defineImmutableProp('_version', APP_VERSION),
    defineImmutableProp('Program', new Command),
    defineImmutableProp('Global', new Command),
    defineNamespace('Api'),
    setNamespace('Api', cliApi(app)),
  )(<Cizn.Adapter.Cli>{})

  return adapterComposition
}

export default cliAdapter