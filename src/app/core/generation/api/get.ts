import G from '@lib/static.js'
import { readdir } from 'node:fs/promises'

const { ADAPTER, LOG, STATE, GENERATION } = G

const get = app => async ({ hash: derivationHash }) => {
  const { [GENERATION]: generation } = app[STATE]

  const generations = await readdir(generation[G.ROOT])

  const existingGeneration = generations.find(file => file.includes(derivationHash))
  const latestGeneration = generations.reduce((acc, key) => {
    const generationNumber = key.split('-')[0]
    return generationNumber > acc ? Number.parseInt(generationNumber, 10) : acc
  }, 0)

  const generationNumber = existingGeneration
    ? Number.parseInt(existingGeneration.split('-')[0], 10)
    : latestGeneration + 1

  return existingGeneration
    ? { number: generationNumber, generation: existingGeneration }
    : { number: generationNumber, hash: derivationHash }
}

export default get