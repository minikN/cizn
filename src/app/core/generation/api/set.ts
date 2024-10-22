/* eslint-disable no-unused-vars */
import {
  rename,
  stat,
  symlink,
  unlink,
} from 'node:fs/promises'
import { GenerationEnvironment } from '.'

const set = (App: Cizn.Application): Cizn.Application.State.Generation.Api['set'] => async (generation) => {
  const { Generation, Environment } = App.State

  const environment = <GenerationEnvironment>Environment
  Generation.Current[environment] = generation

  // Either `.current_home` or `.current_system`
  const currentGenerationFile = `${Generation.Root}/.current_${environment}`

  try {
    (await stat(currentGenerationFile)).isFile()
    unlink(currentGenerationFile)
  } catch (e) {
    // file doesn't exist
  }

  const generationPath = `${Generation.Root}/${generation.path}`
  const currentGenerationTempFile = `${currentGenerationFile}-temp`

  /**
   * NOTE: Using {@link symlink}, we can't override existing links, so we work around
   * it by first creating a temporary symlink at {@link tempPath} and then renaming it
   * to the final name/path.
   */
  await symlink(generationPath, currentGenerationTempFile, 'dir')
  await rename(currentGenerationTempFile, currentGenerationFile)
}

export default set