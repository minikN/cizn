import G from '@cizn/global'
import { mkdir, writeFile } from 'node:fs/promises'
import { internalUtils } from '@cizn/utils/index.js'

const make = (app: Cizn.Application) => async ({ path: derivationPath, hash: derivationHash, name }: Cizn.Application.State.Derivation) => {
  const {
    [G.DERIVATION]: derivationAdapter,
    [G.GENERATION]: generationAdapter,
  } = app[G.STATE]
  const { [G.LOG]: logAdapter } = app[G.ADAPTER]

  try {
    const { number: generationNumber, path, hash } = await generationAdapter[G.API].get({ hash: derivationHash || '' })

    if (path) {
      // Reuse generation
      logAdapter[G.API].info({ message: 'Reusing generation %d ...', options: [generationNumber] })
      generationAdapter[G.CURRENT] = `${generationAdapter[G.ROOT]}/${path}`
      generationAdapter[G.API].set()
      return
    }

    logAdapter[G.API].info({ message: 'Moving from generation %d to %d ...', options: [generationNumber - 1, generationNumber] })

    const newGeneration = `${generationNumber}-${hash}`
    const newGenerationPath = `${generationAdapter[G.ROOT]}/${newGeneration}`

    // Creating folder for new generation
    await mkdir(`${newGenerationPath}/packages`, { recursive: true })
    await mkdir(`${newGenerationPath}/files`, { recursive: true })
    generationAdapter[G.CURRENT] = newGenerationPath

    /**
     * Creating the utility functions for the derivation to execute
     */
    const configUtils = Object.keys(internalUtils).reduce<{[key: string]: Function}>((acc: {[key: string]: Function}, key: string) => {
      acc[key] = internalUtils[key](`${newGenerationPath}/files`)
      return acc
    }, {})

    const { default: fn }: {default: Function } = await import(`${derivationAdapter[G.ROOT]}/${derivationPath}`)
    await fn?.(configUtils)

    generationAdapter[G.API].set()

  } catch (e) {
    console.error(e)
  }
}

export default make