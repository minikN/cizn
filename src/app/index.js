import { compose } from "@lib/util/index.js"
import G from '@lib/static.js'
import { defineImmutableProp, defineProp } from "@lib/composition/property.js"
import cliAdapter from "@cizn/adapter/cli/index.js"
import logAdapter from "@cizn/adapter/log/index.js"
import state from "@cizn/core/state.js"
import derivationApi from "@cizn/core/derivation/api/index.js"

const { CLI, ADAPTER, API, STATE, LOG, DERIVATION } = G

export const APP_NAME = 'cizn'
export const APP_VERSION = '0.0.1'

const app = async (obj) => {
  const stateComposition = await state({})

  const appComposition = compose(
    defineImmutableProp('_name', APP_NAME),
    defineProp(ADAPTER, {}),
    defineImmutableProp(STATE, stateComposition),
  )(obj)


  appComposition[ADAPTER] = {
    [CLI]: cliAdapter(appComposition),
    [LOG]: logAdapter(appComposition),
  }

  appComposition[STATE][DERIVATION][API] = derivationApi(appComposition)

  appComposition[ADAPTER][CLI][API].init()


  return appComposition
}

export default app
