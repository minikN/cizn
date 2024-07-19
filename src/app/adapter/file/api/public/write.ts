import { curry } from "@lib/util"
import { Props } from "../public"
import { appendFileSync } from "node:fs"

const write = (App: Cizn.Application) => curry((
    source: Props['source'],
    target: Props['target'],
    content: Props['content']
) => {
  appendFileSync(source, `\
utils.file.write('${target}', \`\n${content}\`)\n`)
})

export default write