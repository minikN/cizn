import { curry } from "@lib/util"
import { Props } from "@cizn/adapter/file/api/internal"
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from 'path'
import serializers from '@lib/serializers'
import { readFile } from "node:fs/promises"
import { fileType } from "@cizn/adapter/file/api/public"

const write = (App: Cizn.Application) => curry(async (
    source: Props['source'],
    target: Props['target'],
    content: Props['content'],
    type: fileType = 'plain'
) => {
  const filePath = `${source}/${target}`
  const fileExists = existsSync(filePath)

  const existingContent = fileExists
    ? (await readFile(filePath)).toString()
    : null

  const combinedContent = type !== 'plain'
    ? await serializers[type](existingContent, <object>content) 
    : content

  if (fileExists) {
    const writeFn = type !== 'plain' ? writeFileSync : appendFileSync
    writeFn(filePath, <string>combinedContent)
  } else {
    const basePath = path.dirname(filePath)
    mkdirSync(basePath, { recursive: true })
    writeFileSync(filePath, <string>combinedContent)
  }
})

export default write