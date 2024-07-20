import { curry } from "@lib/util"
import { Props, fileType } from "../public"
import { appendFileSync } from "node:fs"

const write = (App: Cizn.Application, type: fileType = 'plain') => curry((
  source: Props['source'],
  target: Props['target'],
  content: Props['content'],
) => {
  const fileContent = type === 'plain' && `\`${content}\``
    || type === 'ini' && JSON.stringify(content)
    || type == 'json' && JSON.stringify(content)
    || type == 'yaml' && JSON.stringify(content)
    || type == 'toml' && JSON.stringify(content)
    || type == 'xml' && JSON.stringify(content)

  appendFileSync(source, `\
utils.file.write('${target}', ${fileContent}, '${type}')\n`)
})

export default write