/* eslint-disable no-unused-vars */
import G from '@lib/static.js'
import { stat, writeFile, unlink } from 'node:fs/promises'
import path from 'path'

const { CURRENT, STATE, GENERATION, ROOT } = G

const set = app => async () => {
  const { [GENERATION]: generation } = app[STATE]

  const currentGeneration = generation[CURRENT]

  const currentGenerationFile = `${generation[ROOT]}/.current`

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