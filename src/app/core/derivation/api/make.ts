import G from '@cizn/global'
import { getFileName, mkTempFile } from '@lib/util/index.js'
import { locate } from 'func-loc'
import {
  copyFile, writeFile, appendFile,
} from 'node:fs/promises'

const make = (App: Cizn.Application) => async (
  module: Cizn.Application.State.Derivation.Module,
): Promise<Cizn.Application.State.Derivation | undefined> => {
  const {
    Derivation, Config: stateConfig, Environment: environment,
  } = App.State
  const {
    Config: derivationConfig,
    Packages: {
      Home: derivationHomePackages,
      System: derivationSystemPackages,
    },
  } = Derivation.State
  const { Log, File } = App.Adapter

  Log.Api.indent()

  try {
  /**
   * We need to get the name of the module, but we only have the function
   * expression at hand. Using {@link locate}, we can get the path of the
   * file the function was exported from and thus get the file name from
   * there. This means the file name declare the module name.
   */
    const fnPath = await locate(module)
    const fnName = getFileName(`${fnPath.path}`)

    if (!fnPath) {
      Log.Api.error({ message: 'Could not locate module' })
    }

    /**
     * Creating a temp file for the new derivation with the appropriate hash
     * Will be named {@code <module-name>-<hash>.drv}
     */
    const derivationTempFile = await mkTempFile({ name: fnName })

    // Writing JS code to the file so that we can execute it later on
    // Starting with the function header
    await writeFile(derivationTempFile, 'export default async (utils) => {\n')

    /**
     * Executing every utility function with the temp file we created above as the
     * first argument. Utility functions are curried, so we will return another
     * function from this. This means we can pass these functions to the module
     * function and if the user calls e.g. {@link withFile}, it will have the
     * first param (temp file) applied already.
    */
    const publicFileApi = Object.entries(File.Public).reduce((acc, [key, fn]) => {
      acc[key] = fn?.(derivationTempFile)
      return acc
    }, <{[key: string]: Function}>{})

    /**
     * The same for the internal utilities that cizn will use when creating
     * the generation later on.
     */
    const internalFileApi = Object.entries(File.Internal).reduce((acc, [key, fn]) => {
      acc[key] = fn?.(derivationTempFile)
      return acc
    }, <{[key: string]: Function}>{})

    Log.Api.info({ message: 'Reading module %d ...', options: [fnPath.path] })

    /**
     * Executing the module's main function. Passing it the {@link publicFileApi} as
     * {@code utils}. As said above, calls to utility functions will result in code
     * being written into the {@link derivationTempFile}.
    */

    const publicUtils = { file: publicFileApi }
    const {
      modules: subModules = [],
      config: moduleConfig = {},
      homePackages: moduleHomePackages = [],
      systemPackages: moduleSystemPackages = [],
      args = {},
    } = module(derivationConfig || {}, <Cizn.Utils.Public>publicUtils)

    const configName = getFileName(`${stateConfig.Current}`)

    // In case a already present value in config gets overwritten by the
    // current module, we need to inform the user about it
    Object.keys(moduleConfig).forEach((x) => {
      if (derivationConfig[x]) {
        Log.Api.warn({ message: 'Config option %d is overwritten by %d module', options: [x, fnName] })
      }
    })

    // Adding the {@code config} and {@code packages} the module exposes
    // to the state of the derivation so that we can use them later on
    Derivation.State.Config = {
      ...derivationConfig || {},
      ...configName !== fnName && { [fnName]: true },
      ...moduleConfig,
    }

    Derivation.State.Packages.Home = [ ...derivationHomePackages || [], ...moduleHomePackages ]
    Derivation.State.Packages.System = [ ...derivationSystemPackages || [], ...moduleSystemPackages ]

    const globalConfig = Derivation.State.Config

    /**
   * Calling the {@link get} method will EITHER return a {@link path},
   * which we can reuse, OR, if no such derivation can be found, a
   * {@link hash} that should be used for the derivation we want to create.
   */
    const { path, hash } = await Derivation.Api.get({
      hashParts: {
        module, args, config: globalConfig,
      }, name: fnName,
    })

    // This is a leaf module that we've already built
    if (path && subModules.length === 0) {
      Log.Api.info({ message: 'Reusing derivation %d ...', options: [path] })
      Log.Api.unindent()

      return { name: fnName, path }
    }

    const subDerivations = []
    /**
     * In case the module has sub modules defined (like in the case of the root
     * module), we can iterate through them here and recursively call the
     * derivation adapters {@link link} method. It will return the derivation
     * of that specific module that we can then add to this module
     */
    for (let i = 0; i < subModules.length; i++) {
      const subDerivation = await Derivation.Api.make(subModules[i])

      /**
       * Using the {@link internalFileApi.include} method to include the sub derivation
       * into the main derivation. This will add an {@link import} statement to the
       * file that can later be used to execute all sub modules when creating the
       * generation.
       */
      internalFileApi?.include(subDerivation.name, `${Derivation.Root}/${subDerivation.path}`)

      subDerivations.push(subDerivation)
    }

    // Ending the file with a closing bracket. We're done writing to that file
    await appendFile(derivationTempFile, '\n}')

    /**
     * Creating a concatenated string of all sub modules plus the hash of this
     * module. We use this to create a new hash from it. This hash will change,
     * whenever anything in the current subtree has changed. That way we know
     * if we need to rebuild the derivation
     */
    const accumulatedSubModules = subDerivations.length
      ? subDerivations.reduce((acc, key) => `${acc}${key.path}`, hash)
      : null

    /**
     * Now we'll ask the adapter again if such a derivation exists. If it does,
     * it means we've build this exact subtree once before and can reuse it
     */
    const {
      path: accumulatedDerivation = null,
      hash: accumulatedHash,
    } = !accumulatedSubModules
      ? { hash }
      : await Derivation.Api.get({ hashParts: { module: accumulatedSubModules || module }, name: fnName })

    if (accumulatedDerivation) {
      Log.Api.unindent()
      return { name: fnName, path: accumulatedDerivation }
    }

    /**
     * If it doesn't, the adapter gives us the {@link accumulatedHash} we need to use
     * for this subtree. We just need to copy the file over with the correctn name
     * and we're done.
     */
    const derivationFileName = `${fnName}${environment ? `-${environment}` : ''}-${accumulatedHash}.${G.EXT}`
    const derivationFilePath = `${Derivation.Root}/${derivationFileName}`
    await copyFile(derivationTempFile, derivationFilePath)

    Log.Api.success({ message: 'Created derivation for %d', options: [fnName] })
    Log.Api.unindent()
    return { name: fnName, path: `${derivationFileName}` }
  } catch (e) {
    console.error(e)
  }
}

export default make