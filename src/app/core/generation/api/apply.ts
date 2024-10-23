/* eslint-disable no-unused-vars */

import {
  mkdir, readdir, readlink, stat,
  symlink,
  unlink,
} from "node:fs/promises"
import path, { dirname } from "node:path"

const getPathAndFile = (path: string) => {
  const i = path.lastIndexOf('/')
  return [
    path.slice(0, i),
    path.slice(i + 1),
  ]
}

// make this part of FS manager, pred should come from app
const isOwnLink = async (path: string, pred: string) => {
  try {
    if ((await stat(path)).isFile()) {
      return (await readlink(path)).includes(pred)
    }
  } catch (e) {}
}

const exists = async (path: string) => {
  try {
    await stat(path)
    return true
  } catch (e) {
    return false
  }
}

const getAllFiles = async (relative: boolean = true, dirPath: string, list: string[] = [], level: number = 0) => {
  const files = await readdir(dirPath)
  let fileList = list

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if ((await stat(dirPath + "/" + file)).isDirectory()) {
      fileList = await getAllFiles(true, dirPath + "/" + file, fileList, level + 1)
    } else {
      fileList.push(path.join(dirPath, "/", file))
    }
  }

  return level === 0 && relative
    ? fileList.map(file => file.replace(`${dirPath}/`, ''))
    : fileList
}

const apply = (App: Cizn.Application): Cizn.Application.State.Generation.Api['set'] => async () => {
  const { Generation, Environment } = App.State
  const log = App.Manager.Log.Api

  try {
    const filePath = `${Generation.Root}/.current_${Environment}/${Environment}-files`
    // can throw ELOOP error: "ELOOP: too many symbolic links encountered, scandir '/home/db/.local/state/cizn/generations/.current_home/home-files'"
    const generationFiles = await getAllFiles(false, filePath)
    const relativeFiles = generationFiles.map(file => file.replace(`${filePath}/`, ''))

    for (let i = 0; i < relativeFiles.length; i++) {
      const targetFile = `${Environment === 'home' ? process.env.HOME : ''}/${relativeFiles[i]}`
      const sourceFile = generationFiles[i]
      const targetFolder = await dirname(targetFile)

      await mkdir(targetFolder, { recursive: true })
      if (await exists(targetFile)) {
        if (await isOwnLink(targetFile, Generation.Root)) {
          await unlink(targetFile)
        } else {
          log.error({ message: `Unknown file exists: %d. Please delete or move`, options: [targetFile] })
        }
      }

      await symlink(sourceFile, targetFile)
    }
  } catch (e) {
    console.log(e)
  }

}

export default apply