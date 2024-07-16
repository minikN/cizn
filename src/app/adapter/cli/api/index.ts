import init from "@cizn/adapter/cli/api/init.js"
import build from "@cizn/adapter/cli/api/build.js"

export type BuildProps = {
  source: string
}

export type Api = {
  build: (options: BuildProps) => Promise<void>
  init: (app: Cizn.Application) => Promise<void>
}

const cliApi = (app: Cizn.Application): Cizn.Adapter.Cli.Api => Object.create({}, {
  build: {
    value: build(app),
    enumerable: true,
  },
  init: {
    value: init(app),
    enumerable: true,
  },
})

export default cliApi
