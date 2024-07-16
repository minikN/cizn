import G from '@cizn/global'

const init = (app: Cizn.Application) => () => {
  const { [G.CLI]: adapter } = app[G.ADAPTER]
  const { _name, _version, [G.API]: api, [G.PROGRAM]: program } = adapter

  program.version(_version)
  program.description(_name)

  program.command('build')
    .description('Build a given configuration')
    .option('-s, --source <string>', 'path to the source file', './config.js')
    .action(api.build)
}

export default init