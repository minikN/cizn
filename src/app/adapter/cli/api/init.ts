import { Command } from "@commander-js/extra-typings"

// /**
//  *
//  * @param flags
//  * @param name
//  * @param args
//  * @returns
//  */
// function getSingleOption (flags, name, args) {
//   const findOne = new Command
//   findOne
//     .allowUnknownOption()
//     .helpOption(false)
//     .option(flags)
//   findOne.parse(args)
//   return findOne.opts()[name]
// }

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

  // TODO: Save config option in state, then read the config file
  const globalOpts = Global.opts()

  Program
    .version(_version)
    .description(_name)
    .option('-c, --config [path]', 'Path to the configuration file', undefined)

  Program
    .command('build')
    .description('Build a given configuration')
    .argument('[environment]', 'Environment to build. Can be "home" or "system". If ommitted, both will be built.')
    .option('-s, --source <string>', 'path to the source file', './config.js')
    .action(Api.build)
}

export default init