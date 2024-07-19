import { curry } from "@lib/util"
import { sanitize, toCamelCase } from "@lib/util/string"
import { appendFileSync } from "node:fs"
import { Props } from "../internal"

const include = (App: Cizn.Application) => curry((
    source: Props['source'],
    name: Props['name'],
    target: Props['target'],
) => {
  const fnName = sanitize(toCamelCase(name))

  appendFileSync(source, `\
const {default: ${fnName} } = await import('${target}')
await ${fnName}?.(utils)\n`)
})

export default include