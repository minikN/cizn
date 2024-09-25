import init from "@lib/managers/cli/api/init.js"
import build from "@lib/managers/cli/api/build.js"
import { Result } from "@lib/composition/result"

export type BuildProps = {
  source: string
  environment: Cizn.Application.State.Environment
}

export type Api = {
  build: (options: BuildProps) => Promise<void>
  init: () => Promise<Result<never, Cizn.Application>>
}

const cliApi = (App: Cizn.Application): Cizn.Manager.Cli.Api => Object.create({}, {
  build: {
    value: build(App),
    enumerable: true,
  },
  init: {
    value: init(App),
    enumerable: true,
  },
})

export default cliApi
