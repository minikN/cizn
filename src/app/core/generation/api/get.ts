import { readdir } from 'node:fs/promises'

const get = (App: Cizn.Application) => async (
  { hash: derivationHash }: {hash: Cizn.Application.State.Derivation['hash']},
): Promise<Cizn.Application.State.Generation> => {
  const { Generation } = App.State

  const generations = await readdir(Generation.Root)

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