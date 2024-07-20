/* eslint-disable no-unused-vars */
import {
  stat, writeFile, unlink,
} from 'node:fs/promises'
import path from 'path'

const set = (App: Cizn.Application) => async (): Promise<void> => {
  const { Generation } = App.State

  const currentGeneration = Generation.Current

  const currentGenerationFile = `${Generation.Root}/.current`

  try {
    (await stat(currentGenerationFile)).isFile()
    unlink(currentGenerationFile)
  } catch (e) {
    // file doesn't exist
  }

  // Writing name of current generation to file
  await writeFile(currentGenerationFile, path.basename(currentGeneration))
}

export default set