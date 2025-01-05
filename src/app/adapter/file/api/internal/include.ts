import { curry } from "@lib/util/index.ts"
import { sanitize, toCamelCase } from "@lib/util/string.ts"
import { appendFileSync } from "node:fs"
import { Props } from "@cizn/adapter/file/api/internal.ts"

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