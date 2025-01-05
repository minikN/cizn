import { curry } from "@lib/util/index.ts"
import { Props, fileType } from "@cizn/adapter/file/api/public.ts"
import { appendFileSync } from "node:fs"

const write = (App: Cizn.Application, type: fileType = 'plain') => curry((
  source: Props['source'],
  target: Props['target'],
  content: Props['content'],
) => {
  const environment = App.State.Environment
  const fileContent = type === 'plain' && `\`${content}\``
    || type === 'ini' && JSON.stringify(content)
    || type == 'json' && JSON.stringify(content)
    || type == 'yaml' && JSON.stringify(content)
    || type == 'toml' && JSON.stringify(content)
    || type == 'xml' && JSON.stringify(content)

  const isHomeFile = target.substring(0, 1) !== '/'
  const shouldEmitHomeFile = isHomeFile && environment === 'home' || environment === undefined
  const shouldEmitSystemFile = !isHomeFile && environment === 'system' || environment === undefined

  if (shouldEmitHomeFile || shouldEmitSystemFile) {
    appendFileSync(source, `\
utils.file.write('${target}', ${fileContent}, '${type}')\n`)
  }

})

export default write