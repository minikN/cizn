const init = (App: Cizn.Application) => () => {
  const { Cli } = App.Adapter
  const {
    _name, _version, Api, Program,
  } = Cli

  Program.version(_version)
  Program.description(_name)

  Program.command('build')
    .description('Build a given configuration')
    .argument('[environment]', 'Environment to build. Can be "home" or "system". If ommitted, both will be built.')
    .option('-s, --source <string>', 'path to the source file', './config.js')
    .action(Api.build)
}

export default init