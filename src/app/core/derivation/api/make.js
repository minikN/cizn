import G from '@lib/static.js'
import { $ } from 'execa'
const { ADAPTER, LOG, MODULES, OPTIONS, STATE, API } = G

const make = app => async ({ config }) => {
  const { [MODULES]: modules, [OPTIONS]: options } = app[STATE]
  const { [LOG]: logAdapter } = app[ADAPTER]

  await $`mkdir -p /tmp/cizn`
  const { stdout: tempFile } = $`mktemp /tmp/cizn/derivation.XXXXX`

  for (let i = 0; i < config.length; i++) {
    const { name, args, options: moduleOptions, module } = config[i]

    if (modules[name]) {
      logAdapter[API].error({ message: `Module ${name} declared multiple times. Aborting.` })
      // module exists already, log error
    }

    modules[name] = { args, module }
    Object.keys(moduleOptions).forEach((key) => {
      if (options[key]) {
        logAdapter[API].warn({ message: `Option ${key} was already declared. Overwriting.` })
      }
      options[key] = moduleOptions[key]
    })
  }
  const y = 1
}

export default make