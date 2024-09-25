import init from "@lib/managers/log/api/init.js"
import info from "@lib/managers/log/api/info.js"
import error from "@lib/managers/log/api/error.js"
import warn from "@lib/managers/log/api/warn.js"
import indent from "@lib/managers/log/api/indent.js"
import print from "@lib/managers/log/api/print.js"
import success from "@lib/managers/log/api/success.js"
import { Result } from "@lib/composition/result"

export type Props = {
  message: string,
  options?: (string | number | object)[],
}

export type Api = {
  init: () => Promise<Result<never, Cizn.Application>>
  error: ({ message, options }: Props) => void
  indent: () => void
  unindent: () => void
  info: ({ message, options }: Props) => void
  print: ({ message, options }: Props) => void
  success: ({ message, options }: Props) => void
  warn: ({ message, options }: Props) => void
}

const cliApi = (App: Cizn.Application): Cizn.Manager.Log.Api => Object.create({}, {
  init: {
    value: init(App),
    enumerable: true,
  },
  info: {
    value: info(App),
    enumerable: true,
  },
  success: {
    value: success(App),
    enumerable: true,
  },
  error: {
    value: error(App),
    enumerable: true,
  },
  warn: {
    value: warn(App),
    enumerable: true,
  },
  indent: {
    value: indent(App, false),
    enumerable: true,
  },
  unindent: {
    value: indent(App, true),
    enumerable: true,
  },
  print: {
    value: print(App),
    enumerable: true,
  },
})

export default cliApi
