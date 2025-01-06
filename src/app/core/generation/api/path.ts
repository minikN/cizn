import { GenerationEnvironment } from "@cizn/core/generation/api/index.ts"
import { bind, map } from "@lib/composition/function.ts"
import { asyncPipe } from "@lib/composition/pipe.ts"
import { Success } from "@lib/composition/result.ts"
import { getGenerationNumber } from '@lib/util/string.ts'

/**
 * Returns the `Cizn.Application.State.Generation` type of an existing generation.
 * 
 * @param {Cizn.Application} app the application
 * @param {string} hash the hash of the generation 
 * @returns 
 */
const findHashedGeneration = (app: Cizn.Application, hash: string) => (generations: string[]) => {
 const foundGeneration = generations.find(g => g.includes(`${hash}-${<GenerationEnvironment>app.State.Environment}`))

 return !foundGeneration ? null : {
    number: getGenerationNumber(foundGeneration),
    exists: true,
    path: foundGeneration
 }
}

/**
 * Assembles the `Cizn.Application.State.Generation` type for a generation that is about
 * to be created.
 * 
 * @param {Cizn.Application} app the application
 * @param {string} hash the hash of the generation 
 * @returns 
 */
const assembleNewGeneration = (app: Cizn.Application, hash: string) => (generations: string[]) => {
  const latestGeneration = generations.filter(g => g.includes(<GenerationEnvironment>app.State.Environment))
      .filter(g => !g.includes('current')).pop()

  const generationNumber = latestGeneration ? getGenerationNumber(latestGeneration) + 1 : 1

  return {
    number: generationNumber,
    exists: false,
    path: `${generationNumber}-${hash}-${<GenerationEnvironment>app.State.Environment}`
  }
}

/**
 * Returns a `Cizn.Application.State.Generation` for the current hash, by either finding
 * an exising generation for that hash using {@link findHashedGeneration}, or by creating
 * a new Generation type using {@link assembleNewGeneration}.
 * 
 * @param {Cizn.Application} app the application
 * @param {string} hash the hash of the generation 
 * @returns 
 */
const getTargetGeneration = (app: Cizn.Application, hash: string) => (generations: string[]): Cizn.Application.State.Generation =>
  findHashedGeneration(app, hash)(generations) || assembleNewGeneration(app, hash)(generations)

/**
 * Will return an object containing the `path` of a generation as well as
 * a boolean denoting if the generation already exists and its number.
 *
 * @param {Cizn.Application} app the application
 * @returns
 */
const path = (app: Cizn.Application): Cizn.Application.State.Generation.Api['path'] => async ({ hash }) => asyncPipe(
    Success(app.State.Generation.Root),
    map(app.Manager.FS.Api.Directory.read),
    bind(getTargetGeneration(app, hash)),
  )

export default path