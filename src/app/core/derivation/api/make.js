import { publicUtils } from '@cizn/utils/index.js'
import G from '@lib/static.js'
import { writeFile, appendFile, copyFile } from 'node:fs/promises'
import path from 'path'
import crypto from 'crypto'
import { locate } from 'func-loc'
import { mkTempFile, getFileName } from '@lib/util/index.js'

const { ADAPTER, LOG, MODULES, PACKAGES, CONFIG, OPTIONS, STATE, API, DERIVATION } = G

const make = app => async ({ module }) => {
  const { [DERIVATION]: derivationAdapter } = app[STATE]
  const { [CONFIG]: config, [PACKAGES]: packages } = derivationAdapter[G.STATE]
  // const { [LOG]: logAdapter } = app[ADAPTER]

  // logAdapter[API].info({ message: 'Creating derivation ...' })
  // logAdapter[API].indent()
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
   * Calling the {@link get} method will EITHER return a {@link derivation},
   * which we can reuse, OR, if no such derivation can be found, a
   * {@link hash} that should be used for the derivation we want to create.
   */
    const { derivation, hash } = await derivationAdapter[API].get({ module, name: fnName })

    if (derivation) {
    // handle existing derivation
    // should return the derivation here
    } else {

      /**
     * Creating a temp file for the new derivation with the appropriate hash
     * Will be named {@code <module-name>-<hash>.drv}
     */
      const derivationTempFile = await mkTempFile({ name: fnName })

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
     * Executing the module's main function. Passing it the {@link moduleUtils} as
     * {@code utils}. As said above, calls to utility functions will result in code
     * being written into the {@link derivationTempFile}.
    */
      const {
        modules: subModules = [],
        config: moduleConfig = {},
        packages: modulePackages = [],
      } = module(config || {}, moduleUtils)

      /**
     * In case the module has sub modules defined (like in the case of the root
     * module), we can iterate through them here and recursively call the
     * derivation adapters {@link link} method. It will return the derivation
     * of that specific module that we can then add to this module
     */
      for (let i = 0; i < subModules.length; i++) {
      // this should return something
        await derivationAdapter[API].make({ module: subModules[i] })
      }

      // Copying the temp file to the derivation root. We're done
      const derivationFilePath = `${derivationAdapter[G.ROOT]}/${fnName}-${hash}.js`
      await copyFile(derivationTempFile, derivationFilePath)


      // Adding the {@code config} and {@code packages} the module exposes
      // to the state of the derivation so that we can use them later on
      derivationAdapter[STATE][CONFIG] = { ...config || {}, [fnName]: moduleConfig }
      derivationAdapter[STATE][PACKAGES] = [ ...packages || [], ...modulePackages ]

      console.log(fnName, hash)
    }
  } catch (e) {
    console.error(e)
  }
}

export default make