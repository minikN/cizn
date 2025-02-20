import { bind } from '@lib/composition/function.ts'
import { pipe } from '@lib/composition/pipe.ts'
import { Result, Success } from '@lib/composition/result.ts'
import { Command } from 'npm:commander'

/**
 * Sets a global option.
 *
 * @param {string} flags    fflags for the option
 * @param {string} desc     description of the option
 * @param {*} defaultValue  default value for the option
 */
const setOption = (flags: string, desc: string, defaultValue: any) => (app: Cizn.Application): Cizn.Application => {
  const { Manager: { Cli } } = app
  Cli.Global.option(flags, desc, defaultValue)
  Cli.Program.option(flags, desc, defaultValue)

  return app
}

/**
 * Sets a command description.
 *
 * @param {string} desc description of the command
 */
const setDescription = (desc: string) => (cmd: Command): Command => cmd.description(desc)

/**
 * Sets a command argument.
 *
 * @param {string} flag flag for the argument
 * @param {string} desc description of the argument
 */
const setArgument = (flag: string, desc: string) => (cmd: Command): Command => cmd.argument(flag, desc)

/**
 * Sets a comman action
 * @param {Function} handler handler for the action
 */
const setAction = <T extends (...args: any) => Promise<void> | void>(handler: T) => (cmd: Command): Command =>
  cmd.action(handler)

/**
 * Sets a command option.
 *
 * @param {string} flags    fflags for the option
 * @param {string} desc     description of the option
 * @param {*} defaultValue  default value for the option
 */
const setCommandOption = (flags: string, desc: string, defaultValue: any) => (cmd: Command): Command =>
  cmd.option(flags, desc, defaultValue)

/**
 * Initializes a command.
 *
 * @param {Function} fn the callback initializing the command
 */
const setSettings = (fn: (a: Cizn.Manager.Cli) => void) => (app: Cizn.Application): Cizn.Application => {
  const { Manager: { Cli } } = app
  fn(Cli)

  return app
}

/**
 * Sets global settings.
 */
const setGlobalSettings = setSettings((Cli) => {
  Cli.Global
    .allowUnknownOption()
    .helpOption(false)
})

/**
 * Sets program specific settings.
 */
const setProgramSettings = setSettings((Cli) => {
  Cli.Program.version(Cli._version)
  Cli.Program.description(Cli._name)
})

/**
 * Sets up the `build` command.
 *
 * @param {Cizn.Application} app the application
 */
const setBuildCommand = (app: Cizn.Application) =>
  pipe(
    Success(app.Manager.Cli.Program.command('build')),
    bind(setDescription('Build a given configuration')),
    bind(
      setArgument('[environment]', 'Environment to build. Can be "home" or "system". If ommitted, both will be built.'),
    ),
    bind(setCommandOption('-s, --source <string>', 'path to the source file', './config.js')),
    bind(setAction(app.Manager.Cli.Api.build)),
    () => app,
  )

/**
 * Sets up the `build` command.
 *
 * @param {Cizn.Application} app the application
 */
const setReconfigureCommand = (app: Cizn.Application) =>
  pipe(
    Success(app.Manager.Cli.Program.command('reconfigure')),
    bind(setDescription('Build and apply a given configuration')),
    bind(
      setArgument('[environment]', 'Environment to build. Can be "home" or "system". If ommitted, both will be built.'),
    ),
    bind(setCommandOption('-s, --source <string>', 'path to the source file', './config.js')),
    bind(setAction(app.Manager.Cli.Api.reconfigure)),
    () => app,
  )

/**
 * Sets up the `build` command.
 *
 * @param {Cizn.Application} app the application
 */
const setApplyCommand = (app: Cizn.Application) =>
  pipe(
    Success(app.Manager.Cli.Program.command('apply')),
    bind(setDescription('Applies a given configuration')),
    bind(
      setArgument(
        '[environment]',
        'Environment to be applied. Can be "home" or "system". If ommitted, both will be applied.',
      ),
    ),
    bind(setCommandOption('-g, --generation <number>', 'specific generation to apply', undefined)),
    bind(setAction(app.Manager.Cli.Api.apply)),
    () => app,
  )

/**
 * Initializes the CLI adapter.
 *
 * @param {Cizn.Application} app the application
 */
const init = (app: Cizn.Application) => (): Result<never, Cizn.Application> =>
  pipe(
    Success(app),
    bind(setGlobalSettings),
    bind(setProgramSettings),
    bind(setOption('-c, --config [path]', 'Path to the configuration file', undefined)),
    bind(setBuildCommand),
    bind(setApplyCommand),
    bind(setReconfigureCommand),
  )

export default init
