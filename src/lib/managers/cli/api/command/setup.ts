import { Environment } from "@cizn/core/state"
import { CliCommandProps } from "@lib/managers/cli/api"
import { isStr } from "@lib/util"
import path from "node:path"

/**
 * Helper function to set the `environment` an command `options` provided
 * by the user.
 *
 * @param {Cizn.Application} app the main application
 * @returns
 */
const _setup = (app: Cizn.Application) => async (environment: Environment, options: CliCommandProps) => {
  const log = app.Manager.Log.Api
  const { source } = options

  if (source) {
    app.State.Source.Current = source
    app.State.Source.Root = path.dirname(source)
  }

  if (isStr(environment) && environment !== 'home' && environment !== 'system') {
    log.error({
      message: 'Environment given is not recognized. Can only be "home" or "system". Given value: %d',
      options: [<any>environment],
    })
  }

  app.State.Environment = environment
}

export default _setup

