import init from "@lib/managers/cli/api/init.ts"
import build from "@lib/managers/cli/api/build.ts"
import apply from "@lib/managers/cli/api/apply.ts"
import { Result } from "@lib/composition/result.ts"
import { Derivation, Environment } from '@cizn/core/state.ts'

export type CliCommandProps = {
  source?: string
  generation: string,
  derivation: Derivation,
  environment?: Cizn.Application.State.Environment
}

export type Api = {
  build: (environment: Environment, options: CliCommandProps) => Promise<void>
  apply: (environment: Environment, options: CliCommandProps) => Promise<void>
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
