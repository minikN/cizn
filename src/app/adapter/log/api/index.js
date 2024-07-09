import init from "@cizn/adapter/log/api/init.js"
import info from "@cizn/adapter/log/api/info.js"
import error from "@cizn/adapter/log/api/error.js"
import warn from "@cizn/adapter/log/api/warn.js"
import indent from "@cizn/adapter/log/api/indent.js"
import print from "@cizn/adapter/log/api/print.js"
import success from "@cizn/adapter/log/api/success.js"

const cliApi = app => Object.create({}, {
  init: {
    value: init(app),
    iterable: true,
    enumerable: true,
  },
  info: {
    value: info(app),
    iterable: true,
    enumerable: true,
  },
  success: {
    value: success(app),
    iterable: true,
    enumerable: true,
  },
  error: {
    value: error(app),
    iterable: true,
    enumerable: true,
  },
  warn: {
    value: warn(app),
    iterable: true,
    enumerable: true,
  },
  indent: {
    value: indent(app, false),
    iterable: true,
    enumerable: true,
  },
  unindent: {
    value: indent(app, true),
    iterable: true,
    enumerable: true,
  },
  print: {
    value: print(app),
    iterable: true,
    enumerable: true,
  },
})

export default cliApi
