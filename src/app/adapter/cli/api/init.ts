const init = (App: Cizn.Application) => () => {
  const { Cli } = App.Adapter
  const {
    _name, _version, Api, Program,
  } = Cli

  Program.version(_version)
  Program.description(_name)

  Program.command('build')
    .description('Build a given configuration')
    .option('-e, --environment <env>', 'Environment to build, can be "home" or "system". If omitted, both will be built.', undefined)
    .option('-s, --source <string>', 'path to the source file', './config.js')
    .action(Api.build)
}

export default init