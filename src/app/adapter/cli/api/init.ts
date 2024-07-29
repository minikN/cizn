const init = (App: Cizn.Application) => () => {
  const { Cli } = App.Adapter
  const {
    _name, _version, Api, Program, Global,
  } = Cli

  Global
    .allowUnknownOption()
    .helpOption(false)
    .option('-c, --config [path]', 'Path to the configuration file', undefined)
    .parse(process.argv)

  const globalOpts = Global.opts()

  globalOpts.config && (App.State.Config.Current = <string>globalOpts.config)

  // Parses global options, that come before the command
  Program
    .version(_version)
    .description(_name)
    .option('-c, --config [path]', 'Path to the configuration file', undefined)

  // Parses command and command-specific options/arguments
  Program
    .command('build')
    .description('Build a given configuration')
    .argument('[environment]', 'Environment to build. Can be "home" or "system". If ommitted, both will be built.')
    .option('-s, --source <string>', 'path to the source file', './config.js')
    .action(Api.build)
}

export default init