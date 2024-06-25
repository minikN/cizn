import utils from '@cizn/utils/index.js'
import G from '@lib/static.js'
import { readFile } from 'node:fs/promises'
import crypto from 'crypto'
import { locate } from 'func-loc'
import { $ } from 'execa'
const { ADAPTER, LOG, MODULES, OPTIONS, STATE, API, DERIVATION } = G

const make = app => async ({ config }) => {
  const { [MODULES]: modules, [OPTIONS]: options, [DERIVATION]: derivation } = app[STATE]
  const { [LOG]: logAdapter } = app[ADAPTER]

  await $`mkdir -p /tmp/cizn`
  const { stdout: tempFile } = $`mktemp /tmp/cizn/derivation.XXXXX`

  for (let i = 0; i < config.length; i++) {
    const { name, args = {}, options: moduleOptions, module } = config[i]

    const moduleFileLocation = await locate(module)
    const moduleFile = await readFile(`${moduleFileLocation.path}`)

    const moduleHash = crypto
      .createHash('md5')
      .update(moduleFile.toString())
      .digest('hex')

    if (!name) {
      logAdapter[API].error({ message: `A module has no defined name It needs to export a name property. Aborting.` })
    }

    if (modules[name]) {
      logAdapter[API].error({ message: `Module ${name} declared multiple times. Aborting.` })
    }

    modules[name] = { args, module, hash: moduleHash }
    Object.keys(moduleOptions).forEach((key) => {
      if (options[key]) {
        logAdapter[API].warn({ message: `Option ${key} was already declared. Overwriting.` })
      }
      options[key] = moduleOptions[key]
    })

  }

  Object.keys(modules).forEach((key) => {
    const { module: currentModule, args } = modules[key]

    const moduleUtils = Object.keys(utils).reduce((acc, key) => {
      acc[key] = utils[key]?.(tempFile)
      return acc
    }, {})

    const {
      config: moduleConfig = {},
      packages: modulePackages = [],
    } = currentModule?.(derivation[STATE]?.config || {}, options, moduleUtils, args) || {}

    derivation[STATE] = {
      config: { ...derivation[STATE]?.config || {}, [key]: moduleConfig },
      packages: [...derivation[STATE]?.packages || [], ...modulePackages],
    }
  })

}

export default make