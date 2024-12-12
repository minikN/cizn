/* eslint-disable no-unused-vars */
import { GenerationEnvironment } from '@cizn/core/generation/api'
import { bind, map } from '@lib/composition/function'
import { asyncPipe } from '@lib/composition/pipe'
import { Success } from '@lib/composition/result'
import { concat, stripRight } from '@lib/util/string'

/**
 * Sets the correct generation for the current environment and returns the path to the
 * symlink pointing to the current generation.

 * @param {Cizn.Application} app the application
 */
const setCurrentGeneration = (app: Cizn.Application) => (generation: Cizn.Application.State.Generation): string => {
  const { Generation, Environment } = app.State

  const environment = <GenerationEnvironment>Environment
  Generation.Current[environment] = generation

  // Either `.current_home` or `.current_system`
  return `${Generation.Root}/.current_${environment}`
}

/**
 * Sets the incoming `generation` as the current one by replacing the old symlink
 * (`.../.current.home` or `.../.current-system`) with a new one pointing to
 * `generation`.
 *
 * @param {Cizn.Application} app the application
 */
const set = (app: Cizn.Application): Cizn.Application.State.Generation.Api['set'] => async generation => asyncPipe(
  Success(generation),

  // Sets the generation for the current environment to the incoming one
  // and returns the path of the current generation for the given environment
  bind(setCurrentGeneration(app)),

  // Removes symlink to current generation
  map(app.Manager.FS.Api.Link.remove),

  // Adds '-temp' to the path for the current generation
  bind(concat('-temp')),

  // Write a symlink from the temp path created above to `generationSource`
  map(app.Manager.FS.Api.Link.write(`${app.State.Generation.Root}/${generation.path}`, 'dir')),

  // Renames the temp file to its final name, by removing the `'-temp` suffix
  // for the target again
  map((tempPath: string) => app.Manager.FS.Api.Path.rename(
    tempPath,
    stripRight('-temp')(tempPath),
  )),
)

export default set