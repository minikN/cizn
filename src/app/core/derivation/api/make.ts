import { internalUtils, publicUtils } from '@cizn/utils/index.js'
import G from '@lib/static.js'
import { getFileName, mkTempFile } from '@lib/util/index.js'
import { locate } from 'func-loc'
import { copyFile, writeFile, appendFile } from 'node:fs/promises'

const { PACKAGES, CONFIG, STATE, API, DERIVATION, CURRENT, EXT, ADAPTER, LOG } = G

const make = app => async ({ module }) => {
  const { [DERIVATION]: derivationAdapter, [CONFIG]: stateConfig } = app[STATE]
  const { [CONFIG]: config, [PACKAGES]: packages } = derivationAdapter[G.STATE]
  const { [LOG]: logAdapter } = app[ADAPTER]

  logAdapter[API].indent()

  try {
  /**
   * We need to get the name of the module, but we only have the function
   * expression at hand. Using {@link locate}, we can get the path of the
   * file the function was exported from and thus get the file name from
   * there. This means the file name declare the module name.
   */
    const fnPath = await locate(module)
    const fnName = getFileName(`${fnPath.path}`) || null

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
    const moduleUtils = Object.keys(publicUtils).reduce((acc, key) => {
      acc[key] = publicUtils[key]?.(derivationTempFile)
      return acc
    }, {})

    /**
     * The same for the internal utilities that cizn will use when creating
     * the generation later on.
     */
    const configUtils = Object.keys(internalUtils).reduce((acc, key) => {
      acc[key] = internalUtils[key](derivationTempFile)
      return acc
    }, {})

    logAdapter[API].info({ message: 'Reading module %d ...', options: [fnPath.path] })

    /**
     * Executing the module's main function. Passing it the {@link moduleUtils} as
     * {@code utils}. As said above, calls to utility functions will result in code
     * being written into the {@link derivationTempFile}.
    */
    const {
      modules: subModules = [],
      config: moduleConfig = {},
      packages: modulePackages = [],
      args = {},
    } = module(config || {}, moduleUtils)

    const configName = getFileName(`${stateConfig[CURRENT]}`)

    // In case a already present value in config gets overwritten by the
    // current module, we need to inform the user about it
    Object.keys(moduleConfig).forEach((x) => {
      if (config[x]) {
        logAdapter[API].warn({ message: 'Config option %d is overwritten by %d module', options: [x, fnName] })
      }
    })

    // Adding the {@code config} and {@code packages} the module exposes
    // to the state of the derivation so that we can use them later on
    derivationAdapter[STATE][CONFIG] = {
      ...config || {},
      ...configName !== fnName && { [fnName]: true },
      ...moduleConfig,
    }
    derivationAdapter[STATE][PACKAGES] = [ ...packages || [], ...modulePackages ]

    const globalConfig = derivationAdapter[G.STATE][CONFIG]

    /**
   * Calling the {@link get} method will EITHER return a {@link derivation},
   * which we can reuse, OR, if no such derivation can be found, a
   * {@link hash} that should be used for the derivation we want to create.
   */
    const { derivation, hash } = await derivationAdapter[API].get({ hashParts: { module, args, config: globalConfig }, name: fnName })

    // This is a leaf module that we've already built
    if (derivation && subModules.length === 0) {
      logAdapter[API].info({ message: 'Reusing derivation %d ...', options: [derivation] })
      logAdapter[API].unindent()

      return { name: fnName, derivation }
    }

    const subDerivations = []
    /**
     * In case the module has sub modules defined (like in the case of the root
     * module), we can iterate through them here and recursively call the
     * derivation adapters {@link link} method. It will return the derivation
     * of that specific module that we can then add to this module
     */
    for (let i = 0; i < subModules.length; i++) {
      const subDerivation = await derivationAdapter[API].make({ module: subModules[i] })

      /**
       * Using the {@link configUtils.include} method to include the sub derivation
       * into the main derivation. This will add an {@link import} statement to the
       * file that can later be used to execute all sub modules when creating the
       * generation.
       */
      configUtils?.include(subDerivation.name, `${derivationAdapter[G.ROOT]}/${subDerivation.derivation}`)

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
      ? subDerivations.reduce((acc, key) => `${acc}${key.derivation}`, hash)
      : null

    /**
     * Now we'll ask the adapter again if such a derivation exists. If it does,
     * it means we've build this exact subtree once before and can reuse it
     */
    const {
      derivation: accumulatedDerivation = null,
      hash: accumulatedHash,
    } = !accumulatedSubModules
      ? { hash }
      : await derivationAdapter[API].get({ hashParts: { module: accumulatedSubModules || module }, name: fnName })

    if (accumulatedDerivation) {
      logAdapter[API].unindent()
      return { name: fnName, derivation: accumulatedDerivation }
    }

    /**
     * If it doesn't, the adapter gives us the {@link accumulatedHash} we need to use
     * for this subtree. We just need to copy the file over with the correctn name
     * and we're done.
     */
    const derivationFileName = `${fnName}-${accumulatedHash}.${EXT}`
    const derivationFilePath = `${derivationAdapter[G.ROOT]}/${derivationFileName}`
    await copyFile(derivationTempFile, derivationFilePath)

    logAdapter[API].success({ message: 'Created derivation for %d', options: [fnName] })
    logAdapter[API].unindent()
    return { name: fnName, derivation: `${derivationFileName}` }
  } catch (e) {
    console.error(e)
  }
}

export default make