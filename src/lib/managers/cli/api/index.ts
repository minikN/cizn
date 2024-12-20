import init from "@lib/managers/cli/api/init"
import build from "@lib/managers/cli/api/build"
import apply from "@lib/managers/cli/api/apply"
import { Result } from "@lib/composition/result"

export type CliCommandProps = {
  source?: string
  generation: string,
  environment?: Cizn.Application.State.Environment
}

export type Api = {
  build: (options: CliCommandProps) => Promise<void>
  apply: (options: CliCommandProps) => Promise<void>
  reconfigure: (options: CliCommandProps) => Promise<void>
  init: () => Promise<Result<never, Cizn.Application>>
}

const cliApi = (App: Cizn.Application): Cizn.Manager.Cli.Api => Object.create({}, {
  build: {
    value: build(App),
    enumerable: true,
  },
  apply: {
    value: apply(App),
    enumerable: true,
  },
  init: {
    value: init(App),
    enumerable: true,
  },
})

export default cliApi
