import G from '@lib/static.js'

const { CLI, ADAPTER, API, PROGRAM } = G

const init = app => () => {
  const { [CLI]: adapter } = app[ADAPTER]
  const { _name, _version, [API]: api, [PROGRAM]: program } = adapter

  program.version(_version)
  program.description(_name)

  program.command('build')
    .description('Build a given configuration')
    .option('-s, --source <string>', 'path to the source file', './config.js')
    .action(api.build)
}

export default init