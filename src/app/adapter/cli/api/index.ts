import init from "@cizn/adapter/cli/api/init.js"
import build from "@cizn/adapter/cli/api/build.js"

const cliApi = app => Object.create({}, {
  build: {
    value: build(app),
    iterable: true,
    enumerable: true,
  },
  init: {
    value: init(app),
    iterable: true,
    enumerable: true,
  },
})

export default cliApi
