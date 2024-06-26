import init from "@cizn/adapter/log/api/init.js"
import info from "@cizn/adapter/log/api/info.js"
import error from "@cizn/adapter/log/api/error.js"
import warn from "@cizn/adapter/log/api/warn.js"

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
})

export default cliApi
