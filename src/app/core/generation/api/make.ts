import G from '@cizn/global'
import { mkdir, writeFile } from 'node:fs/promises'
import { internalUtils } from '@cizn/utils/index.js'

const make = (App: Cizn.Application) => async ({ path: derivationPath, hash: derivationHash, name }: Cizn.Application.State.Derivation) => {
  const {
    Derivation,
    Generation,
  } = App.State

  const {Log} = App.Adapter

  try {
    const { number: generationNumber, path, hash } = await Generation.Api.get({ hash: derivationHash || '' })

    if (path) {
      // Reuse generation
      Log.Api.info({ message: 'Reusing generation %d ...', options: [generationNumber] })
      Generation.Current = `${Generation.Root}/${path}`
      Generation.Api.set()
      return
    }

    Log.Api.info({ message: 'Moving from generation %d to %d ...', options: [generationNumber - 1, generationNumber] })

    const newGeneration = `${generationNumber}-${hash}`
    const newGenerationPath = `${Generation.Root}/${newGeneration}`

    // Creating folder for new generation
    await mkdir(`${newGenerationPath}/packages`, { recursive: true })
    await mkdir(`${newGenerationPath}/files`, { recursive: true })
    Generation.Current = newGenerationPath

    /**
     * Creating the utility functions for the derivation to execute
     */
    const configUtils = Object.keys(internalUtils).reduce<{[key: string]: Function}>((acc: {[key: string]: Function}, key: string) => {
      acc[key] = internalUtils[key](`${newGenerationPath}/files`)
      return acc
    }, {})

    const { default: fn }: {default: Function } = await import(`${Derivation.Root}/${derivationPath}`)
    await fn?.(configUtils)

    Generation.Api.set()

  } catch (e) {
    console.error(e)
  }
}

export default make