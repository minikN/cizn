import {
  mkdir, readdir, rename, symlink,
} from "fs/promises"
import { GenerationEnvironment } from "."

/**
 * Creates or reuses a generation based on `derivation`
 * and `Environment`.
 *
 * Does so by tasking {@link Generation.Api.path} if there is an existing
 * generation for the given generation. If so, it returns it. If not, it
 * will create a generation by symlinking the environment specific folders
 * from the derivation to a new generation folder.
 *
 * @param {Cizn.Application} app the application
 * @returns {Cizn.Application.State.Generation}
 */
const make = (app: Cizn.Application): Cizn.Application.State.Generation.Api['make'] => async (derivation) => {
  const {
    Derivation,
    Generation,
    Environment,
  } = app.State

  const { Log } = app.Manager
  const environment = <GenerationEnvironment>Environment

  try {
    const {
      number: generationNumber, path, exists,
    } = await Generation.Api.path({ hash: derivation.hash })

    if (exists) {
      Log.Api.info({ message: 'Reusing %d generation %d ...', options: [environment, generationNumber] })
    } else {
      Log.Api.info({ message: 'Moving to %d generation %d ...', options: [environment, generationNumber] })

      const derivationPath = derivation.env.out
      const generationPath = `${Generation.Root}/${path}`

      await mkdir(generationPath, { recursive: true })
      const derivationFolders = await readdir(derivationPath)
      const targetFolders = derivationFolders.filter(folder => folder.includes(environment))

      for (let i = 0; i < targetFolders.length; i++) {
        const generationFolderPath = `${generationPath}/${targetFolders[i]}`
        const derivationFolderPath = `${derivationPath}/${targetFolders[i]}`
        const generationFolderTempPath = `${generationFolderPath}-temp`

        /**
         * NOTE: Using {@link symlink}, we can't override existing links, so we work around
         * it by first creating a temporary symlink at {@link tempPath} and then renaming it
         * to the final name/path.
         */
        await symlink(derivationFolderPath, generationFolderTempPath, 'dir')
        await rename(generationFolderTempPath, generationFolderPath)
      }
    }

    return {
      number: generationNumber, path, exists,
    }
  } catch (e) {
    console.error(e)
    // TODO: Fix with using pipes
    return {
      number: -1, path: '', exists: false,
    }
  }
}

export default make