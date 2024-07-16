/* eslint-disable no-unused-vars */
import G from '@cizn/global'
import { stat, writeFile, unlink } from 'node:fs/promises'
import path from 'path'

const set = (app: Cizn.Application) => async (): Promise<void> => {
  const { [G.GENERATION]: generation } = app[G.STATE]

  const currentGeneration = generation[G.CURRENT]

  const currentGenerationFile = `${generation[G.ROOT]}/.current`

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