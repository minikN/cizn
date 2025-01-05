import {
  Derivation, DerivationData, DerivationEnvironment,
  FileDerivation,
} from '@cizn/core/state.ts'
import { getFileName, isFn, isStr, mkTempFile } from '@lib/util/index.ts'
import { getHash, makeHash } from '@lib/util/string.ts'
import {
  copyFile,
  writeFile,
} from 'node:fs/promises'

/**
 * Creates or reuses a derivation based on provided `module` function, a
 * `builder` type and some input `data`.
 *
 * Does so by executing the provided `module`function and inspecting its return
 * values. If the `builder` is of type `generation` and the `module` function
 * returns `modules`, it will build derivations for each of the provided modules.
 * It will then add these derivations as inputs for the current one. After that,
 * it builds the actual derivation by calling a builder function based on the
 * `builder` attribute.
 *
 * NOTE: It does NOT take `Environment` into consideration. It will always build
 * one derivation for all proveded inputs. It's the generation's `make` method's
 * job to create a generation based on that derivation for the given environment.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application.State.Generation}
 */
const make = (App: Cizn.Application) => async (
  { args = {}, name, module }: Cizn.Application.State.Derivation.FileModule,
  builder: Derivation['builder'] = 'generation',
  data: DerivationData = {},
): Promise<Cizn.Application.State.Derivation | undefined> => {
  const { Derivation, Source: stateSource } = App.State
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

  const isModule = builder === 'module' || builder === 'generation'
  const isInvalid = isModule && (!module || !isFn(module) || !name || !isStr(name))

  try {
  /**
   * In case the module we're trying to build a derivation for is not valid, cancel out
   * here.
   */
    if (isInvalid) {
      Log.Api.error({ message: '%d module not correctly exported: Got: name: %d, module: %d', options: [
        name, name, module
      ]})
    }

    if (builder === 'module' || builder === 'generation') {
      Log.Api.info({ message: 'Evaluating module %d ...', options: [name] })
    }

    /**
     * A derivation can have inputs, which themselves are other derivations.
     * We need to create a (for now) empty list of input derivations for this
     * derivation.
     *
     * It will be filled in either of two ways:
     * - the `module` function that we'll call later returns `modules`, which
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
    } = await module?.(derivationConfig || {}, <Cizn.Utils.Public>{ file: boundFileApi }) || {}

    // Getting the name of the root module (entry file to the configuration)
    const configName = getFileName(`${stateSource.Current}`)

    // In case a already present value in config gets overwritten by the
    // current module, we need to inform the user about it
    Object.keys(moduleConfig).forEach((x) => {
      if (derivationConfig[x]) {
        Log.Api.warn({ message: 'Config option %d is overwritten by %d module', options: [x, name] })
      }
    })

    /**
     * Adding the config variables the current module exposes to the global config state,
     * overwriting previously set values.
     */
    Derivation.State.Config = {
      ...derivationConfig || {},
      ...configName !== name && { [name]: true },
      ...moduleConfig,
    }

    /**
     * The `module` function may have returned a list of `imports`. We need to iterate over
     * them and create a derivation for each. After each creation, we'll add them to the
     * `inputDerivations` for this derivation. After we write the derivation to a file, all
     * of its `inputs` will be populated there so that the builder afterward knows what to
     * do.
     *
     * NOTE: We only do this if we `builder === 'generation'`. In other words, if we're building
     * a derivation for the root module. This means a sub module, like `sway`, can't define
     * other sub modules itself. I see no reason to support this, but if the need arises,
     * we need to delete the `if` here, and also change the {@link builders} to recursively
     * collect all the files to symlink that we need.
     */
    if (builder === 'generation') {
      for (let i = 0; i < modules.length; i++) {
        const inputDerivation = await Derivation.Api.make(modules[i] as unknown as Cizn.Application.State.Derivation.FileModule, 'module')

        inputDerivations.push(inputDerivation)
      }
    }

    /**
     * Getting the target path for the current derivation based on the return value of
     * `module`. This will be a path in the store. If the derivation already exists, its
     * path will be returned.
     */
    const { path, exists } = await Derivation.Api.path({
      hashParts: {
        module, env: data, args, config: Derivation.State.Config, inputs: inputDerivations,
      }, name, builder,
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
      const derivationHash = getHash(path)
      const derivationResult = await Derivation.Api.get(derivationHash)
      //@ts-ignore
      const derivation = derivationResult?.value as Derivation
      // const fullDerivation = Derivation.Api.get({ hash: derivationHash })

      Log.Api.info({ message: 'Reusing derivation %d ...', options: [path] })
      Log.Api.unindent()

      /**
       * We have already build that derivation, but we need to add it to the list of built derivations
       * so that we can access its content from anywhere. We do that in the derivations file api for
       * writing files.
       */
      Derivation.State.Built.push(derivation)

      return derivation
    }

    Log.Api.info({ message: 'Creating derivation for %d ...', options: [name] })
    Log.Api.unindent()

    const derivationEnv: DerivationEnvironment = {
      name: data.name || name,
      path: data.path,
      content: data.content,
      out: '', // This will get set properly further down
    }

    /**
     * Getting all the relevant information about the derivation to create a unique hash.
     * Important: This hash is different from the hash contained in {@link path}.
     * The has created from `content` will denote the path to the output of the derivation
     * when we build it, while {@link path} denotes the path to the derivation itself.
     */
    const content = {
      name,
      path: derivationFilePath,
      inputs: inputDerivations,
      env: derivationEnv,
      hash: derivationHash,
      builder,
    }

    // Creating the aforementiond output hash
    const outputHash = makeHash(content)

    // Adding the output path to the derivation
    content.env.out = `${Derivation.Root}/${outputHash}-${name}`

    /**
     * At this point, {@link content}'s `inputs` will be a recursive list of all inputs
     * down to the most deeply nested one. We don't need to write that to the file since
     * we can always obtain this information by recursively reading the inputs if we ever
     * need to. So reduce the inputs down to only contain their `path` and `env.out`,
     * and not include any subsequent `inputs`.
     *
     * NOTE: We don't even need the information we're currently writing. `inputs` could
     * be a list of strings only containing the out paths of each input. But let's keep
     * it like this for now, this is how Nix does it, and it gives us the possibility to
     * overwrite the `env` for a specific input if we ever need to.
     */
    const derivationTempFileContent = {
      ...content,
      inputs: content.inputs.map(x => ({ path: x.path, env: { path: x.env.path, out: x.env.out } })),
    }

    /**
     * Creating a temp file for the new derivation with the appropriate hash
     * Will be named `<module-name>-<hash>.drv`
     */
    const derivationTempFile = await mkTempFile({ name })

    /**
     * Write the contents to {@link derivationTempFile} and copying it to its
     * final destination at {@link derivationFilePath}.
     */
    await writeFile(derivationTempFile, JSON.stringify(derivationTempFileContent))
    await copyFile(derivationTempFile, derivationFilePath)

    // TODO: Generalize this.
    builder === 'file' && await Derivation.Api.builders.file(<FileDerivation>content)
    builder === 'module' && await Derivation.Api.builders.module(<Derivation>content)
    builder === 'generation' && await Derivation.Api.builders.generation(<Derivation>content)

    /**
     * Pushing the derivation we just built into the list of built derivations. We can inspect
     * the list to find a derivation without having the hash of it. We do that in the
     * derivations file api for writing files.
     */
    Derivation.State.Built.push(<Derivation>content)

    /**
     * We need to return the {@link content} of the derivation so that the function calling
     * this function (either this function itself in case we create a sub derivation or
     * {@link Cizn.Manager.Cli.Api['build']} in case we build the 'root' derivation) can use
     * the output to process it further.
     */
    return <Derivation>content
  } catch (e) {
    console.error(e)
  }
}

export default make