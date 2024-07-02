import utils from '@cizn/utils/index.js'
import G from '@lib/static.js'
import { writeFile, appendFile, copyFile } from 'node:fs/promises'
import path from 'path'
import crypto from 'crypto'
import { mkTempFile } from '@lib/util/index.js'

const { ADAPTER, LOG, MODULES, PACKAGES, CONFIG, OPTIONS, STATE, API, DERIVATION } = G

const make = app => async ({ name, file, fn, args }) => {
  const { [DERIVATION]: derivation } = app[STATE]
  const { [OPTIONS]: options, [CONFIG]: config, [PACKAGES]: packages } = derivation[STATE]
  const { [LOG]: logAdapter } = app[ADAPTER]

  logAdapter[API].info({ message: 'Creating derivation ...' })
  logAdapter[API].indent()

  try {
    // Creating a has of the module's JS file
    const moduleHash = crypto
      .createHash('md5')
      .update(file.toString())
      .digest('hex')

    // Checking if a derivation with the same hash already exists
    const existingDerivation = await derivation[G.API].has({ hash: moduleHash, name })

    // If it does, use it instead and return early
    if (existingDerivation) {
      derivation[G.STATE][MODULES][name].file = `${derivation[G.ROOT]}/${existingDerivation}`
      return
    }

    // Creating a temp file for the new derivation with the appropriate hash
    // Will be named '<module-name>-<hash>.drv'
    const moduleTempFile = !existingDerivation
      ? await mkTempFile({ name, hash: moduleHash, ext: 'drv' })
      : null


    // Writing JS code to the file so that we can execute it later on
    // Starting with the function header
    await writeFile(moduleTempFile, 'export default (utils) => {\n')

    // Executing every utility function with the temp file we created above as a
    // first argument. Utility functions are curried, so we will return
    // another function from this. This means we can pass these functions
    // to the module function and if the user calls e.g. 'readFile', it will
    // have the first param (temp file) applied already
    const moduleUtils = Object.keys(utils).reduce((acc, key) => {
      acc[key] = utils[key]?.(moduleTempFile)
      return acc
    }, {})

    // Executing the module function and getting potential config and packages
    // from it
    const {
      config: moduleConfig = {},
      packages: modulePackages = [],
    } = fn?.(config || {}, options, moduleUtils, args) || {}

    // Writing the closing bracket to the temp file. At this point any utility
    // function that was executed inside the module function did also write
    // code into the temp file
    await appendFile(moduleTempFile, '\n}')

    // Copying the temp file to the derivation root. We're done
    const moduleTempFileName = path.basename(moduleTempFile)
    await copyFile(moduleTempFile, `${derivation[G.ROOT]}/${moduleTempFileName}`)

    // Adding the {@code config} and {@code packages} the module exposes
    // to the state of the derivation so that we can use them later on
    derivation[STATE][CONFIG] = { ...config || {}, [name]: moduleConfig }
    derivation[STATE][PACKAGES] = [ ...packages || [], ...modulePackages ]
  } catch (e) {
    logAdapter[API].error({ message: e.message })
  }
}

export default make