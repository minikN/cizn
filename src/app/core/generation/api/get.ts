/* eslint-disable no-unused-vars */
import { getGenerationNumber } from '@lib/util/string'
import { readdir } from 'node:fs/promises'
import { GenerationEnvironment } from '.'

/**
 * Returns either the generation matching `generationNumber` or the latest generation.
 *
 * If both could not be found, it'll return `null`.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application.State.Generation}
 */
const get = (app: Cizn.Application): Cizn.Application.State.Generation.Api['get'] => async (generationNumber) => {
  const { Generation, Environment } = app.State

  const environment = <GenerationEnvironment>Environment
  const generations = await readdir(Generation.Root)

  const foundGenerations = generations
    .filter(g => g.includes(environment) && !g.includes('current'))
    .sort((a, b) => getGenerationNumber(b) - getGenerationNumber(a))

  const targetGeneration = !generationNumber
    ? foundGenerations[0]
    : foundGenerations.find(g => getGenerationNumber(g) === parseInt(generationNumber, 10))

  return targetGeneration
    ? {
      exists: true,
      path: targetGeneration,
      number: getGenerationNumber(targetGeneration),
    }
    : null
}

export default get