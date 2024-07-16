import G from '@cizn/global'
import { readdir } from 'node:fs/promises'

const get = (app: Cizn.Application) => async (
  { hash: derivationHash }: {hash: Cizn.Application.State.Derivation['hash']}
): Promise<Cizn.Application.State.Generation> => {
  const { [G.GENERATION]: generation } = app[G.STATE]

  const generations = await readdir(generation[G.ROOT])

  const existingGeneration = derivationHash
    ? generations.find(file => file.includes(derivationHash))
    : ''

  const latestGeneration = generations.reduce((acc, key) => {
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