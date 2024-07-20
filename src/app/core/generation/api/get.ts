import { isStr } from '@lib/util'
import { readdir } from 'node:fs/promises'

const get = (App: Cizn.Application) => async (
  { hash: derivationHash }: {hash: Cizn.Application.State.Derivation['hash']},
): Promise<Cizn.Application.State.Generation> => {
  const { Generation, Environment: environment } = App.State

  const generations = await readdir(Generation.Root)

  const existingGeneration = derivationHash
    ? generations.find(
      file => isStr(environment)
        ? file.includes(`${environment}-${derivationHash}`)
        : file.includes(derivationHash),
    )
    : ''

  const latestGeneration = generations
    .filter(generation => generation.includes(environment || ''))
    .reduce((acc, key) => {
      const generationNumber = Number.parseInt(key.split('-')[0], 10)
      return generationNumber > acc ? generationNumber : acc
    }, 0)

  const generationNumber = existingGeneration
    ? Number.parseInt(existingGeneration.split('-')[0], 10)
    : latestGeneration + 1

  return existingGeneration
    ? { number: generationNumber, path: existingGeneration }
    : { number: generationNumber, hash: derivationHash }
}

export default get