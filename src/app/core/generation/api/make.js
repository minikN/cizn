import G from '@lib/static.js'
import { mkdir, writeFile } from 'node:fs/promises'

const { CURRENT, ROOT, STATE, GENERATION, DERIVATION, API } = G

const make = app => async ({ derivation, hash: derivationHash, name }) => {
  const {
    [DERIVATION]: derivationAdapter,
    [GENERATION]: generationAdapter,
  } = app[STATE]
  // const { [CONFIG]: config, [PACKAGES]: packages } = derivationAdapter[G.STATE]
  // const { [LOG]: logAdapter } = app[ADAPTER]

  // logAdapter[API].info({ message: 'Creating derivation ...' })
  // logAdapter[API].indent()
  try {
    const { number: generationNumber, generation, hash } = await generationAdapter[API].get({ hash: derivationHash })

    if (generation) {
      // do something
      return
    }
    // log creation of new generation
    const newGeneration = `${generationNumber}-${hash}`
    const newGenerationPath = `${generationAdapter[ROOT]}/${newGeneration}`

    // Creating folder for new generation
    await mkdir(newGenerationPath, { recursive: true })
    generationAdapter[CURRENT] = newGenerationPath

    const test = await import(`${derivationAdapter[ROOT]}/${derivation}`)
    const i = 1

  } catch (e) {
    console.error(e)
  }
}

export default make