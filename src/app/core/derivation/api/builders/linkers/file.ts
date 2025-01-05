import { Derivation, FileDerivationEnvironment } from "@cizn/core/state.ts"
import { isHomePath } from "@lib/util/string.ts"
import {
  mkdir, rename, symlink,
} from "node:fs/promises"
import { dirname } from "node:path"

/**
 * Symlinks all files from `sourceDervation` to `targetDerivation`.
 *
 * Will also create the `home-files` and `system-files` folders in
 * the `targetDerivation` if necessary.
 *
 * @param {Derivation} targetDerivation the target derivation
 * @param {Derivation} sourceDerivation the source derivation
 */
const fileLinker = async (targetDerivation: Derivation, sourceDerivation: Derivation) => {
  const { path, out } = sourceDerivation.env as FileDerivationEnvironment
  const isHomeFile = isHomePath(<string>path)

  isHomeFile
    ? await mkdir(`${targetDerivation.env.out}/home-files`, { recursive: true })
    : await mkdir(`${targetDerivation.env.out}/system-files`, { recursive: true })

  const targetPath = `${targetDerivation.env.out}/${isHomeFile ? 'home-files' : 'system-files'}/${path}`
  const tempPath = `${targetPath}-temp`
  const symlinkPath = await dirname(targetPath)

  await mkdir(symlinkPath, { recursive: true })

  /**
   * NOTE: Using {@link symlink}, we can't override existing links, so we work around
   * it by first creating a temporary symlink at {@link tempPath} and then renaming it
   * to the final name/path.
   */
  await symlink(out, tempPath, 'file')
  await rename(tempPath, targetPath)
}

export default fileLinker