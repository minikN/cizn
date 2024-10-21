import { Derivation, FileDerivationEnvironment } from "@cizn/core/state"
import { isHomePath } from "@lib/util/string"
import { mkdir, symlink } from "node:fs/promises"
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
  const symlinkPath = await dirname(targetPath)

  await mkdir(symlinkPath, { recursive: true })
  await symlink(out, targetPath, 'file')
}

export default fileLinker