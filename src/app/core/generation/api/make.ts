import G from '@lib/static.js'
import { mkdir, writeFile } from 'node:fs/promises'
import { internalUtils } from '@cizn/utils/index.js'

const { CURRENT, ROOT, STATE, GENERATION, DERIVATION, API, LOG, ADAPTER } = G

const make = app => async ({ derivation, hash: derivationHash, name }) => {
  const {
    [DERIVATION]: derivationAdapter,
    [GENERATION]: generationAdapter,
  } = app[STATE]
  const { [LOG]: logAdapter } = app[ADAPTER]

  try {
    const { number: generationNumber, generation, hash } = await generationAdapter[API].get({ hash: derivationHash })

    if (generation) {
      // Reuse generation
      logAdapter[API].info({ message: 'Reusing generation %d ...', options: [generationNumber] })
      generationAdapter[CURRENT] = `${generationAdapter[ROOT]}/${generation}`
      generationAdapter[API].set()
      return
    }

    logAdapter[API].info({ message: 'Moving from generation %d to %d ...', options: [generationNumber - 1, generationNumber] })

    const newGeneration = `${generationNumber}-${hash}`
    const newGenerationPath = `${generationAdapter[ROOT]}/${newGeneration}`

    // Creating folder for new generation
    await mkdir(`${newGenerationPath}/packages`, { recursive: true })
    await mkdir(`${newGenerationPath}/files`, { recursive: true })
    generationAdapter[CURRENT] = newGenerationPath

    /**
     * Creating the utility functions for the derivation to execute
     */
    const configUtils = Object.keys(internalUtils).reduce((acc, key) => {
      acc[key] = internalUtils[key](`${newGenerationPath}/files`)
      return acc
    }, {})

    const { default: fn } = await import(`${derivationAdapter[ROOT]}/${derivation}`)
    await fn?.(configUtils)

    generationAdapter[API].set()

  } catch (e) {
    console.error(e)
  }
}

export default make