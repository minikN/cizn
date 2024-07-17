import init from "@cizn/adapter/log/api/init.js"
import info from "@cizn/adapter/log/api/info.js"
import error from "@cizn/adapter/log/api/error.js"
import warn from "@cizn/adapter/log/api/warn.js"
import indent from "@cizn/adapter/log/api/indent.js"
import print from "@cizn/adapter/log/api/print.js"
import success from "@cizn/adapter/log/api/success.js"

export type Props = {
  message: string,
  options?: (string | number | object)[],
}

export type Api = {
  init: () => void
  error: ({message, options}: Props) => void
  indent: () => void
  unindent: () => void
  info: ({message, options}: Props) => void
  print: ({message, options}: Props) => void
  success: ({message, options}: Props) => void
  warn: ({message, options}: Props) => void
}

const cliApi = (App: Cizn.Application): Cizn.Adapter.Log.Api => Object.create({}, {
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
