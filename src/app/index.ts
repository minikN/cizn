// import { pipe } from "@lib/util/index.js"
import { pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import { defineImmutableProp, defineProp } from "@lib/composition/property.js"
import cliAdapter from "@cizn/adapter/cli/index.js"
import logAdapter from "@cizn/adapter/log/index.js"
import platformAdapter from "@cizn/adapter/platform"
import stateComposition, {
  setDerivationApi, setGenerationApi, setStateApi, testStateApi,
} from "@cizn/core/state.js"
import derivationApi from "@cizn/core/derivation/api/index.js"
import generationApi from "@cizn/core/generation/api/index.js"
import stateApi from "@cizn/core/state/api"
import fileAdapter from "./adapter/file"
import { defineNamespace, setNamespace } from '@lib/composition/namespace'
import { tee } from '@lib/composition/function'

export const APP_NAME = 'cizn'
export const APP_VERSION = '0.0.1'

type AdapterApiTypes =
 | Cizn.Adapter.Cli
 | Cizn.Adapter.File
 | Cizn.Adapter.Log
 | Cizn.Adapter.Platform

type AdapterTypes = 'Log' | 'File' | 'Platform' | 'Cli'

export type Application = {
  Adapter: Cizn.Adapter,
  State: Cizn.Application.State
}

export type Adapter = {
  Cli: Cizn.Adapter.Cli
  Log: Cizn.Adapter.Log
  File: Cizn.Adapter.File
  Platform: Cizn.Adapter.Platform
}

// const setApi = (fn: Function, ns: ApiTypes = O.none) => tee((app: Cizn.Application) => pipe(
//   ns,
//   O.matchW(
//     () => app.State,
//     api => app.State[api],
//   ),
//   defineNamespace('Api'),
//   setNamespace('Api', fn(app)),
// ))

const setAdapter = (fn: AdapterApiTypes, ns: AdapterTypes) => tee((adapterNamespace: object) => pipe(
  adapterNamespace,
  defineImmutableProp(ns, fn),
))

const createAdapters = (app: Cizn.Application) => pipe(
  {},
  setAdapter(cliAdapter(app), 'Cli'),
  setAdapter(logAdapter(app), 'Log'),
  setAdapter(fileAdapter(app), 'File'),
  setAdapter(platformAdapter(app), 'Platform'),
)

const appComposition = pipe(
    <Cizn.Application>{},
    defineImmutableProp('_name', APP_NAME),
    defineImmutableProp('State', stateComposition),
    setStateApi,
    setDerivationApi,
    setGenerationApi,
)

const initializeApi = (name: Exclude<AdapterTypes, 'File'> | null = null) => tee((app: Cizn.Application) => pipe(
  O.fromNullable(name),
  O.matchW(
    // TODO: Incorrect!
    async () => await app.State.Api.init(),
    async x => await app.Adapter[x].Api.init(app),
  ),
))

const initializeStateApi = initializeApi()
const initializeCliApi = initializeApi('Cli')
const intializePlatformApi = initializeApi('Platform')

/**
* The main application
*
* @returns {Cizn.Application} app
*/
const app = pipe(
  appComposition,
  defineNamespace('Adapter'),
  setNamespace('Adapter', createAdapters(appComposition)),
  // TODO: Incorrect!
  initializeCliApi,
  initializeStateApi,
  intializePlatformApi,
  // initializeApi(),
  // appComposition.Adapter = {
  //   Cli: cliAdapter(appComposition),
  //   Log: logAdapter(appComposition),
  //   File: fileAdapter(appComposition),
  //   Platform: platformAdapter(appComposition),
  // }

  // // appComposition.State.Api = stateApi(appComposition)
  // // appComposition.State.Derivation.Api = derivationApi(appComposition)
  // // appComposition.State.Generation.Api = generationApi(appComposition)

  // await appComposition.Adapter.Cli.Api.init(appComposition)
  // await appComposition.State.Api.init()
  // await appComposition.Adapter.Platform.Api.init()

  // return appComposition
)

export default app
