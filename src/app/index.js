import { compose } from "@lib/util/index.js"
import G from '@lib/static.js'
import { defineImmutableProp, defineProp } from "@lib/composition/property.js"
import { defineNamespace } from "@lib/composition/namespace.js"
import cliAdapter from "@cizn/adapter/cli/index.js"
// import cliComposition from '@cizn/core/cli.js'

const { CLI, ADAPTER, API } = G

export const APP_NAME = 'cizn'
export const APP_VERSION = '0.0.1'

const app = (obj) => {
  const appComposition = compose(
    defineImmutableProp('_name', APP_NAME),
    defineProp(ADAPTER),
  )(obj)

  appComposition[ADAPTER] = {
    [CLI]: cliAdapter(appComposition),
  }

  appComposition[ADAPTER][CLI][API].init()

  return appComposition
}

export default app
