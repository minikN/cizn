import {
  bind,
  map,
} from "@lib/composition/function"
import { asyncPipe } from "@lib/composition/pipe"
import { Result, Success } from "@lib/composition/result"
import process from 'node:process'

const noConfigPathError = `No valid path for the configuration file was given.
This could be because of one of two things:
- The --config parameter was not provided
- The XDG_CONFIG_HOME environment variable is not set`

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
  Success(app.State.Config.Current || `${process.env.XDG_CONFIG_HOME ?? '~/.config'}/cizn/config.json`)

/**
 * Parses the config file and returns its values.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application.State.Config['State']}
 */
const getConfigValues = (app: Cizn.Application) => (path: string) => asyncPipe(
  Success(path),
  map(app.Manager.FS.Api.getRealPath),
  map(app.Manager.FS.Api.isPathReadable),
  map(app.Manager.FS.Api.isFile),
  map(app.Manager.FS.Api.readFile),
  map(app.Manager.FS.Api.parseFileAsJSON),
)

/**
 * Sets the gathered config values
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application}
 */
const setConfigValues = (app: Cizn.Application) => (config: Cizn.Application.State.Config["State"]): Cizn.Application => {
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
const setDefaultGenerationPath = (app: Cizn.Application) => (path: string) => asyncPipe(
  Success(path),
  bind(path => `${path}/cizn/generations`),
  map(app.Manager.FS.Api.makeDirectory),
  bind((path) => {
    app.State.Generation.Root = path
    return path
  }),
)

/**
 * Sets the default derivation directory (and creates the directory on
 * the file system if necessary), depending on `path`, in the application.
 *
 * @param {Cizn.Application} app the application
 * @returns {string}
 */
const setDefaultDerivationPath = (app: Cizn.Application) => (path: string) => asyncPipe(
  Success(path),
  bind(path => `${path}/cizn/derivations`),
  map(app.Manager.FS.Api.makeDirectory),
  bind((path) => {
    app.State.Derivation.Root = path
    return path
  }),
)

/**
 * Initializes the state of the main application.
 * This needs the {@link cliManager} to be initialized.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application}
 */
export const initApplicationState = (app: Cizn.Application) => asyncPipe(
  Success(app),

  // Reading and setting config
  map(getConfigPath),
  map(getConfigValues(app)),
  bind(setConfigValues(app)),

  // Setting the default path for the source file
  map(app.Manager.FS.Api.getCwd),
  bind(setDefaultSourcePath(app)),

  // Setting necessary paths for the application
  bind(getDefaultStatePath),
  map(setDefaultGenerationPath(app)),
  map(setDefaultDerivationPath(app)),

  // Returning the hydrated app
  bind(() => app),
)