/* eslint-disable no-unused-vars */
import { GenerationEnvironment } from '@cizn/core/generation/api'
import { bind, map } from '@lib/composition/function'
import { asyncPipe } from '@lib/composition/pipe'
import { Failure, Success } from '@lib/composition/result'
import { Error } from '@lib/errors'
import { getGenerationNumber } from '@lib/util/string'

/**
 * Returns all generation names that match `environment`.
 *
 * @param GenerationEnvironment environment the current environment
 */
const listEnvGenerations = (environment: GenerationEnvironment) => (generations: string[]) => generations
  .filter(g => g.includes(environment) && !g.includes('current'))

/**
 * Sorts all incoming generations by their number.
 *
 * @param {string[]} generations list of generations
 */
const sortGenerations = (generations: string[]) => generations
  .sort((a, b) => getGenerationNumber(b) - getGenerationNumber(a))

/**
 * Returns the generation matching `generationNumber` or the newest one if
 * `generationNumber` wasn't provided. If it was provided, but no generation was found,
 * it'll return a `GENERATION_NOT_FOUND` error.
 *
 * @param {[string]} generationNumber number of the generation to find
 */
const findGeneration = (generationNumber: string | undefined) => (generations: string[]) => {
  const foundGeneration = !generationNumber
    ? generations[0]
    : generations.find(g => getGenerationNumber(g) === parseInt(generationNumber, 10))

  return foundGeneration
    ? Success(foundGeneration)
    : Failure(!generationNumber
      ? Error("NO_GENERATIONS", { reasons: ['The <build> command hasn\'t been executed'] })
      : Error("GENERATION_NOT_FOUND", {
        reasons: ['A recent change in the source files hasn\'t been reflected by building the configuration using the <build> command'],
        options: [generationNumber],
      }))
}
/**
 * Returns a {@link Generation} from the given `generation` path.
 *
 * @param {string[]} generation the generation to wrap
 */
const wrapGeneration = (generation: string): Cizn.Application.State.Generation => ({
  exists: true,
  path: generation,
  number: getGenerationNumber(generation),
})

/**
 * Returns either the generation matching `generationNumber` or the latest generation.
 *
 * If both could not be found, it'll return `null`.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application.State.Generation}
 */
const get = (app: Cizn.Application): Cizn.Application.State.Generation.Api['get'] => generationNumber => asyncPipe(
  Success(app.State.Generation.Root),
  map(app.Manager.FS.Api.Directory.read),
  bind(listEnvGenerations(<GenerationEnvironment>app.State.Environment)),
  bind(sortGenerations),
  map(findGeneration(generationNumber)),
  bind(wrapGeneration),
)

export default get