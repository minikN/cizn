import { compose, composeAsync } from "@lib/util/index.js"
import G from '@lib/static.js'
import { defineImmutableProp, defineProp } from "@lib/composition/property.js"
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import cliAdapter from "@cizn/adapter/cli/index.js"
import state from "@cizn/core/state.js"

const { CLI, ADAPTER, API, STATE } = G

export const APP_NAME = 'cizn'
export const APP_VERSION = '0.0.1'

const app = async (obj) => {
  const stateComposition = await state({})

  const appComposition = compose(
    defineImmutableProp('_name', APP_NAME),
    defineProp(ADAPTER),
    defineImmutableProp(STATE, stateComposition),
  )(obj)


  appComposition[ADAPTER] = {
    [CLI]: cliAdapter(appComposition),
  }
  appComposition[ADAPTER][CLI][API].init()


  return appComposition
}

export default app
