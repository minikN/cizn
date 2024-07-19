import { curry } from "@lib/util"
import { Props } from "../internal"
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from 'path'

const write = (App: Cizn.Application) => curry((
    source: Props['source'],
    target: Props['target'],
    content: Props['content']
) => {
  const filePath = `${source}/${target}`
  if (existsSync(filePath)) {
    appendFileSync(filePath, content)
  } else {
    const basePath = path.dirname(filePath)
    mkdirSync(basePath, { recursive: true })
    writeFileSync(filePath, content)
  }
})

export default write