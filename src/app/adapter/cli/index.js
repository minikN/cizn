import { compose } from "@lib/util/index.js"
import { defineImmutableProp } from "@lib/composition/property.js"
import { APP_NAME, APP_VERSION } from "@cizn/index.js"


// import { curry, pipe } from "@lib/util/index.js"
// import { defineImmutableProp, defineProp } from "@lib/with/property.js"
// import { APP_NAME, APP_VERSION } from "@cizn/index.js"
import G from '@lib/static.js'
import { program } from "@commander-js/extra-typings"
import { defineNamespace, setNamespace } from "@lib/composition/namespace.js"
import cliApi from "@cizn/adapter/cli/api/index.js"
// import build from "@cizn/adapter/command/build.js"
// import { setNamespace, defineNamespace } from "@lib/with/namespace.js"
//
const { PROGRAM, COMMAND, API } = G
//
// // program
// //   .version("1.0.0")
// //   .description("cizn")
// //
// // program.command('build')
// //   .description('Build a given configuration')
// //   .option('-s, --source <string>', 'path to the source file', './config.js')
// //   .action((options, command) => {
// //     build({ config: options.source }, command)
// //   })
// const programComposition = pipe(
//   curry((args) => {
//     args.program.version(APP_VERSION)
//     defineImmutableProp('_version', APP_VERSION, args.cli)
//     return args
//   }),
//   curry((args) => {
//     args.program.description(APP_NAME)
//     defineImmutableProp('_name', APP_NAME, args.cli)
//     return args
//   }),
//   curry((args) => {
//     args
//       /** @type {import('@commander-js/extra-typings').Command} */
//       .program.command('build')
//       .option('-s, --source <string>', 'path to the source file', './config.js')
//       .action(args.cli[G.COMMAND].build)
//     return args
//   }),
// )
//
//
// const cli = pipe(
//   defineNamespace(COMMAND),
//   setNamespace(COMMAND, commandApi()),
//   (args) => {
//     defineImmutableProp(PROGRAM, programComposition({ program, cli: args }), args)
//     return args
//   },
// )
//
// export default cli


const cliAdapter = (app) => {
  const adapterComposition = compose(
    defineImmutableProp('_name', APP_NAME),
    defineImmutableProp('_version', APP_VERSION),
    defineImmutableProp(PROGRAM, program),
    defineNamespace(API),
    setNamespace(API, cliApi(app)),
  )({})

  return adapterComposition
}

export default cliAdapter