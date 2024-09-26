import G from '@cizn/constants'
import {
  bind,
  map,
  tap,
} from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import { Result, Success } from "@lib/composition/result"
import process from 'node:process'

const noConfigPathError = `No valid path for the configuration file was given.
This could be because of one of two things:
- The --config parameter was not provided
- The XDG_CONFIG_HOME environment variable is not set`

const log = (Log: Cizn.Manager.Log.Api) => (level: keyof Cizn.Manager.Log.Api, message: string) => (input: string) => {
  Log?.[level]?.({ message, options: [input] })
}

/**
 * Gets the default config path
 *
 * This is defined by the `--config` parameter, which is present in
 * `app.State.Config.Current`. If this isn't set, the fallback defined
 * below is used.
 *
 * @param {Cizn.Application} app the application
 * @returns {string}
 */
const getConfigPath = (app: Cizn.Application): Result<never, string> =>
  Success(app.State.Config.Current || `${process.env.XDG_CONFIG_HOME ?? '~/.config'}/${G.APP_NAME}/config.json`)

/**
 * Parses the config file and returns its values.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application.State.Config['State']}
 */
const getConfigValues = (FS: Cizn.Manager.FS.Api) => (path: string) => asyncPipe(
  Success(path),
  map(FS.getRealPath),
  map(FS.isPathReadable),
  map(FS.isFile),
  map(FS.readFile),
  map(FS.parseJSON),
)

/**
 * Sets the gathered config values
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application}
 */
const setConfigValues = (app: Cizn.Application) => (config: Cizn.Application.State.Config["State"]): Cizn.Application => {
  // Add verbose logging
  const {
    package: {
      manager = undefined,
      helper = manager,
    } = {},
  } = config

  app.State.Config.State = {
    package: {
      manager: process.env?.CIZN_PACKAGE_MANAGER || manager,
      helper: process.env?.CIZN_PACKAGE_HELPER || helper,
    },
  }

  return app
}

/**
 * Sets the default source path
 *
 * This may get overwritten at a later point if `--source` is set by the user.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application}
 */
const setDefaultSourcePath = (app: Cizn.Application) => (cwd: string): Cizn.Application => {
  app.State.Source.Current = `${cwd}/config.js`
  app.State.Source.Root = cwd

  return app
}

/**
 * Returns the default state directory
 *
 * @returns {string}
 */
const getDefaultStatePath = (): string => process.env?.XDG_STATE_HOME || `${process?.env.HOME}/.local/state`

/**
 * Sets the default generation directory (and creates the directory on
 * the file system if necessary), depending on `path`, in the application.
 *
 * @param {Cizn.Application} app the application
 * @returns {string}
 */
const setDefaultGenerationPath = (app: Cizn.Application) => (path: string) => {
  const FS = app.Manager.FS.Api

  return asyncPipe(
    Success(path),
    bind(path => `${path}/${G.APP_NAME}/generations`),
    map(FS.makeDirectory),
    bind((path) => {
      app.State.Generation.Root = path
      return path
    }),
  )}

/**
 * Sets the default derivation directory (and creates the directory on
 * the file system if necessary), depending on `path`, in the application.
 *
 * @param {Cizn.Application} app the application
 * @returns {string}
 */
const setDefaultDerivationPath = (app: Cizn.Application) => (path: string) => {
  const FS = app.Manager.FS.Api

  return asyncPipe(
    Success(path),
    bind(path => `${path}/${G.APP_NAME}/derivations`),
    map(FS.makeDirectory),
    bind((path) => {
      app.State.Derivation.Root = path
      return path
    }),
  )}

/**
 * Initializes the state of the main application.
 * This needs the {@link cliManager} to be initialized.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application}
 */
export const initApplicationState = (app: Cizn.Application) => {
  const FS = app.Manager.FS.Api
  const Log = log(app.Manager.Log.Api)

  return asyncPipe(
    Success(app),

    // Reading and setting config
    map(getConfigPath),
    tap(Log('info', 'Reading config file %d...')),
    map(getConfigValues(FS)),
    bind(setConfigValues(app)),

    // Setting the default path for the source file
    map(FS.getCwd),
    bind(setDefaultSourcePath(app)),

    // Setting necessary paths for the application
    bind(getDefaultStatePath),
    map(setDefaultGenerationPath(app)),
    map(setDefaultDerivationPath(app)),

    // Returning the hydrated app
    bind(() => app),
  )
}