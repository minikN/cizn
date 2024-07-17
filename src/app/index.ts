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
  Adapter: Cizn.Adapter,
  State: Cizn.Application.State
}

export type Adapter = {
  Cli: Cizn.Adapter.Cli
  Log: Cizn.Adapter.Log
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
    defineProp('Api', {}),
    defineImmutableProp('State', stateComposition),
  )(obj)
  
  
  appComposition.Adapter = {
    Cli: cliAdapter(appComposition),
    Log: logAdapter(appComposition),
  }
  
  appComposition.State.Derivation.Api = derivationApi(appComposition)
  appComposition.State.Generation.Api = generationApi(appComposition)
  
  appComposition.Adapter.Cli.Api.init(appComposition)
  
  return appComposition
}

export default app
