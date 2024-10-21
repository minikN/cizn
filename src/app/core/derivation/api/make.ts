import { Derivation, DerivationEnvironment } from '@cizn/core/state'
import { getFileName, mkTempFile } from '@lib/util/index.js'
import { getHash, makeHash } from '@lib/util/string'
import { locate } from 'func-loc'
import {
  copyFile, readFile, writeFile,
} from 'node:fs/promises'


// New Approach
// What do we need for a derivation?
// - Set of required inputs to build the derivation
//   - name
//   - builder? (for each derivation type [derivation, package, service, ...]?)
//   - optional: args
// - Set of output files
// Thoughts:
// In case we have a derivation that produces a file, the inputs should
// be something like: [{name: 'foo', path: './config/foo', flags: 777, content: 'file content here'}]
//
// In case we have a derivation that produces a package, the inputs should be something like:
// [{ src: 'url.to/pkg', rev: 123, }]

// TODO:
//   - Make sure global config is used
//   - Show warning if config variable is changed by module
//   - Make sure args work
//   - Make sure derivations / sub-trees only get rebuild when they need to

const make = (App: Cizn.Application) => async (
  module: Cizn.Application.State.Derivation.Module,
  builder: Derivation['builder'] = 'generation',
  env = <DerivationEnvironment>{},
): Promise<Cizn.Application.State.Derivation | undefined> => {
  const {
    Derivation, Source: stateSource, Environment: environment,
  } = App.State
  const {
    Config: derivationConfig,
    Packages: {
      Home: derivationHomePackages,
      System: derivationSystemPackages,
    },
  } = Derivation.State
  const { File } = App.Adapter
  const { Log } = App.Manager

  Log.Api.indent()

  try {
  /**
   * We need to get the name of the module, but we only have the function
   * expression at hand. Using {@link locate}, we can get the path of the
   * file the function was exported from and thus get the file name from
   * there. This means the file name declare the module name.
   */
    const fnPath = await locate(module)

    if (!fnPath) {
      Log.Api.error({ message: 'Could not locate module' })
    }

    /**
     * If we are creating a derivation for a file, using `utils.file.write`
     * in a module, the `name` of this derivation is given as an environment
     * prop. So use it if it's defined, if not, we'll derive the name by
     * the path of the function that should produce this derivation.
     */
    const fnName = env.name || getFileName(`${fnPath.path}`)

    if (builder === 'module' || builder === 'generation') {
      Log.Api.info({ message: 'Evaluating module %d ...', options: [fnName] })
    }

    /**
     * Creating a temp file for the new derivation with the appropriate hash
     * Will be named `<module-name>-<hash>.drv`
     */
    const derivationTempFile = await mkTempFile({ name: fnName })

    /**
     * A derivation can have inputs, which themselves are other derivations.
     * We need to create a (for now) empty list of input derivations for this
     * derivation.
     *
     * It will be filled in either of two ways:
     * - the `module` function that we'll call later returns `imports`, which
     *   is a list of input derivations
     * - Inside the `module` function, we inline create a file/service/package.
     *   Those call will run functions (e.g. `Derivation.Api.file.write` for
     *   files) that themselves will create derivations. They are called with
     *   this list in their scope and will add the derivations they create to
     *   it.
     */
    const inputDerivations: Derivation[] = []

    /**
     * We need to 'bind' the list of `inputDerivations` each of the functions the
     * file api exports. `fn.(inputDerivations)` will return a function that accepts
     * the args the user calls them with in the module (e.g. `(path, content)`
     * for `Derivation.Api.file.write`). Also see {@link inputDerivations}.
     */
    const boundFileApi = Object.entries(Derivation.Api.file).reduce((acc, [key, fn]) => {
      acc[key] = fn?.(inputDerivations)
      return acc
    }, <{[key: string]: Function}>{})

    /**
     * Executing the module.
     */
    const {
      modules = [],
      config: moduleConfig = {},
      homePackages: moduleHomePackages = [],
      systemPackages: moduleSystemPackages = [],
      args = {},
    } = await module?.(derivationConfig || {}, <Cizn.Utils.Public>{ file: boundFileApi }) || {}

    // Getting the name of the root module (entry file to the configuration)
    const configName = getFileName(`${stateSource.Current}`)

    // In case a already present value in config gets overwritten by the
    // current module, we need to inform the user about it
    Object.keys(moduleConfig).forEach((x) => {
      if (derivationConfig[x]) {
        Log.Api.warn({ message: 'Config option %d is overwritten by %d module', options: [x, fnName] })
      }
    })

    /**
     * Adding the config variables the current module exposes to the global config state,
     * overwriting previously set values.
     */
    Derivation.State.Config = {
      ...derivationConfig || {},
      ...configName !== fnName && { [fnName]: true },
      ...moduleConfig,
    }

    /**
     * The `module` function may have returned a list of `imports`. We need to iterate over
     * them and create a derivation for each. After each creation, we'll add them to the
     * `inputDerivations` for this derivation. After we write the derivation to a file, all
     * of its `inputs` will be populated there so that the builder afterward knows what to
     * do.
     */
    for (let i = 0; i < modules.length; i++) {
      const {
        name, path, hash,
      } = await Derivation.Api.make(modules[i], 'module')

      inputDerivations.push({
        name, path, hash,
      })
    }

    /**
     * Getting the target path for the current derivation based on the return value of
     * `module`. This will be a path in the store. If the derivation already exists, its
     * path will be returned.
     */
    const { path, exists } = await Derivation.Api.get({
      hashParts: {
        module, env, args, config: Derivation.State.Config, inputs: inputDerivations,
      }, name: fnName, builder,
    })

    const derivationHash = getHash(path)

    /**
     * Getting the final, full path of the derivation. We need to do this here because we both
     * want to copy the {@link derivationTempFile} we created earlier to this location, and write
     * the full path to the derivation itself. This is important so that later, when we build it,
     * we know where to look.
     * NOTE: Do we actually need the full path in the drv itself?
     */
    const derivationFilePath = `${Derivation.Root}/${path}`

    if (exists) {
      const derivationFileContent = (await readFile(derivationFilePath)).toString()
      const derivationContent = JSON.parse(derivationFileContent)

      Log.Api.info({ message: 'Reusing derivation %d ...', options: [path] })
      Log.Api.unindent()

      return <Derivation>derivationContent
    }

    Log.Api.info({ message: 'Creating derivation for %d ...', options: [fnName] })
    Log.Api.unindent()

    /**
     * Getting all the relevant information about the derivation to create a unique hash.
     * Important: This hash is different from the hash contained in {@link path}.
     * The has created from `content` will denote the path to the output of the derivation
     * when we build it, while {@link path} denotes the path to the derivation itself.
     */
    const content = {
      name: fnName, path: derivationFilePath, inputs: inputDerivations, env, builder, hash: derivationHash,
    }

    // Creating the aforementiond output hash
    const outputHash = makeHash(content)

    // Adding the output path to the derivation
    content.env = { ...env, out: `${Derivation.Root}/${outputHash}-${fnName}` }

    /**
     * Finally writing the contents to {@link derivationTempFile} and copying it to its
     * final destination at {@link derivationFilePath}.
     */
    await writeFile(derivationTempFile, JSON.stringify(content))
    await copyFile(derivationTempFile, derivationFilePath)

    /**
     * We need to return the {@link content} of the derivation so that the function calling
     * this function (either this function itself in case we create a sub derivation or
     * {@link Cizn.Manager.Cli.Api['build']} in case we build the 'root' derivation) can use
     * the output to process it further.
     */
    return content
  } catch (e) {
    console.error(e)
  }
}

export default make