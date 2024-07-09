import G from '@lib/static.js'
import crypto from 'crypto'
import { readdir } from 'node:fs/promises'

const { ADAPTER, LOG, MODULES, OPTIONS, STATE, API, GENERATION } = G

const get = app => async ({ hash: derivationHash }) => {
  const { [GENERATION]: generation } = app[STATE]
  const { [LOG]: logAdapter } = app[ADAPTER]

  const generations = await readdir(generation[G.ROOT])

  const existingGeneration = generations.find(file => file.includes(derivationHash))
  const generationNumber = existingGeneration
    ? existingGeneration.split('-')[0]
    : 1

  if (existingGeneration) {
    logAdapter[G.API].info({ message: `Existing generation found. Reusing it.` })

    return { number: generationNumber, generation: existingGeneration }
  }

  return { number: generationNumber, hash: derivationHash }
}

export default get