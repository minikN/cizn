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

const cliApi = (app: Cizn.Application): Cizn.Adapter.Log.Api => Object.create({}, {
  init: {
    value: init(app),
    enumerable: true,
  },
  info: {
    value: info(app),
    enumerable: true,
  },
  success: {
    value: success(app),
    enumerable: true,
  },
  error: {
    value: error(app),
    enumerable: true,
  },
  warn: {
    value: warn(app),
    enumerable: true,
  },
  indent: {
    value: indent(app, false),
    enumerable: true,
  },
  unindent: {
    value: indent(app, true),
    enumerable: true,
  },
  print: {
    value: print(app),
    enumerable: true,
  },
})

export default cliApi
