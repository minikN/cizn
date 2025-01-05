import platformAdapter from "@cizn/adapter/platform/index.ts"
import G from '@cizn/constants.ts'
import stateComposition from "@cizn/core/state.ts"
import {
  bind, guard, map,
} from '@lib/composition/function.ts'
import { defineNamespace, setNamespace } from '@lib/composition/namespace.ts'
import { asyncPipe, pipe } from "@lib/composition/pipe.ts"
import { defineImmutableProp } from "@lib/composition/property.ts"
import { Success, SuccessType } from "@lib/composition/result.ts"
import cliManager from "@lib/managers/cli/index.ts"
import fileSystemManager from "@lib/managers/fs/index.ts"
import logManager from "@lib/managers/log/index.ts"
import fileAdapter from "./adapter/file/index.ts"
import derivationApi from "./core/derivation/api/index.ts"
import generationApi from "./core/generation/api/index.ts"
import { initApplicationState } from "./core/state/init.ts"

type AdapterApiTypes =
 | Cizn.Adapter.File
 | Cizn.Adapter.Platform

type AdapterTypes = 'File' | 'Platform'

type ManagerApiTypes =
  | Cizn.Manager.FS
  | Cizn.Manager.Cli
  | Cizn.Manager.Log

type ManagerTypes = 'FS' | 'Log' | 'Cli'

type CoreTypes = 'Derivation' | 'Generation'

type CoreApiTypes =
  | Cizn.Application.State.Derivation.Api
  | Cizn.Application.State.Generation.Api

export type Application = {
  Adapter: Cizn.Adapter,
  Manager: Cizn.Manager,
  State: Cizn.Application.State
}

export type Adapter = {
  File: Cizn.Adapter.File
  Platform: Cizn.Adapter.Platform
}

export type Manager = {
  FS: Cizn.Manager.FS
  Cli: Cizn.Manager.Cli
  Log: Cizn.Manager.Log
}

/**
 * Sets an individual adapter
 *
 * @param {AdapterTypes} ns     namespace of the adapter to set
 * @param {AdapterApiTypes} fn  init function for the adapter
 * @returns {Cizn.Adapter}
 */
const setAdapter = (ns: AdapterTypes, fn: AdapterApiTypes) => (adapterNs: Cizn.Adapter) => pipe(
  adapterNs,
  defineNamespace(ns),
  setNamespace(ns, fn),
)

/**
 * Sets all adapters
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Adapter}
 */
const setAdapters = (app: Cizn.Application) => pipe(
  <Cizn.Adapter>{},
  setAdapter('File', fileAdapter(app)),
  setAdapter('Platform', platformAdapter(app)),
)

/**
 * Sets and individual manager
 *
 * @param {ManagerTypes} ns     namespace of the adapter to set
 * @param {ManagerApiTypes} fn  init function for the adapter
 * @returns {Cizn.Manager}
 */
const setManager = (ns: ManagerTypes, fn: ManagerApiTypes) => (managerNs: Cizn.Manager) => pipe(
  managerNs,
  defineNamespace(ns),
  setNamespace(ns, fn),
)

/**
 * Sets all managers
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Manager}
 */
const setManagers = (app: Cizn.Application) => pipe(
  <Cizn.Manager>{},
  setManager('FS', fileSystemManager(app)),
  setManager('Cli', cliManager(app)),
  setManager('Log', logManager(app)),
)

/**
 * Sets an individual core api
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application}
 */
const setApi = (ns: CoreTypes, fn: CoreApiTypes) => (app: Cizn.Application) => pipe(
  app.State[ns],
  defineNamespace('Api'),
  setNamespace('Api', fn),
  () => app,
)

/**
 * Sets the core apis
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application}
 */
const setApis = (app: Cizn.Application) => pipe(
  app,
  setApi('Derivation', derivationApi(app)),
  setApi('Generation', generationApi(app)),
)

/**
 * Initializes the main application
 *
 * @returns {Cizn.Application}
 */
const appComposition = pipe(
    <Cizn.Application>{},
    defineImmutableProp('_name', G.APP_NAME),
    defineImmutableProp('State', stateComposition),
    setApis,
)

/**
 * Initializes an adapter by executing it `init` api function
 *
 * @param {Exclude<AdapterTypes, 'File'>} adapter the adapter to initialize
 * @returns {Cizn.Application}
 */
const initAdapter = (adapter: Exclude<AdapterTypes, 'File'>) => (app: Cizn.Application) => asyncPipe(
  Success(app),
  // TODO: Add error handlilng to guard once refactored
  map(guard(app.Adapter[adapter].Api.init)),
)

/**
 * Initializes an manager by executing it `init` api function
 *
 * @param {Exclude<ManagerTypes, 'File'>} adapter the adapter to initialize
 * @returns {Cizn.Application}
 */
const initManager = (manager: Exclude<ManagerTypes, 'FS'>) => (app: Cizn.Application) => asyncPipe(
  Success(app),
  map(app.Manager[manager].Api.init),
)

/**
* The main application
*
* @returns {Cizn.Application} app
*/
const app = asyncPipe(
  Success(appComposition),

  // Setting Adapters
  bind(defineNamespace('Adapter')),
  bind(setNamespace('Adapter', setAdapters(appComposition))),

  // Setting Managers
  bind(defineNamespace('Manager')),
  bind(setNamespace('Manager', setManagers(appComposition))),

  // Init log manager
  map(initManager('Log')),
)

/**
 * The unhydrated app
 *
 * We `await` the app composition early here and pass it onto
 * {@link hydratedApp}. We do this so that we can access the
 * same instance from {@link getApp} for use outside of the
 * main application flow.
 */
const unhydratedApp = await app

/**
 * Returns an instance of the application to use outside
 * of the main application flow.
 *
 * @returns {Cizn.Application}
 */
export const getApp = async () => {
  const appInstance = unhydratedApp as SuccessType<Cizn.Application>
  return appInstance.value
}

const hydratedApp = asyncPipe(
  unhydratedApp,
  map(initManager('Cli')),
  map(initApplicationState),
  map(initAdapter('Platform')),
)

export default hydratedApp
