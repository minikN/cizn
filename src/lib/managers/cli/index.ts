import G from '@cizn/constants.ts'
import { defineNamespace, setNamespace } from "@lib/composition/namespace.ts"
import { defineImmutableProp } from "@lib/composition/property.ts"
import { Result } from '@lib/composition/result.ts'
import cliApi from "@lib/managers/cli/api/index.ts"
import { pipe } from "@lib/util/index.ts"
import { Command } from "npm:commander"

export type Cli = {
  readonly _name: string,
  readonly _version: string,
  Program: Command
  Global: Command
  Api: Cizn.Manager.Cli.Api
  Result: Result<unknown, unknown>
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