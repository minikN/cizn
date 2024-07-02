import G from '@lib/static.js'

const { ADAPTER, LOG, OPTIONS, STATE, API, DERIVATION } = G

const init = app => async ({ config }) => {
  const { [DERIVATION]: derivation } = app[STATE]
  const { [LOG]: logAdapter } = app[ADAPTER]

  for (let i = 0; i < config.length; i++) {
    const { options: moduleOptions } = config[i]

    Object.keys(moduleOptions).forEach((key) => {
      if (derivation[STATE][OPTIONS]?.[key]) {
        logAdapter[API].warn({ message: `Option ${key} was already declared. Overwriting.` })
      }

      derivation[STATE][OPTIONS][key] = moduleOptions[key]
    })
  }

}

export default init