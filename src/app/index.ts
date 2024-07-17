import { pipe } from "@lib/util/index.js"
import G from '@cizn/global'
import { defineImmutableProp, defineProp } from "@lib/composition/property.js"
import cliAdapter from "@cizn/adapter/cli/index.js"
import logAdapter from "@cizn/adapter/log/index.js"
import state from "@cizn/core/state.js"
import derivationApi from "@cizn/core/derivation/api/index.js"
import generationApi from "@cizn/core/generation/api/index.js"


export const APP_NAME = 'cizn'
export const APP_VERSION = '0.0.1'


export type Application = {
  [G.ADAPTER]: Cizn.Adapter
  [G.STATE]: Cizn.Application.State
}

export type Adapter = {
  [G.CLI]: Cizn.Adapter.Cli
  [G.LOG]: Cizn.Adapter.Log
}

/**
* The main application
*
* @param {Object} obj the object to bootstrap the application to
* @returns {Cizn.Application} app
*/
const app = async (obj: Cizn.Application): Promise<Cizn.Application> => {
  const stateComposition = await state(<Cizn.Application.State>{})
  
  /** @type Cizn.Application */
  const appComposition = pipe<Cizn.Application>(
    defineImmutableProp('_name', APP_NAME),
    defineProp(G.ADAPTER, {}),
    defineImmutableProp(G.STATE, stateComposition),
  )(obj)
  
  
  appComposition[G.ADAPTER] = {
    [G.CLI]: cliAdapter(appComposition),
    [G.LOG]: logAdapter(appComposition),
  }
  
  appComposition[G.STATE][G.DERIVATION][G.API] = derivationApi(appComposition)
  appComposition[G.STATE][G.GENERATION][G.API] = generationApi(appComposition)
  
  appComposition[G.ADAPTER][G.CLI][G.API].init()
  
  return appComposition
}

export default app
