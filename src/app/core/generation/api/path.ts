import { readdir } from 'node:fs/promises'
import { GenerationEnvironment } from "@cizn/core/generation/api/index.ts"

/**
 * Will return an object containing the `path` of a generation as well as
 * a boolean denoting if the generation already exists and its number.
 *
 * @param {Cizn.Application} app the application
 * @returns
 */
const path = (app: Cizn.Application): Cizn.Application.State.Generation.Api['path'] => async ({ hash }) => {
  const { Generation, Environment } = app.State

  const environment = <GenerationEnvironment>Environment
  const generations = await readdir(Generation.Root)

  const existingGeneration = generations.find(file => file.includes(`${hash}-${environment}`))

  const latestGeneration = generations
    .filter(generation => generation.includes(environment))
    .reduce((acc, key) => {
      const generationNumber = Number.parseInt(key.split('-')[0], 10)
      return generationNumber > acc ? generationNumber : acc
    }, 0)

  const generationNumber = existingGeneration
    ? Number.parseInt(existingGeneration.split('-')[0], 10)
    : latestGeneration + 1

  return {
    number: generationNumber,
    exists: !!existingGeneration,
    path: existingGeneration || `${generationNumber}-${hash}-${environment}`,
  }
}

export default path